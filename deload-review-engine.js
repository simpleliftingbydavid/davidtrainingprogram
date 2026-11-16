import { t } from './i18n.js';
import { frequenciesWithPausedDays } from './training-day-visibility.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function text(value) {
  return String(value ?? '').trim();
}

export function timestampMs(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  if (value?.seconds != null) return Number(value.seconds) * 1000;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function phaseAssignmentIds(assignments = [], phaseId = '') {
  return new Set(assignments.filter((item) => item.phaseId === phaseId).map((item) => item.id).filter(Boolean));
}

export function sessionsForPhase(sessions = [], assignments = [], phaseOrId = '') {
  const phaseId = typeof phaseOrId === 'object' ? phaseOrId?.id : phaseOrId;
  if (!phaseId) return [];
  const assignmentIds = phaseAssignmentIds(assignments, phaseId);
  const start = typeof phaseOrId === 'object' ? timestampMs(phaseOrId.lastActivatedAt || phaseOrId.activatedAt || phaseOrId.plannedStartDate) : 0;
  return sessions.filter((session) => (!start || timestampMs(session.performedAt || session.loggedAt) >= start)
    && (session.exerciseLogs || []).some((log) => assignmentIds.has(log.assignmentId)));
}

function checkInsForPhase(checkIns = [], phase = {}) {
  const start = timestampMs(phase.lastActivatedAt || phase.activatedAt || phase.plannedStartDate);
  return [...checkIns]
    .filter((item) => !start || timestampMs(item.submittedAt || item.createdAt) >= start)
    .sort((a, b) => timestampMs(a.submittedAt || a.createdAt) - timestampMs(b.submittedAt || b.createdAt));
}

function sessionCompletionMetrics(session = {}) {
  const logs = Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [];
  const skipped = logs.filter((log) => log.outcome === 'skipped' || log.status === 'skipped').length;
  const reduced = logs.filter((log) => Number(log.adjustedSetCount) < Number(log.plannedSetCount)).length;
  const down = logs.filter((log) => (log.progressionOutcome || log.outcome) === 'down').length;
  const completed = logs.filter((log) => log.outcome !== 'skipped' && log.status !== 'skipped').length;
  return {
    skipped, reduced, down, completed,
    endedEarly: session.completionContext?.endedEarly === true,
    completionRate: logs.length ? completed / logs.length : 0,
  };
}

function rirPoints(sessions = [], assignmentIds = new Set()) {
  const groups = new Map();
  [...sessions].sort((a, b) => timestampMs(a.performedAt || a.loggedAt) - timestampMs(b.performedAt || b.loggedAt)).forEach((session) => {
    (session.exerciseLogs || []).forEach((log) => {
      if (!assignmentIds.has(log.assignmentId) || log.outcome === 'skipped') return;
      const plannedRaw = Object.prototype.hasOwnProperty.call(log.planned || {}, 'targetRIR')
        ? log.planned.targetRIR : log.plannedRir;
      const tracked = Number(log.scheme) === 2 || plannedRaw != null;
      if (!tracked) return;
      const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
      const actualRaw = sets[sets.length - 1]?.rir;
      const planned = Number(plannedRaw);
      const actual = actualRaw == null || String(actualRaw).trim() === '' ? null : Number(actualRaw);
      const validPlanned = Number.isInteger(planned) && planned >= 0 && planned <= 10;
      const validActual = Number.isInteger(actual) && actual >= 0 && actual <= 10;
      const key = String(log.substitutedExerciseId || log.exerciseId || log.assignmentId);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({
        missing: !validActual,
        invalid: !validPlanned || (actual != null && !validActual),
        difference: validPlanned && validActual ? actual - planned : null,
      });
    });
  });
  return groups;
}

function openPainAlerts(alerts = []) {
  return alerts.filter((item) => item.status !== 'resolved'
    && ['exercise-pain', 'general-joint-pain'].includes(item.type));
}

export function buildDeloadRecommendation({
  phase = {}, assignments = [], sessions = [], checkIns = [], coachingAlerts = [], now = Date.now(),
} = {}) {
  const phaseSessions = sessionsForPhase(sessions, assignments, phase)
    .sort((a, b) => timestampMs(a.performedAt || a.loggedAt) - timestampMs(b.performedAt || b.loggedAt));
  const recentSessions = phaseSessions.slice(-4);
  const recentMetrics = recentSessions.map(sessionCompletionMetrics);
  const phaseCheckIns = checkInsForPhase(checkIns, phase);
  const recentCheckIns = phaseCheckIns.slice(-3);
  const painAlerts = openPainAlerts(coachingAlerts);
  const assignmentIds = phaseAssignmentIds(assignments, phase.id);
  const rirGroups = rirPoints(phaseSessions, assignmentIds);
  const signals = [];
  const missingData = [];
  let score = 0;

  const criticalPain = painAlerts.some((item) => item.type === 'exercise-pain' || Number(item.latestJointPain) >= 3);
  if (painAlerts.length) {
    const severity = criticalPain ? 'critical' : 'high';
    signals.push({
      id: 'pain', severity,
      label: criticalPain ? t('cj.co_canh_bao_dau_can_xu') : t('cj.dau_khop_dang_duoc_theo_doi'),
      evidence: `${t('cj.canh_bao_dau_chua_duoc_giai', { p0: painAlerts.length })}`,
    });
    score += criticalPain ? 4 : 2;
  }

  const poorPerformanceSessions = recentMetrics.filter((item) => item.down > 0).length;
  if (poorPerformanceSessions >= 2) {
    signals.push({ id: 'performance', severity: 'high', label: t('cj.hieu_suat_giam_lap_lai'), evidence: `${t('cj.buoi_gan_nhat_co_bai_giam', { p0: poorPerformanceSessions, p1: recentMetrics.length })}` });
    score += 2;
  }

  const highFatigue = recentCheckIns.filter((item) => Number(item.fatigue) >= 4 || Number(item.performance) <= 1).length;
  if (highFatigue >= 2) {
    signals.push({ id: 'recovery', severity: 'high', label: t('cj.phuc_hoi_kem_lap_lai'), evidence: `${t('cj.check_in_gan_nhat_bao_met', { p0: highFatigue, p1: recentCheckIns.length })}` });
    score += 2;
  }

  const disruptedSessions = recentMetrics.filter((item) => item.endedEarly || item.skipped > 0 || item.reduced > 0 || item.completionRate < 0.75).length;
  if (disruptedSessions >= 2) {
    signals.push({ id: 'adherence', severity: 'medium', label: t('cj.kha_nang_hoan_thanh_giao_an'), evidence: `${t('cj.buoi_gan_nhat_co_giam_set', { p0: disruptedSessions, p1: recentMetrics.length })}` });
    score += 1;
  }

  let rirDeviationGroups = 0;
  let missingRirGroups = 0;
  rirGroups.forEach((points) => {
    const pair = points.slice(-2);
    if (pair.length === 2 && pair.every((point) => point.missing)) missingRirGroups += 1;
    if (pair.length === 2 && pair.every((point) => point.difference != null && Math.abs(point.difference) >= 2)) rirDeviationGroups += 1;
  });
  if (rirDeviationGroups) {
    signals.push({ id: 'rir', severity: 'medium', label: t('cj.rir_lech_ke_hoach_lap_lai'), evidence: `${t('cj.bai_lech_tu_2_rir_tro', { p0: rirDeviationGroups })}` });
    score += 1;
  }
  if (missingRirGroups) missingData.push(`${t('cj.bai_thieu_rir_set_cuoi_trong', { p0: missingRirGroups })}`);

  if (!phaseSessions.length) missingData.push(t('cj.chua_co_buoi_tap_thuoc_chu'));
  if (!phaseCheckIns.length) missingData.push(t('cj.chua_co_check_in_phuc_hoi'));
  if (!rirGroups.size) missingData.push(t('cj.chua_co_du_lieu_rir_phu'));
  if (!phase.plannedEndDate) missingData.push(t('cj.chua_dat_ngay_du_kien_ket'));

  let status = 'not-needed';
  if (criticalPain) status = 'urgent-review';
  else if (score >= 4) status = 'consider-deload';
  else if (score >= 2) status = 'watch';

  const endDate = phase.plannedEndDate ? Date.parse(`${phase.plannedEndDate}T23:59:59`) : 0;
  const daysToEnd = endDate ? Math.ceil((endDate - Number(now)) / DAY_MS) : null;
  return {
    schemaVersion: 1,
    phaseId: phase.id || null,
    generatedAtMs: Number(now),
    status,
    score,
    signals,
    missingData,
    metrics: {
      completedSessions: phaseSessions.length,
      recentSessions: recentSessions.length,
      poorPerformanceSessions,
      highFatigueCheckIns: highFatigue,
      disruptedSessions,
      openPainAlerts: painAlerts.length,
      rirDeviationGroups,
      daysToEnd,
    },
  };
}

function plannedSessionCount(phase = {}, startMs, endMs, hiddenDays = []) {
  if (!startMs || !endMs || endMs < startMs) return null;
  // Paused days are subtracted first. Read straight from volumePlan this would
  // keep expecting sessions for a day the coach switched off, so the phase
  // summary would show the student missing work nobody asked them to do — and
  // the deload reasoning downstream reads that number as adherence.
  const planned = frequenciesWithPausedDays(phase.volumePlan?.dayFrequencies || {}, hiddenDays);
  const weekly = Object.values(planned).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  if (!(weekly > 0)) return null;
  const weeks = Math.max(1, (endMs - startMs + DAY_MS) / (7 * DAY_MS));
  return Math.round(weekly * weeks);
}

function latestTimestamp(rows = [], fields = []) {
  return Math.max(0, ...rows.map((row) => Math.max(0, ...fields.map((field) => timestampMs(row[field])))));
}

export function buildPhaseReviewSnapshot({
  phase = {}, assignments = [], sessions = [], checkIns = [], coachingAlerts = [], progressionAudits = [],
  deloadDecisions = [], rirReports = [], plannedVolume = {}, actualVolume = {}, coachReflection = {}, hiddenDays = [], now = Date.now(),
} = {}) {
  const phaseAssignments = assignments.filter((item) => item.phaseId === phase.id);
  const assignmentIds = new Set(phaseAssignments.map((item) => item.id));
  const phaseSessions = sessionsForPhase(sessions, assignments, phase)
    .sort((a, b) => timestampMs(a.performedAt || a.loggedAt) - timestampMs(b.performedAt || b.loggedAt));
  const logs = phaseSessions.flatMap((session) => session.exerciseLogs || []);
  const phaseCheckIns = checkInsForPhase(checkIns, phase);
  const activationStartMs = timestampMs(phase.lastActivatedAt || phase.activatedAt || phase.plannedStartDate);
  const phaseAudits = progressionAudits.filter((item) => assignmentIds.has(item.assignmentId)
    && (!activationStartMs || timestampMs(item.createdAt) >= activationStartMs));
  const metrics = phaseSessions.map(sessionCompletionMetrics);
  const performance = { up: 0, hold: 0, down: 0, sub: 0, skipped: 0, pr: 0 };
  const byExercise = new Map();
  logs.forEach((log) => {
    const outcome = log.progressionOutcome || log.outcome || 'hold';
    if (Object.prototype.hasOwnProperty.call(performance, outcome)) performance[outcome] += 1;
    if (log.isPR === true) performance.pr += 1;
    const key = text(log.substitutedExerciseId || log.exerciseId || log.assignmentId) || 'unknown';
    const name = text(log.exerciseNameSnapshot?.vi || log.exerciseName || key);
    const row = byExercise.get(key) || { exerciseId: key, name, up: 0, down: 0, skipped: 0, pr: 0, exposures: 0 };
    row.exposures += 1;
    if (outcome === 'up') row.up += 1;
    if (outcome === 'down') row.down += 1;
    if (outcome === 'skipped') row.skipped += 1;
    if (log.isPR === true) row.pr += 1;
    byExercise.set(key, row);
  });
  const exerciseRows = [...byExercise.values()];
  const trainingMaxChanges = phaseAudits.flatMap((audit) => (audit.changes || [])
    .filter((change) => change.field === 'trainingMax')
    .map((change) => ({ assignmentId: audit.assignmentId || null, exerciseId: audit.exerciseId || '', before: Number(change.before), after: Number(change.after), reason: text(audit.reason), atMs: timestampMs(audit.createdAt) })));
  const startMs = timestampMs(phase.lastActivatedAt || phase.activatedAt || phase.plannedStartDate || phaseSessions[0]?.performedAt);
  const plannedEndMs = phase.plannedEndDate ? Date.parse(`${phase.plannedEndDate}T23:59:59`) : 0;
  const endMs = plannedEndMs || Number(now);
  const plannedSessions = plannedSessionCount(phase, startMs, endMs, hiddenDays);
  const completedSessions = phaseSessions.length;
  const recommendation = buildDeloadRecommendation({ phase, assignments, sessions, checkIns, coachingAlerts, now });
  const reflection = {
    workedWell: text(coachReflection.workedWell).slice(0, 4000),
    needsChange: text(coachReflection.needsChange).slice(0, 4000),
    nextCycleDecision: text(coachReflection.nextCycleDecision).slice(0, 4000),
    notes: text(coachReflection.notes).slice(0, 4000),
  };
  if (!reflection.workedWell || !reflection.needsChange || !reflection.nextCycleDecision) {
    const error = new Error(t('cj.hay_hoan_thanh_ba_phan_dieu'));
    error.code = 'review-reflection-required';
    throw error;
  }
  return {
    schemaVersion: 1,
    status: 'locked',
    phase: {
      id: phase.id || null, name: text(phase.name), order: Number(phase.order) || 0,
      activationRevision: Math.max(1, Number(phase.activationRevision) || 1),
      plannedStartDate: text(phase.plannedStartDate), plannedEndDate: text(phase.plannedEndDate),
      activatedAtMs: startMs, snapshotAtMs: Number(now),
    },
    adherence: {
      plannedSessions,
      completedSessions,
      percentage: plannedSessions ? round1(completedSessions / plannedSessions * 100) : null,
      endedEarlySessions: metrics.filter((item) => item.endedEarly).length,
      sessionsWithSkippedExercises: metrics.filter((item) => item.skipped > 0).length,
      sessionsWithReducedSets: metrics.filter((item) => item.reduced > 0).length,
    },
    performance,
    rir: {
      trackedExercises: rirReports.length,
      needsReview: rirReports.filter((item) => item.status === 'needs-review').length,
      watch: rirReports.filter((item) => item.status === 'watch').length,
      missing: rirReports.filter((item) => item.status === 'insufficient').length,
    },
    volume: { planned: { ...plannedVolume }, actual: { ...actualVolume } },
    safety: {
      openPainAlerts: openPainAlerts(coachingAlerts).length,
      totalPainAlerts: coachingAlerts.filter((item) => ['exercise-pain', 'general-joint-pain'].includes(item.type)).length,
      highFatigueCheckIns: phaseCheckIns.filter((item) => Number(item.fatigue) >= 4).length,
    },
    trainingMax: { changes: trainingMaxChanges, changeCount: trainingMaxChanges.length },
    exercises: {
      progressed: exerciseRows.sort((a, b) => (b.up + b.pr) - (a.up + a.pr)).slice(0, 6),
      needsAttention: [...exerciseRows].sort((a, b) => (b.down + b.skipped) - (a.down + a.skipped)).filter((item) => item.down || item.skipped).slice(0, 6),
    },
    deload: {
      recommendation,
      decisions: deloadDecisions.map((item) => ({
        action: text(item.action), reason: text(item.reason), scheduledDate: text(item.scheduledDate),
        createdAtMs: timestampMs(item.createdAt), createdBy: text(item.createdBy),
      })),
    },
    coachReflection: reflection,
    sourceWatermark: {
      sessionsThroughMs: latestTimestamp(phaseSessions, ['loggedAt', 'performedAt']),
      checkInsThroughMs: latestTimestamp(phaseCheckIns, ['submittedAt', 'createdAt']),
      auditsThroughMs: latestTimestamp(phaseAudits, ['createdAt']),
      sourceSessionCount: phaseSessions.length,
      sourceAssignmentCount: phaseAssignments.length,
    },
  };
}

export function phaseActivationBlockers({ activePhase = null, phaseReview = null, openSafetyAlerts = [] } = {}) {
  if (!activePhase) return [];
  const blockers = [];
  const activeRevision = Math.max(1, Number(activePhase.activationRevision) || 1);
  if (!phaseReview || phaseReview.status !== 'locked' || phaseReview.phaseId !== activePhase.id
      || Math.max(1, Number(phaseReview.activationRevision) || 1) !== activeRevision) {
    blockers.push({ code: 'phase-review-required', message: `${t('cj.hay_hoan_thanh_va_khoa_tong', { p0: activePhase.name || t('cj.chu_ky_hien_tai') })}`, action: 'open-phase-review' });
  }
  const unresolved = openSafetyAlerts.filter((item) => item.status !== 'resolved'
    && (item.type === 'exercise-pain' || (item.type === 'general-joint-pain' && Number(item.latestJointPain) >= 3)));
  if (unresolved.length) {
    blockers.push({ code: 'safety-alert-open', message: `${t('cj.con_canh_bao_dau_nghiem_trong', { p0: unresolved.length })}`, action: 'open-safety-alerts' });
  }
  return blockers;
}
