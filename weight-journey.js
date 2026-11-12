// ============================================================
// DAVID COACHING — Hành trình cân nặng và ghi bữa từ lúc bắt đầu (David, 2026-11-12)
// ============================================================
// Thuần: không DOM, không Firebase. Trang Tổng quan học viên → Cân nặng: mỗi tuần một dòng, tính từ
// ngày học viên bắt đầu ghi (lần cân hoặc lần ghi bữa sớm nhất) đến hôm nay. Mỗi dòng: số ngày
// có cân, cân trung bình, thay đổi so với tuần trước và so với tuần đầu, số ngày ghi bữa. Đọc được
// luôn: cân không đổi vì không theo kế hoạch hay vì kế hoạch chưa đúng.

import { todayIso } from './nutrition-log-utils.js';
import { addDays } from './habit-utils.js';
import { daysBetween } from './home-utils.js';
import { dailyWeights } from './overview-utils.js';
import { hasNutritionLog } from './nutrition-streak.js';

/** Số lần cân và số ngày dinh dưỡng đọc cho trang của một học viên (khoảng 2 năm). */
export const JOURNEY_MAX = 730;

const round2 = (value) => Math.round(value * 100) / 100;
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * @param weights các lần ghi cân ({ weight, loggedAt })
 * @param checkins các ngày dinh dưỡng (id hoặc date = YYYY-MM-DD)
 * @param capped đã đọc tới giới hạn JOURNEY_MAX: có thể còn dữ liệu cũ hơn
 * @returns null khi chưa ghi gì; không thì { start, totalDays, weeks (mới trước), summary, capped }
 */
export function weightJourney(weights = [], checkins = [], { today = todayIso(), capped = false } = {}) {
  const daily = dailyWeights(weights).filter((row) => row.day <= today);
  const mealDays = new Set(checkins.filter(hasNutritionLog).map((row) => String(row.date || row.id || ''))
    .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today));
  const firsts = [daily[0]?.day, [...mealDays].sort()[0]].filter(Boolean).sort();
  if (!firsts.length) return null;
  const start = firsts[0];
  const totalDays = daysBetween(start, today) + 1;
  const weekCount = Math.ceil(totalDays / 7);

  let firstAvg = null;
  let previousAvg = null;
  const weeks = [];
  for (let index = 0; index < weekCount; index++) {
    const from = addDays(start, index * 7);
    const end = addDays(from, 6);
    const to = end < today ? end : today;
    const values = daily.filter((row) => row.day >= from && row.day <= to).map((row) => row.weight);
    const avg = values.length ? round2(mean(values)) : null;
    let meals = 0;
    for (let day = from; day <= to; day = addDays(day, 1)) if (mealDays.has(day)) meals++;
    // Tuần đầu có cân là mốc: chính nó không có "so với tuần đầu".
    const isBaseline = avg !== null && firstAvg === null;
    if (isBaseline) firstAvg = avg;
    weeks.push({
      index: index + 1,
      from,
      to,
      days: daysBetween(from, to) + 1,
      current: to === today && end > today,
      weighDays: values.length,
      avg,
      changePrev: avg !== null && previousAvg !== null ? round2(avg - previousAvg) : null,
      changeStart: avg !== null && !isBaseline ? round2(avg - firstAvg) : null,
      baseline: isBaseline,
      mealDays: meals,
    });
    if (avg !== null) previousAvg = avg;
  }

  const withWeight = weeks.filter((week) => week.avg !== null);
  const first = withWeight[0] || null;
  const last = withWeight[withWeight.length - 1] || null;
  const span = first && last ? last.index - first.index : 0;
  const total = first && last && span > 0 ? round2(last.avg - first.avg) : null;
  return {
    start,
    totalDays,
    capped,
    weeks: weeks.reverse(),
    summary: {
      weekCount,
      firstAvg: first?.avg ?? null,
      currentAvg: last?.avg ?? null,
      totalChange: total,
      perWeek: total !== null ? round2(total / span) : null,
      weighDays: daily.filter((row) => row.day >= start).length,
      mealDays: mealDays.size,
    },
  };
}
