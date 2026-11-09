// Run with the Firestore Emulator up (see tests/run-all.mjs). A student keeps their own devices for
// the evening meal-logging reminder (2026-11-04); nobody else reads or writes them.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-student-devices';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const device = (overrides = {}) => ({ token: 'tok-123', enabled: true, platform: 'Android Chrome', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...overrides });

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1' });
    await setDoc(doc(db, 'students', 'student-2'), { coachUid: 'coach-1' });
  });
  const own = env.authenticatedContext('student-1').firestore();
  const peer = env.authenticatedContext('student-2').firestore();
  const coach = env.authenticatedContext('coach-1').firestore();
  const ref = (db) => doc(db, 'students', 'student-1', 'notificationDevices', 'phone');

  await check('a student saves, reads and removes their own device', async () => {
    await assertSucceeds(setDoc(ref(own), device()));
    await assertSucceeds(getDoc(ref(own)));
    await assertSucceeds(deleteDoc(ref(own)));
  });
  await check('nobody else reads or writes it, not even the coach', async () => {
    await env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), 'students', 'student-1', 'notificationDevices', 'phone'), { ...device(), createdAt: new Date(), updatedAt: new Date() }));
    await assertFails(getDoc(ref(peer)));
    await assertFails(getDoc(ref(coach)));
    await assertFails(setDoc(doc(peer, 'students', 'student-1', 'notificationDevices', 'other'), device()));
    await assertFails(deleteDoc(ref(coach)));
  });
  await check('a bad device record is refused', async () => {
    const fresh = doc(own, 'students', 'student-1', 'notificationDevices', 'new');
    for (const bad of [{ token: '' }, { token: 7 }, { enabled: 'yes' }, { platform: 'x'.repeat(301) }, { extra: 1 }]) {
      await assertFails(setDoc(fresh, device(bad)));
    }
  });
} finally {
  await env.cleanup();
}

console.log(`STUDENT_DEVICES_RULES_EMULATOR_OK ${passed} passed`);
