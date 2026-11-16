// Dòng "kết quả" của một bài sau buổi tập, viết theo ngôn ngữ đang dùng.
// resultBucket được LƯU trong buổi tập (Firestore) đúng như lúc tạo: câu tiếng Việt của app,
// hoặc nhãn tiếng Anh của bảng tính gốc (kiểu 2). Dữ liệu giữ nguyên; file này chỉ đổi chữ hiện ra.
// Các câu tiếng Việt dưới đây là dữ liệu đã lưu, không phải chữ giao diện (i18n-data).
import { COMPLETION_REASON_OPTIONS, completionReasonText } from './coaching-decision-utils.js';
import { t } from './i18n.js';

export const BUCKET_SKIPPED = 'Bỏ qua do thể trạng — không ảnh hưởng tiến trình';
export const BUCKET_CONTEXT_HOLD = 'Giữ nguyên tiến độ theo bối cảnh buổi tập';
export const BUCKET_FEWER_SETS = 'Giảm set theo thể trạng — giữ nguyên tiến độ';
export const BUCKET_SAFETY_HOLD = 'Đang giữ progression — chờ David xem';
export const BUCKET_REASON_SUFFIX = ' — giữ nguyên progression';

const STORED = Object.freeze({
  [BUCKET_SKIPPED]: 'bucket.skipped',
  [BUCKET_CONTEXT_HOLD]: 'bucket.contextHold',
  [BUCKET_FEWER_SETS]: 'bucket.fewerSets',
  [BUCKET_SAFETY_HOLD]: 'bucket.safetyHold',
  // Nhãn tiếng Anh của bảng tính gốc (kiểu 2).
  '2+ fewer sets completed': 'workout.bucket.fewer2',
  '1 fewer set completed or last set below RIR target': 'workout.bucket.fewer1',
  'Set target completed; last at RIR target': 'workout.bucket.atTarget',
  '1 above RIR target': 'workout.bucket.above1',
  '2 above RIR target': 'workout.bucket.above2',
  '3+ above RIR target': 'workout.bucket.above3',
});

/** Chữ hiện ra cho một resultBucket đã lưu. Câu lạ: giữ nguyên. */
export function resultBucketText(stored) {
  const text = String(stored ?? '');
  if (STORED[text]) return t(STORED[text]);
  if (text.endsWith(BUCKET_REASON_SUFFIX)) {
    const label = text.slice(0, -BUCKET_REASON_SUFFIX.length);
    const option = COMPLETION_REASON_OPTIONS.find((item) => item.label === label);
    if (option) return t('bucket.reasonHold', { reason: completionReasonText(option.value) });
  }
  return text;
}
