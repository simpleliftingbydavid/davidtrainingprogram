// The client's weekly summary card (David Coaching, 2026-10-31).
//   node tests/nutrition-week-summary.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weekSummary } from '../nutrition-week-summary.js';
import { buildDailyLog } from '../nutrition-log-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const threeMeals = () => 3;
const iso = (start, offset) => new Date(Date.parse(`${start}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10);

/** Builds a log from day offsets: { 0: { weight: 70, done: 3 }, ... } starting on `start`. */
function log(start, entries) {
  const days = {};
  for (const [offset, entry] of Object.entries(entries)) {
    days[iso(start, Number(offset))] = {
      weight: entry.weight ?? null,
      completedMealIds: Array.from({ length: entry.done || 0 }, (_, i) => `m${i + 1}`),
      loggedMealIds: entry.logged || [],
      plannedMealCount: entry.planned ?? null,
    };
  }
  return days;
}

const START = '2026-10-05';

check('no data yet: an inviting first step, no numbers', () => {
  const result = weekSummary({ days: {}, today: '2026-10-31', goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.status, 'empty');
  assert.equal(result.weekNumber, 1);
  assert.equal(result.weight.avg, null);
  assert.match(result.nextStep, /cân/);
});

check('week one is a baseline, never a verdict', () => {
  const days = log(START, { 0: { weight: 70, done: 3 }, 1: { weight: 70.4, done: 3 }, 2: { weight: 69.8, done: 3 }, 3: { weight: 70, done: 3 } });
  const result = weekSummary({ days, today: iso(START, 3), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.status, 'baseline');
  assert.equal(result.weekNumber, 1);
  assert.equal(result.dayInWeek, 4);
  assert.equal(result.weight.avg.toFixed(2), '70.05');
  assert.equal(result.weight.changeKg, null);
});

check('fewer than 4 weigh-ins asks for more weigh-ins before anything else', () => {
  const days = log(START, { 0: { weight: 70, done: 0 }, 1: { weight: 70, done: 0 } });
  const result = weekSummary({ days, today: iso(START, 3), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.match(result.nextStep, /Cân thêm 2 buổi sáng/);
  assert.match(result.nextStep, /2\/4/);
});

check('meals: past days count every planned meal, a day never opened is 0 of N', () => {
  // Day 0: 3/3, day 1: never opened (0/3), day 2: 2 ticked of 3. Today = day 2? No: today = day 3 with nothing yet.
  const days = log(START, { 0: { weight: 70, done: 3, planned: 3 }, 2: { weight: 70, done: 2, planned: 3 } });
  const result = weekSummary({ days, today: iso(START, 3), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.deepEqual({ done: result.meals.done, planned: result.meals.planned }, { done: 5, planned: 9 });
  assert.equal(result.meals.pct, 56);
});

check('meals: today counts only what is already done, so noon does not look like a failure', () => {
  const days = log(START, { 0: { weight: 70, done: 3, planned: 3 }, 1: { weight: 70, done: 1, planned: 3 } });
  const result = weekSummary({ days, today: iso(START, 1), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.deepEqual({ done: result.meals.done, planned: result.meals.planned, pct: result.meals.pct }, { done: 4, planned: 4, pct: 100 });
});

check('meals: a meal logged in grams counts even without its tick, and is not counted twice', () => {
  const days = log(START, { 0: { weight: 70, done: 1, logged: ['m1', 'm2'], planned: 3 } });
  const result = weekSummary({ days, today: iso(START, 1), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.meals.done, 2);
  assert.equal(result.meals.planned, 3);
});

check('meals: the day\'s own planned count wins over today\'s plan', () => {
  const days = log(START, { 0: { weight: 70, done: 4, planned: 4 } });
  const result = weekSummary({ days, today: iso(START, 1), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.meals.planned, 4);
});

/** Two full weeks: week 1 at w1 kg every day, week 2 at w2 kg, every meal ticked. */
function twoWeeks(w1, w2, done = 3) {
  const entries = {};
  for (let d = 0; d < 7; d++) entries[d] = { weight: w1, done: 3, planned: 3 };
  for (let d = 7; d < 14; d++) entries[d] = { weight: w2, done, planned: 3 };
  return log(START, entries);
}

check('fat loss on target (-0.7%/week) reads as on track', () => {
  const result = weekSummary({ days: twoWeeks(80, 79.44), today: iso(START, 13), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.weekNumber, 2);
  assert.equal(result.status, 'on-track');
  assert.equal(result.headline, 'Đúng hướng');
  assert.equal(result.weight.targetKg.toFixed(2), '-0.56');
  assert.match(result.nextStep, /Giữ nhịp/);
});

check('fat loss stalled with good adherence: slower, and still no calorie change from the card', () => {
  const result = weekSummary({ days: twoWeeks(80, 80), today: iso(START, 13), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.status, 'slower');
  assert.match(result.nextStep, /Giữ nguyên cách ăn/);
  assert.doesNotMatch(result.nextStep, /calo|ăn ít|cắt/i);
});

check('losing faster than 1%/week warns against eating less', () => {
  const result = weekSummary({ days: twoWeeks(80, 78.8), today: iso(START, 13), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.status, 'faster');
  assert.match(result.nextStep, /Đừng ăn bớt/);
});

check('low adherence outranks the trend: fix the eating, not the target', () => {
  const result = weekSummary({ days: twoWeeks(80, 80, 1), today: iso(START, 13), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.ok(result.meals.pct < 80);
  assert.match(result.nextStep, /theo đúng thực đơn/);
});

check('a thin week is not read as a trend', () => {
  const entries = {};
  for (let d = 0; d < 7; d++) entries[d] = { weight: 80, done: 3, planned: 3 };
  entries[9] = { weight: 78, done: 3, planned: 3 };
  const result = weekSummary({ days: log(START, entries), today: iso(START, 13), goalType: 'fat_loss', plannedCountFor: threeMeals });
  assert.equal(result.status, 'need-data');
});

check('gain and maintain use their own targets', () => {
  const gain = weekSummary({ days: twoWeeks(70, 70.16), today: iso(START, 13), goalType: 'gain', plannedCountFor: threeMeals });
  assert.equal(gain.status, 'on-track');
  const fastGain = weekSummary({ days: twoWeeks(70, 70.6), today: iso(START, 13), goalType: 'gain', plannedCountFor: threeMeals });
  assert.equal(fastGain.status, 'faster');
  const keep = weekSummary({ days: twoWeeks(70, 70.05), today: iso(START, 13), goalType: 'maintain', plannedCountFor: threeMeals });
  assert.equal(keep.status, 'on-track');
  const drift = weekSummary({ days: twoWeeks(70, 70.5), today: iso(START, 13), goalType: 'maintain', plannedCountFor: threeMeals });
  assert.equal(drift.status, 'drifting');
});

check('buildDailyLog carries gram-logged meals into the day', () => {
  const days = buildDailyLog({ checkIns: [{ id: '2026-10-05', completedMealIds: ['a'], mealLogs: [{ mealId: 'b' }, {}] }] });
  assert.deepEqual(days['2026-10-05'].loggedMealIds, ['b']);
});

check('the page autosaves ticks without touching the note', () => {
  const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8');
  const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');
  const fn = data.slice(data.indexOf('export async function saveNutritionMealTicks'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.ok(body.length > 0, 'saveNutritionMealTicks exists');
  assert.doesNotMatch(body, /note/);
  assert.match(page, /saveNutritionMealTicks\(/);
  assert.match(page, /id="cu-week-summary"/);
});

console.log(`nutrition-week-summary: ${passed} passed`);
