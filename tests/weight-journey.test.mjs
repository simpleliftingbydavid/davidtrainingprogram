// Hành trình từ lúc bắt đầu (David, 2026-11-12): Tổng quan học viên → Cân nặng, mỗi tuần một dòng từ
// lần cân hoặc ghi bữa đầu tiên tới hôm nay, có cân và ghi bữa, cùng một dòng tóm tắt.
//   node tests/weight-journey.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JOURNEY_MAX, weightJourney } from '../weight-journey.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const T = '2026-11-12';
const at = (day, weight, hour = 1) => ({ weight, loggedAt: `${day}T0${hour}:00:00Z` });

check('chưa ghi gì thì không có hành trình', () => {
  assert.equal(weightJourney([], [], { today: T }), null);
  assert.equal(weightJourney([], [{ id: '2026-11-01', simpleMeals: [] }], { today: T }), null, 'ngày không tick bữa nào không phải bắt đầu');
});

check('bắt đầu từ lần ghi sớm nhất, kể cả khi đó là ghi bữa', () => {
  const j = weightJourney([at('2026-11-05', 60)], [{ id: '2026-10-30', foodEntries: [{}] }], { today: T });
  assert.equal(j.start, '2026-10-30');
  assert.equal(j.totalDays, 14);
  assert.equal(j.summary.weekCount, 2);
});

check('mỗi tuần: ngày có cân, cân TB, so tuần trước, so tuần đầu, ngày ghi bữa; mới trước', () => {
  const weights = [
    at('2026-10-22', 61), at('2026-10-24', 60.6),            // tuần 1: TB 60.8
    // tuần 2 không cân
    at('2026-11-05', 60.2), at('2026-11-07', 60),             // tuần 3: TB 60.1
    at('2026-11-12', 59.9),                                   // tuần 4 (đang diễn ra, 1 ngày)
  ];
  const checkins = [{ id: '2026-10-22', simpleMeals: [0] }, { id: '2026-10-23', simpleMeals: [1] }, { id: '2026-11-06', foodEntries: [{}] }];
  const j = weightJourney(weights, checkins, { today: T });
  assert.deepEqual(j.weeks.map((w) => w.index), [4, 3, 2, 1]);
  const [w4, w3, w2, w1] = j.weeks;
  assert.equal(w1.avg, 60.8); assert.equal(w1.baseline, true); assert.equal(w1.changeStart, null); assert.equal(w1.mealDays, 2);
  assert.equal(w2.avg, null); assert.equal(w2.weighDays, 0); assert.equal(w2.changePrev, null);
  assert.equal(w3.avg, 60.1); assert.equal(w3.changePrev, -0.7, 'so với tuần gần nhất có cân'); assert.equal(w3.changeStart, -0.7); assert.equal(w3.mealDays, 1);
  assert.equal(w4.current, true); assert.equal(w4.days, 1); assert.equal(w4.from, '2026-11-12');
  assert.equal(w4.changePrev, -0.2); assert.equal(w4.changeStart, -0.9);
  assert.equal(w3.current, false); assert.equal(w3.days, 7);
});

check('tóm tắt: tuần đầu, tuần gần nhất, tổng, trung bình mỗi tuần, số ngày', () => {
  const weights = [at('2026-10-22', 61), at('2026-11-05', 60.2), at('2026-11-12', 59.9)];
  const s = weightJourney(weights, [{ id: '2026-10-25', simpleMeals: [0] }], { today: T }).summary;
  assert.equal(s.firstAvg, 61);
  assert.equal(s.currentAvg, 59.9);
  assert.equal(s.totalChange, -1.1);
  assert.equal(s.perWeek, -0.37, '3 tuần giữa tuần 1 và tuần 4');
  assert.equal(s.weighDays, 3);
  assert.equal(s.mealDays, 1);
  assert.equal(weightJourney([at('2026-11-10', 60)], [], { today: T }).summary.totalChange, null, 'mới một tuần thì chưa có thay đổi');
});

check('nhiều lần cân một ngày: lấy lần sau cùng; ngày trong tương lai bị bỏ', () => {
  const j = weightJourney([at('2026-11-10', 61, 1), at('2026-11-10', 60, 5), at('2026-11-20', 50)], [], { today: T });
  assert.equal(j.weeks[0].avg, 60);
  assert.equal(j.summary.weighDays, 1);
});

const page = readFileSync(new URL('../overview.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('trang: trang một học viên đọc cả hành trình, danh sách vẫn đọc ít; bảng nằm ngay sau Cân nặng', () => {
  assert.ok(page.includes("listBodyWeightLogs(student.id, { max: view === 'student' ? JOURNEY_MAX : 120 })"));
  assert.ok(page.includes("listNutritionCheckins(student.id, { max: view === 'student' ? JOURNEY_MAX : 45 })"));
  assert.ok(page.includes('${weightDetail(row)}\n    ${journeyDetail(row)}'));
  assert.ok(page.includes('<h3>Hành trình từ lúc bắt đầu</h3>'));
  assert.equal(JOURNEY_MAX, 730);
});

console.log(`WEIGHT_JOURNEY_OK ${passed} passed`);
