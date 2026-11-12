// Số tạ đã tập là mốc của buổi sau (David, 2026-11-12): học viên tập khác số giáo án, nặng hơn hay
// nhẹ hơn, thì progression tính tiếp từ số đã tập.
//   node tests/load-rebase.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEME, getInitialPrescription } from '../progression-engine.js';
import {
  advanceSessionExercise, loadRebaseText, performedWorkingWeight, rebaseLoadToActual,
} from '../workout-session-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const sets = (weights, reps = 5) => weights.map((weight, index) => ({ setIndex: index + 1, weight, reps, rir: 2 }));

check('mức đã tập: nhiều set nhất, bằng nhau lấy set sau cùng, bỏ số 0', () => {
  assert.equal(performedWorkingWeight(sets([60, 62.5, 62.5])), 62.5);
  assert.equal(performedWorkingWeight(sets([60, 60, 62.5, 62.5])), 62.5);
  assert.equal(performedWorkingWeight(sets([0, 0])), null);
  assert.equal(performedWorkingWeight([]), null);
});

const overload = { scheme: SCHEME.CLASSIC_OVERLOAD, schemeParams: { plannedSets: 3, repsPerSet: 5, increment: 2.5, roundingIncrement: 2.5 } };

check('classic overload: tập nặng hơn và đạt → buổi sau cộng từ số đã tập', () => {
  const state = { workingWeight: 60, consecutiveMisses: 0 };
  const out = advanceSessionExercise({ ...overload, state, actualSets: sets([62.5, 62.5, 62.5]), adjustedSetCount: 3 });
  assert.deepEqual(out.delta.loadRebase, { from: 60, to: 62.5 });
  assert.ok(out.nextPrescription.weight > 62.5, `buổi sau ${out.nextPrescription.weight}`);
});

check('tập nhẹ hơn giáo án cũng thành mốc mới', () => {
  const state = { workingWeight: 60, consecutiveMisses: 0 };
  const out = advanceSessionExercise({ ...overload, state, actualSets: sets([55, 55, 55]), adjustedSetCount: 3 });
  assert.deepEqual(out.delta.loadRebase, { from: 60, to: 55 });
  assert.ok(out.nextPrescription.weight >= 55 && out.nextPrescription.weight < 60, `buổi sau ${out.nextPrescription.weight}`);
});

check('đúng giáo án: không đổi gì, không có loadRebase', () => {
  const state = { workingWeight: 60, consecutiveMisses: 0 };
  const out = advanceSessionExercise({ ...overload, state, actualSets: sets([60, 60, 60]), adjustedSetCount: 3 });
  assert.equal(out.delta.loadRebase, undefined);
});

check('số lệch quá xa (gõ nhầm) bị bỏ qua', () => {
  const state = { workingWeight: 60, consecutiveMisses: 0 };
  assert.equal(rebaseLoadToActual({ ...overload, state, actualSets: sets([600, 600, 600]) }).rebase, null);
  assert.equal(rebaseLoadToActual({ ...overload, state, actualSets: sets([25, 25, 25]) }).rebase, null);
});

check('buổi bị giữ progression (đau, chờ David) thì giữ mốc cũ', () => {
  const state = { workingWeight: 60, consecutiveMisses: 0 };
  const out = advanceSessionExercise({ ...overload, state, actualSets: sets([50, 50, 50]), adjustedSetCount: 3, forceHold: true });
  assert.equal(out.nextState.workingWeight, 60);
  assert.equal(out.delta.loadRebase, undefined);
});

check('giảm set theo thể trạng: giữ tiến độ nhưng mốc là số đã tập', () => {
  const state = { workingWeight: 60, consecutiveMisses: 0 };
  const out = advanceSessionExercise({ ...overload, state, actualSets: sets([62.5, 62.5]), adjustedSetCount: 2 });
  assert.equal(out.progressionHeld, true);
  assert.equal(out.nextState.workingWeight, 62.5);
  assert.equal(out.nextPrescription.weight, 62.5);
});

