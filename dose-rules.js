// ============================================================
// DAVID COACHING — Quy tắc của David cho Bộ dựng giáo án
// ============================================================
// File này là NƠI DUY NHẤT chứa con số và lời giải thích của Bộ dựng giáo án
// (dose-planner.html). Công cụ chỉ giao KHUNG; mọi giá trị do David quyết định.
// Tổ hợp nào chưa có quy tắc thì công cụ báo "David chưa nhập quy tắc cho tổ hợp
// này" và không bao giờ tự bịa số. Đã có, cho mọi cấp độ:
//   - Tăng cơ: Tổng quát, Chuyên sâu (liều theo cấp độ) và Chuẩn (giáo án mẫu), 1–7 buổi;
//     Tăng cơ · Mới tập · 3 buổi có quy tắc riêng.
//   - Sức mạnh: Tập giải trí, Mê tạ đòn, Squat · bench · deadlift (liều theo cấp độ) và Chuẩn, 1–7 buổi.
//   - Sức mạnh + tăng cơ: 3–4 buổi.
//
// ĐỂ ĐIỀN: đọc cho Claude từng tổ hợp, hoặc tự sửa theo mẫu ở cuối file.
// Ô nào để trống (null hoặc bỏ đi) thì công cụ nhắc "thiếu" và cho coach nhập tay.
//
// Cách đọc các khoảng: { min, max } là khoảng David cho phép. Khi dựng khung,
// công cụ lấy mức THẤP của số set và rep (bắt đầu từ ít), và mức XA failure nhất
// của RIR (max). Coach luôn sửa được từng ô trước khi lưu.
// "sets" của một slot là số set MỖI LẦN slot đó xuất hiện trong một buổi; số set
// cả tuần = sets × số buổi có slot đó.

/** Mục tiêu. Có thể đổi nhãn; id dùng làm khoá nên đừng đổi sau khi đã nhập quy tắc. */
export const GOALS = Object.freeze([
  Object.freeze({ id: 'strength', label: 'Sức mạnh' }),
  Object.freeze({ id: 'muscle', label: 'Tăng cơ' }),
  Object.freeze({ id: 'powerbuilding', label: 'Sức mạnh + tăng cơ' }),
]);

/** Cấp độ của học viên. Đổi nhãn tuỳ ý. */
export const LEVELS = Object.freeze([
  Object.freeze({ id: 'beginner', label: 'Mới tập' }),
  Object.freeze({ id: 'intermediate', label: 'Trung cấp' }),
  Object.freeze({ id: 'advanced', label: 'Nâng cao' }),
]);

/** Kiểu tập. Tăng cơ: Tổng quát, Chuyên sâu. Sức mạnh: Tập giải trí, Mê tạ đòn, Squat · bench ·
 *  deadlift. "Chuẩn" là giáo án mẫu theo số buổi, giống nhau cho mọi cấp độ.
 *  Trang chỉ hiện những kiểu có quy tắc cho mục tiêu và cấp độ đang chọn. */
export const STYLES = Object.freeze([
  Object.freeze({ id: 'general', label: 'Tổng quát' }),
  Object.freeze({ id: 'specialized', label: 'Chuyên sâu' }),
  Object.freeze({ id: 'recreational', label: 'Tập giải trí (máy)' }),
  Object.freeze({ id: 'barbell', label: 'Mê tạ đòn' }),
  Object.freeze({ id: 'sbd', label: 'Squat · bench · deadlift' }),
  Object.freeze({ id: 'standard', label: 'Chuẩn (giáo án mẫu)' }),
]);

// ------------------------------------------------------------
// Tăng cơ · Mới tập (David duyệt 2026-11-03)
// ------------------------------------------------------------
// Ai là "mới tập": mới bắt đầu, hoặc từng tập dưới khoảng một năm rồi nghỉ từ 2 năm trở lên,
// hoặc từng tập môn khác nhưng chưa tập tăng cơ có chủ đích.
//
// Chung cho cả hai kiểu:
//   - Bài đa khớp 6–12 rep, bài cô lập 8–15 rep.
//   - RIR 0–2. Vài tuần đầu dừng ở RIR 2, thỉnh thoảng cho một set chạm thất bại để khách
//     học cảm giác; đừng cho nhiều set chân tới thất bại ngay tuần đầu (đau cơ làm nản).
//   - Mỗi nhóm cơ từ 4 set/tuần trở lên thì chia làm 2 buổi: mỗi bài đa khớp 2 set × 2 buổi.
//   - Bài đa khớp trước, bài cô lập sau. Ưu tiên máy cho người mới; riêng đùi sau thường cần
//     học Romanian deadlift.
//   - Tiến triển: tập gần thất bại, rồi thêm rep hoặc thêm tạ khi được (double progression).
//     Không cần chu kỳ phức tạp. Deload chỉ khi cần: hiệu suất giảm rõ 20–30% kéo dài 1–2 tuần
//     → một tuần nhẹ, 30–50% số set, thêm 1–2 RIR.
//
// Cách app đếm volume: bài đa khớp tính thêm 0,5 set cho cơ phụ (đẩy → vai, tay sau; kéo →
// tay trước; squat → đùi sau & mông). "Lưng" gộp lưng xô (kéo dọc) và lưng giữa (kéo ngang),
// nên Lưng có 8 set/tuần = 4 + 4. Khoảng set/tuần bên dưới đã tính theo cách đếm này.

// ------------------------------------------------------------
// Bước tăng tạ (David duyệt 2026-11-04)
// ------------------------------------------------------------
// Giáo án dựng từ đây dùng kiểu tiến triển "Tăng rep rồi tăng tạ" (kiểu 9): giữ số set, thêm
// 1 rep mỗi buổi đủ rep, đủ rep mức trên thì tăng tạ đúng một bước dưới đây và quay về rep
// mức dưới. Bài cô lập: 1 kg, hoặc mức tạ nhỏ nhất của bài nếu máy không có nấc 1 kg.
export const WEIGHT_STEP_KG = Object.freeze({
  lowerCompound: 5, // squat, hinge, chân đơn (split squat)
  upperCompound: 2.5, // đẩy, kéo
  isolation: 1,
});

