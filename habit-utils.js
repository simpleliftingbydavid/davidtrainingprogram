// ============================================================
// DAVID TRAINING PROGRAM — Habit plan & daily habit log
// ============================================================
// Pure module: no DOM, no Firebase. Everything the habits page and the coach
// dashboard compute from a student's habit plan and daily ticks.
//
// The design follows the "Cẩm nang Thay đổi Hành vi": a client keeps FEW habits
// (at most three) and keeps them consistently. Each habit has a cue and a
// two-minute version, so a bad day shrinks the habit instead of ending it.
// Showing up with the two-minute version counts as showing up — that is the
// whole point of the rule — so it extends a streak exactly like a full day.

import { todayIso } from './nutrition-log-utils.js';

export const MAX_HABITS = 3;

export const HABIT_LIMITS = Object.freeze({
  identity: 160,
  name: 80,
  cue: 140,
  twoMinute: 120,
  reward: 100,
});

export const HABIT_STATUS = Object.freeze({ FULL: 'full', MINIMUM: 'minimum' });

/** Missing this many days in a row is the handbook's "never miss twice" line. */
export const MISSED_TWICE = 2;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

function clean(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function utcMs(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function isIsoDay(value) {
  if (typeof value !== 'string' || !ISO_DAY.test(value)) return false;
  const date = new Date(utcMs(value));
  return date.toISOString().slice(0, 10) === value;
}

export function addDays(iso, count) {
  return new Date(utcMs(iso) + count * DAY_MS).toISOString().slice(0, 10);
}

export function habitToday(now = new Date()) {
  return todayIso(now);
}

/** Newest first: today, yesterday, … `count` days in total. */
export function recentDays(today, count) {
  return Array.from({ length: count }, (_, index) => addDays(today, -index));
}

// ---------- the plan ----------

export function emptyHabitPlan() {
  return { identity: '', habits: [] };
}

function normalizeHabit(raw, fallbackStart) {
  if (!raw || typeof raw !== 'object') return null;
  const id = clean(raw.id, 24);
  const name = clean(raw.name, HABIT_LIMITS.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    cue: clean(raw.cue, HABIT_LIMITS.cue),
    twoMinute: clean(raw.twoMinute, HABIT_LIMITS.twoMinute),
    reward: clean(raw.reward, HABIT_LIMITS.reward),
    startedOn: isIsoDay(raw.startedOn) ? raw.startedOn : fallbackStart,
  };
}

/** Whatever Firestore hands back becomes a plan the UI can trust: trimmed,
 *  de-duplicated by id and capped at MAX_HABITS. Never throws. */
export function normalizeHabitPlan(raw, today = habitToday()) {
  const habits = [];
  const seen = new Set();
  for (const item of Array.isArray(raw?.habits) ? raw.habits : []) {
    const habit = normalizeHabit(item, today);
    if (!habit || seen.has(habit.id)) continue;
    seen.add(habit.id);
    habits.push(habit);
    if (habits.length === MAX_HABITS) break;
  }
  return { identity: clean(raw?.identity, HABIT_LIMITS.identity), habits };
}

export function nextHabitId(habits = []) {
  const used = new Set(habits.map((habit) => habit.id));
  for (let n = 1; n <= MAX_HABITS + 1; n++) if (!used.has(`h${n}`)) return `h${n}`;
  return `h${Date.now()}`;
}

/** A habit is only worth tracking when the client has said WHAT, WHEN and what
 *  the two-minute version is. The reward and the identity sentence stay optional. */
export function validateHabitPlan(plan) {
  const errors = [];
  const habits = Array.isArray(plan?.habits) ? plan.habits : [];
  if (habits.length > MAX_HABITS) errors.push(`Chỉ giữ tối đa ${MAX_HABITS} thói quen.`);
  habits.forEach((habit, index) => {
    const label = `Thói quen ${index + 1}`;
    if (!clean(habit?.name, HABIT_LIMITS.name)) errors.push(`${label}: cần ghi rõ việc bạn sẽ làm.`);
    if (!clean(habit?.cue, HABIT_LIMITS.cue)) errors.push(`${label}: cần một tín hiệu (sau khi… hoặc vào lúc…).`);
    if (!clean(habit?.twoMinute, HABIT_LIMITS.twoMinute)) errors.push(`${label}: cần phiên bản 2 phút cho ngày bận.`);
  });
  return { ok: errors.length === 0, errors };
}

// ---------- the daily log ----------

/** A student may tick today and yesterday only. Older days are history: letting
 *  them be back-filled would make the streak a number nobody can trust. */
export function isLoggableDay(date, today = habitToday()) {
  return isIsoDay(date) && (date === today || date === addDays(today, -1));
}

function validStatus(value) {
  return value === HABIT_STATUS.FULL || value === HABIT_STATUS.MINIMUM;
}

/** A day's ticks, reduced to the habits that still exist and known statuses. */
export function normalizeHabitLog(raw, habitIds = null) {
  const done = {};
  const source = raw?.done && typeof raw.done === 'object' ? raw.done : {};
  for (const [id, status] of Object.entries(source)) {
    if (!validStatus(status)) continue;
    if (habitIds && !habitIds.includes(id)) continue;
    done[id] = status;
  }
  return done;
}

/** Returns the day's new `done` map. Passing null/'' clears the tick. */
export function withHabitStatus(done = {}, habitId, status) {
  const next = { ...normalizeHabitLog({ done }) };
  if (validStatus(status)) next[habitId] = status;
  else delete next[habitId];
  return next;
}

// `logs` everywhere below is { 'YYYY-MM-DD': { habitId: status } }.
// A tick dated before the habit started is ignored. Habit ids are reused (h1–h3),
// so without this a deleted habit's old ticks would show up under its successor.
export function habitDayStatus(logs, date, habit) {
  if (date < habit.startedOn) return null;
  const status = logs?.[date]?.[habit.id];
  return validStatus(status) ? status : null;
}
const statusOn = habitDayStatus;

export function logsByDate(docs = []) {
  const map = {};
  for (const item of docs) {
    const date = item?.date || item?.id;
    if (isIsoDay(date)) map[date] = normalizeHabitLog(item);
  }
  return map;
}

// ---------- what the client and the coach read ----------

/** Days in a row with any tick, counting back from today. An unticked today does
 *  not zero the streak — the day is not over — it just isn't counted yet. */
export function currentStreak(logs, habit, today = habitToday()) {
  let day = statusOn(logs, today, habit) ? today : addDays(today, -1);
  let streak = 0;
  while (statusOn(logs, day, habit)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/** Consecutive missed days ending yesterday, never reaching back past the day the
 *  habit was started. Today is excluded: it is still open. */
export function missedInARow(logs, habit, today = habitToday()) {
  let count = 0;
  let day = addDays(today, -1);
  while (day >= habit.startedOn && !statusOn(logs, day, habit)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/** Ticks over the last `days` days. Today only counts when it has been ticked, so
 *  a client is never marked down for a day that has not finished. */
export function adherence(logs, habit, today = habitToday(), days = 7) {
  let possible = 0;
  let done = 0;
  for (const day of recentDays(today, days)) {
    if (day < habit.startedOn) continue;
    const status = statusOn(logs, day, habit);
    if (day === today && !status) continue;
    possible++;
    if (status) done++;
  }
  return { done, possible, rate: possible ? done / possible : null };
}

/** The thirty-day grid of the handbook's habit tracker, oldest first. */
export function trackerGrid(logs, habit, today = habitToday(), days = 30) {
  return recentDays(today, days).reverse().map((date) => ({
    date,
    status: statusOn(logs, date, habit),
    before: date < habit.startedOn,
  }));
}

/** One row per habit for the coach dashboard. */
export function habitSummary(rawPlan, logs, today = habitToday()) {
  const plan = normalizeHabitPlan(rawPlan, today);
  const habits = plan.habits.map((habit) => {
    const missed = missedInARow(logs, habit, today);
    return {
      id: habit.id,
      name: habit.name,
      streak: currentStreak(logs, habit, today),
      missedInARow: missed,
      week: adherence(logs, habit, today, 7),
      needsAttention: missed >= MISSED_TWICE,
    };
  });
  return {
    hasPlan: habits.length > 0,
    identity: plan.identity,
    habits,
    needsAttention: habits.some((habit) => habit.needsAttention),
  };
}

// ---------- the coach's overview ----------

function weakestWeek(habits) {
  const rates = habits.map((habit) => habit.week.rate).filter((rate) => rate !== null);
  return rates.length ? Math.min(...rates) : null;
}

/** The coach dashboard's list: every student who has habits, those who need a word
 *  first (missed two days running), then the least consistent week, then by name.
 *  Students with no plan, and students whose data could not be read, are reported
 *  separately instead of being silently left out.
 *
 *  entries: [{ student: { id, displayName, clientCategory }, plan, logs, failed }] */
export function habitOverview(entries = [], today = habitToday()) {
  const rows = [];
  const withoutPlan = [];
  const failed = [];
  for (const entry of entries) {
    const student = entry?.student || {};
    const name = student.displayName || 'Học viên';
    if (entry?.failed) { failed.push({ uid: student.id, name }); continue; }
    const summary = habitSummary(entry?.plan, entry?.logs || {}, today);
    if (!summary.hasPlan) { withoutPlan.push({ uid: student.id, name }); continue; }
    rows.push({ uid: student.id, name, category: student.clientCategory || '', summary });
  }
  rows.sort((a, b) => {
    if (a.summary.needsAttention !== b.summary.needsAttention) return a.summary.needsAttention ? -1 : 1;
    const weakA = weakestWeek(a.summary.habits);
    const weakB = weakestWeek(b.summary.habits);
    if (weakA !== weakB) {
      if (weakA === null) return 1;
      if (weakB === null) return -1;
      return weakA - weakB;
    }
    return a.name.localeCompare(b.name, 'vi');
  });
  withoutPlan.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return { rows, withoutPlan, failed, attention: rows.filter((row) => row.summary.needsAttention).length };
}
