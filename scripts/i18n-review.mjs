// Viết i18n-review-en.md: bảng key | tiếng Việt | tiếng Anh để David duyệt bản dịch.
//   node scripts/i18n-review.mjs
import { writeFileSync } from 'node:fs';
import VI from '../i18n-vi.js';
import EN, { NOTES } from '../i18n-en.js';

const cell = (value) => (value && typeof value === 'object'
  ? Object.entries(value).map(([form, text]) => `${form}: ${text}`).join('<br>')
  : String(value ?? '—')).replace(/\|/g, '\\|').replace(/\n/g, '<br>');

const groups = new Map();
for (const key of Object.keys(VI)) {
  const area = key.split('.')[0];
  if (!groups.has(area)) groups.set(area, []);
  groups.get(area).push(key);
}

const flagged = Object.keys(NOTES).filter((key) => key in VI);
const lines = [
  '# Bản dịch tiếng Anh — để David duyệt',
  '',
  'File này được tạo từ `i18n-vi.js` và `i18n-en.js` bằng `node scripts/i18n-review.mjs`. Đừng sửa tay: sửa câu trong `i18n-en.js` rồi chạy lại.',
  '',
  `Tổng: ${Object.keys(VI).length} câu. Cần David quyết: ${flagged.length} chỗ (đánh ⚠).`,
  '',
  '## ⚠ Cần David quyết',
  '',
  '| Key | Tiếng Việt | Tiếng Anh | Cần xem |',
  '|---|---|---|---|',
  ...flagged.map((key) => `| \`${key}\` | ${cell(VI[key])} | ${cell(EN[key])} | ${cell(NOTES[key])} |`),
];
for (const [area, keys] of groups) {
  lines.push('', `## ${area}`, '', '| Key | Tiếng Việt | Tiếng Anh |', '|---|---|---|');
  for (const key of keys) lines.push(`| ${NOTES[key] ? '⚠ ' : ''}\`${key}\` | ${cell(VI[key])} | ${cell(EN[key])} |`);
}
writeFileSync(new URL('../i18n-review-en.md', import.meta.url), `${lines.join('\n')}\n`);
console.log(`i18n-review-en.md: ${Object.keys(VI).length} câu, ${flagged.length} chỗ ⚠`);
