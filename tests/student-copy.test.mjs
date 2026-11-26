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

console.log(`STUDENT_COPY_OK ${passed} passed`);
