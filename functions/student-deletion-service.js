const { FieldValue } = require('firebase-admin/firestore');

const PROGRESS_PHOTO_BUCKET = 'david-training-program-progress-asia';
const COACH_SCOPED_COLLECTIONS = Object.freeze(['notifications', 'reviewAlerts']);

class StudentDeletionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'StudentDeletionError';
    this.code = code;
  }
}

function normalizedUid(value) {
  return String(value || '').trim();
}

function isNotFoundError(error) {
  const code = String(error?.code || '').toLowerCase();
  return code === '5'
    || code === 'not-found'
    || code === 'auth/user-not-found'
    || code === 'storage/object-not-found';
}

async function deleteQueryInBatches(db, query, batchSize = 400) {
  let deletedCount = 0;
  while (true) {
    const snapshot = await query.limit(batchSize).get();
    if (snapshot.empty) return deletedCount;
    const batch = db.batch();
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
    deletedCount += snapshot.size;
  }
}

async function deleteCoachScopedRecords(db, coachUid, studentUid) {
  let deletedCount = 0;
  for (const collectionName of COACH_SCOPED_COLLECTIONS) {
    const source = db.collection(`coaches/${coachUid}/${collectionName}`);
    deletedCount += await deleteQueryInBatches(db, source.where('studentUid', '==', studentUid));
    // A few early records used studentId before the field was standardized.
    deletedCount += await deleteQueryInBatches(db, source.where('studentId', '==', studentUid));
  }
  return deletedCount;
}

async function deleteStudentAccountData({ db, auth, bucket, callerUid, studentUid }) {
  const coachUid = normalizedUid(callerUid);
  const targetUid = normalizedUid(studentUid);
  if (!coachUid) throw new StudentDeletionError('unauthenticated', 'Bạn cần đăng nhập lại.');
  if (!targetUid || targetUid.includes('/')) {
    throw new StudentDeletionError('invalid-argument', 'Mã học viên không hợp lệ.');
  }
  if (targetUid === coachUid) {
    throw new StudentDeletionError('failed-precondition', 'Không thể xóa tài khoản huấn luyện viên.');
  }

  const coachRef = db.doc(`coaches/${coachUid}`);
  const studentRef = db.doc(`students/${targetUid}`);
  const operationRef = db.doc(`coaches/${coachUid}/studentDeletionOperations/${targetUid}`);
  const [coachSnap, studentSnap, operationSnap] = await Promise.all([
    coachRef.get(), studentRef.get(), operationRef.get(),
  ]);
  if (!coachSnap.exists) {
    throw new StudentDeletionError('permission-denied', 'Tài khoản hiện tại không có quyền huấn luyện viên.');
  }

  const operation = operationSnap.exists ? operationSnap.data() : null;
  if (!studentSnap.exists) {
    if (operation?.coachUid !== coachUid || operation?.studentUid !== targetUid) {
      throw new StudentDeletionError('not-found', 'Không tìm thấy học viên thuộc quyền quản lý của bạn.');
    }
    if (operation.status === 'completed') {
      return { studentUid: targetUid, alreadyDeleted: true, coachRecordsDeleted: 0 };
    }
  } else if (normalizedUid(studentSnap.data()?.coachUid) !== coachUid) {
    throw new StudentDeletionError('permission-denied', 'Bạn không có quyền xóa học viên này.');
  }

  await operationRef.set({
    coachUid,
    studentUid: targetUid,
    status: 'deleting',
    attempts: FieldValue.increment(1),
    startedAt: operation?.startedAt || FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    completedAt: null,
    lastError: null,
  }, { merge: true });

  try {
    // recursiveDelete removes every current and future nested collection, so a
    // newly added feature cannot silently leave private student data behind.
    if ((await studentRef.get()).exists) await db.recursiveDelete(studentRef);

    const coachRecordsDeleted = await deleteCoachScopedRecords(db, coachUid, targetUid);

    // All progress photos created by this app live below this UID prefix.
    await bucket.deleteFiles({ prefix: `students/${targetUid}/` });

    try {
      await auth.deleteUser(targetUid);
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }

    await operationRef.set({
      status: 'completed',
      coachRecordsDeleted,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastError: null,
    }, { merge: true });
    return { studentUid: targetUid, alreadyDeleted: false, coachRecordsDeleted };
  } catch (error) {
    await operationRef.set({
      status: 'failed',
      lastError: String(error?.code || error?.message || 'unknown').slice(0, 200),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => {});
    throw error;
  }
}

module.exports = {
  PROGRESS_PHOTO_BUCKET,
  StudentDeletionError,
  deleteStudentAccountData,
  deleteCoachScopedRecords,
  deleteQueryInBatches,
  isNotFoundError,
};
