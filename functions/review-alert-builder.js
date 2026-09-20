'use strict';

const REVIEW_ALERT_TYPE = Object.freeze({
  PAIN: 'pain', SKIPPED: 'skipped-exercise', REDUCED_SETS: 'reduced-sets',
  EARLY_END: 'early-end', PROGRESSION_HELD: 'progression-held',
  FEEDBACK: 'exercise-feedback', ABNORMAL_TM: 'abnormal-training-max',
  PERFORMANCE_DECLINE: 'performance-decline', DATA_QUALITY: 'data-quality',
  RIR_CALIBRATION: 'rir-calibration',
  DELOAD_RECOMMENDATION: 'deload-recommendation', PHASE_REVIEW_DUE: 'phase-review-due',
});

const PRIORITY_RANK = Object.freeze({ urgent: 3, high: 2, normal: 1 });

function clean(value, max = 180) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function safeId(value) {
  return clean(value, 400).replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 180) || 'unknown';
}

function alertRecord({ type, priority = 'normal', studentId, student = {}, sourceId, title, summary,
  source = 'workout', sessionId = '', assignmentId = '', exerciseId = '', exerciseName = '', dayLabel = '', latestNote = '' }) {
  const stableSource = safeId(sourceId);
  return {
    id: `${safeId(type)}_${safeId(studentId)}_${stableSource}`,
    data: {
      coachUid: clean(student.coachUid), studentUid: clean(studentId),
      studentName: clean(student.displayName || student.email || 'Học viên', 120),
      clientCategory: clean(student.clientCategory || ''), type, priority,
      status: 'open', title: clean(title, 180), summary: clean(summary, 500),
      source: clean(source, 60), sourceId: clean(sourceId, 220), sessionId: clean(sessionId), assignmentId: clean(assignmentId),
      exerciseId: clean(exerciseId), exerciseName: clean(exerciseName), dayLabel: clean(dayLabel, 120),
      latestNote: clean(latestNote, 1000), dedupeKey: `${type}:${studentId}:${sourceId}`,
      action: '', coachNote: '', reviewDate: null, handledBy: null, handledAt: null, version: 1,
    },
  };
}

function exerciseLabel(log) {
  return clean(log.exerciseName || log.exerciseNameSnapshot?.vi || log.exerciseId || 'Bài tập');
}

function sourceKey(sessionId, log, index) {
  return `${sessionId}_${log.assignmentId || log.exerciseId || index}`;
}

function validSet(set) {
  return Number.isFinite(Number(set?.reps)) && Number(set.reps) > 0
    && Number.isFinite(Number(set?.weight)) && Number(set.weight) >= 0;
}

function timestampMs(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') return Date.parse(value) || 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function rirReading(raw) {
  if (raw == null || String(raw).trim() === '') return { state: 'missing', value: null };
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 10
    ? { state: 'valid', value }
    : { state: 'invalid', value: null };
}

function rirReviewPoint(session, log, index) {
  const plannedRaw = Object.prototype.hasOwnProperty.call(log.planned || {}, 'targetRIR')
    ? log.planned.targetRIR : log.plannedRir;
  const isTracked = Number(log.scheme) === 2
    || Object.prototype.hasOwnProperty.call(log.planned || {}, 'targetRIR')
    || Object.prototype.hasOwnProperty.call(log, 'plannedRir');
  if (!isTracked || log.outcome === 'skipped' || log.status === 'skipped') return null;
  const actualSets = Array.isArray(log.actualSets) ? log.actualSets : [];
  const exerciseId = clean(log.substitutedExerciseId || log.exerciseId);
  const phaseId = clean(log.programInstanceId || log.phaseId || session.programInstanceId || session.phaseId);
  const assignmentId = clean(log.assignmentId);
  if (!actualSets.length || !exerciseId || (!phaseId && !assignmentId)) return null;
  const planned = rirReading(plannedRaw);
  const actual = rirReading(actualSets[actualSets.length - 1]?.rir);
  return {
    key: phaseId ? `phase:${phaseId}|exercise:${exerciseId}` : `assignment:${assignmentId}|exercise:${exerciseId}`,
    sessionId: clean(session.id || session.sessionId || `session-${index}`),
    performedAt: timestampMs(session.performedAt || session.loggedAt),
    assignmentId, exerciseId, exerciseName: exerciseLabel(log), dayLabel: clean(session.dayLabel),
    plannedRir: planned.value, actualRir: actual.value,
    plannedState: planned.state, actualState: actual.state,
    difference: planned.state === 'valid' && actual.state === 'valid' ? actual.value - planned.value : null,
  };
}

