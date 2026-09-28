// ============================================================
// DAVID TRAINING PROGRAM — Gram-level meal generator
// ============================================================
// Turns coach-approved daily macro targets into an actual day of food with
// real gram amounts ("Ức gà bỏ da (sống) 150 g"), instead of the descriptive
// guidance nutrition-engine.js produces ("Đạm: trứng, thịt nạc hoặc đậu hũ").
//
// Ported from the coach's standalone tool (nutrition-automation.netlify.app).
// Pure module: no DOM, no Firebase, no globals — so it can be unit-tested in
// engine-test-harness.html the same way progression-engine.js is.
//
// WHY A LINEAR SOLVE AND NOT "protein food covers protein, carb food covers
// carbs": starch and fat foods carry meaningful protein of their own (rice
// 2.7 g/100 g, cashews 18, sesame 18, oats 13). Allocating each macro from a
// single food and summing overshoots daily protein by 30–40 g. At a fat-loss
// protein target that error hides inside the margin; at maintenance/gain on
// higher calories it throws the plan off by 30–45%. So all three foods in a
// meal are solved simultaneously.

import { FOODS, MEAL_POOLS, getFood, POOL_LETTER_GROUP } from './nutrition-foods.js';
// The dish layer. Composition mode 'dish' picks a real recipe and solves grams
// inside it; mode 'food' is the original behaviour and is untouched.
import { DISHES_BY_MEAL_TYPE } from './nutrition-dishes.js';
// One implementation of the hand-portion hint, shared with the save path that
// has to keep it in step with grams the coach edited by hand.
import { handPortions } from './nutrition-item-parser.js';
export { handPortions };

export const MEAL_BUILDER_VERSION = '1.1.0';

/** A generated plan only counts as matched when all four numbers pass. */
/**
 * How far a generated day may sit from its target before it is rejected.
 *
 * These were briefly set to 1% / 1% / 2 g / 2 g. That looked stricter but made
 * the generator refuse most of its own work: a five-meal day succeeded 17% of
 * the time and a four-meal day 74%, so a coach building a 5-meal plan failed
 * five times in six. More search did not help — raising the attempt budget from
 * 400 to 5000 only moved 12% to 37% while costing nearly a second per plan.
 *
 * The set was also self-contradictory at the edges. The three macro tolerances
 * alone admit ±32 kcal on a 2,600 kcal day (2 g fat = 18, 2 g carb = 8, 1% of
 * 150 g protein = 6), while the calorie tolerance allowed only ±26 — so a day
 * could satisfy every macro limit and still be thrown out on calories. That is
 * what the failures showed: the calorie ceiling was breached in 98% of them.
 *
 * The values below were picked by sweeping candidate sets over four targets
 * (1,500–3,800 kcal) and meal counts 3–6 and keeping the tightest one that both
 * stays internally consistent and lands every cell at 100%. ±3% of a 2,600 kcal
 * day is ±78 kcal — far finer than the error a client introduces by weighing
 * food at home, and finer than food-composition tables are themselves accurate.
 */
export const MEAL_ACCURACY_LIMITS = Object.freeze({
  kcalRatio: 0.03,
  proteinRatio: 0.02,
  carbsG: 5,
  fatG: 4,
});

/** Daily-life activity bands. `base` is the multiplier applied to weight × 22.
 *  Asking clients for a step count does not work — most have no idea — so the
 *  question is phrased in terms of daily life and the factor inferred. */
export const MOVE_LEVELS = Object.freeze([
  Object.freeze({ value: 'itnhat', label: 'Ngồi gần như cả ngày, ít ra ngoài', base: 1.10 }),
  Object.freeze({ value: 'vua', label: 'Có đi lại, thỉnh thoảng đứng', base: 1.45 }),
  Object.freeze({ value: 'nhieu', label: 'Đi nhiều, đứng nhiều', base: 1.75 }),
  Object.freeze({ value: 'chantay', label: 'Lao động chân tay', base: 2.05 }),
]);

/** Lifting frequency adjusts the daily-life factor. The bands above assume a
 *  3–4 session week, so that band is the zero point. */
export const LIFT_LEVELS = Object.freeze([
  Object.freeze({ value: '0', label: 'Không tập', adjust: -0.12 }),
  Object.freeze({ value: '12', label: '1-2 buổi', adjust: -0.06 }),
  Object.freeze({ value: '34', label: '3-4 buổi', adjust: 0.00 }),
  Object.freeze({ value: '5', label: '5 buổi trở lên', adjust: +0.06 }),
]);

/** 1 kg of body mass ≈ 7700 kcal. Used to convert a target rate of weight
 *  change into a daily calorie delta. */
export const KCAL_PER_KG = 7700;

/** Hard floors the generator will not design below, and the plateau protocol
 *  will not cut below. Carb and fat floors protect training performance and
 *  hormonal function; the calorie floor is weight × 22 × 0.75. */
export const SAFETY_FLOORS = Object.freeze({
  calorieFactor: 0.75,
  carbPerKg: 1.0,
  fatPerKg: 0.5,
});

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function deriveActivityFactor(moveLevel, liftLevel) {
  const move = MOVE_LEVELS.find((item) => item.value === moveLevel) || MOVE_LEVELS[1];
  const lift = LIFT_LEVELS.find((item) => item.value === liftLevel) || LIFT_LEVELS[2];
  return Math.round(clamp(move.base + lift.adjust, 1.0, 2.2) * 100) / 100;
}

/**
 * Maintenance calories from body weight × 22 × activity factor.
 * This is a second, independent estimate to cross-check the kcal/kg method in
 * nutrition-engine.js — the two use different reasoning and will disagree;
 * that disagreement is the useful signal.
 */
export function computeActivityTdee({ weightKg, moveLevel, liftLevel, factor } = {}) {
  const weight = Number(weightKg) || 0;
  const activityFactor = Number(factor) || deriveActivityFactor(moveLevel, liftLevel);
  return {
    factor: activityFactor,
    maintenanceKcal: Math.round(weight * 22 * activityFactor),
    calorieFloor: Math.round(weight * 22 * SAFETY_FLOORS.calorieFactor),
  };
}

/** Meal slots and the share of the day each carries. `type` selects which
 *  food pool the slot draws from. */
export function mealSplit(count) {
  const n = Math.max(2, Math.min(6, Number(count) || 4));
  if (n <= 2) return [{ type: 'sang', name: 'Bữa sáng', share: .45 }, { type: 'chinh', name: 'Bữa tối', share: .55 }];
  if (n === 3) return [{ type: 'sang', name: 'Bữa sáng', share: .30 }, { type: 'chinh', name: 'Bữa trưa', share: .35 }, { type: 'chinh', name: 'Bữa tối', share: .35 }];
  if (n === 4) return [{ type: 'sang', name: 'Bữa sáng', share: .25 }, { type: 'chinh', name: 'Bữa trưa', share: .30 }, { type: 'phu', name: 'Bữa phụ', share: .15 }, { type: 'chinh', name: 'Bữa tối', share: .30 }];
  if (n === 5) return [{ type: 'sang', name: 'Bữa sáng', share: .22 }, { type: 'phu', name: 'Bữa phụ sáng', share: .10 }, { type: 'chinh', name: 'Bữa trưa', share: .28 }, { type: 'phu', name: 'Bữa phụ chiều', share: .12 }, { type: 'chinh', name: 'Bữa tối', share: .28 }];
  return [
    { type: 'sang', name: 'Bữa sáng', share: .18 }, { type: 'phu', name: 'Bữa phụ sáng', share: .10 },
    { type: 'chinh', name: 'Bữa trưa', share: .24 }, { type: 'phu', name: 'Bữa phụ chiều', share: .12 },
    { type: 'chinh', name: 'Bữa tối', share: .24 }, { type: 'phu', name: 'Bữa phụ tối', share: .12 },
  ];
}

