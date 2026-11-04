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
  // 9 vitamin (David, 2026-11-04). A tính theo µg RAE, folate theo µg DFE, K là phylloquinone.
  1106: 'vitaminA', 1162: 'vitaminC', 1114: 'vitaminD', 1109: 'vitaminE', 1185: 'vitaminK',
  1165: 'vitaminB1', 1175: 'vitaminB6', 1190: 'folate', 1178: 'vitaminB12',
};
export const MICRO_KEYS = ['potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc'];
export const VITAMIN_KEYS = ['vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'vitaminB1', 'vitaminB6', 'folate', 'vitaminB12'];
/** Số lẻ khi làm tròn: chất tính bằng mg nhỏ (sắt, kẽm, E, B1, B6) giữ 2 số. */
const DIGITS = { iron: 2, zinc: 2, vitaminE: 2, vitaminB1: 2, vitaminB6: 2, vitaminB12: 2 };
const digitsOf = (key) => DIGITS[key] ?? 1;

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
const extraMapFile = join(root, 'scripts', 'foreign', 'extra-map.json');
const extraMap = existsSync(extraMapFile) ? JSON.parse(readFileSync(extraMapFile, 'utf8')) : {};
const extraEntries = Object.entries(extraMap).filter(([name, entry]) => !name.startsWith('_') && entry && entry.source);
const wanted = new Set([
  ...Object.values(map).filter((m) => m && m.fdcId).map((m) => m.fdcId),
  ...extraEntries.filter(([, entry]) => entry.source === 'USDA').map(([, entry]) => entry.id),
]);
const descriptions = new Map(readCsv(join(dir, 'food.csv')).filter((r) => wanted.has(r.fdc_id)).map((r) => [r.fdc_id, r.description]));
const values = new Map();
const usdaValues = values;
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
// Bảng Úc rồi Na Uy (scripts/foreign): chỉ lấp ô còn trống sau Việt Nam và USDA.
const foreignDir = join(root, 'scripts', 'foreign');
const foreignMap = existsSync(join(foreignDir, 'food-map.json')) ? JSON.parse(readFileSync(join(foreignDir, 'food-map.json'), 'utf8')) : {};
const foreignRows = existsSync(join(foreignDir, 'selected.json')) ? JSON.parse(readFileSync(join(foreignDir, 'selected.json'), 'utf8')) : { rows: {}, sources: {} };
function withForeign(name, entry) {
  const m = foreignMap[name];
  if (!m || name.startsWith('_')) return entry;
  const row = foreignRows.rows[`${m.source}:${m.id}`];
  if (!row) { problems.push(`Thiếu dòng ${m.source}:${m.id} trong scripts/foreign/selected.json (chạy extract.py --select)`); return entry; }
  const filled = [];
  MICRO_KEYS.forEach((k) => {
    if (entry.micros[k] === null && row.values[k] !== null && row.values[k] !== undefined) { entry.micros[k] = row.values[k]; entry.microSource[k] = m.source; filled.push(k); }
  });
  if (filled.length) entry.foreign = { source: m.source, id: m.id, name: row.name, note: m.note || '' };
  return entry;
}
function withVn(name, entry) {
  return withForeign(name, withVnOnly(name, entry));
}
function withVnOnly(name, entry) {
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
    entries.push(withVn(food.name, { name: food.name, source: null, note: m.note || '', micros: Object.fromEntries(MICRO_KEYS.map((k) => [k, null])), vitamins: Object.fromEntries(VITAMIN_KEYS.map((k) => [k, null])) }));
    continue;
  }
  const usda = values.get(m.fdcId);
  if (!usda || !descriptions.has(m.fdcId)) { problems.push(`Không thấy FDC ${m.fdcId} cho ${food.name}`); continue; }
  const factor = m.scaleBy === 'carb' ? food.carb / usda.carb : 1;
  const micros = Object.fromEntries(MICRO_KEYS.map((k) => {
    if ((m.omit || []).includes(k) || usda[k] === undefined) return [k, null];
    return [k, round(usda[k] * factor, digitsOf(k))];
  }));
  // Vitamin chỉ lấy từ USDA (bảng Việt Nam, Úc, Na Uy trong máy chưa tách cột vitamin).
  const vitamins = Object.fromEntries(VITAMIN_KEYS.map((k) => {
    if ((m.omit || []).includes(k) || usda[k] === undefined) return [k, null];
    return [k, round(usda[k] * factor, digitsOf(k))];
  }));
  entries.push(withVn(food.name, {
    name: food.name,
    source: { db: 'USDA', dataset: 'SR Legacy 2018-04', fdcId: Number(m.fdcId), description: descriptions.get(m.fdcId), scaled: factor !== 1 ? round(factor, 3) : undefined },
    note: m.note || '',
    micros,
    vitamins,
    usdaMacros: { kcal: usda.kcal, protein: usda.protein, carb: usda.carb, fat: usda.fat, fiber: usda.fiber ?? null },
  }));
  if (factor !== 1) continue; // lệch là cố ý (đã quy đổi)
  const diffs = [['kcal', food.kcal, usda.kcal, 10], ['protein', food.protein, usda.protein, 1], ['carb', food.carb, usda.carb, 1], ['fat', food.fat, usda.fat, 1]]
    .filter(([, app, ref, minAbs]) => Number.isFinite(ref) && Math.abs(app - ref) >= minAbs && Math.abs(app - ref) / Math.max(app, ref) > 0.15)
    .map(([key, app, ref]) => `${key} ${app} (USDA ${round(ref, 1)})`);
  if (diffs.length) mismatches.push(`${food.name}: ${diffs.join(', ')}${m.macroDecision ? ` · ${m.macroDecision}` : ''}`);
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
/** 9 vitamin trên 100 g: A µg RAE, C mg, D µg, E mg, K µg, B1 mg, B6 mg, folate µg DFE, B12 µg. */
export const VITAMIN_KEYS = Object.freeze(${JSON.stringify(VITAMIN_KEYS)});

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
  const base = {
    id: `${slug(entry.food)}--${slug(entry.label)}`, food: entry.food, label: entry.label, note: entry.note || '', approved: entry.approved === true,
    ...(entry.refs ? { refs: entry.refs } : {}), ...(entry.proposal ? { proposal: entry.proposal } : {}),
  };
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
// ---------------- Món mới cho chế độ tự ghi món ----------------
// Một dòng nguồn cho cả 11 chất. Carb của Úc và Na Uy là carb khả dụng (không gồm chất xơ): cộng
// chất xơ cho cùng kiểu với bảng cũ (USDA "by difference", gồm chất xơ) và ghi lại đã quy đổi.
const ALL_KEYS = ['kcal', 'protein', 'carb', 'fat', 'fiber', ...MICRO_KEYS, ...VITAMIN_KEYS];
const oldNames = new Set(FOODS.map((food) => food.name));
const extras = [];
const energyMismatches = [];
for (const [name, entry] of extraEntries) {
  if (oldNames.has(name)) { problems.push(`Món mới trùng tên bảng cũ: ${name}`); continue; }
  let values; let originalName; let carbConverted = false;
  if (entry.values) {
    // Nguồn không có trong máy (VD bảng Nhật MEXT): số liệu chép tay từ bảng gốc, ghi mã dòng.
    values = Object.fromEntries(ALL_KEYS.map((k) => [k, entry.values[k] ?? null]));
    originalName = entry.sourceName || '';
  } else if (entry.source === 'USDA') {
    const row = usdaValues.get(entry.id);
    if (!row || !descriptions.has(entry.id)) { problems.push(`Không thấy FDC ${entry.id} cho món mới ${name}`); continue; }
    values = Object.fromEntries(ALL_KEYS.map((k) => [k, row[k] ?? null]));
    originalName = descriptions.get(entry.id);
  } else {
    const row = foreignRows.rows[`${entry.source}:${entry.id}`];
    if (!row) { problems.push(`Thiếu dòng ${entry.source}:${entry.id} trong selected.json cho ${name} (chạy extract.py --select)`); continue; }
    values = Object.fromEntries(ALL_KEYS.map((k) => [k, row.values[k] ?? null]));
    if (values.carb !== null && values.fiber !== null) { values.carb = round(values.carb + values.fiber, 2); carbConverted = true; }
    else values.carb = null;
    originalName = row.name;
  }
  ALL_KEYS.forEach((k) => { if (values[k] !== null) values[k] = round(values[k], digitsOf(k)); });
  const { kcal, protein, carb, fat } = values;
  // Kiểm tra calo: chất xơ tính 2 kcal/g (carb ở đây gồm chất xơ). Báo khi lệch hơn 15% VÀ hơn 15 kcal,
  // vì rau và gia vị có hệ số năng lượng riêng nên lệch nhỏ là bình thường.
  if ([kcal, protein, carb, fat].every((v) => v !== null) && kcal >= 20) {
    const fibre = values.fiber ?? 0;
    const estimate = 4 * protein + 4 * Math.max(0, carb - fibre) + 2 * fibre + 9 * fat;
    if (Math.abs(kcal - estimate) / kcal > 0.15 && Math.abs(kcal - estimate) > 15) {
      energyMismatches.push(`${name}: ${kcal} kcal, ước theo đa chất ${round(estimate, 0)} kcal`);
    }
  }
  extras.push({
    name, group: entry.group, values, note: entry.note || '', approved: entry.approved === true,
    source: { db: entry.source, id: entry.id, name: originalName, ...(carbConverted ? { carbConverted: true } : {}) },
  });
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
const notesFile = join(root, 'scripts', 'foreign', 'extra-notes.json');
const notes = existsSync(notesFile) ? JSON.parse(readFileSync(notesFile, 'utf8')) : { translations: [], noSource: [] };
writeFileSync(join(root, 'nutrition-foods-extra.js'), `// ============================================================
// DAVID COACHING — Món mới cho chế độ tự ghi món (11 chất trên 100 g, đúng trạng thái như tên)
// ============================================================
// SINH TỰ ĐỘNG bởi scripts/usda/build-micros.mjs từ scripts/foreign/extra-map.json. Đừng sửa tay.
// Mỗi món lấy cả 11 chất từ MỘT dòng nguồn (USDA SR Legacy, Bảng Úc hoặc Bảng Na Uy), ghi mã gốc.
// null = nguồn không có số liệu chất đó (không đoán). approved false: học viên chưa thấy món này.
// Không thuộc FOODS: trình tạo thực đơn tự động không dùng các món này.

export const EXTRA_FOODS = Object.freeze(${JSON.stringify(extras, null, 1)});

/** Món có calo lệch quá 15% so với 4×đạm + 4×carb + 9×béo, để David xem. */
export const EXTRA_ENERGY_MISMATCHES = Object.freeze(${JSON.stringify(energyMismatches, null, 1)});

/** Bản dịch đã sửa trong danh sách tên của David, và món không có nguồn. */
export const EXTRA_TRANSLATION_FIXES = Object.freeze(${JSON.stringify(notes.translations, null, 1)});
export const EXTRA_NO_SOURCE = Object.freeze(${JSON.stringify(notes.noSource, null, 1)});

export const FOOD_DATA_SOURCES = Object.freeze([
  'USDA FoodData Central, SR Legacy (2018-04)',
  ${JSON.stringify(foreignRows.sources.AU?.title || 'Australian Food Composition Database (Food Standards Australia New Zealand)')},
  ${JSON.stringify(foreignRows.sources.NO?.title || 'The Norwegian Food Composition Table 2022 (Matvaretabellen)')},
  'Standard Tables of Food Composition in Japan 2020, 8th ed. (MEXT)',
]);

const BY_NAME = new Map(EXTRA_FOODS.map((food) => [food.name, food]));
/** Món mới theo tên (kể cả chưa duyệt, để tính lại món đã ghi). */
export function getExtraFood(name) { return BY_NAME.get(name) || null; }
/** Món mới học viên được chọn: chỉ món David đã duyệt. */
export function approvedExtraFoods() { return EXTRA_FOODS.filter((food) => food.approved); }
`);
console.log(`Đã ghi nutrition-foods-extra.js: ${extras.length} món mới (${extras.filter((e) => e.approved).length} đã duyệt), ${energyMismatches.length} món lệch kiểm tra calo.`);
console.log(`Đã ghi nutrition-micros.js: ${entries.length} món, ${entries.filter((e) => MICRO_KEYS.every((k) => e.micros[k] === null)).length} món chưa có số liệu vi chất nào.`);
console.log(`Lệch quá 15% (${mismatches.length}):\n  ${mismatches.join('\n  ')}`);
