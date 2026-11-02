// Dinh dưỡng chế độ đơn giản (David, 2026-11-02).
//   node tests/nutrition-simple.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MAX_MEALS_PER_DAY, mealCountFor, normalizeNutritionSettings, normalizeSimpleDay, nutritionMode, proteinGuide, settingsErrors,
  simpleSummary, stepsMetFor,
} from '../nutrition-simple.js';
import { attentionReasons, simpleNutritionSummary, studentNutrition } from '../overview-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const plan = { protein: 140, meals: [{ id: 'a', name: 'Bữa sáng' }, { id: 'b', name: 'Bữa trưa' }, { id: 'c', name: 'Bữa phụ' }, { id: 'd', name: 'Bữa tối' }] };

check('every student starts in the simple mode; only an explicit "detailed" switches', () => {
  assert.equal(nutritionMode({}), 'simple');
  assert.equal(nutritionMode({ nutritionSettings: { mode: 'detailed' } }), 'detailed');
  assert.equal(nutritionMode({ nutritionSettings: { mode: 'other' } }), 'simple');
  assert.deepEqual(normalizeNutritionSettings(), { mode: 'simple', stepTarget: null, mealsPerDay: null, proteinNote: '' });
});

check('settings are cleaned; nothing is invented when left blank', () => {
  assert.deepEqual(normalizeNutritionSettings({ mode: 'detailed', stepTarget: '8000', mealsPerDay: '3', proteinNote: '  một   lòng bàn tay  ' }),
    { mode: 'detailed', stepTarget: 8000, mealsPerDay: 3, proteinNote: 'một lòng bàn tay' });
  assert.equal(normalizeNutritionSettings({ stepTarget: '' }).stepTarget, null);
  assert.equal(normalizeNutritionSettings({ mealsPerDay: MAX_MEALS_PER_DAY + 1 }).mealsPerDay, null);
  assert.deepEqual(settingsErrors({ stepTarget: '', mealsPerDay: '' }), []);
  assert.equal(settingsErrors({ stepTarget: 'nhiều' }).length, 1);
  assert.equal(settingsErrors({ mealsPerDay: 2.5 }).length, 1);
  assert.equal(settingsErrors({ proteinNote: 'x'.repeat(200) }).length, 1);
});

check('meals a day: the coach\'s number first, then the plan\'s, else none', () => {
  assert.equal(mealCountFor({ mealsPerDay: 3 }, plan, '2026-11-02'), 3);
  assert.equal(mealCountFor({}, plan, '2026-11-02'), 4);
  assert.equal(mealCountFor({}, null, '2026-11-02'), null);
});

check('the protein line: David\'s words, then grams per meal from the plan, then a line without numbers', () => {
  assert.equal(proteinGuide({ proteinNote: 'Một lòng bàn tay thịt cá.' }, plan, 4), 'Một lòng bàn tay thịt cá.');
  assert.equal(proteinGuide({}, plan, 4), 'Khoảng 35 g đạm mỗi bữa, kèm một phần rau.');
  assert.equal(proteinGuide({}, { protein: 0 }, 4), 'Mỗi bữa có một món đạm và một phần rau.');
  assert.equal(proteinGuide({}, null, null), 'Mỗi bữa có một món đạm và một phần rau.');
});

check('a day is cleaned before saving', () => {
  assert.deepEqual(normalizeSimpleDay({ simpleMeals: [3, 0, 0, 7, -1, 'x'], simpleMealCount: 4, stepsMet: 'yes', steps: '9001.6' }),
    { simpleMeals: [0, 3], simpleMealCount: 4, stepsMet: null, steps: 9002 });
  assert.deepEqual(normalizeSimpleDay({ simpleMeals: [0], simpleMealCount: null }).simpleMeals, [], 'no meal count, no meals');
  assert.equal(normalizeSimpleDay({ stepsMet: false }).stepsMet, false);
});

check('steps: the student\'s answer wins; a typed count is compared with the target', () => {
  assert.equal(stepsMetFor({ stepsMet: false, steps: 12000 }, 8000), false);
  assert.equal(stepsMetFor({ steps: 8000 }, 8000), true);
  assert.equal(stepsMetFor({ steps: 7999 }, 8000), false);
  assert.equal(stepsMetFor({}, 8000), null);
});

