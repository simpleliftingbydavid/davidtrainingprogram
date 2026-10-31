// Bữa phụ bù macro cuối ngày (David, 2026-10-31).
//   node tests/nutrition-snacks.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getFood } from '../nutrition-foods.js';
import {
  DAVID_SNACKS, MAX_SNACK_SUGGESTIONS, SNACK_MIN_GAP, SNACK_MIN_RATIO, catalogProblems, snackCatalog, snackSuggestions, snackTotals,
} from '../nutrition-snacks.js';
import { MAKEUP_MIN_GAP, MAKEUP_MIN_RATIO } from '../nutrition-intake-utils.js';
import { makeUpSummaryMarkup, snackSuggestionsMarkup } from '../nutrition-intake-ui.js';
import { makeUpSuggestions } from '../nutrition-intake-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const MEALS = [
  { id: 'm1', name: 'Bữa sáng', items: ['Trứng gà nguyên quả — 155g', 'Dưa leo — 115g', 'Khoai lang (luộc) — 350g', 'Hạnh nhân — 8g'] },
  { id: 'm2', name: 'Bữa trưa', items: ['Ức gà bỏ da (sống) — 150g', 'Cơm trắng (chín) — 300g', 'Cải ngọt — 100g'] },
  { id: 'm3', name: 'Bữa tối', items: ['Cá basa fillet — 120g', 'Cơm trắng (chín) — 250g'] },
];
const lunch = (chicken, rice) => ({ mealId: 'm2', mealName: 'Bữa trưa', items: [
  { name: 'Ức gà bỏ da (sống)', grams: chicken, planned: 150 },
  { name: 'Cơm trắng (chín)', grams: rice, planned: 300 },
  { name: 'Cải ngọt', grams: 100, planned: 100 }] });
const day = (log, ticked = ['m1', 'm3'], extra = {}) => snackSuggestions({ meals: MEALS, mealLogs: [log], completedMealIds: ticked, ...extra });

check('thresholds: protein and carbs reuse the make-up thresholds; fat and kcal are set in one place', () => {
  assert.equal(SNACK_MIN_GAP.protein, MAKEUP_MIN_GAP.protein);
  assert.equal(SNACK_MIN_GAP.carbs, MAKEUP_MIN_GAP.carbs);
  assert.equal(SNACK_MIN_RATIO, MAKEUP_MIN_RATIO);
  assert.equal(SNACK_MIN_GAP.fat, 10);
  assert.equal(SNACK_MIN_GAP.kcal, 150);
});

check('a meal still open: no snack, the open meals carry the make-up', () => {
  const result = day(lunch(0, 0), ['m1']);
  assert.equal(result.status, 'open');
  assert.deepEqual(result.snacks, []);
  assert.equal(snackSuggestionsMarkup(result), '');
});

check('a small gap under the thresholds: nothing suggested', () => {
  const result = day(lunch(130, 280));
  assert.equal(result.status, 'ok');
  assert.deepEqual(result.minor, [], 'within the table\'s own 10% nothing is even mentioned');
  assert.equal(snackSuggestionsMarkup(result), '');
});

check('short of protein: the first snack is protein-rich and covers most of the gap', () => {
  const result = day(lunch(40, 300));
  assert.equal(result.status, 'suggest');
  assert.deepEqual(result.short, ['protein']);
  const first = result.snacks[0];
  assert.ok(first.totals.protein * 4 / first.totals.kcal >= 0.5, `${first.name} should get at least half its calories from protein`);
  assert.ok(first.totals.protein >= result.gaps.protein * 0.75);
});

check('short of carbs: the first snack is mostly carbs', () => {
  const result = day(lunch(150, 100));
  assert.equal(result.status, 'suggest');
  assert.ok(result.short.includes('carbs'));
  assert.ok(!result.short.includes('protein'));
  const first = result.snacks[0];
  assert.ok(first.totals.carbs * 4 / first.totals.kcal >= 0.6);
});

check('no snack goes over the calories still missing, and at most three are offered', () => {
  for (const log of [lunch(40, 300), lunch(150, 100), lunch(0, 0), lunch(0, 150)]) {
    const result = day(log);
    assert.ok(result.snacks.length <= MAX_SNACK_SUGGESTIONS);
    result.snacks.forEach((snack) => assert.ok(snack.totals.kcal <= result.gaps.kcal, `${snack.name} ${snack.totals.kcal} > ${result.gaps.kcal}`));
  }
});

check('the three suggestions are different foods, each within its own gram range', () => {
  const result = day(lunch(0, 0));
  const mains = result.snacks.map((snack) => snack.parts[0].food);
  assert.equal(new Set(mains).size, mains.length);
  const catalog = new Map(snackCatalog().map((snack) => [snack.id, snack]));
  result.snacks.forEach((snack) => snack.parts.forEach((part, index) => {
    const range = catalog.get(snack.id).parts[index];
    assert.ok(part.grams >= range.min && part.grams <= range.max, `${part.food} ${part.grams} g outside ${range.min}–${range.max}`);
    assert.equal(part.grams % 5, 0);
  }));
});

