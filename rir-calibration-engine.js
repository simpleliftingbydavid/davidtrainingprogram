(function attachRirCalibration(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RirCalibration = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const WINDOW_WEEKS = Object.freeze([4, 8, 12]);
  const RIR_SCHEME = 2;
  const CALIBRATION_THRESHOLD = 2;

  function clean(value, max = 180) {
    return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
  }

  function timestampMs(value) {
    if (value?.toMillis) return value.toMillis();
    if (value?.toDate) return value.toDate().getTime();
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return Date.parse(value) || 0;
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function rirValue(raw) {
    if (raw == null || String(raw).trim() === '') return { state: 'missing', value: null };
    const value = Number(raw);
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0 || value > 10) {
      return { state: 'invalid', value: null };
    }
    return { state: 'valid', value };
  }

  function performedExerciseId(log = {}) {
    return clean(log.substitutedExerciseId || log.exerciseId);
  }

  function phaseContext(session = {}, log = {}) {
    return clean(log.programInstanceId || log.phaseId || session.programInstanceId || session.phaseId);
  }

  function pointIdentity(session, log, exerciseId) {
    const phaseId = phaseContext(session, log);
    if (phaseId) return { key: `phase:${phaseId}|exercise:${exerciseId}`, phaseId, scoped: true };
    const assignmentId = clean(log.assignmentId);
    if (assignmentId) return { key: `assignment:${assignmentId}|exercise:${exerciseId}`, phaseId: '', scoped: true };
    return { key: `unscoped|exercise:${exerciseId}`, phaseId: '', scoped: false };
  }

  function plannedRir(log = {}) {
    const planned = log.planned && typeof log.planned === 'object' ? log.planned : {};
    const raw = Object.prototype.hasOwnProperty.call(planned, 'targetRIR')
      ? planned.targetRIR
      : (Object.prototype.hasOwnProperty.call(log, 'plannedRir') ? log.plannedRir : null);
    return rirValue(raw);
  }

  function isRirTracked(log = {}) {
    return Number(log.scheme) === RIR_SCHEME
      || Object.prototype.hasOwnProperty.call(log.planned || {}, 'targetRIR')
      || Object.prototype.hasOwnProperty.call(log, 'plannedRir');
  }

  function sessionPoint(session = {}, log = {}, index = 0) {
    if (!isRirTracked(log) || log.outcome === 'skipped' || log.status === 'skipped') return null;
    const actualSets = Array.isArray(log.actualSets) ? log.actualSets : [];
    if (!actualSets.length) return null;
    const exerciseId = performedExerciseId(log);
    if (!exerciseId) return null;
    const planned = plannedRir(log);
    const actual = rirValue(actualSets[actualSets.length - 1]?.rir);
    const identity = pointIdentity(session, log, exerciseId);
    const performedAt = timestampMs(session.performedAt || session.loggedAt);
    const sessionId = clean(session.id || session.sessionId || `session-${performedAt || index}`);
    const plannedSets = Number(log.plannedSetCount ?? log.planned?.sets);
    const adjustedSets = Number(log.adjustedSetCount ?? actualSets.length);
    return {
      ...identity,
      sessionId,
      performedAt,
      dayLabel: clean(session.dayLabel, 120),
      assignmentId: clean(log.assignmentId),
      exerciseId,
      exerciseName: clean(log.exerciseName || log.exerciseNameSnapshot?.vi || exerciseId),
      source: clean(log.source || 'assigned', 40),
      plannedRir: planned.value,
      plannedState: planned.state,
      actualRir: actual.value,
      actualState: actual.state,
      difference: planned.state === 'valid' && actual.state === 'valid' ? actual.value - planned.value : null,
      reducedSets: Number.isFinite(plannedSets) && Number.isFinite(adjustedSets) && adjustedSets < plannedSets,
      endedEarly: session.completionContext?.endedEarly === true,
    };
  }

  function windowMetrics(points, weeks, now) {
    const cutoff = now - weeks * 7 * DAY_MS;
    const rows = points.filter((point) => !point.performedAt || point.performedAt >= cutoff);
    const paired = rows.filter((point) => point.difference != null);
    const differences = paired.map((point) => point.difference);
    const plannedValues = rows.filter((point) => point.plannedState === 'valid').map((point) => point.plannedRir);
    const actualValues = rows.filter((point) => point.actualState === 'valid').map((point) => point.actualRir);
    return {
      weeks,
      exposures: rows.length,
      paired: paired.length,
      missing: rows.filter((point) => point.actualState === 'missing').length,
      invalid: rows.filter((point) => point.actualState === 'invalid' || point.plannedState === 'invalid').length,
      missingPlanned: rows.filter((point) => point.plannedState === 'missing').length,
      averagePlannedRir: plannedValues.length ? plannedValues.reduce((sum, value) => sum + value, 0) / plannedValues.length : null,
      averageActualRir: actualValues.length ? actualValues.reduce((sum, value) => sum + value, 0) / actualValues.length : null,
      averageDifference: paired.length ? differences.reduce((sum, value) => sum + value, 0) / paired.length : null,
      differences,
    };
  }

  function calibrationSignal(points) {
    const latest = points.slice(-2);
    if (latest.some((point) => point.scoped === false)) {
      return {
        status: 'insufficient',
        signal: 'unscoped-legacy',
        suggestion: 'Dữ liệu cũ chưa xác định chu kỳ. Giữ để tham khảo, không dùng để hiệu chỉnh giáo án hiện tại.',
      };
    }
    if (latest.some((point) => point.actualState === 'invalid' || point.plannedState === 'invalid')) {
      return { status: 'needs-review', signal: 'invalid-data', suggestion: 'Kiểm tra lại dữ liệu RIR trước khi điều chỉnh giáo án.' };
    }
    if (latest.length === 2 && latest.every((point) => point.actualState === 'missing')) {
      return { status: 'needs-review', signal: 'missing-rir', suggestion: 'Trao đổi lại cách ghi RIR ở set cuối với học viên.' };
    }
    const paired = latest.filter((point) => point.difference != null);
    if (latest.length === 2 && paired.length === 2 && paired.every((point) => Math.abs(point.difference) >= CALIBRATION_THRESHOLD)) {
      if (paired.every((point) => point.difference <= -CALIBRATION_THRESHOLD)) {
        return { status: 'needs-review', signal: 'too-heavy', suggestion: 'Xem lại cách đánh giá RIR và cân nhắc giảm độ khó hoặc hiệu chỉnh Training Max.' };
      }
      if (paired.every((point) => point.difference >= CALIBRATION_THRESHOLD)) {
        return { status: 'needs-review', signal: 'too-light', suggestion: 'Xem lại cách đánh giá RIR và cân nhắc tăng độ khó khi kỹ thuật, phục hồi vẫn tốt.' };
      }
      return { status: 'needs-review', signal: 'inconsistent', suggestion: 'RIR đang dao động hai hướng; ưu tiên hiệu chỉnh cách tự đánh giá trước khi đổi giáo án.' };
    }
    if (points.filter((point) => point.difference != null).length < 2) {
      return { status: 'insufficient', signal: 'insufficient-data', suggestion: 'Cần ít nhất hai lần tập có RIR hợp lệ để đánh giá.' };
    }
    if (latest.some((point) => point.actualState === 'missing' || point.plannedState !== 'valid')) {
      return { status: 'watch', signal: 'partial-data', suggestion: 'Giữ nguyên và theo dõi thêm; dữ liệu hiện chưa đủ liền mạch.' };
    }
    return { status: 'stable', signal: 'stable', suggestion: 'RIR đang bám tương đối sát kế hoạch. Tiếp tục theo dõi.' };
  }

  function buildRirCalibrationReport(sessions = [], { now = Date.now(), windowWeeks = WINDOW_WEEKS } = {}) {
    const normalizedNow = timestampMs(now) || Date.now();
    const maxWeeks = Math.max(...windowWeeks);
    const cutoff = normalizedNow - maxWeeks * 7 * DAY_MS;
    const groups = new Map();
    (Array.isArray(sessions) ? sessions : []).forEach((session, sessionIndex) => {
      if (session?.status === 'cancelled' || session?.cancelled === true) return;
      (Array.isArray(session?.exerciseLogs) ? session.exerciseLogs : []).forEach((log, logIndex) => {
        const point = sessionPoint(session, log, sessionIndex * 100 + logIndex);
        if (!point || (point.performedAt && point.performedAt < cutoff)) return;
        if (!groups.has(point.key)) groups.set(point.key, { key: point.key, points: [] });
        groups.get(point.key).points.push(point);
      });
    });

    const statusRank = { 'needs-review': 4, watch: 3, insufficient: 2, stable: 1 };
    return [...groups.values()].map((group) => {
      group.points.sort((a, b) => a.performedAt - b.performedAt || a.sessionId.localeCompare(b.sessionId));
      const latest = group.points[group.points.length - 1];
      const signal = calibrationSignal(group.points);
      return {
        key: group.key,
        exerciseId: latest.exerciseId,
        exerciseName: latest.exerciseName,
        assignmentId: latest.assignmentId,
        phaseId: latest.phaseId,
        scoped: latest.scoped,
        latest,
        points: group.points,
        windows: Object.fromEntries(windowWeeks.map((weeks) => [weeks, windowMetrics(group.points, weeks, normalizedNow)])),
        ...signal,
      };
    }).sort((a, b) => (statusRank[b.status] || 0) - (statusRank[a.status] || 0)
      || b.latest.performedAt - a.latest.performedAt
      || a.exerciseName.localeCompare(b.exerciseName));
  }

  return Object.freeze({
    WINDOW_WEEKS, RIR_SCHEME, CALIBRATION_THRESHOLD,
    timestampMs, rirValue, performedExerciseId, sessionPoint,
    calibrationSignal, buildRirCalibrationReport,
  });
}));
