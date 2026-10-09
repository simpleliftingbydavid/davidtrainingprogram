// Run with:  node tests/habit-overview.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { habitOverviewMarkup } from '../habit-overview-ui.js';
import { habitOverview } from '../habit-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const TODAY = '2026-10-10';
const habit = (overrides = {}) => ({
  id: 'h1', name: 'Ăn đủ protein', cue: 'Sau khi đánh răng', twoMinute: 'Uống sữa', reward: '', startedOn: '2026-10-01', ...overrides,
});
const entry = (id, name, logs, extra = {}) => ({
  student: { id, displayName: name, clientCategory: 'online' }, plan: { habits: [habit()] },
  logs: Object.fromEntries(Object.entries(logs).map(([day, status]) => [day, { h1: status }])), ...extra,
});

check('a student who missed two days is flagged, a steady one is not', () => {
  const html = habitOverviewMarkup(habitOverview([
    entry('a', 'An', { '2026-10-09': 'full', '2026-10-08': 'full' }),
    entry('b', 'Bình', { '2026-10-07': 'full' }),
  ], TODAY));
  assert.equal((html.match(/Cần hỏi thăm/g) || []).length, 1);
  assert.match(html, /bỏ lỡ 2 ngày liền/);
  assert.ok(html.indexOf('Bình') < html.indexOf('An'), 'the student who needs a word comes first');
});

check('each row links to that student, with the uid encoded', () => {
  const html = habitOverviewMarkup(habitOverview([entry('a b&c', 'An', { '2026-10-09': 'full' })], TODAY));
  assert.match(html, /href="habits\.html\?student=a%20b%26c"/);
});

check('names and habit text are escaped, never injected as markup', () => {
  const hostile = entry('a', '<img src=x onerror=alert(1)>', { '2026-10-09': 'full' });
  hostile.plan = { habits: [habit({ name: '<script>alert(1)</script>' })] };
  const html = habitOverviewMarkup(habitOverview([hostile, entry('b', '"><b>', {}, { plan: null })], TODAY));
  assert.doesNotMatch(html, /<img|<script|<b>/);
  assert.match(html, /&lt;script&gt;/);
});

check('students with no plan and unreadable students are named, not hidden', () => {
  const html = habitOverviewMarkup(habitOverview([
    entry('a', 'An', { '2026-10-09': 'full' }),
    entry('b', 'Bình', {}, { plan: { habits: [] } }),
    { student: { id: 'c', displayName: 'Chi' }, failed: true },
  ], TODAY));
  assert.match(html, /Chưa thiết lập \(1\): Bình/);
  assert.match(html, /Chưa tải được \(1\): Chi/);
});

check('with nobody set up the coach is told so', () => {
  assert.match(habitOverviewMarkup(habitOverview([], TODAY)), /Chưa có học viên nào thiết lập thói quen/);
});

check('a streak as long as the 30-day read window shows as 30+', () => {
  const logs = {};
  for (let day = 1; day <= 30; day++) logs[`2026-09-${String(day).padStart(2, '0')}`] = 'full';
  for (let day = 1; day <= 9; day++) logs[`2026-10-0${day}`] = 'full';
  const long = entry('a', 'An', logs, { plan: { habits: [habit({ startedOn: '2026-08-01' })] } });
  assert.match(habitOverviewMarkup(habitOverview([long], TODAY)), /Chuỗi 30\+ ngày/);
});

const coach = await readFile(new URL('../coach.html', import.meta.url), 'utf8');
const overviewUi = await readFile(new URL('../habit-overview-ui.js', import.meta.url), 'utf8');

check('coach.html mounts the overview and feeds it the student list', () => {
  assert.match(coach, /<section id="habit-overview" class="habit-overview"><\/section>/);
  assert.match(coach, /createHabitOverviewController\(\{\s*root: document\.getElementById\('habit-overview'\)/);
  assert.match(coach, /reviewDashboard\.setStudents\(students\);\s*habitOverview\.setStudents\(students\);/);
});

check('nothing is read until the coach opens the section, and logs only for students with a plan', () => {
  assert.match(overviewUi, /details\.addEventListener\('toggle'/);
  assert.match(overviewUi, /if \(details\.open && \(state === 'idle' \|\| state === 'error'\)\) void load\(\)/);
  assert.match(coach, /plan\.habits\.length \? await listHabitLogs\(studentUid, \{ days \}\) : \{\}/);
});

console.log(`habit-overview: ${passed} passed`);
