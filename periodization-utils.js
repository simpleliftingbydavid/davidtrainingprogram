import { t } from './i18n.js';
export function phaseConflictError(count) {
  const error = new Error(`${t('td.hoc_vien_dang_co_chu_ky', { p0: count })}`);
  error.code = 'phase-conflict';
  return error;
}

export function resolvePeriodization(phases = []) {
  const ordered = [...phases].sort((a, b) => (a.order || 0) - (b.order || 0));
  const active = ordered.filter((phase) => phase.status === 'active');
  if (active.length > 1) throw phaseConflictError(active.length);
  return {
    activePhase: active[0] || null,
    draftPhases: ordered.filter((phase) => phase.status === 'draft'),
    archivedPhases: ordered.filter((phase) => phase.status !== 'active' && phase.status !== 'draft'),
    orderedPhases: ordered,
    usesPeriodization: ordered.some((phase) => phase.status === 'active' || phase.status === 'completed'),
  };
}

export function assignmentsForCurrentPeriod(assignments = [], phases = []) {
  const activeAssignments = assignments.filter((assignment) => assignment.active !== false && !assignment.setupRequired);
  const { activePhase, usesPeriodization } = resolvePeriodization(phases);
  if (!usesPeriodization) return activeAssignments;
  if (!activePhase) return [];
  return activeAssignments.filter((assignment) => assignment.phaseId === activePhase.id);
}

export function nextPhaseOrder(phases = []) {
  return Math.max(0, ...phases.map((phase) => Number(phase.order) || 0)) + 1;
}
