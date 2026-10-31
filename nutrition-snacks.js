// ============================================================
// DAVID COACHING — Bữa phụ bù macro cuối ngày
// ============================================================
// Thuần: không DOM, không Firebase.
//
// David, 2026-10-31: khi học viên đã ăn hết các bữa (ghi lượng thực tế hoặc đánh dấu) mà
// vẫn còn thiếu so với kế hoạch, gợi ý 1–3 món ăn nhẹ để bù. Học viên chọn MỘT món.
// Còn bữa chưa ăn thì không gợi ý ở đây: phần bù vào bữa còn lại (makeUpSuggestions) lo.
//
// Không có con số dinh dưỡng nào mới ở file này:
// - Macro của mọi món tính từ bảng thực phẩm (nutrition-foods.js).
// - Khoảng gram của món tự lọc lấy từ các món bữa phụ ('phu') trong nutrition-dishes.js;
//   thực phẩm lẻ lấy khoảng gram mà các món bữa phụ đó dùng cho chính thực phẩm ấy.
// - Món của David (DAVID_SNACKS) dùng khoảng gram David tự điền.

import { getFood } from './nutrition-foods.js';
import { DISHES_BY_MEAL_TYPE } from './nutrition-dishes.js';
import { dayIntake, INTAKE_TOLERANCE, MAKEUP_MIN_GAP, MAKEUP_MIN_RATIO } from './nutrition-intake-utils.js';

/**
 * Thiếu từ mức này trở lên mới gợi ý (và đồng thời thiếu ít nhất SNACK_MIN_RATIO so với kế hoạch).
 * Đạm và tinh bột dùng lại ngưỡng của phần bù vào bữa còn lại.
 * Béo 10 g và calo 150 kcal là ĐỀ XUẤT ban đầu (không lấy từ nguồn nào), chờ David duyệt.
 */
export const SNACK_MIN_GAP = Object.freeze({
  kcal: 150,
  protein: MAKEUP_MIN_GAP.protein,
  carbs: MAKEUP_MIN_GAP.carbs,
  fat: 10,
});
export const SNACK_MIN_RATIO = MAKEUP_MIN_RATIO;

/** Gợi ý tối đa bao nhiêu món (học viên chọn một). */
export const MAX_SNACK_SUGGESTIONS = 3;

/**
 * Món ăn nhẹ riêng của David, xếp trước các món tự lọc. Đang để TRỐNG.
 * Mẫu (chỉ để xem cách viết; tên thực phẩm phải đúng tên trong nutrition-foods.js):
 *
 *   Object.freeze({
 *     id: 'david-sua-chua-whey',
 *     name: 'Sữa chua Hy Lạp trộn whey',
 *     parts: [
 *       { food: 'Sữa chua Hy Lạp không đường', min: <gram>, max: <gram> },
 *       { food: 'Whey protein isolate (bột)', min: <gram>, max: <gram> },
 *     ],
 *     note: '<lời của David, hiện cho học viên>',
 *   }),
 */
export const DAVID_SNACKS = Object.freeze([]);

const MACROS = Object.freeze(['kcal', 'protein', 'carbs', 'fat']);
/** Đạm được ưu tiên khi chọn món: nặng gấp đôi khi chấm điểm. */
const WEIGHT = Object.freeze({ kcal: 1, protein: 2, carbs: 1, fat: 1 });
const STEP = 5;

const round1 = (value) => Math.round(value * 10) / 10;

function partMacros(food, grams) {
  const item = getFood(food);
  const k = (Number(grams) || 0) / 100;
  if (!item) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  return { kcal: item.kcal * k, protein: item.protein * k, carbs: item.carb * k, fat: item.fat * k };
}

export function snackTotals(parts = []) {
  const total = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  parts.forEach((part) => {
    const macros = partMacros(part.food, part.grams);
    MACROS.forEach((key) => { total[key] += macros[key]; });
  });
  return { kcal: Math.round(total.kcal), protein: round1(total.protein), carbs: round1(total.carbs), fat: round1(total.fat) };
}

