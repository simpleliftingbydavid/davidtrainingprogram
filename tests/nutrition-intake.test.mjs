// What the client actually ate against the plan (David, 2026-10-19).
//   node tests/nutrition-intake.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FOODS, getFood } from '../nutrition-foods.js';
import {
  COOKED_YIELD, INTAKE_TOLERANCE, LOGGABLE_FOODS, MAX_MEAL_LOGS, QUICK_PORTIONS, canWeighCooked, dayIntake, entryMacros,
  intakePatterns, intakeVerdict, mealLogTotals, normalizeMealLog, normalizeMealLogs, planGrams, plannedEntries, plannedTotals,
  weighedGrams,
} from '../nutrition-intake-utils.js';
import { historyIntakeMarkup, intakeSummaryMarkup, mealLogBadgeText, patternsMarkup } from '../nutrition-intake-ui.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

// A lunch as the builder writes it: dish name, one line per food, the cook note, and an
// ordered-out version under its own label.
const lunch = {
  id: 'meal-2', name: 'Bữa trưa', kcal: 650, protein: 45, carbs: 80, fat: 15,
  items: [
    'Cơm + gà áp chảo + súp lơ luộc',
    'Ức gà bỏ da (sống) — 150 g (≈ 1.6 phần đạm)',
    'Súp lơ xanh — 150 g (≈ 1.5 phần rau)',
    'Cơm trắng (chín) — 190 g (≈ 2.7 phần tinh bột)',
    'Dầu ăn (oliu, đậu nành) — 8 g (≈ 0.8 phần béo)',
    'Cách làm: áp chảo ức gà 4 phút mỗi mặt.',
  ],
  alternative: {
    label: 'Đặt ngoài', kcal: 640, protein: 44, carbs: 82, fat: 14,
    items: ['Cơm gà xé + dưa leo', 'Ức gà bỏ da (sống) — 140 g', 'Dưa leo — 100 g', 'Cơm trắng (chín) — 200 g', 'Gọi món: ít da, ít nước mắm.'],
  },
};
const breakfast = { id: 'meal-1', name: 'Bữa sáng', items: ['Trứng luộc + khoai lang', 'Trứng gà nguyên quả — 110 g', 'Khoai lang (luộc) — 200 g'] };
const dinner = { id: 'meal-3', name: 'Bữa tối', items: ['Cơm + cá basa hấp', 'Cá basa fillet — 180 g', 'Cơm trắng (chín) — 150 g', 'Rau muống — 150 g'] };
const meals = [breakfast, lunch, dinner];
const near = (actual, expected, tolerance = 0.11) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

// ---------- raw and cooked ----------

check('meat and fish the plan weighs raw can be logged cooked; nothing else can', () => {
  for (const name of Object.keys(COOKED_YIELD)) {
    assert.ok(getFood(name), `${name} is not in the food table`);
    assert.ok(COOKED_YIELD[name] > 0.5 && COOKED_YIELD[name] < 1, name);
  }
  const rawProteins = FOODS.filter((food) => food.group === 'PROTEIN' && /(sống|Thịt|^Cá |Tôm|Mực)/.test(food.name)).map((food) => food.name);
  assert.deepEqual(rawProteins.filter((name) => !canWeighCooked(name)), [], 'a raw-weighed meat or fish without a yield');
  for (const name of ['Cơm trắng (chín)', 'Trứng gà nguyên quả', 'Đậu phụ trắng', 'Chả lụa', 'Sữa chua Hy Lạp không đường']) {
    assert.equal(canWeighCooked(name), false, name);
  }
});

check('200 g of cooked chicken breast counts as about 267 g raw, and back again', () => {
  const entry = { name: 'Ức gà bỏ da (sống)', grams: 200, cooked: true };
  near(planGrams(entry), 266.7);
  near(weighedGrams(planGrams(entry), entry.name, true), 200);
  const chicken = getFood('Ức gà bỏ da (sống)');
  near(entryMacros(entry).protein, chicken.protein * 2.667, 0.05);
  assert.ok(entryMacros(entry).protein > entryMacros({ ...entry, cooked: false }).protein * 1.3, 'read as raw it would under-count protein');
  assert.equal(planGrams({ name: 'Cơm trắng (chín)', grams: 100, cooked: true }), 100, 'rice is never converted');
});

