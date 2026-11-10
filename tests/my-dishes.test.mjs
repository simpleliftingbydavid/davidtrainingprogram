// Món của tôi (David, 2026-11-10): khách lưu bữa mình hay ăn rồi ghi lại theo ½ · 1 · 1½ · 2 phần;
// David chỉ xem trong báo cáo nhật ký ăn uống.
//   node tests/my-dishes.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MAX_MY_DISH_ITEMS, dishFromMeal, myDishEntries, myDishNutrients, normalizeMyDish, suggestDishName,
} from '../nutrition-my-dishes.js';
import { dayTotals } from '../nutrition-food-log.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const per100 = { kcal: 400, protein: 10, carb: 70, fat: 8 };
const ENTRIES = [
  { id: 'a', meal: 'trua', kind: 'food', name: 'Ức gà bỏ da (sống)', grams: 150 },
  { id: 'b', meal: 'trua', kind: 'food', name: 'Bún tươi', grams: 200 },
  { id: 'c', meal: 'trua', kind: 'label', labelId: 'L1', name: 'Bánh quy X', unit: 'g', amount: 30, per100 },
  { id: 'd', meal: 'sang', kind: 'food', name: 'Bún tươi', grams: 100 },
];
let n = 0;
const makeId = () => `id${n++}`;

check('lưu từ một bữa: chỉ món của bữa đó, bỏ id và bữa, tên gợi ý từ nguyên liệu', () => {
  assert.equal(suggestDishName(ENTRIES, 'trua'), 'Ức gà bỏ da, Bún tươi, Bánh quy X');
  const dish = dishFromMeal(ENTRIES, 'trua', '  Bún gà   của mẹ ');
  assert.equal(dish.name, 'Bún gà của mẹ');
  assert.equal(dish.items.length, 3);
  assert.ok(dish.items.every((item) => !('id' in item) && !('meal' in item)));
  assert.equal(dishFromMeal(ENTRIES, 'toi', 'x'), null, 'bữa trống không lưu được');
  assert.equal(dishFromMeal(ENTRIES, 'trua', '   '), null, 'phải có tên');
});

check('ghi lại: mỗi nguyên liệu một dòng, đúng bữa, nhân theo phần', () => {
  const dish = dishFromMeal(ENTRIES, 'trua', 'Bún gà');
  const one = myDishEntries(dish, 'toi', 1, makeId);
  assert.deepEqual(one.map((entry) => [entry.meal, entry.grams ?? entry.amount]), [['toi', 150], ['toi', 200], ['toi', 30]]);
  assert.equal(new Set(one.map((entry) => entry.id)).size, 3, 'id mới cho từng dòng');
  const half = myDishEntries(dish, 'sang', 0.5, makeId);
  assert.deepEqual(half.map((entry) => entry.grams ?? entry.amount), [75, 100, 15]);
  const big = myDishEntries(dish, 'sang', 1.5, makeId);
  assert.deepEqual(big.map((entry) => entry.grams ?? entry.amount), [225, 300, 45]);
});

check('calo của món khớp với tổng khi đã ghi vào nhật ký', () => {
  const dish = dishFromMeal(ENTRIES, 'trua', 'Bún gà');
  const logged = dayTotals(myDishEntries(dish, 'trua', 2, makeId)).values.kcal;
  assert.equal(myDishNutrients(dish, 2).values.kcal, logged);
  assert.ok(Math.abs(myDishNutrients(dish, 2).values.kcal - 2 * myDishNutrients(dish, 1).values.kcal) <= 1);
});

check('đọc món đã lưu: bỏ nguyên liệu không còn hợp lệ, giới hạn số nguyên liệu', () => {
  const dish = normalizeMyDish({ id: 'm1', name: 'Món', items: [{ kind: 'food', name: 'Không có món này', grams: 100 }, { kind: 'food', name: 'Bún tươi', grams: 100 }] });
  assert.deepEqual(dish.items.map((item) => item.name), ['Bún tươi']);
  assert.equal(dish.id, 'm1');
  assert.equal(normalizeMyDish({ name: 'Món', items: [{ kind: 'food', name: 'Không có món này', grams: 100 }] }), null);
  const many = Array.from({ length: 40 }, () => ({ kind: 'food', name: 'Bún tươi', grams: 50 }));
  assert.equal(normalizeMyDish({ name: 'Nhiều', items: many }).items.length, MAX_MY_DISH_ITEMS);
});

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8').replace(/\r/g, '');
check('trang: nút lưu và nút món của tôi trong mỗi bữa, coach chỉ xem', () => {
  assert.ok(page.includes('data-fl-keep="${meal.id}">Lưu thành món của tôi</button>'));
  assert.ok(page.includes('data-fl-mine="${meal.id}">Món của tôi</button>'));
  assert.ok(page.includes('${coachMineMarkup()}'), 'báo cáo của coach có danh sách món');
  const coachPart = page.slice(page.indexOf('function coachMineMarkup'), page.indexOf('// ---------------- Daily log'));
  assert.doesNotMatch(coachPart, /saveMyDish|deleteMyDish|data-fl-/, 'coach không có nút sửa');
  assert.match(data, /export async function listMyDishes\(studentUid\)/);
  assert.match(data, /collection\(db, 'students', studentUid, 'myDishes'\)/);
});

console.log(`MY_DISHES_OK ${passed} passed`);
