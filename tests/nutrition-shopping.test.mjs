// Run with:  node tests/nutrition-shopping.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SHOPPING_CATEGORIES, SHOPPING_FOODS, SHOPPING_NOTE, SHOPPING_RANGES, foodsWithoutShoppingEntry, formatAmount,
  isReadyMadeMeal, roundUpToBuy, shoppingList, shoppingListText, shoppingRange,
} from '../nutrition-shopping.js';
import { shoppingMarkup } from '../nutrition-shopping-ui.js';
import { FOODS } from '../nutrition-foods.js';
import { parseGramItems } from '../nutrition-item-parser.js';
import { buildWeekMenu, planDayFromResult } from '../nutrition-week-builder.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const meal = (name, items) => ({ id: 'm', name, items });
const day = (...meals) => ({ meals });
const empty = day();
/** A week with the given days first and nothing on the rest. */
const weekOf = (...days) => Array.from({ length: 7 }, (_, index) => days[index] || empty);
const find = (list, key) => list.groups.flatMap((group) => group.items).find((line) => line.key === key);

// ---------- the table ----------

check('every food in the table can be put on a shopping list, and the list names no food that is not in the table', () => {
  assert.deepEqual(foodsWithoutShoppingEntry(), []);
  const names = new Set(FOODS.map((food) => food.name));
  assert.deepEqual(Object.keys(SHOPPING_FOODS).filter((name) => !names.has(name)), []);
  const categories = new Set(SHOPPING_CATEGORIES.map((category) => category.id));
  for (const [name, spec] of Object.entries(SHOPPING_FOODS)) assert.ok(categories.has(spec.category), `${name}: ${spec.category}`);
});

check('only cooked grains are converted, and each conversion matches the calories of the two foods', () => {
  const converted = Object.entries(SHOPPING_FOODS).filter(([, spec]) => spec.factor);
  assert.deepEqual(converted.map(([name]) => name).sort(), ['Cơm gạo lứt (chín)', 'Cơm trắng (chín)', 'Gạo nếp (xôi chín)']);
  // Dry rice is about 360-370 kcal per 100 g; the factor is cooked kcal over dry kcal.
  for (const [name, spec] of converted) {
    const cookedKcal = FOODS.find((food) => food.name === name).kcal;
    const impliedDryKcal = cookedKcal / spec.factor;
    assert.ok(impliedDryKcal >= 350 && impliedDryKcal <= 375, `${name}: implies dry grain of ${Math.round(impliedDryKcal)} kcal`);
  }
});

// ---------- amounts ----------

check('an amount is rounded up to something a person can ask for', () => {
  assert.deepEqual([0, 7, 95, 100, 101, 437, 950, 1000, 1010].map(roundUpToBuy), [0, 10, 100, 100, 150, 450, 950, 1000, 1100]);
  assert.equal(roundUpToBuy(-5), 0);
});

check('amounts read the way they are said: grams, kilos, millilitres, litres', () => {
  assert.equal(formatAmount(350), '350 g');
  assert.equal(formatAmount(1000), '1 kg');
  assert.equal(formatAmount(1250), '1,3 kg');
  assert.equal(formatAmount(400, 'ml'), '400 ml');
  assert.equal(formatAmount(2100, 'ml'), '2,1 lít');
});

// ---------- adding up ----------

check('the same food on several days and meals is added into one line', () => {
  const week = weekOf(
    day(meal('Bữa trưa', ['Cơm + gà', 'Ức gà bỏ da (sống) — 150 g (≈ 1.4 phần đạm)', 'Cải ngọt — 200 g']), meal('Bữa tối', ['Ức gà bỏ da (sống) — 120 g'])),
    day(meal('Bữa trưa', ['Ức gà bỏ da (sống) — 130 g', 'Cải ngọt — 150 g'])),
  );
  const list = shoppingList(week);
  assert.equal(find(list, 'Ức gà bỏ da (sống)').amount, '400 g');
  assert.equal(find(list, 'Ức gà bỏ da (sống)').label, 'Ức gà bỏ da', 'the cooking state is not part of what is bought');
  assert.equal(find(list, 'Cải ngọt').amount, '350 g');
  assert.equal(list.itemCount, 2);
});

