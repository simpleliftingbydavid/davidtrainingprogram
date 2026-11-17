// David, 2026-11-17: mọi bài Deadlift đều cộng 0,5 set cho Lưng.
//   node tests/deadlift-back-credit.test.mjs
import assert from 'node:assert/strict';
import { defaultVolumeCredits, normalizeVolumeCredits, isDeadliftExercise, actualVolumeByMuscle } from '../volume-engine.js';
import { EXERCISES as EXERCISE_SEED } from '../exercise-seed-data.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const back = (credits) => credits.find((item) => item.muscleGroup === 'Lưng')?.credit;

check('mọi bài Deadlift/RDL trong thư viện: Lưng 0,5', () => {
  const lifts = EXERCISE_SEED.filter((exercise) => /deadlift|rdl/i.test(`${exercise.exerciseId} ${exercise.nameVi}`));
  assert.ok(lifts.length >= 9, `chỉ thấy ${lifts.length} bài`);
  lifts.forEach((exercise) => {
    assert.equal(back(defaultVolumeCredits(exercise)), 0.5, exercise.exerciseId);
    assert.equal(back(normalizeVolumeCredits(null, exercise)), 0.5, exercise.exerciseId);
  });
});

check('giáo án đã lưu trước đó (không có Lưng) vẫn tính Lưng 0,5', () => {
  const rdl = { exerciseId: 'bb_rdl', nameVi: 'BB Romanian Deadlift', muscleGroup: 'Đùi sau & Mông' };
  const credits = normalizeVolumeCredits([{ muscleGroup: 'Đùi sau & Mông', credit: 1 }], rdl);
  assert.equal(back(credits), 0.5);
  const sessions = [{ performedAt: new Date('2026-11-16'), exerciseLogs: [{ exerciseId: 'bb_rdl', actualSets: [{}, {}, {}, {}], volumeCredits: [{ muscleGroup: 'Đùi sau & Mông', credit: 1 }] }] }];
  const totals = actualVolumeByMuscle(sessions, () => rdl, { now: Date.parse('2026-11-17') });
  assert.equal(totals['Lưng'], 2);
  assert.equal(totals['Đùi sau & Mông'], 4);
});

check('HLV đặt Lưng cao hơn thì giữ; bài khác không bị đụng', () => {
  const dl = { exerciseId: 'custom_x', nameVi: 'Snatch-grip Deadlift', muscleGroup: 'Đùi sau & Mông' };
  assert.equal(back(normalizeVolumeCredits([{ muscleGroup: 'Đùi sau & Mông', credit: 1 }, { muscleGroup: 'Lưng', credit: 1 }], dl)), 1);
  assert.equal(isDeadliftExercise({ exerciseId: 'hip_thrust', nameVi: 'Hip Thrust' }), false);
  assert.equal(isDeadliftExercise({ exerciseId: 'barbell_row', nameVi: 'Barbell Row' }), false);
  assert.equal(back(defaultVolumeCredits({ exerciseId: 'leg_curl', nameVi: 'Leg Curl', muscleGroup: 'Đùi sau & Mông' })), undefined);
});

console.log(`DEADLIFT_BACK_CREDIT_OK ${passed} passed`);
