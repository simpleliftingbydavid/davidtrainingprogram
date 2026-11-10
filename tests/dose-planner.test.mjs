// Run with:  node tests/dose-planner.test.mjs
// Bộ dựng giáo án: bộ máy tính thuần và file quy tắc của David. Các số dưới đây là SỐ GIẢ để
// kiểm tra bộ máy, không phải khuyến nghị.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOSE_RULES, GOALS, LEVELS, SPLITS, STYLES, WEIGHT_STEP_KG } from '../dose-rules.js';
import {
  PLANNER_SCHEME, candidatesForSlot, compareToTargets, draftOptionsFromPlan, normalizeRange, planProgram, planVolume, prescriptionFor, ruleKey,
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
    ...levels.slice(1).flatMap((level) => ['general', 'specialized', 'standard'].map((style) => `muscle.${level}.${style}`)),
    ...levels.map((level) => `powerbuilding.${level}.standard`),
    ...levels.flatMap((level) => ['recreational', 'barbell', 'sbd', 'standard'].map((style) => `strength.${level}.${style}`)),
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
    // Bù chân (David 2026-11-03): buổi Squat có 6 bài, leg curl 3 set, bắp chân 2×12–15@0–2 ở cuối.
    const squatDay = result.days[0].slots.map((slot) => `${slot.label} ${slot.sets}×${slot.reps.min}-${slot.reps.max}@${slot.rir.min}-${slot.rir.max}`);
    assert.equal(squatDay.length, 6);
    assert.ok(squatDay.includes('Đùi sau · leg curl 3×10-12@0-2'));
    assert.equal(squatDay[5], 'Bắp chân 2×12-15@0-2');
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

// Liều theo cấp độ × kiểu (David duyệt 2026-11-03): cùng cách xếp buổi, khác set, rep, RIR, nghỉ.
const build = (goal, level, style, days) => planProgram({ rules: DOSE_RULES, splits: SPLITS, goal, level, style, days, exercises: EXERCISES });
const fmt = (slot) => `${slot.label} ${slot.sets}×${slot.reps.min}-${slot.reps.max}@${slot.rir.min}-${slot.rir.max}`;
const weekly = (result, label) => result.days.flatMap((day) => day.slots).filter((slot) => slot.label.startsWith(label)).reduce((sum, slot) => sum + slot.sets, 0);

check('Tăng cơ theo cấp độ: set/tuần, rep và RIR đúng bảng', () => {
  // Mới tập · Tổng quát ngoài 3 buổi: chỉ bài đa khớp, 4 set/tuần mỗi nhóm cơ.
  const general = build('muscle', 'beginner', 'general', 4);
  assert.ok(general.days.flatMap((day) => day.slots).every((slot) => slot.reps.min === 6 && slot.reps.max === 12), 'chỉ đa khớp 6–12 rep');
  assert.equal(weekly(general, 'Ngực · đẩy ngang'), 4);
  assert.equal(weekly(general, 'Đùi trước · squat'), 4);
  // Mới tập · 3 buổi giữ quy tắc riêng đã duyệt.
  assert.deepEqual(build('muscle', 'beginner', 'general', 3).days.map((day) => day.label), ['Buổi A', 'Buổi B', 'Buổi C']);
  assert.equal(build('muscle', 'beginner', 'general', 3).days[0].slots[0].label, 'Đùi trước · squat');
  // Trung cấp · Chuyên sâu: đa khớp lần A 5–7, lần B 7–10, cô lập 10–20, RIR 0–1, 6–8 set/tuần (mức thấp 6).
  const inter = build('muscle', 'intermediate', 'specialized', 4);
  const slots = inter.days.flatMap((day) => day.slots);
  assert.ok(slots.some((slot) => slot.label === 'Đùi trước · squat · A' && slot.reps.min === 5 && slot.reps.max === 7));
  assert.ok(slots.some((slot) => slot.label === 'Đùi trước · squat · B' && slot.reps.min === 7 && slot.reps.max === 10));
  assert.ok(slots.filter((slot) => slot.label.startsWith('Vai giữa')).every((slot) => slot.reps.min === 10 && slot.reps.max === 20));
  assert.ok(slots.every((slot) => slot.rir.min === 0 && slot.rir.max === 1));
  assert.ok(weekly(inter, 'Đùi trước') >= 6, 'đùi trước đủ 6 set/tuần');
  // Nâng cao · Chuyên sâu có cô lập cho nhóm cơ nhỏ; nghỉ đa khớp 3 phút.
  const adv = build('muscle', 'advanced', 'specialized', 5).days.flatMap((day) => day.slots);
  ['Tay trước', 'Tay sau', 'Bắp chân', 'Bụng'].forEach((label) => assert.ok(adv.some((slot) => slot.label === label), label));
  assert.equal(adv.find((slot) => slot.label.startsWith('Ngực · đẩy ngang')).restSeconds, 180);
  // Cùng 4 buổi, Mới tập và Nâng cao ra giáo án khác nhau.
  assert.notDeepEqual(build('muscle', 'beginner', 'specialized', 4).days.map((day) => day.slots.map(fmt)),
    build('muscle', 'advanced', 'specialized', 4).days.map((day) => day.slots.map(fmt)));
});

check('Sức mạnh theo kiểu: tập giải trí dùng máy, mê tạ đòn xen tạ đòn và máy', () => {
  const rec = build('strength', 'beginner', 'recreational', 3).days.flatMap((day) => day.slots);
  assert.ok(rec.every((slot) => slot.reps.min === 5 && slot.reps.max === 7 && slot.rir.min === 1 && slot.rir.max === 3));
  assert.ok(rec.every((slot) => slot.candidates.length), 'bài máy có trong thư viện');
  const bar = build('strength', 'intermediate', 'barbell', 3).days.flatMap((day) => day.slots);
  const squats = bar.filter((slot) => slot.label.startsWith('Đùi trước · squat'));
  assert.deepEqual(squats.map((slot) => [slot.label, slot.reps.min, slot.reps.max]),
    [['Đùi trước · squat · tạ đòn', 3, 5], ['Đùi trước · squat · máy / tạ đơn', 6, 8]]);
  assert.equal(squats.reduce((sum, slot) => sum + slot.sets, 0), 4, '4–6 set/tuần, lấy mức thấp');
});

check('Squat · bench · deadlift: cách xếp buổi theo số buổi, bài chính trước, biến thể từ trung cấp', () => {
  const firstLabels = (level, days) => build('strength', level, 'sbd', days).days.map((day) => day.slots[0].label);
  assert.deepEqual(firstLabels('beginner', 3), ['Squat tạ đòn', 'Bench press', 'Deadlift']);
  assert.deepEqual(firstLabels('beginner', 4), ['Squat tạ đòn', 'Bench press', 'Squat tạ đòn', 'Bench press']);
  const beginner = build('strength', 'beginner', 'sbd', 3).days.flatMap((day) => day.slots);
  assert.ok(!beginner.some((slot) => slot.label.startsWith('Biến thể')), 'mới tập chưa có biến thể');
  assert.deepEqual(beginner.find((slot) => slot.label === 'Squat tạ đòn').reps, { min: 3, max: 5 });
  // Trung cấp, 6 buổi: squat 2 lần/tuần, một lần nặng 1–3 rep, một lần 3–6 rep; có biến thể.
  const inter = build('strength', 'intermediate', 'sbd', 6).days.flatMap((day) => day.slots);
  assert.deepEqual(inter.filter((slot) => slot.label === 'Squat tạ đòn').map((slot) => [slot.reps.min, slot.reps.max]), [[1, 3], [3, 6]]);
  assert.ok(inter.some((slot) => slot.label === 'Biến thể squat'));
  assert.ok(inter.filter((slot) => slot.label === 'Deadlift').every((slot) => slot.restSeconds === 240));
});

// 2026-11-10: biến thể gợi ý đúng bài (squat dừng, bench tay hẹp, deadlift đứng bục), và các kiểu
// Tăng cơ Trung cấp / Nâng cao có khoảng set/tuần để so; khung mặc định nằm trong khoảng.
check('biến thể: bài đúng tên lên đầu danh sách gợi ý', () => {
  const slots = build('strength', 'advanced', 'sbd', 3).days.flatMap((day) => day.slots);
  const first = (label) => slots.find((slot) => slot.label === label).candidates[0];
  assert.deepEqual(['Biến thể squat', 'Biến thể bench', 'Biến thể deadlift'].map(first), ['pause_squat', 'close_grip_bench', 'deficit_deadlift']);
  ['pause_squat', 'close_grip_bench', 'deficit_deadlift'].forEach((id) => {
    const exercise = getExerciseById(id);
    assert.ok(exercise?.videoUrl && exercise.technique.length >= 3, id);
  });
  // Slot không có preferExercises giữ thứ tự cũ: bài chính trước.
  assert.equal(build('strength', 'advanced', 'sbd', 3).days[0].slots[0].candidates[0], 'squat');
});

check('Tăng cơ Trung cấp / Nâng cao: có khoảng set/tuần, khung mặc định nằm trong khoảng ở 1–7 buổi', () => {
  ['intermediate', 'advanced'].forEach((level) => ['general', 'specialized'].forEach((style) => {
    for (let days = 1; days <= 7; days++) {
      const result = build('muscle', level, style, days);
      assert.ok(Object.keys(result.weeklyTargets).length >= 5, `${level} ${style}: có khoảng`);
      result.days.forEach((day) => day.slots.forEach((slot) => { slot.exerciseId = slot.candidates[0]; }));
      const off = compareToTargets(planVolume(result, getExerciseById), result.weeklyTargets).filter((row) => row.status !== 'ok');
      assert.deepEqual(off, [], `${level} ${style} ${days} buổi`);
    }
  }));
  assert.deepEqual(build('muscle', 'advanced', 'specialized', 4).weeklyTargets['Ngực'], { min: 7, max: 15 });
  assert.deepEqual(build('muscle', 'intermediate', 'general', 4).weeklyTargets['Lưng'], { min: 8, max: 18 });
  assert.equal(build('muscle', 'intermediate', 'general', 4).weeklyTargets['Tay trước'], undefined, 'không có cô lập tay thì không so tay');
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

// Kiểu 9 "Tăng rep rồi tăng tạ" (David, 2026-11-04): mọi bài dựng từ đây, thư viện không đổi.
check('tham số tiến triển: mọi bài dùng kiểu 9 với set, rep, RIR, nghỉ và bước tăng của slot', () => {
  const sp = { setsRange: { min: 3, max: 5 }, sets: 3, reps: { min: 6, max: 10 }, rir: { min: 1, max: 2 }, restSeconds: 120, weightStepKg: 2.5, scheme: null };
  const bench = getExerciseById('bench_press');
  const result = prescriptionFor(sp, bench);
  assert.equal(result.scheme, 9);
  assert.equal(PLANNER_SCHEME, 9);
  assert.deepEqual(result.schemeParams, {
    plannedSets: 3, repsMin: 6, repsMax: 10, rirMin: 1, targetRIR: 2,
    weightStepKg: 2.5, roundingIncrement: 2.5, restSeconds: 120, isBodyweight: false,
  });
  assert.deepEqual(result.notes, []);
  // Không sửa đối tượng thư viện: bench vẫn mặc định kiểu 2.
  assert.equal(bench.defaultScheme, 2);
  assert.equal(bench.defaultParams.plannedSets, 3);
  // Máy có nấc 5 kg: bước 1 kg của bài cô lập thành 5 kg.
  const lateral = prescriptionFor({ ...sp, weightStepKg: 1 }, getExerciseById('db_lateral_raise'));
  assert.equal(lateral.schemeParams.weightStepKg, 5);
  // Bài tự trọng: không tăng tạ.
  const pullUp = prescriptionFor(sp, getExerciseById('pull_up'));
  assert.deepEqual([pullUp.schemeParams.isBodyweight, pullUp.schemeParams.weightStepKg], [true, 0]);
});

check('quy tắc chưa có bước tăng: dùng nấc tạ nhỏ nhất của bài và ghi chú cho coach', () => {
  const result = prescriptionFor({ sets: 3, setsRange: { min: 3, max: 3 }, reps: { min: 8, max: 8 }, scheme: 4 }, getExerciseById('weighted_dips'));
  assert.equal(result.scheme, 9, 'kiểu trong quy tắc không còn được dùng');
  assert.equal(result.schemeParams.weightStepKg, getExerciseById('weighted_dips').defaultParams.roundingIncrement);
  assert.ok(result.notes.some((text) => /chưa có bước tăng tạ/.test(text)));
});

check('bước tăng tạ trong quy tắc: thân dưới 5 kg, thân trên 2,5 kg, cô lập 1 kg', () => {
  assert.deepEqual({ ...WEIGHT_STEP_KG }, { lowerCompound: 5, upperCompound: 2.5, isolation: 1 });
  const steps = {};
  Object.values(DOSE_RULES).forEach((rule) => rule.slots.forEach((slot) => { steps[slot.label] = slot.weightStepKg; }));
  ['Đùi trước · squat', 'Đùi sau & mông · hinge', 'Đùi trước · chân đơn (split squat)'].forEach((label) => assert.equal(steps[label], 5, label));
  ['Ngực · đẩy ngang', 'Vai · đẩy dọc', 'Lưng · kéo ngang', 'Lưng · kéo dọc'].forEach((label) => assert.equal(steps[label], 2.5, label));
  ['Đùi sau · leg curl', 'Vai giữa · lateral raise', 'Tay trước', 'Tay sau', 'Bắp chân'].forEach((label) => assert.equal(steps[label], 1, label));
  assert.ok(Object.values(steps).every((step) => step > 0), 'slot nào cũng có bước tăng');
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
  assert.equal(first.scheme, 9);
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

check('bản nháp: qua bộ dựng sẵn có thì tạ khởi điểm trống, rep ở mức dưới, kích hoạt được ngay', () => {
  const built = draftOptionsFromPlan(chosen(), getExerciseById);
  const assignments = buildDraftAssignmentsFromSelections(built.options, [], []);
  assert.equal(assignments.length, 3);
  assignments.forEach((item) => {
    assert.doesNotThrow(() => getInitialPrescription({ scheme: item.scheme, schemeParams: item.schemeParams, state: item.initialState }), 'giống kiểm tra trong createPhaseDraft');
    assert.ok(!(Number(item.initialState.trainingMax) > 0) && !(Number(item.initialState.workingWeight) > 0), 'chưa có tạ khởi điểm');
    assert.notEqual(item.setupRequired, true);
    assert.equal(item.initialState.currentReps, item.schemeParams.repsMin, 'bắt đầu ở mức rep dưới');
  });
  // Kiểu 9 không cần tạ khởi điểm: học viên tìm tạ bằng set khởi động ở buổi đầu.
  assert.deepEqual(draftActivationIssues(assignments), []);
  // Tạ học viên đã dùng cho đúng bài được giữ; set/rep của kiểu khác thì không.
  const withHistory = buildDraftAssignmentsFromSelections(built.options, [{ exerciseId: 'bench_press', state: { workingWeight: 60, currentSets: 5, currentReps: 12 } }], []);
  assert.deepEqual(withHistory[0].initialState, { workingWeight: 60, currentReps: withHistory[0].schemeParams.repsMin });
  assert.deepEqual(assignments.map((item) => item.dayLabel), ['Buổi A', 'Buổi A', 'Buổi B']);
});

check('mọi bài trong thư viện dựng được tham số hợp lệ cho bản nháp', () => {
  const sp = { setsRange: { min: 3, max: 4 }, sets: 3, reps: { min: 6, max: 10 }, rir: { min: 1, max: 2 }, restSeconds: 100, scheme: null };
  for (const exercise of EXERCISES) {
    const { scheme, schemeParams } = prescriptionFor(sp, exercise);
    assert.equal(scheme, 9);
    const state = { workingWeight: 0, currentReps: schemeParams.repsMin };
    assert.doesNotThrow(() => getInitialPrescription({ scheme, schemeParams, state }), exercise.exerciseId);
  }
});

console.log(`dose-planner: ${passed} passed`);
