// Học viên đổi thứ tự bài trong buổi (2026-11-18): dời bài, khoá bài đã tập, số orderInDay mới,
// bản nháp giữ thứ tự và lựa chọn, ghi chú lịch sử, và chỗ nối trong client.html.
//   node tests/exercise-order.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const order = await import('../exercise-order.js');
const { normalizeWorkoutDraft } = await import('../workout-draft-utils.js');
const { setLang } = await import('../i18n.js');

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

await check('moveItem moves one step and never past the ends', () => {
  const list = ['a', 'b', 'c'];
  assert.deepEqual(order.moveItem(list, 0, 1), ['b', 'a', 'c']);
  assert.deepEqual(order.moveItem(list, 2, -1), ['a', 'c', 'b']);
  assert.equal(order.moveItem(list, 0, -1), list, 'top stays');
  assert.equal(order.moveItem(list, 2, 1), list, 'bottom stays');
  assert.deepEqual(list, ['a', 'b', 'c'], 'the input is not changed');
});

await check('during the workout only exercises not started can swap, and only with each other', () => {
  const locked = [true, false, false, true];
  assert.equal(order.canMove(locked, 1, 1), true);
  assert.equal(order.canMove(locked, 2, -1), true);
  assert.equal(order.canMove(locked, 1, -1), false, 'cannot jump above a done exercise');
  assert.equal(order.canMove(locked, 2, 1), false, 'cannot pass a started one');
  assert.equal(order.canMove(locked, 0, 1), false, 'a done exercise stays');
  assert.equal(order.canMove([false, false], 0, 1), true, 'before the start everything moves');
});

await check('orderChanged compares the programme exercises only', () => {
  assert.equal(order.orderChanged(['a', 'b', 'c'], ['a', 'b', 'c']), false);
  assert.equal(order.orderChanged(['a', 'b', 'c'], ['b', 'a', 'c']), true);
  assert.equal(order.orderChanged(['a', 'b', 'c'], ['a', 'c']), false, 'a skipped or removed exercise is not a reorder');
  assert.equal(order.orderChanged(['a', 'b'], ['a', 'x', 'b']), false, 'an extra exercise in between is not a reorder');
});

await check('"Keep for next time" reuses the same orderInDay numbers and only writes the ones that moved', () => {
  const updates = order.orderInDayUpdates([{ id: 'c', orderInDay: 30 }, { id: 'a', orderInDay: 10 }, { id: 'b', orderInDay: 20 }]);
  assert.deepEqual(updates, [{ id: 'c', orderInDay: 10 }, { id: 'a', orderInDay: 20 }, { id: 'b', orderInDay: 30 }]);
  assert.deepEqual(order.orderInDayUpdates([{ id: 'a', orderInDay: 1 }, { id: 'c', orderInDay: 3 }, { id: 'b', orderInDay: 2 }]),
    [{ id: 'c', orderInDay: 2 }, { id: 'b', orderInDay: 3 }], 'a stays: not written again');
  assert.deepEqual(order.orderInDayUpdates([{ id: 'a', orderInDay: 1 }, { id: 'b', orderInDay: 2 }]), [], 'no change: no write');
  // Duplicates or broken numbers: numbered again 1..n, all within what the rules accept.
  const fixed = order.orderInDayUpdates([{ id: 'b', orderInDay: 0 }, { id: 'a', orderInDay: 0 }]);
  assert.deepEqual(fixed, [{ id: 'b', orderInDay: 1 }, { id: 'a', orderInDay: 2 }]);
  assert.ok(fixed.every((u) => Number.isInteger(u.orderInDay) && u.orderInDay >= 1 && u.orderInDay <= order.MAX_ORDER_IN_DAY));
});

await check('blocks are put back in the order the draft saved; unknown ones stay after, in their order', () => {
  const blocks = [{ k: ['s:1', 'a:A'] }, { k: ['s:2', 'a:B'] }, { k: ['s:3', 'a:C'] }, { k: ['', 'a:D'] }];
  const sorted = order.orderByKeys(blocks, ['s:3', 'a:C', 's:1', 'a:A', '', 'a:B'], (b) => b.k);
  assert.deepEqual(sorted.map((b) => b.k[1]), ['a:C', 'a:A', 'a:B', 'a:D']);
});

