// Song ngữ Việt / Anh (David chốt 2026-11-16: cả học viên lẫn coach; dịch giao diện, tên món
// và phần giải thích; chọn theo trình duyệt lần đầu, có nút VI/EN trong menu tài khoản).
//
//   t('shell.nav.home')                    → "Trang chủ" | "Home"
//   t('workout.sets', { n: 3 })            → "3 set" | "3 sets"   (giá trị dạng { one, other })
//   applyI18n(root)                        → dịch mọi phần tử có data-i18n, data-i18n-placeholder,
//                                            data-i18n-aria-label, data-i18n-title
//   setLang('en')                          → lưu trên máy, dịch lại trang, phát sự kiện 'dc:langchange'
//   onLangChange(fn)                       → trang tự vẽ lại phần nó dựng bằng JS
//   fmtNumber(71.1) / fmtDate('2026-11-16') → "71,1" / "16/11" (vi), "71.1" / "Nov 16" (en)
//
// Chữ tiếng Việt vẫn nằm sẵn trong HTML: với tiếng Việt, applyI18n ghi lại đúng chữ đó, nên
// trang tiếng Việt trông y như trước. Thiếu bản tiếng Anh thì dùng tiếng Việt (và báo trong
// console khi chạy ở máy dev).
//
// Từ điển là các file phẳng i18n-vi.js / i18n-en.js ở gốc repo, vì bước build chỉ xuất bản file
// ở gốc và các module nhập nhau bằng './tên.js'.
import VI from './i18n-vi.js';
import EN from './i18n-en.js';

export const LANG_KEY = 'dc_lang';
export const LANGS = Object.freeze(['vi', 'en']);
const LOCALE = Object.freeze({ vi: 'vi-VN', en: 'en-US' });
const DICTS = Object.freeze({ vi: VI, en: EN });

// Trong lúc dịch dần từng đợt: chưa tự chọn theo trình duyệt và chưa hiện nút đổi ở phía học viên,
// để học viên không gặp trang nửa Việt nửa Anh. Coach vẫn thấy nút để duyệt bản dịch; ai cũng thử
// được bằng ?lang=en. Bật lên khi xong đợt cuối.
export const I18N_PUBLIC = false;

const normalize = (value) => (LANGS.includes(value) ? value : null);

/** Ngôn ngữ dùng: đã chọn trên máy, else (khi đã mở) theo trình duyệt, else tiếng Việt. */
export function detectLang({ saved = null, browser = [], isPublic = I18N_PUBLIC } = {}) {
  const chosen = normalize(saved);
  if (chosen) return chosen;
  if (!isPublic) return 'vi';
  const first = [].concat(browser).find(Boolean) || '';
  return /^vi\b/i.test(String(first)) ? 'vi' : 'en';
}

const storage = {
  get() { try { return globalThis.localStorage?.getItem(LANG_KEY) ?? null; } catch { return null; } },
  set(value) { try { globalThis.localStorage?.setItem(LANG_KEY, value); } catch { /* trình duyệt chặn lưu: chỉ đổi cho lần mở này */ } },
};

function initialLang() {
  let fromUrl = null;
  try { fromUrl = normalize(new URLSearchParams(globalThis.location?.search || '').get('lang')); } catch { /* không có location */ }
  if (fromUrl) storage.set(fromUrl);
  const nav = globalThis.navigator;
  return detectLang({ saved: fromUrl || storage.get(), browser: nav ? [...(nav.languages || []), nav.language] : [] });
}

let lang = initialLang();
export const getLang = () => lang;
export const locale = () => LOCALE[lang];

const isDev = () => {
  try { return /^(localhost|127\.0\.0\.1|)$/.test(globalThis.location?.hostname ?? 'x'); } catch { return false; }
};
const warned = new Set();

/** Câu đã dịch cho `key`; `{tên}` được thay bằng params.tên. Giá trị { one, other } chọn theo params.n. */
export function t(key, params = {}, forLang = lang) {
  let value = DICTS[forLang]?.[key];
  if (value === undefined) {
    if (forLang !== 'vi' && isDev() && !warned.has(key)) { warned.add(key); console.warn(`[i18n] thiếu bản ${forLang}: ${key}`); }
    value = VI[key];
  }
  if (value === undefined) return key;
  if (value && typeof value === 'object') {
    const form = new Intl.PluralRules(LOCALE[forLang]).select(Number(params.n) || 0);
    value = value[form] ?? value.other;
  }
  return String(value).replace(/\{(\w+)\}/g, (whole, name) => (params[name] === undefined ? whole : String(params[name])));
}

