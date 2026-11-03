// Run with:  node tests/dose-planner.test.mjs
// Bộ dựng giáo án: bộ máy tính thuần và file quy tắc của David. Các số dưới đây là SỐ GIẢ để
// kiểm tra bộ máy, không phải khuyến nghị.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOSE_RULES, GOALS, LEVELS, SPLITS, STYLES } from '../dose-rules.js';
import {
  candidatesForSlot, compareToTargets, draftOptionsFromPlan, normalizeRange, planProgram, planVolume, prescriptionFor, ruleKey,
} from '../dose-planner.js';
import { EXERCISES, getExerciseById } from '../exercise-seed-data.js';
import { buildDraftAssignmentsFromSelections, draftActivationIssues } from '../phase-draft-utils.js';
import { getInitialPrescription } from '../progression-engine.js';

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

check('file quy tắc của David: đúng các tổ hợp đã duyệt, tổ hợp khác vẫn báo chưa có quy tắc', () => {
  const levels = ['beginner', 'intermediate', 'advanced'];
  assert.deepEqual(Object.keys(DOSE_RULES).sort(), [
    'muscle.beginner.general', 'muscle.beginner.specialized',
    ...levels.slice(1).map((level) => `muscle.${level}.standard`),
    ...levels.map((level) => `powerbuilding.${level}.standard`),
    ...levels.map((level) => `strength.${level}.standard`),
  ].sort());
  assert.equal(Object.keys(SPLITS).length, 0, 'cách chia buổi nằm trong từng tổ hợp');
  assert.ok(GOALS.length >= 3 && LEVELS.length >= 3 && STYLES.length >= 1);
  const result = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'strength', level: 'beginner', style: 'general', days: 3, exercises: EXERCISES });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'no-rule');
  assert.match(result.reason, /David chưa nhập quy tắc/);
  const otherDays = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'powerbuilding', level: 'beginner', style: 'standard', days: 5, exercises: EXERCISES });
  assert.equal(otherDays.code, 'no-split', 'sức mạnh + tăng cơ chỉ có 3–4 buổi');
});

// Giáo án mẫu theo số buổi (David duyệt 2026-11-03): mọi tổ hợp dựng được ở mọi số buổi đã có,
// mọi slot có bài trong thư viện và đủ set, rep, RIR.
check('giáo án mẫu: Tăng cơ và Sức mạnh 1–7 buổi, Sức mạnh + tăng cơ 3–4 buổi, mọi cấp độ', () => {
  Object.entries(DOSE_RULES).forEach(([key, rule]) => {
    const [goal, level, style] = key.split('.');
    const days = Object.keys(rule.splits).map(Number).sort();
    assert.deepEqual(days, goal === 'powerbuilding' ? [3, 4] : [1, 2, 3, 4, 5, 6, 7], `${key}: số buổi`);
    days.forEach((count) => {
      const result = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal, level, style, days: count, exercises: EXERCISES });
      assert.equal(result.ok, true, `${key} · ${count} buổi`);
      assert.deepEqual(result.warnings, []);
      assert.equal(result.days.length, count);
      result.days.forEach((day) => day.slots.forEach((slot) => {
        assert.ok(slot.candidates.length, `${key} · ${count} buổi · ${slot.label}: có bài gợi ý`);
        assert.deepEqual(slot.missing, []);
        assert.ok(slot.rir, `${slot.label}: có RIR`);
      }));
    });
  });
  // Sức mạnh: bài hinge nặng nhất 1–3 rep; Sức mạnh + tăng cơ: bài chính 1–5 rep nghỉ 180 giây.
  const strength = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'strength', level: 'intermediate', style: 'standard', days: 1, exercises: EXERCISES });
  assert.deepEqual(strength.days[0].slots[0].reps, { min: 1, max: 3 });
  const power = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'powerbuilding', level: 'advanced', style: 'standard', days: 4, exercises: EXERCISES });
  assert.deepEqual(power.days.map((day) => day.slots[0].restSeconds), [180, 180, 180, 180]);
});

