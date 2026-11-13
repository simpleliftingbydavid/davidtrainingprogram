// Giai đoạn 2 "Tinh gọn" của audit UX/UI 2026-11-13 (David chốt 1a, 2a, 3a).
//   node tests/stage2-tidy.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { prescriptionVi, programSubtitleVi, programTitleVi, slotLabelVi } from '../template-labels-vi.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');

check('the sidebar carries no release label or English subtitle; only the coach sees the version', () => {
  const shell = read('app-shell.js');
  assert.doesNotMatch(shell, /app-shell-release|APP_RELEASE_LABEL|Training companion|Coach workspace/);
  assert.match(shell, /\$\{role === 'coach' \? `<div class="app-shell-version"><span>Phiên bản<\/span><b>\$\{appVersionLabel\(\)\}<\/b><\/div>` : ''\}/);
});

check("Home: David's note is the first card under the header, and is not drawn when empty", () => {
  const home = read('home.html');
  assert.match(home, /<div id="home-identity"><\/div>\n\s+<div id="card-note-host"><\/div>\n\n\s+<h2 class="cu-section">Việc hôm nay<\/h2>/);
  assert.equal(home.split('id="card-note-host"').length - 1, 1);
  assert.match(home, /\$\('card-note-host'\)\.innerHTML = notes\n\s+\? `<section class="cu-card cu-note"[\s\S]*?: '';/);
  assert.match(read('client-ui.css'), /#card-note-host:empty \{ display: none; \}/);
});

check('coach student page: three actions outside, the rest under "Thêm", delete last and apart', () => {
  const coach = read('coach.html');
  const start = coach.indexOf('<div class="student-actions">');
  const actions = coach.slice(start, coach.indexOf('<div class="detail-tabs"', start));
  const menuAt = actions.indexOf('<details class="student-more" id="student-more">');
  const outside = actions.slice(0, menuAt);
  const menu = actions.slice(menuAt);
  ['id="student-overview-link"', 'id="view-progress-photos-link"', 'id="nutrition-plan-link" href="#" class="btn btn-primary"'].forEach((part) => assert.ok(outside.includes(part), part));
  assert.equal((outside.match(/btn-primary/g) || []).length, 1, 'một nút chính');
  ['id="detail-nickname-btn"', 'id="detail-category"', 'id="save-detail-category-btn"', 'href="nutrition-update.html"', 'id="delete-student-btn"']
    .forEach((part) => { assert.ok(menu.includes(part), part); assert.ok(!outside.includes(part), `${part} không nằm ngoài`); });
  assert.ok(menu.indexOf('class="student-more-danger"') > menu.indexOf('href="nutrition-update.html"'), 'nút xoá ở cuối');
  assert.match(menu, /<div class="student-more-danger">\n\s+<button id="delete-student-btn"/);
  assert.match(coach, /\.student-more-danger \{ width:100%; padding-top:12px; border-top:1px solid var\(--dc-border\); \}/);
  assert.match(coach, /<h2 style="font-size:1\.4rem">Xóa dữ liệu học viên\?<\/h2>/, 'bước xác nhận vẫn còn');
});

check('templates page: Vietnamese labels, numbers untouched, unknown text passes through', () => {
  assert.equal(slotLabelVi('Choose Squat Variant'), 'Chọn một biến thể squat');
  assert.equal(slotLabelVi('Choose Triceps Isolation 2'), 'Chọn một bài cô lập tay sau (2)');
  assert.equal(slotLabelVi('Choose Shrug Variation*'), 'Chọn một biến thể shrug*');
  assert.equal(slotLabelVi('Abs of Choice'), 'Bài bụng tự chọn');
  ['Leg Extension', 'Dips', 'Wrist Curls*', 'Choose Something New'].forEach((name) => assert.equal(slotLabelVi(name), name));
  assert.equal(prescriptionVi('3x10–20 @1> failure'), '3x10–20 @1>thất bại');
  assert.equal(prescriptionVi('3x4–8 @3–1'), '3x4–8 @3–1');
  assert.equal(programTitleVi('The MSP3 Bodybuilding 5-Day Program'), 'Chương trình tăng cơ MSP3 · 5 buổi');
  assert.equal(programSubtitleVi('Used during periods of minimal time.'), 'Dùng cho giai đoạn có rất ít thời gian tập.');
  const page = read('templates.html');
  const names = [...new Set([...page.matchAll(/^\s*\[\d+, '([^']*)'/gm)].map((m) => m[1]))];
  names.filter((name) => name.startsWith('Choose ')).forEach((name) => assert.notEqual(slotLabelVi(name), name, `${name} chưa có bản tiếng Việt`));
  assert.match(page, /escapeHtml\(slotLabelVi\(exercise\)\)\}<\/td><td>\$\{escapeHtml\(prescriptionVi\(rx\)\)\}/);
  assert.match(page, /source\.textContent = `Tên gốc: \$\{program\.title\}`;/);
  assert.match(page, /'Choose Squat Variant', '3x4–8 @3–1'/, 'dữ liệu gốc giữ nguyên văn');
});

check('wording: the retired words are gone from what people read (code comments aside)', () => {
  const root = new URL('..', import.meta.url);
  const files = readdirSync(root).filter((file) => (file.endsWith('.html') || file.endsWith('.js')) && file !== 'engine-test-harness.html')
    .concat(['functions/index.js', 'functions/review-alert-builder.js']);
  const shown = (text) => text.split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*|<!--)/.test(line))
    .map((line) => { const [code, tail] = line.split(/ \/\/ (?=[^'"`]*$)/); return tail === undefined ? line : code; }).join('\n');
  files.forEach((file) => {
    const text = shown(read(file));
    assert.doesNotMatch(text, /[Kk]hách|KHÁCH/, `${file}: "khách"`);
    assert.doesNotMatch(text, /HLV/, `${file}: "HLV"`);
    assert.doesNotMatch(text, /Training companion|Coach workspace/, file);
  });
  assert.doesNotMatch(read('client.html'), /Ghi chú & feedback/);
  assert.match(read('client.html'), /Ghi chú & phản hồi/);
  assert.match(read('coach.html'), /<strong>Phản hồi mới<\/strong>/);
  assert.match(read('review-dashboard-utils.js'), /'exercise-feedback': 'Phản hồi'/, 'mã loại giữ nguyên, chỉ đổi nhãn');
  assert.match(read('history.html'), /<option value="feedback">Có phản hồi<\/option>/);
});

console.log(`STAGE2_TIDY_OK ${passed} passed`);
