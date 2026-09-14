// Pure helpers for notifyCoachOfProgrammeEdit.
//
// They live here rather than in index.js because everything exported from that
// file is treated by Firebase as a function to deploy — so exporting these for
// a test there would try to deploy them. Kept pure: no Firestore, no admin SDK,
// so tests/programme-edit.test.mjs can exercise the classification directly.

/** Firestore timestamps are objects, so identity comparison does not work. */
function sameStamp(a, b) {
  if (!a || !b) return a === b;
  if (typeof a.isEqual === 'function') return a.isEqual(b);
  if (typeof a.toMillis === 'function' && typeof b.toMillis === 'function') return a.toMillis() === b.toMillis();
  return String(a) === String(b);
}

function displayName(assignment) {
  return assignment?.exerciseNameSnapshot?.vi || assignment?.exerciseId || 'Bài tập';
}

/**
 * What the student did to this assignment, or null when the write is not a
 * programme edit worth telling the coach about.
 *
 * Returning null matters as much as the positive cases: every set logged during
 * a session updates its assignment's progression state, and reporting those
 * would bury the real edits under noise.
 */
function classifyProgrammeEdit(before, after) {
  if (!after) return null;
  if (!before) return { verb: 'Thêm', exerciseName: displayName(after) };
  if (before.active !== false && after.active === false) {
    return { verb: 'Bỏ', exerciseName: displayName(before) };
  }
  if (String(before.exerciseId || '') !== String(after.exerciseId || '')) {
    return { verb: 'Đổi', exerciseName: `${displayName(before)} → ${displayName(after)}` };
  }
  return null;
}

/**
 * Whether this write is a student edit the coach has not been told about yet.
 *
 * A coach editing the programme never touches `studentEditedAt`, and restoring
 * a dropped exercise clears it, so neither path raises a notification.
 */
function isFreshStudentEdit(before, after) {
  if (!after?.studentEditedAt) return false;
  if (!before) return true;
  return !sameStamp(before.studentEditedAt, after.studentEditedAt);
}

module.exports = { sameStamp, classifyProgrammeEdit, isFreshStudentEdit, displayName };
