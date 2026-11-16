// Cho các test đọc mã nguồn. Chữ tiếng Việt nay nằm trong từ điển i18n-vi*.js, không còn viết
// thẳng trong trang:
//   withVi(mã) nối thêm nội dung các từ điển tiếng Việt, để test vẫn tìm được câu.
//   asVi(mã)   đọc mã "như trước khi có song ngữ": bỏ thuộc tính data-i18n*, thay ${t('key')}
//              và t('key') (không tham số) bằng chính câu tiếng Việt. Lời gọi có tham số giữ nguyên.
import { readFileSync, readdirSync } from 'node:fs';
import VI from '../i18n-vi.js';

const root = new URL('../', import.meta.url);
const viDicts = readdirSync(root).filter((f) => /^i18n-vi(-[\w-]+)?\.js$/.test(f)).sort()
  .map((f) => readFileSync(new URL(f, root), 'utf8')).join('\n');

export const withVi = (source) => `${source}\n${viDicts}`;

const quote = (text) => `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
export function asVi(source) {
  return String(source)
    .replace(/ data-i18n(?:-[a-z-]+)?="[\w.]+"/g, '')
    .replace(/\$\{t\('([\w.]+)'\)\}/g, (whole, key) => (key in VI ? VI[key] : whole))
    .replace(/\bt\('([\w.]+)'\)/g, (whole, key) => (key in VI && typeof VI[key] === 'string' ? quote(VI[key]) : whole));
}
