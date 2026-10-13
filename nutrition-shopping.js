// ============================================================
// DAVID TRAINING PROGRAM — The shopping list of a week of meals
// ============================================================
// Adds up what a client has to buy for the days they choose (the whole week, or one of its
// two halves, because fresh meat and fish are not bought once for seven days).
//
// READ FROM THE TEXT, NOT FROM STORED NUMBERS: every amount comes from the item lines the
// client actually reads, through the same parser that saves the plan. The coach edits those
// lines by hand, so a list built from anything else could tell the client to buy what the
// plan no longer says to cook.
//
// WHAT IS LEFT OUT ON PURPOSE: a meal whose dish can be bought ready-made (phở, bánh mì chả
// lụa) is listed on its own and its ingredients are not added — nobody buys 150 g of bánh
// phở to make one bowl. `includeReadyMade` puts them back for a client who cooks everything.
//
// Amounts are edible weights, exactly as the plan prints them. The one conversion is cooked
// rice to dry rice, since nobody buys cooked rice: the factors are the calories of the
// cooked food in nutrition-foods.js divided by those of the dry grain.
//
// Pure: no DOM, no Firebase.

import { FOODS } from './nutrition-foods.js';
import { parseGramItems } from './nutrition-item-parser.js';
import { WEEK_DAYS, mealHeadline } from './nutrition-week-utils.js';

/** The sections of the list, in the order a market is walked. */
export const SHOPPING_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'meat', label: 'Thịt, cá, trứng' }),
  Object.freeze({ id: 'cool', label: 'Sữa, đậu phụ và đồ mát' }),
  Object.freeze({ id: 'veg', label: 'Rau củ' }),
  Object.freeze({ id: 'fruit', label: 'Trái cây' }),
  Object.freeze({ id: 'starch', label: 'Gạo, bún, bánh mì' }),
  Object.freeze({ id: 'pantry', label: 'Hạt, dầu và đồ khô' }),
]);

/** The days a client shops for at once. */
export const SHOPPING_RANGES = Object.freeze([
  Object.freeze({ id: 'all', label: 'Cả tuần', title: 'Cả tuần (Thứ Hai đến Chủ nhật)', days: Object.freeze([0, 1, 2, 3, 4, 5, 6]) }),
  Object.freeze({ id: 'first', label: 'T2 – T4', title: 'Đầu tuần (Thứ Hai đến Thứ Tư)', days: Object.freeze([0, 1, 2]) }),
  Object.freeze({ id: 'second', label: 'T5 – CN', title: 'Cuối tuần (Thứ Năm đến Chủ nhật)', days: Object.freeze([3, 4, 5, 6]) }),
]);

export function shoppingRange(id) {
  return SHOPPING_RANGES.find((range) => range.id === id) || SHOPPING_RANGES[0];
}

const item = (category, options = {}) => Object.freeze({ category, ...options });

/**
 * How each food in the table is bought. Every food in FOODS must be here (a test fails
 * otherwise), so a food added to the table cannot be silently missing from a client's list.
 *   label   the name on the list, when the table's name carries a cooking state
 *   factor  bought weight ÷ the weight the plan prints (cooked rice → dry rice)
 *   cooked  what the plan's own weight is called, for the "để nấu …" note
 *   piece   grams of one piece, for foods counted rather than weighed
 *   unit    'ml' for liquids, which the table holds in grams
 */
