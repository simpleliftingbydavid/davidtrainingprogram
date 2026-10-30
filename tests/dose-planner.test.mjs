// Run with:  node tests/dose-planner.test.mjs
// Bộ dựng giáo án: bộ máy tính thuần và file quy tắc của David. Các số dưới đây là SỐ GIẢ để
// kiểm tra bộ máy, không phải khuyến nghị.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOSE_RULES, GOALS, LEVELS, SPLITS, STYLES } from '../dose-rules.js';
import {
  candidatesForSlot, compareToTargets, normalizeRange, planProgram, planVolume, prescriptionFor, ruleKey,
} from '../dose-planner.js';
import { EXERCISES, getExerciseById } from '../exercise-seed-data.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

// Quy tắc giả: số tự đặt cho test.
const slot = (id, groups, extra = {}) => ({ id, label: id, muscleGroups: groups, patterns: [], sets: { min: 2, max: 4 }, reps: { min: 6, max: 10 }, rir: { min: 0, max: 2 }, ...extra });
const FAKE = {
  rules: {
    'muscle.beginner.style1': {
      note: 'ghi chú thử',
      slots: [slot('chest', ['Ngực'], { patterns: ['compound_*'] }), slot('back', ['Lưng']), slot('legs', ['Đùi trước'])],
      weeklyTargets: { 'Ngực': { min: 4, max: 8 }, 'Lưng': { min: 10, max: 12 } },
    },
    'muscle.beginner.style2': { slots: [slot('bare', ['Ngực'], { sets: null, reps: null, rir: null })] },
  },
  splits: {
    2: [{ label: 'Buổi A', slots: ['chest', 'back'] }, { label: 'Buổi B', slots: ['legs', 'chest'] }],
    3: [{ label: 'A', slots: ['chest', 'ghost'] }, { label: 'B', slots: ['back'] }, { label: 'C', slots: [] }],
  },
  goal: 'muscle', level: 'beginner', style: 'style1', exercises: EXERCISES,
};
const plan = (overrides = {}) => planProgram({ ...FAKE, days: 2, ...overrides });

check('file quy tắc của David để trống: không số nào, công cụ báo chưa có quy tắc', () => {
  assert.equal(Object.keys(DOSE_RULES).length, 0);
  assert.equal(Object.keys(SPLITS).length, 0);
  assert.ok(GOALS.length >= 2 && LEVELS.length >= 3 && STYLES.length >= 1);
  const result = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: GOALS[0].id, level: LEVELS[0].id, style: STYLES[0].id, days: 3, exercises: EXERCISES });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'no-rule');
  assert.match(result.reason, /David chưa nhập quy tắc/);
});

check('đầu vào thiếu hoặc sai trả về lý do, không đoán', () => {
  assert.equal(plan({ goal: '' }).code, 'input');
  assert.equal(plan({ days: 0 }).code, 'input');
  assert.equal(plan({ days: 8 }).code, 'input');
  assert.equal(plan({ days: 'x' }).code, 'input');
});

check('thiếu cách chia buổi cho số ngày đã chọn: nói rõ số ngày', () => {
  const result = plan({ days: 5 });
  assert.equal(result.code, 'no-split');
  assert.match(result.reason, /5 buổi/);
});

check('dựng khung: đúng số buổi, đúng slot, set lấy mức thấp, rep và RIR giữ khoảng', () => {
  const result = plan();
  assert.equal(result.ok, true);
  assert.deepEqual(result.days.map((day) => day.label), ['Buổi A', 'Buổi B']);
  assert.deepEqual(result.days.map((day) => day.slots.map((s) => s.slotId)), [['chest', 'back'], ['legs', 'chest']]);
  const chest = result.days[0].slots[0];
  assert.equal(chest.sets, 2);
  assert.deepEqual(chest.setsRange, { min: 2, max: 4 });
  assert.deepEqual(chest.reps, { min: 6, max: 10 });
  assert.deepEqual(chest.rir, { min: 0, max: 2 });
  assert.equal(result.note, 'ghi chú thử');
  assert.deepEqual(chest.missing, []);
});

check('bài gợi ý: đúng nhóm cơ và dạng chuyển động, bài chính trước', () => {
  const chest = plan().days[0].slots[0];
  assert.ok(chest.candidates.length >= 2);
  assert.ok(chest.candidates.every((id) => getExerciseById(id).muscleGroup === 'Ngực' && /^compound_/.test(getExerciseById(id).movementPattern)));
  const back = candidatesForSlot({ muscleGroups: ['Lưng'] }, EXERCISES).map((id) => getExerciseById(id).movementPattern.split('_')[0]);
  const ranks = back.map((kind) => ({ compound: 0, accessory: 1, isolation: 2 }[kind]));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), 'bài chính đứng trước bài phụ rồi bài cô lập');
  assert.deepEqual(candidatesForSlot({ muscleGroups: ['Không có nhóm này'] }, EXERCISES), []);
});

check('ô để trống không bị lấp bằng số tự nghĩ ra: ghi vào "missing"', () => {
  const bare = plan({ style: 'style2', days: 2, splits: { 2: [{ label: 'A', slots: ['bare'] }] } }).days[0].slots[0];
  assert.equal(bare.sets, null);
  assert.equal(bare.reps, null);
  assert.equal(bare.rir, null);
  assert.deepEqual(bare.missing, ['số set', 'khoảng rep']);
});

