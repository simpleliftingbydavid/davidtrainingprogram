// Rà chữ trang học viên theo skill frontend-design (2026-11-26): những chỗ đã sửa không quay lại.
//   node tests/student-copy.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const { setLang, t } = await import('../i18n.js');

await check('progress page numbers follow the language (77,8 in Vietnamese, 77.8 in English)', async () => {
  assert.doesNotMatch(read('progress-views.js'), /fmtNumber\([^)]*\)[^;]*'en'\)/, 'no number forced to English');
  assert.match(read('progress-photos.html'), /<strong>\$\{kg\(l\.weight\)\} kg<\/strong>/);
  const { strengthMarkup } = await import('../progress-views.js');
  const row = { id: 'bench_press', name: 'BB Bench Press', first: { weight: 60 }, latest: { weight: 87.5 }, best: 87.5, gain: 27.5, sessions: 12, isRecord: true, series: [60, 87.5] };
  setLang('vi'); assert.match(strengthMarkup([row]), /87,5 kg/);
  setLang('en'); assert.match(strengthMarkup([row]), /87\.5 kg/);
  setLang('vi');
});

await check('"last time" hint reads the same with or without a previous set', () => {
  setLang('vi');
  assert.equal(t('workout.prev.none'), 'Buổi trước: chưa có');
  assert.match(t('workout.prev.kg', { kg: 25 }), /^Buổi trước: /);
  setLang('en');
  assert.equal(t('workout.prev.none'), 'Last time: none');
  assert.match(t('workout.prev.kg', { kg: 25 }), /^Last time: /);
  setLang('vi');
});

await check('error messages say what happened and what to do, never just "Lỗi"/"Error"', () => {
  for (const lang of ['vi', 'en']) {
    setLang(lang);
    for (const key of ['progress.saveError', 'progress.deleteError']) {
      const text = t(key, { error: 'x' });
      assert.doesNotMatch(text, /^(Lỗi|Error)/, `${lang} ${key}`);
      assert.match(text, /(thử lại|try again)/, `${lang} ${key}: how to fix`);
    }
    assert.doesNotMatch(t('progress.q.error'), /^(Lỗi|Error)$/);
    assert.equal(t('progress.q.error'), t('progress.uploadFailed'), 'one name for one failure');
  }
  setLang('vi');
});

await check('student Vietnamese uses one accent style (huỷ, tuỳ, xoá, khoẻ)', () => {
  const files = ['i18n-vi.js', 'i18n-vi-home.js', 'i18n-vi-workout.js', 'i18n-vi-program.js', 'i18n-vi-history.js', 'i18n-vi-nutrition.js', 'i18n-vi-habits.js', 'i18n-vi-progress.js', 'i18n-vi-foods.js'];
  for (const file of files) assert.doesNotMatch(read(file), /[Hh]ủy|[Tt]ùy|[Xx]óa|[Kk]hỏe/, file);
  assert.doesNotMatch(read('client.html'), />Hủy buổi tập|Rất khỏe/, 'the page text matches the dictionary');
});

await check('approved B1: no "→" at the end of text links (the from → to arrow in records stays)', () => {
  for (const file of ['i18n-vi-home.js', 'i18n-en-home.js', 'i18n-vi-workout.js', 'i18n-en-workout.js']) {
    assert.doesNotMatch(read(file), /'(home\.(habitsPick|openHabits|openNutrition|openProgress|logWeight)|workout\.xem_lich_su_tap)': '[^']*→'/, file);
  }
  assert.match(read('client.html'), />Xem lịch sử tập<\/a>/);
});

await check('approved C1: a first-time exercise says "Buổi trước: chưa có" once in the list view', () => {
  const html = read('client.html');
  assert.match(html, /const repeatNone = !previousSet && i > 1 && !previousSetForIndex\(currentPreviousPerformance, 1\);/);
  assert.match(html, /class="previous-set-weight\$\{repeatNone \? ' cu-prev-repeat' : ''\}"/);
  assert.match(read('client-workout.css'), /body\.client-ui:not\(\.cu-focus\) \.previous-set-weight\.cu-prev-repeat \{ visibility: hidden; \}/, 'kept in Focus, where one set shows at a time');
});

