// Mục tiêu calo và macro đề xuất (David, 2026-11-04, bản chiều: thâm hụt từ mức giữ cân,
// protein và khoảng carb theo mục tiêu).
//   node tests/nutrition-targets.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CALORIE_RANGES, CARB_RANGE_BY_GOAL, DEEP_CUT_WARNING, DEFICIT, FAT_FLOOR_PER_KG, FAT_PER_KG_BY_GOAL, GAIN_CARB_MAX_HEAVY, GAIN_SURPLUS,
  PROTEIN_MAX_PER_KG, PROTEIN_PER_KG_BY_GOAL, SAFETY_FLOORS,
  calculateSuggestedTargets, carbRangeFor, goalCalories, isLegacyDefaultKcalPerKg, splitMacros,
} from '../nutrition-engine.js';
import { macrosForCalories } from '../nutrition-plateau-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

// Như trang Tạo kế hoạch gửi khi để app tự tính: kcal/kg trống, protein và béo theo mục tiêu.
const suggest = (weightKg, goalType, extra = {}) => calculateSuggestedTargets({ weightKg, sex: 'male', goalType, kcalPerKg: 0, ...extra });
const macros = (r) => [r.kcal, r.protein, r.carbs, r.fat];
const macroKcal = (r) => r.protein * 4 + r.carbs * 4 + r.fat * 9;

check('các số David đã chốt', () => {
  assert.deepEqual({ ...GAIN_SURPLUS }, { beginner: 0.1, experienced: 0.05 });
  assert.deepEqual(JSON.parse(JSON.stringify(DEFICIT)), { fat_loss: { kcal: 500, pct: 0.2 }, deep_cut: { kcal: 750, pct: 0.2 } });
  assert.deepEqual({ ...PROTEIN_PER_KG_BY_GOAL }, { fat_loss: 1.9, deep_cut: 2.2, maintain: 1.9, gain: 1.9 });
  assert.deepEqual({ ...FAT_PER_KG_BY_GOAL }, { fat_loss: 0.6, deep_cut: 0.6, maintain: 0.75, gain: 1 });
  assert.deepEqual(JSON.parse(JSON.stringify(CARB_RANGE_BY_GOAL)), {
    fat_loss: { min: 2, max: 2.5 }, deep_cut: { min: 2, max: 2.5 }, maintain: { min: 3, max: 3.5 }, gain: { min: 4, max: 4 },
  });
  assert.equal(GAIN_CARB_MAX_HEAVY, 5);
  assert.equal(PROTEIN_MAX_PER_KG, 2.2);
  assert.equal(FAT_FLOOR_PER_KG, 0.6);
  assert.equal(SAFETY_FLOORS.fatPerKg, 0.6);
  assert.deepEqual([CALORIE_RANGES.gain.min, CALORIE_RANGES.gain.max], [34.1, 35.8]);
});

check('calo từ mức giữ cân: thâm hụt 500 / 750 kcal nhưng không quá 20%', () => {
  assert.deepEqual([goalCalories('fat_loss', 70).kcal, goalCalories('fat_loss', 70).deficitKcal], [1820, 455], '20% của 2.275 nhỏ hơn 500');
  assert.deepEqual([goalCalories('fat_loss', 110).kcal, goalCalories('fat_loss', 110).deficitKcal, goalCalories('fat_loss', 110).deficitPct], [3080, 500, 14]);
  assert.deepEqual([goalCalories('deep_cut', 110).kcal, goalCalories('deep_cut', 110).deficitKcal], [2860, 715]);
  assert.deepEqual([goalCalories('fat_loss', 45).kcal, goalCalories('deep_cut', 45).kcal], [1170, 1170], 'khách nhẹ cân: cả hai bị trần 20%');
  assert.equal(goalCalories('maintain', 70).kcal, 2280);
  assert.deepEqual([goalCalories('gain', 70, 'beginner').kcal, goalCalories('gain', 70, 'experienced').kcal], [2500, 2390]);
});

