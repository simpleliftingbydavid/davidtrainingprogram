// Bài học viên hay tập khác giáo án (David, 2026-11-12): đánh dấu khi nặng hơn hoặc nhẹ hơn số
// giáo án ít nhất 2 trong 4 lần gần nhất, cùng chiều; hiện trong thẻ Đánh giá progression.
//   node tests/plan-deviation.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exposureDeviation, planDeviations } from '../plan-deviation.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const log = (planned, weights, extra = {}) => ({ exerciseId: 'squat', planned: { weight: planned, sets: weights.length, reps: 5 }, actualSets: weights.map((weight) => ({ weight, reps: 5 })), ...extra });
const session = (day, logs) => ({ performedAt: `2026-11-${String(day).padStart(2, '0')}T03:00:00Z`, exerciseLogs: logs });

check('một lần tập: nặng hơn, nhẹ hơn, đúng; bỏ bài bỏ qua, bài thay thế, không tạ, gõ nhầm', () => {
  assert.equal(exposureDeviation(log(60, [62.5, 62.5, 62.5])).dir, 'heavier');
  assert.equal(exposureDeviation(log(60, [55, 55, 60])).dir, 'lighter');
  assert.equal(exposureDeviation(log(60, [60, 60])).dir, 'same');
  assert.equal(exposureDeviation(log(60, [70], { outcome: 'skipped' })), null);
  assert.equal(exposureDeviation(log(60, [70], { substitutedExerciseId: 'leg_press' })), null);
  assert.equal(exposureDeviation(log(0, [0, 0])), null);
  assert.equal(exposureDeviation(log(60, [600])), null);
});

check('kim tự tháp ngược so set đầu', () => {
  const rp = { exerciseId: 'row', planned: { weight: 18, setPrescriptions: [{ setIndex: 1, weight: 18, reps: 8 }, { setIndex: 2, weight: 16, reps: 10 }] }, actualSets: [{ weight: 20, reps: 8 }, { weight: 16, reps: 10 }] };
  assert.deepEqual(exposureDeviation(rp), { planned: 18, actual: 20, dir: 'heavier' });
});

check('2 trong 4 lần gần nhất cùng chiều thì đánh dấu; 1 lần lẻ thì không', () => {
  const sessions = [
    session(1, [log(60, [60, 60, 60])]),
    session(3, [log(60, [62.5, 62.5, 62.5])]),
    session(5, [log(62.5, [62.5, 62.5, 62.5])]),
    session(7, [log(65, [67.5, 67.5, 67.5])]),
  ];
  const row = planDeviations(sessions).get('squat');
  assert.equal(row.flag, 'heavier');
  assert.equal(row.heavier, 2);
  assert.equal(row.text, '4 lần gần nhất: 2 lần nặng hơn. 03/11: giáo án 60 → tập 62,5 · 07/11: giáo án 65 → tập 67,5 (kg).');
  assert.equal(planDeviations(sessions.slice(0, 3)).get('squat').flag, null);
});

check('chỉ xét 4 lần gần nhất; lệch cả hai chiều', () => {
  const old = [session(1, [log(60, [65])]), session(2, [log(60, [65])])];
  const recent = [3, 4, 5, 6].map((day) => session(day, [log(60, [60])]));
  assert.equal(planDeviations([...old, ...recent]).get('squat').flag, null);
  const both = [session(1, [log(60, [65])]), session(2, [log(60, [55])]), session(3, [log(60, [65])]), session(4, [log(60, [55])])];
  assert.equal(planDeviations(both).get('squat').flag, 'both');
});

check('trang HLV: dòng trong thẻ Đánh giá progression và nút lọc', () => {
  const page = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  assert.ok(page.includes("import { planDeviations } from './plan-deviation.js';"));
  assert.ok(page.includes('data-pr-filter="deviation"'));
  assert.ok(page.includes('pr-text pr-dev'));
});

console.log(`PLAN_DEVIATION_OK ${passed} passed`);
