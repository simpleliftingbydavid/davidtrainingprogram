// Run with the Firestore Emulator up (see tests/run-all.mjs). Proves the rules for
// photo angles and waist measurements against the real rules file.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-progress-rules';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'coaches', 'coach-2'), { displayName: 'Other' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(db, 'students', 'student-2'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(db, 'students', 'student-1', 'progressPhotos', 'old-photo'), { takenAt: new Date('2026-08-01'), note: '', downloadURL: 'https://x/a.jpg', storagePath: 'p/a.jpg' });
  });

  const own = env.authenticatedContext('student-1').firestore();
  const peer = env.authenticatedContext('student-2').firestore();
  const coach = env.authenticatedContext('coach-1').firestore();
  const stranger = env.authenticatedContext('coach-2').firestore();
  const photoRef = (db) => doc(db, 'students', 'student-1', 'progressPhotos', 'old-photo');
  const measures = (db) => collection(db, 'students', 'student-1', 'bodyMeasurements');
  const measure = (overrides = {}) => ({ waistCm: 84, loggedAt: new Date('2026-10-05T05:00:00Z'), createdAt: serverTimestamp(), ...overrides });

  // ---------- photo angles ----------
  await check('a student tags their own old photo with a valid angle', async () => {
    for (const angle of ['front', 'side', 'back']) await assertSucceeds(updateDoc(photoRef(own), { angle }));
  });
  await check('an angle outside front, side and back is refused', async () => {
    for (const angle of ['left', 'FRONT', '', 3, null]) await assertFails(updateDoc(photoRef(own), { angle }));
  });
  await check('a student still cannot change anything else on a photo', async () => {
    await assertFails(updateDoc(photoRef(own), { downloadURL: 'https://evil/x.jpg' }));
    await assertFails(updateDoc(photoRef(own), { angle: 'front', storagePath: 'other' }));
  });
  await check('note and date edits still work alongside an angle', async () => {
    await assertSucceeds(updateDoc(photoRef(own), { note: 'sau 4 tuần', angle: 'side' }));
  });
  await check('another student cannot tag the photo; the coach still can', async () => {
    await assertFails(updateDoc(photoRef(peer), { angle: 'front' }));
    await assertSucceeds(updateDoc(photoRef(coach), { angle: 'back' }));
    await assertFails(updateDoc(photoRef(stranger), { angle: 'front' }));
  });
  await check('a new photo can be created with an angle', async () => {
    await assertSucceeds(addDoc(collection(own, 'students', 'student-1', 'progressPhotos'), { takenAt: new Date(), note: '', downloadURL: 'https://x/b.jpg', storagePath: 'p/b.jpg', angle: 'front', createdAt: serverTimestamp() }));
  });

  // ---------- waist ----------
  await check('a student records a waist measurement', async () => {
    await assertSucceeds(addDoc(measures(own), measure()));
    await assertSucceeds(addDoc(measures(own), measure({ note: 'buổi sáng' })));
  });
  await check('implausible, mistyped or extra values are refused', async () => {
    for (const bad of [{ waistCm: 10 }, { waistCm: 400 }, { waistCm: '84' }, { waistCm: null }, { loggedAt: '2026-10-05' }, { note: 'x'.repeat(201) }, { extra: 1 }]) {
      await assertFails(addDoc(measures(own), measure(bad)));
    }
  });
  await check('a measuring day can hold any of the sites, in any mix, but at least one', async () => {
    const { waistCm, ...rest } = measure();
    void waistCm;
    await assertSucceeds(addDoc(measures(own), { ...rest, chestCm: 101.5, armLeftCm: 33, armRightCm: 34 }));
    await assertSucceeds(addDoc(measures(own), { ...rest, waistAboveCm: 86, waistCm: 84, waistBelowCm: 90, hipsCm: 98, thighLeftCm: 58, thighRightCm: 59 }));
    await assertFails(addDoc(measures(own), rest), 'no site at all');
  });
  await check('every site has its own limits', async () => {
    const { waistCm, ...rest } = measure();
    void waistCm;
    for (const bad of [{ chestCm: 20 }, { chestCm: 300 }, { armLeftCm: 5 }, { armRightCm: 150 }, { thighLeftCm: 10 }, { thighRightCm: 200 }, { hipsCm: 30 }, { waistAboveCm: 20 }, { waistBelowCm: '90' }, { chestCm: null }]) {
      await assertFails(addDoc(measures(own), { ...rest, ...bad }));
    }
  });
  await check('a student can add a site to an earlier record, and a bad value still fails', async () => {
    const ref = await addDoc(measures(own), measure());
    await assertSucceeds(updateDoc(ref, { chestCm: 100 }));
    await assertFails(updateDoc(ref, { chestCm: 5 }));
    await assertFails(updateDoc(ref, { unknownCm: 50 }));
  });
  await check('the creation time cannot be forged', async () => {
    await assertFails(addDoc(measures(own), measure({ createdAt: new Date('2020-01-01') })));
  });
  await check('the coach reads measurements but cannot write them', async () => {
    await assertSucceeds(addDoc(measures(own), measure()));
    const { getDocs } = await import('firebase/firestore');
    await assertSucceeds(getDocs(measures(coach)));
    await assertFails(addDoc(measures(coach), measure()));
  });
  await check('no one else can read or write them', async () => {
    const { getDocs } = await import('firebase/firestore');
    await assertFails(getDocs(measures(peer)));
    await assertFails(getDocs(measures(stranger)));
    await assertFails(addDoc(measures(peer), measure()));
  });
  await check('a student can correct a measurement, but only its value, date and note', async () => {
    const ref = await addDoc(measures(own), measure());
    await assertSucceeds(updateDoc(ref, { waistCm: 83.5, note: 'đo lại' }));
    await assertFails(updateDoc(ref, { waistCm: 5 }));
    await assertFails(updateDoc(ref, { createdAt: new Date('2020-01-01') }));
    await assertFails(updateDoc(doc(coach, ref.path), { waistCm: 80 }));
  });
  await check('a student can delete their own measurement, the coach cannot', async () => {
    const ref = await addDoc(measures(own), measure());
    await assertFails(deleteDoc(doc(coach, ref.path)));
    await assertSucceeds(deleteDoc(ref));
    assert.equal((await getDoc(doc(own, ref.path))).exists(), false);
  });

  console.log(`PROGRESS_RULES_EMULATOR_OK ${passed} passed`);
} finally {
  await env.cleanup();
}
