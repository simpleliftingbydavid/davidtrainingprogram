// ============================================================
// DAVID COACHING — Chế độ chi tiết: học viên tự ghi món đã ăn (David, 2026-11-03)
// ============================================================
// Thuần: không DOM, không Firebase. Mỗi bữa (Sáng, Trưa, Tối, Bữa phụ) là danh sách món học viên
// ghi: thực phẩm trong bảng theo gram (thịt cá cân chín được, quy về sống), hoặc món ăn ngoài theo
// phần. Cộng 11 chất (nutrition-composition.js), so với mục tiêu của kế hoạch, ra phần còn lại.
//
// Không bịa số: chất nào một món không có số liệu thì tổng ghi "thiếu", không coi là 0. Món ăn
// ngoài chưa được David duyệt công thức chỉ tính calo và đạm.

import { FOODS, STREET_DISHES, getFood } from './nutrition-foods.js';
import { COOKED_YIELD, canWeighCooked, planGrams } from './nutrition-intake-utils.js';
import { NUTRIENT_KEYS, foodNutrients, roundNutrients, streetDishNutrients, sumNutrients } from './nutrition-composition.js';
import { approvedExtraFoods, getExtraFood } from './nutrition-foods-extra.js';

const SOURCE_LABEL = Object.freeze({ USDA: 'USDA', AU: 'Úc', NO: 'Na Uy', VN: 'Việt Nam' });

export const FOOD_LOG_MEALS = Object.freeze([
  Object.freeze({ id: 'sang', label: 'Sáng' }),
  Object.freeze({ id: 'trua', label: 'Trưa' }),
  Object.freeze({ id: 'toi', label: 'Tối' }),
  Object.freeze({ id: 'phu', label: 'Bữa phụ' }),
]);
export const MAX_FOOD_ENTRIES = 60;
export const MAX_GRAMS = 3000;
export const MAX_SERVINGS = 20;

const MEAL_IDS = new Set(FOOD_LOG_MEALS.map((meal) => meal.id));
const STREET_NAMES = new Set(STREET_DISHES.map((dish) => dish.name));

/** Một món đã ghi, làm sạch để lưu. Null nếu không hợp lệ. */
export function normalizeFoodEntry(raw = {}) {
  const meal = MEAL_IDS.has(raw.meal) ? raw.meal : null;
  const name = String(raw.name ?? '');
  const id = String(raw.id ?? '').slice(0, 40);
  if (!meal || !id) return null;
  if (raw.kind === 'street') {
    const servings = Number(raw.servings);
    if (!STREET_NAMES.has(name) || !(servings > 0 && servings <= MAX_SERVINGS)) return null;
    return { id, meal, kind: 'street', name, servings: Math.round(servings * 10) / 10 };
  }
  const grams = Number(raw.grams);
  // Món mới đã ghi vẫn đọc được dù sau đó bị bỏ duyệt; chọn món mới thì chỉ món đã duyệt (searchFoods).
  if ((!getFood(name) && !getExtraFood(name)) || !(grams > 0 && grams <= MAX_GRAMS)) return null;
  return { id, meal, kind: 'food', name, grams: Math.round(grams), cooked: raw.cooked === true && canWeighCooked(name) };
}

export function normalizeFoodEntries(list = []) {
  const seen = new Set();
  return (Array.isArray(list) ? list : [])
    .map(normalizeFoodEntry)
    .filter((entry) => entry && !seen.has(entry.id) && seen.add(entry.id))
    .slice(0, MAX_FOOD_ENTRIES);
}

/** 11 chất của một món đã ghi. Thịt cá cân chín được quy về gram sống trước khi tính. */
export function entryNutrients(entry) {
  if (entry?.kind === 'street') return streetDishNutrients(entry.name, entry.servings);
  if (!entry) return null;
  return foodNutrients(entry.name, planGrams({ name: entry.name, grams: entry.grams, cooked: entry.cooked }));
}