// ---------- a meal ----------

check('a meal starts from the plan: one row per food line, the name and cook lines left out', () => {
  assert.deepEqual(plannedEntries(lunch).map((row) => [row.name, row.grams, row.planned, row.cooked]), [
    ['Ức gà bỏ da (sống)', 150, 150, false],
    ['Súp lơ xanh', 150, 150, false],
    ['Cơm trắng (chín)', 190, 190, false],
    ['Dầu ăn (oliu, đậu nành)', 8, 8, false],
  ]);
  assert.deepEqual(plannedEntries(lunch, 'alternative').map((row) => row.name), ['Ức gà bỏ da (sống)', 'Dưa leo', 'Cơm trắng (chín)']);
  assert.deepEqual(plannedEntries(breakfast, 'alternative').map((row) => row.name), ['Trứng gà nguyên quả', 'Khoai lang (luộc)'], 'no alternative: the meal itself');
});

check('an unchanged log adds up to exactly what the plan gives', () => {
  const log = normalizeMealLog({ mealId: lunch.id, items: plannedEntries(lunch), plannedTotals: plannedTotals(lunch) });
  const actual = mealLogTotals(log);
  const planned = plannedTotals(lunch);
  near(actual.kcal, planned.kcal, 2);
  near(actual.protein, planned.protein, 0.3);
  assert.equal(plannedTotals({ id: 'x', name: 'Tay', kcal: 500, protein: 30, carbs: 40, fat: 12, items: ['Ăn như mọi ngày'] }).kcal, 500, 'a hand-written meal keeps its own numbers');
});

check('the example from the client: 100 g rice and 200 g meat instead of the plan', () => {
  const rows = plannedEntries(lunch).map((row) => (row.name === 'Cơm trắng (chín)' ? { ...row, grams: 100 } : row.name.startsWith('Ức gà') ? { ...row, grams: 200, cooked: true } : row));
  const log = normalizeMealLog({ mealId: lunch.id, mealName: lunch.name, items: rows, plannedTotals: plannedTotals(lunch) });
  const actual = mealLogTotals(log);
  assert.ok(actual.carbs < log.plannedTotals.carbs - 20, 'less rice, fewer carbs');
  assert.ok(actual.protein > log.plannedTotals.protein + 20, 'more chicken, more protein');
});

check('a log is stored clean: known foods, sane grams, raw/cooked only where it applies', () => {
  const log = normalizeMealLog({
    mealId: 7, mealName: 'Bữa trưa', option: 'weird',
    items: [
      { name: 'Cơm trắng (chín)', grams: '120.04', planned: 190, cooked: true },
      { name: 'Không có món này', grams: 100 },
      { name: 'Ức gà bỏ da (sống)', grams: 2500 },
      { name: 'Chuối', grams: 0, planned: 0 },
      { name: 'Thịt bò thăn', grams: 150, cooked: 'yes', planned: null },
    ],
    plannedTotals: { kcal: 650.4, protein: -3 },
  });
  assert.equal(log.mealId, '7');
  assert.equal(log.option, 'home');
  assert.deepEqual(log.items, [
    { name: 'Cơm trắng (chín)', grams: 120, cooked: false, planned: 190 },
    { name: 'Chuối', grams: 0, cooked: false, planned: null },
    { name: 'Thịt bò thăn', grams: 150, cooked: true, planned: null },
  ]);
  assert.deepEqual(log.plannedTotals, { kcal: 650, protein: 0, carbs: 0, fat: 0 });
  const many = normalizeMealLogs([...Array(20)].map((_, index) => ({ mealId: `m${index % 15}` })));
  assert.equal(many.length, MAX_MEAL_LOGS);
  assert.equal(new Set(many.map((item) => item.mealId)).size, many.length, 'one log per meal');
});

// ---------- the day ----------