await check('the draft keeps the choice; anything else is dropped', () => {
  const base = { version: 6, day: 'A', sessionId: 's1', exercises: [{ assignmentId: 'b' }, { assignmentId: 'a' }] };
  assert.equal(normalizeWorkoutDraft({ ...base, orderChoice: 'keep' }).orderChoice, 'keep');
  assert.equal(normalizeWorkoutDraft({ ...base, orderChoice: 'today' }).orderChoice, 'today');
  assert.equal(normalizeWorkoutDraft({ ...base, orderChoice: 'x' }).orderChoice, '');
  assert.deepEqual(normalizeWorkoutDraft(base).exercises.map((e) => e.assignmentId), ['b', 'a'], 'the real order is the exercises order');
});

await check('history note, in Vietnamese and English, for the coach and for the client', () => {
  setLang('vi');
  assert.equal(order.orderNoteText({}), '');
  assert.equal(order.orderNoteText({ exerciseOrderChanged: false }), '');
  assert.match(order.orderNoteText({ exerciseOrderChanged: true }), /Học viên đã đổi thứ tự bài \(chỉ buổi này\)/);
  assert.match(order.orderNoteText({ exerciseOrderChanged: true, exerciseOrderKept: true }, { mine: true }), /^Đã đổi thứ tự bài và lưu/);
  setLang('en');
  assert.match(order.orderNoteText({ exerciseOrderChanged: true, exerciseOrderKept: true }), /kept it for next time/);
  assert.match(order.moveButtonsMarkup(0, { locked: [false, false], name: 'Squat' }), /aria-label="Move Squat up" disabled/);
  assert.match(order.choiceMarkup('keep'), /value="keep" data-ord-choice checked/);
  setLang('vi');
});

await check('client.html: one write, only for "keep", after the session is saved; history records the real order', () => {
  const html = read('client.html');
  const save = html.slice(html.indexOf('const results = await logSessionAndAdvance('));
  assert.ok(save.indexOf('saveStudentExerciseOrder(') > 0, 'written after the session is recorded');
  assert.equal((html.match(/saveStudentExerciseOrder\(studentUid/g) || []).length, 1, 'one call site');
  assert.match(html, /const keepExerciseOrder = exerciseOrderWasChanged && exerciseOrderChoice === ORDER_CHOICE\.KEEP;/);
  assert.match(save, /if \(keepExerciseOrder\) \{/);
  assert.match(html, /exerciseOrderChanged: exerciseOrderWasChanged,\s*exerciseOrderKept: keepExerciseOrder,\s*exerciseOrder: actualOrderIds,/);
  assert.match(html, /orderChoice: exerciseOrderChoice,/, 'the draft carries the choice');
  assert.match(html, /applyDraftOrder\(draft\.exercises\);/, 'a resumed draft keeps its order');
  // The move handlers never write to Firestore themselves.
  const panel = html.slice(html.indexOf("$('cu-order-panel').addEventListener('click'"), html.indexOf('function renderSessionFromDraft'));
  assert.ok(!/saveStudent|updateDoc|setDoc/.test(panel));
});

await check('training-data: the order write touches only orderInDay and the audit fields; the session keeps the flags', () => {
  const src = read('training-data.js');
  const fn = src.slice(src.indexOf('export async function saveStudentExerciseOrder'), src.indexOf('export async function saveStudentProgramChanges'));
  const update = fn.slice(fn.indexOf('tx.update('), fn.indexOf('});', fn.indexOf('tx.update(')));
  assert.deepEqual([...update.matchAll(/^\s+(\w+)[,:]/gm)].map((m) => m[1]), ['orderInDay', 'sourceSessionId', 'studentEditedAt', 'updatedAt']);
  assert.match(fn, /item\.active !== false && item\.dayLabel === dayLabel/);
  assert.match(src, /exerciseOrderChanged: true,\s*exerciseOrderKept:/);
  assert.match(src, /orderChoice: draft\.orderChoice === 'keep'/);
});

await check('progression does not depend on the order', () => {
  // Each lift advances from its own assignment state; the engine never reads orderInDay.
  for (const file of ['progression-engine.js', 'workout-session-utils.js']) assert.ok(!/orderInDay/.test(read(file)), file);
});

console.log(`EXERCISE_ORDER_OK ${passed} passed`);
