// ============================================================
// DAVID COACHING — Cập nhật kế hoạch đã gửi theo chuẩn mục tiêu mới (2026-11-04)
// ============================================================
// Thuần: không DOM, không Firebase. Trang nutrition-update.html đọc dữ liệu, gọi các hàm ở đây
// để ra số mới, và chỉ gửi khi David tick và xác nhận.
//
// Hai cách tính:
// - "full": kế hoạch app tự tính theo công thức cũ → tính lại toàn bộ theo chuẩn mới.
// - "resplit": kế hoạch David đã chỉnh tay → giữ tổng calo của David, chỉ chia lại macro.

import {
  CALORIE_RANGES, TRAINING_EXPERIENCE, calculateSuggestedTargets, defaultFatPerKg, goalKcalPerKg, splitMacros,
} from './nutrition-engine.js';
import { dailyWeights } from './overview-utils.js';
import { addDays } from './habit-utils.js';

/** Công thức trước 2026-11-04: kcal/kg mức giữa của khung cũ, béo 0,75 g/kg, carb phần còn lại. */
export const OLD_FORMULA = Object.freeze({
  kcalPerKg: Object.freeze({ gain: 37.5, maintain: 32.5, fat_loss: 27.5, deep_cut: 22.5 }),
  fatPerKg: 0.75,
  proteinPerKg: 1.9,
});
/** Lệch quá mức này so với công thức cũ thì coi là David đã chỉnh tay. */
export const ADJUSTED_TOLERANCE = Object.freeze({ kcal: 10, grams: 2 });
/** Cân sáng trung bình 7 ngày cần ít nhất ngần này ngày có cân. */
export const MIN_WEIGH_DAYS = 3;
export const WEIGHT_WINDOW_DAYS = 7;
export const UPDATE_LABEL = 'chuẩn mục tiêu 2026-11-04';

const GOALS = Object.keys(CALORIE_RANGES);
const round1 = (value) => Math.round(value * 10) / 10;
const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

export function goalTypeOf(plan, profile) {
  if (GOALS.includes(plan?.goalType)) return plan.goalType;
  if (GOALS.includes(profile?.goalType)) return profile.goalType;
  return 'maintain';
}

/** Cân dùng để tính: trung bình cân sáng 7 ngày gần nhất (đủ 3 ngày), không thì cân trong hồ sơ. */
export function weightForUpdate(logs = [], profileWeight = 0, today) {
  const from = addDays(today, -(WEIGHT_WINDOW_DAYS - 1));
  const days = dailyWeights(logs).filter((row) => row.day >= from && row.day <= today);
  if (days.length >= MIN_WEIGH_DAYS) {
    return { weightKg: round1(days.reduce((sum, row) => sum + row.weight, 0) / days.length), source: 'logs', days: days.length };
  }
  if (positive(profileWeight)) return { weightKg: Number(profileWeight), source: 'profile', days: days.length };
  return { weightKg: 0, source: 'none', days: days.length };
}

/** Số mà công thức cũ cho ra từ hồ sơ này (cân nặng của hồ sơ), hoặc null khi hồ sơ thiếu cân. */
export function oldFormulaTargets(profile = {}, goalType = goalTypeOf(null, profile)) {
  const weightKg = Number(profile?.weightKg) || 0;
  if (!weightKg) return null;
  const requested = Number(profile.kcalPerKg);
  const kcalPerKg = requested >= 15 && requested <= 50 ? requested : OLD_FORMULA.kcalPerKg[goalType];
  const kcal = Math.round((weightKg * kcalPerKg) / 10) * 10;
  const protein = Math.round(weightKg * (Number(profile.proteinPerKg) || OLD_FORMULA.proteinPerKg));
  const fat = Math.round(weightKg * (Number(profile.fatPerKg) || OLD_FORMULA.fatPerKg));
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

/**
 * Kế hoạch David đã chỉnh tay: calorieBasis ghi coachAdjusted, hoặc kcal/P/C/F lệch số công thức
 * cũ ra từ cùng hồ sơ quá 10 kcal hoặc 2 g. Không có hồ sơ để đối chiếu thì cũng coi là chỉnh tay
 * (giữ calo của David cho an toàn).
 */
export function isCoachAdjusted(plan = {}, profile = {}) {
  if (plan?.calorieBasis?.coachAdjusted === true) return true;
  const old = oldFormulaTargets(profile, goalTypeOf(plan, profile));
  if (!old) return true;
  if (Math.abs((Number(plan.kcal) || 0) - old.kcal) > ADJUSTED_TOLERANCE.kcal) return true;
  return ['protein', 'carbs', 'fat'].some((key) => Math.abs((Number(plan[key]) || 0) - old[key]) > ADJUSTED_TOLERANCE.grams);
}

const validExperience = (value) => (TRAINING_EXPERIENCE.some((item) => item.value === value) ? value : '');
const validMeals = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 8 ? number : null;
};

