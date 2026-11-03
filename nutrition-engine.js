// Nutrition targets for a client: calories from weight × kcal/kg for the goal, protein and fat per
// kg, carbs for the rest, and the micronutrient standard. It does not diagnose conditions or
// calculate clinical requirements.
//
// 2026-11-03: the app no longer builds menus (every client logs for themselves), so this file
// keeps only the targets. A plan is the targets, the meals a day and the coach's notes.

export const NUTRITION_ENGINE_VERSION = '1.0.0';

export const NUTRITION_STANDARD_VERSION = 'david-standard-v1';

export const CALORIE_RANGES = {
  gain: { min: 35, max: 40, label: 'Phát triển' },
  maintain: { min: 30, max: 35, label: 'Giữ cân' },
  fat_loss: { min: 25, max: 30, label: 'Cắt giảm' },
  deep_cut: { min: 20, max: 25, label: 'Cắt giảm rất sâu' },
};

export const CONDITION_RANGES = {
  very_overweight: { min: 20, max: 25, label: 'Quá béo' },
  overweight: { min: 25, max: 30, label: 'Béo' },
  normal: { min: 30, max: 30, label: 'Bình thường' },
  underweight: { min: 30, max: 35, label: 'Ốm' },
  very_underweight: { min: 35, max: 40, label: 'Quá ốm' },
};

export const FUNCTIONAL_FOODS = [
  'Củ dền', 'Cocoa', 'Matcha', 'Gừng', 'Giấm táo', 'Tảo', 'Psyllium husk',
  'Kim chi', 'Yogurt/Kefir', 'Sauerkraut hoặc dưa chua',
];

export const SUPPLEMENT_OPTIONS = [
  'Omega 3', 'D3 + K2', 'Magnesium bisglycinate/threonate', 'Creatine',
  'Taurine', 'Caffeine (khi tập sáng)', 'Glycine hoặc collagen peptides',
];

/** Daily movement outside training, and how many sessions a week. Shown to the coach next to the
 *  targets; the calorie target itself is weight × kcal/kg for the goal. */
export const MOVE_LEVELS = Object.freeze([
  Object.freeze({ value: 'itnhat', label: 'Ngồi gần như cả ngày, ít ra ngoài', base: 1.10 }),
  Object.freeze({ value: 'vua', label: 'Có đi lại, thỉnh thoảng đứng', base: 1.45 }),
  Object.freeze({ value: 'nhieu', label: 'Đi nhiều, đứng nhiều', base: 1.75 }),
  Object.freeze({ value: 'chantay', label: 'Lao động chân tay', base: 2.05 }),
]);
export const LIFT_LEVELS = Object.freeze([
  Object.freeze({ value: '0', label: 'Không tập', adjust: -0.12 }),
  Object.freeze({ value: '12', label: '1-2 buổi', adjust: -0.06 }),
  Object.freeze({ value: '34', label: '3-4 buổi', adjust: 0.00 }),
  Object.freeze({ value: '5', label: '5 buổi trở lên', adjust: +0.06 }),
]);

/** 1 kg of body mass ≈ 7700 kcal: a weekly rate of change into a daily calorie delta. */
export const KCAL_PER_KG = 7700;

/** Floors the plateau protocol will not cut below. Carb and fat floors protect training
 *  performance and hormonal function; the calorie floor is weight × 22 × 0.75. */
export const SAFETY_FLOORS = Object.freeze({
  calorieFactor: 0.75,
  carbPerKg: 1.0,
  fatPerKg: 0.5,
});

export function validateNutritionTargets(targets) {
  const kcal = Number(targets.kcal) || 0;
  const protein = Number(targets.protein) || 0;
  const carbs = Number(targets.carbs) || 0;
  const fat = Number(targets.fat) || 0;
  const macroKcal = protein * 4 + carbs * 4 + fat * 9;
  const warnings = [];
  if (kcal <= 0) warnings.push('Chưa có mục tiêu kcal.');
  if (protein <= 0) warnings.push('Chưa có mục tiêu protein.');
  const completeMacros = protein > 0 && carbs > 0 && fat > 0;
  if (kcal > 0 && !completeMacros) warnings.push('Macro chưa đủ dữ liệu; kế hoạch chỉ được xem là bản mô tả/ước tính.');
  if (kcal > 0 && macroKcal > 0 && Math.abs(macroKcal - kcal) / kcal > .08) {
    warnings.push(`Kcal quy đổi từ macro là ${macroKcal}, lệch hơn 8% so với mục tiêu ${kcal}.`);
  }
  const macroMismatch = kcal > 0 && completeMacros && Math.abs(macroKcal - kcal) / kcal > .08;
  return {
    valid: kcal > 0 && protein > 0,
    canPublish: kcal > 0 && protein > 0 && !macroMismatch,
    completeMacros,
    macroMismatch,
    macroKcal,
    warnings,
  };
}

