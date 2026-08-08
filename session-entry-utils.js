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
 *   assignmentId: string,
 *   substitutedExerciseId?: string | null,
 *   sets?: Array<{setIndex?: number, weight?: number|string, reps?: number|string,
 *     rir?: number|string, completed?: boolean}>
 * }>} exercises
 * @returns {Array<{assignmentId: string, substitutedExerciseId: string|null,
 *   actualSets: Array<{setIndex: number, weight: number, reps: number, rir: number}>}>}
 */
export function buildCompletedExerciseEntries(exercises = []) {
  return exercises.flatMap((exercise) => {
    const assignmentId = String(exercise?.assignmentId || '').trim();
    if (!assignmentId) return [];

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
      assignmentId,
      actualSets,
      substitutedExerciseId: exercise.substitutedExerciseId || null,
    }];
  });
}
