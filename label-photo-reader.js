// ============================================================
// DAVID COACHING — Chụp nhãn để tự điền form sản phẩm (2026-11-17)
// ============================================================
// Dùng chung cho Món theo nhãn (coach) và Sản phẩm của tôi (học viên). Người dùng chọn 1–2 ảnh
// (bảng dinh dưỡng, mặt trước có tên/hãng), bấm "Đọc nhãn": ảnh được nén trên máy rồi gửi Cloud
// Function readFoodLabel (Claude đọc). Kết quả CHỈ điền sẵn vào form #lf-form; ô được điền có viền
// màu để người dùng kiểm tra. Không lưu ảnh ở đâu cả; người dùng vẫn tự bấm lưu.
import { t } from './i18n.js';

/** Cạnh dài tối đa sau khi nén (Claude thu nhỏ ảnh lớn hơn về cỡ này nên gửi lớn hơn chỉ tốn mạng). */
export const MAX_EDGE = 1568;
export const JPEG_QUALITY = 0.85;

/** Kích thước sau khi thu nhỏ, giữ tỉ lệ; ảnh nhỏ hơn giữ nguyên. */
export function scaledSize(width, height, maxEdge = MAX_EDGE) {
  const w = Math.max(1, Number(width) || 1);
  const h = Math.max(1, Number(height) || 1);
  const k = Math.min(1, maxEdge / Math.max(w, h));
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

/** Nén một ảnh (File) thành JPEG base64 { mediaType, data }. Ảnh chỉ ở trong bộ nhớ trình duyệt. */
export async function compressImage(file) {
  const bitmap = await (globalThis.createImageBitmap
    ? createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file))
    : loadImage(file));
  const { width, height } = scaledSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', JPEG_QUALITY));
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return { mediaType: 'image/jpeg', data: dataUrl.slice(dataUrl.indexOf(',') + 1) };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    image.src = url;
  });
}

/** Lời báo cho từng mã lỗi của Cloud Function. */
export function readErrorText(error) {
  const code = String(error?.code || '').replace(/^functions\//, '');
  if (code === 'resource-exhausted') return t('lp.err.quota', { n: error?.details?.limit ?? 10 });
  if (code === 'invalid-argument') return t('lp.err.image');
  if (code === 'failed-precondition' || code === 'internal') return t('lp.err.unreadable');
  if (code === 'unavailable' || code === 'deadline-exceeded') return t('lp.err.busy');
  if (code === 'not-found') return t('lp.err.notReady');
  if (code === 'unauthenticated' || code === 'permission-denied') return t('lp.err.rights');
  return t('lp.err.generic');
}

/** Gọi Cloud Function readFoodLabel. Bộ Functions SDK chỉ tải khi người dùng thật sự đọc nhãn. */
export async function callReadFoodLabel(data) {
  const [{ httpsCallable }, { functions }] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js'),
    import('./firebase-functions-init.js'),
  ]);
  return httpsCallable(functions, 'readFoodLabel', { timeout: 90000 })(data);
}

/** Gửi ảnh (đã nén) cho Cloud Function. call: hàm httpsCallable (truyền vào để thử được). */
export async function readLabel(images, call) {
  const result = await call({ images });
  return result?.data || {};
}

const fmt = (value) => String(value).replace('.', ',');

/**
 * Điền kết quả đọc nhãn vào form #lf-form (cùng cấu trúc ở label-foods.html và label-food-form.js).
 * Chỉ điền ô đọc được; ô nhãn không có giữ nguyên. Ô được điền có class lf-auto.
 * @returns {number} số ô đã điền
 */
export function applyReading(form, reading = {}) {
  const filled = [];
  const set = (input, value) => {
    if (!input || value === null || value === undefined || value === '') return;
    input.value = typeof value === 'number' ? fmt(value) : String(value);
    input.classList.add('lf-auto');
    filled.push(input);
  };
  const f = reading.fields || {};
  set(form.querySelector('#lf-name'), f.name);
  set(form.querySelector('#lf-brand'), f.brand);
  if (f.unit) { const radio = form.querySelector(`input[name="lf-unit"][value="${f.unit}"]`); if (radio) radio.checked = true; }
  if (f.basis) { const radio = form.querySelector(`input[name="lf-basis"][value="${f.basis}"]`); if (radio) radio.checked = true; }
  set(form.querySelector('#lf-serving-label'), f.servingLabel);
  set(form.querySelector('#lf-serving-amount'), f.servingAmount);
  form.querySelectorAll('[data-key]').forEach((input) => set(input, reading.values?.[input.dataset.key]));
  form.dispatchEvent(new Event('change', { bubbles: true }));
  return filled.length;
}

