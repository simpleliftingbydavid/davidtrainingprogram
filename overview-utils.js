// ============================================================
// DAVID COACHING — Tổng quan học viên (coach)
// ============================================================
// Thuần: không DOM, không Firebase. Nhận dữ liệu đã đọc của một học viên (thực đơn, các ngày
// dinh dưỡng, các lần ghi cân, ảnh) và trả về số liệu cho bảng tổng hợp, trang chi tiết và
// phần Portfolio. Không có dữ liệu thì trả về null, không bao giờ đoán số.

import { todayIso } from './nutrition-log-utils.js';
import { addDays } from './habit-utils.js';
import { dayOf, daysBetween, toDate } from './home-utils.js';
import { mealsForDate } from './nutrition-week-utils.js';
import { ANGLES, normalizeAngle } from './progress-utils.js';
import { normalizeNutritionSettings, nutritionMode, simpleSummary } from './nutrition-simple.js';
import { foodLogDay, foodLogSummary, targetsFromPlan } from './nutrition-food-log.js';

/** Khoảng thời gian chọn được, mặc định 14 ngày. */
export const PERIODS = Object.freeze([7, 14, 30]);
export const DEFAULT_PERIOD = 14;

/**
 * Khi nào một học viên được đánh dấu "Cần chú ý". David chốt các mức này ngày 2026-11-02.
 *   weightGapDays: không ghi cân từ bấy nhiêu ngày liền trở lên
 *   mealRate:      tick hoặc ghi bữa dưới tỉ lệ này trong kỳ
 *   photoDays:     quá bấy nhiêu ngày chưa chụp ảnh
 */
export const ATTENTION = Object.freeze({ weightGapDays: 3, mealRate: 0.7, photoDays: 28 });

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Các ngày của kỳ, cũ trước, kết thúc ở hôm nay. */
export function periodDays(days = DEFAULT_PERIOD, today = todayIso()) {
  return Array.from({ length: days }, (_, index) => addDays(today, index - days + 1));
}

// ---------------- Dinh dưỡng ----------------

/** Ngày bắt đầu có thực đơn: sớm nhất giữa ngày đăng thực đơn và ngày dinh dưỡng đầu tiên. */
export function nutritionStart(plan, checkins = []) {
  const dates = [dayOf(plan?.publishedAt), ...checkins.map((row) => row.date)].filter(Boolean).sort();
  return dates[0] || null;
}

/** Một ngày dinh dưỡng: bao nhiêu bữa kế hoạch, bao nhiêu bữa đã tick hoặc ghi, có ghi khác, có ăn ngoài. */
export function nutritionDay(plan, iso, checkin) {
  const planned = Number(checkin?.plannedMealCount) || mealsForDate(plan, iso).length;
  const ticked = new Set(Array.isArray(checkin?.completedMealIds) ? checkin.completedMealIds : []);
  const logs = Array.isArray(checkin?.mealLogs) ? checkin.mealLogs : [];
  logs.forEach((log) => { if (log?.mealId) ticked.add(log.mealId); });
  const done = Math.min(planned, ticked.size);
  const eatenOut = Array.isArray(checkin?.foodLog) ? checkin.foodLog.length : 0;
  const status = !planned ? 'none' : done >= planned ? 'full' : done > 0 ? 'partial' : 'missed';
  return { date: iso, planned, done, changed: logs.length, eatenOut, status, checkin: checkin || null };
}

/**
 * Dinh dưỡng trong kỳ. Ngày trước khi có thực đơn không tính.
 * @returns {null | {days, planned, done, rate, fullDays, countedDays, changed, eatenOut}}
 */
export function nutritionSummary(plan, checkins = [], days = DEFAULT_PERIOD, today = todayIso()) {
  if (!plan) return null;
  const start = nutritionStart(plan, checkins);
  const byDate = new Map(checkins.map((row) => [row.date, row]));
  const rows = periodDays(days, today)
    .filter((iso) => !start || iso >= start)
    .map((iso) => nutritionDay(plan, iso, byDate.get(iso)));
  const planned = rows.reduce((sum, row) => sum + row.planned, 0);
  const done = rows.reduce((sum, row) => sum + row.done, 0);
  return {
    days: rows,
    planned,
    done,
    rate: planned ? done / planned : null,
    fullDays: rows.filter((row) => row.status === 'full').length,
    countedDays: rows.length,
    changed: rows.reduce((sum, row) => sum + row.changed, 0),
    eatenOut: rows.reduce((sum, row) => sum + row.eatenOut, 0),
  };
}

/**
 * Dinh dưỡng chế độ đơn giản trong kỳ: bữa đủ đạm và rau, ngày đạt bước. Ngày trước khi học viên
 * bắt đầu (thực đơn, lần ghi đầu tiên hoặc ngày tạo hồ sơ, lấy ngày sớm nhất) không tính.
 */
