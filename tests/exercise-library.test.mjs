// Thư viện bài tập và bài đề xuất chờ duyệt (David chốt 2026-11-13: Claude đề xuất, David duyệt từng bài).
//   node tests/exercise-library.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { asVi } from './i18n-source.mjs';
import { EXERCISES, getExerciseById } from '../exercise-seed-data.js';
import { APPROVED_IDS, EXERCISE_PROPOSALS, PROPOSAL_GROUP_ORDER, REJECTED_IDS, approvedProposals, pendingProposals, rejectedProposals } from '../exercise-proposals.js';
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
const read = (file) => asVi(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

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
  // Tên của bài đã duyệt chính là tên trong thư viện; chỉ so tên của bài chưa duyệt hoặc đã bỏ.
  const names = new Set(EXERCISES.filter((e) => !APPROVED_IDS.includes(e.exerciseId)).map((e) => e.nameVi.toLowerCase()));
  EXERCISE_PROPOSALS.forEach((p) => {
    assert.match(p.exerciseId, /^[a-z0-9_]+$/, `${p.exerciseId}: snake_case`);
    assert.ok(library.has(p.exerciseId) === Boolean(p.approved), `${p.exerciseId}: chỉ bài đã duyệt mới có trong thư viện`);
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

check('nothing unapproved reaches the library: pending and rejected proposals are absent from EXERCISES', () => {
  assert.equal(pendingProposals().length + approvedProposals().length + rejectedProposals().length, EXERCISE_PROPOSALS.length);
  pendingProposals().forEach((p) => assert.ok(!getExerciseById(p.exerciseId), `${p.exerciseId} chưa duyệt mà đã có trong thư viện`));
  rejectedProposals().forEach((p) => assert.ok(!getExerciseById(p.exerciseId), `${p.exerciseId} đã bỏ mà vẫn lọt vào thư viện`));
  EXERCISE_PROPOSALS.filter((p) => p.approved).forEach((p) => {
    assert.ok(p.approvedOn, p.exerciseId);
    assert.ok(getExerciseById(p.exerciseId), `${p.exerciseId} đã duyệt nhưng chưa vào thư viện`);
  });
});

check('the 26 approved lifts are in the library with every field, an exact sibling\'s settings, and no video link', () => {
  assert.equal(APPROVED_IDS.length, 26);
  assert.equal(REJECTED_IDS.length, 13);
  assert.equal(approvedProposals().length, 26);
  assert.equal(rejectedProposals().length, 13);
  assert.equal(pendingProposals().length, 0, 'không còn bài chờ duyệt');
  assert.equal(EXERCISES.length, 134, '108 bài cũ + 26 bài mới');
  const ids = EXERCISES.map((e) => e.exerciseId);
  assert.equal(new Set(ids).size, ids.length, 'id không trùng');
  APPROVED_IDS.forEach((id) => {
    const lift = getExerciseById(id);
    const proposal = EXERCISE_PROPOSALS.find((p) => p.exerciseId === id);
    assert.ok(lift, `${id}: có trong thư viện`);
    ['nameVi', 'muscleGroup', 'movementPattern', 'isBodyweight'].forEach((field) => assert.equal(lift[field], proposal[field], `${id}.${field}`));
    assert.deepEqual([...lift.equipmentTags], [...proposal.equipmentTags], `${id}: dụng cụ`);
    assert.deepEqual([...lift.technique], [...proposal.technique], `${id}: kỹ thuật`);
    assert.equal(lift.technique.length, 3, id);
    assert.equal(lift.videoUrl, '', `${id}: không tự tạo link video`);
    assert.equal(lift.loadPer, proposal.loadPer, `${id}: loadPer khớp đề xuất`);
    assert.equal(lift.defaultScheme, 8, `${id}: kiểu set → rep → tạ như bài tương tự`);
    // Cùng thông số với các bài hiện có: 3→5 set, 8→12 rep, tạ +10%, nấc tạ 2,5 (tạ đòn, thân người) hoặc 5 (tạ đơn, cáp, máy).
    const existing = EXERCISES.filter((e) => !APPROVED_IDS.includes(e.exerciseId) && !e.defaultParams.progressionMode && e.defaultScheme === 8);
    const same = existing.filter((e) => JSON.stringify(e.defaultParams) === JSON.stringify(lift.defaultParams));
    assert.ok(same.length >= 3, `${id}: thông số phải trùng đúng thông số của các bài đã có`);
    assert.ok([2.5, 5].includes(lift.defaultParams.roundingIncrement), id);
    if (lift.equipmentTags.some((tag) => ['cable', 'machine'].includes(tag))) assert.equal(lift.defaultParams.roundingIncrement, 5, `${id}: cáp và máy nấc 5`);
    if (lift.equipmentTags.includes('barbell') || lift.isBodyweight) assert.equal(lift.defaultParams.roundingIncrement, 2.5, `${id}: tạ đòn và thân người nấc 2,5`);
    if (lift.isBodyweight) assert.deepEqual(lift.equipmentTags, ['bodyweight'], id);
  });
  REJECTED_IDS.forEach((id) => assert.equal(getExerciseById(id), null, `${id}: bài bỏ không vào thư viện`));
  assert.deepEqual(new Set([...APPROVED_IDS, ...REJECTED_IDS]).size, 39, 'đủ 39 bài, không bài nào vừa duyệt vừa bỏ');
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
  // Sau khi duyệt 26 bài ngày 2026-11-14 (trước đó: 2, 2, 3, 1, 1).
  assert.equal(perKind.get('Bắp chân | isolation_calves'), 4);
  assert.equal(perKind.get('Ngực | isolation_pec'), 3);
  assert.equal(perKind.get('Ngực | compound_pec'), 4);
  assert.equal(perKind.get('Đùi trước | compound_knee'), 2);
  assert.equal(perKind.get('Đùi sau & Mông | compound_hip'), 2);
  APPROVED_IDS.forEach((id) => assert.ok(offered.has(id), `${id}: không slot nào của bộ dựng gợi ý bài này`));
  // Bài có trong thư viện nhưng không slot nào của bộ dựng gợi ý: báo cáo, David quyết có thêm slot không.
  const outside = EXERCISES.filter((e) => !offered.has(e.exerciseId)).map((e) => e.exerciseId).sort();
  // weighted_back_extension: chuyển sang Lưng (David, 2026-11-18); chưa slot Lưng nào nhận dạng isolation_hip.
  assert.deepEqual(outside, ['db_pullover', 'kelso_shrug', 'machine_lat_pullover', 'rack_pulls', 'straight_arm_pulldown', 'weighted_back_extension']);
});

check('the review page is coach-only, writes nothing, and shows only pending proposals', () => {
  const page = read('exercise-review.html');
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  assert.doesNotMatch(page, /addDoc|setDoc|updateDoc|deleteDoc|writeBatch/);
  assert.match(page, /const pending = \(\) => pendingProposals\(\);/);
  assert.match(page, /0 bài chờ duyệt\. \$\{approvedProposals\(\)\.length\} bài đã vào thư viện, \$\{rejectedProposals\(\)\.length\} bài đã bỏ\./);
  assert.match(page, /if \(!list\.length\) \{\n\s+\$\('er-body'\)\.innerHTML = `/, 'không còn nút duyệt khi hết bài chờ');
  assert.match(page, /Sao chép kết quả/);
  assert.match(read('app-shell.js'), /\{ key: 'shell\.tool\.exerciseReview', href: 'exercise-review\.html' \}/);
});

console.log(`EXERCISE_LIBRARY_OK ${passed} passed`);
