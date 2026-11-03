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

function vietnamIso(date) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).reduce((map, part) => ({ ...map, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** ISO date (YYYY-MM-DD) in Vietnam time, matching how the app stamps days. */
export function todayIso(now = new Date()) {
  return vietnamIso(now);
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
    return date ? vietnamIso(date) : null;
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
      // A meal logged in grams was eaten even when its tick was never saved.
      loggedMealIds: Array.isArray(entry.mealLogs) ? entry.mealLogs.map((log) => log?.mealId).filter(Boolean) : [],
      foodLog: Array.isArray(entry.foodLog) ? entry.foodLog : [],
      planVersionId: entry.planVersionId || null,
      plannedMealCount: isNumber(entry.plannedMealCount) ? Number(entry.plannedMealCount) : null,
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

/** Resolve the goal without ever turning an unknown legacy plan into fat loss. */
export function resolveNutritionGoal(plan = {}, profile = {}) {
  const allowed = new Set(['gain', 'maintain', 'fat_loss', 'deep_cut']);
  if (allowed.has(plan?.goalType)) return plan.goalType;
  if (allowed.has(profile?.goalType)) return profile.goalType;
  return null;
}

function dateIso(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const date = value?.toDate ? value.toDate() : (value instanceof Date ? value : null);
  return date ? vietnamIso(date) : null;
}

/**
 * Keep coaching decisions inside the active plan version. New versioned plans
 * only read exact-version check-ins; ambiguous legacy rows stay visible in
 * history but cannot influence a current calorie recommendation.
 */
export function scopeNutritionData({ checkIns = [], weightLogs = [], plan = null } = {}) {
  const versionId = String(plan?.versionId || '');
  const startIso = dateIso(plan?.publishedAt);
  const scopedCheckIns = versionId
    ? checkIns.filter((entry) => String(entry.planVersionId || '') === versionId)
    : checkIns.filter((entry) => !entry.planVersionId);
  const scopedWeightLogs = startIso
    ? weightLogs.filter((entry) => {
      const iso = dateIso(entry.loggedAt) || dateIso(entry.createdAt);
      return iso && iso >= startIso;
    })
    : (versionId ? [] : weightLogs);
  return { checkIns: scopedCheckIns, weightLogs: scopedWeightLogs, versionId, startIso };
}
