import { SCHEME, getInitialPrescription, calculateNextPrescription, classifyOutcome } from './progression-engine.js';

export const MIN_SESSION_SETS = 1;
export const MAX_SESSION_SETS = 10;

export function clampSessionSetCount(value, plannedSets, maxSets = MAX_SESSION_SETS) {
  const planned = Math.max(MIN_SESSION_SETS, Math.trunc(Number(plannedSets) || MIN_SESSION_SETS));
  const upper = Math.max(planned, Math.trunc(Number(maxSets) || MAX_SESSION_SETS));
  return Math.max(MIN_SESSION_SETS, Math.min(upper, Math.trunc(Number(value) || planned)));
}

export function createInitialExtraState(exercise, actualSets = []) {
  const firstWeight = Number(actualSets[0]?.weight) || 0;
  if (exercise.defaultScheme === SCHEME.LAST_SET_RIR) {
    const intensity = Number(exercise.defaultParams.intensityPct) || 100;
    return {
      trainingMax: firstWeight > 0 ? firstWeight / (intensity / 100) : 0,
      workingWeight: firstWeight,
      consecutiveMisses: 0,
    };
  }
  return {
    workingWeight: firstWeight,
    currentSets: exercise.defaultParams.startingSets,
    currentReps: exercise.defaultParams.startingReps,
    consecutiveMisses: 0,
  };
}

/**
 * Temporary set reductions are a readiness adjustment, not a performance miss.
 * Hold the stored progression state when the adjusted target is below the plan;
 * normal progression resumes as soon as the original target is met.
 */
export function advanceSessionExercise({ scheme, schemeParams, state, actualSets, adjustedSetCount }) {
  const planned = getInitialPrescription({ scheme, schemeParams, state });
  const adjusted = clampSessionSetCount(adjustedSetCount, planned.sets);
  if (adjusted < planned.sets && actualSets.length >= adjusted) {
    return {
      nextState: { ...state },
      nextPrescription: planned,
      resultBucket: 'Giảm set theo thể trạng — giữ nguyên tiến độ',
      delta: scheme === SCHEME.LAST_SET_RIR
        ? { pctAdj: 0, action: 'readiness_hold' }
        : { pctAdj: 0, action: 'readiness_hold' },
      outcome: 'hold',
      progressionHeld: true,
      plannedSetCount: planned.sets,
      adjustedSetCount: adjusted,
    };
  }

  const advanced = calculateNextPrescription({
    scheme,
    schemeParams,
    state,
    lastLog: { actualSets },
  });
  return {
    ...advanced,
    outcome: classifyOutcome(scheme, advanced.delta),
    progressionHeld: false,
    plannedSetCount: planned.sets,
    adjustedSetCount: adjusted,
  };
}

export function isDuplicateSessionExercise(exerciseId, activeExerciseIds = []) {
  const target = String(exerciseId || '').trim();
  return !target || activeExerciseIds.some((id) => String(id || '').trim() === target);
}
