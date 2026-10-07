// ============================================================
// DAVID TRAINING PROGRAM — Progression Engine
// ============================================================
// Pure calculation module: no DOM, no Firebase. Every function takes
// plain data in and returns plain data out, so it can be exercised by
// engine-test-harness.html without a live database.
//
// Stage 6 exposes every SBS mechanism used by David Coaching. The engine stays
// pure: coach/client screens only collect inputs and render these results.
//
// Scheme numbering matches the source spreadsheet's own tab order:
//   1 Original Progression        (implemented)
//   2 Last-set RIR                (implemented)
//   3 Reps to failure             (implemented in Stage 5)
//   4 Classic overload            (implemented in Stage 5)
//   5 Fixed total reps            (implemented)
//   6 Reverse pyramid             (implemented)
//   7 Rep Increase                (implemented)
//   8 Set increase then rep increase (implemented)

export const SCHEME = Object.freeze({
  ORIGINAL_PROGRESSION: 1,
  LAST_SET_RIR: 2,
  REPS_TO_FAILURE: 3,
  CLASSIC_OVERLOAD: 4,
  FIXED_TOTAL_REPS: 5,
  REVERSE_PYRAMID: 6,
  REP_INCREASE: 7,
  SET_THEN_REP_INCREASE: 8,
});

export const PROGRESSION_MODE = Object.freeze({
  STANDARD: 'standard',
  REPS_SETS_ONLY: 'reps_sets_only',
});

export const SKILL_PROGRESSION_STEPS = Object.freeze([
  Object.freeze({ step: 1, key: 'technique', label: 'Kỹ thuật', nextHint: 'Tập ổn định hơn và tự đánh giá chất lượng rep.' }),
  Object.freeze({ step: 2, key: 'sets', label: 'Tăng set', nextHint: 'Hoàn thành thêm set với chất lượng tương đương.' }),
  Object.freeze({ step: 3, key: 'reps', label: 'Tăng rep', nextHint: 'Giữ kỹ thuật khi số rep tăng lên.' }),
  Object.freeze({ step: 4, key: 'weight', label: 'Tăng tạ', nextHint: 'Làm chủ mức tạ mới trước khi lặp chu kỳ.' }),
]);

export function progressionStepsForSchemeParams(schemeParams = {}) {
  return schemeParams.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY
    ? SKILL_PROGRESSION_STEPS.slice(0, 3)
    : SKILL_PROGRESSION_STEPS;
}

export function normalizeSkillProgressionStep(value, schemeParams = {}) {
  const steps = progressionStepsForSchemeParams(schemeParams);
  const step = Math.trunc(Number(value));
  return step >= 1 && step <= steps.length ? step : 1;
}

export function skillProgressionInfo(state = {}, schemeParams = {}) {
  const steps = progressionStepsForSchemeParams(schemeParams);
  const step = normalizeSkillProgressionStep(state.progressionStep, schemeParams);
  return {
    step,
    cycle: Math.max(0, Math.trunc(Number(state.progressionCycle) || 0)),
    totalSteps: steps.length,
    ...steps[step - 1],
  };
}

// ------------------------------------------------------------
// Shared utilities
// ------------------------------------------------------------

/** Round a weight to the nearest multiple of `increment` (e.g. 2.5). */
export function roundToIncrement(weight, increment) {
  if (!increment || increment <= 0) return weight;
  return Math.round(weight / increment) * increment;
}

function increasedWeight(priorWeight, percentage, increment) {
  const prior = Number(priorWeight) || 0;
  const step = Number(increment) || 0;
  const pctIncrease = prior * (Number(percentage) || 0) / 100;
  const actualIncrease = Math.max(pctIncrease, step);
  let next = roundToIncrement(prior + actualIncrease, step);
  if (step > 0 && next <= prior) next = prior + step;
  return next;
}

