// Thư viện bài tập và bài đề xuất chờ duyệt (David chốt 2026-11-13: Claude đề xuất, David duyệt từng bài).
//   node tests/exercise-library.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EXERCISES, getExerciseById } from '../exercise-seed-data.js';
import { EXERCISE_PROPOSALS, PROPOSAL_GROUP_ORDER, approvedProposals, pendingProposals } from '../exercise-proposals.js';
import { DOSE_RULES } from '../dose-rules.js';
import { candidatesForSlot } from '../dose-planner.js';
import { LOAD_PER_LABELS } from '../client-ui.js';
import { MUSCLE_GROUPS } from '../volume-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const GROUPS = ['Ngực', 'Lưng', 'Vai', 'Đùi trước', 'Đùi sau & Mông', 'Bắp chân', 'Tay trước', 'Tay sau', 'Bụng'];
const PATTERNS = new Set(EXERCISES.map((e) => e.movementPattern));
const TAGS = new Set(EXERCISES.flatMap((e) => e.equipmentTags));

check('the library: unique ids, known groups, patterns that match their group, a technique for each', () => {
  const ids = EXERCISES.map((e) => e.exerciseId);
  assert.equal(new Set(ids).size, ids.length, 'id không trùng');
  EXERCISES.forEach((e) => {
    assert.ok(GROUPS.includes(e.muscleGroup), `${e.exerciseId}: nhóm cơ`);
    assert.ok(Array.isArray(e.equipmentTags) && e.equipmentTags.length, `${e.exerciseId}: dụng cụ`);
  });
  assert.deepEqual([...MUSCLE_GROUPS].sort(), [...GROUPS].sort(), 'volume-engine dùng đúng 9 nhóm');
});

check('proposals: valid, no clash with the library, only the 9 groups and the patterns already in use', () => {
  const ids = EXERCISE_PROPOSALS.map((p) => p.exerciseId);
  assert.equal(new Set(ids).size, ids.length, 'id đề xuất không trùng nhau');
  const library = new Set(EXERCISES.map((e) => e.exerciseId));
  const names = new Set(EXERCISES.map((e) => e.nameVi.toLowerCase()));
  EXERCISE_PROPOSALS.forEach((p) => {
    assert.match(p.exerciseId, /^[a-z0-9_]+$/, `${p.exerciseId}: snake_case`);
    assert.ok(!library.has(p.exerciseId) || p.approved, `${p.exerciseId}: trùng id thư viện`);
    assert.ok(!names.has(p.nameVi.toLowerCase()) || p.approved, `${p.exerciseId}: trùng tên thư viện`);
    assert.ok(GROUPS.includes(p.muscleGroup), `${p.exerciseId}: nhóm cơ ngoài 9 nhóm`);
    assert.ok(PATTERNS.has(p.movementPattern), `${p.exerciseId}: movementPattern mới (${p.movementPattern})`);
    assert.ok(p.movementPattern.endsWith(p.muscleGroup === 'Bắp chân' ? 'calves' : p.movementPattern.split('_').slice(1).join('_')), p.exerciseId);
    p.equipmentTags.forEach((tag) => assert.ok(TAGS.has(tag), `${p.exerciseId}: dụng cụ lạ ${tag}`));
    assert.equal(p.technique.length, 3, `${p.exerciseId}: 3 ý kỹ thuật`);
    p.technique.forEach((line) => assert.ok(line.length > 10 && line.length < 180, `${p.exerciseId}: ý kỹ thuật`));
    assert.ok(p.gap.length > 20, `${p.exerciseId}: lý do thêm`);
    assert.equal(p.videoUrl, '', `${p.exerciseId}: không tự tạo link video`);
    assert.equal(p.isBodyweight, p.equipmentTags.length === 1 && p.equipmentTags[0] === 'bodyweight', p.exerciseId);
    if (p.loadPer) assert.ok(p.loadPer in LOAD_PER_LABELS, `${p.exerciseId}: loadPer`);
  });
  assert.deepEqual([...new Set(EXERCISE_PROPOSALS.map((p) => p.muscleGroup))].sort(), [...PROPOSAL_GROUP_ORDER].sort());
});

