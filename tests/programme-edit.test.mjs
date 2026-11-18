// Classification behind the coach's "học viên vừa sửa giáo án" notification.
// Runs without the emulator: the helpers are pure by design.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { classifyProgrammeEdit, isFreshStudentEdit, sameStamp } = require('../functions/programme-edit-utils.js');

const stamp = (ms) => ({ toMillis: () => ms, isEqual(other) { return other?.toMillis?.() === ms; } });
const bench = { exerciseId: 'bench_press', exerciseNameSnapshot: { vi: 'Bench Press' }, active: true };

// ---------- what counts as a programme edit ----------

assert.deepEqual(
  classifyProgrammeEdit(null, { ...bench, studentEditedAt: stamp(1) }),
  { verb: 'Thêm', exerciseName: 'Bench Press' },
  'a brand new assignment is an addition',
);

assert.deepEqual(
  classifyProgrammeEdit(bench, { ...bench, active: false }),
  { verb: 'Bỏ', exerciseName: 'Bench Press' },
  'deactivating is a removal',
);

assert.deepEqual(
  classifyProgrammeEdit(bench, { exerciseId: 'machine_chest_press', exerciseNameSnapshot: { vi: 'Machine Chest Press' }, active: true }),
  { verb: 'Đổi', exerciseName: 'Bench Press → Machine Chest Press' },
  'a different exercise on the same assignment is a swap',
);

// The one that matters most: every completed set rewrites its assignment's
// progression state. If those counted, a single session would bury the real
// edits under dozens of notifications.
assert.equal(
  classifyProgrammeEdit(bench, { ...bench, state: { workingWeight: 60 } }),
  null,
  'a progression state update is not a programme edit',
);

assert.equal(classifyProgrammeEdit(bench, null), null, 'a deleted assignment raises nothing');

// Học viên đổi thứ tự và lưu cho các lần sau (2026-11-18): một dòng chung cho cả buổi.
assert.deepEqual(
  classifyProgrammeEdit({ ...bench, dayLabel: 'A', orderInDay: 1 }, { ...bench, dayLabel: 'A', orderInDay: 3, studentEditedAt: stamp(2) }),
  { verb: 'Đổi thứ tự', exerciseName: 'buổi A' },
  'a new orderInDay is a reorder',
);
assert.deepEqual(
  classifyProgrammeEdit({ exerciseId: 'squat', dayLabel: 'A', orderInDay: 3 }, { exerciseId: 'squat', dayLabel: 'A', orderInDay: 1 }),
  classifyProgrammeEdit({ ...bench, dayLabel: 'A', orderInDay: 1 }, { ...bench, dayLabel: 'A', orderInDay: 3 }),
  'every moved exercise of the day gives the same line, so the coach sees it once',
);
assert.equal(classifyProgrammeEdit({ ...bench, orderInDay: 2 }, { ...bench, orderInDay: 2, state: { workingWeight: 60 } }), null, 'same order: not a reorder');

// ---------- which writes are fresh student edits ----------

assert.equal(isFreshStudentEdit(null, { ...bench, studentEditedAt: stamp(1) }), true, 'a new student-created assignment is fresh');
assert.equal(isFreshStudentEdit(bench, { ...bench, studentEditedAt: stamp(1) }), true, 'a first student edit is fresh');

assert.equal(
  isFreshStudentEdit({ ...bench, studentEditedAt: stamp(1) }, { ...bench, studentEditedAt: stamp(1), state: { workingWeight: 60 } }),
  false,
  'an unchanged stamp means the coach was already told',
);

assert.equal(
  isFreshStudentEdit({ ...bench, studentEditedAt: stamp(1) }, { ...bench, studentEditedAt: stamp(2) }),
  true,
  'a later edit in a new session is fresh again',
);

// Coach actions must never notify. Editing an assignment leaves the stamp
// alone; restoring a dropped exercise clears it.
assert.equal(isFreshStudentEdit(bench, { ...bench, note: 'coach đã sửa' }), false, 'a coach edit carries no stamp');
assert.equal(
  isFreshStudentEdit({ ...bench, active: false, studentEditedAt: stamp(1) }, { ...bench, active: true, studentEditedAt: null }),
  false,
  'restoring a dropped exercise does not notify',
);

// ---------- timestamp comparison ----------

assert.equal(sameStamp(stamp(5), stamp(5)), true);
assert.equal(sameStamp(stamp(5), stamp(6)), false);
assert.equal(sameStamp(null, null), true);
assert.equal(sameStamp(null, stamp(5)), false, 'a missing stamp never equals a real one');

console.log('PROGRAMME_EDIT_OK 15 / 15 passed');
