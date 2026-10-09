import { MIN_WEIGH_INS_PER_WEEK, todayIso } from './nutrition-log-utils.js';
import { addDays } from './habit-utils.js';
import { isDayHidden } from './training-day-visibility.js';

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
export function nextTrainingDay(sessions, days, hiddenDays = [], today = todayIso()) {
  const visible = days.filter((day) => !isDayHidden(day, hiddenDays));
  if (!visible.length) return { day: null, trainedToday: false, lastDay: null };
  const last = newestFirst(sessions)[0]?.session || null;
  const lastDay = last ? String(last.dayLabel || '') : null;
  const at = lastDay ? visible.indexOf(lastDay) : -1;
  return {
    day: visible[(at + 1) % visible.length],
    trainedToday: Boolean(last) && dayOf(last.performedAt) === today,
    lastDay,
  };
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
