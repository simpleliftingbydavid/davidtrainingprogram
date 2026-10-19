// ============================================================
// DAVID TRAINING PROGRAM — What the client actually ate
// ============================================================
// Pure module: no DOM, no Firebase.
//
// David, 2026-10-19, from a client: people follow the meal plan but not always its amounts,
// and want to note "100 g cơm, 200 g thịt" and see at the end of the day how that compares
// with the plan. A client logs only what differed: each meal's lines come pre-filled with the
// plan's grams, so an unchanged line costs nothing.
//
// RAW OR COOKED. The plan weighs meat and fish raw ("Ức gà bỏ da (sống)", "Thịt bò thăn"),
// rice cooked and dry noodles and oats dry. A client weighs what is on the plate, so meat and
// fish can be logged cooked and are turned back into raw grams with an average yield: 200 g of
// cooked chicken breast is about 270 g raw, and read as raw it would under-count protein by a
// quarter. The yields are estimates (about ±10%), good enough to compare with the plan.
//
// Every amount is worked out from the food table, the same way for the plan's lines and for
// the client's, so the two sides of a comparison are always measured alike.

import { FOODS, FOOD_GROUPS, getFood } from './nutrition-foods.js';
import { parseGramItems } from './nutrition-item-parser.js';

/** Cooked weight from 1 g raw, for the foods the plan weighs raw. */
export const COOKED_YIELD = Object.freeze({
  'Ức gà bỏ da (sống)': 0.75,
  'Đùi gà bỏ da (sống)': 0.75,
  'Thịt heo thăn nạc': 0.72,
  'Thịt heo ba chỉ': 0.7,
  'Thịt bò thăn': 0.72,
  'Thịt bò bắp': 0.68,
  'Cá basa fillet': 0.8,
  'Cá hồi fillet': 0.8,
  'Cá thu': 0.8,
  'Cá ngừ tươi': 0.78,
  'Cá rô phi': 0.8,
  'Tôm bỏ vỏ': 0.8,
  'Mực tươi': 0.7,
});

/** The quick buttons for a client without a scale: half, all, or one and a half of the plan. */
export const QUICK_PORTIONS = Object.freeze([0.5, 1, 1.5]);

/** How far an amount may sit from the plan and still count as on plan. */
export const INTAKE_TOLERANCE = 0.1;

/** A meal holds at most this many logged foods; a day at most this many logged meals. */
export const MAX_LOG_ITEMS = 25;
export const MAX_MEAL_LOGS = 12;

/** Every food a client can add to a meal, grouped the way the plan groups them. */
export const LOGGABLE_FOODS = Object.freeze(['PROTEIN', 'CARB', 'FAT', 'RAU'].map((group) => Object.freeze({
  group,
  label: FOOD_GROUPS[group],
  names: Object.freeze(FOODS.filter((food) => food.group === group).map((food) => food.name)),
})));

