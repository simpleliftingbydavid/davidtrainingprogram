// Tạ lệch lớn so với giáo án (2026-11-18): ngưỡng người mới / tập lâu, mức chặn tuyệt đối, xác nhận
// cho phép rebase ngoài 0,5–1,5, dữ liệu đi qua bản nháp → buổi tập, dòng cho David, cảnh báo.
//   node tests/load-jump.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const lj = await import('../load-jump.js');
const { advanceSessionExercise, rebaseLoadToActual } = await import('../workout-session-utils.js');
const { SCHEME } = await import('../progression-engine.js');
const { buildCompletedExerciseEntries } = await import('../session-entry-utils.js');
const { normalizeWorkoutDraft } = await import('../workout-draft-utils.js');
const { reviewAlertText } = await import('../review-alert-text.js');
const { setLang } = await import('../i18n.js');
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { buildSessionReviewAlerts, REVIEW_ALERT_TYPE } = require('./review-alert-builder.js');

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const sets = (weights) => weights.map((weight, index) => ({ setIndex: index + 1, weight, reps: 5, rir: 2 }));
const DAY = 24 * 3600 * 1000;
const NOW = Date.parse('2026-11-18T10:00:00Z');
const session = (daysAgo, exerciseId = 'squat') => ({ performedAt: new Date(NOW - daysAgo * DAY), exerciseLogs: [{ exerciseId, actualSets: sets([60]) }] });

await check('settings: defaults, clamping, and the coach form check', () => {
  const d = lj.normalizeLoadJumpSettings({});
  assert.deepEqual(d, { newbieExposures: 6, newbieWeeks: 8, newbie: { heavier: 1.5, lighter: 0.6 }, experienced: { heavier: 1.2, lighter: 0.8 } });
  const odd = lj.normalizeLoadJumpSettings({ newbieExposures: '999', newbie: { heavier: '1,3', lighter: 'x' }, experienced: { heavier: 0.5 } });
  assert.equal(odd.newbieExposures, 50);
  assert.equal(odd.newbie.heavier, 1.3, 'Vietnamese comma accepted');
  assert.equal(odd.newbie.lighter, 0.6, 'bad value → default');
  assert.equal(odd.experienced.heavier, 1.05, 'clamped to the lowest allowed');
  assert.deepEqual(lj.loadJumpSettingsErrors({ newbieExposures: 6, newbieWeeks: 8, newbie: { heavier: '1,5', lighter: '0,6' }, experienced: { heavier: 1.2, lighter: 0.8 } }), []);
  assert.equal(lj.loadJumpSettingsErrors({ newbieExposures: 2.5, newbieWeeks: 0, newbie: { heavier: 4, lighter: 1 }, experienced: { heavier: 1.2, lighter: 0.8 } }).length, 4);
});

await check('new to a lift: few sessions of it, or the first weeks; a cut history never counts as "first weeks"', () => {
  const few = [session(200), session(150)];
  assert.equal(lj.isNewbieFor({ sessions: few, exerciseId: 'squat', now: NOW }), true, '2 sessions < 6');
  const many = Array.from({ length: 8 }, (_, i) => session(100 + i));
  assert.equal(lj.isNewbieFor({ sessions: many, exerciseId: 'squat', now: NOW }), false, '8 sessions over 14 weeks ago');
  const recent = Array.from({ length: 8 }, (_, i) => session(10 + i));
  assert.equal(lj.isNewbieFor({ sessions: recent, exerciseId: 'squat', now: NOW }), true, 'all within 8 weeks');
  assert.equal(lj.isNewbieFor({ sessions: recent, exerciseId: 'squat', now: NOW, historyCapped: true }), false);
  assert.equal(lj.isNewbieFor({ sessions: many, exerciseId: 'bench', now: NOW }), true, 'a lift never done is new');
  const skipped = [...many.slice(0, 5), ...Array.from({ length: 3 }, (_, i) => ({ performedAt: new Date(NOW - (90 + i) * DAY), exerciseLogs: [{ exerciseId: 'squat', outcome: 'skipped' }] }))];
  assert.equal(lj.isNewbieFor({ sessions: skipped, exerciseId: 'squat', now: NOW }), true, 'skipped ones do not count');
});

