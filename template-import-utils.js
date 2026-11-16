import { t } from './i18n.js';
import { getExerciseById } from './exercise-seed-data.js';

// Templates are reusable exercise lists, never a client's prescription.
export function templateExerciseList(exercises = []) {
  return exercises.map((item, index) => ({
    exerciseId: item.exerciseId,
    exerciseNameSnapshot: { vi: getExerciseById(item.exerciseId)?.nameVi || String(item.exerciseNameSnapshot?.vi || item.exerciseId) },
    orderInDay: Number.isFinite(Number(item.orderInDay)) ? Number(item.orderInDay) : index,
  }));
}

export function unconfiguredTemplateAssignment(item, dayLabel) {
  const exercise = getExerciseById(item.exerciseId);
  if (!exercise) throw new Error(`${t('cj.bai_khong_con_trong_thu_vien', { p0: item.exerciseNameSnapshot?.vi || item.exerciseId })}`);
  return {
    ...templateExerciseList([item])[0], dayLabel,
    scheme: exercise.defaultScheme,
    schemeParams: {
      isBodyweight: exercise.isBodyweight === true,
      ...(exercise.defaultParams.progressionMode ? { progressionMode: exercise.defaultParams.progressionMode } : {}),
    },
    initialState: {}, note: '', setupRequired: true, active: false,
  };
}

export function assignmentSetupIssues(assignment) {
  const name = assignment.exerciseNameSnapshot?.vi || assignment.exerciseId;
  if (assignment.setupRequired) return [`${t('cj.can_david_thiet_lap_thong_so', { p0: name })}`];
  const p = assignment.schemeParams || {};
  const s = assignment.state || assignment.initialState || {};
  const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
  const issues = [];
  if (Number(assignment.scheme) === 1) {
    if (![s.trainingMax, p.intensityPct, p.lowerSets, p.upperSets, p.repsPerSet, p.roundingIncrement].every(positive)
      || Number(p.upperSets) < Number(p.lowerSets) || !Number.isFinite(Number(p.targetRIR)) || Number(p.targetRIR) < 0) issues.push(`${t('cj.kiem_tra_training_max_khung_set', { p0: name })}`);
  } else if (Number(assignment.scheme) === 2) {
    if (![s.trainingMax, p.intensityPct, p.plannedSets, p.repsPerSet, p.roundingIncrement].every(positive)
      || !Number.isFinite(Number(p.targetRIR)) || Number(p.targetRIR) < 0) issues.push(`${t('cj.kiem_tra_training_max_set_rep', { p0: name })}`);
  } else if (Number(assignment.scheme) === 3) {
    if (![s.trainingMax, p.intensityPct, p.plannedSets, p.repsPerSet, p.repOutTarget, p.roundingIncrement].every(positive)) issues.push(`${t('cj.kiem_tra_training_max_set_rep_2', { p0: name })}`);
  } else if (Number(assignment.scheme) === 4) {
    if (![p.plannedSets, p.repsPerSet, p.weightIncreasePct, p.roundingIncrement].every(positive)) issues.push(`${t('cj.kiem_tra_set_rep_buoc_tang', { p0: name })}`);
    if (!p.isBodyweight && !positive(s.workingWeight)) issues.push(`${t('cj.chua_co_muc_ta_khoi_diem', { p0: name })}`);
  } else if (Number(assignment.scheme) === 5) {
    if (![p.plannedSets, p.totalRepsTarget, p.weightIncreasePct, p.roundingIncrement, s.workingWeight].every(positive)) issues.push(`${t('cj.kiem_tra_so_set_tong_rep', { p0: name })}`);
  } else if (Number(assignment.scheme) === 6) {
    const targets = Array.isArray(p.setTargets) ? p.setTargets : [];
    const weights = Array.isArray(s.setWeights) ? s.setWeights : [];
    if (targets.length < 2 || targets.length !== weights.length || !targets.every(positive) || !weights.every(positive)
      || ![p.weightIncreasePct, p.roundingIncrement].every(positive)) issues.push(`${t('cj.kiem_tra_rep_va_ta_rieng', { p0: name })}`);
  } else if (Number(assignment.scheme) === 7) {
    if (![p.startingSets, p.endingSets, p.repIncreaseStep, s.currentSets, s.currentReps].every(positive)
      || Number(p.endingSets) < Number(p.startingSets)) issues.push(`${t('cj.kiem_tra_set_bat_dau_ket', { p0: name })}`);
  } else if (Number(assignment.scheme) === 8) {
    if (![s.currentSets, s.currentReps, p.startingSets, p.endingSets, p.startingReps, p.endingReps, p.setIncreaseStep, p.repIncreaseStep].every(positive)
      || Number(p.endingSets) < Number(p.startingSets) || Number(p.endingReps) < Number(p.startingReps)) issues.push(`${t('cj.kiem_tra_set_rep_va_buoc', { p0: name })}`);
    if (!p.isBodyweight && !positive(s.workingWeight)) issues.push(`${t('cj.chua_co_muc_ta_khoi_diem', { p0: name })}`);
    if (p.progressionMode !== 'reps_sets_only' && ![p.weightIncreasePct, p.roundingIncrement].every(positive)) issues.push(`${t('cj.kiem_tra_buoc_tang_va_lam', { p0: name })}`);
  } else if (Number(assignment.scheme) === 9) {
    // Tăng rep rồi tăng tạ: no starting load needed, the client finds it on day one.
    if (![p.plannedSets, p.repsMin, p.repsMax].every(positive) || Number(p.repsMax) < Number(p.repsMin)
      || !Number.isFinite(Number(p.targetRIR)) || Number(p.targetRIR) < 0) issues.push(`${t('cj.kiem_tra_so_set_khoang_rep', { p0: name })}`);
    if (!p.isBodyweight && !positive(p.weightStepKg)) issues.push(`${t('cj.kiem_tra_buoc_tang_ta', { p0: name })}`);
  } else if (Number(assignment.scheme) === 10) {
    // APRE: set, rep mục tiêu của Plus Set, nấc tạ và mức tạ tuần đầu.
    if (![p.plannedSets, p.targetReps, p.roundingIncrement].every(positive)) issues.push(`${t('cj.kiem_tra_so_set_rep_muc', { p0: name })}`);
    if (!positive(s.workingWeight)) issues.push(`${t('cj.chua_co_muc_ta_tuan_dau', { p0: name })}`);
  } else issues.push(`${t('cj.chua_co_co_che_progression_hop', { p0: name })}`);
  if (!positive(p.restSeconds)) issues.push(`${t('cj.can_thiet_lap_thoi_gian_nghi', { p0: name })}`);
  return issues;
}
