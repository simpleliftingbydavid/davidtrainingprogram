// ============================================================
// DAVID TRAINING PROGRAM — Progression Engine
// ============================================================
// Pure calculation module: no DOM, no Firebase. Every function takes
// plain data in and returns plain data out, so it can be exercised by
// engine-test-harness.html without a live database.
//
// Phase 1 implements exactly 2 of the 8 progression schemes found in the
// source "SBS Program Builder" spreadsheet — the two that power the two
// fully-realized program templates ("SBS Linear Progression" = scheme 2,
// "SBS Novice hypertrophy program" = scheme 8). The remaining 6 schemes
// are named and stubbed so the shape is ready for Phase 2.
//
// Scheme numbering matches the source spreadsheet's own tab order:
//   1 Original Progression        (not implemented — Phase 2)
//   2 Last-set RIR                (implemented)
//   3 Reps to failure             (not implemented — Phase 2)
//   4 Classic overload            (not implemented — Phase 2)
//   5 Fixed number of reps        (not implemented — Phase 2)
//   6 Reverse pyramid             (not implemented — Phase 2)
//   7 Rep Increase                (not implemented — Phase 2)
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

const NOT_IMPLEMENTED_SCHEMES = new Set([1, 3, 4, 5, 6, 7]);

// ------------------------------------------------------------
// Shared utilities
// ------------------------------------------------------------

/** Round a weight to the nearest multiple of `increment` (e.g. 2.5). */
export function roundToIncrement(weight, increment) {
  if (!increment || increment <= 0) return weight;
  return Math.round(weight / increment) * increment;
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
// Scheme 8 — Set increase then rep increase (double progression)
// ------------------------------------------------------------
// schemeParams: { startingSets, endingSets, startingReps, endingReps,
//                 setIncreaseStep, repIncreaseStep, weightIncreasePct,
//                 roundingIncrement, isBodyweight }
// state: { workingWeight, currentSets, currentReps, consecutiveMisses }
//
// Defaults transcribed from "SBS Novice hypertrophy program__Setup.txt"
// (startingSets 3, endingSets 5, startingReps 8, endingReps 12,
// repIncreaseStep 2, setIncreaseStep 1, weightIncreasePct 10).

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

  if (currentSets < schemeParams.endingSets) {
    currentSets = Math.min(schemeParams.endingSets, currentSets + schemeParams.setIncreaseStep);
    return {
      nextState: { ...state, currentSets, consecutiveMisses: 0 },
      resultBucket: 'hit target — adding a set',
      delta: { pctAdj: 0, action: 'add_set', newSets: currentSets },
    };
  }

  if (currentReps < schemeParams.endingReps) {
    currentReps = Math.min(schemeParams.endingReps, currentReps + schemeParams.repIncreaseStep);
    return {
      nextState: { ...state, currentReps, consecutiveMisses: 0 },
      resultBucket: 'hit target — adding reps',
      delta: { pctAdj: 0, action: 'add_reps', newReps: currentReps },
    };
  }

  // Topped out both ranges: jump weight (scheme 8 only — scheme 7 has no
  // weight step, see NOT_IMPLEMENTED note) and reset to the bottom.
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
      consecutiveMisses: 0,
    },
    resultBucket: 'hit target — cycle complete, weight increased',
    delta: { pctAdj: schemeParams.weightIncreasePct || 0, action: 'increase_weight', newWeight },
  };
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

/** The very first prescription for a brand-new assignment (no prior log yet). */
export function getInitialPrescription({ scheme, schemeParams, state }) {
  assertImplemented(scheme);
  if (scheme === SCHEME.LAST_SET_RIR) return scheme2Prescribe(schemeParams, state);
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
  if (scheme === SCHEME.LAST_SET_RIR) advance = scheme2Advance(schemeParams, state, lastLog);
  else if (scheme === SCHEME.SET_THEN_REP_INCREASE) advance = scheme8Advance(schemeParams, state, lastLog);
  else throw new Error(`Unreachable: scheme ${scheme}`);

  const nextPrescription = scheme === SCHEME.LAST_SET_RIR
    ? scheme2Prescribe(schemeParams, advance.nextState)
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
  if (scheme === SCHEME.LAST_SET_RIR) {
    if (delta.pctAdj > 0) return 'up';
    if (delta.pctAdj < 0) return 'down';
    return 'hold';
  }
  if (scheme === SCHEME.SET_THEN_REP_INCREASE) {
    return delta.action === 'hold' ? 'down' : 'up';
  }
  return 'hold';
}

function assertImplemented(scheme) {
  if (NOT_IMPLEMENTED_SCHEMES.has(scheme)) {
    throw new Error(
      `Scheme ${scheme} is not implemented in Phase 1 (only schemes 2 and 8 are). ` +
      `See assets/js/progression-engine.js header comment.`
    );
  }
  if (scheme !== SCHEME.LAST_SET_RIR && scheme !== SCHEME.SET_THEN_REP_INCREASE) {
    throw new Error(`Unknown scheme: ${scheme}`);
  }
}