// %1RM -> expected reps, transcribed verbatim from "SBS Linear
// Progression__Quick Setup.txt" / "SBS Program Builder__Quick
// Setup.txt" (rows 23 / 47 of those sheets — identical table in both).
// Not used by the core scheme-2 recalculation loop (that only needs a
// fixed intensity% per exercise), but exposed as a coach-facing helper
// for estimating a Training Max from a top set (mirrors the templates'
// own "single @8" TM-testing convention).
export const PERCENT_TO_REPS_TABLE = Object.freeze([
  { pct: 50.0, reps: 20 }, { pct: 52.5, reps: 18 }, { pct: 55.0, reps: 16 },
  { pct: 57.5, reps: 15 }, { pct: 60.0, reps: 14 }, { pct: 62.5, reps: 13 },
  { pct: 65.0, reps: 12 }, { pct: 67.5, reps: 11 }, { pct: 70.0, reps: 10 },
  { pct: 72.5, reps: 9 },  { pct: 75.0, reps: 8 },  { pct: 77.5, reps: 7 },
  { pct: 80.0, reps: 6 },  { pct: 82.5, reps: 5 },  { pct: 85.0, reps: 4 },
  { pct: 87.5, reps: 3 },  { pct: 90.0, reps: 2 },  { pct: 92.5, reps: 2 },
  { pct: 95.0, reps: 1 },  { pct: 97.5, reps: 1 },  { pct: 100.0, reps: 1 },
]);

/**
 * Estimate a Training Max from a top test set, using the %1RM->reps
 * table above plus an RIR correction (each RIR of reps-in-reserve is
 * treated as worth roughly one more rep of headroom, matching the
 * templates' "single @8" ~= 2 RIR convention).
 */
export function estimateTrainingMaxFromTestSet({ weight, reps, rir = 0 }) {
  const effectiveReps = Math.max(1, Math.round(reps + rir));
  let best = PERCENT_TO_REPS_TABLE[PERCENT_TO_REPS_TABLE.length - 1];
  for (const row of PERCENT_TO_REPS_TABLE) {
    if (row.reps <= effectiveReps) { best = row; break; }
  }
  return weight / (best.pct / 100);
}

// ------------------------------------------------------------
// Scheme 1 — SBS Original Progression
// ------------------------------------------------------------
// Work sets continue at fixed reps until the configured RIR cut-off. Training
// Max changes from the number of completed sets versus the lower/upper band.

function scheme1Prescribe(schemeParams, state) {
  return {
    weight: roundToIncrement(Number(state.trainingMax) * (Number(schemeParams.intensityPct) / 100), schemeParams.roundingIncrement),
    sets: Number(schemeParams.upperSets),
    reps: Number(schemeParams.repsPerSet),
    stopRIR: Number(schemeParams.targetRIR),
    lowerSets: Number(schemeParams.lowerSets),
    upperSets: Number(schemeParams.upperSets),
  };
}

function scheme1Adjustment(schemeParams, completedSets) {
  const lower = Number(schemeParams.lowerSets);
  const upper = Number(schemeParams.upperSets);
  if (completedSets <= lower - 2) return { pctAdj: -5, key: 'Thấp hơn ngưỡng dưới từ 2 set' };
  if (completedSets === lower - 1) return { pctAdj: -2, key: 'Thấp hơn ngưỡng dưới 1 set' };
  if (completedSets <= upper) return { pctAdj: 0, key: 'Nằm trong khung set mục tiêu' };
  const above = completedSets - upper;
  if (above === 1) return { pctAdj: 1, key: 'Vượt ngưỡng trên 1 set' };
  if (above === 2) return { pctAdj: 2, key: 'Vượt ngưỡng trên 2 set' };
  if (above === 3) return { pctAdj: 3, key: 'Vượt ngưỡng trên 3 set' };
  return { pctAdj: 5, key: 'Vượt ngưỡng trên từ 4 set' };
}

