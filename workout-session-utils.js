import {
  SCHEME, PROGRESSION_MODE, getInitialPrescription, calculateNextPrescription, classifyOutcome,
  skillProgressionInfo, vnIsoDay,
} from './progression-engine.js';

export const MIN_SESSION_SETS = 1;
export const MAX_SESSION_SETS = 10;
export const MIN_REST_SECONDS = 15;
export const MAX_REST_SECONDS = 900;
export const REST_OVERRUN_DELAY_MS = 30_000;
export const REST_REMINDER_VISIBLE_MS = 10_000;
export const TECHNIQUE_CHECK_COUNT = 5;

export function normalizeTechniqueChecks(checks, count = TECHNIQUE_CHECK_COUNT) {
  const size = Math.max(1, Math.trunc(Number(count) || TECHNIQUE_CHECK_COUNT));
  return Array.from({ length: size }, (_, index) => checks?.[index] === true);
}

/**
 * Return only the checklist belonging to the exercise's current progression
 * cycle. A completed older cycle remains in state as history but cannot make a
 * later technique step advance automatically.
 */
export function techniqueChecksForState(state = {}, count = TECHNIQUE_CHECK_COUNT) {
  const currentCycle = Math.max(0, Math.trunc(Number(state.progressionCycle) || 0));
  const stored = state.techniqueChecklist;
  if (!stored || Math.trunc(Number(stored.cycle)) !== currentCycle) {
    return normalizeTechniqueChecks([], count);
  }
  return normalizeTechniqueChecks(stored.checks, count);
}

function persistTechniqueChecks({ scheme, schemeParams, priorState, nextState, techniqueChecks }) {
  if (Number(scheme) !== SCHEME.SET_THEN_REP_INCREASE || !Array.isArray(techniqueChecks)) {
    return nextState;
  }
  const info = skillProgressionInfo(priorState, schemeParams);
  if (info.step !== 1) return nextState;
  return {
    ...nextState,
    techniqueChecklist: {
      cycle: info.cycle,
      checks: normalizeTechniqueChecks(techniqueChecks),
    },
  };
}

export function clampSessionSetCount(value, plannedSets, maxSets = MAX_SESSION_SETS) {
  const planned = Math.max(MIN_SESSION_SETS, Math.trunc(Number(plannedSets) || MIN_SESSION_SETS));
  const upper = Math.max(planned, Math.trunc(Number(maxSets) || MAX_SESSION_SETS));
  return Math.max(MIN_SESSION_SETS, Math.min(upper, Math.trunc(Number(value) || planned)));
}