/** Bỏ đánh dấu "đọc từ ảnh" của một ô khi người dùng tự sửa nó. */
export function clearAutoMark(event) {
  if (event?.target?.classList?.contains('lf-auto')) event.target.classList.remove('lf-auto');
}

/** Tóm tắt kết quả cho dòng trạng thái: số ô đã điền, các đổi đơn vị, số bị bỏ. */
export function readingSummary(reading = {}, filledCount = 0) {
  const parts = [];
  if (!reading.found?.table && !reading.found?.name) return t('lp.nothingFound');
  parts.push(t('lp.filled', { n: filledCount }));
  if (!reading.found?.table) parts.push(t('lp.noTable'));
  if ((reading.converted || []).some((item) => item.from === 'kJ')) parts.push(t('lp.fromKj'));
  if ((reading.converted || []).some((item) => item.from === 'salt')) parts.push(t('lp.fromSalt'));
  if ((reading.dropped || []).length) parts.push(t('lp.dropped', { list: reading.dropped.map((key) => t(`lf.n.${key}`)).join(', ') }));
  return parts.join(' ');
}

/** Khung chụp nhãn đặt ở đầu form. */
export function photoBarMarkup() {
  return `<div class="lf-photo" id="lf-photo">
    <p class="lf-photo-title">${t('lp.title')}</p>
    <p class="lf-photo-hint">${t('lp.hint')}</p>
    <div class="lf-photo-actions">
      <label class="btn btn-outline lf-photo-pick" data-lp-slot="nutrition"><input type="file" accept="image/*" data-lp-input="nutrition" hidden><span data-lp-label>${t('lp.pickNutrition')}</span></label>
      <label class="btn btn-outline lf-photo-pick" data-lp-slot="front"><input type="file" accept="image/*" data-lp-input="front" hidden><span data-lp-label>${t('lp.pickFront')}</span></label>
      <button type="button" class="btn btn-primary" id="lf-photo-read" disabled>${t('lp.read')}</button>
    </div>
    <p class="lf-photo-status" id="lf-photo-status" role="status"></p>
  </div>`;
}

/**
 * Gắn hành vi cho khung chụp nhãn.
 * @param {HTMLElement} root  phần tử chứa photoBarMarkup()
 * @param {{form: HTMLFormElement, call: Function}} options call = httpsCallable(functions, 'readFoodLabel')
 */
export function bindPhotoBar(root, { form, call }) {
  const picked = { nutrition: null, front: null };
  const status = root.querySelector('#lf-photo-status');
  const readBtn = root.querySelector('#lf-photo-read');
  const refresh = () => {
    readBtn.disabled = !picked.nutrition && !picked.front;
    root.querySelectorAll('[data-lp-slot]').forEach((slot) => {
      const file = picked[slot.dataset.lpSlot];
      slot.classList.toggle('on', Boolean(file));
      slot.querySelector('[data-lp-label]').textContent = file
        ? t(slot.dataset.lpSlot === 'nutrition' ? 'lp.pickedNutrition' : 'lp.pickedFront')
        : t(slot.dataset.lpSlot === 'nutrition' ? 'lp.pickNutrition' : 'lp.pickFront');
    });
  };
  root.querySelectorAll('[data-lp-input]').forEach((input) => input.addEventListener('change', () => {
    picked[input.dataset.lpInput] = input.files?.[0] || null;
    status.textContent = '';
    refresh();
  }));
  form.addEventListener('input', clearAutoMark);
  readBtn.addEventListener('click', async () => {
    const files = [picked.nutrition, picked.front].filter(Boolean);
    if (!files.length) return;
    readBtn.disabled = true;
    status.textContent = t('lp.reading');
    try {
      const images = await Promise.all(files.map(compressImage));
      const reading = await readLabel(images, call);
      const filled = applyReading(form, reading);
      status.textContent = readingSummary(reading, filled);
      picked.nutrition = null; picked.front = null;
      root.querySelectorAll('[data-lp-input]').forEach((input) => { input.value = ''; });
    } catch (error) {
      console.error('readFoodLabel', error?.code || error);
      status.textContent = readErrorText(error);
    } finally {
      refresh();
    }
  });
  refresh();
  return { reset() { picked.nutrition = null; picked.front = null; status.textContent = ''; root.querySelectorAll('[data-lp-input]').forEach((i) => { i.value = ''; }); refresh(); } };
}
