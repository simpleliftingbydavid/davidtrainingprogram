import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEME } from '../progression-engine.js';
import { advanceSessionExercise } from '../workout-session-utils.js';
import { buildCompletedExerciseEntries, validateSessionExerciseInputs } from '../session-entry-utils.js';
import { normalizeWorkoutDraft, WORKOUT_DRAFT_VERSION } from '../workout-draft-utils.js';

test('RTF and Classic Overload run through the shared session progression path', () => {
  const rtf = advanceSessionExercise({
    scheme: SCHEME.REPS_TO_FAILURE,
    schemeParams: { intensityPct: 70, plannedSets: 3, repsPerSet: 6, repOutTarget: 10, roundingIncrement: 2.5 },
    state: { trainingMax: 100, workingWeight: 70, consecutiveMisses: 0 },
    actualSets: [{ reps: 6 }, { reps: 6 }, { reps: 12 }], adjustedSetCount: 3,
  });
  assert.equal(rtf.delta.pctAdj, 1);
  assert.equal(rtf.outcome, 'up');

  const classic = advanceSessionExercise({
    scheme: SCHEME.CLASSIC_OVERLOAD,
    schemeParams: { plannedSets: 2, repsPerSet: 12, weightIncreasePct: 3, roundingIncrement: 1 },
    state: { workingWeight: 20, consecutiveMisses: 0 },
    actualSets: [{ reps: 12 }, { reps: 12 }], adjustedSetCount: 2,
  });
  assert.equal(classic.nextPrescription.weight, 21);
  assert.equal(classic.outcome, 'up');
});

test('Stage 5 draft data survives cross-device normalization', () => {
  const draft = normalizeWorkoutDraft({
    day: 'Upper', sessionId: 'stage5-session', exercises: [{
      assignmentId: 'bench', setCount: 3,
      stage5: { singleAt8: { weight: 85, rpe: 8 }, repOut: { performed: true, predictedRir: 2, extraReps: 3 } },
    }],
  });
  assert.equal(draft.version, WORKOUT_DRAFT_VERSION);
  assert.deepEqual(draft.exercises[0].stage5, {
    singleAt8: { weight: '85', rpe: '8' },
    repOut: { performed: true, predictedRir: '2', extraReps: '3' },
  });
});

test('completed entry stores concrete Stage 5 metadata and rejects half-entered tests', () => {
  const base = {
    assignmentId: 'bench', exerciseId: 'bench_press', plannedSetCount: 1, adjustedSetCount: 1,
    sets: [{ setIndex: 1, weight: '60', reps: '8', rir: '2', completed: true }],
    stage5: { failureStandard: 'technical_failure', singleAt8: { weight: 80, rpe: 8 } },
  };
  const entries = buildCompletedExerciseEntries([base]);
  assert.deepEqual(entries[0].stage5, base.stage5);
  const singleIssues = validateSessionExerciseInputs([{ ...base, stage5Raw: { singleAt8: { weight: '80', rpe: '' } } }]);
  assert.equal(singleIssues.length, 1);
  assert.match(singleIssues[0], /RPE của single @8/);
  const repOutIssues = validateSessionExerciseInputs([{ ...base, stage5Raw: { repOut: { performed: true, predictedRir: '', extraReps: '3' } } }]);
  assert.equal(repOutIssues.length, 1);
  assert.match(repOutIssues[0], /RIR dự đoán/);
});

test('Coach and Client expose Stage 5 without automatic programme writes', () => {
  const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../client.html', import.meta.url), 'utf8');
  const helper = readFileSync(new URL('../stage5-autoregulation.js', import.meta.url), 'utf8');
  assert.match(coach, /SBS Reps to Failure/);
  assert.match(coach, /SBS Classic Overload/);
  assert.match(coach, /Overwarm single @8/);
  assert.match(client, /data-stage5-single-weight/);
  assert.match(client, /data-stage5-repout-performed/);
  assert.doesNotMatch(helper, /updateDoc|setDoc|runTransaction|from ['"]\.\/training-data/i);
});
