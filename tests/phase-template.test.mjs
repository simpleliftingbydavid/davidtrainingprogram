// Executes the actual data layer against Firestore Emulator, with coach/student rules.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';
import { getExerciseById } from '../exercise-seed-data.js';
import { buildDraftAssignmentsFromSelections } from '../phase-draft-utils.js';
import { assignmentsForCurrentPeriod } from '../periodization-utils.js';

const env = await initializeTestEnvironment({ projectId: 'demo-david-training-program', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') } });
const coachDb = env.authenticatedContext('phase-coach').firestore();
const studentDb = env.authenticatedContext('phase-student').firestore();
const otherDb = env.authenticatedContext('phase-other').firestore();
async function dataLayer(db) {
  const module = new vm.SourceTextModule(readFileSync(new URL('../training-data.js', import.meta.url), 'utf8'));
  await module.link(async (specifier) => {
    const exports = specifier.startsWith('https:') ? firestore : specifier === './firebase-init.js' ? { db }
      : await import(new URL(`../${specifier}`, import.meta.url));
    return new vm.SyntheticModule(Object.keys(exports), function () {
      Object.entries(exports).forEach(([key, value]) => this.setExport(key, value));
    });
  });
  await module.evaluate();
  return module.namespace;
}
let count = 0;
async function check(name, test) { await test(); count++; console.log(`PASS ${name}`); }
try {
  await env.withSecurityRulesDisabled(async (context) => {
    await firestore.setDoc(firestore.doc(context.firestore(), 'coaches', 'phase-coach'), {});
    await firestore.setDoc(firestore.doc(context.firestore(), 'students', 'phase-student'), { coachUid: 'phase-coach' });
  });
  const coach = await dataLayer(coachDb);
  const student = await dataLayer(studentDb);
  const other = await dataLayer(otherDb);
  const uid = 'phase-student';
  const libraryExercise = getExerciseById('machine_rows');
  const contaminated = { exerciseId: libraryExercise.exerciseId, exerciseNameSnapshot: { vi: libraryExercise.nameVi }, orderInDay: 3,
    scheme: 2, schemeParams: { plannedSets: 99 }, state: { trainingMax: 999, techniqueChecklist: { checks: [true] } }, note: 'Private source feedback', volumeConfig: { history: ['private'] } };
  await check('saving a template stores only exercise identity and ordering', async () => {
    await coach.saveProgramTemplate('phase-coach', { name: 'Test', sourceDayLabel: 'Pull', exercises: [contaminated] });
    const saved = (await coach.listProgramTemplates('phase-coach'))[0].exercises[0];
    assert.deepEqual(Object.keys(saved).sort(), ['exerciseId', 'exerciseNameSnapshot', 'orderInDay']);
  });
  await check('both template import paths discard source and recipient state', async () => {
    const [copy] = buildDraftAssignmentsFromSelections([{ sourceType: 'template', dayLabel: 'Pull', exercises: [contaminated] }], [contaminated]);
    assert.deepEqual(copy.initialState, {});
    assert.equal(copy.scheme, libraryExercise.defaultScheme);
    assert.equal(copy.schemeParams.plannedSets, undefined);
    assert.equal(copy.setupRequired, true);
    assert.equal(copy.note, '');
    await coach.importTemplateExercises(uid, [contaminated], 'Pull');
    const [stored] = await coach.getStudentAssignments(uid, { activeOnly: false });
    assert.deepEqual(stored.state, {});
    assert.equal(stored.active, false);
    assert.equal(assignmentsForCurrentPeriod([stored], []).length, 0);
  });
  const p = { ...libraryExercise.defaultParams, restSeconds: 90 };
  const state = { workingWeight: 35, currentSets: 3, currentReps: 8, progressionStep: 1, progressionCycle: 2, techniqueChecklist: { cycle: 2, checks: [true, true, false, false, false] } };
  const assignment = { exerciseId: libraryExercise.exerciseId, exerciseNameSnapshot: { vi: libraryExercise.nameVi }, dayLabel: 'Pull', scheme: 8, schemeParams: p, initialState: state };
  await check('pending setup cannot be cleared by an incomplete coach edit', async () => {
    const [stored] = await coach.getStudentAssignments(uid, { activeOnly: false });
    await assert.rejects(coach.updateAssignmentConfig(uid, stored.id, { note: 'still pending' }));
    await coach.updateAssignmentConfig(uid, stored.id, { schemeParams: p, 'state.workingWeight': 35, 'state.currentSets': 3, 'state.currentReps': 8 }, { reason: 'Thiết lập cho học viên', actorUid: 'phase-coach' });
    const [ready] = await coach.getStudentAssignments(uid, { activeOnly: false });
    assert.equal(ready.setupRequired, false);
    assert.equal(ready.active, true);
  });
  const a = await coach.createPhaseDraft(uid, { name: 'A', assignments: [assignment] });
  await coach.activatePhaseDraft(uid, a);
  const aRows = (await coach.getStudentAssignments(uid, { activeOnly: false })).filter((row) => row.phaseId === a);
  const originalState = aRows[0].state;
  const b = await coach.createPhaseDraft(uid, { name: 'B', assignments: [{ ...assignment, initialState: { ...state, workingWeight: 55 } }] });
  await check('draft phase stays hidden until activated', async () => {
    assert.ok((await student.getActivePhaseAssignments(uid)).every((row) => row.phaseId === a));
  });
  await check('A → B → A preserves A state, checklist and a single active phase', async () => {
    await coach.activatePhaseDraft(uid, b);
    await coach.activatePhaseDraft(uid, a);
    const phases = await coach.listPhases(uid);
    assert.equal(phases.filter((phase) => phase.status === 'active').length, 1);
    const active = await student.getActivePhaseAssignments(uid);
    assert.equal(active[0].phaseId, a);
    assert.deepEqual(active[0].state, originalState);
  });
  const draft = { sessionId: 'phase-workout', day: 'Pull', phaseId: a, exercises: [{ source: 'assigned', assignmentId: aRows[0].id }], revision: 0 };
  await check('an unfinished workout blocks switching without changing phases', async () => {
    await student.saveActiveWorkoutDraft(uid, draft);
    await assert.rejects(coach.activatePhaseDraft(uid, b), /chưa ghi nhận/);
    assert.equal((await coach.getActivePhase(uid)).id, a);
    await student.deleteActiveWorkoutDraft(uid, draft.sessionId);
  });
  await check('a stale workout tab cannot recreate a draft after switching', async () => {
    await coach.activatePhaseDraft(uid, b);
    await assert.rejects(student.saveActiveWorkoutDraft(uid, draft), /đã thay đổi/);
    assert.equal(await student.getActiveWorkoutDraft(uid), null);
  });
  await check('coach can edit an archived phase without activating it', async () => {
    await coach.updateAssignmentConfig(uid, aRows[0].id, { 'state.workingWeight': 37.5 }, { reason: 'Điều chỉnh chu kỳ cũ', actorUid: 'phase-coach' });
    assert.equal((await coach.getActivePhase(uid)).id, b);
    await coach.activatePhaseDraft(uid, a);
    assert.equal((await student.getActivePhaseAssignments(uid))[0].state.workingWeight, 37.5);
  });
  await check('student and unrelated account cannot switch phases or edit another client', async () => {
    await assert.rejects(student.activatePhaseDraft(uid, b));
    await assert.rejects(other.activatePhaseDraft(uid, b));
    await assert.rejects(other.importTemplateExercises(uid, [contaminated], 'Pull'));
  });
  await check('a removed exercise stays removed when revisiting a phase', async () => {
    const removable = await coach.createAssignment(uid, { ...assignment, phaseId: a });
    await coach.setAssignmentActive(uid, removable.id, false);
    await coach.activatePhaseDraft(uid, b);
    await coach.activatePhaseDraft(uid, a);
    assert.equal((await student.getActivePhaseAssignments(uid)).some((row) => row.id === removable.id), false);
  });
  await check('two concurrent activation requests keep exactly one active phase', async () => {
    const results = await Promise.allSettled([coach.activatePhaseDraft(uid, b), coach.activatePhaseDraft(uid, b)]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal((await coach.listPhases(uid)).filter((phase) => phase.status === 'active').length, 1);
  });
  await check('unconfigured bodyweight template blocks phase activation too', async () => {
    const rows = buildDraftAssignmentsFromSelections([{ sourceType: 'template', dayLabel: 'BW', exercises: [{ exerciseId: 'push_up' }] }]);
    const pending = await coach.createPhaseDraft(uid, { name: 'Pending', assignments: rows });
    await assert.rejects(coach.activatePhaseDraft(uid, pending), /thiết lập/);
  });
  await check('import is visible in the first draft when no phase is active yet', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await firestore.setDoc(firestore.doc(context.firestore(), 'students', 'phase-new'), { coachUid: 'phase-coach' });
    });
    const first = await coach.createPhaseDraft('phase-new', { name: 'First', assignments: [assignment] });
    await coach.importTemplateExercises('phase-new', [contaminated], 'Pull');
    const imported = (await coach.getStudentAssignments('phase-new', { activeOnly: false })).find((row) => row.setupRequired);
    assert.equal(imported.phaseId, first);
    assert.equal(imported.active, false);
  });
  console.log(`PHASE_TEMPLATE_OK ${count} / ${count} passed`);
} finally { await env.cleanup(); }
