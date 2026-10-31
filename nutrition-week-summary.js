// ============================================================
// DAVID COACHING — the client's weekly summary (2026-10-31)
// ============================================================
// Pure module: no DOM, no Firebase. Gives the client three things for the week they are in:
//   1. the 7-day average weight against the goal's weekly target,
//   2. how many of the week's planned meals they followed (ticked or logged),
//   3. one thing to do next week.
//
// The "next step" is about behaviour only. It never tells the client to eat less or more:
// changing calories is David's call, made through the progress check, which refuses to
// conclude anything on thin data or below 80% adherence. This card follows the same order:
// enough weigh-ins first, then meals on plan, and only then the trend.

import { MIN_WEIGH_INS_PER_WEEK, logStartDate, weekIndexOf } from './nutrition-log-utils.js';
import { PLATEAU_CONFIG, targetWeeklyPct } from './nutrition-plateau-engine.js';

export const WEEK_SUMMARY_VERSION = '1.0.0';

const DAY_MS = 86400000;

function addDays(iso, count) {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Date(date.getTime() + count * DAY_MS).toISOString().slice(0, 10);
}

function average(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null;
}

function weekWeights(days, startIso, endIso) {
  const values = [];
  for (let iso = startIso; iso <= endIso; iso = addDays(iso, 1)) {
    const weight = days[iso]?.weight;
    if (weight !== null && weight !== undefined && Number.isFinite(Number(weight))) values.push(Number(weight));
  }
  return { avg: average(values), weighIns: values.length };
}

/**
 * Meals followed this week. A meal counts when it was ticked or logged in grams (a logged meal
 * was eaten, the same rule as the meal cards). Past days count every planned meal, so a day
 * the client never opened counts as 0 of N. Today counts only what is already done, so the
 * card does not scold the client at noon for a dinner they have not eaten yet.
 */
function weekMeals(days, startIso, todayIso, plannedCountFor) {
  let done = 0;
  let planned = 0;
  for (let iso = startIso; iso <= todayIso; iso = addDays(iso, 1)) {
    const day = days[iso] || {};
    const stored = Number(day.plannedMealCount);
    const dayPlanned = Number.isFinite(stored) && stored > 0 ? stored : Math.max(0, Number(plannedCountFor(iso)) || 0);
    const ids = new Set([...(day.completedMealIds || []), ...(day.loggedMealIds || [])].map(String));
    const dayDone = Math.min(ids.size, dayPlanned || ids.size);
    done += dayDone;
    planned += iso === todayIso ? dayDone : dayPlanned;
  }
  return { done, planned, pct: planned ? Math.round(done / planned * 100) : null };
}

function goalKind(goalType) {
  if (goalType === 'gain') return 'gain';
  if (goalType === 'maintain') return 'maintain';
  if (goalType === 'fat_loss' || goalType === 'deep_cut') return 'loss';
  return null;
}

/** Where the trend sits against the goal. Only read when both weeks have enough weigh-ins. */
function trendStatus(kind, changePct, targetPct) {
  const tolerance = PLATEAU_CONFIG.onTrackTolerancePct;
  if (kind === 'loss') {
    if (changePct < -PLATEAU_CONFIG.fastLossPctPerWeek) return 'faster';
    if (changePct > targetPct + tolerance) return 'slower';
    return 'on-track';
  }
  if (kind === 'gain') {
    if (changePct > PLATEAU_CONFIG.fastGainPctPerWeek) return 'faster';
    if (changePct < targetPct - tolerance) return 'slower';
    return 'on-track';
  }
  return Math.abs(changePct) <= tolerance ? 'on-track' : 'drifting';
}

const HEADLINES = {
  empty: 'Bắt đầu tuần đầu tiên',
  baseline: 'Tuần đầu: lấy mốc',
  'need-data': 'Chưa đủ số liệu',
  'on-track': 'Đúng hướng',
  slower: 'Chậm hơn mục tiêu',
  faster: 'Nhanh hơn mục tiêu',
  drifting: 'Đang lệch mức duy trì',
};

