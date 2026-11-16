import { t } from './i18n.js';
import { unconfiguredTemplateAssignment } from './template-import-utils.js';
import { phaseActivationBlockers } from './deload-review-engine.js';

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
  const base = text(label) || t('cj.buoi_moi');
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate.toLocaleLowerCase('vi'))) candidate = `${base} (${suffix++})`;
  used.add(candidate.toLocaleLowerCase('vi'));
  return candidate;
}

/** A cycle the coach removed from the list. Its data stays and it can be restored. */
export function isPhaseDeleted(phase) {
  return Boolean(phase?.deletedAt);
}

/** Only an archived cycle can be removed: the running one and a draft have their own controls. */
export function canDeletePhase(phase) {
  return phase?.status === 'completed' && !isPhaseDeleted(phase);
}

export function buildPhaseSourceOptions(assignments = [], phases = [], templates = []) {
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));
  const groups = new Map();

  assignments.forEach((assignment) => {
    const phase = assignment.phaseId ? phaseById.get(assignment.phaseId) : null;
    if (phase?.status === 'draft' || isPhaseDeleted(phase)) return;
    const dayLabel = text(assignment.dayLabel) || t('coach.khong_nhan');
    const phaseKey = assignment.phaseId || 'legacy';
    const key = `student:${phaseKey}:${dayLabel}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        sourceType: 'student',
        sourceId: phaseKey,
        dayLabel,
        name: dayLabel,
        sourceName: phase ? phase.name : t('cj.giao_an_truoc_chu_ky'),
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
    dayLabel: text(template.sourceDayLabel || template.name) || t('cj.buoi_mau'),
    name: text(template.name || template.sourceDayLabel) || t('cj.buoi_mau'),
    sourceName: t('shell.tool.programLibrary'),
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
  const scheme = Number(exercise.scheme);
  if ([1, 2, 3].includes(scheme)) return { trainingMax: 0 };
  if ([4, 5, 10].includes(scheme)) return { workingWeight: 0 };
  if (scheme === 9) return { workingWeight: 0, currentReps: Number(exercise.schemeParams?.repsMin) || 1 };
  if (scheme === 6) return {
    workingWeight: 0,
    setWeights: (exercise.schemeParams?.setTargets || [6, 10, 12]).map(() => 0),
  };
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
      if (option.sourceType === 'template') return unconfiguredTemplateAssignment(exercise, dayLabel);
      const sourceState = option.sourceType === 'student' ? exercise.state : null;
      const remembered = latestStateForExercise(studentAssignments, exercise.exerciseId);
      // Double progression (scheme 9) starts at the bottom of its rep range; only a load the
      // client already used on this exercise carries over, never another scheme's sets or reps.
      // APRE (scheme 10) the same way: the load carries, never another week's pending result.
      const rememberedState = [9, 10].includes(Number(exercise.scheme))
        ? { ...blankState(exercise), workingWeight: Number(remembered?.workingWeight) > 0 ? Number(remembered.workingWeight) : 0 }
        : remembered;
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
  if (!assignments.length) return [t('cj.chu_ky_chua_co_bai_tap')];
  return assignments.flatMap((assignment) => {
    const name = assignment.exerciseNameSnapshot?.vi || assignment.exerciseId;
    if (assignment.setupRequired) return [`${t('cj.can_thiet_lap_thong_so_truoc', { p0: name })}`];
    const scheme = Number(assignment.scheme);
    // Scheme 9 needs no starting load: the client finds it with warm-up sets on day one.
    const isBodyweight = assignment.schemeParams?.isBodyweight === true || scheme === 7 || scheme === 9;
    const hasStartingLoad = [1, 2, 3].includes(scheme)
      ? Number(assignment.state?.trainingMax) > 0
      : scheme === 6
        ? Array.isArray(assignment.state?.setWeights) && assignment.state.setWeights.length > 0
          && assignment.state.setWeights.every((weight) => Number(weight) > 0)
        : Number(assignment.state?.workingWeight) > 0;
    if (!isBodyweight && !hasStartingLoad) return [`${t('cj.chua_co_muc_ta_khoi_diem', { p0: name })}`];
    return [];
  });
}

export function buildPhaseActivationPlan(
  phases = [], assignments = [], targetPhaseId, workoutDraft = null, recordedSession = false,
  { phaseReview = null, openSafetyAlerts = [] } = {},
) {
  if (workoutDraft && !recordedSession) {
    throw new Error(t('cj.hoc_vien_co_buoi_tap_chua'));
  }
  const target = phases.find((phase) => phase.id === targetPhaseId);
  if (!target || !['draft', 'completed'].includes(target.status)) {
    const error = new Error(t('cj.ban_nhap_khong_con_kha_dung'));
    error.code = 'draft-unavailable';
    throw error;
  }
  const activePhases = phases.filter((phase) => phase.status === 'active');
  if (activePhases.length > 1) {
    const error = new Error(t('cj.dang_co_nhieu_hon_mot_chu'));
    error.code = 'phase-conflict';
    throw error;
  }
  const targetAssignments = assignments.filter((assignment) => assignment.phaseId === targetPhaseId && assignment.phaseEnabled !== false);
  const issues = draftActivationIssues(targetAssignments);
  if (issues.length) throw new Error(`${t('cj.chua_the_kich_hoat', { p0: issues.slice(0, 3).join(' ') })}`);
  const blockers = phaseActivationBlockers({
    activePhase: activePhases[0] || null,
    phaseReview,
    openSafetyAlerts,
  });
  if (blockers.length) {
    const error = new Error(blockers.map((item) => item.message).join(' '));
    error.code = blockers[0].code;
    error.blockers = blockers;
    throw error;
  }
  return {
    previousActivePhaseId: activePhases[0]?.id || null,
    activateAssignmentIds: targetAssignments.map((assignment) => assignment.id),
    deactivateAssignmentIds: assignments.filter((assignment) => assignment.phaseId !== targetPhaseId && assignment.active !== false).map((assignment) => assignment.id),
  };
}