export function simpleNutritionSummary(student, plan, checkins = [], days = DEFAULT_PERIOD, today = todayIso()) {
  const settings = normalizeNutritionSettings(student?.nutritionSettings);
  const start = [nutritionStart(plan, checkins), dayOf(student?.createdAt)].filter(Boolean).sort()[0] || null;
  const byDate = new Map(checkins.map((row) => [row.date, row]));
  const rows = periodDays(days, today)
    .filter((iso) => !start || iso >= start)
    .map((date) => ({ date, checkin: byDate.get(date) || null }));
  const summary = simpleSummary(rows, { settings, plan });
  return {
    mode: 'simple',
    days: summary.perDay,
    planned: summary.meals.planned,
    done: summary.meals.done,
    rate: summary.meals.rate,
    steps: summary.steps,
    stepTarget: settings.stepTarget,
    countedDays: rows.length,
    fullDays: summary.perDay.filter((day) => day.status === 'full').length,
  };
}

/** Dinh dưỡng của một học viên theo đúng chế độ của họ. */
export function studentNutrition(student, plan, checkins = [], days = DEFAULT_PERIOD, today = todayIso()) {
  if (nutritionMode(student) === 'simple') return simpleNutritionSummary(student, plan, checkins, days, today);
  return foodLogNutritionSummary(student, plan, checkins, days, today);
}

/**
 * Chế độ chi tiết (học viên tự ghi món, nutrition-food-log.js): ngày có ghi, đạm đạt, calo trung
 * bình. Ngày trước khi học viên bắt đầu không tính, như chế độ đơn giản.
 */
export function foodLogNutritionSummary(student, plan, checkins = [], days = DEFAULT_PERIOD, today = todayIso()) {
  const start = [nutritionStart(plan, checkins), dayOf(student?.createdAt)].filter(Boolean).sort()[0] || null;
  const byDate = new Map(checkins.map((row) => [row.date, row]));
  const targets = targetsFromPlan(plan);
  const rows = periodDays(days, today).filter((iso) => !start || iso >= start).map((date) => foodLogDay(date, byDate.get(date)));
  return { mode: 'foodlog', targets, ...foodLogSummary(rows, targets) };
}

// ---------------- Cân nặng ----------------

/** Một số cân mỗi ngày (lần ghi sau cùng của ngày đó), cũ trước. */
export function dailyWeights(logs = []) {
  const byDay = new Map();
  logs.forEach((log) => {
    const weight = Number(log?.weight);
    const day = dayOf(log?.loggedAt);
    if (!day || !Number.isFinite(weight) || weight <= 0) return;
    const when = toDate(log.loggedAt).getTime();
    const known = byDay.get(day);
    if (!known || when >= known.when) byDay.set(day, { day, weight, when });
  });
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? -1 : 1)).map(({ day, weight }) => ({ day, weight }));
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

/** Trung bình 7 ngày kết thúc ở `end` (chỉ những ngày có ghi). */
export function rollingAverage(daily, end, window = 7) {
  const from = addDays(end, -(window - 1));
  const values = daily.filter((row) => row.day >= from && row.day <= end).map((row) => row.weight);
  return values.length ? round2(mean(values)) : null;
}

/**
 * Cân nặng trong kỳ.
 * @returns {null | {rows, loggedDays, countedDays, latest, previous, change, weekAvg, prevWeekAvg,
 *          weeklyChange, min, max, avg, periodChange, gapDays}}
 */
export function weightSummary(logs = [], days = DEFAULT_PERIOD, today = todayIso()) {
  const daily = dailyWeights(logs).filter((row) => row.day <= today);
  if (!daily.length) return null;
  const range = periodDays(days, today);
  const inPeriod = daily.filter((row) => row.day >= range[0]);
  const rows = inPeriod.map((row) => {
    const before = daily.filter((other) => other.day < row.day).pop() || null;
    return {
      ...row,
      change: before ? round2(row.weight - before.weight) : null,
      sinceDays: before ? daysBetween(before.day, row.day) : null,
      avg7: rollingAverage(daily, row.day),
    };
  });
  const latest = daily[daily.length - 1];
  const previous = daily.length > 1 ? daily[daily.length - 2] : null;
  const weekAvg = rollingAverage(daily, today);
  const prevWeekAvg = rollingAverage(daily, addDays(today, -7));
  const values = inPeriod.map((row) => row.weight);
  return {
    rows,
    loggedDays: inPeriod.length,
    countedDays: days,
    latest,
    previous,
    change: previous ? round2(latest.weight - previous.weight) : null,
    weekAvg,
    prevWeekAvg,
    weeklyChange: weekAvg !== null && prevWeekAvg !== null ? round2(weekAvg - prevWeekAvg) : null,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    avg: values.length ? round2(mean(values)) : null,
    periodChange: inPeriod.length > 1 ? round2(inPeriod[inPeriod.length - 1].weight - inPeriod[0].weight) : null,
    // Bao nhiêu ngày liền, tính tới hôm nay, chưa ghi cân (0 khi hôm nay đã ghi).
    gapDays: daysBetween(latest.day, today),
  };
}