check('proposals follow the one-side labels: a shared single load has none, hands and sides as agreed', () => {
  const by = (id) => EXERCISE_PROPOSALS.find((p) => p.exerciseId === id);
  assert.equal(by('db_flat_bench_press').loadPer, 'hand');
  assert.equal(by('single_leg_db_calf_raise').loadPer, 'side');
  assert.equal(by('incline_machine_chest_press').loadPer, 'side');
  assert.equal(by('bb_incline_bench_press').loadPer, undefined);
  assert.equal(by('trap_bar_deadlift').loadPer, undefined);
  assert.equal(by('db_reverse_lunge').loadPer, 'hand');
});

check('nothing unapproved reaches the library: every unapproved proposal is absent from EXERCISES', () => {
  assert.equal(pendingProposals().length + approvedProposals().length, EXERCISE_PROPOSALS.length);
  pendingProposals().forEach((p) => assert.ok(!getExerciseById(p.exerciseId), `${p.exerciseId} chưa duyệt mà đã có trong thư viện`));
  EXERCISE_PROPOSALS.filter((p) => p.approved).forEach((p) => {
    assert.ok(p.approvedOn, p.exerciseId);
    assert.ok(getExerciseById(p.exerciseId), `${p.exerciseId} đã duyệt nhưng chưa vào thư viện`);
  });
});

check('the program builder: candidates per muscle group and movement pattern, and the lifts no slot offers', () => {
  const slots = [];
  Object.values(DOSE_RULES).forEach((rule) => {
    (rule.slots || []).forEach((slot) => slots.push(slot));
    Object.values(rule.splits || {}).flat().forEach((day) => (day.slots || []).forEach((slot) => { if (slot && typeof slot === 'object') slots.push(slot); }));
  });
  const offered = new Set();
  const perKind = new Map();
  slots.forEach((slot) => {
    const found = candidatesForSlot(slot, EXERCISES);
    found.forEach((id) => offered.add(id));
    perKind.set(`${(slot.muscleGroups || []).join('/')} | ${(slot.patterns || []).join(',')}`, found.length);
  });
  // Số ứng viên ở các slot hẹp nhất (kiểm tra ngày 2026-11-13, trước khi duyệt bài mới).
  assert.equal(perKind.get('Bắp chân | isolation_calves'), 2);
  assert.equal(perKind.get('Ngực | isolation_pec'), 2);
  assert.equal(perKind.get('Ngực | compound_pec'), 3);
  assert.equal(perKind.get('Đùi trước | compound_knee'), 1);
  assert.equal(perKind.get('Đùi sau & Mông | compound_hip'), 1);
  // Bài có trong thư viện nhưng không slot nào của bộ dựng gợi ý: báo cáo, David quyết có thêm slot không.
  const outside = EXERCISES.filter((e) => !offered.has(e.exerciseId)).map((e) => e.exerciseId).sort();
  assert.deepEqual(outside, ['db_pullover', 'kelso_shrug', 'machine_lat_pullover', 'rack_pulls', 'straight_arm_pulldown']);
});

check('the review page is coach-only, writes nothing, and shows only unapproved proposals', () => {
  const page = read('exercise-review.html');
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  assert.doesNotMatch(page, /addDoc|setDoc|updateDoc|deleteDoc|writeBatch/);
  assert.match(page, /const pending = \(\) => EXERCISE_PROPOSALS\.filter\(\(item\) => !item\.approved\);/);
  assert.match(page, /Sao chép kết quả/);
  assert.match(read('app-shell.js'), /\{ label: 'Duyệt bài tập mới', href: 'exercise-review\.html' \}/);
});

console.log(`EXERCISE_LIBRARY_OK ${passed} passed`);
