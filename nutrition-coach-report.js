// The coach's 14-day report on the nutrition page (2026-11-03): one short row per day, newest
// first, read the same way the client logs. A client on the simple mode ticks "đủ đạm và rau"
// per meal and their steps; a client on the detailed mode logs each food eaten (foodEntries,
// nutrition-food-log.js), or on older days ticked the planned meals. Weight comes from the
// body-weight logs. Days with nothing logged still show, so a gap is visible.
import { dayOf, toDate } from './home-utils.js';
import { periodDays } from './overview-utils.js';
import { mealCountFor, normalizeNutritionSettings, normalizeSimpleDay, stepsMetFor } from './nutrition-simple.js';
import { FOOD_LOG_MEALS, dayTotals, normalizeFoodEntries } from './nutrition-food-log.js';

const positive = (value) => (Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null);

/** What a detailed-mode day adds up to: kcal and protein against the plan, meals with food logged. */
function foodDay(checkin, plan) {
  const entries = normalizeFoodEntries(checkin?.foodEntries);
  if (!entries.length) return null;
  const totals = dayTotals(entries);
  const meals = FOOD_LOG_MEALS.filter((meal) => totals.perMeal[meal.id]?.count > 0).map((meal) => meal.label);
  const kcal = totals.values?.kcal ?? null;
  const protein = totals.values?.protein ?? null;
  const kcalTarget = positive(plan?.kcal);
  const proteinTarget = positive(plan?.protein);
  // On track: protein reached (90%+) and calories within 10% of the plan.
  const onTrack = kcalTarget && proteinTarget && kcal !== null && protein !== null
    ? protein >= proteinTarget * 0.9 && Math.abs(kcal - kcalTarget) <= kcalTarget * 0.1 : null;
  return { entries, meals, kcal, protein, kcalTarget, proteinTarget, onTrack, estimated: totals.estimated };
}

