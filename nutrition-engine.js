// Deterministic nutrition-plan generator. It allocates coach-approved targets;
// it does not diagnose conditions or calculate clinical requirements.

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

export const PLAN_TEMPLATES = {
  auto: { label: 'Tự chọn theo hồ sơ' },
  gain: { label: 'Tăng cân cân bằng', goal: 'Tăng cân bền vững' },
  gain_sensitive: { label: 'Tăng cân · tiêu hoá nhạy cảm', goal: 'Tăng cân, ưu tiên tiêu hoá' },
  fat_loss: { label: 'Giảm mỡ · giữ hiệu suất', goal: 'Giảm mỡ, duy trì sức mạnh' },
  deep_cut: { label: 'Cắt giảm rất sâu · coach theo dõi', goal: 'Cắt giảm sâu, ưu tiên giữ hiệu suất' },
  maintain: { label: 'Duy trì · ăn đủ chất', goal: 'Duy trì cân nặng và hiệu suất' },
};

const MEAL_PRESETS = {
  3: [
    { id: 'breakfast', name: 'Bữa sáng', time: '07:00', share: .28 },
    { id: 'lunch', name: 'Bữa trưa', time: '12:00', share: .34 },
    { id: 'dinner', name: 'Bữa tối', time: '19:00', share: .38 },
  ],
  4: [
    { id: 'breakfast', name: 'Bữa sáng', time: '07:00', share: .25 },
    { id: 'lunch', name: 'Bữa trưa', time: '12:00', share: .28 },
    { id: 'snack', name: 'Bữa nhẹ', time: '16:30', share: .15 },
    { id: 'dinner', name: 'Bữa tối', time: '19:30', share: .32 },
  ],
  5: [
    { id: 'breakfast', name: 'Bữa sáng', time: '07:00', share: .20 },
    { id: 'morning-snack', name: 'Bữa phụ sáng', time: '09:30', share: .10 },
    { id: 'lunch', name: 'Bữa trưa', time: '12:00', share: .27 },
    { id: 'snack', name: 'Bữa nhẹ chiều', time: '16:30', share: .13 },
    { id: 'dinner', name: 'Bữa tối', time: '19:30', share: .30 },
  ],
};

const FOOD_OPTIONS = {
  breakfast: {
    normal: ['Đạm: trứng, thịt nạc, ức gà hoặc đậu hũ', 'Tinh bột: cơm, yến mạch hoặc bánh mì', 'Rau/canh hoặc một phần trái cây'],
    sensitive: ['Đạm dễ tiêu: trứng luộc, thịt nạc luộc/hấp hoặc đậu hũ', 'Tinh bột mềm: cơm mềm, cháo thịt hoặc bánh mì trắng', 'Rau nấu chín; tránh đồ cay và nhiều dầu'],
  },
  lunch: {
    normal: ['Chọn món có phần đạm rõ ràng: thịt nạc, gà, cá, trứng hoặc đậu hũ', 'Cơm/bún/mì theo khẩu phần mục tiêu', 'Thêm rau hoặc canh; uống nước lọc'],
    sensitive: ['Ưu tiên món kho nhạt, luộc hoặc hấp', 'Cơm/bún/hủ tiếu mềm; tránh món quá cay hoặc chua', 'Rau nấu chín và canh ít dầu'],
  },
  snack: {
    normal: ['Chọn 1: sữa chua, sữa hạt, trứng luộc hoặc bánh mì nhỏ', 'Có thể thêm chuối hoặc trái cây', 'Ưu tiên món dễ chuẩn bị và có protein'],
    sensitive: ['Chọn 1: trứng luộc, sữa hạt hoặc sữa chua ít đường', 'Chuối chín hoặc bánh mì trắng nhỏ', 'Không dùng sữa tươi nếu thường gây khó chịu'],
  },
  dinner: {
    normal: ['Đạm: thịt nạc, gà, cá, trứng hoặc đậu hũ', 'Cơm/bún/mì theo khẩu phần mục tiêu', 'Rau nấu chín hoặc canh; kết thúc trước khi ngủ 1,5–2 giờ'],
    sensitive: ['Đạm luộc/hấp/kho ít dầu', 'Cơm mềm hoặc cháo nếu bụng mệt', 'Rau luộc/canh mềm; không nằm ngay sau ăn'],
  },
};

function roundAllocation(total, shares, step = 1) {
  const target = Math.max(0, Math.round(Number(total) || 0));
  if (!target) return shares.map(() => 0);
  const values = shares.map((share, index) => index === shares.length - 1
    ? 0
    : Math.round((target * share) / step) * step);
  values[values.length - 1] = target - values.slice(0, -1).reduce((sum, value) => sum + value, 0);
  return values;
}

function chooseTemplate(profile, requested) {
  if (requested && requested !== 'auto') return requested;
  if (profile.goalType === 'gain' && profile.digestion === 'sensitive') return 'gain_sensitive';
  if (profile.goalType === 'gain') return 'gain';
  if (profile.goalType === 'fat_loss') return 'fat_loss';
  if (profile.goalType === 'deep_cut') return 'deep_cut';
  return 'maintain';
}

function mealFoodKey(mealId) {
  if (mealId.includes('snack')) return 'snack';
  return mealId;
}