import { muscleRule, sbdRule, strengthRule } from './dose-programs.js';

// Các slot dùng chung. Số set là set MỖI LẦN slot xuất hiện trong một buổi.
const compound = (id, label, muscle, patterns, note, weightStepKg = WEIGHT_STEP_KG.upperCompound) => ({
  id, label, muscleGroups: [muscle], patterns,
  sets: { min: 2, max: 2 }, reps: { min: 6, max: 12 }, rir: { min: 0, max: 2 }, weightStepKg, note,
});
const isolation = (id, label, muscle, patterns, note = '') => ({
  id, label, muscleGroups: [muscle], patterns,
  sets: { min: 2, max: 2 }, reps: { min: 8, max: 15 }, rir: { min: 0, max: 2 }, restSeconds: 90,
  weightStepKg: WEIGHT_STEP_KG.isolation, note,
});

const SQUAT = compound('squat', 'Đùi trước · squat', 'Đùi trước', ['compound_knee', 'accessory_knee'],
  'Người mới ưu tiên máy: Leg Press, Hack Squat. Squat tạ đòn khi khách đã sẵn sàng học.', WEIGHT_STEP_KG.lowerCompound);
const HINGE = compound('hinge', 'Đùi sau & mông · hinge', 'Đùi sau & Mông', ['compound_hip', 'accessory_hip'],
  'Romanian deadlift là lựa chọn chính: ít bài máy đa khớp cho đùi sau.', WEIGHT_STEP_KG.lowerCompound);
const PUSH_H = compound('push-h', 'Ngực · đẩy ngang', 'Ngực', ['compound_pec', 'accessory_pec'],
  'Máy đẩy ngực dễ học nhất; bench press khi đã vững kỹ thuật.');
const PULL_H = compound('pull-h', 'Lưng · kéo ngang', 'Lưng', ['compound_back_horizontal', 'accessory_back_horizontal'],
  'Máy chèo hoặc chèo có tựa ngực để lưng dưới không phải giữ.');
const PUSH_V = compound('push-v', 'Vai · đẩy dọc', 'Vai', ['compound_shoulder', 'accessory_shoulder'],
  'Máy đẩy vai hoặc đẩy vai tạ đơn ngồi.');
const PULL_V = compound('pull-v', 'Lưng · kéo dọc', 'Lưng', ['accessory_back_vertical'],
  'Kéo xô (lat pulldown) cho người chưa kéo xà được.');

const withRest = (slot, restSeconds) => ({ ...slot, restSeconds });

// Ba buổi toàn thân: mỗi bài đa khớp có mặt 2 buổi, 2 set mỗi lần → 4 set/tuần mỗi dạng.
// Squat và hinge không nằm ở hai buổi liền nhau khi tập cách ngày (T2–T4–T6).
const BEGINNER_3_DAYS = [
  ['squat', 'push-h', 'pull-h', 'push-v'],
  ['hinge', 'pull-v', 'push-h', 'push-v'],
  ['squat', 'hinge', 'pull-h', 'pull-v'],
];

/** Tăng cơ · Mới tập · 3 buổi: quy tắc riêng đã duyệt (Tổng quát và Chuyên sâu). */
const BEGINNER_MUSCLE = {
  // Tổng quát: khách bận, muốn lên cơ đều toàn thân với ít thời gian nhất.
  // Chỉ bài đa khớp, một dạng cho mỗi nhóm cơ lớn; tay được tập qua các bài kéo và đẩy.
  'muscle.beginner.general': {
    note: 'Tổng quát: 4 bài đa khớp mỗi buổi, khoảng 4 set/tuần cho mỗi nhóm cơ lớn. Nghỉ giữa set: khi nào khách sẵn sàng thì tập. Vài tuần đầu dừng ở RIR 2, thỉnh thoảng một set tới thất bại để học cảm giác.',
    slots: [SQUAT, HINGE, PUSH_H, PULL_H, PUSH_V, PULL_V],
    splits: {
      3: BEGINNER_3_DAYS.map((slots, index) => ({ label: `Buổi ${'ABC'[index]}`, slots })),
    },
    weeklyTargets: {
      'Ngực': { min: 4, max: 6 },
      'Lưng': { min: 8, max: 12 },
      'Vai': { min: 4, max: 6 },
      'Đùi trước': { min: 4, max: 6 },
      'Đùi sau & Mông': { min: 4, max: 6 },
    },
  },
  // Chuyên sâu: khách nghiêm túc hơn, muốn phát triển đủ từng nhóm cơ nhưng chưa có nhiều thời gian.
  // Như Tổng quát, thêm một bài cô lập cho mỗi nhóm cơ sau các bài đa khớp; 4–6 set/tuần mỗi nhóm.
  'muscle.beginner.specialized': {
    note: 'Chuyên sâu: bài đa khớp trước, bài cô lập sau. Nghỉ ít nhất 1,5 phút: bài đa khớp 1,5–3 phút, bài cô lập 1–2 phút. Ở các nhóm cơ lớn, khoảng 3/4 số set đến từ bài đa khớp.',
    slots: [
      withRest(SQUAT, 120), withRest(HINGE, 120), withRest(PUSH_H, 120),
      withRest(PULL_H, 120), withRest(PUSH_V, 120), withRest(PULL_V, 120),
      isolation('leg-ext', 'Đùi trước · cô lập', 'Đùi trước', ['isolation_knee'], 'Leg extension: phần đùi trước mà squat và leg press ít chạm tới.'),
      isolation('leg-curl', 'Đùi sau · cô lập', 'Đùi sau & Mông', ['isolation_hip'], 'Leg curl (gập gối) bổ sung cho hinge.'),
      isolation('lateral', 'Vai giữa · cô lập', 'Vai', ['isolation_shoulder'], 'Nâng tạ ngang (lateral raise).'),
      isolation('fly', 'Ngực · cô lập', 'Ngực', ['isolation_pec'], 'Ép ngực máy hoặc cáp.'),
      isolation('biceps', 'Tay trước', 'Tay trước', ['isolation_biceps']),
      isolation('triceps', 'Tay sau', 'Tay sau', ['isolation_triceps'], 'Ưu tiên một bài tay qua đầu (overhead) cho đầu dài tay sau.'),
      isolation('calves', 'Bắp chân', 'Bắp chân', ['isolation_calves'], 'Bắp chân đứng thẳng gối nếu có máy.'),
      isolation('abs', 'Bụng', 'Bụng', ['isolation_core']),
    ],
    splits: {
      3: [
        { label: 'Buổi A', slots: [...BEGINNER_3_DAYS[0], 'leg-ext', 'lateral', 'calves'] },
        { label: 'Buổi B', slots: [...BEGINNER_3_DAYS[1], 'leg-curl', 'triceps', 'abs'] },
        { label: 'Buổi C', slots: [...BEGINNER_3_DAYS[2], 'fly', 'biceps', 'calves', 'abs'] },
      ],
    },
    weeklyTargets: {
      'Ngực': { min: 4, max: 6 },
      'Lưng': { min: 8, max: 12 },
      'Vai': { min: 6, max: 8 },
      'Đùi trước': { min: 4, max: 6 },
      'Đùi sau & Mông': { min: 6, max: 8 },
      'Tay trước': { min: 4, max: 6 },
      'Tay sau': { min: 4, max: 6 },
      'Bắp chân': { min: 4, max: 6 },
      'Bụng': { min: 4, max: 6 },
    },
  },
};

