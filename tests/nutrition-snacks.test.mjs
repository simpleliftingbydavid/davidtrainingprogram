// Bữa phụ bù macro cuối ngày (David, 2026-10-31).
//   node tests/nutrition-snacks.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getFood } from '../nutrition-foods.js';
import {
  DAVID_SNACKS, MAX_SNACK_SUGGESTIONS, SNACK_MIN_GAP, SNACK_MIN_RATIO, catalogProblems, snackCatalog, snackTotals, snacksForDay,
} from '../nutrition-snacks.js';
import { snackSuggestionsMarkup } from '../nutrition-snacks-ui.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

// A day's target is what these foods add up to; the client then logs every food the same,
// except the chicken and rice at lunch. (Since 2026-11-03 the target comes from the plan's
// numbers and the logged foods; this keeps the old test days so the numbers stay comparable.)
const DAY = [
  { food: 'Trứng gà nguyên quả', grams: 155 }, { food: 'Dưa leo', grams: 115 }, { food: 'Khoai lang (luộc)', grams: 350 }, { food: 'Hạnh nhân', grams: 8 },
  { food: 'Ức gà bỏ da (sống)', grams: 150 }, { food: 'Cơm trắng (chín)', grams: 300 }, { food: 'Cải ngọt', grams: 100 },
  { food: 'Cá basa fillet', grams: 120 }, { food: 'Cơm trắng (chín)', grams: 250 },
];
const PLANNED = snackTotals(DAY);
const lunch = (chicken, rice) => DAY.map((part, index) => (index === 4 ? { ...part, grams: chicken } : index === 5 ? { ...part, grams: rice } : part));
const day = (eaten, { foodLog = [], catalog } = {}) => {
  const actual = snackTotals(eaten);
  foodLog.forEach((item) => { actual.kcal += item.kcal; actual.protein += item.protein; });
  return snacksForDay({ planned: PLANNED, actual, eatenOut: foodLog.length > 0 }, catalog);
};

check('thresholds: the ones David approved', () => {
  assert.equal(SNACK_MIN_GAP.protein, 10);
  assert.equal(SNACK_MIN_GAP.carbs, 15);
  assert.equal(SNACK_MIN_RATIO, 0.15);
  assert.equal(SNACK_MIN_GAP.fat, 10);
  assert.equal(SNACK_MIN_GAP.kcal, 150);
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
  const result = day(lunch(0, 0), { foodLog: [{ name: 'Phở bò', kcal: 100, protein: 5 }] });
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
  const result = day(lunch(40, 300), { catalog: snackCatalog({ davidSnacks: david }) });
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

check('the page draws the block from the food log, without saving anything', () => {
  const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
  assert.match(page, /import \{ snacksForDay \} from '\.\/nutrition-snacks\.js';/);
  assert.match(page, /import \{ snackSuggestionsMarkup \} from '\.\/nutrition-snacks-ui\.js';/);
  assert.match(page, /snacksForDay\(snackDay\(totals, flTargets\)\)/);
});

console.log(`NUTRITION_SNACKS_OK ${passed} passed`);
