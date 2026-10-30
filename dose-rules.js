// ============================================================
// DAVID COACHING — Quy tắc của David cho Bộ dựng giáo án
// ============================================================
// File này là NƠI DUY NHẤT chứa con số và lời giải thích của Bộ dựng giáo án
// (dose-planner.html). Công cụ chỉ giao KHUNG; mọi giá trị do David quyết định.
// Hiện tại tất cả để TRỐNG: công cụ sẽ báo "David chưa nhập quy tắc cho tổ hợp
// này" và không bao giờ tự bịa số.
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

/** Kiểu tập: nhãn do David đặt (ví dụ "Gọn nhẹ", "Chuyên sâu"). Đổi nhãn và thêm bớt tuỳ ý. */
export const STYLES = Object.freeze([
  Object.freeze({ id: 'style1', label: 'Kiểu 1' }),
  Object.freeze({ id: 'style2', label: 'Kiểu 2' }),
  Object.freeze({ id: 'style3', label: 'Kiểu 3' }),
]);

/**
 * Quy tắc theo tổ hợp, khoá là "mục tiêu.cấp độ.kiểu" (ví dụ 'muscle.beginner.style1').
 * Mỗi tổ hợp gồm:
 *   slots: các "chỗ" trong giáo án, mỗi chỗ là một nhóm cơ hoặc dạng chuyển động
 *   weeklyTargets: khoảng set/tuần mong muốn theo nhóm cơ (để so với kế hoạch)
 *   splits: (tuỳ chọn) cách chia buổi riêng cho tổ hợp này, ghi đè SPLITS bên dưới
 *   note: lời của David cho tổ hợp này (hiện cho coach, để trống thì ẩn)
 */
export const DOSE_RULES = Object.freeze({});

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
