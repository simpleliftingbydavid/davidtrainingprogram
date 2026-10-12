// Run with:  node tests/exercise-swap.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carriedSchemeForSwap, schemeFitsExercise } from '../exercise-swap-utils.js';
import { getExerciseById } from '../exercise-seed-data.js';
import { PROGRESSION_MODE, SCHEME } from '../progression-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const squat = getExerciseById('squat');                 // barbell, scheme 2
const legPress = getExerciseById('leg_press');          // machine, scheme 8
const pullUp = getExerciseById('pull_up');              // bodyweight, scheme 8
const nordic = getExerciseById('nordic_curl');          // bodyweight, scheme 8, still adds load
const bwCurl = getExerciseById('bw_bicep_curl');        // bodyweight, sets and reps only
const weightedPullUp = getExerciseById('weighted_pull_up');

const rirAssignment = {
  id: 'a1', exerciseId: 'squat', scheme: SCHEME.LAST_SET_RIR,
  schemeParams: { intensityPct: 82.5, repsPerSet: 5, plannedSets: 4, targetRIR: 1, roundingIncrement: 2.5, restSeconds: 150, isBodyweight: false },
  state: { trainingMax: 140, consecutiveMisses: 1 },
};

check('swapping one loaded exercise for another keeps the mechanism and every setting, but not the progress', () => {
  const carried = carriedSchemeForSwap(rirAssignment, legPress);
  assert.equal(carried.scheme, SCHEME.LAST_SET_RIR, 'not the leg press default (8)');
  assert.deepEqual(
    [carried.schemeParams.intensityPct, carried.schemeParams.repsPerSet, carried.schemeParams.plannedSets, carried.schemeParams.targetRIR, carried.schemeParams.restSeconds],
    [82.5, 5, 4, 1, 150],
  );
  assert.equal(carried.state, null, 'the Training Max belongs to the old exercise');
});

check('the assignment given in is never changed', () => {
  const before = JSON.stringify(rirAssignment);
  carriedSchemeForSwap(rirAssignment, legPress);
  assert.equal(JSON.stringify(rirAssignment), before);
});

check('a mechanism that cannot work for the new exercise falls back to the exercise defaults', () => {
  assert.equal(carriedSchemeForSwap(rirAssignment, pullUp), null, 'a Training Max scheme has no meaning on a bodyweight exercise');
  const repIncrease = { ...rirAssignment, scheme: SCHEME.REP_INCREASE, schemeParams: { startingSets: 4, endingSets: 6 } };
  assert.equal(carriedSchemeForSwap(repIncrease, squat), null, 'Rep Increase is for bodyweight work only');
  assert.equal(carriedSchemeForSwap(null, squat), null);
  assert.equal(carriedSchemeForSwap({ ...rirAssignment, schemeParams: null }, squat), null);
});

check('which mechanisms fit which exercises', () => {
  assert.equal(schemeFitsExercise(SCHEME.SET_THEN_REP_INCREASE, pullUp), true);
  assert.equal(schemeFitsExercise(SCHEME.SET_THEN_REP_INCREASE, squat), true);
  assert.equal(schemeFitsExercise(SCHEME.REP_INCREASE, pullUp), true);
  assert.equal(schemeFitsExercise(SCHEME.REP_INCREASE, squat), false);
  for (const scheme of [1, 2, 3, 4, 5, 6]) {
    assert.equal(schemeFitsExercise(scheme, squat), true);
    assert.equal(schemeFitsExercise(scheme, pullUp), false);
  }
  assert.equal(schemeFitsExercise(SCHEME.LAST_SET_RIR, weightedPullUp), true, 'weighted pull-ups carry a load');
});

const stepAssignment = (params, extra = {}) => ({
  id: 'a2', exerciseId: 'db_rows', scheme: SCHEME.SET_THEN_REP_INCREASE,
  schemeParams: { startingSets: 4, endingSets: 6, startingReps: 6, endingReps: 10, setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 8, roundingIncrement: 2.5, restSeconds: 120, isBodyweight: false, ...params },
  state: { workingWeight: 30, currentSets: 5, currentReps: 8, progressionStep: 3, progressionCycle: 1 },
  ...extra,
});