await check('approved C2: history sessions open with a chevron like the workout cards', () => {
  const css = read('client-history.css');
  assert.match(css, /body\.cu-history \.sess-summary::after \{ content: ''; [^}]*transform: rotate\(45deg\); \}/);
  assert.match(css, /body\.cu-history \.sess-card\[open\] \.sess-summary::after \{ content: ''; [^}]*transform: rotate\(-135deg\); \}/);
});

await check('approved B2: small titles inside white cards are sentence case, bold, navy', () => {
  const css = read('client-ui.css');
  assert.match(css, /body\.client-ui \.cu-card-head h3,[\s\S]*?body\.client-ui\.cu-progress \.compare-panel > strong,[\s\S]*?\{\n  font-family: var\(--font\); font-size: var\(--dc-fs-md\); font-weight: 800; letter-spacing: 0; text-transform: none; color: var\(--cu-navy\);/);
  assert.match(css, /body\.client-ui \.cu-wstats dt,[\s\S]*?\{ letter-spacing: 0; text-transform: none; \}/, 'small stat labels too');
  assert.match(css, /body\.client-ui \.cu-weighin-link b \{[^}]*text-transform: none; \}/, 'the weigh-in link keeps its orange, only the case changes');
});

await check('approved C3: the date field opens only from "Tập cho ngày khác?"; a draft from another day opens it', () => {
  const html = read('client.html');
  assert.match(html, /id="start-routine-btn"[^\n]*\n[^\n]*\n\s*<button type="button" class="cu-date-toggle" id="performed-date-toggle" aria-expanded="false" aria-controls="performed-date-row"/, 'Start stands right under the list, the toggle under it');
  assert.match(html, /<div class="cu-date-row" id="performed-date-row" hidden>/);
  assert.match(html, /showPerformedDateRow\(value !== localDateInputValue\(\)\);/);
  assert.doesNotMatch(html, /\$\('performed-date'\)\.value = (?!value;)/, 'every write goes through setPerformedDate');
  assert.match(read('i18n-vi-workout.js'), /'workout\.tap_ngay_khac': 'Tập cho ngày khác\?'/);
});

await check('second pass: B2 also covers dialogs and the measurement group labels', () => {
  const css = read('client-ui.css');
  assert.match(css, /body\.client-ui \.cancel-session-dialog \.eyebrow,\nbody\.client-ui \.exercise-notes-head \.eyebrow \{\n  font-family: var\(--font\);/);
  assert.match(css, /body\.client-ui \.cancel-session-dialog \.eyebrow::before,\nbody\.client-ui \.exercise-notes-head \.eyebrow::before \{ display: none; \}/);
  assert.match(css, /body\.client-ui\.cu-progress \.measure-input-group h4,\nbody\.client-ui\.cu-progress \.measure-group h4,\nbody\.client-ui\.cu-progress \.guide-angle h4 \{ letter-spacing: 0; text-transform: none; \}/);
  assert.match(read('i18n-vi-workout.js'), /'notes\.eyebrow': 'Nhật ký bài tập'/, 'case comes from CSS, not typed in capitals');
  assert.match(read('i18n-en-workout.js'), /'notes\.eyebrow': 'Exercise log'/);
});

await check('second pass: the coach-only "cancel reply" button stays hidden until the coach replies', () => {
  assert.match(read('style.css'), /\.exercise-notes-actions \.btn\[hidden\] \{ display:none; \}/);
});

await check('second pass: English fits at 360 px and units stay with their numbers', () => {
  assert.match(read('i18n-en-nutrition.js'), /'streak\.title': 'Meal streak: \{days\}'/);
  assert.match(read('i18n-vi-progress.js'), /tốt nhất \{best\}\\u00a0kg\{per\}/);
  assert.match(read('i18n-en-progress.js'), /best \{best\}\\u00a0kg\{per\}', other: '\{n\} sessions · best \{best\}\\u00a0kg\{per\}'/);
});

console.log(`STUDENT_COPY_OK ${passed} passed`);
