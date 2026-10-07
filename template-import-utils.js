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
  if (!exercise) throw new Error(`Bài ${item.exerciseNameSnapshot?.vi || item.exerciseId} không còn trong thư viện bài tập. Hãy chọn bài thay thế.`);
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
  if (assignment.setupRequired) return [`${name}: cần David thiết lập thông số.`];
  const p = assignment.schemeParams || {};
  const s = assignment.state || assignment.initialState || {};
  const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
  const issues = [];
  if (Number(assignment.scheme) === 1) {
    if (![s.trainingMax, p.intensityPct, p.lowerSets, p.upperSets, p.repsPerSet, p.roundingIncrement].every(positive)
      || Number(p.upperSets) < Number(p.lowerSets) || !Number.isFinite(Number(p.targetRIR)) || Number(p.targetRIR) < 0) issues.push(`${name}: kiểm tra Training Max, khung set, rep và RIR dừng.`);
  } else if (Number(assignment.scheme) === 2) {
    if (![s.trainingMax, p.intensityPct, p.plannedSets, p.repsPerSet, p.roundingIncrement].every(positive)
      || !Number.isFinite(Number(p.targetRIR)) || Number(p.targetRIR) < 0) issues.push(`${name}: kiểm tra Training Max, set, rep và cấu hình progression.`);
  } else if (Number(assignment.scheme) === 3) {
    if (![s.trainingMax, p.intensityPct, p.plannedSets, p.repsPerSet, p.repOutTarget, p.roundingIncrement].every(positive)) issues.push(`${name}: kiểm tra Training Max, set, rep-out target và cấu hình progression.`);
  } else if (Number(assignment.scheme) === 4) {
    if (![p.plannedSets, p.repsPerSet, p.weightIncreasePct, p.roundingIncrement].every(positive)) issues.push(`${name}: kiểm tra set, rep, bước tăng và nấc tạ nhỏ nhất.`);
    if (!p.isBodyweight && !positive(s.workingWeight)) issues.push(`${name}: chưa có mức tạ khởi điểm.`);
  } else if (Number(assignment.scheme) === 5) {
    if (![p.plannedSets, p.totalRepsTarget, p.weightIncreasePct, p.roundingIncrement, s.workingWeight].every(positive)) issues.push(`${name}: kiểm tra số set, tổng rep mục tiêu, bước tăng và tạ khởi điểm.`);
  } else if (Number(assignment.scheme) === 6) {
    const targets = Array.isArray(p.setTargets) ? p.setTargets : [];
    const weights = Array.isArray(s.setWeights) ? s.setWeights : [];
    if (targets.length < 2 || targets.length !== weights.length || !targets.every(positive) || !weights.every(positive)
      || ![p.weightIncreasePct, p.roundingIncrement].every(positive)) issues.push(`${name}: kiểm tra rep và tạ riêng cho từng set Reverse Pyramid.`);
  } else if (Number(assignment.scheme) === 7) {
    if (![p.startingSets, p.endingSets, p.repIncreaseStep, s.currentSets, s.currentReps].every(positive)
      || Number(p.endingSets) < Number(p.startingSets)) issues.push(`${name}: kiểm tra set bắt đầu/kết thúc, rep hiện tại và bước tăng rep.`);
  } else if (Number(assignment.scheme) === 8) {
    if (![s.currentSets, s.currentReps, p.startingSets, p.endingSets, p.startingReps, p.endingReps, p.setIncreaseStep, p.repIncreaseStep].every(positive)
      || Number(p.endingSets) < Number(p.startingSets) || Number(p.endingReps) < Number(p.startingReps)) issues.push(`${name}: kiểm tra set, rep và bước tăng.`);
    if (!p.isBodyweight && !positive(s.workingWeight)) issues.push(`${name}: chưa có mức tạ khởi điểm.`);
    if (p.progressionMode !== 'reps_sets_only' && ![p.weightIncreasePct, p.roundingIncrement].every(positive)) issues.push(`${name}: kiểm tra bước tăng và làm tròn tạ.`);
  } else issues.push(`${name}: chưa có cơ chế progression hợp lệ.`);
  if (!positive(p.restSeconds)) issues.push(`${name}: cần thiết lập thời gian nghỉ.`);
  return issues;
}
