// Kiểu tiến triển 9 "Tăng rep rồi tăng tạ" (David, 2026-11-04).
//   node tests/double-progression.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEME, calculateNextPrescription, classifyOutcome, getInitialPrescription } from '../progression-engine.js';
import { advanceSessionExercise } from '../workout-session-utils.js';
import { carriedSchemeForSwap, schemeFitsExercise, substituteProgression } from '../exercise-swap-utils.js';
import { assignmentSetupIssues } from '../template-import-utils.js';
import { progressionChangeDiff } from '../coaching-decision-utils.js';
import { getExerciseById } from '../exercise-seed-data.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const scheme = SCHEME.DOUBLE_PROGRESSION;
// Bài phụ: 3 set 8–10 rep, RIR 0–2, +2,5 kg.
const ACC = { plannedSets: 3, repsMin: 8, repsMax: 10, rirMin: 0, targetRIR: 2, weightStepKg: 2.5, roundingIncrement: 2.5, restSeconds: 75, isBodyweight: false };
// Bài chính: 3 set 1–5 rep, RIR 2–4, +5 kg.
const MAIN = { plannedSets: 3, repsMin: 1, repsMax: 5, rirMin: 2, targetRIR: 4, weightStepKg: 5, roundingIncrement: 2.5, restSeconds: 180, isBodyweight: false };
const sets = (weight, reps, lastRir = '') => reps.map((value, index) => ({ weight, reps: value, rir: index === reps.length - 1 ? lastRir : '' }));
const next = (params, state, actualSets) => calculateNextPrescription({ scheme, schemeParams: params, state, lastLog: { actualSets } });

