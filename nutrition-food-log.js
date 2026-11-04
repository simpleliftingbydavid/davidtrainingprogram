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
import { MAX_LABEL_AMOUNT, cleanPer100, labelFoodTitle, labelNutrients } from './nutrition-label-foods.js';

const SOURCE_LABEL = Object.freeze({ USDA: 'USDA', AU: 'Úc', NO: 'Na Uy', VN: 'Việt Nam', JP: 'Nhật' });

// ---------------- Đồ uống và chất lỏng: nhập theo ml (David, 2026-11-04) ----------------
// Số liệu dinh dưỡng là trên 100 g, nên ml được đổi ra gram theo khối lượng riêng (g/ml) lấy từ
// khẩu phần chuẩn của chính dòng USDA của món đó (1 cốc = 236,6 ml, 1 thìa canh = 14,79 ml).
// Món không có ở đây vẫn nhập theo gram.
export const LIQUID_DENSITY = Object.freeze({
  'Nước dừa tươi': 1.014, // USDA 170174: 1 cốc = 240 g
  'Sữa tươi không đường': 1.031, // USDA: 1 cốc = 244 g
  'Sữa tươi ít béo 2%': 1.04, // USDA 172205: 1 cốc = 246 g
  'Sữa tách béo': 1.035, // USDA 173432: 1 cốc = 245 g
  'Sữa đậu nành không đường': 1.027, // USDA: 1 cốc = 243 g
  'Sữa đặc có đường': 1.293, // USDA 171275: 1 cốc = 306 g
  'Nước mắm': 1.217, // USDA 174531: 1 thìa canh = 18 g
  'Nước tương': 1.078, // USDA 174277: 1 cốc = 255 g
  'Giấm táo': 1.01, // USDA 173469: 1 cốc = 239 g
  'Dầu ăn (oliu, đậu nành)': 0.913, // USDA: 1 thìa canh = 13,5 g
  'Nước cốt dừa': 1.014, // USDA: 1 thìa canh = 15 g
  'Nước lọc': 1.0, // USDA 173647: 1 lít = 1000 g
  'Cà phê đen (pha)': 1.0, // USDA 171890: 1 cốc = 237 g
  'Trà xanh (pha)': 1.0, // USDA 171917: 1 fl oz = 29,6 g
  'Dầu mè': 0.921, // USDA 171016: 1 cốc = 218 g
  'Dầu đậu phộng': 0.913, // USDA 171410: 1 cốc = 216 g
  'Giấm balsamic': 1.078, // USDA 172241: 1 cốc = 255 g
});
export const MAX_ML = 3000;
export const isLiquid = (name) => Object.prototype.hasOwnProperty.call(LIQUID_DENSITY, name);
/** Gram tương ứng với một lượng ml của món lỏng (để tính chất); món không lỏng trả về null. */
export const mlToGrams = (name, ml) => (isLiquid(name) ? Math.round(Number(ml) * LIQUID_DENSITY[name]) : null);
/** ml của một món lỏng đã ghi: ml đã lưu, hoặc đổi từ gram với món ghi trước khi có ml. */
export const entryMl = (entry) => (!isLiquid(entry?.name) ? null
  : Number(entry.ml) > 0 ? Math.round(Number(entry.ml)) : Math.round(Number(entry.grams) / LIQUID_DENSITY[entry.name]));

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
  // Món theo nhãn (nutrition-label-foods.js): giữ bản sao số liệu trên 100 g/ml của lúc ghi.
  if (raw.kind === 'label') {
    const amount = Number(raw.amount);
    const unit = raw.unit === 'ml' ? 'ml' : 'g';
    const labelName = String(raw.name ?? '').slice(0, 150);
    if (!labelName || !(amount > 0 && amount <= MAX_LABEL_AMOUNT) || !raw.per100) return null;
    return {
      id, meal, kind: 'label', labelId: String(raw.labelId ?? '').slice(0, 40), name: labelName, unit,
      amount: Math.round(amount * 10) / 10, per100: cleanPer100(raw.per100),
    };
  }
  if (raw.kind === 'street') {
    const servings = Number(raw.servings);
    if (!STREET_NAMES.has(name) || !(servings > 0 && servings <= MAX_SERVINGS)) return null;
    return { id, meal, kind: 'street', name, servings: Math.round(servings * 10) / 10 };
  }
  // Món lỏng nhập theo ml: gram để tính chất được đổi từ ml; ml được giữ để hiện lại đúng như đã nhập.
  const ml = isLiquid(name) && Number(raw.ml) > 0 ? Number(raw.ml) : null;
  if (ml !== null && ml > MAX_ML) return null;
  const grams = ml !== null ? mlToGrams(name, ml) : Number(raw.grams);
  // Món mới đã ghi vẫn đọc được dù sau đó bị bỏ duyệt; chọn món mới thì chỉ món đã duyệt (searchFoods).
  if ((!getFood(name) && !getExtraFood(name)) || !(grams > 0 && grams <= MAX_GRAMS)) return null;
  return {
    id, meal, kind: 'food', name, grams: Math.round(grams), cooked: raw.cooked === true && canWeighCooked(name),
    ...(ml !== null ? { ml: Math.round(ml) } : {}),
  };
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
  if (entry?.kind === 'label') return labelNutrients(entry.per100, entry.amount);
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

