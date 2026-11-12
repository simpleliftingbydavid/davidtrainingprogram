// APRE — Plus Set, theo tuần (David chốt 1a, 2a, 3a ngày 2026-11-12).
//   node tests/apre.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  APRE_TABLE, SCHEME, apreAdjustedWeight, calculateNextPrescription, classifyOutcome, getInitialPrescription, mondayOf, vnIsoDay,
} from '../progression-engine.js';
import { apreCoachSummary, apreResultText } from '../apre-text.js';
import { schemeFitsExercise, carriedSchemeForSwap } from '../exercise-swap-utils.js';
import { assignmentSetupIssues } from '../template-import-utils.js';
import { getExerciseById } from '../exercise-seed-data.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const P = { plannedSets: 3, targetReps: 6, roundingIncrement: 2.5, restSeconds: 120 };
const sets = (weight, plus, count = 3) => Array.from({ length: count }, (_, i) => ({ weight, reps: i === count - 1 ? plus : 6 }));
const run = (state, plus, day, params = P, count = 3) => calculateNextPrescription({
  scheme: SCHEME.APRE, schemeParams: params, state,
  lastLog: { actualSets: sets(getInitialPrescription({ scheme: SCHEME.APRE, schemeParams: params, state, today: day }).weight, plus, count), performedDate: day },
});

check('the table is David\'s Bảng 7 with the overlaps fixed (2026-11-12)', () => {
  const pct = (delta) => run({ workingWeight: 100 }, 6 + delta, '2026-11-12', { ...P, roundingIncrement: 0.5 }).delta.pctAdj;
  assert.deepEqual([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 6].map(pct), [-5, -5, -5, -4, -4, -3, 0, 1, 2, 3, 5, 5]);
  assert.equal(APRE_TABLE.length, 8);
  assert.equal(SCHEME.APRE, 10);
});

check('rounding: to the plate step, at least one step when the % moves, never below one step', () => {
  assert.equal(apreAdjustedWeight(60, 1, 2.5), 62.5, '60,6 kg làm tròn về 60 → đi 1 nấc');
  assert.equal(apreAdjustedWeight(20, -3, 2.5), 17.5, '19,4 → 20 → lùi 1 nấc');
  assert.equal(apreAdjustedWeight(100, 5, 2.5), 105);
  assert.equal(apreAdjustedWeight(100, -4, 2.5), 95);
  assert.equal(apreAdjustedWeight(2.5, -5, 2.5), 2.5, 'không xuống dưới 1 nấc');
  assert.equal(apreAdjustedWeight(60, 0, 2.5), 60);
  assert.equal(apreAdjustedWeight(24, 2, 2), 26, 'nấc 2 kg của tạ đơn');
});

check('weekly: the new weight waits for Monday; two sessions in a week share one weight; the later result wins', () => {
  assert.equal(mondayOf('2026-11-12'), '2026-11-09');
  assert.equal(mondayOf('2026-11-16'), '2026-11-16');
  assert.equal(vnIsoDay(new Date('2026-11-15T18:00:00Z')), '2026-11-16', '01:00 thứ Hai giờ VN');
  const thu = run({ workingWeight: 60 }, 8, '2026-11-12'); // +2 rep
  assert.deepEqual([thu.delta.newWeight, thu.delta.appliesFrom, thu.nextState.workingWeight], [62.5, '2026-11-16', 60]);
  assert.equal(thu.nextPrescription.weight, 62.5, 'mức của tuần sau');
  const sat = getInitialPrescription({ scheme: SCHEME.APRE, schemeParams: P, state: thu.nextState, today: '2026-11-14' });
  assert.deepEqual([sat.weight, sat.nextWeekWeight, sat.nextWeekFrom], [60, 62.5, '2026-11-16'], 'giữa tuần vẫn 60 kg');
  const satDone = run(thu.nextState, 5, '2026-11-14'); // −1 rep, cùng tuần, ghi đè
  assert.deepEqual([satDone.delta.priorWeight, satDone.delta.newWeight], [60, 57.5]);
  const mon = getInitialPrescription({ scheme: SCHEME.APRE, schemeParams: P, state: satDone.nextState, today: '2026-11-16' });
  assert.equal(mon.weight, 57.5, 'thứ Hai dùng kết quả buổi gần nhất');
  const monDone = run(satDone.nextState, 6, '2026-11-16');
  assert.deepEqual([monDone.delta.priorWeight, monDone.nextState.workingWeight, monDone.delta.newWeight, monDone.delta.appliesFrom], [57.5, 57.5, 57.5, '2026-11-23']);
});

