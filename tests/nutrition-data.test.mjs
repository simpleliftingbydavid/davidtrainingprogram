// Dữ liệu dinh dưỡng chi tiết, Mốc 1 (David, 2026-11-03): vi chất, khẩu phần, món ăn ngoài.
//   node tests/nutrition-data.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FOODS, STREET_DISHES, getFood } from '../nutrition-foods.js';
import { FOOD_MICROS, MACRO_MISMATCHES, MICRO_KEYS } from '../nutrition-micros.js';
import { PORTIONS, portionsFor } from '../nutrition-portions.js';
import { STREET_RECIPES, STREET_SODIUM_NOTE } from '../nutrition-street-recipes.js';
import { NUTRIENT_KEYS, foodNutrients, recipeNutrients, roundNutrients, streetDishNutrients, sumNutrients } from '../nutrition-composition.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('six micronutrients, eleven nutrients in all', () => {
  assert.deepEqual([...MICRO_KEYS], ['potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc']);
  assert.equal(NUTRIENT_KEYS.length, 11);
});

check('every food in the table has a micronutrient entry, with its source or an explicit gap', () => {
  FOODS.forEach((food) => {
    const entry = FOOD_MICROS[food.name];
    assert.ok(entry, food.name);
    MICRO_KEYS.forEach((key) => {
      const value = entry.micros[key];
      assert.ok(value === null || (Number.isFinite(value) && value >= 0), `${food.name} ${key}`);
      assert.equal(entry.microSource[key], value === null ? null : entry.microSource[key], `${food.name} ${key} source`);
      if (value !== null) assert.ok(['VN', 'USDA', 'AU', 'NO'].includes(entry.microSource[key]), `${food.name} ${key} has a source`);
    });
    if (entry.source) {
      assert.equal(entry.source.db, 'USDA');
      assert.ok(Number.isInteger(entry.source.fdcId) && entry.source.description, food.name);
    }
  });
  assert.equal(Object.keys(FOOD_MICROS).length, FOODS.length, 'no entry for a food the table does not have');
});

check('foods USDA does not have are left empty, never guessed', () => {
  ['Thanh long ruột trắng', 'Chả lụa'].forEach((name) => {
    assert.equal(FOOD_MICROS[name].source, null, name);
    assert.ok(MICRO_KEYS.every((key) => FOOD_MICROS[name].micros[key] === null), name);
    assert.ok(FOOD_MICROS[name].note, name);
  });
  assert.equal(FOOD_MICROS['Nấm rơm'].micros.sodium, null, 'canned straw mushrooms: brine sodium left out');
  assert.equal(FOOD_MICROS['Cơm trắng (chín)'].source.fdcId, 169757, 'unenriched rice, not the iron-fortified US rice');
});

check('the existing calories and macros are not changed; mismatches are only listed', () => {
  const rice = getFood('Cơm trắng (chín)');
  assert.deepEqual([rice.kcal, rice.carb, rice.fat, rice.protein, rice.fiber], [130, 28, 0.3, 2.7, 0.4]);
  assert.ok(MACRO_MISMATCHES.length > 0);
  MACRO_MISMATCHES.forEach((line) => assert.match(line, /^.+: .+\(USDA [\d.]+\)/));
});

check('a food\'s nutrients scale with grams; a gap stays a gap', () => {
  const egg = roundNutrients(foodNutrients('Trứng gà nguyên quả', 50));
  assert.equal(egg.values.kcal, Math.round(getFood('Trứng gà nguyên quả').kcal / 2));
  assert.equal(egg.values.sodium, Math.round(FOOD_MICROS['Trứng gà nguyên quả'].micros.sodium * 5) / 10);
  assert.deepEqual(egg.missing, []);
  const pitaya = foodNutrients('Thanh long ruột trắng', 100);
  assert.deepEqual(pitaya.missing, MICRO_KEYS);
  const total = sumNutrients([foodNutrients('Chuối', 100), pitaya]);
  assert.deepEqual(total.missing, MICRO_KEYS, 'one food without data makes the total incomplete, not lower');
  assert.equal(foodNutrients('Không có món này', 100), null);
});

