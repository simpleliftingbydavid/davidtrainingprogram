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
export function normalizeReviewAlert(item = {}) {
  return { ...item, priority: REVIEW_PRIORITY[item.priority] ? item.priority : 'normal',
    status: REVIEW_STATUS[item.status] ? item.status : 'open', type: REVIEW_TYPE[item.type] ? item.type : 'data-quality' };
}
export function filterReviewAlerts(items, filters = {}) {
  const term = String(filters.search || '').trim().toLocaleLowerCase('vi');
  return items.map(normalizeReviewAlert).filter((item) =>
    (!filters.category || item.clientCategory === filters.category)
    && (!filters.type || item.type === filters.type)
    && (!filters.status || item.status === filters.status)
    && (!term || `${item.studentName} ${item.title} ${item.summary} ${item.exerciseName}`.toLocaleLowerCase('vi').includes(term))
  ).sort((a, b) => (({ urgent: 3, high: 2, normal: 1 }[b.priority]) - ({ urgent: 3, high: 2, normal: 1 }[a.priority]))
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
