// Nutrition targets for a client: calories from weight × kcal/kg for the goal, protein and fat per
// kg, carbs for the rest, and the micronutrient standard. It does not diagnose conditions or
// calculate clinical requirements.
//
// 2026-11-03: the app no longer builds menus (every client logs for themselves), so this file
// keeps only the targets. A plan is the targets, the meals a day and the coach's notes.

import { micronutrientTargets } from './nutrition-rni.js';
import { t, locale } from './i18n.js';

export const NUTRITION_ENGINE_VERSION = '1.0.0';

export const NUTRITION_STANDARD_VERSION = 'david-standard-v1';

// Phát triển (David, 2026-11-04): mức Giữ cân cộng thêm một phần dư nhỏ, thay cho 35–40 kcal/kg cũ
// (khách 70 kg ra 405 g carb/ngày, khó bám). +10% cho người mới bắt đầu tập, +5% cho người đã có
// kinh nghiệm; chưa chọn thì +5% cho thận trọng.
export const GAIN_SURPLUS = Object.freeze({ beginner: 0.10, experienced: 0.05 });
export const DEFAULT_GAIN_SURPLUS = GAIN_SURPLUS.experienced;
export const TRAINING_EXPERIENCE = Object.freeze([
  Object.freeze({ value: 'beginner', label: t('ne.moi_bat_dau_tap') }),
  Object.freeze({ value: 'experienced', label: t('ne.da_co_kinh_nghiem') }),
]);

const MAINTAIN_RANGE = { min: 30, max: 35 };
const MAINTAIN_MID = (MAINTAIN_RANGE.min + MAINTAIN_RANGE.max) / 2;
const round1 = (value) => Math.round(value * 10) / 10;

export const CALORIE_RANGES = {
  gain: { min: round1(MAINTAIN_MID * (1 + GAIN_SURPLUS.experienced)), max: round1(MAINTAIN_MID * (1 + GAIN_SURPLUS.beginner)), label: t('ne.phat_trien') },
  maintain: { ...MAINTAIN_RANGE, label: t('ne.giu_can') },
  fat_loss: { min: 25, max: 30, label: t('ne.cat_giam') },
  deep_cut: { min: 20, max: 25, label: t('ne.cat_giam_rat_sau') },
};

/** Chất béo mặc định theo mục tiêu (David, 2026-11-04). 0,6 g/kg là mức tối thiểu khi giảm cân. */
export const FAT_PER_KG_BY_GOAL = Object.freeze({ fat_loss: 0.6, deep_cut: 0.6, maintain: 0.75, gain: 1 });
export const FAT_FLOOR_PER_KG = 0.6;
/** Protein mặc định theo mục tiêu: cắt càng sâu càng gần trần 2,2 g/kg. */
export const PROTEIN_PER_KG_BY_GOAL = Object.freeze({ fat_loss: 1.9, deep_cut: 2.2, maintain: 1.9, gain: 1.9 });
export const PROTEIN_MAX_PER_KG = 2.2;
/** Thâm hụt khi giảm cân, tính từ mức Giữ cân: trừ tối đa `kcal`, nhưng không quá `pct` mức Giữ cân. */
export const DEFICIT = Object.freeze({
  fat_loss: Object.freeze({ kcal: 500, pct: 0.20 }),
  deep_cut: Object.freeze({ kcal: 750, pct: 0.20 }),
});
/** Khoảng carb theo mục tiêu (g/kg). Phát triển: trần 5 khi tập nặng + kiểm soát tốt và thể trạng
 *  không thừa mỡ, còn lại trần 4. */
export const CARB_RANGE_BY_GOAL = Object.freeze({
  fat_loss: Object.freeze({ min: 2, max: 2.5 }),
  deep_cut: Object.freeze({ min: 2, max: 2.5 }),
  maintain: Object.freeze({ min: 3, max: 3.5 }),
  gain: Object.freeze({ min: 4, max: 4 }),
});
export const GAIN_CARB_MAX_HEAVY = 5;
const LEAN_CONDITIONS = new Set(['normal', 'underweight', 'very_underweight']);
/** Trần carb chung cũ (2026-11-04 sáng); nay mỗi mục tiêu có khoảng riêng. Giữ cho lời giải thích cũ. */
export const CARB_MAX_PER_KG = 4;

