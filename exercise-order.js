// ============================================================
// DAVID COACHING — Học viên đổi thứ tự bài trong buổi (2026-11-18)
// ============================================================
// Trước khi bắt đầu: đổi tự do. Trong lúc tập: chỉ bài chưa tập set nào (bài đã tập hoặc đã bỏ
// qua giữ chỗ). Lần đầu đổi trong buổi, học viên chọn "Chỉ hôm nay" (mặc định, chỉ nằm trong bản
// nháp và lịch sử buổi) hoặc "Lưu cho các lần sau" (ghi orderInDay một lần khi kết thúc buổi).
// Thứ tự không ảnh hưởng tiến trình: mỗi bài vẫn tăng tạ theo kết quả của chính nó.
import { t } from './i18n.js';

export const ORDER_CHOICE = Object.freeze({ TODAY: 'today', KEEP: 'keep' });
export const MAX_ORDER_IN_DAY = 450;

export function normalizeOrderChoice(value) {
  return value === ORDER_CHOICE.KEEP ? ORDER_CHOICE.KEEP : value === ORDER_CHOICE.TODAY ? ORDER_CHOICE.TODAY : '';
}

/** Danh sách mới với phần tử ở index dời đi delta bước; ngoài biên thì trả lại đúng danh sách cũ. */
export function moveItem(list, index, delta) {
  const target = index + delta;
  if (!Array.isArray(list) || index < 0 || index >= list.length || target < 0 || target >= list.length || delta === 0) return list;
  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/**
 * Có dời được mục index đi delta bước không. locked[i] = true: bài đã tập (hoặc đã bỏ qua) nên giữ
 * chỗ; bài chưa tập chỉ đổi chỗ với bài chưa tập kề bên.
 */
export function canMove(locked, index, delta) {
  const target = index + delta;
  if (!Array.isArray(locked) || index < 0 || index >= locked.length || target < 0 || target >= locked.length) return false;
  return !locked[index] && !locked[target];
}

/** Thứ tự (danh sách mã) có khác thứ tự giáo án không. Chỉ so các mã có ở cả hai bên. */
export function orderChanged(plannedIds = [], actualIds = []) {
  const actualSet = new Set(actualIds);
  const planned = plannedIds.filter((id) => actualSet.has(id));
  const plannedSet = new Set(planned);
  const actual = actualIds.filter((id) => plannedSet.has(id));
  return planned.some((id, index) => id !== actual[index]);
}

/**
 * orderInDay mới khi học viên chọn "Lưu cho các lần sau". Dùng lại đúng các số orderInDay đang có
 * (xếp tăng dần) cho thứ tự mới, nên các buổi khác và chỗ trống coach để lại không bị đụng tới.
 * Nếu số cũ trùng nhau hoặc không hợp lệ thì đánh lại 1..n. Chỉ trả về bài có số thay đổi.
 * @param {{id: string, orderInDay: number}[]} orderedAssignments  bài của buổi, theo thứ tự mới
 * @returns {{id: string, orderInDay: number}[]}
 */
export function orderInDayUpdates(orderedAssignments = []) {
  const current = orderedAssignments.map((item) => Number(item.orderInDay));
  const valid = current.every((n) => Number.isInteger(n) && n >= 1 && n <= MAX_ORDER_IN_DAY)
    && new Set(current).size === current.length;
  const pool = valid ? current.slice().sort((a, b) => a - b) : orderedAssignments.map((_, index) => index + 1);
  return orderedAssignments
    .map((item, index) => ({ id: item.id, orderInDay: pool[index], before: Number(item.orderInDay) }))
    .filter((item) => item.orderInDay !== item.before)
    .map(({ id, orderInDay }) => ({ id, orderInDay }));
}

/**
 * Xếp lại các phần tử theo thứ tự trong bản nháp. keyOf(el) cho các khoá của một phần tử (khớp
 * khoá nào trước thì dùng); phần tử bản nháp không có giữ thứ tự cũ và đứng sau.
 */
export function orderByKeys(items, orderedKeys, keyOf) {
  const rank = new Map();
  orderedKeys.forEach((key, index) => { if (key && !rank.has(key)) rank.set(key, index); });
  const position = (item) => {
    for (const key of keyOf(item)) if (key && rank.has(key)) return rank.get(key);
    return Infinity;
  };
  return items
    .map((item, index) => ({ item, index, at: position(item) }))
    .sort((a, b) => (a.at - b.at) || (a.index - b.index))
    .map(({ item }) => item);
}

/** Dòng ghi chú trong lịch sử buổi. mine: học viên xem lịch sử của chính mình. */
export function orderNoteText(completionContext, { mine = false } = {}) {
  if (completionContext?.exerciseOrderChanged !== true) return '';
  const base = mine ? 'order.noteMine' : 'order.note';
  return t(`${base}.${completionContext.exerciseOrderKept === true ? 'kept' : 'today'}`);
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Hai nút ↑ ↓ của một dòng. */
export function moveButtonsMarkup(index, { locked = [], name = '' } = {}) {
  const up = canMove(locked, index, -1);
  const down = canMove(locked, index, 1);
  return `<span class="ord-move"><button type="button" class="ord-btn" data-ord-move="-1" data-ord-index="${index}" aria-label="${escapeHtml(t('order.up', { name }))}"${up ? '' : ' disabled'}>↑</button><button type="button" class="ord-btn" data-ord-move="1" data-ord-index="${index}" aria-label="${escapeHtml(t('order.down', { name }))}"${down ? '' : ' disabled'}>↓</button></span>`;
}

/** Lựa chọn "Chỉ hôm nay" / "Lưu cho các lần sau" (hiện khi thứ tự đã khác giáo án). */
export function choiceMarkup(choice, name = 'ord-choice') {
  const current = normalizeOrderChoice(choice) || ORDER_CHOICE.TODAY;
  const option = (value, key) => `<label class="ord-pill"><input type="radio" name="${name}" value="${value}" data-ord-choice${current === value ? ' checked' : ''}> <span>${t(key)}</span></label>`;
  return `<div class="ord-choice" role="radiogroup" aria-label="${escapeHtml(t('order.choiceLabel'))}">${option(ORDER_CHOICE.TODAY, 'order.today')}${option(ORDER_CHOICE.KEEP, 'order.keep')}</div>
    <p class="ord-choice-note">${t(current === ORDER_CHOICE.KEEP ? 'order.keepNote' : 'order.todayNote')}</p>`;
}
