// Cho các test đọc mã nguồn. Chữ tiếng Việt nay nằm trong từ điển i18n-vi*.js, không còn viết
// thẳng trong trang:
//   withVi(mã) nối thêm nội dung các từ điển tiếng Việt, để test vẫn tìm được câu.
//   asVi(mã)   đọc mã "như trước khi có song ngữ": bỏ thuộc tính data-i18n*, thay ${t('key', {…})}
//              bằng câu tiếng Việt (tham số {tên} thành ${biểu thức}), và t('key') không tham số
//              bằng chuỗi '…'.
import { readFileSync, readdirSync } from 'node:fs';
import VI from '../i18n-vi.js';

const root = new URL('../', import.meta.url);
const viDicts = readdirSync(root).filter((f) => /^i18n-vi(-[\w-]+)?\.js$/.test(f)).sort()
  .map((f) => readFileSync(new URL(f, root), 'utf8')).join('\n');

export const withVi = (source) => `${source}\n${viDicts}`;

const quote = (text) => `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** "{ a: x, b: f(y, z) }" → { a: 'x', b: 'f(y, z)' } (tách theo dấu phẩy ở cấp ngoài cùng). */
function parseParams(body) {
  const out = {};
  let depth = 0; let start = 0; let inStr = null;
  const parts = [];
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i];
    if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue; }
    if (c === '\'' || c === '"' || c === '`') { inStr = c; continue; }
    if ('([{'.includes(c)) depth += 1;
    else if (')]}'.includes(c)) depth -= 1;
    else if (c === ',' && depth === 0) { parts.push(body.slice(start, i)); start = i + 1; }
  }
  parts.push(body.slice(start));
  for (const part of parts) {
    const text = part.trim();
    if (!text) continue;
    const m = text.match(/^([\w$]+)\s*:\s*([\s\S]+)$/);
    if (m) out[m[1]] = m[2].trim();
    else out[text] = text; // { name } viết tắt
  }
  return out;
}

/** Vị trí dấu ) khớp với dấu ( ở `open`. */
function closeParen(src, open) {
  let depth = 0; let inStr = null;
  for (let i = open; i < src.length; i += 1) {
    const c = src[i];
    if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue; }
    if (c === '\'' || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '(') depth += 1;
    else if (c === ')') { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

export function asVi(source) {
  let src = String(source).replace(/ data-i18n(?:-[a-z-]+)?="[\w.]+"/g, '');
  // ${t('key', { … })} và ${t('key')} trong template
  let out = '';
  let i = 0;
  const marker = /\$\{t\('([\w.]+)'/g;
  let m;
  while ((m = marker.exec(src))) {
    const key = m[1];
    const open = m.index + 3; // vị trí "(" sau "${t"
    const close = closeParen(src, open);
    if (close < 0 || src[close + 1] !== '}' || typeof VI[key] !== 'string') continue;
    const inner = src.slice(open + 1, close);
    const comma = inner.indexOf(',');
    let params = {};
    if (comma >= 0) {
      const obj = inner.slice(comma + 1).trim();
      if (!obj.startsWith('{') || !obj.endsWith('}')) continue;
      params = parseParams(obj.slice(1, -1));
    }
    const text = VI[key].replace(/\{(\w+)\}/g, (whole, name) => (name in params ? `\${${params[name]}}` : whole));
    out += src.slice(i, m.index) + text;
    i = close + 2;
    marker.lastIndex = i;
  }
  src = out + src.slice(i);
  return src.replace(/\bt\('([\w.]+)'\)/g, (whole, key) => (key in VI && typeof VI[key] === 'string' ? quote(VI[key]) : whole));
}
