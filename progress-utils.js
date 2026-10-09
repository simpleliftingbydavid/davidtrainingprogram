import { MIN_WEIGH_INS_PER_WEEK, todayIso } from './nutrition-log-utils.js';
import { addDays } from './habit-utils.js';
import { dayOf, daysBetween, toDate, weekStart } from './home-utils.js';

// Everything the Tiến trình page works out from the data it has read: photo angles
// and before/after pairs, weekly weight averages, strength over time, the waist
// measurement and the milestones. Pure — no DOM, no Firebase.

export const ANGLES = Object.freeze([
  Object.freeze({ id: 'front', label: 'Front', vi: 'Chính diện' }),
  Object.freeze({ id: 'side', label: 'Side', vi: 'Bên hông' }),
  Object.freeze({ id: 'back', label: 'Back', vi: 'Phía sau' }),
]);

export function normalizeAngle(value) {
  return ANGLES.some((angle) => angle.id === value) ? value : '';
}

export function angleLabel(value) {
  const angle = ANGLES.find((item) => item.id === value);
  return angle ? angle.label : 'Chưa phân loại';
}

// ---------- photos ----------

function photoDay(photo) {
  return dayOf(photo.takenAt || photo.createdAt);
}

/** Photos of one angle ('all' for every photo, 'none' for the unclassified ones). */
export function filterPhotos(photos, filter = 'all') {
  if (filter === 'all') return photos;
  if (filter === 'none') return photos.filter((photo) => !normalizeAngle(photo.angle));
  return photos.filter((photo) => normalizeAngle(photo.angle) === filter);
}

/** For each angle with at least two photos on different days: the first, the
 *  latest, and how many days apart they are — the before and after. */
export function beforeAfterPairs(photos) {
  const pairs = [];
  for (const angle of ANGLES) {
    const dated = photos
      .filter((photo) => normalizeAngle(photo.angle) === angle.id && photoDay(photo))
      .map((photo) => ({ photo, day: photoDay(photo) }))
      .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
    if (dated.length < 2) continue;
    const before = dated[0];
    const after = dated[dated.length - 1];
    if (before.day === after.day) continue;
    pairs.push({ angle: angle.id, before: before.photo, after: after.photo, beforeDay: before.day, afterDay: after.day, days: daysBetween(before.day, after.day) });
  }
  return pairs;
}

// ---------- weight ----------

/** Weekly averages, oldest first, for the last `weeks` calendar weeks that have a
 *  weigh-in. A week with fewer than MIN_WEIGH_INS_PER_WEEK is flagged: its average
 *  is shown but not trusted, the same rule the nutrition plan applies. */
export function weeklyWeightAverages(logs, today = todayIso(), weeks = 12) {
  const oldest = addDays(weekStart(today), -7 * (weeks - 1));
  const byWeek = new Map();
  const daily = [];
  for (const log of logs) {
    const weight = Number(log.weight);
    const day = dayOf(log.loggedAt);
    if (!Number.isFinite(weight) || weight <= 0 || !day || day > today) continue;
    const start = weekStart(day);
    if (start < oldest) continue;
    if (!byWeek.has(start)) byWeek.set(start, []);
    byWeek.get(start).push(weight);
    daily.push({ day, weight });
  }
  const average = [...byWeek.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([start, values]) => ({
    start,
    avg: Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100,
    count: values.length,
    enough: values.length >= MIN_WEIGH_INS_PER_WEEK,
  }));
  return { weeks: average, daily: daily.sort((a, b) => (a.day < b.day ? -1 : 1)) };
}

// ---------- strength ----------

function topSet(log) {
  const sets = Array.isArray(log?.actualSets) ? log.actualSets : [];
  return sets.reduce((best, set) => {
    const weight = Number(set?.weight);
    return Number(set?.reps) > 0 && Number.isFinite(weight) && weight > best ? weight : best;
  }, 0);
}

/** The exercises a student has trained most, each with its first, best and latest
 *  heaviest set and the last few sessions as a series. Bodyweight work (no load)
 *  has no weight to follow and is left out. */
export function strengthProgress(sessions, nameOf, { limit = 6, minSessions = 2, seriesLength = 10 } = {}) {
  const ordered = [...sessions]
    .map((session) => ({ session, at: toDate(session.performedAt)?.getTime() ?? 0 }))
    .filter((item) => item.at > 0)
    .sort((a, b) => a.at - b.at);
  const byExercise = new Map();
  for (const { session } of ordered) {
    const day = dayOf(session.performedAt);
    for (const log of Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []) {
      const id = log.substitutedExerciseId || log.exerciseId;
      const weight = topSet(log);
      if (!id || !weight) continue;
      if (!byExercise.has(id)) byExercise.set(id, []);
      byExercise.get(id).push({ day, weight });
    }
  }
  const rows = [];
  for (const [id, series] of byExercise) {
    if (series.length < minSessions) continue;
    const first = series[0];
    const latest = series[series.length - 1];
    const priorBest = Math.max(...series.slice(0, -1).map((point) => point.weight));
    const best = Math.max(priorBest, latest.weight);
    rows.push({
      id, name: nameOf(id), sessions: series.length, first, latest, best,
      gain: Math.round((best - first.weight) * 10) / 10,
      isRecord: latest.weight > priorBest,
      series: series.slice(-seriesLength),
    });
  }
  return rows.sort((a, b) => b.sessions - a.sessions || b.gain - a.gain).slice(0, limit);
}

