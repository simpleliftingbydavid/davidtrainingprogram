// Cập nhật kế hoạch đã gửi theo chuẩn mục tiêu mới (David, 2026-11-04).
//   node tests/nutrition-update.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ADJUSTED_TOLERANCE, MIN_WEIGH_DAYS, buildUpdatedPlan, isCoachAdjusted, oldFormulaTargets, proposeUpdate, weightForUpdate,
} from '../nutrition-update-utils.js';
import { PROTEIN_MAX_PER_KG, carbRangeFor, splitMacros } from '../nutrition-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const TODAY = '2026-11-04';
const at = (iso, hour = 7) => new Date(`${iso}T0${hour}:00:00+07:00`);
const log = (iso, weight, hour) => ({ weight, loggedAt: at(iso, hour) });
// Hồ sơ và kế hoạch đúng như công thức cũ tạo ra cho khách 70 kg tăng cân.
const PROFILE = { weightKg: 70, goalType: 'gain', kcalPerKg: 37.5, fatPerKg: 0.75, proteinPerKg: 1.9, sex: 'male' };
const AUTO_PLAN = { versionId: 'v1', goal: 'Tăng cơ', goalType: 'gain', kcal: 2630, protein: 133, carbs: 405, fat: 53, notes: 'Uống đủ nước.',
  micros: { fiberG: 30 }, supplements: ['Creatine'], functionalFoods: ['Kim chi'], reassessmentWeeks: '2–4', calorieBasis: { coachAdjusted: false } };

check('cân: trung bình cân sáng 7 ngày khi có từ 3 ngày, lấy lần cân cuối mỗi ngày', () => {
  const logs = [log('2026-11-04', 71), log('2026-11-03', 70.6), log('2026-11-03', 72, 9), log('2026-11-01', 71.4), log('2026-10-20', 60)];
  assert.equal(MIN_WEIGH_DAYS, 3);
  assert.deepEqual(weightForUpdate(logs, 68, TODAY), { weightKg: 71.5, source: 'logs', days: 3 });
});

check('cân: chưa đủ 3 ngày thì lấy hồ sơ; không có gì thì báo trống', () => {
  assert.deepEqual(weightForUpdate([log('2026-11-04', 71), log('2026-10-01', 70)], 68, TODAY), { weightKg: 68, source: 'profile', days: 1 });
  assert.deepEqual(weightForUpdate([], 0, TODAY), { weightKg: 0, source: 'none', days: 0 });
});

check('công thức cũ cho đúng số kế hoạch đã gửi', () => {
  assert.deepEqual(oldFormulaTargets(PROFILE), { kcal: 2630, protein: 133, carbs: 405, fat: 53 });
  assert.equal(oldFormulaTargets({ goalType: 'gain' }), null);
});

check('nhận diện kế hoạch chỉnh tay', () => {
  assert.equal(isCoachAdjusted(AUTO_PLAN, PROFILE), false);
  assert.equal(isCoachAdjusted({ ...AUTO_PLAN, calorieBasis: { coachAdjusted: true } }, PROFILE), true);
  assert.equal(isCoachAdjusted({ ...AUTO_PLAN, kcal: 2630 + ADJUSTED_TOLERANCE.kcal + 1 }, PROFILE), true);
  assert.equal(isCoachAdjusted({ ...AUTO_PLAN, kcal: 2630 + ADJUSTED_TOLERANCE.kcal }, PROFILE), false, 'trong dung sai');
  assert.equal(isCoachAdjusted({ ...AUTO_PLAN, fat: 56 }, PROFILE), true);
  assert.equal(isCoachAdjusted(AUTO_PLAN, {}), true, 'không có hồ sơ để đối chiếu: giữ calo của David');
});

check('kế hoạch app tự tính: tính lại toàn bộ theo chuẩn mới với cân 7 ngày', () => {
  const logs = ['2026-11-04', '2026-11-03', '2026-11-02'].map((day) => log(day, 70));
  const p = proposeUpdate({ plan: AUTO_PLAN, profile: PROFILE, weightLogs: logs, experience: 'beginner', mealsPerDay: 4, today: TODAY });
  assert.equal(p.mode, 'full');
  assert.equal(p.ready, true);
  assert.deepEqual(p.after, { kcal: 2500, protein: 154, carbs: 280, fat: 85 }, 'mặc định cũ 37,5 kcal/kg và 0,75 g/kg được thay');
  assert.deepEqual(p.changed, ['kcal', 'protein', 'carbs', 'fat']);
});

check('kế hoạch David chỉnh tay: giữ calo, chia lại macro (trần carb, trần protein)', () => {
  const plan = { ...AUTO_PLAN, kcal: 3000, protein: 140, carbs: 450, fat: 60, calorieBasis: { coachAdjusted: true } };
  const p = proposeUpdate({ plan, profile: PROFILE, weightLogs: [], experience: '', mealsPerDay: 5, today: TODAY });
  assert.equal(p.mode, 'resplit');
  assert.equal(p.ready, true, 'giữ calo thì không cần kinh nghiệm tập');
  assert.equal(p.after.kcal, 3000);
  assert.deepEqual(p.after, { kcal: 3000, ...pick(splitMacros({ weightKg: 70, kcal: 3000, proteinPerKg: 1.9, fatPerKg: 1, carbRange: carbRangeFor('gain', PROFILE) })) });
  assert.ok(p.after.carbs <= 70 * 4 && p.after.protein <= 70 * PROTEIN_MAX_PER_KG);
  assert.ok(Math.abs(p.after.protein * 4 + p.after.carbs * 4 + p.after.fat * 9 - 3000) <= 10);
});
function pick({ protein, carbs, fat }) { return { protein, carbs, fat }; }

