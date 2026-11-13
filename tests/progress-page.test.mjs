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

check('three tabs in one row: Tổng quan (weight then strength) opens first, then Số đo and Ảnh', () => {
  assert.deepEqual([...page.matchAll(/data-progress-tab="([a-z]+)" role="tab"/g)].map((m) => m[1]), ['overview', 'measure', 'gallery']);
  assert.match(page, /class="progress-tab active" data-progress-tab="overview" role="tab" aria-selected="true">Tổng quan</);
  for (const panel of ['weight', 'strength', 'measure', 'gallery']) assert.match(page, new RegExp(`data-progress-panel="${panel}"`), `${panel} panel`);
  assert.match(page, /PROGRESS_TAB_PANELS = Object\.freeze\(\{ overview: \['weight', 'strength'\], measure: \['measure'\], gallery: \['gallery'\] \}\)/);
  assert.match(page, /data-progress-panel="weight" role="tabpanel">/, 'cân nặng hiện sẵn');
  assert.match(page, /data-progress-panel="strength" role="tabpanel">/, 'sức mạnh hiện sẵn');
  assert.match(page, /data-progress-panel="measure" role="tabpanel" hidden>/);
  assert.match(page, /\.progress-tabs \{ display:grid; grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/);
  assert.doesNotMatch(page, /\.progress-tabs\{grid-template-columns:repeat\(2/);
});

check('adding a photo is a button inside the Ảnh tab, open by itself only while there is no photo', () => {
  assert.doesNotMatch(page, /data-progress-tab="update"|data-progress-panel="update"/);
  assert.match(page, /data-progress-panel="gallery" role="tabpanel" hidden>[\s\S]*?<details class="entry-toggle photo-entry" id="photo-entry">\n\s+<summary>\+ Thêm ảnh<\/summary>[\s\S]*?id="upload-card"[\s\S]*?<\/details>/);
  assert.match(page, /if \(!photos\.length && canEdit\) \$\('photo-entry'\)\.open = true;/);
  assert.match(page, /\$\('photo-entry'\)\.hidden = true;\n\s+selectProgressTab\('gallery'\);/, 'coach chỉ xem');
  assert.match(page, /if \(location\.hash === '#anh'\) \{ selectProgressTab\('gallery'\);/);
  assert.match(readFileSync(new URL('../home.html', import.meta.url), 'utf8'), /href="progress-photos\.html#anh">/);
});

check('an upload must carry an angle, and the angle is saved with the photo', () => {
  assert.match(page, /if \(pending\.some\(\(item\) => !normalizeAngle\(item\.angle\)\)\) \{ status\.textContent = 'Chọn góc chụp/);
  assert.match(page, /note, downloadURL, storagePath, angle: item\.angle/);
});

check('the three angles are offered on upload and on tagging an old photo', () => {
  for (const id of ['photo-angle', 'lightbox-angle']) {
    const select = page.match(new RegExp(`<select id="${id}">([\\s\\S]*?)</select>`))[1];
    for (const angle of ['front', 'side', 'back']) assert.match(select, new RegExp(`value="${angle}"`), `${id} ${angle}`);
  }
});

check('only a student can tag a photo or add a measurement; the coach view hides the inputs', () => {
  assert.match(page, /\$\('lightbox-angle-wrap'\)\.style\.display = canEdit \? 'block' : 'none'/);
  // The weight and measurement forms sit inside their "+ Thêm…" toggles, hidden whole for the coach.
  assert.match(page, /\$\('measure-entry'\)\.hidden = true/);
  assert.match(page, /\$\('weight-entry'\)\.hidden = true/);
  assert.match(page, /<details class="entry-toggle" id="measure-entry">[\s\S]*?id="measure-input-row"[\s\S]*?<\/details>/);
});

check('results come before the entry forms on the weight tab', () => {
  assert.ok(page.indexOf('id="weight-chart-wrap"') < page.indexOf('id="weight-entry"'));
  assert.ok(page.indexOf('id="measure-view"') < page.indexOf('id="measure-entry"'));
});

check('each read is independent, so one failing read leaves only its own section empty', () => {
  assert.match(page, /await Promise\.all\(\[refreshGallery\(\), refreshWeightLog\(\), refreshMeasurements\(\), refreshSessionsAndHabits\(\)\]\)/);
  assert.match(page, /Promise\.allSettled\(\[\s*listSessionHistory/);
});

check('the weight chart draws weekly averages, not single days', () => {
  assert.match(page, /weightChartSvg\(weeklyWeightAverages\(logs, today, 12\)\)/);
  assert.doesNotMatch(page, /function weightChartSvg/);
});

check('the data layer only stores a known angle and measurements within their limits', () => {
  assert.match(data, /\.\.\.\(PHOTO_ANGLES\.includes\(angle\) \? \{ angle \} : \{\}\)/);
  assert.match(data, /const \{ values, error \} = cleanMeasurements\(sites\);\s*if \(error\) throw new Error\(error\);/);
});

check('the measurements form is built from the list of sites and saves only what was typed', () => {
  assert.match(page, /measureGroups\(\)\.map\(/);
  assert.match(page, /const \{ values, error \} = cleanMeasurements\(typed\);/);
  assert.match(page, /addBodyMeasurement\(targetUid, \{ \.\.\.values, loggedAt:/);
});

console.log(`progress-page: ${passed} passed`);
