// Dòng "kết quả" của một bài sau buổi tập, viết theo ngôn ngữ đang dùng.
// resultBucket được LƯU trong buổi tập (Firestore) đúng như lúc tạo: câu tiếng Việt của app,
// hoặc nhãn tiếng Anh của bảng tính gốc (kiểu 2). Dữ liệu giữ nguyên; file này chỉ đổi chữ hiện ra.
// Các câu tiếng Việt dưới đây là dữ liệu đã lưu, không phải chữ giao diện (i18n-data).
import { COMPLETION_REASON_OPTIONS, completionReasonText } from './coaching-decision-utils.js';
import { t, getLang } from './i18n.js';

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
  // Câu cố định của progression-engine.js (i18n-data).
  'Thấp hơn ngưỡng dưới từ 2 set': 'bucket.e.sch1.below2',
  'Thấp hơn ngưỡng dưới 1 set': 'bucket.e.sch1.below1',
  'Nằm trong khung set mục tiêu': 'bucket.e.sch1.within',
  'Vượt ngưỡng trên 1 set': 'bucket.e.sch1.above1',
  'Vượt ngưỡng trên 2 set': 'bucket.e.sch1.above2',
  'Vượt ngưỡng trên 3 set': 'bucket.e.sch1.above3',
  'Vượt ngưỡng trên từ 4 set': 'bucket.e.sch1.above4',
  'missed target reps': 'bucket.e.missed',
  'Đạt đủ rep mọi set — lần sau thêm set': 'bucket.e.addSets',
  'Đạt đủ rep mọi set — lần sau tăng rep, hoàn thành một vòng tăng set/rep; David sẽ điều chỉnh độ khó khi cần': 'bucket.e.cycleDone',
  'Đạt đủ rep mọi set — lần sau tăng rep': 'bucket.e.addReps',
  'Đạt đủ rep mọi set — lần sau tăng tạ, quay về số set và rep ban đầu': 'bucket.e.addWeightReset',
  'Chưa hoàn thành đủ set và rep — giữ nguyên tạ': 'bucket.e.holdLoad',
  'Hoàn thành đủ set và rep — lần sau tăng tạ': 'bucket.e.addLoad',
  'Chưa hoàn thành đủ set và rep — giữ nguyên': 'bucket.e.hold',
  'Chưa ghi mức tạ — buổi sau tự chọn tạ qua set khởi động và ghi lại số kg': 'bucket.e.noLoad',
  'Chưa đủ rep ở mọi set — buổi sau giữ nguyên tạ và rep': 'bucket.e.holdLoadReps',
  'Chưa set nào đạt rep mục tiêu — giữ nguyên từng mức tạ': 'bucket.e.rpNone',
  'Chưa đủ set hoặc chưa ghi Plus Set — giữ kết quả buổi trước trong tuần': 'bucket.e.apreKeepPrev',
  'Chưa đủ set hoặc chưa ghi Plus Set — tuần sau giữ nguyên mức tạ': 'bucket.e.apreHold',
  'Thấp hơn rep-out target từ 2 rep': 'bucket.e.ro.below2',
  'Thấp hơn rep-out target 1 rep': 'bucket.e.ro.below1',
  'Đạt rep-out target': 'bucket.e.ro.at',
  'Vượt rep-out target 1 rep': 'bucket.e.ro.above1',
  'Vượt rep-out target 2 rep': 'bucket.e.ro.above2',
  'Vượt rep-out target 3 rep': 'bucket.e.ro.above3',
  'Vượt rep-out target 4 rep': 'bucket.e.ro.above4',
  'Vượt rep-out target từ 5 rep': 'bucket.e.ro.above5',
  'Plus Set ít hơn mục tiêu từ 4 rep': 'bucket.e.plus.below4',
  'Plus Set ít hơn mục tiêu 2–3 rep': 'bucket.e.plus.below2',
  'Plus Set ít hơn mục tiêu 1 rep': 'bucket.e.plus.below1',
  'Plus Set đạt đúng mục tiêu': 'bucket.e.plus.at',
  'Plus Set nhiều hơn mục tiêu 1 rep': 'bucket.e.plus.above1',
  'Plus Set nhiều hơn mục tiêu 2 rep': 'bucket.e.plus.above2',
  'Plus Set nhiều hơn mục tiêu 3 rep': 'bucket.e.plus.above3',
  'Plus Set nhiều hơn mục tiêu từ 4 rep': 'bucket.e.plus.above4',
});

// Câu có số của progression-engine.js: a, b, c là các số trong câu đã lưu (i18n-data).
const STORED_PATTERNS = Object.freeze([
  [/^Tổng (\d+)\/(\d+) rep — giữ nguyên tạ$/, 'bucket.e.totalHold'],
  [/^Đạt (\d+)\/(\d+) rep — lần sau tăng tạ$/, 'bucket.e.totalUp'],
  [/^Hoàn thành mục tiêu — lần sau tăng lên (\d+) set$/, 'bucket.e.toSets'],
  [/^Đạt đủ (\d+) set — lần sau tăng lên (\d+) rep và quay về (\d+) set$/, 'bucket.e.toReps'],
  [/^Đủ (\d+) rep ở mọi set — David sẽ tăng độ khó$/, 'bucket.e.bwCap'],
  [/^Đủ rep — tăng lên ([\d,]+) kg, về (\d+) rep$/, 'bucket.e.dpUp'],
  [/^Đủ rep — buổi sau thêm 1 rep \((\d+) rep\)$/, 'bucket.e.dpRep'],
  [/^Đủ (\d+) rep nhưng set cuối còn ít hơn (\d+) rep dự trữ — giữ tạ thêm một buổi$/, 'bucket.e.dpEffort'],
  [/^(\d+)\/(\d+) set đạt mục tiêu — chỉ tăng tạ ở set đã đạt$/, 'bucket.e.rpSome'],
]);

/** Chữ hiện ra cho một resultBucket đã lưu. Câu lạ: giữ nguyên. */
export function resultBucketText(stored) {
  const text = String(stored ?? '');
  if (STORED[text]) return t(STORED[text]);
  for (const [pattern, key] of STORED_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    // Số thập phân đã lưu theo kiểu Việt (62,5); tiếng Anh dùng dấu chấm.
    const num = (value) => (value !== undefined && getLang() === 'en' ? value.replace(',', '.') : value);
    return t(key, { a: num(match[1]), b: num(match[2]), c: num(match[3]) });
  }
  if (text.endsWith(BUCKET_REASON_SUFFIX)) {
    const label = text.slice(0, -BUCKET_REASON_SUFFIX.length);
    const option = COMPLETION_REASON_OPTIONS.find((item) => item.label === label);
    if (option) return t('bucket.reasonHold', { reason: completionReasonText(option.value) });
  }
  return text;
}
