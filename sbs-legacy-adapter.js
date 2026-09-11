// Stage 1 read-only compatibility layer.
//
// These helpers never call Firebase and never mutate their inputs. Their job is
// to let new SBS-aware code inspect legacy records while the current website
// continues to read and write the original shape.

import {
  DELOAD_POLICY,
  EXERCISE_ROLE,
  FAILURE_OUTCOME,
  PROGRAM_TYPE,
  SBS_SCHEMA_VERSION,
  SOURCE_PROVENANCE,
  createReadinessGate,
  createSessionSnapshot,
  normalizeProgramInstance,
  normalizeSbsAssignment,
  progressionSchemeByLegacyNumber,
} from './sbs-program-schema.js';

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? '').trim();
}

function legacyTechniqueGate(assignment = {}) {
  const state = assignment.state || {};
  const stored = state.techniqueChecklist || {};
  const hasTechniqueState = Number(assignment.scheme) === 8
    || Array.isArray(stored.checks)
    || state.progressionStep !== undefined;
  if (!hasTechniqueState) return null;
  return createReadinessGate({
    checks: Array.isArray(stored.checks) ? stored.checks : [],
    criteriaCount: Number(stored.count) || 5,
    legacySkillStep: state.progressionStep,
    legacySkillCycle: state.progressionCycle,
  });
}

export function normalizeLegacyPhase(phase = {}, { studentUid = '' } = {}) {
  return {
    canonical: normalizeProgramInstance({
      id: phase.id,
      studentUid,
      phaseId: phase.id,
      status: phase.status,
      programType: PROGRAM_TYPE.LEGACY,
      sourceProvenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
      deloadPolicy: { type: DELOAD_POLICY.NONE },
      migration: { status: 'not_migrated', legacyPhaseId: text(phase.id) || null },
      rollbackRef: phase.id ? { collection: 'phases', documentId: phase.id } : null,
    }),
    legacySnapshot: clone(phase),
  };
}

export function normalizeLegacyAssignment(assignment = {}) {
  const scheme = progressionSchemeByLegacyNumber(assignment.scheme);
  const readinessGate = legacyTechniqueGate(assignment);
  return {
    canonical: normalizeSbsAssignment({
      id: assignment.id,
      exerciseId: assignment.exerciseId,
      exerciseNameSnapshot: assignment.exerciseNameSnapshot,
      phaseId: assignment.phaseId,
      programInstanceId: assignment.phaseId,
      dayLabel: assignment.dayLabel,
      orderInDay: assignment.orderInDay,
      exerciseRole: null,
      progressionSchemeId: scheme?.id || null,
      schemeVersion: 'legacy',
      prescriptionConfig: assignment.schemeParams || {},
      progressionState: assignment.state || {},
      readinessGate,
      sourceProvenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
    }),
    migrationIssues: [
      ...(!scheme ? ['legacy_scheme_unknown'] : []),
      'exercise_role_requires_coach_or_blueprint',
    ],
    legacySnapshot: clone(assignment),
  };
}

function mapLegacyFailureOutcome(log = {}) {
  const value = text(log.effortOutcome);
  if (value === 'target_rir') return FAILURE_OUTCOME.TARGET_RIR;
  if (value === 'near_failure') return FAILURE_OUTCOME.NEAR_FAILURE;
  if (value === 'technical_failure') return FAILURE_OUTCOME.TECHNICAL_FAILURE;
  if (value === 'stopped_safety') return FAILURE_OUTCOME.STOPPED_FOR_SAFETY;
  return null;
}

export function normalizeLegacySession(session = {}, { studentUid = '' } = {}) {
  const normalizedLogs = (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []).map((log) => {
    const scheme = progressionSchemeByLegacyNumber(log.scheme);
    return createSessionSnapshot({
      sessionId: session.id,
      studentUid,
      assignmentId: log.assignmentId,
      exerciseId: log.substitutedExerciseId || log.exerciseId,
      exerciseNameSnapshot: log.exerciseNameSnapshot || log.exerciseName || null,
      programContext: {
        programInstanceId: log.phaseId || session.phaseId,
        phaseId: log.phaseId || session.phaseId,
      },
      progressionSchemeId: scheme?.id || null,
      schemeVersion: 'legacy',
      plannedPrescription: log.planned || log.prescription || {},
      actualPerformance: { actualSets: log.actualSets || [] },
      failureOutcome: mapLegacyFailureOutcome(log),
      completionContext: {
        skipped: log.skipped === true,
        completionReason: log.completionReason || null,
      },
      specialEventContext: {
        substitutedExerciseId: log.substitutedExerciseId || null,
        studentAdded: log.studentAdded === true,
      },
      progressionDecision: {
        resultBucket: log.resultBucket || null,
        delta: clone(log.delta || null),
      },
    });
  });
  return {
    canonical: {
      schemaVersion: SBS_SCHEMA_VERSION,
      id: text(session.id),
      studentUid: text(studentUid),
      phaseId: text(session.phaseId) || null,
      exerciseSnapshots: normalizedLogs,
      completionContext: clone(session.completionContext || {}),
      sourceProvenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
    },
    legacySnapshot: clone(session),
  };
}

export function toLegacyCompatiblePhase(normalized = {}) {
  return clone(normalized.legacySnapshot || normalized);
}

export function toLegacyCompatibleAssignment(normalized = {}) {
  return clone(normalized.legacySnapshot || normalized);
}

export function toLegacyCompatibleSession(normalized = {}) {
  return clone(normalized.legacySnapshot || normalized);
}

export function buildLegacyMigrationDryRun({
  studentUid,
  phase,
  assignments = [],
  sessions = [],
  targetBlueprint,
} = {}) {
  const safeStudentUid = text(studentUid);
  const phaseId = text(phase?.id);
  const blueprintId = text(targetBlueprint?.id);
  const blueprintVersion = text(targetBlueprint?.blueprintVersion);
  const issues = [];
  if (!safeStudentUid) issues.push('missing_student_uid');
  if (!phaseId) issues.push('missing_phase_id');
  if (!blueprintId || !blueprintVersion) issues.push('missing_target_blueprint');

  const normalizedAssignments = assignments.map(normalizeLegacyAssignment);
  normalizedAssignments.forEach((row) => issues.push(...row.migrationIssues.map((issue) => `${row.canonical.id || 'unknown'}:${issue}`)));

  return {
    dryRun: true,
    writesPlanned: 0,
    idempotencyKey: `sbs-v${SBS_SCHEMA_VERSION}:${safeStudentUid}:${phaseId}:${blueprintId}:${blueprintVersion}`,
    status: issues.length ? 'blocked' : 'ready_for_review',
    issues: [...new Set(issues)],
    counts: {
      assignments: assignments.length,
      sessionsPreserved: sessions.length,
    },
    rollbackRef: {
      phaseId: phaseId || null,
      assignmentIds: assignments.map((item) => text(item.id)).filter(Boolean),
      sessionIds: sessions.map((item) => text(item.id)).filter(Boolean),
    },
  };
}

export { EXERCISE_ROLE };