export const DEEP_CUT_WARNING = t('ne.cat_giam_rat_sau_khong_phai');

/** Phần dư calo của mục tiêu Phát triển theo kinh nghiệm tập. */
export function gainSurplus(experience) {
  return GAIN_SURPLUS[experience] ?? DEFAULT_GAIN_SURPLUS;
}

/** kcal/kg mặc định của một mục tiêu. Phát triển = mức giữa của Giữ cân × (1 + phần dư). */
export function goalKcalPerKg(goalType, experience, weightKg = 0) {
  if (Number(weightKg) > 0) return goalCalories(goalType, weightKg, experience).kcalPerKg;
  if (goalType === 'gain') return round1(MAINTAIN_MID * (1 + gainSurplus(experience)));
  if (DEFICIT[goalType]) return round1(MAINTAIN_MID * (1 - DEFICIT[goalType].pct));
  return MAINTAIN_MID;
}

/** kcal/kg mà các bản trước để mặc định (không phải David chọn): coi như "để app tự tính". */
export const LEGACY_DEFAULT_KCAL_PER_KG = Object.freeze({
  gain: Object.freeze([37.5, 34.1, 35.8]), maintain: Object.freeze([32.5]), fat_loss: Object.freeze([27.5]), deep_cut: Object.freeze([22.5]),
});
export function isLegacyDefaultKcalPerKg(value, goalType) {
  return (LEGACY_DEFAULT_KCAL_PER_KG[goalType] || []).includes(Number(value));
}

export function defaultFatPerKg(goalType) {
  return FAT_PER_KG_BY_GOAL[goalType] ?? FAT_PER_KG_BY_GOAL.maintain;
}

export function defaultProteinPerKg(goalType) {
  return PROTEIN_PER_KG_BY_GOAL[goalType] ?? PROTEIN_PER_KG_BY_GOAL.maintain;
}

/** Khoảng carb (g/kg) cho mục tiêu này, kèm lý do khi là Phát triển. */
export function carbRangeFor(goalType, { trainingLoad = '', bodyCondition = '' } = {}) {
  if (goalType === 'gain') {
    const heavy = trainingLoad === 'heavy_controlled' && LEAN_CONDITIONS.has(bodyCondition || 'normal');
    return { min: CARB_RANGE_BY_GOAL.gain.min, max: heavy ? GAIN_CARB_MAX_HEAVY : CARB_RANGE_BY_GOAL.gain.max, heavy };
  }
  return { ...(CARB_RANGE_BY_GOAL[goalType] || CARB_RANGE_BY_GOAL.maintain), heavy: false };
}

/**
 * Calo tự động theo mục tiêu, tính từ mức Giữ cân M = cân nặng × 32,5 kcal/kg:
 * Phát triển M × (1 + phần dư); Cắt giảm / Cắt sâu M − min(kcal, % × M). Làm tròn 10 kcal.
 */
export function goalCalories(goalType, weightKg, experience = '') {
  const weight = Number(weightKg) || 0;
  const maintenance = weight * MAINTAIN_MID;
  let kcal = maintenance;
  let deficitKcal = 0;
  let surplusPct = 0;
  if (goalType === 'gain') {
    surplusPct = Math.round(gainSurplus(experience) * 100);
    kcal = maintenance * (1 + gainSurplus(experience));
  } else if (DEFICIT[goalType]) {
    deficitKcal = Math.round(Math.min(DEFICIT[goalType].kcal, maintenance * DEFICIT[goalType].pct));
    kcal = maintenance - deficitKcal;
  }
  const rounded = Math.round(kcal / 10) * 10;
  return {
    kcal: rounded,
    maintenanceKcal: Math.round(maintenance),
    deficitKcal,
    deficitPct: maintenance > 0 ? Math.round((deficitKcal / maintenance) * 100) : 0,
    surplusPct,
    kcalPerKg: weight > 0 ? round1(rounded / weight) : 0,
  };
}

