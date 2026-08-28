// ============================================================
// DAVID TRAINING PROGRAM — Daily nutrition log & weekly rollup
// ============================================================
// Pure module: no DOM, no Firebase. Turns a set of per-day entries into the
// weekly averages the coaching decisions are actually made on.
//
// THE CORE RULE, and the reason weekly averaging exists at all: body weight
// swings 1–2 kg within a single day from water, salt, gut contents and
// menstrual cycle. Reading a single morning weigh-in tells you almost nothing.
// Every number this module produces is a weekly average, and the plateau
// protocol refuses to draw conclusions from anything else.
//
// Ported from the coach's standalone tool (nutrition-automation.netlify.app).

import { STREET_DISHES } from './nutrition-foods.js';

export const LOG_UTILS_VERSION = '1.0.0';

/** A week needs this many weigh-ins before its average means anything. */
export const MIN_WEIGH_INS_PER_WEEK = 4;

const DAY_MS = 86400000;

function isNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function toDate(iso) {
  return new Date(`${iso}T00:00:00`);
}

/** ISO date (YYYY-MM-DD) in Vietnam time, matching how the app stamps days. */
export function todayIso(now = new Date()) {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
}

/** Week 0 starts on the first logged day, not on a calendar Monday — a client
 *  who starts on Thursday gets a clean 7-day week from Thursday. */
export function weekIndexOf(iso, startIso) {
  return Math.floor((toDate(iso) - toDate(startIso)) / DAY_MS / 7);
}

export function logStartDate(days) {
  const keys = Object.keys(days || {}).sort();
  return keys.length ? keys[0] : todayIso();
}

/**
 * Roll per-day entries up into weeks.
 *
 * @param {Object} days  keyed by ISO date -> { weight, kcal, steps, sleep, energy, hunger }
 * @returns {Array} one row per week, oldest first:
 *   { index, number, weight, weighIns, kcal, kcalDays, steps, sleep, energy, hunger,
 *     changeKg, changePct, reliable }
 *   `reliable` means the week has enough weigh-ins to be read as a trend.
 */
export function aggregateWeeks(days) {
  const entries = Object.entries(days || {});
  if (!entries.length) return [];
  const start = logStartDate(days);

  const buckets = new Map();
  for (const [iso, day] of entries) {
    const index = weekIndexOf(iso, start);
    if (index < 0) continue;
    if (!buckets.has(index)) buckets.set(index, []);
    buckets.get(index).push(day);
  }

  const average = (rows, key) => {
    const values = rows.map((row) => Number(row[key])).filter((value) => Number.isFinite(value));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  const count = (rows, key) => rows.filter((row) => isNumber(row[key])).length;

  const weeks = [...buckets.keys()].sort((a, b) => a - b).map((index) => {
    const rows = buckets.get(index);
    return {
      index,
      number: index + 1,
      weight: average(rows, 'weight'),
      weighIns: count(rows, 'weight'),
      kcal: average(rows, 'kcal'),
      kcalDays: count(rows, 'kcal'),
      steps: average(rows, 'steps'),
      sleep: average(rows, 'sleep'),
      energy: average(rows, 'energy'),
      hunger: average(rows, 'hunger'),
      days: rows.length,
      changeKg: null,
      changePct: null,
      reliable: count(rows, 'weight') >= MIN_WEIGH_INS_PER_WEEK,
    };
  });

  // Week-on-week change is measured against the previous week that actually
  // has a weight, so one skipped week does not erase the trend.
  let previousWeight = null;
  for (const week of weeks) {
    if (week.weight !== null && previousWeight !== null) {
      week.changeKg = week.weight - previousWeight;
      week.changePct = previousWeight ? (week.weight - previousWeight) / previousWeight * 100 : null;
    }
    if (week.weight !== null) previousWeight = week.weight;
  }
  return weeks;
}

/** How closely the client actually ate to the target, as a percentage.
 *  Below 80% means the plan was never really tested, so the numbers are not
 *  the thing to change yet. */
export function adherencePct(avgKcal, targetKcal) {
  if (!isNumber(avgKcal) || !isNumber(targetKcal) || !targetKcal) return null;
  return Math.max(0, 100 - Math.abs(avgKcal - targetKcal) / targetKcal * 100);
}

/**
 * Merge body-weight logs (the app's existing source of truth for weight) with
 * nutrition check-ins into one per-day record the rollup can read.
 *
 * Weight deliberately comes from bodyWeightLogs only, so the progress chart
 * and the nutrition diagnosis can never disagree about what the client weighs.
 * When a day has several weigh-ins, the earliest is used — morning weight,
 * measured under the most consistent conditions.
 */
export function buildDailyLog({ checkIns = [], weightLogs = [] } = {}) {
  const days = {};
  const dayOf = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value.slice(0, 10);
    const date = value?.toDate ? value.toDate() : (value instanceof Date ? value : null);
    return date ? date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) : null;
  };

  for (const entry of checkIns) {
    const iso = entry.date || entry.id;
    if (!iso) continue;
    days[iso] = {
      ...(days[iso] || {}),
      kcal: isNumber(entry.kcal) ? Number(entry.kcal) : null,
      steps: isNumber(entry.steps) ? Number(entry.steps) : null,
      sleep: isNumber(entry.sleep) ? Number(entry.sleep) : null,
      energy: isNumber(entry.energy) ? Number(entry.energy) : null,
      hunger: isNumber(entry.hunger) ? Number(entry.hunger) : null,
      note: entry.note || '',
      completedMealIds: entry.completedMealIds || [],
      foodLog: Array.isArray(entry.foodLog) ? entry.foodLog : [],
    };
  }

  const earliestByDay = new Map();
  for (const log of weightLogs) {
    const iso = dayOf(log.loggedAt) || dayOf(log.createdAt);
    if (!iso || !isNumber(log.weight)) continue;
    const stamp = typeof log.loggedAt === 'string' ? log.loggedAt : String(log.loggedAt || '');
    const existing = earliestByDay.get(iso);
    if (!existing || stamp < existing.stamp) earliestByDay.set(iso, { stamp, weight: Number(log.weight) });
  }
  for (const [iso, record] of earliestByDay) {
    days[iso] = { ...(days[iso] || {}), weight: record.weight };
  }
  for (const iso of Object.keys(days)) {
    if (!isNumber(days[iso].weight)) days[iso].weight = null;
  }
  return days;
}

