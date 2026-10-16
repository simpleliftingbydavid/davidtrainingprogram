// Runs the real data layer for a week of meals against the Firestore Emulator, under the
// real rules.   node --experimental-vm-modules tests/nutrition-week-emulator.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';
import { buildWeekMenu, planDayFromResult } from '../nutrition-week-builder.js';
import { WEEK_DAYS, mealsForDate, planWeekDays } from '../nutrition-week-utils.js';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-nutrition-week',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
});

async function dataLayer(db) {
  const module = new vm.SourceTextModule(readFileSync(new URL('../training-data.js', import.meta.url), 'utf8'));
  await module.link(async (specifier) => {
    const exports = specifier.startsWith('https:') ? firestore : specifier === './firebase-init.js' ? { db }
      : await import(new URL(`../${specifier}`, import.meta.url));
    return new vm.SyntheticModule(Object.keys(exports), function () {
      Object.entries(exports).forEach(([key, value]) => this.setExport(key, value));
    });
  });
  await module.evaluate();
  return module.namespace;
}

let count = 0;
async function check(name, test) {
  try { await test(); count++; console.log(`PASS ${name}`); } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const uid = 'week-student';
const coachUid = 'week-coach';
const targets = { kcal: 2000, protein: 140, carbs: 215, fat: 55 };

function weekPlan() {
  const built = buildWeekMenu({ targets, weightKg: 70, mealCount: 4, goalType: 'fat_loss', composition: 'dish', variety: 'easy', random: rng(11) });
  const days = built.days.map((day) => planDayFromResult(day.result, { dayId: day.id, sex: 'male', wakeTime: '06:30' }));
  return {
    ...targets, goal: 'Giảm mỡ', goalType: 'fat_loss', sex: 'male', notes: 'Uống đủ nước.',
    meals: days[0].meals, gramPlan: days[0].gramPlan, week: { variety: 'easy', days },
  };
}

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await firestore.setDoc(firestore.doc(context.firestore(), 'coaches', coachUid), {});
    await firestore.setDoc(firestore.doc(context.firestore(), 'students', uid), { coachUid, clientCategory: 'online' });
  });
  const coach = await dataLayer(env.authenticatedContext(coachUid).firestore());
  const student = await dataLayer(env.authenticatedContext(uid).firestore());
  const source = weekPlan();

  await check('a week is published whole: seven days, Monday first, each with its meals', async () => {
    await coach.publishNutritionPlan(uid, coachUid, source);
    const plan = await student.getNutritionPlan(uid);
    assert.equal(plan.status, 'published');
    assert.equal(plan.week.variety, 'easy');
    assert.deepEqual(plan.week.days.map((day) => day.id), WEEK_DAYS.map((day) => day.id));
    plan.week.days.forEach((day, index) => assert.equal(day.meals.length, source.week.days[index].meals.length, day.id));
    assert.ok(planWeekDays(plan), 'the client pages read it as a week');
  });

  await check('the client is served the right weekday, and the old single-day field is Monday', async () => {
    const plan = await student.getNutritionPlan(uid);
    assert.deepEqual(mealsForDate(plan, '2026-10-15').map((meal) => meal.items[0]), source.week.days[3].meals.map((meal) => meal.items[0]));
    assert.deepEqual(plan.meals.map((meal) => meal.items[0]), source.week.days[0].meals.map((meal) => meal.items[0]));
  });

  await check('every meal of every day is stored with the care the single day gets', async () => {
    const plan = await student.getNutritionPlan(uid);
    for (const day of plan.week.days) {
      for (const meal of day.meals) {
        assert.ok(meal.id && meal.name && meal.kcal > 0, `${day.id} ${meal.name}`);
        assert.ok(meal.gramItems.length > 0, `${day.id} ${meal.name}: grams were not read back from the lines`);
        assert.ok(meal.gramItems.length < meal.items.length, 'the dish name and the cook note are lines, not foods');
      }
      assert.equal(day.gramPlan.meetsTargets, true);
    }
  });

  await check('a line the coach rewrites by hand is what gets stored, in the day it was written', async () => {
    const edited = weekPlan();
    edited.week.days[4].meals[0].items = ['Bánh mì trứng', 'Bánh mì trắng — 80 g', 'Trứng gà nguyên quả — 100 g'];
    await coach.publishNutritionPlan(uid, coachUid, edited);
    const plan = await student.getNutritionPlan(uid);
    const friday = plan.week.days[4].meals[0];
    assert.equal(friday.items[0], 'Bánh mì trứng');
    assert.deepEqual(friday.gramItems.map((item) => item.grams), [80, 100]);
    assert.notEqual(plan.week.days[3].meals[0].items[0], 'Bánh mì trứng', 'the neighbouring day is untouched');
  });

  await check('a week missing a day is not stored as a week: the plan stays a single day', async () => {
    const partial = weekPlan();
    partial.week.days[2].meals = [];
    // Saved as a draft: an incomplete week is not allowed out to the client at all.
    const id = await coach.saveNutritionDraft(uid, coachUid, partial);
    const versions = await coach.listNutritionPlanVersions(uid);
    const draft = versions.find((version) => version.id === id);
    assert.equal(draft.week, null);
    assert.ok(draft.meals.length > 0);
    await assert.rejects(coach.publishNutritionPlan(uid, coachUid, partial), /Thứ Tư: Kế hoạch cần ít nhất một bữa ăn/);
  });

  await check('a single-day plan is published exactly as before, with no week', async () => {
    const single = weekPlan();
    delete single.week;
    await coach.publishNutritionPlan(uid, coachUid, single);
    const plan = await student.getNutritionPlan(uid);
    assert.equal(plan.week, null);
    assert.equal(planWeekDays(plan), null);
    assert.equal(mealsForDate(plan, '2026-10-18').length, single.meals.length);
  });

  await check('a draft keeps its week, and the client cannot see a draft', async () => {
    const id = await coach.saveNutritionDraft(uid, coachUid, weekPlan());
    const draft = (await coach.listNutritionPlanVersions(uid)).find((version) => version.id === id);
    assert.equal(draft.status, 'draft');
    assert.equal(draft.week.days.length, 7);
    const db = env.authenticatedContext(uid).firestore();
    await assert.rejects(firestore.getDoc(firestore.doc(db, 'students', uid, 'nutritionPlans', id)));
  });

  await check('only the coach can write a plan: the client cannot change their own week', async () => {
    await assert.rejects(student.publishNutritionPlan(uid, coachUid, weekPlan()));
  });

  await check('the profile remembers a week or a single day, and how much the week repeats', async () => {
    await coach.saveNutritionProfile(uid, coachUid, { weightKg: 70, planSpan: 'day', weekVariety: 'varied' });
    let profile = await coach.getNutritionProfile(uid);
    assert.deepEqual([profile.planSpan, profile.weekVariety], ['day', 'varied']);
    // A profile from before weeks existed sends neither: it gets the week, balanced.
    await coach.saveNutritionProfile(uid, coachUid, { weightKg: 70 });
    profile = await coach.getNutritionProfile(uid);
    assert.deepEqual([profile.planSpan, profile.weekVariety], ['week', 'balanced']);
    await coach.saveNutritionProfile(uid, coachUid, { weightKg: 70, weekVariety: 'nonsense' });
    assert.equal((await coach.getNutritionProfile(uid)).weekVariety, 'balanced');
  });

  await check('a lunch keeps its ordered-out version, with macros read back from its lines', async () => {
    const sent = weekPlan();
    await coach.publishNutritionPlan(uid, coachUid, sent);
    const plan = await student.getNutritionPlan(uid);
    const lunch = plan.week.days[2].meals.find((meal) => meal.name === 'Bữa trưa');
    const source = sent.week.days[2].meals.find((meal) => meal.name === 'Bữa trưa');
    assert.ok(lunch.alternative, 'stored');
    assert.equal(lunch.alternative.label, 'Đặt ngoài');
    assert.equal(lunch.alternative.items[0], source.alternative.items[0]);
    assert.ok(lunch.alternative.gramItems.length > 0);
    assert.equal(lunch.alternative.kcal, lunch.alternative.gramItems.reduce((sum, item) => sum + item.kcal, 0));
    assert.ok(Math.abs(lunch.alternative.kcal - lunch.kcal) / lunch.kcal < 0.1, 'about the same as the home lunch');
    assert.ok(!plan.week.days[2].meals.some((meal) => meal.name !== 'Bữa trưa' && meal.alternative), 'only lunch has one');
  });

  await check('the coach\'s edit to the ordered-out lunch is what is stored, and emptying it removes it', async () => {
    const edited = weekPlan();
    const lunchIndex = edited.week.days[1].meals.findIndex((meal) => meal.name === 'Bữa trưa');
    edited.week.days[1].meals[lunchIndex].alternative.items = ['Cơm gà', 'Ức gà bỏ da (sống) — 100 g', 'Cơm trắng (chín) — 100 g', 'Gọi món: ít mỡ.'];
    edited.week.days[1].meals[lunchIndex].alternative.kcal = 9999;
    edited.week.days[3].meals[lunchIndex].alternative.items = [];
    await coach.publishNutritionPlan(uid, coachUid, edited);
    const plan = await student.getNutritionPlan(uid);
    const tuesday = plan.week.days[1].meals[lunchIndex].alternative;
    assert.deepEqual(tuesday.gramItems.map((item) => item.grams), [100, 100]);
    assert.equal(tuesday.kcal, 120 + 130, 'read from the lines, not from the number sent');
    assert.equal(plan.week.days[3].meals[lunchIndex].alternative, undefined);
  });

  console.log(`NUTRITION_WEEK_EMULATOR_OK ${count} passed`);
} finally {
  await env.cleanup();
}