check('only the chosen days are shopped for, and the two halves cover the week between them', () => {
  const week = Array.from({ length: 7 }, () => day(meal('Bữa trưa', ['Thịt bò thăn — 100 g'])));
  assert.equal(find(shoppingList(week), 'Thịt bò thăn').amount, '700 g');
  assert.equal(find(shoppingList(week, { dayIndexes: shoppingRange('first').days }), 'Thịt bò thăn').amount, '300 g');
  assert.equal(find(shoppingList(week, { dayIndexes: shoppingRange('second').days }), 'Thịt bò thăn').amount, '400 g');
  assert.deepEqual([...shoppingRange('first').days, ...shoppingRange('second').days], shoppingRange('all').days);
  assert.equal(shoppingRange('nonsense').id, 'all');
  assert.deepEqual(SHOPPING_RANGES.map((range) => range.id), ['all', 'first', 'second']);
});

check('the amount comes from the line as the coach left it, not from what was generated', () => {
  const edited = meal('Bữa trưa', ['Cá hồi fillet — 175 g (≈ 1.2 phần đạm)']);
  // A stale structured copy must never win over the text.
  edited.gramItems = [{ name: 'Cá hồi fillet', grams: 95 }];
  assert.equal(find(shoppingList(weekOf(day(edited))), 'Cá hồi fillet').amount, '200 g');
});

check('cooked rice is listed as the dry rice to buy, with what it cooks into', () => {
  const list = shoppingList(weekOf(day(meal('Bữa trưa', ['Cơm trắng (chín) — 1000 g']), meal('Bữa tối', ['Cơm gạo lứt (chín) — 500 g', 'Gạo nếp (xôi chín) — 200 g']))));
  assert.deepEqual([find(list, 'Cơm trắng (chín)').label, find(list, 'Cơm trắng (chín)').amount, find(list, 'Cơm trắng (chín)').note], ['Gạo trắng', '≈ 400 g', 'để nấu khoảng 1 kg cơm']);
  // 500 g × 0.34 is 170 g, rounded up to the next 50.
  assert.deepEqual([find(list, 'Cơm gạo lứt (chín)').label, find(list, 'Cơm gạo lứt (chín)').amount], ['Gạo lứt', '≈ 200 g']);
  assert.deepEqual([find(list, 'Gạo nếp (xôi chín)').label, find(list, 'Gạo nếp (xôi chín)').amount], ['Gạo nếp', '≈ 100 g']);
});

check('eggs are counted, not weighed, and never fewer than the plan needs', () => {
  const list = shoppingList(weekOf(day(meal('Sáng', ['Trứng gà nguyên quả — 110 g']), meal('Phụ', ['Trứng gà nguyên quả — 100 g', 'Lòng trắng trứng — 100 g']))));
  assert.equal(find(list, 'Trứng gà nguyên quả').amount, '4 quả', '210 g at 55 g an egg is 3.8 eggs');
  assert.equal(find(list, 'Lòng trắng trứng').amount, '4 quả');
});

check('milk is listed by volume', () => {
  const week = Array.from({ length: 7 }, () => day(meal('Phụ', ['Sữa tươi không đường — 300 g'])));
  assert.equal(find(shoppingList(week), 'Sữa tươi không đường').amount, '2,1 lít');
  assert.equal(find(shoppingList(week, { dayIndexes: [0] }), 'Sữa tươi không đường').amount, '300 ml');
});

check('sections follow the order a market is walked, and empty ones are left out', () => {
  const list = shoppingList(weekOf(day(meal('Trưa', ['Dầu ăn (oliu, đậu nành) — 5 g', 'Chuối — 100 g', 'Cải ngọt — 100 g', 'Cá thu — 100 g', 'Bún tươi — 100 g']))));
  assert.deepEqual(list.groups.map((group) => group.id), ['meat', 'veg', 'fruit', 'starch', 'pantry']);
});

// ---------- dishes that can be bought ----------

const pho = meal('Bữa sáng', ['Phở bò tái (mua sẵn được)', 'Thịt bò thăn — 120 g', 'Bánh phở tươi — 250 g', 'Cách làm: Dặn quán ít béo.']);
const home = meal('Bữa trưa', ['Cơm + bò xào bí đỏ', 'Thịt bò thăn — 150 g', 'Bí đỏ — 200 g', 'Cách làm: Xào nhanh lửa lớn.']);

