import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildSessionReviewAlerts, buildCheckInReviewAlert, buildFeedbackReviewAlert, buildAuditReviewAlert, buildDeloadReviewAlert, buildPhaseReviewDueAlert } = require('../functions/review-alert-builder.js');
const student = { coachUid: 'coach-1', displayName: 'Hải Phong', clientCategory: 'online' };

test('session creates stable actionable alerts without duplicates', () => {
  const input = { studentId: 'student-1', student, sessionId: 'session-1', session: { dayLabel: 'Upper', durationSeconds: 1800,
    completionContext: { endedEarly: true, earlyEndReason: 'fatigue', earlyEndReasonNote: 'Mệt' }, exerciseLogs: [
      { assignmentId: 'a1', exerciseId: 'bench', exerciseName: 'Bench Press', outcome: 'hold', plannedSetCount: 4, adjustedSetCount: 2,
        completionReason: 'pain', completionReasonNote: 'Đau vai', progressionHeld: true, actualSets: [{ weight: 50, reps: 8 }] },
    ] }, previousSessions: [] };
  const first = buildSessionReviewAlerts(input); const retry = buildSessionReviewAlerts(input);
  assert.deepEqual(first.map((x) => x.id), retry.map((x) => x.id));
  assert.ok(first.some((x) => x.data.type === 'pain' && x.data.priority === 'urgent'));
  assert.ok(first.some((x) => x.data.type === 'reduced-sets'));
  assert.ok(first.some((x) => x.data.type === 'early-end'));
});

test('check-in, feedback and abnormal manual TM are filtered conservatively', () => {
  assert.equal(buildCheckInReviewAlert({ studentId: 's', student, checkInId: 'c1', checkIn: { jointPain: 1 } }), null);
  assert.ok(buildCheckInReviewAlert({ studentId: 's', student, checkInId: 'c2', checkIn: { jointPain: 2 } }));
  assert.ok(buildFeedbackReviewAlert({ studentId: 's', student, noteId: 'n1', note: { authorRole: 'student', visibility: 'shared', body: 'Cần xem form' } }));
  assert.equal(buildAuditReviewAlert({ studentId: 's', student, auditId: 'a1', audit: { source: 'coach-manual', changes: [{ field: 'trainingMax', before: 100, after: 108 }] } }), null);
  assert.ok(buildAuditReviewAlert({ studentId: 's', student, auditId: 'a2', audit: { source: 'coach-manual', changes: [{ field: 'trainingMax', before: 100, after: 112 }] } }));
});

test('operational triage flags repeated decline and implausible duration without changing source data', () => {
  const session = { dayLabel: 'Lower', durationSeconds: 5 * 60 * 60, exerciseLogs: [
    { assignmentId: 'deadlift', exerciseId: 'deadlift', outcome: 'down', actualSets: [{ weight: 100, reps: 5 }] },
  ] };
  const snapshot = structuredClone(session);
  const alerts = buildSessionReviewAlerts({ studentId: 's', student, sessionId: 'long-session', session,
    previousSessions: [{ exerciseLogs: [{ assignmentId: 'deadlift', exerciseId: 'deadlift', outcome: 'down' }] }] });
  assert.ok(alerts.some((item) => item.data.type === 'data-quality'));
  assert.ok(alerts.some((item) => item.data.type === 'performance-decline'));
  assert.deepEqual(session, snapshot);
});

test('RIR calibration alert requires two consecutive deviations and never changes the programme', () => {
  const previous = {
    id: 'rir-previous', performedAt: new Date('2026-09-08T12:00:00Z'), dayLabel: 'Upper',
    exerciseLogs: [{ assignmentId: 'bench', phaseId: 'phase-1', exerciseId: 'bench_press', scheme: 2,
      planned: { targetRIR: 2 }, actualSets: [{ weight: 60, reps: 6, rir: 0 }] }],
  };
  const current = structuredClone(previous);
  current.id = 'rir-current'; current.performedAt = new Date('2026-09-15T12:00:00Z');
  const snapshot = structuredClone(current);
  const alerts = buildSessionReviewAlerts({ studentId: 's', student, sessionId: 'rir-current', session: current, previousSessions: [previous] });
  const alert = alerts.find((item) => item.data.type === 'rir-calibration');
  assert.ok(alert);
  assert.match(alert.data.summary, /không tự sửa giáo án/i);
  assert.deepEqual(current, snapshot);
});

