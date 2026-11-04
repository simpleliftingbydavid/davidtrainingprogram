// Run with the Firestore Emulator up (see tests/run-all.mjs). Proves the rules for the coach's
// label foods (nutrition-label-foods.js, 2026-11-04): the coach writes, his students read.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-label-foods';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const per100 = { kcal: 61, protein: 3, carb: 4.8, fat: 3.3, fiber: null, potassium: null, sodium: 40, calcium: 110, magnesium: null, iron: null, zinc: null };
const food = (overrides = {}) => ({
  name: 'Sữa tươi không đường', brand: 'Vinamilk', unit: 'ml', servingLabel: '1 hộp 180 ml', servingAmount: 180,
  per100, archived: false, updatedAt: serverTimestamp(), createdAt: serverTimestamp(), ...overrides,
});

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'coaches', 'coach-2'), { displayName: 'Other' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1' });
    await setDoc(doc(db, 'students', 'student-9'), { coachUid: 'coach-2' });
    await setDoc(doc(db, 'coaches', 'coach-1', 'labelFoods', 'milk'), { ...food(), updatedAt: new Date(), createdAt: new Date() });
  });
  const coach = env.authenticatedContext('coach-1').firestore();
  const other = env.authenticatedContext('coach-2').firestore();
  const student = env.authenticatedContext('student-1').firestore();
  const stranger = env.authenticatedContext('student-9').firestore();
  const anonymous = env.unauthenticatedContext().firestore();
  const list = (db) => collection(db, 'coaches', 'coach-1', 'labelFoods');
  const milk = (db) => doc(db, 'coaches', 'coach-1', 'labelFoods', 'milk');

  await check('the coach adds, edits and hides a product', async () => {
    await assertSucceeds(addDoc(list(coach), food({ name: 'Whey isolate', brand: '', unit: 'g', servingLabel: '1 muỗng 30 g', servingAmount: 30 })));
    await assertSucceeds(updateDoc(milk(coach), food({ brand: 'TH true MILK' })));
    await assertSucceeds(updateDoc(milk(coach), { archived: true, updatedAt: serverTimestamp() }));
    await assertSucceeds(addDoc(list(coach), food({ servingAmount: null, servingLabel: '' })));
  });
  await check('the coach\'s students read the products; nobody else does', async () => {
    await assertSucceeds(getDocs(list(student)));
    await assertSucceeds(getDoc(milk(student)));
    await assertFails(getDoc(milk(stranger)));
    await assertFails(getDoc(milk(other)));
    await assertFails(getDoc(milk(anonymous)));
  });
  await check('students and other coaches cannot write; nobody deletes', async () => {
    await assertFails(addDoc(list(student), food()));
    await assertFails(updateDoc(milk(student), { archived: true, updatedAt: serverTimestamp() }));
    await assertFails(addDoc(list(other), food()));
    await assertFails(deleteDoc(milk(coach)));
  });
  await check('a product missing its required numbers, or with the wrong shape, is refused', async () => {
    for (const bad of [
      { name: '' }, { name: 'x'.repeat(81) }, { unit: 'cup' }, { servingAmount: 0 }, { servingAmount: '180' },
      { per100: { ...per100, kcal: null } }, { per100: { ...per100, sugar: 3 } }, { archived: 'no' }, { extra: 1 },
    ]) await assertFails(addDoc(list(coach), food(bad)));
  });
} finally {
  await env.cleanup();
}

console.log(`LABEL_FOODS_RULES_EMULATOR_OK ${passed} passed`);
