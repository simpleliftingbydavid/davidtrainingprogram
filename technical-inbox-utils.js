import { APP_VERSION } from './app-version.js';

export const TECHNICAL_ISSUE_SCHEMA_VERSION = 1;
export const TECHNICAL_ISSUE_RETENTION_DAYS = 90;

const OPERATION_LABELS = Object.freeze({
  'session-save': 'Ghi nhận buổi tập',
  'post-session-refresh': 'Tải lại sau khi lưu',
  'program-change-save': 'Lưu thay đổi giáo án',
  'workout-draft-save': 'Đồng bộ buổi tập tạm',
  'workout-draft-load': 'Khôi phục buổi tập tạm',
  'workout-draft-delete': 'Dọn buổi tập tạm',
  'workout-draft-listener': 'Đồng bộ giữa thiết bị',
  'account-boot': 'Mở tài khoản',
  'review-dashboard-load': 'Tải Dashboard',
  'browser-error': 'Lỗi giao diện',
  'unhandled-promise': 'Lỗi xử lý nền',
});

function clean(value, max = 120) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function normalizedCode(error) {
  const raw = clean(error?.code || error?.name || 'unknown', 80).toLowerCase();
  return raw.replace(/^firebase\//, '').replace(/[^a-z0-9_./-]+/g, '_') || 'unknown';
}

function hashText(value) {
  let hash = 0x811c9dc5;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(-7);
}

function safeOperation(value) {
  const operation = clean(value, 60).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  return OPERATION_LABELS[operation] ? operation : 'browser-error';
}

function browserFamily(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('chrome/') || ua.includes('crios/')) return 'Chrome';
  if (ua.includes('safari/')) return 'Safari';
  return 'Trình duyệt khác';
}

function platformFamily(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  return 'Thiết bị khác';
}

export function coarseDeviceLabel(userAgent = '', mobileHint = false) {
  const kind = mobileHint || /mobile|iphone|android/i.test(String(userAgent)) ? 'điện thoại' : 'máy tính';
  return `${platformFamily(userAgent)} · ${browserFamily(userAgent)} · ${kind}`;
}

export function technicalIssueDescriptor({ operation, error, saveState = 'unknown' } = {}) {
  const safeOp = safeOperation(operation);
  const errorCode = normalizedCode(error);
  const critical = ['session-save', 'workout-draft-save', 'workout-draft-load', 'account-boot'].includes(safeOp);
  const saved = saveState === 'saved';
  return {
    operation: safeOp,
    operationLabel: OPERATION_LABELS[safeOp],
    errorCode,
    errorName: clean(error?.name || 'Error', 60),
    priority: saved ? 'normal' : (critical ? 'high' : 'normal'),
    saveState: ['saved', 'not-saved', 'draft-kept', 'unknown'].includes(saveState) ? saveState : 'unknown',
  };
}

export function buildTechnicalIssue({
  ownerUid, reporterRole = 'student', operation, error, page = '', saveState = 'unknown',
  referenceId = '', userAgent = '', mobileHint = false, online = true, now = new Date(),
  eventId = '',
} = {}) {
  const descriptor = technicalIssueDescriptor({ operation, error, saveState });
  const fingerprint = hashText(`${reporterRole}|${descriptor.operation}|${descriptor.errorCode}|${APP_VERSION}`);
  const date = now instanceof Date ? now : new Date(now);
  const weekBucket = `${date.getUTCFullYear()}-W${String(Math.ceil((((date - new Date(Date.UTC(date.getUTCFullYear(), 0, 1))) / 86400000) + new Date(Date.UTC(date.getUTCFullYear(), 0, 1)).getUTCDay() + 1) / 7)).padStart(2, '0')}`;
  const supportCode = `DC-${descriptor.operation.split('-').map((part) => part[0]).join('').toUpperCase()}-${fingerprint}`;
  return {
    id: `${weekBucket}_${fingerprint}`,
    data: {
      schemaVersion: TECHNICAL_ISSUE_SCHEMA_VERSION,
      ownerUid: clean(ownerUid, 180),
      reporterUid: clean(ownerUid, 180),
      reporterRole: reporterRole === 'coach' ? 'coach' : 'student',
      operation: descriptor.operation,
      operationLabel: descriptor.operationLabel,
      errorCode: descriptor.errorCode,
      errorName: descriptor.errorName,
      appVersion: APP_VERSION,
      supportCode,
      fingerprint,
      page: clean(page || '/', 180),
      device: coarseDeviceLabel(userAgent, mobileHint),
      online: online === true,
      saveState: descriptor.saveState,
      referenceId: clean(referenceId, 180),
      priority: descriptor.priority,
      status: 'open',
      lastEventId: clean(eventId || `${Date.now()}-${fingerprint}`, 180),
    },
  };
}

export function technicalIssueMessage(issue, { saved = false } = {}) {
  const code = issue?.data?.supportCode || 'DC-UNKNOWN';
  if (saved) return `Dữ liệu đã được lưu an toàn. Phần hiển thị chưa cập nhật; bạn có thể tải lại trang. Mã hỗ trợ: ${code}.`;
  return `Chưa thể hoàn tất thao tác lúc này. Dữ liệu bạn vừa nhập vẫn được giữ nguyên. Hãy thử lại hoặc gửi David mã ${code}.`;
}

export function isSafeTechnicalIssue(issue = {}) {
  const forbidden = ['exerciseLogs', 'sets', 'reps', 'weight', 'clientNote', 'coachNote', 'mealPlan', 'payload', 'stack', 'message'];
  return !forbidden.some((key) => Object.prototype.hasOwnProperty.call(issue, key));
}
