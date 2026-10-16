import { PROGRESSION_MODE, SCHEME, progressionStepsForSchemeParams } from './progression-engine.js';

// When the exercise of an assignment is swapped, the new exercise keeps the old one's
// progression mechanism and settings instead of falling back to its own library defaults.
// The coach's form starts the progress again (carriedSchemeForSwap). A client who swaps
// during a session carries on at the old exercise's level, sets and reps included, and
// enters the weight themselves (substituteProgression). Pure: no DOM, no Firebase.

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

const TRAINING_MAX_SCHEMES = [SCHEME.ORIGINAL_PROGRESSION, SCHEME.LAST_SET_RIR, SCHEME.REPS_TO_FAILURE];

function positiveOr(value, fallback) {
  const number = Number(value);
  return number > 0 ? number : (Number(fallback) || 0);
}

/** Where the old exercise had got to, without its loads: sets, reps and the step of the
 *  set/rep mechanisms carry over, every weight is left for the client to choose. */
function carriedLevel(scheme, schemeParams, oldState) {
  const old = oldState || {};
  if (scheme === SCHEME.REP_INCREASE) {
    return {
      workingWeight: 0,
      currentSets: positiveOr(old.currentSets, schemeParams.startingSets),
      currentReps: positiveOr(old.currentReps, schemeParams.startingReps),
      consecutiveMisses: 0,
    };
  }
  if (scheme === SCHEME.SET_THEN_REP_INCREASE) {
    const stepCount = progressionStepsForSchemeParams(schemeParams).length;
    const step = Math.max(1, Math.trunc(Number(old.progressionStep)) || 1);
    const cycle = Math.max(0, Math.trunc(Number(old.progressionCycle)) || 0);
    // "Tăng tạ" has no place on sets-and-reps-only work: what comes after it is a new round.
    const pastLastStep = step > stepCount;
    return {
      workingWeight: 0,
      currentSets: positiveOr(old.currentSets, schemeParams.startingSets),
      currentReps: positiveOr(old.currentReps, schemeParams.startingReps),
      progressionStep: pastLastStep ? 1 : step,
      progressionCycle: pastLastStep ? cycle + 1 : cycle,
      consecutiveMisses: 0,
    };
  }
  if (scheme === SCHEME.REVERSE_PYRAMID) {
    return { setWeights: (schemeParams.setTargets || []).map(() => 0), workingWeight: 0, consecutiveMisses: 0 };
  }
  if (TRAINING_MAX_SCHEMES.includes(scheme)) return { trainingMax: 0, workingWeight: 0, consecutiveMisses: 0 };
  return { workingWeight: 0, consecutiveMisses: 0 };
}

/**
 * What a substitute follows when the client swaps the exercise of an assignment during a
 * session, and what the assignment carries on with if the client keeps the swap: the old
 * mechanism and settings, at the old exercise's level, with no weight yet (the old
 * exercise's loads mean nothing on another exercise). Null when the old mechanism does not
 * suit the new exercise, and the substitute then follows its own progression as before.
 */
export function substituteProgression(assignment, exercise) {
  const carried = carriedSchemeForSwap(assignment, exercise);
  if (!carried) return null;
  return {
    scheme: carried.scheme,
    schemeParams: carried.schemeParams,
    state: carriedLevel(carried.scheme, carried.schemeParams, assignment.state),
  };
}

/** The weights the client chose for a substitute become its load: the first weighted set
 *  sets the Training Max or working weight, and each set its own weight on a reverse pyramid. */
export function seedSubstituteLoad({ scheme, schemeParams = {}, state = {} }, actualSets = []) {
  const weights = (Array.isArray(actualSets) ? actualSets : []).map((set) => Math.max(0, Number(set?.weight) || 0));
  const first = weights.find((weight) => weight > 0) || 0;
  const next = { ...state };
  if (scheme === SCHEME.REP_INCREASE || schemeParams.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY) return next;
  if (TRAINING_MAX_SCHEMES.includes(scheme)) {
    const intensity = Number(schemeParams.intensityPct) || 100;
    next.trainingMax = first / (intensity / 100);
    next.workingWeight = first;
  } else if (scheme === SCHEME.REVERSE_PYRAMID) {
    next.setWeights = (state.setWeights || []).map((_, index) => weights[index] || first);
    next.workingWeight = next.setWeights[0] || 0;
  } else {
    next.workingWeight = first;
  }
  return next;
}
