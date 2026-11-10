// Một chỗ ghi cân hằng ngày, sửa thay vì thêm bản trùng, 1 số mỗi ngày (David chốt 2026-11-10).
//   node tests/body-weight-entry.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { logOnDay, oneLogPerDay, weighInAction } from '../body-weight-utils.js';
import { weightTrend } from '../home-utils.js';
import { weeklyWeightAverages } from '../progress-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const ts = (iso) => ({ toDate: () => new Date(iso) });

check('the day\'s last weigh-in is found by time, whatever the order and the stored type', () => {
  const logs = [
    { id: 'b', weight: 70.4, loggedAt: '2026-11-10T01:30:00.000Z' }, // chuỗi ISO cũ, 08:30 giờ VN
    { id: 'a', weight: 70.8, loggedAt: ts('2026-11-10T00:10:00Z') },
    { id: 'c', weight: 71, loggedAt: ts('2026-11-09T10:00:00Z') },
  ];
  assert.equal(logOnDay(logs, '2026-11-10').id, 'b');
  assert.equal(logOnDay(logs, '2026-11-09').id, 'c');
  assert.equal(logOnDay(logs, '2026-11-08'), null);
  assert.equal(logOnDay([{ weight: 70, loggedAt: ts('2026-11-10T01:00:00Z') }], '2026-11-10'), null, 'không có id thì không sửa được');
});

check('days are Vietnam days: 23:30 UTC is the next morning', () => {
  const logs = [{ id: 'x', weight: 70, loggedAt: ts('2026-11-09T23:30:00Z') }];
  assert.equal(logOnDay(logs, '2026-11-10').id, 'x');
  assert.equal(logOnDay(logs, '2026-11-09'), null);
});

check('saving again on a weighed day edits it; an empty day adds', () => {
  const logs = [{ id: 'a', weight: 70.8, loggedAt: ts('2026-11-10T00:10:00Z') }];
  assert.deepEqual(weighInAction(logs, '2026-11-10'), { mode: 'update', id: 'a', previous: 70.8 });
  assert.deepEqual(weighInAction(logs, '2026-11-11'), { mode: 'add' });
  assert.deepEqual(weighInAction([], '2026-11-10'), { mode: 'add' });
});

check('history shows one weight per day, the last one, newest first', () => {
  const logs = [
    { id: '1', weight: 71, loggedAt: ts('2026-11-08T00:00:00Z') },
    { id: '2', weight: 70.5, loggedAt: ts('2026-11-10T00:00:00Z') },
    { id: '3', weight: 70.2, loggedAt: ts('2026-11-10T02:00:00Z') },
    { id: '4', weight: 0, loggedAt: ts('2026-11-09T00:00:00Z') },
  ];
  assert.deepEqual(oneLogPerDay(logs).map((log) => [log.day, log.id, log.weight]), [['2026-11-10', '3', 70.2], ['2026-11-08', '1', 71]]);
});

check('a weighed-twice day counts once in the week (trend and weekly chart)', () => {
  const logs = [
    { weight: 70, loggedAt: ts('2026-11-10T00:00:00Z') },
    { weight: 72, loggedAt: ts('2026-11-10T00:30:00Z') },
    { weight: 70, loggedAt: ts('2026-11-09T00:00:00Z') },
  ];
  const trend = weightTrend(logs, '2026-11-10');
  assert.deepEqual([trend.thisWeek.count, trend.thisWeek.avg, trend.latest.weight], [2, 71, 72]);
  const weeks = weeklyWeightAverages(logs, '2026-11-10', 2).weeks;
  assert.deepEqual(weeks.map((week) => [week.count, week.avg]), [[2, 71]]);
});

check('home shows the state and a link; it no longer writes weight', () => {
  const page = read('home.html');
  assert.doesNotMatch(page, /addBodyWeightLog|updateBodyWeightLog|cu-weighin-value/);
  assert.match(page, /<a class="cu-weighin-link" href="nutrition\.html">/);
  assert.match(page, /Ghi cân ở Dinh dưỡng →/);
  assert.match(page, /'Chưa cân hôm nay'/);
});

check('nutrition: the morning card edits today\'s weigh-in; the hidden daily-log weight is gone', () => {
  const page = read('nutrition.html');
  assert.doesNotMatch(page, /log-weight|'Nhật ký dinh dưỡng'/);
  assert.match(page, /const action = weighInAction\(logs, today\);/);
  assert.match(page, /if \(action\.mode === 'update'\) \{\n\s+await updateBodyWeightLog\(studentUid, action\.id, \{ weight \}\);/);
  assert.equal(page.match(/addBodyWeightLog\(/g).length, 1, 'chỉ một chỗ thêm cân');
  assert.match(page, /simpleWeights = await saveTodayWeight\(weight, simpleWeights\);/);
  assert.match(page, /flWeights = await saveTodayWeight\(weight, flWeights\);/);
  assert.match(page, /weightKg: latestWeightKg\(\),/);
});

check('progress: back-fill a past day, edit a day already weighed, one row per day', () => {
  const page = read('progress-photos.html');
  assert.match(page, /\+ Ghi bù ngày trước/);
  assert.match(page, /const action = weighInAction\(weightLogs, dateVal\);/);
  assert.match(page, /updateBodyWeightLog\(targetUid, action\.id, \{ weight: val \}\)/);
  assert.match(page, /const days = oneLogPerDay\(logs\);/);
  assert.match(page, /\$\('weight-date'\)\.max = todayIso\(\);/);
});

check('the data layer edits in place and keeps loggedAt', () => {
  const data = read('training-data.js');
  assert.match(data, /export async function updateBodyWeightLog\(studentUid, logId, \{ weight, note \} = \{\}\) \{\n {2}const change = \{ weight, updatedAt: serverTimestamp\(\) \};/);
  assert.match(read('firestore.rules'), /match \/bodyWeightLogs\/\{logId\} \{\n\s+allow read, create, update, delete: if canAccessStudent\(studentId\);/);
});

console.log(`BODY_WEIGHT_ENTRY_OK ${passed} passed`);
