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

// Bật cho mọi người (2026-11-17): học viên thấy nút VI/EN, người mới được chọn theo trình duyệt.
// Người đang dùng giữ tiếng Việt: máy đã có dữ liệu của app, hoặc tài khoản tạo trước LANG_ROLLOUT_AT.
export const I18N_PUBLIC = true;
export const LANG_ROLLOUT_AT = Date.parse('2026-11-18T00:00:00+07:00');

/** Khoá localStorage app đã dùng trước khi có song ngữ: thấy một khoá là máy này đã dùng app. */
const PRIOR_USE_PREFIXES = Object.freeze(['dc_', 'dtp_', 'david.']);
export function hasPriorUse(keys = []) {
  return [].concat(keys).some((key) => key !== LANG_KEY && PRIOR_USE_PREFIXES.some((prefix) => String(key).startsWith(prefix)));
}
function storageKeys() {
  try { const s = globalThis.localStorage; return s ? Array.from({ length: s.length }, (_, i) => s.key(i)) : []; } catch { return []; }
}

const normalize = (value) => (LANGS.includes(value) ? value : null);

/** Ngôn ngữ dùng: đã chọn trên máy, else (khi đã mở) theo trình duyệt, else tiếng Việt. */
export function detectLang({ saved = null, browser = [], isPublic = I18N_PUBLIC } = {}) {
  const chosen = normalize(saved);
  if (chosen) return chosen;
  if (!isPublic) return 'vi';
  const first = [].concat(browser).find(Boolean) || '';
  // Không biết ngôn ngữ trình duyệt: tiếng Việt.
  if (!first) return 'vi';
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
  // Người đang dùng (máy đã có dữ liệu của app, chưa từng chọn ngôn ngữ): giữ tiếng Việt như trước.
  if (!fromUrl && !normalize(storage.get()) && hasPriorUse(storageKeys())) storage.set('vi');
  // Chỉ trình duyệt thật: Node (test) cũng có navigator nhưng không phải người dùng.
  const nav = /^Node\.js/.test(globalThis.navigator?.userAgent || '') ? null : globalThis.navigator;
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
  let text = String(value);
  // "Workout {day}": chỉ giữ chữ Workout khi tên buổi ngắn (A, B, 1, 2…). Tên buổi dài do David đặt
  // ("Toàn thân · Squat", "100 Rep - Arm Day") hiện một mình, không thành "Workout Toàn thân · Squat".
  if (forLang === 'en') text = text.replace(/Workout \{(\w+)\}/g, (whole, name) => (isShortDayLabel(params[name]) ? whole : `{${name}}`));
  return text.replace(/\{(\w+)\}/g, (whole, name) => (params[name] === undefined ? whole : String(params[name])));
}

/** Tên buổi ngắn kiểu "A", "B", "1", "C2": đọc là "Workout A". */
export function isShortDayLabel(label) {
  return label !== undefined && /^[\p{L}\d]{1,3}$/u.test(String(label).trim());
}

const ATTRS = Object.freeze([['data-i18n-placeholder', 'placeholder'], ['data-i18n-aria-label', 'aria-label'], ['data-i18n-title', 'title'], ['data-i18n-alt', 'alt']]);
const SELECTOR = '[data-i18n], [data-i18n-html], [data-i18n-init], [data-i18n-html-init], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title], [data-i18n-alt]';

/** Dịch các phần tử đánh dấu trong `root`. Chỉ đổi chữ, không đụng giá trị người dùng đã nhập.
 *  data-i18n: chữ thường. data-i18n-html: chữ có thẻ in nghiêng/đậm/link (lấy từ từ điển của app).
 *  data-i18n-init / data-i18n-html-init: chữ ban đầu của phần tử mà trang tự ghi lại sau đó
 *  ("Đang tải…"): chỉ dịch khi trang mở, không ghi đè khi đổi ngôn ngữ giữa chừng. */
export function applyI18n(root = globalThis.document, { initial = false } = {}) {
  if (!root?.querySelectorAll) return;
  const scope = root.nodeType === 9 ? root.documentElement : root;
  const all = [scope, ...root.querySelectorAll(SELECTOR)];
  for (const el of all) {
    if (!el?.getAttribute) continue;
    const key = el.getAttribute('data-i18n') || (initial && el.getAttribute('data-i18n-init'));
    if (key) { const text = t(key); if (el.textContent !== text) el.textContent = text; }
    const htmlKey = el.getAttribute('data-i18n-html') || (initial && el.getAttribute('data-i18n-html-init'));
    if (htmlKey) { const html = t(htmlKey); if (el.innerHTML !== html) el.innerHTML = html; }
    for (const [attr, target] of ATTRS) {
      const attrKey = el.getAttribute(attr);
      if (attrKey) el.setAttribute(target, t(attrKey));
    }
  }
  if (root.nodeType === 9) root.documentElement.lang = lang;
}

