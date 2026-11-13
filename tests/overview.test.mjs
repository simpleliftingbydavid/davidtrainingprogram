// Tổng quan học viên (coach), David 2026-11-02.
//   node tests/overview.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ATTENTION, DEFAULT_PERIOD, PERIODS, anglePhotos, attentionReasons, compareInfo, dailyWeights, defaultPair, hasPhotoConsent,
  periodDays, photoSets, photoSummary, rollingAverage, sortRows, weightSummary,
} from '../overview-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const TODAY = '2026-11-02';
const at = (iso, hour = 7) => new Date(`${iso}T0${hour}:00:00+07:00`);
const MEALS = [{ id: 'm1', name: 'Sáng', items: [] }, { id: 'm2', name: 'Trưa', items: [] }, { id: 'm3', name: 'Tối', items: [] }];
const plan = { meals: MEALS, publishedAt: at('2026-10-27') };

check('periods: 7, 14 or 30 days, 14 by default, ending today', () => {
  assert.deepEqual(PERIODS, [7, 14, 30]);
  assert.equal(DEFAULT_PERIOD, 14);
  const days = periodDays(7, TODAY);
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-10-27');
  assert.equal(days[6], TODAY);
});

check('thresholds are the ones David approved', () => {
  assert.deepEqual({ ...ATTENTION }, { weightGapDays: 3, mealRate: 0.7, photoDays: 28 });
});

check('weights: the last weigh-in of a day is that day\'s weight', () => {
  const daily = dailyWeights([
    { weight: 80, loggedAt: at('2026-11-01', 6) },
    { weight: 79.6, loggedAt: at('2026-11-01', 9) },
    { weight: 'x', loggedAt: at('2026-10-31') },
  ]);
  assert.deepEqual(daily, [{ day: '2026-11-01', weight: 79.6 }]);
});

const weighIns = ['2026-10-20', '2026-10-21', '2026-10-24', '2026-10-27', '2026-10-28', '2026-10-30', '2026-10-31']
  .map((iso, index) => ({ weight: 80 - index * 0.2, loggedAt: at(iso) }));

check('weight summary: change since the last weigh-in, 7-day averages, gap, period stats', () => {
  const w = weightSummary(weighIns, 7, TODAY);
  assert.equal(w.loggedDays, 4, '27, 28, 30 and 31 October');
  assert.equal(w.latest.day, '2026-10-31');
  assert.equal(w.change, -0.2);
  assert.equal(w.gapDays, 2);
  assert.equal(w.rows[0].change, -0.2, 'the first row of the period compares with the weigh-in before the period');
  assert.equal(w.rows[0].sinceDays, 3);
  assert.equal(w.min, 78.8);
  assert.equal(w.max, 79.4);
  assert.equal(w.periodChange, -0.6);
  assert.equal(w.weekAvg, rollingAverage(dailyWeights(weighIns), TODAY));
  assert.equal(w.weeklyChange, Math.round((w.weekAvg - w.prevWeekAvg) * 100) / 100);
  assert.equal(weightSummary([], 7, TODAY), null);
});

const photo = (id, iso, angle) => ({ id, takenAt: at(iso, 8), angle, downloadURL: `https://x/${id}.jpg` });
const photos = [
  photo('a1', '2026-09-01', 'front'), photo('a2', '2026-09-01', 'side'), photo('a3', '2026-09-01', 'back'),
  photo('b1', '2026-10-01', 'front'), photo('b2', '2026-10-01', 'side'),
  photo('c1', '2026-10-01', ''),
];

check('photos: grouped by day, newest first, with the angles missing from the latest set', () => {
  const sets = photoSets(photos);
  assert.deepEqual(sets.map((set) => set.day), ['2026-10-01', '2026-09-01']);
  assert.equal(sets[0].other.length, 1);
  const p = photoSummary(photos, TODAY);
  assert.equal(p.count, 2);
  assert.equal(p.sinceDays, 32);
  assert.deepEqual(p.missingAngles, ['back']);
  assert.equal(photoSummary([], TODAY), null);
});

check('attention: no weight for 3 days, meals under 70%, no photo for over 28 days', () => {
  const ok = attentionReasons({ nutrition: { rate: 0.7 }, weight: { gapDays: 2 }, photos: { sinceDays: 28 } });
  assert.deepEqual(ok, []);
  const bad = attentionReasons({ nutrition: { rate: 0.69 }, weight: { gapDays: 3 }, photos: { sinceDays: 29 } });
  assert.deepEqual(bad, ['3 ngày chưa ghi cân', 'Tick bữa 69%', '29 ngày chưa chụp ảnh']);
  assert.deepEqual(attentionReasons({ nutrition: null, weight: null, photos: null }), ['Chưa ghi cân lần nào', 'Chưa có ảnh'], 'no plan: meals are not judged');
});