check('no Plus Set or a missing set: no new result, weight held, not counted as down', () => {
  const short = run({ workingWeight: 60 }, 8, '2026-11-12', P, 2);
  assert.deepEqual([short.delta.action, short.delta.pctAdj, short.nextPrescription.weight], ['no_plus', 0, 60]);
  assert.equal(classifyOutcome(SCHEME.APRE, short.delta), 'hold');
  // Earlier result in the same week stays.
  const first = run({ workingWeight: 60 }, 10, '2026-11-10');
  const second = run(first.nextState, 8, '2026-11-12', P, 2);
  assert.deepEqual([second.delta.action, second.nextState.pendingWeight], ['no_plus', 62.5], '60 kg +5% = 63 → 62,5');
  assert.match(second.resultBucket, /giữ kết quả buổi trước trong tuần/);
});

check('outcome colours follow the sign of the change', () => {
  assert.equal(classifyOutcome(SCHEME.APRE, run({ workingWeight: 60 }, 9, '2026-11-12').delta), 'up');
  assert.equal(classifyOutcome(SCHEME.APRE, run({ workingWeight: 60 }, 6, '2026-11-12').delta), 'hold');
  assert.equal(classifyOutcome(SCHEME.APRE, run({ workingWeight: 60 }, 3, '2026-11-12').delta), 'down');
});

check('words for the coach and the client', () => {
  const thu = run({ workingWeight: 60 }, 8, '2026-11-12');
  assert.equal(apreResultText(thu.delta, ' mỗi bên'), 'Plus Set 8 rep (+2) → tuần sau 62,5 kg mỗi bên (áp dụng từ thứ Hai 16/11)');
  assert.equal(apreResultText(run({ workingWeight: 60 }, 6, '2026-11-12').delta), 'Plus Set 6 rep (±0) → tuần sau giữ 60 kg');
  assert.equal(apreResultText(run({ workingWeight: 60 }, 2, '2026-11-12').delta), 'Plus Set 2 rep (−4) → tuần sau 57,5 kg (áp dụng từ thứ Hai 16/11)');
  const a = { scheme: 10, schemeParams: P, state: thu.nextState };
  assert.equal(apreCoachSummary(a, '', '2026-11-13'), '60 kg × 3 set × 6 rep · set cuối tối đa · đổi tạ theo tuần · từ 16/11: 62,5 kg');
  assert.equal(apreCoachSummary(a, '', '2026-11-16'), '62,5 kg × 3 set × 6 rep · set cuối tối đa · đổi tạ theo tuần');
});

check('weighted lifts only; a swap keeps the mechanism with the new lift\'s plate step', () => {
  assert.equal(schemeFitsExercise(10, getExerciseById('squat')), true);
  assert.equal(schemeFitsExercise(10, getExerciseById('push_up')), false);
  const swapped = carriedSchemeForSwap({ scheme: 10, schemeParams: P, state: { workingWeight: 60, pendingWeight: 62.5 } }, getExerciseById('db_rows'));
  assert.equal(swapped.scheme, 10);
  assert.equal(swapped.state, null, 'không mang mức tạ hay kết quả tuần của bài cũ');
  assert.ok(swapped.schemeParams.roundingIncrement >= 2.5);
});

check('setup checks ask for sets, target reps, plate step and the first week\'s weight', () => {
  const ok = { exerciseId: 'squat', scheme: 10, schemeParams: P, initialState: { workingWeight: 60 } };
  assert.deepEqual(assignmentSetupIssues(ok), []);
  assert.match(assignmentSetupIssues({ ...ok, initialState: {} }).join(' '), /chưa có mức tạ tuần đầu/);
});

check('the coach can pick APRE; the client labels the last set Plus Set; other schemes untouched', () => {
  const coach = read('coach.html');
  assert.match(coach, /<option value="10" \$\{scheme === SCHEME\.APRE \? 'selected' : ''\} \$\{exercise\.isBodyweight \? 'disabled' : ''\}>APRE \(Plus Set, theo tuần\)<\/option>/);
  assert.match(coach, /'state\.pendingWeight': null/);
  assert.match(coach, /apreCoachSummary\(a, per\)/);
  const client = read('client.html');
  assert.match(client, /isApreScheme && i === n \? '<small class="cu-plus-set"/);
  assert.match(client, /return apreTodayLine\(planned, loadText\(assignment, planned\.weight, exercise\)\);/);
  assert.match(client, /apreResultText\(r\.delta, per\)/);
  assert.match(client, /const apreDown = outcome === 'down' && resultScheme === SCHEME\.APRE && r\.delta\?\.pctAdj < 0;/);
  assert.match(read('volume-engine.js'), /\[2, 3, 4, 5, 9, 10\]\.includes\(scheme\)/);
});

console.log(`APRE_OK ${passed} passed`);