// Danh sách tìm món được dựng một lần, tên đã bỏ dấu sẵn: gõ từng chữ không phải bỏ dấu lại
// cả bảng mấy trăm món (2026-11-04, nhập món bị chậm trên điện thoại).
let searchIndex = null;
function foodSearchIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = [
    ...FOODS.map((food) => ({ kind: 'food', name: food.name, group: food.group })),
    ...approvedExtraFoods().map((food) => ({ kind: 'food', name: food.name, group: food.group, source: `Nguồn: ${SOURCE_LABEL[food.source.db] || food.source.db}` })),
    ...STREET_DISHES.map((dish) => ({ kind: 'street', name: dish.name })),
  ].map((item) => ({ item: Object.freeze(item), plain: plainText(item.name) }));
  return searchIndex;
}

/** Món theo nhãn David đã nhập, ở dạng kết quả tìm món (kèm số liệu để ghi). */
export function labelSearchItems(labelFoods = []) {
  return labelFoods.filter((food) => food && !food.archived && food.name).map((food) => ({
    kind: 'label', labelId: food.id, name: labelFoodTitle(food), unit: food.unit === 'ml' ? 'ml' : 'g',
    per100: cleanPer100(food.per100), servingLabel: food.servingLabel || '', servingAmount: Number(food.servingAmount) || null,
    source: 'Theo nhãn sản phẩm',
  }));
}

/**
 * Tìm món theo tên, không dấu cũng được. Món theo nhãn của David trước (đúng sản phẩm khách mua),
 * rồi thực phẩm trong bảng, rồi món ăn ngoài.
 */
export function searchFoods(query, { limit = 12, labelFoods = [] } = {}) {
  const words = plainText(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const found = [];
  for (const item of labelSearchItems(labelFoods)) {
    if (words.every((word) => plainText(item.name).includes(word))) found.push(item);
    if (found.length >= limit) return found;
  }
  for (const { item, plain } of foodSearchIndex()) {
    if (words.every((word) => plain.includes(word))) found.push({ ...item });
    if (found.length >= limit) break;
  }
  return found;
}

/** Món ghi nhiều nhất trong các ngày gần đây, kèm lượng của lần ghi gần nhất. */
export function frequentFoods(days = [], { limit = 8 } = {}) {
  const stats = new Map();
  [...days].sort((a, b) => (a.date < b.date ? 1 : -1)).forEach((day) => {
    normalizeFoodEntries(day.foodEntries).forEach((entry) => {
      const key = `${entry.kind}:${entry.labelId || entry.name}`;
      const known = stats.get(key);
      if (known) known.count += 1;
      else if (entry.kind === 'label') stats.set(key, { count: 1, entry: { kind: 'label', labelId: entry.labelId, name: entry.name, unit: entry.unit, amount: entry.amount, per100: entry.per100 } });
      else stats.set(key, { count: 1, entry: { kind: entry.kind, name: entry.name, grams: entry.grams, ml: entry.ml, servings: entry.servings, cooked: entry.cooked } });
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

/** Lượng của một món đã ghi để hiện: "250 ml", "150 g chín ≈ 200 g sống", "1 phần · ước tính". */
export function entryAmountLabel(entry, number = (value) => String(value)) {
  if (entry?.kind === 'street') return `${number(entry.servings)} phần · ước tính`;
  if (entry?.kind === 'label') return `${number(entry.amount)} ${entry.unit} · theo nhãn`;
  if (isLiquid(entry?.name)) return `${number(entryMl(entry))} ml`;
  return `${number(entry.grams)} g${entry.cooked ? ` chín ${rawGramsText(entry)}` : ''}`;
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