// ---------------- Daily budget (eating out) ----------------

const STREET_BY_NAME = new Map(STREET_DISHES.map((dish) => [dish.name, dish]));

/** Restaurant portions vary far too much to count precisely, so the midpoint
 *  of the range is used and the spread is surfaced to the client instead of
 *  being hidden behind a single confident-looking number. */
export function dishMidpointKcal(dish) {
  return Math.round((dish.kcalLow + dish.kcalHigh) / 2);
}

export function getStreetDish(name) {
  return STREET_BY_NAME.get(name) || null;
}

/**
 * What is left of today after what has already been eaten.
 * @param {Object} targets {kcal, protein}
 * @param {Array} entries  [{ name, kcal, protein, servings }]
 */
export function remainingBudget(targets, entries = []) {
  const eaten = entries.reduce((sum, entry) => {
    const servings = Number(entry.servings) || 1;
    return {
      kcal: sum.kcal + (Number(entry.kcal) || 0) * servings,
      protein: sum.protein + (Number(entry.protein) || 0) * servings,
    };
  }, { kcal: 0, protein: 0 });
  const targetKcal = Number(targets?.kcal) || 0;
  const targetProtein = Number(targets?.protein) || 0;
  return {
    eatenKcal: Math.round(eaten.kcal),
    eatenProtein: Math.round(eaten.protein),
    remainingKcal: Math.round(targetKcal - eaten.kcal),
    remainingProtein: Math.round(targetProtein - eaten.protein),
    pctUsed: targetKcal ? Math.round(eaten.kcal / targetKcal * 100) : 0,
  };
}

/**
 * Which dishes still fit in what is left of the day.
 *
 * Judged on the HIGH end of each dish's range, not the midpoint: if the shop
 * serves a generous bowl the client should still be inside their target, so
 * "fits" means fits even on a bad day. Protein-dense dishes are surfaced first
 * because that is the macro most likely to be short by evening.
 */
export function dishesThatFit(remainingKcal, { limit = 8, minProtein = 0 } = {}) {
  return STREET_DISHES
    .filter((dish) => dish.kcalHigh <= remainingKcal && dish.protein >= minProtein)
    .sort((a, b) => b.protein - a.protein || a.kcalHigh - b.kcalHigh)
    .slice(0, limit);
}
