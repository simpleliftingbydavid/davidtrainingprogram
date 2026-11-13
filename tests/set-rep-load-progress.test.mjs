// Kiểu 8: Tăng set → Tăng rep → Tăng tạ (David bỏ nấc Kỹ thuật ngày 2026-11-13: 1a, 3a).
//   node tests/set-rep-load-progress.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROGRESSION_MODE, SCHEME, SKILL_PROGRESSION_STEPS, progressionStepsForSchemeParams, skillProgressionInfo } from '../progression-engine.js';
import { getExerciseById, groupExercisesByMuscleGroup } from '../exercise-seed-data.js';
import { buildCompletedExerciseEntries, sessionSaveErrorMessage } from '../session-entry-utils.js';
import { advanceSessionExercise, createInitialExtraState } from '../workout-session-utils.js';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const params = {
  startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
  setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10,
  roundingIncrement: 5, restSeconds: 90,
};
const bodyweight = { ...params, weightIncreasePct: 0, roundingIncrement: 0, progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY };
const base = { workingWeight: 20, currentSets: 3, currentReps: 8, progressionStep: 1, progressionCycle: 0, consecutiveMisses: 0 };
const sets = (n, reps, weight = 20) => Array.from({ length: n }, (_, index) => ({ setIndex: index + 1, weight, reps, rir: 0 }));
const run = (state, actualSets, schemeParams = params) => advanceSessionExercise({
  scheme: SCHEME.SET_THEN_REP_INCREASE, schemeParams, state, actualSets, adjustedSetCount: state.currentSets,
});

check('three steps with load, two without; no technique step', () => {
  assert.deepEqual(SKILL_PROGRESSION_STEPS.map((s) => s.label), ['Tăng set', 'Tăng rep', 'Tăng tạ']);
  assert.deepEqual(progressionStepsForSchemeParams(bodyweight).map((s) => s.label), ['Tăng set', 'Tăng rep']);
  assert.ok(SKILL_PROGRESSION_STEPS.every((s) => s.key !== 'technique'));
});

check('a full round with load: set, rep, load, back to the start sets and reps', () => {
  const one = run(base, sets(3, 8));
  assert.deepEqual([one.nextState.progressionStep, one.nextState.currentSets, one.nextState.currentReps, one.nextState.workingWeight], [2, 4, 8, 20]);
  assert.equal(one.outcome, 'up');
  const two = run(one.nextState, sets(4, 8));
  assert.deepEqual([two.nextState.progressionStep, two.nextState.currentSets, two.nextState.currentReps], [3, 4, 10]);
  const three = run(two.nextState, sets(4, 10));
  assert.deepEqual([three.nextState.progressionStep, three.nextState.currentSets, three.nextState.currentReps, three.nextState.workingWeight, three.nextState.progressionCycle], [1, 3, 8, 20, 1]);
  assert.equal(three.delta.action, 'advance_weight');
  const heavier = run({ ...two.nextState, workingWeight: 50 }, sets(4, 10, 50));
  assert.equal(heavier.nextState.workingWeight, 55);
});

check('bodyweight: set, then rep closes the round; load stays 0', () => {
  const start = { ...base, workingWeight: 0 };
  const one = run(start, sets(3, 8, 0), bodyweight);
  assert.deepEqual([one.nextState.progressionStep, one.nextState.currentSets], [2, 4]);
  const two = run(one.nextState, sets(4, 8, 0), bodyweight);
  assert.deepEqual([two.nextState.progressionStep, two.nextState.currentReps, two.nextState.workingWeight, two.nextState.progressionCycle], [1, 10, 0, 1]);
});

check('a missed target holds everything', () => {
  const miss = run(base, [...sets(2, 8), { setIndex: 3, weight: 20, reps: 6, rir: 0 }]);
  assert.deepEqual([miss.nextState.progressionStep, miss.nextState.currentSets, miss.nextState.consecutiveMisses], [1, 3, 1]);
  assert.equal(miss.outcome, 'down');
});

check('step 1 advances on reps alone: nothing waits for a self-check', () => {
  const result = run({ ...base, techniqueChecklist: { cycle: 0, checks: [false, false, false, false, false] } }, sets(3, 8));
  assert.equal(result.nextState.progressionStep, 2);
});

check('old states: step 4, or out of range, reads as step 1; numbers untouched', () => {
  assert.equal(skillProgressionInfo({ progressionStep: 4 }, params).step, 1);
  assert.equal(skillProgressionInfo({ progressionStep: 3 }, bodyweight).step, 1);
  assert.equal(skillProgressionInfo({}, params).step, 1);
  const old = { ...base, progressionStep: 4, workingWeight: 22.5, currentSets: 3, currentReps: 8 };
  const next = run(old, sets(3, 8, 22.5));
  assert.deepEqual([next.nextState.progressionStep, next.nextState.currentSets, next.nextState.workingWeight], [2, 4, 22.5]);
});

check('the input state is never mutated', () => {
  const original = structuredClone(base);
  run(base, sets(3, 8));
  assert.deepEqual(base, original);
});

check('new sessions carry no technique fields', () => {
  const [entry] = buildCompletedExerciseEntries([{
    source: 'assigned', assignmentId: 'a', exerciseId: 'leg_extension', techniqueChecks: [true], techniqueConfirmed: true,
    plannedSetCount: 3, adjustedSetCount: 3, sets: [{ setIndex: 1, weight: 20, reps: 8, rir: 0, completed: true }],
  }]);
  assert.equal('techniqueChecks' in entry, false);
  assert.equal('techniqueConfirmed' in entry, false);
  const containsUndefined = (value) => value === undefined
    || (Array.isArray(value) && value.some(containsUndefined))
    || (value && typeof value === 'object' && Object.values(value).some(containsUndefined));
  assert.equal(containsUndefined(entry), false);
});

check('pages: no self-check list on the workout page, coach labels updated', () => {
  const client = read('client.html');
  assert.doesNotMatch(client, /TECHNIQUE_SELF_CHECKS|data-technique-check|technique-self-check|_techniqueConfirmed/);
  assert.doesNotMatch(read('training-data.js'), /techniqueChecks|techniqueConfirmed/);
  const coach = read('coach.html');
  assert.match(coach, />Set → rep → tạ<\/option>/);
  assert.doesNotMatch(coach, /Kỹ thuật → tăng set|Kỹ thuật→set|Kỹ thuật tốt hơn/);
});

check('Firestore serialization errors show a useful support code', () => {
  assert.match(sessionSaveErrorMessage({ code: 'invalid-argument', message: 'Unsupported field value: undefined' }), /SAVE_DATA_INVALID/);
});

check('library exercises keep scheme 8 and a fresh extra state starts at step 1', () => {
  const extension = getExerciseById('single_leg_leg_extension');
  assert.equal(extension.defaultScheme, SCHEME.SET_THEN_REP_INCREASE);
  assert.equal(createInitialExtraState(extension).progressionStep, 1);
  assert.equal(groupExercisesByMuscleGroup().get('Đùi trước').some((item) => item.exerciseId === extension.exerciseId), true);
});

console.log(`SET_REP_LOAD_PROGRESS_OK ${passed} / ${passed} passed`);
