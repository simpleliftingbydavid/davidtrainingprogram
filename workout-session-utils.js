import { SCHEME, getInitialPrescription, calculateNextPrescription, classifyOutcome } from './progression-engine.js';

export const MIN_SESSION_SETS = 1;
export const MAX_SESSION_SETS = 10;
export const MIN_REST_SECONDS = 15;
export const MAX_REST_SECONDS = 900;
export const REST_OVERRUN_DELAY_MS = 30_000;
export const REST_REMINDER_VISIBLE_MS = 10_000;

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
    progressionStep: 1,
    progressionCycle: 0,
    consecutiveMisses: 0,
  };
}

/**
 * Existing extra-exercise records only need progression state updates. The rest time
 * selected by the student belongs to this session log and must not silently rewrite
 * the remembered exercise configuration.
 */
export function extraExerciseStateFields({ exists, exercise, scheme, baseSchemeParams, state }) {
  if (exists) return { state };
  return {
    exerciseId: exercise.exerciseId,
    exerciseNameSnapshot: { vi: exercise.nameVi },
    scheme,
    schemeParams: { ...baseSchemeParams },
    state,
  };
}

/**
 * Temporary set reductions are a readiness adjustment, not a performance miss.
 * Hold the stored progression state when the adjusted target is below the plan;
 * normal progression resumes as soon as the original target is met.
 */
export function advanceSessionExercise({ scheme, schemeParams, state, actualSets, adjustedSetCount, techniqueConfirmed = false }) {
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
    lastLog: { actualSets, techniqueConfirmed },
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

export function normalizeRestSeconds(value, fallback = 90) {
  const parsed = Math.trunc(Number(value));
  const safeFallback = Math.max(MIN_REST_SECONDS, Math.min(MAX_REST_SECONDS, Math.trunc(Number(fallback) || 90)));
  if (!Number.isFinite(parsed) || parsed <= 0) return safeFallback;
  return Math.max(MIN_REST_SECONDS, Math.min(MAX_REST_SECONDS, parsed));
}

export function restCycleState({ now, restDeadline, reminderSentAt = 0 }) {
  const current = Number(now) || 0;
  const deadline = Number(restDeadline) || 0;
  const sentAt = Number(reminderSentAt) || 0;
  if (!deadline) return { phase: 'idle', remainingSeconds: 0 };
  if (current < deadline) {
    return { phase: 'resting', remainingSeconds: Math.max(0, Math.ceil((deadline - current) / 1000)) };
  }
  const reminderAt = deadline + REST_OVERRUN_DELAY_MS;
  if (!sentAt && current < reminderAt) {
    return { phase: 'overrun', remainingSeconds: Math.max(0, Math.ceil((reminderAt - current) / 1000)) };
  }
  if (!sentAt) return { phase: 'remind', remainingSeconds: 0 };
  if (current < sentAt + REST_REMINDER_VISIBLE_MS) {
    return { phase: 'reminding', remainingSeconds: Math.ceil((sentAt + REST_REMINDER_VISIBLE_MS - current) / 1000) };
  }
  return { phase: 'complete', remainingSeconds: 0 };
}

export function adjustedRestDeadline({ restStartedAt, restDeadline, previousRestSeconds, nextRestSeconds, now = Date.now() }) {
  const current = Number(now) || Date.now();
  const previous = normalizeRestSeconds(previousRestSeconds, 90);
  const next = normalizeRestSeconds(nextRestSeconds, previous);
  const storedStart = Number(restStartedAt) || 0;
  const storedDeadline = Number(restDeadline) || 0;
  const inferredStart = storedDeadline ? storedDeadline - previous * 1000 : current;
  const startedAt = storedStart || inferredStart;
  return {
    restStartedAt: startedAt,
    restDeadline: startedAt + next * 1000,
    restSeconds: next,
    elapsedSeconds: Math.max(0, Math.floor((current - startedAt) / 1000)),
  };
}

export function nextRestSchedulerDelay({ now = Date.now(), restDeadlines = [], hidden = false }) {
  const current = Number(now) || Date.now();
  const deadlines = restDeadlines.map(Number).filter((deadline) => Number.isFinite(deadline) && deadline > 0);
  if (!deadlines.length) return null;
  if (!hidden) return 250;
  const futureDeadlines = deadlines.filter((deadline) => deadline > current);
  if (!futureDeadlines.length) return 250;
  const nextTransition = Math.min(...futureDeadlines);
  return Math.max(250, Math.min(60_000, nextTransition - current));
}

export function latestCompletedSetIndex(sets = []) {
  let latestIndex = -1;
  let latestOrder = -1;
  sets.forEach((set, index) => {
    if (!set?.completed) return;
    const order = Number(set.completedOrder) || index + 1;
    if (order >= latestOrder) {
      latestOrder = order;
      latestIndex = index;
    }
  });
  return latestIndex;
}

export function undoLatestCompletedSet(sets = [], stopRest = () => {}) {
  const index = latestCompletedSetIndex(sets);
  if (index < 0) return { index: -1, sets: [...sets] };
  stopRest();
  return {
    index,
    sets: sets.map((set, setIndex) => setIndex === index
      ? { ...set, completed: false, completedOrder: null }
      : { ...set }),
  };
}

export async function cancelWorkoutSession({
  day,
  clearDraft,
  stopSessionTimer,
  stopRestTimers,
  resetView,
  createSessionId,
}) {
  stopRestTimers();
  stopSessionTimer();
  const draftCleanup = day ? await clearDraft(day) : null;
  resetView();
  return {
    selectedDay: null,
    sessionStartTime: null,
    currentSessionId: createSessionId(),
    draftCleanup,
  };
}
