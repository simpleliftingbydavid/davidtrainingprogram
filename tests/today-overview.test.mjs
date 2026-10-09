// Run with:  node tests/today-overview.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { todayOverview } from '../today-overview-utils.js';
import { todayOverviewMarkup } from '../today-overview-ui.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const NOW = new Date('2026-10-09T05:00:00Z');          // Friday noon in Vietnam
const DAY = 86400000;
const ago = (days) => new Date(NOW.getTime() - days * DAY);
const student = (id, displayName, lastDaysAgo, extra = {}) => ({
  id, displayName, createdAt: ago(60),
  activity: lastDaysAgo === undefined ? undefined : { lastSessionAt: lastDaysAgo === null ? null : ago(lastDaysAgo), recentSessionDays: [] },
  ...extra,
});

check('students are sorted into trained today, late and waiting for a first session', () => {
  const overview = todayOverview({
    students: [student('a', 'An', 0.1), student('b', 'Bình', 3), student('c', 'Chi', 9), student('d', 'Dũng', 30), student('e', 'Em', null)],
    now: NOW,
  });
  assert.deepEqual(overview.trainedToday.map((s) => s.id), ['a']);
  assert.deepEqual(overview.late.map((item) => [item.student.id, item.daysSince]), [['d', 30], ['c', 9]], 'the longest gap first');
  assert.deepEqual(overview.notStarted.map((item) => item.student.id), ['e']);
  assert.equal(overview.needAMessage, 3);
  assert.equal(overview.total, 5);
});

check('someone who joined this week and has not trained yet is new, not late', () => {
  const overview = todayOverview({ students: [student('n', 'Mới', null, { createdAt: ago(3) })], now: NOW });
  assert.equal(overview.needAMessage, 0);
  assert.equal(overview.notStarted.length, 0);
});

check('a student whose summary is not written yet is counted as pending, never as late', () => {
  const overview = todayOverview({ students: [student('x', 'Chưa có', undefined), student('y', 'Có', 2)], now: NOW });
  assert.equal(overview.pending, 1);
  assert.equal(overview.late.length, 0);
});

check('urgent alerts are totalled and the students with some are counted', () => {
  const overview = todayOverview({ students: [student('a', 'An', 1)], urgentCounts: new Map([['a', 2], ['b', 5], ['c', 0]]), now: NOW });
  assert.deepEqual([overview.urgentTotal, overview.urgentStudents], [7, 2]);
});

check('an empty list gives an empty overview', () => {
  const overview = todayOverview({ now: NOW });
  assert.deepEqual([overview.total, overview.needAMessage, overview.urgentTotal, overview.pending], [0, 0, 0, 0]);
});

const sample = () => todayOverview({
  students: [student('a', 'An', 0.1), student('c', 'Chi <b>x</b>', 9)], urgentCounts: new Map([['a', 1]]), now: NOW,
});

check('the block shows the three figures', () => {
  const html = todayOverviewMarkup(sample(), { dateLabel: 'Thứ Sáu, 9/10' });
  assert.match(html, /<strong>1<small>\/2<\/small><\/strong><span>Đã tập hôm nay/);
  assert.match(html, /<strong>1<\/strong><span>Nên nhắn tin hôm nay/);
  assert.match(html, /Cảnh báo khẩn · 1 học viên/);
  assert.match(html, /Thứ Sáu, 9\/10/);
});

check('the students to message are listed with how long it has been, and each opens its profile', () => {
  const html = todayOverviewMarkup(sample());
  assert.match(html, /data-open-student="c"/);
  assert.match(html, /9 ngày chưa tập/);
});

check('names are escaped and a hint is shown beside a name that could be confused', () => {
  const html = todayOverviewMarkup(sample(), { hints: new Map([['c', 'nhóm sáng']]) });
  assert.doesNotMatch(html, /<b>x<\/b>/);
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(html, /<small class="student-hint">nhóm sáng<\/small>/);
});

check('when nobody is late the block says so instead of showing an empty list', () => {
  const html = todayOverviewMarkup(todayOverview({ students: [student('a', 'An', 1)], now: NOW }));
  assert.match(html, /Không ai quá 7 ngày chưa tập/);
  assert.doesNotMatch(html, /today-messages/);
});

check('a long list is cut at ten with a note about the rest', () => {
  const many = Array.from({ length: 13 }, (_, i) => student(`s${i}`, `Học viên ${i}`, 10 + i));
  const html = todayOverviewMarkup(todayOverview({ students: many, now: NOW }));
  assert.equal((html.match(/class="today-student"/g) || []).length, 10);
  assert.match(html, /và 3 học viên nữa/);
});

check('students still being updated are mentioned, and the trained-today list is collapsed', () => {
  const html = todayOverviewMarkup(todayOverview({ students: [student('a', 'An', 0.1), student('p', 'P', undefined)], now: NOW }));
  assert.match(html, /1 học viên đang được cập nhật/);
  assert.match(html, /<details class="today-trained" id="today-trained">/);
});

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');

check('the block sits above the review queue and refreshes whenever the list or the alerts change', () => {
  assert.ok(coach.indexOf('id="today-overview"') < coach.indexOf('id="review-dashboard"'));
  assert.match(coach, /todayOverviewBlock\.update\(\{ students, urgentCounts: reviewDashboard\.urgentCountsByStudent\(\) \}\)/);
  assert.match(coach, /reviewDashboard\.setSummary\(summary\); renderStudentDirectory\(\); refreshTodayOverview\(\);/);
  assert.match(coach, /habitOverview\.setStudents\(students\);\s*refreshTodayOverview\(\);/);
});

console.log(`today-overview: ${passed} passed`);