export function createInitialExtraState(exercise, actualSets = []) {
  const firstWeight = Number(actualSets[0]?.weight) || 0;
  if ([SCHEME.ORIGINAL_PROGRESSION, SCHEME.LAST_SET_RIR, SCHEME.REPS_TO_FAILURE].includes(exercise.defaultScheme)) {
    const intensity = Number(exercise.defaultParams.intensityPct) || 100;
    return {
      trainingMax: firstWeight > 0 ? firstWeight / (intensity / 100) : 0,
      workingWeight: firstWeight,
      consecutiveMisses: 0,
    };
  }
  if (exercise.defaultScheme === SCHEME.CLASSIC_OVERLOAD) return {
    workingWeight: firstWeight,
    consecutiveMisses: 0,
  };
  if (exercise.defaultScheme === SCHEME.FIXED_TOTAL_REPS) return {
    workingWeight: firstWeight,
    consecutiveMisses: 0,
  };
  if (exercise.defaultScheme === SCHEME.REVERSE_PYRAMID) {
    const count = Math.max(1, exercise.defaultParams.setTargets?.length || 3);
    return {
      setWeights: Array.from({ length: count }, (_, index) => Number(actualSets[index]?.weight) || firstWeight),
      workingWeight: firstWeight,
      consecutiveMisses: 0,
    };
  }
  if (exercise.defaultScheme === SCHEME.REP_INCREASE) return {
    workingWeight: 0,
    currentSets: exercise.defaultParams.startingSets,
    currentReps: exercise.defaultParams.startingReps,
    consecutiveMisses: 0,
  };
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

// ---- Số tạ đã tập là mốc của buổi sau (David, 2026-11-12) ----
// Học viên tập khác số giáo án (nặng hơn hay nhẹ hơn): progression tính tiếp từ số đã tập, không
// từ số giáo án. Số lệch quá xa giáo án (dưới 1/2 hoặc trên 1,5 lần) coi như gõ nhầm và bỏ qua.
export const LOAD_REBASE_MIN_RATIO = 0.5;
export const LOAD_REBASE_MAX_RATIO = 1.5;
const TM_SCHEMES = [SCHEME.ORIGINAL_PROGRESSION, SCHEME.LAST_SET_RIR, SCHEME.REPS_TO_FAILURE];
const round3 = (value) => Math.round(value * 1000) / 1000;

/** Mức tạ học viên đã tập: mức có nhiều set nhất, bằng nhau thì lấy mức của set sau cùng. */
export function performedWorkingWeight(actualSets = []) {
  const weights = (Array.isArray(actualSets) ? actualSets : [])
    .map((set) => Number(set?.weight))
    .filter((weight) => Number.isFinite(weight) && weight > 0);
  if (!weights.length) return null;
  const counts = new Map();
  weights.forEach((weight) => counts.set(weight, (counts.get(weight) || 0) + 1));
  const top = Math.max(...counts.values());
  return [...weights].reverse().find((weight) => counts.get(weight) === top);
}

function plausibleLoad(actual, planned) {
  if (!(actual > 0)) return false;
  if (!(planned > 0)) return true;
  const ratio = actual / planned;
  return ratio >= LOAD_REBASE_MIN_RATIO && ratio <= LOAD_REBASE_MAX_RATIO;
}

/**
 * Đưa state về số tạ đã tập trước khi tính buổi sau.
 * @returns { state, rebase } — rebase = null khi không đổi, không thì { from, to } (số, hoặc
 *   mảng theo set với kim tự tháp ngược).
 */
export function rebaseLoadToActual({ scheme, schemeParams = {}, state = {}, actualSets = [], today = null }) {
  const unchanged = { state, rebase: null };
  const kind = Number(scheme);
  if (kind === SCHEME.REP_INCREASE || schemeParams.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY) return unchanged;
  if (schemeParams.isBodyweight === true && kind === SCHEME.DOUBLE_PROGRESSION) return unchanged;
  const sets = Array.isArray(actualSets) ? actualSets : [];
  if (!sets.length) return unchanged;
  let planned;
  try { planned = getInitialPrescription({ scheme: kind, schemeParams, state, today }); } catch { return unchanged; }

  if (kind === SCHEME.REVERSE_PYRAMID) {
    const prescribed = (planned.setPrescriptions || []).map((set) => Number(set.weight) || 0);
    if (!prescribed.length) return unchanged;
    const next = prescribed.map((weight, index) => {
      const actual = Number(sets[index]?.weight);
      return plausibleLoad(actual, weight) ? actual : weight;
    });
    if (next.every((weight, index) => weight === prescribed[index])) return unchanged;
    const setWeights = [...(state.setWeights || prescribed)];
    next.forEach((weight, index) => { setWeights[index] = weight; });
    return { state: { ...state, setWeights, workingWeight: setWeights[0] || 0 }, rebase: { from: prescribed, to: next } };
  }

  const actual = performedWorkingWeight(sets);
  const plannedWeight = Number(planned.weight) || 0;
  if (actual === null || actual === plannedWeight || !plausibleLoad(actual, plannedWeight)) return unchanged;
  const rebase = { from: plannedWeight, to: actual };

  if (TM_SCHEMES.includes(kind)) {
    const intensity = Number(schemeParams.intensityPct) || 100;
    return { state: { ...state, trainingMax: round3(actual / (intensity / 100)), workingWeight: actual }, rebase };
  }
  if (kind === SCHEME.APRE) {
    // Mức chờ của tuần trước đã tới hạn thì chính nó là mức hôm nay: đổi nó, để tuần này dùng chung số mới.
    const day = vnIsoDay(today);
    const pendingLive = Number(state.pendingWeight) > 0 && state.pendingFrom && day >= state.pendingFrom;
    return { state: pendingLive ? { ...state, pendingWeight: actual } : { ...state, workingWeight: actual }, rebase };
  }
  return { state: { ...state, workingWeight: actual }, rebase };
}

/**
 * Temporary set reductions are a readiness adjustment, not a performance miss.
 * Hold the stored progression state when the adjusted target is below the plan;
 * normal progression resumes as soon as the original target is met.
 */
export function advanceSessionExercise({
  scheme, schemeParams, state: plannedState, actualSets, adjustedSetCount, techniqueConfirmed = false,
  techniqueChecks, forceHold = false, holdReason = '',
}) {
  // Buổi bị giữ progression (đau, chờ David xem…) thì giữ nguyên mốc; còn lại tính từ số đã tập.
  const { state, rebase } = forceHold
    ? { state: plannedState, rebase: null }
    : rebaseLoadToActual({ scheme, schemeParams, state: plannedState, actualSets });
  const withRebase = (delta) => (rebase ? { ...delta, loadRebase: rebase } : delta);
  const planned = getInitialPrescription({ scheme, schemeParams, state });
  const adjusted = clampSessionSetCount(adjustedSetCount, planned.sets);
  const withTechniqueChecks = (nextState) => persistTechniqueChecks({
    scheme, schemeParams, priorState: plannedState, nextState, techniqueChecks,
  });
  if (forceHold) {
    return {
      nextState: withTechniqueChecks({ ...plannedState }),
      nextPrescription: planned,
      resultBucket: holdReason || 'Giữ nguyên tiến độ theo bối cảnh buổi tập',
      delta: { pctAdj: 0, action: 'context_hold' },
      outcome: 'hold',
      progressionHeld: true,
      plannedSetCount: planned.sets,
      adjustedSetCount: adjusted,
    };
  }
  if (scheme !== SCHEME.ORIGINAL_PROGRESSION && adjusted < planned.sets && actualSets.length >= adjusted) {
    return {
      nextState: withTechniqueChecks({ ...state }),
      nextPrescription: planned,
      resultBucket: 'Giảm set theo thể trạng — giữ nguyên tiến độ',
      delta: withRebase({ pctAdj: 0, action: 'readiness_hold' }),
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
    delta: withRebase(advanced.delta),
    nextState: withTechniqueChecks(advanced.nextState),
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

/** Một dòng cho màn hình kết quả: buổi sau tính từ số tạ đã tập. */
export function loadRebaseText(rebase, per = '') {
  if (!rebase) return '';
  const kgText = (value) => `${String(Math.round(Number(value) * 100) / 100).replace('.', ',')} kg${per}`;
  if (Array.isArray(rebase.to)) {
    const changed = rebase.to.map((weight, index) => (weight !== rebase.from?.[index] ? index + 1 : 0)).filter(Boolean);
    return `Bạn tập khác giáo án ở set ${changed.join(', ')}, nên buổi sau tính từ số tạ bạn đã tập.`;
  }
  if (!(Number(rebase.from) > 0)) return `Buổi sau tính từ ${kgText(rebase.to)} bạn đã tập.`;
  return `Bạn tập ${kgText(rebase.to)} thay vì ${kgText(rebase.from)}, nên buổi sau tính từ ${kgText(rebase.to)}.`;
}
