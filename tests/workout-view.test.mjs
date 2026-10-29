// Run with:  node tests/workout-view.test.mjs
// The workout page's live view (frame D): which exercise is open, the session tally, the
// folded line, the rest band's "next" line, and the shared lift helpers it uses.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exerciseState, headStatus, nextOpenIndex, restNextText, sessionTally } from '../workout-view.js';
import { kg, liftLoadText, liftSetsReps, weekdayDate } from '../client-ui.js';
import { lastTrainedOn } from '../home-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const done = (total = 3) => exerciseState({ total, done: total, nextSet: 0 });
const fresh = (total = 3) => exerciseState({ total, done: 0, nextSet: 1 });
const half = (total = 3, d = 1) => exerciseState({ total, done: d, nextSet: d + 1 });
const skipped = (total = 3) => exerciseState({ total, done: 0, skipped: true, nextSet: 1 });

check('an exercise is complete when every set is done, never when skipped', () => {
  assert.equal(done().complete, true);
  assert.equal(half().complete, false);
  assert.equal(skipped().complete, false);
  assert.equal(exerciseState({ total: 0 }).complete, false);
});

check('the next exercise to open skips finished and skipped ones, then wraps round', () => {
  assert.equal(nextOpenIndex([fresh(), fresh()], -1), 0);
  assert.equal(nextOpenIndex([done(), skipped(), fresh()], 0), 2);
  assert.equal(nextOpenIndex([half(), done(), done()], 2), 0, 'an unfinished one earlier on');
  assert.equal(nextOpenIndex([done(), skipped()], 0), -1, 'nothing left');
});

check('the tally counts sets of exercises not skipped, and the open exercise', () => {
  const states = [done(3), half(3, 1), skipped(3), fresh(4)];
  assert.deepEqual(sessionTally(states, 1), { exercises: 4, current: 2, setsDone: 4, setsTotal: 10 });
  assert.equal(sessionTally(states, -1).current, 2, 'nothing open: the first unfinished one');
  assert.equal(sessionTally([done(), done()], -1).current, 2, 'all done: the last one');
});

check('the folded line says the plan, the progress, or what was done', () => {
  const numbers = { setsReps: '3×6', load: '57,5 kg' };
  assert.equal(headStatus(fresh(), numbers), '3×6 · 57,5 kg');
  assert.equal(headStatus(half(3, 2), numbers), '2/3 set');
  assert.equal(headStatus(done(), numbers), '3/3 set · 57,5 kg');
  assert.equal(headStatus(skipped(), numbers), 'Bỏ qua hôm nay');
});

check('the rest band names the next set, else the next exercise, else says all is done', () => {
  const names = ['Squat', 'Bench', 'RDL'];
  assert.equal(restNextText([half(3, 1), fresh(), fresh()], names, 0, 0), 'Tiếp theo: set 2 · Squat');
  assert.equal(restNextText([done(), fresh(), fresh()], names, 0, 1), 'Tiếp theo: Bench');
  assert.equal(restNextText([done(), half(3, 1), fresh()], names, 0, 1), 'Tiếp theo: set 2 · Bench');
  assert.match(restNextText([done(), done(), skipped()], names, 1, -1), /^Đã xong mọi set hôm nay/);
});

check('lift numbers read the Vietnamese way', () => {
  assert.equal(kg(57.5), '57,5');
  assert.equal(liftSetsReps({ sets: 3, reps: '6' }), '3×6');
  assert.equal(liftSetsReps({ sets: 3, totalReps: 40 }, { full: true }), '3 set · tổng 40');
  assert.equal(liftLoadText({ weight: 80, pyramid: true }), 'từ 80 kg');
  assert.equal(liftLoadText({ weight: null, bodyweight: true }), 'thân người');
  assert.equal(weekdayDate('2026-10-29'), 'Thứ Năm 29/10');
  assert.equal(weekdayDate(''), '');
});

check('a day was last trained on its newest session, counting its old name', () => {
  const at = (iso) => new Date(`${iso}T05:00:00Z`);
  const sessions = [
    { performedAt: at('2026-10-20'), dayLabel: 'A' },
    { performedAt: at('2026-10-27'), dayLabel: 'Upper' },
    { performedAt: at('2026-10-24'), dayLabel: 'B' },
  ];
  assert.equal(lastTrainedOn(sessions, 'A'), '2026-10-20');
  assert.equal(lastTrainedOn(sessions, 'Full Body', { Upper: 'Full Body' }), '2026-10-27');
  assert.equal(lastTrainedOn(sessions, 'C'), null);
});

check('the workout page wears frame D and its view only mirrors the rest timer', () => {
  const page = read('client.html');
  assert.match(page, /<body class="client-ui">/);
  assert.match(page, /<link rel="stylesheet" href="client-workout\.css">/);
  assert.match(page, /mountWorkoutView\(\);/);
  assert.match(page, /header\.className = 'set-row set-row-head';/, 'the view tells the header row apart');
  const view = read('workout-view.js');
  assert.doesNotMatch(view, /saveDraft|restDeadline|setTimeout\(/, 'no timing or saving of its own');
  assert.doesNotMatch(read('client-workout.css'), /(^|[\s,])\.box[\s{,.]/m, 'no class name that style.css already uses');
});

console.log(`workout-view: ${passed} passed`);
