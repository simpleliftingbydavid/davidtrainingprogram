// Build the Firestore workout payload from the student's visible session state.
// Only sets explicitly marked as completed are loggable. Prefilled form values
// are prescriptions, not proof that the student performed the set.


import { t } from './i18n.js';
import { BUCKET_SKIPPED } from './result-bucket-text.js';
function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function integer(value) {
  return Math.trunc(finiteNumber(value));
}

export function createSessionSubmissionGate() {
  let active = false;
  return Object.freeze({
    tryStart() {
      if (active) return false;
      active = true;
      return true;
    },
    finish() { active = false; },
    isActive() { return active; },
  });
}

export function outcomesFromStoredSession(session = {}) {
  if (!Array.isArray(session.exerciseLogs)) return [];
  return session.exerciseLogs.map((log) => ({
    assignmentId: log.assignmentId || null,
    exerciseId: log.substitutedExerciseId || log.exerciseId || null,
    exerciseName: log.exerciseNameSnapshot?.vi || '',
    source: log.source || 'assigned',
    substitutedExerciseId: log.substitutedExerciseId || null,
    carriedProgression: log.carriedProgression === true,
    resultBucket: log.resultBucket || '',
    delta: log.delta || null,
    outcome: log.outcome || 'hold',
    nextPrescription: log.nextPrescription || null,
    originalNextPrescription: log.originalNextPrescription || null,
    progressionHeld: log.progressionHeld === true,
    isPR: log.isPR === true,
  }));
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
      sessionExerciseId: String(exercise.sessionExerciseId || '').trim() || null,
      assignmentId: assignmentId || null,
      source,
      scheme: Math.max(0, integer(exercise.scheme)),
      exerciseId: exerciseId || null,
      exerciseNameSnapshot: exercise.exerciseNameSnapshot || null,
      actualSets,
      substitutedExerciseId: exercise.substitutedExerciseId || null,
      stage5: exercise.stage5 && typeof exercise.stage5 === 'object' ? exercise.stage5 : {},
      plannedSetCount: Math.max(1, integer(exercise.plannedSetCount) || actualSets.length),
      adjustedSetCount: Math.max(1, integer(exercise.adjustedSetCount) || actualSets.length),
      restSeconds: Math.max(0, integer(exercise.restSeconds)),
      completionReason: String(exercise.completionReason || '').trim(),
      completionReasonNote: String(exercise.completionReasonNote || '').trim(),
    }];
  });
}

/**
 * Mirrors the identity used by the Firestore transaction. Assigned exercises keep
 * their assignment identity; added and substituted exercises use the exercise
 * actually performed so one progression state can never be advanced twice.
 */
export function sessionExerciseEntryKey(exercise = {}) {
  const source = exercise?.source === 'extra' ? 'extra' : 'assigned';
  const assignmentId = String(exercise?.assignmentId || '').trim();
  const exerciseId = String(exercise?.exerciseId || '').trim();
  const substitutedExerciseId = String(exercise?.substitutedExerciseId || '').trim();
  if (source === 'extra') return exerciseId ? `exercise:${exerciseId}` : '';
  if (substitutedExerciseId) return `exercise:${substitutedExerciseId}`;
  return assignmentId ? `assigned:${assignmentId}` : '';
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
      skipReason: String(exercise.completionReason || '').trim(),
      skipReasonNote: String(exercise.completionReasonNote || '').trim(),
    }];
  });
}

/** Build a history-only marker. Skipped exercises never change progression or volume. */
export function buildSkippedSessionLog(entry = {}) {
  return {
    assignmentId: entry.assignmentId,
    exerciseId: entry.exerciseId || null,
    exerciseNameSnapshot: entry.exerciseNameSnapshot || null,
    source: 'assigned',
    status: 'skipped',
    // Empty rather than a stand-in reason. 'readiness' was never one of the
    // reasons a client can pick, so it reached the coach's screen as
    // "Chưa ghi lý do" anyway — while looking, in stored data, like an answer
    // somebody actually gave.
    skipReason: entry.skipReason || '',
    skipReasonNote: entry.skipReasonNote || '',
    actualSets: [],
    outcome: 'skipped',
    progressionHeld: true,
    resultBucket: BUCKET_SKIPPED,
  };
}

