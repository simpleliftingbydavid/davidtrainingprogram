import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EFFORT_OUTCOME, PROGRESSION_SCHEME_COVERAGE, assessDeloadNeed, buildCoachReviewItems,
  buildEffortFlags, buildPhaseReviewAmendment, buildPhaseReviewSnapshot, buildRirTrendRows,
} from '../coaching-review-engine.js';

const at = (daysAgo) => Date.now() - daysAgo * 86400000;
const student = { id: 's1', displayName: 'Hải' };
const assignments = [{ id: 'a1', exerciseId: 'bench', exerciseNameSnapshot: { vi: 'Bench Press' }, phaseId: 'p1', state: { trainingMax: 100 } }];

test('review inbox deduplicates source events and preserves resolved state', () => {
  const session = {
    id: 'sess1', dayLabel: 'Upper', performedAt: at(1), completionContext: { endedEarly: true, earlyEndReason: 'fatigue' },
    exerciseLogs: [{ assignmentId: 'a1', exerciseId: 'bench', outcome: 'skipped', plannedSetCount: 3, adjustedSetCount: 0, completionReason: 'fatigue' }],
  };
  const first = buildCoachReviewItems({ student, sessions: [session, session], assignments });
  assert.equal(first.filter((item) => item.type === 'skipped-exercise').length, 1);
  const skipped = first.find((item) => item.type === 'skipped-exercise');
  const resolved = buildCoachReviewItems({ student, sessions: [session], assignments, reviewStates: [{ sourceKey: skipped.sourceKey, status: 'resolved', lastAction: 'seen' }] });
  assert.equal(resolved.find((item) => item.sourceKey === skipped.sourceKey).status, 'resolved');
});

test('legacy missing fields are read without mutation or crash', () => {
  const legacy = { id: 'old', performedAt: at(2), exerciseLogs: [{ assignmentId: 'a1', exerciseId: 'bench', actualSets: [{ weight: 50, reps: 8 }] }] };
  assert.doesNotThrow(() => buildCoachReviewItems({ student, sessions: [legacy], assignments }));
  assert.equal(buildRirTrendRows({ sessions: [legacy], assignments }).length, 1);
});

test('all requested alert types appear from source data', () => {
  const sessions = [{
    id: 's', dayLabel: 'A', performedAt: at(1), completionContext: { endedEarly: true, earlyEndReason: 'time' },
    exerciseLogs: [
      { assignmentId: 'a1', exerciseId: 'bench', actualSets: [{ weight: 50, reps: 8 }], plannedSetCount: 4, adjustedSetCount: 2, progressionHeld: true, completionReason: 'fatigue' },
      { assignmentId: 'a2', exerciseId: 'row', outcome: 'skipped', completionReason: 'time' },
      { sessionExerciseId: 'bad', exerciseId: '', actualSets: [] },
    ],
  }];
  const items = buildCoachReviewItems({ student, sessions, assignments, alerts: [{ id: 'pain', status: 'open', type: 'exercise-pain', exerciseName: 'Bench Press' }], notifications: [{ id: 'n1', noteId: 'note', studentUid: 's1', exerciseName: 'Bench Press' }], audits: [{ id: 'audit', exerciseId: 'bench', createdAt: at(1), changes: [{ field: 'trainingMax', before: 100, after: 120 }] }] });
  ['exercise-pain', 'reduced-sets', 'skipped-exercise', 'progression-held', 'early-end', 'data-quality', 'feedback', 'training-max'].forEach((type) => assert.ok(items.some((item) => item.type === type), type));
});

test('RIR trend reports missing, constant, mismatch and unplanned failure', () => {
  const sessions = [0, 1, 2, 3].map((day, index) => ({
    id: `r${index}`, performedAt: at(day), phaseId: 'p1', exerciseLogs: [{ assignmentId: 'a1', exerciseId: 'bench', planned: { targetRIR: 2 }, outcome: index === 0 ? 'up' : 'hold', actualSets: [{ weight: 50 + index, reps: 8, rir: index === 3 ? undefined : 1, effortOutcome: index === 1 ? EFFORT_OUTCOME.TECHNICAL_FAILURE : '' }] }],
  }));
  const row = buildRirTrendRows({ sessions, assignments, phaseId: 'p1', weeks: 4 })[0];
  assert.ok(row.flags.some((item) => item.type === 'missing-rir'));
  assert.ok(row.flags.some((item) => item.type === 'rir-performance-mismatch'));
  assert.ok(row.flags.some((item) => item.type === 'unplanned-failure'));
});

test('effort standards distinguish technical failure from safety stop', () => {
  const technical = buildEffortFlags({ plannedRir: 2, actualRir: 3, effortOutcome: EFFORT_OUTCOME.TECHNICAL_FAILURE, performanceDirection: 'down' });
  assert.ok(technical.some((item) => item.type === 'failure-rir-conflict'));
  assert.ok(technical.some((item) => item.type === 'failure-performance-drop'));
  const safety = buildEffortFlags({ effortOutcome: EFFORT_OUTCOME.STOPPED_SAFETY });
  assert.deepEqual(safety.map((item) => item.type), ['pain-or-safety']);
});

test('deload is recommendation only and requires combined evidence', () => {
  const result = assessDeloadNeed({
    sessions: [{ id: 'd1', performedAt: at(1), completionContext: { endedEarly: true }, exerciseLogs: [{ outcome: 'down', plannedSetCount: 4, adjustedSetCount: 2, planned: { targetRIR: 2 }, actualSets: [{ rir: 0 }] }, { outcome: 'down' }] }],
    checkIns: [{ submittedAt: at(1), fatigue: 5, performance: 1, jointPain: 2 }], alerts: [],
  });
  assert.equal(result.recommendation, 'consider_deload');
  assert.match(result.disclaimer, /David/);
});

test('phase review is a complete snapshot and amendments are separate objects', () => {
  const phase = { id: 'p1', name: 'Block 1', status: 'active' };
  const sessions = [{ id: 'x', phaseId: 'p1', performedAt: at(1), exerciseLogs: [{ assignmentId: 'a1', exerciseId: 'bench', actualSets: [{ weight: 60, reps: 8 }] }] }];
  const snapshot = buildPhaseReviewSnapshot({ phase, assignments, sessions, closedBy: 'coach', closeReason: 'Kết thúc block' });
  assert.equal(snapshot.phaseId, 'p1');
  assert.equal(snapshot.sessionCount, 1);
  assert.equal(snapshot.assignmentSnapshot[0].trainingMaxEnd, 100);
  assert.throws(() => buildPhaseReviewAmendment({ phaseId: 'p1' }));
  const amendment = buildPhaseReviewAmendment({ phaseId: 'p1', reviewId: 'p1', actorUid: 'coach', reason: 'Bổ sung', changes: [{ field: 'note', after: 'x' }] });
  assert.equal(amendment.reviewId, 'p1');
});

test('scheme coverage does not pretend unimplemented schemes are supported', () => {
  assert.deepEqual(PROGRESSION_SCHEME_COVERAGE.filter((item) => item.status === 'implemented').map((item) => item.scheme), [2, 8]);
});