check('the week: meals with protein and vegetables, and days the steps were met', () => {
  const days = [
    { date: '2026-11-01', checkin: { simpleMeals: [0, 1, 2], simpleMealCount: 3, stepsMet: true } },
    { date: '2026-11-02', checkin: { simpleMeals: [0], simpleMealCount: 3, steps: 5000 } },
    { date: '2026-11-03', checkin: null },
  ];
  const summary = simpleSummary(days, { settings: { stepTarget: 8000, mealsPerDay: 3 } });
  assert.deepEqual(summary.meals, { done: 4, planned: 9, rate: 4 / 9 });
  assert.deepEqual(summary.steps, { met: 1, answered: 2, days: 3 });
  assert.deepEqual(summary.perDay.map((day) => day.status), ['full', 'partial', 'missed']);
  const noSteps = simpleSummary(days, { settings: { mealsPerDay: 3 } });
  assert.equal(noSteps.steps.days, 0, 'no target: steps are not asked and not counted');
});

check('the overview reads each student in their own mode, from the day they started', () => {
  const student = { nutritionSettings: { mealsPerDay: 3, stepTarget: 8000 }, createdAt: new Date('2026-10-31T09:00:00+07:00') };
  const checkins = [{ date: '2026-11-01', simpleMeals: [0, 1], simpleMealCount: 3, stepsMet: true }];
  const n = simpleNutritionSummary(student, null, checkins, 7, '2026-11-02');
  assert.equal(n.mode, 'simple');
  assert.equal(n.countedDays, 3, '31/10 to 2/11');
  assert.equal(n.done, 2);
  assert.equal(n.planned, 9);
  assert.equal(n.steps.met, 1);
  assert.equal(studentNutrition({ nutritionSettings: { mode: 'detailed' } }, null, [], 7, '2026-11-02'), null, 'detailed without a plan: as before');
  assert.equal(studentNutrition({ nutritionSettings: { mode: 'detailed' } }, plan, [], 7, '2026-11-02').mode, 'detailed');
  assert.deepEqual(attentionReasons({ nutrition: { mode: 'simple', rate: 0.5 }, weight: { gapDays: 0 }, photos: { sinceDays: 1 } }), ['Bữa đủ đạm+rau 50%']);
});

// Strip CR so the regexes below match on CRLF checkouts (core.autocrlf=true).
const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8').replace(/\r/g, '');
const overview = readFileSync(new URL('../overview.html', import.meta.url), 'utf8').replace(/\r/g, '');

check('the student page: simple by default, detailed kept as it was', () => {
  assert.match(page, /simpleMode = role === 'student' && nutritionMode\(student\) === 'simple';/);
  assert.match(page, /if \(simpleMode\) \{ renderSimpleHero\(\); return; \}/);
  assert.match(page, /if \(simpleMode\) \{ renderSimpleWeek\(\); return; \}/);
  assert.match(page, /if \(simpleMode\) await setupSimpleMode\(\);/);
  assert.match(page, /\['student-checkin', 'eating-out', 'daily-log', 'nutrition-standards', 'empty-state', 'macro-grid'\]\.forEach/);
  assert.match(page, /Để tham khảo món, không cần ăn đúng\./);
});

check('the student saves the day and the weight, never the settings', () => {
  assert.match(page, /saveNutritionSimpleDay\(studentUid, today, next, \{ planVersionId: plan\?\.versionId \|\| '' \}\)/);
  assert.match(page, /addBodyWeightLog\(studentUid, \{ weight, loggedAt, note: 'Cân buổi sáng' \}\)/);
  assert.doesNotMatch(page, /setStudentNutritionSettings/);
  assert.match(page, /simpleDay = previous;/, 'a failed save puts the day back');
  assert.match(data, /export async function saveNutritionSimpleDay\(studentUid, date, day = \{\}, \{ planVersionId = '' \} = \{\}\) \{\n {2}const clean = normalizeSimpleDay\(day\);/);
  assert.match(data, /export async function setStudentNutritionSettings\(studentUid, settings\) \{\n {2}const errors = settingsErrors\(settings\);/);
});

check('the coach sets the mode and targets on the overview page', () => {
  assert.match(overview, /setStudentNutritionSettings\(row\.student\.id, values\)/);
  assert.match(overview, /name="stepTarget"/);
  assert.match(overview, /name="mealsPerDay"/);
  assert.match(overview, /name="proteinNote"/);
});

console.log(`NUTRITION_SIMPLE_OK ${passed} passed`);
