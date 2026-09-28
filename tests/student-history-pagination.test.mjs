import assert from 'node:assert/strict';
import test from 'node:test';

import { analyticsWindowStart, mergeSessionPages } from '../student-history-utils.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-09-27T12:00:00Z');

test('analytics window always includes the full active phase when it is older than 12 weeks', () => {
  const phaseStart = new Date(NOW - 20 * 7 * DAY);
  assert.equal(analyticsWindowStart({ activatedAt: phaseStart }, { now: NOW, weeks: 12 }).getTime(), phaseStart.getTime());
});

test('analytics window stays bounded to 12 weeks for a recent phase or legacy student', () => {
  const twelveWeeksAgo = NOW - 12 * 7 * DAY;
  const recentPhase = new Date(NOW - 4 * 7 * DAY);
  assert.equal(analyticsWindowStart({ activatedAt: recentPhase }, { now: NOW }).getTime(), twelveWeeksAgo);
  assert.equal(analyticsWindowStart(null, { now: NOW }).getTime(), twelveWeeksAgo);
});

test('session pages merge newest-first without duplicate history cards', () => {
  const sessions = mergeSessionPages(
    [{ id: 's3', loggedAt: new Date(NOW - DAY) }, { id: 's2', loggedAt: new Date(NOW - 2 * DAY), dayLabel: 'A' }],
    [{ id: 's2', loggedAt: new Date(NOW - 2 * DAY), dayLabel: 'Upper' }, { id: 's1', loggedAt: new Date(NOW - 3 * DAY) }],
  );
  assert.deepEqual(sessions.map((item) => item.id), ['s3', 's2', 's1']);
  assert.equal(sessions[1].dayLabel, 'Upper');
});
