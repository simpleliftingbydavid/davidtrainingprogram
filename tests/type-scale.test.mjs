// Thang cỡ chữ 7 bậc (audit UX/UI, David chốt 2026-11-16): mọi cỡ chữ viết cứng bằng rem/px
// dùng --dc-fs-* trong tokens.css. Được giữ: clamp(), em, %, và cỡ hiển thị lớn hơn 40px
// (số to ở đầu trang, ô nhập ở "Tập trung", đồng hồ nghỉ).
//   node tests/type-scale.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const SKIP = new Set(['tokens.css', 'engine-test-harness.html']);
const files = readdirSync(root).filter((f) => /\.(css|html|js)$/.test(f) && !SKIP.has(f));
const SCALE_PX = [12, 14, 16, 18, 22, 28, 40];
const toPx = (n, unit) => Number(n) * (unit === 'rem' ? 16 : 1);
const sizeRe = /font-size\s*:\s*(\d*\.?\d+)(rem|px)\b(?!\s*[,)*/+-])/g;
const shortRe = /font\s*:\s*(?:(?:italic|normal|bold|\d{3}|small-caps)\s+)*(\d*\.?\d+)(rem|px)(?=\s*\/|\s+[\w"'-])/g;

check('the scale itself: 12 14 16 18 22 28 40 px', () => {
  const tokens = read('tokens.css');
  const found = [...tokens.matchAll(/--dc-fs-(xs|sm|md|lg|xl|2xl|3xl): ([\d.]+)rem;/g)].map((m) => Number(m[2]) * 16);
  assert.deepEqual(found, SCALE_PX);
});

check('no hard-coded font size off the scale; only display sizes over 40px stay as numbers', () => {
  const off = [];
  for (const file of files) {
    const text = read(file);
    for (const re of [sizeRe, shortRe]) {
      for (const m of text.matchAll(re)) {
        const px = toPx(m[1], m[2]);
        if (px <= 40) off.push(`${file}: ${m[0]}`);
      }
    }
  }
  assert.deepEqual(off, []);
});

check('the font-size declarations that stay as numbers are the large display ones', () => {
  let display = 0;
  for (const file of files) {
    const text = read(file);
    for (const re of [sizeRe, shortRe]) for (const m of text.matchAll(re)) { if (toPx(m[1], m[2]) > 40) display++; }
  }
  assert.ok(display > 0 && display <= 30, `display sizes: ${display}`);
});

console.log(`TYPE_SCALE_OK ${passed} passed`);
