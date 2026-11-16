// "Danh sách" / "Tập trung" trong buổi tập (David chốt 2a ngày 2026-11-15): Tập trung là cách xem
// khác của cùng các ô nhập, Danh sách vẫn là mặc định.
//   node tests/workout-focus.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SWIPE_IGNORE, SWIPE_MIN_PX, WORKOUT_VIEW_KEY, focusRowIndex, normalizeWorkoutView, stepFocusRow, swipeStep } from '../workout-view.js';
import { asVi } from './i18n-source.mjs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => asVi(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, ''));
const page = read('client.html');
const view = read('workout-view.js');
const css = read('client-workout.css');

check('the list is the default; the choice is remembered on the device', () => {
  assert.equal(normalizeWorkoutView(null), 'list');
  assert.equal(normalizeWorkoutView('anything'), 'list');
  assert.equal(normalizeWorkoutView('focus'), 'focus');
  assert.equal(WORKOUT_VIEW_KEY, 'dc_workout_view');
  assert.match(view, /try \{ return normalizeWorkoutView\(localStorage\.getItem\(WORKOUT_VIEW_KEY\)\); \} catch \{ return 'list'; \}/);
  assert.match(view, /try \{ localStorage\.setItem\(WORKOUT_VIEW_KEY, view\); \} catch \{/);
  assert.match(page, /<button type="button" data-cu-view="list" aria-pressed="true">Danh sách<\/button>\n\s+<button type="button" data-cu-view="focus" aria-pressed="false">Tập trung<\/button>/);
});

check('the set on screen: the next one to do, the last when all are done, or the one the client stepped to', () => {
  assert.equal(focusRowIndex({ total: 3, nextSet: 1 }), 0);
  assert.equal(focusRowIndex({ total: 3, nextSet: 3 }), 2);
  assert.equal(focusRowIndex({ total: 3, nextSet: 0 }), 2, 'đã xong hết: xem set cuối');
  assert.equal(focusRowIndex({ total: 3, nextSet: 2, chosen: 0 }), 0);
  assert.equal(focusRowIndex({ total: 3, nextSet: 2, chosen: 7 }), 1, 'lựa chọn ngoài khoảng bị bỏ');
  assert.equal(focusRowIndex({ total: 0, nextSet: 0 }), -1);
  assert.equal(stepFocusRow(0, -1, 3), 0);
  assert.equal(stepFocusRow(1, 1, 3), 2);
  assert.equal(stepFocusRow(2, 1, 3), 2);
  assert.equal(stepFocusRow(null, 1, 0), -1);
});

check('focus shows the same inputs, never a copy: no input or id is created by the view', () => {
  const navStart = view.indexOf('function ensureFocusNav');
  const nav = view.slice(navStart, view.indexOf('const setText', navStart));
  assert.doesNotMatch(nav, /<input|<select|<textarea| id="/);
  assert.doesNotMatch(view, /createElement\('input'\)|cloneNode/);
  assert.match(view, /row\.classList\.toggle\('cu-focus-row', rowIndex === shown\)/);
  assert.match(view, /if \(lastDone\.get\(block\) !== state\.done\) \{ lastDone\.set\(block, state\.done\); chosenRow\.delete\(block\); \}/, 'sau khi bấm Xong hoặc hoàn tác, quay về set kế tiếp');
});

check('focus is styling only: hidden in the list view, large targets, big rest clock', () => {
  assert.match(css, /\.cu-focus-nav \{ display: none; \}/);
  assert.match(css, /body\.cu-focus \.exercise-block:not\(\.cu-collapsed\) \.set-row:not\(\.cu-focus-row\):not\(\.set-row-head\) \{ display: none; \}/);
  assert.match(css, /body\.cu-focus #exercise-blocks\.cu-has-open > \.exercise-block\.cu-collapsed \{ display: none; \}/);
  assert.match(css, /body\.cu-focus \.set-row\.cu-focus-row \.set-done-btn \{ grid-column: 1 \/ -1; height: 64px;/);
  assert.match(css, /body\.cu-focus \.set-row\.cu-focus-row input \{ height: 76px;/);
  assert.match(css, /\.cu-focus-btn \{ width: 48px; height: 48px;/);
  assert.match(css, /\.cu-focus-lift \{ flex: 1; min-height: 44px;/);
  assert.match(css, /body\.cu-focus \.cu-rest-time \{ font-size: 3\.4rem; \}/);
  assert.match(css, /\.cu-view-toggle button \{ flex: 1; min-height: 40px;/);
  const focusRules = css.slice(css.indexOf('"Danh sách" / "Tập trung"'));
  // The only motion is the short swipe feedback, and only when the device allows motion.
  const withoutSwipeMotion = focusRules.replace(/@media \(prefers-reduced-motion: no-preference\) \{\n  body\.cu-focus \.set-row\.cu-swipe-from-right[\s\S]*?\n\}\n/, '');
  assert.doesNotMatch(withoutSwipeMotion, /animation|transition/, 'không thêm chuyển động riêng');
});

check('a skipped lift keeps its way out; RIR, rep-out and Plus Set stay on the set', () => {
  assert.match(css, /body\.cu-focus \.exercise-block\.session-skipped:not\(\.cu-collapsed\) > \.cu-focus-nav\.cu-focus-nav\.cu-focus-nav \{ display: grid !important; \}/);
  assert.match(css, /body\.cu-focus \.set-row\.cu-focus-row \.set-idx small \{ display: inline !important;/);
  assert.match(css, /body\.cu-focus \.set-row\.cu-focus-row \.set-rir\[style\*="hidden"\] \{ display: none; \}/);
  assert.match(page, /class="stage5-guidance"/);
});

check('the result screen has every part of the summary: day, time, lifts, sets, records, each lift, the closing line', () => {
  ['id="next-up-title"', 'id="next-up-day"', 'id="next-up-stats"', 'id="next-up-records"', 'id="next-up-list"', 'id="next-up-footnote"']
    .forEach((part) => assert.ok(page.includes(part), part));
  assert.match(page, /\[\['Thời gian', `\$\{minutes\}<small> phút<\/small>`\], \['Bài tập', String\(summary\.exercises\)\], \['Set', String\(summary\.sets\)\]\]/);
  assert.match(page, /<span class="cu-record-label">Kỷ lục mới<\/span>/);
  assert.match(page, /\$\{resultScheme === SCHEME\.APRE \? 'Mức tạ' : 'Buổi sau'\}: <strong>/);
});

check('swipe in "Tập trung": left = next set, right = previous, short or mostly vertical drags do nothing', () => {
  assert.equal(SWIPE_MIN_PX, 50);
  assert.equal(swipeStep(-80, 5), 1);
  assert.equal(swipeStep(80, 5), -1);
  assert.equal(swipeStep(-50, 0), 1);
  assert.equal(swipeStep(-49, 0), 0);
  assert.equal(swipeStep(-80, 60), 0);
  assert.equal(swipeStep(0, 200), 0);
  assert.equal(swipeStep(undefined, undefined), 0);
});

check('swipe: drags that start in a box or on a button are not swipes; only the focus row, only in focus mode', () => {
  for (const tag of ['input', 'select', 'textarea', 'button', 'a']) assert.ok(SWIPE_IGNORE.split(', ').includes(tag), tag);
  assert.match(view, /if \(view !== 'focus' \|\| event\.pointerType === 'mouse' && event\.button !== 0\) return;/);
  assert.match(view, /closest\(SWIPE_IGNORE\)/);
  assert.match(view, /\.set-row\.cu-focus-row/);
  assert.match(view, /addEventListener\('pointercancel'/);
  assert.match(view, /a drag that crosses the big "Xong" button is not a press of it/);
});

check('swipe CSS: vertical scroll stays native, text in the card is not selected by a drag, motion only when allowed', () => {
  assert.match(css, /body\.cu-focus \.set-row\.cu-focus-row \{ touch-action: pan-y; -webkit-user-select: none; user-select: none; \}/);
  assert.match(css, /body\.cu-focus \.set-row\.cu-focus-row input \{ -webkit-user-select: text; user-select: text; \}/);
  const motion = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference) {\n  body.cu-focus .set-row.cu-swipe-from-right'));
  assert.ok(motion.length > 0 && motion.indexOf('@keyframes cu-swipe-l') > 0);
});

console.log(`WORKOUT_FOCUS_OK ${passed} passed`);
