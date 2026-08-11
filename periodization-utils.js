export function phaseConflictError(count) {
  const error = new Error(`Học viên đang có ${count} chu kỳ cùng ở trạng thái hoạt động. Hãy kiểm tra lại trước khi tiếp tục.`);
  error.code = 'phase-conflict';
  return error;
}

export function resolvePeriodization(phases = []) {
  const ordered = [...phases].sort((a, b) => (a.order || 0) - (b.order || 0));
  const active = ordered.filter((phase) => phase.status === 'active');
  if (active.length > 1) throw phaseConflictError(active.length);
  return {
    activePhase: active[0] || null,
    archivedPhases: ordered.filter((phase) => phase.status !== 'active'),
    orderedPhases: ordered,
    usesPeriodization: ordered.length > 0,
  };
}

export function assignmentsForCurrentPeriod(assignments = [], phases = []) {
  const activeAssignments = assignments.filter((assignment) => assignment.active !== false);
  const { activePhase, usesPeriodization } = resolvePeriodization(phases);
  if (!usesPeriodization) return activeAssignments;
  if (!activePhase) return [];
  return activeAssignments.filter((assignment) => assignment.phaseId === activePhase.id);
}

export function nextPhaseOrder(phases = []) {
  return Math.max(0, ...phases.map((phase) => Number(phase.order) || 0)) + 1;
}
