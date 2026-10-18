// Run with:  node tests/nutrition-week.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_WEEK_VARIETY, WEEK_DAYS, WEEK_VARIETY, hasWeekMenu, mealHeadline, mealTotals, mealsForDate,
  planWeekDays, weekStats, weekVariety, weekdayIndexOf,
} from '../nutrition-week-utils.js';
import { buildWeekMenu, gramPlanMeta, planDayFromResult, rebuildWeekDay } from '../nutrition-week-builder.js';
import { validateNutritionPlanForPublish } from '../nutrition-engine.js';
import { DISHES } from '../nutrition-dishes.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

/** A seeded generator, so a week can be built the same way twice. */
function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const CLIENTS = {
  cut: { weightKg: 70, mealCount: 4, goalType: 'fat_loss', targets: { kcal: 2000, protein: 140, carbs: 215, fat: 55 } },
  // The client the single-day generator repeated worst for: six dishes in a whole week.
  small: { weightKg: 55, mealCount: 3, goalType: 'fat_loss', targets: { kcal: 1500, protein: 105, carbs: 160, fat: 45 } },
  bulk: { weightKg: 80, mealCount: 5, goalType: 'gain', targets: { kcal: 3000, protein: 160, carbs: 400, fat: 80 } },
};
// A week for the same client, level and seed is always the same week, so it is built once.
const builtWeeks = new Map();
function week(client, variety, seed = 1, extra = null) {
  const build = () => buildWeekMenu({ ...CLIENTS[client], composition: 'dish', variety, random: rng(seed), ...(extra || {}) });
  if (extra) return build();
  const key = `${client}|${variety}|${seed}`;
  if (!builtWeeks.has(key)) builtWeeks.set(key, build());
  return builtWeeks.get(key);
}
const dishLists = (built) => built.days.map((day) => day.result.meals.map((meal) => meal.dish.id));
function shape(built) {
  const lists = dishLists(built);
  const counts = new Map();
  lists.flat().forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
  let adjacent = 0;
  lists.forEach((list, index) => { adjacent += list.filter((id) => lists[(index + 1) % lists.length].includes(id)).length; });
  return {
    meals: lists.flat().length, distinct: counts.size, most: Math.max(...counts.values()), adjacent,
    sameDay: lists.reduce((sum, list) => sum + (list.length - new Set(list).size), 0),
  };
}

// ---------- the calendar ----------

