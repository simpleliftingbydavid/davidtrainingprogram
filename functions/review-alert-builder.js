'use strict';

const REVIEW_ALERT_TYPE = Object.freeze({
  PAIN: 'pain', SKIPPED: 'skipped-exercise', REDUCED_SETS: 'reduced-sets',
  EARLY_END: 'early-end', PROGRESSION_HELD: 'progression-held',
  FEEDBACK: 'exercise-feedback', ABNORMAL_TM: 'abnormal-training-max',
  PERFORMANCE_DECLINE: 'performance-decline', DATA_QUALITY: 'data-quality',
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

module.exports = { REVIEW_ALERT_TYPE, PRIORITY_RANK, safeId, buildSessionReviewAlerts,
  buildCheckInReviewAlert, buildFeedbackReviewAlert, buildAuditReviewAlert };