check('slot lạ trong cách chia buổi và buổi trống thành cảnh báo, không làm hỏng khung', () => {
  const result = plan({ days: 3 });
  assert.equal(result.ok, true);
  assert.ok(result.warnings.some((text) => /ghost/.test(text)));
  assert.ok(result.warnings.some((text) => /C chưa có slot/.test(text)));
});

check('cách chia buổi riêng của tổ hợp thắng cách chia chung', () => {
  const rules = { ...FAKE.rules, 'muscle.beginner.style1': { ...FAKE.rules['muscle.beginner.style1'], splits: { 2: [{ label: 'Riêng', slots: ['back'] }] } } };
  assert.deepEqual(plan({ rules }).days.map((day) => day.label), ['Riêng']);
});

check('normalizeRange: thiếu một đầu lấy đầu kia, đảo ngược được sắp lại, trống là null', () => {
  assert.deepEqual(normalizeRange({ min: 6 }), { min: 6, max: 6 });
  assert.deepEqual(normalizeRange({ min: 10, max: 6 }), { min: 6, max: 10 });
  assert.equal(normalizeRange({}), null);
  assert.equal(normalizeRange(null), null);
  assert.equal(normalizeRange({ min: '', max: 'abc' }), null);
  assert.equal(ruleKey('a', 'b', 'c'), 'a.b.c');
});

check('tham số tiến triển: giữ kiểu và mặc định của bài, chỉ ghi đè set, rep, RIR, nghỉ', () => {
  const sp = { setsRange: { min: 3, max: 5 }, sets: 3, reps: { min: 6, max: 10 }, rir: { min: 1, max: 2 }, restSeconds: 120, scheme: null };
  const dips = getExerciseById('weighted_dips');     // kiểu 8
  const eight = prescriptionFor(sp, dips);
  assert.equal(eight.scheme, 8);
  assert.equal(eight.schemeParams.startingSets, 3);
  assert.equal(eight.schemeParams.endingSets, 5);
  assert.equal(eight.schemeParams.startingReps, 6);
  assert.equal(eight.schemeParams.endingReps, 10);
  assert.equal(eight.schemeParams.restSeconds, 120);
  assert.equal(eight.schemeParams.roundingIncrement, dips.defaultParams.roundingIncrement, 'mặc định của bài còn nguyên');
  const bench = getExerciseById('bench_press');      // kiểu 2
  const two = prescriptionFor(sp, bench);
  assert.equal(two.scheme, 2);
  assert.equal(two.schemeParams.plannedSets, 3);
  assert.equal(two.schemeParams.repsPerSet, 6);
  assert.equal(two.schemeParams.targetRIR, 2, 'RIR lấy đầu xa failure nhất');
  assert.equal(two.schemeParams.intensityPct, bench.defaultParams.intensityPct);
  // Không sửa đối tượng thư viện.
  assert.equal(bench.defaultParams.plannedSets, 3);
  assert.notEqual(two.schemeParams, bench.defaultParams);
});

check('kiểu tiến triển quy tắc muốn khác bài: giữ kiểu của bài và ghi chú lại', () => {
  const result = prescriptionFor({ sets: 3, setsRange: { min: 3, max: 3 }, reps: { min: 8, max: 8 }, scheme: 4 }, getExerciseById('weighted_dips'));
  assert.equal(result.scheme, 8);
  assert.ok(result.notes.some((text) => /kiểu tiến triển 4/.test(text)));
});

check('volume kế hoạch theo nhóm cơ dùng lại tính volume của app và so với khoảng của David', () => {
  const result = plan();
  result.days[0].slots[0].exerciseId = 'bench_press';   // Ngực: 2 set × 1
  result.days[0].slots[1].exerciseId = 'weighted_dips';  // Ngực: 2 set (kiểu 8) trên buổi khác
  const volume = planVolume(result, getExerciseById);
  assert.equal(volume['Ngực'], 2 + 2, 'hai bài ngực, mỗi bài 2 set, mức chính 1');
  assert.ok(volume['Vai'] > 0 && volume['Tay sau'] > 0, 'cơ phụ được tính như trong app');
  const compared = compareToTargets(volume, { 'Ngực': { min: 4, max: 8 }, 'Lưng': { min: 10, max: 12 }, 'Bụng': {} });
  assert.deepEqual(compared.map((row) => [row.muscle, row.status]), [['Ngực', 'ok'], ['Lưng', 'low']]);
  assert.equal(compareToTargets({ 'Ngực': 20 }, { 'Ngực': { min: 4, max: 8 } })[0].status, 'high');
});

check('bộ máy thuần, chỉ dành cho coach, không nhắc nguồn bên ngoài', () => {
  const planner = read('dose-planner.js');
  assert.doesNotMatch(planner, /firebase|document\.|window\.|training-data/, 'không đụng dữ liệu hay giao diện');
  const forbidden = [['Kora', 'kakis'], ['Androu', 'lakis'], ['Train', ' Smarter']].map((parts) => parts.join(''));
  ['dose-rules.js', 'dose-planner.js', 'tests/dose-planner.test.mjs'].forEach((file) => {
    forbidden.forEach((name) => assert.ok(!read(file).includes(name), `${file} nhắc tới nguồn ngoài`));
  });
});

console.log(`dose-planner: ${passed} passed`);
