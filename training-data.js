// ============================================================
// DAVID TRAINING PROGRAM — Firestore access layer
// ============================================================
// The only module that talks to Firestore directly. coach.html /
// client.html / login.html call these functions and never touch
// Firestore APIs themselves. Progression math lives in
// progression-engine.js (pure, no Firebase) and is only ever called
// from inside logSessionAndAdvance() below.

import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, getDocs, onSnapshot,
  runTransaction, serverTimestamp, writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { db } from './firebase-init.js';
import { SCHEME, getInitialPrescription } from './progression-engine.js';
import { getExerciseById } from './exercise-seed-data.js';
import { advanceSessionExercise, createInitialExtraState, extraExerciseStateFields } from './workout-session-utils.js';
import { assignmentsForCurrentPeriod, nextPhaseOrder, resolvePeriodization } from './periodization-utils.js';
import { buildPhaseActivationPlan } from './phase-draft-utils.js';
import { defaultVolumeCredits, normalizeVolumeCredits } from './volume-engine.js';
import { parseGramItems, refreshHandPortionHints } from './nutrition-item-parser.js';
import { buildSkippedSessionLog, outcomesFromStoredSession, sessionExerciseEntryKey } from './session-entry-utils.js';
import {
  PROGRAM_CHANGE, programChangeAddAssignmentId, programChangeAssignmentIds, programChangeExerciseIds,
} from './workout-program-change-utils.js';
import { STUDENT_DATA_COLLECTIONS } from './student-data-utils.js';
import { matchesWorkoutDraftSession, workoutDraftWriteDisposition } from './workout-draft-utils.js';
import {
  COMPLETION_REASON, auditChangesForState, completionReasonLabel, createsPainAlert,
  normalizeCompletionReason, progressionChangeDiff, safeAuditReason, shouldHoldProgressionForReason,
} from './coaching-decision-utils.js';
import {
  NOTE_VISIBILITY, normalizeExerciseNoteText, normalizeExerciseNoteVisibility,
  sortExerciseNotes,
} from './exercise-feedback-utils.js';

// ------------------------------------------------------------
// Role resolution
// ------------------------------------------------------------

/** Returns 'coach' | 'student' | null for the given Auth UID. */
export async function getMyRole(uid) {
  const coachSnap = await getDoc(doc(db, 'coaches', uid));
  if (coachSnap.exists()) return 'coach';
  const studentSnap = await getDoc(doc(db, 'students', uid));
  if (studentSnap.exists()) return 'student';
  return null;
}

// ------------------------------------------------------------
// Coach-facing reads/writes
// ------------------------------------------------------------

export const CLIENT_CATEGORIES = Object.freeze({
  gym: 'Phòng tập',
  freelance: 'Freelance',
  online: 'Online',
});

export function normalizeClientCategory(value) {
  return Object.prototype.hasOwnProperty.call(CLIENT_CATEGORIES, value) ? value : '';
}