/** Gaussian elimination with partial pivoting on a 3×3 system.
 *  Returns null when the system is singular (three foods whose macro profiles
 *  are linearly dependent — e.g. all near-pure carb). */
export function solve3(A, b) {
  const M = [
    [A[0][0], A[0][1], A[0][2], b[0]],
    [A[1][0], A[1][1], A[1][2], b[1]],
    [A[2][0], A[2][1], A[2][2], b[2]],
  ];
  for (let i = 0; i < 3; i++) {
    let pivot = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[pivot][i])) pivot = r;
    if (Math.abs(M[pivot][i]) < 1e-9) return null;
    const swap = M[i]; M[i] = M[pivot]; M[pivot] = swap;
    for (let r = i + 1; r < 3; r++) {
      const factor = M[r][i] / M[i][i];
      for (let c = i; c < 4; c++) M[r][c] -= factor * M[i][c];
    }
  }
  const x = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let sum = M[i][3];
    for (let j = i + 1; j < 3; j++) sum -= M[i][j] * x[j];
    x[i] = sum / M[i][i];
  }
  return x;
}

/** The exact solution usually lands outside sensible portion sizes. Clamp the
 *  offenders to their bound, then re-solve the still-free variables against the
 *  macros that matter most in order: protein first, then carbs. */
function refine(A, b, guess, low, high) {
  const g = guess.slice();
  for (let pass = 0; pass < 4; pass++) {
    const clamped = [false, false, false];
    let any = false;
    for (let k = 0; k < 3; k++) {
      if (g[k] < low[k]) { g[k] = low[k]; clamped[k] = true; any = true; }
      else if (g[k] > high[k]) { g[k] = high[k]; clamped[k] = true; any = true; }
    }
    if (!any) break;
    const free = [];
    for (let k = 0; k < 3; k++) if (!clamped[k]) free.push(k);
    if (!free.length) break;
    const rows = free.length >= 2 ? [0, 2] : [0];
    const bb = rows.map((row) => {
      let sum = b[row];
      for (let k = 0; k < 3; k++) if (clamped[k]) sum -= A[row][k] * g[k];
      return sum;
    });
    if (free.length >= 2) {
      const a11 = A[rows[0]][free[0]], a12 = A[rows[0]][free[1]];
      const a21 = A[rows[1]][free[0]], a22 = A[rows[1]][free[1]];
      const det = a11 * a22 - a12 * a21;
      if (Math.abs(det) < 1e-9) break;
      g[free[0]] = (bb[0] * a22 - a12 * bb[1]) / det;
      g[free[1]] = (a11 * bb[1] - bb[0] * a21) / det;
    } else {
      const a = A[0][free[0]];
      if (Math.abs(a) < 1e-9) break;
      g[free[0]] = bb[0] / a;
    }
  }
  for (let k = 0; k < 3; k++) g[k] = clamp(g[k], low[k], high[k]);
  return g;
}

function roundGrams(grams, max, step = max > 50 ? 5 : 1) {
  return Math.round(grams / step) * step;
}

function gramStep(option, foodItem) {
  // Full foods stay easy to weigh; oil, seeds and other small additions retain
  // the 1 g control needed to close the last macro gap.
  return foodItem.group === 'FAT' && option.max <= 60 ? 1 : 5;
}

function pick(list, random) {
  return list[Math.floor(random() * list.length)];
}

/**
 * Pick a food the day has not used yet.
 *
 * Without this, every meal draws from its pool independently and a 5–6 meal
 * day happily prescribes milk + guava + cashews twice, which reads as a
 * generator artefact rather than a plan a coach wrote.
 *
 * Falls back to the full list when every option is already used — some pools
 * are smaller than the number of meals drawing from them, and a repeated food
 * is much better than failing to build the day at all.
 */
function pickUnusedKeyed(list, used, keyOf, random) {
  if (!list.length) return null;
  const fresh = list.filter((item) => !used.has(keyOf(item)));
  const chosen = pick(fresh.length ? fresh : list, random);
  used.add(keyOf(chosen));
  return chosen;
}

function pickUnused(list, used, random) {
  return pickUnusedKeyed(list, used, (option) => option.name, random);
}

/**
 * Two-unknown version of solve3, for a dish whose fat is already inside its
 * protein — bánh mì chả lụa, ba chỉ rang, trứng luộc. Solves the protein and
 * carb rows only; the day's fat is made up by the meals that do use oil, which
 * optimiseCandidate handles because it optimises across the whole day.
 */
function solve2(A, b) {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (Math.abs(det) < 1e-9) return null;
  return [
    (b[0] * A[1][1] - A[0][1] * b[1]) / det,
    (A[0][0] * b[1] - b[0] * A[1][0]) / det,
  ];
}

/** refine() for the two-unknown case: clamp whichever portion left its range,
 *  then re-solve the other one against protein, which is the macro worth
 *  protecting when only one degree of freedom is left. */
function refine2(A, b, guess, low, high) {
  const g = guess.slice();
  for (let pass = 0; pass < 3; pass++) {
    let clampedIndex = -1;
    for (let k = 0; k < 2; k++) {
      if (g[k] < low[k]) { g[k] = low[k]; clampedIndex = k; }
      else if (g[k] > high[k]) { g[k] = high[k]; clampedIndex = k; }
    }
    if (clampedIndex < 0) break;
    const free = clampedIndex === 0 ? 1 : 0;
    const coefficient = A[0][free];
    if (Math.abs(coefficient) < 1e-9) break;
    g[free] = (b[0] - A[0][clampedIndex] * g[clampedIndex]) / coefficient;
  }
  for (let k = 0; k < 2; k++) g[k] = clamp(g[k], low[k], high[k]);
  return g;
}

/** Labels used when telling the coach which part of the plan could not be
 *  built from the foods their client actually eats. */
const GROUP_LABELS = Object.freeze({ PROTEIN: 'Đạm', CARB: 'Tinh bột / trái cây', FAT: 'Béo', RAU: 'Rau' });
const SLOT_LABELS = Object.freeze({ sang: 'bữa sáng', chinh: 'bữa chính', phu: 'bữa phụ' });

/**
 * Narrow the food pools down to what this particular client actually eats.
 *
 * Two constraints with deliberately different strengths:
 *
 *   avoided   — HARD. An allergy, or a food that upsets their stomach. Removed
 *               everywhere, never restored, even when that makes the day
 *               impossible to build. Failing loudly beats serving a client
 *               something that hurts them.
 *
 *   preferred — SOFT. Foods the client is used to and will actually cook. The
 *               day is built from these where possible, but if a slot's whole
 *               pool would be emptied the generator falls back to the safe
 *               list for that one slot and group, and reports it, so the coach
 *               can see the plan left their list instead of assuming it did not.
 *
 * A macro group is only treated as constrained when the coach ticked at least
 * one food in it. Ticking three proteins is a statement about protein, not a
 * declaration that the client eats no vegetables — without this rule every
 * plan would report the fat and vegetable groups as "widened".
 */
