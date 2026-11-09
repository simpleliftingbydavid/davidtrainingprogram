// Nutrition logging follow-up (2026-11-04): the coach hears when a client stops logging (or never
// started), and a client can turn on one evening reminder on days they logged nothing.
//   node tests/nutrition-gap-alert.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildNutritionGapAlert, hasNutritionLog, lastNutritionLogDay } = require('../functions/review-alert-builder.js');

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const student = { coachUid: 'coach-1', displayName: 'Minh' };

check('a day counts as logged only when a meal or a food was logged', () => {
  assert.equal(hasNutritionLog({ simpleMeals: [0] }), true);
  assert.equal(hasNutritionLog({ foodEntries: [{ id: 'a' }] }), true);
  assert.equal(hasNutritionLog({ completedMealIds: ['m1'] }), true);
  assert.equal(hasNutritionLog({ simpleMeals: [], foodEntries: [], steps: 9000 }), false, 'steps alone are not food logging');
  assert.equal(lastNutritionLogDay([
    { id: '2026-11-03', simpleMeals: [] }, { id: '2026-11-01', simpleMeals: [1] }, { date: '2026-10-30', foodEntries: [{}] },
  ]), '2026-11-01');
  assert.equal(lastNutritionLogDay([{ id: '2026-11-03' }]), null);
});

check('a client who stopped: alert from 3 days, once per gap, quiet after 3 weeks', () => {
  const alert = buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: '2026-11-01', planDay: '2026-10-20', today: '2026-11-04' });
  assert.equal(alert.data.type, 'nutrition-gap');
  assert.equal(alert.data.title, '3 ngày chưa ghi dinh dưỡng');
  assert.match(alert.data.summary, /01\/11/);
  assert.equal(alert.id, buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: '2026-11-01', planDay: '2026-10-20', today: '2026-11-08' }).id, 'the same gap keeps one alert');
  assert.equal(buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: '2026-11-02', planDay: '2026-10-20', today: '2026-11-04' }), null, '2 days is not a gap yet');
  assert.equal(buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: '2026-10-01', planDay: '2026-09-20', today: '2026-11-04' }), null, 'long gone is not news');
});

check('a client who never logged: one alert per plan, 3 days after it was sent', () => {
  const alert = buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: null, planDay: '2026-11-01', planVersionId: 'v7', today: '2026-11-04' });
  assert.equal(alert.data.title, 'Chưa ghi dinh dưỡng lần nào');
  assert.match(alert.data.sourceId, /never_v7/);
  assert.equal(buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: null, planDay: '2026-11-02', today: '2026-11-04' }), null);
  // Logs from before the current plan do not count as logging under it.
  assert.equal(buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: '2026-10-01', planDay: '2026-11-01', planVersionId: 'v7', today: '2026-11-04' }).data.title, 'Chưa ghi dinh dưỡng lần nào');
  assert.equal(buildNutritionGapAlert({ studentId: 's1', student: { displayName: 'x' }, lastLogDay: null, planDay: '2026-11-01', today: '2026-11-04' }), null, 'no coach');
  assert.equal(buildNutritionGapAlert({ studentId: 's1', student, lastLogDay: '2026-11-01', planDay: null, today: '2026-11-04' }), null, 'no plan');
});

const index = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8').replace(/\r/g, '');
const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('the morning alert, the evening reminder, the dashboard label and the student switch', async () => {
  assert.match(index, /exports\.refreshNutritionGapAlerts = onSchedule\(\{\s+schedule: 'every day 08:00', timeZone: 'Asia\/Ho_Chi_Minh'/);
  assert.match(index, /exports\.remindNutritionLogging = onSchedule\(\{\s+schedule: 'every day 20:00', timeZone: 'Asia\/Ho_Chi_Minh'/);
  assert.ok(index.includes('if (todaySnap.exists && hasNutritionLog(todaySnap.data())) continue;'), 'no reminder once the day is logged');
  assert.ok(page.includes("await enablePushNotifications(studentUid, () => {}, { owner: 'student' });"));
  assert.ok(page.includes("await disablePushNotifications(studentUid, { owner: 'student' });"));
});

const { REVIEW_TYPE } = await import('../review-dashboard-utils.js');
check('the coach dashboard names the alert', () => assert.equal(REVIEW_TYPE['nutrition-gap'], 'Lâu chưa ghi dinh dưỡng'));

console.log(`NUTRITION_GAP_ALERT_OK ${passed} passed`);
