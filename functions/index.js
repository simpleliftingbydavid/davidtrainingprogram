const { onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://david-coaching.vercel.app';

function preview(value, max = 110) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
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
  const records = devices.docs.map((item) => ({ ref: item.ref, token: item.data().token })).filter((item) => item.token);
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
  if (!coachUid) return;
  const notifications = db.collection(`coaches/${coachUid}/notifications`);
  while (true) {
    const snapshot = await notifications.where('studentUid', '==', event.params.studentId).limit(400).get();
    if (snapshot.empty) return;
    const batch = db.batch();
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
});
