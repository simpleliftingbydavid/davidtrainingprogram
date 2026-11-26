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

check('approved CB1: no "Dành cho coach" label above coach page titles', () => {
  for (const file of ['overview.html', 'nutrition-review.html', 'dose-planner.html']) assert.doesNotMatch(read(file), /data-i18n="exrev\.danh_cho_coach"/, file);
});

check('approved CB2: the coach.html header names the open section, like the menu', () => {
  const coach = read('coach.html');
  assert.match(coach, /<span class="brand-mini" id="coach-header-title" data-i18n="shell\.nav\.students">Học viên<\/span>/);
  assert.match(coach, /const headerKey = shellFocus === 'nutrition' \? 'shell\.nav\.nutrition' : 'shell\.nav\.students';/);
});

check('approved CC1: cards built as <section> do not take the landing page 72 px padding', () => {
  assert.match(read('coach.html'), /\.student-group, \.assignment-group \{ padding:0; \}/);
  assert.match(read('coach-dishes.html'), /\.cd-section \{ margin-top:34px; padding:0; \}/);
  assert.match(read('nutrition-builder.html'), /\.builder-grid > section \{ padding:0; \}/);
});

check('approved CC2: on phones the session name keeps its line, the buttons go below', () => {
  const coach = read('coach.html');
  assert.match(coach, /@media \(max-width:560px\) \{\n    \.assignment-group-head-row \{ flex-wrap:wrap; \}\n    \.assignment-group-head-row > \.assignment-group-toggle \{ flex:1 1 100%; \}/);
  assert.match(coach, /\.assignment-group-count \{ white-space:nowrap; \}/);
});

check('approved CC3: the nutrition header for the coach matches the other coach pages', () => {
  const page = read('nutrition.html');
  assert.match(page, /body\[data-shell-role="coach"\] \.app-header \.brand-mini \{ font: 800 var\(--dc-fs-xl\)\/1 var\(--dc-font-display\);/);
  assert.match(page, /headerTitle\.textContent = t\('nu\.headerCoach', \{ name: /);
});

check('approved CC4: running text on the client page stays under 72 characters a line', () => {
  assert.match(read('coach.html'), /#student-detail p, #student-detail \.small-note \{ max-width:72ch; \}/);
});

check('approved CB3: small titles on the client page are sentence case, navy, without the orange dash', () => {
  const coach = read('coach.html');
  assert.match(coach, /body\.coach-ui #student-detail \.eyebrow, body\.coach-ui \.confirm-dialog \.eyebrow \{ font:800 var\(--dc-fs-md\)\/1\.25 var\(--dc-font\); letter-spacing:0; text-transform:none; color:var\(--dc-navy\); \}/);
  assert.match(coach, /body\.coach-ui #student-detail \.eyebrow::before, body\.coach-ui \.confirm-dialog \.eyebrow::before \{ display:none; \}/);
});

check('approved CC5: the progression method is folded under "Cách tính"', () => {
  assert.match(read('coach.html'), /<details class="pr-howto" id="pr-howto">\n\s*<summary data-i18n="coach.cach_tinh">Cách tính<\/summary>\n\s*<p class="small-note" data-i18n="coach.do_bang_1rm_uoc_tinh_e1rm">/);
});

check('approved CC6: client groups sit side by side on desktop, stacked on phones', () => {
  assert.match(read('coach.html'), /@media \(min-width:900px\) \{ \.student-groups \{ grid-template-columns:repeat\(auto-fit, minmax\(260px, 1fr\)\); align-items:start; \} \}/);
});

check('coach review 2: CB3 titles are written in sentence case, not typed in capitals (VI, EN and the HTML fallback)', () => {
  const coach = read('coach.html');
  const keys = ['danh_gia_progression', 'theo_muc_tieu', 'an_toan_quyet_dinh', 'volume_theo_nhom_co', 'rir_theo_tung_bai',
    'deload_tong_ket_chu_ky', 'luu_quyet_dinh_coaching', 'chu_ky_dang_hoat_dong', 'ban_nhap_hoc_vien_chua_nhin'];
  for (const key of keys) {
    for (const [name, dict] of [['vi', vi], ['en', en]]) {
      const value = dict.match(new RegExp(`'coach\\.${key}': '((?:[^'\\\\]|\\\\.)*)'`))[1];
      const words = value.match(/\p{L}{3,}/gu).filter((word) => !['RIR'].includes(word));
      assert.ok(words.some((word) => word !== word.toLocaleUpperCase()), `${name} ${key}: ${value}`);
    }
    const fallback = coach.match(new RegExp(`data-i18n="coach\\.${key}">([^<]*)<`));
    if (fallback) assert.equal(fallback[1], vi.match(new RegExp(`'coach\\.${key}': '([^']*)'`))[1], `fallback ${key}`);
  }
});

check('coach review 2: the RIR window spells out plan and actual in Vietnamese, as in English', () => {
  assert.match(vi, /'cx\.kh_tt': 'Kế hoạch \{plan\} · Thực tế \{actual\}'/);
  assert.match(en, /'cx\.kh_tt': 'Plan \{plan\} · Actual \{actual\}'/);
});

check('approved CB4: small titles on the coach nutrition pages are sentence case (as B2)', () => {
  assert.match(read('coach-dishes.html'), /\.cd-sub \{ margin:18px 0 0; font-size:var\(--dc-fs-sm\); font-weight:800; letter-spacing:0; text-transform:none; color:var\(--text-900\); \}/);
  assert.match(read('label-foods.html'), /\.lf-sub \{ margin:18px 0 0; font-size:var\(--dc-fs-sm\); font-weight:800; letter-spacing:0; text-transform:none; color:var\(--text-900\); \}/);
  assert.match(read('coach.html'), /\.dl-title\{flex:0 0 100%;font-size:var\(--dc-fs-sm\);font-weight:800;text-transform:none;letter-spacing:0;color:var\(--text-900\)\}/);
  assert.match(read('overview.css'), /\.ov-sub-head \{ margin: 16px 0 0; font: 800 var\(--dc-fs-md\)\/1\.25 var\(--font\); letter-spacing: 0; text-transform: none; color: var\(--cu-navy\); \}/);
  const intake = read('meal-plan-intake.html');
  assert.equal((intake.match(/escapeHtml\(sectionLabel\(section\.title\)\)/g) || []).length, 2, 'both on-screen lists');
  assert.doesNotMatch(intake, /escapeHtml\(section\.title/);
  // The message sent to the client keeps its capital headings: it is plain text.
  assert.match(read('meal-plan-intake.js'), /`PHẦN \$\{index \+ 1\} — \$\{section\.title\}/);
});

check('approved CB5: no "Dành cho học viên" label when the coach opens Nutrition; the client keeps "Kế hoạch của bạn"', () => {
  const page = read('nutrition.html');
  assert.match(page, /if \(role === 'coach'\) \$\('role-label'\)\.style\.display = 'none';\n\s+else \$\('role-label'\)\.textContent = t\('nu\.yourPlan'\);/);
  assert.doesNotMatch(read('i18n-vi-nutrition.js') + read('i18n-en-nutrition.js'), /nu\.forClient/);
});

check('approved CC7: coach fold lines use the chevron, not the browser triangle', () => {
  const css = read('components.css');
  const sel = 'body.coach-ui details:not(.student-more):not(.phase-history-item):not(.habit-overview-details):not(.save-card):not(.goal-stall) > summary:not(.btn)';
  assert.ok(css.includes(`${sel} { list-style: none; display: flex;`));
  assert.ok(css.includes(`${sel}::-webkit-details-marker { display: none; }`));
  assert.ok(css.includes(`${sel}::after { content: '';`));
  assert.ok(css.includes(sel.replace('details:not', 'details[open]:not') + '::after { content: \'\'; margin: 4px 0 0; transform: rotate(-135deg); }'));
});

check('approved CC8: coach numbers use the decimal mark of the language', () => {
  const coach = read('coach.html');
  assert.match(coach, /function round1\(n\) \{ return typeof n === 'number' \? fmtNumber\(Math\.round\(n \* 10\) \/ 10, \{ maxFrac: 1 \}\) : n; \}/);
  assert.doesNotMatch(coach, /\.replace\('\.', ','\)/, 'no forced comma (wrong in English)');
  assert.doesNotMatch(coach, /\$\{(log\.planned|s)\.weight\} kg|p0: (log\.planned|sets\[0\])\.weight,/);
  const nu = read('nutrition.html');
  assert.match(nu, /const oneDecimal = \(value\) => fmtNumber\(Math\.round\(Number\(value\) \* 10\) \/ 10, \{ minFrac: 1, maxFrac: 1 \}\);/);
  assert.doesNotMatch(nu, /week\.(weight|changeKg)\.toFixed|number\(log\.weight\)\.toFixed/);
});

console.log(`COACH_COPY_OK ${passed} passed`);
