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
import { foodLogDay, foodLogSummary } from '../nutrition-food-log.js';
import { foodLogAveragesMarkup, foodLogDayMarkup } from '../nutrition-food-log-ui.js';
import { attentionReasons, studentNutrition } from '../overview-utils.js';

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

check('a street dish without a recipe counts calories and protein only, and marks the day as an estimate', () => {
  const totals = dayTotals([{ id: '1', meal: 'trua', kind: 'street', name: 'Nước mía (500ml)', servings: 1 }]);
  const pho = STREET_DISHES.find((dish) => dish.name === 'Nước mía (500ml)');
  assert.equal(totals.values.kcal, (pho.kcalLow + pho.kcalHigh) / 2);
  assert.equal(totals.values.protein, pho.protein);
  assert.ok(totals.missing.includes('carb') && totals.missing.includes('sodium'));
  assert.equal(totals.estimated, true);
});

const plan = { kcal: 2000, protein: 140, carbs: 200, fat: 60, micros: { fiberG: 30, potassiumMg: 3500, sodiumMg: 2300, calciumMg: 1000, magnesiumMg: 400, ironMg: 8, zincMg: 11 } };

check('targets: calories and macros from the plan; minerals and vitamins from the Institute table by sex and age', () => {
  // Nam, chưa có tuổi: nhóm 18–29. Sắt theo mức hấp thu 15%. E, K, B12 theo DRI (USDA NAL).
  assert.deepEqual(targetsFromPlan({ ...plan, sex: 'male' }), {
    kcal: 2000, protein: 140, carb: 200, fat: 60, fiber: 21, potassium: 3000, sodium: 2000, calcium: 800, magnesium: 340, iron: 7.9, zinc: 10,
    vitaminA: 850, vitaminC: 100, vitaminD: 15, vitaminE: 15, vitaminK: 120, vitaminB1: 1.4, vitaminB6: 1.3, folate: 240, vitaminB12: 2.4,
  });
  const woman = targetsFromPlan({ ...plan, sex: '' }, { sex: 'female', age: 34 });
  assert.deepEqual([woman.iron, woman.magnesium, woman.vitaminA, woman.fiber], [17.4, 290, 650, 18]);
  assert.ok(Object.values(targetsFromPlan(null)).every((value) => value === null));
  // Kế hoạch cũ lưu vi chất của app cũ: không còn được dùng.
  assert.equal(targetsFromPlan({ kcal: 2000, sex: 'male', micros: { calciumMg: 1350 } }).calcium, 800);
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
  const street = dayTotals([{ id: '1', meal: 'trua', kind: 'street', name: 'Nước mía (500ml)', servings: 1 }]);
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

// Strip CR so the regexes below match on CRLF checkouts (core.autocrlf=true).
const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8').replace(/\r/g, '');

check('the student page: detailed mode is the food log; simple mode and the coach view are untouched', () => {
  assert.match(page, /foodLogMode = role === 'student' && nutritionMode\(student\) === 'detailed';/);
  assert.match(page, /if \(foodLogMode\) renderFoodLogHero\(\); else renderSimpleHero\(\);/);
  assert.match(page, /if \(foodLogMode\) await setupFoodLogMode\(\);/);
  assert.match(page, /\['daily-log', 'nutrition-standards', 'empty-state', 'macro-grid', 'student-progress-status'\]/);
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

// ---- Mốc 3: coach xem ----
const egg = (id, meal, grams = 100) => ({ id, meal, kind: 'food', name: 'Trứng gà nguyên quả', grams });
const chicken = (id, meal, grams) => ({ id, meal, kind: 'food', name: 'Ức gà bỏ da (sống)', grams });

check('a logged day: full when morning, noon and evening are logged; the snack is optional', () => {
  assert.equal(foodLogDay('2026-11-01', { foodEntries: [egg('a', 'sang'), egg('b', 'trua'), egg('c', 'toi')] }).status, 'full');
  assert.equal(foodLogDay('2026-11-01', { foodEntries: [egg('a', 'sang'), egg('b', 'phu')] }).status, 'partial');
  const empty = foodLogDay('2026-11-01', null);
  assert.equal(empty.status, 'missed');
  assert.equal(empty.mealsLogged, 0);
});

check('a period: days logged, protein within 10% of the target, averages over logged days only', () => {
  const targets = targetsFromPlan({ protein: 50 });
  const days = [
    foodLogDay('2026-11-01', { foodEntries: [chicken('a', 'trua', 200)] }),
    foodLogDay('2026-11-02', { foodEntries: [chicken('b', 'trua', 100)] }),
    foodLogDay('2026-11-03', null),
  ];
  const summary = foodLogSummary(days, targets);
  assert.equal(summary.countedDays, 3);
  assert.equal(summary.loggedDays, 2);
  assert.equal(summary.rate, 2 / 3);
  assert.equal(summary.proteinDays, 1, '46 g is within 10% of 50 g; 23 g is not');
  assert.equal(summary.averages.kcal, Math.round((240 + 120) / 2 * 10) / 10, 'the empty day is not averaged in');
  assert.equal(foodLogSummary(days, targetsFromPlan(null)).proteinDays, null, 'no target, no verdict');
  assert.equal(foodLogSummary([foodLogDay('2026-11-03', null)], targets).averages.kcal, null);
});

check('the overview reads a detailed student from the foods they logged', () => {
  const student = { nutritionSettings: { mode: 'detailed' }, createdAt: new Date('2026-11-01T09:00:00+07:00') };
  const n = studentNutrition(student, { protein: 50 }, [{ date: '2026-11-02', foodEntries: [chicken('a', 'trua', 200)] }], 7, '2026-11-03');
  assert.equal(n.mode, 'foodlog');
  assert.equal(n.countedDays, 3);
  assert.equal(n.loggedDays, 1);
  assert.deepEqual(attentionReasons({ nutrition: n, weight: { gapDays: 0 }, photos: { sinceDays: 1 } }), ['Chỉ ghi món 1/3 ngày']);
});

check('the coach reads a day by meal and a table of the eleven nutrients', () => {
  const day = foodLogDay('2026-11-02', { foodEntries: [egg('a', 'sang'), { id: 's', meal: 'trua', kind: 'street', name: 'Phở bò tái', servings: 1 }] });
  const html = foodLogDayMarkup(day, targetsFromPlan(plan));
  assert.match(html, /Trứng gà nguyên quả/);
  assert.match(html, /1 phần · ước tính/);
  assert.match(html, /Tối<\/strong><span>không ghi/);
  assert.match(html, /Natri <em>tối đa<\/em>/);
  assert.match(html, /Có món ăn ngoài: số liệu là ước tính\./);
  assert.match(foodLogDayMarkup(foodLogDay('2026-11-03', null), targetsFromPlan(plan)), /không ghi món nào/);
  const summary = foodLogSummary([day, foodLogDay('2026-11-03', null)], targetsFromPlan(plan));
  assert.match(foodLogAveragesMarkup(summary, targetsFromPlan(plan)), /Trung bình trên 1\/2 ngày có ghi/);
});

check('the coach page shows the food log only for a detailed student; the overview links it in', () => {
  assert.match(page, /if \(nutritionMode\(student\) === 'detailed'\) await renderCoachFoodLog\(\);/);
  const overview = readFileSync(new URL('../overview.html', import.meta.url), 'utf8');
  assert.match(overview, /n\?\.mode === 'foodlog' \? foodLogCell\(n\)/);
  assert.match(overview, /if \(n\?\.mode === 'foodlog'\) return foodLogDetail\(row\);/);
});

check('approved portions are offered as one-tap amounts in grams', () => {
  assert.match(page, /portionsFor\(p\.name\)\.map\(\(portion\) => `<button type="button" class="cu-fl-chip" data-fl-portion="\$\{portion\.grams\}">/);
  assert.match(page, /flEditor\.pick\.grams = Number\(button\.dataset\.flPortion\);\n {4}flEditor\.pick\.cooked = false;/);
});

console.log(`NUTRITION_FOOD_LOG_OK ${passed} passed`);