// Sức mạnh + tăng cơ · 3 buổi (David duyệt 2026-11-03): mỗi buổi đúng một bài chính 1–5 rep ở RIR
// 2–4 (Squat, Bench, Deadlift), bài phụ RIR 0–2; ngoài 3–4 buổi thì nhắc chọn 3 hoặc 4 buổi.
check('Sức mạnh + tăng cơ · 3 buổi: một bài chính mỗi buổi, bài phụ gần thất bại', () => {
  ['beginner', 'intermediate', 'advanced'].forEach((level) => {
    const result = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'powerbuilding', level, style: 'standard', days: 3, exercises: EXERCISES });
    assert.equal(result.ok, true, level);
    assert.deepEqual(result.days.map((day) => day.label), ['Toàn thân · Squat', 'Toàn thân · Bench', 'Toàn thân · Deadlift']);
    result.days.forEach((day) => {
      const main = day.slots.filter((slot) => slot.reps.max <= 5);
      assert.equal(main.length, 1, `${day.label}: một bài chính`);
      assert.deepEqual([main[0].reps, main[0].rir, main[0].restSeconds], [{ min: 1, max: 5 }, { min: 2, max: 4 }, 180]);
      day.slots.filter((slot) => slot !== main[0]).forEach((slot) => assert.deepEqual(slot.rir, { min: 0, max: 2 }, slot.label));
    });
    assert.deepEqual(result.days.map((day) => day.slots[0].label), ['Đùi trước · squat', 'Ngực · đẩy ngang', 'Đùi sau & mông · hinge']);
  });
});

check('Sức mạnh + tăng cơ: 4 buổi giữ nguyên, ngoài 3–4 buổi thì nhắc thay vì "chưa có"', () => {
  const four = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'powerbuilding', level: 'beginner', style: 'standard', days: 4, exercises: EXERCISES });
  assert.deepEqual(four.days.map((day) => day.slots.map((slot) => `${slot.label} ${slot.sets}×${slot.reps.min}-${slot.reps.max}@${slot.rir.min}-${slot.rir.max}`)), [
    ['Đùi trước · squat 3×1-5@2-4', 'Đùi sau & mông · hinge 3×6-8@0-2', 'Đùi trước · squat 2×8-10@0-2', 'Bắp chân 2×12-15@0-2'],
    ['Ngực · đẩy ngang 3×1-5@2-4', 'Lưng · kéo dọc 3×6-8@0-2', 'Ngực · đẩy ngang 2×10-12@0-2', 'Vai giữa · lateral raise 2×12-15@0-2', 'Tay trước 2×10-12@0-2'],
    ['Đùi sau & mông · hinge 3×1-5@2-4', 'Đùi trước · chân đơn (split squat) 3×8-10@0-2', 'Đùi sau · leg curl 3×10-12@0-2', 'Bắp chân 2×12-15@0-2'],
    ['Vai · đẩy dọc 3×1-5@2-4', 'Lưng · kéo ngang 3×6-8@0-2', 'Ngực · ép ngực 2×10-12@0-2', 'Tay sau 2×12-15@0-2'],
  ]);
  [1, 2, 5, 6, 7].forEach((days) => {
    const result = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'powerbuilding', level: 'intermediate', style: 'standard', days, exercises: EXERCISES });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'Sức mạnh + tăng cơ nên tập 3–4 buổi/tuần. Chọn 3 hoặc 4 buổi.');
  });
  const strength = planProgram({ rules: { x: 1 }, splits: {}, goal: 'strength', level: 'beginner', style: 'standard', days: 3 });
  assert.match(strength.reason, /chưa nhập quy tắc/, 'các mục tiêu khác giữ lời cũ');
  const page = read('dose-planner.html');
  assert.ok(page.includes("` (${escapeHtml(rule?.uncoveredLabel || 'chưa có')})`"), 'danh sách số buổi hiện lời nhắc của quy tắc');
});