function rirReviewSignals(sessionId, session, previousSessions) {
  const sessions = [
    ...previousSessions.map((item, index) => ({ ...item, id: item.id || item.sessionId || `previous-${index}` })),
    { ...session, id: sessionId, sessionId },
  ];
  const groups = new Map();
  sessions.forEach((item, sessionIndex) => {
    (Array.isArray(item.exerciseLogs) ? item.exerciseLogs : []).forEach((log, logIndex) => {
      const point = rirReviewPoint(item, log, sessionIndex * 100 + logIndex);
      if (!point) return;
      if (!groups.has(point.key)) groups.set(point.key, []);
      groups.get(point.key).push(point);
    });
  });
  const results = [];
  groups.forEach((points) => {
    points.sort((a, b) => a.performedAt - b.performedAt || a.sessionId.localeCompare(b.sessionId));
    const latest = points[points.length - 1];
    if (latest.sessionId !== clean(sessionId)) return;
    const pair = points.slice(-2);
    let signal = '';
    let suggestion = '';
    if (pair.some((point) => point.actualState === 'invalid' || point.plannedState === 'invalid')) {
      signal = 'invalid-data'; suggestion = 'Kiểm tra lại dữ liệu RIR trước khi điều chỉnh giáo án.';
    } else if (pair.length === 2 && pair.every((point) => point.actualState === 'missing')) {
      signal = 'missing-rir'; suggestion = 'Trao đổi lại cách ghi RIR ở set cuối với học viên.';
    } else if (pair.length === 2 && pair.every((point) => point.difference != null && Math.abs(point.difference) >= 2)) {
      if (pair.every((point) => point.difference <= -2)) {
        signal = 'too-heavy'; suggestion = 'Xem lại cách đánh giá RIR và cân nhắc giảm độ khó hoặc hiệu chỉnh Training Max.';
      } else if (pair.every((point) => point.difference >= 2)) {
        signal = 'too-light'; suggestion = 'Xem lại cách đánh giá RIR và cân nhắc tăng độ khó khi kỹ thuật, phục hồi vẫn tốt.';
      } else {
        signal = 'inconsistent'; suggestion = 'RIR đang dao động hai hướng; ưu tiên hiệu chỉnh cách tự đánh giá trước khi đổi giáo án.';
      }
    }
    if (signal) results.push({ signal, suggestion, latest });
  });
  return results;
}

