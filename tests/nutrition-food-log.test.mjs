// Chế độ chi tiết: học viên tự ghi món đã ăn, Mốc 2 (David, 2026-11-03).
//   node tests/nutrition-food-log.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getFood, STREET_DISHES } from '../nutrition-foods.js';
import { FOOD_MICROS } from '../nutrition-micros.js';
import { COOKED_YIELD } from '../nutrition-intake-utils.js';
import {
  FOOD_LOG_MEALS, copyMeal, dayTotals, entryNutrients, frequentFoods, normalizeFoodEntries, normalizeFoodEntry,
  nutrientProgress, searchFoods, snackDay, targetsFromPlan,
} from '../nutrition-food-log.js';
import { snacksForDay } from '../nutrition-snacks.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('four meals a day: morning, noon, evening, snack', () => {
  assert.deepEqual(FOOD_LOG_MEALS.map((meal) => meal.id), ['sang', 'trua', 'toi', 'phu']);
});

check('an entry is cleaned before saving; anything unknown is dropped', () => {
  assert.deepEqual(normalizeFoodEntry({ id: 'a', meal: 'trua', name: 'Cơm trắng (chín)', grams: '200.4' }),
    { id: 'a', meal: 'trua', kind: 'food', name: 'Cơm trắng (chín)', grams: 200, cooked: false });
  assert.equal(normalizeFoodEntry({ id: 'a', meal: 'trua', name: 'Cơm trắng (chín)', grams: 200, cooked: true }).cooked, false, 'rice cannot be weighed "cooked" as meat');
  assert.equal(normalizeFoodEntry({ id: 'a', meal: 'trua', name: 'Ức gà bỏ da (sống)', grams: 150, cooked: true }).cooked, true);
  assert.equal(normalizeFoodEntry({ id: 'a', meal: 'brunch', name: 'Chuối', grams: 100 }), null);
  assert.equal(normalizeFoodEntry({ id: 'a', meal: 'sang', name: 'Bánh kem', grams: 100 }), null);
  assert.equal(normalizeFoodEntry({ id: 'a', meal: 'sang', name: 'Chuối', grams: 0 }), null);
  assert.equal(normalizeFoodEntry({ id: 'a', meal: 'sang', name: 'Chuối', grams: 5000 }), null);
  assert.deepEqual(normalizeFoodEntry({ id: 's', meal: 'trua', kind: 'street', name: 'Phở bò tái', servings: '1.5' }),
    { id: 's', meal: 'trua', kind: 'street', name: 'Phở bò tái', servings: 1.5 });
  assert.equal(normalizeFoodEntries([{ id: 'x', meal: 'sang', name: 'Chuối', grams: 100 }, { id: 'x', meal: 'sang', name: 'Táo', grams: 100 }]).length, 1, 'ids are unique');
});

check('meat weighed cooked is counted as its raw weight', () => {
  const cooked = entryNutrients({ kind: 'food', name: 'Ức gà bỏ da (sống)', grams: 150, cooked: true });
  const raw = entryNutrients({ kind: 'food', name: 'Ức gà bỏ da (sống)', grams: 150 / COOKED_YIELD['Ức gà bỏ da (sống)'] });
  assert.ok(Math.abs(cooked.values.kcal - raw.values.kcal) < 1e-9);
  assert.ok(cooked.values.protein > 150 * getFood('Ức gà bỏ da (sống)').protein / 100, 'more than the cooked grams read as raw');
});

check('a day adds up by meal and in total, with all eleven nutrients', () => {
  const entries = [
    { id: '1', meal: 'sang', kind: 'food', name: 'Trứng gà nguyên quả', grams: 100 },
    { id: '2', meal: 'trua', kind: 'food', name: 'Cơm trắng (chín)', grams: 200 },
  ];
  const totals = dayTotals(entries);
  assert.equal(totals.perMeal.sang.values.kcal, getFood('Trứng gà nguyên quả').kcal);
  assert.equal(totals.values.kcal, getFood('Trứng gà nguyên quả').kcal + getFood('Cơm trắng (chín)').kcal * 2);
  assert.equal(totals.values.sodium, Math.round((FOOD_MICROS['Trứng gà nguyên quả'].micros.sodium + FOOD_MICROS['Cơm trắng (chín)'].micros.sodium * 2) * 10) / 10);
  assert.deepEqual(totals.missing, []);
  assert.equal(totals.estimated, false);
  assert.equal(totals.perMeal.toi.count, 0);
});

check('an unapproved street dish counts calories and protein only, and marks the day as an estimate', () => {
  const totals = dayTotals([{ id: '1', meal: 'trua', kind: 'street', name: 'Phở bò tái', servings: 1 }]);
  const pho = STREET_DISHES.find((dish) => dish.name === 'Phở bò tái');
  assert.equal(totals.values.kcal, (pho.kcalLow + pho.kcalHigh) / 2);
  assert.equal(totals.values.protein, pho.protein);
  assert.ok(totals.missing.includes('carb') && totals.missing.includes('sodium'));
  assert.equal(totals.estimated, true);
});

const plan = { kcal: 2000, protein: 140, carbs: 200, fat: 60, micros: { fiberG: 30, potassiumMg: 3500, sodiumMg: 2300, calciumMg: 1000, magnesiumMg: 400, ironMg: 8, zincMg: 11 } };

