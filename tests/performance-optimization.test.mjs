import assert from 'node:assert/strict';
import test from 'node:test';

import { recentAssignmentLogsIndex, volumeSuggestion, weeklyVolumeTrend } from '../volume-engine.js';

const DAY = 86400000;
const NOW = new Date('2026-09-07T12:00:00Z').getTime();
const exercise = { muscleGroup: 'Ngực' };
const lookup = () => exercise;

function session(daysAgo, assignmentId, sets = 2, outcome = 'hold') {
  return {
    performedAt: new Date(NOW - daysAgo * DAY),
    exerciseLogs: [{
      assignmentId,
      exerciseId: 'bench',
      source: 'assigned',
      outcome,
      actualSets: Array.from({ length: sets }, () => ({ reps: 8, weight: 50 })),
    }],
  };
}

test('weeklyVolumeTrend places each session in exactly one weekly bucket', () => {
  const trend = weeklyVolumeTrend([
    session(1, 'a1', 3),
    session(7, 'a1', 2),
    session(8, 'a1', 4),
    session(90, 'a1', 9),
  ], lookup, { weeks: 3, now: NOW });

  assert.equal(trend.length, 3);
  assert.equal(trend[2].volume['Ngực'], 3);
  assert.equal(trend[1].volume['Ngực'], 6);
  assert.equal(trend[0].volume['Ngực'], 0);
});

test('weeklyVolumeTrend ignores skipped logs and sessions outside the window', () => {
  const trend = weeklyVolumeTrend([
    session(2, 'a1', 5, 'skipped'),
    session(30, 'a1', 4),
  ], lookup, { weeks: 2, now: NOW });

  assert.equal(trend.flatMap((row) => Object.values(row.volume)).reduce((sum, value) => sum + value, 0), 0);
});

test('recentAssignmentLogsIndex keeps only the newest logs per assignment', () => {
  const indexed = recentAssignmentLogsIndex([
    session(4, 'a1'),
    session(1, 'a1'),
    session(3, 'a1'),
    session(2, 'a2'),
    session(2, 'a1', 2, 'skipped'),
  ], 2);

  assert.equal(indexed.get('a1').length, 2);
  assert.equal(indexed.get('a2').length, 1);
  assert.deepEqual(indexed.get('a1').map((log) => log.outcome), ['hold', 'hold']);
});

test('cached logs produce the same volume recommendation as raw sessions', () => {
  const sessions = [session(1, 'a1'), session(3, 'a1')];
  const assignment = {
    id: 'a1',
    volumeConfig: { techniqueReady: false, credits: [{ muscleGroup: 'Ngực', credit: 1 }] },
  };
  const args = {
    assignment,
    latestCheckIn: { type: 'volume-recovery', submittedAt: new Date(NOW), fatigue: 2, jointPain: 0, performance: 2, muscleRecovery: { 'Ngực': 4 } },
    activeAlerts: [],
  };
  const direct = volumeSuggestion({ ...args, sessions });
  const cached = volumeSuggestion({ ...args, recentLogs: recentAssignmentLogsIndex(sessions).get('a1') });

  assert.deepEqual(cached, direct);
});
