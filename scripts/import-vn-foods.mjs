// Nhập Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng) để thay số USDA bằng số Việt Nam.
//
//   node scripts/import-vn-foods.mjs <file.csv>
//
// File CSV (lưu từ Excel, dấu phẩy hoặc chấm phẩy), một dòng một thực phẩm, giá trị trên 100 g
// phần ăn được. Cột được nhận theo tên (có dấu hoặc không): tên thực phẩm, mã số (tuỳ chọn),
// kali, natri, canxi, magie, sắt, kẽm (mg). Ghép tên với bảng của app qua
// scripts/vn/vn-name-map.json ({"Tên trong app": "Tên trong bảng Việt Nam"}); món không có trong
// file ghép thì so tên trùng khớp (bỏ phần trong ngoặc).
//
// Ghi scripts/vn/vn-foods.json, rồi chạy lại scripts/usda/build-micros.mjs: món nào có số Việt
// Nam thì dùng số Việt Nam (ô trống trong bảng Việt Nam vẫn giữ số USDA, có ghi nguồn từng ô).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOODS } from '../nutrition-foods.js';

const here = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2];
if (!file) { console.error('Cách dùng: node scripts/import-vn-foods.mjs <file.csv>'); process.exit(1); }

export const plain = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

const COLUMNS = {
  name: ['ten thuc pham', 'ten', 'thuc pham', 'name', 'food'],
  code: ['ma so', 'ma', 'stt', 'code'],
  potassium: ['kali', 'potassium', 'k'],
  sodium: ['natri', 'sodium', 'na'],
  calcium: ['canxi', 'calci', 'calcium', 'ca'],
  magnesium: ['magie', 'magnesi', 'magnesium', 'mg'],
  iron: ['sat', 'iron', 'fe'],
  zinc: ['kem', 'zinc', 'zn'],
};

function splitLine(line, sep) {
  const out = []; let cur = ''; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (quoted) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (c === '"') quoted = false; else cur += c; }
    else if (c === '"') quoted = true; else if (c === sep) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map((value) => value.trim());
}

const lines = readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((line) => line.trim());
const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
const head = splitLine(lines[0], sep).map((h) => plain(h).replace(/\s*mg$/, '').trim());
const index = Object.fromEntries(Object.entries(COLUMNS).map(([key, names]) => [key, head.findIndex((h) => names.includes(h))]));
const missing = Object.entries(index).filter(([key, i]) => i < 0 && key !== 'code').map(([key]) => key);
if (index.name < 0) { console.error(`Không thấy cột tên thực phẩm. Các cột: ${head.join(' | ')}`); process.exit(1); }
if (missing.length) console.warn(`Cảnh báo: không thấy cột ${missing.join(', ')} (để trống, giữ số USDA).`);

const number = (raw) => {
  const text = String(raw ?? '').replace(/\s/g, '').replace(',', '.');
  if (!text || text === '-' || text === '…') return null;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
};
const rows = lines.slice(1).map((line) => splitLine(line, sep)).map((cells) => ({
  name: cells[index.name],
  code: index.code >= 0 ? cells[index.code] : '',
  micros: Object.fromEntries(['potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc'].map((k) => [k, index[k] >= 0 ? number(cells[index[k]]) : null])),
}));
const byName = new Map(rows.map((row) => [plain(row.name), row]));

const mapFile = join(here, 'vn', 'vn-name-map.json');
const nameMap = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, 'utf8')) : {};
const matched = {};
const unmatched = [];
for (const food of FOODS) {
  const row = byName.get(plain(nameMap[food.name] || food.name));
  if (!row) { unmatched.push(food.name); continue; }
  matched[food.name] = { code: row.code, vnName: row.name, micros: row.micros };
}
mkdirSync(join(here, 'vn'), { recursive: true });
writeFileSync(join(here, 'vn', 'vn-foods.json'), `${JSON.stringify({ source: file.split('/').pop(), importedAt: new Date().toISOString().slice(0, 10), foods: matched }, null, 2)}\n`);
console.log(`Khớp ${Object.keys(matched).length}/${FOODS.length} món. Đã ghi scripts/vn/vn-foods.json.`);
if (unmatched.length) console.log(`Chưa khớp (thêm vào scripts/vn/vn-name-map.json nếu bảng có món tương ứng):\n  ${unmatched.join('\n  ')}`);
console.log('Tiếp theo: chạy lại node scripts/usda/build-micros.mjs <thư mục USDA>.');
