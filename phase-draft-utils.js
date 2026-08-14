function text(value) {
  return String(value || '').trim();
}

function copy(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function timestampValue(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return Number(value.seconds) * 1000;
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueDayLabel(label, used) {
  const base = text(label) || 'Buổi mới';
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate.toLocaleLowerCase('vi'))) candidate = `${base} (${suffix++})`;
  used.add(candidate.toLocaleLowerCase('vi'));
  return candidate;
}

export function buildPhaseSourceOptions(assignments = [], phases = [], templates = []) {
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));
  const groups = new Map();

  assignments.forEach((assignment) => {
    const phase = assignment.phaseId ? phaseById.get(assignment.phaseId) : null;
    if (phase?.status === 'draft') return;
    const dayLabel = text(assignment.dayLabel) || 'Không nhãn';
    const phaseKey = assignment.phaseId || 'legacy';
    const key = `student:${phaseKey}:${dayLabel}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        sourceType: 'student',
        sourceId: phaseKey,
        dayLabel,
        name: dayLabel,
        sourceName: phase ? phase.name : 'Giáo án trước chu kỳ',
        sourceStatus: phase ? phase.status : 'legacy',
        exercises: [],
      });
    }
    groups.get(key).exercises.push(assignment);
  });

  const student = [...groups.values()].map((option) => ({
    ...option,
    exercises: [...option.exercises].sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0)),
  }));

  const library = templates.map((template) => ({
    id: `template:${template.id}`,
    sourceType: 'template',
    sourceId: template.id,
    dayLabel: text(template.sourceDayLabel || template.name) || 'Buổi mẫu',
    name: text(template.name || template.sourceDayLabel) || 'Buổi mẫu',
    sourceName: 'Thư viện giáo án',
    sourceStatus: 'template',
    exercises: [...(template.exercises || [])].sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0)),
  }));

  return { student, library, all: [...student, ...library] };
}

function latestStateForExercise(assignments, exerciseId) {
  const candidates = assignments
    .filter((assignment) => assignment.exerciseId === exerciseId && assignment.state)
    .sort((a, b) => {
      if ((a.active !== false) !== (b.active !== false)) return a.active === false ? 1 : -1;
      return timestampValue(b.updatedAt) - timestampValue(a.updatedAt);
    });
  return candidates[0]?.state ? copy(candidates[0].state) : null;
}

function blankState(exercise) {
  if (Number(exercise.scheme) === 2) return { trainingMax: 0 };
  return {
    workingWeight: 0,
    currentSets: Number(exercise.schemeParams?.startingSets) || 3,
    currentReps: Number(exercise.schemeParams?.startingReps) || 8,
  };
}

export function buildDraftAssignmentsFromSelections(selectedOptions = [], studentAssignments = [], existingDayLabels = []) {
  const usedLabels = new Set(existingDayLabels.map((label) => text(label).toLocaleLowerCase('vi')).filter(Boolean));
  return selectedOptions.flatMap((option) => {
    const dayLabel = uniqueDayLabel(option.dayLabel || option.name, usedLabels);
    return (option.exercises || []).map((exercise, index) => {
      const sourceState = option.sourceType === 'student' ? exercise.state : null;
      const rememberedState = latestStateForExercise(studentAssignments, exercise.exerciseId);
      return {
        exerciseId: exercise.exerciseId,
        exerciseNameSnapshot: copy(exercise.exerciseNameSnapshot),
        dayLabel,
        orderInDay: Number(exercise.orderInDay) || index,
        scheme: exercise.scheme,
        schemeParams: copy(exercise.schemeParams || {}),
        initialState: copy(sourceState || rememberedState || blankState(exercise)),
        volumeConfig: copy(exercise.volumeConfig || null),
        note: text(exercise.note),
        source: {
          type: option.sourceType,
          id: option.sourceId,
          dayLabel: option.dayLabel,
        },
      };
    });
  });
}

export function draftActivationIssues(assignments = []) {
  if (!assignments.length) return ['Chu kỳ chưa có bài tập.'];
  return assignments.flatMap((assignment) => {
    const isBodyweight = assignment.schemeParams?.isBodyweight === true;
    const startingWeight = Number(assignment.scheme) === 2
      ? Number(assignment.state?.trainingMax)
      : Number(assignment.state?.workingWeight);
    if (!isBodyweight && !(startingWeight > 0)) {
      return [`${assignment.exerciseNameSnapshot?.vi || assignment.exerciseId}: chưa có mức tạ khởi điểm.`];
    }
    return [];
  });
}

export function buildPhaseActivationPlan(phases = [], assignments = [], targetPhaseId) {
  const target = phases.find((phase) => phase.id === targetPhaseId);
  if (!target || target.status !== 'draft') {
    const error = new Error('Bản nháp không còn khả dụng. Hãy tải lại trang.');
    error.code = 'draft-unavailable';
    throw error;
  }
  const activePhases = phases.filter((phase) => phase.status === 'active');
  if (activePhases.length > 1) {
    const error = new Error('Đang có nhiều hơn một chu kỳ hoạt động. Không thể kích hoạt bản nháp.');
    error.code = 'phase-conflict';
    throw error;
  }
  const targetAssignments = assignments.filter((assignment) => assignment.phaseId === targetPhaseId);
  const issues = draftActivationIssues(targetAssignments);
  if (issues.length) throw new Error(`Chưa thể kích hoạt: ${issues.slice(0, 3).join(' ')}`);
  return {
    previousActivePhaseId: activePhases[0]?.id || null,
    activateAssignmentIds: targetAssignments.map((assignment) => assignment.id),
    deactivateAssignmentIds: assignments.filter((assignment) => assignment.phaseId !== targetPhaseId && assignment.active !== false).map((assignment) => assignment.id),
  };
}
