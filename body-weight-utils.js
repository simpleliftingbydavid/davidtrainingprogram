// ============================================================
// DAVID COACHING — Một số cân mỗi ngày
// ============================================================
// Thuần: không DOM, không Firebase. Ngày là ngày lịch Việt Nam, như cả app (dayOf).
// David chốt 2026-11-10: ghi lại trong cùng một ngày thì sửa lần cân của ngày đó, không thêm
// bản mới; lịch sử hiện 1 số mỗi ngày. Bản trùng cũ vẫn nằm trong dữ liệu, chỉ không hiện.

import { dayOf, toDate } from './home-utils.js';

const timeOf = (log) => toDate(log?.loggedAt)?.getTime() ?? 0;
const validWeight = (log) => Number.isFinite(Number(log?.weight)) && Number(log.weight) > 0;

/** Lần cân cuối của ngày `day` (YYYY-MM-DD) có id để sửa, hoặc null. Không dựa vào thứ tự đọc
 *  về, vì bản ghi cũ có loggedAt là chuỗi và Firestore xếp chuỗi khác với mốc thời gian. */
export function logOnDay(logs = [], day) {
  let found = null;
  logs.forEach((log) => {
    if (!log?.id || !validWeight(log) || dayOf(log.loggedAt) !== day) return;
    if (!found || timeOf(log) >= timeOf(found)) found = log;
  });
  return found;
}

/** Ghi cân cho ngày `day`: sửa lần cân đã có của ngày đó, hoặc thêm mới khi ngày còn trống. */
export function weighInAction(logs = [], day) {
  const existing = logOnDay(logs, day);
  return existing ? { mode: 'update', id: existing.id, previous: Number(existing.weight) } : { mode: 'add' };
}

/** Lịch sử cân: lần cân cuối của mỗi ngày, mới trước. Giữ nguyên bản ghi (id, loggedAt, note). */
export function oneLogPerDay(logs = []) {
  const byDay = new Map();
  logs.forEach((log) => {
    const day = dayOf(log?.loggedAt);
    if (!day || !validWeight(log)) return;
    const known = byDay.get(day);
    if (!known || timeOf(log) >= timeOf(known.log)) byDay.set(day, { day, log });
  });
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1)).map(({ day, log }) => ({ ...log, day }));
}
