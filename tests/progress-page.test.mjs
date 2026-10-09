// Run with:  node tests/progress-page.test.mjs
// Wiring of the Tiến trình page: tabs, angle on upload, waist, and who sees what.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const page = readFileSync(new URL('../progress-photos.html', import.meta.url), 'utf8');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');

check('the page has four tabs, each with a panel', () => {
  for (const tab of ['update', 'weight', 'strength', 'gallery']) {
    assert.match(page, new RegExp(`data-progress-tab="${tab}"`), `${tab} tab`);
    assert.match(page, new RegExp(`data-progress-panel="${tab}"`), `${tab} panel`);
  }
});

check('an upload must carry an angle, and the angle is saved with the photo', () => {
  assert.match(page, /if \(!normalizeAngle\(angle\)\) \{ status\.textContent = 'Chọn góc chụp/);
  assert.match(page, /note, downloadURL, storagePath, angle,/);
});

check('the three angles are offered on upload and on tagging an old photo', () => {
  for (const id of ['photo-angle', 'lightbox-angle']) {
    const select = page.match(new RegExp(`<select id="${id}">([\\s\\S]*?)</select>`))[1];
    for (const angle of ['front', 'side', 'back']) assert.match(select, new RegExp(`value="${angle}"`), `${id} ${angle}`);
  }
});

check('only a student can tag a photo or add a measurement; the coach view hides the inputs', () => {
  assert.match(page, /\$\('lightbox-angle-wrap'\)\.style\.display = canEdit \? 'block' : 'none'/);
  assert.match(page, /\$\('waist-input-row'\)\.style\.display = 'none'/);
});

check('each read is independent, so one failing read leaves only its own section empty', () => {
  assert.match(page, /await Promise\.all\(\[refreshGallery\(\), refreshWeightLog\(\), refreshMeasurements\(\), refreshSessionsAndHabits\(\)\]\)/);
  assert.match(page, /Promise\.allSettled\(\[\s*listSessionHistory/);
});

check('the weight chart draws weekly averages, not single days', () => {
  assert.match(page, /weightChartSvg\(weeklyWeightAverages\(logs, today, 12\)\)/);
  assert.doesNotMatch(page, /function weightChartSvg/);
});

check('the data layer only stores a known angle and a plausible waist', () => {
  assert.match(data, /\.\.\.\(PHOTO_ANGLES\.includes\(angle\) \? \{ angle \} : \{\}\)/);
  assert.match(data, /value < 30 \|\| value > 250/);
});

console.log(`progress-page: ${passed} passed`);