export function resolvePools({ preferred = [], avoided = [] } = {}) {
  const avoidSet = new Set(avoided);
  const preferSet = new Set(preferred.filter((name) => !avoidSet.has(name)));

  const constrained = new Set();
  for (const name of preferSet) {
    const food = getFood(name);
    if (food) constrained.add(food.group);
  }

  const pools = {};
  const widened = [];   // preference could not be honoured for this slot + group
  const blocked = [];   // avoidance emptied a pool the generator needs
  for (const [mealType, pool] of Object.entries(MEAL_POOLS)) {
    pools[mealType] = {};
    for (const [letter, list] of Object.entries(pool)) {
      const group = POOL_LETTER_GROUP[letter];
      const safe = list.filter((option) => !avoidSet.has(option.name));
      // Vegetables are optional garnish, so an empty R pool is not a failure.
      if (!safe.length && list.length && letter !== 'R') blocked.push({ mealType, group });
      if (!constrained.has(group)) { pools[mealType][letter] = safe; continue; }
      const liked = safe.filter((option) => preferSet.has(option.name));
      if (liked.length) { pools[mealType][letter] = liked; continue; }
      pools[mealType][letter] = safe;
      if (safe.length) widened.push({ mealType, group });
    }
  }

  // Ticked foods no slot can serve — usually a food ticked as preferred and
  // also marked avoided, or a stale name from an older food table. Reported so
  // the coach is not left believing a constraint is active when it is not.
  const usable = new Set();
  for (const pool of Object.values(pools)) {
    for (const list of Object.values(pool)) for (const option of list) usable.add(option.name);
  }
  const ignored = [...preferSet].filter((name) => !usable.has(name));

  return { pools, widened, blocked, ignored, constrainedGroups: [...constrained] };
}

/**
 * The dish-mode counterpart of resolvePools: narrow the dish library down to
 * what this client will actually eat.
 *
 * The two constraint strengths carry over unchanged — avoided is hard, either
 * at dish level or through any ingredient; preferred is soft and falls back
 * with a report. Two rules are specific to dishes and worth stating:
 *
 *   A vegetable is PART of a dish, not an alternative. "Bò xào rau muống"
 *   without rau muống is not the same dish, so avoiding rau muống removes the
 *   dish rather than quietly serving it plain.
 *
 *   A dish whose only cooking fats are all avoided is removed too. Silently
 *   dropping the oil from a stir-fry would hand the client a recipe that does
 *   not work and macros that assume one that does.
 */
export function resolveDishes({ preferred = [], avoided = [], preferredDishes = [], avoidedDishes = [] } = {}) {
  const avoidFoods = new Set(avoided);
  const avoidDishes = new Set(avoidedDishes);
  const preferFoods = new Set(preferred.filter((name) => !avoidFoods.has(name)));
  const preferDishes = new Set(preferredDishes.filter((id) => !avoidDishes.has(id)));

  const constrained = new Set();
  for (const name of preferFoods) {
    const food = getFood(name);
    if (food) constrained.add(food.group);
  }

  function safeDish(item) {
    if (avoidDishes.has(item.id)) return null;
    if (item.vegetables.some((option) => avoidFoods.has(option.name))) return null;
    const proteinOptions = item.proteinOptions.filter((option) => !avoidFoods.has(option.name));
    const carbOptions = item.carbOptions.filter((option) => !avoidFoods.has(option.name));
    if (!proteinOptions.length || !carbOptions.length) return null;
    const fatOptions = item.fatOptions.filter((option) => !avoidFoods.has(option.name));
    if (item.fatOptions.length && !fatOptions.length) return null;
    return { ...item, proteinOptions, carbOptions, fatOptions };
  }

  function likedDish(item) {
    if (preferDishes.size && !preferDishes.has(item.id)) return null;
    const narrowed = { ...item };
    for (const [group, key] of [['PROTEIN', 'proteinOptions'], ['CARB', 'carbOptions'], ['FAT', 'fatOptions']]) {
      if (!constrained.has(group) || !item[key].length) continue;
      const liked = item[key].filter((option) => preferFoods.has(option.name));
      if (!liked.length) return null;
      narrowed[key] = liked;
    }
    // Every vegetable in the dish is served, so all of them have to be liked —
    // there is no "pick the one they eat" here.
    if (constrained.has('RAU') && item.vegetables.length
        && !item.vegetables.every((option) => preferFoods.has(option.name))) return null;
    return narrowed;
  }

  const pools = {};
  const widenedDishSlots = [];
  const blockedDishSlots = [];
  for (const mealType of Object.keys(DISHES_BY_MEAL_TYPE)) {
    const safe = DISHES_BY_MEAL_TYPE[mealType].map(safeDish).filter(Boolean);
    if (!safe.length) { pools[mealType] = []; blockedDishSlots.push(mealType); continue; }
    if (!preferDishes.size && !constrained.size) { pools[mealType] = safe; continue; }
    const liked = safe.map(likedDish).filter(Boolean);
    if (liked.length) { pools[mealType] = liked; continue; }
    pools[mealType] = safe;
    widenedDishSlots.push(mealType);
  }

  const usableDishIds = new Set();
  const usableFoods = new Set();
  for (const list of Object.values(pools)) {
    for (const item of list) {
      usableDishIds.add(item.id);
      for (const option of [...item.proteinOptions, ...item.carbOptions, ...item.fatOptions, ...item.vegetables]) {
        usableFoods.add(option.name);
      }
    }
  }

  return {
    pools,
    widenedDishSlots,
    blockedDishSlots,
    // Reported rather than swallowed: a coach who ticked a dish that avoidance
    // has removed must not be left thinking it is still in play.
    ignoredDishes: [...preferDishes].filter((id) => !usableDishIds.has(id)),
    ignored: [...preferFoods].filter((name) => !usableFoods.has(name)),
    constrainedGroups: [...constrained],
    dishConstrained: preferDishes.size > 0,
  };
}

/** Turns the resolver's findings into the sentences the coach reads. */
export function describePoolFallbacks({
  widened = [], blocked = [], fallbackFoods = [],
  widenedDishSlots = [], blockedDishSlots = [], fallbackDishes = [],
} = {}) {
  const groupSlots = new Map();
  for (const entry of widened) {
    if (!groupSlots.has(entry.group)) groupSlots.set(entry.group, []);
    groupSlots.get(entry.group).push(SLOT_LABELS[entry.mealType] || entry.mealType);
  }
  const messages = [...groupSlots.entries()].map(([group, slots]) =>
    `Nhóm ${GROUP_LABELS[group] || group}: đã phải dùng thêm món ngoài danh sách ở ${slots.join(', ')} vì những món bạn chọn không có ở ${slots.length > 1 ? 'các bữa đó' : 'bữa đó'}.`);
  if (fallbackFoods.length) {
    messages.push(`Đã bổ sung ngoài danh sách món thường ăn để ghép đủ mục tiêu: ${fallbackFoods.join(', ')}.`);
  }
  if (widenedDishSlots.length) {
    const slots = widenedDishSlots.map((mealType) => SLOT_LABELS[mealType] || mealType);
    messages.push(`Đã phải lấy thêm món ngoài danh sách đã tick ở ${slots.join(', ')} vì những món bạn chọn không phủ được ${slots.length > 1 ? 'các bữa đó' : 'bữa đó'}.`);
  }
  if (fallbackDishes.length) {
    messages.push(`Món nằm ngoài danh sách đã tick: ${fallbackDishes.join(', ')}.`);
  }
  const blockedGroups = [...new Set(blocked.map((entry) => GROUP_LABELS[entry.group] || entry.group))];
  const blockedSlots = blockedDishSlots.map((mealType) => SLOT_LABELS[mealType] || mealType);
  return { messages, blockedGroups, blockedSlots };
}

