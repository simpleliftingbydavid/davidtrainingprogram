// Runs the real data layer for renaming a training day against the Firestore Emulator,
// under the real rules.   node --experimental-vm-modules tests/day-rename-emulator.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-day-rename',
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

const uid = 'rename-student';
const coachUid = 'rename-coach';
const assignment = (dayLabel, phaseId, extra = {}) => ({
  exerciseId: 'squat', exerciseNameSnapshot: { vi: 'Squat' }, dayLabel, orderInDay: 1, phaseId, active: true,
  scheme: 8, schemeParams: {}, state: {}, ...extra,
});

async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await firestore.setDoc(firestore.doc(db, 'coaches', coachUid), {});
    await firestore.setDoc(firestore.doc(db, 'students', uid), {
      coachUid, clientCategory: 'online', hiddenDays: ['Upper A', 'Lower A'], assignmentOrderRevision: 4,
    });
    await firestore.setDoc(firestore.doc(db, 'students', uid, 'phases', 'p1'), {
      order: 2, name: 'Chu kỳ 2', assignmentOrderRevision: 7,
      volumePlan: { dayFrequencies: { 'Upper A': 2, 'Lower A': 1 } },
    });
    await firestore.setDoc(firestore.doc(db, 'students', uid, 'phases', 'p0'), { order: 1, name: 'Chu kỳ 1', volumePlan: { dayFrequencies: { 'Upper A': 3 } } });
    await firestore.setDoc(firestore.doc(db, 'students', uid, 'assignments', 'a1'), assignment('Upper A', 'p1'));
    await firestore.setDoc(firestore.doc(db, 'students', uid, 'assignments', 'a2'), assignment('Upper A', 'p1', { active: false, orderInDay: 2 }));
    await firestore.setDoc(firestore.doc(db, 'students', uid, 'assignments', 'a3'), assignment('Lower A', 'p1'));
    await firestore.setDoc(firestore.doc(db, 'students', uid, 'assignments', 'a4'), assignment('Upper A', 'p0'));
  });
}

const read = (db, ...path) => firestore.getDoc(firestore.doc(db, ...path)).then((snap) => snap.data());

