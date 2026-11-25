// Rà giao diện học viên theo ui-ux-pro-max (2026-11-25): những gì đã sửa không được tái phát.
//   node tests/student-ui-a11y.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const client = read('client.html');

check('set boxes and the Done button have names for screen readers, values intact', () => {
  for (const [cls, key] of [['set-weight', 'a11y.setWeight'], ['set-reps', 'a11y.setReps'], ['set-rir', 'a11y.setRir']]) {
    assert.match(client, new RegExp(`class="${cls}" aria-label="\\$\\{escapeHtml\\(t\\('${key.replace('.', '\\.')}', \\{ i \\}\\)\\)\\}" value="\\$\\{escapeHtml\\(saved\\?\\.`), cls);
  }
  assert.ok(!/value=""\$\{/.test(client), 'no doubled quote before a value');
  assert.match(client, /class="set-done-btn" data-set-number="\$\{i\}" aria-label="\$\{escapeHtml\(t\('a11y\.setDone', \{ i \}\)\)\}"/);
  assert.ok(!/set-done-btn'\)\.textContent =|doneBtn\.textContent =/.test(client), 'the Done button is always painted through paintDoneButton');
  assert.match(client, /function paintDoneButton\(button, done\)/);
});

check('history search has a label', () => {
  assert.match(read('history.html'), /id="history-search"[^>]*aria-label="[^"]+"[^>]*data-i18n-aria-label="history\.tim_theo_ten_bai_tap"/);
});

check('touch targets: the 40–43 px controls get an invisible 44 px hit area', () => {
  const where = { 'client-workout.css': ['.cu-view-toggle button', '.cu-ex-head', '.cu-ex-details > summary', '.technique-details summary', '.exercise-session-actions .undo-set-btn', '.cu-ex-menu > summary'],
    'client-nutrition.css': ['.cu-fl-chip'], 'client-progress.css': ['.weight-more summary', '.ms-earned > summary'] };
  for (const [file, selectors] of Object.entries(where)) {
    const css = read(file);
    const block = css.slice(css.indexOf('Vùng bấm tối thiểu 44 px'));
    selectors.forEach((selector) => assert.ok(block.includes(selector), `${file}: ${selector}`));
    assert.match(block, /::before[^{]*\{\s*content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 44px; min-height: 100%; transform: translateY\(-50%\);/, file);
  }
});

check('reduced motion is respected by the remaining animations', () => {
  const where = { 'client.html': ['.focus-reminder', '.rest-badge-dot'], 'client-nutrition.css': ['.cu-n-track span'], 'client-habits.css': ['.cu-h-track span'] };
  for (const [file, selectors] of Object.entries(where)) {
    const css = read(file);
    const block = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
    selectors.forEach((selector) => assert.ok(block.includes(selector), `${file}: ${selector}`));
  }
});

check('the new screen-reader texts exist in Vietnamese and English', () => {
  const vi = read('i18n-vi-workout.js'); const en = read('i18n-en-workout.js');
  for (const key of ['a11y.setWeight', 'a11y.setReps', 'a11y.setRir', 'a11y.setDone', 'a11y.setDoneDone']) {
    assert.ok(vi.includes(`'${key}':`) && en.includes(`'${key}':`), key);
  }
});

console.log(`STUDENT_UI_A11Y_OK ${passed} passed`);