check('khách 70 kg, bốn mục tiêu (kcal, P, C, F)', () => {
  assert.deepEqual(macros(suggest(70, 'gain', { trainingExperience: 'beginner' })), [2500, 154, 280, 85]);
  assert.deepEqual(macros(suggest(70, 'gain', { trainingExperience: 'experienced' })), [2390, 154, 280, 73]);
  assert.deepEqual(macros(suggest(70, 'gain', { trainingExperience: 'experienced', trainingLoad: 'heavy_controlled', bodyCondition: 'normal' })), [2390, 133, 307, 70]);
  assert.deepEqual(macros(suggest(70, 'maintain')), [2280, 154, 245, 76]);
  assert.deepEqual(macros(suggest(70, 'fat_loss')), [1820, 154, 175, 56]);
  assert.deepEqual(macros(suggest(70, 'deep_cut')), [1820, 154, 175, 56]);
});

check('khách 45 kg và 110 kg', () => {
  assert.deepEqual(macros(suggest(45, 'fat_loss')), [1170, 99, 112, 36]);
  assert.deepEqual(macros(suggest(110, 'fat_loss')), [3080, 242, 275, 113]);
  assert.deepEqual(macros(suggest(110, 'deep_cut')), [2860, 242, 275, 88]);
});

check('trần carb 5 g/kg khi Phát triển chỉ khi tập nặng + kiểm soát tốt và không thừa mỡ', () => {
  assert.equal(carbRangeFor('gain', { trainingLoad: 'heavy_controlled', bodyCondition: 'normal' }).max, 5);
  assert.equal(carbRangeFor('gain', { trainingLoad: 'heavy_controlled', bodyCondition: 'underweight' }).max, 5);
  assert.equal(carbRangeFor('gain', { trainingLoad: 'heavy_controlled', bodyCondition: 'overweight' }).max, 4);
  assert.equal(carbRangeFor('gain', { trainingLoad: 'moderate', bodyCondition: 'normal' }).max, 4);
  assert.equal(carbRangeFor('fat_loss', { trainingLoad: 'heavy_controlled' }).max, 2.5);
});

check('carb luôn trong khoảng; protein ≤ 2,2 g/kg; tổng calo khớp', () => {
  const profiles = [{}, { trainingExperience: 'beginner' }, { trainingLoad: 'heavy_controlled', bodyCondition: 'normal' }];
  for (const weightKg of [40, 45, 55, 70, 90, 110, 150]) for (const goalType of ['gain', 'maintain', 'fat_loss', 'deep_cut']) for (const extra of profiles) {
    const r = suggest(weightKg, goalType, extra);
    const range = carbRangeFor(goalType, extra);
    const label = `${weightKg} kg ${goalType} ${JSON.stringify(extra)}`;
    assert.ok(r.carbs <= weightKg * range.max, `${label}: carb ${r.carbs}`);
    assert.ok(r.carbs >= Math.floor(weightKg * range.min) || r.carbCap.belowFloor, `${label}: carb ${r.carbs} dưới khoảng mà không báo`);
    assert.ok(r.protein <= weightKg * PROTEIN_MAX_PER_KG + 0.5, `${label}: protein ${r.protein}`);
    assert.ok(r.fat >= Math.floor(weightKg * FAT_FLOOR_PER_KG), `${label}: béo ${r.fat}`);
    assert.ok(Math.abs(macroKcal(r) - r.kcal) <= 10, `${label}: macro ${macroKcal(r)} so với ${r.kcal}`);
  }
});

check('carb dưới mức dưới: bớt béo (không dưới 0,6 g/kg) để bù, vẫn thiếu thì cảnh báo', () => {
  const raised = splitMacros({ weightKg: 70, kcal: 1700, proteinPerKg: 2.2, fatPerKg: 1, carbRange: { min: 2, max: 2.5 } });
  assert.equal(raised.carbs, 140);
  assert.ok(raised.carbCap.raised && !raised.carbCap.belowFloor);
  const short = suggest(70, 'fat_loss', { kcalPerKg: 18 });
  assert.equal(short.carbCap.belowFloor, true);
  assert.equal(short.fat, 42, 'béo dừng ở 0,6 g/kg');
  assert.match(short.warnings.join(' '), /Carb dưới 2 g\/kg: calo đang thấp so với cân nặng, David kiểm tra lại\./);
});

check('protein coach nhập tay trên 2,2 g/kg được giữ', () => {
  const r = suggest(70, 'fat_loss', { proteinPerKg: 2.5 });
  assert.equal(r.protein, 175);
  assert.equal(r.carbCap.movedToProteinG, 0);
});

