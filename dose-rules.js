// ============================================================
// DAVID COACHING — Quy tắc của David cho Bộ dựng giáo án
// ============================================================
// File này là NƠI DUY NHẤT chứa con số và lời giải thích của Bộ dựng giáo án
// (dose-planner.html). Công cụ chỉ giao KHUNG; mọi giá trị do David quyết định.
// Tổ hợp nào chưa có quy tắc thì công cụ báo "David chưa nhập quy tắc cho tổ hợp
// này" và không bao giờ tự bịa số. Đã có: Tăng cơ · Mới tập (Tổng quát, Chuyên sâu), 3 buổi.
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
]);

/** Cấp độ của học viên. Đổi nhãn tuỳ ý. */
export const LEVELS = Object.freeze([
  Object.freeze({ id: 'beginner', label: 'Mới tập' }),
  Object.freeze({ id: 'intermediate', label: 'Trung cấp' }),
  Object.freeze({ id: 'advanced', label: 'Nâng cao' }),
]);

/** Kiểu tập. Với Tăng cơ · Mới tập (2026-11-03): Tổng quát và Chuyên sâu. */
export const STYLES = Object.freeze([
  Object.freeze({ id: 'general', label: 'Tổng quát' }),
  Object.freeze({ id: 'specialized', label: 'Chuyên sâu' }),
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

// Các slot dùng chung. Số set là set MỖI LẦN slot xuất hiện trong một buổi.
const compound = (id, label, muscle, patterns, note) => ({
  id, label, muscleGroups: [muscle], patterns,
  sets: { min: 2, max: 2 }, reps: { min: 6, max: 12 }, rir: { min: 0, max: 2 }, note,
});
const isolation = (id, label, muscle, patterns, note = '') => ({
  id, label, muscleGroups: [muscle], patterns,
  sets: { min: 2, max: 2 }, reps: { min: 8, max: 15 }, rir: { min: 0, max: 2 }, restSeconds: 90, note,
});

const SQUAT = compound('squat', 'Đùi trước · squat', 'Đùi trước', ['compound_knee', 'accessory_knee'],
  'Người mới ưu tiên máy: Leg Press, Hack Squat. Squat tạ đòn khi khách đã sẵn sàng học.');
const HINGE = compound('hinge', 'Đùi sau & mông · hinge', 'Đùi sau & Mông', ['compound_hip', 'accessory_hip'],
  'Romanian deadlift là lựa chọn chính: ít bài máy đa khớp cho đùi sau.');
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

/**
 * Quy tắc theo tổ hợp, khoá là "mục tiêu.cấp độ.kiểu".
 * Mỗi tổ hợp gồm:
 *   slots: các "chỗ" trong giáo án, mỗi chỗ là một nhóm cơ hoặc dạng chuyển động
 *   weeklyTargets: khoảng set/tuần mong muốn theo nhóm cơ (để so với kế hoạch)
 *   splits: (tuỳ chọn) cách chia buổi riêng cho tổ hợp này, ghi đè SPLITS bên dưới
 *   note: lời của David cho tổ hợp này (hiện cho coach, để trống thì ẩn)
 */
export const DOSE_RULES = Object.freeze({
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
});

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
