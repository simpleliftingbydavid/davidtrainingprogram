export const WORKOUT_DRAFT_VERSION = 4;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function assignedSessionExerciseId(assignmentId) {
  const id = String(assignmentId || '').trim();
  return id ? `assigned:${id}` : '';
}

export function extraSessionExerciseId(exerciseId, nonce = '') {
  const id = String(exerciseId || '').trim();
  const instance = String(nonce || '').trim();
  return id && instance ? `extra:${id}:${instance}` : '';
}

export function createExtraSessionExerciseId(exerciseId, createNonce = null) {
  const nonce = typeof createNonce === 'function'
    ? createNonce()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return extraSessionExerciseId(exerciseId, nonce);
}

export function normalizeWorkoutDraft(input) {
  if (!input || typeof input !== 'object') return null;
  const day = String(input.day || '').trim();
  const sessionId = String(input.sessionId || '').trim();
  if (!day || !sessionId) return null;

  return {
    version: WORKOUT_DRAFT_VERSION,
    day,
    performedDate: String(input.performedDate || ''),
    clientNote: String(input.clientNote || ''),
    sessionStartTime: finiteNumber(input.sessionStartTime, Date.now()),
    sessionId,
    exercises: Array.isArray(input.exercises) ? input.exercises.map((exercise, index) => {
      const source = exercise?.source === 'extra' ? 'extra' : 'assigned';
      const assignmentId = String(exercise?.assignmentId || '');
      const exerciseId = String(exercise?.exerciseId || '');
      const legacyInstanceId = source === 'extra'
        ? extraSessionExerciseId(exerciseId, `legacy-${index}`)
        : assignedSessionExerciseId(assignmentId);
      return {
        source,
        sessionExerciseId: String(exercise?.sessionExerciseId || legacyInstanceId),
        assignmentId,
        exerciseId,
        substitutedExerciseId: String(exercise?.substitutedExerciseId || ''),
        setCount: String(exercise?.setCount || ''),
        plannedSetCount: String(exercise?.plannedSetCount || ''),
        restStartedAt: String(exercise?.restStartedAt || ''),
        restDeadline: String(exercise?.restDeadline || ''),
        restLabel: String(exercise?.restLabel || ''),
        reminderSentAt: String(exercise?.reminderSentAt || ''),
        restEndNotified: exercise?.restEndNotified === true,
        restSeconds: String(exercise?.restSeconds || ''),
        skipped: exercise?.skipped === true,
        sets: Array.isArray(exercise?.sets) ? exercise.sets.map((set) => ({
          weight: String(set?.weight ?? ''),
          reps: String(set?.reps ?? ''),
          rir: String(set?.rir ?? ''),
          done: set?.done === true,
          completedOrder: String(set?.completedOrder || ''),
        })) : [],
        techniqueChecks: Array.isArray(exercise?.techniqueChecks)
          ? exercise.techniqueChecks.map(Boolean)
          : [],
      };
    }) : [],
    savedAt: finiteNumber(input.savedAt, 0),
    revision: Math.max(0, Math.trunc(finiteNumber(input.revision, 0))),
    deviceId: String(input.deviceId || ''),
  };
}

export function serializeWorkoutDraft(draft) {
  const normalized = normalizeWorkoutDraft(draft);
  return normalized ? JSON.stringify(normalized) : '';
}

export function parseWorkoutDraft(serialized) {
  try {
    return normalizeWorkoutDraft(typeof serialized === 'string' ? JSON.parse(serialized) : serialized);
  } catch (error) {
    return null;
  }
}

export function newestWorkoutDraft(drafts = []) {
  return drafts
    .map(normalizeWorkoutDraft)
    .filter(Boolean)
    .sort((a, b) => (b.savedAt - a.savedAt) || (b.revision - a.revision))[0] || null;
}

export function elapsedSecondsSince(startedAt, now = Date.now()) {
  const start = finiteNumber(startedAt, 0);
  const current = finiteNumber(now, 0);
  if (!start || current <= start) return 0;
  return Math.floor((current - start) / 1000);
}

export function shouldApplyRemoteDraft({ remoteDraft, localDraft, hasUnsyncedChanges = false }) {
  const remote = normalizeWorkoutDraft(remoteDraft);
  if (!remote || hasUnsyncedChanges) return false;
  const local = normalizeWorkoutDraft(localDraft);
  if (!local) return true;
  if (remote.sessionId !== local.sessionId) return remote.savedAt > local.savedAt;
  return remote.revision > local.revision && remote.savedAt >= local.savedAt;
}