check('số kiểu: 9 giữ nguyên số, không đụng tới 1–8 (APRE thêm sau là 10, 2026-11-12)', () => {
  assert.equal(SCHEME.DOUBLE_PROGRESSION, 9);
  assert.deepEqual(Object.values(SCHEME), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

check('buổi đầu: chưa có tạ, bắt đầu ở rep mức dưới', () => {
  const rx = getInitialPrescription({ scheme, schemeParams: ACC, state: { workingWeight: 0, currentReps: 8 } });
  assert.deepEqual(rx, { weight: 0, sets: 3, reps: 8, repsMin: 8, repsMax: 10, targetRIR: 2, rirMin: 0 });
});

check('tạ học viên chọn ở buổi đầu thành tạ làm việc', () => {
  const result = next(ACC, { workingWeight: 0, currentReps: 8 }, sets(40, [8, 8, 8], 2));
  assert.equal(result.nextState.workingWeight, 40);
  assert.deepEqual([result.nextPrescription.weight, result.nextPrescription.reps], [40, 9]);
});

check('nhánh b: đủ rep hôm nay thì buổi sau thêm 1 rep, giữ tạ', () => {
  const result = next(ACC, { workingWeight: 60, currentReps: 8 }, sets(60, [8, 8, 8], 1));
  assert.deepEqual([result.nextState.workingWeight, result.nextState.currentReps], [60, 9]);
  assert.equal(result.delta.action, 'increase_reps');
  assert.equal(classifyOutcome(scheme, result.delta), 'up');
});

check('nhánh a: đủ rep mức trên ở mọi set thì tăng một bước và về rep mức dưới', () => {
  const result = next(ACC, { workingWeight: 60, currentReps: 10 }, sets(60, [10, 10, 10], 0));
  assert.deepEqual([result.nextState.workingWeight, result.nextState.currentReps], [62.5, 8]);
  assert.equal(result.delta.action, 'increase_weight');
  assert.match(result.resultBucket, /tăng lên 62,5 kg, về 8 rep/);
  // Làm vượt mức hôm nay tới mức trên cũng tính: double progression đúng nghĩa.
  const early = next(ACC, { workingWeight: 60, currentReps: 8 }, sets(60, [10, 10, 10], 1));
  assert.equal(early.nextState.workingWeight, 62.5);
});

check('nhánh c: hụt rep thì giữ tạ và rep, chỉ đếm số lần hụt cho coach', () => {
  const result = next(ACC, { workingWeight: 62.5, currentReps: 8, consecutiveMisses: 1 }, sets(62.5, [8, 7, 6], 0));
  assert.deepEqual([result.nextState.workingWeight, result.nextState.currentReps, result.nextState.consecutiveMisses], [62.5, 8, 2]);
  assert.equal(classifyOutcome(scheme, result.delta), 'down');
  const short = next(ACC, { workingWeight: 62.5, currentReps: 8 }, sets(62.5, [8, 8], 0));
  assert.equal(short.delta.action, 'hold', 'thiếu set cũng là hụt');
});

check('bài chính: đủ 5 rep nhưng gồng tới RIR thấp hơn mức dưới thì chưa tăng tạ', () => {
  const ground = next(MAIN, { workingWeight: 100, currentReps: 5 }, sets(100, [5, 5, 5], 1));
  assert.equal(ground.nextState.workingWeight, 100);
  assert.equal(ground.delta.action, 'effort_hold');
  assert.equal(classifyOutcome(scheme, ground.delta), 'hold');
  const clean = next(MAIN, { workingWeight: 100, currentReps: 5 }, sets(100, [5, 5, 5], 2));
  assert.deepEqual([clean.nextState.workingWeight, clean.nextState.currentReps], [105, 1]);
});

check('bài có tạ ghi 0 kg: không tự đặt tạ từ bước tăng, buổi sau vẫn tự chọn tạ', () => {
  const result = next(ACC, { workingWeight: 0, currentReps: 8 }, sets(0, [10, 10, 10], 1));
  assert.deepEqual([result.nextState.workingWeight, result.nextState.currentReps], [0, 8]);
  assert.equal(result.delta.action, 'no_load');
  assert.equal(classifyOutcome(scheme, result.delta), 'hold');
  assert.match(result.resultBucket, /Chưa ghi mức tạ/);
});

check('không bao giờ đổi số set', () => {
  const states = [{ workingWeight: 60, currentReps: 8 }, { workingWeight: 60, currentReps: 10 }];
  const logs = [sets(60, [8, 8, 8], 2), sets(60, [10, 10, 10, 10, 10], 0), sets(60, [5, 5, 5], 0), []];
  states.forEach((state) => logs.forEach((log) => {
    const result = next(ACC, state, log);
    assert.equal(result.nextPrescription.sets, 3);
    assert.equal(result.nextState.currentSets, undefined);
  }));
});

check('làm tròn tạ theo nấc nhỏ nhất của bài', () => {
  const machine = { ...ACC, weightStepKg: 5, roundingIncrement: 5 };
  assert.equal(next(machine, { workingWeight: 47.5, currentReps: 10 }, sets(47.5, [10, 10, 10], 0)).nextState.workingWeight, 55);
  const tiny = { ...ACC, weightStepKg: 1, roundingIncrement: 2.5 };
  assert.equal(next(tiny, { workingWeight: 20, currentReps: 10 }, sets(20, [10, 10, 10], 0)).nextState.workingWeight, 22.5, 'không bao giờ đứng yên');
});

check('bài tự trọng: đủ rep mức trên thì dừng ở đó cho coach tăng độ khó', () => {
  const bw = { ...ACC, isBodyweight: true, weightStepKg: 0, roundingIncrement: 0 };
  const result = next(bw, { workingWeight: 0, currentReps: 10 }, sets(0, [10, 10, 10], 1));
  assert.deepEqual([result.nextState.workingWeight, result.nextState.currentReps], [0, 10]);
  assert.equal(result.delta.action, 'bodyweight_cap');
  assert.match(result.resultBucket, /David sẽ tăng độ khó/);
});

check('buổi giảm set theo thể trạng thì giữ nguyên tiến độ', () => {
  const result = advanceSessionExercise({ scheme, schemeParams: ACC, state: { workingWeight: 60, currentReps: 9 }, actualSets: sets(60, [9, 9], 1), adjustedSetCount: 2 });
  assert.equal(result.progressionHeld, true);
  assert.deepEqual([result.nextState.workingWeight, result.nextState.currentReps], [60, 9]);
});

check('đổi bài giữ kiểu 9; bước tăng không nhỏ hơn nấc của máy mới; tạ để học viên chọn', () => {
  const assignment = { exerciseId: 'bench_press', scheme, schemeParams: { ...ACC, weightStepKg: 1 }, state: { workingWeight: 80, currentReps: 9 } };
  assert.equal(schemeFitsExercise(scheme, getExerciseById('pull_up')), true);
  const machine = carriedSchemeForSwap(assignment, getExerciseById('machine_chest_press'));
  assert.deepEqual([machine.scheme, machine.schemeParams.weightStepKg, machine.schemeParams.roundingIncrement], [9, 5, 5]);
  const sub = substituteProgression(assignment, getExerciseById('machine_chest_press'));
  assert.deepEqual(sub.state, { workingWeight: 0, currentReps: 9, consecutiveMisses: 0 });
  const bw = carriedSchemeForSwap(assignment, getExerciseById('push_up'));
  assert.deepEqual([bw.schemeParams.isBodyweight, bw.schemeParams.weightStepKg], [true, 0]);
});

check('kiểm tra thiết lập: không cần tạ khởi điểm, cần set, khoảng rep và bước tăng', () => {
  const base = { exerciseId: 'x', scheme, schemeParams: ACC, initialState: { workingWeight: 0, currentReps: 8 } };
  assert.deepEqual(assignmentSetupIssues(base), []);
  assert.equal(assignmentSetupIssues({ ...base, schemeParams: { ...ACC, repsMax: 6 } }).length, 1);
  assert.equal(assignmentSetupIssues({ ...base, schemeParams: { ...ACC, weightStepKg: 0 } }).length, 1);
  assert.deepEqual(assignmentSetupIssues({ ...base, schemeParams: { ...ACC, isBodyweight: true, weightStepKg: 0 } }), []);
});

check('nhật ký thay đổi của coach ghi được các thông số mới', () => {
  const before = { scheme, schemeParams: ACC, state: { workingWeight: 60, currentReps: 8 } };
  const after = { scheme, schemeParams: { ...ACC, repsMax: 12, weightStepKg: 5 }, state: { workingWeight: 60, currentReps: 8 } };
  assert.deepEqual(progressionChangeDiff(before, after).map((change) => change.field), ['repsMax', 'weightStepKg']);
});

check('màn hình tập và màn hình coach hiểu kiểu 9', () => {
  const client = read('client.html');
  assert.match(client, /activeContext\.scheme === SCHEME\.LAST_SET_RIR \|\| activeContext\.scheme === SCHEME\.DOUBLE_PROGRESSION/, 'có ô RIR set cuối');
  assert.match(client, /tự chọn mức tạ<\/strong> qua vài set khởi động tăng dần/);
  assert.match(client, /Đủ \$\{planned\.repsMax\} rep ở mọi set thì buổi sau tăng tạ/);
  const coach = read('coach.html');
  assert.match(coach, /\? 'Tăng rep rồi tăng tạ'/);
  assert.match(coach, /id="p-weightStepKg"/);
  assert.match(coach, /weightStepKg: 'Bước tăng tạ'/);
  // Đổi sang bài tự trọng trong form thì bài thành tự trọng, theo bài đang chọn chứ không theo bài cũ.
  assert.match(coach, /const bodyweight = exercise\.isBodyweight === true \|\| exercise\.defaultParams\?\.progressionMode === PROGRESSION_MODE\.REPS_SETS_ONLY;/);
  assert.match(coach, /const isBodyweight = exercise\.isBodyweight === true \|\| exercise\.defaultParams\?\.progressionMode === PROGRESSION_MODE\.REPS_SETS_ONLY;/);
  assert.doesNotMatch(coach, /existingAssignment\?\.schemeParams\?\.isBodyweight === true/);
  // Chỉ bài đã ở kiểu 9 mới thấy lựa chọn này: thư viện và giáo án tạo tay không đổi.
  assert.match(coach, /Number\(existing\?\.scheme\) === SCHEME\.DOUBLE_PROGRESSION \? `<option value="9"/);
});

console.log(`DOUBLE_PROGRESSION_OK ${passed} passed`);