check('khách cắt giảm: tính lại theo thâm hụt từ mức giữ cân, carb 2–2,5 g/kg', () => {
  const profile = { weightKg: 90, goalType: 'fat_loss', kcalPerKg: 27.5, fatPerKg: 0.75, proteinPerKg: 1.9 };
  const plan = { goal: 'Giảm mỡ', goalType: 'fat_loss', kcal: 2480, protein: 171, carbs: 296, fat: 68, calorieBasis: { coachAdjusted: false } };
  const p = proposeUpdate({ plan, profile, mealsPerDay: 3, today: TODAY });
  assert.equal(p.mode, 'full');
  assert.deepEqual(p.after, { kcal: 2430, protein: 198, carbs: 225, fat: 82 });
  // Cắt sâu dùng protein 2,2 g/kg dù hồ sơ còn mặc định cũ 1,9.
  const deep = proposeUpdate({ plan: { ...plan, goalType: 'deep_cut', kcal: 2030, protein: 171, carbs: 184, fat: 68 }, profile: { ...profile, goalType: 'deep_cut', kcalPerKg: 22.5 }, mealsPerDay: 3, today: TODAY });
  assert.equal(deep.mode, 'full');
  assert.equal(deep.after.protein, 198);
});

check('kế hoạch đã gửi lại bằng trang này (nhãn của app) được tính lại toàn bộ, không coi là David chỉnh', () => {
  const resent = { ...AUTO_PLAN, kcal: 2510, protein: 154, carbs: 280, fat: 86, calorieBasis: { coachAdjusted: false, updatedFor: 'chuẩn mục tiêu 2026-11-04' } };
  assert.equal(isCoachAdjusted(resent, PROFILE), false);
  assert.equal(isCoachAdjusted({ ...resent, calorieBasis: { coachAdjusted: true, updatedFor: 'chuẩn mục tiêu 2026-11-04' } }, PROFILE), true);
});

check('thiếu thông tin thì không sẵn sàng gửi', () => {
  const missingMeals = proposeUpdate({ plan: AUTO_PLAN, profile: PROFILE, experience: 'beginner', mealsPerDay: '', today: TODAY });
  assert.equal(missingMeals.ready, false);
  assert.ok(missingMeals.issues.includes('Nhập số bữa/ngày (1–8).'));
  const noExperience = proposeUpdate({ plan: AUTO_PLAN, profile: PROFILE, experience: '', mealsPerDay: 4, today: TODAY });
  assert.deepEqual(noExperience.issues, ['Chọn kinh nghiệm tập.']);
  const noWeight = proposeUpdate({ plan: AUTO_PLAN, profile: { ...PROFILE, weightKg: 0 }, experience: 'beginner', mealsPerDay: 4, today: TODAY });
  assert.equal(noWeight.ready, false);
  assert.match(noWeight.issues[0], /Thiếu cân nặng/);
  assert.throws(() => buildUpdatedPlan(AUTO_PLAN, missingMeals, { today: TODAY }), /chưa đủ thông tin/);
});

check('kế hoạch gửi lại: chỉ đổi calo, macro, số bữa và calorieBasis; phần còn lại giữ nguyên', () => {
  const p = proposeUpdate({ plan: AUTO_PLAN, profile: PROFILE, experience: 'experienced', mealsPerDay: 4, today: TODAY });
  const next = buildUpdatedPlan(AUTO_PLAN, p, { today: TODAY });
  ['goal', 'notes', 'micros', 'supplements', 'functionalFoods', 'reassessmentWeeks'].forEach((key) => assert.deepEqual(next[key], AUTO_PLAN[key], key));
  assert.deepEqual([next.kcal, next.protein, next.carbs, next.fat, next.mealsPerDay], [2390, 154, 280, 73, 4]);
  assert.equal(next.versionId, undefined, 'phiên bản mới, không ghi đè bản cũ');
  assert.deepEqual(
    [next.calorieBasis.method, next.calorieBasis.coachAdjusted, next.calorieBasis.updatedOn, next.calorieBasis.weightSource, next.calorieBasis.surplusPct],
    ['goal_kcal_per_kg', false, TODAY, 'profile', 5],
  );
});

check('trang chỉ dành cho coach, chỉ ghi qua publishNutritionPlan và saveNutritionProfile, sau khi xác nhận', () => {
  const page = read('nutrition-update.html');
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  const imports = page.match(/import \{([^}]*)\} from '\.\/training-data\.js';/)[1].split(',').map((name) => name.trim()).filter(Boolean).sort();
  assert.deepEqual(imports, ['getMyRole', 'getNutritionPlan', 'getNutritionProfile', 'listBodyWeightLogs', 'listMyStudents', 'publishNutritionPlan', 'saveNutritionProfile']);
  assert.doesNotMatch(page, /addDoc|setDoc|updateDoc|deleteDoc|writeBatch|deleteNutritionPlanVersion/);
  assert.match(page, /await confirmDialog\(\{ message: `Gửi lại \$\{chosen\.length\} kế hoạch\? Học viên sẽ thấy mục tiêu mới ngay\.`/);
  assert.equal(page.match(/publishNutritionPlan\(/g).length, 1);
  assert.match(read('coach.html'), /href="nutrition-update\.html"/);
  // Số bữa đọc theo từng phím và chỉ vẽ lại phần số liệu, để cú bấm tick đầu tiên không bị mất.
  assert.match(page, /\$\('rows'\)\.addEventListener\('input'/);
  assert.match(page, /redrawRow\(index, \{ keepInputs: true \}\)/);
  assert.match(page, /if \(!box \|\| !field \|\| field === 'mealsPerDay'\) return;/);
  assert.match(read('nutrition-builder.html'), /href="nutrition-update\.html"/);
});

console.log(`NUTRITION_UPDATE_OK ${passed} passed`);
