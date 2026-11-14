// Lớp hoàn thiện dùng chung (rà lỗi và làm mượt, 2026-11-14): khung giữ chỗ, chuyển cảnh ngắn,
// phản hồi khi bấm, vùng bấm tối thiểu, tương phản.
//   node tests/polish.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');
const css = read('polish.css');
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');
const pages = readdirSync(new URL('..', import.meta.url)).filter((file) => file.endsWith('.html') && read(file).includes('href="tokens.css"'));

check('every page loads polish.css last, after its own styles', () => {
  assert.ok(pages.length >= 20);
  pages.forEach((file) => {
    const page = read(file);
    assert.match(page, /<link rel="stylesheet" href="polish\.css">\n<\/head>/, file);
    assert.equal(page.split('href="polish.css"').length - 1, 1, file);
  });
});

check('every page boots on the same skeleton; a load error replaces it with text', () => {
  const withBoot = pages.filter((file) => read(file).includes('id="boot-status"'));
  assert.ok(withBoot.length >= 19, `${withBoot.length} trang`);
  withBoot.forEach((file) => {
    assert.match(read(file), /<div id="boot-status" class="dc-skeleton" role="status" aria-label="Đang tải"><span class="dc-skel dc-skel-hero"><\/span>/, file);
    assert.doesNotMatch(read(file), /<div id="boot-status">Đang tải…<\/div>|class="app-loading"/, file);
  });
  assert.match(rules, /\.dc-skel \{[^}]*animation: dc-shimmer/);
  assert.match(rules, /\.dc-skeleton:not\(:has\(\.dc-skel\)\) \{ padding: 72px 16px 16px;/, 'chữ báo lỗi không nằm dưới nút tài khoản');
  assert.match(read('home.html'), /\$\('boot-status'\)\.textContent = /, 'trang vẫn báo lỗi bằng chữ');
});

check('motion is short, never blocks a tap, and is off under "reduce motion"', () => {
  const durations = [...rules.matchAll(/(\d+)ms/g)].map((m) => Number(m[1]));
  assert.ok(durations.length >= 8);
  assert.ok(durations.every((ms) => ms <= 200), `dài nhất ${Math.max(...durations)}ms`);
  assert.doesNotMatch(rules, /animation-delay|transition-delay/);
  assert.deepEqual(rules.match(/[^\n]*pointer-events: none;[^\n]*/g), ['.btn[aria-busy="true"] { opacity: .7; pointer-events: none; }'], 'chỉ nút đang lưu mới không bấm được');
  const motionBlocks = rules.split('@media (prefers-reduced-motion: no-preference)').length - 1;
  assert.equal(motionBlocks, 2, 'chuyển cảnh và phản hồi bấm đều nằm trong khối no-preference');
  const outside = rules.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, '');
  assert.doesNotMatch(outside, /transition:|animation: dc-(fade|rise)/, 'không có chuyển cảnh ngoài khối đó');
  assert.match(read('style.css'), /@media \(prefers-reduced-motion: reduce\) \{\n\s+\*, \*::before, \*::after \{[^}]*animation-duration:\.01ms !important;[^}]*transition-duration:\.01ms !important;/);
  assert.match(rules, /\.exercise-block:not\(\.cu-collapsed\) > :not\(\.cu-ex-head\) \{ animation: dc-fade-in 160ms ease-out; \}/, 'thẻ bài tập chỉ mờ dần, không dịch chuyển');
});

check('tap targets found on the sweep are at least 40px', () => {
  ['body .exercise-note-btn { min-height: 40px; }', 'body .exercise-block:not(.cu-collapsed) > .cu-ex-head { min-height: 40px; }',
    'body .assignment-group-pause-btn { min-height: 40px; }', 'body.coach-ui select, body.client-ui select { min-height: 40px; }']
    .forEach((rule) => assert.ok(rules.includes(rule), rule));
  assert.match(rules, /body \.ov-tab \{ min-height: 40px;/);
  assert.match(rules, /body \.ms-earned > summary,\nbody summary\.cu-card-head,\nbody details\.how > summary \{ padding-block: 9px; \}/);
});

check('contrast: navy on orange for the active coach nav item and the active template tab', () => {
  assert.match(rules, /body\[data-shell-role="coach"\] \.app-shell-bottom \.app-shell-link\.active \{ background: transparent; color: var\(--dc-navy\);/);
  assert.match(rules, /body \.tab-pill\.active \{ color: var\(--dc-navy\); \}/);
  assert.doesNotMatch(read('coach-ui.css'), /app-shell-bottom/, 'quy tắc thanh đáy chỉ còn một chỗ');
});

check('no hard-coded colours; nothing here changes layout', () => {
  assert.doesNotMatch(rules, /#[0-9a-f]{3,6}\b/i);
  assert.doesNotMatch(rules, /grid-template|[\s{;]order:|[\s{;]position:|display:\s*none/);
});

console.log(`POLISH_OK ${passed} passed`);