check('a dish that can be bought is listed on its own and its ingredients are not added', () => {
  assert.equal(isReadyMadeMeal(pho), true);
  assert.equal(isReadyMadeMeal(home), false);
  const list = shoppingList(weekOf(empty, day(pho, home)));
  assert.equal(find(list, 'Thịt bò thăn').amount, '150 g', 'only the home-cooked beef');
  assert.equal(find(list, 'Bánh phở tươi'), undefined);
  assert.deepEqual(list.readyMade, [{ dish: 'Phở bò tái', when: 'Thứ Ba, Bữa sáng', included: false }]);
});

check('a client who cooks everything can add those ingredients back', () => {
  const list = shoppingList(weekOf(empty, day(pho, home)), { includeReadyMade: true });
  assert.equal(find(list, 'Thịt bò thăn').amount, '300 g');
  assert.equal(find(list, 'Bánh phở tươi').amount, '250 g');
  assert.equal(list.readyMade[0].included, true);
});

check('whether a dish can be bought is read from its line, so the coach decides by editing it', () => {
  const cooked = meal('Bữa sáng', ['Phở bò tái', ...pho.items.slice(1)]);
  assert.equal(shoppingList(weekOf(day(cooked))).readyMade.length, 0);
  assert.equal(find(shoppingList(weekOf(day(cooked))), 'Bánh phở tươi').amount, '250 g');
});

// ---------- what cannot be added up ----------

check('a line the coach wrote that names no food in the table is shown as written, not dropped', () => {
  const custom = meal('Bữa phụ', ['Whey lắc + táo', 'Táo — 150 g', '1 ly cà phê đen không đường', 'Cá chép — 200 g', 'Cách làm: Lắc với nước lạnh.']);
  const list = shoppingList(weekOf(day(custom), day(meal('Bữa phụ', ['1 ly cà phê đen không đường']))));
  assert.deepEqual(list.extras, [{ text: '1 ly cà phê đen không đường', times: 2 }, { text: 'Cá chép — 200 g', times: 1 }]);
  assert.equal(list.itemCount, 1);
});

check('a meal written entirely in words keeps every line, the first one included', () => {
  const worded = meal('Bữa tối', ['Đạm: trứng, thịt nạc hoặc đậu hũ', 'Rau: một đĩa rau luộc']);
  assert.deepEqual(shoppingList(weekOf(day(worded))).extras.map((entry) => entry.text), ['Đạm: trứng, thịt nạc hoặc đậu hũ', 'Rau: một đĩa rau luộc']);
});

check('the dish name and the cook note are never things to buy', () => {
  const list = shoppingList(weekOf(day(home)));
  assert.deepEqual(list.extras, []);
});

check('a first line that is itself a food is bought, not mistaken for a dish name', () => {
  const list = shoppingList(weekOf(day(meal('Bữa phụ', ['Chuối — 120 g']))));
  assert.equal(find(list, 'Chuối').amount, '150 g');
});

// ---------- against a real generated week ----------

function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}
const built = buildWeekMenu({ targets: { kcal: 2000, protein: 140, carbs: 215, fat: 55 }, weightKg: 70, mealCount: 4, goalType: 'fat_loss', composition: 'dish', variety: 'balanced', random: rng(5) });
const realWeek = built.days.map((d) => planDayFromResult(d.result, { dayId: d.id, sex: 'male', wakeTime: '06:30' }));

check('for a generated week, nothing the client cooks is missing from the list and nothing is listed twice', () => {
  const list = shoppingList(realWeek, { includeReadyMade: true });
  const expected = new Map();
  realWeek.forEach((d) => d.meals.forEach((m) => parseGramItems(m.items).forEach((entry) => expected.set(entry.name, (expected.get(entry.name) || 0) + entry.grams))));
  const lines = list.groups.flatMap((group) => group.items);
  assert.equal(lines.length, expected.size);
  assert.equal(new Set(lines.map((line) => line.key)).size, lines.length);
  for (const line of lines) assert.ok(Math.abs(line.grams - expected.get(line.key)) < 0.2, `${line.key}: ${line.grams} vs ${expected.get(line.key)}`);
  assert.deepEqual(list.extras, [], 'a generated week has no line the list cannot read');
});

check('leaving out the dishes that can be bought makes the list shorter, never longer', () => {
  const all = shoppingList(realWeek, { includeReadyMade: true });
  const cooked = shoppingList(realWeek);
  assert.ok(cooked.readyMade.length > 0, 'this week has a dish that can be bought, so the comparison means something');
  assert.ok(cooked.itemCount <= all.itemCount);
  const grams = (list) => list.groups.flatMap((group) => group.items).reduce((sum, line) => sum + line.grams, 0);
  assert.ok(grams(cooked) < grams(all));
});

