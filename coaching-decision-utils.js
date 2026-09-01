export const COMPLETION_REASON = Object.freeze({
  TIME: 'time',
  EQUIPMENT: 'equipment',
  PAIN: 'pain',
  TECHNIQUE: 'technique',
  FATIGUE: 'fatigue',
  OTHER: 'other',
});

export const COMPLETION_REASON_OPTIONS = Object.freeze([
  { value: COMPLETION_REASON.TIME, label: 'Không đủ thời gian' },
  { value: COMPLETION_REASON.EQUIPMENT, label: 'Không có thiết bị phù hợp' },
  { value: COMPLETION_REASON.PAIN, label: 'Đau hoặc khó chịu' },
  { value: COMPLETION_REASON.TECHNIQUE, label: 'Kỹ thuật không ổn' },
  { value: COMPLETION_REASON.FATIGUE, label: 'Mệt hoặc thể trạng kém' },
  { value: COMPLETION_REASON.OTHER, label: 'Lý do khác' },
]);

const VALID_REASON_VALUES = new Set(COMPLETION_REASON_OPTIONS.map((item) => item.value));
const NON_PERFORMANCE_REASONS = new Set([
  COMPLETION_REASON.TIME,
  COMPLETION_REASON.EQUIPMENT,
  COMPLETION_REASON.PAIN,
  COMPLETION_REASON.OTHER,
]);

export function normalizeCompletionReason(reason, note = '') {
  const value = String(reason || '').trim();
  const safeReason = VALID_REASON_VALUES.has(value) ? value : '';
  const safeNote = String(note || '').trim().slice(0, 500);
  return {
    reason: safeReason,
    note: safeNote,
    valid: Boolean(safeReason) && (safeReason !== COMPLETION_REASON.OTHER || Boolean(safeNote)),
  };
}

export function completionReasonLabel(reason) {
  return COMPLETION_REASON_OPTIONS.find((item) => item.value === reason)?.label || 'Chưa ghi lý do';
}

export function shouldHoldProgressionForReason(reason) {
  return NON_PERFORMANCE_REASONS.has(String(reason || '').trim());
}

export function createsPainAlert(reason) {
  return String(reason || '').trim() === COMPLETION_REASON.PAIN;
}

export function requiresExerciseCompletionReason(exercise = {}) {
  if (exercise?.source === 'extra') return false;
  if (exercise?.skipped === true) return true;
  const planned = Math.max(1, Math.trunc(Number(exercise?.plannedSetCount) || 1));
  const adjusted = Math.max(1, Math.trunc(Number(exercise?.adjustedSetCount) || planned));
  return adjusted < planned;
}

export function incompleteAssignedExercises(exercises = []) {
  return (exercises || []).filter((exercise) => {
    if (exercise?.source === 'extra' || exercise?.skipped === true) return false;
    const target = Math.max(1, Math.trunc(Number(exercise?.adjustedSetCount) || Number(exercise?.plannedSetCount) || 1));
    const completed = (exercise?.sets || []).filter((set) => set?.completed === true).length;
    return completed < target;
  });
}

export function progressionChangeDiff(before = {}, after = {}) {
  const fields = [
    ['trainingMax', before?.state?.trainingMax, after?.state?.trainingMax],
    ['workingWeight', before?.state?.workingWeight, after?.state?.workingWeight],
    ['currentSets', before?.state?.currentSets, after?.state?.currentSets],
    ['currentReps', before?.state?.currentReps, after?.state?.currentReps],
    ['progressionStep', before?.state?.progressionStep, after?.state?.progressionStep],
    ['scheme', before?.scheme, after?.scheme],
    ['plannedSets', before?.schemeParams?.plannedSets, after?.schemeParams?.plannedSets],
    ['repsPerSet', before?.schemeParams?.repsPerSet, after?.schemeParams?.repsPerSet],
    ['startingSets', before?.schemeParams?.startingSets, after?.schemeParams?.startingSets],
    ['startingReps', before?.schemeParams?.startingReps, after?.schemeParams?.startingReps],
  ];
  return fields
    .filter(([, oldValue, newValue]) => oldValue !== undefined && newValue !== undefined && Number(oldValue) !== Number(newValue))
    .map(([field, oldValue, newValue]) => ({ field, before: oldValue, after: newValue }));
}

export function auditChangesForState(beforeState = {}, afterState = {}) {
  const fields = ['trainingMax', 'workingWeight', 'currentSets', 'currentReps', 'progressionStep'];
  return fields.flatMap((field) => {
    const before = beforeState?.[field];
    const after = afterState?.[field];
    if (before === undefined || after === undefined || Number(before) === Number(after)) return [];
    return [{ field, before, after }];
  });
}

export function safeAuditReason(reason, fallback = '') {
  return String(reason || fallback || '').trim().slice(0, 500);
}