const SHORT_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** "T2 27/10" */
export function shortDay(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${SHORT_DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** The last weigh-in of each day. */
function weightsByDay(weights = []) {
  const byDay = new Map();
  for (const log of weights) {
    const day = dayOf(log?.loggedAt);
    const weight = Number(log?.weight);
    if (!day || !Number.isFinite(weight) || weight <= 0) continue;
    const time = toDate(log.loggedAt).getTime();
    const seen = byDay.get(day);
    if (!seen || time > seen.time) byDay.set(day, { weight, time });
  }
  return byDay;
}

/**
 * One entry per day, newest first.
 * @returns {Array<{date, label, logged, done, planned, stepsMet, steps, weight, note, status, checkin}>}
 *   status: 'full' (every meal), 'partial', 'missed' (logged, no meal), 'none' (nothing logged)
 */
export function reportDays({ checkins = [], weights = [], today, days = 14, simple = false, settings = {}, plan = null, plannedCountFor = () => 0 } = {}) {
  const byDate = new Map(checkins.map((row) => [row.date || row.id, row]));
  const weightOf = weightsByDay(weights);
  const clean = normalizeNutritionSettings(settings);
  return periodDays(days, today).reverse().map((date) => {
    const checkin = byDate.get(date) || null;
    let done = 0;
    let planned = 0;
    let stepsMet = null;
    let steps = null;
    const food = simple ? null : foodDay(checkin, plan);
    if (simple) {
      const count = Number.isInteger(Number(checkin?.simpleMealCount)) && Number(checkin?.simpleMealCount) > 0
        ? Number(checkin.simpleMealCount) : mealCountFor(clean, plan, date) || 0;
      const day = normalizeSimpleDay({ ...(checkin || {}), simpleMealCount: count });
      planned = day.simpleMealCount || 0;
      done = day.simpleMeals.length;
      stepsMet = clean.stepTarget ? stepsMetFor(checkin, clean.stepTarget) : day.stepsMet;
      steps = day.steps;
    } else {
      done = Array.isArray(checkin?.completedMealIds) ? checkin.completedMealIds.length : 0;
      planned = Number(checkin?.plannedMealCount) > 0 ? Number(checkin.plannedMealCount) : plannedCountFor(date) || 0;
      done = planned ? Math.min(done, planned) : done;
    }
    const weight = weightOf.get(date)?.weight ?? null;
    const note = String(checkin?.note || '').trim();
    const logged = Boolean(checkin) && (done > 0 || Boolean(food) || stepsMet !== null || steps !== null || Boolean(note)
      || (Array.isArray(checkin?.mealLogs) && checkin.mealLogs.length > 0) || checkin?.weight != null);
    const status = !logged ? 'none'
      : food ? (food.onTrack === false ? 'partial' : 'full')
        : planned && done >= planned ? 'full' : done > 0 ? 'partial' : 'missed';
    return { date, label: shortDay(date), logged, done, planned, stepsMet, steps, food, weight, note, status, checkin };
  });
}

/** The fortnight in one line: days logged, meals, steps, weigh-ins. */
export function reportTotals(rows, { simple = false } = {}) {
  const ticked = rows.filter((row) => row.logged && !row.food);
  const planned = ticked.reduce((sum, row) => sum + row.planned, 0);
  const done = ticked.reduce((sum, row) => sum + row.done, 0);
  const food = rows.filter((row) => row.food);
  return {
    days: rows.length,
    logged: rows.filter((row) => row.logged).length,
    meals: { done, planned, pct: planned ? Math.round(done / planned * 100) : null },
    steps: simple ? { met: rows.filter((row) => row.stepsMet === true).length, answered: rows.filter((row) => row.stepsMet !== null).length } : null,
    weighIns: rows.filter((row) => row.weight !== null).length,
    food: food.length ? { days: food.length, onTrack: food.filter((row) => row.food.onTrack === true).length, judged: food.filter((row) => row.food.onTrack !== null).length } : null,
  };
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const kgText = (value) => `${(Math.round(value * 10) / 10).toFixed(1).replace('.', ',')} kg`;
const stepsText = (value) => `${Number(value).toLocaleString('vi-VN')} bước`;

function stepsCell(row) {
  if (row.stepsMet === true) return `<span class="nr-steps is-met">✓ ${row.steps !== null ? stepsText(row.steps) : 'Đạt bước'}</span>`;
  if (row.stepsMet === false) return `<span class="nr-steps is-short">${row.steps !== null ? stepsText(row.steps) : 'Chưa đạt bước'}</span>`;
  return '<span class="nr-steps">–</span>';
}

const number = (value) => Math.round(value).toLocaleString('vi-VN');

/** A detailed-mode day: "1.850/2.120 kcal · đạm 92/94 g", plus the meals with food logged. */
function foodCell(food) {
  const kcal = food.kcal === null ? '? kcal' : `${food.estimated ? '≈' : ''}${number(food.kcal)}${food.kcalTarget ? `/${number(food.kcalTarget)}` : ''} kcal`;
  const protein = food.protein === null ? '' : ` · đạm ${number(food.protein)}${food.proteinTarget ? `/${number(food.proteinTarget)}` : ''} g`;
  return `<span class="nr-meals nr-food"><span>${kcal}${protein}</span><small>${escapeHtml(food.meals.join(', '))}</small></span>`;
}

function mealsCell(row) {
  if (!row.logged) return '<span class="nr-meals">Chưa ghi</span>';
  if (row.food) return foodCell(row.food);
  if (!row.planned) return `<span class="nr-meals">${row.done}</span>`;
  const dots = Array.from({ length: row.planned }, (_, index) => `<i class="${index < row.done ? 'on' : ''}"></i>`).join('');
  return `<span class="nr-meals"><span class="nr-dots" aria-hidden="true">${dots}</span>${row.done}/${row.planned}</span>`;
}

/**
 * The report. `detailsFor(row)` returns extra markup for a day (grams eaten, for instance);
 * a day with a note or details opens on tap, the others are a plain row.
 */
export function reportMarkup(rows, { simple = false, detailsFor = () => '' } = {}) {
  const totals = reportTotals(rows, { simple });
  const parts = [`${totals.logged}/${totals.days} ngày có ghi`];
  if (totals.food?.judged) parts.push(`${totals.food.onTrack}/${totals.food.judged} ngày đúng mục tiêu calo và đạm`);
  if (totals.meals.planned) parts.push(`${totals.meals.done}/${totals.meals.planned} ${simple ? 'bữa đủ đạm, rau' : 'bữa theo thực đơn'} (${totals.meals.pct}%)`);
  if (totals.steps?.answered) parts.push(`đạt bước ${totals.steps.met}/${totals.steps.answered} ngày`);
  parts.push(`cân ${totals.weighIns} lần`);
  const head = `<p class="nr-total">${parts.join(' · ')}</p>`;
  const body = rows.map((row) => {
    const details = detailsFor(row) || '';
    const note = row.note ? `<p class="nr-note">“${escapeHtml(row.note)}”</p>` : '';
    const line = `<span class="nr-date">${escapeHtml(row.label)}</span>${mealsCell(row)}${simple ? stepsCell(row) : ''}`
      + `<span class="nr-weight">${row.weight !== null ? kgText(row.weight) : ''}</span>`
      + `<span class="nr-flag">${row.note ? '<span title="Có ghi chú" aria-label="Có ghi chú">💬</span>' : ''}</span>`;
    const cls = `nr-day is-${row.status}${simple ? ' is-simple' : ''}`;
    return details || note
      ? `<details class="${cls}"><summary>${line}</summary><div class="nr-more">${note}${details}</div></details>`
      : `<div class="${cls}">${line}</div>`;
  }).join('');
  const columns = `<div class="nr-cols${simple ? ' is-simple' : ''}" aria-hidden="true"><span>Ngày</span><span>${simple ? 'Bữa đủ đạm, rau' : 'Đã ăn'}</span>${simple ? '<span>Bước chân</span>' : ''}<span>Cân sáng</span><span></span></div>`;
  return `${head}<div class="nr-list">${columns}${body}</div>`;
}