// ------------------------------------------------------------
// Giáo án mẫu theo số buổi mỗi tuần (David duyệt 2026-11-03)
// ------------------------------------------------------------
// Dùng cho mọi cấp độ. Riêng Tăng cơ · Mới tập · 3 buổi giữ quy tắc riêng ở trên.
// Mỗi dòng: [dạng bài, set, rep, RIR]. Chỉnh số set theo kinh nghiệm từng khách khi dựng.
// Bài nào cần thêm (bài cô lập cho nhóm cơ khách muốn ưu tiên) hoặc bớt (bài khách không
// thích) thì sửa trong khung; miễn đủ volume và tập đủ nặng là khách vẫn tiến bộ.

/** Dạng bài: nhãn, nhóm cơ trong thư viện, dạng chuyển động lọc bài gợi ý. */
const KINDS = Object.freeze({
  squat: ['Đùi trước · squat', 'Đùi trước', ['compound_knee', 'accessory_knee']],
  hinge: ['Đùi sau & mông · hinge', 'Đùi sau & Mông', ['compound_hip', 'accessory_hip']],
  pushH: ['Ngực · đẩy ngang', 'Ngực', ['compound_pec', 'accessory_pec']],
  pushV: ['Vai · đẩy dọc', 'Vai', ['compound_shoulder', 'accessory_shoulder']],
  pullH: ['Lưng · kéo ngang', 'Lưng', ['compound_back_horizontal', 'accessory_back_horizontal']],
  pullV: ['Lưng · kéo dọc', 'Lưng', ['accessory_back_vertical']],
  legExt: ['Đùi trước · leg extension', 'Đùi trước', ['isolation_knee']],
  splitSquat: ['Đùi trước · chân đơn (split squat)', 'Đùi trước', ['isolation_knee']],
  legCurl: ['Đùi sau · leg curl', 'Đùi sau & Mông', ['isolation_hip']],
  lateral: ['Vai giữa · lateral raise', 'Vai', ['isolation_shoulder']],
  facePull: ['Vai sau · face pull', 'Vai', ['isolation_shoulder']],
  fly: ['Ngực · ép ngực', 'Ngực', ['isolation_pec']],
  triceps: ['Tay sau', 'Tay sau', ['isolation_triceps']],
  biceps: ['Tay trước', 'Tay trước', ['isolation_biceps']],
  calves: ['Bắp chân', 'Bắp chân', ['isolation_calves']],
});

const LOWER_KINDS = new Set(['squat', 'hinge', 'splitSquat', 'sq', 'dl', 'sqVar', 'dlVar']);
const UPPER_KINDS = new Set(['pushH', 'pushV', 'pullH', 'pullV', 'bp', 'bpVar']);
const stepForKind = (kind) => (LOWER_KINDS.has(kind) ? WEIGHT_STEP_KG.lowerCompound
  : UPPER_KINDS.has(kind) ? WEIGHT_STEP_KG.upperCompound : WEIGHT_STEP_KG.isolation);

const range = (text) => {
  const [min, max = min] = String(text).split('-').map(Number);
  return { min, max };
};

/** Biến một bảng giáo án mẫu thành slot và cách chia buổi; id slot: <tiền tố><số buổi>-<buổi>-<thứ tự>. */
function fromSample(prefix, days, { rest = {}, labels = [] } = {}) {
  const slots = [];
  const split = days.map((rows, dayIndex) => ({
    label: labels[dayIndex] || `Buổi ${'ABCDEFG'[dayIndex]}`,
    slots: rows.map(([kind, sets, reps, rir], index) => {
      const [label, muscle, patterns] = KINDS[kind];
      const id = `${prefix}${days.length}-${dayIndex + 1}-${index + 1}`;
      slots.push({
        id, label, muscleGroups: [muscle], patterns,
        sets: range(sets), reps: range(reps), rir: range(rir), weightStepKg: stepForKind(kind),
        ...(rest[kind] ? { restSeconds: rest[kind] } : {}),
      });
      return id;
    }),
  }));
  return { slots, split };
}