export const CONDITION_RANGES = {
  very_overweight: { min: 20, max: 25, label: t('ne.qua_beo') },
  overweight: { min: 25, max: 30, label: t('ne.beo') },
  normal: { min: 30, max: 30, label: t('ne.binh_thuong') },
  underweight: { min: 30, max: 35, label: t('ne.om') },
  very_underweight: { min: 35, max: 40, label: t('ne.qua_om') },
};

export const FUNCTIONAL_FOODS = [ // i18n-data
  'Củ dền', 'Cocoa', 'Matcha', 'Gừng', 'Giấm táo', 'Tảo', 'Psyllium husk', // i18n-data
  'Kim chi', 'Yogurt/Kefir', 'Sauerkraut hoặc dưa chua', // i18n-data
]; // i18n-data

export const SUPPLEMENT_OPTIONS = [ // i18n-data
  'Omega 3', 'D3 + K2', 'Magnesium bisglycinate/threonate', 'Creatine', // i18n-data
  'Taurine', 'Caffeine (khi tập sáng)', 'Glycine hoặc collagen peptides', // i18n-data
];

/** Daily movement outside training, and how many sessions a week. Shown to the coach next to the
 *  targets; the calorie target itself is weight × kcal/kg for the goal. */
export const MOVE_LEVELS = Object.freeze([
  Object.freeze({ value: 'itnhat', label: t('ne.ngoi_gan_nhu_ca_ngay_it'), base: 1.10 }),
  Object.freeze({ value: 'vua', label: t('ne.co_di_lai_thinh_thoang_dung'), base: 1.45 }),
  Object.freeze({ value: 'nhieu', label: t('ne.di_nhieu_dung_nhieu'), base: 1.75 }),
  Object.freeze({ value: 'chantay', label: t('ne.lao_dong_chan_tay'), base: 2.05 }),
]);
export const LIFT_LEVELS = Object.freeze([
  Object.freeze({ value: '0', label: t('ne.khong_tap'), adjust: -0.12 }),
  Object.freeze({ value: '12', label: t('ne.1_2_buoi'), adjust: -0.06 }),
  Object.freeze({ value: '34', label: t('ne.3_4_buoi'), adjust: 0.00 }),
  Object.freeze({ value: '5', label: t('ne.5_buoi_tro_len'), adjust: +0.06 }),
]);

/** 1 kg of body mass ≈ 7700 kcal: a weekly rate of change into a daily calorie delta. */
export const KCAL_PER_KG = 7700;

/** Floors the plateau protocol will not cut below. Carb and fat floors protect training
 *  performance and hormonal function; the calorie floor is weight × 22 × 0.75. */
export const SAFETY_FLOORS = Object.freeze({
  calorieFactor: 0.75,
  carbPerKg: 1.0,
  fatPerKg: 0.6,
});

export function validateNutritionTargets(targets) {
  const kcal = Number(targets.kcal) || 0;
  const protein = Number(targets.protein) || 0;
  const carbs = Number(targets.carbs) || 0;
  const fat = Number(targets.fat) || 0;
  const macroKcal = protein * 4 + carbs * 4 + fat * 9;
  const warnings = [];
  if (kcal <= 0) warnings.push(t('ne.chua_co_muc_tieu_kcal'));
  if (protein <= 0) warnings.push(t('ne.chua_co_muc_tieu_protein'));
  const completeMacros = protein > 0 && carbs > 0 && fat > 0;
  if (kcal > 0 && !completeMacros) warnings.push(t('ne.macro_chua_du_du_lieu_ke'));
  if (kcal > 0 && macroKcal > 0 && Math.abs(macroKcal - kcal) / kcal > .08) {
    warnings.push(`${t('ne.kcal_quy_doi_tu_macro_la', { p0: macroKcal, p1: kcal })}`);
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
  if (!targetCheck.valid) errors.push(t('ne.can_co_it_nhat_muc_tieu'));
  if (targetCheck.macroMismatch) errors.push(t('ne.macro_muc_tieu_dang_lech_hon'));
  const meals = Number(plan.mealsPerDay);
  if (!(Number.isInteger(meals) && meals >= 1 && meals <= 8)) errors.push(t('ne.can_nhap_so_bua_moi_ngay'));
  const dataCompleteness = targetCheck.completeMacros ? 'complete' : 'partial';
  return { valid: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)], dataCompleteness };
}

