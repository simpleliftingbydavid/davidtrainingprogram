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
  // Only once no new dish fits at any of those does a day repeat one from earlier in the week.
  if (!reuseActive) attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...used, ...ownIds]) });
  for (const capped of families) attempts.push({ preferredDishes: clientPreferred, avoidedDishes: withClient([...blocked, ...capped]) });
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

/** Dishes one more day would put past the level's limit: already on its most days, or
 *  (unless the level allows it) on the day before or after. */
function weekLimitedDishes({ counts, previousIds, nextIds, level }) {
  const atCap = [...counts.keys()].filter((id) => counts.get(id) >= level.maxPerWeek);
  const neighbours = level.allowAdjacent ? [] : [...previousIds, ...nextIds];
  return [...new Set([...atCap, ...neighbours])];
}

/** How many of a day's dishes another day also serves, against the closest other day. */
function overlapWithWeek(result, otherDays) {
  const ids = new Set((result?.meals || []).map((meal) => meal.dish?.id).filter(Boolean));
  return Math.max(0, ...otherDays.map((list) => (list || []).filter((id) => ids.has(id)).length));
}

/** Every dish of the day is on one other day: the same day again. */
function isCopyOfWeekDay(result, otherDays) {
  // The home dishes only: the ordered-out lunch does not make a day different to eat at home.
  const ids = (result?.meals || []).map((meal) => meal.dish?.id).filter(Boolean);
  return ids.length > 0 && otherDays.some((list) => (list || []).length && ids.every((id) => list.includes(id)));
}

/** A day that shares half its meals or more with one other day reads as that day again. */
function nearCopyLimit(mealCount) {
  return Math.max(2, Math.ceil(mealCount / 2));
}

/** Draws of one attempt when its first answer copies another day; the generator is random, so
 *  another draw from the same dishes usually pairs them differently. */
const REDRAWS = 6;

/**
 * The first day, strictest attempt first, with no flaw; otherwise the least flawed. In order
 * of how much each reads as repetition to the client: an extra meal they did not ask for,
 * a dish on more days of the week than the level allows, the same dish twice in the day, one kind of protein at two meals, and a day that is mostly
 * a copy of another day of the week (David, 2026-10-18: no dish on more than two days, and no
 * week that rotates the same few days).
 */
function solveDay({ base, attempts, avoidSignature = null, otherDays = [], maxPerWeek = Infinity, neighbourIds = [] }) {
  let last = null;
  let best = null;
  const copyLimit = nearCopyLimit(base.mealCount);
  const weekCounts = countDishes(otherDays);
  // The last attempts drop the week's own rules so that a day always comes out; a day from
  // them that puts a dish on a third day still loses to any day that keeps David's limit.
  // Past two days breaks David's rule; past a stricter level's own limit ("varied", once) is
  // only a lesser flaw, lighter than serving one dish twice in the same day. The lunch out
  // counts: when no other shop dish fits a day's macros, a different day usually lets one.
  const overCap = (result) => {
    const most = Math.max(0, ...dishIdsOf(result).map((id) => (weekCounts.get(id) || 0) + 1));
    return most > 2 ? 500 : most > maxPerWeek ? 50 : 0;
  };
  const flawOf = (result) => (result.usedMealCount > base.mealCount ? 1000 : 0)
    + overCap(result)
    + (result.repeatedDishes ? 200 : 0)
    + (dayProteinRepeats(result) ? 100 : 0)
    // A dish also on the day before or after (when the level does not allow it) reads as a repeat
    // too; weighed like one kind of protein twice so neither is traded away for the other.
    + (dishIdsOf(result).some((id) => neighbourIds.includes(id)) ? 100 : 0)
    + (overlapWithWeek(result, otherDays) >= copyLimit ? 10 : 0)
    // A day that is another day of the week dish for dish breaks David's rule outright ("never a
    // copied day"), heavier than any one repeat.
    + (isCopyOfWeekDay(result, otherDays) ? 300 : 0);
  for (let index = 0; index < attempts.length; index += 1) {
    for (let draw = 0; draw <= REDRAWS; draw += 1) {
      const result = buildGramMealPlan({ ...base, ...attempts[index], avoidSignature });
      last = { result, relaxed: index };
      if (!result.ok) break;
      const nearCopy = overlapWithWeek(result, otherDays) >= copyLimit;
      const flaw = flawOf(result);
      if (!flaw) return last;
      if (!best || flaw < best.flaw) best = { ...last, flaw };
      // Only a copied day is worth drawing again from the same dishes; the other flaws come
      // from the dishes the attempt allows, so the next attempt is the place to look.
      if (!nearCopy || flaw >= 100) break;
    }
  }
  if (!best) return last;
  // Every attempt still left a flaw. The search settles on the same best-fitting day each time,
  // so drawing again rarely helps; leaving out one of the dishes behind the flaw does, the way
  // a coach presses "Đổi thực đơn" on that day (2026-10-18: chicken at breakfast and dinner on
  // a Monday, and a Wednesday that was Monday again, both came back on every regenerate).
  // 2026-11-03: the rescue goes on in rounds. Leaving out one dish may only trade one flaw for a
  // lesser one (an egg breakfast for an egg snack); the next round then leaves out a dish behind
  // what is left, keeping the ones already left out, until the day has no flaw or no dish left
  // out lowers it. A day keeps a flaw only when no dish the week allows avoids it.
  const attempt = attempts[best.relaxed];
  let leftOut = [];
  for (let round = 0; round < RESCUE_ROUNDS && best.flaw > 0; round += 1) {
    let roundBest = null;
    const behind = [...new Set([...dishIdsOf(best.result).filter((id) => neighbourIds.includes(id)), ...dishesBehindFlaws(best.result, otherDays, copyLimit, weekCounts)])];
    for (const id of behind.filter((dish) => !leftOut.includes(dish)).slice(0, RESCUES)) {
      const result = buildGramMealPlan({
        ...base, ...attempt, avoidedDishes: [...attempt.avoidedDishes, ...leftOut, id], avoidSignature,
      });
      if (!result.ok) continue;
      const flaw = flawOf(result);
      if (!roundBest || flaw < roundBest.flaw) roundBest = { result, flaw, id };
      if (!flaw) break;
    }
    if (!roundBest || roundBest.flaw >= best.flaw) break;
    best = { result: roundBest.result, relaxed: best.relaxed, flaw: roundBest.flaw };
    leftOut = [...leftOut, roundBest.id];
  }
  return { result: best.result, relaxed: best.relaxed };
}