// ---------- waist ----------

/** Newest-first measurements → latest, first, and the change between them. */
export function measurementTrend(logs) {
  const points = logs
    .map((log) => ({ value: Number(log.waistCm), day: dayOf(log.loggedAt), at: toDate(log.loggedAt)?.getTime() ?? 0 }))
    .filter((point) => Number.isFinite(point.value) && point.value > 0 && point.day)
    .sort((a, b) => a.at - b.at);
  if (!points.length) return { count: 0, first: null, latest: null, delta: null, series: [] };
  const first = points[0];
  const latest = points[points.length - 1];
  return {
    count: points.length, first, latest,
    delta: points.length > 1 ? Math.round((latest.value - first.value) * 10) / 10 : null,
    series: points,
  };
}

// ---------- milestones ----------

const SESSION_STEPS = [1, 10, 25, 50, 100];
const WEEK_STEPS = [4, 8, 12];
const HABIT_STEPS = [7, 30];

/** Consecutive Monday-to-Sunday weeks, ending now, with at least one session. The
 *  current week does not break the run just because it is not over yet. */
export function activeWeekStreak(sessions, today = todayIso()) {
  const weeks = new Set(sessions.map((session) => dayOf(session.performedAt)).filter(Boolean).map(weekStart));
  let start = weekStart(today);
  if (!weeks.has(start)) start = addDays(start, -7);
  let streak = 0;
  while (weeks.has(start)) { streak++; start = addDays(start, -7); }
  return streak;
}

/** Whether any exercise has ever been done heavier than its first time. */
function hasImprovedAnywhere(strength) {
  return strength.some((row) => row.gain > 0);
}

/** Badges earned, and what is next on each ladder. Nothing here depends on a goal:
 *  it counts showing up, not whether a number went up or down. */
export function buildMilestones({
  sessions = [], photos = [], weightWeeks = [], measurements = [], bestHabitStreak = 0, strength = [], today = todayIso(),
} = {}) {
  const count = sessions.length;
  const weekRun = activeWeekStreak(sessions, today);
  const anglesWithPhotos = new Set(photos.map((photo) => normalizeAngle(photo.angle)).filter(Boolean));
  const ladder = (steps, value, label, unit) => steps.map((step) => ({
    id: `${unit}-${step}`, group: unit, label: label(step), earned: value >= step, value, target: step,
  }));
  const items = [
    ...ladder(SESSION_STEPS, count, (n) => (n === 1 ? 'Buổi tập đầu tiên' : `${n} buổi tập`), 'sessions'),
    ...ladder(WEEK_STEPS, weekRun, (n) => `${n} tuần tập liên tục`, 'weeks'),
    ...ladder(HABIT_STEPS, bestHabitStreak, (n) => `${n} ngày thói quen liên tục`, 'habit'),
    { id: 'photo-first', group: 'photos', label: 'Ảnh tiến trình đầu tiên', earned: photos.length > 0, value: photos.length, target: 1 },
    { id: 'photo-set', group: 'photos', label: 'Đủ 3 góc Front · Side · Back', earned: anglesWithPhotos.size === ANGLES.length, value: anglesWithPhotos.size, target: ANGLES.length },
    { id: 'weigh-week', group: 'weight', label: 'Một tuần cân đủ 4 lần', earned: weightWeeks.some((week) => week.enough), value: Math.max(0, ...weightWeeks.map((week) => week.count)), target: MIN_WEIGH_INS_PER_WEEK },
    { id: 'waist-first', group: 'waist', label: 'Bắt đầu theo dõi vòng eo', earned: measurements.length > 0, value: measurements.length, target: 1 },
    { id: 'strength-up', group: 'strength', label: 'Nâng nặng hơn lần đầu', earned: hasImprovedAnywhere(strength), value: hasImprovedAnywhere(strength) ? 1 : 0, target: 1 },
  ];
  const earned = items.filter((item) => item.earned);
  // The nearest unearned step on each ladder, so the page can say what is next.
  const next = [];
  for (const group of ['sessions', 'weeks', 'habit']) {
    const step = items.find((item) => item.group === group && !item.earned);
    if (step) next.push({ ...step, remaining: step.target - step.value });
  }
  return { earned, next, total: items.length };
}
