// Sinh nutrition-micros.js từ bộ dữ liệu USDA FoodData Central (SR Legacy, CSV).
//
//   1. Tải https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip
//      và giải nén vào một thư mục bất kỳ.
//   2. node scripts/usda/build-micros.mjs <thư mục có food.csv và food_nutrient.csv>
//
// Ghép món theo scripts/usda/food-map.json. Không bao giờ đoán: món không có trong USDA
// (fdcId null) thì vi chất để null. In ra danh sách món có calo/đa chất trong bảng của app
// lệch quá 15% so với USDA, để David quyết; script không sửa bảng của app.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOODS } from '../../nutrition-foods.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const dir = process.argv[2];
if (!dir) { console.error('Cách dùng: node scripts/usda/build-micros.mjs <thư mục CSV SR Legacy>'); process.exit(1); }

const NUTRIENTS = {
  1008: 'kcal', 1003: 'protein', 1004: 'fat', 1005: 'carb', 1079: 'fiber',
  1092: 'potassium', 1093: 'sodium', 1087: 'calcium', 1090: 'magnesium', 1089: 'iron', 1095: 'zinc',
};
export const MICRO_KEYS = ['potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc'];

function parseCsvLine(line) {
  const out = []; let cur = ''; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (c === '"') quoted = false; else cur += c;
    } else if (c === '"') quoted = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out;
}
function readCsv(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const head = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => Object.fromEntries(parseCsvLine(line).map((v, i) => [head[i], v])));
}

const map = JSON.parse(readFileSync(join(here, 'food-map.json'), 'utf8'));
const wanted = new Set(Object.values(map).filter((m) => m && m.fdcId).map((m) => m.fdcId));
const descriptions = new Map(readCsv(join(dir, 'food.csv')).filter((r) => wanted.has(r.fdc_id)).map((r) => [r.fdc_id, r.description]));
const values = new Map();
for (const row of readCsv(join(dir, 'food_nutrient.csv'))) {
  if (!wanted.has(row.fdc_id)) continue;
  const key = NUTRIENTS[row.nutrient_id];
  if (!key) continue;
  if (!values.has(row.fdc_id)) values.set(row.fdc_id, {});
  values.get(row.fdc_id)[key] = Number(row.amount);
}

