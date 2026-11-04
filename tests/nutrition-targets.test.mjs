// Mục tiêu calo và macro đề xuất (David, 2026-11-04).
//   node tests/nutrition-targets.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CALORIE_RANGES, CARB_MAX_PER_KG, DEEP_CUT_WARNING, FAT_PER_KG_BY_GOAL, GAIN_SURPLUS, PROTEIN_MAX_PER_KG, SAFETY_FLOORS,
  calculateSuggestedTargets, defaultFatPerKg, goalKcalPerKg,
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

// Như trang Tạo kế hoạch gửi: kcal/kg và chất béo theo mặc định của mục tiêu.
const suggest = (goalType, trainingExperience = '', extra = {}) => calculateSuggestedTargets({
  weightKg: 70, sex: 'male', goalType, trainingExperience,
  kcalPerKg: goalKcalPerKg(goalType, trainingExperience), fatPerKg: defaultFatPerKg(goalType), ...extra,
});
const macros = (r) => [r.kcal, r.protein, r.carbs, r.fat];
const macroKcal = (r) => r.protein * 4 + r.carbs * 4 + r.fat * 9;

check('các số David đã chốt', () => {
  assert.deepEqual({ ...GAIN_SURPLUS }, { beginner: 0.1, experienced: 0.05 });
  assert.deepEqual({ ...FAT_PER_KG_BY_GOAL }, { fat_loss: 0.6, deep_cut: 0.6, maintain: 0.75, gain: 1 });
  assert.equal(CARB_MAX_PER_KG, 4);
  assert.equal(PROTEIN_MAX_PER_KG, 2.2);
  assert.equal(SAFETY_FLOORS.fatPerKg, 0.6);
  assert.deepEqual([CALORIE_RANGES.gain.min, CALORIE_RANGES.gain.max], [34.1, 35.8], 'giữ cân 32,5 × 1,05 và × 1,10');
});

check('khách 70 kg, bốn mục tiêu (kcal, P, C, F)', () => {
  assert.deepEqual(macros(suggest('gain', 'beginner')), [2510, 154, 280, 86]);
  assert.deepEqual(macros(suggest('gain', 'experienced')), [2390, 154, 280, 73]);
  assert.deepEqual(macros(suggest('gain')), [2390, 154, 280, 73], 'chưa chọn kinh nghiệm: +5%');
  assert.deepEqual(macros(suggest('maintain')), [2280, 154, 280, 61]);
  assert.deepEqual(macros(suggest('fat_loss')), [1930, 133, 255, 42]);
  assert.deepEqual(macros(suggest('deep_cut')), [1580, 133, 168, 42]);
});

check('carb không vượt 4 g/kg; phần dư sang protein trước (tới 2,2 g/kg), rồi sang béo', () => {
  const r = suggest('gain', 'beginner');
  assert.deepEqual(r.carbCap, { capped: true, maxPerKg: 4, movedToProteinG: 21, movedToFatG: 16, proteinMaxPerKg: 2.2 });
  for (const weightKg of [45, 55, 70, 90, 120]) for (const goalType of ['gain', 'maintain', 'fat_loss', 'deep_cut']) {
    const x = calculateSuggestedTargets({ weightKg, goalType, kcalPerKg: goalKcalPerKg(goalType, 'beginner'), fatPerKg: defaultFatPerKg(goalType) });
    assert.ok(x.carbs <= weightKg * CARB_MAX_PER_KG, `${weightKg} kg ${goalType}: carb ${x.carbs}`);
    assert.ok(x.protein <= weightKg * PROTEIN_MAX_PER_KG, `${weightKg} kg ${goalType}: protein ${x.protein}`);
    assert.ok(Math.abs(macroKcal(x) - x.kcal) <= 10, `${weightKg} kg ${goalType}: macro ${macroKcal(x)} so với ${x.kcal}`);
  }
});

check('protein coach nhập tay trên 2,2 g/kg được giữ; phần dư đi thẳng sang béo', () => {
  const r = suggest('gain', 'beginner', { proteinPerKg: 2.5 });
  assert.equal(r.protein, 175);
  assert.equal(r.carbCap.movedToProteinG, 0);
  assert.ok(r.carbCap.movedToFatG > 0);
});

check('ô kcal/kg của coach vẫn ghi đè được', () => {
  const r = suggest('gain', 'beginner', { kcalPerKg: 30 });
  assert.equal(r.kcal, 2100);
  assert.match(r.warnings.join(' '), /ra ngoài khung/);
});

check('cảnh báo: chưa chọn kinh nghiệm khi tăng cân; cắt giảm rất sâu không phải ai cũng phù hợp; bỏ cảnh báo carb 60%', () => {
  assert.match(suggest('gain').warnings.join(' '), /Chọn kinh nghiệm tập/);
  assert.deepEqual(suggest('gain', 'beginner').warnings, []);
  assert.ok(suggest('deep_cut').warnings.includes(DEEP_CUT_WARNING));
  assert.match(DEEP_CUT_WARNING, /không phải ai cũng phù hợp/);
  assert.doesNotMatch(read('nutrition-engine.js'), /Tỷ lệ carb cao/);
});

check('sàn chất béo 0,6 g/kg khi bộ kiểm tra tiến độ tự giảm calo', () => {
  // 1.400 kcal với 10% từ béo = 15,6 g, dưới sàn 70 × 0,6 = 42 g: béo được giữ ở sàn.
  assert.equal(macrosForCalories(1400, { weightKg: 70, proteinG: 133, fatPct: 10 }).fat, 42);
});

check('trang Tạo kế hoạch: ô kinh nghiệm, chất béo đổi theo mục tiêu, mặc định cũ được thay', () => {
  const page = read('nutrition-builder.html');
  assert.match(page, /<select id="training-experience">/);
  assert.match(page, /trainingExperience: \$\('training-experience'\)\.value,/);
  assert.match(page, /\$\('fat-per-kg'\)\.value = defaultFatPerKg\(\$\('goal-type'\)\.value\);/);
  assert.match(page, /\$\('goal-type'\)\.addEventListener\('change'/);
  assert.match(page, /\$\('target-kcal'\)\.addEventListener\('input', renderTdeeCompare\);/);
  assert.match(page, /const OLD_GAIN_KCAL_PER_KG = 37\.5;/);
  assert.match(page, /Carb chạm trần/);
  assert.match(read('training-data.js'), /trainingExperience: \['beginner', 'experienced'\]\.includes\(profile\.trainingExperience\)/);
});

console.log(`NUTRITION_TARGETS_OK ${passed} passed`);
