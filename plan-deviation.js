// ============================================================
// DAVID COACHING — Bài học viên hay tập khác giáo án (David, 2026-11-12)
// ============================================================
// Thuần: không DOM, không Firebase. Trang HLV → học viên → Theo dõi → Đánh giá progression: mỗi
// bài một dòng khi học viên tập nặng hơn hoặc nhẹ hơn số giáo án ít nhất 2 trong 4 lần gần nhất
// (cùng chiều). Giúp David thấy giáo án đặt quá nặng hay quá nhẹ cho bài nào.
// So số giáo án của buổi đó (log.planned) với mức đã tập (mức có nhiều set nhất). Kim tự tháp
// ngược so set đầu. Bỏ qua: bài bỏ qua, bài thay thế, bài không có tạ, số lệch quá xa (gõ nhầm).

import { performedWorkingWeight, LOAD_REBASE_MIN_RATIO, LOAD_REBASE_MAX_RATIO } from './workout-session-utils.js';

export const DEVIATION_WINDOW = 4;
export const DEVIATION_MIN = 2;
export const DEVIATION_LABEL = Object.freeze({
  heavier: 'Hay tập nặng hơn giáo án',
  lighter: 'Hay tập nhẹ hơn giáo án',
  both: 'Hay tập lệch giáo án, lúc nặng lúc nhẹ',
});

const VN_OFFSET_MS = 7 * 3600 * 1000;
function timestampMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}
const kgText = (value) => String(Math.round(Number(value) * 100) / 100).replace('.', ',');
const shortDay = (ms) => {
  const iso = new Date(ms + VN_OFFSET_MS).toISOString();
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
};

/** Một lần tập so với giáo án: { planned, actual, dir: 'heavier'|'lighter'|'same' } hoặc null khi không so được. */
export function exposureDeviation(log) {
  if (!log || log.outcome === 'skipped' || log.status === 'skipped' || log.substitutedExerciseId) return null;
  const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
  const pyramid = Array.isArray(log.planned?.setPrescriptions) && log.planned.setPrescriptions.length;
  const planned = Number(pyramid ? log.planned.setPrescriptions[0]?.weight : log.planned?.weight) || 0;
  const actual = pyramid ? Number(sets[0]?.weight) || 0 : performedWorkingWeight(sets) || 0;
  if (!(planned > 0) || !(actual > 0)) return null;
  const ratio = actual / planned;
  if (ratio < LOAD_REBASE_MIN_RATIO || ratio > LOAD_REBASE_MAX_RATIO) return null;
  const dir = actual > planned ? 'heavier' : actual < planned ? 'lighter' : 'same';
  return { planned, actual, dir };
}

/**
 * @param sessions buổi tập (thứ tự bất kỳ), mỗi buổi { performedAt, exerciseLogs }
 * @returns Map exerciseId → { flag: 'heavier'|'lighter'|'both'|null, label, recent (cũ trước),
 *   heavier, lighter, text }
 */
export function planDeviations(sessions = [], { window = DEVIATION_WINDOW, min = DEVIATION_MIN } = {}) {
  const byId = new Map();
  [...sessions]
    .map((session) => ({ session, ms: timestampMs(session?.performedAt || session?.loggedAt) }))
    .filter((item) => item.ms > 0)
    .sort((a, b) => a.ms - b.ms)
    .forEach(({ session, ms }) => {
      (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []).forEach((log) => {
        const id = String(log?.exerciseId || '').trim();
        const deviation = id ? exposureDeviation(log) : null;
        if (!deviation) return;
        const list = byId.get(id) || [];
        list.push({ ...deviation, ms, day: shortDay(ms) });
        byId.set(id, list);
      });
    });
  const result = new Map();
  byId.forEach((all, id) => {
    const recent = all.slice(-window);
    const heavier = recent.filter((item) => item.dir === 'heavier').length;
    const lighter = recent.filter((item) => item.dir === 'lighter').length;
    const flag = heavier >= min && lighter >= min ? 'both' : heavier >= min ? 'heavier' : lighter >= min ? 'lighter' : null;
    const off = recent.filter((item) => item.dir !== 'same');
    const parts = [];
    if (heavier) parts.push(`${heavier} lần nặng hơn`);
    if (lighter) parts.push(`${lighter} lần nhẹ hơn`);
    const detail = off.slice(-3).map((item) => `${item.day}: giáo án ${kgText(item.planned)} → tập ${kgText(item.actual)}`).join(' · ');
    result.set(id, {
      flag,
      label: flag ? DEVIATION_LABEL[flag] : '',
      recent,
      heavier,
      lighter,
      text: flag ? `${recent.length} lần gần nhất: ${parts.join(', ')}. ${detail} (kg).` : '',
    });
  });
  return result;
}