export const SHOPPING_FOODS = Object.freeze({
  // Thịt, cá, trứng
  'Ức gà bỏ da (sống)': item('meat', { label: 'Ức gà bỏ da' }),
  'Đùi gà bỏ da (sống)': item('meat', { label: 'Đùi gà bỏ da' }),
  'Thịt heo thăn nạc': item('meat'),
  'Thịt heo ba chỉ': item('meat'),
  'Thịt bò thăn': item('meat'),
  'Thịt bò bắp': item('meat'),
  'Cá basa fillet': item('meat'),
  'Cá hồi fillet': item('meat'),
  'Cá thu': item('meat'),
  'Cá ngừ tươi': item('meat'),
  'Cá rô phi': item('meat'),
  'Tôm bỏ vỏ': item('meat', { label: 'Tôm (đã bóc vỏ)' }),
  'Mực tươi': item('meat'),
  'Trứng gà nguyên quả': item('meat', { label: 'Trứng gà', piece: 55, pieceLabel: 'quả' }),
  'Lòng trắng trứng': item('meat', { label: 'Trứng gà (lấy lòng trắng)', piece: 33, pieceLabel: 'quả' }),
  'Chả lụa': item('meat'),
  // Sữa, đậu phụ và đồ mát
  'Đậu phụ trắng': item('cool', { label: 'Đậu phụ' }),
  'Edamame (luộc)': item('cool', { label: 'Đậu nành lông (edamame)' }),
  'Sữa đậu nành không đường': item('cool', { unit: 'ml' }),
  'Sữa tươi không đường': item('cool', { unit: 'ml' }),
  'Sữa chua Hy Lạp không đường': item('cool'),
  'Phô mai cheddar': item('cool'),
  'Phô mai mozzarella': item('cool'),
  'Cream cheese': item('cool'),
  // Rau củ
  'Rau muống': item('veg'), 'Cải ngọt': item('veg'), 'Súp lơ xanh': item('veg'), 'Bắp cải': item('veg'),
  'Dưa leo': item('veg'), 'Cà chua': item('veg'), 'Giá đỗ': item('veg'), 'Rau dền': item('veg'),
  'Mướp': item('veg'), 'Bí xanh': item('veg'), 'Bí đỏ': item('veg'), 'Cà rốt': item('veg'),
  'Nấm rơm': item('veg'), 'Cà tím': item('veg'), 'Đậu bắp': item('veg'),
  'Khoai lang (luộc)': item('veg', { label: 'Khoai lang' }),
  'Khoai tây (luộc)': item('veg', { label: 'Khoai tây' }),
  'Bắp ngọt (luộc)': item('veg', { label: 'Bắp ngọt (phần hạt)' }),
  // Trái cây
  'Chuối': item('fruit'), 'Táo': item('fruit'), 'Cam': item('fruit'), 'Ổi': item('fruit'),
  'Dưa hấu': item('fruit'), 'Nho': item('fruit'),
  'Xoài chín': item('fruit', { label: 'Xoài' }),
  'Thanh long ruột trắng': item('fruit', { label: 'Thanh long' }),
  'Đu đủ chín': item('fruit', { label: 'Đu đủ' }),
  'Quả bơ': item('fruit', { label: 'Bơ (trái)' }),
  // Gạo, bún, bánh mì
  'Cơm trắng (chín)': item('starch', { label: 'Gạo trắng', factor: 0.36, cooked: 'cơm' }),
  'Cơm gạo lứt (chín)': item('starch', { label: 'Gạo lứt', factor: 0.34, cooked: 'cơm gạo lứt' }),
  'Gạo nếp (xôi chín)': item('starch', { label: 'Gạo nếp', factor: 0.49, cooked: 'xôi' }),
  'Bún tươi': item('starch'),
  'Bánh phở tươi': item('starch'),
  'Bánh phở khô': item('starch'),
  'Miến dong (khô)': item('starch', { label: 'Miến dong' }),
  'Bánh mì trắng': item('starch'),
  'Bánh mì nguyên cám': item('starch'),
  'Yến mạch (khô)': item('starch', { label: 'Yến mạch' }),
  // Hạt, dầu và đồ khô
  'Dầu ăn (oliu, đậu nành)': item('pantry', { label: 'Dầu ăn' }),
  'Bơ đậu phộng': item('pantry'),
  'Đậu phộng rang': item('pantry'),
  'Hạnh nhân': item('pantry'),
  'Hạt điều': item('pantry'),
  'Mè (vừng)': item('pantry'),
  'Nước cốt dừa': item('pantry', { unit: 'ml' }),
  'Dừa nạo': item('pantry'),
  'Whey protein isolate (bột)': item('pantry', { label: 'Whey protein' }),
  'Đường trắng': item('pantry'),
});

const READY_MADE = /\(mua sẵn được\)/;
const COOK_NOTE = /^Cách làm\s*:/;
const HAS_GRAMS = /\d\s*g(?![a-zA-ZÀ-ỹ])/;

/** True when the meal's dish is one the client can buy instead of cooking. Read from the
 *  dish line the client sees, so a coach who removes "(mua sẵn được)" changes the answer. */
export function isReadyMadeMeal(meal) {
  return READY_MADE.test(String((meal?.items || [])[0] || ''));
}

/** Rounded up to something a person can ask for at a stall: nobody buys 437 g. */
export function roundUpToBuy(grams) {
  const value = Number(grams) || 0;
  if (value <= 0) return 0;
  const step = value < 100 ? 10 : value < 1000 ? 50 : 100;
  return Math.ceil(value / step - 1e-9) * step;
}

const decimal = (value) => String(Math.round(value * 10) / 10).replace('.', ',');

/** "350 g", "1,2 kg", "400 ml", "2,1 lít". */
export function formatAmount(amount, unit = 'g') {
  const liquid = unit === 'ml';
  if (amount >= 1000) return `${decimal(amount / 1000)} ${liquid ? 'lít' : 'kg'}`;
  return `${amount} ${liquid ? 'ml' : 'g'}`;
}

