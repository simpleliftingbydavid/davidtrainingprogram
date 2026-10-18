// ============================================================
// DAVID TRAINING PROGRAM — Building a week of meals
// ============================================================
// A layer above the day generator, not a change to it: buildGramMealPlan still solves one
// day and still decides whether that day hits the macros. This module only decides, day by
// day, which dishes that day may or should use, so that seven days make a week a person
// would cook: not the same breakfast seven times, and not twenty-eight dishes to shop for
// either.
//
// WHY A LAYER AND NOT SEVEN INDEPENDENT DAYS: generated one at a time, the days repeat
// heavily, because a client's targets leave few dishes that fit. A 1500 kcal client measured
// six dishes in the whole week and the same breakfast all seven days. Telling each day what
// the week has already served fixes that with the dish library as it is.
//
// The coach's own lists always win: a dish or food the client avoids is never served on any
// day, at any level of relaxing below.
//
// Pure: no DOM, no Firebase. `random` is injected so a week can be reproduced in a test.

import { buildGramMealPlan, gramMealToPlanMeal, mealSplit, suggestMealTimes } from './nutrition-meal-builder.js';
import { DISHES, DISHES_BY_MEAL_TYPE, MEAL_MENUS } from './nutrition-dishes.js';
import { proteinFamily } from './nutrition-foods.js';
import { WEEK_DAYS, weekVariety } from './nutrition-week-utils.js';

const SLOT_TYPES = MEAL_MENUS;

/**
 * Variety in what is underneath the dishes, too (David, 2026-10-18): "cá basa sốt cà" and
 * "cá basa hấp" are two dishes but one fish. A week gives each kind of protein at most
 * PROTEIN_FAMILY_CAP of its home lunches and dinners; cuts of one animal count together.
 * A soft rule: when the client's lists leave too few kinds, the day is allowed three of one,
 * and only then any number, so a day is never lost to it.
 */
export const PROTEIN_FAMILY_CAP = 2;
const RELAXED_FAMILY_CAP = 3;
export { proteinFamily };

const HOME_MEAL_IDS = new Set([...DISHES_BY_MEAL_TYPE.trua, ...DISHES_BY_MEAL_TYPE.toi].map((dish) => dish.id));
const FAMILIES_OF = new Map(DISHES.map((dish) => [dish.id, [...new Set(dish.proteinOptions.map((option) => proteinFamily(option.name)))]]));

/** Home lunch and dinner dishes the week can no longer afford: every protein they could be
 *  made with is a kind the other days already serve `cap` times. */
function familyCappedDishes(idLists, cap) {
  const counts = new Map();
  for (const ids of idLists) {
    for (const id of ids || []) {
      if (!HOME_MEAL_IDS.has(id)) continue;
      for (const family of FAMILIES_OF.get(id) || []) counts.set(family, (counts.get(family) || 0) + 1);
    }
  }
  return [...HOME_MEAL_IDS].filter((id) => (FAMILIES_OF.get(id) || []).every((family) => (counts.get(family) || 0) >= cap));
}
const round1 = (value) => Math.round(value * 10) / 10;

// The ordered-out lunch counts too, so the shop dishes vary across the week like the rest.
const dishIdsOf = (result) => (result?.meals || [])
  .flatMap((meal) => [meal.dish?.id, meal.alternative?.dish?.id]).filter(Boolean);

function countDishes(dishIdLists) {
  const counts = new Map();
  for (const ids of dishIdLists) for (const id of ids || []) counts.set(id, (counts.get(id) || 0) + 1);
  return counts;
}

/** How many meals of each menu a day of `mealCount` meals has. */
function slotsPerType(mealCount) {
  const slots = {};
  for (const slot of mealSplit(mealCount)) slots[slot.menu] = (slots[slot.menu] || 0) + 1;
  return slots;
}

/**
 * The dishes a day should lean towards, so the week repeats on purpose.
 *
 * A dish preference binds per slot type in the day generator: naming breakfast dishes says
 * nothing about dinner. So this is worked out per slot type too. A slot type is steered
 * towards dishes the week already uses only when there are enough of them to leave the day
 * a real choice (one more than the slots to fill); otherwise that slot type keeps the
 * client's own picks, or stays open.
 */
function preferredForDay(reuseIds, clientPreferred, mealCount) {
  if (!reuseIds.length) return clientPreferred;
  const reuse = new Set(reuseIds);
  const client = new Set(clientPreferred);
  const needed = slotsPerType(mealCount);
  const preferred = new Set();
  for (const type of SLOT_TYPES) {
    const ids = DISHES_BY_MEAL_TYPE[type].map((dish) => dish.id);
    const reusable = ids.filter((id) => reuse.has(id));
    // A shop lunch saves nothing by repeating (nothing is bought for it), so only home menus
    // are steered towards the week's dishes; the shop lunch keeps the client's own picks.
    const enough = type !== 'ngoai' && reusable.length >= (needed[type] || 0) + 1;
    (enough ? reusable : ids.filter((id) => client.has(id))).forEach((id) => preferred.add(id));
  }
  return [...preferred];
}