check('rows: flagged students first, then by name', () => {
  const rows = sortRows([
    { name: 'Bình', reasons: [] }, { name: 'An', reasons: [] }, { name: 'Cường', reasons: ['x'] },
  ]);
  assert.deepEqual(rows.map((row) => row.name), ['Cường', 'An', 'Bình']);
});

check('portfolio: only an explicit consent counts', () => {
  assert.equal(hasPhotoConsent({ photoConsent: { granted: true } }), true);
  assert.equal(hasPhotoConsent({ photoConsent: { granted: false } }), false);
  assert.equal(hasPhotoConsent({ photoConsent: 'yes' }), false);
  assert.equal(hasPhotoConsent({}), false);
});

check('before/after: oldest and newest of one angle, on different days', () => {
  assert.deepEqual(anglePhotos(photos, 'front').map((p) => p.id), ['a1', 'b1']);
  const pair = defaultPair(photos, 'front');
  assert.equal(pair.before.id, 'a1');
  assert.equal(pair.after.id, 'b1');
  assert.equal(defaultPair(photos, 'back'), null, 'one back photo is not a pair');
});

check('compare: weeks apart and the weight change between the two photo days', () => {
  const logs = [{ weight: 82, loggedAt: at('2026-09-01') }, { weight: 79.5, loggedAt: at('2026-10-01') }];
  const info = compareInfo(photos[0], photos[3], logs);
  assert.equal(info.days, 30);
  assert.equal(info.weeks, 4.3);
  assert.equal(info.weightChange, -2.5);
  const none = compareInfo(photos[0], photos[3], []);
  assert.equal(none.weightChange, null, 'no weigh-in on a photo day: no number is made up');
});

// Strip CR so the regexes below match on CRLF checkouts (core.autocrlf=true).
const page = readFileSync(new URL('../overview.html', import.meta.url), 'utf8').replace(/\r/g, '');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8').replace(/\r/g, '');

check('the page is for the coach only and writes only the consent and the nutrition settings', () => {
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  const imports = page.match(/import \{([^}]+)\} from '\.\/training-data\.js'/)[1].split(',').map((name) => name.trim()).filter(Boolean).sort();
  assert.deepEqual(imports, ['getMyRole', 'getNutritionPlan', 'listBodyWeightLogs', 'listMyStudents', 'listNutritionCheckins', 'listProgressPhotos', 'setStudentNutritionSettings', 'setStudentPhotoConsent']);
  assert.equal(page.match(/setStudentNutritionSettings\(/g).length, 1);
  assert.equal(page.match(/setStudentPhotoConsent\(/g).length, 1);
  assert.match(page, /window\.confirm\(question\)/);
});

check('consent is one field on the student record', () => {
  assert.match(data, /export async function setStudentPhotoConsent\(studentUid, granted\) \{\n {2}const photoConsent = \{ granted: granted === true, at: serverTimestamp\(\) \};\n {2}await updateDoc\(doc\(db, 'students', studentUid\), \{ photoConsent, updatedAt: serverTimestamp\(\) \}\);/);
});

check('the collage export only shows for consented students and explains a CORS block', () => {
  const portfolio = page.slice(page.indexOf('function portfolioDetail(row)'), page.indexOf('function pickCompare'));
  assert.match(portfolio, /if \(!granted\) return/);
  assert.match(page, /image\.crossOrigin = 'anonymous'/);
  assert.match(page, /Kho ảnh chưa cho phép xuất file/);
  assert.match(page, /gsutil cors set cors\.json/);
  assert.match(page, /\$\('ov-show-name'\)\.checked/);
  assert.doesNotMatch(page, /fetch\(|XMLHttpRequest|sendBeacon/, 'nothing is sent anywhere');
});

check('the period choice is remembered only as a convenience', () => {
  assert.match(page, /try \{\n {4}const saved = Number\(localStorage\.getItem\(PERIOD_KEY\)\);/);
  assert.match(page, /try \{ localStorage\.setItem\(PERIOD_KEY, String\(value\)\); \} catch/);
});

check('the coach dashboard links to the page', () => {
  const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  assert.match(readFileSync(new URL('../app-shell.js', import.meta.url), 'utf8'), /\{ label: 'Tổng quan học viên', href: 'overview\.html' \}/);
});

console.log(`OVERVIEW_OK ${passed} passed`);