function scheme1Advance(schemeParams, state, lastLog) {
  const completedSets = (lastLog.actualSets || []).length;
  const bucket = scheme1Adjustment(schemeParams, completedSets);
  const priorTrainingMax = Number(state.trainingMax) || 0;
  const newTrainingMax = priorTrainingMax * (1 + bucket.pctAdj / 100);
  return {
    nextState: {
      ...state,
      trainingMax: newTrainingMax,
      workingWeight: roundToIncrement(newTrainingMax * (Number(schemeParams.intensityPct) / 100), schemeParams.roundingIncrement),
      consecutiveMisses: bucket.pctAdj < 0 ? (Number(state.consecutiveMisses) || 0) + 1 : 0,
    },
    resultBucket: bucket.key,
    delta: { pctAdj: bucket.pctAdj, priorTrainingMax, newTrainingMax, completedSets },
  };
}

// ------------------------------------------------------------
// Scheme 2 — Last-set RIR autoregulation
// ------------------------------------------------------------
// schemeParams: { intensityPct, repsPerSet, plannedSets, targetRIR,
//                 roundingIncrement, isBodyweight }
// state: { trainingMax, workingWeight, consecutiveMisses, lastSessionId }

// Delta buckets transcribed verbatim from "SBS Linear Progression__Setup.txt"
// / "__Quick Setup.txt" (F3:M3 / I6:P6 — identical across every lift row).
// `key` matches the spreadsheet's own bucket labels for traceability.
const SCHEME2_BUCKETS = Object.freeze([
  { key: '2+ fewer sets completed', pctAdj: -5.0 },
  { key: '1 fewer set completed or last set below RIR target', pctAdj: -2.0 },
  { key: 'Set target completed; last at RIR target', pctAdj: 0.0 },
  { key: '1 above RIR target', pctAdj: 1.0 },
  { key: '2 above RIR target', pctAdj: 3.0 },
  { key: '3+ above RIR target', pctAdj: 5.0 }, // spreadsheet caps 3/4/5+ all at +5.00%
]);

function scheme2Prescribe(schemeParams, state) {
  const trainingMax = state.trainingMax;
  const weight = roundToIncrement(trainingMax * (schemeParams.intensityPct / 100), schemeParams.roundingIncrement);
  return {
    weight,
    sets: schemeParams.plannedSets,
    reps: schemeParams.repsPerSet,
    targetRIR: schemeParams.targetRIR,
  };
}

function scheme2Bucket(schemeParams, actualSets) {
  const plannedSets = schemeParams.plannedSets;
  const setsCompleted = actualSets.length;
  const setsShortfall = plannedSets - setsCompleted;

  if (setsShortfall >= 2) return SCHEME2_BUCKETS[0];
  if (setsCompleted === 0) return SCHEME2_BUCKETS[0]; // no sets at all -> treat as worst case

  const lastSetRIR = actualSets[actualSets.length - 1].rir;
  const rirDelta = lastSetRIR - schemeParams.targetRIR;

  if (setsShortfall === 1 || rirDelta < 0) return SCHEME2_BUCKETS[1];
  if (rirDelta === 0) return SCHEME2_BUCKETS[2];
  if (rirDelta === 1) return SCHEME2_BUCKETS[3];
  if (rirDelta === 2) return SCHEME2_BUCKETS[4];
  return SCHEME2_BUCKETS[5]; // rirDelta >= 3
}

function scheme2Advance(schemeParams, state, lastLog) {
  const bucket = scheme2Bucket(schemeParams, lastLog.actualSets);
  const priorTM = state.trainingMax;
  const nextTM = priorTM * (1 + bucket.pctAdj / 100);
  const nextState = {
    ...state,
    trainingMax: nextTM,
    workingWeight: roundToIncrement(nextTM * (schemeParams.intensityPct / 100), schemeParams.roundingIncrement),
    consecutiveMisses: bucket.pctAdj < 0 ? (state.consecutiveMisses || 0) + 1 : 0,
  };
  return {
    nextState,
    resultBucket: bucket.key,
    delta: { pctAdj: bucket.pctAdj, priorTrainingMax: priorTM, newTrainingMax: nextTM },
  };
}

