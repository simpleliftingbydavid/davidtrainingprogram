// ============================================================
// DAVID COACHING — Món David tự thêm vào Món gợi ý (David, 2026-11-10)
// ============================================================
// Thuần: không DOM, không Firebase. Trước đây sổ món chỉ có 56 món viết trong code
// (nutrition-dishes.js). Giờ David thêm món của mình từ trang coach-dishes.html và ẩn được
// món có sẵn không muốn khách thấy. Chỉ dùng cho Món gợi ý của học viên, không dùng cho công cụ
// tạo thực đơn (công cụ đó cần món theo luật chặt hơn).
//
// Một món của David: mỗi nguyên liệu là một dòng { tên trong bảng thực phẩm, phần, gram cho 1 người }.
// Khác món có sẵn: không có lựa chọn thay thế, mọi nguyên liệu đều được ăn. Khi biết calo một bữa
// của khách, đạm và tinh bột được co giãn trong khoảng ½ đến 1½ lần gram David nhập; béo và rau giữ nguyên.
// Món chỉ ẩn, không xoá: những ngày khách đã ghi giữ nguyên vì nhật ký lưu từng nguyên liệu.

import { MEAL_MENUS } from './nutrition-dishes.js';
import { foodNutrients, roundNutrients, sumNutrients } from './nutrition-composition.js';
import { getFood } from './nutrition-foods.js';
import { getExtraFood } from './nutrition-foods-extra.js';

export const COACH_DISH_ROLES = Object.freeze({ protein: 'Đạm', carb: 'Tinh bột', fat: 'Chất béo', veg: 'Rau' });
const ROLE_ORDER = Object.keys(COACH_DISH_ROLES);
const GROUP_ROLE = Object.freeze({ PROTEIN: 'protein', CARB: 'carb', FAT: 'fat', RAU: 'veg' });

export const MAX_COACH_DISH_ITEMS = 12;
export const MAX_COACH_DISH_GRAMS = 1500;
export const MAX_COACH_DISH_NAME = 80;
export const MAX_COACH_DISH_COOK = 400;
export const MAX_HIDDEN_BUILT_IN = 100;
/** Đạm và tinh bột co giãn trong khoảng này so với gram David nhập. */
export const COACH_DISH_SCALE = Object.freeze({ min: 0.5, max: 1.5 });

export const MEAL_TYPE_LABELS = Object.freeze({
  sang: 'Sáng', trua: 'Trưa mang đi', ngoai: 'Trưa ăn ngoài', toi: 'Tối', phu: 'Bữa phụ',
});

const clean = (text, max) => String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const known = (name) => Boolean(getFood(name) || getExtraFood(name));

/** Phần đoán sẵn khi David chọn một thực phẩm (theo nhóm của bảng); David đổi được. */
export function roleForFood(name) {
  const group = getFood(name)?.group || getExtraFood(name)?.group;
  return GROUP_ROLE[group] || 'protein';
}

/**
 * Kiểm tra món David nhập.
 * @returns {{ ok: boolean, dish?: {name, mealTypes, kind, cook, items}, errors: string[] }}
 */
export function normalizeCoachDish(raw = {}) {
  const errors = [];
  const name = clean(raw.name, MAX_COACH_DISH_NAME);
  if (!name) errors.push('Nhập tên món.');
  const mealTypes = MEAL_MENUS.filter((type) => (raw.mealTypes || []).includes(type));
  if (!mealTypes.length) errors.push('Chọn ít nhất một bữa.');
  const kind = raw.kind === 'buy' ? 'buy' : 'cook';
  const cook = clean(raw.cook, MAX_COACH_DISH_COOK);
  const rows = Array.isArray(raw.items) ? raw.items : [];
  const items = [];
  rows.forEach((row) => {
    const itemName = String(row?.name ?? '').trim();
    if (!itemName) return;
    const grams = Math.round(Number(String(row.grams ?? '').replace(',', '.')));
    if (!known(itemName)) { errors.push(`Không có "${itemName}" trong bảng thực phẩm: chọn từ danh sách gợi ý.`); return; }
    if (!(grams > 0 && grams <= MAX_COACH_DISH_GRAMS)) { errors.push(`Gram của ${itemName} phải từ 1 đến ${MAX_COACH_DISH_GRAMS}.`); return; }
    items.push({ name: itemName, role: ROLE_ORDER.includes(row.role) ? row.role : roleForFood(itemName), grams });
  });
  if (!rows.some((row) => String(row?.name ?? '').trim())) errors.push('Thêm ít nhất một nguyên liệu.');
  if (items.length > MAX_COACH_DISH_ITEMS) errors.push(`Tối đa ${MAX_COACH_DISH_ITEMS} nguyên liệu.`);
  if (errors.length) return { ok: false, errors };
  return { ok: true, errors, dish: { name, mealTypes, kind, cook, items } };
}