check('technique → set → rep → load keeps the rep and set ranges, and the load step, between loaded exercises', () => {
  const carried = carriedSchemeForSwap(stepAssignment({}), legPress);
  assert.deepEqual(
    [carried.schemeParams.startingSets, carried.schemeParams.endingSets, carried.schemeParams.startingReps, carried.schemeParams.endingReps, carried.schemeParams.weightIncreasePct, carried.schemeParams.roundingIncrement, carried.schemeParams.restSeconds],
    [4, 6, 6, 10, 8, 2.5, 120],
  );
  assert.equal(carried.schemeParams.progressionMode, undefined);
  assert.equal(carried.state, null);
});

check('moving from a loaded exercise to a sets-and-reps-only one keeps the ranges but drops the load step', () => {
  assert.equal(bwCurl.defaultParams.progressionMode, PROGRESSION_MODE.REPS_SETS_ONLY);
  const carried = carriedSchemeForSwap(stepAssignment({}), bwCurl);
  assert.equal(carried.schemeParams.progressionMode, PROGRESSION_MODE.REPS_SETS_ONLY);
  assert.equal(carried.schemeParams.isBodyweight, true);
  assert.equal(carried.schemeParams.weightIncreasePct, 0);
  assert.equal(carried.schemeParams.startingReps, 6, 'the rep range is still the coach\'s');
});

check('a bodyweight exercise that does add load keeps the load step it was given', () => {
  const carried = carriedSchemeForSwap(stepAssignment({}), nordic);
  assert.equal(carried.schemeParams.isBodyweight, true);
  assert.equal(carried.schemeParams.progressionMode, undefined);
  assert.equal(carried.schemeParams.weightIncreasePct, 8);
});

check('moving from a sets-and-reps-only exercise to a loaded one gets a load step, so the weight can progress', () => {
  const bodyweight = stepAssignment({ progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY, isBodyweight: true, weightIncreasePct: 0, roundingIncrement: 0 });
  const carried = carriedSchemeForSwap(bodyweight, legPress);
  assert.equal(carried.schemeParams.progressionMode, undefined);
  assert.equal(carried.schemeParams.isBodyweight, false);
  assert.equal(carried.schemeParams.weightIncreasePct, legPress.defaultParams.weightIncreasePct);
  assert.ok(carried.schemeParams.weightIncreasePct > 0);
  assert.ok(carried.schemeParams.roundingIncrement > 0);
});

check('between two sets-and-reps-only exercises nothing about the load is touched', () => {
  const bodyweight = stepAssignment({ progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY, isBodyweight: true, weightIncreasePct: 0, roundingIncrement: 0, startingReps: 5 });
  const carried = carriedSchemeForSwap(bodyweight, bwCurl);
  assert.equal(carried.schemeParams.startingReps, 5);
  assert.equal(carried.schemeParams.weightIncreasePct, 0);
  assert.equal(carried.schemeParams.progressionMode, PROGRESSION_MODE.REPS_SETS_ONLY);
});

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');

check('the assignment form starts from the carried mechanism when the exercise is changed or searched', () => {
  assert.match(coach, /import \{ carriedSchemeForSwap \} from '\.\/exercise-swap-utils\.js'/);
  assert.match(coach, /renderSchemeFields\(getExerciseById\(newExerciseId\), schemeSourceFor\(newExerciseId\)\)/);
  assert.match(coach, /renderSchemeFields\(getExerciseById\(select\.value\), schemeSourceFor\(select\.value\)\)/);
  assert.match(coach, /if \(exerciseId === editingOriginalExerciseId\) return assignment;/);
  assert.match(coach, /carriedSchemeForSwap\(assignment, getExerciseById\(exerciseId\)\) \|\| undefined/);
});

console.log(`exercise-swap: ${passed} passed`);