function buildNotes(profile, templateId) {
  const notes = [];
  if (profile.workSchedule) notes.push(`Lịch làm việc: ${profile.workSchedule}.`);
  if (profile.trainingTime && profile.trainingTime !== 'none') notes.push(`Thời điểm tập thường lệ: ${profile.trainingTime}.`);
  if (templateId === 'gain' || templateId === 'gain_sensitive') notes.push('Ưu tiên ăn đủ cữ; chỉ tăng một khẩu phần mỗi lần sau khi đã theo dõi tuân thủ.');
  if (templateId === 'fat_loss' || templateId === 'deep_cut') notes.push('Ưu tiên thực phẩm no lâu, đủ đạm và giữ lịch ăn ổn định.');
  if (templateId === 'deep_cut') notes.push('Theo dõi sát hiệu suất và form tập; dừng cắt sâu nếu hiệu suất hoặc khả năng phục hồi giảm rõ rệt.');
  if (profile.digestion === 'sensitive') notes.push('Khi bụng yếu: dùng thức ăn mềm, chín kỹ, ít dầu; tránh cay/chua và món từng gây khó chịu.');
  if (profile.preferences) notes.push(`Ưu tiên: ${profile.preferences}.`);
  if (profile.avoidFoods) notes.push(`Tránh/không dùng: ${profile.avoidFoods}.`);
  if (profile.coachNotes) notes.push(profile.coachNotes);
  return notes.join('\n');
}

export function validateNutritionTargets(targets) {
  const kcal = Number(targets.kcal) || 0;
  const protein = Number(targets.protein) || 0;
  const carbs = Number(targets.carbs) || 0;
  const fat = Number(targets.fat) || 0;
  const macroKcal = protein * 4 + carbs * 4 + fat * 9;
  const warnings = [];
  if (kcal <= 0) warnings.push('Chưa có mục tiêu kcal.');
  if (protein <= 0) warnings.push('Chưa có mục tiêu protein.');
  if (kcal > 0 && macroKcal > 0 && Math.abs(macroKcal - kcal) / kcal > .08) {
    warnings.push(`Kcal quy đổi từ macro là ${macroKcal}, lệch hơn 8% so với mục tiêu ${kcal}.`);
  }
  return { valid: kcal > 0 && protein > 0, macroKcal, warnings };
}

function midpoint(range) { return (range.min + range.max) / 2; }
function round(value, digits = 0) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }

export function calculateSuggestedTargets(profile = {}) {
  const weightKg = Number(profile.weightKg) || 0;
  const goalRange = CALORIE_RANGES[profile.goalType] || CALORIE_RANGES.maintain;
  const conditionRange = CONDITION_RANGES[profile.bodyCondition] || CONDITION_RANGES.normal;
  const method = profile.calorieMethod || 'combined';
  const kcalPerKg = method === 'goal'
    ? midpoint(goalRange)
    : method === 'condition'
      ? midpoint(conditionRange)
      : (midpoint(goalRange) + midpoint(conditionRange)) / 2;
  const kcal = Math.round((weightKg * kcalPerKg) / 10) * 10;
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
  return {
    standardVersion: NUTRITION_STANDARD_VERSION,
    kcal, protein, carbs, fat,
    proteinPerKg, fatPerKg, kcalPerKg: round(kcalPerKg, 1),
    goalRange, conditionRange, method,
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

export function generateNutritionPlan({ profile = {}, targets = {}, templateId = 'auto', extras = {} }) {
  const mealCount = Math.min(5, Math.max(3, Number(profile.mealCount) || 4));
  const preset = MEAL_PRESETS[mealCount];
  const selectedTemplateId = chooseTemplate(profile, templateId);
  const kcalByMeal = roundAllocation(targets.kcal, preset.map((meal) => meal.share), 10);
  const proteinByMeal = roundAllocation(targets.protein, preset.map((meal) => meal.share));
  const carbsByMeal = roundAllocation(targets.carbs, preset.map((meal) => meal.share));
  const fatByMeal = roundAllocation(targets.fat, preset.map((meal) => meal.share));
  const digestionKey = profile.digestion === 'sensitive' ? 'sensitive' : 'normal';

  const meals = preset.map((meal, index) => {
    const key = mealFoodKey(meal.id);
    return {
      id: meal.id,
      name: meal.name,
      time: meal.time,
      kcal: kcalByMeal[index],
      protein: proteinByMeal[index],
      carbs: carbsByMeal[index],
      fat: fatByMeal[index],
      items: [...FOOD_OPTIONS[key][digestionKey]],
    };
  });

  return {
    goal: PLAN_TEMPLATES[selectedTemplateId]?.goal || 'Kế hoạch dinh dưỡng cá nhân',
    kcal: Number(targets.kcal) || 0,
    protein: Number(targets.protein) || 0,
    carbs: Number(targets.carbs) || 0,
    fat: Number(targets.fat) || 0,
    notes: buildNotes(profile, selectedTemplateId),
    sourceTemplateId: selectedTemplateId,
    engineVersion: NUTRITION_ENGINE_VERSION,
    standardVersion: extras.standardVersion || NUTRITION_STANDARD_VERSION,
    calorieBasis: extras.calorieBasis || null,
    micros: extras.micros || null,
    reassessmentWeeks: extras.reassessmentWeeks || '2–4',
    performancePriority: true,
    functionalFoods: Array.isArray(extras.functionalFoods) ? extras.functionalFoods : [],
    supplements: Array.isArray(extras.supplements) ? extras.supplements : [],
    meals,
    validation: validateNutritionTargets(targets),
  };
}
