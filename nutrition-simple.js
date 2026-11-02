// ============================================================
// DAVID COACHING — Dinh dưỡng chế độ đơn giản (David, 2026-11-02)
// ============================================================
// Thuần: không DOM, không Firebase.
//
// Phần lớn học viên không ăn đúng thực đơn tính theo gram. Chế độ đơn giản chỉ hỏi 3 việc
// mỗi ngày: (1) mỗi bữa có đủ đạm và rau không, (2) có đạt số bước chân yêu cầu không,
// (3) cân buổi sáng. Kết quả được đọc qua cân nặng trung bình tuần, không qua từng bữa.
// Mọi học viên mặc định ở chế độ này; coach bật "chế độ chi tiết" cho từng người.
//
// Không bịa số: số bước và số bữa do coach đặt (số bữa có thể lấy từ thực đơn). Thiếu thì
// câu hỏi đó ẩn đi hoặc báo coach cần đặt.

import { mealsForDate } from './nutrition-week-utils.js';

export const NUTRITION_MODES = Object.freeze(['simple', 'detailed']);
export const MAX_MEALS_PER_DAY = 8;
export const MAX_STEP_TARGET = 100000;
export const MAX_PROTEIN_NOTE = 160;

const wholeIn = (value, min, max) => {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
};

/** Cài đặt dinh dưỡng của một học viên, đã làm sạch. Thiếu thì chế độ đơn giản, các số để trống. */
export function normalizeNutritionSettings(raw = {}) {
  return {
    mode: raw?.mode === 'detailed' ? 'detailed' : 'simple',
    stepTarget: wholeIn(raw?.stepTarget, 1, MAX_STEP_TARGET),
    mealsPerDay: wholeIn(raw?.mealsPerDay, 1, MAX_MEALS_PER_DAY),
    proteinNote: String(raw?.proteinNote ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_PROTEIN_NOTE),
  };
}

/** Lỗi khi coach nhập cài đặt; rỗng là hợp lệ. Ô để trống luôn hợp lệ. */
export function settingsErrors(raw = {}) {
  const errors = [];
  const filled = (value) => !(value === '' || value === null || value === undefined);
  if (filled(raw.stepTarget) && wholeIn(raw.stepTarget, 1, MAX_STEP_TARGET) === null) errors.push(`Số bước mục tiêu phải là số nguyên từ 1 đến ${MAX_STEP_TARGET.toLocaleString('vi-VN')}.`);
  if (filled(raw.mealsPerDay) && wholeIn(raw.mealsPerDay, 1, MAX_MEALS_PER_DAY) === null) errors.push(`Số bữa mỗi ngày phải là số nguyên từ 1 đến ${MAX_MEALS_PER_DAY}.`);
  if (String(raw.proteinNote ?? '').trim().length > MAX_PROTEIN_NOTE) errors.push(`Dòng "đủ đạm" tối đa ${MAX_PROTEIN_NOTE} ký tự.`);
  return errors;
}

export function nutritionMode(student) {
  return normalizeNutritionSettings(student?.nutritionSettings).mode;
}

/** Số bữa của một ngày: coach đặt trước, rồi tới số bữa của thực đơn hôm đó; không có thì null. */
export function mealCountFor(settings, plan, iso) {
  const clean = normalizeNutritionSettings(settings);
  if (clean.mealsPerDay) return clean.mealsPerDay;
  const fromPlan = plan ? mealsForDate(plan, iso).length : 0;
  return fromPlan || null;
}

/**
 * Dòng giải thích "đủ đạm": lời của David trước; không có thì đạm/ngày của thực đơn chia số bữa;
 * không có cả hai thì một câu chung, không có số.
 */
export function proteinGuide(settings, plan, mealCount) {
  const clean = normalizeNutritionSettings(settings);
  if (clean.proteinNote) return clean.proteinNote;
  const daily = Number(plan?.protein);
  if (Number.isFinite(daily) && daily > 0 && mealCount) return `Khoảng ${Math.round(daily / mealCount)} g đạm mỗi bữa, kèm một phần rau.`;
  return 'Mỗi bữa có một món đạm và một phần rau.';
}

/** Những gì học viên ghi trong một ngày ở chế độ đơn giản, đã làm sạch để lưu. */
export function normalizeSimpleDay(raw = {}) {
  const count = wholeIn(raw.simpleMealCount, 1, MAX_MEALS_PER_DAY);
  const meals = count
    ? [...new Set((Array.isArray(raw.simpleMeals) ? raw.simpleMeals : []).map(Number))]
      .filter((index) => Number.isInteger(index) && index >= 0 && index < count)
      .sort((a, b) => a - b)
    : [];
  const steps = raw.steps === '' || raw.steps === null || raw.steps === undefined ? null : Number(raw.steps);
  return {
    simpleMeals: meals,
    simpleMealCount: count,
    stepsMet: raw.stepsMet === true ? true : raw.stepsMet === false ? false : null,
    steps: Number.isFinite(steps) && steps >= 0 ? Math.min(MAX_STEP_TARGET, Math.round(steps)) : null,
  };
}

/** Có đạt bước không: học viên chọn Đạt/Chưa đạt; nếu chỉ nhập số bước thì so với mục tiêu. */
export function stepsMetFor(day, stepTarget) {
  if (day?.stepsMet === true || day?.stepsMet === false) return day.stepsMet;
  const steps = Number(day?.steps);
  if (stepTarget && day?.steps !== null && day?.steps !== undefined && Number.isFinite(steps)) return steps >= stepTarget;
  return null;
}

/**
 * Tóm tắt các ngày ở chế độ đơn giản.
 * @param {Array<{date:string}>} days  các ngày cần tính, mỗi ngày kèm checkin (có thể null)
 * @returns {{meals:{done:number, planned:number, rate:number|null}, steps:{met:number, answered:number, days:number}, perDay:Array}}
 */
export function simpleSummary(days = [], { settings = {}, plan = null } = {}) {
  const clean = normalizeNutritionSettings(settings);
  const perDay = days.map(({ date, checkin }) => {
    // Số bữa của ngày đã ghi thì giữ đúng như lúc ghi; ngày chưa ghi thì theo cài đặt hiện tại.
    const planned = wholeIn(checkin?.simpleMealCount, 1, MAX_MEALS_PER_DAY) || mealCountFor(clean, plan, date) || 0;
    const done = Math.min(planned, normalizeSimpleDay({ ...checkin, simpleMealCount: planned }).simpleMeals.length);
    const stepsMet = clean.stepTarget ? stepsMetFor(checkin, clean.stepTarget) : null;
    const status = !planned ? 'none' : done >= planned ? 'full' : done > 0 ? 'partial' : 'missed';
    return { date, planned, done, stepsMet, status, checkin: checkin || null };
  });
  const planned = perDay.reduce((sum, day) => sum + day.planned, 0);
  const done = perDay.reduce((sum, day) => sum + day.done, 0);
  return {
    perDay,
    meals: { done, planned, rate: planned ? done / planned : null },
    steps: {
      met: perDay.filter((day) => day.stepsMet === true).length,
      answered: perDay.filter((day) => day.stepsMet !== null).length,
      days: clean.stepTarget ? perDay.length : 0,
    },
  };
}
