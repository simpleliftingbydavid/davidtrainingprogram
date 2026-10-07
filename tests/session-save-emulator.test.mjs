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
  await env.clearFirestore();
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
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'rtf-lift'), {
      exerciseId: 'deadlift', exerciseNameSnapshot: { vi: 'BB Conventional Deadlift' },
      dayLabel: 'Upper', orderInDay: 3, scheme: 3,
      schemeParams: { intensityPct: 70, plannedSets: 3, repsPerSet: 5, repOutTarget: 8, roundingIncrement: 2.5, restSeconds: 150, failureStandard: 'zero_rir' },
      state: { trainingMax: 120, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'classic-accessory'), {
      exerciseId: 'cable_curl', exerciseNameSnapshot: { vi: 'Cable Curl' },
      dayLabel: 'Upper', orderInDay: 4, scheme: 4,
      schemeParams: { plannedSets: 2, repsPerSet: 10, weightIncreasePct: 3, roundingIncrement: 1, restSeconds: 90 },
      state: { workingWeight: 20, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'original-lift'), {
      exerciseId: 'weighted_dips', exerciseNameSnapshot: { vi: 'Weighted Dips' },
      dayLabel: 'Upper', orderInDay: 5, scheme: 1,
      schemeParams: { intensityPct: 70, repsPerSet: 5, targetRIR: 2, lowerSets: 4, upperSets: 6, roundingIncrement: 2.5, restSeconds: 120 },
      state: { trainingMax: 100, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'fixed-total'), {
      exerciseId: 'machine_lat_pulldowns', exerciseNameSnapshot: { vi: 'Machine Lat Pull-downs' },
      dayLabel: 'Upper', orderInDay: 6, scheme: 5,
      schemeParams: { plannedSets: 3, totalRepsTarget: 40, weightIncreasePct: 3, roundingIncrement: 2.5, restSeconds: 90 },
      state: { workingWeight: 40, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'reverse-pyramid'), {
      exerciseId: 'barbell_curl', exerciseNameSnapshot: { vi: 'Barbell Curl' },
      dayLabel: 'Upper', orderInDay: 7, scheme: 6,
      schemeParams: { setTargets: [6, 10, 12], weightIncreasePct: 3, roundingIncrement: 2.5, restSeconds: 90 },
      state: { setWeights: [80, 70, 60], workingWeight: 80, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
    });
    await firestore.setDoc(firestore.doc(db, 'students', 'student-save', 'assignments', 'rep-increase'), {
      exerciseId: 'bw_bicep_curl', exerciseNameSnapshot: { vi: 'BW Bicep Curl' },
      dayLabel: 'Upper', orderInDay: 8, scheme: 7,
      schemeParams: { startingSets: 4, endingSets: 6, startingReps: 8, repIncreaseStep: 1, isBodyweight: true, progressionMode: 'reps_sets_only', restSeconds: 90 },
      state: { workingWeight: 0, currentSets: 6, currentReps: 8, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
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
    {
      source: 'assigned', assignmentId: 'rtf-lift', exerciseId: 'deadlift', plannedSetCount: 3, adjustedSetCount: 3,
      stage5: { failureStandard: 'zero_rir', singleAt8: { weight: 105, rpe: 8, percentage: 87.5, useForDailyLoad: false } },
      sets: [{ weight: 85, reps: 5, rir: 0, completed: true }, { weight: 85, reps: 5, rir: 0, completed: true }, { weight: 85, reps: 10, rir: 0, completed: true }],
    },
    {
      source: 'assigned', assignmentId: 'classic-accessory', exerciseId: 'cable_curl', plannedSetCount: 2, adjustedSetCount: 2,
      sets: [{ weight: 20, reps: 10, rir: 0, completed: true }, { weight: 20, reps: 10, rir: 0, completed: true }],
    },
    {
      source: 'assigned', assignmentId: 'original-lift', exerciseId: 'weighted_dips', plannedSetCount: 6, adjustedSetCount: 4,
      sets: Array.from({ length: 4 }, () => ({ weight: 70, reps: 5, rir: 0, completed: true })),
    },
    {
      source: 'assigned', assignmentId: 'fixed-total', exerciseId: 'machine_lat_pulldowns', plannedSetCount: 3, adjustedSetCount: 3,
      sets: [{ weight: 40, reps: 15, rir: 0, completed: true }, { weight: 40, reps: 13, rir: 0, completed: true }, { weight: 40, reps: 12, rir: 0, completed: true }],
    },
    {
      source: 'assigned', assignmentId: 'reverse-pyramid', exerciseId: 'barbell_curl', plannedSetCount: 3, adjustedSetCount: 3,
      sets: [{ weight: 80, reps: 6, rir: 0, completed: true }, { weight: 70, reps: 9, rir: 0, completed: true }, { weight: 60, reps: 12, rir: 0, completed: true }],
    },
    {
      source: 'assigned', assignmentId: 'rep-increase', exerciseId: 'bw_bicep_curl', plannedSetCount: 6, adjustedSetCount: 6,
      sets: Array.from({ length: 6 }, () => ({ weight: 0, reps: 8, rir: 0, completed: true })),
    },
  ]);

  assert.ok(entries.every((entry) => Array.isArray(entry.techniqueChecks)));
  const input = {
    dayLabel: 'Upper', performedAt: new Date('2026-09-15T12:00:00Z'),
    durationSeconds: 2700, exerciseEntries: entries, sessionId: 'save-regression',
  };
  const first = await student.logSessionAndAdvance('student-save', input);
  const retry = await student.logSessionAndAdvance('student-save', input);
  assert.equal(first.length, 8);
  assert.equal(retry.length, 8);

  const session = await firestore.getDoc(firestore.doc(studentDb, 'students', 'student-save', 'sessions', 'save-regression'));
  assert.equal(session.exists(), true);
  assert.equal(session.data().exerciseLogs.length, 8);
  assert.ok(session.data().exerciseLogs.every((log) => Array.isArray(log.techniqueChecks) && log.techniqueChecks.length === 5));
  assert.equal(session.data().exerciseLogs.find((log) => log.assignmentId === 'rtf-lift').stage5.failureStandard, 'zero_rir');
  const original = await firestore.getDoc(firestore.doc(studentDb, 'students', 'student-save', 'assignments', 'original-lift'));
  const fixed = await firestore.getDoc(firestore.doc(studentDb, 'students', 'student-save', 'assignments', 'fixed-total'));
  const reverse = await firestore.getDoc(firestore.doc(studentDb, 'students', 'student-save', 'assignments', 'reverse-pyramid'));
  const repIncrease = await firestore.getDoc(firestore.doc(studentDb, 'students', 'student-save', 'assignments', 'rep-increase'));
  assert.equal(original.data().state.trainingMax, 100);
  assert.equal(fixed.data().state.workingWeight, 42.5);
  assert.deepEqual(reverse.data().state.setWeights, [82.5, 70, 62.5]);
  assert.equal(repIncrease.data().state.currentSets, 4);
  assert.equal(repIncrease.data().state.currentReps, 9);
  const sessions = await firestore.getDocs(firestore.collection(studentDb, 'students', 'student-save', 'sessions'));
  assert.equal(sessions.size, 1, 'retry must not create a duplicate session');
  console.log('SESSION_SAVE_EMULATOR_OK 14 / 14 passed');
} finally {
  await env.cleanup();
}
