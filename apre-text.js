// ============================================================
// DAVID COACHING — APRE (kiểu 10) viết cho người đọc
// ============================================================
// Thuần: không DOM, không Firebase. Coach và màn hình tập cùng đọc một kiểu câu.
import { fmtDate, fmtNumber, t } from './i18n.js';
import { SCHEME, getInitialPrescription } from './progression-engine.js';

const kg = (value) => fmtNumber(Math.round(Number(value) * 100) / 100);
const shortDay = (iso) => fmtDate(iso);

/** Dòng tóm tắt cho coach: "60 kg × 3 set × 6 rep · set cuối tối đa · đổi tạ theo tuần · từ 16/11: 62,5 kg". */
export function apreCoachSummary(assignment, per = '', today = null) {
  if (Number(assignment?.scheme) !== SCHEME.APRE) return '';
  const rx = getInitialPrescription({ scheme: SCHEME.APRE, schemeParams: assignment.schemeParams || {}, state: assignment.state || {}, today });
  const load = rx.weight > 0 ? `${kg(rx.weight)} kg${per}` : t('apre.noLoad');
  const next = rx.nextWeekWeight ? t('apre.fromDate', { date: shortDay(rx.nextWeekFrom), kg: kg(rx.nextWeekWeight), per }) : '';
  return t('apre.coachSummary', { load, sets: rx.sets, reps: rx.reps, next });
}

/** Dòng "Hôm nay" trên màn hình tập. `load` là mức tạ đã viết sẵn (kèm "mỗi bên" nếu có). */
export function apreTodayLine(planned, load) {
  return t('apre.today', { load, sets: planned.sets, reps: planned.reps });
}

/** Kết quả sau buổi: "Plus Set 8 rep (+2) → tuần sau 62,5 kg" / "→ giữ 60 kg", và ngày áp dụng khi đang giữa tuần. */
export function apreResultText(delta, per = '') {
  if (!delta) return '';
  const from = delta.appliesFrom ? t('apre.appliesFrom', { date: shortDay(delta.appliesFrom) }) : '';
  if (delta.action === 'no_load') return t('apre.noLoadLogged');
  if (delta.action === 'no_plus') return t('apre.noPlus', { kg: kg(delta.newWeight), per, from });
  const sign = delta.repDelta > 0 ? `+${delta.repDelta}` : delta.repDelta < 0 ? `−${Math.abs(delta.repDelta)}` : '±0';
  if (delta.newWeight === delta.priorWeight) return t('apre.resultHold', { reps: delta.plusReps, sign, kg: kg(delta.newWeight), per });
  return t('apre.result', { reps: delta.plusReps, sign, kg: kg(delta.newWeight), per, from });
}
