// Run with:  node tests/student-activity.test.mjs
// The summary on each student's document, and the line the coach's list draws from it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { LATE_AFTER_DAYS, studentSignal } from '../student-signal-utils.js';

const require = createRequire(import.meta.url);
const { buildStudentActivity, refreshStudentActivity, vietnamDay } = require('../functions/student-activity-utils.js');

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const NOW = new Date('2026-10-09T05:00:00Z').getTime();   // Friday noon in Vietnam
const DAY = 86400000;
const at = (daysAgo) => new Date(NOW - daysAgo * DAY);
const session = (daysAgo, dayLabel = 'A') => ({ performedAt: at(daysAgo), dayLabel });

// ---------- the server side ----------

await check('a day is read in Vietnam time, whatever zone the server runs in', () => {
  assert.equal(vietnamDay(new Date('2026-10-08T18:30:00Z').getTime()), '2026-10-09', '01:30 the next morning in Vietnam');
  assert.equal(vietnamDay(new Date('2026-10-08T16:30:00Z').getTime()), '2026-10-08');
});

await check('the summary holds the newest session and one day per recent session, newest first', () => {
  const summary = buildStudentActivity([session(5, 'B'), session(1, 'C'), session(3, 'A')], NOW);
  assert.equal(summary.lastDayLabel, 'C');
  assert.equal(summary.lastSessionMs, NOW - DAY);
  assert.deepEqual(summary.recentSessionDays, ['2026-10-08', '2026-10-06', '2026-10-04']);
});

await check('two sessions on one day count twice, and sessions older than four weeks drop out of the recent days', () => {
  const summary = buildStudentActivity([session(0.1), session(0.2), session(40)], NOW);
  assert.equal(summary.recentSessionDays.length, 2);
  assert.equal(summary.lastSessionMs, NOW - 0.1 * DAY);
});

await check('no sessions, or unreadable ones, give no summary', () => {
  assert.equal(buildStudentActivity([], NOW), null);
  assert.equal(buildStudentActivity(undefined, NOW), null);
  assert.equal(buildStudentActivity([{ performedAt: null }, { dayLabel: 'A' }], NOW), null);
});

function fakeDb({ sessions = [], studentExists = true } = {}) {
  const writes = [];
  return {
    writes,
    collection: () => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ docs: sessions.map((data) => ({ data: () => data })) }) }) }) }),
    doc: (path) => ({
      update: async (data) => {
        if (!studentExists) { const error = new Error('NOT_FOUND'); error.code = 5; throw error; }
        writes.push({ path, data });
      },
    }),
  };
}

await check('refreshing writes the summary onto the student document', async () => {
  const db = fakeDb({ sessions: [session(1, 'C'), session(3, 'A')] });
  const result = await refreshStudentActivity({ db, studentUid: 's1', now: NOW });
  assert.deepEqual(result, { updated: true });
  assert.equal(db.writes[0].path, 'students/s1');
  const { activity } = db.writes[0].data;
  assert.equal(activity.lastDayLabel, 'C');
  assert.equal(activity.lastSessionAt.toMillis(), NOW - DAY);
  assert.deepEqual(activity.recentSessionDays, ['2026-10-08', '2026-10-06']);
});

await check('a student with no sessions gets an empty summary, so the list does not keep asking', async () => {
  const db = fakeDb({ sessions: [] });
  await refreshStudentActivity({ db, studentUid: 's1', now: NOW });
  assert.deepEqual({ last: db.writes[0].data.activity.lastSessionAt, days: db.writes[0].data.activity.recentSessionDays }, { last: null, days: [] });
});

await check('a deleted student is not brought back by the deletion of their sessions', async () => {
  const db = fakeDb({ sessions: [], studentExists: false });
  assert.deepEqual(await refreshStudentActivity({ db, studentUid: 'gone', now: NOW }), { updated: false });
  assert.equal(db.writes.length, 0);
});

await check('any other write failure is not swallowed', async () => {
  const db = fakeDb({ sessions: [session(1)] });
  db.doc = () => ({ update: async () => { const error = new Error('boom'); error.code = 14; throw error; } });
  await assert.rejects(refreshStudentActivity({ db, studentUid: 's1', now: NOW }), /boom/);
});

// ---------- the line in the coach's list ----------

const activity = (daysAgo, recent) => ({ lastSessionAt: at(daysAgo), recentSessionDays: recent });
const today = new Date(NOW);

await check('nothing is shown until the summary exists', () => {
  assert.equal(studentSignal(undefined, today), null);
  assert.equal(studentSignal(null, today), null);
});

await check('a student who never trained says so', () => {
  assert.deepEqual(studentSignal({ lastSessionAt: null, recentSessionDays: [] }, today), { level: 'none', text: 'Chưa có buổi tập', week: 0, daysSince: null });
});

await check('last trained today, yesterday and some days ago', () => {
  assert.equal(studentSignal(activity(0.1, []), today).text, 'Tập hôm nay');
  assert.equal(studentSignal(activity(1, []), today).text, 'Tập hôm qua');
  assert.equal(studentSignal(activity(4, []), today).text, 'Tập 4 ngày trước');
});

await check('a week or more without a session is flagged late', () => {
  assert.equal(LATE_AFTER_DAYS, 7);
  assert.equal(studentSignal(activity(6, []), today).level, 'ok');
  assert.equal(studentSignal(activity(7, []), today).level, 'late');
  assert.equal(studentSignal(activity(20, []), today).level, 'late');
});

await check('this week counts the sessions since Monday, not the last seven days', () => {
  const recent = ['2026-10-09', '2026-10-07', '2026-10-05', '2026-10-04', '2026-10-01'];
  assert.equal(studentSignal(activity(0.1, recent), today).week, 3);
});

await check('junk in the summary does not break the list', () => {
  assert.equal(studentSignal({ lastSessionAt: at(2), recentSessionDays: 'x' }, today).week, 0);
  assert.equal(studentSignal({ lastSessionAt: at(2), recentSessionDays: [null, 5, '2026-10-08'] }, today).week, 1);
});

// ---------- wiring ----------

const index = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const review = readFileSync(new URL('../review-dashboard-ui.js', import.meta.url), 'utf8');

await check('both functions are exported in the Singapore region, and the callable is coach-only', () => {
  assert.match(index, /exports\.updateStudentActivity = onDocumentWritten\(\{\s*document: 'students\/\{studentId\}\/sessions\/\{sessionId\}', region: 'asia-southeast1'/);
  assert.match(index, /exports\.refreshStudentActivities = onCall\(\{\s*region: 'asia-southeast1'/);
  assert.match(index, /if \(!coach\.exists\) throw new HttpsError\('permission-denied'/);
  assert.match(index, /where\('coachUid', '==', callerUid\)/);
});

await check('the list draws the line and asks for the missing summaries only once per visit', () => {
  assert.match(coach, /studentSignal\(student\.activity\)/);
  assert.match(coach, /reviewDashboard\.urgentCountsByStudent\(\)\.get\(student\.id\)/);
  assert.match(coach, /if \(students\.some\(\(student\) => !student\.activity\)\) void ensureStudentActivity\(\)/);
  assert.match(coach, /if \(activityRefreshRequested\) return;/);
});

await check('urgent counts leave out resolved alerts and technical errors', () => {
  assert.match(review, /item\.priority !== 'urgent' \|\| item\.status === 'resolved' \|\| item\.type === 'technical-error'/);
});

console.log(`student-activity: ${passed} passed`);