function dailyVegetableGrams(kcal, goalType) {
  // Gaining clients eat far more food overall, so vegetable volume is scaled
  // down relative to calories to leave room; cutting clients get more volume
  // for satiety at low calories.
  return goalType === 'gain' ? kcal / 1000 * 200 : kcal / 500 * 200;
}

/**
 * Order in which slots get to claim foods.
 *
 * Selection is greedy with no backtracking, so whoever picks first wins. Left
 * in chronological order, breakfast claims a fat that the three snacks then
 * have to fight over: a 6-meal day needs 6 fats, the snack pool only offers
 * 4, and the pools overlap. Letting the most over-subscribed slot type choose
 * first removes most of that collision.
 *
 * Contention = smallest pool available to a slot type ÷ how many slots of that
 * type are competing for it. Lower means tighter, so it goes first.
 */
function selectionOrder(split, pools) {
  const countByType = {};
  for (const slot of split) countByType[slot.type] = (countByType[slot.type] || 0) + 1;
  const contentionByType = {};
  for (const type of Object.keys(countByType)) {
    const pool = pools[type];
    const sizes = ['P', 'F', 'C'].map((group) => pool[group].length).filter((size) => size > 0);
    contentionByType[type] = Math.min(...sizes) / countByType[type];
  }
  return split
    .map((slot, index) => ({ slot, index }))
    .sort((a, b) => contentionByType[a.slot.type] - contentionByType[b.slot.type] || a.index - b.index);
}

function buildCandidate({ targets, weightKg, mealCount, goalType, random, pools }) {
  const split = mealSplit(mealCount);
  const vegTotal = dailyVegetableGrams(targets.kcal, goalType);
  const mainCount = split.filter((m) => m.type === 'chinh').length || 1;
  const meals = [];
  const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  // One shared set for the whole day, so a food chosen at breakfast is not
  // offered again at a snack. Reset per candidate — each attempt is a fresh day.
  const usedFoods = new Set();

  // Pass 1 — claim foods, tightest slot type first.
  const picksByIndex = [];
  for (const { slot, index } of selectionOrder(split, pools)) {
    const pool = pools[slot.type];
    picksByIndex[index] = {
      veg: slot.type === 'chinh' && pool.R?.length ? pickUnused(pool.R, usedFoods, random) : null,
      protein: pickUnused(pool.P, usedFoods, random),
      fat: pickUnused(pool.F, usedFoods, random),
      carb: pickUnused(pool.C, usedFoods, random),
    };
  }

  // Pass 2 — solve grams and emit meals in the order the client eats them.
  for (let slotIndex = 0; slotIndex < split.length; slotIndex++) {
    const slot = split[slotIndex];
    const picks = picksByIndex[slotIndex];
    const items = [];
    const proteinTarget = targets.protein * slot.share;
    const fatTarget = targets.fat * slot.share;
    const carbTarget = targets.carbs * slot.share;

    // Vegetables only go with main meals, and are allocated by volume rather
    // than solved for — they are there for fibre and fullness.
    const vegOption = picks.veg;
    const vegGrams = vegOption ? clamp(roundGrams(vegTotal / mainCount, 200), vegOption.min, vegOption.max) : 0;
    const vegFood = vegOption ? getFood(vegOption.name) : null;
    const vegCarb = vegFood ? vegGrams * vegFood.carb / 100 : 0;
    const vegFat = vegFood ? vegGrams * vegFood.fat / 100 : 0;
    const vegProtein = vegFood ? vegGrams * vegFood.protein / 100 : 0;

    const pOpt = picks.protein; const pFood = getFood(pOpt.name);
    const fOpt = picks.fat; const fFood = getFood(fOpt.name);
    const cOpt = picks.carb; const cFood = getFood(cOpt.name);

    const A = [
      [pFood.protein / 100, fFood.protein / 100, cFood.protein / 100],
      [pFood.fat / 100, fFood.fat / 100, cFood.fat / 100],
      [pFood.carb / 100, fFood.carb / 100, cFood.carb / 100],
    ];
    const b = [proteinTarget - vegProtein, fatTarget - vegFat, carbTarget - vegCarb];
    const low = [pOpt.min, fOpt.min, cOpt.min];
    const high = [pOpt.max, fOpt.max, cOpt.max];

    let grams = solve3(A, b) || [pOpt.min, fOpt.min, cOpt.min];
    grams = refine(A, b, grams, low, high);

    const chosen = [
      [pFood, clamp(roundGrams(grams[0], pOpt.max, gramStep(pOpt, pFood)), pOpt.min, pOpt.max), pOpt],
      [cFood, clamp(roundGrams(grams[2], cOpt.max, gramStep(cOpt, cFood)), cOpt.min, cOpt.max), cOpt],
      [fFood, clamp(roundGrams(grams[1], fOpt.max, gramStep(fOpt, fFood)), fOpt.min, fOpt.max), fOpt],
    ];
    if (vegFood) chosen.push([vegFood, vegGrams, vegOption]);

    for (const [foodItem, gramAmount, option] of chosen) {
      const k = gramAmount / 100;
      const item = {
        name: foodItem.name,
        group: foodItem.group,
        grams: gramAmount,
        kcal: foodItem.kcal * k,
        carbs: foodItem.carb * k,
        fat: foodItem.fat * k,
        protein: foodItem.protein * k,
      };
      // Solver metadata is deliberately non-enumerable: it is available to
      // the optimiser in memory but never leaks into saved client plans.
      if (option) Object.defineProperties(item, {
        _food: { value: foodItem },
        _minGrams: { value: option.min },
        _maxGrams: { value: option.max },
        _gramStep: { value: gramStep(option, foodItem) },
      });
      items.push(item);
      totals.kcal += foodItem.kcal * k;
      totals.carbs += foodItem.carb * k;
      totals.fat += foodItem.fat * k;
      totals.protein += foodItem.protein * k;
      totals.fiber += foodItem.fiber * k;
    }
    meals.push({ name: slot.name, type: slot.type, items });
  }
  return { meals, totals, mode: 'food' };
}

/** Dish-mode counterpart of selectionOrder: whichever slot type has the
 *  fewest dishes per slot competing for them chooses first. */
function dishSelectionOrder(split, dishPools) {
  const countByType = {};
  for (const slot of split) countByType[slot.type] = (countByType[slot.type] || 0) + 1;
  const contentionByType = {};
  for (const type of Object.keys(countByType)) {
    contentionByType[type] = (dishPools[type]?.length || 0) / countByType[type];
  }
  return split
    .map((slot, index) => ({ slot, index }))
    .sort((a, b) => contentionByType[a.slot.type] - contentionByType[b.slot.type] || a.index - b.index);
}