check('ô kcal/kg: trống hoặc mặc định cũ = app tự tính; số David nhập thì ghi đè và được nhắc', () => {
  assert.equal(suggest(70, 'fat_loss', { kcalPerKg: 27.5 }).kcal, 1820, '27,5 là mặc định cũ');
  assert.equal(isLegacyDefaultKcalPerKg(37.5, 'gain'), true);
  const typed = suggest(70, 'fat_loss', { kcalPerKg: 24 });
  assert.equal(typed.kcal, 1680);
  assert.equal(typed.kcalOverridden, true);
  assert.match(typed.warnings.join(' '), /David đã chỉnh calo -8% so với mức đề xuất 1\.820 kcal\./);
});

check('cảnh báo: chưa chọn kinh nghiệm khi tăng cân; cắt giảm rất sâu không phải ai cũng phù hợp', () => {
  assert.match(suggest(70, 'gain').warnings.join(' '), /Chọn kinh nghiệm tập/);
  assert.deepEqual(suggest(70, 'gain', { trainingExperience: 'beginner' }).warnings, []);
  assert.ok(suggest(70, 'deep_cut').warnings.includes(DEEP_CUT_WARNING));
});

check('sàn chất béo 0,6 g/kg khi bộ kiểm tra tiến độ tự giảm calo', () => {
  assert.equal(macrosForCalories(1400, { weightKg: 70, proteinG: 133, fatPct: 10 }).fat, 42);
});

check('kiểm tra tiến độ chia macro bằng quy tắc của trang Tạo kế hoạch', () => {
  const plan = { weightKg: 70, proteinG: 154, fatPct: 28, fatG: 56, goalType: 'fat_loss' };
  const up = macrosForCalories(2070, plan);
  assert.deepEqual([up.protein, up.carbs, up.fat], [154, 175, 84], 'ăn thêm: carb dừng ở 2,5 g/kg, protein đã ở trần, dư sang béo');
  const down = macrosForCalories(1620, plan);
  assert.deepEqual([down.protein, down.carbs, down.fat, down.carbsBelowFloor], [154, 140, 49, false], 'hạ calo: bớt béo để giữ carb 2 g/kg');
  const low = macrosForCalories(1300, plan);
  assert.equal(low.carbsBelowFloor, true);
  assert.equal(low.fat, 42, 'béo không dưới 0,6 g/kg');
  for (const r of [up, down, low]) assert.ok(Math.abs(r.protein * 4 + r.carbs * 4 + r.fat * 9 - r.kcal) <= 10);
  // Phát triển, tập nặng + không thừa mỡ: trần 5 g/kg theo hồ sơ.
  const gain = macrosForCalories(3000, { weightKg: 70, proteinG: 133, fatPct: 26, fatG: 70, goalType: 'gain', profile: { trainingLoad: 'heavy_controlled', bodyCondition: 'normal' } });
  assert.equal(gain.carbRange.max, 5);
  assert.ok(gain.carbs <= 350);
  const page = read('nutrition.html');
  assert.match(page, /profile: nutritionProfile \|\| \{\},/);
});

check('trang Tạo kế hoạch: kcal/kg trống là tự tính, protein và béo đổi theo mục tiêu', () => {
  const page = read('nutrition-builder.html');
  assert.match(page, /<select id="training-experience">/);
  assert.match(page, /kcal\/kg \(bỏ trống: app tự tính\)/);
  assert.match(page, /\$\('protein-per-kg'\)\.value = defaultProteinPerKg\(\$\('goal-type'\)\.value\);/);
  assert.match(page, /\$\('fat-per-kg'\)\.value = defaultFatPerKg\(\$\('goal-type'\)\.value\);/);
  assert.match(page, /if \(!stored \|\| isLegacyDefaultKcalPerKg\(stored, profile\.goalType \|\| 'gain'\)\) return '';/);
  assert.match(page, /thâm hụt \$\{s\.deficitPct\}%, tối đa 20%/);
  assert.match(page, /\$\('target-kcal'\)\.addEventListener\('input', renderTdeeCompare\);/);
});

console.log(`NUTRITION_TARGETS_OK ${passed} passed`);
