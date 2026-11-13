// Thẻ bài tập lúc đang tập (audit 2026-11-13, David chốt 3a): bảng set ở giữa,
// phần tham khảo trong "Chi tiết", thao tác ít dùng trong menu "Thêm".
//   node tests/workout-card.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');
const page = read('client.html');
const start = page.indexOf('  block.innerHTML = `\n    <h3 class="exercise-title"></h3>');
const card = page.slice(start, page.indexOf('  `;', start));
const between = (open, close) => { const a = card.indexOf(open); return card.slice(a, card.indexOf(close, a)); };
const details = between('<details class="cu-ex-details">', '</details>');
const menu = card.slice(card.indexOf('<details class="cu-ex-menu">'));
const outside = card.replace(details, '').replace(menu, '');

check('the card template is found', () => {
  assert.ok(start > 0 && card.length > 500);
});

check('outside: name, target, David\'s note, stage 5, the sets, today\'s set count, undo', () => {
  ['class="exercise-title"', 'class="cu-ex-load"', 'class="stage5-guidance"', 'class="safety-hold-note"', 'class="rest-badge"',
    'class="coach-note-wrap"', 'class="set-rows"', 'class="field set-count-field"', 'class="undo-set-btn"', 'class="skip-summary"']
    .forEach((part) => assert.ok(outside.includes(part), part));
});

check('"Chi tiết" (closed by default) holds the plates, today\'s text, the ladder, technique and video, last session', () => {
  assert.match(card, /<details class="cu-ex-details">\n\s+<summary>Chi tiết<\/summary>/);
  ['class="cu-ex-plates"', 'class="planned-line"', 'class="progression-ladder"', 'class="technique-wrap"', 'class="previous-session-status"']
    .forEach((part) => { assert.ok(details.includes(part), part); assert.ok(!outside.includes(part), `${part} không nằm ngoài`); });
  assert.match(page, /platesEl\.innerHTML = lift \? plateStrip\(lift, exercise\) : '';/);
  assert.match(page, /techniqueWrap\.innerHTML = videoLink;/);
  assert.doesNotMatch(page, /titleEl\.innerHTML = [^\n]*videoLink/, 'video không còn ở tiêu đề');
});

check('the "Thêm" menu holds notes, swap, skip, rest time and removing an extra lift', () => {
  assert.match(menu, /<summary aria-label="Thêm lựa chọn cho bài này">/);
  ['class="exercise-note-btn"', 'class="exercise-swap-wrap"', 'class="skip-exercise-btn"', 'class="rest-time-control"', 'class="extra-remove-btn"']
    .forEach((part) => { assert.ok(menu.includes(part), part); assert.ok(!outside.includes(part), `${part} không nằm ngoài`); });
});

check('a swapped lift says so outside the folded part', () => {
  assert.match(page, /coachNoteWrap\.innerHTML = substituteCarried\n\s+\? `<p class="exercise-swap-note">/);
});

check('a skipped lift can be un-skipped: only that button stays in the menu; nothing overflows', () => {
  const css = read('client-workout.css');
  assert.match(css, /\.exercise-block\.session-skipped \.cu-ex-menu-body > :not\(\.skip-exercise-btn\) \{ display: none; \}/);
  assert.match(css, /\.cu-ex-menu-body \{ display: grid; grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /\.cu-ex-menu > summary \{[^}]*min-height: 40px;/);
  assert.match(css, /\.cu-ex-menu-body \.rest-time-control \{[^}]*flex-wrap: nowrap;/);
});

check('the per-set inputs a scheme needs stay in the set rows', () => {
  assert.match(page, /class="set-rir"/);
  assert.match(page, /rep-out<\/small>/);
  assert.match(page, /class="cu-plus-set"/);
});

console.log(`WORKOUT_CARD_OK ${passed} passed`);