await check('thresholds differ for new and experienced, both directions; far off is refused', () => {
  const c = (actual, newbie) => lj.classifyLoadJump({ planned: 20, actual, newbie }).kind;
  assert.equal(c(29, true), 'ok', '1.45× is normal for a beginner');
  assert.equal(c(35, true), 'heavier', '1.75×');
  assert.equal(c(29, false), 'heavier', '1.45× is a lot for an experienced lifter');
  assert.equal(c(23, false), 'ok', '1.15×');
  assert.equal(c(11, true), 'lighter', '0.55×');
  assert.equal(c(15, false), 'lighter', '0.75×');
  assert.equal(c(61, true), 'blocked', 'over 3×');
  assert.equal(c(4, false), 'blocked', 'under 0.25×');
  assert.equal(lj.classifyLoadJump({ planned: 0, actual: 40 }).kind, 'ok', 'no plan: nothing to compare');
  assert.equal(lj.classifyLoadJump({ planned: 20, actual: 30, newbie: false, settings: { experienced: { heavier: 1.6, lighter: 0.8 } } }).kind, 'ok', "David's own limit");
});

const overload = { scheme: SCHEME.CLASSIC_OVERLOAD, schemeParams: { plannedSets: 3, repsPerSet: 5, increment: 2.5, roundingIncrement: 2.5 } };

await check('without a confirmation nothing changes: past 1.5× is still ignored', () => {
  const state = { workingWeight: 20, consecutiveMisses: 0 };
  assert.equal(rebaseLoadToActual({ ...overload, state, actualSets: sets([35, 35, 35]) }).rebase, null);
  assert.deepEqual(rebaseLoadToActual({ ...overload, state, actualSets: sets([25, 25, 25]) }).rebase, { from: 20, to: 25 }, 'inside 0.5–1.5 as before');
});

await check('confirmed: the next load starts from what was lifted, up to the hard limits', () => {
  const state = { workingWeight: 20, consecutiveMisses: 0 };
  const out = advanceSessionExercise({ ...overload, state, actualSets: sets([35, 35, 35]), adjustedSetCount: 3, loadJumpConfirmed: true });
  assert.deepEqual(out.delta.loadRebase, { from: 20, to: 35 });
  assert.ok(out.nextPrescription.weight >= 35, `next ${out.nextPrescription.weight}`);
  const down = advanceSessionExercise({ ...overload, state: { workingWeight: 60, consecutiveMisses: 0 }, actualSets: sets([25, 25, 25]), adjustedSetCount: 3, loadJumpConfirmed: true });
  assert.deepEqual(down.delta.loadRebase, { from: 60, to: 25 });
  assert.equal(rebaseLoadToActual({ ...overload, state, actualSets: sets([70, 70, 70]), loadJumpConfirmed: true }).rebase, null, 'over 3× never');
  const held = advanceSessionExercise({ ...overload, state, actualSets: sets([35, 35, 35]), adjustedSetCount: 3, loadJumpConfirmed: true, forceHold: true });
  assert.equal(held.delta.loadRebase, undefined, 'a held session still holds');
});

await check('the record travels: draft → session entry; only programme lifts that were not swapped', () => {
  const jump = { dir: 'heavier', planned: 20, actual: 35, newbie: true, confirmed: true };
  assert.deepEqual(lj.normalizeLoadJump(jump), { dir: 'heavier', planned: 20, actual: 35, ratio: 1.75, newbie: true, confirmed: true });
  assert.equal(lj.normalizeLoadJump({ ...jump, confirmed: false }), null);
  assert.equal(lj.normalizeLoadJump({ ...jump, dir: 'lighter' }), null, 'direction must match the numbers');
  const draft = normalizeWorkoutDraft({ day: 'A', sessionId: 's1', exercises: [{ assignmentId: 'a1', loadJumpAsked: true, loadJump: jump }, { assignmentId: 'a2' }] });
  assert.equal(draft.exercises[0].loadJumpAsked, true);
  assert.equal(draft.exercises[0].loadJump.actual, 35);
  assert.equal(draft.exercises[1].loadJump, null);
  const base = { assignmentId: 'a1', exerciseId: 'squat', sets: [{ completed: true, weight: 35, reps: 5 }], loadJump: jump };
  assert.equal(buildCompletedExerciseEntries([base])[0].loadJump.ratio, 1.75);
  assert.equal(buildCompletedExerciseEntries([{ ...base, substitutedExerciseId: 'leg_press' }])[0].loadJump, undefined);
  assert.equal(buildCompletedExerciseEntries([{ ...base, source: 'extra' }])[0].loadJump, undefined);
});