const round1 = (value) => Math.round(value * 10) / 10;
const zero = () => ({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
const add = (a, b) => ({ kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat });
const rounded = (t) => ({ kcal: Math.round(t.kcal), protein: round1(t.protein), carbs: round1(t.carbs), fat: round1(t.fat) });

export function canWeighCooked(name) {
  return Object.prototype.hasOwnProperty.call(COOKED_YIELD, name);
}

/** The grams the plan would count for an entry: raw for meat and fish weighed cooked. */
export function planGrams(entry) {
  const grams = Math.max(0, Number(entry?.grams) || 0);
  return entry?.cooked && canWeighCooked(entry.name) ? grams / COOKED_YIELD[entry.name] : grams;
}

/** The same amount as the client would weigh it, raw or cooked. */
export function weighedGrams(rawGrams, name, cooked) {
  const grams = Math.max(0, Number(rawGrams) || 0);
  return cooked && canWeighCooked(name) ? grams * COOKED_YIELD[name] : grams;
}

export function entryMacros(entry) {
  const food = getFood(entry?.name);
  if (!food) return zero();
  const k = planGrams(entry) / 100;
  return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carb * k, fat: food.fat * k };
}

/** A meal's lines for the way it was eaten: the home version, or a lunch ordered out. */
export function mealOptionLines(meal, option = 'home') {
  return option === 'alternative' && meal?.alternative?.items?.length ? meal.alternative.items : (meal?.items || []);
}

/** The rows a meal's log starts from: every line that names a food and its grams. */
export function plannedEntries(meal, option = 'home') {
  return parseGramItems(mealOptionLines(meal, option))
    .map((item) => ({ name: item.name, grams: item.grams, planned: item.grams, cooked: false }));
}

/**
 * What the plan gives for a meal, from its lines and the food table, the same way a log is
 * counted. A meal whose lines name no food (a hand-written plan) falls back to its numbers.
 */
export function plannedTotals(meal, option = 'home') {
  const lines = mealOptionLines(meal, option);
  const parsed = parseGramItems(lines);
  if (parsed.length) return rounded(parsed.reduce((total, item) => add(total, item), zero()));
  const source = option === 'alternative' && meal?.alternative?.items?.length ? meal.alternative : meal;
  return rounded({ kcal: Number(source?.kcal) || 0, protein: Number(source?.protein) || 0, carbs: Number(source?.carbs) || 0, fat: Number(source?.fat) || 0 });
}

/** A log as stored: only foods the table knows, sane grams, and a copy of what was planned,
 *  so a report still reads the same after the plan has changed. */
export function normalizeMealLog(raw = {}) {
  const items = (Array.isArray(raw.items) ? raw.items : []).slice(0, MAX_LOG_ITEMS).map((entry) => {
    const name = String(entry?.name || '');
    if (!getFood(name)) return null;
    const grams = Number(entry.grams);
    if (!Number.isFinite(grams) || grams < 0 || grams > 2000) return null;
    const planned = Number(entry.planned);
    return {
      name,
      grams: round1(grams),
      cooked: Boolean(entry.cooked) && canWeighCooked(name),
      planned: Number.isFinite(planned) && planned > 0 ? round1(planned) : null,
    };
  }).filter(Boolean);
  const planned = raw.plannedTotals || {};
  return {
    mealId: String(raw.mealId || ''),
    mealName: String(raw.mealName || '').slice(0, 60),
    option: raw.option === 'alternative' ? 'alternative' : 'home',
    items,
    plannedTotals: rounded({
      kcal: Math.max(0, Number(planned.kcal) || 0), protein: Math.max(0, Number(planned.protein) || 0),
      carbs: Math.max(0, Number(planned.carbs) || 0), fat: Math.max(0, Number(planned.fat) || 0),
    }),
  };
}

export function normalizeMealLogs(logs = []) {
  const seen = new Set();
  return (Array.isArray(logs) ? logs : []).map(normalizeMealLog)
    .filter((log) => log.mealId && !seen.has(log.mealId) && seen.add(log.mealId))
    .slice(0, MAX_MEAL_LOGS);
}

export function mealLogTotals(log) {
  return rounded((log?.items || []).reduce((total, entry) => add(total, entryMacros(entry)), zero()));
}

/** Food logged in "Ăn ngoài": a street dish carries only its calories and protein. */
function eatenOutTotals(foodLog = []) {
  return foodLog.reduce((total, item) => {
    const servings = Number(item?.servings) || 0;
    return add(total, { kcal: (Number(item?.kcal) || 0) * servings, protein: (Number(item?.protein) || 0) * servings, carbs: 0, fat: 0 });
  }, zero());
}

/**
 * The day so far. A logged meal counts what was logged; a ticked meal counts the plan, since
 * the tick says "ate it as planned"; a meal neither logged nor ticked is still open. The day
 * is complete once every meal is one or the other.
 */
export function dayIntake({ meals = [], mealLogs = [], completedMealIds = [], foodLog = [] } = {}) {
  const logs = new Map(mealLogs.map((log) => [log.mealId, log]));
  const ticked = new Set(completedMealIds);
  const perMeal = meals.map((meal) => {
    const log = logs.get(meal.id);
    const planned = plannedTotals(meal, log?.option || 'home');
    if (log) return { mealId: meal.id, name: meal.name, status: 'logged', planned, actual: mealLogTotals(log), log };
    if (ticked.has(meal.id)) return { mealId: meal.id, name: meal.name, status: 'ticked', planned, actual: planned };
    return { mealId: meal.id, name: meal.name, status: 'open', planned, actual: null };
  });
  const out = eatenOutTotals(foodLog);
  const accounted = perMeal.filter((meal) => meal.status !== 'open').length;
  return {
    perMeal,
    planned: rounded(perMeal.reduce((total, meal) => add(total, meal.planned), zero())),
    actual: rounded(perMeal.filter((meal) => meal.actual).reduce((total, meal) => add(total, meal.actual), out)),
    mealCount: meals.length,
    accounted,
    logged: perMeal.filter((meal) => meal.status === 'logged').length,
    complete: meals.length > 0 && accounted === meals.length,
    eatenOut: foodLog.length > 0,
  };
}

/** Each macro against the plan: on plan within the tolerance, otherwise short or over. */
export function intakeVerdict(planned, actual) {
  return ['kcal', 'protein', 'carbs', 'fat'].map((key) => {
    const plan = Number(planned?.[key]) || 0;
    const ate = Number(actual?.[key]) || 0;
    const diff = key === 'kcal' ? Math.round(ate - plan) : round1(ate - plan);
    const status = !plan ? 'ok' : Math.abs(ate - plan) <= plan * INTAKE_TOLERANCE ? 'ok' : ate < plan ? 'under' : 'over';
    return { key, planned: plan, actual: ate, diff, status };
  });
}

/**
 * What a run of days says about the plan, for the coach: the meals eaten well short of or over
 * the plan, the foods whose amount is changed most often, and foods added that the plan does
 * not have. Only what came back at least twice, and at least 15% away from the plan.
 */
export function intakePatterns(checkIns = [], { minCount = 2, minGap = 0.15 } = {}) {
  const meals = new Map();
  const foods = new Map();
  const extras = new Map();
  for (const row of checkIns) {
    for (const log of normalizeMealLogs(row?.mealLogs)) {
      const plannedKcal = log.plannedTotals.kcal;
      if (plannedKcal > 0 && log.mealName) {
        const entry = meals.get(log.mealName) || { name: log.mealName, ratios: [] };
        entry.ratios.push(mealLogTotals(log).kcal / plannedKcal);
        meals.set(log.mealName, entry);
      }
      for (const item of log.items) {
        if (item.planned) {
          const entry = foods.get(item.name) || { name: item.name, ratios: [] };
          entry.ratios.push(planGrams(item) / item.planned);
          foods.set(item.name, entry);
        } else if (item.grams > 0) {
          extras.set(item.name, (extras.get(item.name) || 0) + 1);
        }
      }
    }
  }
  const summarise = (map) => [...map.values()]
    .map((entry) => ({ name: entry.name, count: entry.ratios.length, ratio: entry.ratios.reduce((s, r) => s + r, 0) / entry.ratios.length }))
    .filter((entry) => entry.count >= minCount && Math.abs(entry.ratio - 1) >= minGap)
    .sort((a, b) => Math.abs(b.ratio - 1) - Math.abs(a.ratio - 1));
  return {
    meals: summarise(meals),
    foods: summarise(foods),
    extras: [...extras].map(([name, count]) => ({ name, count })).filter((entry) => entry.count >= minCount).sort((a, b) => b.count - a.count),
  };
}
