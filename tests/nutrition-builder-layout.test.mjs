// The nutrition builder after the sample menus were removed (David, 2026-11-03): the page only
// sets targets and "Số bữa/ngày", publishing checks only those, and no menu code is loaded.
//   node tests/nutrition-builder-layout.test.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { validateNutritionPlanForPublish } from '../nutrition-engine.js';

const page = readFileSync(new URL('../nutrition-builder.html', import.meta.url), 'utf8').replace(/\r/g, '');
let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const TARGETS = { kcal: 2000, protein: 150, carbs: 200, fat: 67 };

check('the page loads no menu, shopping or parser module, and those files are gone', () => {
  ['nutrition-meal-builder', 'nutrition-week-builder', 'nutrition-week-utils', 'nutrition-shopping', 'nutrition-item-parser'].forEach((name) => {
    assert.ok(!page.includes(name), `${name} still referenced`);
    assert.ok(!existsSync(new URL(`../${name}.js`, import.meta.url)), `${name}.js still on disk`);
  });
  ['generate-btn', 'meal-preview', 'week-tabs', 'plan-composition', 'preferred-food-picker', 'preferred-dish-picker'].forEach((id) => {
    assert.ok(!page.includes(`id="${id}"`), `#${id} still on the page`);
  });
});

check('"Số bữa/ngày" is a required number from 1 to 8 next to the targets', () => {
  assert.match(page, /<input id="meals-per-day" type="number" min="1" max="8"/);
  assert.match(page, /Số bữa\/ngày <span class="required">\*<\/span>/);
  assert.ok(page.includes('mealsPerDay: mealsPerDayValue(),'), 'saved with the plan');
});

check('publishing needs the targets and the meal count, nothing else', () => {
  assert.equal(validateNutritionPlanForPublish({ ...TARGETS, mealsPerDay: 4 }).valid, true);
  const missing = validateNutritionPlanForPublish({ ...TARGETS });
  assert.equal(missing.valid, false);
  assert.ok(missing.errors.includes('Cần nhập số bữa mỗi ngày (1 đến 8).'));
  assert.equal(validateNutritionPlanForPublish({ ...TARGETS, mealsPerDay: 9 }).valid, false);
  assert.equal(validateNutritionPlanForPublish({ ...TARGETS, mealsPerDay: 2.5 }).valid, false);
  assert.equal(validateNutritionPlanForPublish({ kcal: 2000, mealsPerDay: 4 }).valid, false, 'protein is still required');
  // The old error that blocked sending (a week day's fat off by more than 10%) cannot come back.
  const old = validateNutritionPlanForPublish({ ...TARGETS, mealsPerDay: 4, meals: [{ id: 'm1', items: ['Dầu ăn — 200 g'] }] });
  assert.equal(old.valid, true);
});

check('reopening a plan puts back its targets, meal count, notes, supplements and functional foods', () => {
  const fill = page.slice(page.indexOf('function fillPlan(plan) {'), page.indexOf('function collectProfile()'));
  ["$('target-kcal').value", "$('meals-per-day').value = plan.mealsPerDay || ''", "$('plan-notes').value",
    "applyFoodSelection('supplement-check', plan.supplements)", "applyFoodSelection('functional-food-check', plan.functionalFoods)"]
    .forEach((line) => assert.ok(fill.includes(line), line));
  assert.ok(page.includes('fillPlan({ ...version });'), 'a saved version reopens through the same path');
});

check('the client mode is shown and a different meal count in the client settings is flagged', () => {
  assert.ok(page.includes('clientSettings = normalizeNutritionSettings(student.nutritionSettings);'));
  assert.ok(page.includes('<p id="client-mode" class="client-mode" hidden></p>'));
  assert.ok(page.includes('warn.hidden = !set || !here || set === here;'));
});

console.log(`NUTRITION_BUILDER_LAYOUT_OK ${passed} passed`);
