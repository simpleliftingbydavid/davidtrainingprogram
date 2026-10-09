// Runs the real data layer for photo angles and waist measurements against the
// Firestore Emulator, under the real rules.
// node --experimental-vm-modules tests/progress-data-emulator.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-progress-data',
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

const uid = 'progress-student';
const coachUid = 'progress-coach';
const photo = (overrides = {}) => ({ takenAt: new Date('2026-10-01T05:00:00Z'), note: '', downloadURL: 'https://x/a.jpg', storagePath: 'p/a.jpg', ...overrides });

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await firestore.setDoc(firestore.doc(context.firestore(), 'coaches', coachUid), {});
    await firestore.setDoc(firestore.doc(context.firestore(), 'students', uid), { coachUid, clientCategory: 'online' });
  });
  const student = await dataLayer(env.authenticatedContext(uid).firestore());
  const coach = await dataLayer(env.authenticatedContext(coachUid).firestore());

  await check('a photo is stored with its angle', async () => {
    await student.addProgressPhoto(uid, photo({ angle: 'front' }));
    const photos = await student.listProgressPhotos(uid);
    assert.equal(photos.find((item) => item.angle === 'front')?.downloadURL, 'https://x/a.jpg');
  });

  await check('an unknown angle is left out instead of stored', async () => {
    await student.addProgressPhoto(uid, photo({ angle: 'diagonal', downloadURL: 'https://x/b.jpg' }));
    const stored = (await student.listProgressPhotos(uid)).find((item) => item.downloadURL === 'https://x/b.jpg');
    assert.equal('angle' in stored, false);
  });

  await check('an old photo with no angle can be tagged afterwards', async () => {
    const stored = (await student.listProgressPhotos(uid)).find((item) => item.downloadURL === 'https://x/b.jpg');
    await student.setProgressPhotoAngle(uid, stored.id, 'side');
    const again = (await student.listProgressPhotos(uid)).find((item) => item.id === stored.id);
    assert.equal(again.angle, 'side');
    assert.equal(again.downloadURL, 'https://x/b.jpg', 'nothing else on the photo changed');
  });

  await check('an invalid angle is refused before it reaches Firestore', async () => {
    const stored = (await student.listProgressPhotos(uid))[0];
    await assert.rejects(student.setProgressPhotoAngle(uid, stored.id, 'left'), /không hợp lệ/);
  });

  await check('a waist measurement is stored, read back newest first, and can be deleted', async () => {
    await student.addBodyMeasurement(uid, { waistCm: 88, loggedAt: new Date('2026-09-01T05:00:00Z') });
    await student.addBodyMeasurement(uid, { waistCm: 84, loggedAt: new Date('2026-10-05T05:00:00Z'), note: 'buổi sáng' });
    const list = await student.listBodyMeasurements(uid);
    assert.deepEqual(list.map((item) => item.waistCm), [84, 88]);
    assert.equal(list[0].note, 'buổi sáng');
    await student.deleteBodyMeasurement(uid, list[1].id);
    assert.equal((await student.listBodyMeasurements(uid)).length, 1);
  });

  await check('an implausible waist is refused before it reaches Firestore', async () => {
    for (const bad of [10, 400, 'x', null]) await assert.rejects(student.addBodyMeasurement(uid, { waistCm: bad, loggedAt: new Date() }), /30 đến 250/);
  });

  await check('the coach reads the measurements and angles but cannot write', async () => {
    assert.equal((await coach.listBodyMeasurements(uid)).length, 1);
    assert.ok((await coach.listProgressPhotos(uid)).length >= 2);
    await assert.rejects(coach.addBodyMeasurement(uid, { waistCm: 80, loggedAt: new Date() }));
  });

  console.log(`PROGRESS_DATA_EMULATOR_OK ${count} passed`);
} finally {
  await env.cleanup();
}
