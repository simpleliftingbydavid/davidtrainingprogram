// Dish suggestions (2026-11-04): a client who does not know what to eat picks a dish from the
// approved Vietnamese dish book, adjusts the grams, and logs the whole dish at once.
//   node tests/nutrition-dish-suggest.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dishEntries, dishNutrients, dishPortion, dishesForMeal } from '../nutrition-dish-suggest.js';
import { DISHES } from '../nutrition-dishes.js';
import { normalizeFoodEntries } from '../nutrition-food-log.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('every meal of the food log has dishes; lunch includes eaten-out lunches', () => {
  ['sang', 'trua', 'toi', 'phu'].forEach((meal) => assert.ok(dishesForMeal(meal).length >= 5, meal));
  const lunch = dishesForMeal('trua');
  assert.ok(lunch.some((dish) => dish.mealTypes.includes('ngoai')));
  assert.ok(dishesForMeal('trua', { kind: 'cook' }).every((dish) => dish.kind === 'cook'));
  assert.ok(dishesForMeal('sang', { query: 'trung' }).length > 0, 'search without accents');
  assert.deepEqual(dishesForMeal('sang', { query: 'zzz' }), []);
});

check('a portion is the first option of each slot and every vegetable, mid-range, inside the range', () => {
  DISHES.forEach((dish) => {
    const { parts, nutrients } = dishPortion(dish);
    assert.equal(parts.filter((part) => part.slot === 'protein').length, 1, dish.id);
    assert.equal(parts.filter((part) => part.slot === 'veg').length, dish.vegetables.length, dish.id);
    parts.forEach((part) => assert.ok(part.grams >= Math.min(part.min, 5) && part.grams <= Math.max(part.max, 5), `${dish.id}: ${part.name} ${part.grams}`));
    assert.ok(nutrients.values.kcal > 0, dish.id);
  });
});

check('a portion is scaled toward the calories of one meal, never outside the approved ranges', () => {
  const dish = dishesForMeal('toi')[0];
  const small = dishPortion(dish, { mealKcal: 300 });
  const big = dishPortion(dish, { mealKcal: 900 });
  assert.ok(small.nutrients.values.kcal < dishPortion(dish).nutrients.values.kcal);
  assert.ok(big.nutrients.values.kcal >= dishPortion(dish).nutrients.values.kcal);
  [...small.parts, ...big.parts].forEach((part) => assert.ok(part.grams >= part.min && part.grams <= part.max, `${part.name} ${part.grams}`));
});

check('the client can swap an option, and logging writes one entry per ingredient', () => {
  const dish = DISHES.find((item) => item.proteinOptions.length > 1);
  const other = dish.proteinOptions[1].name;
  const swapped = dishPortion(dish, { choice: { protein: other } });
  assert.equal(swapped.parts.find((part) => part.slot === 'protein').name, other);
  let n = 0;
  const entries = normalizeFoodEntries(dishEntries(swapped.parts, 'trua', () => `id${n++}`));
  assert.equal(entries.length, swapped.parts.length, 'every ingredient is a real food the log accepts');
  assert.ok(entries.every((entry) => entry.meal === 'trua' && entry.kind === 'food'));
  const edited = swapped.parts.map((part, index) => (index === 0 ? { ...part, grams: 0 } : part));
  assert.equal(dishEntries(edited, 'trua', () => 'x').length, swapped.parts.length - 1, 'an ingredient set to 0 g is left out');
  assert.ok(dishNutrients(edited).values.kcal < dishNutrients(swapped.parts).values.kcal);
});

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('the page: a Món gợi ý button on every meal (detailed), a read-only dish book (simple)', () => {
  assert.ok(page.includes('data-fl-suggest="${meal.id}">Món gợi ý</button>'));
  assert.ok(page.includes("updateFoodEntries([...flEntries, ...added], `Đã ghi ${dish.name}.`);"));
  assert.ok(page.includes('renderSimpleDishes();'));
  assert.ok(page.includes('Không biết ăn gì? Món gợi ý'));
});

console.log(`NUTRITION_DISH_SUGGEST_OK ${passed} passed`);
