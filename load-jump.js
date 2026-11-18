// ============================================================
// DAVID COACHING — Tạ lệch lớn so với giáo án (2026-11-18)
// ============================================================
// Thuần: không DOM, không Firebase.
// Khi học viên bấm "Xong" một set có số tạ lệch nhiều so với giáo án (nặng hơn hoặc nhẹ hơn), app
// hỏi lại "tập thật hay gõ nhầm?" (một lần mỗi bài mỗi buổi). Học viên xác nhận thì:
//   - mức tạ lần sau được tính từ số đã tập, kể cả ngoài khoảng 0,5–1,5 lần thường dùng
//     (nhưng không vượt mức chặn tuyệt đối bên dưới: vượt là chắc chắn gõ nhầm);
//   - buổi tập ghi lại lần lệch đó, David thấy trong "Đánh giá progression" và trong "Cần xem lại".
// Người mới (bài còn ít buổi, hoặc mới tập vài tuần) có ngưỡng riêng: người mới thường tăng nhanh.
//
// CÁC SỐ MẶC ĐỊNH DƯỚI ĐÂY LÀ ĐỀ XUẤT, CHƯA CÓ NGUỒN KHOA HỌC XÁC NHẬN. David chỉnh cho từng học
// viên ở trang HLV → học viên → Theo dõi → Đánh giá progression → "Ngưỡng tạ lệch lớn".
import { fmtNumber, t } from './i18n.js';

/** Mức chặn tuyệt đối (cố định): ngoài khoảng này app không nhận số, yêu cầu sửa. */
export const LOAD_JUMP_ABSOLUTE_MAX = 3;
export const LOAD_JUMP_ABSOLUTE_MIN = 0.25;

/** Số buổi lịch sử app học viên tải; chạm mức này nghĩa là lịch sử bị cắt, không tính "mới tập vài tuần". */
export const HISTORY_CAP = 120;

export const LOAD_JUMP_DEFAULTS = Object.freeze({
  newbieExposures: 6, // bài có ít hơn 6 buổi đã ghi
  newbieWeeks: 8, // hoặc học viên chưa quá 8 tuần kể từ buổi đầu tiên
  newbie: Object.freeze({ heavier: 1.5, lighter: 0.6 }),
  experienced: Object.freeze({ heavier: 1.2, lighter: 0.8 }),
});

const LIMITS = Object.freeze({
  newbieExposures: [1, 50], newbieWeeks: [1, 52], heavier: [1.05, 2.9], lighter: [0.3, 0.95],
});

const clampNum = (value, [lo, hi], fallback, digits = 2) => {
  const text = String(value ?? '').trim();
  const n = Number(text.replace(',', '.'));
  if (!text || !Number.isFinite(n)) return fallback;
  const k = 10 ** digits;
  return Math.round(Math.min(hi, Math.max(lo, n)) * k) / k;
};

/** Cài đặt đã lưu (có thể thiếu hoặc sai) → cài đặt hợp lệ, thiếu thì dùng mặc định. */
export function normalizeLoadJumpSettings(raw = {}) {
  const d = LOAD_JUMP_DEFAULTS;
  const pair = (group) => ({
    heavier: clampNum(raw?.[group]?.heavier, LIMITS.heavier, d[group].heavier),
    lighter: clampNum(raw?.[group]?.lighter, LIMITS.lighter, d[group].lighter),
  });
  return {
    newbieExposures: Math.round(clampNum(raw?.newbieExposures, LIMITS.newbieExposures, d.newbieExposures, 0)),
    newbieWeeks: Math.round(clampNum(raw?.newbieWeeks, LIMITS.newbieWeeks, d.newbieWeeks, 0)),
    newbie: pair('newbie'),
    experienced: pair('experienced'),
  };
}

/** Lỗi khi David nhập cài đặt (mảng chuỗi; rỗng là hợp lệ). */
export function loadJumpSettingsErrors(raw = {}) {
  const errors = [];
  const num = (value) => (String(value ?? '').trim() ? Number(String(value).trim().replace(',', '.')) : NaN);
  const inRange = (value, [lo, hi]) => Number.isFinite(num(value)) && num(value) >= lo && num(value) <= hi;
  if (!inRange(raw.newbieExposures, LIMITS.newbieExposures) || !Number.isInteger(num(raw.newbieExposures))) errors.push(t('lj.err.exposures'));
  if (!inRange(raw.newbieWeeks, LIMITS.newbieWeeks) || !Number.isInteger(num(raw.newbieWeeks))) errors.push(t('lj.err.weeks'));
  for (const group of ['newbie', 'experienced']) {
    if (!inRange(raw[group]?.heavier, LIMITS.heavier)) errors.push(t('lj.err.heavier'));
    if (!inRange(raw[group]?.lighter, LIMITS.lighter)) errors.push(t('lj.err.lighter'));
  }
  return [...new Set(errors)];
}

function timestampMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

const logExerciseId = (log) => String(log?.exerciseId || '').trim();
const WEEK_MS = 7 * 24 * 3600 * 1000;

/**
 * Học viên có còn là "người mới" với bài này không: bài có ít hơn newbieExposures buổi đã ghi
 * (không tính buổi bỏ bài), HOẶC chưa quá newbieWeeks tuần kể từ buổi tập đầu tiên.
 * @param {object[]} sessions lịch sử buổi tập (bất kỳ thứ tự)
 * @param {{historyCapped?: boolean}} options historyCapped: lịch sử bị cắt nên không biết buổi đầu
 */