// Tăng cơ · Mới tập (David duyệt 2026-11-03): mỗi bài đa khớp 2 buổi × 2 set, mọi slot có bài
// trong thư viện, và volume dự kiến nằm trong khoảng David đặt.
['general', 'specialized'].forEach((style) => check(`Tăng cơ · Mới tập · ${style}: 3 buổi dựng đủ và volume trong khoảng`, () => {
  const result = planProgram({ rules: DOSE_RULES, splits: SPLITS, goal: 'muscle', level: 'beginner', style, days: 3, exercises: EXERCISES });
  assert.equal(result.ok, true);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.days.length, 3);
  result.days.forEach((day) => day.slots.forEach((slot) => {
    assert.ok(slot.candidates.length, `${slot.label} có bài trong thư viện`);
    assert.deepEqual(slot.missing, []);
    assert.equal(slot.rir.max, 2);
    slot.exerciseId = slot.candidates[0];
  }));
  const appearances = new Map();
  result.days.flatMap((day) => day.slots).forEach((slot) => appearances.set(slot.slotId, (appearances.get(slot.slotId) || 0) + 1));
  ['squat', 'hinge', 'push-h', 'pull-h', 'push-v', 'pull-v'].forEach((id) => assert.equal(appearances.get(id), 2, `${id} có mặt 2 buổi`));
  const compared = compareToTargets(planVolume(result, getExerciseById), result.weeklyTargets);
  compared.filter((row) => row.muscle !== 'Đùi trước').forEach((row) => assert.equal(row.status, 'ok', `${row.muscle}: ${row.planned}`));
}));

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

check('trang Bộ dựng giáo án: chỉ coach, và chỉ ghi MỘT thứ: bản nháp qua hàm sẵn có', () => {
  const page = read('dose-planner.html');
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/, 'học viên bị chuyển hướng');
  assert.match(page, /mountAppShell\(\{ role: 'coach', active: 'programs' \}\)/);
  const imports = page.match(/import \{([^}]*)\} from '\.\/training-data\.js';/)[1].split(',').map((name) => name.trim()).sort();
  assert.deepEqual(imports, ['createPhaseDraft', 'getMyRole', 'listMyStudents', 'listPhases'], 'đúng bốn hàm, không kích hoạt hay xoá');
  assert.doesNotMatch(page, /activatePhaseDraft|deletePhaseDraft|appendPhaseDraftAssignments|addDoc|setDoc|writeBatch|updateDoc|deleteDoc/);
  assert.equal(page.match(/createPhaseDraft\(/g).length, 1, 'chỉ một chỗ ghi');
  assert.match(page, /window\.confirm\(summary\)/, 'có hộp xác nhận trước khi ghi');
  assert.match(page, /phases\.some\(\(phase\) => phase\.status === 'draft'\)/, 'học viên đã có bản nháp thì không ghi');
  assert.match(page, /buildDraftAssignmentsFromSelections\(built\.options, \[\], \[\]\)/, 'không mượn tạ cũ của học viên: tạ khởi điểm để trống');
  assert.match(read('coach.html'), /href="dose-planner\.html"/, 'coach mở được từ bảng điều khiển');
  assert.match(read('program-library.html'), /href="dose-planner\.html"/);
  ['login', 'client', 'home', 'history', 'program', 'nutrition', 'habits'].forEach((name) => {
    assert.ok(!/dose-planner|dose-rules/.test(read(`${name}.html`)), `${name}.html không nhắc tới bộ dựng`);
  });
});

// ---- bản nháp ----
const chosen = () => {
  const result = plan();
  result.days[0].slots[0].exerciseId = 'bench_press';     // kiểu 2
  result.days[0].slots[1].exerciseId = 'weighted_dips';   // kiểu 8
  result.days[1].slots[0].exerciseId = null;              // chưa chọn bài
  result.days[1].slots[1].exerciseId = 'bench_press';
  return result;
};

