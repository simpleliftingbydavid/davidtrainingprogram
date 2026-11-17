// Run with the Firestore Emulator up (see tests/run-all.mjs). Sản phẩm của tôi (2026-11-17): the student
// adds their own packaged products; their coach can read them; nobody else can do either.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-my-label-foods';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const per100 = { kcal: 63, protein: 3.2, carb: 4.8, fat: 3.4, fiber: null, potassium: null, sodium: 45, calcium: 120, magnesium: null, iron: null, zinc: null };
const product = (overrides = {}) => ({
  name: 'Sữa tươi không đường', brand: 'Vinamilk', unit: 'ml', servingLabel: '1 hộp 180 ml', servingAmount: 180,
  per100, archived: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...overrides,
});

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
  const ref = (db, id = 'p1') => doc(db, 'students', 'student-1', 'myLabelFoods', id);

  await check('the student adds, reads, edits and deletes their own product', async () => {
    await assertSucceeds(setDoc(ref(own), product()));
    await assertSucceeds(getDoc(ref(own)));
    const { createdAt, ...rest } = product();
    await assertSucceeds(updateDoc(ref(own), { ...rest, name: 'Sữa tươi ít đường', updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(ref(own)));
  });
  await check('their coach reads but cannot write; others cannot read', async () => {
    await env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), 'students', 'student-1', 'myLabelFoods', 'p2'), { ...product(), createdAt: new Date(), updatedAt: new Date() }));
    await assertSucceeds(getDoc(ref(coach, 'p2')));
    await assertFails(setDoc(ref(coach, 'p3'), product()));
    await assertFails(deleteDoc(ref(coach, 'p2')));
    await assertFails(getDoc(ref(peer, 'p2')));
    await assertFails(getDoc(ref(otherCoach, 'p2')));
    await assertFails(setDoc(ref(peer, 'p4'), product()));
  });
  await check('a bad product is refused', async () => {
    for (const bad of [{ name: '' }, { name: 'x'.repeat(81) }, { unit: 'kg' }, { servingAmount: 0 }, { per100: { ...per100, kcal: null } }, { per100: { ...per100, vitaminC: 1 } }, { image: 'data' }]) {
      await assertFails(setDoc(ref(own, 'bad'), product(bad)));
    }
  });
} finally {
  await env.cleanup();
}
console.log(`MY_LABEL_FOODS_RULES_EMULATOR_OK ${passed} passed`);
