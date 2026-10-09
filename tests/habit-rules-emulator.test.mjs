// Run with the Firestore Emulator up (see tests/run-all.mjs). Proves the security
// rules for the habit plan and the daily habit log, against the real rules file.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const projectId = 'demo-david-habit-rules';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

// Calendar days are taken in UTC, the same clock the rules compare against.
function day(offset) {
  const date = new Date(Date.now() + offset * 86400000);
  return date.toISOString().slice(0, 10);
}

const habit = (overrides = {}) => ({
  id: 'h1', name: 'Ăn đủ protein bữa sáng', cue: 'Sau khi đánh răng', twoMinute: 'Uống một ly sữa',
  reward: '', startedOn: day(0), ...overrides,
});
const plan = (overrides = {}) => ({
  identity: 'Tôi là người chăm sóc cơ thể mình', habits: [habit()], updatedAt: serverTimestamp(), ...overrides,
});
const log = (date, done = { h1: 'full' }, overrides = {}) => ({ date, done, updatedAt: serverTimestamp(), ...overrides });

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'coaches', 'coach-2'), { displayName: 'Other coach' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(db, 'students', 'student-2'), { coachUid: 'coach-1', clientCategory: 'online' });
  });

  const own = env.authenticatedContext('student-1').firestore();
  const peer = env.authenticatedContext('student-2').firestore();
  const coach = env.authenticatedContext('coach-1').firestore();
  const stranger = env.authenticatedContext('coach-2').firestore();
  const planRef = (db) => doc(db, 'students', 'student-1', 'habitPlan', 'current');
  const logRef = (db, date) => doc(db, 'students', 'student-1', 'habitLogs', date);

  // ---------- the plan ----------
  await check('a student saves their own plan, with the server timestamp', async () => {
    await assertSucceeds(setDoc(planRef(own), plan()));
  });
  await check('the assigned coach reads the plan but cannot write it', async () => {
    await assertSucceeds(getDoc(planRef(coach)));
    await assertFails(setDoc(planRef(coach), plan()));
  });
  await check('another student and an unassigned coach see nothing', async () => {
    await assertFails(getDoc(planRef(peer)));
    await assertFails(getDoc(planRef(stranger)));
    await assertFails(setDoc(planRef(peer), plan()));
  });
  await check('the plan lives only in the single document named current', async () => {
    await assertFails(setDoc(doc(own, 'students', 'student-1', 'habitPlan', 'other'), plan()));
  });
  await check('three habits are fine, four are refused', async () => {
    const three = [habit({ id: 'h1' }), habit({ id: 'h2' }), habit({ id: 'h3' })];
    await assertSucceeds(setDoc(planRef(own), plan({ habits: three })));
    await assertFails(setDoc(planRef(own), plan({ habits: [...three, habit({ id: 'h4' })] })));
  });
  await check('a plan with no habits yet can be saved (identity only)', async () => {
    await assertSucceeds(setDoc(planRef(own), plan({ habits: [] })));
  });
  await check('a habit must name what, a cue and the two-minute version', async () => {
    for (const field of ['name', 'cue', 'twoMinute']) {
      await assertFails(setDoc(planRef(own), plan({ habits: [habit({ [field]: '' })] })));
    }
    await assertSucceeds(setDoc(planRef(own), plan({ habits: [habit({ reward: '' })] })));
  });
  await check('text is capped at the same lengths the page enforces', async () => {
    await assertFails(setDoc(planRef(own), plan({ habits: [habit({ name: 'a'.repeat(81) })] })));
    await assertFails(setDoc(planRef(own), plan({ identity: 'a'.repeat(161) })));
    await assertSucceeds(setDoc(planRef(own), plan({ habits: [habit({ name: 'a'.repeat(80) })] })));
  });
  await check('unknown fields and unknown habit ids are refused', async () => {
    await assertFails(setDoc(planRef(own), plan({ extra: 1 })));
    await assertFails(setDoc(planRef(own), plan({ habits: [habit({ extra: 1 })] })));
    await assertFails(setDoc(planRef(own), plan({ habits: [habit({ id: 'x9' })] })));
    await assertFails(setDoc(planRef(own), plan({ habits: [habit({ startedOn: 'hôm qua' })] })));
  });
  await check('the update time cannot be forged', async () => {
    await assertFails(setDoc(planRef(own), plan({ updatedAt: new Date('2020-01-01') })));
  });
  await check('a plan cannot be deleted from the browser', async () => {
    await assertFails(deleteDoc(planRef(own)));
    await assertFails(deleteDoc(planRef(coach)));
  });

  // ---------- the daily log ----------
  await check('a student ticks today and yesterday', async () => {
    await assertSucceeds(setDoc(logRef(own, day(0)), log(day(0))));
    await assertSucceeds(setDoc(logRef(own, day(-1)), log(day(-1), { h1: 'minimum', h2: 'full' })));
  });
  await check('a tick can be changed on a day that is still open', async () => {
    await assertSucceeds(setDoc(logRef(own, day(0)), log(day(0), { h1: 'minimum' })));
    await assertSucceeds(setDoc(logRef(own, day(0)), log(day(0), {})));
  });
  await check('the back-fill window ends two days back, so a streak cannot be rewritten', async () => {
    await assertSucceeds(setDoc(logRef(own, day(-2)), log(day(-2))));
    await assertFails(setDoc(logRef(own, day(-3)), log(day(-3))));
    await assertFails(setDoc(logRef(own, day(-30)), log(day(-30))));
  });
  await check('the future is closed, with one day of slack for Vietnam time', async () => {
    await assertSucceeds(setDoc(logRef(own, day(1)), log(day(1))));
    await assertFails(setDoc(logRef(own, day(2)), log(day(2))));
  });
  await check('an impossible calendar day is refused, not guessed at', async () => {
    for (const bad of ['2026-13-45', '2026-02-30', 'hom-nay', '2026-1-1']) {
      await assertFails(setDoc(logRef(own, bad), log(bad)));
    }
  });
  await check('the stored date must match the document id', async () => {
    await assertFails(setDoc(logRef(own, day(0)), log(day(-1))));
  });
  await check('only known statuses on known habits', async () => {
    await assertFails(setDoc(logRef(own, day(0)), log(day(0), { h1: 'perfect' })));
    await assertFails(setDoc(logRef(own, day(0)), log(day(0), { x1: 'full' })));
    await assertFails(setDoc(logRef(own, day(0)), log(day(0), { h1: 'full', h2: 'full', h3: 'full', h4: 'full' })));
    await assertFails(setDoc(logRef(own, day(0)), log(day(0), { extra: true })));
    await assertFails(setDoc(logRef(own, day(0)), log(day(0), 'full')));
  });
  await check('the coach reads the log and cannot tick for the student', async () => {
    await assertSucceeds(getDoc(logRef(coach, day(-1))));
    await assertFails(setDoc(logRef(coach, day(0)), log(day(0))));
  });
  await check('nobody else can read or write a student log', async () => {
    await assertFails(getDoc(logRef(peer, day(-1))));
    await assertFails(setDoc(logRef(peer, day(0)), log(day(0))));
    await assertFails(getDoc(logRef(stranger, day(-1))));
  });
  await check('a log cannot be deleted from the browser', async () => {
    await assertFails(deleteDoc(logRef(own, day(-1))));
    await assertFails(deleteDoc(logRef(coach, day(-1))));
  });

  console.log(`HABIT_RULES_EMULATOR_OK ${passed} passed`);
} finally {
  await env.cleanup();
}