// Tăng cơ: 1–7 buổi mỗi tuần.
const MUSCLE_SAMPLES = {
  1: [[['squat', '2', '6-10', '1-2'], ['hinge', '2', '6-10', '1-2'], ['pullV', '2', '6-12', '0-1'], ['pushH', '2', '6-12', '0-2'],
    ['pullH', '2', '10-15', '0-2'], ['triceps', '2', '8-12', '0-2'], ['biceps', '2', '8-12', '0-2']]],
  2: [
    [['squat', '2-3', '6-8', '1-2'], ['hinge', '2-3', '6-8', '1-2'], ['legExt', '2', '8-12', '0-1'], ['legCurl', '2', '8-12', '0-1'],
      ['pullV', '3', '6-12', '0-1'], ['calves', '2', '8-15', '0-1']],
    [['pushH', '3-4', '6-12', '0-2'], ['pushV', '2', '6-12', '0-2'], ['pullH', '2-3', '6-12', '0-2'], ['lateral', '2-3', '8-12', '0-2'],
      ['triceps', '2', '8-12', '0-2'], ['biceps', '2', '8-12', '0-2']],
  ],
  3: [
    [['squat', '2-3', '8-12', '0-2'], ['pushH', '2-3', '8-12', '0-2'], ['pushV', '2-3', '8-12', '0-2'], ['triceps', '2-3', '10-15', '0-2']],
    [['hinge', '2-3', '8-12', '0-2'], ['pullH', '2-3', '8-12', '0-2'], ['pullV', '2-3', '8-12', '0-2'], ['biceps', '2-3', '10-15', '0-2']],
    [['squat', '2-3', '8-12', '0-2'], ['lateral', '2-3', '8-12', '0-2'], ['pullH', '2-3', '8-12', '0-2'], ['calves', '2-3', '8-12', '0-2']],
  ],
  4: [
    [['pushH', '3-4', '5-10', '1-2'], ['pushV', '3-4', '8-12', '1-2'], ['lateral', '2-3', '10-15', '1-2']],
    [['squat', '3-4', '8-12', '1-2'], ['hinge', '3-4', '8-12', '1-2'], ['calves', '3-4', '12-15', '1-2']],
    [['pullH', '3-4', '8-12', '1-2'], ['pullV', '3-4', '8-12', '1-2'], ['facePull', '2-3', '10-15', '1-2']],
    [['squat', '2-3', '8-12', '1-2'], ['lateral', '2-3', '8-12', '1-2'], ['pushH', '3-4', '5-10', '1-2'], ['biceps', '2-3', '5-10', '1-2']],
  ],
  5: [
    [['pushH', '3-4', '5-10', '1-2'], ['pushV', '3-4', '8-12', '1-2'], ['lateral', '2-3', '10-15', '1-2']],
    [['squat', '3-4', '8-12', '1-2'], ['hinge', '3-4', '8-12', '1-2'], ['legCurl', '2-3', '12-15', '1-2']],
    [['pullH', '3-4', '8-12', '1-2'], ['pullV', '3-4', '8-12', '1-2'], ['facePull', '2-3', '10-15', '1-2']],
    [['squat', '2-3', '8-12', '1-2'], ['lateral', '2-3', '8-12', '1-2'], ['biceps', '2-3', '5-10', '1-2']],
    [['pushV', '2-3', '6-10', '1-2'], ['pushH', '2-3', '6-10', '1-2'], ['pullH', '2-3', '8-12', '1-2']],
  ],
  6: [
    [['pushH', '3', '5-10', '1-2'], ['lateral', '2-3', '10-15', '1-2']],
    [['squat', '3', '8-12', '1-2'], ['calves', '2-3', '12-15', '1-2']],
    [['pushV', '3', '8-12', '1-2'], ['triceps', '2', '8-12', '1-2']],
    [['hinge', '4-5', '8-12', '1-2'], ['lateral', '2', '10-15', '1-2']],
    [['pullH', '3', '8-12', '1-2'], ['biceps', '2-3', '8-12', '1-2'], ['squat', '2', '6-10', '1-2']],
    [['pullV', '3', '8-12', '1-2'], ['pushH', '2-3', '8-12', '1-2']],
  ],
  7: [
    [['pushH', '3', '5-10', '1-2'], ['lateral', '2', '10-15', '1-2']],
    [['squat', '3', '8-12', '1-2'], ['hinge', '2', '8-12', '1-2']],
    [['pullV', '3', '8-12', '1-2'], ['biceps', '2', '8-12', '1-2']],
    [['pushV', '3', '8-12', '1-2'], ['triceps', '2', '8-12', '1-2']],
    [['hinge', '3', '8-12', '1-2'], ['pullV', '2', '8-12', '1-2']],
    [['pullH', '3', '8-12', '1-2'], ['calves', '2', '12-15', '1-2']],
    [['squat', '2', '6-10', '1-2'], ['pushH', '2', '8-12', '1-2']],
  ],
};