await check("David's line in Đánh giá progression, VI and EN", () => {
  const sessions = [
    { performedAt: new Date('2026-11-10T03:00:00Z'), dayLabel: 'A', exerciseLogs: [{ exerciseId: 'squat', loadJump: { dir: 'heavier', planned: 20, actual: 30, newbie: true, confirmed: true } }] },
    { performedAt: new Date('2026-11-17T03:00:00Z'), dayLabel: 'A', exerciseLogs: [{ exerciseId: 'squat', loadJump: { dir: 'heavier', planned: 30, actual: 50, newbie: true, confirmed: true } }, { exerciseId: 'bench' }] },
  ];
  const map = lj.loadJumpsByExercise(sessions);
  assert.equal(map.size, 1);
  assert.equal(map.get('squat').count, 2);
  assert.equal(map.get('squat').latest.actual, 50, 'newest first');
  setLang('vi');
  const vi = lj.loadJumpText(map.get('squat'));
  assert.equal(vi.label, 'Lệch lớn: nặng hơn giáo án');
  assert.equal(vi.text, '17/11: giáo án 30 kg → đã tập 50 kg (67%) · 2 lần · người mới');
  setLang('en');
  assert.equal(lj.loadJumpText(map.get('squat')).text, '17/11: planned 30 kg → lifted 50 kg (67%) · 2 times · new to this lift');
  setLang('vi');
});

await check('a "Cần xem lại" alert per confirmed gap, shown in English too', () => {
  const alerts = buildSessionReviewAlerts({
    studentId: 'st1', student: { coachUid: 'c1', displayName: 'Huy' }, sessionId: 's9',
    session: { dayLabel: 'Buổi A', exerciseLogs: [
      { assignmentId: 'a1', exerciseId: 'squat', exerciseNameSnapshot: { vi: 'Squat' }, actualSets: sets([35]), loadJump: { dir: 'heavier', planned: 20, actual: 35, ratio: 1.75, newbie: true, confirmed: true } },
      { assignmentId: 'a2', exerciseId: 'bench', exerciseNameSnapshot: { vi: 'Bench' }, actualSets: sets([40]) },
    ] },
  }).filter((alert) => alert.data.type === REVIEW_ALERT_TYPE.LOAD_JUMP);
  assert.equal(alerts.length, 1);
  const { title, summary, latestNote, priority } = alerts[0].data;
  assert.equal(title, 'Nặng hơn giáo án nhiều · Squat');
  assert.equal(summary, 'Buổi A: giáo án 20 kg, học viên xác nhận đã tập 35 kg (75%) · người mới. Mức tạ lần sau tính từ số đã tập.');
  assert.equal(priority, 'normal');
  assert.equal(reviewAlertText(title, 'en'), 'Much heavier than planned · Squat');
  assert.equal(reviewAlertText(summary, 'en'), 'Buổi A: planned 20 kg, the client confirmed lifting 35 kg (75%) · new to this lift. The next load starts from what was lifted.');
  assert.match(reviewAlertText(latestNote, 'en'), /^The starting load may be low/);
});

await check('client.html: asks once per exercise, refuses far-off numbers, carries the record to the save', () => {
  const html = read('client.html');
  const fn = html.slice(html.indexOf('async function confirmLoadJump('), html.indexOf('function renderSetRows('));
  assert.ok(fn.indexOf("verdict.kind === 'blocked'") < fn.indexOf("block.dataset.loadJumpAsked === 'true'"), 'far-off numbers are refused even after a confirmation');
  assert.ok(fn.indexOf("block.dataset.loadJumpAsked === 'true'") < fn.indexOf('confirmDialog('), 'asked once per exercise per session');
  assert.match(fn, /source !== 'assigned' \|\| block\.dataset\.substitutedExerciseId/);
  assert.match(html, /loadJumpAsked: block\.dataset\.loadJumpAsked === 'true',\s*loadJump: blockLoadJump\(block\),/, 'kept in the draft');
  assert.match(html, /loadJump: blockLoadJump\(block\),\s*\}\);/, 'sent with the session');
  const td = read('training-data.js');
  assert.match(td, /loadJumpConfirmed: Boolean\(loadJump\),/);
  assert.match(td, /\.\.\.\(loadJump \? \{ loadJump \} : \{\}\),/);
});

console.log(`LOAD_JUMP_OK ${passed} passed`);