check('kiểu theo training max: TM tính lại từ số đã tập', () => {
  const scheme = SCHEME.LAST_SET_RIR;
  const schemeParams = { intensityPct: 80, plannedSets: 3, repsPerSet: 5, targetRIR: 2, roundingIncrement: 2.5 };
  const state = { trainingMax: 75, consecutiveMisses: 0 }; // 60 kg
  assert.equal(getInitialPrescription({ scheme, schemeParams, state }).weight, 60);
  const { state: next, rebase } = rebaseLoadToActual({ scheme, schemeParams, state, actualSets: sets([62.5, 62.5, 62.5]) });
  assert.deepEqual(rebase, { from: 60, to: 62.5 });
  assert.equal(getInitialPrescription({ scheme, schemeParams, state: next }).weight, 62.5);
});

check('kim tự tháp ngược: từng set theo số đã tập', () => {
  const scheme = SCHEME.REVERSE_PYRAMID;
  const schemeParams = { setTargets: [5, 7, 9], roundingIncrement: 2.5, plannedSets: 3 };
  const state = { setWeights: [80, 72.5, 65], workingWeight: 80 };
  const { state: next, rebase } = rebaseLoadToActual({ scheme, schemeParams, state, actualSets: sets([82.5, 72.5, 67.5]) });
  assert.deepEqual(next.setWeights, [82.5, 72.5, 67.5]);
  assert.deepEqual(rebase.to, [82.5, 72.5, 67.5]);
  assert.equal(loadRebaseText(rebase), 'Bạn tập khác giáo án ở set 1, 3, nên buổi sau tính từ số tạ bạn đã tập.');
});

check('APRE: mức tuần này đổi theo số đã tập, kể cả khi mức chờ vừa tới hạn', () => {
  const scheme = SCHEME.APRE;
  const schemeParams = { plannedSets: 3, targetReps: 6, roundingIncrement: 2.5 };
  const plain = rebaseLoadToActual({ scheme, schemeParams, state: { workingWeight: 60 }, actualSets: sets([62.5, 62.5, 62.5]), today: '2026-11-12' });
  assert.equal(plain.state.workingWeight, 62.5);
  const rolled = rebaseLoadToActual({
    scheme, schemeParams, state: { workingWeight: 57.5, pendingWeight: 60, pendingFrom: '2026-11-09' },
    actualSets: sets([62.5, 62.5, 62.5]), today: '2026-11-12',
  });
  assert.deepEqual(rolled.rebase, { from: 60, to: 62.5 });
  assert.equal(getInitialPrescription({ scheme, schemeParams, state: rolled.state, today: '2026-11-12' }).weight, 62.5);
});

check('bài chỉ tăng rep/set hoặc tạ cơ thể: không đụng tới', () => {
  assert.equal(rebaseLoadToActual({ scheme: SCHEME.REP_INCREASE, schemeParams: {}, state: { currentSets: 3, currentReps: 8 }, actualSets: sets([10]) }).rebase, null);
  assert.equal(rebaseLoadToActual({ scheme: SCHEME.DOUBLE_PROGRESSION, schemeParams: { isBodyweight: true }, state: { workingWeight: 0 }, actualSets: sets([5]) }).rebase, null);
});

check('câu trên màn hình kết quả', () => {
  assert.equal(loadRebaseText({ from: 60, to: 62.5 }), 'Bạn tập 62,5 kg thay vì 60 kg, nên buổi sau tính từ 62,5 kg.');
  assert.equal(loadRebaseText({ from: 20, to: 22.5 }, ' mỗi bên'), 'Bạn tập 22,5 kg mỗi bên thay vì 20 kg mỗi bên, nên buổi sau tính từ 22,5 kg mỗi bên.');
  assert.equal(loadRebaseText(null), '');
  const page = readFileSync(new URL('../client.html', import.meta.url), 'utf8');
  assert.ok(page.includes('loadRebaseText(r.delta.loadRebase, per)'));
});

console.log(`LOAD_REBASE_OK ${passed} passed`);
