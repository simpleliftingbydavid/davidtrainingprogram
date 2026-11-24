// ============================================================
// DAVID COACHING — Thử lại khi đọc dữ liệu lỗi tạm thời (2026-11-24)
// ============================================================
// Thuần: không DOM, không Firebase.
// Mạng điện thoại chập chờn (app vừa mở lại từ nền, đổi Wi-Fi/4G) làm một lượt đọc Firestore lỗi
// "unavailable"/"deadline-exceeded" hoặc lỗi mạng. Lỗi kiểu đó thử lại một lần là thường được.
// Lỗi quyền (permission-denied) hay lỗi dữ liệu thì thử lại cũng vô ích: báo ngay.

const TRANSIENT_CODES = new Set([
  'unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted', 'cancelled', 'internal', 'unknown',
]);
const TRANSIENT_TEXT = /offline|network|failed to fetch|fetch failed|load failed|timed? ?out|timeout|connection|ECONN|socket/i;

/** Lỗi đọc có phải lỗi tạm thời (thử lại có thể được) không. */
export function isTransientError(error) {
  if (!error) return false;
  const code = String(error.code || '').replace(/^(firestore|functions)\//, '');
  if (code === 'permission-denied' || code === 'unauthenticated' || code === 'not-found'
    || code === 'invalid-argument' || code === 'failed-precondition') return false;
  if (TRANSIENT_CODES.has(code)) return true;
  if (error.name === 'TypeError' && !TRANSIENT_TEXT.test(String(error.message || ''))) return false;
  return TRANSIENT_TEXT.test(`${error.name || ''} ${error.message || ''}`);
}

/** Lỗi quyền: báo ngay, không thử lại. */
export function isPermissionError(error) {
  const code = String(error?.code || '').replace(/^(firestore|functions)\//, '');
  return code === 'permission-denied' || code === 'unauthenticated';
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Chạy fn; lỗi tạm thời thì đợi rồi thử lại (mặc định một lần, sau 1 giây).
 * @param {() => Promise<any>} fn
 * @param {{retries?: number, delayMs?: number, isRetryable?: (error) => boolean, sleep?: (ms) => Promise<void>, shouldContinue?: () => boolean}} options
 *   shouldContinue: trả false thì thôi thử lại (ví dụ David đã mở học viên khác).
 */
export async function withRetry(fn, { retries = 1, delayMs = 1000, isRetryable = isTransientError, sleep = wait, shouldContinue = () => true } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !isRetryable(error) || !shouldContinue()) throw error;
      attempt += 1;
      await sleep(delayMs * attempt);
      if (!shouldContinue()) throw error;
    }
  }
}

/**
 * Chạy các lượt đọc phụ: lượt nào lỗi (sau khi thử lại) thì trả fallback, không làm hỏng cả trang.
 * @param {Record<string, () => Promise<any>>} jobs
 * @param {Record<string, any>} fallbacks
 * @returns {Promise<{values: Record<string, any>, failed: string[], errors: Record<string, Error>}>}
 */
export async function settleAll(jobs, fallbacks = {}, options = {}) {
  const keys = Object.keys(jobs);
  const results = await Promise.allSettled(keys.map((key) => withRetry(jobs[key], options)));
  const values = {};
  const failed = [];
  const errors = {};
  results.forEach((result, index) => {
    const key = keys[index];
    if (result.status === 'fulfilled') values[key] = result.value;
    else { values[key] = fallbacks[key]; failed.push(key); errors[key] = result.reason; }
  });
  return { values, failed, errors };
}
