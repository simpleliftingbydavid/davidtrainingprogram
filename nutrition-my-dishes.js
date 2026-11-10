// ============================================================
// DAVID COACHING — Món của tôi (David, 2026-11-10)
// ============================================================
// Thuần: không DOM, không Firebase. "Absorb what is useful, discard what is useless, and add what
// is specifically your own": khách lưu một bữa mình hay ăn (món tự nấu, phần của chính họ) thành
// "món của tôi", lần sau ghi lại bằng một lần bấm, theo phần ½ · 1 · 1½ · 2. Món chỉ là các dòng
// nhật ký sẵn có (thực phẩm, món theo nhãn, món ăn ngoài) bỏ id và bữa, nên mọi phép tính calo
// và vi chất giữ nguyên. David chỉ xem, không sửa.

import { entryNutrients, normalizeFoodEntry } from './nutrition-food-log.js';
import { roundNutrients, sumNutrients } from './nutrition-composition.js';

export const MAX_MY_DISHES = 40;
export const MAX_MY_DISH_ITEMS = 25;
export const MY_DISH_NAME_MAX = 60;
export const MY_DISH_PORTIONS = Object.freeze([0.5, 1, 1.5, 2]);
export const portionLabel = (portion) => ({ 0.5: '½', 1: '1', 1.5: '1½', 2: '2' })[portion] || String(portion);

const strip = ({ id: _id, meal: _meal, ...item }) => item;
// normalizeFoodEntry cần id và bữa; dùng tạm rồi bỏ đi.
const cleanItem = (item) => {
  const entry = normalizeFoodEntry({ ...item, id: 'x', meal: 'sang' });
  return entry ? strip(entry) : null;
};

export const cleanDishName = (name) => String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, MY_DISH_NAME_MAX);

/** Một món đã lưu, làm sạch để đọc hoặc lưu. Null nếu không còn nguyên liệu hợp lệ hoặc thiếu tên. */
export function normalizeMyDish(raw = {}) {
  const name = cleanDishName(raw.name);
  const items = (Array.isArray(raw.items) ? raw.items : []).map(cleanItem).filter(Boolean).slice(0, MAX_MY_DISH_ITEMS);
  if (!name || !items.length) return null;
  return { ...(raw.id ? { id: String(raw.id) } : {}), name, items };
}

/** Lưu các món đã ghi của một bữa thành món của tôi. */
export function dishFromMeal(entries = [], meal, name) {
  return normalizeMyDish({ name, items: entries.filter((entry) => entry.meal === meal) });
}

/** Tên gợi ý khi lưu: các nguyên liệu chính, ví dụ "Cơm trắng, Ức gà, Cải ngọt". */
export function suggestDishName(entries = [], meal) {
  const names = entries.filter((entry) => entry.meal === meal)
    .map((entry) => String(entry.name).replace(/\s*\(.*?\)\s*/g, ' ').trim())
    .filter((name, index, list) => name && list.indexOf(name) === index);
  return cleanDishName(names.slice(0, 3).join(', ') + (names.length > 3 ? '…' : ''));
}

const scale = (value, portion, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(Number(value) * portion * factor) / factor;
};

function scaledItem(item, portion) {
  if (item.kind === 'street') return { ...item, servings: Math.max(0.1, scale(item.servings, portion, 1)) };
  if (item.kind === 'label') return { ...item, amount: Math.max(0.1, scale(item.amount, portion, 1)) };
  const scaled = { ...item, grams: Math.max(1, scale(item.grams, portion)) };
  if (item.ml) scaled.ml = Math.max(1, scale(item.ml, portion));
  return scaled;
}

/** Các dòng ghi vào nhật ký cho một phần món: mỗi nguyên liệu một dòng, sửa được từng thứ sau đó. */
export function myDishEntries(dish, meal, portion = 1, makeId) {
  return (dish?.items || []).map((item) => normalizeFoodEntry({ ...scaledItem(item, portion), id: makeId(), meal })).filter(Boolean);
}

/** Calo và các chất của một phần món. */
export function myDishNutrients(dish, portion = 1) {
  return roundNutrients(sumNutrients((dish?.items || []).map((item) => entryNutrients({ ...scaledItem(item, portion), id: 'x', meal: 'sang' }))));
}
