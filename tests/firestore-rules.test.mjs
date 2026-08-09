// Run with Firestore Emulator plus @firebase/rules-unit-testing and firebase installed.
// This repository intentionally has no package.json; keep test dependencies outside the
// production root so Vercel continues treating the app as a static site.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const projectId = 'demo-david-training-program';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(context.firestore(), 'students', 'student-1'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(context.firestore(), 'students', 'student-2'), { coachUid: 'coach-1', clientCategory: 'online' });
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

  const coachState = doc(coachDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows');
  await assertSucceeds(updateDoc(coachState, { state: { workingWeight: 37.5 } }));
  await assertSucceeds(deleteDoc(coachState));
  assert.equal((await getDoc(coachState)).exists(), false);
  console.log('FIRESTORE_RULES_OK 11 / 11 passed');
} finally {
  await env.cleanup();
}
