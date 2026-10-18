// ============================================================
// DAVID TRAINING PROGRAM — The week of a nutrition plan
// ============================================================
// A plan used to hold one day of meals that the client saw every day. It can now also hold
// a week: seven days, Monday to Sunday, each with its own meals. The week repeats until the
// coach sends a new one.
//
// The week lives beside the old single day, never instead of it: `plan.meals` is kept (it
// mirrors Monday) so a plan saved before weeks existed, and any reader that only knows
// `plan.meals`, keeps working. Every reader goes through mealsForDate() below, which answers
// "what does this client eat on this date" for both kinds of plan.
//
// Pure: no DOM, no Firebase. Shared by the coach's builder and the client's pages.

export const WEEK_DAYS = Object.freeze([
  Object.freeze({ id: 'mon', label: 'Thứ Hai', short: 'T2' }),
  Object.freeze({ id: 'tue', label: 'Thứ Ba', short: 'T3' }),
  Object.freeze({ id: 'wed', label: 'Thứ Tư', short: 'T4' }),
  Object.freeze({ id: 'thu', label: 'Thứ Năm', short: 'T5' }),
  Object.freeze({ id: 'fri', label: 'Thứ Sáu', short: 'T6' }),
  Object.freeze({ id: 'sat', label: 'Thứ Bảy', short: 'T7' }),
  Object.freeze({ id: 'sun', label: 'Chủ nhật', short: 'CN' }),
]);

/**
 * How much the week repeats itself. The generator reads these; the labels are shown to the coach.
 *
 * David's rule (2026-10-18): a dish is served on at most two days of a week, at every level.
 * "Cân bằng" used to start reusing the week's dishes on purpose from Wednesday, to keep the
 * shopping short, and the week came out as a three-day rotation — Thursday a copy of Monday,
 * Friday of Tuesday. It now always reaches for a new dish first and repeats one only when no
 * new dish fits the day. Only "Dễ chuẩn bị" still repeats on purpose, for a client who cooks
 * once and eats it two days running.
 */
export const WEEK_VARIETY = Object.freeze({
  easy: Object.freeze({
    id: 'easy', label: 'Dễ chuẩn bị',
    hint: 'Nấu một lần ăn hai ngày: mỗi món tối đa 2 ngày mỗi tuần và được ăn lại ngày hôm sau, đi chợ gọn hơn.',
    maxPerWeek: 2, allowAdjacent: true, reuseFromDay: 2,
  }),
  balanced: Object.freeze({
    id: 'balanced', label: 'Cân bằng',
    hint: 'Ưu tiên món mới mỗi ngày. Một món chỉ lặp lại khi không còn món mới phù hợp, tối đa 2 ngày mỗi tuần và không hai ngày liền nhau.',
    maxPerWeek: 2, allowAdjacent: false, reuseFromDay: null,
  }),
  varied: Object.freeze({
    id: 'varied', label: 'Đa dạng tối đa',
    hint: 'Cố gắng không trùng món nào trong 7 ngày. Khách phải mua nhiều nguyên liệu và nấu mới gần như mọi bữa.',
    maxPerWeek: 1, allowAdjacent: false, reuseFromDay: null,
  }),
});

export const DEFAULT_WEEK_VARIETY = 'balanced';

export function weekVariety(id) {
  return WEEK_VARIETY[id] || WEEK_VARIETY[DEFAULT_WEEK_VARIETY];
}

/** 0 for Monday … 6 for Sunday, from a calendar date written YYYY-MM-DD. Read as a plain
 *  calendar date (never through the device's time zone), so it cannot slip a day. */
export function weekdayIndexOf(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!match) return 0;
  const sundayFirst = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).getUTCDay();
  return (sundayFirst + 6) % 7;
}

/** The seven days of a plan's week in Monday-first order, or null when the plan has no
 *  usable week. A week counts only when every day has at least one meal: a half-filled
 *  week would leave the client with an empty screen on some days. */
export function planWeekDays(plan) {
  const stored = Array.isArray(plan?.week?.days) ? plan.week.days : null;
  if (!stored) return null;
  const days = WEEK_DAYS.map((day) => {
    const found = stored.find((item) => item?.id === day.id);
    return { ...day, meals: Array.isArray(found?.meals) ? found.meals : [], gramPlan: found?.gramPlan || null };
  });
  return days.every((day) => day.meals.length > 0) ? days : null;
}

export function hasWeekMenu(plan) {
  return planWeekDays(plan) !== null;
}

/** The meals for a calendar date: that weekday's meals when the plan has a week, else the
 *  plan's single day. */
export function mealsForDate(plan, iso) {
  const days = planWeekDays(plan);
  if (days) return days[weekdayIndexOf(iso)].meals;
  return Array.isArray(plan?.meals) ? plan.meals : [];
}

/** kcal and macros a list of meals adds up to. */
export function mealTotals(meals = []) {
  const round1 = (value) => Math.round(value * 10) / 10;
  const sum = meals.reduce((total, meal) => ({
    kcal: total.kcal + (Number(meal?.kcal) || 0),
    protein: total.protein + (Number(meal?.protein) || 0),
    carbs: total.carbs + (Number(meal?.carbs) || 0),
    fat: total.fat + (Number(meal?.fat) || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  return { kcal: Math.round(sum.kcal), protein: round1(sum.protein), carbs: round1(sum.carbs), fat: round1(sum.fat) };
}

/** The name a meal is known by in the week: its dish (the first line when that line names no
 *  gram amount), else the first food line. Read from the text the coach can edit, so it
 *  never disagrees with what the client sees. */
export function mealHeadline(meal) {
  const first = String((meal?.items || [])[0] || '').trim();
  if (!first) return String(meal?.name || '').trim();
  return first.replace(/\s+—\s+\d[\d.,]*\s*g\b.*$/, '').replace(/\s*\(mua sẵn được\)\s*$/, '').trim();
}

/** How varied a week is, counted on the names the client reads. */
export function weekStats(days = []) {
  const counts = new Map();
  for (const day of days) {
    for (const meal of day?.meals || []) {
      const name = mealHeadline(meal);
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    }
  }
  const values = [...counts.values()];
  return {
    meals: values.reduce((sum, value) => sum + value, 0),
    distinct: counts.size,
    repeats: values.reduce((sum, value) => sum + (value - 1), 0),
    mostRepeated: values.length ? Math.max(...values) : 0,
  };
}
