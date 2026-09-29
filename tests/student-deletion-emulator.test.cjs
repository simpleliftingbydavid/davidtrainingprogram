const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const functionsRequire = createRequire(path.resolve(__dirname, '../functions/package.json'));
const { initializeApp, deleteApp } = functionsRequire('firebase-admin/app');
const { getFirestore } = functionsRequire('firebase-admin/firestore');
const {
  StudentDeletionError, deleteStudentAccountData,
} = require('../functions/student-deletion-service');

const projectId = 'demo-david-training-program-student-delete';
const app = initializeApp({ projectId }, 'student-deletion-emulator-test');
const db = getFirestore(app);

const authDeletes = [];
const storagePrefixes = [];
const fakeAuth = {
  async deleteUser(uid) { authDeletes.push(uid); },
};
const fakeBucket = {
  async deleteFiles({ prefix }) { storagePrefixes.push(prefix); },
};

async function exists(path) {
  return (await db.doc(path).get()).exists;
}

async function expectCode(promise, code) {
  await assert.rejects(promise, (error) => error instanceof StudentDeletionError && error.code === code);
}

(async () => {
  try {
    await db.doc('coaches/coach-delete').set({ displayName: 'David' });
    await db.doc('coaches/coach-other').set({ displayName: 'Other' });
    await db.doc('students/student-delete').set({ coachUid: 'coach-delete', displayName: 'Test Student' });
    await db.doc('students/student-keep').set({ coachUid: 'coach-delete', displayName: 'Keep Student' });
    await db.doc('students/student-delete/assignments/assignment-1').set({ exerciseId: 'bench_press' });
    await db.doc('students/student-delete/phaseReviews/review-1').set({ status: 'locked' });
    await db.doc('students/student-delete/phaseReviews/review-1/appendices/appendix-1').set({ body: 'Private' });
    await db.doc('students/student-delete/nutritionPlans/current').set({ calories: 2200 });
    await db.doc('coaches/coach-delete/notifications/notice-1').set({ studentUid: 'student-delete' });
    await db.doc('coaches/coach-delete/notifications/legacy-1').set({ studentId: 'student-delete' });
    await db.doc('coaches/coach-delete/reviewAlerts/alert-1').set({ studentUid: 'student-delete' });
    await db.doc('coaches/coach-delete/reviewAlerts/keep-1').set({ studentUid: 'student-keep' });

    await expectCode(deleteStudentAccountData({
      db, auth: fakeAuth, bucket: fakeBucket,
      callerUid: 'coach-other', studentUid: 'student-delete',
    }), 'permission-denied');
    assert.equal(await exists('students/student-delete'), true, 'wrong coach must not delete student');

    const result = await deleteStudentAccountData({
      db, auth: fakeAuth, bucket: fakeBucket,
      callerUid: 'coach-delete', studentUid: 'student-delete',
    });
    assert.equal(result.alreadyDeleted, false);
    assert.equal(result.coachRecordsDeleted, 3);
    assert.deepEqual(authDeletes, ['student-delete']);
    assert.deepEqual(storagePrefixes, ['students/student-delete/']);
    assert.equal(await exists('students/student-delete'), false);
    assert.equal(await exists('students/student-delete/assignments/assignment-1'), false);
    assert.equal(await exists('students/student-delete/phaseReviews/review-1/appendices/appendix-1'), false);
    assert.equal(await exists('students/student-delete/nutritionPlans/current'), false);
    assert.equal(await exists('coaches/coach-delete/notifications/notice-1'), false);
    assert.equal(await exists('coaches/coach-delete/notifications/legacy-1'), false);
    assert.equal(await exists('coaches/coach-delete/reviewAlerts/alert-1'), false);
    assert.equal(await exists('coaches/coach-delete/reviewAlerts/keep-1'), true, 'other student records must remain');
    assert.equal(await exists('students/student-keep'), true, 'other student must remain');

    const operation = await db.doc('coaches/coach-delete/studentDeletionOperations/student-delete').get();
    assert.equal(operation.data().status, 'completed');
    assert.equal(operation.data().studentUid, 'student-delete');

    const repeated = await deleteStudentAccountData({
      db, auth: fakeAuth, bucket: fakeBucket,
      callerUid: 'coach-delete', studentUid: 'student-delete',
    });
    assert.equal(repeated.alreadyDeleted, true, 'retry after completion must be safe');
    assert.deepEqual(authDeletes, ['student-delete'], 'completed retry must not delete auth again');
    assert.deepEqual(storagePrefixes, ['students/student-delete/'], 'completed retry must not repeat storage deletion');

    await expectCode(deleteStudentAccountData({
      db, auth: fakeAuth, bucket: fakeBucket,
      callerUid: '', studentUid: 'student-keep',
    }), 'unauthenticated');
    await expectCode(deleteStudentAccountData({
      db, auth: fakeAuth, bucket: fakeBucket,
      callerUid: 'coach-delete', studentUid: 'coach-delete',
    }), 'failed-precondition');

    console.log('student deletion emulator tests passed');
  } finally {
    await deleteApp(app);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
