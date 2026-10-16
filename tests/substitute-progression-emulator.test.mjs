// A client swaps an exercise during a session: the substitute follows the original's
// mechanism and level with the weights the client chose, and keeping the swap carries that
// on in the programme. Runs the real data layer as the student, under the real rules, inside
// the Firestore Emulator with --experimental-vm-modules.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';
import { buildCompletedExerciseEntries } from '../session-entry-utils.js';
import { seedSubstituteLoad, substituteProgression } from '../exercise-swap-utils.js';
import { getExerciseById } from '../exercise-seed-data.js';
import { getInitialPrescription } from '../progression-engine.js';
import { advanceSessionExercise } from '../workout-session-utils.js';
import { PROGRAM_CHANGE } from '../workout-program-change-utils.js';

const STUDENT = 'student-swap';
const env = await initializeTestEnvironment({
  projectId: 'demo-david-training-program-substitute',
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

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}

const ASSIGNMENTS = {
  // Last-set RIR on a barbell row, swapped for machine rows (loaded → loaded).
  row: {
    exerciseId: 'barbell_row', exerciseNameSnapshot: { vi: 'Barbell Row' }, orderInDay: 1, scheme: 2,
    schemeParams: { intensityPct: 75, repsPerSet: 8, plannedSets: 4, targetRIR: 2, roundingIncrement: 2.5, restSeconds: 120, isBodyweight: false },
    state: { trainingMax: 100, consecutiveMisses: 0, prWeight: 75, prReps: 8 },
  },
  // Technique → sets → reps → load, at 5 × 10 on the reps step.
  step: {
    exerciseId: 'db_rows', exerciseNameSnapshot: { vi: 'DB Rows' }, orderInDay: 2, scheme: 8,
    schemeParams: { startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12, setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10, roundingIncrement: 2.5, restSeconds: 90, isBodyweight: false },
    state: { workingWeight: 30, currentSets: 5, currentReps: 10, progressionStep: 3, progressionCycle: 0, consecutiveMisses: 0 },
  },
  // A Training Max mechanism swapped for a bodyweight exercise: it cannot carry over.
  pulldown: {
    exerciseId: 'machine_lat_pulldowns', exerciseNameSnapshot: { vi: 'Machine Lat Pull-downs' }, orderInDay: 3, scheme: 2,
    schemeParams: { intensityPct: 75, repsPerSet: 10, plannedSets: 3, targetRIR: 2, roundingIncrement: 2.5, restSeconds: 90, isBodyweight: false },
    state: { trainingMax: 80, consecutiveMisses: 0 },
  },
};

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await firestore.setDoc(firestore.doc(db, 'coaches', 'coach-swap'), { displayName: 'David' });
    await firestore.setDoc(firestore.doc(db, 'students', STUDENT), { coachUid: 'coach-swap', clientCategory: 'online', displayName: 'Test Swap' });
    for (const [id, assignment] of Object.entries(ASSIGNMENTS)) {
      await firestore.setDoc(firestore.doc(db, 'students', STUDENT, 'assignments', id), {
        ...assignment, dayLabel: 'Pull', active: true, phaseId: null, note: '',
      });
    }
    // Machine rows' own memory from an earlier session as an added exercise.
    await firestore.setDoc(firestore.doc(db, 'students', STUDENT, 'extraExerciseStates', 'machine_rows'), {
      exerciseId: 'machine_rows', exerciseNameSnapshot: { vi: 'Machine Rows' }, scheme: 8,
      schemeParams: getExerciseById('machine_rows').defaultParams,
      state: { workingWeight: 50, currentSets: 3, currentReps: 8, progressionStep: 2, progressionCycle: 0, consecutiveMisses: 0 },
      updatedAt: firestore.serverTimestamp(),
    });
  });

  const studentDb = env.authenticatedContext(STUDENT).firestore();
  const student = await dataLayer(studentDb);
  const read = async (...path) => (await firestore.getDoc(firestore.doc(studentDb, 'students', STUDENT, ...path))).data();

  const rowSets = [
    { weight: 60, reps: 8, rir: 3, completed: true }, { weight: 60, reps: 8, rir: 3, completed: true },
    { weight: 60, reps: 8, rir: 3, completed: true }, { weight: 60, reps: 8, rir: 3, completed: true },
  ];
  const stepSets = Array.from({ length: 5 }, () => ({ weight: 22.5, reps: 10, rir: 1, completed: true }));
  const entries = buildCompletedExerciseEntries([
    { source: 'assigned', assignmentId: 'row', exerciseId: 'barbell_row', substitutedExerciseId: 'machine_rows', plannedSetCount: 4, adjustedSetCount: 4, sets: rowSets },
    { source: 'assigned', assignmentId: 'step', exerciseId: 'db_rows', substitutedExerciseId: 'chest_supported_row', plannedSetCount: 5, adjustedSetCount: 5, sets: stepSets },
    { source: 'assigned', assignmentId: 'pulldown', exerciseId: 'machine_lat_pulldowns', substitutedExerciseId: 'pull_up', plannedSetCount: 3, adjustedSetCount: 3,
      sets: Array.from({ length: 3 }, () => ({ weight: 0, reps: 8, rir: 2, completed: true })) },
    { source: 'extra', sessionExerciseId: 'extra:cable_face_pull:a', exerciseId: 'cable_face_pull', plannedSetCount: 3, adjustedSetCount: 3,
      sets: Array.from({ length: 3 }, () => ({ weight: 15, reps: 12, rir: 2, completed: true })) },
  ]);
  assert.equal(entries.length, 4);

  // What the engine should make of each carried substitute, worked out on its own.
  const expectedNext = (assignmentId, exerciseId, sets) => {
    const carried = substituteProgression({ ...ASSIGNMENTS[assignmentId] }, getExerciseById(exerciseId));
    const state = seedSubstituteLoad(carried, sets);
    return advanceSessionExercise({
      ...carried, state, actualSets: sets.map((set, index) => ({ setIndex: index + 1, weight: set.weight, reps: set.reps, rir: set.rir })),
      adjustedSetCount: getInitialPrescription({ ...carried, state }).sets,
    }).nextState;
  };

  const outcomes = await student.logSessionAndAdvance(STUDENT, {
    dayLabel: 'Pull', performedAt: new Date('2026-10-16T12:00:00Z'), durationSeconds: 3000,
    exerciseEntries: entries, sessionId: 'swap-1',
  });
  const session = await read('sessions', 'swap-1');
  const logFor = (assignmentId) => session.exerciseLogs.find((log) => log.assignmentId === assignmentId);

  await check('today the substitute follows the original\'s plan, with the weight the client chose', async () => {
    const row = logFor('row');
    assert.equal(row.scheme, 2, 'Last-set RIR, not the machine rows default (8)');
    assert.deepEqual([row.planned.weight, row.planned.sets, row.planned.reps], [60, 4, 8]);
    assert.equal(row.carriedProgression, true);
    assert.ok(Math.abs(row.carriedState.trainingMax - expectedNext('row', 'machine_rows', rowSets).trainingMax) < 1e-9);
    assert.ok(row.carriedState.trainingMax > 80, 'three reps in reserve against a target of two moves the Training Max up');
    const step = logFor('step');
    assert.equal(step.scheme, 8);
    assert.deepEqual([step.planned.sets, step.planned.reps, step.planned.weight], [5, 10, 22.5], 'the 5 × 10 level carried over');
    assert.deepEqual(step.carriedState, JSON.parse(JSON.stringify(expectedNext('step', 'chest_supported_row', stepSets))));
    assert.equal(step.carriedState.progressionStep, 4, 'the reps step was passed, so next comes the load');
    assert.deepEqual(outcomes.filter((item) => item.source === 'substitute').map((item) => item.carriedProgression), [true, true, false]);
  });

  await check('the original assignment and the substitute\'s own memory are left alone', async () => {
    assert.equal((await read('assignments', 'row')).state.trainingMax, 100);
    assert.equal((await read('assignments', 'row')).exerciseId, 'barbell_row');
    assert.equal((await read('assignments', 'step')).state.currentReps, 10);
    assert.equal((await read('extraExerciseStates', 'machine_rows')).state.workingWeight, 50, 'untouched');
    assert.equal(await read('extraExerciseStates', 'chest_supported_row'), undefined, 'never created');
  });

  await check('a mechanism that does not suit the substitute falls back to its own progression, as before', async () => {
    const pulldown = logFor('pulldown');
    assert.equal(pulldown.scheme, getExerciseById('pull_up').defaultScheme);
    assert.equal(pulldown.carriedProgression, undefined);
    assert.equal((await read('extraExerciseStates', 'pull_up')).scheme, getExerciseById('pull_up').defaultScheme);
  });

  const changes = [
    { type: PROGRAM_CHANGE.REPLACE, assignmentId: 'row', exerciseId: 'barbell_row', replacementExerciseId: 'machine_rows' },
    { type: PROGRAM_CHANGE.REPLACE, assignmentId: 'step', exerciseId: 'db_rows', replacementExerciseId: 'chest_supported_row' },
    { type: PROGRAM_CHANGE.REPLACE, assignmentId: 'pulldown', exerciseId: 'machine_lat_pulldowns', replacementExerciseId: 'pull_up' },
    { type: PROGRAM_CHANGE.ADD, exerciseId: 'cable_face_pull' },
  ];
  const keep = () => student.saveStudentProgramChanges(STUDENT, { dayLabel: 'Pull', phaseId: null, sessionId: 'swap-1', changes, firstAddedOrder: 4 });
  await keep();

  await check('keeping the swap keeps the original\'s mechanism, settings and level, from today\'s weights', async () => {
    const row = await read('assignments', 'row');
    assert.equal(row.exerciseId, 'machine_rows');
    assert.equal(row.scheme, 2);
    assert.deepEqual(row.schemeParams, { ...ASSIGNMENTS.row.schemeParams, isBodyweight: false }, 'rest 120 s, 4 × 8 at RIR 2: David\'s settings, not the library\'s');
    assert.equal(row.state.trainingMax, logFor('row').carriedState.trainingMax);
    assert.deepEqual([row.state.lastSessionId, row.state.prWeight, row.state.prReps], ['swap-1', 60, 8], 'the old 75 kg record belongs to the barbell row');
    assert.ok(getInitialPrescription(row).weight >= 60, 'next time starts from the weight the client used');
    const step = await read('assignments', 'step');
    assert.equal(step.exerciseId, 'chest_supported_row');
    assert.equal(step.schemeParams.roundingIncrement, 2.5, 'not the library\'s 5');
    for (const key of ['workingWeight', 'currentSets', 'currentReps', 'progressionStep', 'progressionCycle']) {
      assert.equal(step.state[key], logFor('step').carriedState[key], key);
    }
    assert.equal(step.volumeConfig.techniqueReady, false);
  });

  await check('a swap whose mechanism could not carry over keeps the substitute\'s own progression, as before', async () => {
    const pulldown = await read('assignments', 'pulldown');
    const memory = await read('extraExerciseStates', 'pull_up');
    assert.equal(pulldown.exerciseId, 'pull_up');
    assert.equal(pulldown.scheme, memory.scheme);
    assert.equal(pulldown.state.currentReps, memory.state.currentReps);
  });

  await check('an added exercise still starts from its own defaults and the client\'s weights', async () => {
    const added = await read('assignments', 'session-swap-1-cable_face_pull');
    assert.equal(added.scheme, getExerciseById('cable_face_pull').defaultScheme);
    assert.equal(added.state.workingWeight, (await read('extraExerciseStates', 'cable_face_pull')).state.workingWeight);
    assert.equal(added.studentCreated, true);
  });

  await check('saving the same change again changes nothing', async () => {
    const before = await read('assignments', 'row');
    await keep();
    assert.deepEqual((await read('assignments', 'row')).state.trainingMax, before.state.trainingMax);
  });

  await check('a session saved before this change (no carried state in its log) still keeps the original\'s plan', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await firestore.setDoc(firestore.doc(db, 'students', STUDENT, 'assignments', 'legacy'), {
        exerciseId: 'cable_curl', exerciseNameSnapshot: { vi: 'Cable Curl' }, dayLabel: 'Arms', orderInDay: 1, scheme: 4,
        schemeParams: { plannedSets: 3, repsPerSet: 12, weightIncreasePct: 3, roundingIncrement: 1, restSeconds: 75, isBodyweight: false },
        state: { workingWeight: 25, consecutiveMisses: 0 }, active: true, phaseId: null, note: '',
      });
      await firestore.setDoc(firestore.doc(db, 'students', STUDENT, 'sessions', 'legacy-1'), {
        studentUid: STUDENT, dayLabel: 'Arms', performedAt: new Date('2026-10-01T12:00:00Z'), clientNote: '', coachNote: '',
        durationSeconds: 1800, loggedAt: new Date('2026-10-01T13:00:00Z'), performedAssignmentIds: ['legacy'], performedExerciseIds: ['preacher_curl'],
        exerciseLogs: [{ assignmentId: 'legacy', exerciseId: 'cable_curl', substitutedExerciseId: 'preacher_curl', source: 'substitute', scheme: 8,
          actualSets: [{ setIndex: 1, weight: 30, reps: 12, rir: 2 }, { setIndex: 2, weight: 30, reps: 12, rir: 2 }] }],
      });
    });
    assert.ok(getExerciseById('preacher_curl'), 'fixture exercise exists');
    await student.saveStudentProgramChanges(STUDENT, {
      dayLabel: 'Arms', phaseId: null, sessionId: 'legacy-1', firstAddedOrder: 2,
      changes: [{ type: PROGRAM_CHANGE.REPLACE, assignmentId: 'legacy', exerciseId: 'cable_curl', replacementExerciseId: 'preacher_curl' }],
    });
    const legacy = await read('assignments', 'legacy');
    assert.equal(legacy.exerciseId, 'preacher_curl');
    assert.equal(legacy.scheme, 4, 'classic overload, as David set it');
    assert.equal(legacy.schemeParams.repsPerSet, 12);
    assert.equal(legacy.state.workingWeight, 30, 'the weight used that day');
  });

  console.log(`SUBSTITUTE_PROGRESSION_EMULATOR_OK ${passed} / 8 passed`);
} finally {
  await env.cleanup();
}
