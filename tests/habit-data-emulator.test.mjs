// Runs the real data layer for habits against the Firestore Emulator, under the
// real security rules.  node --experimental-vm-modules tests/habit-data-emulator.test.mjs
//
// habit-rules-emulator proves the rules with hand-built documents. This proves the
// documents the app actually writes pass them: the plan save, the per-day merge
// tick, and the clean-up that stops a re-used habit id inheriting old ticks.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';
import { addDays, habitToday } from '../habit-utils.js';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-training-program-habit-data',
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

const uid = 'habit-student';
const coachUid = 'habit-coach';
const today = habitToday();
const yesterday = addDays(today, -1);
const draft = (overrides = {}) => ({
  name: 'Ăn đủ protein bữa sáng', cue: 'Sau khi đánh răng', twoMinute: 'Uống một ly sữa', reward: '', ...overrides,
});

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await firestore.setDoc(firestore.doc(context.firestore(), 'coaches', coachUid), {});
    await firestore.setDoc(firestore.doc(context.firestore(), 'students', uid), { coachUid, clientCategory: 'online' });
  });
  const student = await dataLayer(env.authenticatedContext(uid).firestore());
  const coach = await dataLayer(env.authenticatedContext(coachUid).firestore());

  await check('a student with no plan reads an empty one', async () => {
    assert.deepEqual(await student.getHabitPlan(uid), { identity: '', habits: [] });
  });

  await check('saving a plan stores it, numbers the habits and starts them today', async () => {
    await student.saveHabitPlan(uid, { identity: 'Tôi là người chăm sóc cơ thể', habits: [draft(), draft({ name: 'Ngủ trước 23h', cue: 'Lúc 22h30 tại phòng ngủ', twoMinute: 'Đặt điện thoại ra ngoài' })] });
    const plan = await student.getHabitPlan(uid);
    assert.deepEqual(plan.habits.map((habit) => habit.id), ['h1', 'h2']);
    assert.ok(plan.habits.every((habit) => habit.startedOn === today));
    assert.equal(plan.identity, 'Tôi là người chăm sóc cơ thể');
  });

  await check('editing a habit keeps the day it started', async () => {
    const plan = await student.getHabitPlan(uid);
    const old = { ...plan.habits[0], startedOn: addDays(today, -10) };
    await student.saveHabitPlan(uid, { identity: plan.identity, habits: [old, plan.habits[1]] });
    const after = await student.getHabitPlan(uid);
    assert.equal(after.habits[0].startedOn, addDays(today, -10));
  });

  await check('an incomplete or oversized plan is refused before it reaches Firestore', async () => {
    await assert.rejects(student.saveHabitPlan(uid, { habits: [draft({ twoMinute: '' })] }), /phiên bản 2 phút/);
    await assert.rejects(student.saveHabitPlan(uid, { habits: [draft(), draft(), draft(), draft()] }), /tối đa 3/);
    assert.equal((await student.getHabitPlan(uid)).habits.length, 2, 'the stored plan is untouched');
  });

  await check('ticks for today and yesterday are stored and read back', async () => {
    await student.saveHabitStatus(uid, today, 'h1', 'full');
    await student.saveHabitStatus(uid, yesterday, 'h1', 'minimum');
    const logs = await student.listHabitLogs(uid);
    assert.equal(logs[today].h1, 'full');
    assert.equal(logs[yesterday].h1, 'minimum');
  });

  await check('two habits ticked on one day do not overwrite each other', async () => {
    await student.saveHabitStatus(uid, today, 'h2', 'minimum');
    const logs = await student.listHabitLogs(uid);
    assert.deepEqual(logs[today], { h1: 'full', h2: 'minimum' });
  });

  await check('clearing a tick removes just that habit', async () => {
    await student.saveHabitStatus(uid, today, 'h1', null);
    const logs = await student.listHabitLogs(uid);
    assert.deepEqual(logs[today], { h2: 'minimum' });
  });

  await check('an older day cannot be ticked', async () => {
    await assert.rejects(student.saveHabitStatus(uid, addDays(today, -3), 'h1', 'full'), /hôm nay hoặc hôm qua/);
  });

  await check('a habit deleted and re-added the same day does not inherit its ticks', async () => {
    const plan = await student.getHabitPlan(uid);
    await student.saveHabitPlan(uid, { identity: plan.identity, habits: [plan.habits[0]] });
    await student.saveHabitPlan(uid, { identity: plan.identity, habits: [plan.habits[0], draft({ name: 'Uống đủ nước' })] });
    const after = await student.getHabitPlan(uid);
    assert.equal(after.habits[1].id, 'h2', 'the id is re-used');
    const logs = await student.listHabitLogs(uid);
    assert.equal(logs[today]?.h2, undefined, "the old h2's tick is gone");
  });

  await check('the assigned coach reads the plan and ticks but cannot write either', async () => {
    assert.equal((await coach.getHabitPlan(uid)).habits.length, 2);
    assert.ok(Object.keys(await coach.listHabitLogs(uid)).length >= 1);
    await assert.rejects(coach.saveHabitPlan(uid, { habits: [draft()] }));
    await assert.rejects(coach.saveHabitStatus(uid, today, 'h1', 'full'));
  });

  console.log(`HABIT_DATA_EMULATOR_OK ${count} passed`);
} finally {
  await env.cleanup();
}