// ---------------- Ảnh ----------------

function photoDay(photo) {
  return dayOf(photo?.takenAt || photo?.createdAt);
}

/** Ảnh gom theo ngày chụp, mới trước; mỗi ngày có ảnh theo từng góc. */
export function photoSets(photos = []) {
  const byDay = new Map();
  photos.forEach((photo) => {
    const day = photoDay(photo);
    if (!day) return;
    if (!byDay.has(day)) byDay.set(day, { day, angles: {}, other: [] });
    const set = byDay.get(day);
    const angle = normalizeAngle(photo.angle);
    if (angle && !set.angles[angle]) set.angles[angle] = photo;
    else set.other.push(photo);
  });
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** @returns {null | {sets, count, latestDay, sinceDays, missingAngles}} */
export function photoSummary(photos = [], today = todayIso()) {
  const sets = photoSets(photos);
  if (!sets.length) return null;
  const latest = sets[0];
  return {
    sets,
    count: sets.length,
    latestDay: latest.day,
    sinceDays: daysBetween(latest.day, today),
    missingAngles: ANGLES.filter((angle) => !latest.angles[angle.id]).map((angle) => angle.id),
  };
}

// ---------------- Cần chú ý ----------------

/** Lý do một học viên cần chú ý, theo ATTENTION. Rỗng là ổn. */
export function attentionReasons({ nutrition, weight, photos }, rules = ATTENTION) {
  const reasons = [];
  if (!weight) reasons.push('Chưa ghi cân lần nào');
  else if (weight.gapDays >= rules.weightGapDays) reasons.push(`${weight.gapDays} ngày chưa ghi cân`);
  if (nutrition && nutrition.rate !== null && nutrition.rate < rules.mealRate) {
    if (nutrition.mode === 'foodlog') reasons.push(`Chỉ ghi món ${nutrition.loggedDays}/${nutrition.countedDays} ngày`);
    else reasons.push(`${nutrition.mode === 'simple' ? 'Bữa đủ đạm+rau' : 'Tick bữa'} ${Math.round(nutrition.rate * 100)}%`);
  }
  if (!photos) reasons.push('Chưa có ảnh');
  else if (photos.sinceDays > rules.photoDays) reasons.push(`${photos.sinceDays} ngày chưa chụp ảnh`);
  return reasons;
}

/** Sắp xếp bảng: học viên cần chú ý trước, rồi theo tên. */
export function sortRows(rows) {
  return [...rows].sort((a, b) => (b.reasons.length > 0) - (a.reasons.length > 0)
    || String(a.name).localeCompare(String(b.name), 'vi'));
}

// ---------------- Portfolio ----------------

export function hasPhotoConsent(student) {
  return student?.photoConsent?.granted === true;
}

/** Ảnh một góc, cũ trước. */
export function anglePhotos(photos = [], angle) {
  return photos
    .filter((photo) => normalizeAngle(photo.angle) === angle && photoDay(photo))
    .sort((a, b) => (photoDay(a) < photoDay(b) ? -1 : photoDay(a) > photoDay(b) ? 1 : 0));
}

/** Cặp mặc định: ảnh cũ nhất và mới nhất của một góc, khác ngày. Null khi chưa đủ. */
export function defaultPair(photos = [], angle) {
  const list = anglePhotos(photos, angle);
  if (list.length < 2) return null;
  const before = list[0];
  const after = list[list.length - 1];
  return photoDay(before) === photoDay(after) ? null : { before, after };
}

/** Số cân của một ngày: lần ghi sau cùng của ngày đó, hoặc null. */
export function weightOn(daily, day) {
  return daily.find((row) => row.day === day)?.weight ?? null;
}

/** Ngày, số tuần và thay đổi cân nặng giữa hai ảnh. */
export function compareInfo(before, after, weightLogs = []) {
  const beforeDay = photoDay(before);
  const afterDay = photoDay(after);
  const daily = dailyWeights(weightLogs);
  const beforeWeight = weightOn(daily, beforeDay);
  const afterWeight = weightOn(daily, afterDay);
  const days = beforeDay && afterDay ? daysBetween(beforeDay, afterDay) : null;
  return {
    beforeDay, afterDay, days,
    weeks: days === null ? null : round1(days / 7),
    beforeWeight, afterWeight,
    weightChange: beforeWeight !== null && afterWeight !== null ? round1(afterWeight - beforeWeight) : null,
  };
}
