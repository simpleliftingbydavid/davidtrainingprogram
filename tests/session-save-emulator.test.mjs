// End-to-end regression for the student save transaction. Run inside the
// Firestore Emulator with --experimental-vm-modules.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';
import { buildCompletedExerciseEntries } from '../session-entry-utils.js';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-training-program-session-save',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
});

async function dataLayer(db) {
  const module = new vm.SourceTextModule(readFileSync(new URL('../training-data.js', import.meta.url), 'utf8'));
  await module.link(async (specifier) => {
    const exports = specifier.startsWith('https:')
      ? firestore
      : specifier === './firebase-init.js'
        ? { db }
        : await import(new URL(`../${specifier}`, import.meta.url));
    return new vm.SyntheticModule(Object.keys(exports), function expose() {
      Object.entries(exports).forEach(([key, value]) => this.setExport(key, value));
    });
  });
  await module.evaluate();
  return module.namespace;
}

try {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await firestore.setDoc(firestore.doc(db, 'coaches', 'coach-save'), { displayName: 'David' });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save'), {
      coachUid: 'coach-save', clientCategory: 'online', displayName: 'Test Save',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'accessory'), {
      exerciseId: 'machine_rows', exerciseNameSnapshot: { vi: 'Machine Rows' },
      dayLabel: 'Upper', orderInDay: 1, scheme: 8,
      schemeParams: { startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12, setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 5, roundingIncrement: 2.5, restSeconds: 90 },
      state: { workingWeight: 40, currentSets: 3, currentReps: 8, progressionStep: 1, progressionCycle: 0, consecutiveMisses: 0 },
      active: true, phaseId: null, note: '',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'main-lift'), {
      exerciseId: 'bench_press', exerciseNameSnapshot: { vi: 'BB Bench Press' },
      dayLabel: 'Upper', orderInDay: 2, scheme: 2,
      schemeParams: { intensityPct: 75, plannedSets: 3, repsPerSet: 6, targetRIR: 2, roundingIncrement: 2.5, restSeconds: 120 },
      state: { trainingMax: 80, consecutiveMisses: 0 },
      active: true, phaseId: null, note: '',
    });
  });

  const studentDb = env.authenticatedContext('student-save').firestore();
  const student = await dataLayer(studentDb);
  const entries = buildCompletedExerciseEntries([
    {
      source: 'assigned', assignmentId: 'accessory', exerciseId: 'machine_rows',
      plannedSetCount: 3, adjustedSetCount: 3,
      sets: Array.from({ length: 3 }, (_, index) => ({ setIndex: index + 1, weight: 40, reps: 8, rir: 0, completed: true })),
    },
    {
      source: 'assigned', assignmentId: 'main-lift', exerciseId: 'bench_press',
      plannedSetCount: 3, adjustedSetCount: 3,
      sets: Array.from({ length: 3 }, (_, index) => ({ setIndex: index + 1, weight: 60, reps: 6, rir: 2, completed: true })),
    },
  ]);

  assert.ok(entries.every((entry) => Array.isArray(entry.techniqueChecks)));
  const input = {
    dayLabel: 'Upper', performedAt: new Date('2026-09-15T12:00:00Z'),
    durationSeconds: 2700, exerciseEntries: entries, sessionId: 'save-regression',
  };
  const first = await student.logSessionAndAdvance('student-save', input);
  const retry = await student.logSessionAndAdvance('student-save', input);
  assert.equal(first.length, 2);
  assert.equal(retry.length, 2);

  const session = await firestore.getDoc(firestore.doc(studentDb, 'students', 'student-save', 'sessions', 'save-regression'));
  assert.equal(session.exists(), true);
  assert.equal(session.data().exerciseLogs.length, 2);
  assert.ok(session.data().exerciseLogs.every((log) => Array.isArray(log.techniqueChecks) && log.techniqueChecks.length === 5));
  const sessions = await firestore.getDocs(firestore.collection(studentDb, 'students', 'student-save', 'sessions'));
  assert.equal(sessions.size, 1, 'retry must not create a duplicate session');
  console.log('SESSION_SAVE_EMULATOR_OK 8 / 8 passed');
} finally {
  await env.cleanup();
}