/** Món David đã lưu (doc Firestore) → dạng món mà Món gợi ý dùng. Null nếu không còn đọc được. */
export function coachDishToDish(doc = {}) {
  if (!doc?.id) return null;
  // Một nguyên liệu bị bỏ khỏi bảng sau này: bỏ dòng đó, món vẫn dùng được nếu còn nguyên liệu.
  const items = (Array.isArray(doc.items) ? doc.items : [])
    .filter((item) => known(item?.name) && Number(item?.grams) > 0 && Number(item?.grams) <= MAX_COACH_DISH_GRAMS)
    .slice(0, MAX_COACH_DISH_ITEMS)
    .map((item) => ({ name: item.name, role: ROLE_ORDER.includes(item.role) ? item.role : roleForFood(item.name), grams: Math.round(Number(item.grams)) }));
  const mealTypes = MEAL_MENUS.filter((type) => (doc.mealTypes || []).includes(type));
  if (!items.length || !mealTypes.length || !clean(doc.name, MAX_COACH_DISH_NAME)) return null;
  const option = (item) => ({ name: item.name, min: item.grams, max: item.grams });
  const byRole = (role) => items.filter((item) => item.role === role).map(option);
  return Object.freeze({
    id: `coach:${doc.id}`,
    coachDishId: doc.id,
    custom: true,
    name: clean(doc.name, MAX_COACH_DISH_NAME),
    mealTypes,
    kind: doc.kind === 'buy' ? 'buy' : 'cook',
    cook: clean(doc.cook, MAX_COACH_DISH_COOK),
    items,
    // Để chỗ chỉ đọc (thẻ món ở chế độ đơn giản) liệt kê nguyên liệu như món có sẵn.
    proteinOptions: byRole('protein'),
    carbOptions: byRole('carb'),
    fatOptions: byRole('fat'),
    vegetables: byRole('veg'),
  });
}

const round5 = (value) => Math.max(5, Math.round(value / 5) * 5);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Một phần của món David: mọi nguyên liệu; đạm và tinh bột co giãn theo calo bữa. */
export function coachDishParts(dish, { mealKcal = null } = {}) {
  const parts = dish.items.map((item) => {
    const scales = item.role === 'protein' || item.role === 'carb';
    return {
      slot: item.role === 'veg' ? 'veg' : item.role,
      slotLabel: COACH_DISH_ROLES[item.role],
      name: item.name,
      grams: item.grams,
      min: scales ? Math.max(5, Math.round(item.grams * COACH_DISH_SCALE.min)) : item.grams,
      max: scales ? Math.round(item.grams * COACH_DISH_SCALE.max) : item.grams,
      options: [item.name],
    };
  });
  const kcal = sumNutrients(parts.map((part) => foodNutrients(part.name, part.grams))).values.kcal;
  if (Number(mealKcal) > 0 && kcal > 0) {
    const factor = Number(mealKcal) / kcal;
    parts.forEach((part) => {
      if (part.min !== part.max) part.grams = clamp(round5(part.grams * factor), part.min, part.max);
    });
  }
  return parts;
}

/** Calo và chất của món theo gram David nhập (cho trang của David). */
export function coachDishNutrients(items = []) {
  return roundNutrients(sumNutrients(items.filter((item) => known(item.name) && Number(item.grams) > 0)
    .map((item) => foodNutrients(item.name, Number(item.grams)))));
}

/** Danh sách món ẩn, đã làm sạch. */
export function normalizeHiddenBuiltIn(list, validIds) {
  const valid = new Set(validIds);
  return [...new Set((Array.isArray(list) ? list : []).map(String).filter((id) => valid.has(id)))].slice(0, MAX_HIDDEN_BUILT_IN);
}

/**
 * Sổ món khách thấy: món của David trước (món anh chủ động thêm), rồi món có sẵn chưa bị ẩn.
 * @param builtIn DISHES
 * @param coachDocs các doc coaches/{uid}/coachDishes
 * @param hidden id món có sẵn David đã ẩn
 */
export function dishBook(builtIn, coachDocs = [], hidden = []) {
  const off = new Set(hidden);
  const own = coachDocs.filter((doc) => doc && !doc.archived).map(coachDishToDish).filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return [...own, ...builtIn.filter((dish) => !off.has(dish.id))];
}