const ATTRS = Object.freeze([['data-i18n-placeholder', 'placeholder'], ['data-i18n-aria-label', 'aria-label'], ['data-i18n-title', 'title']]);

/** Dịch các phần tử đánh dấu trong `root`. Chỉ đổi chữ, không đụng giá trị người dùng đã nhập. */
export function applyI18n(root = globalThis.document) {
  if (!root?.querySelectorAll) return;
  const scope = root.nodeType === 9 ? root.documentElement : root;
  const all = [scope, ...root.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title]')];
  for (const el of all) {
    if (!el?.getAttribute) continue;
    const key = el.getAttribute('data-i18n');
    if (key) { const text = t(key); if (el.textContent !== text) el.textContent = text; }
    for (const [attr, target] of ATTRS) {
      const attrKey = el.getAttribute(attr);
      if (attrKey) el.setAttribute(target, t(attrKey));
    }
  }
  if (root.nodeType === 9) root.documentElement.lang = lang;
}

/** Đổi ngôn ngữ: lưu trên máy, dịch lại phần tĩnh, báo cho phần dựng bằng JS. */
export function setLang(next) {
  const chosen = normalize(next);
  if (!chosen) return lang;
  storage.set(chosen);
  if (chosen === lang) return lang;
  lang = chosen;
  const doc = globalThis.document;
  if (doc) {
    applyI18n(doc);
    globalThis.dispatchEvent?.(new CustomEvent('dc:langchange', { detail: { lang } }));
  }
  return lang;
}

/** Gọi `fn(lang)` mỗi khi đổi ngôn ngữ. Trả về hàm huỷ. */
export function onLangChange(fn) {
  const handler = (event) => fn(event.detail.lang);
  globalThis.addEventListener?.('dc:langchange', handler);
  return () => globalThis.removeEventListener?.('dc:langchange', handler);
}

/** 71,1 (vi) / 71.1 (en). Mặc định tối đa 2 chữ số thập phân, không nhóm hàng nghìn bằng dấu. */
export function fmtNumber(value, { maxFrac = 2, minFrac = 0, grouping = false } = {}, forLang = lang) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(LOCALE[forLang], { maximumFractionDigits: maxFrac, minimumFractionDigits: minFrac, useGrouping: grouping }).format(n);
}

/** Ngày 'YYYY-MM-DD' (hoặc Date): "16/11" (vi) / "Nov 16" (en); `year: true` thêm năm,
 *  `weekday: true` thêm thứ. '' với giá trị không phải ngày. */
export function fmtDate(value, { year = false, weekday = false } = {}, forLang = lang) {
  let date = value instanceof Date ? value : null;
  if (!date) {
    const [y, m, d] = String(value || '').split('-').map(Number);
    if (!y || !m || !d) return '';
    date = new Date(Date.UTC(y, m - 1, d));
  }
  if (Number.isNaN(date.getTime())) return '';
  if (forLang === 'vi') {
    // Giữ đúng kiểu đang dùng trên app: "Thứ Hai 16/11", "16/11/2026".
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = `${dd}/${mm}${year ? `/${date.getUTCFullYear()}` : ''}`;
    return weekday ? `${t(`date.weekday.${date.getUTCDay()}`, {}, 'vi')} ${day}` : day;
  }
  return new Intl.DateTimeFormat(LOCALE[forLang], { timeZone: 'UTC', month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), ...(weekday ? { weekday: 'short' } : {}) }).format(date);
}

/** Nút VI / EN. Đặt vào một khung rồi gọi bindLangSwitch(khung). */
export function langSwitchMarkup() {
  return `<div class="dc-lang" role="group" aria-label="${t('lang.label')}">${LANGS.map((code) => `<button type="button" data-lang="${code}" aria-pressed="${code === lang}" lang="${code}">${code.toUpperCase()}</button>`).join('')}</div>`;
}

export function bindLangSwitch(container) {
  if (!container) return;
  const paint = () => {
    container.querySelectorAll('[data-lang]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    container.querySelector('.dc-lang')?.setAttribute('aria-label', t('lang.label'));
  };
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lang]');
    if (!button) return;
    setLang(button.dataset.lang);
    paint();
  });
  onLangChange(paint);
}

// Trang không phải tiếng Việt: dịch phần tĩnh ngay khi module chạy (module chạy sau khi HTML đã đọc xong).
if (globalThis.document) {
  globalThis.document.documentElement.lang = lang;
  if (lang !== 'vi') applyI18n(globalThis.document);
}
