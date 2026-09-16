const { onDocumentCreated, onDocumentDeleted, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { classifyProgrammeEdit, isFreshStudentEdit } = require('./programme-edit-utils');
const {
  buildSessionReviewAlerts, buildCheckInReviewAlert, buildFeedbackReviewAlert, buildAuditReviewAlert,
  buildDeloadReviewAlert, buildPhaseReviewDueAlert,
} = require('./review-alert-builder');

initializeApp();
const db = getFirestore();
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://david-coaching.vercel.app';

function phaseReviewDocumentId(phaseId, activationRevision = 1) {
  return `${String(phaseId || '').trim()}__r${Math.max(1, Number(activationRevision) || 1)}`;
}

function preview(value, max = 110) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

async function materializeReviewAlerts(alerts) {
  const valid = (alerts || []).filter((item) => item?.data?.coachUid && item?.id);
  await Promise.all(valid.map(async ({ id, data }) => {
    const ref = db.doc(`coaches/${data.coachUid}/reviewAlerts/${id}`);
    try {
      await ref.create({ ...data, createdAt: FieldValue.serverTimestamp(), lastDetectedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    } catch (error) {
      // Firestore code 6 / ALREADY_EXISTS is the expected result of an event retry.
      if (Number(error?.code) !== 6 && error?.code !== 'already-exists') throw error;
    }
  }));
}

exports.notifyCoachOfExerciseFeedback = onDocumentCreated({
  document: 'students/{studentId}/exerciseNotes/{noteId}',
  region: 'asia-southeast1',
}, async (event) => {
  const note = event.data?.data();
  if (!note || note.authorRole !== 'student' || note.visibility !== 'shared') return;
  const { studentId, noteId } = event.params;
  const studentSnap = await db.doc(`students/${studentId}`).get();
  if (!studentSnap.exists) return;
  const student = studentSnap.data();
  const coachUid = String(student.coachUid || '');
  if (!coachUid) return;

  const target = new URL('/coach.html', APP_BASE_URL);
  target.searchParams.set('student', studentId);
  target.searchParams.set('note', noteId);
  target.searchParams.set('session', String(note.sessionId || ''));
  target.searchParams.set('exercise', String(note.exerciseId || ''));
  const notificationRef = db.doc(`coaches/${coachUid}/notifications/${noteId}`);
  const reviewAlert = buildFeedbackReviewAlert({ studentId, student, noteId, note });
  await materializeReviewAlerts(reviewAlert ? [reviewAlert] : []);
  const created = await db.runTransaction(async (tx) => {
    const existing = await tx.get(notificationRef);
    if (existing.exists) return false;
    tx.create(notificationRef, {
      type: 'exercise-feedback', studentUid: studentId,
      studentName: String(student.displayName || note.authorName || 'Học viên'),
      noteId, sessionId: String(note.sessionId || ''), sessionLabel: String(note.sessionLabel || ''),
      exerciseId: String(note.exerciseId || ''), exerciseName: String(note.exerciseName || 'Bài tập'),
      preview: preview(note.body), link: target.href, readAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
  if (!created) return;

  const devices = await db.collection(`coaches/${coachUid}/notificationDevices`).where('enabled', '==', true).get();
  const records = devices.docs.map((doc) => ({ ref: doc.ref, token: doc.data().token })).filter((item) => item.token);
  if (!records.length) return;
  const response = await getMessaging().sendEachForMulticast({
    tokens: records.map((item) => item.token),
    data: {
      type: 'exercise-feedback', noteId, link: target.href,
      title: `${student.displayName || 'Học viên'} gửi feedback`,
      body: `${note.exerciseName || 'Bài tập'} · ${preview(note.body, 80)}`,
    },
    webpush: { fcmOptions: { link: target.href } },
  });
  const invalidCodes = new Set(['messaging/invalid-registration-token', 'messaging/registration-token-not-registered']);
  const cleanup = [];
  response.responses.forEach((item, index) => {
    if (!item.success && invalidCodes.has(item.error?.code)) cleanup.push(records[index].ref.delete());
  });
  await Promise.all(cleanup);
});

exports.cleanupCoachFeedbackOnStudentDelete = onDocumentDeleted({
  document: 'students/{studentId}',
  region: 'asia-southeast1',
}, async (event) => {
  const student = event.data?.data();
  const coachUid = String(student?.coachUid || '');
  async function deleteQuery(query) {
    while (true) {
      const snapshot = await query.limit(400).get();
      if (snapshot.empty) return;
      const batch = db.batch();
      snapshot.docs.forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
  }
  if (coachUid) {
    await deleteQuery(db.collection(`coaches/${coachUid}/notifications`).where('studentUid', '==', event.params.studentId));
    await deleteQuery(db.collection(`coaches/${coachUid}/reviewAlerts`).where('studentUid', '==', event.params.studentId));
  }
  const phaseReviews = await db.collection(`students/${event.params.studentId}/phaseReviews`).get();
  for (const review of phaseReviews.docs) {
    await deleteQuery(review.ref.collection('appendices'));
    await review.ref.delete();
  }
  for (const collectionName of ['coachingAlerts', 'coachingAlertEvents', 'progressionAudits', 'deloadDecisions']) {
    await deleteQuery(db.collection(`students/${event.params.studentId}/${collectionName}`));
  }
});

const PROGRAM_CHANGE_LIMIT = 12;

/**
 * Tell the coach when a student rewrites their own programme.
 *
 * Students can drop, swap or add an exercise during a session and choose "save
 * for future sessions". Nothing announced that. One client had quietly removed
 * nine exercises — an entire training day among them — and it only came to
 * light because the coach's screen looked cluttered. Only "đau" ever raised an
 * alert; "không đủ thời gian" and "không có thiết bị", by far the commonest
 * reasons, were silent.
 *
 * Clients cannot write into coaches/{uid}/notifications — the rules forbid it
 * outright — so this has to run with admin credentials, the same way exercise
 * feedback already does.
 *
 * One notification per session, not per exercise: a nine-exercise edit arriving
 * as nine separate alerts would be its own kind of useless. The session id is
 * the document id, so the writes that land together simply accumulate into one
 * entry, and the push goes out only with the first.
 */
exports.notifyCoachOfProgrammeEdit = onDocumentWritten({
  document: 'students/{studentId}/assignments/{assignmentId}',
  region: 'asia-southeast1',
}, async (event) => {
  const before = event.data?.before?.exists ? event.data.before.data() : null;
  const after = event.data?.after?.exists ? event.data.after.data() : null;
  if (!isFreshStudentEdit(before, after)) return;
  const edit = classifyProgrammeEdit(before, after);
  if (!edit) return;
  // Used as part of a document id below, and a slash there would make the path
  // invalid and throw. programChangeAddAssignmentId() guards the same way.
  const sessionId = String(after.sourceSessionId || '').trim().replaceAll('/', '_');
  if (!sessionId) return;

  const { studentId } = event.params;
  const studentSnap = await db.doc(`students/${studentId}`).get();
  if (!studentSnap.exists) return;
  const student = studentSnap.data();
  const coachUid = String(student.coachUid || '');
  if (!coachUid) return;

  const target = new URL('/coach.html', APP_BASE_URL);
  target.searchParams.set('student', studentId);
  const studentName = String(student.displayName || 'Học viên');
  const notificationRef = db.doc(`coaches/${coachUid}/notifications/programme-${sessionId}`);

  const created = await db.runTransaction(async (tx) => {
    const existing = await tx.get(notificationRef);
    const line = `${edit.verb} ${edit.exerciseName}`;
    if (existing.exists) {
      const changes = Array.isArray(existing.data().changes) ? existing.data().changes : [];
      if (changes.includes(line) || changes.length >= PROGRAM_CHANGE_LIMIT) return false;
      const next = [...changes, line];
      tx.update(notificationRef, {
        changes: next,
        preview: preview(next.join(' · ')),
        exerciseName: `${next.length} thay đổi`,
      });
      return false;
    }
    tx.create(notificationRef, {
      type: 'programme-edit', studentUid: studentId, studentName,
      sessionId, changes: [line],
      exerciseName: '1 thay đổi',
      preview: preview(line),
      link: target.href, readAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
  // Push only for the first change of a session. The others land in the same
  // entry, so a second buzz would say the same thing about the same edit.
  if (!created) return;

  const devices = await db.collection(`coaches/${coachUid}/notificationDevices`).where('enabled', '==', true).get();
  const records = devices.docs.map((item) => ({ ref: item.ref, token: item.data().token })).filter((item) => item.token);
  if (!records.length) return;
  const response = await getMessaging().sendEachForMulticast({
    tokens: records.map((item) => item.token),
    data: {
      type: 'programme-edit', studentUid: studentId, link: target.href,
      title: `${studentName} vừa sửa giáo án`,
      // Deliberately not a count: the sibling writes are still arriving, and a
      // number stated here would be wrong more often than right.
      body: 'Học viên đã lưu thay đổi bài tập cho những buổi sau. Mở để xem lại.',
    },
    webpush: { fcmOptions: { link: target.href } },
  });
  const invalidCodes = new Set(['messaging/invalid-registration-token', 'messaging/registration-token-not-registered']);
  const cleanup = [];
  response.responses.forEach((item, index) => {
    if (!item.success && invalidCodes.has(item.error?.code)) cleanup.push(records[index].ref.delete());
  });
  await Promise.all(cleanup);
});

exports.createWorkoutReviewAlerts = onDocumentCreated({
  document: 'students/{studentId}/sessions/{sessionId}', region: 'asia-southeast1',
}, async (event) => {
  const session = event.data?.data();
  if (!session) return;
  const { studentId, sessionId } = event.params;
  const [studentSnap, recentSnap, phaseSnap, assignmentSnap, checkInSnap, coachingAlertSnap] = await Promise.all([
    db.doc(`students/${studentId}`).get(),
    db.collection(`students/${studentId}/sessions`).orderBy('loggedAt', 'desc').limit(12).get(),
    db.collection(`students/${studentId}/phases`).where('status', '==', 'active').limit(2).get(),
    db.collection(`students/${studentId}/assignments`).get(),
    db.collection(`students/${studentId}/checkIns`).get(),
    db.collection(`students/${studentId}/coachingAlerts`).get(),
  ]);
  if (!studentSnap.exists) return;
  const recentSessions = recentSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
  const previousSessions = recentSessions.filter((item) => item.id !== sessionId);
  const alerts = buildSessionReviewAlerts({ studentId, student: studentSnap.data(), sessionId, session, previousSessions });
  if (phaseSnap.size === 1) {
    const phaseDoc = phaseSnap.docs[0];
    const deloadAlert = buildDeloadReviewAlert({
      studentId, student: studentSnap.data(), phase: { id: phaseDoc.id, ...phaseDoc.data() },
      assignments: assignmentSnap.docs.map((item) => ({ id: item.id, ...item.data() })),
      sessions: recentSessions,
      checkIns: checkInSnap.docs.map((item) => ({ id: item.id, ...item.data() })),
      coachingAlerts: coachingAlertSnap.docs.map((item) => ({ id: item.id, ...item.data() })),
    });
    if (deloadAlert) alerts.push(deloadAlert);
  }
  await materializeReviewAlerts(alerts);
});

exports.refreshPhaseReviewDueAlerts = onSchedule({
  schedule: 'every day 08:00', timeZone: 'Asia/Ho_Chi_Minh', region: 'asia-southeast1',
}, async () => {
  const students = await db.collection('students').get();
  for (const studentDoc of students.docs) {
    const active = await studentDoc.ref.collection('phases').where('status', '==', 'active').limit(2).get();
    if (active.size !== 1) continue;
    const phaseDoc = active.docs[0];
    const reviewSnap = await studentDoc.ref.collection('phaseReviews')
      .doc(phaseReviewDocumentId(phaseDoc.id, phaseDoc.data().activationRevision)).get();
    const alert = buildPhaseReviewDueAlert({
      studentId: studentDoc.id, student: studentDoc.data(),
      phase: { id: phaseDoc.id, ...phaseDoc.data() },
      phaseReview: reviewSnap.exists ? reviewSnap.data() : null,
    });
    await materializeReviewAlerts(alert ? [alert] : []);
  }
});

exports.createCheckInReviewAlert = onDocumentCreated({
  document: 'students/{studentId}/checkIns/{checkInId}', region: 'asia-southeast1',
}, async (event) => {
  const checkIn = event.data?.data();
  if (!checkIn || checkIn.type !== 'volume-recovery') return;
  const { studentId, checkInId } = event.params;
  const studentSnap = await db.doc(`students/${studentId}`).get();
  if (!studentSnap.exists) return;
  const alert = buildCheckInReviewAlert({ studentId, student: studentSnap.data(), checkInId, checkIn });
  await materializeReviewAlerts(alert ? [alert] : []);
});

exports.createProgressionAuditReviewAlert = onDocumentCreated({
  document: 'students/{studentId}/progressionAudits/{auditId}', region: 'asia-southeast1',
}, async (event) => {
  const audit = event.data?.data();
  if (!audit) return;
  const { studentId, auditId } = event.params;
  const studentSnap = await db.doc(`students/${studentId}`).get();
  if (!studentSnap.exists) return;
  const alert = buildAuditReviewAlert({ studentId, student: studentSnap.data(), auditId, audit });
  await materializeReviewAlerts(alert ? [alert] : []);
});
