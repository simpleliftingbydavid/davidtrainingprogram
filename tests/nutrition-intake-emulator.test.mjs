// What the client actually ate, saved against the Firestore emulator and the real rules.
//   (start the emulator first, see tests/run-all.mjs)  node tests/nutrition-intake-emulator.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-nutrition-intake',
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

const uid = 'intake-student';
const coachUid = 'intake-coach';
const date = '2026-10-19';
const lunchLog = {
  mealId: 'meal-2', mealName: 'Bữa trưa', option: 'home',
  plannedTotals: { kcal: 650, protein: 45, carbs: 80, fat: 15 },
  items: [
    { name: 'Cơm trắng (chín)', grams: 100, planned: 190 },
    { name: 'Ức gà bỏ da (sống)', grams: 200, cooked: true, planned: 150 },
    { name: 'Món lạ', grams: 50 },
  ],
};

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await firestore.setDoc(firestore.doc(context.firestore(), 'coaches', coachUid), {});
    await firestore.setDoc(firestore.doc(context.firestore(), 'students', uid), { coachUid, clientCategory: 'online' });
  });
  const coachDb = env.authenticatedContext(coachUid).firestore();
  const coach = await dataLayer(coachDb);
  const student = await dataLayer(env.authenticatedContext(uid).firestore());

  await check('the client saves a meal eaten in other amounts; the day keeps its ticks and food eaten out', async () => {
    await student.saveNutritionCheckin(uid, date, { completedMealIds: ['meal-1'], note: 'Trưa ăn ít cơm', planVersionId: 'v1', plannedMealCount: 3 });
    await student.saveNutritionFoodLog(uid, date, [{ name: 'Bánh mì thịt', kcal: 450, protein: 18, servings: 1 }], { planVersionId: 'v1' });
    await student.saveNutritionMealLogs(uid, date, [lunchLog], { planVersionId: 'v1' });
    const [row] = await coach.listNutritionCheckins(uid, { max: 5 });
    assert.deepEqual(row.completedMealIds, ['meal-1']);
    assert.equal(row.foodLog.length, 1);
    assert.deepEqual(row.mealLogs, [{
      mealId: 'meal-2', mealName: 'Bữa trưa', option: 'home',
      plannedTotals: { kcal: 650, protein: 45, carbs: 80, fat: 15 },
      items: [
        { name: 'Cơm trắng (chín)', grams: 100, cooked: false, planned: 190 },
        { name: 'Ức gà bỏ da (sống)', grams: 200, cooked: true, planned: 150 },
      ],
    }], 'stored clean: the unknown food is dropped');
  });

  await check('saving again replaces the day\'s logs: a meal taken off the list is gone', async () => {
    await student.saveNutritionMealLogs(uid, date, [{ ...lunchLog, mealId: 'meal-3', mealName: 'Bữa tối' }], { planVersionId: 'v1' });
    const [row] = await coach.listNutritionCheckins(uid, { max: 5 });
    assert.deepEqual(row.mealLogs.map((log) => log.mealId), ['meal-3']);
    assert.equal(row.note, 'Trưa ăn ít cơm', 'the rest of the day is untouched');
  });

  await check('the coach reads the logs but cannot write them', async () => {
    await assertFails(coach.saveNutritionMealLogs(uid, date, [lunchLog], { planVersionId: 'v1' }));
  });

  await check('a new plan published the same day starts a fresh record', async () => {
    await student.saveNutritionMealLogs(uid, date, [lunchLog], { planVersionId: 'v2' });
    const [row] = await coach.listNutritionCheckins(uid, { max: 5 });
    assert.equal(row.planVersionId, 'v2');
    assert.deepEqual(row.mealLogs.map((log) => log.mealId), ['meal-2']);
    assert.equal(row.completedMealIds, undefined, 'the old plan\'s ticks are not carried over');
    assert.equal(row.foodLog, undefined);
  });
} finally {
  await env.cleanup();
}

console.log(`NUTRITION_INTAKE_EMULATOR_OK ${count} passed`);
