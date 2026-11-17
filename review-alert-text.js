// Chữ của các cảnh báo "Cần xem lại" theo ngôn ngữ đang dùng.
// Cảnh báo do máy chủ (functions/review-alert-builder.js, progression-review-core.js) tạo và LƯU
// trong Firestore bằng tiếng Việt. Dữ liệu giữ nguyên; file này chỉ đổi chữ hiện ra: so câu đã lưu
// với các mẫu câu bên dưới (và các mẫu cj.* có sẵn trong từ điển), lấy các giá trị ({a}, {b}…)
// rồi ghép vào câu tiếng Anh. Câu không khớp mẫu nào (ghi chú học viên tự gõ…) giữ nguyên.
import { getLang, t } from './i18n.js';

// Mẫu câu của review-alert-builder.js (i18n-data: phải trùng đúng câu máy chủ ghi).
const ALERT_PATTERNS = Object.freeze([
  ['Bỏ bài · {a}', 'Skipped exercise · {a}'], // i18n-data
  ['{a}: học viên đã bỏ bài.', '{a}: the client skipped the exercise.'], // i18n-data
  ['Giảm set · {a}', 'Fewer sets · {a}'], // i18n-data
  ['{a}: {b}/{c} set kế hoạch.', '{a}: {b}/{c} planned sets.'], // i18n-data
  ['Đau/khó chịu · {a}', 'Pain/discomfort · {a}'], // i18n-data
  ['{a}: progression của bài cần được giữ để David xem lại.', '{a}: progression for this exercise is held for David to review.'], // i18n-data
  ['Progression đang giữ · {a}', 'Progression on hold · {a}'], // i18n-data
  ['{a}: bài chưa được phép tự tăng tiến.', '{a}: this exercise is not yet allowed to progress automatically.'], // i18n-data
  ['Rep-out cần xem lại · {a}', 'Rep-out to review · {a}'], // i18n-data
  ['{a}: dự đoán {b} RIR nhưng thực tế còn {c} rep; lệch {d}. Hệ thống không tự sửa giáo án.', '{a}: predicted {b} RIR but {c} reps were left; off by {d}. The system does not change the program by itself.'], // i18n-data
  ['Trao đổi lại cách ước lượng RIR; David quyết định có hiệu chỉnh Training Max hoặc độ khó hay không.', 'Go over how RIR is estimated; David decides whether to adjust the Training Max or the difficulty.'], // i18n-data
  ['Kết thúc sớm · {a}', 'Ended early · {a}'], // i18n-data
  ['Học viên kết thúc buổi trước khi hoàn thành toàn bộ kế hoạch.', 'The client ended the session before finishing the whole plan.'], // i18n-data
  ['Dữ liệu cần kiểm tra · {a}', 'Data to check · {a}'], // i18n-data
  ['Thời lượng ghi nhận {a} phút.', 'Logged duration {a} minutes.'], // i18n-data
  ['Buổi tập có dữ liệu thiếu hoặc trùng.', 'The session has missing or duplicate data.'], // i18n-data
  ['Hiệu suất giảm · {a}', 'Performance drop · {a}'], // i18n-data
  ['{a} bài giảm hiệu suất ở hai lần xuất hiện gần nhau.', '{a} exercises dropped in performance in two close appearances.'], // i18n-data
  ['Có từ 2 bài giảm hiệu suất trong cùng buổi.', '2 or more exercises dropped in performance in the same session.'], // i18n-data
  ['Thiếu RIR hai lần · {a}', 'RIR missing twice · {a}'], // i18n-data
  ['RIR thấp hơn kế hoạch · {a}', 'RIR below plan · {a}'], // i18n-data
  ['RIR cao hơn kế hoạch · {a}', 'RIR above plan · {a}'], // i18n-data
  ['RIR chưa ổn định · {a}', 'RIR not yet stable · {a}'], // i18n-data
  ['RIR cần kiểm tra · {a}', 'RIR to check · {a}'], // i18n-data
  ['Hiệu chỉnh RIR · {a}', 'RIR calibration · {a}'], // i18n-data
  ['Hai lần tập liên tiếp chưa có RIR set cuối hợp lệ.', 'Two sessions in a row without a valid last-set RIR.'], // i18n-data
  ['Lần gần nhất: kế hoạch {a} RIR · thực tế {b} RIR · lệch {c}.', 'Latest: planned {a} RIR · actual {b} RIR · off by {c}.'], // i18n-data
  ['Hệ thống chỉ đề xuất để David xem lại; không tự sửa giáo án.', 'The system only suggests this for David to review; it does not change the program.'], // i18n-data
  ['Đau khớp từ check-in', 'Joint pain from check-in'], // i18n-data
  ['Mức đau khớp {a}/3. Không đề xuất tăng volume trước khi David xem lại.', 'Joint pain level {a}/3. No volume increase suggested before David reviews it.'], // i18n-data
  ['Phản hồi · {a}', 'Feedback · {a}'], // i18n-data
  ['Training Max biến động lớn', 'Large Training Max change'], // i18n-data
  ['David đã chỉnh Training Max {a} → {b} ({c}%). Hãy kiểm tra lại bối cảnh.', 'David changed the Training Max {a} → {b} ({c}%). Check the context.'], // i18n-data
  ['Deload · ưu tiên xem ngay · {a}', 'Deload · review now · {a}'], // i18n-data
  ['Nên cân nhắc deload · {a}', 'Consider a deload · {a}'], // i18n-data
  ['{a} cảnh báo đau chưa xử lý', '{a} unresolved pain alerts'], // i18n-data
  ['{a} buổi gần nhất có hiệu suất giảm', '{a} recent sessions with a performance drop'], // i18n-data
  ['{a} check-in phục hồi kém', '{a} poor recovery check-ins'], // i18n-data
  ['{a} buổi giảm set, bỏ bài hoặc kết thúc sớm', '{a} sessions with fewer sets, skipped exercises or an early finish'], // i18n-data
  ['{a} bài lệch từ 2 RIR trong hai lần liên tiếp', '{a} exercises off by 2+ RIR twice in a row'], // i18n-data
  ['Hệ thống chỉ đề xuất; David quyết định cuối cùng.', 'The system only suggests; David makes the final call.'], // i18n-data
  ['Mở hồ sơ học viên để xem dữ liệu và ghi quyết định deload.', 'Open the client profile to see the data and record the deload decision.'], // i18n-data
  ['Chu kỳ đã quá ngày kết thúc · {a}', 'Cycle past its end date · {a}'], // i18n-data
  ['Chu kỳ sắp kết thúc · {a}', 'Cycle ending soon · {a}'], // i18n-data
  ['Đã quá {a} ngày và chưa có tổng kết được khóa.', '{a} days past, and no review has been locked.'], // i18n-data
  ['Còn {a} ngày. Hãy chuẩn bị tổng kết trước khi chuyển chu kỳ.', '{a} days left. Prepare the review before switching cycles.'], // i18n-data
  ['Chu kỳ mới sẽ bị chặn cho đến khi tổng kết hiện tại được xác nhận và khóa.', 'A new cycle is blocked until the current review is confirmed and locked.'], // i18n-data
  ['{a} ngày chưa tập', '{a} days without training'], // i18n-data
  ['Buổi gần nhất: {a} · Buổi {b}. Một tin nhắn hỏi thăm lúc này thường đủ để học viên quay lại.', 'Last session: {a} · Workout {b}. A check-in message now is usually enough to bring the client back.'], // i18n-data
  ['Buổi gần nhất: {a}. Một tin nhắn hỏi thăm lúc này thường đủ để học viên quay lại.', 'Last session: {a}. A check-in message now is usually enough to bring the client back.'], // i18n-data
  ['{a} ngày chưa ghi dinh dưỡng', '{a} days without a nutrition log'], // i18n-data
  ['Lần ghi gần nhất: {a}. Hỏi xem học viên vướng ở đâu (quên, bận, khó ghi) trước khi học viên bỏ hẳn.', 'Last log: {a}. Ask where the client is stuck (forgetting, busy, hard to log) before they give up.'], // i18n-data
  ['Chưa ghi dinh dưỡng lần nào', 'No nutrition log yet'], // i18n-data
  ['Kế hoạch gửi ngày {a}, {b} ngày chưa ghi bữa nào. Hướng dẫn học viên ghi bữa đầu tiên ngay trên điện thoại.', 'Plan sent on {a}, {b} days without logging a meal. Walk the client through logging their first meal on their phone.'], // i18n-data
  ['Giảm · {a}', 'Declining · {a}'], // i18n-data
  ['Chững · {a}', 'Stalled · {a}'], // i18n-data
]);

