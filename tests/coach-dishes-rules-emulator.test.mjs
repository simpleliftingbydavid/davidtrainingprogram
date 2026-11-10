// Run with the Firestore Emulator up (see tests/run-all.mjs). Món gợi ý David tự thêm (2026-11-10):
// the coach writes his dishes and the list of hidden built-in dishes; his students read both;
// nobody deletes; other coaches and other coaches' students see nothing.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-coach-dishes';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const item = { name: 'Ức gà bỏ da (sống)', role: 'protein', grams: 150 };
const dish = (overrides = {}) => ({
  name: 'Cơm gà', mealTypes: ['trua', 'toi'], kind: 'cook', cook: 'Luộc gà.', items: [item],
  archived: false, updatedAt: serverTimestamp(), createdAt: serverTimestamp(), ...overrides,
});

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'coaches', 'coach-2'), { displayName: 'Other' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1' });
    await setDoc(doc(db, 'students', 'student-2'), { coachUid: 'coach-2' });
  });
  const coach = env.authenticatedContext('coach-1').firestore();
  const otherCoach = env.authenticatedContext('coach-2').firestore();
  const student = env.authenticatedContext('student-1').firestore();
  const otherStudent = env.authenticatedContext('student-2').firestore();
  const ref = (db, id = 'd1') => doc(db, 'coaches', 'coach-1', 'coachDishes', id);
  const settings = (db, id = 'main') => doc(db, 'coaches', 'coach-1', 'dishSettings', id);

  await check('the coach adds, edits and hides a dish but cannot delete it', async () => {
    await assertSucceeds(setDoc(ref(coach), dish()));
    await assertSucceeds(updateDoc(ref(coach), { name: 'Cơm gà xé', updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref(coach), { archived: true, updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(ref(coach)));
  });
  await check('his student reads; other people cannot read or write', async () => {
    await assertSucceeds(getDoc(ref(student)));
    await assertFails(getDoc(ref(otherStudent)));
    await assertFails(getDoc(ref(otherCoach)));
    await assertFails(setDoc(ref(student, 'd2'), dish()));
    await assertFails(setDoc(ref(otherCoach, 'd3'), dish()));
  });
  await check('a bad dish is refused', async () => {
    for (const bad of [{ name: '' }, { name: 'x'.repeat(81) }, { mealTypes: [] }, { mealTypes: ['dem'] }, { kind: 'x' },
      { cook: 'x'.repeat(401) }, { items: [] }, { items: Array(13).fill(item) }, { archived: 'no' }, { extra: 1 }]) {
      await assertFails(setDoc(ref(coach, 'bad'), dish(bad)));
    }
  });
  await check('hidden built-in dishes: coach writes "main" only, students read, no delete', async () => {
    await assertSucceeds(setDoc(settings(coach), { hiddenBuiltIn: ['sang-pho-bo'], updatedAt: serverTimestamp() }));
    await assertSucceeds(getDoc(settings(student)));
    await assertFails(getDoc(settings(otherStudent)));
    await assertFails(setDoc(settings(student), { hiddenBuiltIn: [], updatedAt: serverTimestamp() }));
    await assertFails(setDoc(settings(coach, 'other'), { hiddenBuiltIn: [], updatedAt: serverTimestamp() }));
    await assertFails(setDoc(settings(coach), { hiddenBuiltIn: 'x', updatedAt: serverTimestamp() }));
    await assertFails(setDoc(settings(coach), { hiddenBuiltIn: Array(101).fill('a'), updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(settings(coach)));
  });
} finally {
  await env.cleanup();
}

console.log(`COACH_DISHES_RULES_EMULATOR_OK ${passed} passed`);
