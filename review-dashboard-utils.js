export const REVIEW_STATUS = Object.freeze({ open: 'Cần xem', acknowledged: 'Đã xem', in_progress: 'Đang xử lý', resolved: 'Đã xử lý' });
export const REVIEW_PRIORITY = Object.freeze({ urgent: 'Ưu tiên ngay', high: 'Quan trọng', normal: 'Theo dõi' });
export const REVIEW_TYPE = Object.freeze({
  pain: 'Đau/khó chịu', 'skipped-exercise': 'Bỏ bài', 'reduced-sets': 'Giảm set', 'early-end': 'Kết thúc sớm',
  'progression-held': 'Giữ progression', 'exercise-feedback': 'Feedback', 'abnormal-training-max': 'Training Max',
  'performance-decline': 'Hiệu suất giảm', 'data-quality': 'Dữ liệu bất thường', 'rir-calibration': 'Hiệu chỉnh RIR',
  'deload-recommendation': 'Đề xuất deload', 'phase-review-due': 'Tổng kết chu kỳ',
  'technical-error': 'Lỗi kỹ thuật',
});

function millis(value) { return value?.toMillis?.() ?? (value instanceof Date ? value.getTime() : Number(value) || 0); }
// Signals the system raises as a matter of course: a progression held, fewer sets than
// planned, an exercise skipped. Safety and feedback alerts are not on this list. They
// were all stored as "high", which made 161 of 195 open alerts "important" and the
// label meaningless, so the dashboard shows them as day-to-day follow-up instead.
export const ROUTINE_TYPES = Object.freeze(['progression-held', 'reduced-sets', 'skipped-exercise']);
export const isRoutineAlert = (item) => ROUTINE_TYPES.includes(item?.type);

/** What the dashboard shows. An urgent alert stays urgent whatever its type; a routine
 *  one is follow-up whatever it was stored as; the rest keep their stored priority. */
export function displayPriority(item) {
  const stored = REVIEW_PRIORITY[item?.priority] ? item.priority : 'normal';
  if (stored === 'urgent') return 'urgent';
  return isRoutineAlert(item) ? 'normal' : stored;
}

const DAY_MS = 86400000;
export function alertAgeDays(item, now = Date.now()) {
  const at = millis(item?.lastDetectedAt || item?.createdAt);
  return at ? Math.max(0, Math.floor((now - at) / DAY_MS)) : 0;
}
export function alertAgeText(item, now = Date.now()) {
  const days = alertAgeDays(item, now);
  return days < 1 ? 'hôm nay' : `${days} ngày trước`;
}

export function normalizeReviewAlert(item = {}) {
  const normalized = { ...item, priority: REVIEW_PRIORITY[item.priority] ? item.priority : 'normal',
    status: REVIEW_STATUS[item.status] ? item.status : 'open', type: REVIEW_TYPE[item.type] ? item.type : 'data-quality' };
  return { ...normalized, displayPriority: displayPriority(normalized) };
}
export function filterReviewAlerts(items, filters = {}) {
  const term = String(filters.search || '').trim().toLocaleLowerCase('vi');
  return items.map(normalizeReviewAlert).filter((item) =>
    (!filters.category || item.clientCategory === filters.category)
    && (!filters.type || item.type === filters.type)
    && (!filters.status || item.status === filters.status)
    && (!filters.age || (filters.age === 'recent' ? alertAgeDays(item) <= 7 : alertAgeDays(item) > 14))
    && (!term || `${item.studentName} ${item.title} ${item.summary} ${item.exerciseName}`.toLocaleLowerCase('vi').includes(term))
  ).sort((a, b) => (({ urgent: 3, high: 2, normal: 1 }[b.displayPriority]) - ({ urgent: 3, high: 2, normal: 1 }[a.displayPriority]))
    || millis(b.lastDetectedAt || b.createdAt) - millis(a.lastDetectedAt || a.createdAt));
}
export function reviewSummary(items) {
  const normalized = items.map(normalizeReviewAlert);
  return { open: normalized.filter((x) => x.status === 'open').length,
    urgent: normalized.filter((x) => x.status !== 'resolved' && x.priority === 'urgent').length,
    inProgress: normalized.filter((x) => ['acknowledged', 'in_progress'].includes(x.status)).length,
    resolved: normalized.filter((x) => x.status === 'resolved').length,
    technical: normalized.filter((x) => x.status !== 'resolved' && x.type === 'technical-error').length };
}
export function groupReviewAlerts(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.studentUid || 'unknown';
    if (!groups.has(key)) groups.set(key, { studentUid: key, studentName: item.studentName || 'Học viên', items: [] });
    groups.get(key).items.push(item);
  });
  return [...groups.values()];
}

/** The four blocks of the dashboard, in the order they are read: what needs action now,
 *  what needs a coach's eye, the day-to-day follow-up, and technical errors. */
export function reviewSections(items) {
  const sections = { urgent: [], coaching: [], routine: [], technical: [] };
  for (const item of items) {
    if (item.type === 'technical-error') sections.technical.push(item);
    else if (item.priority === 'urgent') sections.urgent.push(item);
    else if (isRoutineAlert(item)) sections.routine.push(item);
    else sections.coaching.push(item);
  }
  return sections;
}

/** One row per student and signal type ("Khánh Linh · Giữ progression · 12 bài"), the
 *  student with the most first. Only the open ones can still be marked as seen. */
export function groupRoutineAlerts(items, now = Date.now()) {
  const groups = new Map();
  for (const item of items) {
    const key = `${item.studentUid || 'unknown'}|${item.type}`;
    if (!groups.has(key)) {
      groups.set(key, { key, studentUid: item.studentUid || 'unknown', studentName: item.studentName || 'Học viên', type: item.type, items: [] });
    }
    groups.get(key).items.push(item);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    openItems: group.items.filter((item) => item.status === 'open'),
    oldCount: group.items.filter((item) => alertAgeDays(item, now) > 14).length,
    exercises: [...new Set(group.items.map((item) => item.exerciseName).filter(Boolean))],
  })).sort((a, b) => b.items.length - a.items.length || a.studentName.localeCompare(b.studentName, 'vi'));
}

export function mergeReviewAlertPages(...pages) {
  const merged = new Map();
  pages.flat().forEach((item) => {
    if (!item?.id) return;
    merged.set(item.id, { ...(merged.get(item.id) || {}), ...item });
  });
  return [...merged.values()];
}