function buildSessionReviewAlerts({ studentId, student, sessionId, session, previousSessions = [] }) {
  const alerts = [];
  const logs = Array.isArray(session?.exerciseLogs) ? session.exerciseLogs : [];
  const dayLabel = clean(session?.dayLabel || 'Buổi tập');
  const add = (type, priority, log, index, title, summary, note = '') => alerts.push(alertRecord({
    type, priority, studentId, student, sourceId: sourceKey(sessionId, log || {}, index), title, summary,
    sessionId, assignmentId: log?.assignmentId, exerciseId: log?.exerciseId,
    exerciseName: exerciseLabel(log || {}), dayLabel, latestNote: note,
  }));

  logs.forEach((log, index) => {
    const name = exerciseLabel(log);
    const reason = clean(log.completionReason || log.skipReason);
    const note = clean(log.completionReasonNote || log.skipReasonNote, 1000);
    if (log.outcome === 'skipped') add(REVIEW_ALERT_TYPE.SKIPPED, reason === 'pain' ? 'urgent' : 'high', log, index,
      `Bỏ bài · ${name}`, `${dayLabel}: học viên đã bỏ bài.`, note);
    const planned = Number(log.plannedSetCount);
    const adjusted = Number(log.adjustedSetCount);
    if (Number.isFinite(planned) && Number.isFinite(adjusted) && adjusted < planned && log.outcome !== 'skipped') {
      add(REVIEW_ALERT_TYPE.REDUCED_SETS, reason === 'pain' ? 'urgent' : 'high', log, index,
        `Giảm set · ${name}`, `${dayLabel}: ${adjusted}/${planned} set kế hoạch.`, note);
    }
    if (reason === 'pain') add(REVIEW_ALERT_TYPE.PAIN, 'urgent', log, index,
      `Đau/khó chịu · ${name}`, `${dayLabel}: progression của bài cần được giữ để David xem lại.`, note);
    if (log.progressionHeld === true && reason !== 'pain') add(REVIEW_ALERT_TYPE.PROGRESSION_HELD, 'high', log, index,
      `Progression đang giữ · ${name}`, `${dayLabel}: bài chưa được phép tự tăng tiến.`, note);
    const repOutTest = log.stage5?.repOutTest;
    if (Number(repOutTest?.absoluteError) >= 2) {
      add(REVIEW_ALERT_TYPE.RIR_CALIBRATION, 'high', log, `repout_${index}`,
        `Rep-out cần xem lại · ${name}`,
        `${dayLabel}: dự đoán ${repOutTest.predictedRir} RIR nhưng thực tế còn ${repOutTest.extraReps} rep; lệch ${repOutTest.error > 0 ? '+' : ''}${repOutTest.error}. Hệ thống không tự sửa giáo án.`,
        'Trao đổi lại cách ước lượng RIR; David quyết định có hiệu chỉnh Training Max hoặc độ khó hay không.');
    }
  });

  if (session?.completionContext?.endedEarly === true) {
    const reason = clean(session.completionContext.earlyEndReason);
    alerts.push(alertRecord({ type: REVIEW_ALERT_TYPE.EARLY_END, priority: reason === 'pain' ? 'urgent' : 'high',
      studentId, student, sourceId: sessionId, title: `Kết thúc sớm · ${dayLabel}`,
      summary: 'Học viên kết thúc buổi trước khi hoàn thành toàn bộ kế hoạch.', sessionId, dayLabel,
      latestNote: session.completionContext.earlyEndReasonNote }));
  }

  const duration = Number(session?.durationSeconds);
  const invalidLogs = !Array.isArray(session?.exerciseLogs)
    || logs.some((log) => log.outcome !== 'skipped' && (!Array.isArray(log.actualSets) || log.actualSets.some((set) => !validSet(set))));
  const duplicateKeys = logs.map((log) => clean(log.assignmentId || log.substitutedExerciseId || log.exerciseId || 'missing'));
  if (invalidLogs || new Set(duplicateKeys).size !== duplicateKeys.length || (Number.isFinite(duration) && duration > 4 * 60 * 60)) {
    alerts.push(alertRecord({ type: REVIEW_ALERT_TYPE.DATA_QUALITY, priority: 'high', studentId, student,
      sourceId: sessionId, title: `Dữ liệu cần kiểm tra · ${dayLabel}`,
      summary: duration > 4 * 60 * 60 ? `Thời lượng ghi nhận ${Math.round(duration / 60)} phút.` : 'Buổi tập có dữ liệu thiếu hoặc trùng.',
      sessionId, dayLabel }));
  }

  const previousLogs = previousSessions.flatMap((item) => Array.isArray(item.exerciseLogs) ? item.exerciseLogs : []);
  const isDown = (log) => (log.progressionOutcome || log.outcome) === 'down';
  const declining = logs.filter((log) => isDown(log) && previousLogs.some((old) =>
    isDown(old) && clean(old.assignmentId || old.substitutedExerciseId || old.exerciseId) === clean(log.assignmentId || log.substitutedExerciseId || log.exerciseId)));
  if (declining.length >= 1 || logs.filter(isDown).length >= 2) {
    alerts.push(alertRecord({ type: REVIEW_ALERT_TYPE.PERFORMANCE_DECLINE, priority: 'high', studentId, student,
      sourceId: sessionId, title: `Hiệu suất giảm · ${dayLabel}`,
      summary: declining.length ? `${declining.length} bài giảm hiệu suất ở hai lần xuất hiện gần nhau.` : 'Có từ 2 bài giảm hiệu suất trong cùng buổi.',
      sessionId, dayLabel }));
  }

  // Advisory only: this never mutates an assignment, Training Max or progression state.
  rirReviewSignals(sessionId, session, previousSessions).forEach((report) => {
    const latest = report.latest;
    const titleBySignal = {
      'missing-rir': `Thiếu RIR hai lần · ${latest.exerciseName}`,
      'too-heavy': `RIR thấp hơn kế hoạch · ${latest.exerciseName}`,
      'too-light': `RIR cao hơn kế hoạch · ${latest.exerciseName}`,
      inconsistent: `RIR chưa ổn định · ${latest.exerciseName}`,
      'invalid-data': `RIR cần kiểm tra · ${latest.exerciseName}`,
    };
    const comparison = latest.actualRir == null || latest.plannedRir == null
      ? 'Hai lần tập liên tiếp chưa có RIR set cuối hợp lệ.'
      : `Lần gần nhất: kế hoạch ${latest.plannedRir} RIR · thực tế ${latest.actualRir} RIR · lệch ${latest.difference > 0 ? '+' : ''}${latest.difference}.`;
    alerts.push(alertRecord({
      type: REVIEW_ALERT_TYPE.RIR_CALIBRATION,
      priority: 'high', studentId, student,
      sourceId: sourceKey(sessionId, latest, `rir_${latest.exerciseId}`),
      title: titleBySignal[report.signal] || `Hiệu chỉnh RIR · ${latest.exerciseName}`,
      summary: `${comparison} Hệ thống chỉ đề xuất để David xem lại; không tự sửa giáo án.`,
      sessionId, assignmentId: latest.assignmentId, exerciseId: latest.exerciseId,
      exerciseName: latest.exerciseName, dayLabel: latest.dayLabel || dayLabel,
      latestNote: report.suggestion,
    }));
  });
  return alerts;
}

