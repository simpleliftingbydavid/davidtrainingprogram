// Ô rep tự điền theo rep buổi trước (David chốt 2026-11-13: 1a, 2a, 3a).
//   node tests/prefill-reps.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PREFILL_REPS_SCHEMES, latestPerformanceByExercise, performanceForExercise, prefillReps, previousSetForIndex } from '../previous-performance-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const prev = (weight, reps) => ({ setIndex: 1, weight, reps });

check('only schemes 5, 7, 8, 9 and bodyweight lifts', () => {
  assert.deepEqual([...PREFILL_REPS_SCHEMES], [5, 7, 8, 9]);
  [5, 7, 8, 9].forEach((scheme) => assert.equal(prefillReps({ scheme, plannedReps: 8, plannedWeight: 60, previousSet: prev(60, 10) }), 10, `scheme ${scheme}`));
  [1, 2, 3, 4, 6, 10].forEach((scheme) => assert.equal(prefillReps({ scheme, plannedReps: 8, plannedWeight: 60, previousSet: prev(60, 10) }), 8, `scheme ${scheme} giữ rep giáo án`));
  assert.equal(prefillReps({ scheme: 3, bodyweightOnly: true, plannedReps: 8, plannedWeight: 0, previousSet: prev(0, 12) }), 12, 'bài không tạ');
});

check('same load only; a heavier load today keeps the planned reps', () => {
  assert.equal(prefillReps({ scheme: 9, plannedReps: 8, plannedWeight: 62.5, previousSet: prev(60, 12) }), 8);
  assert.equal(prefillReps({ scheme: 9, plannedReps: 8, plannedWeight: '60', previousSet: prev(60, 11) }), 11);
  assert.equal(prefillReps({ scheme: 9, bodyweightOnly: true, plannedReps: 8, plannedWeight: 5, previousSet: prev(0, 11) }), 11, 'không tạ: bỏ qua kg');
});

check('never below the planned reps', () => {
  assert.equal(prefillReps({ scheme: 7, plannedReps: 11, plannedWeight: 0, previousSet: prev(0, 10) }), 11);
  assert.equal(prefillReps({ scheme: 9, plannedReps: 8, plannedWeight: 60, previousSet: prev(60, 6) }), 8);
});

check('missing or invalid previous set keeps the planned reps', () => {
  assert.equal(prefillReps({ scheme: 9, plannedReps: 8, plannedWeight: 60, previousSet: null }), 8);
  [0, '', 'abc', undefined].forEach((reps) => assert.equal(prefillReps({ scheme: 9, plannedReps: 8, plannedWeight: 60, previousSet: { weight: 60, reps } }), 8, String(reps)));
  assert.equal(prefillReps(), undefined);
});

check('per set: set 4 today with only 3 sets last time uses the plan', () => {
  const latest = latestPerformanceByExercise([{ id: 's1', exerciseLogs: [{ exerciseId: 'squat', actualSets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 9 }, { weight: 60, reps: 9 }] }] }]);
  const perf = performanceForExercise(latest, 'squat');
  const reps = [1, 2, 3, 4].map((i) => prefillReps({ scheme: 9, plannedReps: 8, plannedWeight: 60, previousSet: previousSetForIndex(perf, i) }));
  assert.deepEqual(reps, [10, 9, 9, 8]);
});

check('client.html uses the helper; typed values still win', () => {
  const page = readFileSync(new URL('../client.html', import.meta.url), 'utf8');
  assert.match(page, /const defaultReps = prefillReps\(\{ scheme: activeContext\.scheme, bodyweightOnly: repsSetsOnly, plannedReps, plannedWeight: defaultWeight, previousSet \}\);/);
  assert.match(page, /value="\$\{escapeHtml\(saved\?\.reps \?\? defaultReps\)\}"/);
});

console.log(`PREFILL_REPS_OK ${passed} passed`);
