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
  runTransaction, serverTimestamp,
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
export async function createAssignment(studentUid, { exerciseId, exerciseNameSnapshot, dayLabel, orderInDay, scheme, schemeParams, initialState }) {
  const state = { consecutiveMisses: 0, lastSessionId: null, ...initialState, lastUpdatedAt: serverTimestamp() };
  // Sanity-check that the engine can actually produce a first
  // prescription from this state before persisting it.
  getInitialPrescription({ scheme, schemeParams, state });

  return addDoc(collection(db, 'students', studentUid, 'assignments'), {
    exerciseId, exerciseNameSnapshot, dayLabel, orderInDay: orderInDay ?? 0,
    scheme, schemeParams, state,
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
export async function updateAssignmentExercise(studentUid, assignmentId, { exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay, initialState }) {
  const state = { consecutiveMisses: 0, lastSessionId: null, lastOutcome: null, ...initialState, lastUpdatedAt: serverTimestamp() };
  getInitialPrescription({ scheme, schemeParams, state }); // sanity-check before persisting
  await updateDoc(doc(db, 'students', studentUid, 'assignments', assignmentId), {
    exerciseId, exerciseNameSnapshot, scheme, schemeParams, dayLabel, orderInDay,
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
export async function logSessionAndAdvance(studentUid, { dayLabel, performedAt, clientNote = '', exerciseEntries }) {
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
      const { nextPrescription, nextState, resultBucket, delta } = calculateNextPrescription({
        scheme: assignment.scheme,
        schemeParams: assignment.schemeParams,
        state: assignment.state,
        lastLog: { actualSets: entry.actualSets },
      });
      const outcome = classifyOutcome(assignment.scheme, delta);

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
      });
      outcomes.push({ assignmentId: entry.assignmentId, resultBucket, delta, outcome, nextPrescription });

      tx.update(assignmentRefs[i], {
        state: { ...nextState, lastOutcome: outcome, lastSessionId: sessionRef.id, lastUpdatedAt: serverTimestamp() },
        updatedAt: serverTimestamp(),
      });
    });

    tx.set(sessionRef, {
      dayLabel, performedAt, clientNote, coachNote: '',
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
// Program meta (session count/day labels — display-only in Phase 1)
// ------------------------------------------------------------

export async function getProgramMeta(studentUid) {
  const snap = await getDoc(doc(db, 'students', studentUid, 'programMeta', 'current'));
  return snap.exists() ? snap.data() : null;
}

export async function setProgramMeta(studentUid, meta) {
  await setDoc(doc(db, 'students', studentUid, 'programMeta', 'current'), meta, { merge: true });
}