// Sức mạnh: 1–7 buổi mỗi tuần. Hinge nặng nhất (1–3 rep), squat và đẩy 3–5 rep, kéo 4–7 rep.
const STRENGTH_SAMPLES = {
  1: [[['hinge', '2-3', '1-3', '2-4'], ['squat', '2-3', '3-5', '2-4'], ['pushH', '2', '3-5', '1-3'], ['pullV', '2-3', '5-7', '1-3']]],
  2: [
    [['hinge', '2-3', '1-3', '2-4'], ['squat', '2-3', '3-5', '2-4'], ['pushH', '2', '3-5', '1-3'], ['pushV', '2', '4-6', '1-3']],
    [['pullV', '2-3', '4-6', '1-3'], ['pullH', '2-3', '4-6', '1-3'], ['squat', '2', '4-6', '2-3'], ['pushH', '2', '4-6', '1-3']],
  ],
  3: [
    [['hinge', '2-3', '1-3', '2-4'], ['squat', '2-3', '3-5', '2-4'], ['pushH', '2', '3-5', '1-3']],
    [['pullV', '2-3', '4-6', '1-3'], ['pullH', '2-3', '3-5', '1-3'], ['pushV', '2', '4-6', '1-3']],
    [['squat', '2-3', '3-5', '2-3'], ['pushH', '2', '4-6', '1-3'], ['hinge', '2-3', '3-5', '2-4']],
  ],
  4: [
    [['hinge', '2-3', '1-3', '2-4'], ['pushH', '2', '3-5', '1-3']],
    [['squat', '2-3', '3-5', '2-4'], ['pushV', '2', '6-8', '1-3']],
    [['pullV', '2-3', '5-7', '1-3'], ['pullH', '2-3', '5-7', '1-3']],
    [['squat', '2-3', '4-6', '2-3'], ['pushH', '2', '4-6', '1-3']],
  ],
  5: [
    [['squat', '2-3', '3-5', '2-4'], ['pushH', '2', '3-5', '1-3']],
    [['hinge', '2-3', '1-3', '2-4'], ['pullV', '2-3', '4-6', '1-3']],
    [['pushV', '2', '4-6', '1-3'], ['pullH', '2-3', '4-6', '1-3']],
    [['squat', '2-3', '3-5', '2-3'], ['pullV', '2-3', '4-6', '1-3']],
    [['hinge', '2-3', '3-5', '2-3'], ['pushV', '2', '4-6', '1-3']],
  ],
  6: [
    [['squat', '1-2', '3-5', '2-4'], ['pushH', '2', '3-5', '1-3']],
    [['hinge', '1-2', '1-3', '2-4'], ['pullV', '1-2', '4-6', '1-3']],
    [['pushV', '2', '3-5', '1-3'], ['pullH', '1-2', '5-7', '1-3']],
    [['squat', '1-2', '4-6', '2-3'], ['pushH', '2', '4-6', '1-3']],
    [['hinge', '1-2', '3-5', '2-3'], ['pullV', '1-2', '4-6', '1-3']],
    [['pushV', '2', '3-5', '1-3'], ['pullH', '1-2', '4-6', '1-3']],
  ],
  7: [
    [['squat', '1-2', '3-5', '2-4'], ['pushH', '1', '3-5', '1-3']],
    [['hinge', '1-2', '1-3', '2-4']],
    [['pullV', '1-2', '4-6', '1-3'], ['pushV', '1', '4-6', '1-3']],
    [['pullH', '1-2', '5-7', '1-3']],
    [['squat', '1-2', '4-6', '2-3']],
    [['hinge', '1-2', '3-5', '2-3']],
    [['pushV', '1', '4-6', '1-3'], ['pullV', '1', '4-6', '1-3']],
  ],
};

// Sức mạnh + tăng cơ (powerbuilding): 4 buổi, trên/dưới. Bài chính nặng 1–5 rep, nghỉ 3–4 phút;
// bài phụ 6–15 rep gần thất bại.
const POWERBUILDING_4 = [
  [['squat', '3', '1-5', '2-4'], ['hinge', '3', '6-8', '0-2'], ['squat', '2', '8-10', '0-2'], ['calves', '2', '12-15', '0-2']],
  [['pushH', '3', '1-5', '2-4'], ['pullV', '3', '6-8', '0-2'], ['pushH', '2', '10-12', '0-2'], ['lateral', '2', '12-15', '0-2'], ['biceps', '2', '10-12', '0-2']],
  [['hinge', '3', '1-5', '2-4'], ['splitSquat', '3', '8-10', '0-2'], ['legCurl', '3', '10-12', '0-2'], ['calves', '2', '12-15', '0-2']],
  [['pushV', '3', '1-5', '2-4'], ['pullH', '3', '6-8', '0-2'], ['fly', '2', '10-12', '0-2'], ['triceps', '2', '12-15', '0-2']],
];

// Bản 3 buổi: toàn thân xoay vòng, mỗi buổi một bài sức mạnh chính (Squat / Bench / Deadlift);
// OHP là bài phụ. Claude ghép từ quy tắc chung (sách chỉ có mẫu 4 buổi), David duyệt 2026-11-03.
// David duyệt bù chân 2026-11-03: buổi Squat leg curl 3 set và thêm bắp chân 2 set.
const POWERBUILDING_3 = [
  [['squat', '3', '1-5', '2-4'], ['pullV', '3', '6-8', '0-2'], ['pushV', '2', '8-10', '0-2'], ['legCurl', '3', '10-12', '0-2'], ['lateral', '2', '12-15', '0-2'], ['calves', '2', '12-15', '0-2']],
  [['pushH', '3', '1-5', '2-4'], ['pullH', '3', '6-8', '0-2'], ['splitSquat', '2', '8-10', '0-2'], ['triceps', '2', '12-15', '0-2'], ['biceps', '2', '10-12', '0-2']],
  [['hinge', '3', '1-5', '2-4'], ['squat', '2', '8-10', '0-2'], ['pushH', '2', '10-12', '0-2'], ['pullH', '2', '10-12', '0-2'], ['calves', '2', '12-15', '0-2']],
];

function samplesRule(prefix, samples, note) {
  const slots = [];
  const splits = {};
  Object.entries(samples).forEach(([days, program]) => {
    const built = fromSample(prefix, program);
    slots.push(...built.slots);
    splits[days] = built.split;
  });
  return { note, slots, splits };
}

const MUSCLE_RULE = samplesRule('m', MUSCLE_SAMPLES,
  'Giáo án mẫu tăng cơ theo số buổi. Ưu tiên tập gần thất bại; thêm rep hoặc tạ khi được. Nếu 2–3 tháng không tiến: kiểm tra RIR thật, ăn ngủ, đổi sang bài kéo giãn cơ nhiều hơn, rồi mới thêm 1–2 set mỗi nhóm cơ mỗi 3–4 tuần.');
const STRENGTH_RULE = samplesRule('s', STRENGTH_SAMPLES,
  'Giáo án mẫu sức mạnh theo số buổi. Nghỉ 2–3 phút, tới 5 phút với bài nặng. Mỗi tuần một lần nâng 1 rep nặng ở RIR 1–3 để theo dõi; kiểm tra 1RM mỗi 8–12 tuần sau 3–4 ngày nghỉ. Nếu 8–12 tuần không tiến: thêm 1–2 set 3–5 rep ở bài chính.');
