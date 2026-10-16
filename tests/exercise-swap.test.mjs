// Run with:  node tests/exercise-swap.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carriedSchemeForSwap, schemeFitsExercise, seedSubstituteLoad, substituteProgression } from '../exercise-swap-utils.js';
import { getExerciseById } from '../exercise-seed-data.js';
import { PROGRESSION_MODE, SCHEME, getInitialPrescription } from '../progression-engine.js';

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

// ---------- the client's own swap in a session (substituteProgression) ----------

check('a substitute follows the old Training Max mechanism with every setting, and asks for the weight', () => {
  const carried = substituteProgression(rirAssignment, legPress);
  assert.equal(carried.scheme, SCHEME.LAST_SET_RIR, 'not the leg press default (8)');
  assert.equal(carried.schemeParams.restSeconds, 150);
  assert.deepEqual(carried.state, { trainingMax: 0, workingWeight: 0, consecutiveMisses: 0 }, 'the squat Training Max is not the leg press one');
  const planned = getInitialPrescription(carried);
  assert.deepEqual([planned.weight, planned.sets, planned.reps], [0, 4, 5]);
});

check('the weight the client chose becomes the Training Max, so the next plan starts from it', () => {
  const carried = substituteProgression(rirAssignment, legPress);
  const seeded = seedSubstituteLoad(carried, [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }]);
  assert.ok(Math.abs(seeded.trainingMax - 100 / 0.825) < 1e-9);
  assert.equal(getInitialPrescription({ ...carried, state: seeded }).weight, 100);
  const control = seedSubstituteLoad(carried, [{ weight: 0, reps: 5 }, { weight: 90, reps: 5 }]);
  assert.equal(control.workingWeight, 90, 'a set entered as 0 kg does not wipe out the load');
  assert.equal(carried.state.trainingMax, 0, 'seeding returns a new state');
});

check('on the set/rep mechanism the old level carries over: sets, reps, step and round', () => {
  const carried = substituteProgression(stepAssignment({}), legPress);
  assert.equal(carried.scheme, SCHEME.SET_THEN_REP_INCREASE);
  assert.deepEqual(carried.state, { workingWeight: 0, currentSets: 5, currentReps: 8, progressionStep: 3, progressionCycle: 1, consecutiveMisses: 0 });
  assert.deepEqual([getInitialPrescription(carried).sets, getInitialPrescription(carried).reps], [5, 8]);
  assert.equal(seedSubstituteLoad(carried, [{ weight: 60, reps: 8 }]).workingWeight, 60);
});

check('the old loads, records and technique ticks stay with the old exercise', () => {
  const assignment = stepAssignment({}, {
    state: { workingWeight: 30, currentSets: 5, currentReps: 8, progressionStep: 1, progressionCycle: 0, prWeight: 35, prReps: 8, lastOutcome: 'up', techniqueChecklist: { cycle: 0, checks: [true, true, false, false, false] } },
  });
  const { state } = substituteProgression(assignment, legPress);
  for (const key of ['prWeight', 'prReps', 'lastOutcome', 'techniqueChecklist']) assert.equal(key in state, false, key);
  assert.equal(state.workingWeight, 0);
});

check('"Tăng tạ" has no place on sets-and-reps-only work, so that step moves on to a new round', () => {
  const atLoadStep = stepAssignment({}, { state: { workingWeight: 32.5, currentSets: 4, currentReps: 6, progressionStep: 4, progressionCycle: 1 } });
  const carried = substituteProgression(atLoadStep, bwCurl);
  assert.equal(carried.schemeParams.progressionMode, PROGRESSION_MODE.REPS_SETS_ONLY);
  assert.deepEqual([carried.state.progressionStep, carried.state.progressionCycle, carried.state.currentSets, carried.state.currentReps], [1, 2, 4, 6]);
  assert.equal(seedSubstituteLoad(carried, [{ weight: 5, reps: 6 }]).workingWeight, 0, 'no load on sets-and-reps-only work');
  const toLoaded = substituteProgression(atLoadStep, legPress);
  assert.deepEqual([toLoaded.state.progressionStep, toLoaded.state.progressionCycle], [4, 1], 'a loaded exercise keeps the step');
});

check('Rep Increase carries its sets and reps between bodyweight exercises', () => {
  const repIncrease = {
    id: 'a3', exerciseId: 'chin_up', scheme: SCHEME.REP_INCREASE,
    schemeParams: { startingSets: 3, endingSets: 5, startingReps: 6, repIncreaseStep: 1, isBodyweight: true, progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY, restSeconds: 120 },
    state: { workingWeight: 0, currentSets: 4, currentReps: 9, consecutiveMisses: 2 },
  };
  const carried = substituteProgression(repIncrease, pullUp);
  assert.deepEqual(carried.state, { workingWeight: 0, currentSets: 4, currentReps: 9, consecutiveMisses: 0 });
  assert.equal(substituteProgression(repIncrease, legPress), null, 'Rep Increase is not for loaded work');
});

check('a state missing its level starts from the coach\'s starting sets and reps', () => {
  const carried = substituteProgression(stepAssignment({}, { state: { workingWeight: 30 } }), legPress);
  assert.deepEqual([carried.state.currentSets, carried.state.currentReps, carried.state.progressionStep, carried.state.progressionCycle], [4, 6, 1, 0]);
});

check('a reverse pyramid takes each set\'s weight from the set the client did', () => {
  const pyramid = {
    id: 'a4', exerciseId: 'squat', scheme: SCHEME.REVERSE_PYRAMID,
    schemeParams: { setTargets: [6, 8, 10], weightIncreasePct: 3, roundingIncrement: 2.5, isBodyweight: false, restSeconds: 180 },
    state: { setWeights: [100, 90, 80], workingWeight: 100 },
  };
  const carried = substituteProgression(pyramid, legPress);
  assert.deepEqual(carried.state.setWeights, [0, 0, 0]);
  assert.deepEqual(seedSubstituteLoad(carried, [{ weight: 160, reps: 6 }, { weight: 140, reps: 8 }, { weight: 120, reps: 10 }]).setWeights, [160, 140, 120]);
  assert.deepEqual(seedSubstituteLoad(carried, [{ weight: 160, reps: 6 }]).setWeights, [160, 160, 160]);
});

check('when the old mechanism does not suit the substitute, it keeps its own progression as before', () => {
  assert.equal(substituteProgression(rirAssignment, pullUp), null);
  assert.equal(substituteProgression(rirAssignment, null), null);
  const before = JSON.stringify(rirAssignment);
  substituteProgression(rirAssignment, legPress);
  assert.equal(JSON.stringify(rirAssignment), before, 'the assignment given in is never changed');
});

const client = readFileSync(new URL('../client.html', import.meta.url), 'utf8');

check('the session swap follows the original\'s plan, falling back to the substitute\'s own memory', () => {
  assert.match(client, /import \{ substituteProgression \} from '\.\/exercise-swap-utils\.js'/);
  assert.match(client, /const carried = substituteProgression\(assignment, getExerciseById\(newId\)\);\s+const substituteContext = carried \|\| contextForExercise\(newId\);/);
  assert.match(client, /substituteCarried = Boolean\(carried\);/);
});

check('a weighted plan with no load yet asks for the weight instead of showing 0 kg', () => {
  assert.match(client, /function loadText\(assignment, weight\) \{\s+return Number\(weight\) > 0 \|\| assignment\?\.schemeParams\?\.isBodyweight !== false \? `\$\{weight\} kg` : 'tự chọn mức tạ';/);
  assert.equal((client.match(/<strong>\$\{planned\.weight\} kg<\/strong>/g) || []).length, 0);
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
