// ============================================================
// DAVID COACHING — Quy tắc của David cho Bộ dựng giáo án
// ============================================================
// File này là NƠI DUY NHẤT chứa con số và lời giải thích của Bộ dựng giáo án
// (dose-planner.html). Công cụ chỉ giao KHUNG; mọi giá trị do David quyết định.
// Tổ hợp nào chưa có quy tắc thì công cụ báo "David chưa nhập quy tắc cho tổ hợp
// này" và không bao giờ tự bịa số. Đã có: Tăng cơ, Sức mạnh (1–7 buổi) và Sức mạnh + tăng cơ (4 buổi),
// cho mọi cấp độ; Tăng cơ · Mới tập · 3 buổi có quy tắc riêng.
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

/** Kiểu tập. Tăng cơ · Mới tập có Tổng quát và Chuyên sâu; các tổ hợp khác dùng Chuẩn.
 *  Trang chỉ hiện những kiểu có quy tắc cho mục tiêu và cấp độ đang chọn. */
export const STYLES = Object.freeze([
  Object.freeze({ id: 'general', label: 'Tổng quát' }),
  Object.freeze({ id: 'specialized', label: 'Chuyên sâu' }),
  Object.freeze({ id: 'standard', label: 'Chuẩn' }),
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

const LOWER_KINDS = new Set(['squat', 'hinge', 'splitSquat']);
const UPPER_KINDS = new Set(['pushH', 'pushV', 'pullH', 'pullV']);
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

const LEVEL_IDS = ['beginner', 'intermediate', 'advanced'];
/** Tăng cơ · Mới tập · 3 buổi giữ quy tắc riêng; các số buổi khác của Mới tập dùng giáo án mẫu. */
const withBeginnerThreeDays = (rule) => ({
  note: rule.note,
  slots: [...MUSCLE_RULE.slots, ...rule.slots],
  splits: { ...MUSCLE_RULE.splits, 3: rule.splits[3] },
  weeklyTargets: rule.weeklyTargets,
});

/**
 * Quy tắc theo tổ hợp, khoá là "mục tiêu.cấp độ.kiểu".
 * Mỗi tổ hợp gồm:
 *   slots: các "chỗ" trong giáo án, mỗi chỗ là một nhóm cơ hoặc dạng chuyển động
 *   weeklyTargets: khoảng set/tuần mong muốn theo nhóm cơ (để so với kế hoạch)
 *   splits: (tuỳ chọn) cách chia buổi riêng cho tổ hợp này, ghi đè SPLITS bên dưới
 *   note: lời của David cho tổ hợp này (hiện cho coach, để trống thì ẩn)
 */
export const DOSE_RULES = Object.freeze(Object.fromEntries([
  ...LEVEL_IDS.flatMap((level) => (level === 'beginner'
    ? [['muscle.beginner.general', withBeginnerThreeDays(BEGINNER_MUSCLE['muscle.beginner.general'])],
      ['muscle.beginner.specialized', withBeginnerThreeDays(BEGINNER_MUSCLE['muscle.beginner.specialized'])]]
    : [[`muscle.${level}.standard`, MUSCLE_RULE]])),
  ...LEVEL_IDS.map((level) => [`strength.${level}.standard`, STRENGTH_RULE]),
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