// ---------- as text and on screen ----------

check('the copied text has a title, the sections, the bought dishes and the note about amounts', () => {
  const text = shoppingListText(shoppingList(weekOf(empty, day(pho, home))), { title: shoppingRange('first').title });
  assert.ok(text.startsWith('ĐI CHỢ — Đầu tuần (Thứ Hai đến Thứ Tư)'));
  assert.match(text, /THỊT, CÁ, TRỨNG\n- Thịt bò thăn: 150 g/);
  assert.match(text, /MÓN MUA SẴN \(không tính vào danh sách\)\n- Phở bò tái \(Thứ Ba, Bữa sáng\)/);
  assert.ok(text.endsWith(SHOPPING_NOTE));
  assert.doesNotMatch(text, /<|\*\*/);
});

check('rice is copied with what it cooks into, and nothing to buy says so', () => {
  assert.match(shoppingListText(shoppingList(weekOf(day(meal('Trưa', ['Cơm trắng (chín) — 1000 g']))))), /- Gạo trắng: ≈ 400 g \(để nấu khoảng 1 kg cơm\)/);
  assert.match(shoppingListText(shoppingList(weekOf())), /Chưa có nguyên liệu nào cần mua/);
});

check('on screen the client gets a tick box per item, the coach a plain list, and ticks show as done', () => {
  const list = shoppingList(weekOf(day(home)));
  const forClient = shoppingMarkup(list, { tickable: true, ticked: new Set(['Bí đỏ']) });
  assert.equal((forClient.match(/data-shop-key=/g) || []).length, 2);
  assert.match(forClient, /<label class="shop-item done"><input type="checkbox" data-shop-key="Bí đỏ" checked>/);
  assert.match(forClient, /<label class="shop-item"><input type="checkbox" data-shop-key="Thịt bò thăn">/);
  const forCoach = shoppingMarkup(list, { tickable: false });
  assert.doesNotMatch(forCoach, /type="checkbox"/);
  assert.match(forCoach, /<span class="shop-amount">150 g<\/span>/);
});

check('everything a coach can type is escaped before it reaches the page', () => {
  const hostile = meal('<b>Bữa</b>', ['<img src=x onerror=alert(1)> (mua sẵn được)', '<script>alert(2)</script>']);
  const html = shoppingMarkup(shoppingList(weekOf(day(hostile), day(meal('Trưa', ['Món', '<i>ghi chú</i>'])))));
  assert.doesNotMatch(html, /<img|<script|<i>|<b>/);
  assert.match(html, /&lt;img src=x/);
});

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const client = read('nutrition.html');
const builder = read('nutrition-builder.html');

check('the client page shows the list for a week plan, with ticks only for the client and kept per plan version', () => {
  assert.match(client, /<link rel="stylesheet" href="nutrition-shopping\.css">/);
  assert.match(client, /<details class="shop-panel" id="shopping-details">/);
  assert.match(client, /function renderShopping\(\) \{\s*if \(!planWeek\(\)\) return;/);
  assert.match(client, /tickable: role === 'student',/);
  assert.match(client, /storageKey: `dc-shopping:\$\{studentUid\}:\$\{plan\?\.versionId \|\| 'current'\}`,/);
});

check('the builder previews the list read-only, and redraws it after a day is switched or a meal is edited', () => {
  assert.match(builder, /<link rel="stylesheet" href="nutrition-shopping\.css">/);
  assert.match(builder, /getDays: \(\) => weekOf\(generatedPlan\)\?\.days \|\| \[\],\s*tickable: false,/);
  assert.match(builder, /\$\('builder-shopping'\)\.addEventListener\('toggle', refreshBuilderShopping\);/);
  assert.match(builder, /\$\('meal-preview'\)\.addEventListener\('focusout', refreshBuilderShopping\);/);
  assert.match(builder, /editorShown = true;\s*refreshBuilderShopping\(\);/);
  assert.match(builder, /function refreshBuilderShopping\(\) \{\s*if \(!\$\('builder-shopping'\)\.open \|\| !weekOf\(generatedPlan\)\) return;\s*stashEditor\(\);/);
});

console.log(`nutrition-shopping: ${passed} passed`);