// ------------------------------------------------------------
// Scheme 8 — Repeating four-step skill progression
// ------------------------------------------------------------
// schemeParams: { startingSets, endingSets, startingReps, endingReps,
//                 setIncreaseStep, repIncreaseStep, weightIncreasePct,
//                 roundingIncrement, isBodyweight, progressionMode? }
// state: { workingWeight, currentSets, currentReps, consecutiveMisses }
//
// The original set/rep/weight parameters still come from "SBS Novice
// hypertrophy program__Setup.txt". David Coaching now applies them as a
// repeating sequence: technique self-check -> add set -> add reps -> add
// weight -> return to technique at the new load. Exercises explicitly marked
// REPS_SETS_ONLY stop after the rep step and keep weight at zero so David can
// adjust bodyweight difficulty manually. Old states with no progressionStep
// safely start at technique without changing their numbers.

function scheme8Prescribe(schemeParams, state) {
  return {
    weight: state.workingWeight,
    sets: state.currentSets,
    reps: state.currentReps,
  };
}

function scheme8Advance(schemeParams, state, lastLog) {
  const targetReps = state.currentReps;
  const allSetsHitTarget = lastLog.actualSets.length >= state.currentSets &&
    lastLog.actualSets.every((s) => s.reps >= targetReps);
  const currentStep = normalizeSkillProgressionStep(state.progressionStep, schemeParams);
  const currentCycle = Math.max(0, Math.trunc(Number(state.progressionCycle) || 0));

  if (!allSetsHitTarget) {
    // Miss: hold at the same sets/reps/weight next time. Phase 1 does not
    // auto-deload — consecutiveMisses is a coach-visible hint only, per
    // the "reset, don't grind" guardrail from the Little Black Book.
    return {
      nextState: { ...state, consecutiveMisses: (state.consecutiveMisses || 0) + 1 },
      resultBucket: 'missed target reps',
      delta: { pctAdj: 0, action: 'hold' },
    };
  }

  let { currentSets, currentReps, workingWeight } = state;

  if (currentStep === 1 && lastLog.techniqueConfirmed !== true) {
    return {
      nextState: {
        ...state,
        progressionStep: 1,
        progressionCycle: currentCycle,
        consecutiveMisses: 0,
      },
      resultBucket: 'Đã hoàn thành bài — giữ nấc kỹ thuật để tự đánh giá lại',
      delta: { pctAdj: 0, action: 'technique_hold', progressionStepBefore: 1, progressionStepAfter: 1 },
    };
  }

  if (currentStep === 1) {
    currentSets = Math.min(schemeParams.endingSets, currentSets + schemeParams.setIncreaseStep);
    return {
      nextState: { ...state, currentSets, progressionStep: 2, progressionCycle: currentCycle, consecutiveMisses: 0 },
      resultBucket: 'Kỹ thuật đã tự đánh giá — lần sau tăng set',
      delta: { pctAdj: 0, action: 'advance_technique', newSets: currentSets, progressionStepBefore: 1, progressionStepAfter: 2 },
    };
  }

  if (currentStep === 2) {
    currentReps = Math.min(schemeParams.endingReps, currentReps + schemeParams.repIncreaseStep);
    return {
      nextState: { ...state, currentReps, progressionStep: 3, progressionCycle: currentCycle, consecutiveMisses: 0 },
      resultBucket: 'Đã làm chủ mức set mới — lần sau tăng rep',
      delta: { pctAdj: 0, action: 'advance_sets', newReps: currentReps, progressionStepBefore: 2, progressionStepAfter: 3 },
    };
  }

  if (currentStep === 3) {
    if (schemeParams.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY) {
      return {
        nextState: {
          ...state,
          workingWeight: 0,
          progressionStep: 1,
          progressionCycle: currentCycle + 1,
          consecutiveMisses: 0,
        },
        resultBucket: 'Đã giữ vững mức rep mới — hoàn thành một vòng tăng set/rep; David sẽ điều chỉnh độ khó khi cần',
        delta: {
          pctAdj: 0,
          action: 'complete_reps_sets_cycle',
          progressionStepBefore: 3,
          progressionStepAfter: 1,
          progressionCycle: currentCycle + 1,
        },
      };
    }
    const newWeight = roundToIncrement(
      workingWeight * (1 + (schemeParams.weightIncreasePct || 0) / 100),
      schemeParams.roundingIncrement
    );
    return {
      nextState: {
        ...state,
        workingWeight: newWeight,
        currentSets: schemeParams.startingSets,
        currentReps: schemeParams.startingReps,
        progressionStep: 4,
        progressionCycle: currentCycle,
        consecutiveMisses: 0,
      },
      resultBucket: 'Đã làm chủ mức rep mới — lần sau tăng tạ',
      delta: {
        pctAdj: schemeParams.weightIncreasePct || 0,
        action: 'advance_reps',
        newWeight,
        progressionStepBefore: 3,
        progressionStepAfter: 4,
      },
    };
  }

  return {
    nextState: {
      ...state,
      progressionStep: 1,
      progressionCycle: currentCycle + 1,
      consecutiveMisses: 0,
    },
    resultBucket: 'Đã làm chủ mức tạ mới — hoàn thành một vòng tiến bộ',
    delta: {
      pctAdj: 0,
      action: 'complete_cycle',
      progressionStepBefore: 4,
      progressionStepAfter: 1,
      progressionCycle: currentCycle + 1,
    },
  };
}