// Trang tự vẽ lại phần dựng bằng JS khi đổi ngôn ngữ (registerLangRerender). Trang chưa đăng ký:
// tải lại nếu chưa nhập gì; đang nhập dở thì chỉ đổi khung app, phần còn lại đổi ở lần mở sau.
let rerender = null;
let dirty = false;
export function registerLangRerender(fn) { rerender = typeof fn === 'function' ? fn : null; }
export const pageIsDirty = () => dirty || Boolean(globalThis.document?.body?.classList.contains('app-shell-workout-active'));
if (globalThis.document) {
  const mark = (event) => {
    const target = event.target;
    if (target?.closest?.('#app-shell-account-menu, .dc-lang, .login-lang')) return;
    if (target?.matches?.('input, textarea, select')) dirty = true;
  };
  globalThis.document.addEventListener('input', mark, true);
  globalThis.document.addEventListener('change', mark, true);
}

/** Đổi ngôn ngữ: lưu trên máy, dịch lại phần tĩnh, báo cho phần dựng bằng JS. */
/** Sau khi đăng nhập, khi máy chưa có lựa chọn ngôn ngữ: tài khoản tạo trước ngày bật song ngữ giữ
 *  tiếng Việt; tài khoản mới giữ ngôn ngữ vừa tự chọn theo trình duyệt. `createdAt`: thời điểm tạo
 *  tài khoản (chuỗi ngày hoặc số ms); không rõ thì không làm gì. */
export function settleLangForAccount(createdAt) {
  if (normalize(storage.get())) return lang;
  const created = typeof createdAt === 'number' ? createdAt : Date.parse(createdAt ?? '');
  if (!Number.isFinite(created)) return lang;
  return created < LANG_ROLLOUT_AT ? setLang('vi') : (storage.set(lang), lang);
}

export function setLang(next) {
  const chosen = normalize(next);
  if (!chosen) return lang;
  storage.set(chosen);
  if (chosen === lang) return lang;
  lang = chosen;
  const doc = globalThis.document;
  if (!doc) return lang;
  if (rerender) {
    applyI18n(doc);
    rerender(lang);
  } else if (!pageIsDirty()) {
    globalThis.location.reload();
    return lang;
  } else {
    doc.documentElement.lang = lang;
    ['app-shell-sidebar', 'app-shell-bottom', 'app-shell-toolstrip', 'app-shell-account', 'app-shell-account-menu']
      .forEach((id) => { const el = doc.getElementById(id); if (el) applyI18n(el); });
    showLaterNote();
  }
  globalThis.dispatchEvent?.(new CustomEvent('dc:langchange', { detail: { lang } }));
  return lang;
}

function showLaterNote() {
  import('./app-dialog.js').then(({ toast }) => toast(t('lang.laterNote'))).catch(() => {});
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

/** Ngày 'YYYY-MM-DD' (hoặc một Date, lấy ngày theo giờ máy hay `timeZone`): "16/11" (vi) / "Nov 16" (en); `year: true` thêm năm,
 *  `weekday: true` thêm thứ. '' với giá trị không phải ngày. */
export function fmtDate(value, { year = false, weekday = false, pad = true, timeZone } = {}, forLang = lang) {
  let date = null;
  if (value instanceof Date) {
    // Một thời điểm: lấy ngày theo giờ máy (hoặc timeZone), như toLocaleDateString vẫn làm.
    if (Number.isNaN(value.getTime())) return '';
    const iso = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
    value = iso;
  }
  {
    const [y, m, d] = String(value || '').split('-').map(Number);
    if (!y || !m || !d) return '';
    date = new Date(Date.UTC(y, m - 1, d));
  }
  if (Number.isNaN(date.getTime())) return '';
  if (forLang === 'vi') {
    // Giữ đúng kiểu đang dùng trên app: "Thứ Hai 16/11", "16/11/2026".
    // pad: false giữ kiểu toLocaleDateString('vi-VN') cũ ("9/11/2026").
    const dd = String(date.getUTCDate()).padStart(pad ? 2 : 1, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(pad ? 2 : 1, '0');
    const day = `${dd}/${mm}${year ? `/${date.getUTCFullYear()}` : ''}`;
    return weekday ? `${t(`date.weekday.${date.getUTCDay()}`, {}, 'vi')} ${day}` : day;
  }
  return new Intl.DateTimeFormat(LOCALE[forLang], { timeZone: 'UTC', month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), ...(weekday ? { weekday: 'short' } : {}) }).format(date);
}

// Cho các script cổ điển (không import được module này), như rir-calibration-engine.js.
if (typeof globalThis !== 'undefined') globalThis.dcT = (key, params) => t(key, params);

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
  if (lang !== 'vi') applyI18n(globalThis.document, { initial: true });
}
