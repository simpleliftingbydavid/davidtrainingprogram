// Món gợi ý David tự thêm (David, 2026-11-10): mỗi nguyên liệu là phần + gram cho 1 người; app co giãn
// đạm và tinh bột theo calo bữa (½ đến 1½ lần). David ẩn được món có sẵn; món chỉ ẩn, không xoá.
//   node tests/coach-dishes.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISHES } from '../nutrition-dishes.js';
import {
  coachDishNutrients, coachDishToDish, dishBook, normalizeCoachDish, normalizeHiddenBuiltIn, roleForFood,
} from '../nutrition-coach-dishes.js';
import { dishEntries, dishPortion, dishesForMeal } from '../nutrition-dish-suggest.js';
import { dayTotals, normalizeFoodEntries } from '../nutrition-food-log.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const RAW = {
  name: '  Cơm gà   xé phay ', mealTypes: ['toi', 'trua', 'xx'], kind: 'cook', cook: 'Luộc gà, xé nhỏ.',
  items: [
    { name: 'Ức gà bỏ da (sống)', role: 'protein', grams: '150' },
    { name: 'Cơm trắng (chín)', role: 'carb', grams: 200 },
    { name: 'Dưa leo', role: 'veg', grams: '100' },
    { name: '', role: 'fat', grams: '' },
  ],
};

check('nhập món: làm sạch tên, bữa theo thứ tự sổ món, bỏ hàng trống', () => {
  const r = normalizeCoachDish(RAW);
  assert.equal(r.ok, true, r.errors.join(' '));
  assert.equal(r.dish.name, 'Cơm gà xé phay');
  assert.deepEqual(r.dish.mealTypes, ['trua', 'toi']);
  assert.equal(r.dish.items.length, 3);
  assert.equal(r.dish.items[0].grams, 150);
});

