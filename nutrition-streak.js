// ============================================================
// DAVID COACHING — Chuỗi ngày ghi bữa (David, 2026-11-10)
// ============================================================
// Thuần: không DOM, không Firebase. Khách thấy mình đã ghi bữa bao nhiêu ngày liền, theo luật
// của trang Thói quen: "đừng bỏ 2 ngày liền". Lỡ 1 ngày chuỗi vẫn giữ (app nhắc ghi lại hôm nay);
// bỏ 2 ngày liền thì chuỗi về 0. Hôm nay chưa ghi chưa tính là lỡ, vì ngày chưa hết.
// "Đã ghi" giống hệt cảnh báo của coach (functions/review-alert-builder.js, hasNutritionLog).

import { fmtDate, t } from './i18n.js';
const DAY_MS = 86400000;
const isoDay = (iso, offset) => new Date(Date.parse(`${iso}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10);

/** Một ngày khách thật sự ghi: tick một bữa (đơn giản hoặc thực đơn cũ), hoặc ghi một món. */
export function hasNutritionLog(checkin = {}) {
  const any = (value) => Array.isArray(value) && value.length > 0;
  return any(checkin?.simpleMeals) || any(checkin?.foodEntries) || any(checkin?.completedMealIds)
    || any(checkin?.mealLogs) || any(checkin?.foodLog);
}

/**
 * Chuỗi ngày ghi bữa.
 * @param rows các ngày dinh dưỡng gần nhất (id hoặc date = YYYY-MM-DD), mới trước hay cũ trước đều được
 * @param today YYYY-MM-DD
 * @param loggedToday ghi đè trạng thái hôm nay (trang đang mở biết trước khi lưu xong)
 * @param limit số ngày đã đọc; chuỗi chạm tới ngày cũ nhất đã đọc thì capped = true ("60+ ngày")
 * @returns {{count, loggedToday, atRisk, capped, last7: Array<{date, state:'logged'|'missed'|'today'}>}}
 */
export function loggingStreak(rows = [], today, { loggedToday = null, limit = Infinity } = {}) {
  const logged = new Set(rows.filter(hasNutritionLog).map((row) => String(row.date || row.id || '')));
  const todayLogged = loggedToday === null ? logged.has(today) : loggedToday === true;
  const days = rows.map((row) => String(row.date || row.id || '')).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)).sort();
  const oldest = days[0] || today;
  let count = todayLogged ? 1 : 0;
  let misses = 0;
  let day = isoDay(today, -1);
  let broken = false;
  for (let guard = 0; guard < 400 && day >= oldest; guard++, day = isoDay(day, -1)) {
    if (logged.has(day)) { count++; misses = 0; } else if (++misses >= 2) { broken = true; break; }
  }
  // Lỡ đúng 1 ngày ngay trước khi hết dữ liệu không làm đứt chuỗi, nhưng cũng không chắc còn dài hơn.
  const capped = !broken && rows.length >= limit && count > 0;
  const yesterdayLogged = logged.has(isoDay(today, -1));
  const last7 = Array.from({ length: 7 }, (_, index) => {
    const date = isoDay(today, index - 6);
    const state = date === today ? (todayLogged ? 'logged' : 'today') : (logged.has(date) ? 'logged' : 'missed');
    return { date, state };
  });
  return { count, loggedToday: todayLogged, atRisk: count > 0 && !todayLogged && !yesterdayLogged, capped, last7 };
}

/** Lời cho khách: tiêu đề và một câu nhắc, không trách. */
export function streakCopy(streak) {
  const days = t('streak.days', { n: `${streak.count}${streak.capped ? '+' : ''}` });
  if (!streak.count) return { title: t('streak.start'), hint: t('streak.startHint') };
  const title = t('streak.title', { days });
  if (streak.loggedToday) return { title, hint: t('streak.done') };
  if (streak.atRisk) return { title, hint: t('streak.risk') };
  return { title, hint: t('streak.next', { n: streak.count + 1 }) };
}

const DOT_LABEL = { logged: 'streak.dot.logged', missed: 'streak.dot.missed', today: 'streak.dot.today' };

/** Khối hiển thị dùng chung cho trang chủ và trang Dinh dưỡng. */
export function streakMarkup(streak) {
  const { title, hint } = streakCopy(streak);
  const dots = streak.last7.map((day) => `<span class="cu-streak-dot is-${day.state}" title="${fmtDate(day.date)}: ${t(DOT_LABEL[day.state])}"></span>`).join('');
  return `<div class="cu-streak${streak.atRisk ? ' is-risk' : ''}">
    <div class="cu-streak-text"><strong>${title}</strong><span>${hint}</span></div>
    <div class="cu-streak-dots" role="img" aria-label="${t('streak.aria', { n: streak.last7.filter((day) => day.state === 'logged').length })}">${dots}</div>
  </div>`;
}

export const STREAK_READ_DAYS = 60;
