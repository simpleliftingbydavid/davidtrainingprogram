// Ước lượng món ăn ngoài chính xác hơn (David, 2026-11-18): cách nấu cộng dầu cho thực phẩm lẻ,
// cỡ phần nhỏ / vừa / lớn cho món ăn ngoài, khoảng calo ở từng món.
//   node tests/eating-out-estimate.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  canChooseMethod, copyMeal, dayTotals, entryAmountLabel, entryNutrients, frequentFoods, methodOilGrams, normalizeFoodEntry,
} from '../nutrition-food-log.js';
import { streetDishNutrients, streetHasSize, streetKcalRange } from '../nutrition-composition.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const entry = (raw) => normalizeFoodEntry({ id: 'e', meal: 'trua', ...raw });
const kcal = (item) => entryNutrients(item).values.kcal;

check('luộc/hấp và món cũ không đổi số; không lưu method khi luộc', () => {
  const old = entry({ kind: 'food', name: 'Thịt heo thăn nạc', grams: 100 });
  const boiled = entry({ kind: 'food', name: 'Thịt heo thăn nạc', grams: 100, method: 'luoc' });
  assert.equal(boiled.method, undefined);
  assert.equal(kcal(old), kcal(boiled));
  assert.equal(entryAmountLabel(old), '100 g');
});

check('xào cộng 8%, chiên 12%, kho 3% dầu theo gram sống', () => {
  const plain = kcal(entry({ kind: 'food', name: 'Rau muống', grams: 150 }));
  const stir = entry({ kind: 'food', name: 'Rau muống', grams: 150, method: 'xao' });
  assert.equal(methodOilGrams(stir), 12);
  assert.ok(Math.abs(kcal(stir) - plain - 12 * 8.84) < 0.01, `${kcal(stir) - plain}`);
  assert.equal(entryAmountLabel(stir), '150 g · xào +12 g dầu');
  assert.equal(methodOilGrams(entry({ kind: 'food', name: 'Đùi gà bỏ da (sống)', grams: 200, method: 'chien' })), 24);
  assert.equal(methodOilGrams(entry({ kind: 'food', name: 'Thịt heo ba chỉ', grams: 100, method: 'kho' })), 3);
  const cooked = entry({ kind: 'food', name: 'Ức gà bỏ da (sống)', grams: 100, cooked: true, method: 'xao' });
  assert.ok(methodOilGrams(cooked) > 8, 'cân chín thì dầu tính theo gram sống quy đổi');
});

check('chỉ thịt cá, rau, vài món tinh bột chọn được cách nấu', () => {
  ['Thịt bò thăn', 'Rau muống', 'Đậu phụ trắng', 'Cơm trắng (chín)', 'Khoai tây (luộc)', 'Cải thảo'].forEach((name) => assert.ok(canChooseMethod(name), name));
  ['Sữa tươi không đường', 'Whey protein isolate (bột)', 'Chuối', 'Dầu ăn (oliu, đậu nành)', 'Yến mạch (khô)'].forEach((name) => assert.ok(!canChooseMethod(name), name));
  assert.equal(entry({ kind: 'food', name: 'Chuối', grams: 100, method: 'chien' }).method, undefined);
});

check('cỡ phần: lớn thêm thịt nhiều hơn tinh bột, nhỏ giảm, đồ uống không có cỡ', () => {
  const name = 'Phở bò tái';
  const [s, m, l] = ['S', 'M', 'L'].map((size) => streetDishNutrients(name, 1, size).values);
  assert.ok(s.kcal < m.kcal && m.kcal < l.kcal);
  assert.ok(l.protein / m.protein > l.carb / m.carb, 'đạm tăng nhiều hơn tinh bột');
  assert.ok(Math.abs(l.protein / m.protein - 1.4) < 0.15);
  assert.equal(streetHasSize('Cà phê sữa đá'), false);
  assert.equal(entry({ kind: 'street', name: 'Cà phê sữa đá', servings: 1, size: 'L' }).size, undefined);
  assert.equal(entry({ kind: 'street', name, servings: 1, size: 'M' }).size, undefined, 'vừa không lưu');
  const noRecipe = streetDishNutrients('Bún đậu mắm tôm', 1, 'L').values;
  assert.ok(noRecipe.kcal > streetDishNutrients('Bún đậu mắm tôm', 1).values.kcal);
});

check('khoảng calo quanh đúng số đang tính, hiện trong dòng món', () => {
  const big = entry({ kind: 'street', name: 'Cơm tấm sườn bì chả', servings: 1, size: 'L' });
  const value = kcal(big);
  const range = streetKcalRange(big.name, value);
  assert.ok(range.low < value && value < range.high);
  assert.match(entryAmountLabel(big), /^1 phần lớn · khoảng \d+–\d+ kcal$/);
  assert.match(entryAmountLabel(entry({ kind: 'street', name: 'Phở gà', servings: 2 })), /^2 phần vừa · khoảng/);
  assert.match(entryAmountLabel(entry({ kind: 'street', name: 'Bia (lon 330ml)', servings: 1 })), /^1 phần · khoảng/);
  assert.equal(dayTotals([big]).estimated, true);
});

check('chép bữa, món hay ăn giữ cách nấu và cỡ', () => {
  const list = [entry({ kind: 'food', name: 'Rau muống', grams: 150, method: 'xao' }), { ...entry({ kind: 'street', name: 'Phở gà', servings: 1, size: 'L' }), id: 'f' }];
  const copied = copyMeal(list, 'trua', () => 'n');
  assert.equal(copied[0].method, 'xao');
  assert.equal(copied[1].size, 'L');
  const frequent = frequentFoods([{ date: '2026-11-17', foodEntries: list }]);
  assert.ok(frequent.some((item) => item.method === 'xao') && frequent.some((item) => item.size === 'L'));
});

check('trang ghi món có nút cách nấu và cỡ phần', () => {
  const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
  assert.ok(page.includes('data-fl-method=') && page.includes('data-fl-size='));
  assert.ok(page.includes('method: entry.method, size: entry.size'));
});

console.log(`EATING_OUT_ESTIMATE_OK ${passed} passed`);
