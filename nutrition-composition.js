// ============================================================
// DAVID COACHING — 11 chất của một món, một công thức, một ngày
// ============================================================
// Thuần: không DOM, không Firebase. Calo, đa chất và chất xơ lấy từ nutrition-foods.js; 6 vi chất
// lấy từ nutrition-micros.js. Một chất không có số liệu ở một món thì tổng của chất đó được đánh
// dấu "thiếu" (missing), không coi là 0, để màn hình nói rõ tổng có thể thấp hơn thật.

import { getFood, STREET_DISHES } from './nutrition-foods.js';
import { FOOD_MICROS, MICRO_KEYS } from './nutrition-micros.js';
import { STREET_RECIPES } from './nutrition-street-recipes.js';
import { getExtraFood } from './nutrition-foods-extra.js';

export const MACRO_KEYS = Object.freeze(['kcal', 'protein', 'carb', 'fat', 'fiber']);
export const NUTRIENT_KEYS = Object.freeze([...MACRO_KEYS, ...MICRO_KEYS]);

export const NUTRIENT_LABELS = Object.freeze({
  kcal: 'Calo', protein: 'Đạm', carb: 'Carb', fat: 'Béo', fiber: 'Chất xơ',
  potassium: 'Kali', sodium: 'Natri', calcium: 'Canxi', magnesium: 'Magie', iron: 'Sắt', zinc: 'Kẽm',
});
export const NUTRIENT_UNITS = Object.freeze({
  kcal: 'kcal', protein: 'g', carb: 'g', fat: 'g', fiber: 'g',
  potassium: 'mg', sodium: 'mg', calcium: 'mg', magnesium: 'mg', iron: 'mg', zinc: 'mg',
});

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
  const micros = FOOD_MICROS[name]?.micros || {};
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
    const digits = key === 'kcal' ? 0 : key === 'iron' || key === 'zinc' ? 2 : 1;
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

/**
 * Một phần món ăn ngoài. Công thức đã duyệt thì tính đủ (trừ natri, luôn thiếu); chưa duyệt hoặc
 * không tách được thì chỉ có calo (giữa khoảng) và đạm như trước, các chất khác thiếu.
 */
export function streetDishNutrients(name, servings = 1) {
  const dish = STREET_BY_NAME.get(name);
  if (!dish) return null;
  const count = Math.max(0, Number(servings) || 0);
  const recipe = RECIPE_BY_NAME.get(name);
  if (recipe?.approved && recipe.recipe) {
    const one = recipeNutrients(recipe.recipe);
    const missing = new Set([...one.missing, 'sodium']);
    return {
      values: Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, key === 'sodium' ? 0 : one.values[key] * count])),
      missing: NUTRIENT_KEYS.filter((key) => missing.has(key)),
      estimated: true,
    };
  }
  const values = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, 0]));
  values.kcal = ((dish.kcalLow + dish.kcalHigh) / 2) * count;
  values.protein = dish.protein * count;
  return { values, missing: NUTRIENT_KEYS.filter((key) => key !== 'kcal' && key !== 'protein'), estimated: true };
}
