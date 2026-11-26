// Rà chữ trang coach theo skill frontend-design (2026-11-26): những chỗ đã sửa không quay lại.
//   node tests/coach-copy.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const vi = read('i18n-vi-coach.js');
const en = read('i18n-en-coach.js');

check('coach errors say what did not happen, not just "Lỗi"/"Error"', () => {
  for (const key of ['coach.loi_khi_luu_bai_tap', 'lib.loi_khi_xoa', 'lib.loi_khi_tao_giao_an', 'nup.loi']) {
    assert.doesNotMatch(vi, new RegExp(`'${key.replace('.', '\\.')}': '(Lỗi|Có lỗi)`), `vi ${key}`);
    assert.doesNotMatch(en, new RegExp(`'${key.replace('.', '\\.')}': '(Error|Errors)`), `en ${key}`);
  }
});

check('no system words where David reads (Script, Storage)', () => {
  assert.doesNotMatch(vi, /'nrv\.so_trong_bang_hien_tai_dang': '[^']*Script/);
  assert.doesNotMatch(vi, /'td\.khong_the_xoa_anh_khoi_storage': '[^']*Storage/);
});

check('no trailing "→" on coach text links (B1, as on the student pages)', () => {
  assert.doesNotMatch(vi, /'(cj\.mo_ho_so_hoc_vien|lib\.bo_dung_giao_an)': '[^']*→'/);
  assert.doesNotMatch(en, /'(cj\.mo_ho_so_hoc_vien|lib\.bo_dung_giao_an)': '[^']*→'/);
  assert.doesNotMatch(read('program-library.html'), /Bộ dựng giáo án →/);
});

check('coach Vietnamese uses the same accent style as the student pages (xoá, huỷ, tuỳ)', () => {
  assert.doesNotMatch(vi, /[Xx]óa|[Hh]ủy|[Tt]ùy/);
});

check('the nutrition page header is translated, not hard-coded English', () => {
  assert.match(read('nutrition.html'), /<span class="brand-mini" data-i18n="nu\.headerBrand">David Coaching · Dinh dưỡng<\/span>/);
  assert.match(read('i18n-en-nutrition.js'), /'nu\.headerBrand': 'David Coaching · Nutrition'/);
});

console.log(`COACH_COPY_OK ${passed} passed`);
