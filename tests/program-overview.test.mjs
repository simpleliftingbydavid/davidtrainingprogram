// Run with:  node tests/program-overview.test.mjs
import assert from 'node:assert/strict';
import { buildProgramOverview, prescriptionSummary } from '../program-overview-utils.js';
import { SCHEME } from '../progression-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const classic = (overrides = {}) => ({
  id: 'a1', exerciseId: 'squat', exerciseNameSnapshot: { vi: 'Squat' }, dayLabel: 'A', orderInDay: 1,
  scheme: SCHEME.CLASSIC_OVERLOAD, schemeParams: { plannedSets: 3, repsPerSet: 8 }, state: { workingWeight: 60 }, note: '', ...overrides,
});

check('a classic prescription reads as load, sets and reps', () => {
  assert.equal(prescriptionSummary(classic()), '60 kg · 3 set × 8 rep');
  assert.equal(prescriptionSummary(classic({ state: { workingWeight: 52.5 } })), '52.5 kg · 3 set × 8 rep');
});

check('bodyweight work says so instead of showing 0 kg', () => {
  const pushup = classic({ scheme: SCHEME.REP_INCREASE, schemeParams: {}, state: { currentSets: 3, currentReps: 10 } });
  assert.equal(prescriptionSummary(pushup), 'Tạ cơ thể · 3 set × 10 rep');
});

check('a reverse pyramid lists every set', () => {
  const pyramid = classic({ scheme: SCHEME.REVERSE_PYRAMID, schemeParams: { setTargets: [6, 8, 10] }, state: { setWeights: [60, 55, 50] } });
  assert.equal(prescriptionSummary(pyramid), '3 set: 60×6 · 55×8 · 50×10 kg');
});

check('a set range shows the range', () => {
  const ranged = classic({ scheme: SCHEME.ORIGINAL_PROGRESSION, schemeParams: { intensityPct: 80, upperSets: 5, lowerSets: 3, repsPerSet: 5, roundingIncrement: 2.5, targetRIR: 2 }, state: { trainingMax: 100 } });
  assert.equal(prescriptionSummary(ranged), '80 kg · 5 rep mỗi set · 3–5 set');
});

check('an assignment that cannot be evaluated gives an empty line, not an exception', () => {
  assert.equal(prescriptionSummary({ scheme: 999, schemeParams: {}, state: {} }), '');
  assert.equal(prescriptionSummary({}), '');
});

check('days keep the programme order and exercises their set order', () => {
  const overview = buildProgramOverview({
    assignments: [
      classic({ id: 'b2', dayLabel: 'B', orderInDay: 2, exerciseNameSnapshot: { vi: 'Row' } }),
      classic({ id: 'a2', dayLabel: 'A', orderInDay: 2, exerciseNameSnapshot: { vi: 'Bench' } }),
      classic({ id: 'a1', dayLabel: 'A', orderInDay: 1 }),
      classic({ id: 'b1', dayLabel: 'B', orderInDay: 1, exerciseNameSnapshot: { vi: 'Deadlift' } }),
    ],
  });
  assert.deepEqual(overview.days.map((day) => day.label), ['B', 'A']);
  assert.deepEqual(overview.days[1].exercises.map((item) => item.name), ['Squat', 'Bench']);
  assert.deepEqual(overview.days[0].exercises.map((item) => item.name), ['Deadlift', 'Row']);
});

check('a paused day is marked and no longer counts towards the weekly target', () => {
  const assignments = [classic({ id: 'a1', dayLabel: 'A' }), classic({ id: 'b1', dayLabel: 'B' }), classic({ id: 'c1', dayLabel: 'C' })];
  const phase = { name: 'Chu kỳ 2', volumePlan: { dayFrequencies: { A: 2, B: 1, C: 1 } } };
  const all = buildProgramOverview({ assignments, phase });
  assert.equal(all.weeklyTarget, 4);
  assert.equal(all.phaseName, 'Chu kỳ 2');
  const paused = buildProgramOverview({ assignments, phase, hiddenDays: ['B'] });
  assert.equal(paused.weeklyTarget, 3);
  assert.deepEqual(paused.days.map((day) => [day.label, day.paused]), [['A', false], ['B', true], ['C', false]]);
});

check('a day with no planned frequency counts once a week', () => {
  const overview = buildProgramOverview({ assignments: [classic(), classic({ id: 'b1', dayLabel: 'B' })], phase: {} });
  assert.equal(overview.weeklyTarget, 2);
});

check('the coach note is carried and trimmed, and an empty programme is empty', () => {
  const overview = buildProgramOverview({ assignments: [classic({ note: '  Giữ lưng thẳng  ' })] });
  assert.equal(overview.days[0].exercises[0].note, 'Giữ lưng thẳng');
  assert.deepEqual(buildProgramOverview({}), { phaseName: '', days: [], weeklyTarget: 0 });
});

console.log(`program-overview: ${passed} passed`);