const POWERBUILDING_RULE = (() => {
  const four = fromSample('p', POWERBUILDING_4, {
    labels: ['Thân dưới A', 'Thân trên A', 'Thân dưới B', 'Thân trên B'],
  });
  const three = fromSample('p', POWERBUILDING_3, {
    labels: ['Toàn thân · Squat', 'Toàn thân · Bench', 'Toàn thân · Deadlift'],
  });
  const slots = [...three.slots, ...four.slots];
  // Nghỉ theo vai trò của bài: bài chính 1–5 rep nghỉ 3–4 phút, 6–8 rep 90 giây, còn lại 60–90 giây.
  slots.forEach((slot) => { slot.restSeconds = slot.reps.max <= 5 ? 180 : slot.reps.max <= 8 ? 90 : 75; });
  return {
    note: 'Sức mạnh + tăng cơ: 3–4 buổi mỗi tuần. Bài chính 1–3 set nặng 1–5 rep ở RIR 2–4; bài phụ 2–4 set 8–15 rep ở RIR 0–2. Tăng tạ hoặc rep mỗi tuần khi được.',
    slots,
    splits: { 3: three.split, 4: four.split },
    // Số buổi ngoài 3–4: không dựng khung, nói rõ lý do thay vì "chưa có".
    uncoveredLabel: 'sách khuyên 3–4 buổi',
    uncoveredReason: 'Sức mạnh + tăng cơ nên tập 3–4 buổi/tuần. Chọn 3 hoặc 4 buổi.',
  };
})();

// ------------------------------------------------------------
// Liều tập theo cấp độ × kiểu (David duyệt 2026-11-03)
// ------------------------------------------------------------
// Giữ cách xếp buổi của giáo án mẫu (bài nào vào ngày nào), nhưng set, rep, RIR và nghỉ lấy theo
// bảng dưới. "weekly" là set/tuần cho MỖI nhóm cơ (Tăng cơ) hoặc MỖI dạng bài (Sức mạnh); số set
// mỗi lần tập = set/tuần chia cho số lần dạng bài đó có trong tuần, làm tròn lên.
// Lưng = lưng xô (kéo dọc) + lưng giữa (kéo ngang), mỗi phần một khoảng weekly.

/** Cách xếp buổi của giáo án mẫu, chỉ giữ dạng bài. */
const kindsOf = (samples) => Object.fromEntries(Object.entries(samples)
  .map(([days, program]) => [days, program.map((rows) => rows.map(([kind]) => kind))]));
const MUSCLE_LAYOUTS = kindsOf(MUSCLE_SAMPLES);
const STRENGTH_LAYOUTS = kindsOf(STRENGTH_SAMPLES);

// Người chuyên squat / bench / deadlift: buổi nào tập bài chính nào, 1–7 buổi.
const SBD_LAYOUTS = {
  1: [['sq', 'bp', 'dl']],
  2: [['sq', 'bp'], ['dl', 'bp']],
  3: [['sq'], ['bp'], ['dl']],
  4: [['sq', 'dl'], ['bp'], ['sq', 'dl'], ['bp']],
  5: [['sq'], ['bp'], ['dl'], ['bp'], ['sq']],
  6: [['sq'], ['bp'], ['dl'], ['sq'], ['bp'], ['dl']],
  7: [['sq'], ['bp'], ['dl'], ['sq'], ['bp'], ['dl'], ['sq', 'bp']],
};

const r = range;
const MUSCLE_DOSE = {
  beginner: {
    general: { weekly: r('4'), exercises: 'compound', reps: { compound: r('6-12'), isolation: r('8-15') }, rir: r('0-2'),
      note: 'Tăng cơ · Mới tập · Tổng quát: chỉ bài đa khớp, khoảng 4 set/tuần mỗi nhóm cơ, 6–12 rep, RIR 0–2. Nghỉ khi nào sẵn sàng thì tập.' },
    specialized: { weekly: r('4-6'), exercises: 'compound+isolation+small', reps: { compound: r('6-12'), isolation: r('8-15') }, rir: r('0-2'),
      rest: { compound: 120, isolation: 90 },
      note: 'Tăng cơ · Mới tập · Chuyên sâu: 4–6 set/tuần mỗi nhóm cơ, đa khớp 6–12 rep, cô lập 8–15 rep, RIR 0–2.' },
  },
  intermediate: {
    general: { weekly: r('4-6'), exercises: 'compound+isolation', reps: { compound: r('6-12'), isolation: r('8-15') }, rir: r('0-2'),
      rest: { compound: 150, isolation: 90 },
      note: 'Tăng cơ · Trung cấp · Tổng quát: 4–6 set/tuần mỗi nhóm cơ, một bài đa khớp và một bài cô lập, RIR 0–2.' },
    specialized: { weekly: r('6-8'), exercises: '2compound+isolation', reps: { compound: r('5-7'), compoundB: r('7-10'), isolation: r('10-20') }, rir: r('0-1'),
      rest: { compound: 150, isolation: 90 },
      note: 'Tăng cơ · Trung cấp · Chuyên sâu: 6–8 set/tuần mỗi nhóm cơ, chia 2 buổi. Đa khớp lần A 5–7 rep, lần B 7–10 rep, cô lập 10–20 rep, RIR 0–1.' },
  },
  advanced: {
    general: { weekly: r('5-7'), exercises: '2compound+isolation', reps: { compound: r('5-7'), compoundB: r('7-10'), isolation: r('10-20') }, rir: r('0-2'),
      rest: { compound: 180, isolation: 90 },
      note: 'Tăng cơ · Nâng cao · Tổng quát: 5–7 set/tuần mỗi nhóm cơ. Đa khớp lần A 5–7 rep, lần B 7–10 rep, cô lập 10–20 rep, RIR 0–2.' },
    specialized: { weekly: r('7-10'), exercises: '2compound+isolation+small', reps: { compound: r('5-7'), compoundB: r('7-10'), isolation: r('10-20') }, rir: r('0-1'),
      rest: { compound: 180, isolation: 90 },
      note: 'Tăng cơ · Nâng cao · Chuyên sâu: 7–10 set/tuần mỗi nhóm cơ, chia 2–3 buổi, thêm bài cô lập cho nhóm cơ nhỏ, RIR 0–1.' },
  },
};