check('the day counts logged meals as logged, ticked meals as planned, and waits for the rest', () => {
  const lunchLog = normalizeMealLog({ mealId: lunch.id, mealName: lunch.name, items: plannedEntries(lunch).map((row) => ({ ...row, grams: row.grams / 2 })), plannedTotals: plannedTotals(lunch) });
  const partial = dayIntake({ meals, mealLogs: [lunchLog], completedMealIds: [breakfast.id] });
  assert.deepEqual(partial.perMeal.map((meal) => meal.status), ['ticked', 'logged', 'open']);
  assert.equal(partial.complete, false);
  assert.equal(partial.accounted, 2);
  near(partial.actual.kcal, plannedTotals(breakfast).kcal + mealLogTotals(lunchLog).kcal, 1);
  const whole = dayIntake({ meals, mealLogs: [lunchLog], completedMealIds: [breakfast.id, dinner.id] });
  assert.equal(whole.complete, true);
  assert.equal(whole.logged, 1);
  near(whole.planned.kcal, plannedTotals(breakfast).kcal + plannedTotals(lunch).kcal + plannedTotals(dinner).kcal, 1);
  const out = dayIntake({ meals, completedMealIds: [], foodLog: [{ name: 'Bánh mì thịt', kcal: 450, protein: 18, servings: 2 }] });
  assert.equal(out.actual.kcal, 900);
  assert.equal(out.actual.protein, 36);
  assert.equal(out.eatenOut, true);
});

check('a lunch eaten the ordered-out way is held against the ordered-out plan', () => {
  const log = normalizeMealLog({ mealId: lunch.id, option: 'alternative', items: plannedEntries(lunch, 'alternative'), plannedTotals: plannedTotals(lunch, 'alternative') });
  const day = dayIntake({ meals: [lunch], mealLogs: [log] });
  assert.deepEqual(day.perMeal[0].planned, plannedTotals(lunch, 'alternative'));
});

check('a macro within 10% of the plan is on plan; beyond it is short or over', () => {
  assert.equal(INTAKE_TOLERANCE, 0.1);
  const verdict = intakeVerdict({ kcal: 2000, protein: 100, carbs: 250, fat: 60 }, { kcal: 2190, protein: 85, carbs: 290, fat: 60 });
  assert.deepEqual(verdict.map((item) => [item.key, item.status, item.diff]), [
    ['kcal', 'ok', 190], ['protein', 'under', -15], ['carbs', 'over', 40], ['fat', 'ok', 0],
  ]);
});

// ---------- the coach's read ----------

check('what keeps coming back: the rice left on the plate, the lunch eaten short, the banana added', () => {
  const day = (rice, extra = true) => ({
    mealLogs: [{
      mealId: lunch.id, mealName: 'Bữa trưa', plannedTotals: plannedTotals(lunch),
      items: [...plannedEntries(lunch).map((row) => (row.name === 'Cơm trắng (chín)' ? { ...row, grams: rice } : row)),
        ...(extra ? [{ name: 'Chuối', grams: 120, planned: null }] : [])],
    }],
  });
  const patterns = intakePatterns([day(100), day(110), day(95, false)]);
  assert.equal(patterns.foods[0].name, 'Cơm trắng (chín)');
  near(patterns.foods[0].ratio, (100 + 110 + 95) / 3 / 190, 0.01);
  assert.equal(patterns.foods.length, 1, 'the foods eaten as planned are not reported');
  assert.deepEqual(patterns.extras, [{ name: 'Chuối', count: 2 }]);
  assert.deepEqual(intakePatterns([day(100)]), { meals: [], foods: [], extras: [] }, 'once is not a pattern');
  const markup = patternsMarkup(patterns, { days: 14 });
  assert.match(markup, /Cơm trắng \(chín\): trung bình 54% lượng kế hoạch \(3 lần\)/);
  assert.match(markup, /Hay ăn thêm: Chuối \(2 lần\)/);
  assert.equal(patternsMarkup({ meals: [], foods: [], extras: [] }), '');
});

