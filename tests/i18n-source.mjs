// Cho các test đọc mã nguồn: chữ tiếng Việt nay nằm trong từ điển i18n-vi*.js, không còn viết
// thẳng trong trang. withVi(mã) nối thêm nội dung các từ điển tiếng Việt, để test vẫn tìm được câu.
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const viDicts = readdirSync(root).filter((f) => /^i18n-vi(-[\w-]+)?\.js$/.test(f)).sort()
  .map((f) => readFileSync(new URL(f, root), 'utf8')).join('\n');

export const withVi = (source) => `${source}\n${viDicts}`;
