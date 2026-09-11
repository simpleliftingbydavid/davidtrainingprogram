// David Coaching — SBS data foundation (Stage 1)
//
// This module is deliberately pure: no DOM and no Firebase imports. It defines
// the versioned vocabulary and validators required for a future SBS migration
// without changing the current production progression engine.

import { SCHEME } from './progression-engine.js';

export const SBS_SCHEMA_VERSION = 1;
export const SBS_BLUEPRINT_VERSION = '0.1.0-foundation';

export const IMPLEMENTATION_STATUS = Object.freeze({
  READY: 'ready',
  FOUNDATION_ONLY: 'foundation_only',
  LEGACY_PARTIAL: 'legacy_partial',
  SOURCE_REQUIRED: 'source_required',
});

export const SOURCE_PROVENANCE = Object.freeze({
  SBS_SOURCE: 'sbs_source',
  WORKBOOK_MAPPED_SBS: 'workbook_mapped_sbs',
  BODY_FIX_EXTENSION: 'body_fix_extension',
  LEGACY_DAVID_COACHING: 'legacy_david_coaching',
  SOURCE_REQUIRED: 'source_required',
});

export const PROGRAM_TYPE = Object.freeze({
  LINEAR_PROGRESSION: 'sbs_linear_progression',
  NOVICE_HYPERTROPHY: 'sbs_novice_hypertrophy',
  HYPERTROPHY_TEMPLATE: 'sbs_hypertrophy_template',
  REPS_TO_FAILURE: 'sbs_reps_to_failure',
  LAST_SET_RIR: 'sbs_last_set_rir',
  STRENGTH_SETS: 'sbs_strength_sets',
  LOW_FREQUENCY: 'sbs_low_frequency',
  PROGRAM_BUILDER: 'sbs_program_builder',
  LEGACY: 'legacy_david_coaching',
});

export const EXERCISE_ROLE = Object.freeze({
  CORE: 'core',
  AUXILIARY: 'auxiliary',
  ACCESSORY: 'accessory',
});

export const PROGRESSION_SCHEME_ID = Object.freeze({
  ORIGINAL: 'sbs_original_progression',
  LAST_SET_RIR: 'sbs_last_set_rir',
  REPS_TO_FAILURE: 'sbs_reps_to_failure',
  CLASSIC_OVERLOAD: 'sbs_classic_overload',
  FIXED_NUMBER_OF_REPS: 'sbs_fixed_number_of_reps',
  REVERSE_PYRAMID: 'sbs_reverse_pyramid',
  REP_INCREASE: 'sbs_rep_increase',
  SET_THEN_REP_INCREASE: 'sbs_set_then_rep_increase',
});

export const FAILURE_OUTCOME = Object.freeze({
  TARGET_RIR: 'target_rir',
  NEAR_FAILURE: 'near_failure',
  TRUE_FAILURE: 'true_failure',
  ZERO_RIR: 'zero_rir',
  TECHNICAL_FAILURE: 'technical_failure',
  STOPPED_FOR_SAFETY: 'stopped_for_safety',
});

export const DELOAD_POLICY = Object.freeze({
  NONE: 'none',
  FIXED_SCHEDULE: 'fixed_schedule',
  COACH_MANAGED: 'coach_managed',
  EARLY_REVIEW_SIGNAL: 'early_review_signal',
});

function enumEntry(id, labelVi, extra = {}) {
  return Object.freeze({ id, labelVi, schemaVersion: SBS_SCHEMA_VERSION, ...extra });
}

