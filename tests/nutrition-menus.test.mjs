// David's meal rules (2026-10-16): breakfast quick and light, lunch with a home and an
// ordered-out version, dinner cooked at home from lean, easy proteins.
//   node tests/nutrition-menus.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISHES, DISHES_BY_MEAL_TYPE, MEAL_MENUS, SELECTABLE_DISHES } from '../nutrition-dishes.js';
import {
  ALTERNATIVE_LABEL, MEAL_ACCURACY_LIMITS, buildGramMealPlan, gramMealToPlanMeal, mealSizeAdvice, mealSplit, suggestMealTimes,
} from '../nutrition-meal-builder.js';
import { buildWeekMenu } from '../nutrition-week-builder.js';
import { parseGramItems } from '../nutrition-item-parser.js';
import { ORDER_OUT_NOTE, shoppingList, shoppingListText } from '../nutrition-shopping.js';
import { validateNutritionPlanForPublish } from '../nutrition-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const CLIENTS = {
  cut: { weightKg: 70, mealCount: 4, goalType: 'fat_loss', targets: { kcal: 2000, protein: 140, carbs: 215, fat: 55 } },
  small: { weightKg: 55, mealCount: 3, goalType: 'fat_loss', targets: { kcal: 1500, protein: 110, carbs: 150, fat: 45 } },
  bulk: { weightKg: 80, mealCount: 5, goalType: 'gain', targets: { kcal: 2800, protein: 170, carbs: 330, fat: 80 } },
};
const day = (client, seed, extra = {}) => buildGramMealPlan({ ...CLIENTS[client], composition: 'dish', random: rng(seed), attemptsPerMealCount: 200, ...extra });
const ids = (menu) => DISHES_BY_MEAL_TYPE[menu].map((dish) => dish.id);
const sum = (items) => items.reduce((total, item) => ({
  kcal: total.kcal + item.kcal, protein: total.protein + item.protein, carbs: total.carbs + item.carbs, fat: total.fat + item.fat,
}), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
const NOODLES = new Set(['Bún tươi', 'Bánh phở tươi', 'Bánh phở khô', 'Miến dong (khô)']);

// ---------- the library ----------

check('every dish serves a known meal, and the picker groups them the same way', () => {
  assert.deepEqual(MEAL_MENUS, ['sang', 'trua', 'ngoai', 'toi', 'phu']);
  assert.deepEqual(DISHES.filter((dish) => !dish.mealTypes.length || dish.mealTypes.some((menu) => !MEAL_MENUS.includes(menu))).map((dish) => dish.id), []);
  assert.deepEqual(SELECTABLE_DISHES.map((section) => section.mealType), MEAL_MENUS);
});

check('breakfast is bought on the way or ready in minutes, and never sticky rice', () => {
  const QUICK_AT_HOME = new Set(['Bánh mì trắng', 'Bánh mì nguyên cám', 'Yến mạch (khô)', 'Khoai lang (luộc)', 'Chuối']);
  for (const dish of DISHES_BY_MEAL_TYPE.sang) {
    assert.ok(!dish.carbOptions.some((option) => option.name === 'Gạo nếp (xôi chín)'), dish.id);
    if (dish.kind === 'buy') continue;
    assert.ok(dish.carbOptions.every((option) => QUICK_AT_HOME.has(option.name)), `${dish.id}: rice or noodles to cook in the morning`);
  }
  assert.ok(DISHES_BY_MEAL_TYPE.sang.length >= 8, 'enough breakfasts for a varied week');
});

check('dinner is cooked at home from fish, shrimp, chicken, eggs or tofu, and is never noodles', () => {
  const LEAN = /^(Ức gà|Đùi gà|Cá |Tôm|Trứng gà|Lòng trắng trứng|Đậu phụ)/;
  for (const dish of DISHES_BY_MEAL_TYPE.toi) {
    assert.equal(dish.kind, 'cook', dish.id);
    assert.ok(dish.proteinOptions.every((option) => LEAN.test(option.name)), `${dish.id}: ${dish.proteinOptions.map((o) => o.name)}`);
    assert.ok(!dish.carbOptions.some((option) => NOODLES.has(option.name)), dish.id);
  }
  assert.ok(DISHES_BY_MEAL_TYPE.toi.length >= 10);
});

check('a home lunch is cooked and a lunch out is a shop dish, never the same dish', () => {
  assert.ok(DISHES_BY_MEAL_TYPE.trua.every((dish) => dish.kind === 'cook'));
  assert.ok(DISHES_BY_MEAL_TYPE.ngoai.every((dish) => dish.kind === 'buy'));
  assert.deepEqual(ids('trua').filter((id) => ids('ngoai').includes(id)), []);
  assert.ok(DISHES_BY_MEAL_TYPE.ngoai.length >= 7, 'a different shop lunch every day of a "varied" week');
});

check('lunch draws its home and its ordered-out dish from their own menus; dinner from the dinner menu', () => {
  for (const count of [3, 4, 5, 6]) {
    const split = mealSplit(count);
    const lunch = split.find((slot) => slot.name === 'Bữa trưa');
    const dinner = split.find((slot) => slot.name === 'Bữa tối');
    assert.deepEqual([lunch.menu, lunch.alternativeMenu, lunch.type], ['trua', 'ngoai', 'chinh'], `${count} meals`);
    assert.deepEqual([dinner.menu, dinner.type], ['toi', 'chinh']);
    assert.ok(split.every((slot) => slot.menu === slot.type || slot.type === 'chinh'), 'ingredient mode keeps its pools');
  }
  assert.deepEqual(mealSplit(2).map((slot) => slot.menu), ['sang', 'toi']);
});

// ---------- a generated day ----------

check('every lunch comes with an ordered-out version that keeps the day on target', () => {
  for (const client of Object.keys(CLIENTS)) {
    for (const seed of [1, 2, 3]) {
      const result = day(client, seed);
      assert.equal(result.ok, true, `${client} ${seed}`);
      const lunch = result.meals.find((meal) => meal.menu === 'trua');
      const alternative = lunch.alternative;
      assert.ok(alternative, `${client} ${seed}: no ordered-out lunch`);
      assert.ok(ids('ngoai').includes(alternative.dish.id));
      assert.ok(!result.meals.some((meal) => meal.dish.id === alternative.dish.id), 'not a dish the day already serves');
      const home = sum(lunch.items);
      const out = sum(alternative.items);
      const swapped = { kcal: result.totals.kcal - home.kcal + out.kcal, protein: result.totals.protein - home.protein + out.protein, carbs: result.totals.carbs - home.carbs + out.carbs, fat: result.totals.fat - home.fat + out.fat };
      const { targets } = CLIENTS[client];
      assert.ok(Math.abs(swapped.kcal - targets.kcal) / targets.kcal <= MEAL_ACCURACY_LIMITS.kcalRatio + 1e-9, `${client} ${seed}: kcal ${swapped.kcal}`);
      assert.ok(Math.abs(swapped.protein - targets.protein) / targets.protein <= MEAL_ACCURACY_LIMITS.proteinRatio + 1e-9, `${client} ${seed}: protein`);
      assert.equal(alternative.meetsTargets, true);
      assert.ok(ids('toi').includes(result.meals.at(-1).dish.id), 'dinner from the dinner menu');
      assert.ok(ids('trua').includes(lunch.dish.id), 'the home lunch from the home menu');
    }
  }
});

check('no noodles, bread or fruit twice in one day, while rice at lunch and dinner is fine', () => {
  for (const client of Object.keys(CLIENTS)) {
    for (const seed of [4, 5, 6, 7]) {
      const result = day(client, seed);
      const carbs = result.meals.flatMap((meal) => meal.items.filter((item) => item.group === 'CARB' && !/^Cơm/.test(item.name)).map((item) => item.name));
      assert.equal(new Set(carbs).size, carbs.length, `${client} ${seed}: ${carbs}`);
    }
  }
});

check('the client\'s avoided dishes are never the ordered-out lunch; avoiding them all just drops it', () => {
  const allButOne = ids('ngoai').filter((id) => id !== 'ngoai-com-ga-xe');
  const one = day('cut', 8, { avoidedDishes: allButOne });
  assert.equal(one.ok, true);
  assert.equal(one.meals.find((meal) => meal.menu === 'trua').alternative.dish.id, 'ngoai-com-ga-xe');
  const none = day('cut', 8, { avoidedDishes: ids('ngoai') });
  assert.equal(none.ok, true, 'the day is still built');
  assert.equal(none.meals.find((meal) => meal.menu === 'trua').alternative, undefined);
  assert.deepEqual(none.blockedDishSlots, []);
});

check('a dish that has left the library is ignored quietly in an older profile', () => {
  const result = day('cut', 9, { preferredDishes: ['sang-xoi-trung'], avoidedDishes: ['sang-xoi-trung'] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.ignoredDishes, []);
  assert.deepEqual(result.fallbackDishes, []);
});

check('the ordered-out lunch is saved as lines under its own label, and the lines give back its grams', () => {
  const lunch = day('cut', 1).meals.find((meal) => meal.menu === 'trua');
  const saved = gramMealToPlanMeal(lunch, 1, null, 'male').alternative;
  assert.equal(saved.label, ALTERNATIVE_LABEL);
  assert.equal(saved.items[0], lunch.alternative.dish.name, 'no "(mua sẵn được)": the whole option is bought');
  assert.match(saved.items.at(-1), /^Gọi món: /);
  assert.deepEqual(parseGramItems(saved.items).map((item) => item.grams), lunch.alternative.items.map((item) => item.grams));
  assert.equal(saved.kcal, Math.round(sum(lunch.alternative.items).kcal));
});

// ---------- the week ----------

check('a week never adds a meal the client did not ask for, two meals a day included', () => {
  const twoMeals = { weightKg: 58, mealCount: 2, goalType: 'maintain', targets: { kcal: 1700, protein: 120, carbs: 180, fat: 50 } };
  for (const seed of [1, 2, 3, 4]) {
    const built = buildWeekMenu({ ...twoMeals, composition: 'dish', variety: 'balanced', random: rng(seed) });
    assert.deepEqual(built.days.map((item) => item.result.meals.length), [2, 2, 2, 2, 2, 2, 2], `seed ${seed}`);
    assert.equal(built.ok, true);
  }
});

check('the ordered-out lunches vary across a "balanced" week: none more than twice', () => {
  for (const seed of [1, 2, 3]) {
    const built = buildWeekMenu({ ...CLIENTS.cut, composition: 'dish', variety: 'balanced', random: rng(seed) });
    const counts = new Map();
    built.days.forEach((item) => {
      const id = item.result.meals.find((meal) => meal.alternative)?.alternative.dish.id;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    assert.ok(!counts.has(undefined), `seed ${seed}: a day without one`);
    assert.ok(Math.max(...counts.values()) <= 2, `seed ${seed}: ${JSON.stringify([...counts])}`);
  }
});

// ---------- shopping and sending ----------

const lunchWithOrderOut = {
  id: 'meal-2', name: 'Bữa trưa', kcal: 500, protein: 40, carbs: 50, fat: 15,
  items: ['Cơm + gà áp chảo', 'Ức gà bỏ da (sống) — 150 g', 'Cơm trắng (chín) — 200 g', 'Cách làm: áp chảo.'],
  alternative: { label: 'Đặt ngoài', kcal: 500, protein: 40, carbs: 50, fat: 15, items: ['Cơm bò lúc lắc + salad', 'Thịt bò thăn — 180 g', 'Cơm trắng (chín) — 200 g', 'Gọi món: ít dầu.'] },
};

check('the shopping list buys for the home lunch only, and says so', () => {
  const list = shoppingList([{ meals: [lunchWithOrderOut] }], { dayIndexes: [0] });
  const names = list.groups.flatMap((group) => group.items.map((item) => item.label));
  assert.ok(names.some((name) => /Ức gà/.test(name)), names.join(', '));
  assert.ok(!names.some((name) => /bò/i.test(name)), 'the shop lunch is not bought');
  assert.equal(list.lunchesWithOrderOut, 1);
  assert.ok(shoppingListText(list).includes(ORDER_OUT_NOTE));
  const plain = shoppingList([{ meals: [{ ...lunchWithOrderOut, alternative: undefined }] }], { dayIndexes: [0] });
  assert.equal(plain.lunchesWithOrderOut, 0);
  assert.ok(!shoppingListText(plain).includes(ORDER_OUT_NOTE));
});

check('an ordered-out lunch far from the home one is a warning before sending, not a block', () => {
  const plan = { kcal: 500, protein: 40, carbs: 50, fat: 15, meals: [lunchWithOrderOut] };
  const fine = validateNutritionPlanForPublish(plan);
  assert.deepEqual(fine.warnings.filter((message) => message.includes('đặt ngoài')), []);
  const drifting = validateNutritionPlanForPublish({ ...plan, meals: [{ ...lunchWithOrderOut, alternative: { ...lunchWithOrderOut.alternative, kcal: 700 } }] });
  assert.equal(drifting.valid, fine.valid);
  assert.ok(drifting.warnings.some((message) => message.startsWith('Bữa trưa: cách đặt ngoài')), drifting.warnings.join(' | '));
});

// ---------- portions and times (2026-10-18) ----------

const OIL = 'Dầu ăn (oliu, đậu nành)';
const RAW_MEAT = (name) => !/Sữa|Whey|Đậu phụ|Trứng|Lòng trắng|Edamame/.test(name);

check('a home lunch or dinner uses at most 10 g of oil and 250 g of raw meat or fish; shop lunches keep theirs', () => {
  for (const dish of [...DISHES_BY_MEAL_TYPE.trua, ...DISHES_BY_MEAL_TYPE.toi]) {
    for (const option of dish.fatOptions.filter((item) => item.name === OIL)) assert.ok(option.max <= 10, `${dish.id}: ${option.max} g oil`);
  }
  for (const dish of DISHES) {
    for (const option of dish.proteinOptions.filter((item) => RAW_MEAT(item.name))) assert.ok(option.max <= 250, `${dish.id}: ${option.name} ${option.max} g`);
  }
  assert.ok(DISHES_BY_MEAL_TYPE.ngoai.some((dish) => dish.fatOptions.some((item) => item.name === OIL && item.max > 10)), 'a shop still cooks with a shop\'s oil');
});

check('three-meal days still add up with the lower oil, and no home meal goes over it', () => {
  for (const client of ['small', 'cut', 'bulk']) {
    for (const seed of [11, 12]) {
      const result = day(client, seed, { mealCount: 3 });
      assert.equal(result.ok, true, `${client} ${seed}`);
      assert.equal(result.meals.length, 3);
      for (const meal of result.meals.filter((item) => item.menu === 'trua' || item.menu === 'toi')) {
        const oil = meal.items.find((item) => item.name === OIL);
        assert.ok(!oil || oil.grams <= 10, `${client} ${seed} ${meal.name}: ${oil?.grams} g oil`);
      }
    }
  }
});

check('three meals: breakfast 30 minutes after waking, lunch from 12:00, dinner from 18:30, four hours apart', () => {
  const times = (wakeTime) => suggestMealTimes({ wakeTime, mealCount: 3 });
  assert.deepEqual(times('05:30'), ['06:00', '12:00', '18:30']);
  assert.deepEqual(times('06:30'), ['07:00', '12:00', '18:30'], 'not dinner at 17:00 any more');
  assert.deepEqual(times('08:30'), ['09:00', '13:00', '18:30']);
  assert.deepEqual(times('11:30'), ['12:00', '16:00', '20:00'], 'a late riser eats later');
});

check('four and five meals keep the same lunch and dinner, with the snacks halfway between', () => {
  const times = (wakeTime, mealCount) => suggestMealTimes({ wakeTime, mealCount });
  assert.deepEqual(times('06:30', 4), ['07:00', '12:00', '15:15', '18:30'], 'not lunch at 10:45 any more');
  assert.deepEqual(times('06:30', 5), ['07:00', '09:30', '12:00', '15:15', '18:30']);
  assert.deepEqual(times('08:30', 4), ['09:00', '13:00', '15:45', '18:30']);
  assert.deepEqual(times('11:30', 5), ['12:00', '14:00', '16:00', '18:00', '20:00'], 'a late riser eats later');
  for (const count of [3, 4, 5]) {
    const split = mealSplit(count);
    const clock = times('06:30', count);
    assert.equal(clock[split.findIndex((slot) => slot.menu === 'trua')], '12:00', `${count} meals: lunch`);
    assert.equal(clock[split.findIndex((slot) => slot.menu === 'toi')], '18:30', `${count} meals: dinner`);
  }
});

check('a day too big for its meals is flagged on its largest meal, with the fewest meals that fix it', () => {
  assert.equal(mealSizeAdvice({ kcal: 2200, mealCount: 3 }), null);
  assert.equal(mealSizeAdvice({ kcal: 2400, mealCount: 4 }), null);
  const lunchHeavy = mealSizeAdvice({ kcal: 2400, mealCount: 3 });
  assert.deepEqual([lunchHeavy.largest, lunchHeavy.suggested], [840, 4], 'lunch and dinner are 35% of the day, not a third');
  assert.equal(mealSizeAdvice({ kcal: 2900, mealCount: 3 }).suggested, 5);
  const atMost = mealSizeAdvice({ kcal: 2900, mealCount: 5 });
  assert.equal(atMost.suggested, null, 'the builder offers no more than five');
  assert.match(atMost.message, /Cân nhắc thêm bữa phụ/);
  const builder = readFileSync(new URL('../nutrition-builder.html', import.meta.url), 'utf8');
  assert.match(builder, /<div id="meal-size-advice"/);
  assert.match(builder, /\$\('meal-count'\)\.addEventListener\('change', renderMealSizeAdvice\);/);
  assert.match(builder, /function validateTargetsUI\(\) \{\s+renderMealSizeAdvice\(\);/);
});

// ---------- the pages ----------

check('the client page shows both ways under one tick, and the builder lets the coach edit the second', () => {
  const client = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
  assert.match(client, /mealOption\('Cách 1 · Tự chuẩn bị mang theo', '', meal\.items \|\| \[\]\)/);
  assert.match(client, /mealOption\(`Cách 2 · \$\{alternative\.label \|\| 'Đặt ngoài'\}`/);
  assert.match(client, /\(Cách làm\|Gọi món\)/);
  const builder = readFileSync(new URL('../nutrition-builder.html', import.meta.url), 'utf8');
  assert.match(builder, /class="meal-alt-items"/);
  assert.match(builder, /\.\.\.\(alternative \? \{ alternative \} : \{\}\)/);
  assert.match(builder, /const DISH_SLOTS_TO_COVER = \['sang', 'trua', 'toi', 'phu'\];/);
});

console.log(`NUTRITION_MENUS_OK ${passed} passed`);
