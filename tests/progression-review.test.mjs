// Đánh giá progression theo từng bài (David chốt 1a, 2a, 3a ngày 2026-11-12).
//   node tests/progression-review.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../progression-review-core.js');
const serverCore = require('../functions/progression-review-core.js');
const { buildProgressionReviewAlerts, REVIEW_ALERT_TYPE } = require('../functions/review-alert-builder.js');
const { STATUS, setE1rm, buildProgressionReview, newProgressionSignals, statusOf } = core;

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const at = (day) => new Date(`${day}T10:00:00+07:00`);
// One session per entry: [day, weight, reps, rir?] for 'squat'.
const sessionsOf = (rows, id = 'squat') => rows.map(([day, weight, reps, rir], index) => ({
  id: `s${index}`, performedAt: at(day),
  exerciseLogs: [{ exerciseId: id, actualSets: [{ weight, reps: reps - 1 }, { weight, reps, rir }] }],
}));
const statusFor = (rows) => buildProgressionReview({ sessions: sessionsOf(rows), exerciseIds: ['squat'] })[0];

check('e1RM: Epley with RIR added to the reps; no load or no reps gives nothing', () => {
  assert.equal(setE1rm({ weight: 100, reps: 5 }), 100 * (1 + 5 / 30));
  assert.equal(setE1rm({ weight: 100, reps: 5, rir: 2 }), 100 * (1 + 7 / 30));
  assert.equal(setE1rm({ weight: 100, reps: 5, rir: '' }), 100 * (1 + 5 / 30), 'thiếu RIR thì RIR = 0');
  assert.equal(setE1rm({ weight: 100, reps: 5, rir: 9 }), 100 * (1 + 5 / 30), 'RIR ngoài 0–5 bị bỏ');
  assert.equal(setE1rm({ weight: 0, reps: 10 }), null);
  assert.equal(setE1rm({ weight: 80, reps: 0 }), null);
});

check('one value per session (the best set); skipped lifts ignored; a substitute is its own lift', () => {
  const sessions = [
    { id: 'a', performedAt: at('2026-11-01'), exerciseLogs: [
      { exerciseId: 'squat', actualSets: [{ weight: 100, reps: 5 }, { weight: 90, reps: 8 }] },
      { exerciseId: 'bench_press', outcome: 'skipped', actualSets: [{ weight: 60, reps: 5 }] },
      { exerciseId: 'bench_press', substitutedExerciseId: 'db_incline_bench_press', actualSets: [{ weight: 24, reps: 10 }] },
    ] },
  ];
  const rows = buildProgressionReview({ sessions });
  const byId = Object.fromEntries(rows.map((row) => [row.exerciseId, row]));
  assert.equal(byId.squat.latest, Math.round(Math.max(100 * (1 + 5 / 30), 90 * (1 + 8 / 30)) * 10) / 10);
  assert.equal(byId.bench_press, undefined, 'bài bỏ không tính, bài thay thế không gộp vào bài gốc');
  assert.equal(byId.db_incline_bench_press.exposures, 1);
});

check('four statuses', () => {
  assert.equal(statusFor([['2026-11-01', 100, 5], ['2026-11-04', 100, 6]]).status, STATUS.INSUFFICIENT);
  assert.equal(statusFor([['2026-11-01', 100, 5], ['2026-11-04', 102.5, 5], ['2026-11-07', 105, 5], ['2026-11-10', 107.5, 5]]).status, STATUS.PROGRESS);
  const stall = statusFor([['2026-11-01', 100, 5], ['2026-11-04', 105, 5], ['2026-11-07', 105, 5], ['2026-11-10', 105, 4], ['2026-11-13', 105, 5]]);
  assert.equal(stall.status, STATUS.STALL);
  assert.match(stall.evidence, /^3 lần gần nhất .* chưa vượt mức cao nhất 122,5 kg \(04\/11\)\.$/);
  assert.match(stall.suggestion, /thêm 1 set, đổi biến thể bài, hoặc đổi kiểu tăng tiến/);
  const decline = statusFor([['2026-11-01', 100, 5], ['2026-11-04', 110, 5], ['2026-11-07', 100, 5], ['2026-11-10', 100, 4]]);
  assert.equal(decline.status, STATUS.DECLINE);
  assert.match(decline.evidence, /^TB 2 lần gần nhất .* thấp hơn mức cao nhất 128,3 kg \(04\/11\) /);
  assert.match(decline.suggestion, /deload/);
});

check('boundaries: exactly 3 later sessions; exactly 5% is a decline, just under is not', () => {
  const p = (values) => values.map((value, i) => ({ value, day: `2026-11-0${i + 1}`, sessionId: `s${i}` }));
  assert.equal(statusOf(p([100, 100, 100, 100])).status, STATUS.STALL, '3 lần sau mức cao nhất không vượt');
  assert.equal(statusOf(p([100, 100, 100])).status, STATUS.INSUFFICIENT, 'mới 2 lần sau lần đầu: cần thêm 1 lần');
  assert.equal(statusOf(p([100, 99, 101])).status, STATUS.PROGRESS);
  assert.equal(statusOf(p([100, 120, 114, 114])).status, STATUS.DECLINE, '114 = 120 × 0,95');
  assert.equal(statusOf(p([100, 120, 114.5, 114.5])).status, STATUS.PROGRESS, '120 là mức mới trong 3 lần gần nhất');
  assert.equal(statusOf(p([100, 120, 119, 114.5, 114.5])).status, STATUS.STALL, 'giảm 4,6%: chưa tới ngưỡng, nhưng 3 lần chưa vượt 120');
});