function buildCheckInReviewAlert({ studentId, student, checkInId, checkIn }) {
  if (Number(checkIn?.jointPain) < 2) return null;
  return alertRecord({ type: REVIEW_ALERT_TYPE.PAIN, priority: Number(checkIn.jointPain) >= 3 ? 'urgent' : 'high',
    studentId, student, source: 'check-in', sourceId: `checkin_${checkInId}`, title: 'Đau khớp từ check-in',
    summary: `Mức đau khớp ${Number(checkIn.jointPain)}/3. Không đề xuất tăng volume trước khi David xem lại.`,
    latestNote: checkIn.note });
}

function buildFeedbackReviewAlert({ studentId, student, noteId, note }) {
  if (note?.authorRole !== 'student' || note?.visibility !== 'shared') return null;
  return alertRecord({ type: REVIEW_ALERT_TYPE.FEEDBACK, priority: 'normal', studentId, student,
    source: 'feedback', sourceId: noteId, title: `Feedback · ${clean(note.exerciseName || 'Bài tập')}`,
    summary: clean(note.body, 500), sessionId: note.sessionId, assignmentId: note.assignmentId,
    exerciseId: note.exerciseId, exerciseName: note.exerciseName, dayLabel: note.sessionLabel, latestNote: note.body });
}