function nextStep({ status, weighIns, mealsPct, kind }) {
  const missing = Math.max(0, MIN_WEIGH_INS_PER_WEEK - weighIns);
  if (status === 'empty') {
    return 'Sáng mai cân ngay sau khi ngủ dậy và tick từng bữa khi ăn xong. Chỉ vậy là đủ.';
  }
  if (missing > 0) {
    return `Cân thêm ${missing} buổi sáng trong tuần này (đã cân ${weighIns}/${MIN_WEIGH_INS_PER_WEEK}), để David đọc được xu hướng thật thay vì một lần cân lẻ.`;
  }
  if (mealsPct !== null && mealsPct < PLATEAU_CONFIG.adherenceMin) {
    return 'Ưu tiên theo đúng thực đơn và tick bữa ngay khi ăn xong. Bữa nào khó theo, ghi vào ô ghi chú để David đổi món cho dễ hơn.';
  }
  if (status === 'faster') {
    return kind === 'gain'
      ? 'Bạn đang tăng nhanh hơn mục tiêu. Đừng tự đổi khẩu phần, David sẽ xem lại.'
      : 'Bạn đang giảm nhanh hơn mục tiêu. Đừng ăn bớt thêm, David sẽ xem lại.';
  }
  if (status === 'slower' || status === 'drifting') {
    return 'Giữ nguyên cách ăn như thực đơn. David chỉ quyết định điều chỉnh sau khi xem đủ 2 tuần số liệu.';
  }
  if (status === 'on-track') return 'Giữ nhịp này. Không cần thay đổi gì.';
  return 'Tiếp tục cân buổi sáng và tick bữa đều đặn. Tuần sau sẽ có mốc để so sánh.';
}

/**
 * The client's current week.
 *
 * @param {Object} input
 *   days             per-day log from buildDailyLog (scoped to the current plan)
 *   today            ISO date, Vietnam time
 *   goalType         'gain' | 'maintain' | 'fat_loss' | 'deep_cut' | null
 *   plannedCountFor  iso -> number of meals the plan has that day
 *   rate             optional { lossPctPerWeek, gainPctPerMonth }
 */
export function weekSummary({ days = {}, today, goalType = null, plannedCountFor = () => 0, rate = {} } = {}) {
  const hasData = Object.keys(days).length > 0;
  const start = hasData ? logStartDate(days) : today;
  const index = Math.max(0, weekIndexOf(today, start));
  const weekStart = addDays(start, index * 7);
  const dayInWeek = Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${weekStart}T00:00:00Z`)) / DAY_MS) + 1;

  const current = weekWeights(days, weekStart, today);
  const previous = index > 0 ? weekWeights(days, addDays(weekStart, -7), addDays(weekStart, -1)) : { avg: null, weighIns: 0 };
  const meals = weekMeals(days, weekStart, today, plannedCountFor);

  const kind = goalKind(goalType);
  const targetPct = kind ? targetWeeklyPct(goalType, rate) : null;
  const reference = previous.avg ?? current.avg;
  const targetKg = targetPct !== null && reference !== null ? reference * targetPct / 100 : null;
  const changeKg = current.avg !== null && previous.avg !== null ? current.avg - previous.avg : null;

  let status;
  if (!hasData) status = 'empty';
  else if (index === 0 || previous.avg === null) status = 'baseline';
  else if (current.weighIns < MIN_WEIGH_INS_PER_WEEK || previous.weighIns < MIN_WEIGH_INS_PER_WEEK || !kind) status = 'need-data';
  else status = trendStatus(kind, changeKg / previous.avg * 100, targetPct);

  return {
    weekNumber: index + 1,
    weekStart,
    dayInWeek,
    status,
    headline: HEADLINES[status],
    weight: {
      avg: current.avg,
      weighIns: current.weighIns,
      needed: MIN_WEIGH_INS_PER_WEEK,
      previousAvg: previous.avg,
      changeKg,
      targetKg,
    },
    meals,
    nextStep: nextStep({ status, weighIns: current.weighIns, mealsPct: meals.pct, kind }),
  };
}