/** Ô của hồ sơ chỉ được giữ khi David đã nhập khác mặc định cũ (cùng quy tắc trang Tạo kế hoạch). */
function profileKcalPerKg(profile, goalType, experience) {
  const stored = Number(profile?.kcalPerKg);
  if (!stored || stored === OLD_FORMULA.kcalPerKg[goalType]) return goalKcalPerKg(goalType, experience);
  return stored;
}
function profileFatPerKg(profile, goalType) {
  const stored = Number(profile?.fatPerKg);
  if (!stored || (stored === OLD_FORMULA.fatPerKg && defaultFatPerKg(goalType) !== OLD_FORMULA.fatPerKg)) return defaultFatPerKg(goalType);
  return stored;
}

/**
 * Đề xuất cho một học viên.
 * @returns {{goalType, mode:'full'|'resplit', weight, experience, mealsPerDay, before, after, changed:string[], issues:string[], ready:boolean, suggestion}}
 */
export function proposeUpdate({ plan, profile = {}, weightLogs = [], experience = '', mealsPerDay = null, today }) {
  const goalType = goalTypeOf(plan, profile);
  const mode = isCoachAdjusted(plan, profile) ? 'resplit' : 'full';
  const weight = weightForUpdate(weightLogs, profile?.weightKg, today);
  const exp = validExperience(experience);
  const meals = validMeals(mealsPerDay);
  const before = { kcal: Number(plan?.kcal) || 0, protein: Number(plan?.protein) || 0, carbs: Number(plan?.carbs) || 0, fat: Number(plan?.fat) || 0 };
  const issues = [];
  if (!weight.weightKg) issues.push('Thiếu cân nặng (hồ sơ và cân 7 ngày đều trống).');
  if (mode === 'full' && goalType === 'gain' && !exp) issues.push('Chọn kinh nghiệm tập.');
  if (!meals) issues.push('Nhập số bữa/ngày (1–8).');
  if (mode === 'resplit' && !(before.kcal > 0)) issues.push('Kế hoạch chưa có tổng calo để giữ.');

  let after = null;
  let suggestion = null;
  if (weight.weightKg && (mode === 'resplit' ? before.kcal > 0 : true)) {
    const proteinPerKg = Number(profile?.proteinPerKg) || OLD_FORMULA.proteinPerKg;
    if (mode === 'resplit') {
      const split = splitMacros({ weightKg: weight.weightKg, kcal: before.kcal, proteinPerKg, fatPerKg: defaultFatPerKg(goalType) });
      after = { kcal: before.kcal, protein: split.protein, carbs: split.carbs, fat: split.fat };
      suggestion = { carbCap: split.carbCap, fatPerKg: defaultFatPerKg(goalType), proteinPerKg, surplusPct: 0 };
    } else {
      suggestion = calculateSuggestedTargets({
        ...profile, weightKg: weight.weightKg, goalType, trainingExperience: exp,
        proteinPerKg, kcalPerKg: profileKcalPerKg(profile, goalType, exp), fatPerKg: profileFatPerKg(profile, goalType),
      });
      after = { kcal: suggestion.kcal, protein: suggestion.protein, carbs: suggestion.carbs, fat: suggestion.fat };
    }
  }
  const changed = after ? ['kcal', 'protein', 'carbs', 'fat'].filter((key) => after[key] !== before[key]) : [];
  return {
    goalType, mode, weight, experience: exp, mealsPerDay: meals, before, after, changed, issues,
    ready: issues.length === 0 && Boolean(after), suggestion,
  };
}

/** Kế hoạch sẽ gửi lại: chỉ đổi kcal, macro, số bữa và calorieBasis; mọi phần khác giữ nguyên. */
export function buildUpdatedPlan(plan, proposal, { today } = {}) {
  if (!proposal?.ready) throw new Error('Đề xuất chưa đủ thông tin để gửi.');
  const { after, suggestion } = proposal;
  const calorieBasis = {
    ...(plan.calorieBasis && typeof plan.calorieBasis === 'object' ? plan.calorieBasis : {}),
    method: proposal.mode === 'full' ? 'goal_kcal_per_kg' : 'coach_kcal_resplit',
    coachAdjusted: proposal.mode === 'resplit',
    updatedFor: UPDATE_LABEL,
    updatedOn: today || '',
    weightKg: proposal.weight.weightKg,
    weightSource: proposal.weight.source,
    surplusPct: suggestion?.surplusPct || 0,
    carbCapped: Boolean(suggestion?.carbCap?.capped),
    ...(proposal.mode === 'full' ? { kcalPerKg: suggestion.kcalPerKg, baselineKcalPerKg: suggestion.baselineKcalPerKg, baselineKcal: suggestion.baselineKcal, goalRange: suggestion.goalRange } : {}),
  };
  const { versionId, publishedAt, updatedAt, createdAt, status, active, ...rest } = plan;
  return {
    ...rest,
    ...after,
    goalType: proposal.goalType,
    mealsPerDay: proposal.mealsPerDay,
    calorieBasis,
    standardVersion: suggestion?.standardVersion || plan.standardVersion || '',
    dataCompleteness: after.protein > 0 && after.carbs > 0 && after.fat > 0 ? 'complete' : 'partial',
  };
}