test('one RIR deviation alone does not create a calibration alert', () => {
  const current = { performedAt: new Date('2026-09-15T12:00:00Z'), dayLabel: 'Upper', exerciseLogs: [
    { assignmentId: 'bench', phaseId: 'phase-1', exerciseId: 'bench_press', scheme: 2,
      planned: { targetRIR: 2 }, actualSets: [{ weight: 60, reps: 6, rir: 0 }] },
  ] };
  const alerts = buildSessionReviewAlerts({ studentId: 's', student, sessionId: 'one-rir', session: current, previousSessions: [] });
  assert.equal(alerts.some((item) => item.data.type === 'rir-calibration'), false);
});

test('rep-out calibration creates an advisory alert at two reps error', () => {
  const session = { dayLabel: 'Upper', exerciseLogs: [{
    assignmentId: 'bench', exerciseId: 'bench_press', exerciseName: 'Bench Press', outcome: 'hold',
    actualSets: [{ weight: 60, reps: 8, rir: 2 }],
    stage5: { repOutTest: { predictedRir: 2, extraReps: 4, error: 2, absoluteError: 2 } },
  }] };
  const alerts = buildSessionReviewAlerts({ studentId: 's', student, sessionId: 'repout-1', session, previousSessions: [] });
  const alert = alerts.find((item) => item.data.type === 'rir-calibration');
  assert.ok(alert);
  assert.match(alert.data.summary, /không tự sửa giáo án/i);
});

test('Stage 4 adds only actionable deload and review-due alerts', () => {
  const phase = { id: 'p1', name: 'Phase 1', status: 'active', activationRevision: 1, plannedEndDate: '2026-09-18', activatedAt: new Date('2026-08-01') };
  const assignments = [{ id: 'a1', phaseId: 'p1' }];
  const sessions = [1, 2].map((week) => ({ performedAt: new Date(`2026-09-0${week}T12:00:00Z`), exerciseLogs: [{ assignmentId: 'a1', exerciseId: 'bench', outcome: 'down' }] }));
  const deload = buildDeloadReviewAlert({ studentId: 's', student, phase, assignments, sessions,
    checkIns: [{ submittedAt: new Date(), fatigue: 5, performance: 1 }, { submittedAt: new Date(), fatigue: 5, performance: 1 }] });
  assert.equal(deload.data.type, 'deload-recommendation');
  assert.match(deload.data.summary, /David/i);
  const due = buildPhaseReviewDueAlert({ studentId: 's', student, phase, phaseReview: null, now: new Date('2026-09-16T00:00:00Z').getTime() });
  assert.equal(due.data.type, 'phase-review-due');
  assert.equal(buildPhaseReviewDueAlert({ studentId: 's', student, phase, phaseReview: { status: 'locked' }, now: Date.now() }), null);
});

test('missing RIR is not mistaken for a zero-RIR deload signal', () => {
  const phase = { id: 'p1', name: 'Phase 1', status: 'active', activationRevision: 1 };
  const assignments = [{ id: 'a1', phaseId: 'p1' }];
  const sessions = [1, 2].map((week) => ({ performedAt: new Date(`2026-09-0${week}T12:00:00Z`), exerciseLogs: [
    { assignmentId: 'a1', exerciseId: 'bench', planned: { targetRIR: 3 }, actualSets: [{ weight: 60, reps: 6, rir: null }] },
  ] }));
  const alert = buildDeloadReviewAlert({ studentId: 's', student, phase, assignments, sessions,
    coachingAlerts: [{ type: 'general-joint-pain', latestJointPain: 2, status: 'open' }],
    checkIns: [{ fatigue: 5, performance: 1 }, { fatigue: 5, performance: 1 }] });
  assert.ok(alert);
  assert.doesNotMatch(alert.data.summary, /lệch từ 2 RIR/i);
});
