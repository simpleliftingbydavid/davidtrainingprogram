'use strict';

function clean(value, max = 180) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function safeId(value) {
  return clean(value, 400).replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 180) || 'unknown';
}

function saveStateText(value) {
  return ({ saved: 'Dữ liệu chính đã lưu', 'not-saved': 'Chưa xác nhận lưu', 'draft-kept': 'Bản nháp còn giữ', unknown: 'Chưa xác định trạng thái lưu' })[value] || 'Chưa xác định trạng thái lưu';
}

function buildTechnicalReviewAlert({ ownerType, ownerId, issueId, issue = {}, owner = {} }) {
  const coachUid = ownerType === 'coach' ? ownerId : clean(owner.coachUid);
  if (!coachUid) return null;
  const studentUid = ownerType === 'student' ? ownerId : '';
  const studentName = ownerType === 'student'
    ? clean(owner.displayName || owner.email || 'Học viên', 120)
    : clean(owner.displayName || 'Hệ thống Coach', 120);
  const supportCode = clean(issue.supportCode || 'DC-UNKNOWN', 80);
  const operationLabel = clean(issue.operationLabel || 'Lỗi kỹ thuật', 120);
  const occurrences = Math.max(1, Number(issue.occurrences) || 1);
  return {
    id: `technical_${safeId(ownerType)}_${safeId(ownerId)}_${safeId(issueId)}`,
    data: {
      coachUid, studentUid, studentName,
      clientCategory: clean(owner.clientCategory || ''),
      type: 'technical-error', priority: issue.priority === 'high' ? 'high' : 'normal', status: 'open',
      title: `Lỗi kỹ thuật · ${operationLabel}`,
      summary: `${saveStateText(issue.saveState)} · ${clean(issue.errorCode || 'unknown', 80)} · ${occurrences} lần ghi nhận.`,
      source: 'technical', sourceId: clean(issueId, 220), sessionId: '', assignmentId: '', exerciseId: '', exerciseName: '', dayLabel: '',
      latestNote: supportCode, dedupeKey: `technical:${ownerType}:${ownerId}:${clean(issueId, 220)}`,
      supportCode, errorCode: clean(issue.errorCode || 'unknown', 80), appVersion: clean(issue.appVersion, 80),
      device: clean(issue.device, 160), page: clean(issue.page, 180), online: issue.online === true,
      saveState: clean(issue.saveState, 30), occurrences,
      action: '', coachNote: '', reviewDate: null, handledBy: null, handledAt: null, version: 1,
    },
  };
}

module.exports = { buildTechnicalReviewAlert };
