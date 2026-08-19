// Run with Firestore Emulator plus @firebase/rules-unit-testing and firebase installed.
// This repository intentionally has no package.json; keep test dependencies outside the
// production root so Vercel continues treating the app as a static site.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-training-program';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(context.firestore(), 'students', 'student-1'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(context.firestore(), 'students', 'student-2'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'phases', 'phase-active'), { status: 'active' });
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'phases', 'phase-old'), { status: 'completed' });
    const assignmentBase = {
      exerciseId: 'bench_press', exerciseNameSnapshot: { vi: 'Bench Press' }, dayLabel: 'A', orderInDay: 1,
      scheme: 2, schemeParams: { restSeconds: 120 }, state: { trainingMax: 80 }, phaseId: 'phase-active',
      note: '', active: true,
    };
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'assignments', 'assignment-replace'), assignmentBase);
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'assignments', 'assignment-remove'), {
      ...assignmentBase, exerciseId: 'lat_pulldown', exerciseNameSnapshot: { vi: 'Lat Pulldown' }, orderInDay: 2,
    });
  });

  const ownDb = env.authenticatedContext('student-1').firestore();
  const otherDb = env.authenticatedContext('student-2').firestore();
  const coachDb = env.authenticatedContext('coach-1').firestore();
  const ownState = doc(ownDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows');

  await assertSucceeds(setDoc(ownState, { exerciseId: 'machine_rows', state: { workingWeight: 30 } }));
  await assertSucceeds(getDoc(ownState));
  await assertSucceeds(updateDoc(ownState, { state: { workingWeight: 35 } }));
  await assertFails(updateDoc(ownState, { exerciseId: 'bayesian_curls' }));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows')));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'extraExerciseStates', 'bayesian_curls'), { exerciseId: 'bayesian_curls' }));
  await assertFails(deleteDoc(ownState));

  const sessionRef = doc(ownDb, 'students', 'student-1', 'sessions', 'fixed-session-id');
  await assertSucceeds(setDoc(sessionRef, { dayLabel: 'A', exerciseLogs: [] }));
  await assertFails(setDoc(sessionRef, { dayLabel: 'A', exerciseLogs: [] }));

  const replacementRef = doc(ownDb, 'students', 'student-1', 'assignments', 'assignment-replace');
  await assertSucceeds(updateDoc(replacementRef, {
    exerciseId: 'machine_rows', exerciseNameSnapshot: { vi: 'Machine Rows' }, scheme: 8,
    schemeParams: { restSeconds: 90 }, state: { workingWeight: 30 }, volumeConfig: { credits: [] },
    sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(replacementRef, {
    dayLabel: 'B', sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(otherDb, 'students', 'student-1', 'assignments', 'assignment-replace'), {
    exerciseId: 'bayesian_curls', sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));

  const removeRef = doc(ownDb, 'students', 'student-1', 'assignments', 'assignment-remove');
  await assertSucceeds(updateDoc(removeRef, {
    active: false, sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertFails(deleteDoc(removeRef));

  const addedRef = doc(ownDb, 'students', 'student-1', 'assignments', 'student-added');
  const studentAdded = {
    exerciseId: 'bayesian_curls', exerciseNameSnapshot: { vi: 'Bayesian Curls' }, dayLabel: 'A', orderInDay: 3,
    scheme: 8, schemeParams: { restSeconds: 90 }, state: { workingWeight: 10 }, phaseId: 'phase-active',
    note: '', volumeConfig: { credits: [] }, active: true, studentCreated: true,
    sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(addedRef, studentAdded));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'assignments', 'student-added-old-phase'), {
    ...studentAdded, phaseId: 'phase-old',
  }));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'assignments', 'student-added-fake-session'), {
    ...studentAdded, sourceSessionId: 'missing-session',
  }));

  const workoutDraft = doc(ownDb, 'students', 'student-1', 'workoutDrafts', 'active');
  await assertSucceeds(setDoc(workoutDraft, {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'draft-session-1', exercises: [], revision: 1,
  }));
  await assertSucceeds(getDoc(workoutDraft));
  await assertSucceeds(updateDoc(workoutDraft, { revision: 2 }));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'workoutDrafts', 'active'), {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'foreign', exercises: [], revision: 1,
  }));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'workoutDrafts', 'other'), {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'wrong-id', exercises: [], revision: 1,
  }));
  await assertSucceeds(getDoc(doc(coachDb, 'students', 'student-1', 'workoutDrafts', 'active')));
  await assertSucceeds(deleteDoc(workoutDraft));

  const volumeCheckIn = doc(ownDb, 'students', 'student-1', 'checkIns', 'volume-2026-w33');
  await assertSucceeds(setDoc(volumeCheckIn, {
    type: 'volume-recovery', muscleRecovery: { 'Ngực': 4 }, fatigue: 2, jointPain: 0, performance: 2,
  }));
  await assertSucceeds(getDoc(volumeCheckIn));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'checkIns', 'volume-2026-w33')));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'checkIns', 'foreign-volume'), { type: 'volume-recovery' }));
  await assertSucceeds(getDoc(doc(coachDb, 'students', 'student-1', 'checkIns', 'volume-2026-w33')));

  const coachState = doc(coachDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows');
  await assertSucceeds(updateDoc(coachState, { state: { workingWeight: 37.5 } }));
  await assertSucceeds(deleteDoc(coachState));
  assert.equal((await getDoc(coachState)).exists(), false);
  console.log('FIRESTORE_RULES_OK 31 / 31 passed');
} finally {
  await env.cleanup();
}
