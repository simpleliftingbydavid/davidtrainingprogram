import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DELOAD_POLICY,
  EXERCISE_ROLE,
  FAILURE_OUTCOME,
  IMPLEMENTATION_STATUS,
  PROGRAM_TYPE,
  PROGRAM_TYPE_REGISTRY,
  PROGRESSION_SCHEME_ID,
  PROGRESSION_SCHEME_REGISTRY,
  SOURCE_PROVENANCE,
  blueprintActivationStatus,
  createReadinessGate,
  createSessionSnapshot,
  normalizeProgramBlueprint,
  resolveProgressionSchemeForRole,
  validateProgramBlueprint,
  validateSessionSnapshot,
  validateSbsAssignment,
} from '../sbs-program-schema.js';
import {
  buildLegacyMigrationDryRun,
  normalizeLegacyAssignment,
  normalizeLegacySession,
  toLegacyCompatibleAssignment,
  toLegacyCompatibleSession,
} from '../sbs-legacy-adapter.js';

function uniqueIds(registry) {
  return new Set(registry.map((item) => item.id)).size === registry.length;
}

test('registry IDs are stable and unique', () => {
  assert.equal(uniqueIds(PROGRAM_TYPE_REGISTRY), true);
  assert.equal(uniqueIds(PROGRESSION_SCHEME_REGISTRY), true);
  assert.deepEqual(PROGRESSION_SCHEME_REGISTRY.map((item) => item.legacyScheme), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('blueprint validator accepts a complete structural blueprint', () => {
  const result = validateProgramBlueprint({
    id: 'example-v1',
    name: 'Example',
    programType: PROGRAM_TYPE.PROGRAM_BUILDER,
    sourceProvenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.FOUNDATION_ONLY,
    deloadPolicy: { type: DELOAD_POLICY.COACH_MANAGED },
    roleSchemeRules: [{ exerciseRole: EXERCISE_ROLE.ACCESSORY, progressionSchemeId: PROGRESSION_SCHEME_ID.CLASSIC_OVERLOAD }],
    progressionSchemeRefs: [PROGRESSION_SCHEME_ID.CLASSIC_OVERLOAD],
  });
  assert.equal(result.valid, true);
});

test('blueprint validator rejects unknown enums', () => {
  const result = validateProgramBlueprint({
    id: 'bad', name: 'Bad', programType: 'unknown', sourceProvenance: 'unknown',
    implementationStatus: 'unknown', deloadPolicy: { type: 'unknown' },
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 4);
});

test('legacy assignment keeps unknown fields and round-trips without changing progression data', () => {
  const legacy = {
    id: 'a-1', exerciseId: 'bench', exerciseNameSnapshot: 'BB Bench Press', phaseId: 'p-1',
    dayLabel: 'Upper', orderInDay: 1, scheme: 2,
    schemeParams: { intensityPct: 75, plannedSets: 4, repsPerSet: 6, targetRIR: 2 },
    state: { trainingMax: 100, workingWeight: 75, consecutiveMisses: 0 },
    customFutureField: { keep: true },
  };
  const normalized = normalizeLegacyAssignment(legacy);
  assert.equal(normalized.canonical.progressionSchemeId, PROGRESSION_SCHEME_ID.LAST_SET_RIR);
  assert.equal(normalized.canonical.exerciseRole, null);
  assert.deepEqual(toLegacyCompatibleAssignment(normalized), legacy);
});

test('BODY FIX technique tracking becomes a readiness gate and never prescription math', () => {
  const normalized = normalizeLegacyAssignment({
    id: 'a-2', exerciseId: 'curl', exerciseNameSnapshot: 'Cable Curl', scheme: 8,
    schemeParams: { startingSets: 2 },
    state: { progressionStep: 2, progressionCycle: 3, techniqueChecklist: { count: 5, checks: [true, false, true, false, false] } },
  });
  assert.equal(normalized.canonical.readinessGate.provenance, SOURCE_PROVENANCE.BODY_FIX_EXTENSION);
  assert.equal(normalized.canonical.readinessGate.affectsPrescriptionMath, false);
  assert.equal(normalized.canonical.readinessGate.canHoldProgression, true);
  assert.equal(normalized.canonical.readinessGate.legacySkillStep, 2);
});

test('source-required blueprint cannot be activated', () => {
  const blueprint = normalizeProgramBlueprint({
    id: 'lp-pending', name: 'Linear Progression', programType: PROGRAM_TYPE.LINEAR_PROGRESSION,
    sourceProvenance: SOURCE_PROVENANCE.SOURCE_REQUIRED,
    implementationStatus: IMPLEMENTATION_STATUS.SOURCE_REQUIRED,
    progressionSchemeRefs: [PROGRESSION_SCHEME_ID.LAST_SET_RIR],
  });
  const status = blueprintActivationStatus(blueprint);
  assert.equal(status.canActivate, false);
  assert.ok(status.blockers.some((item) => item.includes('nguồn prescription')));
});

test('blueprint resolves scheme from exercise role, never exercise name', () => {
  const blueprint = normalizeProgramBlueprint({
    id: 'role-map', name: 'Role map', programType: PROGRAM_TYPE.PROGRAM_BUILDER,
    sourceProvenance: SOURCE_PROVENANCE.WORKBOOK_MAPPED_SBS,
    implementationStatus: IMPLEMENTATION_STATUS.FOUNDATION_ONLY,
    roleSchemeRules: [
      { exerciseRole: EXERCISE_ROLE.CORE, progressionSchemeId: PROGRESSION_SCHEME_ID.LAST_SET_RIR },
      { exerciseRole: EXERCISE_ROLE.ACCESSORY, progressionSchemeId: PROGRESSION_SCHEME_ID.CLASSIC_OVERLOAD },
    ],
  });
  assert.equal(resolveProgressionSchemeForRole(blueprint, EXERCISE_ROLE.CORE), PROGRESSION_SCHEME_ID.LAST_SET_RIR);
  assert.equal(resolveProgressionSchemeForRole({ ...blueprint, exerciseName: 'BB Bench Press' }, EXERCISE_ROLE.ACCESSORY), PROGRESSION_SCHEME_ID.CLASSIC_OVERLOAD);
});

test('assignment remains invalid until blueprint or coach assigns an exercise role', () => {
  const normalized = normalizeLegacyAssignment({ id: 'a-3', exerciseId: 'deadlift', scheme: 2 });
  const result = validateSbsAssignment(normalized.canonical);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes('Core/Auxiliary/Accessory')));
});

test('session snapshot pins blueprint and scheme versions', () => {
  const snapshot = createSessionSnapshot({
    sessionId: 's-1', studentUid: 'u-1',
    programContext: { programInstanceId: 'pi-1', phaseId: 'p-1', blueprintId: 'bp-1', blueprintVersion: '1.2.0', block: 2, week: 8 },
    progressionSchemeId: PROGRESSION_SCHEME_ID.LAST_SET_RIR,
    schemeVersion: '2.0.0',
    plannedPrescription: { sets: 4, reps: 6 },
    actualPerformance: { actualSets: [{ weight: 80, reps: 6, rir: 2 }] },
    failureOutcome: FAILURE_OUTCOME.TARGET_RIR,
  });
  assert.equal(snapshot.blueprintVersion, '1.2.0');
  assert.equal(snapshot.schemeVersion, '2.0.0');
  assert.equal(snapshot.block, 2);
  assert.equal(snapshot.week, 8);
});

test('session validator requires traceable exercise and scheme identity', () => {
  const valid = validateSessionSnapshot({
    sessionId: 's-1', studentUid: 'u-1', assignmentId: 'a-1',
    progressionSchemeId: PROGRESSION_SCHEME_ID.LAST_SET_RIR,
  });
  const invalid = validateSessionSnapshot({ sessionId: 's-1', studentUid: 'u-1' });
  assert.equal(valid.valid, true);
  assert.equal(invalid.valid, false);
});

test('legacy session can be inspected and round-tripped without history loss', () => {
  const legacy = {
    id: 's-2', phaseId: 'p-1',
    exerciseLogs: [{ assignmentId: 'a-1', exerciseId: 'bench_press', scheme: 2, actualSets: [{ weight: 75, reps: 6, rir: 2 }], effortOutcome: 'target_rir' }],
    extraField: 'preserve',
  };
  const normalized = normalizeLegacySession(legacy, { studentUid: 'u-1' });
  assert.equal(normalized.canonical.exerciseSnapshots[0].failureOutcome, FAILURE_OUTCOME.TARGET_RIR);
  assert.equal(normalized.canonical.exerciseSnapshots[0].assignmentId, 'a-1');
  assert.equal(normalized.canonical.exerciseSnapshots[0].exerciseId, 'bench_press');
  assert.deepEqual(toLegacyCompatibleSession(normalized), legacy);
});

test('migration planning is deterministic, dry-run only and preserves history references', () => {
  const input = {
    studentUid: 'u-1', phase: { id: 'p-1' },
    assignments: [{ id: 'a-1', exerciseId: 'bench', scheme: 2 }],
    sessions: [{ id: 's-1' }],
    targetBlueprint: { id: 'bp-1', blueprintVersion: '1.0.0' },
  };
  const first = buildLegacyMigrationDryRun(input);
  const second = buildLegacyMigrationDryRun(input);
  assert.equal(first.dryRun, true);
  assert.equal(first.writesPlanned, 0);
  assert.equal(first.idempotencyKey, second.idempotencyKey);
  assert.deepEqual(first.rollbackRef.sessionIds, ['s-1']);
  assert.equal(first.status, 'blocked');
});

test('readiness checks can be unticked without mutating the input', () => {
  const input = { checks: [true, true, false] };
  const gate = createReadinessGate(input);
  gate.checks[0] = false;
  assert.deepEqual(input.checks, [true, true, false]);
});