check('portions: USDA ones carry their source; Vietnamese ones wait for David; none shown before approval', () => {
  assert.ok(PORTIONS.length > 0);
  PORTIONS.forEach((p) => {
    assert.ok(getFood(p.food), p.food);
    if (p.source?.db === 'USDA') assert.ok(p.grams > 0 && Number.isInteger(p.source.fdcId) && p.source.measure, p.id);
    else assert.equal(p.grams, null, `${p.id}: a Vietnamese portion has no grams until David fills it`);
    assert.equal(p.approved, false, p.id);
  });
  assert.equal(new Set(PORTIONS.map((p) => p.id)).size, PORTIONS.length, 'ids are unique');
  assert.equal(PORTIONS.find((p) => p.food === 'Trứng gà nguyên quả' && p.label === '1 quả to').grams, 50);
  assert.deepEqual(portionsFor('Trứng gà nguyên quả'), [], 'not approved: the student sees none');
});

check('street dishes: every dish has a proposal, only table foods, none approved yet', () => {
  assert.deepEqual(STREET_RECIPES.map((d) => d.name), STREET_DISHES.map((d) => d.name));
  STREET_RECIPES.forEach((dish) => {
    assert.equal(dish.approved, false, dish.name);
    assert.ok(dish.assumptions, dish.name);
    (dish.recipe || []).forEach((part) => assert.ok(getFood(part.food) && part.grams > 0, `${dish.name}: ${part.food}`));
  });
});

check('each proposed recipe lands within 15% of the dish\'s known calorie range', () => {
  STREET_RECIPES.filter((d) => d.recipe).forEach((dish) => {
    const street = STREET_DISHES.find((d) => d.name === dish.name);
    const kcal = recipeNutrients(dish.recipe).values.kcal;
    assert.ok(kcal >= street.kcalLow * 0.85 && kcal <= street.kcalHigh * 1.15, `${dish.name}: ${Math.round(kcal)} kcal`);
  });
});

check('before approval a street dish keeps only calories and protein; sodium is never estimated', () => {
  const pho = streetDishNutrients('Phở bò tái', 2);
  const street = STREET_DISHES.find((d) => d.name === 'Phở bò tái');
  assert.equal(pho.values.kcal, (street.kcalLow + street.kcalHigh));
  assert.equal(pho.values.protein, street.protein * 2);
  assert.ok(pho.missing.includes('sodium') && pho.missing.includes('carb'));
  assert.equal(pho.estimated, true);
  assert.match(STREET_SODIUM_NOTE, /Natri không tính/);
});

check('the review page is for the coach only and changes nothing', () => {
  const page = readFileSync(new URL('../nutrition-review.html', import.meta.url), 'utf8');
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  assert.match(page, /import \{ getMyRole \} from '\.\/training-data\.js';/, 'reads nothing from students, writes nothing');
  const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  assert.match(coach, /href="nutrition-review\.html"/);
});

check('the scripts that make the data are in the repository', () => {
  const build = readFileSync(new URL('../scripts/usda/build-micros.mjs', import.meta.url), 'utf8');
  assert.match(build, /SR Legacy 2018-04/);
  const vn = readFileSync(new URL('../scripts/import-vn-foods.mjs', import.meta.url), 'utf8');
  assert.match(vn, /vn-foods\.json/);
});

check('gaps are filled from the Australian table, then the Norwegian one, cell by cell, with the source', () => {
  const selected = JSON.parse(readFileSync(new URL('../scripts/foreign/selected.json', import.meta.url), 'utf8'));
  assert.match(selected.sources.AU.title, /Food Standards Australia New Zealand/);
  assert.match(selected.sources.NO.title, /Norwegian Food Composition Table 2022/);
  const whey = FOOD_MICROS['Whey protein isolate (bột)'];
  assert.equal(whey.foreign.source, 'AU');
  assert.equal(whey.foreign.id, 'F007493');
  MICRO_KEYS.forEach((key) => {
    assert.equal(whey.microSource[key], 'AU');
    assert.equal(whey.micros[key], selected.rows['AU:F007493'].values[key]);
  });
  const usdaRice = FOOD_MICROS['Cơm trắng (chín)'];
  assert.ok(MICRO_KEYS.every((key) => usdaRice.microSource[key] === 'USDA'), 'USDA comes before Australia');
});

check('the extraction script never turns a gap into zero and converts kJ to kcal', () => {
  const script = readFileSync(new URL('../scripts/foreign/extract.py', import.meta.url), 'utf8');
  assert.match(script, /round\(kj \/ 4\.184, 1\)/);
  assert.match(script, /return float\(value\) if value >= 0 else None\n {4}return None/);
});

console.log(`NUTRITION_DATA_OK ${passed} passed`);