const round = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits;
// Bảng thành phần thực phẩm Việt Nam (scripts/import-vn-foods.mjs): ô có số thì thắng số USDA.
const vnFile = join(root, 'scripts', 'vn', 'vn-foods.json');
const vn = existsSync(vnFile) ? JSON.parse(readFileSync(vnFile, 'utf8')) : { foods: {} };
function withVn(name, entry) {
  const row = vn.foods[name];
  const microSource = Object.fromEntries(MICRO_KEYS.map((k) => [k, entry.micros[k] === null ? null : 'USDA']));
  if (row) {
    MICRO_KEYS.forEach((k) => {
      if (row.micros[k] !== null && row.micros[k] !== undefined) { entry.micros[k] = row.micros[k]; microSource[k] = 'VN'; }
    });
    entry.vn = { file: vn.source, code: row.code || '', name: row.vnName };
  }
  return { ...entry, microSource };
}
const entries = [];
const mismatches = [];
const problems = [];
for (const food of FOODS) {
  const m = map[food.name];
  if (!m) { problems.push(`Thiếu trong food-map.json: ${food.name}`); continue; }
  if (!m.fdcId) {
    entries.push(withVn(food.name, { name: food.name, source: null, note: m.note || '', micros: Object.fromEntries(MICRO_KEYS.map((k) => [k, null])) }));
    continue;
  }
  const usda = values.get(m.fdcId);
  if (!usda || !descriptions.has(m.fdcId)) { problems.push(`Không thấy FDC ${m.fdcId} cho ${food.name}`); continue; }
  const factor = m.scaleBy === 'carb' ? food.carb / usda.carb : 1;
  const micros = Object.fromEntries(MICRO_KEYS.map((k) => {
    if ((m.omit || []).includes(k) || usda[k] === undefined) return [k, null];
    return [k, round(usda[k] * factor, k === 'iron' || k === 'zinc' ? 2 : 1)];
  }));
  entries.push(withVn(food.name, {
    name: food.name,
    source: { db: 'USDA', dataset: 'SR Legacy 2018-04', fdcId: Number(m.fdcId), description: descriptions.get(m.fdcId), scaled: factor !== 1 ? round(factor, 3) : undefined },
    note: m.note || '',
    micros,
    usdaMacros: { kcal: usda.kcal, protein: usda.protein, carb: usda.carb, fat: usda.fat, fiber: usda.fiber ?? null },
  }));
  if (factor !== 1) continue; // lệch là cố ý (đã quy đổi)
  const diffs = [['kcal', food.kcal, usda.kcal, 10], ['protein', food.protein, usda.protein, 1], ['carb', food.carb, usda.carb, 1], ['fat', food.fat, usda.fat, 1]]
    .filter(([, app, ref, minAbs]) => Number.isFinite(ref) && Math.abs(app - ref) >= minAbs && Math.abs(app - ref) / Math.max(app, ref) > 0.15)
    .map(([key, app, ref]) => `${key} ${app} (USDA ${round(ref, 1)})`);
  if (diffs.length) mismatches.push(`${food.name}: ${diffs.join(', ')}`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

const header = `// ============================================================
// DAVID COACHING — Vi chất của bảng thực phẩm (mg trên 100 g, đúng trạng thái như tên món)
// ============================================================
// SINH TỰ ĐỘNG bởi scripts/usda/build-micros.mjs từ USDA FoodData Central (SR Legacy 2018-04,
// dữ liệu công khai). Đừng sửa tay: sửa scripts/usda/food-map.json rồi chạy lại script.
// Khi có Bảng thành phần thực phẩm Việt Nam, scripts/import-vn-foods.mjs ghi đè các món khớp.
//
// null = chưa có số liệu đáng tin (không đoán). Calo và đa chất vẫn lấy từ nutrition-foods.js;
// usdaMacros chỉ để đối chiếu trên trang duyệt.
`;
writeFileSync(join(root, 'nutrition-micros.js'), `${header}
export const MICRO_KEYS = Object.freeze(${JSON.stringify(MICRO_KEYS)});

export const FOOD_MICROS = Object.freeze(${JSON.stringify(Object.fromEntries(entries.map(({ name, ...rest }) => [name, rest])), null, 2)});

/** Món có calo/đa chất trong bảng lệch quá 15% so với USDA, chờ David quyết. */
export const MACRO_MISMATCHES = Object.freeze(${JSON.stringify(mismatches, null, 2)});
`);
// ---------------- Khẩu phần ----------------
const portionMap = JSON.parse(readFileSync(join(here, 'portion-map.json'), 'utf8'));
const usdaPortions = readCsv(join(dir, 'food_portion.csv'));
const foodNames = new Set(FOODS.map((food) => food.name));
const slug = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const portions = portionMap.portions.map((entry) => {
  if (!foodNames.has(entry.food)) problems.push(`Khẩu phần cho món không có trong bảng: ${entry.food}`);
  const base = { id: `${slug(entry.food)}--${slug(entry.label)}`, food: entry.food, label: entry.label, note: entry.note || '', approved: entry.approved === true };
  if (entry.usda) {
    const fdcId = map[entry.food]?.fdcId;
    const row = usdaPortions.find((r) => r.fdc_id === fdcId && `${r.amount} ${r.modifier}`.trim() === entry.usda);
    if (!row) { problems.push(`Không thấy khẩu phần USDA "${entry.usda}" cho ${entry.food}`); return null; }
    return { ...base, grams: Number(row.gram_weight), source: { db: 'USDA', fdcId: Number(fdcId), measure: entry.usda } };
  }
  const grams = entry.grams === null || entry.grams === undefined ? null : Number(entry.grams);
  return { ...base, grams, source: grams === null ? null : { db: 'David' } };
}).filter(Boolean);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
writeFileSync(join(root, 'nutrition-portions.js'), `// ============================================================
// DAVID COACHING — Khẩu phần quen thuộc (gram)
// ============================================================
// SINH TỰ ĐỘNG bởi scripts/usda/build-micros.mjs từ scripts/usda/portion-map.json.
// source USDA: gram lấy từ food_portion của USDA SR Legacy. grams null: khẩu phần kiểu Việt chờ
// David điền. approved false: học viên chưa thấy khẩu phần này.

export const PORTIONS = Object.freeze(${JSON.stringify(portions, null, 2)});

/** Khẩu phần học viên dùng được cho một món: đã duyệt và có gram. */
export function portionsFor(food) {
  return PORTIONS.filter((portion) => portion.food === food && portion.approved && portion.grams > 0);
}
`);
console.log(`Đã ghi nutrition-portions.js: ${portions.length} khẩu phần, ${portions.filter((p) => p.grams === null).length} chờ David điền gram, ${portions.filter((p) => p.approved).length} đã duyệt.`);
console.log(`Đã ghi nutrition-micros.js: ${entries.length} món, ${entries.filter((e) => !e.source).length} món chưa có số liệu.`);
console.log(`Lệch quá 15% (${mismatches.length}):\n  ${mismatches.join('\n  ')}`);