/** Meals of the day sharing one kind of protein, the snack included (eggs at breakfast and boiled
 *  eggs as the snack count as a repeat). */
function dayProteinRepeats(result) {
  const counts = new Map();
  for (const meal of result?.meals || []) {
    const item = (meal.items || []).find((entry) => entry.group === 'PROTEIN');
    if (!item) continue;
    const kind = proteinFamily(item.name);
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }
  let repeats = 0;
  for (const count of counts.values()) if (count > 1) repeats += count - 1;
  return repeats;
}

/** Days tried without one of the dishes behind a flaw, at most. */
const RESCUES = 4;
/** Rounds of leaving out one more dish, at most. */
const RESCUE_ROUNDS = 4;

/**
 * The home dishes behind a day's flaws, most decisive first: a dish twice in the day, a dish
 * past two days of the week, the meals that share one kind of protein, then the dishes it
 * shares with the day it nearly copies. Leaving one of them out is what can lift the flaw.
 */
function dishesBehindFlaws(result, otherDays, copyLimit, weekCounts) {
  const meals = result.meals || [];
  const ids = meals.map((meal) => meal.dish?.id).filter(Boolean);
  const twice = ids.filter((id, index) => ids.indexOf(id) !== index);
  const pastTwo = ids.filter((id) => (weekCounts.get(id) || 0) + 1 > 2);
  const kinds = new Map();
  for (const meal of meals) {
    if (!meal.dish) continue;
    const kind = proteinFamily(meal.items.find((item) => item.group === 'PROTEIN')?.name || '');
    kinds.set(kind, [...(kinds.get(kind) || []), meal.dish.id]);
  }
  const sameKind = [...kinds.values()].filter((list) => list.length > 1).flat();
  const closest = otherDays.find((list) => (list || []).filter((id) => ids.includes(id)).length >= copyLimit) || [];
  const shared = ids.filter((id) => closest.includes(id));
  return [...new Set([...twice, ...pastTwo, ...sameKind, ...shared])];
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
      const counts = countDishes(lists);
      const previousIds = lists[dayIndex - 1] || [];
      // The week repeats, so Sunday is followed by Monday again.
      const nextIds = dayIndex === WEEK_DAYS.length - 1 ? lists[0] || [] : [];
      solved = solveDay({
        base: { ...base, weekCappedDishes: weekLimitedDishes({ counts, previousIds, nextIds, level }) },
        otherDays: lists,
        maxPerWeek: level.maxPerWeek,
        neighbourIds: level.allowAdjacent ? [] : [...previousIds, ...nextIds],
        attempts: attemptsForDay({
          dayIndex, counts, level, clientPreferred, clientAvoided, mealCount: base.mealCount,
          otherDays: lists, previousIds, nextIds, ownIds: [],
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
  const counts = countDishes(others);
  const previousIds = others[dayIndex === 0 ? last : dayIndex - 1] || [];
  const nextIds = others[dayIndex === last ? 0 : dayIndex + 1] || [];
  return solveDay({
    base: { ...base, weekCappedDishes: weekLimitedDishes({ counts, previousIds, nextIds, level }) },
    otherDays: others,
    maxPerWeek: level.maxPerWeek,
    neighbourIds: level.allowAdjacent ? [] : [...previousIds, ...nextIds],
    avoidSignature: current.signature || null,
    attempts: attemptsForDay({
      dayIndex, counts, level, mealCount: base.mealCount, otherDays: others,
      clientPreferred: options.preferredDishes || [], clientAvoided: options.avoidedDishes || [],
      previousIds, nextIds, ownIds: current.dishIds || [],
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
