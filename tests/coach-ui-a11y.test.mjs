// Rà giao diện coach theo ui-ux-pro-max (2026-11-25): những gì đã sửa không được tái phát.
//   node tests/coach-ui-a11y.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const shellCss = read('app-shell.css');

check('coach pages link .field labels to their single control (form-labels)', () => {
  const shell = read('app-shell.js');
  assert.match(shell, /import \{ installFieldLabels \} from '\.\/field-labels\.js';/);
  assert.match(shell, /if \(role === 'coach'\) installFieldLabels\(document\);/);
  const mod = read('field-labels.js');
  assert.match(mod, /if \(controls\.length !== 1\) return;/, 'only a field with exactly one control');
  assert.match(mod, /if \(!label \|\| label\.htmlFor \|\| label\.querySelector\(CONTROL\)\) return;/, 'never re-points a label');
  assert.match(mod, /new MutationObserver/, 'forms built later (dialogs, the assign form) are linked too');
  const coach = read('coach.html');
  assert.match(coach, /<label for="assign-exercise" data-i18n="coach\.bai_tap">/);
  assert.match(coach, /id="assign-exercise-search"[^>]*aria-label="[^"]+"[^>]*data-i18n-aria-label="coach\.tim_bai_tap"/);
});

check('coach controls get an invisible 44 × 44 px hit area without transform', () => {
  const block = shellCss.slice(shellCss.indexOf('Trang coach: vùng bấm tối thiểu 44 px'));
  for (const selector of ['.app-shell-tool', '.notification-bell', '.detail-back', '.detail-tab', '.btn', '.assignment-group-pause-btn', '.dl-chip',
    '.exercise-note-btn', '.ov-period', '.ov-tab', '.ov-day', '.pr-filter button', '.cd-del', 'summary', '#assign-exercise-video',
    'label:has(> input[type="checkbox"])', 'label:has(> input[type="radio"])']) {
    assert.ok(block.includes(selector), selector);
  }
  assert.match(block, /^:where\(body\[data-shell-role="coach"\]\) :where\(/m, 'zero specificity, coach pages only');
  const before = block.slice(block.indexOf('::before {'), block.indexOf('}', block.indexOf('::before {')));
  assert.match(before, /top: min\(0px, calc\(50% - 22px\)\); bottom: min\(0px, calc\(50% - 22px\)\); left: min\(0px, calc\(50% - 22px\)\); right: min\(0px, calc\(50% - 22px\)\);/);
  assert.doesNotMatch(before.replace(/\/\*[\s\S]*?\*\//g, ''), /transform/, 'a transform repaints nearby text');
});

check('small orange labels on coach pages use the darker orange (color-contrast)', () => {
  assert.match(shellCss, /:where\(body\[data-shell-role="coach"\]\) \.eyebrow:where\(:not\(\.on-dark\)\) \{ color: var\(--dc-orange-text\); \}/);
});

console.log(`COACH_UI_A11Y_OK ${passed} passed`);
