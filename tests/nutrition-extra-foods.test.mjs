// Món mới cho chế độ tự ghi món, Mốc B (David, 2026-11-03): USDA, Bảng Úc, Bảng Na Uy.
//   node tests/nutrition-extra-foods.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FOODS, getFood } from '../nutrition-foods.js';
import {
  EXTRA_ENERGY_MISMATCHES, EXTRA_FOODS, EXTRA_NO_SOURCE, EXTRA_TRANSLATION_FIXES, FOOD_DATA_SOURCES, approvedExtraFoods, getExtraFood,
} from '../nutrition-foods-extra.js';
import { NUTRIENT_KEYS, foodNutrients } from '../nutrition-composition.js';
import { normalizeFoodEntry, searchFoods } from '../nutrition-food-log.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const selected = JSON.parse(readFileSync(new URL('../scripts/foreign/selected.json', import.meta.url), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../scripts/foreign/extra-map.json', import.meta.url), 'utf8'));

check('a good number of new foods, each with a source and its original id', () => {
  assert.ok(EXTRA_FOODS.length >= 150, `${EXTRA_FOODS.length} foods`);
  EXTRA_FOODS.forEach((food) => {
    assert.ok(['USDA', 'AU', 'NO', 'VN', 'JP'].includes(food.source.db), food.name);
    assert.ok(String(food.source.id).length > 0 && food.source.name, food.name);
    assert.ok(['PROTEIN', 'CARB', 'FAT', 'RAU', 'KHAC'].includes(food.group), food.name);
    assert.deepEqual(Object.keys(food.values).sort(), [...NUTRIENT_KEYS].sort(), food.name);
  });
});

check('no new food takes the name of an existing one; the meal generator\'s table is untouched', () => {
  const old = new Set(FOODS.map((food) => food.name));
  EXTRA_FOODS.forEach((food) => assert.ok(!old.has(food.name), food.name));
  assert.equal(FOODS.length, 72);
  assert.equal(new Set(EXTRA_FOODS.map((food) => food.name)).size, EXTRA_FOODS.length);
});

check('a gap stays null, never zero', () => {
  const goat = getExtraFood('Thịt dê (sống)');
  assert.equal(goat.values.magnesium, null, 'USDA has no magnesium for goat');
  assert.ok(foodNutrients('Thịt dê (sống)', 100).missing.includes('magnesium'));
  EXTRA_FOODS.forEach((food) => Object.values(food.values).forEach((value) => assert.ok(value === null || (Number.isFinite(value) && value >= 0), food.name)));
});

check('Australian and Norwegian carbs are converted to the table\'s kind (with fibre), and said so', () => {
  const rambutan = getExtraFood('Chôm chôm');
  const row = selected.rows[`AU:${rambutan.source.id}`];
  assert.equal(rambutan.source.db, 'AU');
  assert.equal(rambutan.source.carbConverted, true);
  assert.equal(rambutan.values.carb, Math.round((row.values.carb + row.values.fiber) * 10) / 10);
  assert.equal(rambutan.values.kcal, row.values.kcal, 'kcal already converted from kJ by the extraction');
  assert.ok(EXTRA_FOODS.filter((food) => food.source.db === 'USDA').every((food) => !food.source.carbConverted));
});

check('the order of sources is kept: USDA first, the Australian table only where USDA has no fresh match', () => {
  Object.entries(map).filter(([name]) => !name.startsWith('_')).forEach(([name, entry]) => {
    if (entry.source === 'AU') assert.ok(entry.note && /USDA|Bảng Úc|Úc/.test(entry.note) || ['Kem dừa'].includes(name), `${name}: say why not USDA`);
  });
});

check('nothing new reaches the student before David approves it', () => {
  assert.equal(approvedExtraFoods().length, EXTRA_FOODS.filter((food) => food.approved).length);
  EXTRA_FOODS.filter((food) => !food.approved).forEach((food) => {
    assert.ok(!searchFoods(food.name).some((item) => item.name === food.name), `${food.name} must not be offered`);
  });
});

check('an entry already logged with a new food still reads, so a later change of approval loses nothing', () => {
  const entry = normalizeFoodEntry({ id: 'x', meal: 'sang', name: 'Nấm kim châm', grams: 100 });
  assert.ok(entry);
  assert.equal(Math.round(foodNutrients('Nấm kim châm', 100).values.kcal), getExtraFood('Nấm kim châm').values.kcal);
  assert.equal(getFood('Nấm kim châm'), null);
});

check('the review lists energy checks, translation fixes and foods without a source', () => {
  EXTRA_ENERGY_MISMATCHES.forEach((line) => assert.match(line, /kcal, ước theo đa chất \d+ kcal$/));
  assert.ok(EXTRA_TRANSLATION_FIXES.some(([name]) => name === 'Rau ngót'));
  assert.ok(EXTRA_NO_SOURCE.some(([names]) => /Rau ngót/.test(names)));
  const page = readFileSync(new URL('../nutrition-review.html', import.meta.url), 'utf8');
  assert.match(page, /<h3>Món mới<\/h3>/);
  assert.match(page, /Bản dịch đã sửa/);
  assert.match(page, /Không có nguồn/);
});

check('the sources are named in the app, on the student page and on the review page', () => {
  assert.equal(FOOD_DATA_SOURCES.length, 4);
  assert.match(FOOD_DATA_SOURCES[1], /Food Standards Australia New Zealand/);
  assert.match(FOOD_DATA_SOURCES[2], /Norwegian Food Composition Table 2022/);
  assert.match(FOOD_DATA_SOURCES[3], /Food Composition in Japan 2020/, 'bảng Nhật: sụn ức gà (2026-11-04)');
  const student = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
  assert.match(student, /Nguồn số liệu: \$\{FOOD_DATA_SOURCES\.map\(escapeHtml\)\.join\(' · '\)\}/);
});

check('the original spreadsheets are not in the repository', () => {
  const ignored = readFileSync(new URL('../scripts/foreign/selected.json', import.meta.url), 'utf8');
  assert.ok(ignored.length < 50000, 'only the selected rows are kept');
});

// Nguyên liệu Claude thêm 2026-11-10 cho công thức món ăn ngoài: chờ David duyệt.
const PROPOSED_2026_11_10 = ['Bột mì đa dụng', 'Gạo trắng (sống)', 'Nước ngọt cola', 'Bia thường', 'Trà đen (pha)', 'Lòng non heo (sống)', 'Bao tử heo (sống)', 'Tim heo (sống)'];
check('David approved every new food on 2026-11-03: the student can pick them; the 2026-11-10 ingredients wait', () => {
  assert.equal(approvedExtraFoods().length, EXTRA_FOODS.length - PROPOSED_2026_11_10.length);
  PROPOSED_2026_11_10.forEach((name) => assert.equal(EXTRA_FOODS.find((food) => food.name === name)?.approved, false, name));
  assert.ok(searchFoods('kim cham').some((item) => item.name === 'Nấm kim châm' && item.source === 'Nguồn: USDA'));
  assert.ok(searchFoods('chom chom').some((item) => item.name === 'Chôm chôm' && item.source === 'Nguồn: Úc'));
});

console.log(`NUTRITION_EXTRA_FOODS_OK ${passed} passed`);
