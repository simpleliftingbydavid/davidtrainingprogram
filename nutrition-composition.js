// ============================================================
// DAVID COACHING — 20 chất của một món, một công thức, một ngày (11 chất + 9 vitamin)
// ============================================================
// Thuần: không DOM, không Firebase. Calo, đa chất và chất xơ lấy từ nutrition-foods.js; 6 vi chất
// và 9 vitamin lấy từ nutrition-micros.js. Một chất không có số liệu ở một món thì tổng của chất đó được đánh
// dấu "thiếu" (missing), không coi là 0, để màn hình nói rõ tổng có thể thấp hơn thật.

import { t } from './i18n.js';
import { getFood, STREET_DISHES } from './nutrition-foods.js';
import { FOOD_MICROS, MICRO_KEYS, VITAMIN_KEYS } from './nutrition-micros.js';
import { STREET_RECIPES } from './nutrition-street-recipes.js';
import { getExtraFood } from './nutrition-foods-extra.js';

export const MACRO_KEYS = Object.freeze(['kcal', 'protein', 'carb', 'fat', 'fiber']);
export { VITAMIN_KEYS };
export const NUTRIENT_KEYS = Object.freeze([...MACRO_KEYS, ...MICRO_KEYS, ...VITAMIN_KEYS]);

// Tên chất theo ngôn ngữ đang dùng (đọc mỗi lần, nên đổi ngôn ngữ là đổi theo).
export const NUTRIENT_LABELS = Object.freeze(
  ['kcal', 'protein', 'carb', 'fat', 'fiber', 'potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc',
    'vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'vitaminB1', 'vitaminB6', 'folate', 'vitaminB12']
    .reduce((labels, key) => Object.defineProperty(labels, key, { enumerable: true, get: () => t(`nutrient.${key}`) }), {}),
);
export const NUTRIENT_UNITS = Object.freeze({
  kcal: 'kcal', protein: 'g', carb: 'g', fat: 'g', fiber: 'g',
  potassium: 'mg', sodium: 'mg', calcium: 'mg', magnesium: 'mg', iron: 'mg', zinc: 'mg',
  vitaminA: 'µg', vitaminC: 'mg', vitaminD: 'µg', vitaminE: 'mg', vitaminK: 'µg',
  vitaminB1: 'mg', vitaminB6: 'mg', folate: 'µg', vitaminB12: 'µg',
});
/** Số lẻ khi hiển thị một chất: chất tính bằng mg nhỏ giữ 2 số. */
export const NUTRIENT_DIGITS = Object.freeze({ kcal: 0, iron: 2, zinc: 2, vitaminE: 2, vitaminB1: 2, vitaminB6: 2, vitaminB12: 2 });
export const digitsFor = (key) => NUTRIENT_DIGITS[key] ?? 1;

const empty = () => ({ values: Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])), missing: [] });

/** 11 chất của một thực phẩm trong bảng, theo gram (đúng trạng thái như tên món). Null nếu không có món. */
export function foodNutrients(name, grams) {
  const food = getFood(name);
  const k = Math.max(0, Number(grams) || 0) / 100;
  if (!food) {
    // Món mới (nutrition-foods-extra.js): cả 11 chất từ một dòng nguồn.
    const extra = getExtraFood(name);
    if (!extra) return null;
    const values = {};
    const missing = [];
    NUTRIENT_KEYS.forEach((key) => {
      const per100 = extra.values[key];
      if (per100 === null || per100 === undefined) { values[key] = 0; missing.push(key); } else values[key] = per100 * k;
    });
    return { values, missing };
  }
  const micros = { ...(FOOD_MICROS[name]?.micros || {}), ...(FOOD_MICROS[name]?.vitamins || {}) };
  const values = {};
  const missing = [];
  NUTRIENT_KEYS.forEach((key) => {
    const per100 = MACRO_KEYS.includes(key) ? food[key] : micros[key];
    if (per100 === null || per100 === undefined || !Number.isFinite(Number(per100))) { values[key] = 0; missing.push(key); }
    else values[key] = Number(per100) * k;
  });
  return { values, missing };
}

/** Cộng nhiều kết quả; một chất thiếu ở bất kỳ phần nào thì cả tổng ghi là thiếu chất đó. */
export function sumNutrients(parts = []) {
  const total = empty();
  const missing = new Set();
  parts.filter(Boolean).forEach((part) => {
    NUTRIENT_KEYS.forEach((key) => { total.values[key] += Number(part.values[key]) || 0; });
    (part.missing || []).forEach((key) => missing.add(key));
  });
  total.missing = NUTRIENT_KEYS.filter((key) => missing.has(key));
  return total;
}

export function roundNutrients(result) {
  const values = Object.fromEntries(NUTRIENT_KEYS.map((key) => {
    const v = result.values[key];
    const digits = digitsFor(key);
    return [key, Math.round(v * 10 ** digits) / 10 ** digits];
  }));
  return { values, missing: [...result.missing] };
}

