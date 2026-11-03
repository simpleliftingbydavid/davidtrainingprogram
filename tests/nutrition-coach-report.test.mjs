// The coach's 14-day nutrition report (2026-11-03): a row per day read the way the client
// logs, simple or detailed, with the day's weight.
//   node tests/nutrition-coach-report.test.mjs
import assert from 'node:assert/strict';
import { reportDays, reportMarkup, reportTotals, shortDay } from '../nutrition-coach-report.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const today = '2026-11-03';

check('days are labelled short, newest first, gaps kept', () => {
  assert.equal(shortDay('2026-11-03'), 'T3 03/11');
  assert.equal(shortDay('2026-11-01'), 'CN 01/11');
  const rows = reportDays({ today, days: 14 });
  assert.equal(rows.length, 14);
  assert.equal(rows[0].date, today);
  assert.equal(rows[13].date, '2026-10-21');
  assert.ok(rows.every((row) => row.status === 'none'));
});

check('a simple-mode day counts protein-and-veg meals and steps, not menu ticks', () => {
  const rows = reportDays({
    today, days: 3, simple: true, settings: { stepTarget: 8000, mealsPerDay: 3 },
    checkins: [
      { date: '2026-11-03', simpleMeals: [0, 1, 2], simpleMealCount: 3, steps: 9100 },
      { date: '2026-11-02', simpleMeals: [0], simpleMealCount: 3, stepsMet: false, completedMealIds: [] },
    ],
  });
  assert.deepEqual([rows[0].done, rows[0].planned, rows[0].stepsMet, rows[0].status], [3, 3, true, 'full']);
  assert.deepEqual([rows[1].done, rows[1].stepsMet, rows[1].status], [1, false, 'partial']);
  assert.equal(rows[2].status, 'none');
  const html = reportMarkup(rows, { simple: true });
  assert.match(html, /3\/3<\/span>/);
  assert.match(html, /<span>Bữa đủ đạm, rau<\/span><span>Bước chân<\/span>/);
  assert.match(html, /9\.100 bước/);
  assert.match(html, /Chưa ghi/);
});

check('a simple day logged before the coach set a meal count uses the plan or the count it was logged with', () => {
  const plan = { mealsPerDay: 2 };
  const [row] = reportDays({ today, days: 1, simple: true, plan, checkins: [{ date: today, simpleMeals: [0] }] });
  assert.deepEqual([row.done, row.planned], [1, 2]);
  // An old plan with a sample menu but no "Số bữa/ngày" no longer counts its menu (2026-11-03).
  const [old] = reportDays({ today, days: 1, simple: true, plan: { meals: [{ id: 'a' }, { id: 'b' }] }, checkins: [{ date: today, simpleMeals: [0] }] });
  assert.equal(old.planned, 0);
});

check('a detailed-mode day counts ticked meals against the day plan', () => {
  const rows = reportDays({ today, days: 2, plannedCountFor: () => 3, checkins: [
    { date: today, completedMealIds: ['m1', 'm2'], plannedMealCount: 3 },
    { date: '2026-11-02', completedMealIds: ['m1', 'm2', 'm3'] },
  ] });
  assert.deepEqual(rows.map((row) => `${row.done}/${row.planned} ${row.status}`), ['2/3 partial', '3/3 full']);
  assert.doesNotMatch(reportMarkup(rows), /bước/);
});

check('weight is the last weigh-in of each day, and a day with only a weigh-in is still unlogged for meals', () => {
  const rows = reportDays({ today, days: 2, weights: [
    { weight: 72.4, loggedAt: '2026-11-03T06:10:00+07:00' },
    { weight: 72.9, loggedAt: '2026-11-03T21:00:00+07:00' },
    { weight: 72.6, loggedAt: { toDate: () => new Date('2026-11-02T06:00:00+07:00') } },
  ] });
  assert.deepEqual(rows.map((row) => row.weight), [72.9, 72.6]);
  assert.match(reportMarkup(rows), /72,9 kg/);
  assert.equal(rows[0].status, 'none');
});

check('the fortnight totals count only days the client logged', () => {
  const rows = reportDays({ today, days: 3, simple: true, settings: { mealsPerDay: 3, stepTarget: 5000 }, checkins: [
    { date: today, simpleMeals: [0, 1], stepsMet: true },
  ] });
  const totals = reportTotals(rows, { simple: true });
  assert.deepEqual(totals.meals, { done: 2, planned: 3, pct: 67 });
  assert.equal(totals.logged, 1);
  assert.deepEqual(totals.steps, { met: 1, answered: 1 });
  assert.match(reportMarkup(rows, { simple: true }), /1\/3 ngày có ghi · 2\/3 bữa đủ đạm, rau \(67%\) · đạt bước 1\/1 ngày · cân 0 lần/);
});

check('a day with a note or details opens on tap; the note is escaped', () => {
  const rows = reportDays({ today, days: 2, checkins: [{ date: today, completedMealIds: ['a'], plannedMealCount: 2, note: 'Đi tiệc <b>' }] });
  const html = reportMarkup(rows, { detailsFor: (row) => (row.date === '2026-11-02' ? '<p>gram</p>' : '') });
  assert.match(html, /<details class="nr-day is-partial">/);
  assert.match(html, /Đi tiệc &lt;b&gt;/);
  assert.equal((html.match(/<details/g) || []).length, 2);
});

check('a detailed-mode day with foods logged adds up kcal and protein against the plan', () => {
  const plan = { kcal: 500, protein: 10 };
  const rows = reportDays({ today, days: 2, plan, checkins: [
    { date: today, foodEntries: [{ id: 'a', meal: 'sang', kind: 'food', name: 'Cơm trắng (chín)', grams: 200 }] },
    { date: '2026-11-02', foodEntries: [{ id: 'b', meal: 'toi', kind: 'food', name: 'Cơm trắng (chín)', grams: 400 }] },
  ] });
  assert.deepEqual(rows[0].food.meals, ['Sáng']);
  assert.ok(rows[0].food.kcal > 200 && rows[0].food.kcal < 320, 'kcal of 200 g cooked rice');
  assert.equal(rows[0].status, 'partial', 'about half the calories is off track');
  const html = reportMarkup(rows);
  assert.ok(html.includes('/500 kcal · đạm'));
  assert.ok(html.includes('<span>Đã ăn</span>'));
  assert.ok(html.includes('ngày đúng mục tiêu calo và đạm'));
  assert.equal(reportTotals(rows).meals.planned, 0, 'food days are not counted as ticked meals');
});

console.log(`NUTRITION_COACH_REPORT_OK ${passed} passed`);