check('a date maps to its weekday, Monday first, whatever time zone the device is in', () => {
  assert.equal(weekdayIndexOf('2026-10-12'), 0, 'a Monday');
  assert.equal(weekdayIndexOf('2026-10-14'), 2, 'a Wednesday');
  assert.equal(weekdayIndexOf('2026-10-18'), 6, 'a Sunday');
  assert.equal(weekdayIndexOf('2027-01-01'), 4, 'a Friday, across a year end');
  assert.equal(weekdayIndexOf('nonsense'), 0);
  assert.deepEqual(WEEK_DAYS.map((day) => day.short), ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
});

const meal = (name, items, macros = {}) => ({ id: 'meal-1', name, items, kcal: 500, protein: 35, carbs: 50, fat: 15, ...macros });
const weekPlan = () => ({
  meals: [meal('Bữa sáng', ['Thứ Hai cũ'])],
  week: { variety: 'balanced', days: WEEK_DAYS.map((day) => ({ id: day.id, meals: [meal('Bữa sáng', [`Món ${day.label}`])] })) },
});

check('a plan with a week serves each date its own weekday', () => {
  const plan = weekPlan();
  assert.equal(hasWeekMenu(plan), true);
  assert.equal(mealsForDate(plan, '2026-10-12')[0].items[0], 'Món Thứ Hai');
  assert.equal(mealsForDate(plan, '2026-10-17')[0].items[0], 'Món Thứ Bảy');
  assert.equal(mealsForDate(plan, '2026-10-18')[0].items[0], 'Món Chủ nhật');
  assert.equal(mealsForDate(plan, '2026-10-19')[0].items[0], 'Món Thứ Hai', 'the week repeats');
});

check('a plan saved before weeks existed still serves its single day, every day', () => {
  const plan = { meals: [meal('Bữa sáng', ['Cháo gà'])] };
  assert.equal(hasWeekMenu(plan), false);
  assert.equal(planWeekDays(plan), null);
  for (const date of ['2026-10-12', '2026-10-15', '2026-10-18']) assert.equal(mealsForDate(plan, date)[0].items[0], 'Cháo gà');
  assert.deepEqual(mealsForDate(null, '2026-10-12'), []);
});

check('a week with an empty day is not a week: the client gets the single day rather than a blank screen', () => {
  const plan = weekPlan();
  plan.week.days[3].meals = [];
  assert.equal(hasWeekMenu(plan), false);
  assert.equal(mealsForDate(plan, '2026-10-15')[0].items[0], 'Thứ Hai cũ');
});

check('days stored in any order are read back Monday first', () => {
  const plan = weekPlan();
  plan.week.days.reverse();
  assert.deepEqual(planWeekDays(plan).map((day) => day.id), WEEK_DAYS.map((day) => day.id));
  assert.equal(planWeekDays(plan)[0].meals[0].items[0], 'Món Thứ Hai');
});

check('a meal is known by its dish line, or by its first food with the grams cut off', () => {
  assert.equal(mealHeadline({ items: ['Phở bò tái (mua sẵn được)', 'Thịt bò thăn — 120 g'] }), 'Phở bò tái');
  assert.equal(mealHeadline({ items: ['Ức gà bỏ da (sống) — 150 g (≈ 1 phần đạm)'] }), 'Ức gà bỏ da (sống)');
  assert.equal(mealHeadline({ name: 'Bữa phụ', items: [] }), 'Bữa phụ');
});

check('the variety of a week is counted on the names the client reads', () => {
  const days = [
    { meals: [meal('a', ['Cháo gà']), meal('b', ['Cơm cá'])] },
    { meals: [meal('a', ['Cháo gà']), meal('b', ['Bún bò'])] },
  ];
  assert.deepEqual(weekStats(days), { meals: 4, distinct: 3, repeats: 1, mostRepeated: 2 });
  assert.deepEqual(weekStats([]), { meals: 0, distinct: 0, repeats: 0, mostRepeated: 0 });
  assert.deepEqual(mealTotals(days[0].meals), { kcal: 1000, protein: 70, carbs: 100, fat: 30 });
});

check('an unknown variety setting falls back to the balanced one', () => {
  assert.equal(DEFAULT_WEEK_VARIETY, 'balanced');
  assert.equal(weekVariety('nonsense').id, 'balanced');
  assert.equal(weekVariety(undefined).id, 'balanced');
  assert.deepEqual(Object.keys(WEEK_VARIETY), ['easy', 'balanced', 'varied']);
});

// ---------- building the week ----------

check('every day of a week hits the macro targets on its own, for all three levels and three kinds of client', () => {
  for (const client of Object.keys(CLIENTS)) {
    for (const variety of ['easy', 'balanced', 'varied']) {
      const built = week(client, variety);
      assert.equal(built.days.length, 7);
      assert.deepEqual(built.days.map((day) => day.id), WEEK_DAYS.map((day) => day.id));
      built.days.forEach((day) => assert.equal(day.result.ok, true, `${client} ${variety} ${day.label}: ${day.result.reason}`));
      assert.equal(built.ok, true);
    }
  }
});

check('no day serves the same dish at two of its meals', () => {
  for (const client of Object.keys(CLIENTS)) {
    for (const variety of ['easy', 'balanced', 'varied']) {
      for (const seed of [1, 2, 3]) assert.equal(shape(week(client, variety, seed)).sameDay, 0, `${client} ${variety} seed ${seed}`);
    }
  }
});

check('"varied" does not repeat a dish while the library can still offer a new one', () => {
  for (const client of ['cut', 'small']) {
    for (const seed of [1, 2, 3]) {
      const s = shape(week(client, 'varied', seed));
      assert.equal(s.distinct, s.meals, `${client} seed ${seed}`);
    }
  }
  // Five meals a day need 14 snacks a week and the library has 13. Since dinners hold to lean
  // fish, shrimp, chicken, eggs and tofu (2026-10-16), a 3000 kcal client can also run out of
  // new dinners that carry their share by the last day or two: a few repeats, never three.
  // With home meals held to 10 g of oil (2026-10-18) the fat has to come from fewer dishes,
  // so the last day repeats up to five of them — measured over five seeds, all on Sunday.
  const bulk = shape(week('bulk', 'varied'));
  assert.ok(bulk.most <= 2 && bulk.distinct >= bulk.meals - 5, JSON.stringify(bulk));
});

check('"balanced" serves a dish at most twice and never on two days running, Sunday into Monday included', () => {
  for (const client of Object.keys(CLIENTS)) {
    for (const seed of [1, 2, 3]) {
      const s = shape(week(client, 'balanced', seed));
      assert.ok(s.most <= 2, `${client} seed ${seed}: a dish ${s.most} times`);
      assert.equal(s.adjacent, 0, `${client} seed ${seed}`);
    }
  }
});

check('"easy" repeats on purpose: fewer dishes to shop for than "balanced", which has fewer than "varied"', () => {
  for (const client of Object.keys(CLIENTS)) {
    const easy = shape(week(client, 'easy'));
    const balanced = shape(week(client, 'balanced'));
    const varied = shape(week(client, 'varied'));
    assert.ok(easy.most <= 3, `${client}: easy serves a dish ${easy.most} times`);
    assert.ok(easy.distinct < balanced.distinct, `${client}: easy ${easy.distinct} vs balanced ${balanced.distinct}`);
    assert.ok(balanced.distinct < varied.distinct, `${client}: balanced ${balanced.distinct} vs varied ${varied.distinct}`);
  }
});

check('the week fixes what seven independent days got wrong: the 1500 kcal client no longer eats one breakfast all week', () => {
  const breakfasts = new Set(dishLists(week('small', 'balanced')).map((list) => list[0]));
  assert.ok(breakfasts.size >= 3, `${breakfasts.size} different breakfasts`);
});

check('a dish or a food the client avoids is never served on any day, at any level', () => {
  const avoidedDishes = DISHES.filter((dish) => /cháo gà|phở bò|bún bò/i.test(dish.name)).map((dish) => dish.id);
  assert.ok(avoidedDishes.length >= 3);
  // The ordered-out lunch counts: an avoided food must not reach the client that way either.
  const foodsOf = (built) => built.days.flatMap((day) => day.result.meals.flatMap((item) => [
    ...item.items, ...(item.alternative?.items || []),
  ].map((food) => food.name)));
  const shopDishes = (built) => built.days.flatMap((day) => day.result.meals.map((item) => item.alternative?.dish.id).filter(Boolean));
  // Beef is on the menu when nothing is avoided, so its absence below is the avoid list at work.
  const beef = 'Thịt bò thăn';
  for (const variety of ['easy', 'balanced', 'varied']) {
    assert.ok(foodsOf(week('cut', variety, 4)).includes(beef), `${variety}: the control week has no beef to avoid`);
    const built = week('cut', variety, 4, { avoidedDishes, avoidedFoods: [beef] });
    built.days.forEach((day) => assert.equal(day.result.ok, true, `${variety} ${day.label}`));
    assert.deepEqual(dishLists(built).flat().filter((id) => avoidedDishes.includes(id)), [], variety);
    assert.deepEqual(shopDishes(built).filter((id) => avoidedDishes.includes(id)), [], `${variety}: shop lunch`);
    assert.equal(foodsOf(built).includes(beef), false, variety);
  }
});

check('the same seed builds the same week, and a different seed a different one', () => {
  // Built twice on purpose ({} skips the cache above): the claim is about the builder.
  assert.deepEqual(dishLists(week('cut', 'balanced', 9, {})), dishLists(week('cut', 'balanced', 9, {})));
  assert.notDeepEqual(dishLists(week('cut', 'balanced', 9, {})), dishLists(week('cut', 'balanced', 10, {})));
});

check('the ingredient mode also builds seven days, each a different day', () => {
  const built = buildWeekMenu({ ...CLIENTS.cut, composition: 'food', variety: 'balanced', random: rng(2) });
  assert.equal(built.days.length, 7);
  built.days.forEach((day) => assert.ok(day.result.meals.length > 0, day.label));
  assert.equal(new Set(built.days.map((day) => day.result.signature)).size, 7);
});

// ---------- one day again ----------

const asWeekInput = (built) => built.days.map((day) => ({ dishIds: day.result.meals.map((m) => m.dish.id), signature: day.result.signature }));

check('changing one day gives it other dishes and still fits the rest of the week', () => {
  for (const variety of ['balanced', 'varied']) {
    const built = week('cut', variety, 6);
    const lists = dishLists(built);
    for (const dayIndex of [0, 3, 6]) {
      const solved = rebuildWeekDay({ ...CLIENTS.cut, composition: 'dish', variety, random: rng(77), dayIndex, week: asWeekInput(built) });
      assert.equal(solved.result.ok, true);
      const fresh = solved.result.meals.map((m) => m.dish.id);
      assert.deepEqual(fresh.filter((id) => lists[dayIndex].includes(id)), [], `${variety} day ${dayIndex}: kept one of its own dishes`);
      const neighbours = [...lists[(dayIndex + 6) % 7], ...lists[(dayIndex + 1) % 7]];
      assert.deepEqual(fresh.filter((id) => neighbours.includes(id)), [], `${variety} day ${dayIndex}: repeats a neighbour`);
      assert.equal(fresh.length, new Set(fresh).size);
    }
  }
});

check('changing one day never serves what the client avoids', () => {
  const built = week('cut', 'balanced', 6);
  const avoidedDishes = DISHES.filter((dish) => dish.mealTypes.includes('sang')).slice(0, 8).map((dish) => dish.id);
  const solved = rebuildWeekDay({ ...CLIENTS.cut, composition: 'dish', variety: 'balanced', random: rng(3), dayIndex: 2, week: asWeekInput(built), avoidedDishes });
  assert.deepEqual(solved.result.meals.map((m) => m.dish.id).filter((id) => avoidedDishes.includes(id)), []);
});

// ---------- into the saved plan ----------

check('a generated day becomes a plan day: meals in the saved shape, times from the wake time, and what it was built from', () => {
  const built = week('cut', 'balanced');
  const day = planDayFromResult(built.days[2].result, { dayId: 'wed', sex: 'male', wakeTime: '06:30' });
  assert.equal(day.id, 'wed');
  assert.equal(day.meals.length, built.days[2].result.meals.length);
  assert.deepEqual(day.meals.map((m) => m.id), day.meals.map((_, index) => `meal-${index + 1}`));
  assert.equal(day.meals[0].time, '07:00');
  assert.equal(day.meals[0].items[0], built.days[2].result.meals[0].dish.name.replace(/$/, built.days[2].result.meals[0].dish.kind === 'buy' ? ' (mua sẵn được)' : ''));
  assert.match(day.meals[0].items.at(-1), /^Cách làm:/);
  assert.equal(day.gramPlan.meetsTargets, true);
  // One id per meal, plus the ordered-out version of the lunch.
  assert.equal(day.gramPlan.dishIds.length, day.meals.length + day.meals.filter((m) => m.alternative).length);
  assert.equal(day.gramPlan.signature, built.days[2].result.signature);
});

check('without a wake time a day keeps the times of the meals it replaces', () => {
  const built = week('cut', 'balanced');
  const day = planDayFromResult(built.days[0].result, { dayId: 'mon', presetMeals: [{ id: 'breakfast', time: '05:30' }] });
  assert.equal(day.meals[0].time, '05:30');
  assert.equal(day.meals[0].id, 'breakfast');
  assert.equal(gramPlanMeta(built.days[0].result, 'hand').style, 'hand');
});

function publishable(variety = 'balanced') {
  const built = week('cut', variety);
  const days = built.days.map((day) => planDayFromResult(day.result, { dayId: day.id, sex: 'male', wakeTime: '06:30' }));
  return { ...CLIENTS.cut.targets, meals: days[0].meals, gramPlan: days[0].gramPlan, week: { variety, days } };
}

check('a week can be sent only when all seven days pass, and a failing day is named', () => {
  assert.deepEqual(validateNutritionPlanForPublish(publishable()).errors, []);
  assert.equal(validateNutritionPlanForPublish(publishable()).valid, true);

  const offTarget = publishable();
  offTarget.week.days[5].meals[0].kcal += 900;
  const first = validateNutritionPlanForPublish(offTarget);
  assert.equal(first.valid, false);
  assert.ok(first.errors.every((message) => message.startsWith('Thứ Bảy: ')), first.errors.join(' | '));

  const emptyDay = publishable();
  emptyDay.week.days[1].meals = [];
  assert.match(validateNutritionPlanForPublish(emptyDay).errors.join(' '), /Thứ Ba: Kế hoạch cần ít nhất một bữa ăn/);

  const flagged = publishable();
  flagged.week.days[6].gramPlan = { ...flagged.week.days[6].gramPlan, meetsTargets: false };
  assert.match(validateNutritionPlanForPublish(flagged).errors.join(' '), /Chủ nhật: Meal Plan mới chưa đạt/);
});

check('a single-day plan is checked exactly as before', () => {
  const plan = publishable();
  delete plan.week;
  assert.equal(validateNutritionPlanForPublish(plan).valid, true);
  plan.meals = [];
  assert.match(validateNutritionPlanForPublish(plan).errors.join(' '), /^Kế hoạch cần ít nhất một bữa ăn/);
});

// ---------- the pages ----------

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const builder = read('nutrition-builder.html');
const client = read('nutrition.html');
const home = read('home.html');
const data = read('training-data.js');

check('the builder offers a week or a single day, and how much the week repeats', () => {
  assert.match(builder, /<select id="plan-span">\s*<option value="week" selected>/);
  assert.match(builder, /<option value="day">1 ngày lặp lại \(cách cũ\)<\/option>/);
  assert.match(builder, /<select id="week-variety"><\/select>/);
  assert.match(builder, /if \(\$\('plan-span'\)\.value === 'week'\) return applyWeekMenu\(plan, \{ announce \}\);/);
  assert.match(builder, /planSpan: \$\('plan-span'\)\.value === 'day' \? 'day' : 'week',/);
});

check('the builder banks the open day before it shows another, rebuilds or saves', () => {
  assert.match(builder, /stashEditor\(\);\s*activeDayIndex = Number\(tab\.dataset\.dayIndex\) \|\| 0;/);
  assert.match(builder, /function rebuildActiveDay\(\) \{\s*stashEditor\(\);/);
  assert.match(builder, /function collectPlan\(\) \{\s*stashEditor\(\);/);
  assert.match(builder, /if \(!week \|\| renderedDayIndex === null \|\| renderedDayIndex !== activeDayIndex\) return;/);
  assert.match(builder, /if \(!generatedPlan \|\| !editorShown\) return;/);
});

check('the saved plan carries the week and keeps Monday as its single day', () => {
  assert.match(builder, /week: week \? \{ variety: week\.variety, days: week\.days\.map\(\(day\) => \(\{ id: day\.id, meals: day\.meals, gramPlan: day\.gramPlan \}\)\) \} : null,/);
  assert.match(builder, /plan\.meals = week\.days\[0\]\.meals;\s*plan\.gramPlan = week\.days\[0\]\.gramPlan;/);
  assert.match(data, /const week = weekDays && weekDays\.every\(\(day\) => day\.meals\.length > 0\)/);
  assert.match(data, /planSpan: profile\.planSpan === 'day' \? 'day' : 'week',/);
});

check('the client page opens on today, lets the other days be looked at, and ticks only today', () => {
  assert.match(client, /let viewDayIndex = todayIndex;/);
  assert.match(client, /const tickable = role === 'student' && viewingToday\(\);/);
  assert.match(client, /id="week-strip"/);
  assert.match(client, /\$\('week-strip-wrap'\)\.style\.display = week \? 'block' : 'none';/);
});

check('today\'s ticks are kept in memory, so sending while another day is on screen cannot wipe them', () => {
  assert.match(client, /completedToday = new Set\(checkin\?\.completedMealIds \|\| \[\]\);/);
  assert.match(client, /const completedMealIds = todayMeals\.filter\(\(meal\) => completedToday\.has\(meal\.id\)\)\.map\(\(meal\) => meal\.id\);/);
  assert.match(client, /plannedMealCount: todayMeals\.length,/);
  assert.doesNotMatch(client, /querySelectorAll\('\.meal-check'\)/, 'progress and saving no longer read the tick boxes off the page');
});

check('the home card counts today\'s meals of the week', () => {
  assert.match(home, /const meals = mealsForDate\(plan, today\);/);
  assert.match(home, /import \{ mealsForDate \} from '\.\/nutrition-week-utils\.js';/);
});

console.log(`nutrition-week: ${passed} passed`);
