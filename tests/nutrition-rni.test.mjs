// Nhu cầu vi chất khuyến nghị (Viện Dinh dưỡng Quốc gia) và 9 vitamin (David, 2026-11-04).
//   node tests/nutrition-rni.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  AGE_GROUPS, DRI_SOURCE, DRI_VITAMINS, FOLATE_NOTE, IRON_ABSORPTION, RNI_SOURCE, RNI_TABLE, ageGroupFor, micronutrientTargets,
} from '../nutrition-rni.js';
import { VITAMIN_KEYS, foodNutrients, recipeNutrients, roundNutrients, streetDishNutrients } from '../nutrition-composition.js';
import { dayTotals, nutrientProgress, targetsFromPlan } from '../nutrition-food-log.js';
import { calculateSuggestedTargets } from '../nutrition-engine.js';
import { FOOD_MICROS } from '../nutrition-micros.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const snapshot = JSON.parse(read('scripts/nin/rni-2026-11-04.json'));
const num = (text) => (text === undefined || text === '-' ? null : Number(String(text).replace(/[<>=]/g, '').replace(',', '.')));

check('every number in the table is the one the Institute tool showed (snapshot 2026-11-04)', () => {
  const names = {
    vitaminA: 'Vitamin A', vitaminD: 'Vitamin D', vitaminB1: 'Vitamin B1', vitaminB6: 'Vitamin B6', folate: 'Axit folic', vitaminC: 'Vitamin C',
    calcium: 'Canxi', magnesium: 'Magie', zinc: 'Kẽm', potassium: 'Kali', sodium: 'Natri', fiber: 'Chất xơ',
  };
  let checked = 0;
  for (const group of AGE_GROUPS) for (const sex of ['male', 'female']) {
    const source = snapshot.tables[`${group.id}:${sex}`];
    const mine = RNI_TABLE[group.id][sex];
    Object.entries(names).forEach(([key, label]) => { assert.equal(mine[key], num(source[label]), `${group.id} ${sex} ${key}`); checked += 1; });
    if (!(group.id === '50-64' && sex === 'female')) assert.equal(mine.iron[10], num(source['Sắt']), `${group.id} ${sex} sắt 10%`);
  }
  assert.equal(checked, 120);
  assert.match(RNI_SOURCE.url, /^https:\/\/viendinhduong\.vn\//);
});

check('iron at the 15% absorption level, as the footnote gives for more than 90 g meat or fish a day', () => {
  assert.equal(IRON_ABSORPTION, 15);
  assert.deepEqual({ ...RNI_TABLE['18-29'].male.iron }, { 10: 11.9, 15: 7.9 });
  assert.deepEqual({ ...RNI_TABLE['18-29'].female.iron }, { 10: 26.1, 15: 17.4 });
  assert.equal(micronutrientTargets({ sex: 'female', age: 55 }).values.iron, 17.4, 'nữ 50–64: số cao hơn trong ô có 2 số');
});

check('vitamin E, K, B12 are the USDA NAL DRI calculator numbers (snapshot 2026-11-09), same at every adult age', () => {
  const dri = JSON.parse(read('scripts/nal/dri-2026-11-09.json'));
  const value = (line) => Number(line.split('\t')[1].replace(/[^\d.]/g, ''));
  for (const [key, row] of Object.entries(dri.rows)) {
    const sex = key.split('_')[0];
    assert.equal(DRI_VITAMINS[sex].vitaminE, value(row['Vitamin E']), key);
    assert.equal(DRI_VITAMINS[sex].vitaminK, value(row['Vitamin K']), key);
    assert.equal(DRI_VITAMINS[sex].vitaminB12, value(row['Vitamin B12']), key);
  }
  assert.equal(Object.keys(dri.rows).length, 10);
  assert.match(DRI_SOURCE.url, /^https:\/\/www\.nal\.usda\.gov\//);
  assert.deepEqual([...DRI_SOURCE.vitamins], ['vitaminE', 'vitaminK', 'vitaminB12']);
  assert.equal(RNI_TABLE['75+'].male.vitaminB6, null, 'công cụ của Viện để trống');
});

check('age groups and gaps: no age uses 18–29 and says so; no sex uses the male row and says so', () => {
  assert.equal(ageGroupFor(29).id, '18-29');
  assert.equal(ageGroupFor(30).id, '30-49');
  assert.equal(ageGroupFor(80).id, '75+');
  assert.equal(ageGroupFor(''), null);
  const unknown = micronutrientTargets({});
  assert.equal(unknown.group, '18-29');
  assert.equal(unknown.sex, 'male');
  assert.deepEqual(unknown.notes, ['Chưa có tuổi: đang dùng nhóm 18–29.', 'Chưa chọn giới tính: đang dùng số của nam.']);
  assert.match(micronutrientTargets({ sex: 'male', age: 16 }).notes[0], /dưới 18 tuổi/);
  assert.deepEqual(micronutrientTargets({ sex: 'female', age: 40 }).notes, []);
});

check('the plan builder suggests the Institute numbers and the 9 vitamins', () => {
  const r = calculateSuggestedTargets({ weightKg: 60, sex: 'female', age: 27, goalType: 'maintain' });
  assert.deepEqual([r.micros.fiberG, r.micros.potassiumMg, r.micros.sodiumMg, r.micros.calciumMg, r.micros.magnesiumMg, r.micros.ironMg, r.micros.zincMg],
    [18, 2600, 2000, 800, 270, 17.4, 8]);
  assert.deepEqual(Object.keys(r.micros.vitamins), [...VITAMIN_KEYS]);
  assert.equal(r.micros.vitamins.vitaminA, 650);
  assert.equal(r.micros.bVitamins, undefined, 'chuỗi chữ cũ đã bỏ');
});

check('vitamins add up by grams, through recipes, and in a day; a food without data is flagged', () => {
  const egg = roundNutrients(foodNutrients('Trứng gà nguyên quả', 50));
  assert.equal(egg.values.vitaminA, FOOD_MICROS['Trứng gà nguyên quả'].vitamins.vitaminA / 2);
  assert.equal(egg.values.vitaminB12, Math.round(FOOD_MICROS['Trứng gà nguyên quả'].vitamins.vitaminB12 / 2 * 100) / 100);
  const recipe = recipeNutrients([{ food: 'Trứng gà nguyên quả', grams: 100 }, { food: 'Trứng gà nguyên quả', grams: 100 }]);
  assert.equal(Math.round(recipe.values.vitaminA), 320);
  const day = dayTotals([
    { id: 'a', meal: 'sang', kind: 'food', name: 'Trứng gà nguyên quả', grams: 100, cooked: false },
    { id: 'b', meal: 'trua', kind: 'food', name: 'Thanh long ruột trắng', grams: 100, cooked: false },
  ]);
  assert.equal(day.values.vitaminA, 160);
  VITAMIN_KEYS.forEach((key) => assert.ok(day.missing.includes(key), `${key}: thanh long chưa có số liệu`));
  const street = streetDishNutrients('Phở bò', 1);
  if (street) VITAMIN_KEYS.forEach((key) => assert.ok(key in street.values));
});

check('progress against the targets for every vitamin that has one', () => {
  const targets = targetsFromPlan({ kcal: 2000, protein: 140, carbs: 200, fat: 60, sex: 'male' }, { age: 25 });
  const day = dayTotals([{ id: 'a', meal: 'sang', kind: 'food', name: 'Trứng gà nguyên quả', grams: 600, cooked: false }]);
  const rows = Object.fromEntries(nutrientProgress(day, targets).map((row) => [row.key, row]));
  assert.equal(rows.vitaminA.status, 'done', '960 µg ≥ 850 µg');
  assert.equal(rows.vitaminC.status, 'left');
  assert.equal(rows.vitaminE.target, 15);
  assert.equal(rows.vitaminK.target, 120);
  assert.equal(rows.vitaminB12.status, 'done', '600 g trứng: 5,3 µg ≥ 2,4 µg');
});

check('the student card folds the vitamins and names the source and the folate caveat', () => {
  const page = read('nutrition.html');
  assert.match(page, /<details class="cu-fl-vit">/);
  assert.match(page, /Folate: \$\{FOLATE_NOTE\}/);
  assert.match(page, /Mục tiêu vi chất theo nhu cầu khuyến nghị của Viện Dinh dưỡng Quốc gia; vitamin E, K, B12 theo DRI của Mỹ \(USDA\)/);
  assert.match(FOLATE_NOTE, /Chưa xác nhận hai số cùng cách tính/);
  assert.match(page, /targetsFromPlan\(plan, nutritionProfile\)/);
});

console.log(`NUTRITION_RNI_OK ${passed} passed`);
