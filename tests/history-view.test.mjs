// The workout history at a glance (2026-11-02): each lift's sets as a table, plan beside what
// was done, and each closed session with its records, progress and volume.
//   node tests/history-view.test.mjs
import assert from 'node:assert/strict';
import { SCHEME } from '../progression-engine.js';
import { sessionChipsMarkup, sessionTotals, setRows, setTableMarkup, volumeText } from '../history-view.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const straight = { scheme: SCHEME.SET_THEN_REP_INCREASE, planned: { weight: 57.5, sets: 3, reps: 6 } };

check('each set sits beside its plan, and a set short of its reps is marked', () => {
  const rows = setRows({ ...straight, actualSets: [{ weight: 57.5, reps: 6 }, { weight: 57.5, reps: 5 }] });
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[1].plan, { weight: 57.5, reps: 6 });
  assert.equal(rows[1].short, true);
  assert.equal(rows[2].done, null, 'a planned set not done is shown, not dropped');
  const html = setTableMarkup({ ...straight, actualSets: [{ weight: 57.5, reps: 6 }, { weight: 57.5, reps: 5 }] });
  assert.match(html, /57,5 × 5<small>thiếu 1<\/small>/);
  assert.match(html, /chưa tập/);
});

check('a reverse pyramid compares each set with its own line', () => {
  const log = {
    scheme: SCHEME.REVERSE_PYRAMID,
    planned: { weight: 18, sets: 3, reps: 8, setPrescriptions: [{ weight: 18, reps: 8 }, { weight: 16, reps: 10 }, { weight: 14, reps: 12 }] },
    actualSets: [{ weight: 18, reps: 8 }, { weight: 16, reps: 9 }, { weight: 14, reps: 12 }],
  };
  assert.deepEqual(setRows(log).map((row) => row.short), [false, true, false]);
  assert.match(setTableMarkup(log), /16 × 10/);
});

check('a sets adjusted on the day count as the plan; extra sets have no plan', () => {
  assert.equal(setRows({ ...straight, adjustedSetCount: 2, actualSets: [{ weight: 57.5, reps: 6 }, { weight: 57.5, reps: 6 }] }).length, 2);
  const extra = setRows({ ...straight, actualSets: [1, 2, 3, 4].map(() => ({ weight: 57.5, reps: 6 })) });
  assert.equal(extra[3].plan, null);
});

check('a fixed total shows the total, RIR shows only when logged, bodyweight shows reps', () => {
  const total = setTableMarkup({ scheme: SCHEME.FIXED_TOTAL_REPS, planned: { weight: 45, sets: 4, reps: 10, totalRepsTarget: 40 }, actualSets: [12, 11, 10, 9].map((reps) => ({ weight: 45, reps })) });
  assert.match(total, /Tổng 42 \/ 40 rep/);
  assert.doesNotMatch(total, /Kế hoạch/);
  assert.match(setTableMarkup({ ...straight, actualSets: [{ weight: 57.5, reps: 6, rir: 2 }] }), /RIR/);
  assert.doesNotMatch(setTableMarkup({ ...straight, actualSets: [{ weight: 57.5, reps: 6 }] }), /RIR/);
  assert.match(setTableMarkup({ planned: { weight: 0, sets: 1, reps: 10 }, actualSets: [{ weight: 0, reps: 10 }] }), /10 rep/);
  assert.equal(setTableMarkup({ actualSets: [] }), '');
});

check('a closed session counts records, progress and volume, skipped lifts left out', () => {
  const session = { exerciseLogs: [
    { outcome: 'up', isPR: true, actualSets: [{ weight: 70, reps: 5 }, { weight: 70, reps: 5 }] },
    { outcome: 'hold', actualSets: [{ weight: 10, reps: 12 }] },
    { outcome: 'skipped', status: 'skipped', isPR: true, actualSets: [{ weight: 100, reps: 1 }] },
  ] };
  assert.deepEqual(sessionTotals(session), { records: 1, progressed: 1, volume: 820 });
  assert.equal(volumeText(4431), '4.431 kg');
  const chips = sessionChipsMarkup(sessionTotals(session));
  assert.match(chips, /1 kỷ lục/);
  assert.match(chips, /1 tiến bộ/);
  assert.match(chips, /Khối lượng 820 kg/);
  assert.equal(sessionChipsMarkup({ records: 0, progressed: 0, volume: 0 }), '');
});

check('names and numbers from the log are escaped', () => {
  assert.doesNotMatch(setTableMarkup({ actualSets: [{ weight: '<b>', reps: 5 }] }), /<b>/);
});

console.log(`HISTORY_VIEW_OK ${passed} passed`);