/**
 * The attempts for one day, strictest first. Each is { preferredDishes, avoidedDishes }.
 * The last one asks for nothing beyond the client's own lists, so a day is always produced
 * when the client's lists allow one at all.
 */
function attemptsForDay({
  dayIndex, counts, previousIds, nextIds, ownIds, level, clientPreferred, clientAvoided, mealCount, otherDays = [],
}) {
  const used = [...counts.keys()];
  const atCap = used.filter((id) => counts.get(id) >= level.maxPerWeek);
  const neighbours = level.allowAdjacent ? [] : [...new Set([...previousIds, ...nextIds])];
  const reuseActive = level.reuseFromDay !== null && dayIndex >= level.reuseFromDay;
  const blocked = new Set([...atCap, ...neighbours, ...ownIds]);
  const reuseIds = reuseActive ? used.filter((id) => !blocked.has(id)) : [];
  const withClient = (ids) => [...new Set([...clientAvoided, ...ids])];

  const attempts = [];
  // The protein rule binds first at two meals of a kind, then at three, then not at all. A
  // new dish is tried at both before a dish already in the week is repeated: a third chicken
  // dinner in a new dish reads fresher than the same dish again.
  const families = [familyCappedDishes(otherDays, PROTEIN_FAMILY_CAP), familyCappedDishes(otherDays, RELAXED_FAMILY_CAP)];
  for (const capped of families) {
    if (reuseIds.length) {
      const reusable = reuseIds.filter((id) => !capped.includes(id));
      attempts.push({ preferredDishes: preferredForDay(reusable, clientPreferred, mealCount), avoidedDishes: withClient([...blocked, ...capped]) });
    }
    // Unless the level repeats on purpose, a day takes a new dish wherever one fits.
    if (!reuseActive) attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...used, ...ownIds, ...capped]) });
  }
  for (const capped of families) attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...blocked, ...capped]) });
  if (!reuseActive) attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...used, ...ownIds]) });
  attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...blocked]) });
  attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...neighbours, ...ownIds]) });
  attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient(ownIds) });
  attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([]) });

  const seen = new Set();
  return attempts.filter((attempt) => {
    const key = `${[...attempt.preferredDishes].sort().join(',')}|${[...attempt.avoidedDishes].sort().join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function solveDay({ base, attempts, avoidSignature = null }) {
  let last = null;
  let accurate = null;
  let extraMeal = null;
  for (let index = 0; index < attempts.length; index += 1) {
    const result = buildGramMealPlan({ ...base, ...attempts[index], avoidSignature });
    last = { result, relaxed: index };
    if (!result.ok) continue;
    // The day generator adds a meal when the requested number cannot carry the targets. With
    // the week's dishes held back that can happen only because of the week's own rules, and a
    // client who eats two meals should not find a third on Saturday: a looser attempt that
    // keeps the meal count wins over it.
    if (result.usedMealCount > base.mealCount) {
      if (!extraMeal) extraMeal = last;
      continue;
    }
    // A day that hits the numbers by serving one dish at two of its meals is kept in hand,
    // but a looser attempt is still tried: the same dish at lunch and dinner reads worse
    // than a dish that also appeared earlier in the week.
    if (!result.repeatedDishes) return last;
    if (!accurate) accurate = last;
  }
  return accurate || extraMeal || last;
}

/** A day in ingredient mode has no dishes to steer by, so the week only refuses to serve the
 *  very same day twice. */
function solveFoodDay({ base, signatures, avoidSignature = null }) {
  let result = buildGramMealPlan({ ...base, avoidSignature });
  for (let tries = 0; tries < 4 && result.ok && signatures.has(result.signature); tries += 1) {
    result = buildGramMealPlan({ ...base, avoidSignature: result.signature });
  }
  return { result, relaxed: 0 };
}

function baseOptions(options) {
  const {
    targets, weightKg, mealCount = 4, goalType = 'maintain', composition = 'dish',
    preferredFoods = [], avoidedFoods = [], random = Math.random, attemptsPerMealCount,
  } = options;
  return {
    targets, weightKg, mealCount, goalType, composition, preferredFoods, avoidedFoods, random,
    // The client's own avoided dishes. Each attempt below adds dishes the week would rather
    // not repeat; this keeps the ordered-out lunch from running out because of those.
    hardAvoidedDishes: options.avoidedDishes || [],
    ...(attemptsPerMealCount ? { attemptsPerMealCount } : {}),
  };
}

/**
 * Seven days, Monday to Sunday.
 *
 * @returns {{ ok: boolean, variety: string, days: Array<{id, label, result, relaxed}> }}
 *   `ok` is true only when every day hits its targets. `result` is exactly what
 *   buildGramMealPlan returned for that day; `relaxed` is how far the week's own rules had
 *   to be loosened for it (0 = not at all).
 */
export function buildWeekMenu(options = {}) {
  const level = weekVariety(options.variety);
  const base = baseOptions(options);
  const clientPreferred = options.preferredDishes || [];
  const clientAvoided = options.avoidedDishes || [];
  const dishMode = base.composition === 'dish';
  const days = [];
  const signatures = new Set();

  for (let dayIndex = 0; dayIndex < WEEK_DAYS.length; dayIndex += 1) {
    let solved;
    if (dishMode) {
      const lists = days.map((day) => dishIdsOf(day.result));
      solved = solveDay({
        base,
        attempts: attemptsForDay({
          dayIndex, counts: countDishes(lists), level, clientPreferred, clientAvoided, mealCount: base.mealCount,
          otherDays: lists,
          previousIds: lists[dayIndex - 1] || [],
          // The week repeats, so Sunday is followed by Monday again.
          nextIds: dayIndex === WEEK_DAYS.length - 1 ? lists[0] || [] : [],
          ownIds: [],
        }),
      });
    } else {
      solved = solveFoodDay({ base: { ...base, preferredDishes: clientPreferred, avoidedDishes: clientAvoided }, signatures });
    }
    if (solved.result.signature) signatures.add(solved.result.signature);
    days.push({ ...WEEK_DAYS[dayIndex], result: solved.result, relaxed: solved.relaxed });
  }
  return { ok: days.every((day) => day.result.ok), variety: level.id, days };
}

/**
 * One day again, leaving the other six as they are: different dishes from the ones it has
 * now, and still fitting the rest of the week.
 *
 * @param {Array<{dishIds: string[], signature?: string}>} options.week what the seven days
 *   currently serve, Monday first
 */
export function rebuildWeekDay(options = {}) {
  const level = weekVariety(options.variety);
  const base = baseOptions(options);
  const week = options.week || [];
  const dayIndex = Math.max(0, Math.min(WEEK_DAYS.length - 1, Number(options.dayIndex) || 0));
  const current = week[dayIndex] || {};
  if (base.composition !== 'dish') {
    const signatures = new Set(week.map((day) => day?.signature).filter(Boolean));
    return solveFoodDay({
      base: { ...base, preferredDishes: options.preferredDishes || [], avoidedDishes: options.avoidedDishes || [] },
      signatures, avoidSignature: current.signature || null,
    });
  }
  const others = week.map((day, index) => (index === dayIndex ? [] : day?.dishIds || []));
  const last = WEEK_DAYS.length - 1;
  return solveDay({
    base,
    avoidSignature: current.signature || null,
    attempts: attemptsForDay({
      dayIndex, counts: countDishes(others), level, mealCount: base.mealCount, otherDays: others,
      clientPreferred: options.preferredDishes || [], clientAvoided: options.avoidedDishes || [],
      previousIds: others[dayIndex === 0 ? last : dayIndex - 1] || [],
      nextIds: others[dayIndex === last ? 0 : dayIndex + 1] || [],
      ownIds: current.dishIds || [],
    }),
  });
}

/** What the builder keeps about how a generated day was put together and how close it came. */
export function gramPlanMeta(result, style = 'grams') {
  return {
    signature: result.signature,
    usedMealCount: result.usedMealCount,
    accuracy: result.accuracy,
    meetsTargets: result.ok,
    reason: result.reason || null,
    fallbackFoods: result.fallbackFoods || [],
    fallbackDishes: result.fallbackDishes || [],
    composition: result.composition || 'food',
    dishes: result.meals.map((meal) => meal.dish?.name || '').filter(Boolean),
    // Ids, so a later "change this day" knows what the other days serve even after the plan
    // was saved and reopened. Only ever a hint for variety, never a claim about the text.
    dishIds: dishIdsOf(result),
    style,
    totals: {
      kcal: round1(result.totals.kcal),
      protein: round1(result.totals.protein),
      carbs: round1(result.totals.carbs),
      fat: round1(result.totals.fat),
      fiber: round1(result.totals.fiber),
    },
  };
}

/**
 * A generated day in the shape the saved plan uses: { id, meals, gramPlan }.
 * `presetMeals` are the descriptive plan's meals, whose ids and times the day inherits, so a
 * week's days line up with the single-day plan they replace.
 */
export function planDayFromResult(result, { dayId, sex = '', wakeTime = '', style = 'grams', presetMeals = [] } = {}) {
  const meals = result.meals.map((meal, index) => gramMealToPlanMeal(meal, index, presetMeals[index], sex));
  const times = suggestMealTimes({ wakeTime, mealCount: meals.length });
  if (times) meals.forEach((meal, index) => { if (times[index]) meal.time = times[index]; });
  return { id: dayId, meals, gramPlan: gramPlanMeta(result, style) };
}