const STRENGTH_DOSE = {
  beginner: {
    recreational: { weekly: r('1-4'), primary: { reps: r('5-7'), rir: r('1-3'), rest: 120, patterns: 'machine' },
      note: 'Sức mạnh · Mới tập · Tập giải trí: bài máy đa khớp, 1–4 set/tuần mỗi dạng bài, 5–7 rep, RIR 1–3, nghỉ 1–2 phút.' },
    barbell: { weekly: r('2-4'), primary: { reps: r('3-5'), rir: r('2-3'), rest: 210, patterns: 'barbell' }, secondary: { reps: r('5-8'), rir: r('2-3'), rest: 120 },
      note: 'Sức mạnh · Mới tập · Mê tạ đòn: 2–4 set/tuần mỗi dạng bài. Lần đầu trong tuần là bài tạ đòn 3–5 rep (nghỉ 3–4 phút), các lần sau máy hoặc tạ đơn 5–8 rep, RIR 2–3.' },
    sbd: { main: { weekly: r('2-4'), heavy: r('3-5'), heavyShare: 1, rir: r('2-3'), rest: 210 },
      accessory: { weekly: r('1-2'), reps: r('6-10'), rir: r('1-2'), rest: 90 },
      note: 'Sức mạnh · Mới tập · Squat · bench · deadlift: mỗi bài chính 2–4 set/tuần, 3–5 rep, RIR 2–3, nghỉ 3–4 phút. Bài phụ 1–2 set.' },
  },
  intermediate: {
    recreational: { weekly: r('4-6'), primary: { reps: r('4-6'), rir: r('1-3'), rest: 180, patterns: 'machine' },
      note: 'Sức mạnh · Trung cấp · Tập giải trí: bài máy đa khớp, 4–6 set/tuần mỗi dạng bài, 4–6 rep, RIR 1–3, nghỉ 2–5 phút.' },
    barbell: { weekly: r('4-6'), primary: { reps: r('3-5'), rir: r('2-3'), rest: 240, patterns: 'barbell' }, secondary: { reps: r('6-8'), rir: r('2-3'), rest: 150 },
      note: 'Sức mạnh · Trung cấp · Mê tạ đòn: 4–6 set/tuần mỗi dạng bài. Tạ đòn 3–5 rep, máy hoặc tạ đơn 6–8 rep, nghỉ 2–5 phút.' },
    sbd: { main: { weekly: r('4-6'), heavy: r('1-3'), light: r('3-6'), heavyShare: 0.5, rir: r('1-3'), rest: 240 },
      variation: { weekly: r('1-2'), reps: r('4-6'), rir: r('1-3'), rest: 180 },
      accessory: { weekly: r('2-3'), reps: r('6-12'), rir: r('1-2'), rest: 90 },
      note: 'Sức mạnh · Trung cấp · Squat · bench · deadlift: mỗi bài chính 4–6 set nặng/tuần, khoảng nửa ở 1–3 rep, nửa ở 3–6 rep. Thêm biến thể 1–2 set (squat dừng, bench tay hẹp, deadlift đứng bục) và bài phụ 2–3 set.' },
  },
  advanced: {
    recreational: { weekly: r('4-6'), primary: { reps: r('4-6'), rir: r('1-2'), rest: 180, patterns: 'machine' },
      note: 'Sức mạnh · Nâng cao · Tập giải trí: bài máy đa khớp, 4–6 set/tuần mỗi dạng bài, 4–6 rep, RIR 1–2.' },
    barbell: { weekly: r('4-6'), primary: { reps: r('3-5'), rir: r('1-3'), rest: 270, patterns: 'barbell' }, secondary: { reps: r('5-8'), rir: r('1-3'), rest: 180 },
      note: 'Sức mạnh · Nâng cao · Mê tạ đòn: 4–6 set/tuần mỗi dạng bài. Tạ đòn 3–5 rep, máy hoặc tạ đơn 5–8 rep, RIR 1–3, nghỉ tới 3–6 phút với bài tạ tự do.' },
    sbd: { main: { weekly: r('4-6'), heavy: r('1-3'), light: r('3-6'), heavyShare: 0.65, rir: r('1-3'), rest: 270 },
      variation: { weekly: r('2-3'), reps: r('4-6'), rir: r('1-3'), rest: 180 },
      accessory: { weekly: r('2-4'), reps: r('6-12'), rir: r('1-2'), rest: 90 },
      note: 'Sức mạnh · Nâng cao · Squat · bench · deadlift: mỗi bài chính 4–6 set/tuần, 60–70% ở 1–3 rep. Thêm biến thể 2–3 set và bài phụ 2–4 set.' },
  },
};

const LEVEL_IDS = ['beginner', 'intermediate', 'advanced'];
const dosed = (fn, prefix, layouts, dose) => fn(prefix, layouts, { ...dose, stepFor: stepForKind });

/**
 * Khoảng set/tuần để so trên trang (Trong khoảng / Thấp / Cao), theo cách app đếm volume.
 * Cận dưới là set/tuần trong bảng. Cận trên rộng hơn 1,5 lần vì app tính thêm 0,5 set cho cơ phụ
 * (đẩy → vai, tay sau; kéo → tay trước; squat → đùi sau & mông). Lưng gộp xô và lưng giữa nên
 * gấp đôi. Tay chỉ có khi kiểu tập có bài cô lập cho nhóm cơ nhỏ; cận dưới một nửa vì phần lớn
 * volume tay đến từ bài đẩy và kéo.
 */