function midpoint(range) { return (range.min + range.max) / 2; }
function round(value, digits = 0) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }

/**
 * Chia một mức calo thành macro. Protein và chất béo theo g/kg, carb là phần còn lại, rồi đưa carb
 * vào khoảng của mục tiêu:
 * - vượt trần: carb = trần; phần dư sang protein (tới PROTEIN_MAX_PER_KG), còn dư nữa sang béo;
 * - dưới mức dưới: lấy bớt calo từ béo (không xuống dưới FAT_FLOOR_PER_KG) để bù carb; vẫn thiếu
 *   thì giữ nguyên và báo belowFloor.
 * Protein coach nhập trên trần được giữ nguyên.
 */
export function splitMacros({ weightKg, kcal, proteinPerKg, fatPerKg, carbRange = { min: 0, max: CARB_MAX_PER_KG } }) {
  const weight = Number(weightKg) || 0;
  let protein = Math.round(weight * (Number(proteinPerKg) || 0));
  let fat = Math.round(weight * (Number(fatPerKg) || 0));
  let carbs = Math.max(0, Math.round(((Number(kcal) || 0) - protein * 4 - fat * 9) / 4));
  const carbMax = Math.floor(weight * (Number(carbRange.max) || CARB_MAX_PER_KG));
  const carbMin = Math.ceil(weight * (Number(carbRange.min) || 0));
  let movedToProtein = 0;
  let movedToFat = 0;
  let movedFromFat = 0;
  const capped = weight > 0 && carbs > carbMax;
  if (capped) {
    let extraKcal = (carbs - carbMax) * 4;
    carbs = carbMax;
    const proteinRoom = Math.max(0, Math.floor(weight * PROTEIN_MAX_PER_KG) - protein);
    movedToProtein = Math.min(proteinRoom, Math.floor(extraKcal / 4));
    protein += movedToProtein;
    extraKcal -= movedToProtein * 4;
    movedToFat = Math.round(extraKcal / 9);
    fat += movedToFat;
  }
  let raised = false;
  if (weight > 0 && carbs < carbMin) {
    const fatRoom = Math.max(0, fat - Math.ceil(weight * FAT_FLOOR_PER_KG));
    movedFromFat = Math.min(fatRoom, Math.ceil(((carbMin - carbs) * 4) / 9));
    if (movedFromFat > 0) {
      fat -= movedFromFat;
      carbs = Math.min(carbMin, carbs + Math.floor((movedFromFat * 9) / 4));
      raised = true;
    }
  }
  const belowFloor = weight > 0 && carbs < carbMin;
  return {
    protein, carbs, fat,
    carbCap: {
      capped, raised, belowFloor,
      minPerKg: Number(carbRange.min) || 0, maxPerKg: Number(carbRange.max) || CARB_MAX_PER_KG, heavy: Boolean(carbRange.heavy),
      movedToProteinG: movedToProtein, movedToFatG: movedToFat, movedFromFatG: movedFromFat,
      proteinMaxPerKg: PROTEIN_MAX_PER_KG,
    },
  };
}