check('nhập sai thì báo rõ từng lỗi', () => {
  const r = normalizeCoachDish({ name: '', mealTypes: [], items: [{ name: 'Không có món này', grams: 100 }, { name: 'Dưa leo', grams: 0 }] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.includes('Nhập tên món.'));
  assert.ok(r.errors.includes('Chọn ít nhất một bữa.'));
  assert.ok(r.errors.some((e) => e.includes('Không có "Không có món này"')));
  assert.ok(r.errors.some((e) => e.startsWith('Gram của Dưa leo')));
  assert.deepEqual(normalizeCoachDish({ name: 'X', mealTypes: ['sang'], items: [] }).errors, ['Thêm ít nhất một nguyên liệu.']);
});

check('phần đoán sẵn theo nhóm thực phẩm', () => {
  assert.equal(roleForFood('Ức gà bỏ da (sống)'), 'protein');
  assert.equal(roleForFood('Cơm trắng (chín)'), 'carb');
  assert.equal(roleForFood('Dưa leo'), 'veg');
  assert.equal(roleForFood('Dầu ăn (oliu, đậu nành)'), 'fat');
});

const saved = { id: 'd1', ...normalizeCoachDish(RAW).dish, archived: false };

check('sổ món: món của David trước, món có sẵn bị ẩn thì không hiện, món đã ẩn của David cũng không', () => {
  const book = dishBook(DISHES, [saved, { ...saved, id: 'd2', name: 'Món đã ẩn', archived: true }], [DISHES[0].id]);
  assert.equal(book[0].id, 'coach:d1');
  assert.equal(book.length, DISHES.length);
  assert.ok(!book.some((dish) => dish.id === DISHES[0].id));
  assert.ok(!book.some((dish) => dish.name === 'Món đã ẩn'));
  assert.ok(dishesForMeal('toi', { book }).some((dish) => dish.id === 'coach:d1'));
  assert.ok(!dishesForMeal('sang', { book }).some((dish) => dish.id === 'coach:d1'), 'chỉ hiện ở bữa David chọn');
  assert.ok(dishesForMeal('toi', { book, query: 'ga xe' }).some((dish) => dish.id === 'coach:d1'), 'tìm không dấu');
  assert.deepEqual(dishesForMeal('toi').map((d) => d.id), dishesForMeal('toi', { book: DISHES }).map((d) => d.id), 'mặc định như cũ');
});

check('một phần: mọi nguyên liệu, đạm và tinh bột co giãn theo calo bữa nhưng chỉ ½ đến 1½ lần', () => {
  const dish = coachDishToDish(saved);
  const plain = dishPortion(dish).parts.map((part) => part.grams);
  assert.deepEqual(plain, [150, 200, 100], 'không biết calo bữa thì đúng gram David nhập');
  const big = dishPortion(dish, { mealKcal: 2000 }).parts.map((part) => part.grams);
  assert.deepEqual(big, [225, 300, 100], 'tối đa 1½ lần, rau giữ nguyên');
  const small = dishPortion(dish, { mealKcal: 100 }).parts.map((part) => part.grams);
  assert.deepEqual(small, [75, 100, 100], 'tối thiểu ½ lần');
  const mid = dishPortion(dish, { mealKcal: 600 });
  assert.ok(Math.abs(mid.nutrients.values.kcal - 600) < 60, `gần 600 kcal: ${mid.nutrients.values.kcal}`);
  assert.ok(dishPortion(dish).parts.every((part) => part.options.length === 1), 'không có lựa chọn thay thế');
});

check('ghi món của David vào nhật ký: mỗi nguyên liệu một dòng, calo khớp', () => {
  let n = 0;
  const dish = coachDishToDish(saved);
  const portion = dishPortion(dish, { mealKcal: 600 });
  const entries = normalizeFoodEntries(dishEntries(portion.parts, 'toi', () => `e${n++}`));
  assert.equal(entries.length, 3);
  assert.equal(Math.round(dayTotals(entries).values.kcal), Math.round(portion.nutrients.values.kcal));
  assert.equal(coachDishNutrients(saved.items).values.kcal, dishPortion(dish).nutrients.values.kcal);
});

check('món đã lưu mà một nguyên liệu không còn trong bảng: bỏ dòng đó, món vẫn dùng được', () => {
  const dish = coachDishToDish({ ...saved, items: [...saved.items, { name: 'Đã bị bỏ', role: 'fat', grams: 10 }] });
  assert.equal(dish.items.length, 3);
  assert.equal(coachDishToDish({ ...saved, items: [{ name: 'Đã bị bỏ', role: 'fat', grams: 10 }] }), null);
  assert.equal(coachDishToDish({ ...saved, mealTypes: [] }), null);
});

check('danh sách món có sẵn bị ẩn: chỉ id có thật, không trùng', () => {
  const ids = DISHES.map((dish) => dish.id);
  assert.deepEqual(normalizeHiddenBuiltIn([ids[1], ids[1], 'không-có', 5], ids), [ids[1]]);
  assert.deepEqual(normalizeHiddenBuiltIn(null, ids), []);
});

const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
const coachPage = readFileSync(new URL('../coach-dishes.html', import.meta.url), 'utf8').replace(/\r/g, '');
const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('trang: học viên dùng sổ món của David ở cả hai chế độ; David có trang và link', () => {
  assert.ok(page.includes('dishesForMeal(sxDishMeal, { book: dishBookList })'));
  assert.ok(page.includes('book: dishBookList })'));
  assert.doesNotMatch(page, /getDish\(/, 'mọi chỗ tìm món đều qua findDish');
  assert.match(page, /const bookLoad = loadDishBook\(\);[\s\S]*await bookLoad;[\s\S]*const bookLoad = loadDishBook\(\);[\s\S]*await bookLoad;/);
  assert.ok(readFileSync(new URL('../app-shell.js', import.meta.url), 'utf8').includes("{ label: 'Món gợi ý', href: 'coach-dishes.html' }"));
  assert.doesNotMatch(coachPage, /deleteDoc|deleteCoachDish/, 'chỉ ẩn, không xoá');
});

console.log(`COACH_DISHES_OK ${passed} passed`);