check('a rep-progression lift (same load, more reps) reads as progress', () => {
  const row = statusFor([['2026-11-01', 60, 8], ['2026-11-04', 60, 9], ['2026-11-07', 60, 10], ['2026-11-10', 62.5, 8]]);
  assert.equal(row.status, STATUS.PROGRESS);
  assert.ok(row.changePct > 0);
});

check('bodyweight lift: tracked by total reps; stalls but never "declines"', () => {
  const rows = [12, 14, 14, 13, 14].map((reps, i) => ({ id: `b${i}`, performedAt: at(`2026-11-0${i + 1}`),
    exerciseLogs: [{ exerciseId: 'push_up', actualSets: [{ weight: 0, reps }, { weight: 0, reps }] }] }));
  const row = buildProgressionReview({ sessions: rows, exerciseIds: ['push_up'] })[0];
  assert.deepEqual([row.kind, row.status], ['reps', STATUS.STALL]);
  const lower = [20, 20, 10, 10].map((reps, i) => ({ id: `c${i}`, performedAt: at(`2026-11-0${i + 1}`), exerciseLogs: [{ exerciseId: 'push_up', actualSets: [{ weight: 0, reps }] }] }));
  assert.notEqual(buildProgressionReview({ sessions: lower, exerciseIds: ['push_up'] })[0].status, STATUS.DECLINE);
});

check('alerts: only on the session that turns a lift to Chững/Giảm, right type and priority, not repeated', () => {
  const rows = [['2026-11-01', 100, 5], ['2026-11-04', 105, 5], ['2026-11-07', 105, 5], ['2026-11-10', 105, 4], ['2026-11-13', 105, 5], ['2026-11-16', 105, 5]];
  const all = sessionsOf(rows).map((s) => ({ ...s, exerciseLogs: s.exerciseLogs.map((log) => ({ ...log, exerciseNameSnapshot: { vi: 'BB Back Squat' }, assignmentId: 'a1' })) }));
  const student = { coachUid: 'coach1', displayName: 'Huy' };
  const alertAt = (index) => buildProgressionReviewAlerts({ studentId: 'u1', student, sessionId: all[index].id, session: all[index], previousSessions: all.slice(0, index) });
  assert.deepEqual(alertAt(3), [], 'lần thứ 2 sau mức cao nhất: chưa chững');
  const first = alertAt(4);
  assert.equal(first.length, 1);
  assert.deepEqual([first[0].data.type, first[0].data.priority, first[0].data.title], [REVIEW_ALERT_TYPE.PROGRESSION_STALL, 'normal', 'Chững · BB Back Squat']);
  assert.equal(first[0].id, 'progression-stall_u1_squat_stall_s4');
  assert.deepEqual(alertAt(5), [], 'vẫn chững: không báo lại');
  const down = [...all.slice(0, 2), ...sessionsOf([['2026-11-07', 95, 5], ['2026-11-10', 95, 5]]).map((s, i) => ({ ...s, id: `d${i}`, exerciseLogs: s.exerciseLogs.map((log) => ({ ...log, exerciseNameSnapshot: { vi: 'BB Back Squat' } })) }))];
  const declineAlerts = buildProgressionReviewAlerts({ studentId: 'u1', student, sessionId: 'd1', session: down[3], previousSessions: down.slice(0, 3) });
  assert.deepEqual([declineAlerts[0].data.type, declineAlerts[0].data.priority], [REVIEW_ALERT_TYPE.PROGRESSION_DECLINE, 'high']);
  assert.equal(newProgressionSignals({ sessionId: 'missing', sessions: down }).length, 0);
});

check('the browser and Cloud Functions run the same file', () => {
  assert.equal(read('functions/progression-review-core.js'), read('progression-review-core.js'));
  const rows = sessionsOf([['2026-11-01', 100, 5], ['2026-11-04', 105, 5], ['2026-11-07', 105, 5], ['2026-11-10', 105, 4]]);
  assert.deepEqual(serverCore.buildProgressionReview({ sessions: rows }), core.buildProgressionReview({ sessions: rows }));
  assert.match(read('functions/index.js'), /alerts\.push\(\.\.\.buildProgressionReviewAlerts\(\{ studentId, student: studentSnap\.data\(\), sessionId, session, previousSessions \}\)\);/);
});

check('coach page: card on the Theo dõi tab, filter, opened from the alert; queue knows the two types', () => {
  const coach = read('coach.html');
  assert.match(coach, /<script src="\.\/progression-review-core\.js"><\/script>/);
  assert.match(coach, /id="progression-review-card"/);
  assert.match(coach, /data-pr-filter="stall"/);
  assert.match(coach, /e1RM là ước tính để xem xu hướng, không phải 1RM thật/);
  assert.match(coach, /if \(String\(alert\?\.type \|\| ''\)\.startsWith\('progression-'\)\) \{ showTrackCard\('progression-review-card'\); return; \}/);
  assert.match(read('review-dashboard-ui.js'), /onOpenStudent\(item\.studentUid, item\)/);
  assert.match(read('review-dashboard-utils.js'), /'progression-stall': 'Bài chững', 'progression-decline': 'Bài giảm'/);
  assert.doesNotMatch(read('progression-review-core.js'), /updateDoc|setDoc|addDoc|trainingMax =/, 'chỉ đọc, không đổi giáo án');
});

console.log(`PROGRESSION_REVIEW_OK ${passed} passed`);