/** Tổng theo bữa và cả ngày; estimated = có món ăn ngoài (số ước tính). */
export function dayTotals(entries = []) {
  const perMeal = Object.fromEntries(FOOD_LOG_MEALS.map((meal) => {
    const items = entries.filter((entry) => entry.meal === meal.id);
    return [meal.id, { count: items.length, ...roundNutrients(sumNutrients(items.map(entryNutrients))) }];
  }));
  const all = roundNutrients(sumNutrients(entries.map(entryNutrients)));
  return { perMeal, ...all, estimated: entries.some((entry) => entry.kind === 'street'), count: entries.length };
}

/**
 * Mục tiêu trong ngày từ kế hoạch dinh dưỡng: calo, 3 đa chất, chất xơ và 6 vi chất. Không có thì null.
 * Natri là mức TỐI ĐA (không vượt), các chất khác là mức cần đạt.
 */
export function targetsFromPlan(plan) {
  const value = (raw) => (Number.isFinite(Number(raw)) && Number(raw) > 0 ? Number(raw) : null);
  const micros = plan?.micros || {};
  return {
    kcal: value(plan?.kcal), protein: value(plan?.protein), carb: value(plan?.carbs), fat: value(plan?.fat),
    fiber: value(micros.fiberG), potassium: value(micros.potassiumMg), sodium: value(micros.sodiumMg),
    calcium: value(micros.calciumMg), magnesium: value(micros.magnesiumMg), iron: value(micros.ironMg), zinc: value(micros.zincMg),
  };
}

export const LIMIT_NUTRIENTS = Object.freeze(['sodium']);

/**
 * Từng chất: đã ăn, mục tiêu, còn lại (âm là đã vượt), trạng thái.
 * status: 'none' không có mục tiêu · 'left' còn thiếu · 'done' đạt · 'over' vượt (natri). unknown: có món thiếu số liệu chất này.
 */
export function nutrientProgress(totals, targets) {
  return NUTRIENT_KEYS.map((key) => {
    const eaten = totals.values[key];
    const target = targets[key];
    const limit = LIMIT_NUTRIENTS.includes(key);
    const unknown = totals.missing.includes(key);
    // Thiếu số liệu ở một vài món không làm mất con số: vẫn so với mục tiêu, kèm cờ unknown
    // để màn hình nói rõ tổng có thể thấp hơn thật.
    let status = 'none';
    if (target !== null && target !== undefined) {
      if (limit) status = eaten > target ? 'over' : 'done';
      else status = eaten >= target ? 'done' : 'left';
    }
    return { key, eaten, target, remaining: target ? Math.round((target - eaten) * 10) / 10 : null, limit, unknown, status };
  });
}

/** Một "ngày" theo dạng nutrition-snacks.js hiểu, để gợi ý món ăn nhẹ theo phần còn lại. */
export function snackDay(totals, targets) {
  return {
    planned: { kcal: targets.kcal || 0, protein: targets.protein || 0, carbs: targets.carb || 0, fat: targets.fat || 0 },
    actual: { kcal: totals.values.kcal, protein: totals.values.protein, carbs: totals.values.carb, fat: totals.values.fat },
    // Món ăn ngoài chưa duyệt không có carb và béo: khi đó chỉ xét calo và đạm.
    eatenOut: totals.missing.includes('carb') || totals.missing.includes('fat'),
  };
}

// ---------------- Tìm món, món hay ăn, chép bữa ----------------

export const plainText = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/gi, 'd').toLowerCase();

