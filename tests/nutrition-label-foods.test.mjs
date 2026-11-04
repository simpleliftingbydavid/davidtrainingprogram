// Label foods (2026-11-04): David enters packaged products from their nutrition label; his students
// pick them first in the food log, and each logged entry keeps its own copy of the numbers.
//   node tests/nutrition-label-foods.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { labelFoodTitle, labelNumber, labelNutrients, normalizeLabelFood } from '../nutrition-label-foods.js';
import { copyMeal, dayTotals, entryAmountLabel, frequentFoods, normalizeFoodEntry, searchFoods } from '../nutrition-food-log.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const milkRaw = {
  name: 'Sữa tươi không đường', brand: 'Vinamilk', unit: 'ml', servingLabel: '1 hộp 180 ml', servingAmount: '180',
  basis: 'per100', values: { kcal: '61', protein: '3,0', carb: '4,8', fat: '3,3', sodium: '40', calcium: '110' },
};

check('numbers are read with a comma or a dot; empty is "not on the label"', () => {
  assert.equal(labelNumber('3,5'), 3.5);
  assert.equal(labelNumber(' 12 '), 12);
  assert.equal(labelNumber(''), null);
  assert.ok(Number.isNaN(labelNumber('abc')));
});

check('a label per 100 is stored as is; one per serving is turned into per 100', () => {
  const milk = normalizeLabelFood(milkRaw);
  assert.equal(milk.ok, true);
  assert.deepEqual([milk.food.per100.kcal, milk.food.per100.protein, milk.food.per100.sodium, milk.food.per100.fiber], [61, 3, 40, null]);
  const whey = normalizeLabelFood({ name: 'Whey isolate', unit: 'g', servingLabel: '1 muỗng', servingAmount: '30', basis: 'perServing', values: { kcal: '120', protein: '24', carb: '3', fat: '1,5' } });
  assert.deepEqual([whey.food.per100.kcal, whey.food.per100.protein, whey.food.per100.fat], [400, 80, 5]);
  assert.equal(labelFoodTitle(normalizeLabelFood(milkRaw).food), 'Sữa tươi không đường · Vinamilk');
});

check('what a label must have, and typing slips that are caught', () => {
  const errors = normalizeLabelFood({ name: '', unit: 'cup', values: { kcal: '61' } }).errors;
  ['Nhập tên sản phẩm.', 'Chọn đơn vị: g hoặc ml.', 'Nhập đạm trên nhãn.', 'Nhập carb trên nhãn.', 'Nhập béo trên nhãn.'].forEach((text) => assert.ok(errors.includes(text), text));
  assert.equal(normalizeLabelFood({ ...milkRaw, values: { ...milkRaw.values, kcal: '6100' } }).ok, false, 'kcal per 100 above 900');
  assert.equal(normalizeLabelFood({ ...milkRaw, basis: 'perServing', servingAmount: '' }).ok, false, 'per serving needs the serving');
  assert.equal(normalizeLabelFood({ ...milkRaw, values: { ...milkRaw.values, protein: '-1' } }).ok, false);
});

const milk = { id: 'L1', ...normalizeLabelFood(milkRaw).food };
check('in the food log: found first, logged in its unit, counted from its own copy', () => {
  const results = searchFoods('sua tuoi', { labelFoods: [milk, { ...milk, id: 'L2', archived: true }] });
  assert.equal(results[0].kind, 'label');
  assert.equal(results.filter((item) => item.kind === 'label').length, 1, 'hidden products are not offered');
  const entry = normalizeFoodEntry({ id: 'e', meal: 'sang', ...results[0], amount: 180 });
  assert.equal(entryAmountLabel(entry), '180 ml · theo nhãn');
  const totals = dayTotals([entry]);
  assert.equal(totals.values.kcal, 110);
  assert.equal(totals.values.calcium, 198);
  assert.ok(totals.missing.includes('fiber'), 'a nutrient not on the label is marked missing, not zero');
  assert.deepEqual(labelNutrients(milk.per100, 0).values.kcal, 0);
  const copied = copyMeal([entry], 'sang', () => 'new');
  assert.equal(copied[0].per100.kcal, 61, 'copying a meal keeps the numbers');
  assert.equal(frequentFoods([{ date: '2026-11-03', foodEntries: [entry] }])[0].kind, 'label');
  assert.equal(normalizeFoodEntry({ id: 'x', meal: 'sang', kind: 'label', name: 'Sữa', unit: 'ml', amount: 0, per100: milk.per100 }), null);
});

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
const coachPage = readFileSync(new URL('../label-foods.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('the pages: David enters products, the student page loads them with the day', () => {
  assert.ok(page.includes('listLabelFoods(student?.coachUid),'));
  assert.ok(page.includes("searchFoods(query || '', { labelFoods: flLabelFoods })"));
  assert.ok(coachPage.includes("redirectForUnexpectedRole(role, ['coach'])"));
  assert.ok(coachPage.includes('await saveLabelFood(coachUid, raw, editingId);'));
  assert.ok(!/deleteDoc|deleteLabelFood/.test(coachPage), 'products are hidden, never deleted');
});

console.log(`NUTRITION_LABEL_FOODS_OK ${passed} passed`);