// Mẫu câu tiến bộ / RIR có sẵn trong từ điển (progression-review-core.js và rir-calibration-engine.js
// ghi đúng các câu này bằng tiếng Việt ở máy chủ).
const DICT_KEYS = Object.freeze([
  'cj.3_lan_tap_chua_vuot_lan', 'cj.moi_co_lan_tap_can_tu', 'cj.tb_2_lan_gan_nhat_thap', 'cj.3_lan_gan_nhat_chua_vuot',
  'cj.tu_len_cao_nhat', 'cj.gan_day_co_lan_giam_set', 'cj.xem_phuc_hoi_can_nhac_tang', 'cj.xem_phuc_hoi_va_rir_can',
  'cj.xem_dau_ngu_dinh_duong_va', 'cj.chua_co_lan_tap_nao_duoc', 'cj.kiem_tra_lai_du_lieu_rir', 'cj.trao_doi_lai_cach_ghi_rir',
  'cj.xem_lai_cach_danh_gia_rir', 'cj.xem_lai_cach_danh_gia_rir_2', 'cj.rir_dang_dao_dong_hai_huong',
]);

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function compile(vi) {
  const names = [];
  const source = escapeRe(vi).replace(/\\\{(\w+)\\\}/g, (_, name) => { names.push(name); return '((?:(?!\\.\\s).)*?)'; });
  return { re: new RegExp(`^${source}$`, 's'), names };
}
const fill = (template, values) => String(template).replace(/\{(\w+)\}/g, (whole, name) => (name in values ? values[name] : whole));

