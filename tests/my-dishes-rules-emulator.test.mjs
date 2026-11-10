// Run with the Firestore Emulator up (see tests/run-all.mjs). Món của tôi (2026-11-10): the student
// writes their own saved dishes; their coach can read them; nobody else can do either.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-my-dishes';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const item = { kind: 'food', name: 'Bún tươi', grams: 200, cooked: false };
const dish = (overrides = {}) => ({ name: 'Bún gà', items: [item], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...overrides });

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'coaches', 'coach-2'), { displayName: 'Other' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1' });
    await setDoc(doc(db, 'students', 'student-2'), { coachUid: 'coach-1' });
  });
  const own = env.authenticatedContext('student-1').firestore();
  const peer = env.authenticatedContext('student-2').firestore();
  const coach = env.authenticatedContext('coach-1').firestore();
  const otherCoach = env.authenticatedContext('coach-2').firestore();
  const ref = (db, id = 'd1') => doc(db, 'students', 'student-1', 'myDishes', id);

  await check('the student saves, reads, renames and deletes their own dish', async () => {
    await assertSucceeds(setDoc(ref(own), dish()));
    await assertSucceeds(getDoc(ref(own)));
    await assertSucceeds(updateDoc(ref(own), { name: 'Bún gà của mẹ', updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(ref(own)));
  });
  await check('their coach reads but cannot write; others cannot read', async () => {
    await env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), 'students', 'student-1', 'myDishes', 'd2'), { ...dish(), createdAt: new Date(), updatedAt: new Date() }));
    await assertSucceeds(getDoc(ref(coach, 'd2')));
    await assertFails(setDoc(ref(coach, 'd3'), dish()));
    await assertFails(deleteDoc(ref(coach, 'd2')));
    await assertFails(getDoc(ref(peer, 'd2')));
    await assertFails(getDoc(ref(otherCoach, 'd2')));
    await assertFails(setDoc(ref(peer, 'd4'), dish()));
  });
  await check('a bad dish is refused', async () => {
    for (const bad of [{ name: '' }, { name: 'x'.repeat(61) }, { items: [] }, { items: Array(26).fill(item) }, { items: 'x' }, { extra: 1 }]) {
      await assertFails(setDoc(ref(own, 'bad'), dish(bad)));
    }
  });
} finally {
  await env.cleanup();
}

console.log(`MY_DISHES_RULES_EMULATOR_OK ${passed} passed`);