function muscleTargets({ weekly, exercises }) {
  const upper = (value) => Math.ceil(value * 1.5);
  const main = { min: weekly.min, max: upper(weekly.max) };
  const targets = {
    'Ngực': main, 'Lưng': { min: weekly.min * 2, max: upper(weekly.max) * 2 },
    'Vai': main, 'Đùi trước': main, 'Đùi sau & Mông': main,
  };
  if (exercises.endsWith('+small')) {
    const arms = { min: Math.ceil(weekly.min / 2), max: upper(weekly.max) };
    Object.assign(targets, { 'Tay trước': arms, 'Tay sau': arms, 'Bắp chân': main, 'Bụng': main });
  }
  return Object.fromEntries(Object.entries(targets).map(([muscle, range]) => [muscle, { ...range }]));
}
const dosedMuscle = (prefix, dose) => ({ ...dosed(muscleRule, prefix, MUSCLE_LAYOUTS, dose), weeklyTargets: muscleTargets(dose) });

/** Tăng cơ · Mới tập · 3 buổi giữ quy tắc riêng đã duyệt; số buổi khác dựng theo liều Mới tập. */
const withBeginnerThreeDays = (rule, style, prefix) => {
  const otherDays = Object.fromEntries(Object.entries(MUSCLE_LAYOUTS).filter(([days]) => days !== '3'));
  const generated = dosed(muscleRule, prefix, otherDays, MUSCLE_DOSE.beginner[style]);
  return {
    note: rule.note,
    slots: [...generated.slots, ...rule.slots],
    splits: { ...generated.splits, 3: rule.splits[3] },
    weeklyTargets: rule.weeklyTargets,
  };
};

/**
 * Quy tắc theo tổ hợp, khoá là "mục tiêu.cấp độ.kiểu".
 * Mỗi tổ hợp gồm:
 *   slots: các "chỗ" trong giáo án, mỗi chỗ là một nhóm cơ hoặc dạng chuyển động
 *   weeklyTargets: khoảng set/tuần mong muốn theo nhóm cơ (để so với kế hoạch)
 *   splits: (tuỳ chọn) cách chia buổi riêng cho tổ hợp này, ghi đè SPLITS bên dưới
 *   note: lời của David cho tổ hợp này (hiện cho coach, để trống thì ẩn)
 */
export const DOSE_RULES = Object.freeze(Object.fromEntries([
  ['muscle.beginner.general', withBeginnerThreeDays(BEGINNER_MUSCLE['muscle.beginner.general'], 'general', 'bg')],
  ['muscle.beginner.specialized', withBeginnerThreeDays(BEGINNER_MUSCLE['muscle.beginner.specialized'], 'specialized', 'bs')],
  ...LEVEL_IDS.slice(1).flatMap((level) => [
    [`muscle.${level}.general`, dosedMuscle(`${level[0]}g`, MUSCLE_DOSE[level].general)],
    [`muscle.${level}.specialized`, dosedMuscle(`${level[0]}s`, MUSCLE_DOSE[level].specialized)],
    // Tiêu chuẩn: khoảng suy ra từ công thức muscleTargets với liều Tổng quát cùng cấp độ (David duyệt 2026-11-13).
    [`muscle.${level}.standard`, { ...MUSCLE_RULE, weeklyTargets: muscleTargets(MUSCLE_DOSE[level].general) }],
  ]),
  ...LEVEL_IDS.flatMap((level) => [
    [`strength.${level}.recreational`, dosed(strengthRule, `${level[0]}r`, STRENGTH_LAYOUTS, STRENGTH_DOSE[level].recreational)],
    [`strength.${level}.barbell`, dosed(strengthRule, `${level[0]}b`, STRENGTH_LAYOUTS, STRENGTH_DOSE[level].barbell)],
    [`strength.${level}.sbd`, dosed(sbdRule, `${level[0]}d`, SBD_LAYOUTS, STRENGTH_DOSE[level].sbd)],
    [`strength.${level}.standard`, STRENGTH_RULE],
  ]),
  ...LEVEL_IDS.map((level) => [`powerbuilding.${level}.standard`, POWERBUILDING_RULE]),
]));

/**
 * Cách chia buổi theo số ngày tập mỗi tuần, khoá là số ngày (1-7).
 * Mỗi buổi có nhãn và danh sách id của các slot (xem mẫu cuối file).
 */
export const SPLITS = Object.freeze({});

// ------------------------------------------------------------
// MẪU ĐỊNH DẠNG (chỉ để xem cách viết; <số> là chỗ David điền, không có số mặc định):
//
// export const DOSE_RULES = Object.freeze({
//   'muscle.beginner.style1': {
//     note: '<lời của David>',
//     slots: [
//       {
//         id: 'chest-main',                          // tên ngắn, không trùng trong tổ hợp
//         label: 'Ngực — bài chính',                 // hiện cho coach
//         muscleGroups: ['Ngực'],                    // tên nhóm cơ trong thư viện bài tập
//         patterns: ['compound_pec', 'accessory_pec'],// dạng chuyển động; có thể dùng 'compound_*'
//         sets: { min: <số>, max: <số> },            // set mỗi lần xuất hiện
//         reps: { min: <số>, max: <số> },
//         rir: { min: <số>, max: <số> },             // tuỳ chọn
//         restSeconds: <số>,                         // tuỳ chọn, giây
//         scheme: null,                              // tuỳ chọn, kiểu tiến triển mong muốn (1-8)
//         note: '<lời của David>',
//       },
//     ],
//     weeklyTargets: { 'Ngực': { min: <số>, max: <số> } },
//   },
// });
//
// export const SPLITS = Object.freeze({
//   3: [
//     { label: 'Buổi A', slots: ['chest-main'] },
//     { label: 'Buổi B', slots: ['...'] },
//     { label: 'Buổi C', slots: ['...'] },
//   ],
// });
//
// Tên nhóm cơ hợp lệ: Ngực, Lưng, Vai, Đùi trước, Đùi sau & Mông, Bắp chân, Tay trước, Tay sau, Bụng.