/** Validate raw form values before converting empty fields to numbers. */
export function validateSessionExerciseInputs(exercises = []) {
  const issues = [];
  const assignmentIds = new Set();
  const extraIds = new Set();
  const completedEntryKeys = new Set();
  const completedExerciseIds = new Map();

  exercises.forEach((exercise, exerciseIndex) => {
    const label = exercise.exerciseNameSnapshot?.vi || t('entry.exerciseN', { n: exerciseIndex + 1 });
    const assignmentId = String(exercise.assignmentId || '').trim();
    const exerciseId = String(exercise.exerciseId || '').trim();

    if (exercise.source === 'extra') {
      if (!exerciseId) issues.push(`${label}: ${t('entry.missingExtraId')}`);
      if (extraIds.has(exerciseId)) issues.push(`${label}: ${t('entry.dupExtra')}`);
      extraIds.add(exerciseId);
    } else {
      if (!assignmentId) issues.push(`${label}: ${t('entry.missingAssignment')}`);
      if (assignmentIds.has(assignmentId)) issues.push(`${label}: ${t('entry.dupAssigned')}`);
      assignmentIds.add(assignmentId);
    }

    if (exercise.skipped === true) return;
    const singleWeightText = String(exercise.stage5Raw?.singleAt8?.weight ?? '').trim();
    const singleRpeText = String(exercise.stage5Raw?.singleAt8?.rpe ?? '').trim();
    if (singleWeightText || singleRpeText) {
      const singleWeight = Number(singleWeightText);
      const singleRpe = Number(singleRpeText);
      if (!singleWeightText || !Number.isFinite(singleWeight) || singleWeight <= 0) issues.push(`${label}: ${t('entry.singleWeight')}`);
      if (!singleRpeText || !Number.isFinite(singleRpe) || singleRpe < 1 || singleRpe > 10) issues.push(`${label}: ${t('entry.singleRpe')}`);
    }
    if (exercise.stage5Raw?.repOut?.performed === true) {
      const predicted = Number(exercise.stage5Raw.repOut.predictedRir);
      const extra = Number(exercise.stage5Raw.repOut.extraReps);
      if (String(exercise.stage5Raw.repOut.predictedRir ?? '').trim() === '' || !Number.isInteger(predicted) || predicted < 0 || predicted > 10) issues.push(`${label}: ${t('entry.predictedRir')}`);
      if (String(exercise.stage5Raw.repOut.extraReps ?? '').trim() === '' || !Number.isInteger(extra) || extra < 0 || extra > 20) issues.push(`${label}: ${t('entry.extraReps')}`);
    }
    const completedSets = (exercise.sets || []).filter((set) => set.completed === true);
    if (completedSets.length) {
      const entryKey = sessionExerciseEntryKey(exercise);
      const performedExerciseId = String(exercise.substitutedExerciseId || exercise.exerciseId || '').trim();
      const changesExerciseIdentity = exercise.source === 'extra' || Boolean(String(exercise.substitutedExerciseId || '').trim());
      if (entryKey && completedEntryKeys.has(entryKey)) {
        issues.push(`${label}: ${t('entry.dupOther')}`);
      }
      if (performedExerciseId && completedExerciseIds.has(performedExerciseId)
          && (changesExerciseIdentity || completedExerciseIds.get(performedExerciseId))) {
        issues.push(`${label}: ${t('entry.dupOther')}`);
      }
      if (entryKey) completedEntryKeys.add(entryKey);
      if (performedExerciseId) completedExerciseIds.set(
        performedExerciseId,
        changesExerciseIdentity || completedExerciseIds.get(performedExerciseId) === true,
      );
    }
    completedSets.forEach((set) => {
      const setLabel = t('entry.setLabel', { label, n: set.setIndex || 1 });
      const weightText = String(set.weight ?? '').trim();
      const repsText = String(set.reps ?? '').trim();
      const rirText = String(set.rir ?? '').trim();
      const weight = Number(weightText);
      const reps = Number(repsText);
      const rir = Number(rirText);
      if (!weightText || !Number.isFinite(weight) || weight < 0) issues.push(`${setLabel}: ${t('entry.badWeight')}`);
      if (!repsText || !Number.isInteger(reps) || reps <= 0) issues.push(`${setLabel}: ${t('entry.badReps')}`);
      if (!rirText || !Number.isInteger(rir) || rir < 0 || rir > 10) issues.push(`${setLabel}: ${t('entry.badRir')}`);
    });
  });

  return [...new Set(issues)];
}

export function sessionSaveErrorMessage(error) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  if (code.includes('invalid-argument') || message.includes('unsupported field value')) {
    return t('save.dataInvalid');
  }
  if (code.includes('permission-denied') || message.includes('insufficient permissions')) {
    return t('save.authPending');
  }
  if (code.includes('unavailable') || code.includes('deadline') || message.includes('network') || message.includes('offline')) {
    return t('save.offline');
  }
  if (code.includes('already-exists') || message.includes('đã được ghi nhận trước đó')) {
    return t('save.duplicate');
  }
  return t('save.generic');
}

/**
 * What a client typed into a set's box, as the number text the session stores: "12,5" and
 * " 12.5 " both read 12.5. Phones set to Vietnamese type a decimal comma, and a number box
 * on an iPhone threw the whole value away, so the boxes are plain text and this reads them.
 */
export function normalizeSetNumber(value) {
  return String(value ?? '').trim().replace(/\s+/g, '').replace(',', '.');
}

/** Which of a set's boxes cannot be saved, by class: the same rules validateSessionExerciseInputs applies. */
export function invalidSetFields({ weight, reps, rir } = {}) {
  const bad = [];
  const w = normalizeSetNumber(weight);
  const r = normalizeSetNumber(reps);
  const i = normalizeSetNumber(rir);
  if (!w || !Number.isFinite(Number(w)) || Number(w) < 0) bad.push('set-weight');
  if (!r || !Number.isInteger(Number(r)) || Number(r) <= 0) bad.push('set-reps');
  if (!i || !Number.isInteger(Number(i)) || Number(i) < 0 || Number(i) > 10) bad.push('set-rir');
  return bad;
}