check('a day already at or over its calories: no snack, a quiet line instead', () => {
  const result = day(lunch(250, 400));
  assert.equal(result.status, 'over');
  assert.deepEqual(result.snacks, []);
  assert.match(snackSuggestionsMarkup(result), /không cần ăn thêm/);
});

check('food eaten out carries no carbs or fat, so only calories and protein are judged', () => {
  const result = day(lunch(0, 0), ['m1', 'm3'], { foodLog: [{ name: 'Phở bò', kcal: 100, protein: 5, servings: 1 }] });
  assert.ok(!('carbs' in result.gaps) && !('fat' in result.gaps));
});

check('David\'s list ships empty and the tool still works', () => {
  assert.deepEqual(DAVID_SNACKS, []);
  assert.ok(snackCatalog().length > 0);
  assert.equal(day(lunch(40, 300)).status, 'suggest');
});

check('a snack from David comes first when it fits', () => {
  const david = [{ id: 'david-test', name: 'Sữa chua trộn whey', note: 'Ăn trước khi ngủ.',
    parts: [{ food: 'Sữa chua Hy Lạp không đường', min: 100, max: 200 }, { food: 'Whey protein isolate (bột)', min: 10, max: 30 }] }];
  const result = day(lunch(40, 300), ['m1', 'm3'], { catalog: snackCatalog({ davidSnacks: david }) });
  assert.equal(result.snacks[0].id, 'david-test');
  assert.equal(result.snacks[0].source, 'david');
  const html = snackSuggestionsMarkup(result);
  assert.match(html, /David gợi ý/);
  assert.match(html, /Ăn trước khi ngủ\./);
});

check('every snack names foods from the food table, with sane gram ranges', () => {
  assert.deepEqual(catalogProblems(), []);
  snackCatalog().forEach((snack) => snack.parts.forEach((part) => assert.ok(getFood(part.food), part.food)));
  assert.equal(catalogProblems([{ name: 'Sai', parts: [{ food: 'Không có', min: 10, max: 20 }] }]).length, 1);
});

check('a snack\'s macros come from the food table', () => {
  const totals = snackTotals([{ food: 'Chuối', grams: 100 }]);
  const banana = getFood('Chuối');
  assert.deepEqual(totals, { kcal: banana.kcal, protein: banana.protein, carbs: banana.carb, fat: banana.fat });
});

check('the block reads plainly: what is missing, pick one, rough is enough', () => {
  const html = snackSuggestionsMarkup(day(lunch(0, 0)));
  assert.match(html, /Bữa phụ bù macro/);
  assert.match(html, /Cần bù: [\d,.]+ g đạm, [\d,.]+ g tinh bột/);
  assert.match(html, /Chọn một trong các món sau:/);
  assert.match(html, /Không cần bù chính xác, ăn gần đúng là đủ\./);
});

check('a gap under the threshold is named as safe to skip, so the block agrees with the table', () => {
  const result = day(lunch(40, 200));
  assert.ok(result.short.includes('protein') && !result.short.includes('carbs'));
  assert.deepEqual(result.minor, ['carbs']);
  assert.match(snackSuggestionsMarkup(result), /Phần tinh bột còn thiếu ít, bỏ qua được\./);
});

check('the make-up note points to the snacks instead of saying no make-up is needed', () => {
  const makeUp = makeUpSuggestions({ meals: MEALS, mealLogs: [lunch(0, 0)], completedMealIds: ['m1', 'm3'] });
  assert.match(makeUpSummaryMarkup(makeUp, { snacksShown: true }), /xem gợi ý bữa phụ bên dưới/);
  assert.match(makeUpSummaryMarkup(makeUp), /không cần bù/);
});

check('the page shows the block to the student only, under the day\'s table, without saving anything', () => {
  const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
  assert.match(page, /import \{ snackSuggestions \} from '\.\/nutrition-snacks\.js';/);
  const fn = page.slice(page.indexOf('function renderIntakeSummary()'), page.indexOf("$('log-kcal').addEventListener"));
  assert.match(fn, /if \(role !== 'student' \|\| !plan\) return;/);
  assert.match(fn, /\+ snackSuggestionsMarkup\(snacks\)/);
  assert.doesNotMatch(fn, /await|save[A-Z]/);
  const module = readFileSync(new URL('../nutrition-snacks.js', import.meta.url), 'utf8');
  assert.doesNotMatch(module, /firebase|training-data|document\./);
});

console.log(`NUTRITION_SNACKS_OK ${passed} passed`);
