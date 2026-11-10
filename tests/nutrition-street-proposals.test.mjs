// 14 công thức món ăn ngoài Claude đề xuất và nguyên liệu mới từ USDA (2026-11-10), và cách trang
// duyệt đếm việc cần làm.
//   node tests/nutrition-street-proposals.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STREET_RECIPES } from '../nutrition-street-recipes.js';
import { STREET_DISHES } from '../nutrition-foods.js';
import { EXTRA_FOODS, getExtraFood, approvedExtraFoods } from '../nutrition-foods-extra.js';
import { recipeNutrients, streetDishNutrients } from '../nutrition-composition.js';
import { MACRO_MISMATCHES } from '../nutrition-micros.js';
import { LIQUID_DENSITY } from '../nutrition-food-log.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const NEW = {
  'Bột mì đa dụng': '168936', 'Gạo trắng (sống)': '168877', 'Nước ngọt cola': '174852', 'Bia thường': '168746',
  'Trà đen (pha)': '173227', 'Lòng non heo (sống)': '168266', 'Bao tử heo (sống)': '167867', 'Tim heo (sống)': '168267',
};

check('new ingredients are single USDA SR Legacy rows, with their FDC id, approved by David 2026-11-10', () => {
  const map = JSON.parse(read('scripts/foreign/extra-map.json'));
  Object.entries(NEW).forEach(([name, id]) => {
    assert.deepEqual([map[name].source, map[name].id, map[name].approved], ['USDA', id, true], name);
    const food = getExtraFood(name);
    assert.equal(String(food.source.id), id);
    assert.ok(food.values.kcal !== null && food.values.protein !== null, name);
    assert.ok(approvedExtraFoods().includes(food), `${name}: học viên chọn được`);
  });
  // Số liệu đúng dòng USDA (ví dụ cola: 42 kcal, 10,4 g carb trên 100 g; bia: 43 kcal).
  assert.deepEqual([getExtraFood('Nước ngọt cola').values.kcal, getExtraFood('Nước ngọt cola').values.carb], [42, 10.4]);
  assert.equal(getExtraFood('Bia thường').values.kcal, 43);
  assert.equal(EXTRA_FOODS.length, 201);
});

check('drink densities come from the USDA portion of the same row', () => {
  assert.equal(LIQUID_DENSITY['Nước ngọt cola'], 1.038);
  assert.equal(LIQUID_DENSITY['Bia thường'], 1.004);
  const can = STREET_RECIPES.find((d) => d.name === 'Nước ngọt (lon 330ml)').recipe[0];
  assert.deepEqual([can.food, can.grams], ['Nước ngọt cola', Math.round(330 * 1.038)]);
});

check('14 recipes of 2026-11-10: only table foods, gram > 0, an assumption line, approved', () => {
  const proposals = STREET_RECIPES.filter((d) => d.proposedOn === '2026-11-10');
  assert.equal(proposals.length, 14);
  proposals.forEach((dish) => {
    assert.deepEqual([dish.approved, dish.approvedOn], [true, '2026-11-10'], dish.name);
    assert.ok(dish.assumptions.length > 20, dish.name);
    assert.ok(STREET_DISHES.some((d) => d.name === dish.name), dish.name);
    dish.recipe.forEach((part) => assert.ok(part.grams > 0, `${dish.name}: ${part.food}`));
    assert.ok(recipeNutrients(dish.recipe).values.kcal > 0, dish.name);
  });
  assert.match(STREET_RECIPES.find((d) => d.name === 'Cháo lòng').assumptions, /Huyết heo và dồi KHÔNG có nguồn/);
});

check('once approved, the student gets every nutrient but sodium from the recipe', () => {
  const recipe = STREET_RECIPES.find((d) => d.name === 'Bánh canh cua');
  const shown = streetDishNutrients('Bánh canh cua', 2);
  assert.ok(Math.abs(shown.values.kcal - recipeNutrients(recipe.recipe).values.kcal * 2) < 1e-9);
  assert.ok(!shown.missing.includes('carb') && !shown.missing.includes('fat'));
  assert.ok(shown.missing.includes('sodium'));
  assert.equal(streetDishNutrients('Nước mía (500ml)', 1).missing.includes('carb'), true, 'nước mía vẫn chỉ có calo và đạm');
});

check('review page: decided USDA mismatches are not counted as work; proposals outside the old range are flagged', () => {
  assert.equal(MACRO_MISMATCHES.filter((line) => !line.includes(' · ')).length, 0, 'cả 4 món đã có quyết định');
  assert.equal(MACRO_MISMATCHES.filter((line) => line.includes(' · ')).length, 4);
  const page = read('nutrition-review.html');
  assert.match(page, /const undecided = MACRO_MISMATCHES\.filter\(\(line\) => !line\.includes\(' · '\)\);/);
  assert.match(page, /<strong>\$\{undecided\.length\}<\/strong> thực phẩm có calo\/đa chất lệch quá 15% so với USDA chưa có quyết định/);
  assert.match(page, /Calo ngoài khoảng cũ/);
  assert.match(page, /\$\{!dish\.approved && kcalOutOfRange\(dish\)/, 'nhãn chỉ hiện khi chưa duyệt');
  const outside = STREET_RECIPES.filter((d) => d.proposedOn).filter((dish) => {
    const street = STREET_DISHES.find((d) => d.name === dish.name);
    const kcal = Math.round(recipeNutrients(dish.recipe).values.kcal);
    return kcal < street.kcalLow || kcal > street.kcalHigh;
  }).map((d) => d.name);
  assert.deepEqual(outside, ['Bánh bao nhân thịt trứng', 'Bánh cuốn', 'Bánh xèo (1 cái)', 'Trà sữa ít đường, không trân châu', 'Cà phê đen không đường', 'Chè (1 ly)']);
});

console.log(`NUTRITION_STREET_PROPOSALS_OK ${passed} passed`);
