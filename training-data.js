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
import { getInitialPrescription, calculateNextPrescription, classifyOutcome } from './progression-engine.js';

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
export async function createStudentProfile(studentUid, { displayName, email, notes = '' }, coachUid) {
  await setDoc(doc(db, 'students', studentUid), {
    displayName, email, coachUid, notes,
    role: 'student',
    unitPref: 'kg',
    localePref: 'vi',
    active: true,
    createdAt: serverTimestamp(),
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

export async function logSessionAndAdvance(studentUid, { dayLabel, performedAt, clientNote = '', durationSeconds = null, exerciseEntries }) {
  const sessionRef = doc(collection(db, 'students', studentUid, 'sessions'));

  const results = await runTransaction(db, async (tx) => {
    const assignmentRefs = exerciseEntries.map((e) =>
      doc(db, 'students', studentUid, 'assignments', e.assignmentId)
    );
    // All reads must happen before any writes in a Firestore transaction.
    const assignmentSnaps = await Promise.all(assignmentRefs.map((ref) => tx.get(ref)));

    const exerciseLogs = [];
    const outcomes = [];

    assignmentSnaps.forEach((snap, i) => {
      if (!snap.exists()) throw new Error(`Assignment ${exerciseEntries[i].assignmentId} not found`);
      const assignment = snap.data();
      const entry = exerciseEntries[i];

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
          scheme: assignment.scheme,
          planned,
          actualSets: entry.actualSets,
          resultBucket: 'Đổi bài tập cho buổi này — không tính vào tiến độ',
          outcome: 'sub',
          nextPrescription: planned,
        });
        outcomes.push({ assignmentId: entry.assignmentId, outcome: 'sub', nextPrescription: planned, substitutedExerciseId: entry.substitutedExerciseId });
        return;
      }

      const { nextPrescription, nextState, resultBucket, delta } = calculateNextPrescription({
        scheme: assignment.scheme,
        schemeParams: assignment.schemeParams,
        state: assignment.state,
        lastLog: { actualSets: entry.actualSets },
      });
      const outcome = classifyOutcome(assignment.scheme, delta);

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
        actualSets: entry.actualSets,
        resultBucket,
        delta,
        outcome,
        nextPrescription,
        isPR: isNewPR,
      });
      outcomes.push({ assignmentId: entry.assignmentId, resultBucket, delta, outcome, nextPrescription, isPR: isNewPR, prAfter });

      tx.update(assignmentRefs[i], {
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
// Program meta (session count/day labels — display-only in Phase 1)
// ------------------------------------------------------------

export async function getProgramMeta(studentUid) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'programMeta', 'current'));
  return snap.exists() ? snap.data() : null;
}

export async function setProgramMeta(studentUid, meta) {
  await setDoc(doc(db, 'students', studentUid, 'programMeta', 'current'), meta, { merge: true });
}