/** A plan can go to a client once its targets hold and it says how many meals a day. */
export function validateNutritionPlanForPublish(plan = {}) {
  const targetCheck = validateNutritionTargets(plan);
  const errors = [];
  const warnings = [...targetCheck.warnings];
  if (!targetCheck.valid) errors.push('Cần có ít nhất mục tiêu kcal và protein trước khi gửi cho khách.');
  if (targetCheck.macroMismatch) errors.push('Macro mục tiêu đang lệch hơn 8% so với tổng kcal.');
  const meals = Number(plan.mealsPerDay);
  if (!(Number.isInteger(meals) && meals >= 1 && meals <= 8)) errors.push('Cần nhập số bữa mỗi ngày (1 đến 8).');
  const dataCompleteness = targetCheck.completeMacros ? 'complete' : 'partial';
  return { valid: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)], dataCompleteness };
}

function midpoint(range) { return (range.min + range.max) / 2; }
function round(value, digits = 0) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }

export function calculateSuggestedTargets(profile = {}) {
  const weightKg = Number(profile.weightKg) || 0;
  const goalRange = CALORIE_RANGES[profile.goalType] || CALORIE_RANGES.maintain;
  const conditionRange = CONDITION_RANGES[profile.bodyCondition] || CONDITION_RANGES.normal;
  const baselineKcalPerKg = midpoint(goalRange);
  const requestedKcalPerKg = Number(profile.kcalPerKg);
  // One source of truth: the goal-based kcal/kg range. Activity and body
  // condition remain coaching context; they never generate a competing target.
  const kcalPerKg = Number.isFinite(requestedKcalPerKg) && requestedKcalPerKg >= 15 && requestedKcalPerKg <= 50
    ? requestedKcalPerKg
    : baselineKcalPerKg;
  const kcal = Math.round((weightKg * kcalPerKg) / 10) * 10;
  const baselineKcal = Math.round((weightKg * baselineKcalPerKg) / 10) * 10;
  const proteinPerKg = Number(profile.proteinPerKg) || 1.9;
  const fatPerKg = Number(profile.fatPerKg) || .75;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round(weightKg * fatPerKg);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const sexFiberMin = profile.sex === 'male' ? 30 : 20;
  const sexFiberMax = profile.sex === 'male' ? 40 : 30;
  const fiber = Math.min(sexFiberMax, Math.max(sexFiberMin, round(kcal * 14 / 1000, 1)));
  const potassium = Math.round(weightKg * 90);
  const sodium = Math.round(potassium * .5);
  const calcium = 1350;
  const magnesium = Math.round(calcium * .5);
  const iron = profile.sex === 'female' ? (profile.menstrualPhase === 'period' ? 28 : 18) : 9;
  const zinc = profile.sex === 'female' ? 8 : 12;
  const warnings = [];
  if (!weightKg) warnings.push('Cần cân nặng để tính mục tiêu theo kg.');
  if ((kcal > 0 && carbs * 4 / kcal > .60) && profile.trainingLoad !== 'heavy_controlled') {
    warnings.push('Tỷ lệ carb cao: cần xác nhận khách tập nặng và kiểm soát tốt.');
  }
  if (profile.goalType === 'deep_cut') warnings.push('Cắt giảm rất sâu: bắt buộc coach theo dõi hiệu suất, form tập và tái đánh giá sát.');
  if (kcalPerKg < goalRange.min || kcalPerKg > goalRange.max) {
    warnings.push(`David đã điều chỉnh ${kcalPerKg} kcal/kg ra ngoài khung ${goalRange.min}–${goalRange.max} kcal/kg của mục tiêu này.`);
  }
  return {
    standardVersion: NUTRITION_STANDARD_VERSION,
    kcal, protein, carbs, fat,
    proteinPerKg, fatPerKg, kcalPerKg: round(kcalPerKg, 1),
    baselineKcalPerKg: round(baselineKcalPerKg, 1), baselineKcal,
    goalRange, conditionRange, method: 'goal_kcal_per_kg',
    micros: {
      fiberG: fiber,
      slowCarbSharePct: 50,
      potassiumMg: potassium,
      sodiumMg: sodium,
      calciumMg: calcium,
      magnesiumMg: magnesium,
      ironMg: iron,
      zincMg: zinc,
      bVitamins: 'B1, B6, B9, B12',
      unsaturatedToSaturatedFatRatio: '4:1',
      fiberTypes: 'Hoà tan + không hoà tan',
    },
    reassessmentWeeks: '2–4',
    warnings,
  };
}