/**
 * Build one candidate day out of real dishes.
 *
 * Deliberately parallel to buildCandidate rather than merged with it: the two
 * differ only in WHAT gets chosen, and keeping them separate means the dish
 * layer cannot change a single number in the food-composition mode that
 * already works.
 *
 * Two behaviours differ from food mode, both on purpose:
 *
 *   Variety is measured in dishes, not foods. Rice at lunch and rice at dinner
 *   is how Vietnamese people eat; banning a food for the rest of the day after
 *   one dish used it would leave cơm appearing once and then never again.
 *
 *   Vegetable volume is spread over every slot whose dish has vegetables,
 *   weighted by that slot's share of the day — so a breakfast plate of dưa leo
 *   gets a garnish, and dinner gets the bowl.
 */
function buildDishCandidate({ targets, mealCount, goalType, random, dishPools }) {
  const split = mealSplit(mealCount);
  const vegBudget = dailyVegetableGrams(targets.kcal, goalType);
  const usedDishes = new Set();
  const usedProteins = new Set();

  // Pass 1 — claim a dish per slot, tightest slot type first.
  const picksByIndex = [];
  for (const { slot, index } of dishSelectionOrder(split, dishPools)) {
    const list = dishPools[slot.type];
    if (!list?.length) return null;
    const chosen = pickUnusedKeyed(list, usedDishes, (item) => item.id, random);
    picksByIndex[index] = {
      dish: chosen,
      protein: pickUnusedKeyed(chosen.proteinOptions, usedProteins, (option) => option.name, random),
      carb: pick(chosen.carbOptions, random),
      fat: chosen.fatOptions.length ? pick(chosen.fatOptions, random) : null,
    };
  }

  const vegShareTotal = split.reduce(
    (sum, slot, index) => sum + (picksByIndex[index].dish.vegetables.length ? slot.share : 0), 0);

  // Pass 2 — solve grams inside each dish, in the order the client eats.
  const meals = [];
  const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  for (let slotIndex = 0; slotIndex < split.length; slotIndex++) {
    const slot = split[slotIndex];
    const { dish, protein: pOpt, carb: cOpt, fat: fOpt } = picksByIndex[slotIndex];
    const pFood = getFood(pOpt.name);
    const cFood = getFood(cOpt.name);
    const fFood = fOpt ? getFood(fOpt.name) : null;

    // Vegetables first: they are allocated by volume, and the macros they
    // bring are subtracted from what the solve has to cover.
    const slotVegBudget = vegShareTotal > 0 && dish.vegetables.length
      ? vegBudget * slot.share / vegShareTotal / dish.vegetables.length
      : 0;
    const vegItems = dish.vegetables.map((option) => {
      const food = getFood(option.name);
      const grams = clamp(roundGrams(slotVegBudget, 200), option.min, option.max);
      return { food, grams, option };
    });
    const vegProtein = vegItems.reduce((sum, v) => sum + v.grams * v.food.protein / 100, 0);
    const vegFat = vegItems.reduce((sum, v) => sum + v.grams * v.food.fat / 100, 0);
    const vegCarb = vegItems.reduce((sum, v) => sum + v.grams * v.food.carb / 100, 0);

    const proteinNeed = targets.protein * slot.share - vegProtein;
    const fatNeed = targets.fat * slot.share - vegFat;
    const carbNeed = targets.carbs * slot.share - vegCarb;

    let proteinGrams;
    let carbGrams;
    let fatGrams = 0;
    if (fFood) {
      const A = [
        [pFood.protein / 100, fFood.protein / 100, cFood.protein / 100],
        [pFood.fat / 100, fFood.fat / 100, cFood.fat / 100],
        [pFood.carb / 100, fFood.carb / 100, cFood.carb / 100],
      ];
      const b = [proteinNeed, fatNeed, carbNeed];
      const low = [pOpt.min, fOpt.min, cOpt.min];
      const high = [pOpt.max, fOpt.max, cOpt.max];
      const grams = refine(A, b, solve3(A, b) || low, low, high);
      [proteinGrams, fatGrams, carbGrams] = grams;
    } else {
      // Protein and carb rows only — the dish carries its own fat.
      const A = [
        [pFood.protein / 100, cFood.protein / 100],
        [pFood.carb / 100, cFood.carb / 100],
      ];
      const b = [proteinNeed, carbNeed];
      const low = [pOpt.min, cOpt.min];
      const high = [pOpt.max, cOpt.max];
      [proteinGrams, carbGrams] = refine2(A, b, solve2(A, b) || low, low, high);
    }

    // Emitted in reading order: what the dish is made of, then the rice or
    // noodles it is eaten with, then the cooking fat.
    const chosen = [
      [pFood, clamp(roundGrams(proteinGrams, pOpt.max, gramStep(pOpt, pFood)), pOpt.min, pOpt.max), pOpt],
      ...vegItems.map((v) => [v.food, v.grams, v.option]),
      [cFood, clamp(roundGrams(carbGrams, cOpt.max, gramStep(cOpt, cFood)), cOpt.min, cOpt.max), cOpt],
    ];
    if (fFood) chosen.push([fFood, clamp(roundGrams(fatGrams, fOpt.max, gramStep(fOpt, fFood)), fOpt.min, fOpt.max), fOpt]);

    const items = [];
    for (const [foodItem, gramAmount, option] of chosen) {
      const k = gramAmount / 100;
      const item = {
        name: foodItem.name,
        group: foodItem.group,
        grams: gramAmount,
        kcal: foodItem.kcal * k,
        carbs: foodItem.carb * k,
        fat: foodItem.fat * k,
        protein: foodItem.protein * k,
      };
      Object.defineProperties(item, {
        _food: { value: foodItem },
        _minGrams: { value: option.min },
        _maxGrams: { value: option.max },
        _gramStep: { value: gramStep(option, foodItem) },
      });
      items.push(item);
      totals.kcal += foodItem.kcal * k;
      totals.carbs += foodItem.carb * k;
      totals.fat += foodItem.fat * k;
      totals.protein += foodItem.protein * k;
      totals.fiber += foodItem.fiber * k;
    }
    meals.push({
      name: slot.name,
      type: slot.type,
      items,
      dish: { id: dish.id, name: dish.name, kind: dish.kind, cook: dish.cook },
    });
  }
  return { meals, totals, mode: 'dish' };
}

function metricUnits(totals, targets) {
  return [
    Math.abs(totals.kcal - targets.kcal) / Math.max(targets.kcal * MEAL_ACCURACY_LIMITS.kcalRatio, 1),
    Math.abs(totals.protein - targets.protein) / Math.max(targets.protein * MEAL_ACCURACY_LIMITS.proteinRatio, .1),
    Math.abs(totals.carbs - targets.carbs) / MEAL_ACCURACY_LIMITS.carbsG,
    Math.abs(totals.fat - targets.fat) / MEAL_ACCURACY_LIMITS.fatG,
  ];
}

function macroDistance(totals, targets) {
  const units = metricUnits(totals, targets);
  // The worst macro dominates. The squared tail then improves the other three
  // without accepting a pretty calorie number that hides a large carb miss.
  return Math.max(...units) * 100 + units.reduce((sum, value) => sum + value * value, 0);
}

function totalsWithDelta(totals, foodItem, deltaGrams) {
  const k = deltaGrams / 100;
  return {
    kcal: totals.kcal + foodItem.kcal * k,
    protein: totals.protein + foodItem.protein * k,
    carbs: totals.carbs + foodItem.carb * k,
    fat: totals.fat + foodItem.fat * k,
    fiber: totals.fiber + foodItem.fiber * k,
  };
}