export const PROGRAM_TYPE_REGISTRY = Object.freeze([
  enumEntry(PROGRAM_TYPE.LINEAR_PROGRESSION, 'SBS Linear Progression', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.NOVICE_HYPERTROPHY, 'Novice Hypertrophy', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.HYPERTROPHY_TEMPLATE, 'SBS Hypertrophy Template', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.REPS_TO_FAILURE, 'Reps To Failure', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.LAST_SET_RIR, 'Last Set RIR', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.STRENGTH_SETS, 'Strength Program (Sets-based)', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.LOW_FREQUENCY, 'Low Frequency', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.PROGRAM_BUILDER, 'Program Builder', {
    provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRAM_TYPE.LEGACY, 'David Coaching hiện tại', {
    provenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
    implementationStatus: IMPLEMENTATION_STATUS.LEGACY_PARTIAL,
    compatibilityOnly: true,
  }),
]);

export const EXERCISE_ROLE_REGISTRY = Object.freeze([
  enumEntry(EXERCISE_ROLE.CORE, 'Bài chính'),
  enumEntry(EXERCISE_ROLE.AUXILIARY, 'Bài bổ trợ'),
  enumEntry(EXERCISE_ROLE.ACCESSORY, 'Bài phụ'),
]);

export const PROGRESSION_SCHEME_REGISTRY = Object.freeze([
  enumEntry(PROGRESSION_SCHEME_ID.ORIGINAL, 'Original Progression', {
    legacyScheme: SCHEME.ORIGINAL_PROGRESSION,
    provenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.LAST_SET_RIR, 'Last Set RIR', {
    legacyScheme: SCHEME.LAST_SET_RIR,
    provenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
    implementationStatus: IMPLEMENTATION_STATUS.LEGACY_PARTIAL,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.REPS_TO_FAILURE, 'Reps To Failure', {
    legacyScheme: SCHEME.REPS_TO_FAILURE,
    provenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.CLASSIC_OVERLOAD, 'Classic Overload', {
    legacyScheme: SCHEME.CLASSIC_OVERLOAD,
    provenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.FIXED_NUMBER_OF_REPS, 'Fixed Number Of Reps', {
    legacyScheme: SCHEME.FIXED_TOTAL_REPS,
    provenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.REVERSE_PYRAMID, 'Reverse Pyramid / Set-by-set', {
    legacyScheme: SCHEME.REVERSE_PYRAMID,
    provenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.REP_INCREASE, 'Rep Increase', {
    legacyScheme: SCHEME.REP_INCREASE,
    provenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
  }),
  enumEntry(PROGRESSION_SCHEME_ID.SET_THEN_REP_INCREASE, 'Set Increase Then Rep Increase', {
    legacyScheme: SCHEME.SET_THEN_REP_INCREASE,
    provenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
    implementationStatus: IMPLEMENTATION_STATUS.LEGACY_PARTIAL,
  }),
]);

export const FAILURE_OUTCOME_REGISTRY = Object.freeze([
  enumEntry(FAILURE_OUTCOME.TARGET_RIR, 'Đạt RIR mục tiêu', { provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS }),
  enumEntry(FAILURE_OUTCOME.NEAR_FAILURE, 'Gần thất bại', { provenance: SOURCE_PROVENANCE.LEGACY_DAVID_COACHING }),
  enumEntry(FAILURE_OUTCOME.TRUE_FAILURE, 'Thất bại hoàn toàn', { provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS }),
  enumEntry(FAILURE_OUTCOME.ZERO_RIR, '0 RIR', { provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS }),
  enumEntry(FAILURE_OUTCOME.TECHNICAL_FAILURE, 'Thất bại kỹ thuật', { provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS }),
  enumEntry(FAILURE_OUTCOME.STOPPED_FOR_SAFETY, 'Dừng vì an toàn', { provenance: SOURCE_PROVENANCE.BODY_FIX_EXTENSION }),
]);

export const DELOAD_POLICY_REGISTRY = Object.freeze([
  enumEntry(DELOAD_POLICY.NONE, 'Không có deload'),
  enumEntry(DELOAD_POLICY.FIXED_SCHEDULE, 'Theo lịch cố định', { provenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS }),
  enumEntry(DELOAD_POLICY.COACH_MANAGED, 'David quyết định', { provenance: SOURCE_PROVENANCE.BODY_FIX_EXTENSION }),
  enumEntry(DELOAD_POLICY.EARLY_REVIEW_SIGNAL, 'Tín hiệu xem xét sớm', { provenance: SOURCE_PROVENANCE.BODY_FIX_EXTENSION }),
]);

const PROGRAM_TYPE_IDS = new Set(PROGRAM_TYPE_REGISTRY.map((item) => item.id));
const EXERCISE_ROLE_IDS = new Set(EXERCISE_ROLE_REGISTRY.map((item) => item.id));
const SCHEME_IDS = new Set(PROGRESSION_SCHEME_REGISTRY.map((item) => item.id));
const FAILURE_IDS = new Set(FAILURE_OUTCOME_REGISTRY.map((item) => item.id));
const DELOAD_IDS = new Set(DELOAD_POLICY_REGISTRY.map((item) => item.id));
const PROVENANCE_IDS = new Set(Object.values(SOURCE_PROVENANCE));
const STATUS_IDS = new Set(Object.values(IMPLEMENTATION_STATUS));

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? '').trim();
}

function positiveInteger(value, fallback = 1) {
  const parsed = Math.trunc(Number(value));
  return parsed > 0 ? parsed : fallback;
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function progressionSchemeByLegacyNumber(value) {
  const legacyScheme = Number(value);
  return PROGRESSION_SCHEME_REGISTRY.find((item) => item.legacyScheme === legacyScheme) || null;
}

export function progressionSchemeById(id) {
  return PROGRESSION_SCHEME_REGISTRY.find((item) => item.id === id) || null;
}

export function createReadinessGate(input = {}) {
  const rawChecks = Array.isArray(input.checks) ? input.checks : [];
  return {
    kind: text(input.kind) || 'body_fix_technique',
    version: positiveInteger(input.version, 1),
    provenance: SOURCE_PROVENANCE.BODY_FIX_EXTENSION,
    status: input.status === 'disabled' ? 'disabled' : 'active',
    criteriaCount: Math.max(1, positiveInteger(input.criteriaCount, 5)),
    checks: rawChecks.map(Boolean),
    canHoldProgression: input.canHoldProgression !== false,
    affectsPrescriptionMath: false,
    legacySkillStep: optionalNumber(input.legacySkillStep),
    legacySkillCycle: optionalNumber(input.legacySkillCycle),
  };
}

export function normalizeProgramBlueprint(input = {}) {
  return {
    id: text(input.id),
    schemaVersion: positiveInteger(input.schemaVersion, SBS_SCHEMA_VERSION),
    blueprintVersion: text(input.blueprintVersion) || SBS_BLUEPRINT_VERSION,
    name: text(input.name),
    programType: text(input.programType),
    sourceProvenance: text(input.sourceProvenance) || SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: text(input.implementationStatus) || IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
    frequency: {
      sessionsPerWeek: optionalNumber(input.frequency?.sessionsPerWeek),
      sourceNote: text(input.frequency?.sourceNote),
    },
    blocks: clone(Array.isArray(input.blocks) ? input.blocks : []),
    deloadPolicy: {
      type: text(input.deloadPolicy?.type) || DELOAD_POLICY.NONE,
      scheduledWeeks: Array.isArray(input.deloadPolicy?.scheduledWeeks)
        ? input.deloadPolicy.scheduledWeeks.map((week) => positiveInteger(week)).filter((week, index, rows) => rows.indexOf(week) === index)
        : [],
      earlyReviewEnabled: input.deloadPolicy?.earlyReviewEnabled === true,
    },
    failurePolicy: {
      definition: text(input.failurePolicy?.definition),
      allowedOutcomes: Array.isArray(input.failurePolicy?.allowedOutcomes)
        ? [...new Set(input.failurePolicy.allowedOutcomes.map(text).filter(Boolean))]
        : [],
    },
    roleSchemeRules: clone(Array.isArray(input.roleSchemeRules) ? input.roleSchemeRules : []),
    progressionSchemeRefs: [...new Set((input.progressionSchemeRefs || []).map(text).filter(Boolean))],
    sourceReferences: clone(Array.isArray(input.sourceReferences) ? input.sourceReferences : []),
  };
}

export function validateProgramBlueprint(input = {}) {
  const value = normalizeProgramBlueprint(input);
  const errors = [];
  if (!value.id) errors.push('Thiếu blueprint ID.');
  if (!value.name) errors.push('Thiếu tên blueprint.');
  if (!PROGRAM_TYPE_IDS.has(value.programType)) errors.push('Program type không hợp lệ.');
  if (!PROVENANCE_IDS.has(value.sourceProvenance)) errors.push('Nguồn dữ liệu không hợp lệ.');
  if (!STATUS_IDS.has(value.implementationStatus)) errors.push('Trạng thái triển khai không hợp lệ.');
  if (!DELOAD_IDS.has(value.deloadPolicy.type)) errors.push('Deload policy không hợp lệ.');
  value.failurePolicy.allowedOutcomes.forEach((outcome) => {
    if (!FAILURE_IDS.has(outcome)) errors.push(`Failure outcome không hợp lệ: ${outcome}.`);
  });
  value.progressionSchemeRefs.forEach((schemeId) => {
    if (!SCHEME_IDS.has(schemeId)) errors.push(`Progression scheme không hợp lệ: ${schemeId}.`);
  });
  value.roleSchemeRules.forEach((rule, index) => {
    if (!EXERCISE_ROLE_IDS.has(rule.exerciseRole)) errors.push(`Vai trò bài tập không hợp lệ tại rule ${index + 1}.`);
    if (!SCHEME_IDS.has(rule.progressionSchemeId)) errors.push(`Scheme không hợp lệ tại rule ${index + 1}.`);
  });
  return { valid: errors.length === 0, errors, value };
}

export function blueprintActivationStatus(input = {}) {
  const validation = validateProgramBlueprint(input);
  const blockers = [...validation.errors];
  const blueprint = validation.value;
  if (blueprint.implementationStatus !== IMPLEMENTATION_STATUS.READY) {
    blockers.push('Blueprint chưa ở trạng thái sẵn sàng.');
  }
  if (blueprint.sourceProvenance === SOURCE_PROVENANCE.SOURCE_REQUIRED || blueprint.sourceReferences.length === 0) {
    blockers.push('Blueprint chưa có nguồn prescription đầy đủ.');
  }
  if (blueprint.blocks.length === 0) blockers.push('Blueprint chưa có cấu trúc block/tuần.');
  blueprint.progressionSchemeRefs.forEach((schemeId) => {
    const scheme = progressionSchemeById(schemeId);
    if (!scheme || scheme.implementationStatus !== IMPLEMENTATION_STATUS.READY) {
      blockers.push(`Scheme ${schemeId} chưa sẵn sàng.`);
    }
  });
  return { canActivate: blockers.length === 0, blockers: [...new Set(blockers)], blueprint };
}

export function resolveProgressionSchemeForRole(blueprintInput, exerciseRole) {
  const blueprint = normalizeProgramBlueprint(blueprintInput);
  if (!EXERCISE_ROLE_IDS.has(exerciseRole)) return null;
  const rule = blueprint.roleSchemeRules.find((item) => item.exerciseRole === exerciseRole);
  return rule && SCHEME_IDS.has(rule.progressionSchemeId) ? rule.progressionSchemeId : null;
}

export function normalizeProgramInstance(input = {}) {
  return {
    id: text(input.id),
    schemaVersion: positiveInteger(input.schemaVersion, SBS_SCHEMA_VERSION),
    studentUid: text(input.studentUid),
    phaseId: text(input.phaseId || input.id),
    blueprintId: text(input.blueprintId) || null,
    blueprintVersion: text(input.blueprintVersion) || null,
    programType: text(input.programType) || PROGRAM_TYPE.LEGACY,
    status: text(input.status) || 'draft',
    activeBlock: optionalNumber(input.activeBlock),
    activeWeek: optionalNumber(input.activeWeek),
    trainingMaxPolicy: clone(input.trainingMaxPolicy || {}),
    failurePolicy: clone(input.failurePolicy || {}),
    deloadPolicy: clone(input.deloadPolicy || { type: DELOAD_POLICY.NONE }),
    sourceProvenance: text(input.sourceProvenance) || SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
    migration: clone(input.migration || { status: 'not_migrated' }),
    rollbackRef: clone(input.rollbackRef || null),
  };
}

export function validateProgramInstance(input = {}) {
  const value = normalizeProgramInstance(input);
  const errors = [];
  if (!value.id) errors.push('Thiếu program instance ID.');
  if (!value.studentUid) errors.push('Thiếu student UID.');
  if (!PROGRAM_TYPE_IDS.has(value.programType)) errors.push('Program type không hợp lệ.');
  return { valid: errors.length === 0, errors, value };
}

export function normalizeSbsAssignment(input = {}) {
  const readinessGate = input.readinessGate ? createReadinessGate(input.readinessGate) : null;
  return {
    id: text(input.id),
    schemaVersion: positiveInteger(input.schemaVersion, SBS_SCHEMA_VERSION),
    exerciseId: text(input.exerciseId),
    exerciseNameSnapshot: text(input.exerciseNameSnapshot),
    phaseId: text(input.phaseId) || null,
    programInstanceId: text(input.programInstanceId || input.phaseId) || null,
    dayLabel: text(input.dayLabel),
    orderInDay: optionalNumber(input.orderInDay) ?? 0,
    exerciseRole: EXERCISE_ROLE_IDS.has(input.exerciseRole) ? input.exerciseRole : null,
    progressionSchemeId: SCHEME_IDS.has(input.progressionSchemeId) ? input.progressionSchemeId : null,
    schemeVersion: text(input.schemeVersion) || 'legacy',
    prescriptionConfig: clone(input.prescriptionConfig || {}),
    progressionState: clone(input.progressionState || {}),
    readinessGate,
    coachOverrides: clone(Array.isArray(input.coachOverrides) ? input.coachOverrides : []),
    sourceProvenance: text(input.sourceProvenance) || SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
  };
}

export function validateSbsAssignment(input = {}) {
  const value = normalizeSbsAssignment(input);
  const errors = [];
  if (!value.id) errors.push('Thiếu assignment ID.');
  if (!value.exerciseId) errors.push('Thiếu exercise ID.');
  if (!value.exerciseRole) errors.push('Chưa phân loại Core/Auxiliary/Accessory.');
  if (!value.progressionSchemeId) errors.push('Chưa gán progression scheme từ blueprint.');
  return { valid: errors.length === 0, errors, value };
}

export function createSessionSnapshot(input = {}) {
  const programContext = input.programContext || {};
  return {
    schemaVersion: SBS_SCHEMA_VERSION,
    snapshotVersion: text(input.snapshotVersion) || `sbs-session-v${SBS_SCHEMA_VERSION}`,
    sessionId: text(input.sessionId),
    studentUid: text(input.studentUid),
    assignmentId: text(input.assignmentId) || null,
    exerciseId: text(input.exerciseId) || null,
    exerciseNameSnapshot: clone(input.exerciseNameSnapshot || null),
    programInstanceId: text(programContext.programInstanceId) || null,
    phaseId: text(programContext.phaseId) || null,
    blueprintId: text(programContext.blueprintId) || null,
    blueprintVersion: text(programContext.blueprintVersion) || null,
    block: optionalNumber(programContext.block),
    week: optionalNumber(programContext.week),
    progressionSchemeId: SCHEME_IDS.has(input.progressionSchemeId) ? input.progressionSchemeId : null,
    schemeVersion: text(input.schemeVersion) || 'legacy',
    plannedPrescription: clone(input.plannedPrescription || {}),
    actualPerformance: clone(input.actualPerformance || {}),
    failureOutcome: FAILURE_IDS.has(input.failureOutcome) ? input.failureOutcome : null,
    completionContext: clone(input.completionContext || {}),
    specialEventContext: clone(input.specialEventContext || {}),
    progressionDecision: clone(input.progressionDecision || {}),
    sourceProvenance: text(input.sourceProvenance) || SOURCE_PROVENANCE.LEGACY_DAVID_COACHING,
  };
}

export function validateSessionSnapshot(input = {}) {
  const value = createSessionSnapshot(input);
  const errors = [];
  if (!value.sessionId) errors.push('Thiếu session ID.');
  if (!value.studentUid) errors.push('Thiếu student UID.');
  if (!value.exerciseId && !value.assignmentId) errors.push('Thiếu exercise hoặc assignment ID.');
  if (!value.progressionSchemeId) errors.push('Thiếu progression scheme trong snapshot.');
  return { valid: errors.length === 0, errors, value };
}