export async function listMyStudents(coachUid) {
  const q = query(collection(db, 'students'), where('coachUid', '==', coachUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getStudent(studentUid) {
  const snap = await getDoc(doc(db, 'students', studentUid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Create the Firestore-side student profile doc AFTER the coach has
 * already created the Auth account (Console, Phase 1) with the given
 * uid. Phase 1 does not create Auth accounts from the app itself.
 */
export async function createStudentProfile(studentUid, { displayName, email, notes = '', clientCategory }, coachUid) {
  const normalizedCategory = normalizeClientCategory(clientCategory);
  if (!normalizedCategory) throw new Error('Hãy chọn nhóm khách hàng.');
  await setDoc(doc(db, 'students', studentUid), {
    displayName, email, coachUid, notes, clientCategory: normalizedCategory,
    role: 'student',
    unitPref: 'kg',
    localePref: 'vi',
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateStudentCategory(studentUid, clientCategory) {
  const normalizedCategory = normalizeClientCategory(clientCategory);
  if (!normalizedCategory) throw new Error('Nhóm khách hàng không hợp lệ.');
  await updateDoc(doc(db, 'students', studentUid), {
    clientCategory: normalizedCategory,
    updatedAt: serverTimestamp(),
  });
}

// ------------------------------------------------------------
// Assignments (the coach-authored program)
// ------------------------------------------------------------

export async function getStudentAssignments(studentUid, { activeOnly = true } = {}) {
  // Sorted client-side (not via Firestore orderBy) so this never needs a
  // composite index — dayLabel+orderInDay together would require one.
  const col = collection(db, 'students', studentUid, 'assignments');
  const snap = await getDocs(col);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => {
    if (a.dayLabel !== b.dayLabel) return String(a.dayLabel).localeCompare(String(b.dayLabel));
    return (a.orderInDay || 0) - (b.orderInDay || 0);
  });
  return activeOnly ? rows.filter((r) => r.active !== false) : rows;
}

/**
 * Coach creates a new assignment for a student. `scheme` is 2 or 8
 * (see progression-engine.js), `schemeParams` is the scheme-shaped
 * config (see exercise-seed-data.js for the shape), and `initialState`
 * seeds the starting Training Max / working weight / sets / reps —
 * this is the one place a coach's manual judgement (start conservative!
 * per the Little Black Book) enters the system.
 */
export async function createAssignment(studentUid, { exerciseId, exerciseNameSnapshot, dayLabel, orderInDay, scheme, schemeParams, initialState, phaseId = null, note = '', active = true, volumeConfig = null }) {
  const state = {
    consecutiveMisses: 0,
    lastSessionId: null,
    ...(Number(scheme) === SCHEME.SET_THEN_REP_INCREASE ? { progressionStep: 1, progressionCycle: 0 } : {}),
    ...initialState,
    lastUpdatedAt: serverTimestamp(),
  };
  // Sanity-check that the engine can actually produce a first
  // prescription from this state before persisting it.
  getInitialPrescription({ scheme, schemeParams, state });

  return addDoc(collection(db, 'students', studentUid, 'assignments'), {
    exerciseId, exerciseNameSnapshot, dayLabel, orderInDay: orderInDay ?? 0,
    scheme, schemeParams, state, phaseId, note,
    ...(volumeConfig ? { volumeConfig } : {}),
    active: active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Coach edits scheme/schemeParams/day placement — never touches `state`. */
export async function updateAssignmentConfig(studentUid, assignmentId, patch, auditMeta = {}) {
  const assignmentRef = doc(db, 'students', studentUid, 'assignments', assignmentId);
  const auditRef = doc(collection(db, 'students', studentUid, 'progressionAudits'));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(assignmentRef);
    if (!snap.exists()) throw new Error('Bài tập không còn tồn tại.');
    const before = snap.data();
    const after = {
      ...before,
      ...Object.fromEntries(Object.entries(patch).filter(([key]) => !key.includes('.'))),
      state: { ...before.state },
      schemeParams: patch.schemeParams ? { ...patch.schemeParams } : { ...before.schemeParams },
    };
    Object.entries(patch).forEach(([key, value]) => {
      if (key.startsWith('state.')) after.state[key.slice(6)] = value;
    });
    const changes = progressionChangeDiff(before, after);
    const reason = safeAuditReason(auditMeta.reason);
    if (changes.length && !reason) throw new Error('Hãy nhập lý do điều chỉnh progression.');
    tx.update(assignmentRef, { ...patch, updatedAt: serverTimestamp() });
    if (changes.length) {
      tx.set(auditRef, {
        studentUid,
        assignmentId,
        exerciseId: before.exerciseId,
        changes,
        source: 'coach-manual',
        reason,
        sessionId: null,
        actorUid: String(auditMeta.actorUid || ''),
        actorRole: 'coach',
        reviewDate: auditMeta.reviewDate || null,
        createdAt: serverTimestamp(),
      });
    }
  });
}

/**
 * Coach reassigns an assignment to a DIFFERENT exercise. Bigger than
 * updateAssignmentConfig: since the exercise/scheme changed, the old
 * tracked state (Training Max, working weight, sets/reps position)
 * doesn't apply to the new exercise, so it's fully reset to a fresh
 * starting point — same semantics as creating a new assignment.
 */
export async function updateAssignmentExercise(studentUid, assignmentId, { exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, initialState, note = '', volumeConfig = null }, auditMeta = {}) {
  const state = {
    consecutiveMisses: 0,
    lastSessionId: null,
    lastOutcome: null,
    ...(Number(scheme) === SCHEME.SET_THEN_REP_INCREASE ? { progressionStep: 1, progressionCycle: 0 } : {}),
    ...initialState,
    lastUpdatedAt: serverTimestamp(),
  };
  getInitialPrescription({ scheme, schemeParams, state }); // sanity-check before persisting
  const assignmentRef = doc(db, 'students', studentUid, 'assignments', assignmentId);
  const auditRef = doc(collection(db, 'students', studentUid, 'progressionAudits'));
  const reason = safeAuditReason(auditMeta.reason);
  if (!reason) throw new Error('Hãy nhập lý do điều chỉnh progression khi đổi bài tập.');
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(assignmentRef);
    if (!snap.exists()) throw new Error('Bài tập không còn tồn tại.');
    const before = snap.data();
    tx.update(assignmentRef, {
      exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, note,
      ...(volumeConfig ? { volumeConfig } : {}),
      state,
      updatedAt: serverTimestamp(),
    });
    tx.set(auditRef, {
      studentUid,
      assignmentId,
      exerciseId,
      changes: [{ field: 'exercise', before: before.exerciseId, after: exerciseId }, ...progressionChangeDiff(before, { scheme, schemeParams, state })],
      source: 'coach-manual',
      reason,
      sessionId: null,
      actorUid: String(auditMeta.actorUid || ''),
      actorRole: 'coach',
      reviewDate: auditMeta.reviewDate || null,
      createdAt: serverTimestamp(),
    });
  });
}

export async function setAssignmentActive(studentUid, assignmentId, active) {
  await updateDoc(doc(db, 'students', studentUid, 'assignments', assignmentId), {
    active, updatedAt: serverTimestamp(),
  });
}

/** Permanently removes one exercise assignment from a student's program. */
export async function deleteAssignment(studentUid, assignmentId) {
  await deleteDoc(doc(db, 'students', studentUid, 'assignments', assignmentId));
}

/**
 * Atomically reorders every assignment in the affected source/target labels.
 * The phase/student revision prevents a stale Coach tab from silently overwriting
 * a reorder already saved by another Coach tab.
 */
export async function reorderStudentAssignments(studentUid, {
  phaseId = null, expectedRevision = 0, expectedPlacements = [], updates = [],
} = {}) {
  if (!studentUid) throw new Error('Chưa chọn học viên.');
  if (!Array.isArray(expectedPlacements) || !Array.isArray(updates) || !updates.length) {
    throw new Error('Thứ tự bài tập không hợp lệ.');
  }
  if (updates.length > 450) throw new Error('Buổi tập có quá nhiều bài để sắp xếp trong một lần.');
  const expectedById = new Map(expectedPlacements.map((placement) => [placement.id, placement]));
  const updateIds = updates.map((update) => update.id);
  if (new Set(updateIds).size !== updateIds.length
    || updateIds.some((id) => !expectedById.has(id))
    || expectedById.size !== updateIds.length) {
    throw new Error('Danh sách bài tập sắp xếp không đồng nhất.');
  }
  const normalizedPhaseId = phaseId == null || phaseId === '' ? null : String(phaseId);
  const groups = new Map();
  updates.forEach((update) => {
    const updatePhaseId = update.phaseId == null || update.phaseId === '' ? null : String(update.phaseId);
    if (updatePhaseId !== normalizedPhaseId) throw new Error('Không thể chuyển bài sang chu kỳ khác.');
    const dayLabel = String(update.dayLabel || '').trim();
    const orderInDay = Number(update.orderInDay);
    if (!dayLabel || !Number.isInteger(orderInDay) || orderInDay < 1) throw new Error('Vị trí bài tập không hợp lệ.');
    if (!groups.has(dayLabel)) groups.set(dayLabel, []);
    groups.get(dayLabel).push(orderInDay);
  });
  groups.forEach((orders) => {
    orders.sort((a, b) => a - b);
    if (orders.some((order, index) => order !== index + 1)) throw new Error('Thứ tự trong buổi tập phải liên tục.');
  });

  const assignmentRefs = updateIds.map((assignmentId) => doc(db, 'students', studentUid, 'assignments', assignmentId));
  const revisionRef = normalizedPhaseId
    ? doc(db, 'students', studentUid, 'phases', normalizedPhaseId)
    : doc(db, 'students', studentUid);
  return runTransaction(db, async (tx) => {
    const [revisionSnap, ...assignmentSnaps] = await Promise.all([
      tx.get(revisionRef),
      ...assignmentRefs.map((assignmentRef) => tx.get(assignmentRef)),
    ]);
    if (!revisionSnap.exists()) throw new Error('Không tìm thấy chu kỳ đang chỉnh.');
    const liveRevision = Number(revisionSnap.data().assignmentOrderRevision) || 0;
    if (liveRevision !== (Number(expectedRevision) || 0)) {
      const error = new Error('Giáo án vừa được sắp xếp ở một phiên khác.');
      error.code = 'assignment-reorder-conflict';
      throw error;
    }
    assignmentSnaps.forEach((snap, index) => {
      const expected = expectedById.get(updateIds[index]);
      if (!snap.exists()) {
        const error = new Error('Một bài tập vừa bị thay đổi hoặc xóa ở phiên khác.');
        error.code = 'assignment-reorder-conflict';
        throw error;
      }
      const live = snap.data();
      const livePhaseId = live.phaseId == null || live.phaseId === '' ? null : String(live.phaseId);
      const liveDayLabel = String(live.dayLabel || '').trim() || 'Không nhãn';
      const expectedPhaseId = expected.phaseId == null || expected.phaseId === '' ? null : String(expected.phaseId);
      if (livePhaseId !== expectedPhaseId
        || liveDayLabel !== expected.dayLabel
        || (Number(live.orderInDay) || 0) !== (Number(expected.orderInDay) || 0)) {
        const error = new Error('Vị trí bài tập đã thay đổi ở một phiên khác.');
        error.code = 'assignment-reorder-conflict';
        throw error;
      }
    });
    updates.forEach((update, index) => {
      tx.update(assignmentRefs[index], {
        dayLabel: update.dayLabel,
        orderInDay: update.orderInDay,
        updatedAt: serverTimestamp(),
      });
    });
    const nextRevision = liveRevision + 1;
    tx.update(revisionRef, {
      assignmentOrderRevision: nextRevision,
      assignmentOrderUpdatedAt: serverTimestamp(),
    });
    return { revision: nextRevision };
  });
}

// ------------------------------------------------------------
// Phases (periodization) — students who never adopt this feature keep
// working exactly as before: assignments with no `phaseId` are treated
// as always-visible, and getActivePhaseAssignments() falls back to
// getStudentAssignments() when a student has no phases at all.
// ------------------------------------------------------------

export async function listPhases(studentUid) {
  const col = collection(db, 'students', studentUid, 'phases');
  const snap = await getDocs(col);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (a.order || 0) - (b.order || 0));
  return rows;
}

export async function getActivePhase(studentUid) {
  const phases = await listPhases(studentUid);
  return resolvePeriodization(phases).activePhase;
}

export async function setPhaseVolumePlan(studentUid, phaseId, dayFrequencies) {
  const safe = Object.fromEntries(Object.entries(dayFrequencies || {}).map(([label, value]) => [
    String(label).trim(), Math.max(0, Number(value) || 0),
  ]).filter(([label]) => label));
  await updateDoc(doc(db, 'students', studentUid, 'phases', phaseId), {
    'volumePlan.dayFrequencies': safe,
    'volumePlan.updatedAt': serverTimestamp(),
  });
}

/** Assignments to actually show the student — active phase's if the student has adopted phases, else everything (legacy). */
export async function getActivePhaseAssignments(studentUid) {
  const assignments = await getStudentAssignments(studentUid, { activeOnly: false });
  let phases = [];
  try {
    phases = await listPhases(studentUid);
  } catch (err) {
    // Phases subcollection may not exist / rules not published yet for this
    // student — fall back to showing everything, same as before phases existed.
    console.error('getActivePhase failed, showing all active assignments:', err);
    return assignments.filter((assignment) => assignment.active !== false);
  }
  return assignmentsForCurrentPeriod(assignments, phases);
}

/**
 * First-time adoption: wraps every existing assignment into a new
 * "Phase 1", without touching any assignment content — purely a
 * grouping/labeling operation.
 */
export async function createFirstPhase(studentUid, { name, notes = '', plannedStartDate = '' }) {
  const existingPhases = await listPhases(studentUid);
  if (existingPhases.length) throw new Error('Học viên đã có chu kỳ giáo án. Tải lại trang trước khi tiếp tục.');
  const phaseRef = doc(collection(db, 'students', studentUid, 'phases'));
  const assignments = await getStudentAssignments(studentUid, { activeOnly: false });

  const batch = writeBatch(db);
  batch.set(phaseRef, {
    name, notes, plannedStartDate, status: 'active', order: 1,
    createdAt: serverTimestamp(), activatedAt: serverTimestamp(), completedAt: null,
  });
  assignments.forEach((a) => {
    batch.update(doc(db, 'students', studentUid, 'assignments', a.id), { phaseId: phaseRef.id });
  });
  await batch.commit();
  return phaseRef.id;
}

/**
 * Coach-triggered transition: copies the current active phase's
 * assignments (same exercises/schemeParams/state, i.e. picking up right
 * where the student left off) into fresh assignment docs under a new
 * phase, retires the old phase + its assignments (kept, not deleted, so
 * history stays intact), and activates the new phase. The coach edits
 * the copied assignments afterward for whatever the new phase changes.
 */
export async function createNextPhase(studentUid, { name, notes = '', plannedStartDate = '' }) {
  const phases = await listPhases(studentUid);
  const { activePhase } = resolvePeriodization(phases);
  if (!activePhase) throw new Error('Học viên chưa có Phase nào đang active.');
  const allAssignments = await getStudentAssignments(studentUid, { activeOnly: false });
  const activeAssignments = allAssignments.filter((a) => a.phaseId === activePhase.id && a.active !== false);

  const newPhaseRef = doc(collection(db, 'students', studentUid, 'phases'));
  const batch = writeBatch(db);
  batch.set(newPhaseRef, {
    name, notes, plannedStartDate, status: 'active', order: nextPhaseOrder(phases),
    createdAt: serverTimestamp(), activatedAt: serverTimestamp(), completedAt: null,
  });
  batch.update(doc(db, 'students', studentUid, 'phases', activePhase.id), {
    status: 'completed', completedAt: serverTimestamp(),
  });

  activeAssignments.forEach((a) => {
    const { id, createdAt, updatedAt, ...rest } = a;
    const newAssignmentRef = doc(collection(db, 'students', studentUid, 'assignments'));
    batch.set(newAssignmentRef, {
      ...rest, phaseId: newPhaseRef.id, active: true,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    // Old assignment stays in Firestore (session history still points to it) but stops
    // showing up in the coach's active list or the student's workout screen.
    batch.update(doc(db, 'students', studentUid, 'assignments', a.id), {
      active: false, updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return newPhaseRef.id;
}

export async function createPhaseDraft(studentUid, { name, notes = '', plannedStartDate = '', assignments = [] }) {
  const safeName = String(name || '').trim();
  if (!safeName) throw new Error('Hãy đặt tên cho chu kỳ.');
  if (!Array.isArray(assignments) || assignments.length === 0) throw new Error('Hãy chọn ít nhất một buổi tập.');
  if (assignments.length > 450) throw new Error('Bản nháp có quá nhiều bài tập. Hãy chia thành nhiều chu kỳ nhỏ hơn.');
  const phases = await listPhases(studentUid);
  resolvePeriodization(phases);
  if (phases.some((phase) => phase.status === 'draft')) throw new Error('Học viên đã có một chu kỳ bản nháp. Hãy hoàn tất hoặc hủy bản nháp đó trước.');

  assignments.forEach((assignment) => {
    getInitialPrescription({ scheme: assignment.scheme, schemeParams: assignment.schemeParams, state: assignment.initialState });
  });

  const phaseRef = doc(collection(db, 'students', studentUid, 'phases'));
  const batch = writeBatch(db);
  batch.set(phaseRef, {
    name: safeName,
    notes: String(notes || '').trim(),
    plannedStartDate,
    status: 'draft',
    order: nextPhaseOrder(phases),
    createdAt: serverTimestamp(), activatedAt: null, completedAt: null,
  });
  assignments.forEach((assignment) => {
    const assignmentRef = doc(collection(db, 'students', studentUid, 'assignments'));
    batch.set(assignmentRef, {
      exerciseId: assignment.exerciseId,
      exerciseNameSnapshot: assignment.exerciseNameSnapshot,
      dayLabel: assignment.dayLabel,
      orderInDay: assignment.orderInDay ?? 0,
      scheme: assignment.scheme,
      schemeParams: assignment.schemeParams,
      state: {
        consecutiveMisses: 0,
        lastSessionId: null,
        ...assignment.initialState,
        lastUpdatedAt: serverTimestamp(),
      },
      phaseId: phaseRef.id,
      note: assignment.note || '',
      source: assignment.source || null,
      ...(assignment.volumeConfig ? { volumeConfig: assignment.volumeConfig } : {}),
      active: false,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return phaseRef.id;
}

export async function appendPhaseDraftAssignments(studentUid, phaseId, assignments = []) {
  if (!Array.isArray(assignments) || assignments.length === 0) throw new Error('Hãy chọn ít nhất một buổi tập để thêm.');
  const [phases, currentAssignments] = await Promise.all([
    listPhases(studentUid),
    getStudentAssignments(studentUid, { activeOnly: false }),
  ]);
  const target = phases.find((phase) => phase.id === phaseId);
  if (!target || target.status !== 'draft') throw new Error('Chỉ có thể thêm buổi vào chu kỳ đang ở trạng thái bản nháp.');
  const currentDraftCount = currentAssignments.filter((assignment) => assignment.phaseId === phaseId).length;
  if (currentDraftCount + assignments.length > 450) throw new Error('Bản nháp có quá nhiều bài tập. Hãy chia thành nhiều chu kỳ nhỏ hơn.');
  assignments.forEach((assignment) => {
    getInitialPrescription({ scheme: assignment.scheme, schemeParams: assignment.schemeParams, state: assignment.initialState });
  });

  const batch = writeBatch(db);
  assignments.forEach((assignment) => {
    const assignmentRef = doc(collection(db, 'students', studentUid, 'assignments'));
    batch.set(assignmentRef, {
      exerciseId: assignment.exerciseId,
      exerciseNameSnapshot: assignment.exerciseNameSnapshot,
      dayLabel: assignment.dayLabel,
      orderInDay: assignment.orderInDay ?? 0,
      scheme: assignment.scheme,
      schemeParams: assignment.schemeParams,
      state: {
        consecutiveMisses: 0,
        lastSessionId: null,
        ...assignment.initialState,
        lastUpdatedAt: serverTimestamp(),
      },
      phaseId,
      note: assignment.note || '',
      source: assignment.source || null,
      ...(assignment.volumeConfig ? { volumeConfig: assignment.volumeConfig } : {}),
      active: false,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function activatePhaseDraft(studentUid, phaseId) {
  const [phases, assignments] = await Promise.all([
    listPhases(studentUid),
    getStudentAssignments(studentUid, { activeOnly: false }),
  ]);
  const phaseRefs = phases.map((phase) => doc(db, 'students', studentUid, 'phases', phase.id));
  const assignmentRefs = assignments.map((assignment) => doc(db, 'students', studentUid, 'assignments', assignment.id));

  await runTransaction(db, async (tx) => {
    const phaseSnaps = await Promise.all(phaseRefs.map((ref) => tx.get(ref)));
    const assignmentSnaps = await Promise.all(assignmentRefs.map((ref) => tx.get(ref)));
    const livePhases = phaseSnaps.filter((snap) => snap.exists()).map((snap) => ({ id: snap.id, ...snap.data() }));
    const liveAssignments = assignmentSnaps.filter((snap) => snap.exists()).map((snap) => ({ id: snap.id, ...snap.data() }));
    const plan = buildPhaseActivationPlan(livePhases, liveAssignments, phaseId);
    if (plan.previousActivePhaseId) {
      tx.update(doc(db, 'students', studentUid, 'phases', plan.previousActivePhaseId), {
        status: 'completed', completedAt: serverTimestamp(),
      });
    }
    tx.update(doc(db, 'students', studentUid, 'phases', phaseId), {
      status: 'active', activatedAt: serverTimestamp(), completedAt: null,
    });
    liveAssignments.forEach((assignment) => {
      const shouldBeActive = assignment.phaseId === phaseId;
      if ((assignment.active !== false) !== shouldBeActive) {
        tx.update(doc(db, 'students', studentUid, 'assignments', assignment.id), {
          active: shouldBeActive, updatedAt: serverTimestamp(),
        });
      }
    });
  });
}

export async function deletePhaseDraft(studentUid, phaseId) {
  const [phases, assignments] = await Promise.all([
    listPhases(studentUid),
    getStudentAssignments(studentUid, { activeOnly: false }),
  ]);
  const target = phases.find((phase) => phase.id === phaseId);
  if (!target || target.status !== 'draft') throw new Error('Chỉ có thể hủy chu kỳ đang ở trạng thái bản nháp.');
  const batch = writeBatch(db);
  assignments.filter((assignment) => assignment.phaseId === phaseId).forEach((assignment) => {
    batch.delete(doc(db, 'students', studentUid, 'assignments', assignment.id));
  });
  batch.delete(doc(db, 'students', studentUid, 'phases', phaseId));
  await batch.commit();
}

// ------------------------------------------------------------
// Sessions (workout logs) + the autoregulation transaction
// ------------------------------------------------------------

/**
 * Applies only the exercise-structure changes a student explicitly chose to keep
 * after a completed session. Set count and rest-time adjustments are deliberately
 * excluded: those remain session-only autoregulation choices.
 */
export async function saveStudentProgramChanges(studentUid, {
  dayLabel, phaseId = null, sessionId, changes = [], firstAddedOrder = 0,
}) {
  const safeSessionId = String(sessionId || '').trim();
  const safeDayLabel = String(dayLabel || '').trim();
  if (!safeSessionId || !safeDayLabel || !Array.isArray(changes) || !changes.length) return [];

  const assignmentIds = programChangeAssignmentIds(changes);
  const exerciseIds = programChangeExerciseIds(changes);
  const assignmentRefs = assignmentIds.map((id) => doc(db, 'students', studentUid, 'assignments', id));
  const stateRefs = exerciseIds.map((id) => doc(db, 'students', studentUid, 'extraExerciseStates', id));
  const addChanges = changes.filter((change) => change.type === PROGRAM_CHANGE.ADD);
  const addRefs = addChanges.map((change, index) => {
    const safeAddId = programChangeAddAssignmentId(safeSessionId, change.exerciseId, index);
    return doc(db, 'students', studentUid, 'assignments', safeAddId);
  });
  const phaseRef = phaseId ? doc(db, 'students', studentUid, 'phases', phaseId) : null;

  return runTransaction(db, async (tx) => {
    const refsToRead = [...assignmentRefs, ...stateRefs, ...addRefs, ...(phaseRef ? [phaseRef] : [])];
    const snaps = await Promise.all(refsToRead.map((ref) => tx.get(ref)));
    const assignmentSnaps = new Map(assignmentIds.map((id, index) => [id, snaps[index]]));
    const stateOffset = assignmentRefs.length;
    const stateSnaps = new Map(exerciseIds.map((id, index) => [id, snaps[stateOffset + index]]));
    const addOffset = stateOffset + stateRefs.length;
    const addSnaps = addRefs.map((ref, index) => snaps[addOffset + index]);
    const phaseSnap = phaseRef ? snaps[snaps.length - 1] : null;
    if (phaseRef && (!phaseSnap.exists() || phaseSnap.data().status !== 'active')) {
      throw new Error('Chu kỳ hiện tại đã thay đổi. Buổi tập vẫn được lưu nhưng chưa thể cập nhật giáo án.');
    }

    function validateAssignment(change) {
      const snap = assignmentSnaps.get(change.assignmentId);
      if (!snap?.exists()) throw new Error('Một bài trong giáo án không còn tồn tại.');
      const data = snap.data();
      if (data.active === false || data.dayLabel !== safeDayLabel || (data.phaseId || null) !== (phaseId || null)) {
        throw new Error('Giáo án đã thay đổi trên thiết bị khác. Buổi tập vẫn được lưu nhưng chưa cập nhật giáo án.');
      }
      return { ref: snap.ref, data };
    }

    function contextForExercise(exerciseId) {
      const exercise = getExerciseById(exerciseId);
      if (!exercise) throw new Error(`Bài tập ${exerciseId} không còn trong thư viện.`);
      const storedSnap = stateSnaps.get(exerciseId);
      const stored = storedSnap?.exists() ? storedSnap.data() : null;
      const scheme = stored?.scheme || exercise.defaultScheme;
      const schemeParams = stored?.schemeParams || exercise.defaultParams;
      const state = stored?.state || createInitialExtraState(exercise);
      getInitialPrescription({ scheme, schemeParams, state });
      return {
        exercise,
        scheme,
        schemeParams,
        state: { ...state, lastUpdatedAt: serverTimestamp() },
        volumeConfig: { credits: defaultVolumeCredits(exercise), techniqueReady: false },
      };
    }

    let addIndex = 0;
    changes.forEach((change) => {
      const audit = {
        studentEditedAt: serverTimestamp(), sourceSessionId: safeSessionId, updatedAt: serverTimestamp(),
      };
      if (change.type === PROGRAM_CHANGE.REMOVE) {
        const existing = assignmentSnaps.get(change.assignmentId)?.data();
        if (existing?.sourceSessionId === safeSessionId && existing.active === false) return;
        const { ref } = validateAssignment(change);
        tx.update(ref, { active: false, ...audit });
        return;
      }
      if (change.type === PROGRAM_CHANGE.REPLACE) {
        const existing = assignmentSnaps.get(change.assignmentId)?.data();
        if (existing?.sourceSessionId === safeSessionId && existing.exerciseId === change.replacementExerciseId) return;
        const { ref } = validateAssignment(change);
        const context = contextForExercise(change.replacementExerciseId);
        tx.update(ref, {
          exerciseId: context.exercise.exerciseId,
          exerciseNameSnapshot: { vi: context.exercise.nameVi },
          scheme: context.scheme,
          schemeParams: context.schemeParams,
          state: context.state,
          volumeConfig: context.volumeConfig,
          ...audit,
        });
        return;
      }
      if (change.type === PROGRAM_CHANGE.ADD) {
        const existingAdd = addSnaps[addIndex];
        if (existingAdd?.exists()) {
          if (existingAdd.data().sourceSessionId !== safeSessionId) throw new Error('Mã thay đổi giáo án đã được sử dụng.');
          addIndex += 1;
          return;
        }
        const context = contextForExercise(change.exerciseId);
        tx.set(addRefs[addIndex], {
          exerciseId: context.exercise.exerciseId,
          exerciseNameSnapshot: { vi: context.exercise.nameVi },
          dayLabel: safeDayLabel,
          orderInDay: Number(firstAddedOrder) + addIndex,
          scheme: context.scheme,
          schemeParams: context.schemeParams,
          state: context.state,
          phaseId: phaseId || null,
          note: '',
          volumeConfig: context.volumeConfig,
          active: true,
          studentCreated: true,
          sourceSessionId: safeSessionId,
          studentEditedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addIndex += 1;
      }
    });
    return changes;
  });
}

/**
 * The core write path. `exerciseEntries` is an array of
 * { assignmentId, actualSets: [{setIndex, weight, reps, rir?}] } —
 * one entry per exercise the client logged this session. For each
 * entry, reads the assignment's current scheme/state inside a single
 * transaction, runs the pure progression engine, and writes both the
 * new session doc and the updated assignment.state atomically.
 *
 * Returns the array of { assignmentId, resultBucket, delta,
 * nextPrescription } so the UI can immediately show "next time: ...".
 */
/** The single best set from a list of actual sets — heaviest weight, reps as tiebreaker
 * at the same weight. For bodyweight exercises (weight always 0) this naturally reduces
 * to a rep PR, since every set ties on weight and reps decides it. */
function bestSetOf(actualSets) {
  let best = { weight: 0, reps: 0 };
  (actualSets || []).forEach((s) => {
    if (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
      best = { weight: s.weight, reps: s.reps };
    }
  });
  return best;
}

export async function logSessionAndAdvance(studentUid, {
  dayLabel, performedAt, clientNote = '', durationSeconds = null,
  exerciseEntries = [], skippedExercises = [], completionContext = {}, sessionId = null,
}) {
  if (!Array.isArray(exerciseEntries) || !Array.isArray(skippedExercises)) {
    throw new Error('Dữ liệu buổi tập không hợp lệ.');
  }
  if ((!Array.isArray(exerciseEntries) || exerciseEntries.length === 0)
      && (!Array.isArray(skippedExercises) || skippedExercises.length === 0)) {
    throw new Error('Buổi tập cần có ít nhất 1 bài đã hoàn thành hoặc được bỏ qua.');
  }
  if (exerciseEntries.some((entry) => !Array.isArray(entry.actualSets) || entry.actualSets.length === 0)) {
    throw new Error('Không thể ghi nhận bài tập chưa hoàn thành set nào.');
  }
  if (exerciseEntries.some((entry) => entry.source === 'extra' ? !entry.exerciseId : !entry.assignmentId)) {
    throw new Error('Dữ liệu bài tập trong buổi không hợp lệ.');
  }
  const entryKeys = exerciseEntries.map(sessionExerciseEntryKey);
  if (new Set(entryKeys).size !== entryKeys.length) {
    throw new Error('Một bài tập đang bị thêm trùng trong buổi.');
  }
  const performedExerciseIds = new Map();
  exerciseEntries.forEach((entry) => {
    const performedId = String(entry.substitutedExerciseId || entry.exerciseId || '').trim();
    const changesExerciseIdentity = entry.source === 'extra' || Boolean(entry.substitutedExerciseId);
    if (performedId && performedExerciseIds.has(performedId)
        && (changesExerciseIdentity || performedExerciseIds.get(performedId))) {
      throw new Error('Một bài tập đang bị thêm trùng trong buổi.');
    }
    if (performedId) performedExerciseIds.set(
      performedId,
      changesExerciseIdentity || performedExerciseIds.get(performedId) === true,
    );
  });
  const skippedIds = skippedExercises.map((entry) => String(entry.assignmentId || '').trim());
  if (skippedIds.some((id) => !id) || new Set(skippedIds).size !== skippedIds.length) {
    throw new Error('Dữ liệu bài được bỏ qua không hợp lệ.');
  }
  const completedAssignmentIds = new Set(exerciseEntries.filter((entry) => entry.source !== 'extra').map((entry) => entry.assignmentId));
  if (skippedIds.some((id) => completedAssignmentIds.has(id))) {
    throw new Error('Một bài không thể vừa hoàn thành vừa được bỏ qua.');
  }
  [...exerciseEntries.filter((entry) => Number(entry.adjustedSetCount) < Number(entry.plannedSetCount)), ...skippedExercises]
    .forEach((entry) => {
      const normalized = normalizeCompletionReason(entry.completionReason || entry.skipReason, entry.completionReasonNote || entry.skipReasonNote);
      if (!normalized.valid) throw new Error('Hãy chọn lý do phù hợp cho bài chưa hoàn thành đúng kế hoạch.');
    });
  const normalizedEarlyEnd = normalizeCompletionReason(completionContext?.earlyEndReason, completionContext?.earlyEndReasonNote);
  if (completionContext?.endedEarly === true && !normalizedEarlyEnd.valid) {
    throw new Error('Hãy chọn lý do kết thúc buổi tập sớm.');
  }

  const safeSessionId = String(sessionId || '').trim().replaceAll('/', '_');
  const sessionRef = safeSessionId
    ? doc(db, 'students', studentUid, 'sessions', safeSessionId)
    : doc(collection(db, 'students', studentUid, 'sessions'));
  const activeDraftRef = activeWorkoutDraftRef(studentUid);

  const results = await runTransaction(db, async (tx) => {
    const entryRefs = exerciseEntries.map((entry) => entry.source === 'extra'
      ? doc(db, 'students', studentUid, 'extraExerciseStates', entry.exerciseId)
      : doc(db, 'students', studentUid, 'assignments', entry.assignmentId)
    );
    const substituteRefsByIndex = exerciseEntries.map((entry) => entry.source !== 'extra' && entry.substitutedExerciseId
      ? doc(db, 'students', studentUid, 'extraExerciseStates', entry.substitutedExerciseId)
      : null
    );
    // All reads must happen before any writes in a Firestore transaction.
    const [sessionSnap, activeDraftSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(activeDraftRef),
    ]);
    const substituteRefs = substituteRefsByIndex.filter(Boolean);
    const painEntries = [
      ...exerciseEntries.filter((entry) => createsPainAlert(entry.completionReason) && entry.assignmentId),
      ...skippedExercises.filter((entry) => createsPainAlert(entry.skipReason) && entry.assignmentId),
    ];
    const alertAssignmentIds = [...new Set([
      ...exerciseEntries.map((entry) => entry.assignmentId),
      ...skippedExercises.map((entry) => entry.assignmentId),
    ].filter(Boolean))];
    const alertRefs = alertAssignmentIds.map((assignmentId) => doc(db, 'students', studentUid, 'coachingAlerts', `exercise_${assignmentId}`));
    const generalPainAlertRef = normalizedEarlyEnd.reason === COMPLETION_REASON.PAIN
      ? doc(db, 'students', studentUid, 'coachingAlerts', 'general_joint_pain')
      : null;
    const allSnaps = await Promise.all([...entryRefs, ...substituteRefs, ...alertRefs, ...(generalPainAlertRef ? [generalPainAlertRef] : [])].map((ref) => tx.get(ref)));
    const entrySnaps = allSnaps.slice(0, entryRefs.length);
    let substituteSnapOffset = entryRefs.length;
    const substituteSnapsByIndex = substituteRefsByIndex.map((ref) => ref ? allSnaps[substituteSnapOffset++] : null);
    const alertSnapOffset = entryRefs.length + substituteRefs.length;
    const alertSnapsByAssignmentId = new Map(
      allSnaps.slice(alertSnapOffset, alertSnapOffset + alertAssignmentIds.length)
        .map((snap, index) => [alertAssignmentIds[index], snap]),
    );
    const generalPainAlertSnap = generalPainAlertRef ? allSnaps[allSnaps.length - 1] : null;
    if (sessionSnap.exists()) {
      if (activeDraftSnap.exists() && matchesWorkoutDraftSession(activeDraftSnap.data(), safeSessionId)) {
        tx.delete(activeDraftRef);
      }
      return outcomesFromStoredSession(sessionSnap.data());
    }

    const exerciseLogs = [];
    const outcomes = [];

    function activeSafetyAlert(assignmentId) {
      const snap = alertSnapsByAssignmentId.get(assignmentId);
      return snap?.exists() && snap.data().status !== 'resolved';
    }

    function writeProgressionAudit({ key, assignmentId = null, exerciseId, beforeState, afterState, source, reason, extraChanges = [] }) {
      const changes = [...auditChangesForState(beforeState, afterState), ...extraChanges];
      if (!changes.length) return;
      const auditId = `${safeSessionId}_${String(key || assignmentId || exerciseId).replaceAll('/', '_')}`;
      tx.set(doc(db, 'students', studentUid, 'progressionAudits', auditId), {
        studentUid,
        assignmentId,
        exerciseId,
        changes,
        source,
        reason: safeAuditReason(reason, 'Cập nhật sau buổi tập'),
        sessionId: safeSessionId,
        actorUid: studentUid,
        actorRole: 'engine',
        reviewDate: null,
        createdAt: serverTimestamp(),
      });
    }

    exerciseEntries.forEach((entry, i) => {
      const snap = entrySnaps[i];

      if (entry.source === 'extra') {
        const exercise = getExerciseById(entry.exerciseId);
        if (!exercise) throw new Error(`Bài tập thêm ${entry.exerciseId} không còn trong thư viện.`);

        const stored = snap.exists() ? snap.data() : null;
        const scheme = stored?.scheme || exercise.defaultScheme;
        const baseSchemeParams = stored?.schemeParams || exercise.defaultParams;
        const schemeParams = {
          ...baseSchemeParams,
          restSeconds: entry.restSeconds > 0 ? entry.restSeconds : (baseSchemeParams.restSeconds || 90),
        };
        const state = stored?.state || createInitialExtraState(exercise, entry.actualSets);
        const planned = getInitialPrescription({ scheme, schemeParams, state });
        const advanced = advanceSessionExercise({
          scheme, schemeParams, state, actualSets: entry.actualSets,
          adjustedSetCount: entry.adjustedSetCount || planned.sets,
          techniqueConfirmed: entry.techniqueConfirmed === true,
          forceHold: shouldHoldProgressionForReason(entry.completionReason),
          holdReason: entry.completionReason ? `${completionReasonLabel(entry.completionReason)} — giữ nguyên progression` : '',
        });
        const sessionBest = bestSetOf(entry.actualSets);
        const priorPR = state.prWeight != null ? { weight: state.prWeight, reps: state.prReps || 0 } : null;
        const isNewPR = priorPR != null && (
          sessionBest.weight > priorPR.weight ||
          (sessionBest.weight === priorPR.weight && sessionBest.reps > priorPR.reps)
        );
        const prAfter = (priorPR == null || isNewPR) ? sessionBest : priorPR;

        exerciseLogs.push({
          sessionExerciseId: entry.sessionExerciseId || null,
          assignmentId: null,
          exerciseId: exercise.exerciseId,
          exerciseNameSnapshot: { vi: exercise.nameVi },
          source: 'extra',
          volumeCredits: defaultVolumeCredits(exercise),
          scheme,
          planned,
          plannedSetCount: advanced.plannedSetCount,
          adjustedSetCount: advanced.adjustedSetCount,
          actualSets: entry.actualSets,
          resultBucket: advanced.resultBucket,
          delta: advanced.delta,
          outcome: advanced.outcome,
          nextPrescription: advanced.nextPrescription,
          progressionHeld: advanced.progressionHeld,
          techniqueConfirmed: entry.techniqueConfirmed === true,
          restSeconds: schemeParams.restSeconds,
          isPR: isNewPR,
          completionReason: entry.completionReason || '',
          completionReasonNote: entry.completionReasonNote || '',
        });
        outcomes.push({
          assignmentId: null,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.nameVi,
          source: 'extra',
          resultBucket: advanced.resultBucket,
          delta: advanced.delta,
          outcome: advanced.outcome,
          nextPrescription: advanced.nextPrescription,
          progressionHeld: advanced.progressionHeld,
          techniqueConfirmed: entry.techniqueConfirmed === true,
          restSeconds: schemeParams.restSeconds,
          isPR: isNewPR,
          prAfter,
        });
        const persistedState = {
          ...advanced.nextState,
          lastOutcome: advanced.outcome,
          lastSessionId: sessionRef.id,
          lastUpdatedAt: serverTimestamp(),
          prWeight: prAfter.weight,
          prReps: prAfter.reps,
        };
        const persistenceFields = extraExerciseStateFields({
          exists: snap.exists(), exercise, scheme, baseSchemeParams, state: persistedState,
        });
        if (snap.exists()) {
          tx.update(entryRefs[i], { ...persistenceFields, updatedAt: serverTimestamp() });
        } else {
          tx.set(entryRefs[i], { ...persistenceFields, updatedAt: serverTimestamp() });
        }
        writeProgressionAudit({
          key: `extra_${exercise.exerciseId}`,
          exerciseId: exercise.exerciseId,
          beforeState: state,
          afterState: persistedState,
          source: advanced.progressionHeld ? 'safety' : 'engine',
          reason: advanced.resultBucket,
        });
        return;
      }

      if (!snap.exists()) throw new Error(`Assignment ${entry.assignmentId} not found`);
      const assignment = snap.data();

      const planned = getInitialPrescription({
        scheme: assignment.scheme, schemeParams: assignment.schemeParams, state: assignment.state,
      });

      if (entry.substitutedExerciseId) {
        // The original assignment remains untouched. The exercise actually performed keeps
        // its own remembered progression in extraExerciseStates, so it can resume correctly
        // if it is substituted or added again in a later session.
        const substituteExercise = getExerciseById(entry.substitutedExerciseId);
        if (!substituteExercise) throw new Error(`Bài thay thế ${entry.substitutedExerciseId} không còn trong thư viện.`);
        const substituteSnap = substituteSnapsByIndex[i];
        const stored = substituteSnap?.exists() ? substituteSnap.data() : null;
        const scheme = stored?.scheme || substituteExercise.defaultScheme;
        const baseSchemeParams = stored?.schemeParams || substituteExercise.defaultParams;
        const schemeParams = {
          ...baseSchemeParams,
          restSeconds: entry.restSeconds > 0 ? entry.restSeconds : (baseSchemeParams.restSeconds || 90),
        };
        const state = stored?.state || createInitialExtraState(substituteExercise, entry.actualSets);
        const substitutePlanned = getInitialPrescription({ scheme, schemeParams, state });
        const advanced = advanceSessionExercise({
          scheme,
          schemeParams,
          state,
          actualSets: entry.actualSets,
          adjustedSetCount: entry.adjustedSetCount || substitutePlanned.sets,
          techniqueConfirmed: entry.techniqueConfirmed === true,
          forceHold: activeSafetyAlert(entry.assignmentId) || shouldHoldProgressionForReason(entry.completionReason),
          holdReason: activeSafetyAlert(entry.assignmentId)
            ? 'Đang giữ progression — chờ David xem'
            : (entry.completionReason ? `${completionReasonLabel(entry.completionReason)} — giữ nguyên progression` : ''),
        });
        const sessionBest = bestSetOf(entry.actualSets);
        const priorPR = state.prWeight != null ? { weight: state.prWeight, reps: state.prReps || 0 } : null;
        const isNewPR = priorPR != null && (
          sessionBest.weight > priorPR.weight ||
          (sessionBest.weight === priorPR.weight && sessionBest.reps > priorPR.reps)
        );
        const prAfter = (priorPR == null || isNewPR) ? sessionBest : priorPR;
        exerciseLogs.push({
          sessionExerciseId: entry.sessionExerciseId || null,
          assignmentId: entry.assignmentId,
          exerciseId: assignment.exerciseId,
          substitutedExerciseId: entry.substitutedExerciseId,
          source: 'substitute',
          volumeCredits: defaultVolumeCredits(substituteExercise),
          scheme,
          planned: substitutePlanned,
          originalPlanned: planned,
          plannedSetCount: advanced.plannedSetCount,
          adjustedSetCount: advanced.adjustedSetCount,
          actualSets: entry.actualSets,
          resultBucket: advanced.resultBucket,
          delta: advanced.delta,
          outcome: 'sub',
          progressionOutcome: advanced.outcome,
          nextPrescription: advanced.nextPrescription,
          originalNextPrescription: planned,
          progressionHeld: advanced.progressionHeld,
          techniqueConfirmed: entry.techniqueConfirmed === true,
          isPR: isNewPR,
          completionReason: entry.completionReason || '',
          completionReasonNote: entry.completionReasonNote || '',
        });
        outcomes.push({
          assignmentId: entry.assignmentId,
          exerciseId: substituteExercise.exerciseId,
          exerciseName: substituteExercise.nameVi,
          source: 'substitute',
          outcome: 'sub',
          progressionOutcome: advanced.outcome,
          resultBucket: advanced.resultBucket,
          delta: advanced.delta,
          nextPrescription: advanced.nextPrescription,
          originalNextPrescription: planned,
          substitutedExerciseId: entry.substitutedExerciseId,
          progressionHeld: advanced.progressionHeld,
          techniqueConfirmed: entry.techniqueConfirmed === true,
          isPR: isNewPR,
          prAfter,
        });
        const persistedState = {
          ...advanced.nextState,
          lastOutcome: advanced.outcome,
          lastSessionId: sessionRef.id,
          lastUpdatedAt: serverTimestamp(),
          prWeight: prAfter.weight,
          prReps: prAfter.reps,
        };
        const persistenceFields = extraExerciseStateFields({
          exists: Boolean(substituteSnap?.exists()),
          exercise: substituteExercise,
          scheme,
          baseSchemeParams,
          state: persistedState,
        });
        const substituteRef = substituteRefsByIndex[i];
        if (substituteSnap?.exists()) tx.update(substituteRef, { ...persistenceFields, updatedAt: serverTimestamp() });
        else tx.set(substituteRef, { ...persistenceFields, updatedAt: serverTimestamp() });
        writeProgressionAudit({
          key: `substitute_${entry.assignmentId}_${substituteExercise.exerciseId}`,
          assignmentId: entry.assignmentId,
          exerciseId: substituteExercise.exerciseId,
          beforeState: state,
          afterState: persistedState,
          source: advanced.progressionHeld ? 'safety' : 'engine',
          reason: advanced.resultBucket,
        });
        return;
      }

      const hasActiveSafetyAlert = activeSafetyAlert(entry.assignmentId);
      const reasonForcesHold = shouldHoldProgressionForReason(entry.completionReason);
      const advanced = advanceSessionExercise({
        scheme: assignment.scheme,
        schemeParams: assignment.schemeParams,
        state: assignment.state,
        actualSets: entry.actualSets,
        adjustedSetCount: entry.adjustedSetCount || planned.sets,
        techniqueConfirmed: entry.techniqueConfirmed === true,
        forceHold: hasActiveSafetyAlert || reasonForcesHold,
        holdReason: hasActiveSafetyAlert
          ? 'Đang giữ progression — chờ David xem'
          : (entry.completionReason ? `${completionReasonLabel(entry.completionReason)} — giữ nguyên progression` : ''),
      });
      const { nextPrescription, nextState, resultBucket, delta, outcome, progressionHeld } = advanced;

      // Personal record: heaviest set ever logged for this assignment (reps as tiebreaker
      // at the same weight). No prior PR on record (brand new assignment, or one created
      // before this feature existed) just sets the baseline — the very first logged set
      // isn't awarded a "record" since there's nothing yet to beat.
      const sessionBest = bestSetOf(entry.actualSets);
      const priorPR = assignment.state.prWeight != null
        ? { weight: assignment.state.prWeight, reps: assignment.state.prReps || 0 }
        : null;
      const isNewPR = priorPR != null && (
        sessionBest.weight > priorPR.weight ||
        (sessionBest.weight === priorPR.weight && sessionBest.reps > priorPR.reps)
      );
      const prAfter = (priorPR == null || isNewPR) ? sessionBest : priorPR;

      exerciseLogs.push({
        sessionExerciseId: entry.sessionExerciseId || null,
        assignmentId: entry.assignmentId,
        exerciseId: assignment.exerciseId,
        scheme: assignment.scheme,
        planned,
        source: 'assigned',
        plannedSetCount: advanced.plannedSetCount,
        adjustedSetCount: advanced.adjustedSetCount,
        actualSets: entry.actualSets,
        resultBucket,
        delta,
        outcome,
        nextPrescription,
        progressionHeld,
        techniqueConfirmed: entry.techniqueConfirmed === true,
        isPR: isNewPR,
        completionReason: entry.completionReason || '',
        completionReasonNote: entry.completionReasonNote || '',
      });
      outcomes.push({ assignmentId: entry.assignmentId, resultBucket, delta, outcome, nextPrescription, progressionHeld, techniqueConfirmed: entry.techniqueConfirmed === true, isPR: isNewPR, prAfter });

      tx.update(entryRefs[i], {
        state: {
          ...nextState, lastOutcome: outcome, lastSessionId: sessionRef.id, lastUpdatedAt: serverTimestamp(),
          prWeight: prAfter.weight, prReps: prAfter.reps,
        },
        updatedAt: serverTimestamp(),
      });
      writeProgressionAudit({
        key: entry.assignmentId,
        assignmentId: entry.assignmentId,
        exerciseId: assignment.exerciseId,
        beforeState: assignment.state,
        afterState: nextState,
        source: progressionHeld ? 'safety' : 'engine',
        reason: resultBucket,
      });
    });

    skippedExercises.forEach((entry) => {
      exerciseLogs.push(buildSkippedSessionLog(entry));
      outcomes.push({
        assignmentId: entry.assignmentId,
        exerciseId: entry.exerciseId || null,
        exerciseName: entry.exerciseNameSnapshot?.vi || '',
        outcome: 'skipped',
        progressionHeld: true,
        nextPrescription: null,
      });
    });

    painEntries.forEach((entry) => {
      const assignmentId = entry.assignmentId;
      const existingSnap = alertSnapsByAssignmentId.get(assignmentId);
      const existing = existingSnap?.exists() ? existingSnap.data() : null;
      const exerciseId = entry.substitutedExerciseId || entry.exerciseId || existing?.exerciseId || '';
      const reasonNote = entry.completionReasonNote || entry.skipReasonNote || '';
      const alertRef = doc(db, 'students', studentUid, 'coachingAlerts', `exercise_${assignmentId}`);
      tx.set(alertRef, {
        studentUid,
        type: 'exercise-pain',
        assignmentId,
        exerciseId,
        exerciseName: entry.exerciseNameSnapshot?.vi || getExerciseById(exerciseId)?.nameVi || '',
        status: 'open',
        progressionHeld: true,
        latestSessionId: safeSessionId,
        latestNote: reasonNote,
        occurrences: Math.max(0, Number(existing?.occurrences) || 0) + 1,
        firstDetectedAt: existing?.firstDetectedAt || serverTimestamp(),
        lastDetectedAt: serverTimestamp(),
        acknowledgedAt: null,
        resolvedAt: null,
        resolvedBy: null,
        resolutionNote: '',
        updatedAt: serverTimestamp(),
      });
      tx.set(doc(db, 'students', studentUid, 'coachingAlertEvents', `${safeSessionId}_${assignmentId}`), {
        studentUid,
        alertId: `exercise_${assignmentId}`,
        type: 'exercise-pain',
        assignmentId,
        exerciseId,
        sessionId: safeSessionId,
        note: reasonNote,
        source: 'workout',
        createdBy: studentUid,
        createdAt: serverTimestamp(),
      });
      writeProgressionAudit({
        key: `pain_${assignmentId}`,
        assignmentId,
        exerciseId,
        beforeState: {},
        afterState: {},
        source: 'safety',
        reason: 'Học viên báo đau hoặc khó chịu',
        extraChanges: existing?.status !== 'resolved' && existing ? [] : [{ field: 'progressionHold', before: false, after: true }],
      });
    });

    if (generalPainAlertRef) {
      const existing = generalPainAlertSnap?.exists() ? generalPainAlertSnap.data() : null;
      tx.set(generalPainAlertRef, {
        studentUid,
        type: 'general-joint-pain',
        assignmentId: null,
        exerciseId: null,
        exerciseName: '',
        status: 'open',
        progressionHeld: false,
        blocksVolumeIncrease: true,
        latestSessionId: safeSessionId,
        latestNote: normalizedEarlyEnd.note,
        occurrences: Math.max(0, Number(existing?.occurrences) || 0) + 1,
        firstDetectedAt: existing?.firstDetectedAt || serverTimestamp(),
        lastDetectedAt: serverTimestamp(),
        acknowledgedAt: null,
        resolvedAt: null,
        resolvedBy: null,
        resolutionNote: '',
        updatedAt: serverTimestamp(),
      });
      tx.set(doc(db, 'students', studentUid, 'coachingAlertEvents', `${safeSessionId}_general_joint_pain`), {
        studentUid,
        alertId: 'general_joint_pain',
        type: 'general-joint-pain',
        assignmentId: null,
        exerciseId: null,
        sessionId: safeSessionId,
        note: normalizedEarlyEnd.note,
        source: 'workout-early-end',
        createdBy: studentUid,
        createdAt: serverTimestamp(),
      });
    }

    const performedAssignmentIds = [...new Set(exerciseLogs.map((log) => log.assignmentId).filter(Boolean))];
    const performedExerciseIdList = [...new Set(exerciseLogs.map((log) => log.substitutedExerciseId || log.exerciseId).filter(Boolean))];
    tx.set(sessionRef, {
      dayLabel, performedAt, clientNote, coachNote: '', durationSeconds,
      loggedAt: serverTimestamp(),
      studentUid,
      performedAssignmentIds,
      performedExerciseIds: performedExerciseIdList,
      exerciseLogs,
      completionContext: {
        endedEarly: completionContext?.endedEarly === true,
        earlyEndReason: normalizedEarlyEnd.reason,
        earlyEndReasonNote: normalizedEarlyEnd.note,
        incompleteAssignmentIds: Array.isArray(completionContext?.incompleteAssignmentIds)
          ? completionContext.incompleteAssignmentIds.map(String).slice(0, 50)
          : [],
      },
    });
    if (activeDraftSnap.exists() && matchesWorkoutDraftSession(activeDraftSnap.data(), safeSessionId)) {
      tx.delete(activeDraftRef);
    }

    return outcomes;
  });

  return results;
}

export async function listExtraExerciseStates(studentUid) {
  const snap = await getDocs(collection(db, 'students', studentUid, 'extraExerciseStates'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listSessionHistory(studentUid, { max = 20 } = {}) {
  const col = collection(db, 'students', studentUid, 'sessions');
  const constraints = [orderBy('loggedAt', 'desc')];
  if (Number.isFinite(Number(max)) && Number(max) > 0) constraints.push(limit(Math.trunc(Number(max))));
  const snap = await getDocs(query(col, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ------------------------------------------------------------
// Exercise notes — immutable journal entries scoped to one session + exercise.
// ------------------------------------------------------------

export async function createExerciseNote(studentUid, {
  sessionId, sessionLabel = '', sessionExerciseId = '', assignmentId = '', exerciseId,
  exerciseName = '', authorUid, authorRole, authorName = '', visibility = NOTE_VISIBILITY.SHARED,
  replyToNoteId = '', body,
}) {
  const normalizedBody = normalizeExerciseNoteText(body);
  const normalizedSessionId = String(sessionId || '').trim().replaceAll('/', '_');
  const normalizedExerciseId = String(exerciseId || '').trim();
  if (!normalizedBody) throw new Error('Ghi chú đang để trống.');
  if (!normalizedSessionId || !normalizedExerciseId || !authorUid) throw new Error('Thiếu thông tin buổi tập hoặc bài tập.');
  const ref = await addDoc(collection(db, 'students', studentUid, 'exerciseNotes'), {
    studentUid,
    sessionId: normalizedSessionId,
    sessionLabel: String(sessionLabel || '').trim().slice(0, 120),
    sessionExerciseId: String(sessionExerciseId || '').trim().slice(0, 180),
    assignmentId: String(assignmentId || '').trim().slice(0, 180),
    exerciseId: normalizedExerciseId.slice(0, 180),
    exerciseName: String(exerciseName || '').trim().slice(0, 180),
    authorUid,
    authorRole: authorRole === 'coach' ? 'coach' : 'student',
    authorName: String(authorName || '').trim().slice(0, 120),
    visibility: normalizeExerciseNoteVisibility(authorRole, visibility),
    replyToNoteId: String(replyToNoteId || '').trim().slice(0, 180),
    body: normalizedBody,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id };
}

export async function listExerciseNotesForExercise(studentUid, exerciseId, { sharedOnly = false } = {}) {
  const constraints = [where('exerciseId', '==', String(exerciseId || '').trim())];
  if (sharedOnly) constraints.push(where('visibility', '==', NOTE_VISIBILITY.SHARED));
  const snap = await getDocs(query(collection(db, 'students', studentUid, 'exerciseNotes'), ...constraints));
  return sortExerciseNotes(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
}

export async function getExerciseNote(studentUid, noteId) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'exerciseNotes', noteId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ------------------------------------------------------------
// Coach notifications + per-device Web Push registration.
// Notification documents are written only by the trusted Cloud Function.
// ------------------------------------------------------------

export function subscribeCoachNotifications(coachUid, onItems, onError = () => {}) {
  const q = query(collection(db, 'coaches', coachUid, 'notifications'), orderBy('createdAt', 'desc'), limit(80));
  return onSnapshot(q, (snap) => onItems(snap.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
}

export async function markCoachNotificationRead(coachUid, notificationId) {
  await updateDoc(doc(db, 'coaches', coachUid, 'notifications', notificationId), { readAt: serverTimestamp() });
}

export async function markAllCoachNotificationsRead(coachUid, notifications = []) {
  const unread = notifications.filter((item) => !item.readAt);
  for (let offset = 0; offset < unread.length; offset += 400) {
    const batch = writeBatch(db);
    unread.slice(offset, offset + 400).forEach((item) => batch.update(
      doc(db, 'coaches', coachUid, 'notifications', item.id),
      { readAt: serverTimestamp() },
    ));
    await batch.commit();
  }
}

export async function saveCoachNotificationDevice(coachUid, deviceId, { token, enabled = true, platform = '' }) {
  const ref = doc(db, 'coaches', coachUid, 'notificationDevices', String(deviceId).replaceAll('/', '_'));
  const existing = await getDoc(ref);
  await setDoc(ref, {
    token: String(token || ''), enabled: enabled === true,
    platform: String(platform || '').slice(0, 300),
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCoachNotificationDevice(coachUid, deviceId) {
  await deleteDoc(doc(db, 'coaches', coachUid, 'notificationDevices', String(deviceId).replaceAll('/', '_')));
}

// ------------------------------------------------------------
// Active workout draft — one resumable session per student
// ------------------------------------------------------------

function activeWorkoutDraftRef(studentUid) {
  return doc(db, 'students', studentUid, 'workoutDrafts', 'active');
}

function workoutDraftPayload(studentUid, draft, revision) {
  return {
    version: Number(draft.version) || 4,
    studentUid,
    day: String(draft.day || ''),
    performedDate: String(draft.performedDate || ''),
    clientNote: String(draft.clientNote || ''),
    sessionStartTime: Number(draft.sessionStartTime) || Date.now(),
    sessionId: String(draft.sessionId || ''),
    exercises: Array.isArray(draft.exercises) ? draft.exercises : [],
    savedAt: Number(draft.savedAt) || Date.now(),
    deviceId: String(draft.deviceId || ''),
    revision,
    updatedAt: serverTimestamp(),
  };
}

export async function getActiveWorkoutDraft(studentUid) {
  const snap = await getDoc(activeWorkoutDraftRef(studentUid));
  return snap.exists() ? snap.data() : null;
}

export async function saveActiveWorkoutDraft(studentUid, draft, { expectedRevision = null } = {}) {
  const ref = activeWorkoutDraftRef(studentUid);
  const safeSessionId = String(draft?.sessionId || '').trim().replaceAll('/', '_');
  if (!safeSessionId) throw new Error('Bản nháp buổi tập thiếu mã phiên.');
  const sessionRef = doc(db, 'students', studentUid, 'sessions', safeSessionId);
  return runTransaction(db, async (tx) => {
    const [snap, sessionSnap] = await Promise.all([tx.get(ref), tx.get(sessionRef)]);
    const current = snap.exists() ? snap.data() : null;
    const disposition = workoutDraftWriteDisposition({
      currentDraft: current,
      recordedSession: sessionSnap.exists(),
      expectedRevision,
    });
    if (disposition === 'ended') {
      if (snap.exists() && matchesWorkoutDraftSession(snap.data(), safeSessionId)) tx.delete(ref);
      return { status: 'ended', revision: null };
    }
    const currentRevision = Math.max(0, Math.trunc(Number(current?.revision) || 0));
    if (disposition === 'conflict') {
      return { status: 'conflict', draft: current, revision: currentRevision };
    }
    const revision = currentRevision + 1;
    tx.set(ref, workoutDraftPayload(studentUid, draft, revision));
    return { status: 'saved', draft: { ...draft, revision }, revision };
  });
}

export async function deleteActiveWorkoutDraft(studentUid, sessionId = null) {
  const ref = activeWorkoutDraftRef(studentUid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return { status: 'missing' };
    const current = snap.data();
    if (sessionId && current.sessionId !== sessionId) return { status: 'different-session', draft: current };
    tx.delete(ref);
    return { status: 'deleted' };
  });
}

export function subscribeActiveWorkoutDraft(studentUid, onDraft, onError = () => {}) {
  return onSnapshot(activeWorkoutDraftRef(studentUid), (snap) => {
    onDraft(snap.exists() ? snap.data() : null);
  }, onError);
}

export async function listVolumeCheckIns(studentUid) {
  const snap = await getDocs(collection(db, 'students', studentUid, 'checkIns'));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.type === 'volume-recovery');
}

export async function createVolumeCheckIn(studentUid, { muscleRecovery, fatigue, jointPain, performance, note = '' }) {
  const checkInRef = doc(collection(db, 'students', studentUid, 'checkIns'));
  const jointPainValue = Number(jointPain);
  const alertRef = doc(db, 'students', studentUid, 'coachingAlerts', 'general_joint_pain');
  await runTransaction(db, async (tx) => {
    const alertSnap = jointPainValue >= 2 ? await tx.get(alertRef) : null;
    tx.set(checkInRef, {
      type: 'volume-recovery',
      muscleRecovery,
      fatigue: Number(fatigue),
      jointPain: jointPainValue,
      performance: Number(performance),
      note: String(note || '').trim(),
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    if (jointPainValue < 2) return;
    const existing = alertSnap?.exists() ? alertSnap.data() : null;
    tx.set(alertRef, {
      studentUid,
      type: 'general-joint-pain',
      assignmentId: null,
      exerciseId: null,
      exerciseName: '',
      status: 'open',
      progressionHeld: false,
      blocksVolumeIncrease: true,
      latestCheckInId: checkInRef.id,
      latestNote: String(note || '').trim(),
      latestJointPain: jointPainValue,
      occurrences: Math.max(0, Number(existing?.occurrences) || 0) + 1,
      firstDetectedAt: existing?.firstDetectedAt || serverTimestamp(),
      lastDetectedAt: serverTimestamp(),
      acknowledgedAt: null,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNote: '',
      updatedAt: serverTimestamp(),
    });
    tx.set(doc(db, 'students', studentUid, 'coachingAlertEvents', `checkin_${checkInRef.id}`), {
      studentUid,
      alertId: 'general_joint_pain',
      type: 'general-joint-pain',
      assignmentId: null,
      exerciseId: null,
      sessionId: null,
      checkInId: checkInRef.id,
      jointPain: jointPainValue,
      note: String(note || '').trim(),
      source: 'check-in',
      createdBy: studentUid,
      createdAt: serverTimestamp(),
    });
  });
  return checkInRef;
}

export async function listCoachingAlerts(studentUid) {
  const snap = await getDocs(collection(db, 'students', studentUid, 'coachingAlerts'));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.lastDetectedAt?.toMillis?.() || 0) - (a.lastDetectedAt?.toMillis?.() || 0));
}

export async function listProgressionAudits(studentUid, { max = 100 } = {}) {
  const source = collection(db, 'students', studentUid, 'progressionAudits');
  const q = max == null ? query(source, orderBy('createdAt', 'desc')) : query(source, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function resolveCoachingAlert(studentUid, alertId, {
  action, note = '', actorUid = '', reviewDate = null,
} = {}) {
  const allowed = new Set(['acknowledge', 'hold', 'resume']);
  if (!allowed.has(action)) throw new Error('Thao tác cảnh báo không hợp lệ.');
  const alertRef = doc(db, 'students', studentUid, 'coachingAlerts', alertId);
  const auditRef = doc(collection(db, 'students', studentUid, 'progressionAudits'));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(alertRef);
    if (!snap.exists()) throw new Error('Cảnh báo không còn tồn tại.');
    const alert = snap.data();
    const nowFields = action === 'resume'
      ? { status: 'resolved', progressionHeld: false, blocksVolumeIncrease: false, resolvedAt: serverTimestamp(), resolvedBy: actorUid }
      : { status: action === 'hold' ? 'holding' : 'acknowledged', acknowledgedAt: serverTimestamp(), acknowledgedBy: actorUid };
    tx.update(alertRef, {
      ...nowFields,
      resolutionNote: String(note || '').trim().slice(0, 1000),
      updatedAt: serverTimestamp(),
    });
    if (alert.type === 'exercise-pain' && action === 'resume' && alert.progressionHeld !== false) {
      tx.set(auditRef, {
        studentUid,
        assignmentId: alert.assignmentId || null,
        exerciseId: alert.exerciseId || '',
        changes: [{ field: 'progressionHold', before: true, after: false }],
        source: 'safety-resolved',
        reason: safeAuditReason(note, 'David cho phép progression hoạt động lại'),
        sessionId: null,
        actorUid,
        actorRole: 'coach',
        reviewDate: reviewDate || null,
        createdAt: serverTimestamp(),
      });
    }
  });
}

// ------------------------------------------------------------
// Progress photos — the actual image bytes live in Firebase Storage
// (uploaded/deleted by the caller with the Storage SDK directly, since
// that needs the `storage` instance from firebase-init.js, not `db`);
// these functions only manage the Firestore metadata doc that points at
// each photo (downloadURL, storagePath, takenAt, note).
// ------------------------------------------------------------

export async function listProgressPhotos(studentUid) {
  const col = collection(db, 'students', studentUid, 'progressPhotos');
  const snap = await getDocs(query(col, orderBy('takenAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addProgressPhoto(studentUid, { takenAt, note = '', downloadURL, storagePath }) {
  return addDoc(collection(db, 'students', studentUid, 'progressPhotos'), {
    takenAt, note, downloadURL, storagePath, createdAt: serverTimestamp(),
  });
}

export async function deleteProgressPhotoDoc(studentUid, photoId) {
  await deleteDoc(doc(db, 'students', studentUid, 'progressPhotos', photoId));
}

// ------------------------------------------------------------
// Body weight log — paired with the Progress Photos page rather than
// the workout-logging flow, since it's a periodic check-in, not a
// per-session thing.
// ------------------------------------------------------------

export async function listBodyWeightLogs(studentUid, { max = 100 } = {}) {
  const col = collection(db, 'students', studentUid, 'bodyWeightLogs');
  const snap = await getDocs(query(col, orderBy('loggedAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addBodyWeightLog(studentUid, { weight, loggedAt, note = '' }) {
  return addDoc(collection(db, 'students', studentUid, 'bodyWeightLogs'), {
    weight, loggedAt, note, createdAt: serverTimestamp(),
  });
}

// ------------------------------------------------------------
// Program Library — reusable day templates the coach builds from a real
// student's current assignments (e.g. "Back Day 1"), so a new client's
// program doesn't have to be rebuilt exercise-by-exercise from scratch.
// Coach-owned, not tied to any student — lives under coaches/{coachUid}.
// Deliberately does NOT store weight/Training Max: those are specific to
// each client's actual strength, never reusable, so applying a template
// still asks for a fresh starting value per exercise.
// ------------------------------------------------------------

export async function listProgramTemplates(coachUid) {
  const col = collection(db, 'coaches', coachUid, 'programTemplates');
  const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveProgramTemplate(coachUid, { name, sourceDayLabel, exercises }) {
  return addDoc(collection(db, 'coaches', coachUid, 'programTemplates'), {
    name, sourceDayLabel, exercises, createdAt: serverTimestamp(),
  });
}

export async function deleteProgramTemplate(coachUid, templateId) {
  await deleteDoc(doc(db, 'coaches', coachUid, 'programTemplates', templateId));
}

// ------------------------------------------------------------
// Program meta (session count/day labels — display-only in Phase 1)
// ------------------------------------------------------------

export async function getProgramMeta(studentUid) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'programMeta', 'current'));
  return snap.exists() ? snap.data() : null;
}

export async function setProgramMeta(studentUid, meta) {
  await setDoc(doc(db, 'students', studentUid, 'programMeta', 'current'), meta, { merge: true });
}

/**
 * Deletes the Firestore profile and all subcollections currently used by this app.
 * The parent document is deliberately deleted last so coach authorization remains
 * valid while the child documents are being removed.
 */
export async function deleteStudentData(studentUid) {
  for (const collectionName of STUDENT_DATA_COLLECTIONS) {
    const snap = await getDocs(collection(db, 'students', studentUid, collectionName));
    const refs = snap.docs.map((item) => item.ref);
    for (let offset = 0; offset < refs.length; offset += 400) {
      const batch = writeBatch(db);
      refs.slice(offset, offset + 400).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
  }
  await deleteDoc(doc(db, 'students', studentUid));
}

// ------------------------------------------------------------
// Nutrition planning — one active coach-authored plan per student,
// plus one lightweight adherence check-in per calendar day.
// ------------------------------------------------------------

export async function getNutritionPlan(studentUid) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'nutritionPlans', 'current'));
  return snap.exists() ? snap.data() : null;
}

function normalizeNutritionPlan(plan, coachUid) {
  // Carried on the plan so both coach editors keep it across a save; the
  // hand-portion hint is sex-dependent and neither editor form asks for it.
  const sex = String(plan.sex || '');
  const meals = (plan.meals || []).map((meal, index) => {
    const items = refreshHandPortionHints(meal.items, sex);
    return {
      id: String(meal.id || `meal-${index + 1}`),
      name: String(meal.name || '').trim(),
      time: String(meal.time || '').trim(),
      kcal: Number(meal.kcal) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fat: Number(meal.fat) || 0,
      items,
      // Per-food grams and macros, read back out of the lines above rather
      // than taken from whatever the generator originally produced — both
      // coach editors let those lines be rewritten by hand, so the text is
      // the only trustworthy source. Lines naming a food outside the table
      // yield nothing, which is why gramItems can be shorter than items;
      // compare the two lengths before treating it as a complete picture.
      gramItems: parseGramItems(items),
    };
  }).filter((meal) => meal.name);

  return {
    goal: String(plan.goal || '').trim(),
    sex,
    kcal: Number(plan.kcal) || 0,
    protein: Number(plan.protein) || 0,
    carbs: Number(plan.carbs) || 0,
    fat: Number(plan.fat) || 0,
    notes: String(plan.notes || '').trim(),
    meals,
    coachUid,
    sourceTemplateId: String(plan.sourceTemplateId || 'manual'),
    engineVersion: String(plan.engineVersion || 'manual'),
    standardVersion: String(plan.standardVersion || ''),
    calorieBasis: plan.calorieBasis && typeof plan.calorieBasis === 'object' ? plan.calorieBasis : null,
    micros: plan.micros && typeof plan.micros === 'object' ? plan.micros : null,
    reassessmentWeeks: String(plan.reassessmentWeeks || '2–4'),
    performancePriority: plan.performancePriority !== false,
    functionalFoods: Array.isArray(plan.functionalFoods) ? plan.functionalFoods.map(String) : [],
    supplements: Array.isArray(plan.supplements) ? plan.supplements.map(String) : [],
    // Gram-generator metadata (totals, accuracy vs target, meal style). Kept so
    // reopening a saved draft still shows how closely it hit the target,
    // instead of silently losing that context. Null for descriptive plans.
    gramPlan: plan.gramPlan && typeof plan.gramPlan === 'object' ? plan.gramPlan : null,
    active: true,
  };
}

export async function saveNutritionPlan(studentUid, coachUid, plan) {
  return publishNutritionPlan(studentUid, coachUid, plan);
}

export async function getNutritionProfile(studentUid) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'nutritionProfile', 'current'));
  return snap.exists() ? snap.data() : null;
}

export async function saveNutritionProfile(studentUid, coachUid, profile) {
  await setDoc(doc(db, 'students', studentUid, 'nutritionProfile', 'current'), {
    sex: String(profile.sex || ''),
    age: Number(profile.age) || 0,
    heightCm: Number(profile.heightCm) || 0,
    weightKg: Number(profile.weightKg) || 0,
    goalType: String(profile.goalType || 'maintain'),
    bodyCondition: String(profile.bodyCondition || 'normal'),
    calorieMethod: String(profile.calorieMethod || 'combined'),
    proteinPerKg: Number(profile.proteinPerKg) || 1.9,
    fatPerKg: Number(profile.fatPerKg) || .75,
    trainingLoad: String(profile.trainingLoad || 'moderate'),
    menstrualPhase: String(profile.menstrualPhase || 'usual'),
    workSchedule: String(profile.workSchedule || ''),
    sleepSchedule: String(profile.sleepSchedule || ''),
    trainingTime: String(profile.trainingTime || 'evening'),
    mealCount: Math.min(5, Math.max(3, Number(profile.mealCount) || 4)),
    digestion: String(profile.digestion || 'normal'),
    preferences: String(profile.preferences || ''),
    avoidFoods: String(profile.avoidFoods || ''),
    // The two lists the meal generator actually reads. The free-text fields
    // above stay for the coach's own notes, but they are notes only — a food
    // is excluded because it appears here, never because it was typed above.
    preferredFoods: Array.isArray(profile.preferredFoods) ? profile.preferredFoods.map(String) : [],
    avoidedFoods: Array.isArray(profile.avoidedFoods) ? profile.avoidedFoods.map(String) : [],
    wakeTime: String(profile.wakeTime || ''),
    budget: String(profile.budget || ''),
    coachNotes: String(profile.coachNotes || ''),
    coachUid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveNutritionDraft(studentUid, coachUid, plan) {
  const ref = doc(collection(db, 'students', studentUid, 'nutritionPlans'));
  await setDoc(ref, {
    ...normalizeNutritionPlan(plan, coachUid),
    active: false,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function publishNutritionPlan(studentUid, coachUid, plan) {
  const normalized = normalizeNutritionPlan(plan, coachUid);
  const versionRef = doc(collection(db, 'students', studentUid, 'nutritionPlans'));
  const currentRef = doc(db, 'students', studentUid, 'nutritionPlans', 'current');
  const batch = writeBatch(db);
  batch.set(versionRef, {
    ...normalized,
    active: false,
    status: 'published',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(currentRef, {
    ...normalized,
    active: true,
    status: 'published',
    versionId: versionRef.id,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return versionRef.id;
}

export async function listNutritionPlanVersions(studentUid, { max = 20 } = {}) {
  const col = collection(db, 'students', studentUid, 'nutritionPlans');
  const snap = await getDocs(query(col, orderBy('updatedAt', 'desc'), limit(max + 1)));
  return snap.docs
    .filter((d) => d.id !== 'current')
    .slice(0, max)
    .map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Remove one saved plan version from a student's history.
 *
 * Refuses the 'current' document outright. That doc is the one the student's
 * own app reads, and deleting it would leave them with no plan at all — a
 * different and much worse outcome than clearing a draft. The version list
 * already filters 'current' out, so arriving here with it means something
 * upstream is wrong, and failing loudly beats silently wiping a live plan.
 *
 * Deleting a published version does NOT withdraw it from the client: what
 * they see lives in 'current', which this never touches. The caller is
 * responsible for saying so before asking the coach to confirm.
 */
export async function deleteNutritionPlanVersion(studentUid, versionId) {
  const id = String(versionId || '').trim();
  if (!id) throw new Error('Thiếu mã bản kế hoạch cần xoá.');
  if (id === 'current') throw new Error('Không thể xoá kế hoạch đang áp dụng cho khách.');
  await deleteDoc(doc(db, 'students', studentUid, 'nutritionPlans', id));
}

export async function getNutritionCheckin(studentUid, date) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'nutritionCheckins', date));
  return snap.exists() ? snap.data() : null;
}

export async function saveNutritionCheckin(studentUid, date, { completedMealIds, note = '' }) {
  await setDoc(doc(db, 'students', studentUid, 'nutritionCheckins', date), {
    date,
    completedMealIds: [...new Set((completedMealIds || []).map(String))],
    note: String(note || '').trim(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Daily numbers the progress check reads: calories eaten, steps, and 1-5
// self-ratings for sleep, energy and hunger. Every field is optional — a
// client who only logs weight and calories still gets a usable diagnosis, and
// the engine reports what it could not conclude rather than guessing.
//
// Body weight is deliberately NOT stored here: it lives in bodyWeightLogs so
// the progress chart and the nutrition diagnosis can never disagree.
// Merged into the same daily doc as the meal ticks, so one day is one document.
const DAILY_METRIC_RANGES = {
  kcal: { min: 0, max: 12000 },
  steps: { min: 0, max: 100000 },
  sleep: { min: 1, max: 5 },
  energy: { min: 1, max: 5 },
  hunger: { min: 1, max: 5 },
};

export function normalizeDailyMetrics(metrics = {}) {
  const clean = {};
  for (const [key, range] of Object.entries(DAILY_METRIC_RANGES)) {
    const raw = metrics[key];
    if (raw === '' || raw === null || raw === undefined) { clean[key] = null; continue; }
    const value = Number(raw);
    clean[key] = Number.isFinite(value) ? Math.min(range.max, Math.max(range.min, value)) : null;
  }
  return clean;
}

export async function saveNutritionDailyLog(studentUid, date, metrics = {}) {
  await setDoc(doc(db, 'students', studentUid, 'nutritionCheckins', date), {
    date,
    ...normalizeDailyMetrics(metrics),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/** Food eaten out, logged against today's budget. Stored on the same daily doc.
 *  Each entry: { name, kcal, protein, servings }. */
export async function saveNutritionFoodLog(studentUid, date, entries = []) {
  const foodLog = entries.slice(0, 40).map((entry) => ({
    name: String(entry.name || '').slice(0, 120),
    kcal: Number(entry.kcal) || 0,
    protein: Number(entry.protein) || 0,
    servings: Number(entry.servings) || 1,
  }));
  await setDoc(doc(db, 'students', studentUid, 'nutritionCheckins', date), {
    date, foodLog, updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listNutritionCheckins(studentUid, { max = 14 } = {}) {
  const col = collection(db, 'students', studentUid, 'nutritionCheckins');
  const snap = await getDocs(query(col, orderBy('date', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
