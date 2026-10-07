import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEME } from '../progression-engine.js';
import { advanceSessionExercise } from '../workout-session-utils.js';
import { requiresExerciseCompletionReason, progressionChangeDiff } from '../coaching-decision-utils.js';
import { assignmentSetupIssues } from '../template-import-utils.js';

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const client = readFileSync(new URL('../client.html', import.meta.url), 'utf8');

test('Coach exposes all eight mechanisms and the four Stage 6 configurations', () => {
  for (const value of [1, 2, 3, 4, 5, 6, 7, 8]) assert.match(coach, new RegExp(`<option value="${value}"`));
  for (const label of ['SBS Original Progression', 'SBS Fixed Total Reps', 'SBS Reverse Pyramid', 'SBS Rep Increase']) {
    assert.match(coach, new RegExp(label));
  }
  assert.match(coach, /p-lowerSets/);
  assert.match(coach, /p-totalRepsTarget/);
  assert.match(coach, /p-setWeight-\$\{index\}/);
  assert.match(coach, /p-repIncreaseStep/);
});

test('Client renders scheme-specific instructions and Reverse Pyramid per-set prescriptions', () => {
  assert.match(client, /assignment\?\.scheme === SCHEME\.ORIGINAL_PROGRESSION/);
  assert.match(client, /assignment\?\.scheme === SCHEME\.FIXED_TOTAL_REPS/);
  assert.match(client, /assignment\?\.scheme === SCHEME\.REVERSE_PYRAMID/);
  assert.match(client, /assignment\?\.scheme === SCHEME\.REP_INCREASE/);
  assert.match(client, /planned\.setPrescriptions/);
  assert.match(client, /setPrescription\?\.weight/);
});

test('Original Progression can end naturally inside its set band without readiness hold or a reduction reason', () => {
  const schemeParams = { intensityPct: 70, repsPerSet: 5, targetRIR: 2, lowerSets: 4, upperSets: 6, roundingIncrement: 2.5 };
  const result = advanceSessionExercise({
    scheme: SCHEME.ORIGINAL_PROGRESSION,
    schemeParams,
    state: { trainingMax: 100, consecutiveMisses: 0 },
    actualSets: Array.from({ length: 4 }, () => ({ reps: 5 })),
    adjustedSetCount: 4,
  });
  assert.equal(result.progressionHeld, false);
  assert.equal(result.delta.pctAdj, 0);
  assert.equal(requiresExerciseCompletionReason({ scheme: 1, plannedSetCount: 6, adjustedSetCount: 4 }), false);
});

test('Stage 6 setup validation catches incomplete scheme-specific states', () => {
  assert.equal(assignmentSetupIssues({
    scheme: 6,
    exerciseNameSnapshot: { vi: 'Reverse Pyramid' },
    schemeParams: { setTargets: [6, 10, 12], weightIncreasePct: 3, roundingIncrement: 2.5, restSeconds: 120 },
    state: { setWeights: [80, 70] },
  }).length > 0, true);
  assert.deepEqual(assignmentSetupIssues({
    scheme: 7,
    exerciseNameSnapshot: { vi: 'Bodyweight' },
    schemeParams: { startingSets: 4, endingSets: 6, repIncreaseStep: 1, restSeconds: 90 },
    state: { currentSets: 4, currentReps: 8 },
  }), []);
});

test('Manual edits to per-set weights and targets require an auditable reason', () => {
  const before = { scheme: 6, state: { setWeights: [80, 70, 60] }, schemeParams: { setTargets: [6, 10, 12] } };
  const after = { scheme: 6, state: { setWeights: [82.5, 70, 60] }, schemeParams: { setTargets: [6, 9, 12] } };
  assert.deepEqual(progressionChangeDiff(before, after).map((item) => item.field), ['setWeights', 'setTargets']);
});
