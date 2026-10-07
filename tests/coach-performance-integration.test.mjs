import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const coach = await readFile(new URL('coach.html', root), 'utf8');
const dashboard = await readFile(new URL('review-dashboard-ui.js', root), 'utf8');
const data = await readFile(new URL('training-data.js', root), 'utf8');

test('Coach initially loads 20 history rows while analytics use a bounded time window', () => {
  assert.match(coach, /listSessionHistoryPage\(studentId, \{ max: 20 \}\)/);
  assert.match(coach, /listSessionHistorySince\(studentId, \{ since: analyticsWindowStart\(activePhase\) \}\)/);
  assert.match(coach, /listVolumeCheckInsSince\(studentId, \{ since: analyticsWindowStart\(activePhase\) \}\)/);
  assert.match(coach, /listCoachingAlerts\(studentId, \{ activeOnly: true \}\)/);
  assert.doesNotMatch(coach, /listSessionHistory\(selectedStudentId, \{ max: null \}\)/);
  assert.match(coach, /Xem thêm 20 buổi/);
});

test('review dashboard paginates and only creates cards after a group opens', () => {
  assert.match(data, /subscribeCoachReviewAlerts[\s\S]*?\{ max = 20 \}/);
  assert.match(data, /listCoachReviewAlertsPage[\s\S]*?startAfter\(after\)/);
  assert.match(dashboard, /details\.addEventListener\('toggle', materialize\)/);
  assert.match(dashboard, /if \(!details\.open \|\| details\.querySelector\('\.review-list'\)\) return/);
  assert.match(dashboard, /Tải thêm 20 cảnh báo/);
});
