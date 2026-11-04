// The food log, 2026-11-04: liquids are logged in ml (converted to grams by the USDA density of
// that row), the search runs on a prebuilt index, and three foods asked for by David exist.
//   node tests/nutrition-food-log-ml.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  LIQUID_DENSITY, entryAmountLabel, entryMl, entryNutrients, isLiquid, mlToGrams, normalizeFoodEntry, searchFoods,
} from '../nutrition-food-log.js';
import { getFood } from '../nutrition-foods.js';
import { getExtraFood } from '../nutrition-foods-extra.js';
import { canWeighCooked } from '../nutrition-intake-utils.js';
import { roundNutrients } from '../nutrition-composition.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('every liquid is a known food with a density between oil and condensed milk', () => {
  Object.entries(LIQUID_DENSITY).forEach(([name, density]) => {
    assert.ok(getFood(name) || getExtraFood(name), `${name} is in a food table`);
    assert.ok(density >= 0.9 && density <= 1.3, `${name}: ${density}`);
  });
  ['Nước lọc', 'Sữa tươi không đường', 'Nước mắm', 'Cà phê đen (pha)', 'Dầu ăn (oliu, đậu nành)'].forEach((name) => assert.ok(isLiquid(name), name));
  assert.equal(isLiquid('Ức gà bỏ da (sống)'), false);
});

check('a liquid logged in ml is counted by its grams, and shown back in ml', () => {
  const fishSauce = normalizeFoodEntry({ id: 'a', meal: 'sang', kind: 'food', name: 'Nước mắm', ml: 15 });
  assert.equal(fishSauce.grams, mlToGrams('Nước mắm', 15));
  assert.equal(fishSauce.grams, 18, '15 ml of fish sauce weighs 18 g');
  assert.equal(entryAmountLabel(fishSauce), '15 ml');
  const milk = normalizeFoodEntry({ id: 'b', meal: 'sang', kind: 'food', name: 'Sữa tươi không đường', ml: 240 });
  const asGrams = normalizeFoodEntry({ id: 'c', meal: 'sang', kind: 'food', name: 'Sữa tươi không đường', grams: 240 });
  assert.ok(roundNutrients(entryNutrients(milk)).values.kcal > roundNutrients(entryNutrients(asGrams)).values.kcal, '240 ml of milk is more than 240 g');
  assert.equal(entryMl(asGrams), 233, 'an entry saved in grams before ml is shown in ml');
  assert.equal(normalizeFoodEntry({ id: 'd', meal: 'sang', kind: 'food', name: 'Nước lọc', ml: 3500 }), null, 'at most 3,000 ml');
  const meat = normalizeFoodEntry({ id: 'e', meal: 'sang', kind: 'food', name: 'Ức gà bỏ da (sống)', grams: 150, ml: 999 });
  assert.equal(meat.ml, undefined, 'ml is ignored for solid food');
  assert.equal(entryAmountLabel(meat), '150 g');
});

check('the three foods David asked for: má đùi gà phi lê, sụn ức gà, bún cá', () => {
  assert.deepEqual(searchFoods('ma dui ga').map((item) => item.name), ['Má đùi gà phi lê (sống)']);
  assert.ok(searchFoods('sun uc ga').some((item) => item.name === 'Sụn ức gà (sống)'));
  assert.ok(searchFoods('bun ca').some((item) => item.name === 'Bún cá' && item.kind === 'street'));
  const thigh = getExtraFood('Má đùi gà phi lê (sống)');
  assert.deepEqual([thigh.source.db, thigh.source.id, thigh.values.kcal, thigh.values.protein], ['USDA', '173627', 121, 19.7]);
  assert.ok(canWeighCooked('Má đùi gà phi lê (sống)'), 'weighed cooked like the skinless thigh');
  const cartilage = getExtraFood('Sụn ức gà (sống)');
  assert.deepEqual([cartilage.source.db, cartilage.source.id, cartilage.values.kcal, cartilage.values.protein, cartilage.values.sodium], ['JP', '11236', 54, 12.5, 390]);
});

check('search: same results as before, from an index built once', () => {
  const first = searchFoods('com');
  assert.ok(first.length > 0 && first.length <= 12);
  assert.deepEqual(searchFoods('com'), first, 'stable');
  assert.deepEqual(searchFoods('   '), []);
  first[0].name = 'changed';
  assert.notEqual(searchFoods('com')[0].name, 'changed', 'results are copies, the index is not changed');
});

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('typing in the search only redraws the results, and snack suggestions are cached', () => {
  const handler = page.slice(page.indexOf('flEditor.query = search.value;'), page.indexOf('const resultsBox'));
  assert.ok(handler.includes("box.innerHTML = searchResultsMarkup(flEditor.query);"));
  assert.ok(!handler.includes('renderFoodLogBody()'), 'no full redraw while typing');
  assert.ok(page.includes('if (snackCardCache.key !== key) {'));
  assert.ok(page.includes('<span>Số ml</span>'));
});

console.log(`NUTRITION_FOOD_LOG_ML_OK ${passed} passed`);
