import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDeloadRecommendation, buildPhaseReviewSnapshot, phaseActivationBlockers, sessionsForPhase,
} from '../deload-review-engine.js';

const phase = { id: 'phase-a', name: 'Hypertrophy', activationRevision: 2, plannedEndDate: '2026-09-30', activatedAt: new Date('2026-08-01') };
const assignments = [{ id: 'a1', phaseId: 'phase-a' }, { id: 'other', phaseId: 'phase-b' }];
const session = (date, extras = {}) => ({ performedAt: new Date(date), exerciseLogs: [{ assignmentId: 'a1', exerciseId: 'bench', outcome: 'hold', planned: { targetRIR: 2 }, actualSets: [{ rir: 2 }] }], ...extras });

test('phase session filter excludes sessions from another phase', () => {
  const rows = [session('2026-09-01'), { performedAt: new Date('2026-09-02'), exerciseLogs: [{ assignmentId: 'other' }] }];
  assert.equal(sessionsForPhase(rows, assignments, phase.id).length, 1);
});

test('reactivating a phase excludes sessions from its previous activation', () => {
  const reactivated = { ...phase, lastActivatedAt: new Date('2026-09-10') };
  const rows = [session('2026-09-01'), session('2026-09-11')];
  assert.deepEqual(sessionsForPhase(rows, assignments, reactivated), [rows[1]]);
});

test('one mild signal never triggers a deload recommendation', () => {
  const result = buildDeloadRecommendation({ phase, assignments, sessions: [session('2026-09-01')], checkIns: [{ submittedAt: new Date('2026-09-02'), fatigue: 4, performance: 2 }] });
  assert.equal(result.status, 'not-needed');
  assert.equal(result.signals.length, 0);
});

test('combined repeated recovery and performance signals recommend coach review only', () => {
  const sessions = [session('2026-09-01'), session('2026-09-08')];
  sessions.forEach((row) => { row.exerciseLogs[0].outcome = 'down'; row.exerciseLogs[0].actualSets[0].rir = 0; });
  const result = buildDeloadRecommendation({ phase, assignments, sessions, checkIns: [
    { submittedAt: new Date('2026-09-02'), fatigue: 5, performance: 1 },
    { submittedAt: new Date('2026-09-09'), fatigue: 4, performance: 1 },
  ] });
  assert.equal(result.status, 'consider-deload');
  assert.ok(result.signals.some((item) => item.id === 'performance'));
  assert.ok(result.signals.some((item) => item.id === 'recovery'));
  assert.equal(Object.hasOwn(result, 'programmePatch'), false);
});

test('open serious pain always requires urgent review', () => {
  const result = buildDeloadRecommendation({ phase, assignments, coachingAlerts: [{ type: 'exercise-pain', status: 'open' }] });
  assert.equal(result.status, 'urgent-review');
});

test('locked snapshot is detached from source inputs and captures activation revision', () => {
  const sessions = [session('2026-09-01')];
  const snapshot = buildPhaseReviewSnapshot({ phase, assignments, sessions, coachReflection: {
    workedWell: 'Ổn định', needsChange: 'Thêm check-in', nextCycleDecision: 'Giữ cấu trúc', notes: '',
  } });
  sessions[0].exerciseLogs[0].outcome = 'down';
  assert.equal(snapshot.status, 'locked');
  assert.equal(snapshot.phase.activationRevision, 2);
  assert.equal(snapshot.performance.hold, 1);
  assert.equal(snapshot.performance.down, 0);
});

test('review requires a concrete coach reflection', () => {
  assert.throws(() => buildPhaseReviewSnapshot({ phase, assignments }), /ba phần/i);
});

test('phase switch needs the review for the exact activation and blocks serious pain', () => {
  assert.deepEqual(phaseActivationBlockers({ activePhase: phase, phaseReview: { status: 'locked', phaseId: phase.id, activationRevision: 1 } })[0].code, 'phase-review-required');
  const blockers = phaseActivationBlockers({ activePhase: phase, phaseReview: { status: 'locked', phaseId: phase.id, activationRevision: 2 }, openSafetyAlerts: [{ type: 'general-joint-pain', latestJointPain: 3, status: 'open' }] });
  assert.equal(blockers.length, 1);
  assert.equal(blockers[0].code, 'safety-alert-open');
});
