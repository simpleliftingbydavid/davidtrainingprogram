// Run with:  node tests/nutrition-dish-names.test.mjs
//
// A dish offers alternative ingredients (pick one). An alternative must never contradict the
// dish's own name: "Cơm gạo lứt + cá hồi" once listed white rice as an alternative, and the
// client read "Cơm trắng (chín)" under a dish called brown rice.
import assert from 'node:assert/strict';
import { DISHES } from '../nutrition-dishes.js';
import { buildGramMealPlan } from '../nutrition-meal-builder.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

/** When a dish's name says the thing on the left, it may not serve the thing on the right. */
const NAME_RULES = [
  [/gạo lứt/i, 'Cơm trắng (chín)'],
  [/sữa đậu nành/i, 'Sữa tươi không đường'],
  [/sữa tươi/i, 'Sữa đậu nành không đường'],
  [/nguyên cám/i, 'Bánh mì trắng'],
  [/khoai lang/i, 'Khoai tây (luộc)'],
  [/khoai tây/i, 'Khoai lang (luộc)'],
];
const servable = (dish) => [...dish.proteinOptions, ...dish.carbOptions, ...dish.fatOptions, ...dish.vegetables].map((option) => option.name);

check('no alternative ingredient contradicts the name of its dish', () => {
  const problems = [];
  for (const dish of DISHES) {
    for (const [pattern, forbidden] of NAME_RULES) {
      if (pattern.test(dish.name) && servable(dish).includes(forbidden)) problems.push(`${dish.name}: ${forbidden}`);
    }
  }
  assert.deepEqual(problems, []);
});

check('the rules are about dishes that exist, so the check above is not empty', () => {
  for (const [pattern] of NAME_RULES.slice(0, 4)) assert.ok(DISHES.some((dish) => pattern.test(dish.name)), String(pattern));
});

check('the two dishes that were corrected still serve what their names say', () => {
  const salmon = DISHES.find((dish) => dish.id === 'chinh-ca-hoi-ap-chao');
  assert.deepEqual(salmon.carbOptions.map((option) => option.name), ['Cơm gạo lứt (chín)']);
  const toast = DISHES.find((dish) => dish.id === 'sang-banh-mi-bo-dau-phong');
  assert.deepEqual(toast.proteinOptions.map((option) => option.name), ['Sữa đậu nành không đường']);
});

function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

check('both corrected dishes can still be built into a day that hits its targets', () => {
  const clients = [
    { weightKg: 70, mealCount: 4, goalType: 'fat_loss', targets: { kcal: 2000, protein: 140, carbs: 215, fat: 55 } },
    { weightKg: 80, mealCount: 5, goalType: 'gain', targets: { kcal: 3000, protein: 160, carbs: 400, fat: 80 } },
  ];
  for (const id of ['chinh-ca-hoi-ap-chao', 'sang-banh-mi-bo-dau-phong']) {
    const built = clients.some((client) => {
      const result = buildGramMealPlan({ ...client, composition: 'dish', preferredDishes: [id], random: rng(3) });
      return result.ok && result.meals.some((meal) => meal.dish.id === id);
    });
    assert.ok(built, `${id} can no longer be served`);
  }
});

console.log(`nutrition-dish-names: ${passed} passed`);
