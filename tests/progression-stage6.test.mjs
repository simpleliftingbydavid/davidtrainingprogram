import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEME, getInitialPrescription, calculateNextPrescription, classifyOutcome } from '../progression-engine.js';

const sets = (count, reps) => Array.from({ length: count }, (_, index) => ({ setIndex: index + 1, reps }));

test('Original Progression uses exact lower/upper set buckets', () => {
  const schemeParams = { intensityPct: 70, repsPerSet: 5, targetRIR: 2, lowerSets: 4, upperSets: 6, roundingIncrement: 2.5 };
  const state = { trainingMax: 100, consecutiveMisses: 0 };
  assert.deepEqual(getInitialPrescription({ scheme: SCHEME.ORIGINAL_PROGRESSION, schemeParams, state }), {
    weight: 70, sets: 6, reps: 5, stopRIR: 2, lowerSets: 4, upperSets: 6,
  });
  const cases = [[2, -5], [3, -2], [4, 0], [5, 0], [6, 0], [7, 1], [8, 2], [9, 3], [10, 5]];
  for (const [count, pctAdj] of cases) {
    const result = calculateNextPrescription({
      scheme: SCHEME.ORIGINAL_PROGRESSION, schemeParams, state,
      lastLog: { actualSets: sets(count, 5) },
    });
    assert.equal(result.delta.pctAdj, pctAdj, `${count} completed sets`);
    assert.equal(classifyOutcome(SCHEME.ORIGINAL_PROGRESSION, result.delta), pctAdj > 0 ? 'up' : pctAdj < 0 ? 'down' : 'hold');
  }
});

test('Fixed Total Reps increases only after target total is reached across planned sets', () => {
  const schemeParams = { plannedSets: 3, totalRepsTarget: 40, weightIncreasePct: 3, roundingIncrement: 2.5 };
  const state = { workingWeight: 40, consecutiveMisses: 0 };
  assert.deepEqual(getInitialPrescription({ scheme: SCHEME.FIXED_TOTAL_REPS, schemeParams, state }), {
    weight: 40, sets: 3, reps: 14, totalRepsTarget: 40,
  });
  const hit = calculateNextPrescription({
    scheme: SCHEME.FIXED_TOTAL_REPS, schemeParams, state,
    lastLog: { actualSets: [{ reps: 15 }, { reps: 13 }, { reps: 12 }] },
  });
  assert.equal(hit.nextState.workingWeight, 42.5);
  assert.equal(hit.delta.totalReps, 40);
  const miss = calculateNextPrescription({
    scheme: SCHEME.FIXED_TOTAL_REPS, schemeParams, state,
    lastLog: { actualSets: [{ reps: 20 }, { reps: 19 }] },
  });
  assert.equal(miss.nextState.workingWeight, 40, 'missing a planned set cannot pass even with 39 total reps');
});

test('Reverse Pyramid progresses every set independently', () => {
  const schemeParams = { setTargets: [6, 10, 12], weightIncreasePct: 3, roundingIncrement: 2.5 };
  const state = { setWeights: [80, 70, 60], workingWeight: 80, consecutiveMisses: 0 };
  assert.deepEqual(getInitialPrescription({ scheme: SCHEME.REVERSE_PYRAMID, schemeParams, state }).setPrescriptions, [
    { setIndex: 1, weight: 80, reps: 6 },
    { setIndex: 2, weight: 70, reps: 10 },
    { setIndex: 3, weight: 60, reps: 12 },
  ]);
  const result = calculateNextPrescription({
    scheme: SCHEME.REVERSE_PYRAMID, schemeParams, state,
    lastLog: { actualSets: [{ reps: 6 }, { reps: 9 }, { reps: 13 }] },
  });
  assert.deepEqual(result.nextState.setWeights, [82.5, 70, 62.5]);
  assert.equal(result.delta.setResults[1].hit, false);
  assert.equal(classifyOutcome(SCHEME.REVERSE_PYRAMID, result.delta), 'up');
});

test('Rep Increase adds sets until cap, then resets sets and adds reps', () => {
  const schemeParams = { startingSets: 4, endingSets: 6, repIncreaseStep: 1 };
  const state = { workingWeight: 0, currentSets: 4, currentReps: 8, consecutiveMisses: 0 };
  const setStep = calculateNextPrescription({
    scheme: SCHEME.REP_INCREASE, schemeParams, state,
    lastLog: { actualSets: sets(4, 8) },
  });
  assert.equal(setStep.nextState.currentSets, 5);
  assert.equal(setStep.nextState.currentReps, 8);
  const repStep = calculateNextPrescription({
    scheme: SCHEME.REP_INCREASE, schemeParams,
    state: { ...state, currentSets: 6 },
    lastLog: { actualSets: sets(6, 8) },
  });
  assert.equal(repStep.nextState.currentSets, 4);
  assert.equal(repStep.nextState.currentReps, 9);
  assert.equal(repStep.nextState.workingWeight, 0);
  const miss = calculateNextPrescription({
    scheme: SCHEME.REP_INCREASE, schemeParams, state,
    lastLog: { actualSets: [{ reps: 8 }, { reps: 8 }, { reps: 7 }, { reps: 8 }] },
  });
  assert.equal(miss.nextState.currentSets, 4);
  assert.equal(classifyOutcome(SCHEME.REP_INCREASE, miss.delta), 'down');
});
