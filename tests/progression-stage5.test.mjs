import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEME,
  getInitialPrescription,
  calculateNextPrescription,
  classifyOutcome,
} from '../progression-engine.js';

const rtfParams = {
  intensityPct: 70,
  plannedSets: 4,
  repsPerSet: 6,
  repOutTarget: 10,
  roundingIncrement: 2.5,
};

function rtf(repOutReps, sets = 4) {
  return calculateNextPrescription({
    scheme: SCHEME.REPS_TO_FAILURE,
    schemeParams: rtfParams,
    state: { trainingMax: 100, workingWeight: 70, consecutiveMisses: 0 },
    lastLog: { actualSets: Array.from({ length: sets }, (_, index) => ({ reps: index === sets - 1 ? repOutReps : 6 })) },
  });
}

test('RTF prescription and all source adjustment buckets are exact', () => {
  assert.deepEqual(getInitialPrescription({
    scheme: SCHEME.REPS_TO_FAILURE,
    schemeParams: rtfParams,
    state: { trainingMax: 100 },
  }), { weight: 70, sets: 4, reps: 6, repOutTarget: 10 });

  const cases = [[8, -5], [9, -2], [10, 0], [11, 0.5], [12, 1], [13, 1.5], [14, 2], [15, 3], [20, 3]];
  for (const [reps, expected] of cases) assert.equal(rtf(reps).delta.pctAdj, expected, `rep-out ${reps}`);
  assert.equal(rtf(20, 3).delta.pctAdj, -2, 'one missing set takes priority over rep-out');
  assert.equal(rtf(20, 2).delta.pctAdj, -5, 'two missing sets take the worst bucket');
});

test('Classic Overload only increases after every planned set reaches target', () => {
  const schemeParams = { plannedSets: 3, repsPerSet: 10, weightIncreasePct: 3, roundingIncrement: 2.5 };
  const state = { workingWeight: 40, consecutiveMisses: 0 };
  const hit = calculateNextPrescription({
    scheme: SCHEME.CLASSIC_OVERLOAD, schemeParams, state,
    lastLog: { actualSets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
  });
  assert.equal(hit.nextState.workingWeight, 42.5, 'smallest available increment wins over 3%');
  assert.equal(hit.delta.action, 'increase_weight');
  assert.equal(classifyOutcome(SCHEME.CLASSIC_OVERLOAD, hit.delta), 'up');

  const miss = calculateNextPrescription({
    scheme: SCHEME.CLASSIC_OVERLOAD, schemeParams, state,
    lastLog: { actualSets: [{ reps: 10 }, { reps: 9 }, { reps: 10 }] },
  });
  assert.equal(miss.nextState.workingWeight, 40);
  assert.equal(miss.nextState.consecutiveMisses, 1);
  assert.equal(classifyOutcome(SCHEME.CLASSIC_OVERLOAD, miss.delta), 'hold');
});

test('partially specified SBS schemes remain unavailable', () => {
  for (const scheme of [SCHEME.ORIGINAL_PROGRESSION, SCHEME.FIXED_TOTAL_REPS, SCHEME.REVERSE_PYRAMID, SCHEME.REP_INCREASE]) {
    assert.throws(() => getInitialPrescription({ scheme, schemeParams: {}, state: {} }), /not implemented/);
  }
});
