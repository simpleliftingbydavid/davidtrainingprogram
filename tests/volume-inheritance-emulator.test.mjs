// Runs the real data layer against the Firestore Emulator, under the real
// security rules.  node --experimental-vm-modules tests/volume-inheritance-emulator.test.mjs
//
// The unit tests next door prove inheritedDayFrequencies. Nothing proved the
// wiring — and the wiring is where the bug was: the frequency form had been
// filling its inputs from the paused-adjusted numbers, so saving it wrote a
// zero into the plan. This covers the path a coach actually walks: set weekly
// frequencies on one cycle, start the next, and find the same numbers there.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as firestore from 'firebase/firestore';
import { getExerciseById } from '../exercise-seed-data.js';

import { phaseDayFrequencies } from '../volume-engine.js';

const env = await initializeTestEnvironment({
  projectId: 'demo-david-training-program-volume-inheritance',
  firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
});

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

const uid = 'volume-student';
const coachUid = 'volume-coach';

// Fully configured, because an assignment still awaiting setup blocks
// activation and this suite needs to get past it to reach a second cycle.
const library = getExerciseById('machine_rows');
const schemeParams = { ...library.defaultParams, restSeconds: 90 };
const initialState = { workingWeight: 35, currentSets: 3, currentReps: 8, progressionStep: 1, progressionCycle: 1 };

function daysOf(...dayLabels) {
  return dayLabels.map((dayLabel) => ({
    exerciseId: library.exerciseId,
    exerciseNameSnapshot: { vi: library.nameVi },
    dayLabel,
    scheme: 8,
    schemeParams,
    initialState,
  }));
}

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await firestore.setDoc(firestore.doc(context.firestore(), 'coaches', coachUid), {});
    await firestore.setDoc(firestore.doc(context.firestore(), 'students', uid), { coachUid, clientCategory: 'online' });
  });
  const coach = await dataLayer(env.authenticatedContext(coachUid).firestore());

  async function lockActiveReview() {
    const phase = await coach.getActivePhase(uid);
    if (!phase || await coach.getPhaseReview(uid, phase)) return;
    await coach.createLockedPhaseReview(uid, phase.id, {
      schemaVersion: 1, status: 'locked',
      phase: { id: phase.id, name: phase.name, activationRevision: Math.max(1, Number(phase.activationRevision) || 1), snapshotAtMs: Date.now() },
      coachReflection: { workedWell: 'ok', needsChange: 'ok', nextCycleDecision: 'ok', notes: '' },
    }, coachUid);
  }

  const first = await coach.createPhaseDraft(uid, { name: 'Chu kỳ 1', assignments: daysOf('Upper', 'Lower') });

  await check('a first cycle is stored with no volume plan at all', async () => {
    // Nothing to inherit, so the document must look exactly as it did before
    // this feature existed — not a plan full of defaults nobody chose.
    const [phase] = (await coach.listPhases(uid)).filter((item) => item.id === first);
    assert.equal(phase.volumePlan, undefined);
  });

  await coach.activatePhaseDraft(uid, first);
  await coach.setPhaseVolumePlan(uid, first, { Upper: 1.5, Lower: 2 });

  const second = await coach.createPhaseDraft(uid, { name: 'Chu kỳ 2', assignments: daysOf('Upper', 'Lower') });

  await check("the next cycle opens with the coach's own weekly frequencies", async () => {
    const phases = await coach.listPhases(uid);
    const phase = phases.find((item) => item.id === second);
    assert.deepEqual(phase.volumePlan?.dayFrequencies, { Upper: 1.5, Lower: 2 });
    // And the figures the coach reads off the dashboard must match too.
    const assignments = await coach.getStudentAssignments(uid, { activeOnly: false });
    const rows = assignments.filter((item) => item.phaseId === second);
    assert.deepEqual(phaseDayFrequencies(rows, phase), { Upper: 1.5, Lower: 2 });
  });

  await check('the security rules accept the inherited plan on create', async () => {
    // phases/{phaseId} is `allow write: if isAssignedCoach(studentId)` with no
    // field whitelist, so no rules change was needed — asserted here rather
    // than assumed, because a rules tightening later would break cycle
    // creation outright and nothing else would catch it.
    const phase = (await coach.listPhases(uid)).find((item) => item.id === second);
    assert.ok(phase.volumePlan.updatedAt, 'the write went through with its timestamp');
  });

  await check('a day the new cycle does not have is not carried into it', async () => {
    await lockActiveReview();
    await coach.activatePhaseDraft(uid, second);
    await lockActiveReview();
    const third = await coach.createPhaseDraft(uid, { name: 'Chu kỳ 3', assignments: daysOf('Upper') });
    const phase = (await coach.listPhases(uid)).find((item) => item.id === third);
    assert.deepEqual(phase.volumePlan?.dayFrequencies, { Upper: 1.5 });
  });

  await check('pausing a day never writes into the stored plan', async () => {
    // The bug this suite exists for. Pausing is a student-level field; the
    // phase's own numbers must be untouched by it.
    await coach.setStudentHiddenDays(uid, ['Upper']);
    const phase = (await coach.listPhases(uid)).find((item) => item.id === second);
    assert.deepEqual(phase.volumePlan.dayFrequencies, { Upper: 1.5, Lower: 2 },
      'the plan must still hold the numbers the coach chose');
    const student = await coach.getStudent(uid);
    assert.deepEqual(student.hiddenDays, ['Upper']);
    await coach.setStudentHiddenDays(uid, []);
  });

  console.log(`VOLUME_INHERITANCE_EMULATOR_OK ${count} / ${count} passed`);
} finally {
  await env.cleanup();
}
