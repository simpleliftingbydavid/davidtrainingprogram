// Pure assignment reordering helpers. Firestore persistence lives in training-data.js.

export function normalizedAssignmentDayLabel(value) {
  return String(value || '').trim() || 'Không nhãn';
}

export function assignmentPhaseId(value) {
  return value == null || value === '' ? null : String(value);
}

function samePhase(assignment, phaseId) {
  return assignmentPhaseId(assignment?.phaseId) === assignmentPhaseId(phaseId);
}

function numericOrder(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function assignmentGroupsForReorder(assignments, phaseId) {
  const groups = new Map();
  (assignments || [])
    .filter((assignment) => samePhase(assignment, phaseId))
    .forEach((assignment, originalIndex) => {
      const dayLabel = normalizedAssignmentDayLabel(assignment.dayLabel);
      if (!groups.has(dayLabel)) groups.set(dayLabel, []);
      groups.get(dayLabel).push({ assignment, originalIndex });
    });
  groups.forEach((rows, dayLabel) => {
    rows.sort((left, right) => numericOrder(left.assignment.orderInDay) - numericOrder(right.assignment.orderInDay)
      || left.originalIndex - right.originalIndex
      || String(left.assignment.id).localeCompare(String(right.assignment.id)));
    groups.set(dayLabel, rows.map((row) => row.assignment));
  });
  return groups;
}

/**
 * Creates an immutable, deterministic move plan.
 * `targetIndex` is measured in the target group after the dragged assignment is removed.
 */
export function buildAssignmentReorderPlan(assignments, {
  assignmentId, targetDayLabel, targetIndex, phaseId = null,
} = {}) {
  const source = (assignments || []).find((assignment) => assignment.id === assignmentId && samePhase(assignment, phaseId));
  if (!source) throw new Error('Không tìm thấy bài tập trong chu kỳ đang chỉnh.');

  const groups = assignmentGroupsForReorder(assignments, phaseId);
  const sourceDayLabel = normalizedAssignmentDayLabel(source.dayLabel);
  const destinationDayLabel = normalizedAssignmentDayLabel(targetDayLabel);
  const sourceRows = groups.get(sourceDayLabel) || [];
  const sourceIndex = sourceRows.findIndex((assignment) => assignment.id === assignmentId);
  if (sourceIndex < 0) throw new Error('Không xác định được vị trí hiện tại của bài tập.');

  const destinationRowsWithoutSource = (groups.get(destinationDayLabel) || [])
    .filter((assignment) => assignment.id !== assignmentId);
  const safeTargetIndex = Math.max(0, Math.min(
    Number.isFinite(Number(targetIndex)) ? Math.trunc(Number(targetIndex)) : destinationRowsWithoutSource.length,
    destinationRowsWithoutSource.length,
  ));

  if (sourceDayLabel === destinationDayLabel && safeTargetIndex === sourceIndex) {
    return {
      hasChanges: false,
      assignmentId,
      sourceDayLabel,
      targetDayLabel: destinationDayLabel,
      targetIndex: safeTargetIndex,
      nextAssignments: assignments,
      expectedPlacements: [],
      updates: [],
    };
  }

  const affectedLabels = new Set([sourceDayLabel, destinationDayLabel]);
  const expectedPlacements = [...affectedLabels].flatMap((dayLabel) => (groups.get(dayLabel) || []).map((assignment) => ({
    id: assignment.id,
    dayLabel: normalizedAssignmentDayLabel(assignment.dayLabel),
    orderInDay: numericOrder(assignment.orderInDay),
    phaseId: assignmentPhaseId(assignment.phaseId),
  })));

  const nextGroups = new Map(groups);
  nextGroups.set(sourceDayLabel, sourceRows.filter((assignment) => assignment.id !== assignmentId));
  const nextDestination = sourceDayLabel === destinationDayLabel
    ? [...nextGroups.get(sourceDayLabel)]
    : [...destinationRowsWithoutSource];
  nextDestination.splice(safeTargetIndex, 0, source);
  nextGroups.set(destinationDayLabel, nextDestination);

  const updates = [...affectedLabels].flatMap((dayLabel) => (nextGroups.get(dayLabel) || []).map((assignment, index) => ({
    id: assignment.id,
    dayLabel,
    orderInDay: index + 1,
    phaseId: assignmentPhaseId(assignment.phaseId),
  })));
  const updateById = new Map(updates.map((update) => [update.id, update]));
  const nextAssignments = assignments.map((assignment) => {
    const update = updateById.get(assignment.id);
    return update ? { ...assignment, dayLabel: update.dayLabel, orderInDay: update.orderInDay } : assignment;
  });

  return {
    hasChanges: true,
    assignmentId,
    sourceDayLabel,
    targetDayLabel: destinationDayLabel,
    targetIndex: safeTargetIndex,
    nextAssignments,
    expectedPlacements,
    updates,
  };
}

export function keyboardAssignmentMove(assignments, {
  assignmentId, direction, acrossGroups = false, phaseId = null,
} = {}) {
  const groups = assignmentGroupsForReorder(assignments, phaseId);
  const labels = [...groups.keys()];
  const source = (assignments || []).find((assignment) => assignment.id === assignmentId && samePhase(assignment, phaseId));
  if (!source) return null;
  const sourceDayLabel = normalizedAssignmentDayLabel(source.dayLabel);
  const sourceRows = groups.get(sourceDayLabel) || [];
  const sourceIndex = sourceRows.findIndex((assignment) => assignment.id === assignmentId);
  const step = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
  if (!step) return null;

  if (!acrossGroups) {
    const targetIndex = sourceIndex + step;
    if (targetIndex < 0 || targetIndex >= sourceRows.length) return null;
    return { assignmentId, targetDayLabel: sourceDayLabel, targetIndex, phaseId };
  }

  const labelIndex = labels.indexOf(sourceDayLabel);
  const targetLabelIndex = labelIndex + step;
  if (targetLabelIndex < 0 || targetLabelIndex >= labels.length) return null;
  const targetDayLabel = labels[targetLabelIndex];
  const targetRows = groups.get(targetDayLabel) || [];
  return {
    assignmentId,
    targetDayLabel,
    targetIndex: direction === 'up' ? targetRows.length : 0,
    phaseId,
  };
}