function buildAuditReviewAlert({ studentId, student, auditId, audit }) {
  if (audit?.source !== 'coach-manual') return null;
  const change = (audit.changes || []).find((item) => item.field === 'trainingMax');
  const before = Number(change?.before); const after = Number(change?.after);
  if (!change || !Number.isFinite(before) || before <= 0 || !Number.isFinite(after)) return null;
  const percent = Math.abs((after - before) / before) * 100;
  if (percent <= 10) return null;
  return alertRecord({ type: REVIEW_ALERT_TYPE.ABNORMAL_TM, priority: 'high', studentId, student,
    source: 'progression-audit', sourceId: auditId, title: 'Training Max biến động lớn',
    summary: `David đã chỉnh Training Max ${before} → ${after} (${percent.toFixed(1)}%). Hãy kiểm tra lại bối cảnh.`,
    sessionId: audit.sessionId, assignmentId: audit.assignmentId, exerciseId: audit.exerciseId, latestNote: audit.reason });
}

function sessionBelongsToPhase(session, assignmentIds) {
  return (session?.exerciseLogs || []).some((log) => assignmentIds.has(log.assignmentId));
}

function buildDeloadReviewAlert({ studentId, student, phase, assignments = [], sessions = [], checkIns = [], coachingAlerts = [] }) {
  if (!phase?.id || phase.status !== 'active') return null;
  const assignmentIds = new Set(assignments.filter((item) => item.phaseId === phase.id).map((item) => item.id));
  const activationStart = timestampMs(phase.lastActivatedAt || phase.activatedAt || phase.plannedStartDate);
  const recentSessions = sessions.filter((item) => (!activationStart || timestampMs(item.performedAt || item.loggedAt) >= activationStart)
    && sessionBelongsToPhase(item, assignmentIds))
    .sort((a, b) => timestampMs(a.performedAt || a.loggedAt) - timestampMs(b.performedAt || b.loggedAt)).slice(-4);
  const recentCheckIns = checkIns.filter((item) => !activationStart || timestampMs(item.submittedAt || item.createdAt) >= activationStart)
    .sort((a, b) => timestampMs(a.submittedAt || a.createdAt) - timestampMs(b.submittedAt || b.createdAt)).slice(-3);
  const openPain = coachingAlerts.filter((item) => item.status !== 'resolved'
    && ['exercise-pain', 'general-joint-pain'].includes(item.type));
  const criticalPain = openPain.some((item) => item.type === 'exercise-pain' || Number(item.latestJointPain) >= 3);
  let score = criticalPain ? 4 : openPain.length ? 2 : 0;
  const evidence = [];
  if (openPain.length) evidence.push(`${openPain.length} cảnh báo đau chưa xử lý`);

  const performanceDeclines = recentSessions.filter((session) => (session.exerciseLogs || [])
    .some((log) => (log.progressionOutcome || log.outcome) === 'down')).length;
  if (performanceDeclines >= 2) { score += 2; evidence.push(`${performanceDeclines} buổi gần nhất có hiệu suất giảm`); }
  const highFatigue = recentCheckIns.filter((item) => Number(item.fatigue) >= 4 || Number(item.performance) <= 1).length;
  if (highFatigue >= 2) { score += 2; evidence.push(`${highFatigue} check-in phục hồi kém`); }
  const disrupted = recentSessions.filter((session) => {
    const logs = session.exerciseLogs || [];
    return session.completionContext?.endedEarly === true || logs.some((log) => log.outcome === 'skipped'
      || Number(log.adjustedSetCount) < Number(log.plannedSetCount));
  }).length;
  if (disrupted >= 2) { score += 1; evidence.push(`${disrupted} buổi giảm set, bỏ bài hoặc kết thúc sớm`); }
  const rirByAssignment = new Map();
  recentSessions.forEach((session) => (session.exerciseLogs || []).forEach((log) => {
    const plannedRaw = Object.prototype.hasOwnProperty.call(log.planned || {}, 'targetRIR') ? log.planned.targetRIR : log.plannedRir;
    const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
    const actualRaw = sets[sets.length - 1]?.rir;
    const planned = rirReading(plannedRaw); const actual = rirReading(actualRaw);
    if (planned.state !== 'valid' || actual.state !== 'valid') return;
    const key = clean(log.assignmentId || log.substitutedExerciseId || log.exerciseId);
    if (!rirByAssignment.has(key)) rirByAssignment.set(key, []);
    rirByAssignment.get(key).push(actual.value - planned.value);
  }));
  const rirDeviations = [...rirByAssignment.values()].filter((points) => {
    const pair = points.slice(-2);
    return pair.length === 2 && pair.every((value) => Math.abs(value) >= 2);
  }).length;
  if (rirDeviations) { score += 1; evidence.push(`${rirDeviations} bài lệch từ 2 RIR trong hai lần liên tiếp`); }
  if (!criticalPain && score < 4) return null;
  const latestSession = recentSessions[recentSessions.length - 1];
  return alertRecord({
    type: REVIEW_ALERT_TYPE.DELOAD_RECOMMENDATION,
    priority: criticalPain ? 'urgent' : 'high', studentId, student,
    source: 'stage4-deload', sourceId: `${phase.id}_r${Math.max(1, Number(phase.activationRevision) || 1)}`,
    title: criticalPain ? `Deload · ưu tiên xem ngay · ${clean(phase.name || 'Chu kỳ')}` : `Nên cân nhắc deload · ${clean(phase.name || 'Chu kỳ')}`,
    summary: `${evidence.join(' · ')}. Hệ thống chỉ đề xuất; David quyết định cuối cùng.`,
    sessionId: latestSession?.id || latestSession?.sessionId || '',
    dayLabel: latestSession?.dayLabel || '',
    latestNote: 'Mở hồ sơ học viên để xem dữ liệu và ghi quyết định deload.',
  });
}

