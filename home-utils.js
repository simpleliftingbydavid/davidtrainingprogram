import { MIN_WEIGH_INS_PER_WEEK, todayIso } from './nutrition-log-utils.js';
import { addDays } from './habit-utils.js';
import { isDayHidden } from './training-day-visibility.js';
import { currentDayName } from './day-rename-utils.js';
import { PROGRESSION_MODE, SCHEME } from './progression-engine.js';

// What the student's home page works out from data it has already read. Pure: no
// DOM, no Firebase. Dates are Vietnam calendar days, the clock the whole app uses.

const DAY_MS = 86400000;

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dayOf(value) {
  const date = toDate(value);
  return date ? todayIso(date) : null;
}

export function daysBetween(fromIso, toIso) {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

/** Monday of the week containing `iso`. Weeks run Monday to Sunday. */
export function weekStart(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return addDays(iso, -weekday);
}

function newestFirst(sessions) {
  return [...sessions]
    .map((session) => ({ session, at: toDate(session.performedAt)?.getTime() ?? 0 }))
    .filter((item) => item.at > 0)
    .sort((a, b) => b.at - a.at);
}

/** The day to train next: the one after the last session's, among days that are
 *  not paused, wrapping round. `trainedToday` lets the page say "done" instead of
 *  pushing a second session at someone who has just finished one. */
export function nextTrainingDay(sessions, days, hiddenDays = [], today = todayIso(), renames = {}) {
  const visible = days.filter((day) => !isDayHidden(day, hiddenDays));
  if (!visible.length) return { day: null, trainedToday: false, lastDay: null };
  const last = newestFirst(sessions)[0]?.session || null;
  // A session logged under a name the coach has since changed still counts for the renamed day.
  const lastDay = last ? currentDayName(last.dayLabel || '', renames) : null;
  const at = lastDay ? visible.indexOf(lastDay) : -1;
  return {
    day: visible[(at + 1) % visible.length],
    trainedToday: Boolean(last) && dayOf(last.performedAt) === today,
    lastDay,
  };
}

/** The day (ISO) a training day was last done, counting sessions logged under a name the
 *  coach has since changed; null when it has never been done. */
export function lastTrainedOn(sessions, day, renames = {}) {
  const hit = newestFirst(sessions).find(({ session }) => currentDayName(session.dayLabel || '', renames) === day);
  return hit ? dayOf(hit.session.performedAt) : null;
}

export function sessionsThisWeek(sessions, today = todayIso()) {
  const start = weekStart(today);
  return sessions.filter((session) => {
    const day = dayOf(session.performedAt);
    return day && day >= start && day <= today;
  }).length;
}

/** How many of the last `weeks` rolling 7-day windows hold a session — the same
 *  measure the workout page's banner has always used. */
export function weeksActive(sessions, now = Date.now(), weeks = 4) {
  const stamps = newestFirst(sessions).map((item) => item.at);
  let active = 0;
  for (let w = 0; w < weeks; w++) {
    const end = now - w * 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    if (stamps.some((t) => t > start && t <= end)) active++;
  }
  return active;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

/** Latest weigh-in plus this week's average against last week's. A trend is only
 *  claimed when both weeks have enough weigh-ins: one morning's weight says almost
 *  nothing, and the nutrition plan already refuses to read it. */
export function weightTrend(logs, today = todayIso()) {
  const points = logs
    .map((log) => ({ weight: Number(log.weight), day: dayOf(log.loggedAt), at: toDate(log.loggedAt)?.getTime() ?? 0 }))
    .filter((point) => Number.isFinite(point.weight) && point.weight > 0 && point.day)
    .sort((a, b) => b.at - a.at);
  if (!points.length) return { latest: null, thisWeek: null, lastWeek: null, delta: null, enough: false };
  const week = (from, to) => {
    const values = points.filter((point) => point.day >= from && point.day <= to).map((point) => point.weight);
    return { avg: average(values), count: values.length };
  };
  const thisWeek = week(addDays(today, -6), today);
  const lastWeek = week(addDays(today, -13), addDays(today, -7));
  const enough = thisWeek.count >= MIN_WEIGH_INS_PER_WEEK && lastWeek.count >= MIN_WEIGH_INS_PER_WEEK;
  return {
    latest: { weight: points[0].weight, day: points[0].day },
    thisWeek, lastWeek, enough,
    delta: enough ? Math.round((thisWeek.avg - lastWeek.avg) * 10) / 10 : null,
  };
}

function topWeight(log) {
  const sets = Array.isArray(log?.actualSets) ? log.actualSets : [];
  return sets.reduce((best, set) => {
    const weight = Number(set?.weight);
    return Number(set?.reps) > 0 && Number.isFinite(weight) && weight > best ? weight : best;
  }, 0);
}

/** The newest exercise whose heaviest set, in the last `windowDays`, beat every
 *  earlier session on file. Bodyweight work (no load) and an exercise's first ever
 *  appearance are not records. */
export function latestRecord(sessions, nameOf, today = todayIso(), windowDays = 14) {
  const cutoff = addDays(today, -windowDays);
  const best = new Map();
  const found = [];
  for (const { session } of newestFirst(sessions).reverse()) {
    const day = dayOf(session.performedAt);
    for (const log of Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []) {
      const id = log.substitutedExerciseId || log.exerciseId;
      const weight = topWeight(log);
      if (!id || !weight) continue;
      const before = best.get(id);
      if (before !== undefined && weight > before && day >= cutoff) found.push({ id, name: nameOf(id), from: before, to: weight, day });
      if (before === undefined || weight > before) best.set(id, weight);
    }
  }
  found.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : b.to - a.to));
  return found[0] || null;
}