export function calculateSuggestedTargets(profile = {}) {
  const weightKg = Number(profile.weightKg) || 0;
  const goalRange = CALORIE_RANGES[profile.goalType] || CALORIE_RANGES.maintain;
  const conditionRange = CONDITION_RANGES[profile.bodyCondition] || CONDITION_RANGES.normal;
  const experience = TRAINING_EXPERIENCE.some((item) => item.value === profile.trainingExperience) ? profile.trainingExperience : '';
  const goalType = profile.goalType in CALORIE_RANGES ? profile.goalType : 'maintain';
  // One source of truth: calories follow the goal from the maintenance level (David, 2026-11-04).
  // Activity and body condition remain coaching context; a kcal/kg typed by David overrides.
  const auto = goalCalories(goalType, weightKg, experience);
  const surplusPct = auto.surplusPct;
  const baselineKcalPerKg = auto.kcalPerKg;
  const requestedKcalPerKg = Number(profile.kcalPerKg);
  const overridden = Number.isFinite(requestedKcalPerKg) && requestedKcalPerKg >= 15 && requestedKcalPerKg <= 50
    && !isLegacyDefaultKcalPerKg(requestedKcalPerKg, goalType);
  const kcal = overridden ? Math.round((weightKg * requestedKcalPerKg) / 10) * 10 : auto.kcal;
  const kcalPerKg = overridden ? requestedKcalPerKg : baselineKcalPerKg;
  const baselineKcal = auto.kcal;
  const proteinPerKg = Number(profile.proteinPerKg) || defaultProteinPerKg(goalType);
  const fatPerKg = Number(profile.fatPerKg) || defaultFatPerKg(goalType);
  const carbRange = carbRangeFor(goalType, profile);
  const split = splitMacros({ weightKg, kcal, proteinPerKg, fatPerKg, carbRange });
  const { protein, carbs, fat } = split;
  // Vi chất theo nhu cầu khuyến nghị của Viện Dinh dưỡng Quốc gia, theo giới và tuổi (David, 2026-11-04).
  const rni = micronutrientTargets({ sex: profile.sex, age: profile.age });
  const mv = rni.values;
  const warnings = [];
  if (!weightKg) warnings.push(t('ne.can_can_nang_de_tinh_muc'));
  if (profile.goalType === 'gain' && !experience) warnings.push(t('ne.chon_kinh_nghiem_tap_de_tinh'));
  if (profile.goalType === 'deep_cut') warnings.push(DEEP_CUT_WARNING);
  if (overridden && auto.kcal > 0 && Math.abs(kcal - auto.kcal) / auto.kcal > 0.05) {
    warnings.push(`${t('ne.david_da_chinh_calo_so_voi', { p0: kcal > auto.kcal ? '+' : '', p1: Math.round(((kcal - auto.kcal) / auto.kcal) * 100), p2: auto.kcal.toLocaleString(locale()) })}`);
  }
  if (split.carbCap.belowFloor) {
    warnings.push(`${t('ne.carb_duoi_g_kg_calo_dang', { p0: String(carbRange.min).replace('.', ',') })}`);
  }
  return {
    standardVersion: NUTRITION_STANDARD_VERSION, goalType,
    kcal, protein, carbs, fat,
    proteinPerKg, fatPerKg, kcalPerKg: round(kcalPerKg, 1),
    surplusPct, experience, deficitKcal: overridden ? 0 : auto.deficitKcal, deficitPct: overridden ? 0 : auto.deficitPct,
    maintenanceKcal: auto.maintenanceKcal, kcalOverridden: overridden, carbRange,
    carbCap: split.carbCap,
    baselineKcalPerKg: round(baselineKcalPerKg, 1), baselineKcal,
    goalRange, conditionRange, method: 'goal_kcal_per_kg',
    micros: {
      fiberG: mv.fiber,
      slowCarbSharePct: 50,
      potassiumMg: mv.potassium,
      sodiumMg: mv.sodium,
      calciumMg: mv.calcium,
      magnesiumMg: mv.magnesium,
      ironMg: mv.iron,
      zincMg: mv.zinc,
      vitamins: {
        vitaminA: mv.vitaminA, vitaminC: mv.vitaminC, vitaminD: mv.vitaminD, vitaminE: mv.vitaminE, vitaminK: mv.vitaminK,
        vitaminB1: mv.vitaminB1, vitaminB6: mv.vitaminB6, folate: mv.folate, vitaminB12: mv.vitaminB12,
      },
      source: 'Viện Dinh dưỡng Quốc gia — nhu cầu khuyến nghị', // i18n-data
      group: rni.group,
      notes: rni.notes,
      unsaturatedToSaturatedFatRatio: '4:1',
      fiberTypes: 'Hoà tan + không hoà tan', // i18n-data
    },
    reassessmentWeeks: '2–4',
    warnings,
  };
}