function buildPhaseReviewDueAlert({ studentId, student, phase, phaseReview = null, now = Date.now() }) {
  if (!phase?.id || phase.status !== 'active' || phaseReview?.status === 'locked' || !phase.plannedEndDate) return null;
  const endMs = Date.parse(`${phase.plannedEndDate}T23:59:59`);
  if (!Number.isFinite(endMs)) return null;
  const days = Math.ceil((endMs - Number(now)) / (24 * 60 * 60 * 1000));
  if (days > 7) return null;
  return alertRecord({
    type: REVIEW_ALERT_TYPE.PHASE_REVIEW_DUE,
    priority: days < 0 ? 'high' : 'normal', studentId, student,
    source: 'stage4-phase-review', sourceId: `${phase.id}_r${Math.max(1, Number(phase.activationRevision) || 1)}`,
    title: days < 0 ? `Chu kỳ đã quá ngày kết thúc · ${clean(phase.name)}` : `Chu kỳ sắp kết thúc · ${clean(phase.name)}`,
    summary: days < 0 ? `Đã quá ${Math.abs(days)} ngày và chưa có tổng kết được khóa.` : `Còn ${days} ngày. Hãy chuẩn bị tổng kết trước khi chuyển chu kỳ.`,
    latestNote: 'Chu kỳ mới sẽ bị chặn cho đến khi tổng kết hiện tại được xác nhận và khóa.',
  });
}

module.exports = { REVIEW_ALERT_TYPE, PRIORITY_RANK, safeId, buildSessionReviewAlerts,
  buildCheckInReviewAlert, buildFeedbackReviewAlert, buildAuditReviewAlert,
  buildDeloadReviewAlert, buildPhaseReviewDueAlert };