// ------------------------------------------------------------
// Scheme 3 — SBS Reps To Failure
// ------------------------------------------------------------
// The first sets use the normal rep target. The final set is a rep-out set.
// TM buckets match the source SBS RTF Quick Setup defaults exactly:
// -5, -2, 0, +0.5, +1, +1.5, +2, +3 percent.

const SCHEME3_BUCKETS = Object.freeze([
  { maxDelta: -2, key: 'Thấp hơn rep-out target từ 2 rep', pctAdj: -5.0 },
  { maxDelta: -1, key: 'Thấp hơn rep-out target 1 rep', pctAdj: -2.0 },
  { maxDelta: 0, key: 'Đạt rep-out target', pctAdj: 0.0 },
  { maxDelta: 1, key: 'Vượt rep-out target 1 rep', pctAdj: 0.5 },
  { maxDelta: 2, key: 'Vượt rep-out target 2 rep', pctAdj: 1.0 },
  { maxDelta: 3, key: 'Vượt rep-out target 3 rep', pctAdj: 1.5 },
  { maxDelta: 4, key: 'Vượt rep-out target 4 rep', pctAdj: 2.0 },
  { maxDelta: Infinity, key: 'Vượt rep-out target từ 5 rep', pctAdj: 3.0 },
]);

function scheme3Prescribe(schemeParams, state) {
  return {
    weight: roundToIncrement(state.trainingMax * (schemeParams.intensityPct / 100), schemeParams.roundingIncrement),
    sets: schemeParams.plannedSets,
    reps: schemeParams.repsPerSet,
    repOutTarget: schemeParams.repOutTarget,
  };
}

function scheme3Advance(schemeParams, state, lastLog) {
  const actualSets = lastLog.actualSets || [];
  const setShortfall = schemeParams.plannedSets - actualSets.length;
  let bucket;
  if (setShortfall >= 2 || !actualSets.length) bucket = SCHEME3_BUCKETS[0];
  else if (setShortfall === 1) bucket = SCHEME3_BUCKETS[1];
  else {
    const repDelta = Number(actualSets[actualSets.length - 1].reps) - Number(schemeParams.repOutTarget);
    bucket = SCHEME3_BUCKETS.find((candidate) => repDelta <= candidate.maxDelta) || SCHEME3_BUCKETS.at(-1);
  }
  const priorTM = state.trainingMax;
  const nextTM = priorTM * (1 + bucket.pctAdj / 100);
  return {
    nextState: {
      ...state,
      trainingMax: nextTM,
      workingWeight: roundToIncrement(nextTM * (schemeParams.intensityPct / 100), schemeParams.roundingIncrement),
      consecutiveMisses: bucket.pctAdj < 0 ? (state.consecutiveMisses || 0) + 1 : 0,
    },
    resultBucket: bucket.key,
    delta: { pctAdj: bucket.pctAdj, priorTrainingMax: priorTM, newTrainingMax: nextTM },
  };
}

