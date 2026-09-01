import assert from 'node:assert/strict';
import {
  COMPLETION_REASON, auditChangesForState, incompleteAssignedExercises,
  normalizeCompletionReason, progressionChangeDiff, requiresExerciseCompletionReason,
  shouldHoldProgressionForReason,
} from '../coaching-decision-utils.js';
import { advanceSessionExercise } from '../workout-session-utils.js';
import { SCHEME } from '../progression-engine.js';

assert.equal(normalizeCompletionReason('other', '').valid, false);
assert.equal(normalizeCompletionReason('other', 'Phòng tập đóng sớm').valid, true);
assert.equal(normalizeCompletionReason('time').valid, true);
assert.equal(normalizeCompletionReason('unknown').valid, false);

assert.equal(shouldHoldProgressionForReason(COMPLETION_REASON.TIME), true);
assert.equal(shouldHoldProgressionForReason(COMPLETION_REASON.EQUIPMENT), true);
assert.equal(shouldHoldProgressionForReason(COMPLETION_REASON.PAIN), true);
assert.equal(shouldHoldProgressionForReason(COMPLETION_REASON.OTHER), true);
assert.equal(shouldHoldProgressionForReason(COMPLETION_REASON.FATIGUE), false);
assert.equal(shouldHoldProgressionForReason(COMPLETION_REASON.TECHNIQUE), false);

assert.equal(requiresExerciseCompletionReason({ source: 'assigned', skipped: true }), true);
assert.equal(requiresExerciseCompletionReason({ source: 'assigned', plannedSetCount: 4, adjustedSetCount: 3 }), true);
assert.equal(requiresExerciseCompletionReason({ source: 'assigned', plannedSetCount: 4, adjustedSetCount: 4 }), false);
assert.equal(requiresExerciseCompletionReason({ source: 'extra', plannedSetCount: 4, adjustedSetCount: 2 }), false);

const incomplete = incompleteAssignedExercises([
  { assignmentId: 'done', source: 'assigned', adjustedSetCount: 2, sets: [{ completed: true }, { completed: true }] },
  { assignmentId: 'missing', source: 'assigned', adjustedSetCount: 3, sets: [{ completed: true }] },
  { assignmentId: 'skip', source: 'assigned', skipped: true, adjustedSetCount: 3, sets: [] },
  { exerciseId: 'extra', source: 'extra', adjustedSetCount: 3, sets: [] },
]);
assert.deepEqual(incomplete.map((item) => item.assignmentId), ['missing']);

const held = advanceSessionExercise({
  scheme: SCHEME.LAST_SET_RIR,
  schemeParams: { intensityPct: 80, repsPerSet: 5, plannedSets: 3, targetRIR: 2, roundingIncrement: 2.5 },
  state: { trainingMax: 100, consecutiveMisses: 0 },
  actualSets: [{ weight: 80, reps: 5, rir: 5 }, { weight: 80, reps: 5, rir: 5 }, { weight: 80, reps: 5, rir: 5 }],
  adjustedSetCount: 3,
  forceHold: true,
  holdReason: 'Không đủ thời gian — giữ nguyên progression',
});
assert.equal(held.progressionHeld, true);
assert.equal(held.nextState.trainingMax, 100);
assert.equal(held.nextPrescription.weight, 80);

assert.deepEqual(auditChangesForState(
  { trainingMax: 100, currentSets: 3 },
  { trainingMax: 103, currentSets: 3 },
), [{ field: 'trainingMax', before: 100, after: 103 }]);

assert.deepEqual(progressionChangeDiff(
  { scheme: 2, schemeParams: { plannedSets: 3 }, state: { trainingMax: 100 } },
  { scheme: 2, schemeParams: { plannedSets: 4 }, state: { trainingMax: 100 } },
), [{ field: 'plannedSets', before: 3, after: 4 }]);

console.log('COACHING_DECISION_OK 23 / 23 passed');
