export const PROGRAM_CHANGE = Object.freeze({
  REPLACE: 'replace',
  ADD: 'add',
  REMOVE: 'remove',
});

export function programChangeAddAssignmentId(sessionId, exerciseId, index = 0) {
  const safeSessionId = String(sessionId || '').trim().replaceAll('/', '_');
  const safeExerciseId = String(exerciseId || `exercise-${index}`).trim().replaceAll('/', '_');
  return safeSessionId && safeExerciseId ? `session-${safeSessionId}-${safeExerciseId}` : '';
}

export function collectWorkoutProgramChanges(sessionExercises = []) {
  const changes = [];
  const seenAssignments = new Set();
  const seenAddedExercises = new Set();

  sessionExercises.forEach((entry) => {
    if (entry?.source === 'extra') {
      const exerciseId = String(entry.exerciseId || '').trim();
      if (exerciseId && !seenAddedExercises.has(exerciseId)) {
        seenAddedExercises.add(exerciseId);
        changes.push({ type: PROGRAM_CHANGE.ADD, exerciseId });
      }
      return;
    }

    const assignmentId = String(entry?.assignmentId || '').trim();
    if (!assignmentId || seenAssignments.has(assignmentId)) return;
    seenAssignments.add(assignmentId);
    if (entry.skipped === true) {
      changes.push({ type: PROGRAM_CHANGE.REMOVE, assignmentId, exerciseId: String(entry.exerciseId || '') });
      return;
    }
    const substitutedExerciseId = String(entry.substitutedExerciseId || '').trim();
    if (substitutedExerciseId && substitutedExerciseId !== String(entry.exerciseId || '').trim()) {
      changes.push({
        type: PROGRAM_CHANGE.REPLACE,
        assignmentId,
        exerciseId: String(entry.exerciseId || ''),
        replacementExerciseId: substitutedExerciseId,
      });
    }
  });

  return changes;
}

export function programChangeSummary(changes = [], exerciseName = (id) => id) {
  return changes.map((change) => {
    if (change.type === PROGRAM_CHANGE.REPLACE) {
      return `Đổi ${exerciseName(change.exerciseId)} → ${exerciseName(change.replacementExerciseId)}`;
    }
    if (change.type === PROGRAM_CHANGE.ADD) return `Thêm ${exerciseName(change.exerciseId)}`;
    if (change.type === PROGRAM_CHANGE.REMOVE) return `Bỏ ${exerciseName(change.exerciseId)}`;
    return '';
  }).filter(Boolean);
}

export function programChangeAssignmentIds(changes = []) {
  return [...new Set(changes
    .filter((change) => change.type === PROGRAM_CHANGE.REPLACE || change.type === PROGRAM_CHANGE.REMOVE)
    .map((change) => String(change.assignmentId || '').trim())
    .filter(Boolean))];
}

export function programChangeExerciseIds(changes = []) {
  return [...new Set(changes.flatMap((change) => [
    change.type === PROGRAM_CHANGE.ADD ? change.exerciseId : null,
    change.type === PROGRAM_CHANGE.REPLACE ? change.replacementExerciseId : null,
  ]).map((id) => String(id || '').trim()).filter(Boolean))];
}