// ------------------------------------------------------------
// Scheme 4 — SBS Classic Overload accessory progression
// ------------------------------------------------------------

function scheme4Prescribe(schemeParams, state) {
  return { weight: state.workingWeight, sets: schemeParams.plannedSets, reps: schemeParams.repsPerSet };
}

function scheme4Advance(schemeParams, state, lastLog) {
  const hit = lastLog.actualSets.length >= schemeParams.plannedSets
    && lastLog.actualSets.slice(0, schemeParams.plannedSets).every((set) => Number(set.reps) >= schemeParams.repsPerSet);
  if (!hit) {
    return {
      nextState: { ...state, consecutiveMisses: (state.consecutiveMisses || 0) + 1 },
      resultBucket: 'Chưa hoàn thành đủ set và rep — giữ nguyên tạ',
      delta: { pctAdj: 0, action: 'hold' },
    };
  }
  const priorWeight = Number(state.workingWeight) || 0;
  const nextWeight = increasedWeight(priorWeight, schemeParams.weightIncreasePct, schemeParams.roundingIncrement);
  return {
    nextState: { ...state, workingWeight: nextWeight, consecutiveMisses: 0 },
    resultBucket: 'Hoàn thành đủ set và rep — lần sau tăng tạ',
    delta: { pctAdj: priorWeight > 0 ? (nextWeight / priorWeight - 1) * 100 : 0, action: 'increase_weight', priorWeight, newWeight: nextWeight },
  };
}

// ------------------------------------------------------------
// Scheme 5 — SBS Fixed Total Reps
// ------------------------------------------------------------

function scheme5Prescribe(schemeParams, state) {
  const sets = Number(schemeParams.plannedSets);
  const totalRepsTarget = Number(schemeParams.totalRepsTarget);
  return {
    weight: Number(state.workingWeight) || 0,
    sets,
    reps: Math.ceil(totalRepsTarget / sets),
    totalRepsTarget,
  };
}

function scheme5Advance(schemeParams, state, lastLog) {
  const plannedSets = Number(schemeParams.plannedSets);
  const completed = (lastLog.actualSets || []).slice(0, plannedSets);
  const totalReps = completed.reduce((sum, set) => sum + Math.max(0, Number(set.reps) || 0), 0);
  const hit = completed.length >= plannedSets && totalReps >= Number(schemeParams.totalRepsTarget);
  if (!hit) {
    return {
      nextState: { ...state, consecutiveMisses: (Number(state.consecutiveMisses) || 0) + 1 },
      resultBucket: `Tổng ${totalReps}/${schemeParams.totalRepsTarget} rep — giữ nguyên tạ`,
      delta: { pctAdj: 0, action: 'hold', totalReps },
    };
  }
  const priorWeight = Number(state.workingWeight) || 0;
  const nextWeight = increasedWeight(priorWeight, schemeParams.weightIncreasePct, schemeParams.roundingIncrement);
  return {
    nextState: { ...state, workingWeight: nextWeight, consecutiveMisses: 0 },
    resultBucket: `Đạt ${totalReps}/${schemeParams.totalRepsTarget} rep — lần sau tăng tạ`,
    delta: {
      pctAdj: priorWeight > 0 ? (nextWeight / priorWeight - 1) * 100 : 0,
      action: 'increase_weight', priorWeight, newWeight: nextWeight, totalReps,
    },
  };
}

// ------------------------------------------------------------
// Scheme 6 — SBS Reverse Pyramid / set-by-set progression
// ------------------------------------------------------------

function scheme6Prescribe(schemeParams, state) {
  const targets = (schemeParams.setTargets || []).map(Number);
  const weights = Array.from({ length: targets.length }, (_, index) => Number(state.setWeights?.[index]) || 0);
  const setPrescriptions = targets.map((reps, index) => ({ setIndex: index + 1, weight: weights[index], reps }));
  return {
    weight: weights[0] || 0,
    sets: targets.length,
    reps: targets[0] || 0,
    setPrescriptions,
  };
}