check('targets come from the plan; none are made up', () => {
  assert.deepEqual(targetsFromPlan(plan), { kcal: 2000, protein: 140, carb: 200, fat: 60, fiber: 30, potassium: 3500, sodium: 2300, calcium: 1000, magnesium: 400, iron: 8, zinc: 11 });
  assert.ok(Object.values(targetsFromPlan(null)).every((value) => value === null));
  assert.equal(targetsFromPlan({ kcal: 2000 }).potassium, null);
});

check('progress: left, done, and sodium as a ceiling; a data gap is flagged, not hidden', () => {
  const totals = { values: { kcal: 1500, protein: 150, carb: 100, fat: 20, fiber: 10, potassium: 1000, sodium: 2500, calcium: 200, magnesium: 100, iron: 3, zinc: 4 }, missing: ['potassium'] };
  const rows = Object.fromEntries(nutrientProgress(totals, targetsFromPlan(plan)).map((row) => [row.key, row]));
  assert.equal(rows.kcal.status, 'left');
  assert.equal(rows.kcal.remaining, 500);
  assert.equal(rows.protein.status, 'done');
  assert.equal(rows.sodium.limit, true);
  assert.equal(rows.sodium.status, 'over');
  assert.equal(rows.potassium.status, 'left');
  assert.equal(rows.potassium.unknown, true);
  const none = nutrientProgress(totals, targetsFromPlan(null));
  assert.ok(none.every((row) => row.status === 'none'));
});

check('what is left feeds the snack ideas; unknown carbs and fat are not chased', () => {
  const totals = dayTotals([{ id: '1', meal: 'trua', kind: 'food', name: 'Cơm trắng (chín)', grams: 300 }]);
  const result = snacksForDay(snackDay(totals, targetsFromPlan(plan)));
  assert.equal(result.status, 'suggest');
  assert.ok(result.short.includes('protein'));
  const street = dayTotals([{ id: '1', meal: 'trua', kind: 'street', name: 'Phở bò tái', servings: 1 }]);
  assert.equal(snackDay(street, targetsFromPlan(plan)).eatenOut, true);
});

check('search works without diacritics; table foods first, then street dishes', () => {
  assert.deepEqual(searchFoods('ca hoi').map((item) => item.name), ['Cá hồi fillet']);
  const pho = searchFoods('pho');
  assert.equal(pho[0].kind, 'food');
  assert.ok(pho.some((item) => item.kind === 'street' && item.name === 'Phở bò tái'));
  assert.deepEqual(searchFoods('   '), []);
});

check('frequent foods: the most logged first, with the latest amount', () => {
  const days = [
    { date: '2026-11-02', foodEntries: [{ id: 'a', meal: 'sang', name: 'Chuối', grams: 120 }, { id: 'b', meal: 'trua', name: 'Cơm trắng (chín)', grams: 200 }] },
    { date: '2026-11-01', foodEntries: [{ id: 'c', meal: 'sang', name: 'Chuối', grams: 100 }] },
  ];
  const list = frequentFoods(days);
  assert.equal(list[0].name, 'Chuối');
  assert.equal(list[0].count, 2);
  assert.equal(list[0].grams, 120, 'the most recent amount');
});

check('copy a meal from yesterday with new ids', () => {
  let n = 0;
  const copied = copyMeal([{ id: 'y1', meal: 'toi', name: 'Chuối', grams: 100 }, { id: 'y2', meal: 'sang', name: 'Táo', grams: 100 }], 'toi', () => `new${n += 1}`);
  assert.deepEqual(copied, [{ id: 'new1', meal: 'toi', kind: 'food', name: 'Chuối', grams: 100, cooked: false }]);
});

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');

check('the student page: detailed mode is the food log; simple mode and the coach view are untouched', () => {
  assert.match(page, /foodLogMode = role === 'student' && nutritionMode\(student\) === 'detailed';/);
  assert.match(page, /if \(foodLogMode\) \{ renderFoodLogHero\(\); return; \}/);
  assert.match(page, /if \(foodLogMode\) await setupFoodLogMode\(\);/);
  assert.match(page, /\['student-checkin', 'eating-out', 'daily-log', 'nutrition-standards', 'empty-state', 'macro-grid', 'plan-view', 'student-progress-status'\]/);
  assert.match(page, /flEntries = previous;/, 'a failed save puts the list back');
});

check('the log is saved whole and cleaned, on the day\'s own record', () => {
  assert.match(data, /export async function saveNutritionFoodEntries\(studentUid, date, entries = \[\], \{ planVersionId = '' \} = \{\}\) \{\n {2}const foodEntries = normalizeFoodEntries\(entries\);/);
  assert.match(page, /saveNutritionFoodEntries\(studentUid, today, toSave, \{ planVersionId: plan\?\.versionId \|\| '' \}\)/);
});

check('every class of the food log is scoped to the student look', () => {
  const css = readFileSync(new URL('../client-nutrition.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /(^|[\s,}])\.fl-/m);
  assert.match(css, /\.cu-fl-root/);
});

console.log(`NUTRITION_FOOD_LOG_OK ${passed} passed`);
