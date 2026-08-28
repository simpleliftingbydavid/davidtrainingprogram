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

import { FOODS, MEAL_POOLS, getFood, HAND_PORTIONS } from './nutrition-foods.js';

export const MEAL_BUILDER_VERSION = '1.0.0';

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

function roundGrams(grams, max) {
  const step = max > 50 ? 5 : 1;
  return Math.round(grams / step) * step;
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
function pickUnused(list, used, random) {
  if (!list.length) return null;
  const fresh = list.filter((option) => !used.has(option.name));
  const chosen = pick(fresh.length ? fresh : list, random);
  used.add(chosen.name);
  return chosen;
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
function selectionOrder(split) {
  const countByType = {};
  for (const slot of split) countByType[slot.type] = (countByType[slot.type] || 0) + 1;
  const contentionByType = {};
  for (const type of Object.keys(countByType)) {
    const pool = MEAL_POOLS[type];
    const sizes = ['P', 'F', 'C'].map((group) => pool[group].length).filter((size) => size > 0);
    contentionByType[type] = Math.min(...sizes) / countByType[type];
  }
  return split
    .map((slot, index) => ({ slot, index }))
    .sort((a, b) => contentionByType[a.slot.type] - contentionByType[b.slot.type] || a.index - b.index);
}

function buildCandidate({ targets, weightKg, mealCount, goalType, random }) {
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
  for (const { slot, index } of selectionOrder(split)) {
    const pool = MEAL_POOLS[slot.type];
    picksByIndex[index] = {
      veg: slot.type === 'chinh' && pool.R.length ? pickUnused(pool.R, usedFoods, random) : null,
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
      [pFood, clamp(roundGrams(grams[0], pOpt.max), pOpt.min, pOpt.max)],
      [cFood, clamp(roundGrams(grams[2], cOpt.max), cOpt.min, cOpt.max)],
      [fFood, clamp(roundGrams(grams[1], fOpt.max), fOpt.min, fOpt.max)],
    ];
    if (vegFood) chosen.push([vegFood, vegGrams]);

    for (const [foodItem, gramAmount] of chosen) {
      const k = gramAmount / 100;
      items.push({
        name: foodItem.name,
        group: foodItem.group,
        grams: gramAmount,
        kcal: foodItem.kcal * k,
        carbs: foodItem.carb * k,
        fat: foodItem.fat * k,
        protein: foodItem.protein * k,
      });
      totals.kcal += foodItem.kcal * k;
      totals.carbs += foodItem.carb * k;
      totals.fat += foodItem.fat * k;
      totals.protein += foodItem.protein * k;
      totals.fiber += foodItem.fiber * k;
    }
    meals.push({ name: slot.name, type: slot.type, items });
  }
  return { meals, totals };
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

/** Lower is better. Protein error is weighted double because under-eating
 *  protein is the failure that actually costs muscle; calorie error is more
 *  forgiving. Breaching a safety floor is penalised hard. Repeated foods carry
 *  a small penalty — enough to prefer a varied day, small enough that it never
 *  outranks hitting the macros. */
function scoreCandidate(candidate, targets, weightKg) {
  const t = candidate.totals;
  const kcalError = Math.abs(t.kcal - targets.kcal) / targets.kcal;
  const proteinError = Math.abs(t.protein - targets.protein) / targets.protein;
  let penalty = 0;
  const fatFloor = weightKg * SAFETY_FLOORS.fatPerKg;
  const carbFloor = weightKg * SAFETY_FLOORS.carbPerKg;
  if (t.fat < fatFloor) penalty += (fatFloor - t.fat) / fatFloor * 2;
  if (t.carbs < carbFloor) penalty += (carbFloor - t.carbs) / carbFloor * 2;
  penalty += repeatedFoodCount(candidate) * 0.05;
  return kcalError + 2 * proteinError + penalty;
}

/** Accuracy and safety only. Deliberately ignores repeated foods: a plan that
 *  hits the numbers must never be thrown away over a duplicate almond. */
function candidateAcceptable(candidate, targets, weightKg) {
  const t = candidate.totals;
  return Math.abs(t.protein - targets.protein) / targets.protein <= 0.05
    && Math.abs(t.kcal - targets.kcal) / targets.kcal <= 0.07
    && t.fat >= weightKg * SAFETY_FLOORS.fatPerKg
    && t.carbs >= weightKg * SAFETY_FLOORS.carbPerKg;
}

function signatureOf(candidate) {
  return candidate.meals.map((m) => m.items.map((i) => i.name).join('+')).join('|');
}

/** Grams of each food expressed as hand-sized portions, for clients who will
 *  not weigh anything. */
export function handPortions(item, sex) {
  const table = HAND_PORTIONS[sex === 'female' ? 'female' : 'male'];
  if (item.group === 'PROTEIN' && item.protein > 0) return { count: Math.round(item.protein / table.PROTEIN * 10) / 10, unit: 'phần đạm' };
  if (item.group === 'CARB' && item.carbs > 0) return { count: Math.round(item.carbs / table.CARB * 10) / 10, unit: 'phần tinh bột' };
  if (item.group === 'FAT' && item.fat > 0) return { count: Math.round(item.fat / table.FAT * 10) / 10, unit: 'phần béo' };
  if (item.group === 'RAU') return { count: Math.round(item.grams / table.RAU * 10) / 10, unit: 'phần rau' };
  return null;
}

/**
 * Build a day of food that hits the given macro targets.
 *
 * Tries up to 400 random food combinations per meal count, and will raise the
 * meal count (up to 6) if the requested number cannot physically hold the
 * calories within sane portion sizes.
 *
 * @returns {{ok: boolean, meals: Array, totals: Object, usedMealCount: number,
 *   accuracy: {kcalPct: number, proteinPct: number}, reason: string|null}}
 */
export function buildGramMealPlan({
  targets,
  weightKg,
  mealCount = 4,
  goalType = 'maintain',
  avoidSignature = null,
  random = Math.random,
  attemptsPerMealCount = 400,
} = {}) {
  const weight = Number(weightKg) || 0;
  const safeTargets = {
    kcal: Number(targets?.kcal) || 0,
    protein: Number(targets?.protein) || 0,
    carbs: Number(targets?.carbs) || 0,
    fat: Number(targets?.fat) || 0,
  };
  if (!weight || !safeTargets.kcal || !safeTargets.protein) {
    return {
      ok: false, meals: [], totals: null, usedMealCount: mealCount,
      accuracy: null,
      reason: 'Cần cân nặng, mục tiêu kcal và protein trước khi sinh thực đơn.',
    };
  }

  let best = null;              // best-scoring candidate seen, accurate or not
  let bestScore = Infinity;
  let acceptable = null;        // hits the macros, but may repeat a food
  let acceptableMealCount = mealCount;
  let ideal = null;             // hits the macros AND serves no food twice
  let usedMealCount = mealCount;

  // Stop as soon as a day is both accurate and varied. If only a repeating day
  // can hit the numbers, keep searching for a clean one but hold on to it —
  // shipping an accurate plan with a duplicate almond beats shipping nothing.
  for (let count = mealCount; count <= 6 && !ideal; count++) {
    for (let attempt = 0; attempt < attemptsPerMealCount; attempt++) {
      const candidate = buildCandidate({ targets: safeTargets, weightKg: weight, mealCount: count, goalType, random });
      if (avoidSignature && signatureOf(candidate) === avoidSignature) continue;
      const score = scoreCandidate(candidate, safeTargets, weight);
      if (score < bestScore) { bestScore = score; best = candidate; usedMealCount = count; }
      if (!candidateAcceptable(candidate, safeTargets, weight)) continue;
      if (!acceptable) { acceptable = candidate; acceptableMealCount = count; }
      if (repeatedFoodCount(candidate) === 0) { ideal = candidate; usedMealCount = count; break; }
    }
  }

  const chosen = ideal || acceptable || best;
  if (!ideal && acceptable) usedMealCount = acceptableMealCount;
  if (!chosen || !candidateAcceptable(chosen, safeTargets, weight)) {
    return {
      ok: false, meals: [], totals: chosen ? chosen.totals : null, usedMealCount,
      accuracy: null,
      reason: `Mục tiêu ${Math.round(safeTargets.kcal)} kcal với ${Math.round(safeTargets.protein)} g đạm nằm ngoài khoảng bộ món hiện có ghép được (khoảng 1.200–4.100 kcal ở mức đạm thông thường). Chỉnh lại mục tiêu hoặc soạn tay từng bữa.`,
    };
  }

  return {
    ok: true,
    meals: chosen.meals,
    totals: chosen.totals,
    usedMealCount,
    signature: signatureOf(chosen),
    repeatedFoods: repeatedFoodCount(chosen),
    accuracy: {
      kcalPct: Math.round((chosen.totals.kcal - safeTargets.kcal) / safeTargets.kcal * 1000) / 10,
      proteinPct: Math.round((chosen.totals.protein - safeTargets.protein) / safeTargets.protein * 1000) / 10,
    },
    reason: null,
  };
}

/** Convert a generated meal into the shape nutrition-engine.js / the saved
 *  plan already uses, so gram plans and descriptive plans stay interchangeable
 *  and older saved plans keep rendering. */
export function gramMealToPlanMeal(meal, index, presetMeal, sex) {
  const kcal = Math.round(meal.items.reduce((sum, i) => sum + i.kcal, 0));
  const round1 = (v) => Math.round(v * 10) / 10;
  return {
    id: presetMeal?.id || `meal-${index + 1}`,
    name: meal.name,
    time: presetMeal?.time || '',
    kcal,
    protein: Math.round(meal.items.reduce((sum, i) => sum + i.protein, 0)),
    carbs: Math.round(meal.items.reduce((sum, i) => sum + i.carbs, 0)),
    fat: Math.round(meal.items.reduce((sum, i) => sum + i.fat, 0)),
    items: meal.items.map((item) => {
      const hand = handPortions(item, sex);
      return `${item.name} — ${item.grams} g${hand ? ` (≈ ${hand.count} ${hand.unit})` : ''}`;
    }),
    gramItems: meal.items.map((item) => ({
      name: item.name, group: item.group, grams: item.grams,
      kcal: Math.round(item.kcal), protein: round1(item.protein),
      carbs: round1(item.carbs), fat: round1(item.fat),
    })),
  };
}

export { FOODS };