function scheme6Advance(schemeParams, state, lastLog) {
  const targets = (schemeParams.setTargets || []).map(Number);
  const priorWeights = Array.from({ length: targets.length }, (_, index) => Number(state.setWeights?.[index]) || 0);
  const actualSets = lastLog.actualSets || [];
  const setResults = targets.map((target, index) => {
    const completed = actualSets[index];
    const hit = Boolean(completed) && Number(completed.reps) >= target;
    const priorWeight = priorWeights[index];
    const nextWeight = hit
      ? increasedWeight(priorWeight, schemeParams.weightIncreasePct, schemeParams.roundingIncrement)
      : priorWeight;
    return { setIndex: index + 1, target, actualReps: Number(completed?.reps) || 0, hit, priorWeight, nextWeight };
  });
  const increasedSets = setResults.filter((result) => result.hit).length;
  return {
    nextState: {
      ...state,
      setWeights: setResults.map((result) => result.nextWeight),
      workingWeight: setResults[0]?.nextWeight || 0,
      consecutiveMisses: increasedSets ? 0 : (Number(state.consecutiveMisses) || 0) + 1,
    },
    resultBucket: increasedSets
      ? `${increasedSets}/${targets.length} set đạt mục tiêu — chỉ tăng tạ ở set đã đạt`
      : 'Chưa set nào đạt rep mục tiêu — giữ nguyên từng mức tạ',
    delta: { pctAdj: increasedSets ? Number(schemeParams.weightIncreasePct) || 0 : 0, action: increasedSets ? 'increase_set_weights' : 'hold', setResults },
  };
}

// ------------------------------------------------------------
// Scheme 7 — SBS Rep Increase (bodyweight)
// ------------------------------------------------------------

function scheme7Prescribe(schemeParams, state) {
  return { weight: 0, sets: Number(state.currentSets), reps: Number(state.currentReps) };
}

