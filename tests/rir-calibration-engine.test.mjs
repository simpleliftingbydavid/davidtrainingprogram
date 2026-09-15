import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildRirCalibrationReport, rirValue, sessionPoint } = require('../rir-calibration-engine.js');

const NOW = Date.parse('2026-09-15T12:00:00Z');
const day = 24 * 60 * 60 * 1000;

function session(id, daysAgo, actualRir, { plannedRir = 2, assignmentId = 'bench-a', phaseId = 'phase-1' } = {}) {
  return {
    id,
    performedAt: new Date(NOW - daysAgo * day),
    dayLabel: 'Upper',
    exerciseLogs: [{
      assignmentId, phaseId, exerciseId: 'bench_press', exerciseNameSnapshot: { vi: 'BB Bench Press' },
      scheme: 2, planned: { targetRIR: plannedRir, sets: 3 }, plannedSetCount: 3, adjustedSetCount: 3,
      actualSets: [{ weight: 60, reps: 6, rir: actualRir }],
    }],
  };
}

test('RIR input distinguishes missing, invalid and valid values', () => {
  assert.deepEqual(rirValue(''), { state: 'missing', value: null });
  assert.deepEqual(rirValue(1.5), { state: 'invalid', value: null });
  assert.deepEqual(rirValue(3), { state: 'valid', value: 3 });
});

test('only a completed RIR-tracked exercise becomes a calibration point', () => {
  const point = sessionPoint(session('s1', 0, 1), session('s1', 0, 1).exerciseLogs[0]);
  assert.equal(point.difference, -1);
  assert.equal(point.exerciseName, 'BB Bench Press');
  assert.equal(sessionPoint({}, { scheme: 8, actualSets: [{ rir: 2 }], exerciseId: 'curl' }), null);
  assert.equal(sessionPoint({}, { scheme: 2, outcome: 'skipped', actualSets: [{ rir: 2 }], exerciseId: 'bench' }), null);
});

test('two consecutive deviations of at least 2 RIR create directional suggestions', () => {
  const heavy = buildRirCalibrationReport([session('h1', 7, 0), session('h2', 0, 0)], { now: NOW })[0];
  assert.equal(heavy.status, 'needs-review');
  assert.equal(heavy.signal, 'too-heavy');
  assert.match(heavy.suggestion, /Training Max/);

  const light = buildRirCalibrationReport([session('l1', 7, 4), session('l2', 0, 5)], { now: NOW })[0];
  assert.equal(light.status, 'needs-review');
  assert.equal(light.signal, 'too-light');

  const mixed = buildRirCalibrationReport([session('m1', 7, 0), session('m2', 0, 4)], { now: NOW })[0];
  assert.equal(mixed.status, 'needs-review');
  assert.equal(mixed.signal, 'inconsistent');
});

test('two consecutive missing last-set RIR values create a data-quality suggestion', () => {
  const report = buildRirCalibrationReport([session('s1', 7, null), session('s2', 0, '')], { now: NOW })[0];
  assert.equal(report.status, 'needs-review');
  assert.equal(report.signal, 'missing-rir');
});

test('4, 8 and 12 week windows stay separate and report planned versus actual averages', () => {
  const report = buildRirCalibrationReport([
    session('recent', 7, 1), session('middle', 42, 2), session('old', 70, 3), session('outside', 90, 4),
  ], { now: NOW })[0];
  assert.equal(report.windows[4].exposures, 1);
  assert.equal(report.windows[8].exposures, 2);
  assert.equal(report.windows[12].exposures, 3);
  assert.equal(report.windows[12].averagePlannedRir, 2);
  assert.equal(report.windows[12].averageActualRir, 2);
});

test('different phases and assignments never contaminate each other', () => {
  const reports = buildRirCalibrationReport([
    session('a', 7, 0, { phaseId: 'phase-1', assignmentId: 'bench-a' }),
    session('b', 0, 0, { phaseId: 'phase-2', assignmentId: 'bench-b' }),
  ], { now: NOW });
  assert.equal(reports.length, 2);
  assert.ok(reports.every((report) => report.signal === 'insufficient-data'));
});

test('unscoped legacy logs remain visible but cannot drive a current-program decision', () => {
  const legacy = session('legacy', 0, 0, { phaseId: '', assignmentId: '' });
  const report = buildRirCalibrationReport([legacy], { now: NOW })[0];
  assert.equal(report.scoped, false);
  assert.equal(report.signal, 'unscoped-legacy');
  assert.equal(report.status, 'insufficient');
});

test('report generation never mutates stored session history', () => {
  const sessions = [session('s1', 7, 1), session('s2', 0, 2)];
  const snapshot = structuredClone(sessions);
  buildRirCalibrationReport(sessions, { now: NOW });
  assert.deepEqual(sessions, snapshot);
});