/** Tìm món theo tên, không dấu cũng được. Thực phẩm trong bảng trước, rồi món ăn ngoài. */
export function searchFoods(query, { limit = 12 } = {}) {
  const words = plainText(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const hit = (name) => words.every((word) => plainText(name).includes(word));
  return [
    ...FOODS.filter((food) => hit(food.name)).map((food) => ({ kind: 'food', name: food.name, group: food.group })),
    ...approvedExtraFoods().filter((food) => hit(food.name))
      .map((food) => ({ kind: 'food', name: food.name, group: food.group, source: `Nguồn: ${SOURCE_LABEL[food.source.db] || food.source.db}` })),
    ...STREET_DISHES.filter((dish) => hit(dish.name)).map((dish) => ({ kind: 'street', name: dish.name })),
  ].slice(0, limit);
}

/** Món ghi nhiều nhất trong các ngày gần đây, kèm lượng của lần ghi gần nhất. */
export function frequentFoods(days = [], { limit = 8 } = {}) {
  const stats = new Map();
  [...days].sort((a, b) => (a.date < b.date ? 1 : -1)).forEach((day) => {
    normalizeFoodEntries(day.foodEntries).forEach((entry) => {
      const key = `${entry.kind}:${entry.name}`;
      const known = stats.get(key);
      if (known) known.count += 1;
      else stats.set(key, { count: 1, entry: { kind: entry.kind, name: entry.name, grams: entry.grams, servings: entry.servings, cooked: entry.cooked } });
    });
  });
  return [...stats.values()].sort((a, b) => b.count - a.count).slice(0, limit).map(({ count, entry }) => ({ ...entry, count }));
}

let idCounter = 0;
export function newEntryId(now = Date.now()) {
  idCounter = (idCounter + 1) % 1000;
  return `${now.toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Các món của một bữa hôm qua, chép sang bữa đó hôm nay với id mới. */
export function copyMeal(fromEntries = [], meal, makeId = newEntryId) {
  return normalizeFoodEntries(fromEntries).filter((entry) => entry.meal === meal).map((entry) => ({ ...entry, id: makeId() }));
}

/** Gram sống tương ứng khi cân chín, để hiện cho học viên. */
export function rawGramsText(entry) {
  if (entry?.kind !== 'food' || !entry.cooked) return '';
  return `≈ ${Math.round(entry.grams / COOKED_YIELD[entry.name])} g sống`;
}

// ---------------- Coach xem (Mốc 3) ----------------

/** Bữa chính (sáng, trưa, tối) có ghi món: đủ cả ba là "full". Bữa phụ không bắt buộc. */
const MAIN_MEALS = Object.freeze(['sang', 'trua', 'toi']);

/** Một ngày học viên đã ghi: các món, tổng 11 chất, số bữa có ghi, trạng thái cho lịch. */
export function foodLogDay(date, checkin) {
  const entries = normalizeFoodEntries(checkin?.foodEntries);
  const totals = dayTotals(entries);
  const meals = FOOD_LOG_MEALS.filter((meal) => totals.perMeal[meal.id].count > 0).map((meal) => meal.id);
  const mainLogged = MAIN_MEALS.filter((id) => meals.includes(id)).length;
  const status = !entries.length ? 'missed' : mainLogged === MAIN_MEALS.length ? 'full' : 'partial';
  return { date, entries, totals, meals, mealsLogged: meals.length, status, checkin: checkin || null };
}

/**
 * Các ngày trong kỳ (cũ trước): số ngày có ghi, số ngày đạm đạt (trong ±10% mục tiêu), calo và
 * từng chất trung bình trên những ngày có ghi. Không có ngày nào ghi thì trung bình là null.
 */
export function foodLogSummary(days = [], targets = targetsFromPlan(null), { tolerance = 0.1 } = {}) {
  const logged = days.filter((day) => day.entries.length);
  const averages = {};
  NUTRIENT_KEYS.forEach((key) => {
    averages[key] = logged.length ? Math.round(logged.reduce((sum, day) => sum + day.totals.values[key], 0) / logged.length * 10) / 10 : null;
  });
  const missing = NUTRIENT_KEYS.filter((key) => logged.some((day) => day.totals.missing.includes(key)));
  const proteinDays = targets.protein
    ? logged.filter((day) => Math.abs(day.totals.values.protein - targets.protein) <= targets.protein * tolerance).length
    : null;
  return {
    days,
    countedDays: days.length,
    loggedDays: logged.length,
    rate: days.length ? logged.length / days.length : null,
    fullDays: days.filter((day) => day.status === 'full').length,
    proteinDays,
    averages,
    missing,
    estimated: logged.some((day) => day.totals.estimated),
  };
}