check('the coach sees the day added up and only the foods that differed', () => {
  const row = {
    completedMealIds: [breakfast.id, dinner.id],
    mealLogs: [{
      mealId: lunch.id, mealName: 'Bữa trưa', plannedTotals: plannedTotals(lunch),
      items: plannedEntries(lunch).map((item) => (item.name === 'Cơm trắng (chín)' ? { ...item, grams: 100 }
        : item.name.startsWith('Ức gà') ? { ...item, grams: 200, cooked: true }
          : item.name === 'Súp lơ xanh' ? { ...item, grams: 0 } : item)),
    }],
  };
  const html = historyIntakeMarkup(row, meals);
  assert.match(html, /Cả ngày: Calo [\d.]+\/[\d.]+ kcal/);
  assert.match(html, /\(3\/3 bữa\)/);
  assert.match(html, /Cơm trắng \(chín\) 100 g \(kế hoạch 190 g\)/);
  assert.match(html, /Ức gà bỏ da \(sống\) 200 g chín ≈ 267 g sống \(kế hoạch 150 g\)/);
  assert.match(html, /bỏ Súp lơ xanh/);
  assert.doesNotMatch(html, /Dầu ăn/, 'unchanged foods are not listed');
  assert.doesNotMatch(historyIntakeMarkup(row, null), /Cả ngày/, 'without the plan of that day, no day total');
});

check('the client sees what is left during the day and how it landed at the end', () => {
  const open = intakeSummaryMarkup(dayIntake({ meals, completedMealIds: [breakfast.id] }));
  assert.match(open, /Đến lúc này/);
  assert.match(open, /Còn lại/);
  assert.match(open, /Bữa chưa đánh dấu hay ghi thì chưa được cộng/);
  const done = intakeSummaryMarkup(dayIntake({ meals, completedMealIds: meals.map((meal) => meal.id) }), { autoFilledKcal: 1500 });
  assert.match(done, /Hôm nay so với kế hoạch/);
  assert.match(done, /<td>Đạt<\/td>/);
  assert.match(done, /Đã điền sẵn 1\.500 kcal vào ô “Calo đã ăn”/);
  const log = normalizeMealLog({ mealId: lunch.id, mealName: lunch.name, items: plannedEntries(lunch), plannedTotals: plannedTotals(lunch) });
  assert.match(mealLogBadgeText(log), /^Đã ghi lượng thực tế: [\d.]+ kcal · Đạm [\d,]+ g \(kế hoạch/);
});

check('the client can add any food in the table, and the quick amounts are half, all and one and a half', () => {
  assert.equal(LOGGABLE_FOODS.flatMap((group) => group.names).length, FOODS.length);
  assert.deepEqual([...QUICK_PORTIONS], [0.5, 1, 1.5]);
});

// ---------- wiring ----------

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

check('the client page offers the editor on today\'s meals only, and keeps a logged meal ticked', () => {
  assert.match(page, /<link rel="stylesheet" href="nutrition-intake\.css">/);
  assert.match(page, /if \(tickable\) card\.appendChild\(mealLogArea\(meal\)\);/);
  assert.match(page, /todayMealLogs = normalizeMealLogs\(checkin\?\.mealLogs\);\n {2}\/\/ [^\n]*\n {2}todayMealLogs\.forEach\(\(log\) => completedToday\.add\(log\.mealId\)\);/);
  assert.match(page, /<div id="intake-summary"><\/div>/);
  assert.match(page, /historyIntakeMarkup\(row, meals\)/);
  assert.match(page, /row\.planVersionId === plan\.versionId \? mealsForDate\(plan, row\.date\) : null/);
});

check('meal logs are saved clean, on the day\'s own record, scoped to the plan', () => {
  assert.match(data, /export async function saveNutritionMealLogs\(studentUid, date, mealLogs = \[\], \{ planVersionId = '' \} = \{\}\) \{\n {2}await writeScopedNutritionCheckin\(doc\(db, 'students', studentUid, 'nutritionCheckins', date\), planVersionId, \{\n {4}date,\n {4}mealLogs: normalizeMealLogs\(mealLogs\),/);
});

console.log(`NUTRITION_INTAKE_OK ${passed} passed`);