/** When the last progress photo was taken, and whether it is time for another. */
export function photoReminder(photos, today = todayIso(), everyDays = 14) {
  const days = photos.map((photo) => dayOf(photo.takenAt || photo.createdAt)).filter(Boolean).sort();
  if (!days.length) return { daysSince: null, due: true, first: true };
  const since = daysBetween(days[days.length - 1], today);
  return { daysSince: since, due: since >= everyDays, first: false };
}

// ---------- the home page's lead lift (redesign, David 2026-10-29) ----------

/**
 * Today's first lift as the home page shows it, read from the same prescription the workout
 * page uses (`getInitialPrescription`): sets, reps and the load. `weight` is null when there
 * is no load to show (bodyweight work, or no weight set yet); a reverse pyramid gives its
 * first set's load and its rep range, a fixed-total-reps lift its total.
 */
export function liftSummary(assignment, planned, exercise = null) {
  if (!planned) return null;
  const sets = Math.max(0, Number(planned.sets) || 0);
  const load = (value) => (Number(value) > 0 ? Number(value) : null);
  const bodyweight = assignment?.scheme === SCHEME.REP_INCREASE
    || assignment?.schemeParams?.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY
    || (Boolean(exercise?.isBodyweight) && !load(planned.weight));
  if (assignment?.scheme === SCHEME.REVERSE_PYRAMID) {
    const steps = planned.setPrescriptions || [];
    const reps = steps.map((step) => Number(step.reps) || 0);
    return { sets: steps.length || sets, reps: reps.length ? `${Math.min(...reps)}–${Math.max(...reps)}` : '', weight: load(steps[0]?.weight), bodyweight: false, pyramid: true };
  }
  if (assignment?.scheme === SCHEME.FIXED_TOTAL_REPS) {
    return { sets, reps: '', totalReps: Number(planned.totalRepsTarget) || 0, weight: load(planned.weight), bodyweight: false };
  }
  return { sets, reps: String(Number(planned.reps) || ''), weight: bodyweight ? null : load(planned.weight), bodyweight };
}

/** The bar and plates a typical gym has. */
export const BAR_KG = 20;
export const PLATES_KG = Object.freeze([25, 20, 15, 10, 5, 2.5, 1.25]);

/**
 * The plates to load on each side for a barbell load, biggest first: 70 kg is the 20 kg bar
 * plus 20 + 5 a side. Null when the plates cannot make the load exactly: lighter than the
 * bar, or a weight between plate steps.
 */
export function platesPerSide(total, { bar = BAR_KG, plates = PLATES_KG } = {}) {
  let side = (Number(total) - bar) / 2;
  if (!Number.isFinite(side) || side < 0) return null;
  const out = [];
  for (const plate of plates) {
    while (side >= plate - 1e-9) { out.push(plate); side -= plate; }
  }
  return Math.abs(side) < 1e-6 ? out : null;
}

const PLATE_SIZE = Object.freeze({ 25: [24, 136], 20: [22, 128], 15: [20, 112], 10: [18, 96], 5: [15, 72], 2.5: [12, 56], 1.25: [10, 44] });

/**
 * Where each plate sits in a drawing `width` wide and `height` tall: plates stack outward
 * from the collars, the same on both sides, and narrow when many would not fit on a sleeve.
 */
export function plateLayout(plates, { width = 350, height = 150 } = {}) {
  const centre = width / 2;
  const collar = 62;          // half the gap between the two collars
  const sleeve = centre - collar - 12; // room for plates, from the collar to the edge
  const natural = plates.reduce((sum, kg) => sum + (PLATE_SIZE[kg]?.[0] || 14) + 2, 0);
  const squeeze = natural > sleeve ? sleeve / natural : 1;
  const out = [];
  let offset = collar + 8;
  for (const kg of plates) {
    const [w0, h] = PLATE_SIZE[kg] || [14, 60];
    const w = Math.max(5, Math.round(w0 * squeeze * 10) / 10);
    const y = Math.round((height - h) / 2);
    out.push({ kg, side: 'left', x: Math.round((centre - offset - w) * 10) / 10, y, w, h });
    out.push({ kg, side: 'right', x: Math.round((centre + offset) * 10) / 10, y, w, h });
    offset += w + 2 * squeeze;
  }
  return out;
}

const WEEKDAY_LABELS = Object.freeze(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);

/** This week, Monday to Sunday, for the punch card: which days have a session, and today. */
export function weekPunch(sessions, today = todayIso()) {
  const start = weekStart(today);
  const trained = new Set(sessions.map((session) => dayOf(session.performedAt)).filter(Boolean));
  return WEEKDAY_LABELS.map((label, index) => {
    const iso = addDays(start, index);
    return { iso, label, trained: trained.has(iso), today: iso === today, future: iso > today };
  });
}

/** One weigh-in per day (the latest of the day) over the last `days`, oldest first, for the
 *  small weight chart. Fewer than two points draw no line. */
export function weightSeries(logs, today = todayIso(), days = 14) {
  const from = addDays(today, -(days - 1));
  const byDay = new Map();
  logs
    .map((log) => ({ weight: Number(log.weight), day: dayOf(log.loggedAt), at: toDate(log.loggedAt)?.getTime() ?? 0 }))
    .filter((point) => Number.isFinite(point.weight) && point.weight > 0 && point.day && point.day >= from && point.day <= today)
    .forEach((point) => { const kept = byDay.get(point.day); if (!kept || point.at > kept.at) byDay.set(point.day, point); });
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? -1 : 1)).map(({ day, weight }) => ({ day, weight }));
}
