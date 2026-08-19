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
import { buildSkippedSessionLog } from './session-entry-utils.js';
import {
  PROGRAM_CHANGE, programChangeAssignmentIds, programChangeExerciseIds,
} from './workout-program-change-utils.js';

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
export async function updateAssignmentConfig(studentUid, assignmentId, patch) {
  await updateDoc(doc(db, 'students', studentUid, 'assignments', assignmentId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Coach reassigns an assignment to a DIFFERENT exercise. Bigger than
 * updateAssignmentConfig: since the exercise/scheme changed, the old
 * tracked state (Training Max, working weight, sets/reps position)
 * doesn't apply to the new exercise, so it's fully reset to a fresh
 * starting point — same semantics as creating a new assignment.
 */
export async function updateAssignmentExercise(studentUid, assignmentId, { exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, initialState, note = '', volumeConfig = null }) {
  const state = {
    consecutiveMisses: 0,
    lastSessionId: null,
    lastOutcome: null,
    ...(Number(scheme) === SCHEME.SET_THEN_REP_INCREASE ? { progressionStep: 1, progressionCycle: 0 } : {}),
    ...initialState,
    lastUpdatedAt: serverTimestamp(),
  };
  getInitialPrescription({ scheme, schemeParams, state }); // sanity-check before persisting
  await updateDoc(doc(db, 'students', studentUid, 'assignments', assignmentId), {
    exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, note,
    ...(volumeConfig ? { volumeConfig } : {}),
    state,
    updatedAt: serverTimestamp(),
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
  const addRefs = changes.filter((change) => change.type === PROGRAM_CHANGE.ADD)
    .map(() => doc(collection(db, 'students', studentUid, 'assignments')));
  const phaseRef = phaseId ? doc(db, 'students', studentUid, 'phases', phaseId) : null;

  return runTransaction(db, async (tx) => {
    const refsToRead = [...assignmentRefs, ...stateRefs, ...(phaseRef ? [phaseRef] : [])];
    const snaps = await Promise.all(refsToRead.map((ref) => tx.get(ref)));
    const assignmentSnaps = new Map(assignmentIds.map((id, index) => [id, snaps[index]]));
    const stateOffset = assignmentRefs.length;
    const stateSnaps = new Map(exerciseIds.map((id, index) => [id, snaps[stateOffset + index]]));
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
        const { ref } = validateAssignment(change);
        tx.update(ref, { active: false, ...audit });
        return;
      }
      if (change.type === PROGRAM_CHANGE.REPLACE) {
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

export async function logSessionAndAdvance(studentUid, { dayLabel, performedAt, clientNote = '', durationSeconds = null, exerciseEntries = [], skippedExercises = [], sessionId = null }) {
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
  const entryKeys = exerciseEntries.map((entry) => entry.source === 'extra'
    ? `exercise:${entry.exerciseId}`
    : entry.substitutedExerciseId
      ? `exercise:${entry.substitutedExerciseId}`
      : `assigned:${entry.assignmentId}`
  );
  if (new Set(entryKeys).size !== entryKeys.length) {
    throw new Error('Một bài tập đang bị thêm trùng trong buổi.');
  }
  const skippedIds = skippedExercises.map((entry) => String(entry.assignmentId || '').trim());
  if (skippedIds.some((id) => !id) || new Set(skippedIds).size !== skippedIds.length) {
    throw new Error('Dữ liệu bài được bỏ qua không hợp lệ.');
  }
  const completedAssignmentIds = new Set(exerciseEntries.filter((entry) => entry.source !== 'extra').map((entry) => entry.assignmentId));
  if (skippedIds.some((id) => completedAssignmentIds.has(id))) {
    throw new Error('Một bài không thể vừa hoàn thành vừa được bỏ qua.');
  }

  const safeSessionId = String(sessionId || '').trim().replaceAll('/', '_');
  const sessionRef = safeSessionId
    ? doc(db, 'students', studentUid, 'sessions', safeSessionId)
    : doc(collection(db, 'students', studentUid, 'sessions'));

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
    const sessionSnap = await tx.get(sessionRef);
    const substituteRefs = substituteRefsByIndex.filter(Boolean);
    const allSnaps = await Promise.all([...entryRefs, ...substituteRefs].map((ref) => tx.get(ref)));
    const entrySnaps = allSnaps.slice(0, entryRefs.length);
    let substituteSnapOffset = entryRefs.length;
    const substituteSnapsByIndex = substituteRefsByIndex.map((ref) => ref ? allSnaps[substituteSnapOffset++] : null);
    if (sessionSnap.exists()) throw new Error('Buổi tập này đã được ghi nhận trước đó.');

    const exerciseLogs = [];
    const outcomes = [];

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
        });
        const sessionBest = bestSetOf(entry.actualSets);
        const priorPR = state.prWeight != null ? { weight: state.prWeight, reps: state.prReps || 0 } : null;
        const isNewPR = priorPR != null && (
          sessionBest.weight > priorPR.weight ||
          (sessionBest.weight === priorPR.weight && sessionBest.reps > priorPR.reps)
        );
        const prAfter = (priorPR == null || isNewPR) ? sessionBest : priorPR;

        exerciseLogs.push({
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
        });
        const sessionBest = bestSetOf(entry.actualSets);
        const priorPR = state.prWeight != null ? { weight: state.prWeight, reps: state.prReps || 0 } : null;
        const isNewPR = priorPR != null && (
          sessionBest.weight > priorPR.weight ||
          (sessionBest.weight === priorPR.weight && sessionBest.reps > priorPR.reps)
        );
        const prAfter = (priorPR == null || isNewPR) ? sessionBest : priorPR;
        exerciseLogs.push({
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
        return;
      }

      const advanced = advanceSessionExercise({
        scheme: assignment.scheme,
        schemeParams: assignment.schemeParams,
        state: assignment.state,
        actualSets: entry.actualSets,
        adjustedSetCount: entry.adjustedSetCount || planned.sets,
        techniqueConfirmed: entry.techniqueConfirmed === true,
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
      });
      outcomes.push({ assignmentId: entry.assignmentId, resultBucket, delta, outcome, nextPrescription, progressionHeld, techniqueConfirmed: entry.techniqueConfirmed === true, isPR: isNewPR, prAfter });

      tx.update(entryRefs[i], {
        state: {
          ...nextState, lastOutcome: outcome, lastSessionId: sessionRef.id, lastUpdatedAt: serverTimestamp(),
          prWeight: prAfter.weight, prReps: prAfter.reps,
        },
        updatedAt: serverTimestamp(),
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

    tx.set(sessionRef, {
      dayLabel, performedAt, clientNote, coachNote: '', durationSeconds,
      loggedAt: serverTimestamp(),
      exerciseLogs,
    });

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
// Active workout draft — one resumable session per student
// ------------------------------------------------------------

function activeWorkoutDraftRef(studentUid) {
  return doc(db, 'students', studentUid, 'workoutDrafts', 'active');
}

function workoutDraftPayload(studentUid, draft, revision) {
  return {
    version: Number(draft.version) || 3,
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
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data() : null;
    const currentRevision = Math.max(0, Math.trunc(Number(current?.revision) || 0));
    if (current && (expectedRevision == null || currentRevision !== Number(expectedRevision))) {
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
  return addDoc(collection(db, 'students', studentUid, 'checkIns'), {
    type: 'volume-recovery',
    muscleRecovery,
    fatigue: Number(fatigue),
    jointPain: Number(jointPain),
    performance: Number(performance),
    note: String(note || '').trim(),
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
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

const STUDENT_DATA_COLLECTIONS = [
  'assignments', 'phases', 'sessions', 'extraExerciseStates', 'progressPhotos', 'bodyWeightLogs',
  'programMeta', 'nutritionProfile', 'nutritionPlans', 'nutritionCheckins',
  'nutritionDays', 'checkIns', 'messages',
];

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
  const meals = (plan.meals || []).map((meal, index) => ({
    id: String(meal.id || `meal-${index + 1}`),
    name: String(meal.name || '').trim(),
    time: String(meal.time || '').trim(),
    kcal: Number(meal.kcal) || 0,
    protein: Number(meal.protein) || 0,
    carbs: Number(meal.carbs) || 0,
    fat: Number(meal.fat) || 0,
    items: Array.isArray(meal.items)
      ? meal.items.map((item) => String(item).trim()).filter(Boolean)
      : [],
  })).filter((meal) => meal.name);

  return {
    goal: String(plan.goal || '').trim(),
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

export async function listNutritionCheckins(studentUid, { max = 14 } = {}) {
  const col = collection(db, 'students', studentUid, 'nutritionCheckins');
  const snap = await getDocs(query(col, orderBy('date', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
