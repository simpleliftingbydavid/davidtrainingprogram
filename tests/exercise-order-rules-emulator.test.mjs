// Run with the Firestore Emulator up (see tests/run-all.mjs). Đổi thứ tự bài (2026-11-18): khi học viên
// chọn "Lưu cho các lần sau", học viên chỉ được đổi orderInDay của bài đang hoạt động, kèm buổi vừa
// ghi nhận của chính mình và cùng buổi (dayLabel) với bài.
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const projectId = 'demo-david-exercise-order';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const assignment = (overrides = {}) => ({
  exerciseId: 'squat', exerciseNameSnapshot: { vi: 'Squat' }, dayLabel: 'A', orderInDay: 1,
  scheme: 1, schemeParams: {}, state: {}, phaseId: null, active: true, updatedAt: Timestamp.now(), ...overrides,
});
const session = (overrides = {}) => ({ studentUid: 'student-1', dayLabel: 'A', performedExerciseIds: ['squat'], performedAssignmentIds: ['a1'], exerciseLogs: [{}], ...overrides });
const reorder = (orderInDay, sourceSessionId = 's1', extra = {}) => ({
  orderInDay, sourceSessionId, studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra,
});

try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(db, 'students', 'student-1'), { coachUid: 'coach-1' });
    await setDoc(doc(db, 'students', 'student-2'), { coachUid: 'coach-1' });
    await setDoc(doc(db, 'students', 'student-1', 'assignments', 'a1'), assignment());
    await setDoc(doc(db, 'students', 'student-1', 'assignments', 'a2'), assignment({ exerciseId: 'bench', orderInDay: 2 }));
    await setDoc(doc(db, 'students', 'student-1', 'assignments', 'off'), assignment({ active: false, orderInDay: 3 }));
    await setDoc(doc(db, 'students', 'student-1', 'assignments', 'b1'), assignment({ dayLabel: 'B' }));
    await setDoc(doc(db, 'students', 'student-1', 'sessions', 's1'), session());
    await setDoc(doc(db, 'students', 'student-2', 'sessions', 'peer'), session({ studentUid: 'student-2' }));
  });
  const own = env.authenticatedContext('student-1').firestore();
  const peer = env.authenticatedContext('student-2').firestore();
  const ref = (db, id) => doc(db, 'students', 'student-1', 'assignments', id);

  await check('the student saves a new orderInDay with their recorded session of the same day', async () => {
    await assertSucceeds(updateDoc(ref(own, 'a1'), reorder(2)));
    await assertSucceeds(updateDoc(ref(own, 'a2'), reorder(1)));
  });
  await check('only orderInDay and the audit fields may change', async () => {
    await assertFails(updateDoc(ref(own, 'a1'), reorder(3, 's1', { dayLabel: 'B' })));
    await assertFails(updateDoc(ref(own, 'a1'), reorder(3, 's1', { note: 'x' })));
    await assertFails(updateDoc(ref(own, 'a1'), reorder(3, 's1', { exerciseId: 'deadlift' })));
  });
  await check('orderInDay must be a whole number from 1 to 450', async () => {
    for (const bad of [0, 451, 1.5, '2', -1]) await assertFails(updateDoc(ref(own, 'a1'), reorder(bad)));
  });
  await check('needs a real session of this student and of the same day', async () => {
    await assertFails(updateDoc(ref(own, 'a1'), reorder(5, 'missing')));
    await assertFails(updateDoc(ref(own, 'b1'), reorder(5, 's1')));
    await assertFails(updateDoc(ref(own, 'a1'), { orderInDay: 5, updatedAt: serverTimestamp() }));
  });
  await check('a dropped exercise and another student are refused', async () => {
    await assertFails(updateDoc(ref(own, 'off'), reorder(1)));
    await assertFails(updateDoc(ref(peer, 'a1'), reorder(4, 'peer')));
  });
  await check('the timestamps must be the server time', async () => {
    await assertFails(updateDoc(ref(own, 'a1'), { orderInDay: 6, sourceSessionId: 's1', studentEditedAt: Timestamp.now(), updatedAt: serverTimestamp() }));
  });
} finally {
  await env.cleanup();
}
console.log(`EXERCISE_ORDER_RULES_EMULATOR_OK ${passed} passed`);