function applyGramAmount(candidate, item, grams) {
  const delta = grams - item.grams;
  if (!delta) return;
  candidate.totals = totalsWithDelta(candidate.totals, item._food, delta);
  const k = grams / 100;
  item.grams = grams;
  item.kcal = item._food.kcal * k;
  item.protein = item._food.protein * k;
  item.carbs = item._food.carb * k;
  item.fat = item._food.fat * k;
}

/** Tighten the rounded meal-level solution across the whole day. */
function optimiseCandidate(candidate, targets) {
  const adjustable = candidate.meals.flatMap((meal) => meal.items).filter((item) => item._food);
  let score = macroDistance(candidate.totals, targets);
  const jumps = [16, 8, 4, 2, 1];

  for (let iteration = 0; iteration < 500; iteration++) {
    let best = null;
    for (const item of adjustable) {
      for (const direction of [-1, 1]) {
        for (const jump of jumps) {
          const grams = clamp(item.grams + direction * item._gramStep * jump, item._minGrams, item._maxGrams);
          const delta = grams - item.grams;
          if (!delta) continue;
          const nextTotals = totalsWithDelta(candidate.totals, item._food, delta);
          const nextScore = macroDistance(nextTotals, targets);
          if (nextScore + 1e-9 < score && (!best || nextScore < best.score)) {
            best = { item, grams, score: nextScore };
          }
        }
      }
    }
    if (!best) break;
    applyGramAmount(candidate, best.item, best.grams);
    score = best.score;
  }
  return candidate;
}

/** How many times the day serves the same food twice. Zero is the goal; a
 *  repeat is a cosmetic flaw, never a safety or accuracy problem. */
export function repeatedFoodCount(candidate) {
  const seen = new Map();
  for (const meal of candidate.meals) {
    for (const item of meal.items) seen.set(item.name, (seen.get(item.name) || 0) + 1);
  }
  let repeats = 0;
  for (const count of seen.values()) if (count > 1) repeats += count - 1;
  return repeats;
}

/** How many times the day serves the same dish twice. This, not the food
 *  count, is the variety measure that matters in dish mode: rice appearing at
 *  both lunch and dinner is normal, the same dish twice is not. */
export function repeatedDishCount(candidate) {
  const seen = new Map();
  for (const meal of candidate.meals) {
    const id = meal.dish?.id;
    if (id) seen.set(id, (seen.get(id) || 0) + 1);
  }
  let repeats = 0;
  for (const count of seen.values()) if (count > 1) repeats += count - 1;
  return repeats;
}

function repeatedProteinCount(candidate) {
  const seen = new Map();
  for (const meal of candidate.meals) {
    for (const item of meal.items) {
      if (item.group === 'PROTEIN') seen.set(item.name, (seen.get(item.name) || 0) + 1);
    }
  }
  let repeats = 0;
  for (const count of seen.values()) if (count > 1) repeats += count - 1;
  return repeats;
}

/**
 * The repeat count that counts as a flaw for this candidate's mode. Used both
 * for scoring and for the "accurate AND varied, stop searching" gate.
 *
 * In dish mode the protein repeat is counted alongside the dish repeat because
 * the penalty alone cannot enforce variety: it is 0.01 against a macro distance
 * in the tens, so it only ever breaks ties between otherwise equal days. The
 * gate is what actually keeps searching, and without protein in it a day came
 * back as cháo gà for breakfast and gà xào for lunch — two distinct dishes,
 * one bird, twice.
 */
function candidateRepeats(candidate) {
  if (candidate.mode !== 'dish') return repeatedFoodCount(candidate);
  return repeatedDishCount(candidate) + repeatedProteinCount(candidate);
}

/** Lower is better. Accuracy dominates variety, with safety floors hard. */
function scoreCandidate(candidate, targets, weightKg) {
  const t = candidate.totals;
  let penalty = 0;
  const fatFloor = weightKg * SAFETY_FLOORS.fatPerKg;
  const carbFloor = weightKg * SAFETY_FLOORS.carbPerKg;
  if (t.fat < fatFloor) penalty += (fatFloor - t.fat) / fatFloor * 10000;
  if (t.carbs < carbFloor) penalty += (carbFloor - t.carbs) / carbFloor * 10000;
  penalty += candidateRepeats(candidate) * 0.01;
  // A repeated protein is a milder flaw than a repeated dish, but "gà trưa, gà
  // tối" still reads as a generator artefact rather than a plan someone wrote.
  if (candidate.mode === 'dish') penalty += repeatedProteinCount(candidate) * 0.005;
  return macroDistance(t, targets) + penalty;
}

/** Accuracy and safety only. Deliberately ignores repeated foods: a plan that
 *  hits the numbers must never be thrown away over a duplicate almond. */
function candidateAcceptable(candidate, targets, weightKg) {
  const t = candidate.totals;
  const epsilon = 1e-9;
  return Math.abs(t.protein - targets.protein) / targets.protein <= MEAL_ACCURACY_LIMITS.proteinRatio + epsilon
    && Math.abs(t.kcal - targets.kcal) / targets.kcal <= MEAL_ACCURACY_LIMITS.kcalRatio + epsilon
    && Math.abs(t.carbs - targets.carbs) <= MEAL_ACCURACY_LIMITS.carbsG + epsilon
    && Math.abs(t.fat - targets.fat) <= MEAL_ACCURACY_LIMITS.fatG + epsilon
    && t.fat >= weightKg * SAFETY_FLOORS.fatPerKg
    && t.carbs >= weightKg * SAFETY_FLOORS.carbPerKg;
}

function round1(value) { return Math.round(value * 10) / 10; }

export function mealPlanAccuracy(totals = {}, targets = {}) {
  const kcalPct = targets.kcal ? (Number(totals.kcal) - Number(targets.kcal)) / Number(targets.kcal) * 100 : 0;
  const proteinPct = targets.protein ? (Number(totals.protein) - Number(targets.protein)) / Number(targets.protein) * 100 : 0;
  const carbsG = Number(totals.carbs) - Number(targets.carbs);
  const fatG = Number(totals.fat) - Number(targets.fat);
  const checks = {
    kcal: Math.abs(kcalPct) <= MEAL_ACCURACY_LIMITS.kcalRatio * 100 + 1e-9,
    protein: Math.abs(proteinPct) <= MEAL_ACCURACY_LIMITS.proteinRatio * 100 + 1e-9,
    carbs: Math.abs(carbsG) <= MEAL_ACCURACY_LIMITS.carbsG + 1e-9,
    fat: Math.abs(fatG) <= MEAL_ACCURACY_LIMITS.fatG + 1e-9,
  };
  return {
    kcalPct: round1(kcalPct),
    proteinPct: round1(proteinPct),
    carbsG: round1(carbsG),
    fatG: round1(fatG),
    checks,
    meetsTargets: Object.values(checks).every(Boolean),
  };
}

function signatureOf(candidate) {
  // The dish id is part of the identity: two days can serve the same four
  // foods in two different dishes, and "Đổi thực đơn" has to count that as a
  // different day or the button appears to do nothing.
  return candidate.meals.map((m) => `${m.dish?.id || ''}${m.items.map((i) => i.name).join('+')}`).join('|');
}

function foodsOutsidePreferences(meals, preferredFoods, constrainedGroups) {
  const preferred = new Set(preferredFoods || []);
  const constrained = new Set(constrainedGroups || []);
  return [...new Set((meals || []).flatMap((meal) => meal.items || [])
    .filter((item) => constrained.has(item.group) && !preferred.has(item.name))
    .map((item) => item.name))];
}