check('bản nháp: mỗi buổi có bài được chọn thành một "buổi", slot chưa chọn bài được liệt kê', () => {
  const built = draftOptionsFromPlan(chosen(), getExerciseById);
  assert.deepEqual(built.problems, []);
  assert.equal(built.exerciseCount, 3);
  assert.deepEqual(built.options.map((option) => [option.dayLabel, option.exercises.map((e) => e.exerciseId)]), [['Buổi A', ['bench_press', 'weighted_dips']], ['Buổi B', ['bench_press']]]);
  assert.deepEqual(built.skipped, ['Buổi B · legs']);
  const first = built.options[0].exercises[0];
  assert.deepEqual(first.exerciseNameSnapshot, { vi: getExerciseById('bench_press').nameVi });
  assert.equal(first.scheme, 2);
  assert.equal(first.schemeParams.plannedSets, 2);
  assert.equal(first.note, '', 'lời của David trên slot không đi sang học viên');
  assert.ok(built.options.every((option) => option.sourceType === 'planner'));
});

check('bản nháp: slot đã chọn bài mà thiếu set hoặc rep thì bị chặn, không điền số hộ', () => {
  const result = plan({ style: 'style2', days: 2, splits: { 2: [{ label: 'A', slots: ['bare'] }] } });
  result.days[0].slots[0].exerciseId = 'bench_press';
  const built = draftOptionsFromPlan(result, getExerciseById);
  assert.deepEqual(built.options, []);
  assert.match(built.problems[0], /thiếu số set và khoảng rep/);
  const odd = chosen(); odd.days[0].slots[0].sets = 20;
  assert.match(draftOptionsFromPlan(odd, getExerciseById).problems[0], /từ 1 đến 12/);
});

check('bản nháp: qua bộ dựng sẵn có thì tạ khởi điểm trống, chặn kích hoạt, và hàm tạo bản nháp chấp nhận được', () => {
  const built = draftOptionsFromPlan(chosen(), getExerciseById);
  const assignments = buildDraftAssignmentsFromSelections(built.options, [], []);
  assert.equal(assignments.length, 3);
  assignments.forEach((item) => {
    assert.doesNotThrow(() => getInitialPrescription({ scheme: item.scheme, schemeParams: item.schemeParams, state: item.initialState }), 'giống kiểm tra trong createPhaseDraft');
    assert.ok(!(Number(item.initialState.trainingMax) > 0) && !(Number(item.initialState.workingWeight) > 0), 'chưa có tạ khởi điểm');
    assert.notEqual(item.setupRequired, true);
  });
  assert.equal(draftActivationIssues(assignments).length, 3, 'cả ba bài còn chờ tạ khởi điểm trước khi kích hoạt');
  assert.deepEqual(assignments.map((item) => item.dayLabel), ['Buổi A', 'Buổi A', 'Buổi B']);
});

check('mọi bài trong thư viện dựng được tham số hợp lệ cho bản nháp', () => {
  const sp = { setsRange: { min: 3, max: 4 }, sets: 3, reps: { min: 6, max: 10 }, rir: { min: 1, max: 2 }, restSeconds: 100, scheme: null };
  for (const exercise of EXERCISES) {
    const { scheme, schemeParams } = prescriptionFor(sp, exercise);
    const state = [1, 2, 3].includes(scheme) ? { trainingMax: 0 } : scheme === 6 ? { workingWeight: 0, setWeights: schemeParams.setTargets.map(() => 0) } : { workingWeight: 0, currentSets: schemeParams.startingSets || 3, currentReps: schemeParams.startingReps || 8 };
    assert.doesNotThrow(() => getInitialPrescription({ scheme, schemeParams, state }), exercise.exerciseId);
  }
});

console.log(`dose-planner: ${passed} passed`);
