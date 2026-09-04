import assert from 'node:assert/strict';
import { SCHEME } from '../progression-engine.js';
import { getExerciseById, groupExercisesByMuscleGroup } from '../exercise-seed-data.js';
import { buildCompletedExerciseEntries } from '../session-entry-utils.js';
import {
  advanceSessionExercise, createInitialExtraState, normalizeTechniqueChecks,
  techniqueChecksForState,
} from '../workout-session-utils.js';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
}

const params = {
  startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
  setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10,
  roundingIncrement: 5, restSeconds: 90,
};
const base = { workingWeight: 20, currentSets: 3, currentReps: 8, progressionStep: 1, progressionCycle: 0, consecutiveMisses: 0 };
const done = Array.from({ length: 3 }, (_, index) => ({ setIndex: index + 1, weight: 20, reps: 8, rir: 0 }));
const run = (state, checks, confirmed = checks.every(Boolean)) => advanceSessionExercise({
  scheme: SCHEME.SET_THEN_REP_INCREASE, schemeParams: params, state,
  actualSets: done, adjustedSetCount: 3, techniqueConfirmed: confirmed, techniqueChecks: checks,
});

const afterTwo = run(base, [true, true, false, false, false], false);
check('2/5 persists at technique step', () => {
  assert.equal(afterTwo.nextState.progressionStep, 1);
  assert.deepEqual(techniqueChecksForState(afterTwo.nextState), [true, true, false, false, false]);
});

const afterFour = run(afterTwo.nextState, [true, true, true, true, false], false);
check('2/5 can become 4/5', () => {
  assert.deepEqual(techniqueChecksForState(afterFour.nextState), [true, true, true, true, false]);
});

const afterUntick = run(afterFour.nextState, [true, false, true, true, false], false);
check('a saved point can be unticked later', () => {
  assert.deepEqual(techniqueChecksForState(afterUntick.nextState), [true, false, true, true, false]);
});

const afterFive = run(afterUntick.nextState, [true, true, true, true, true], true);
check('only 5/5 advances to set step', () => {
  assert.equal(afterFive.nextState.progressionStep, 2);
  assert.deepEqual(afterFive.nextState.techniqueChecklist, { cycle: 0, checks: [true, true, true, true, true] });
});

check('a later cycle starts with a blank active checklist', () => {
  assert.deepEqual(techniqueChecksForState({ ...afterFive.nextState, progressionStep: 1, progressionCycle: 1 }), [false, false, false, false, false]);
});

check('legacy and first-time states start blank', () => {
  assert.deepEqual(techniqueChecksForState(base), [false, false, false, false, false]);
  const exercise = getExerciseById('single_leg_leg_extension');
  assert.deepEqual(techniqueChecksForState(createInitialExtraState(exercise)), [false, false, false, false, false]);
});

check('updating one exercise does not mutate another state', () => {
  const other = { ...base, progressionCycle: 4 };
  run(base, [true, false, false, false, false], false);
  assert.deepEqual(other, { ...base, progressionCycle: 4 });
});

check('cancelled or failed saves cannot mutate the original state object', () => {
  const original = structuredClone(base);
  run(base, [true, true, true, false, false], false);
  assert.deepEqual(base, original);
});

check('session payload preserves the exact five answers', () => {
  const [entry] = buildCompletedExerciseEntries([{
    source: 'assigned', assignmentId: 'assignment-a', exerciseId: 'leg_extension',
    techniqueChecks: [true, false, true, false, true], techniqueConfirmed: false,
    plannedSetCount: 3, adjustedSetCount: 3,
    sets: [{ setIndex: 1, weight: 20, reps: 8, rir: 0, completed: true }],
  }]);
  assert.deepEqual(entry.techniqueChecks, [true, false, true, false, true]);
});

check('Training Max exercises never receive technique checklist state', () => {
  const result = advanceSessionExercise({
    scheme: SCHEME.LAST_SET_RIR,
    schemeParams: { intensityPct: 87.5, repsPerSet: 3, plannedSets: 3, targetRIR: 0, roundingIncrement: 2.5 },
    state: { trainingMax: 100, consecutiveMisses: 0 },
    actualSets: Array.from({ length: 3 }, (_, index) => ({ setIndex: index + 1, weight: 87.5, reps: 3, rir: 0 })),
    adjustedSetCount: 3, techniqueConfirmed: true, techniqueChecks: [true, true, true, true, true],
  });
  assert.equal(Object.hasOwn(result.nextState, 'techniqueChecklist'), false);
});

check('new library exercises use the requested categories and normal progression', () => {
  const extension = getExerciseById('single_leg_leg_extension');
  const press = getExerciseById('single_leg_leg_press');
  assert.deepEqual(
    [extension.nameVi, extension.muscleGroup, extension.videoUrl, extension.defaultScheme],
    ['Single-leg Leg Extension', 'Đùi trước', 'https://www.youtube.com/watch?v=82IuSLk5zNc', SCHEME.SET_THEN_REP_INCREASE],
  );
  assert.deepEqual(
    [press.nameVi, press.muscleGroup, press.videoUrl, press.defaultScheme],
    ['Single-leg Leg Press', 'Đùi sau & Mông', 'https://www.youtube.com/shorts/rjv2ESVb2rM', SCHEME.SET_THEN_REP_INCREASE],
  );
  const groups = groupExercisesByMuscleGroup();
  assert.equal(groups.get('Đùi trước').some((item) => item.exerciseId === extension.exerciseId), true);
  assert.equal(groups.get('Đùi sau & Mông').some((item) => item.exerciseId === press.exerciseId), true);
});

check('normalization always returns five boolean answers', () => {
  assert.deepEqual(normalizeTechniqueChecks([1, true, null, false, true, true]), [false, true, false, false, true]);
});

console.log(`TECHNIQUE_PROGRESS_OK ${passed} / ${passed} passed`);