function shoppingLine(name, grams) {
  const spec = SHOPPING_FOODS[name] || item('pantry');
  const label = spec.label || name;
  if (spec.piece) {
    const count = Math.ceil(grams / spec.piece - 1e-9);
    return { key: name, label, category: spec.category, grams, amount: `${count} ${spec.pieceLabel}`, note: '' };
  }
  const buy = roundUpToBuy(grams * (spec.factor || 1));
  const note = spec.factor ? `để nấu khoảng ${formatAmount(roundUpToBuy(grams))} ${spec.cooked}` : '';
  return { key: name, label, category: spec.category, grams, amount: `${spec.factor ? '≈ ' : ''}${formatAmount(buy, spec.unit)}`, note };
}

/**
 * The shopping list for some days of a week.
 *
 * @param {Array<{meals: Array}>} days  the week, Monday first (see planWeekDays)
 * @param {object} options
 * @param {number[]} options.dayIndexes       which days to shop for (0 = Monday)
 * @param {boolean} options.includeReadyMade  also add the ingredients of dishes that can be bought
 * @returns {{ groups, readyMade, extras, itemCount }}
 *   groups     [{ id, label, items: [{ key, label, amount, note, grams }] }], empty sections left out
 *   readyMade  [{ dish, when }] dishes left out of the list because they can be bought
 *   extras     lines the coach wrote that name no food in the table, so cannot be added up
 */
export function shoppingList(days = [], { dayIndexes = SHOPPING_RANGES[0].days, includeReadyMade = false } = {}) {
  const totals = new Map();
  const readyMade = [];
  const extras = new Map();
  for (const dayIndex of dayIndexes) {
    const day = days[dayIndex];
    if (!day) continue;
    const dayLabel = WEEK_DAYS[dayIndex]?.label || '';
    for (const meal of day.meals || []) {
      const lines = (meal.items || []).map((line) => String(line || '').trim()).filter(Boolean);
      const bought = isReadyMadeMeal(meal);
      if (bought) readyMade.push({ dish: mealHeadline(meal), when: [dayLabel, meal.name].filter(Boolean).join(', '), included: includeReadyMade });
      if (bought && !includeReadyMade) continue;
      const parsedLines = lines.map((line) => parseGramItems([line])[0] || null);
      // A first line with no amount is the name of the dish only when foods follow it. A meal
      // written entirely in words has no dish name to skip: every line of it is a note.
      const hasFoods = parsedLines.some(Boolean);
      lines.forEach((line, index) => {
        const parsed = parsedLines[index];
        if (parsed) { totals.set(parsed.name, (totals.get(parsed.name) || 0) + parsed.grams); return; }
        // Not a food from the table. The dish name and the cook note are not things to buy;
        // anything else the coach typed is shown as written.
        if (COOK_NOTE.test(line) || (hasFoods && index === 0 && !HAS_GRAMS.test(line))) return;
        extras.set(line, (extras.get(line) || 0) + 1);
      });
    }
  }
  const lines = [...totals].map(([name, grams]) => shoppingLine(name, Math.round(grams * 10) / 10));
  const groups = SHOPPING_CATEGORIES
    .map((category) => ({
      ...category,
      items: lines.filter((line) => line.category === category.id).sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    }))
    .filter((group) => group.items.length);
  return {
    groups,
    readyMade,
    extras: [...extras].map(([text, times]) => ({ text, times })),
    itemCount: lines.length,
  };
}

/** Foods in the table with no entry above: empty when the two lists agree. */
export function foodsWithoutShoppingEntry() {
  return FOODS.map((food) => food.name).filter((name) => !SHOPPING_FOODS[name]);
}

export const SHOPPING_NOTE = 'Số lượng là phần ăn được (đã bỏ vỏ, xương, hạt), làm tròn lên cho dễ mua. Khi mua nên dư ra một chút.';

/** The list as plain text, to paste into a notes app or a chat. */
export function shoppingListText(list, { title = SHOPPING_RANGES[0].title } = {}) {
  const blocks = [`ĐI CHỢ — ${title}`];
  for (const group of list.groups) {
    blocks.push([group.label.toUpperCase(), ...group.items.map((line) => `- ${line.label}: ${line.amount}${line.note ? ` (${line.note})` : ''}`)].join('\n'));
  }
  const bought = list.readyMade.filter((entry) => !entry.included);
  if (bought.length) blocks.push(['MÓN MUA SẴN (không tính vào danh sách)', ...bought.map((entry) => `- ${entry.dish} (${entry.when})`)].join('\n'));
  if (list.extras.length) blocks.push(['GHI THÊM TRONG THỰC ĐƠN', ...list.extras.map((entry) => `- ${entry.text}${entry.times > 1 ? ` (${entry.times} lần)` : ''}`)].join('\n'));
  if (!list.groups.length && !bought.length) blocks.push('Chưa có nguyên liệu nào cần mua cho những ngày này.');
  blocks.push(SHOPPING_NOTE);
  return blocks.join('\n\n');
}