function dishesOutsidePreferences(meals, preferredDishes) {
  const preferred = new Set(preferredDishes || []);
  if (!preferred.size) return [];
  return [...new Set((meals || []).map((meal) => meal.dish).filter(Boolean)
    .filter((dish) => !preferred.has(dish.id)).map((dish) => dish.name))];
}

/** The constraint report, in the one shape every return path uses. Built from
 *  whichever resolver ran, so a caller never has to know which mode produced
 *  the plan to read the report. */
function resolvedReport(resolved) {
  return {
    widened: resolved.widened || [],
    blocked: resolved.blocked || [],
    ignoredFoods: resolved.ignored || [],
    widenedDishSlots: resolved.widenedDishSlots || [],
    blockedDishSlots: resolved.blockedDishSlots || [],
    ignoredDishes: resolved.ignoredDishes || [],
  };
}

function describeGenerationGap(totals, targets, weightKg) {
  if (!totals) return 'không tìm thấy tổ hợp món an toàn trong giới hạn khẩu phần';
  const accuracy = mealPlanAccuracy(totals, targets);
  const gaps = [];
  const signed = (value, suffix) => `${value > 0 ? '+' : ''}${value}${suffix}`;
  if (!accuracy.checks.kcal) gaps.push(`calo ${signed(accuracy.kcalPct, '%')}`);
  if (!accuracy.checks.protein) gaps.push(`protein ${signed(accuracy.proteinPct, '%')}`);
  if (!accuracy.checks.carbs) gaps.push(`carb ${signed(accuracy.carbsG, ' g')}`);
  if (!accuracy.checks.fat) gaps.push(`fat ${signed(accuracy.fatG, ' g')}`);
  if (totals.fat < weightKg * SAFETY_FLOORS.fatPerKg) gaps.push('thiếu chất béo tối thiểu');
  if (totals.carbs < weightKg * SAFETY_FLOORS.carbPerKg) gaps.push('thiếu carb tối thiểu');
  return gaps.length ? gaps.join(', ') : 'không thể đồng thời đạt các giới hạn macro và khẩu phần thực tế';
}


/**
 * Search for a day, shared by both composition modes.
 *
 * `makeCandidate(count)` is the only difference between them: food mode draws
 * four foods per slot, dish mode draws a dish. Extracted so the two modes
 * cannot drift in how hard they search or when they stop — which they would,
 * because this loop holds every rule about accuracy beating variety.
 *
 * Stops as soon as a day is both accurate and varied. If only a repeating day
 * can hit the numbers, it keeps searching for a clean one but holds on to that
 * day — shipping an accurate plan with a duplicate almond beats shipping
 * nothing.
 */
function searchForDay({ targets, weightKg, mealCount, avoidSignature, attemptsPerMealCount, makeCandidate }) {
  let best = null;              // best-scoring candidate seen, accurate or not
  let bestScore = Infinity;
  let acceptable = null;        // hits the macros, but may repeat
  let acceptableMealCount = mealCount;
  let ideal = null;             // hits the macros AND repeats nothing
  let usedMealCount = mealCount;

  for (let count = mealCount; count <= 6 && !ideal; count++) {
    const shortlist = [];
    for (let attempt = 0; attempt < attemptsPerMealCount; attempt++) {
      const candidate = makeCandidate(count);
      // Null means this slot type has no dish left at all, which resolveDishes
      // has already reported as blocked. Retrying cannot change that.
      if (!candidate) break;
      if (avoidSignature && signatureOf(candidate) === avoidSignature) continue;
      const score = scoreCandidate(candidate, targets, weightKg);
      shortlist.push({ candidate, score });
      shortlist.sort((a, b) => a.score - b.score);
      if (shortlist.length > 80) shortlist.pop();
    }
    // Tight optimisation is deliberately limited to the best layouts. Running
    // it on every random attempt made the browser pause for seconds.
    for (const entry of shortlist) {
      const candidate = optimiseCandidate(entry.candidate, targets);
      const score = scoreCandidate(candidate, targets, weightKg);
      if (score < bestScore) { bestScore = score; best = candidate; usedMealCount = count; }
      if (!candidateAcceptable(candidate, targets, weightKg)) continue;
      if (!acceptable) { acceptable = candidate; acceptableMealCount = count; }
      if (candidateRepeats(candidate) === 0) { ideal = candidate; usedMealCount = count; break; }
    }
  }

  const chosen = ideal || acceptable || best;
  if (!ideal && acceptable) usedMealCount = acceptableMealCount;
  return { chosen, usedMealCount };
}

/**
 * Build a day of food that hits the given macro targets.
 *
 * Tries up to 400 random combinations per meal count, and will raise the meal
 * count (up to 6) if the requested number cannot physically hold the calories
 * within sane portion sizes.
 *
 * `composition` chooses what a meal is made of:
 *   'dish' — real Vietnamese dishes with a cook note (nutrition-dishes.js).
 *   'food' — the original behaviour: four foods per slot from MEAL_POOLS.
 * Default is 'food' so nothing that called this before behaves differently.
 *
 * @returns {{ok: boolean, meals: Array, totals: Object, usedMealCount: number,
 *   accuracy: Object, reason: string|null}}
 */
