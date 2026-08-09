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
  collection, query, where, orderBy, limit, getDocs,
  runTransaction, serverTimestamp, writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { db } from './firebase-init.js';
import { getInitialPrescription } from './progression-engine.js';
import { getExerciseById } from './exercise-seed-data.js';
import { advanceSessionExercise, createInitialExtraState } from './workout-session-utils.js';

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
export async function createAssignment(studentUid, { exerciseId, exerciseNameSnapshot, dayLabel, orderInDay, scheme, schemeParams, initialState, phaseId = null, note = '' }) {
  const state = { consecutiveMisses: 0, lastSessionId: null, ...initialState, lastUpdatedAt: serverTimestamp() };
  // Sanity-check that the engine can actually produce a first
  // prescription from this state before persisting it.
  getInitialPrescription({ scheme, schemeParams, state });

  return addDoc(collection(db, 'students', studentUid, 'assignments'), {
    exerciseId, exerciseNameSnapshot, dayLabel, orderInDay: orderInDay ?? 0,
    scheme, schemeParams, state, phaseId, note,
    active: true,
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
export async function updateAssignmentExercise(studentUid, assignmentId, { exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, initialState, note = '' }) {
  const state = { consecutiveMisses: 0, lastSessionId: null, lastOutcome: null, ...initialState, lastUpdatedAt: serverTimestamp() };
  getInitialPrescription({ scheme, schemeParams, state }); // sanity-check before persisting
  await updateDoc(doc(db, 'students', studentUid, 'assignments', assignmentId), {
    exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, note,
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
  return phases.find((p) => p.status === 'active') || null;
}

/** Assignments to actually show the student — active phase's if the student has adopted phases, else everything (legacy). */
export async function getActivePhaseAssignments(studentUid) {
  const assignments = await getStudentAssignments(studentUid, { activeOnly: true });
  let activePhase = null;
  try {
    activePhase = await getActivePhase(studentUid);
  } catch (err) {
    // Phases subcollection may not exist / rules not published yet for this
    // student — fall back to showing everything, same as before phases existed.
    console.error('getActivePhase failed, showing all active assignments:', err);
    return assignments;
  }
  if (!activePhase) return assignments;
  return assignments.filter((a) => a.phaseId === activePhase.id);
}

/**
 * First-time adoption: wraps every existing assignment into a new
 * "Phase 1", without touching any assignment content — purely a
 * grouping/labeling operation.
 */
export async function createFirstPhase(studentUid, { name, notes = '' }) {
  const phaseRef = doc(collection(db, 'students', studentUid, 'phases'));
  const assignments = await getStudentAssignments(studentUid, { activeOnly: false });

  const batch = writeBatch(db);
  batch.set(phaseRef, {
    name, notes, status: 'active', order: 1,
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
export async function createNextPhase(studentUid, { name, notes = '' }) {
  const activePhase = await getActivePhase(studentUid);
  if (!activePhase) throw new Error('Học viên chưa có Phase nào đang active.');
  const allAssignments = await getStudentAssignments(studentUid, { activeOnly: false });
  const activeAssignments = allAssignments.filter((a) => a.phaseId === activePhase.id && a.active !== false);

  const newPhaseRef = doc(collection(db, 'students', studentUid, 'phases'));
  const batch = writeBatch(db);
  batch.set(newPhaseRef, {
    name, notes, status: 'active', order: (activePhase.order || 1) + 1,
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

// ------------------------------------------------------------
// Sessions (workout logs) + the autoregulation transaction
// ------------------------------------------------------------

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

export async function logSessionAndAdvance(studentUid, { dayLabel, performedAt, clientNote = '', durationSeconds = null, exerciseEntries, sessionId = null }) {
  if (!Array.isArray(exerciseEntries) || exerciseEntries.length === 0) {
    throw new Error('Buổi tập cần có ít nhất 1 bài đã hoàn thành.');
  }
  if (exerciseEntries.some((entry) => !Array.isArray(entry.actualSets) || entry.actualSets.length === 0)) {
    throw new Error('Không thể ghi nhận bài tập chưa hoàn thành set nào.');
  }
  if (exerciseEntries.some((entry) => entry.source === 'extra' ? !entry.exerciseId : !entry.assignmentId)) {
    throw new Error('Dữ liệu bài tập trong buổi không hợp lệ.');
  }
  const entryKeys = exerciseEntries.map((entry) => entry.source === 'extra'
    ? `extra:${entry.exerciseId}`
    : `assigned:${entry.assignmentId}`
  );
  if (new Set(entryKeys).size !== entryKeys.length) {
    throw new Error('Một bài tập đang bị thêm trùng trong buổi.');
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
    // All reads must happen before any writes in a Firestore transaction.
    const sessionSnap = await tx.get(sessionRef);
    const entrySnaps = await Promise.all(entryRefs.map((ref) => tx.get(ref)));
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
        const schemeParams = stored?.schemeParams || exercise.defaultParams;
        const state = stored?.state || createInitialExtraState(exercise, entry.actualSets);
        const planned = getInitialPrescription({ scheme, schemeParams, state });
        const advanced = advanceSessionExercise({
          scheme, schemeParams, state, actualSets: entry.actualSets,
          adjustedSetCount: entry.adjustedSetCount || planned.sets,
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
          isPR: isNewPR,
          prAfter,
        });
        tx.set(entryRefs[i], {
          exerciseId: exercise.exerciseId,
          exerciseNameSnapshot: { vi: exercise.nameVi },
          scheme,
          schemeParams,
          state: {
            ...advanced.nextState,
            lastOutcome: advanced.outcome,
            lastSessionId: sessionRef.id,
            lastUpdatedAt: serverTimestamp(),
            prWeight: prAfter.weight,
            prReps: prAfter.reps,
          },
          updatedAt: serverTimestamp(),
        }, { merge: true });
        return;
      }

      if (!snap.exists()) throw new Error(`Assignment ${entry.assignmentId} not found`);
      const assignment = snap.data();

      const planned = getInitialPrescription({
        scheme: assignment.scheme, schemeParams: assignment.schemeParams, state: assignment.state,
      });

      if (entry.substitutedExerciseId) {
        // Student swapped in a different exercise for this session only (e.g. equipment
        // unavailable). Log what actually happened for the coach's records, but the numbers
        // are for a different movement — don't feed them into this assignment's own
        // progression math, and don't touch its tracked state at all.
        exerciseLogs.push({
          assignmentId: entry.assignmentId,
          exerciseId: assignment.exerciseId,
          substitutedExerciseId: entry.substitutedExerciseId,
          source: 'substitute',
          scheme: assignment.scheme,
          planned,
          plannedSetCount: planned.sets,
          adjustedSetCount: entry.adjustedSetCount || planned.sets,
          actualSets: entry.actualSets,
          resultBucket: 'Đổi bài tập cho buổi này — không tính vào tiến độ',
          outcome: 'sub',
          nextPrescription: planned,
        });
        outcomes.push({ assignmentId: entry.assignmentId, source: 'substitute', outcome: 'sub', nextPrescription: planned, substitutedExerciseId: entry.substitutedExerciseId });
        return;
      }

      const advanced = advanceSessionExercise({
        scheme: assignment.scheme,
        schemeParams: assignment.schemeParams,
        state: assignment.state,
        actualSets: entry.actualSets,
        adjustedSetCount: entry.adjustedSetCount || planned.sets,
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
        isPR: isNewPR,
      });
      outcomes.push({ assignmentId: entry.assignmentId, resultBucket, delta, outcome, nextPrescription, progressionHeld, isPR: isNewPR, prAfter });

      tx.update(entryRefs[i], {
        state: {
          ...nextState, lastOutcome: outcome, lastSessionId: sessionRef.id, lastUpdatedAt: serverTimestamp(),
          prWeight: prAfter.weight, prReps: prAfter.reps,
        },
        updatedAt: serverTimestamp(),
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
  const snap = await getDocs(query(col, orderBy('loggedAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
