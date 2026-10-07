// Pure decision-support helpers for the coach dashboard.
// This module never writes data and never changes progression automatically.

export const REVIEW_ACTION = Object.freeze({
  SEEN: 'seen',
  ADJUST_PROGRAM: 'adjust_program',
  CONTACT_CLIENT: 'contact_client',
});

export const EFFORT_OUTCOME = Object.freeze({
  TARGET_RIR: 'target_rir',
  NEAR_FAILURE: 'near_failure',
  TECHNICAL_FAILURE: 'technical_failure',
  STOPPED_SAFETY: 'stopped_safety',
});

export const EFFORT_OUTCOME_OPTIONS = Object.freeze([
  Object.freeze({
    value: EFFORT_OUTCOME.TARGET_RIR,
    label: 'Đúng RIR mục tiêu',
    learnerCopy: 'Dừng set khi vẫn còn đúng số rep dự kiến với kỹ thuật ổn định.',
  }),
  Object.freeze({
    value: EFFORT_OUTCOME.NEAR_FAILURE,
    label: 'Gần hết sức',
    learnerCopy: 'Chỉ còn khoảng 0–1 rep tốt, nhưng chưa để kỹ thuật vỡ.',
  }),
  Object.freeze({
    value: EFFORT_OUTCOME.TECHNICAL_FAILURE,
    label: 'Dừng vì kỹ thuật',
    learnerCopy: 'Dừng khi không thể làm thêm rep đúng kỹ thuật; không cần cố đến thất bại tuyệt đối.',
  }),
  Object.freeze({
    value: EFFORT_OUTCOME.STOPPED_SAFETY,
    label: 'Dừng vì đau / an toàn',
    learnerCopy: 'Dừng ngay vì đau, khó chịu hoặc mất kiểm soát; báo rõ để David điều chỉnh.',
  }),
]);

const REVIEW_SEVERITY = Object.freeze({ high: 3, medium: 2, low: 1 });
const VALID_EFFORT_OUTCOMES = new Set(EFFORT_OUTCOME_OPTIONS.map((item) => item.value));

export const PROGRESSION_SCHEME_COVERAGE = Object.freeze([
  Object.freeze({ scheme: 2, name: 'Last-set RIR', status: 'implemented', evidence: 'Có quy tắc RIR và Training Max đang được kiểm thử.' }),
  Object.freeze({ scheme: 8, name: 'Kỹ thuật → set → rep → tạ', status: 'implemented', evidence: 'Có chu kỳ progression đang được kiểm thử; bài bodyweight dừng ở set/rep.' }),
  Object.freeze({ scheme: 1, name: 'Reps in reserve khác', status: 'not_implemented', evidence: 'Chưa có quy tắc nguồn và đầu vào đủ rõ.' }),
  Object.freeze({ scheme: 3, name: 'Reps to failure', status: 'not_implemented', evidence: 'Chưa có quy tắc nguồn và đầu vào đủ rõ.' }),
  Object.freeze({ scheme: 4, name: 'Sets to failure', status: 'not_implemented', evidence: 'Chưa có quy tắc nguồn và đầu vào đủ rõ.' }),
  Object.freeze({ scheme: 5, name: 'Load progression khác', status: 'not_implemented', evidence: 'Chưa có quy tắc nguồn và đầu vào đủ rõ.' }),
  Object.freeze({ scheme: 6, name: 'Hypertrophy progression khác', status: 'not_implemented', evidence: 'Chưa có quy tắc nguồn và đầu vào đủ rõ.' }),
  Object.freeze({ scheme: 7, name: 'Progression bổ sung', status: 'not_implemented', evidence: 'Chưa có quy tắc nguồn và đầu vào đủ rõ.' }),
]);