/** 11 chất của một công thức [{food, grams}]. */
export function recipeNutrients(recipe = []) {
  return sumNutrients(recipe.map((part) => foodNutrients(part.food, part.grams)));
}

const STREET_BY_NAME = new Map(STREET_DISHES.map((dish) => [dish.name, dish]));
const RECIPE_BY_NAME = new Map(STREET_RECIPES.map((dish) => [dish.name, dish]));

// ---------------- Cỡ phần món ăn ngoài (David, 2026-11-18) ----------------
// Nhỏ / Vừa / Lớn (đặc biệt). Tô đặc biệt chủ yếu thêm thịt, nên thành phần đạm tăng nhiều hơn tinh
// bột; phần nhỏ giảm gần đều. Hệ số là ước lượng của Claude, David duyệt hướng làm 2026-11-18.
// Đồ uống và món đếm theo cái/cuốn không có cỡ: số phần đã nói đủ.
export const STREET_SIZES = Object.freeze(['S', 'M', 'L']);
export const STREET_SIZE_FACTOR = Object.freeze({
  S: Object.freeze({ PROTEIN: 0.75, CARB: 0.8, other: 0.85 }),
  M: Object.freeze({ PROTEIN: 1, CARB: 1, other: 1 }),
  L: Object.freeze({ PROTEIN: 1.4, CARB: 1.15, other: 1.1 }),
});
// Món chưa tách thành phần: calo theo hệ số tổng, đạm theo hệ số đạm.
const STREET_SIZE_KCAL = Object.freeze({ S: 0.8, M: 1, L: 1.25 });
const STREET_NO_SIZE = new Set([ // i18n-data
  'Bánh bao nhân thịt trứng', 'Bánh xèo (1 cái)', 'Gỏi cuốn (2 cuốn)', // i18n-data
  'Trà sữa trân châu (500ml)', 'Trà sữa ít đường, không trân châu', 'Cà phê sữa đá', 'Cà phê đen không đường', // i18n-data
  'Nước ngọt (lon 330ml)', 'Bia (lon 330ml)', 'Nước mía (500ml)', 'Sinh tố bơ', 'Chè (1 ly)', // i18n-data
]);
/** Món ăn ngoài này có chọn cỡ nhỏ / vừa / lớn không. */
export const streetHasSize = (name) => STREET_BY_NAME.has(name) && !STREET_NO_SIZE.has(name);
const cleanSize = (name, size) => (streetHasSize(name) && STREET_SIZES.includes(size) ? size : 'M');
const foodGroup = (name) => getFood(name)?.group || getExtraFood(name)?.group || 'other';

/** Công thức của một món ở một cỡ phần (gram từng thành phần đã nhân hệ số). */
export function sizedRecipe(recipe = [], size = 'M') {
  const factor = STREET_SIZE_FACTOR[size] || STREET_SIZE_FACTOR.M;
  return recipe.map((part) => ({ food: part.food, grams: part.grams * (factor[foodGroup(part.food)] ?? factor.other) }));
}

/**
 * Khoảng calo của một món ăn ngoài đã ghi: cùng độ rộng tương đối với khoảng của món
 * (STREET_DISHES), quanh đúng số đang tính. Làm tròn 10 kcal. Null nếu không phải món ăn ngoài.
 */
export function streetKcalRange(name, kcal) {
  const dish = STREET_BY_NAME.get(name);
  if (!dish || !(kcal > 0)) return null;
  const mid = (dish.kcalLow + dish.kcalHigh) / 2;
  if (!(mid > 0)) return null;
  const round = (value) => Math.max(0, Math.round(value / 10) * 10);
  return { low: round(kcal * dish.kcalLow / mid), high: round(kcal * dish.kcalHigh / mid) };
}

/**
 * Một phần món ăn ngoài. Công thức đã duyệt thì tính đủ (trừ natri, luôn thiếu); chưa duyệt hoặc
 * không tách được thì chỉ có calo (giữa khoảng) và đạm như trước, các chất khác thiếu.
 */
export function streetDishNutrients(name, servings = 1, size = 'M') {
  const dish = STREET_BY_NAME.get(name);
  if (!dish) return null;
  const count = Math.max(0, Number(servings) || 0);
  const sized = cleanSize(name, size);
  const recipe = RECIPE_BY_NAME.get(name);
  if (recipe?.approved && recipe.recipe) {
    const one = recipeNutrients(sizedRecipe(recipe.recipe, sized));
    const missing = new Set([...one.missing, 'sodium']);
    return {
      values: Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, key === 'sodium' ? 0 : one.values[key] * count])),
      missing: NUTRIENT_KEYS.filter((key) => missing.has(key)),
      estimated: true,
    };
  }
  const values = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, 0]));
  values.kcal = ((dish.kcalLow + dish.kcalHigh) / 2) * STREET_SIZE_KCAL[sized] * count;
  values.protein = dish.protein * STREET_SIZE_FACTOR[sized].PROTEIN * count;
  return { values, missing: NUTRIENT_KEYS.filter((key) => key !== 'kcal' && key !== 'protein'), estimated: true };
}
