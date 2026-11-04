// ============================================================
// DAVID COACHING — Món gợi ý cho khách tự nấu (David, 2026-11-04)
// ============================================================
// Thuần: không DOM, không Firebase. Khi khách không biết ăn gì, họ mở "Món gợi ý" của một bữa,
// chọn một món trong sổ món Việt (nutrition-dishes.js, các món David đã duyệt) và ghi cả món vào
// nhật ký bằng một lần bấm. Không phải thực đơn tính sẵn: khách chọn món, sửa gram như thật.
//
// Một phần của món: với mỗi chỗ (đạm, tinh bột, chất béo) lấy lựa chọn khách chọn (mặc định là
// lựa chọn đầu), rau thì lấy tất cả; gram ở giữa khoảng David đặt cho món đó. Nếu biết calo của
// một bữa, phần được co giãn cho gần mức đó nhưng mỗi nguyên liệu vẫn nằm trong khoảng của nó.

import { DISHES, DISH_KINDS } from './nutrition-dishes.js';
import { foodNutrients, roundNutrients, sumNutrients } from './nutrition-composition.js';

/** Bữa trong nhật ký → các loại bữa của sổ món. Trưa gồm cả món tự mang và món đặt ngoài. */
export const MEAL_TO_DISH_TYPES = Object.freeze({
  sang: Object.freeze(['sang']),
  trua: Object.freeze(['trua', 'ngoai']),
  toi: Object.freeze(['toi']),
  phu: Object.freeze(['phu']),
});

const plain = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

/** Các món hợp với một bữa; lọc theo tự nấu / mua ngoài và theo chữ gõ (không dấu cũng được). */
export function dishesForMeal(meal, { kind = 'all', query = '' } = {}) {
  const types = MEAL_TO_DISH_TYPES[meal] || [];
  const words = plain(query).split(/\s+/).filter(Boolean);
  return DISHES.filter((dish) => dish.mealTypes.some((type) => types.includes(type)))
    .filter((dish) => kind === 'all' || dish.kind === kind)
    .filter((dish) => words.every((word) => plain(`${dish.name} ${dish.cook}`).includes(word)));
}

const round5 = (value) => Math.max(5, Math.round(value / 5) * 5);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const SLOTS = Object.freeze([
  ['protein', 'proteinOptions', 'Đạm'],
  ['carb', 'carbOptions', 'Tinh bột'],
  ['fat', 'fatOptions', 'Chất béo'],
]);

/**
 * Một phần của món.
 * @param dish món trong DISHES
 * @param choice { protein?, carb?, fat? } tên nguyên liệu khách chọn trong các lựa chọn của chỗ đó
 * @param mealKcal calo mong muốn cho bữa này (null: không co giãn)
 * @returns {{ parts: Array<{slot, slotLabel, name, grams, min, max, options:string[]}>, nutrients }}
 */
export function dishPortion(dish, { choice = {}, mealKcal = null } = {}) {
  const parts = [];
  SLOTS.forEach(([slot, key, slotLabel]) => {
    const options = dish[key] || [];
    if (!options.length) return;
    const picked = options.find((option) => option.name === choice[slot]) || options[0];
    parts.push({ slot, slotLabel, name: picked.name, min: picked.min, max: picked.max, grams: round5((picked.min + picked.max) / 2), options: options.map((option) => option.name) });
  });
  (dish.vegetables || []).forEach((veg) => parts.push({ slot: 'veg', slotLabel: 'Rau', name: veg.name, min: veg.min, max: veg.max, grams: round5((veg.min + veg.max) / 2), options: [veg.name] }));
  const kcalOf = (list) => sumNutrients(list.map((part) => foodNutrients(part.name, part.grams))).values.kcal;
  const base = kcalOf(parts);
  if (Number(mealKcal) > 0 && base > 0) {
    // Co giãn đạm và tinh bột (phần tạo nên calo của bữa); rau và dầu giữ ở giữa khoảng.
    const factor = Number(mealKcal) / base;
    parts.forEach((part) => {
      if (part.slot === 'protein' || part.slot === 'carb') part.grams = clamp(round5(part.grams * factor), part.min, part.max);
    });
  }
  return { parts, nutrients: dishNutrients(parts) };
}

/** 11 chất của các nguyên liệu với gram hiện tại (khách có thể đã sửa gram). */
export function dishNutrients(parts = []) {
  return roundNutrients(sumNutrients(parts.map((part) => foodNutrients(part.name, part.grams))));
}

/** Các món ghi vào nhật ký: mỗi nguyên liệu một dòng, để khách sửa từng thứ sau đó. */
export function dishEntries(parts, meal, makeId) {
  return parts.filter((part) => Number(part.grams) > 0)
    .map((part) => ({ id: makeId(), meal, kind: 'food', name: part.name, grams: Math.round(Number(part.grams)), cooked: false }));
}

export const dishKindLabel = (dish) => DISH_KINDS[dish?.kind] || '';