export function toMillis(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeText(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function exerciseLogKey(log = {}, index = 0) {
  return safeText(log.sessionExerciseId || log.assignmentId || log.substitutedExerciseId || log.exerciseId || `row-${index}`, 180);
}

function actualExerciseId(log = {}) {
  return safeText(log.substitutedExerciseId || log.exerciseId);
}

function sessionTime(session = {}) {
  return toMillis(session.performedAt || session.loggedAt);
}

function itemTimestamp(item = {}) {
  return toMillis(item.detectedAt || item.createdAt || item.lastDetectedAt);
}

function reviewStateIndex(states = []) {
  return new Map((states || []).map((state) => [state.sourceKey || state.id, state]));
}

function addReviewItem(target, item) {
  if (!item?.sourceKey) return;
  const existing = target.get(item.sourceKey);
  if (!existing
      || REVIEW_SEVERITY[item.severity] > REVIEW_SEVERITY[existing.severity]
      || itemTimestamp(item) > itemTimestamp(existing)) {
    target.set(item.sourceKey, item);
  }
}

function decorateReviewItem(item, student, stateByKey) {
  const state = stateByKey.get(item.sourceKey) || null;
  return {
    ...item,
    studentUid: student?.id || student?.studentUid || item.studentUid || '',
    studentName: student?.displayName || student?.name || item.studentName || 'Học viên',
    status: state?.status || 'open',
    lastAction: state?.lastAction || '',
    handledBy: state?.handledBy || '',
    handledAt: state?.handledAt || null,
    decisionNote: state?.decisionNote || '',
  };
}

function plannedAndActualRir(log = {}) {
  const planned = Number(log?.planned?.targetRIR);
  const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
  const actual = Number(sets[sets.length - 1]?.rir);
  return {
    planned: Number.isFinite(planned) ? planned : null,
    actual: Number.isFinite(actual) ? actual : null,
  };
}

function trainingMaxChange(audit = {}) {
  const change = (audit.changes || []).find((item) => item.field === 'trainingMax');
  const before = Number(change?.before);
  const after = Number(change?.after);
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0 || after <= 0) return change ? { invalid: true, pct: null } : null;
  return { invalid: false, pct: ((after - before) / before) * 100, before, after };
}

/**
 * Builds one deduplicated coach inbox for a student from both legacy and new data.
 * Review states only annotate an item; source records remain untouched.
 */
export function buildCoachReviewItems({
  student = null, sessions = [], alerts = [], notifications = [], audits = [], assignments = [],
  reviewStates = [], tmChangePctThreshold = 7.5,
} = {}) {
  const result = new Map();
  const states = reviewStateIndex(reviewStates);
  const assignmentById = new Map((assignments || []).map((item) => [item.id, item]));
  const exerciseName = (log = {}) => log.exerciseNameSnapshot?.vi
    || assignmentById.get(log.assignmentId)?.exerciseNameSnapshot?.vi
    || actualExerciseId(log) || 'Bài tập';

  (alerts || []).filter((alert) => alert.status !== 'resolved').forEach((alert) => {
    addReviewItem(result, decorateReviewItem({
      sourceKey: `alert:${alert.id}`,
      sourceId: alert.id,
      type: alert.type || 'pain-alert',
      severity: 'high',
      title: alert.type === 'exercise-pain' ? `Đau / khó chịu · ${alert.exerciseName || 'Bài tập'}` : 'Đau khớp đáng chú ý',
      context: alert.latestNote || 'Progression hoặc tăng volume đang được giữ để David xem lại.',
      evidence: [`Báo ${Math.max(1, Number(alert.occurrences) || 1)} lần`, alert.progressionHeld ? 'Progression đang giữ' : 'Đang chặn tăng volume'],
      suggestedAction: 'Kiểm tra mức đau, kỹ thuật và bài thay thế trước khi cho tăng trở lại.',
      detectedAt: alert.lastDetectedAt || alert.updatedAt,
      assignmentId: alert.assignmentId || null,
      exerciseId: alert.exerciseId || null,
    }, student, states));
  });

  (sessions || []).forEach((session) => {
    const at = session.performedAt || session.loggedAt;
    (session.exerciseLogs || []).forEach((log, index) => {
      const key = exerciseLogKey(log, index);
      const name = exerciseName(log);
      const plannedSets = Number(log.plannedSetCount ?? log.planned?.sets);
      const adjustedSets = Number(log.adjustedSetCount ?? (log.actualSets || []).length);
      const isSkipped = log.outcome === 'skipped' || log.status === 'skipped';
      if (isSkipped) addReviewItem(result, decorateReviewItem({
        sourceKey: `session:${session.id}:${key}:skipped`, sourceId: session.id, type: 'skipped-exercise', severity: 'medium',
        title: `Bỏ bài · ${name}`, context: log.completionReasonNote || log.skipReasonNote || 'Học viên đã bỏ bài trong buổi tập.',
        evidence: [safeText(log.completionReason || log.skipReason || 'Bỏ bài')], suggestedAction: 'Xem đây là điều chỉnh một buổi hay dấu hiệu cần sửa giáo án.',
        detectedAt: at, sessionId: session.id, assignmentId: log.assignmentId || null, exerciseId: actualExerciseId(log), dayLabel: session.dayLabel || '',
      }, student, states));
      if (!isSkipped && Number.isFinite(plannedSets) && Number.isFinite(adjustedSets) && adjustedSets < plannedSets) {
        addReviewItem(result, decorateReviewItem({
          sourceKey: `session:${session.id}:${key}:reduced-sets`, sourceId: session.id, type: 'reduced-sets', severity: 'medium',
          title: `Giảm set · ${name}`, context: log.completionReasonNote || `Thực hiện ${adjustedSets}/${plannedSets} set.`,
          evidence: [`${adjustedSets}/${plannedSets} set`, safeText(log.completionReason)], suggestedAction: 'Đối chiếu phục hồi và hiệu suất trước khi đổi volume kế hoạch.',
          detectedAt: at, sessionId: session.id, assignmentId: log.assignmentId || null, exerciseId: actualExerciseId(log), dayLabel: session.dayLabel || '',
        }, student, states));
      }
      if (log.progressionHeld === true && !isSkipped) addReviewItem(result, decorateReviewItem({
        sourceKey: `session:${session.id}:${key}:progression-held`, sourceId: session.id, type: 'progression-held', severity: 'medium',
        title: `Progression đang giữ · ${name}`, context: log.completionReasonNote || log.resultBucket || 'Hệ thống đã giữ progression cho lần này.',
        evidence: [safeText(log.completionReason || log.resultBucket)], suggestedAction: 'Xác nhận nguyên nhân trước khi tiếp tục progression.',
        detectedAt: at, sessionId: session.id, assignmentId: log.assignmentId || null, exerciseId: actualExerciseId(log), dayLabel: session.dayLabel || '',
      }, student, states));
      const hasIdentity = Boolean(log.assignmentId || actualExerciseId(log));
      const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
      const invalidSet = sets.some((set) => !Number.isFinite(Number(set.reps)) || Number(set.reps) < 0 || !Number.isFinite(Number(set.weight)) || Number(set.weight) < 0);
      if (!hasIdentity || (!isSkipped && (!sets.length || invalidSet))) addReviewItem(result, decorateReviewItem({
        sourceKey: `session:${session.id}:${key}:data-quality`, sourceId: session.id, type: 'data-quality', severity: 'high',
        title: `Dữ liệu cần kiểm tra · ${name}`, context: 'Buổi tập thiếu hoặc có dữ liệu set không hợp lệ.',
        evidence: [!hasIdentity ? 'Thiếu mã bài tập' : 'Thiếu / sai tạ hoặc rep'], suggestedAction: 'Mở lịch sử buổi tập để xác minh trước khi dựa vào progression.',
        detectedAt: at, sessionId: session.id, assignmentId: log.assignmentId || null, exerciseId: actualExerciseId(log), dayLabel: session.dayLabel || '',
      }, student, states));
    });
    if (session.completionContext?.endedEarly === true) addReviewItem(result, decorateReviewItem({
      sourceKey: `session:${session.id}:early-end`, sourceId: session.id, type: 'early-end', severity: 'medium',
      title: `Kết thúc sớm · ${session.dayLabel || 'Buổi tập'}`, context: session.completionContext.earlyEndReasonNote || 'Học viên kết thúc buổi trước kế hoạch.',
      evidence: [safeText(session.completionContext.earlyEndReason)], suggestedAction: 'Kiểm tra lý do và xem xu hướng có lặp lại không.',
      detectedAt: at, sessionId: session.id, dayLabel: session.dayLabel || '',
    }, student, states));
  });

  (notifications || []).filter((item) => {
    const target = item.studentUid || item.studentId;
    return (!target || !student?.id || target === student.id) && !item.readAt;
  }).forEach((item) => addReviewItem(result, decorateReviewItem({
    sourceKey: `feedback:${item.noteId || item.id}`, sourceId: item.id, type: 'feedback', severity: 'low',
    title: `Feedback mới · ${item.exerciseName || 'Bài tập'}`, context: item.preview || 'Học viên vừa gửi ghi chú mới.',
    evidence: ['Feedback chưa đọc'], suggestedAction: 'Đọc feedback và phản hồi trước lần tập tiếp theo.',
    detectedAt: item.createdAt, assignmentId: item.assignmentId || null, exerciseId: item.exerciseId || null, sessionId: item.sessionId || null,
  }, student, states)));

  (audits || []).forEach((audit) => {
    const tm = trainingMaxChange(audit);
    if (!tm || (!tm.invalid && Math.abs(tm.pct) < tmChangePctThreshold)) return;
    const name = assignmentById.get(audit.assignmentId)?.exerciseNameSnapshot?.vi || audit.exerciseId || 'Bài tập';
    addReviewItem(result, decorateReviewItem({
      sourceKey: `audit:${audit.id}:training-max`, sourceId: audit.id, type: 'training-max', severity: 'high',
      title: `Training Max cần kiểm tra · ${name}`,
      context: tm.invalid ? 'Training Max có giá trị không hợp lệ.' : `Biến động ${tm.pct > 0 ? '+' : ''}${tm.pct.toFixed(1)}% trong một lần cập nhật.`,
      evidence: tm.invalid ? ['Giá trị TM thiếu hoặc không dương'] : [`${tm.before} → ${tm.after}`, `Ngưỡng rà soát của ứng dụng: ${tmChangePctThreshold}%`],
      suggestedAction: 'Đối chiếu set thực tế và lý do audit; hệ thống không tự sửa Training Max.',
      detectedAt: audit.createdAt, assignmentId: audit.assignmentId || null, exerciseId: audit.exerciseId || null, sessionId: audit.sessionId || null,
    }, student, states));
  });

  return [...result.values()].sort((a, b) => {
    const openDelta = Number(a.status === 'resolved') - Number(b.status === 'resolved');
    if (openDelta) return openDelta;
    const severityDelta = REVIEW_SEVERITY[b.severity] - REVIEW_SEVERITY[a.severity];
    return severityDelta || itemTimestamp(b) - itemTimestamp(a) || a.sourceKey.localeCompare(b.sourceKey);
  });
}

export function normalizeEffortOutcome(value) {
  const safe = safeText(value, 40);
  return VALID_EFFORT_OUTCOMES.has(safe) ? safe : '';
}

export function buildRirTrendRows({ sessions = [], assignments = [], phaseId = null, weeks = 4, now = Date.now() } = {}) {
  const safeWeeks = [4, 8, 12].includes(Number(weeks)) ? Number(weeks) : 4;
  const cutoff = Number(now) - safeWeeks * 7 * 86400000;
  const assignmentById = new Map((assignments || []).map((item) => [item.id, item]));
  const groups = new Map();
  (sessions || []).forEach((session) => {
    const at = sessionTime(session);
    if (!at || at < cutoff || at > Number(now)) return;
    (session.exerciseLogs || []).forEach((log) => {
      if (log.outcome === 'skipped' || log.status === 'skipped') return;
      const assignment = assignmentById.get(log.assignmentId);
      const logPhaseId = log.phaseId || assignment?.phaseId || session.phaseId || null;
      if (phaseId && logPhaseId !== phaseId) return;
      const exerciseId = actualExerciseId(log);
      if (!exerciseId) return;
      const group = groups.get(exerciseId) || {
        exerciseId,
        exerciseName: log.exerciseNameSnapshot?.vi || assignment?.exerciseNameSnapshot?.vi || exerciseId,
        phaseId: logPhaseId,
        samples: [],
      };
      const { planned, actual } = plannedAndActualRir(log);
      const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
      const totalReps = sets.reduce((sum, set) => sum + Math.max(0, Number(set.reps) || 0), 0);
      const maxWeight = sets.reduce((max, set) => Math.max(max, Number(set.weight) || 0), 0);
      const effort = normalizeEffortOutcome(sets[sets.length - 1]?.effortOutcome || log.effortOutcome);
      group.samples.push({ sessionId: session.id, at, plannedRir: planned, actualRir: actual, sets: sets.length, totalReps, maxWeight, outcome: log.outcome || '', effort });
      groups.set(exerciseId, group);
    });
  });
  return [...groups.values()].map((group) => {
    group.samples.sort((a, b) => a.at - b.at);
    const planned = group.samples.filter((item) => item.plannedRir != null);
    const actual = group.samples.filter((item) => item.actualRir != null);
    const missing = planned.filter((item) => item.actualRir == null).length;
    const outcomes = group.samples.map((item) => item.outcome);
    const score = outcomes.reduce((sum, value) => sum + (value === 'up' ? 1 : value === 'down' ? -1 : 0), 0);
    const flags = [];
    if (planned.length && missing) flags.push({ type: 'missing-rir', severity: missing === planned.length ? 'high' : 'medium', evidence: `${missing}/${planned.length} lần thiếu RIR thực tế` });
    const uniqueRir = new Set(actual.map((item) => item.actualRir));
    if (actual.length >= 4 && uniqueRir.size === 1) flags.push({ type: 'constant-rir', severity: 'medium', evidence: `${actual.length} lần liên tiếp đều RIR ${actual[0].actualRir}` });
    const mismatch = planned.filter((item) => item.actualRir != null && item.actualRir < item.plannedRir && item.outcome === 'up');
    if (mismatch.length) flags.push({ type: 'rir-performance-mismatch', severity: 'high', evidence: `${mismatch.length} lần RIR thấp hơn mục tiêu nhưng outcome vẫn tăng` });
    const failures = group.samples.filter((item) => [EFFORT_OUTCOME.NEAR_FAILURE, EFFORT_OUTCOME.TECHNICAL_FAILURE].includes(item.effort) && item.plannedRir != null && item.plannedRir >= 1);
    if (failures.length) flags.push({ type: 'unplanned-failure', severity: failures.length >= 2 ? 'high' : 'medium', evidence: `${failures.length} lần tiến sát/dừng vì thất bại dù kế hoạch còn RIR` });
    const invalid = group.samples.filter((item) => item.actualRir != null && (item.actualRir < 0 || item.actualRir > 10));
    if (invalid.length) flags.push({ type: 'invalid-rir', severity: 'high', evidence: `${invalid.length} giá trị RIR ngoài khoảng 0–10` });
    return {
      ...group,
      weeks: safeWeeks,
      plannedRirAverage: planned.length ? planned.reduce((sum, item) => sum + item.plannedRir, 0) / planned.length : null,
      actualRirAverage: actual.length ? actual.reduce((sum, item) => sum + item.actualRir, 0) / actual.length : null,
      missingRirRate: planned.length ? missing / planned.length : null,
      performanceDirection: score > 0 ? 'up' : score < 0 ? 'down' : 'hold',
      flags,
    };
  }).sort((a, b) => b.flags.length - a.flags.length || a.exerciseName.localeCompare(b.exerciseName, 'vi'));
}

export function buildEffortFlags({ plannedRir = null, actualRir = null, effortOutcome = '', performanceDirection = 'hold', painReported = false } = {}) {
  const effort = normalizeEffortOutcome(effortOutcome);
  const flags = [];
  if (effort === EFFORT_OUTCOME.STOPPED_SAFETY || painReported) flags.push({ type: 'pain-or-safety', severity: 'high', evidence: 'Set dừng vì đau hoặc an toàn.' });
  if ([EFFORT_OUTCOME.NEAR_FAILURE, EFFORT_OUTCOME.TECHNICAL_FAILURE].includes(effort) && Number.isFinite(Number(plannedRir)) && Number(plannedRir) >= 1) {
    flags.push({ type: 'unplanned-failure', severity: 'medium', evidence: `Kế hoạch còn RIR ${plannedRir}.` });
  }
  if (effort === EFFORT_OUTCOME.TECHNICAL_FAILURE && Number.isFinite(Number(actualRir)) && Number(actualRir) > 1) {
    flags.push({ type: 'failure-rir-conflict', severity: 'medium', evidence: `Đánh dấu thất bại kỹ thuật nhưng RIR là ${actualRir}.` });
  }
  if ([EFFORT_OUTCOME.NEAR_FAILURE, EFFORT_OUTCOME.TECHNICAL_FAILURE].includes(effort) && performanceDirection === 'down') {
    flags.push({ type: 'failure-performance-drop', severity: 'high', evidence: 'Gần/thất bại đi cùng chiều giảm hiệu suất.' });
  }
  return flags;
}

export function assessDeloadNeed({ sessions = [], checkIns = [], alerts = [], now = Date.now(), weeks = 3 } = {}) {
  const cutoff = Number(now) - Math.max(1, Number(weeks) || 3) * 7 * 86400000;
  const recentSessions = (sessions || []).filter((session) => sessionTime(session) >= cutoff);
  const recentCheckIns = (checkIns || []).filter((item) => toMillis(item.submittedAt || item.createdAt) >= cutoff);
  const signals = [];
  const logs = recentSessions.flatMap((session) => session.exerciseLogs || []);
  const down = logs.filter((log) => log.outcome === 'down').length;
  if (down >= 2) signals.push({ type: 'performance-down', label: `${down} kết quả giảm hiệu suất`, severity: 'medium' });
  const reducedOrSkipped = logs.filter((log) => log.outcome === 'skipped' || log.status === 'skipped' || Number(log.adjustedSetCount) < Number(log.plannedSetCount)).length;
  const early = recentSessions.filter((session) => session.completionContext?.endedEarly === true).length;
  if (reducedOrSkipped + early >= 2) signals.push({ type: 'session-adjustment', label: `${reducedOrSkipped} bài giảm/bỏ và ${early} buổi kết thúc sớm`, severity: 'medium' });
  const belowRir = logs.filter((log) => {
    const { planned, actual } = plannedAndActualRir(log);
    return planned != null && actual != null && actual < planned;
  }).length;
  if (belowRir >= 2) signals.push({ type: 'rir-below-plan', label: `${belowRir} lần RIR thấp hơn kế hoạch`, severity: 'medium' });
  const latestCheckIn = [...recentCheckIns].sort((a, b) => toMillis(b.submittedAt || b.createdAt) - toMillis(a.submittedAt || a.createdAt))[0];
  if (Number(latestCheckIn?.fatigue) >= 4) signals.push({ type: 'fatigue', label: `Mệt mỏi ${latestCheckIn.fatigue}/5`, severity: 'high' });
  if (Number(latestCheckIn?.performance) === 1) signals.push({ type: 'reported-performance', label: 'Học viên tự báo hiệu suất thấp', severity: 'high' });
  if (Number(latestCheckIn?.jointPain) >= 2 || (alerts || []).some((alert) => alert.status !== 'resolved' && /pain/.test(alert.type || ''))) {
    signals.push({ type: 'pain', label: 'Có đau khớp/khó chịu chưa xử lý xong', severity: 'high' });
  }
  const high = signals.filter((item) => item.severity === 'high').length;
  const recommendation = high >= 1 && signals.length >= 2 ? 'consider_deload' : signals.length >= 3 ? 'consider_deload' : signals.length === 2 ? 'monitor' : 'hold';
  return {
    recommendation,
    label: recommendation === 'consider_deload' ? 'Nên xem xét deload' : recommendation === 'monitor' ? 'Theo dõi sát' : 'Chưa cần deload',
    signals,
    disclaimer: 'Đây là gợi ý dựa trên dữ liệu đã ghi nhận; David là người quyết định cuối cùng.',
  };
}

function phaseSessionSubset(phaseId, sessions, assignments) {
  const assignmentIds = new Set((assignments || []).filter((item) => item.phaseId === phaseId).map((item) => item.id));
  return (sessions || []).filter((session) => session.phaseId === phaseId || (session.exerciseLogs || []).some((log) => assignmentIds.has(log.assignmentId)));
}

export function buildPhaseReviewSnapshot({ phase, assignments = [], sessions = [], checkIns = [], alerts = [], volumeSummary = null, closedBy, closeReason, createdAt = null } = {}) {
  if (!phase?.id || !safeText(closedBy) || !safeText(closeReason)) throw new Error('Thiếu chu kỳ, người chốt hoặc lý do kết thúc.');
  const phaseAssignments = (assignments || []).filter((item) => item.phaseId === phase.id);
  const phaseSessions = phaseSessionSubset(phase.id, sessions, assignments);
  const audits = phaseAssignments.map((assignment) => ({
    assignmentId: assignment.id,
    exerciseId: assignment.exerciseId,
    exerciseName: assignment.exerciseNameSnapshot?.vi || assignment.exerciseId,
    dayLabel: assignment.dayLabel || '',
    scheme: assignment.scheme,
    trainingMaxEnd: Number.isFinite(Number(assignment.state?.trainingMax)) ? Number(assignment.state.trainingMax) : null,
    progressionStepEnd: Number.isFinite(Number(assignment.state?.progressionStep)) ? Number(assignment.state.progressionStep) : null,
    lastOutcome: assignment.state?.lastOutcome || '',
  }));
  const startTimes = phaseSessions.map(sessionTime).filter(Boolean);
  const deload = assessDeloadNeed({ sessions: phaseSessions, checkIns, alerts });
  const rir = buildRirTrendRows({ sessions: phaseSessions, assignments: phaseAssignments, phaseId: phase.id, weeks: 12, now: Date.now() });
  return {
    version: 1,
    phaseId: phase.id,
    phaseName: safeText(phase.name, 180),
    statusAtClose: phase.status || '',
    plannedStartDate: phase.plannedStartDate || '',
    actualStartAt: phase.activatedAt || phase.lastActivatedAt || (startTimes.length ? Math.min(...startTimes) : null),
    actualEndAt: startTimes.length ? Math.max(...startTimes) : null,
    assignmentSnapshot: audits,
    sessionCount: phaseSessions.length,
    sessionIds: phaseSessions.map((item) => item.id).filter(Boolean),
    volumeSummary: volumeSummary || null,
    rirSummary: rir.map((item) => ({
      exerciseId: item.exerciseId, plannedRirAverage: item.plannedRirAverage, actualRirAverage: item.actualRirAverage,
      missingRirRate: item.missingRirRate, performanceDirection: item.performanceDirection, flags: item.flags,
    })),
    alertSummary: (alerts || []).map((item) => ({ id: item.id, type: item.type, status: item.status, occurrences: item.occurrences || 1 })),
    deloadSummary: deload,
    closeReason: safeText(closeReason, 1000),
    closedBy: safeText(closedBy, 180),
    createdAt,
  };
}

export function buildPhaseReviewAmendment({ phaseId, reviewId, actorUid, reason, changes, createdAt = null } = {}) {
  if (!safeText(phaseId) || !safeText(reviewId) || !safeText(actorUid) || !safeText(reason) || !Array.isArray(changes) || !changes.length) {
    throw new Error('Bổ sung báo cáo cần đủ người sửa, lý do và nội dung thay đổi.');
  }
  return {
    version: 1,
    phaseId: safeText(phaseId, 180),
    reviewId: safeText(reviewId, 180),
    actorUid: safeText(actorUid, 180),
    reason: safeText(reason, 1000),
    changes: changes.slice(0, 100),
    createdAt,
  };
}