let compiled = null;
function patterns() {
  if (compiled) return compiled;
  const fromDict = DICT_KEYS.map((key) => [t(key, {}, 'vi'), (values) => t(key, values, 'en')]);
  const own = ALERT_PATTERNS.map(([vi, en]) => [vi, (values) => fill(en, values)]);
  // Mẫu dài và cụ thể thử trước mẫu ngắn.
  compiled = [...own, ...fromDict]
    .filter(([vi]) => vi && !vi.startsWith('cj.'))
    .sort((a, b) => b[0].length - a[0].length)
    .map(([vi, render]) => ({ ...compile(vi), render }));
  return compiled;
}

function matchOne(text) {
  for (const { re, names, render } of patterns()) {
    const m = text.match(re);
    if (m) return render(Object.fromEntries(names.map((name, i) => [name, m[i + 1]])));
  }
  return null;
}

/** Câu tiếng Anh cho một câu cảnh báo đã lưu (tiêu đề, tóm tắt, ghi chú). Tiếng Việt: giữ nguyên. */
export function reviewAlertText(stored, lang = getLang()) {
  const text = String(stored ?? '');
  if (lang !== 'en' || !text.trim()) return text;
  const whole = matchOne(text);
  if (whole !== null) return whole;
  // Câu ghép: tách theo câu, rồi theo dấu " · ", dịch từng mảnh khớp mẫu.
  const sentences = text.split(/(?<=\.)\s+/);
  if (sentences.length > 1) {
    const parts = sentences.map((s) => matchOne(s) ?? reviewAlertPieces(s));
    return parts.join(' ');
  }
  return reviewAlertPieces(text);
}

function reviewAlertPieces(text) {
  const tail = text.endsWith('.') ? '.' : '';
  const body = tail ? text.slice(0, -1) : text;
  const pieces = body.split(' · ');
  if (pieces.length < 2) return text;
  const out = pieces.map((piece) => matchOne(piece) ?? matchOne(`${piece}.`)?.replace(/\.$/, '') ?? piece);
  return out.join(' · ') + tail;
}
