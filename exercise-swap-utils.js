import { PROGRESSION_MODE, SCHEME } from './progression-engine.js';

// When the coach swaps the exercise of an assignment, the new exercise keeps the old one's
// progression mechanism and settings instead of falling back to its own library defaults.
// Only the loads and the progress made so far belong to the old exercise, so those start
// again. Pure: no DOM, no Firebase.

/** Whether a mechanism makes sense for the exercise: Rep Increase is for bodyweight work only,
 *  the load-based ones (1-6) only for weighted work, and 8 (technique → sets → reps) for both. */
export function schemeFitsExercise(scheme, exercise) {
  const value = Number(scheme);
  if (value === SCHEME.SET_THEN_REP_INCREASE) return true;
  if (value === SCHEME.REP_INCREASE) return Boolean(exercise?.isBodyweight);
  return value >= SCHEME.ORIGINAL_PROGRESSION && value <= SCHEME.REVERSE_PYRAMID && !exercise?.isBodyweight;
}

/**
 * The assignment as the form should start from after switching to `exercise`: same mechanism
 * and settings, no state. Returns null when the old mechanism cannot be used for the new
 * exercise (a barbell exercise swapped for a bodyweight one, say), and the caller then uses
 * the new exercise's own defaults.
 */
export function carriedSchemeForSwap(assignment, exercise) {
  if (!assignment?.schemeParams || !exercise || !schemeFitsExercise(assignment.scheme, exercise)) return null;
  const scheme = Number(assignment.scheme);
  const params = { ...assignment.schemeParams, isBodyweight: Boolean(exercise.isBodyweight) };
  if (scheme === SCHEME.SET_THEN_REP_INCREASE) {
    const wasRepsSetsOnly = assignment.schemeParams.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY;
    const isRepsSetsOnly = exercise.defaultParams?.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY;
    delete params.progressionMode;
    if (isRepsSetsOnly) params.progressionMode = PROGRESSION_MODE.REPS_SETS_ONLY;
    // A bodyweight exercise has no load to raise (0%), so moving between bodyweight and loaded
    // work takes the new exercise's own load step rather than carrying a 0 across (or a % onto
    // an exercise that has no load).
    if (wasRepsSetsOnly !== isRepsSetsOnly) {
      params.weightIncreasePct = exercise.defaultParams?.weightIncreasePct ?? 0;
      params.roundingIncrement = exercise.defaultParams?.roundingIncrement ?? 0;
    }
  }
  return { ...assignment, scheme, schemeParams: params, state: null };
}