try {
  const coach = await dataLayer(env.authenticatedContext(coachUid).firestore());
  const student = await dataLayer(env.authenticatedContext(uid).firestore());
  const admin = (fn) => env.withSecurityRulesDisabled((context) => fn(context.firestore()));

  await check('every assignment of the day in this cycle is renamed, live and dropped alike, and no other', async () => {
    await seed();
    const result = await coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Full Body', assignmentIds: ['a1', 'a2'] });
    assert.equal(result.renamed, 2);
    await admin(async (db) => {
      assert.equal((await read(db, 'students', uid, 'assignments', 'a1')).dayLabel, 'Full Body');
      assert.equal((await read(db, 'students', uid, 'assignments', 'a2')).dayLabel, 'Full Body');
      assert.equal((await read(db, 'students', uid, 'assignments', 'a3')).dayLabel, 'Lower A');
      assert.equal((await read(db, 'students', uid, 'assignments', 'a4')).dayLabel, 'Upper A', 'an earlier cycle keeps its own name');
    });
  });

  await check('nothing but the name changes on an assignment', async () => {
    await admin(async (db) => {
      const a1 = await read(db, 'students', uid, 'assignments', 'a1');
      assert.deepEqual([a1.exerciseId, a1.orderInDay, a1.phaseId, a1.active, a1.scheme], ['squat', 1, 'p1', true, 8]);
    });
  });

  await check('the pause, the planned frequency and the record of old names follow the rename', async () => {
    await admin(async (db) => {
      const studentDoc = await read(db, 'students', uid);
      assert.deepEqual(studentDoc.hiddenDays, ['Full Body', 'Lower A']);
      assert.deepEqual(studentDoc.dayRenames, { 'Upper A': 'Full Body' });
      const phase = await read(db, 'students', uid, 'phases', 'p1');
      assert.deepEqual(phase.volumePlan.dayFrequencies, { 'Lower A': 1, 'Full Body': 2 });
      assert.equal((await read(db, 'students', uid, 'phases', 'p0')).volumePlan.dayFrequencies['Upper A'], 3, 'the other cycle is untouched');
    });
  });

  await check('the reorder revision of the cycle goes up, so a reorder started before cannot undo the rename', async () => {
    await admin(async (db) => {
      assert.equal((await read(db, 'students', uid, 'phases', 'p1')).assignmentOrderRevision, 8);
      assert.equal((await read(db, 'students', uid)).assignmentOrderRevision, 4, 'the student-level revision is not the cycle\'s');
    });
  });

  await check('a name another day of the cycle already has is refused, and nothing changes', async () => {
    await assert.rejects(
      coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Full Body', toLabel: 'Lower A', assignmentIds: ['a1', 'a2'] }),
      /Đã có một buổi mang tên này/,
    );
    await admin(async (db) => assert.equal((await read(db, 'students', uid, 'assignments', 'a1')).dayLabel, 'Full Body'));
  });

  await check('the same name in another cycle is not a clash', async () => {
    await seed();
    await coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Upper A2', assignmentIds: ['a1', 'a2'] });
    await coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A2', toLabel: 'Upper A', assignmentIds: ['a1', 'a2'] });
    await admin(async (db) => assert.deepEqual((await read(db, 'students', uid)).dayRenames, { 'Upper A2': 'Upper A' }));
  });

  await check('a day that was already renamed somewhere else is a conflict, not a silent overwrite', async () => {
    await seed();
    await coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Push', assignmentIds: ['a1', 'a2'] });
    await assert.rejects(
      coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Full Body', assignmentIds: ['a1', 'a2'] }),
      (error) => error.code === 'day-rename-conflict',
    );
  });

  await check('a draft cycle can be renamed without touching what is paused today', async () => {
    await seed();
    await coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Push', assignmentIds: ['a1', 'a2'], updatePausedDays: false });
    await admin(async (db) => assert.deepEqual((await read(db, 'students', uid)).hiddenDays, ['Upper A', 'Lower A']));
  });

  await check('a student cannot rename a day, only the coach can', async () => {
    await seed();
    await assert.rejects(student.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Hacked', assignmentIds: ['a1', 'a2'] }));
    await admin(async (db) => assert.equal((await read(db, 'students', uid, 'assignments', 'a1')).dayLabel, 'Upper A'));
  });

  await check('a rename of nothing, or to the same name, is refused before it reaches Firestore', async () => {
    await assert.rejects(coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'Upper A', assignmentIds: ['a1'] }), /không hợp lệ/);
    await assert.rejects(coach.renameAssignmentDay(uid, { phaseId: 'p1', fromLabel: 'Upper A', toLabel: 'X', assignmentIds: [] }), /chưa có bài tập/);
  });

  await check('a programme with no cycle keeps its reorder revision on the student record', async () => {
    await seed();
    await admin((db) => firestore.setDoc(firestore.doc(db, 'students', uid, 'assignments', 'n1'), assignment('Upper A', null)));
    await coach.renameAssignmentDay(uid, { phaseId: null, fromLabel: 'Upper A', toLabel: 'Solo', assignmentIds: ['n1'] });
    await admin(async (db) => {
      assert.equal((await read(db, 'students', uid, 'assignments', 'n1')).dayLabel, 'Solo');
      assert.equal((await read(db, 'students', uid, 'assignments', 'a1')).dayLabel, 'Upper A', 'the cycle\'s own day is a different day');
      assert.equal((await read(db, 'students', uid)).assignmentOrderRevision, 5);
    });
  });

  console.log(`DAY_RENAME_EMULATOR_OK ${count} passed`);
} finally {
  await env.cleanup();
}