export function buildGramMealPlan({
  targets,
  weightKg,
  mealCount = 4,
  goalType = 'maintain',
  avoidSignature = null,
  preferredFoods = [],
  avoidedFoods = [],
  composition = 'food',
  preferredDishes = [],
  avoidedDishes = [],
  random = Math.random,
  attemptsPerMealCount = 400,
} = {}) {
  const useDishes = composition === 'dish';
  const weight = Number(weightKg) || 0;
  const safeTargets = {
    kcal: Number(targets?.kcal) || 0,
    protein: Number(targets?.protein) || 0,
    carbs: Number(targets?.carbs) || 0,
    fat: Number(targets?.fat) || 0,
  };
  if (!weight || !safeTargets.kcal || !safeTargets.protein) {
    return {
      ok: false, meals: [], totals: null, usedMealCount: mealCount, composition,
      accuracy: null, widened: [], blocked: [], ignoredFoods: [], fallbackFoods: [],
      widenedDishSlots: [], blockedDishSlots: [], ignoredDishes: [], fallbackDishes: [],
      reason: 'Cần cân nặng, mục tiêu kcal và protein trước khi sinh thực đơn.',
    };
  }

  // Narrow the library to this client before a single day is attempted, so an
  // avoided food cannot reach the plate through any code path below.
  const resolved = useDishes
    ? resolveDishes({ preferred: preferredFoods, avoided: avoidedFoods, preferredDishes, avoidedDishes })
    : resolvePools({ preferred: preferredFoods, avoided: avoidedFoods });
  if (resolved.blocked?.length || resolved.blockedDishSlots?.length) {
    const { blockedGroups, blockedSlots } = describePoolFallbacks(resolved);
    return {
      ok: false, meals: [], totals: null, usedMealCount: mealCount, composition,
      accuracy: null, ...resolvedReport(resolved), fallbackFoods: [], fallbackDishes: [],
      reason: useDishes
        ? `Danh sách cần tránh đã loại hết món ở ${blockedSlots.join(', ')}. Bỏ bớt một món cần tránh, bỏ tick bớt ở danh sách món, hoặc chuyển sang ghép theo nhóm thực phẩm.`
        : `Danh sách cần tránh đã loại hết món ở nhóm ${blockedGroups.join(', ')}. Bỏ bớt một món trong danh sách tránh, hoặc soạn tay bữa đó.`,
    };
  }

  const { chosen, usedMealCount } = searchForDay({
    targets: safeTargets, weightKg: weight, mealCount, avoidSignature, attemptsPerMealCount,
    makeCandidate: (count) => (useDishes
      ? buildDishCandidate({ targets: safeTargets, mealCount: count, goalType, random, dishPools: resolved.pools })
      : buildCandidate({ targets: safeTargets, weightKg: weight, mealCount: count, goalType, random, pools: resolved.pools })),
  });

  if (!chosen || !candidateAcceptable(chosen, safeTargets, weight)) {
    // Preferred foods and dishes are an adherence signal, not an allergy
    // whitelist. If the preferred-only attempt cannot satisfy the targets,
    // retry once with the full safe library. Avoided items remain removed in
    // both passes, and the report says where the plan left the list.
    if (resolved.constrainedGroups.length || resolved.dishConstrained) {
      const fallback = buildGramMealPlan({
        targets: safeTargets, weightKg: weight, mealCount, goalType, composition,
        avoidSignature, preferredFoods: [], avoidedFoods,
        preferredDishes: [], avoidedDishes, random, attemptsPerMealCount,
      });
      const fallbackFoods = foodsOutsidePreferences(fallback.meals, preferredFoods, resolved.constrainedGroups);
      const fallbackDishes = dishesOutsidePreferences(fallback.meals, preferredDishes);
      return {
        ...fallback,
        ...resolvedReport(resolved),
        fallbackFoods,
        fallbackDishes,
        preferenceFallbackUsed: fallbackFoods.length > 0 || fallbackDishes.length > 0,
        ...(fallback.ok ? { honouredPreferences: false } : {}),
      };
    }
    const accuracy = chosen ? mealPlanAccuracy(chosen.totals, safeTargets) : null;
    return {
      ok: false, meals: chosen ? chosen.meals : [], totals: chosen ? chosen.totals : null, usedMealCount, composition,
      signature: chosen ? signatureOf(chosen) : '', repeatedFoods: chosen ? repeatedFoodCount(chosen) : 0,
      repeatedDishes: chosen ? repeatedDishCount(chosen) : 0,
      accuracy, meetsTargets: false,
      ...resolvedReport(resolved), fallbackFoods: [], fallbackDishes: [],
      preferenceFallbackUsed: false,
      reason: useDishes
        ? `Phương án gần nhất vẫn còn lệch: ${describeGenerationGap(chosen?.totals, safeTargets, weight)}. Hãy bỏ tick bớt món để hệ thống có nhiều lựa chọn hơn, hoặc chuyển sang ghép theo nhóm thực phẩm.`
        : `Phương án gần nhất vẫn còn lệch: ${describeGenerationGap(chosen?.totals, safeTargets, weight)}. Hãy thêm món cân macro, đổi món hoặc để David chỉnh mục tiêu.`,
    };
  }

  const fallbackFoods = foodsOutsidePreferences(chosen.meals, preferredFoods, resolved.constrainedGroups);
  const fallbackDishes = dishesOutsidePreferences(chosen.meals, preferredDishes);

  return {
    ok: true,
    meals: chosen.meals,
    totals: chosen.totals,
    usedMealCount,
    composition,
    signature: signatureOf(chosen),
    repeatedFoods: repeatedFoodCount(chosen),
    repeatedDishes: repeatedDishCount(chosen),
    ...resolvedReport(resolved),
    fallbackFoods,
    fallbackDishes,
    preferenceFallbackUsed: fallbackFoods.length > 0 || fallbackDishes.length > 0,
    honouredPreferences: (resolved.constrainedGroups.length > 0 || resolved.dishConstrained === true)
      && fallbackFoods.length === 0 && fallbackDishes.length === 0,
    accuracy: mealPlanAccuracy(chosen.totals, safeTargets),
    meetsTargets: true,
    reason: null,
  };
}

/**
 * Convert a generated meal into the shape nutrition-engine.js / the saved plan
 * already uses, so gram plans and descriptive plans stay interchangeable and
 * older saved plans keep rendering.
 *
 * A dish-mode meal gets two extra lines in `items`: the dish name at the top
 * and the cook note at the bottom. They are plain text on purpose — `items` is
 * a string array that the coach edits in a textarea and that the student view
 * renders as a bullet list, so a dish name needs no new field anywhere to show
 * up in both. parseGramItems skips any line that does not name a food followed
 * by grams, which is exactly what these two are, so they never affect the
 * stored macros.
 */
export function gramMealToPlanMeal(meal, index, presetMeal, sex) {
  const kcal = Math.round(meal.items.reduce((sum, i) => sum + i.kcal, 0));
  const round1 = (v) => Math.round(v * 10) / 10;
  return {
    id: presetMeal?.id || `meal-${index + 1}`,
    name: meal.name,
    time: presetMeal?.time || '',
    kcal,
    protein: round1(meal.items.reduce((sum, i) => sum + i.protein, 0)),
    carbs: round1(meal.items.reduce((sum, i) => sum + i.carbs, 0)),
    fat: round1(meal.items.reduce((sum, i) => sum + i.fat, 0)),
    dish: meal.dish || null,
    items: [
      ...(meal.dish ? [`${meal.dish.name}${meal.dish.kind === 'buy' ? ' (mua sẵn được)' : ''}`] : []),
      ...meal.items.map((item) => {
        const hand = handPortions(item, sex);
        return `${item.name} — ${item.grams} g${hand ? ` (≈ ${hand.count} ${hand.unit})` : ''}`;
      }),
      ...(meal.dish?.cook ? [`Cách làm: ${meal.dish.cook}`] : []),
    ],
    gramItems: meal.items.map((item) => ({
      name: item.name, group: item.group, grams: item.grams,
      kcal: Math.round(item.kcal), protein: round1(item.protein),
      carbs: round1(item.carbs), fat: round1(item.fat),
    })),
  };
}

export { FOODS };

/**
 * Suggested clock times for each meal, derived from when the client actually
 * wakes up rather than from a fixed 07:00 breakfast.
 *
 * A client who wakes at 05:00 for a 6am shift and one who wakes at 10:00 do
 * not eat on the same schedule, and handing both the same 07:00/12:00/16:30/
 * 19:30 grid is the fastest way to have a plan ignored. These are only a
 * starting point — the coach edits every time before sending, because real
 * schedules have meetings, commutes and shift work in them that no formula
 * can guess.
 *
 * First meal lands 30 minutes after waking; the rest are spaced evenly with a
 * gap that tightens as meal count rises, and rounded to the quarter hour.
 */
const MEAL_GAP_MINUTES = Object.freeze({ 2: 420, 3: 300, 4: 225, 5: 180, 6: 150 });

export function parseClock(value) {
  const match = /^(\d{1,2})\s*[:h]\s*(\d{2})?$/.exec(String(value || '').trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatClock(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

export function suggestMealTimes({ wakeTime = '', mealCount = 4 } = {}) {
  const wake = parseClock(wakeTime);
  if (wake === null) return null;
  const count = Math.max(2, Math.min(6, Number(mealCount) || 4));
  const gap = MEAL_GAP_MINUTES[count];
  const times = [];
  for (let index = 0; index < count; index++) {
    const raw = wake + 30 + gap * index;
    times.push(formatClock(Math.round(raw / 15) * 15));
  }
  return times;
}
