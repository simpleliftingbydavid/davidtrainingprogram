// Chữ tiếng Việt cho trang Mẫu giáo án (audit UX/UI 2026-11-13).
// Dữ liệu gốc trong templates.html giữ nguyên văn tiếng Anh của sách; file này chỉ đổi cách hiển thị.
// Tên bài tập cụ thể (Leg Extension, Dips…) giữ tiếng Anh như phần còn lại của app.
// Số set, rep, RIR không đổi. Chuỗi không nhận ra thì trả lại nguyên văn.

const NUMBERED = /^(.*?)(?: (\d))?(\*)?$/;

const CHOICES = Object.freeze({
  'Squat Variant': 'một biến thể squat',
  'Hip Hinge Variant': 'một biến thể hip hinge (gập hông)',
  'Leg Press Variant': 'một biến thể leg press',
  'Calf Raise Variation': 'một biến thể calf raise (bắp chân)',
  'Pullover Variation': 'một biến thể pullover',
  'Shrug Variation': 'một biến thể shrug',
  'Incline Press': 'một bài đẩy ngực dốc lên',
  'Horizontal Press': 'một bài đẩy ngang',
  'Vertical Press': 'một bài đẩy dọc',
  'Horizontal Pull': 'một bài kéo ngang',
  'Close-Grip Horizontal Pull': 'một bài kéo ngang, tay nắm hẹp',
  'Wide-Grip Horizontal Pull': 'một bài kéo ngang, tay nắm rộng',
  'Vertical Pull': 'một bài kéo dọc',
  'Neutral-Grip Vertical Pull': 'một bài kéo dọc, tay nắm trung tính',
  'Lateral Raise': 'một bài nâng tạ ngang (lateral raise)',
  'Rear Delt Fly': 'một bài vai sau (rear delt fly)',
  'Triceps Isolation': 'một bài cô lập tay sau',
  'Biceps Isolation': 'một bài cô lập tay trước',
  'Hip Thrust': 'một bài hip thrust',
  'Rear Foot Elevated Split Squat': 'một bài split squat kê chân sau',
});

const FIXED = Object.freeze({
  'Abs of Choice': 'Bài bụng tự chọn',
  'Cable Pullover or Lat Pushdown': 'Cable Pullover hoặc Lat Pushdown',
});

/** "Choose Squat Variant" → "Chọn một biến thể squat"; tên bài cụ thể giữ nguyên. */
export function slotLabelVi(name) {
  const text = String(name ?? '').trim();
  const [, base = text, number = '', star = ''] = text.match(NUMBERED) || [];
  if (FIXED[base]) return `${FIXED[base]}${number ? ` ${number}` : ''}${star}`;
  if (!base.startsWith('Choose ')) return text;
  const choice = CHOICES[base.slice('Choose '.length)];
  return choice ? `Chọn ${choice}${number ? ` (${number})` : ''}${star}` : text;
}

/** "3x10–20 @1>failure" → "3x10–20 @1>thất bại". Các con số giữ nguyên. */
export function prescriptionVi(rx) {
  return String(rx ?? '').replace(/>\s*failure/g, '>thất bại');
}

/** "The MSP3 Bodybuilding 2-Day Program" → "Chương trình tăng cơ MSP3 · 2 buổi". */
export function programTitleVi(title) {
  const match = String(title ?? '').match(/^The MSP3 Bodybuilding (\d)-Day Program$/);
  return match ? `Chương trình tăng cơ MSP3 · ${match[1]} buổi` : String(title ?? '');
}

const SUBTITLES = Object.freeze({
  'Used during periods of minimal time.': 'Dùng cho giai đoạn có rất ít thời gian tập.',
});
export function programSubtitleVi(subtitle) {
  return SUBTITLES[subtitle] || String(subtitle ?? '');
}