function scheme7Advance(schemeParams, state, lastLog) {
  const currentSets = Number(state.currentSets);
  const currentReps = Number(state.currentReps);
  const completed = lastLog.actualSets || [];
  const hit = completed.length >= currentSets
    && completed.slice(0, currentSets).every((set) => Number(set.reps) >= currentReps);
  if (!hit) {
    return {
      nextState: { ...state, workingWeight: 0, consecutiveMisses: (Number(state.consecutiveMisses) || 0) + 1 },
      resultBucket: 'Chưa hoàn thành đủ set và rep — giữ nguyên',
      delta: { pctAdj: 0, action: 'hold' },
    };
  }
  const endingSets = Number(schemeParams.endingSets);
  if (currentSets < endingSets) {
    const nextSets = Math.min(endingSets, currentSets + 1);
    return {
      nextState: { ...state, workingWeight: 0, currentSets: nextSets, consecutiveMisses: 0 },
      resultBucket: `Hoàn thành mục tiêu — lần sau tăng lên ${nextSets} set`,
      delta: { pctAdj: 0, action: 'increase_sets', priorSets: currentSets, newSets: nextSets },
    };
  }
  const nextReps = currentReps + Number(schemeParams.repIncreaseStep);
  return {
    nextState: { ...state, workingWeight: 0, currentSets: Number(schemeParams.startingSets), currentReps: nextReps, consecutiveMisses: 0 },
    resultBucket: `Đạt đủ ${endingSets} set — lần sau tăng lên ${nextReps} rep và quay về ${schemeParams.startingSets} set`,
    delta: { pctAdj: 0, action: 'increase_reps', priorReps: currentReps, newReps: nextReps },
  };
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

/** The very first prescription for a brand-new assignment (no prior log yet). */
export function getInitialPrescription({ scheme, schemeParams, state }) {
  assertImplemented(scheme);
  if (scheme === SCHEME.ORIGINAL_PROGRESSION) return scheme1Prescribe(schemeParams, state);
  if (scheme === SCHEME.LAST_SET_RIR) return scheme2Prescribe(schemeParams, state);
  if (scheme === SCHEME.REPS_TO_FAILURE) return scheme3Prescribe(schemeParams, state);
  if (scheme === SCHEME.CLASSIC_OVERLOAD) return scheme4Prescribe(schemeParams, state);
  if (scheme === SCHEME.FIXED_TOTAL_REPS) return scheme5Prescribe(schemeParams, state);
  if (scheme === SCHEME.REVERSE_PYRAMID) return scheme6Prescribe(schemeParams, state);
  if (scheme === SCHEME.REP_INCREASE) return scheme7Prescribe(schemeParams, state);
  if (scheme === SCHEME.SET_THEN_REP_INCREASE) return scheme8Prescribe(schemeParams, state);
  throw new Error(`Unreachable: scheme ${scheme}`);
}

/**
 * Given a just-logged session's actual results for one exercise, compute
 * the next prescription. Returns { nextPrescription, nextState,
 * resultBucket, delta }. Pure — callers are responsible for persisting
 * `nextState` (see assets/js/training-data.js).
 */
export function calculateNextPrescription({ scheme, schemeParams, state, lastLog }) {
  assertImplemented(scheme);

  let advance;
  if (scheme === SCHEME.ORIGINAL_PROGRESSION) advance = scheme1Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.LAST_SET_RIR) advance = scheme2Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.REPS_TO_FAILURE) advance = scheme3Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.CLASSIC_OVERLOAD) advance = scheme4Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.FIXED_TOTAL_REPS) advance = scheme5Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.REVERSE_PYRAMID) advance = scheme6Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.REP_INCREASE) advance = scheme7Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.SET_THEN_REP_INCREASE) advance = scheme8Advance(schemeParams, state, lastLog);
  else throw new Error(`Unreachable: scheme ${scheme}`);

  const nextPrescription = scheme === SCHEME.ORIGINAL_PROGRESSION
    ? scheme1Prescribe(schemeParams, advance.nextState)
    : scheme === SCHEME.LAST_SET_RIR
      ? scheme2Prescribe(schemeParams, advance.nextState)
    : scheme === SCHEME.REPS_TO_FAILURE
      ? scheme3Prescribe(schemeParams, advance.nextState)
      : scheme === SCHEME.CLASSIC_OVERLOAD
        ? scheme4Prescribe(schemeParams, advance.nextState)
        : scheme === SCHEME.FIXED_TOTAL_REPS
          ? scheme5Prescribe(schemeParams, advance.nextState)
          : scheme === SCHEME.REVERSE_PYRAMID
            ? scheme6Prescribe(schemeParams, advance.nextState)
            : scheme === SCHEME.REP_INCREASE
              ? scheme7Prescribe(schemeParams, advance.nextState)
              : scheme8Prescribe(schemeParams, advance.nextState);

  return { ...advance, nextPrescription };
}

/**
 * Classifies a computed `delta` (from calculateNextPrescription) into
 * 'up' | 'hold' | 'down' for UI purposes — e.g. deciding whether to show
 * an encouraging "progress" treatment, a neutral "on track" treatment,
 * or a calm (non-punishing) "didn't hit it this time" treatment.
 * Pure, additive — does not affect the actual progression math above.
 */
export function classifyOutcome(scheme, delta) {
  if ([SCHEME.ORIGINAL_PROGRESSION, SCHEME.LAST_SET_RIR, SCHEME.REPS_TO_FAILURE, SCHEME.CLASSIC_OVERLOAD, SCHEME.FIXED_TOTAL_REPS].includes(scheme)) {
    if (delta.pctAdj > 0) return 'up';
    if (delta.pctAdj < 0) return 'down';
    return 'hold';
  }
  if (scheme === SCHEME.SET_THEN_REP_INCREASE) {
    if (delta.action === 'hold') return 'down';
    if (delta.action === 'technique_hold' || delta.action === 'readiness_hold' || delta.action === 'context_hold') return 'hold';
    return 'up';
  }
  if (scheme === SCHEME.REVERSE_PYRAMID || scheme === SCHEME.REP_INCREASE) {
    return delta.action === 'hold' ? 'down' : 'up';
  }
  return 'hold';
}

function assertImplemented(scheme) {
  if (!Object.values(SCHEME).includes(scheme)) {
    throw new Error(`Unknown scheme: ${scheme}`);
  }
}
