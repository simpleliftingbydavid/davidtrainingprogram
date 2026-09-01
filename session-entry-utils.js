// Build the Firestore workout payload from the student's visible session state.
// Only sets explicitly marked as completed are loggable. Prefilled form values
// are prescriptions, not proof that the student performed the set.

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function integer(value) {
  return Math.trunc(finiteNumber(value));
}

export function createSessionSubmissionGate() {
  let active = false;
  return Object.freeze({
    tryStart() {
      if (active) return false;
      active = true;
      return true;
    },
    finish() { active = false; },
    isActive() { return active; },
  });
}

export function outcomesFromStoredSession(session = {}) {
  if (!Array.isArray(session.exerciseLogs)) return [];
  return session.exerciseLogs.map((log) => ({
    assignmentId: log.assignmentId || null,
    exerciseId: log.substitutedExerciseId || log.exerciseId || null,
    exerciseName: log.exerciseNameSnapshot?.vi || '',
    source: log.source || 'assigned',
    substitutedExerciseId: log.substitutedExerciseId || null,
    resultBucket: log.resultBucket || '',
    delta: log.delta || null,
    outcome: log.outcome || 'hold',
    nextPrescription: log.nextPrescription || null,
    originalNextPrescription: log.originalNextPrescription || null,
    progressionHeld: log.progressionHeld === true,
    techniqueConfirmed: log.techniqueConfirmed === true,
    isPR: log.isPR === true,
  }));
}

/**
 * @param {Array<{
 *   assignmentId?: string,
 *   source?: 'assigned'|'extra',
 *   exerciseId?: string,
 *   substitutedExerciseId?: string | null,
 *   techniqueConfirmed?: boolean,
 *   skipped?: boolean,
 *   restSeconds?: number|string,
 *   plannedSetCount?: number|string,
 *   adjustedSetCount?: number|string,
 *   sets?: Array<{setIndex?: number, weight?: number|string, reps?: number|string,
 *     rir?: number|string, completed?: boolean}>
 * }>} exercises
 * @returns {Array<{assignmentId: string|null, source: string, exerciseId: string|null,
 *   substitutedExerciseId: string|null, plannedSetCount: number, adjustedSetCount: number,
 *   actualSets: Array<{setIndex: number, weight: number, reps: number, rir: number}>}>}
 */
export function buildCompletedExerciseEntries(exercises = []) {
  return exercises.flatMap((exercise) => {
    if (exercise?.skipped === true) return [];
    const source = exercise?.source === 'extra' ? 'extra' : 'assigned';
    const assignmentId = String(exercise?.assignmentId || '').trim();
    const exerciseId = String(exercise?.exerciseId || '').trim();
    if (source === 'extra' ? !exerciseId : !assignmentId) return [];

    const actualSets = (exercise.sets || [])
      .filter((set) => set?.completed === true)
      .map((set, index) => ({
        setIndex: Math.max(1, integer(set.setIndex) || index + 1),
        weight: finiteNumber(set.weight),
        reps: integer(set.reps),
        rir: integer(set.rir),
      }));

    if (actualSets.length === 0) return [];

    return [{
      sessionExerciseId: String(exercise.sessionExerciseId || '').trim() || null,
      assignmentId: assignmentId || null,
      source,
      exerciseId: exerciseId || null,
      exerciseNameSnapshot: exercise.exerciseNameSnapshot || null,
      actualSets,
      substitutedExerciseId: exercise.substitutedExerciseId || null,
      techniqueConfirmed: exercise.techniqueConfirmed === true,
      plannedSetCount: Math.max(1, integer(exercise.plannedSetCount) || actualSets.length),
      adjustedSetCount: Math.max(1, integer(exercise.adjustedSetCount) || actualSets.length),
      restSeconds: Math.max(0, integer(exercise.restSeconds)),
      completionReason: String(exercise.completionReason || '').trim(),
      completionReasonNote: String(exercise.completionReasonNote || '').trim(),
    }];
  });
}

/**
 * Mirrors the identity used by the Firestore transaction. Assigned exercises keep
 * their assignment identity; added and substituted exercises use the exercise
 * actually performed so one progression state can never be advanced twice.
 */
export function sessionExerciseEntryKey(exercise = {}) {
  const source = exercise?.source === 'extra' ? 'extra' : 'assigned';
  const assignmentId = String(exercise?.assignmentId || '').trim();
  const exerciseId = String(exercise?.exerciseId || '').trim();
  const substitutedExerciseId = String(exercise?.substitutedExerciseId || '').trim();
  if (source === 'extra') return exerciseId ? `exercise:${exerciseId}` : '';
  if (substitutedExerciseId) return `exercise:${substitutedExerciseId}`;
  return assignmentId ? `assigned:${assignmentId}` : '';
}

export function buildSkippedExerciseEntries(exercises = []) {
  return exercises.flatMap((exercise) => {
    if (exercise?.skipped !== true || exercise?.source === 'extra') return [];
    const assignmentId = String(exercise.assignmentId || '').trim();
    if (!assignmentId) return [];
    return [{
      assignmentId,
      exerciseId: String(exercise.exerciseId || '').trim() || null,
      exerciseNameSnapshot: exercise.exerciseNameSnapshot || null,
      status: 'skipped',
      skipReason: String(exercise.completionReason || '').trim(),
      skipReasonNote: String(exercise.completionReasonNote || '').trim(),
    }];
  });
}