/** Món bữa phụ của app → món ăn nhẹ: lấy lựa chọn đầu tiên ở mỗi nhóm, giữ khoảng gram của món. */
function dishSnack(dish) {
  const parts = [dish.proteinOptions[0], dish.carbOptions[0], dish.fatOptions[0], dish.vegetables[0]]
    .filter(Boolean)
    .map((option) => ({ food: option.name, min: option.min, max: option.max }));
  return { id: dish.id, name: dish.name, parts, note: '', source: 'app' };
}

/** Thực phẩm lẻ dùng trong các món bữa phụ, với khoảng gram các món đó dùng. */
function singleFoodSnacks(dishes) {
  const ranges = new Map();
  dishes.forEach((dish) => {
    [...dish.proteinOptions, ...dish.carbOptions, ...dish.fatOptions].forEach((option) => {
      const known = ranges.get(option.name);
      ranges.set(option.name, known
        ? { min: Math.min(known.min, option.min), max: Math.max(known.max, option.max) }
        : { min: option.min, max: option.max });
    });
  });
  return [...ranges.entries()].map(([food, range]) => ({
    id: `food:${food}`, name: food, parts: [{ food, ...range }], note: '', source: 'app',
  }));
}

/** Toàn bộ món có thể gợi ý: món của David trước, rồi món bữa phụ của app, rồi thực phẩm lẻ. */
export function snackCatalog({ davidSnacks = DAVID_SNACKS, dishes = DISHES_BY_MEAL_TYPE.phu } = {}) {
  const david = davidSnacks.map((snack) => ({
    id: snack.id, name: snack.name, note: String(snack.note || ''), source: 'david',
    parts: (snack.parts || []).map((part) => ({ food: part.food, min: Number(part.min), max: Number(part.max) })),
  }));
  return [...david, ...dishes.map(dishSnack), ...singleFoodSnacks(dishes)];
}

/** Món nào tham chiếu sai tên thực phẩm hoặc khoảng gram sai. Rỗng là hợp lệ. */
export function catalogProblems(catalog = snackCatalog()) {
  return catalog.flatMap((snack) => {
    if (!snack.parts.length) return [`${snack.name}: chưa có thành phần.`];
    return snack.parts.flatMap((part) => {
      if (!getFood(part.food)) return [`${snack.name}: không có "${part.food}" trong bảng thực phẩm.`];
      if (!(part.min > 0 && part.max >= part.min)) return [`${snack.name}: khoảng gram của ${part.food} không hợp lệ.`];
      return [];
    });
  });
}

/**
 * Phần còn thiếu của cả ngày. `short` là các macro thiếu đủ nhiều để gợi ý.
 * Món ăn ngoài chỉ có calo và đạm, nên ngày có món ăn ngoài thì không xét carb và béo.
 */
export function dayGaps(day) {
  const keys = day.eatenOut ? ['kcal', 'protein'] : MACROS;
  const gaps = {};
  const short = [];
  const minor = [];
  keys.forEach((key) => {
    const planned = Number(day.planned?.[key]) || 0;
    const gap = planned - (Number(day.actual?.[key]) || 0);
    gaps[key] = key === 'kcal' ? Math.round(gap) : round1(gap);
    if (planned > 0 && gap >= SNACK_MIN_GAP[key] && gap >= planned * SNACK_MIN_RATIO) short.push(key);
    // Bảng trong ngày ghi "Thiếu" nhưng chưa tới ngưỡng bù: nói rõ là bỏ qua được.
    else if (planned > 0 && gap > planned * INTAKE_TOLERANCE) minor.push(key);
  });
  return { gaps, short, minor };
}

/** Điểm càng nhỏ càng sát phần thiếu. Thiếu hay dư so với phần thiếu đều bị tính, theo tỉ lệ kế hoạch. */
function score(totals, gaps, planned) {
  return Object.keys(gaps).reduce((sum, key) => {
    const target = Math.max(0, gaps[key]);
    const scale = Math.max(1, Number(planned[key]) || 0) * 0.1;
    return sum + WEIGHT[key] * Math.abs(target - totals[key]) / scale;
  }, 0);
}

