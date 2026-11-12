// ============================================================
// DAVID COACHING — APRE (kiểu 10) viết cho người đọc
// ============================================================
// Thuần: không DOM, không Firebase. Coach và màn hình tập cùng đọc một kiểu câu.
import { SCHEME, getInitialPrescription } from './progression-engine.js';

const kg = (value) => String(Math.round(Number(value) * 100) / 100).replace('.', ',');
const shortDay = (iso) => {
  const [, m, d] = String(iso || '').split('-');
  return m && d ? `${d}/${m}` : '';
};

/** Dòng tóm tắt cho coach: "60 kg × 3 set × 6 rep · set cuối tối đa · đổi tạ theo tuần · từ 16/11: 62,5 kg". */
export function apreCoachSummary(assignment, per = '', today = null) {
  if (Number(assignment?.scheme) !== SCHEME.APRE) return '';
  const rx = getInitialPrescription({ scheme: SCHEME.APRE, schemeParams: assignment.schemeParams || {}, state: assignment.state || {}, today });
  const load = rx.weight > 0 ? `${kg(rx.weight)} kg${per}` : 'Chưa có mức tạ';
  const next = rx.nextWeekWeight ? ` · từ ${shortDay(rx.nextWeekFrom)}: ${kg(rx.nextWeekWeight)} kg${per}` : '';
  return `${load} × ${rx.sets} set × ${rx.reps} rep · set cuối tối đa · đổi tạ theo tuần${next}`;
}

/** Dòng "Hôm nay" trên màn hình tập. `load` là mức tạ đã viết sẵn (kèm "mỗi bên" nếu có). */
export function apreTodayLine(planned, load) {
  return `Hôm nay: <strong>${load}</strong> — ${planned.sets} set × ${planned.reps} rep, set cuối tập tối đa (<strong>Plus Set</strong>). Dừng khi kỹ thuật không còn đạt chuẩn. Số rep Plus Set quyết định mức tạ tuần sau.`;
}

/** Kết quả sau buổi: "Plus Set 8 rep (+2) → tuần sau 62,5 kg" / "→ giữ 60 kg", và ngày áp dụng khi đang giữa tuần. */
export function apreResultText(delta, per = '') {
  if (!delta) return '';
  const from = delta.appliesFrom ? ` (áp dụng từ thứ Hai ${shortDay(delta.appliesFrom)})` : '';
  if (delta.action === 'no_load') return 'Chưa ghi mức tạ — buổi sau tự chọn tạ qua set khởi động';
  if (delta.action === 'no_plus') return `Chưa có Plus Set mới → tuần sau ${kg(delta.newWeight)} kg${per}${from}`;
  const sign = delta.repDelta > 0 ? `+${delta.repDelta}` : delta.repDelta < 0 ? `−${Math.abs(delta.repDelta)}` : '±0';
  if (delta.newWeight === delta.priorWeight) return `Plus Set ${delta.plusReps} rep (${sign}) → tuần sau giữ ${kg(delta.newWeight)} kg${per}`;
  return `Plus Set ${delta.plusReps} rep (${sign}) → tuần sau ${kg(delta.newWeight)} kg${per}${from}`;
}