/** Build a history-only marker. Skipped exercises never change progression or volume. */
export function buildSkippedSessionLog(entry = {}) {
  return {
    assignmentId: entry.assignmentId,
    exerciseId: entry.exerciseId || null,
    exerciseNameSnapshot: entry.exerciseNameSnapshot || null,
    source: 'assigned',
    status: 'skipped',
    skipReason: entry.skipReason || 'readiness',
    skipReasonNote: entry.skipReasonNote || '',
    actualSets: [],
    outcome: 'skipped',
    progressionHeld: true,
    resultBucket: 'Bỏ qua do thể trạng — không ảnh hưởng tiến trình',
  };
}

/** Validate raw form values before converting empty fields to numbers. */
export function validateSessionExerciseInputs(exercises = []) {
  const issues = [];
  const assignmentIds = new Set();
  const extraIds = new Set();
  const completedEntryKeys = new Set();
  const completedExerciseIds = new Map();

  exercises.forEach((exercise, exerciseIndex) => {
    const label = exercise.exerciseNameSnapshot?.vi || `Bài ${exerciseIndex + 1}`;
    const assignmentId = String(exercise.assignmentId || '').trim();
    const exerciseId = String(exercise.exerciseId || '').trim();

    if (exercise.source === 'extra') {
      if (!exerciseId) issues.push(`${label}: thiếu mã bài tập thêm.`);
      if (extraIds.has(exerciseId)) issues.push(`${label}: bài tập thêm đang bị trùng trong buổi.`);
      extraIds.add(exerciseId);
    } else {
      if (!assignmentId) issues.push(`${label}: thiếu liên kết với giáo án.`);
      if (assignmentIds.has(assignmentId)) issues.push(`${label}: bài trong giáo án đang bị trùng trong buổi.`);
      assignmentIds.add(assignmentId);
    }

    if (exercise.skipped === true) return;
    const completedSets = (exercise.sets || []).filter((set) => set.completed === true);
    if (completedSets.length) {
      const entryKey = sessionExerciseEntryKey(exercise);
      const performedExerciseId = String(exercise.substitutedExerciseId || exercise.exerciseId || '').trim();
      const changesExerciseIdentity = exercise.source === 'extra' || Boolean(String(exercise.substitutedExerciseId || '').trim());
      if (entryKey && completedEntryKeys.has(entryKey)) {
        issues.push(`${label}: bài tập đang bị trùng với một bài khác trong buổi.`);
      }
      if (performedExerciseId && completedExerciseIds.has(performedExerciseId)
          && (changesExerciseIdentity || completedExerciseIds.get(performedExerciseId))) {
        issues.push(`${label}: bài tập đang bị trùng với một bài khác trong buổi.`);
      }
      if (entryKey) completedEntryKeys.add(entryKey);
      if (performedExerciseId) completedExerciseIds.set(
        performedExerciseId,
        changesExerciseIdentity || completedExerciseIds.get(performedExerciseId) === true,
      );
    }
    completedSets.forEach((set) => {
      const setLabel = `${label} · set ${set.setIndex || 1}`;
      const weightText = String(set.weight ?? '').trim();
      const repsText = String(set.reps ?? '').trim();
      const rirText = String(set.rir ?? '').trim();
      const weight = Number(weightText);
      const reps = Number(repsText);
      const rir = Number(rirText);
      if (!weightText || !Number.isFinite(weight) || weight < 0) issues.push(`${setLabel}: mức tạ không hợp lệ.`);
      if (!repsText || !Number.isInteger(reps) || reps <= 0) issues.push(`${setLabel}: số rep phải lớn hơn 0.`);
      if (!rirText || !Number.isInteger(rir) || rir < 0 || rir > 10) issues.push(`${setLabel}: RIR phải từ 0 đến 10.`);
    });
  });

  return [...new Set(issues)];
}

export function sessionSaveErrorMessage(error) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  if (code.includes('permission-denied') || message.includes('insufficient permissions')) {
    return 'Phiên đăng nhập chưa được Firebase xác nhận. Hãy kiểm tra mạng hoặc đăng nhập lại rồi thử lưu. Dữ liệu buổi tập vừa nhập vẫn được giữ nguyên.';
  }
  if (code.includes('unavailable') || code.includes('deadline') || message.includes('network') || message.includes('offline')) {
    return 'Kết nối đang không ổn định. Hãy giữ nguyên trang và thử lại sau ít phút; dữ liệu vừa nhập chưa bị mất.';
  }
  if (code.includes('already-exists') || message.includes('đã được ghi nhận trước đó')) {
    return 'Buổi tập này đã được ghi nhận trước đó. Hãy tải lại lịch sử trước khi thử lại để tránh lưu trùng.';
  }
  return 'Chưa thể ghi nhận buổi tập lúc này. Dữ liệu vừa nhập vẫn được giữ nguyên; hãy thử lại hoặc gửi ảnh màn hình cho David.';
}