/** Gram cho từng thành phần trong khoảng của món, sao cho sát phần thiếu mà không vượt calo còn thiếu. */
function fitSnack(snack, gaps, planned, kcalBudget) {
  // Làm tròn LÊN bội số 5 g để không thấp hơn mức tối thiểu của món.
  const grams = snack.parts.map((part) => Math.max(STEP, Math.ceil(part.min / STEP) * STEP));
  if (grams.some((value, index) => value > snack.parts[index].max)) return null;
  const build = () => snack.parts.map((part, index) => ({ food: part.food, grams: grams[index] }));
  if (snackTotals(build()).kcal > kcalBudget) return null;
  let current = score(snackTotals(build()), gaps, planned);
  for (let guard = 0; guard < 400; guard += 1) {
    let best = null;
    snack.parts.forEach((part, index) => {
      if (grams[index] + STEP > part.max) return;
      grams[index] += STEP;
      const totals = snackTotals(build());
      const value = score(totals, gaps, planned);
      if (totals.kcal <= kcalBudget && value < current - 1e-9 && (!best || value < best.value)) best = { index, value };
      grams[index] -= STEP;
    });
    if (!best) break;
    grams[best.index] += STEP;
    current = best.value;
  }
  const parts = build();
  return { ...snack, parts, totals: snackTotals(parts), score: current };
}

/**
 * Gợi ý bữa phụ cuối ngày.
 * @returns {{status:'open'|'over'|'ok'|'suggest'|'none', gaps:object, short:string[], minor:string[], snacks:Array}}
 *   open: còn bữa chưa ăn; over: đã đủ hoặc dư calo; ok: không thiếu gì đáng bù;
 *   suggest: có món gợi ý; none: thiếu nhưng không món nào vừa.
 */
export function snackSuggestions({ meals = [], mealLogs = [], completedMealIds = [], foodLog = [], catalog = snackCatalog() } = {}) {
  const day = dayIntake({ meals, mealLogs, completedMealIds, foodLog });
  if (!day.complete) return { status: 'open', gaps: {}, short: [], minor: [], snacks: [] };
  const { gaps, short, minor } = dayGaps(day);
  if (gaps.kcal <= 0) return { status: 'over', gaps, short: [], minor: [], snacks: [] };
  if (!short.length) return { status: 'ok', gaps, short, minor, snacks: [] };

  // Chỉ nhắm vào phần thiếu đáng bù; macro khác vẫn được tính để món không làm dư chúng.
  const targets = Object.fromEntries(Object.keys(gaps).map((key) => [key, short.includes(key) ? gaps[key] : 0]));
  const kcalBudget = gaps.kcal;
  const empty = score({ kcal: 0, protein: 0, carbs: 0, fat: 0 }, targets, day.planned);
  const fitted = catalog
    .filter((snack) => !catalogProblems([snack]).length)
    .map((snack, order) => ({ fit: fitSnack(snack, targets, day.planned, kcalBudget), order }))
    .filter(({ fit }) => fit && fit.score < empty * 0.75)
    .sort((a, b) => (a.fit.source === 'david' ? 0 : 1) - (b.fit.source === 'david' ? 0 : 1)
      || (a.fit.score + a.fit.parts.length * 0.05) - (b.fit.score + b.fit.parts.length * 0.05)
      || a.order - b.order)
    .map(({ fit }) => fit);
  const snacks = [];
  const usedMain = new Set();
  for (const snack of fitted) {
    // Không gợi ý hai món trùng thực phẩm chính, để ba lựa chọn thật sự khác nhau.
    const main = snack.parts[0].food;
    if (usedMain.has(main)) continue;
    usedMain.add(main);
    snacks.push(snack);
    if (snacks.length === MAX_SNACK_SUGGESTIONS) break;
  }
  return { status: snacks.length ? 'suggest' : 'none', gaps, short, minor, snacks };
}
