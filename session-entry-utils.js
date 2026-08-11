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

/**
 * @param {Array<{
 *   assignmentId?: string,
 *   source?: 'assigned'|'extra',
 *   exerciseId?: string,
 *   substitutedExerciseId?: string | null,
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
      assignmentId: assignmentId || null,
      source,
      exerciseId: exerciseId || null,
      actualSets,
      substitutedExerciseId: exercise.substitutedExerciseId || null,
      plannedSetCount: Math.max(1, integer(exercise.plannedSetCount) || actualSets.length),
      adjustedSetCount: Math.max(1, integer(exercise.adjustedSetCount) || actualSets.length),
      restSeconds: Math.max(0, integer(exercise.restSeconds)),
    }];
  });
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
      skipReason: 'readiness',
    }];
  });
}