export function isNewbieFor({ sessions = [], exerciseId, now = Date.now(), settings = LOAD_JUMP_DEFAULTS, historyCapped = false }) {
  const s = normalizeLoadJumpSettings(settings);
  const list = Array.isArray(sessions) ? sessions : [];
  const exposures = list.filter((session) => (session?.exerciseLogs || []).some((log) =>
    logExerciseId(log) === exerciseId && log.outcome !== 'skipped' && log.status !== 'skipped')).length;
  if (exposures < s.newbieExposures) return true;
  if (historyCapped || list.length >= HISTORY_CAP) return false;
  const times = list.map((session) => timestampMs(session?.performedAt || session?.loggedAt)).filter((ms) => ms > 0);
  if (!times.length) return true;
  return now - Math.min(...times) < s.newbieWeeks * WEEK_MS;
}

/**
 * Một set so với giáo án.
 * @returns {{kind: 'ok'|'heavier'|'lighter'|'blocked', ratio: number|null}}
 *   blocked: ngoài mức chặn tuyệt đối, không nhận số.
 */
export function classifyLoadJump({ planned, actual, newbie = false, settings = LOAD_JUMP_DEFAULTS }) {
  const p = Number(planned);
  const a = Number(actual);
  if (!(p > 0) || !(a > 0)) return { kind: 'ok', ratio: null };
  const ratio = a / p;
  if (ratio > LOAD_JUMP_ABSOLUTE_MAX || ratio < LOAD_JUMP_ABSOLUTE_MIN) return { kind: 'blocked', ratio };
  const s = normalizeLoadJumpSettings(settings)[newbie ? 'newbie' : 'experienced'];
  if (ratio > s.heavier) return { kind: 'heavier', ratio };
  if (ratio < s.lighter) return { kind: 'lighter', ratio };
  return { kind: 'ok', ratio };
}

/** Tỉ lệ được phép rebase khi học viên đã xác nhận lệch lớn. */
export function confirmedLoadAllowed(actual, planned) {
  const a = Number(actual);
  const p = Number(planned);
  if (!(a > 0)) return false;
  if (!(p > 0)) return true;
  const ratio = a / p;
  return ratio >= LOAD_JUMP_ABSOLUTE_MIN && ratio <= LOAD_JUMP_ABSOLUTE_MAX;
}

const round = (value, digits = 3) => Math.round(Number(value) * 10 ** digits) / 10 ** digits;

/** Bản ghi lệch lớn đã xác nhận (lưu trong bản nháp và trong log buổi tập), hoặc null. */
export function normalizeLoadJump(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const dir = raw.dir === 'heavier' || raw.dir === 'lighter' ? raw.dir : '';
  const planned = Number(raw.planned);
  const actual = Number(raw.actual);
  if (!dir || !(planned > 0) || !(actual > 0) || raw.confirmed !== true) return null;
  if ((dir === 'heavier') !== (actual > planned)) return null;
  return { dir, planned: round(planned, 2), actual: round(actual, 2), ratio: round(actual / planned), newbie: raw.newbie === true, confirmed: true };
}

const kgText = (value) => fmtNumber(Math.round(Number(value) * 100) / 100, { maxFrac: 2 });
const VN_OFFSET_MS = 7 * 3600 * 1000;
const shortDay = (ms) => {
  const iso = new Date(ms + VN_OFFSET_MS).toISOString();
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
};

/**
 * Các lần lệch lớn đã xác nhận, theo bài (Đánh giá progression của David).
 * @returns Map exerciseId → { latest, count, items (mới trước), newbie, dir }
 */
export function loadJumpsByExercise(sessions = []) {
  const byId = new Map();
  [...(Array.isArray(sessions) ? sessions : [])]
    .map((session) => ({ session, ms: timestampMs(session?.performedAt || session?.loggedAt) }))
    .sort((a, b) => b.ms - a.ms)
    .forEach(({ session, ms }) => {
      (session?.exerciseLogs || []).forEach((log) => {
        const jump = normalizeLoadJump(log?.loadJump);
        const id = logExerciseId(log);
        if (!jump || !id) return;
        const list = byId.get(id) || [];
        list.push({ ...jump, ms, day: ms ? shortDay(ms) : '', dayLabel: String(session?.dayLabel || '') });
        byId.set(id, list);
      });
    });
  const result = new Map();
  byId.forEach((items, id) => result.set(id, { latest: items[0], count: items.length, items, newbie: items[0].newbie, dir: items[0].dir }));
  return result;
}

/** Dòng mô tả cho David: chiều, giáo án → đã tập, ngày, nhãn người mới, gợi ý. */
export function loadJumpText(entry, per = '') {
  if (!entry?.latest) return { label: '', text: '', tip: '' };
  const { latest } = entry;
  const label = t(latest.dir === 'heavier' ? 'lj.label.heavier' : 'lj.label.lighter');
  const detail = t('lj.detail', { day: latest.day || '—', planned: kgText(latest.planned), actual: kgText(latest.actual), per, pct: Math.round(Math.abs(latest.ratio - 1) * 100) });
  const extra = [
    entry.count > 1 ? t('lj.times', { n: entry.count }) : '',
    latest.newbie ? t('lj.newbie') : '',
  ].filter(Boolean).join(' · ');
  return {
    label,
    text: extra ? `${detail} · ${extra}` : detail,
    tip: t(latest.dir === 'heavier' ? 'lj.tip.heavier' : 'lj.tip.lighter'),
  };
}
