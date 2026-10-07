// Run with:  node tests/volume-frequency-inheritance.test.mjs
//
// A new cycle used to reset every day to one session a week, throwing away the
// coach's own numbers. These cover what it carries, what it refuses to carry,
// and that it leaves a first cycle looking exactly as it did before.
import assert from 'node:assert/strict';
import { inheritedDayFrequencies, phaseDayFrequencies, plannedVolumeByMuscle } from '../volume-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const phase = (order, dayFrequencies) => ({ order, volumePlan: { dayFrequencies } });

check("a new cycle starts with the previous cycle's frequencies", () => {
  const phases = [phase(1, { Upper: 1.5, Lower: 2 })];
  assert.deepEqual(inheritedDayFrequencies(phases, ['Upper', 'Lower']), { Upper: 1.5, Lower: 2 });
});

check('the most recent cycle wins where two disagree', () => {
  // listPhases returns ascending order, so later entries must override earlier.
  const phases = [phase(1, { Upper: 1 }), phase(2, { Upper: 3 })];
  assert.deepEqual(inheritedDayFrequencies(phases, ['Upper']), { Upper: 3 });
});

check('a day that sat out one cycle still returns at the number last chosen for it', () => {
  // Read only from the latest phase, Lower would come back at the default 1
  // simply because the middle cycle happened not to include it.
  const phases = [phase(1, { Upper: 1, Lower: 2 }), phase(2, { Upper: 2 })];
  assert.deepEqual(inheritedDayFrequencies(phases, ['Upper', 'Lower']), { Upper: 2, Lower: 2 });
});

check('days the new cycle does not have are dropped', () => {
  // Otherwise a renamed or retired day keeps a frequency nothing in the
  // interface can reach, waiting to apply itself to a future day of that name.
  const phases = [phase(1, { Upper: 2, 'Lower Accessory': 3 })];
  assert.deepEqual(inheritedDayFrequencies(phases, ['Upper', 'Lower']), { Upper: 2 });
});

check('a stored zero is not inherited', () => {
  // Zero was how a coach switched a day off before paused days existed. Carried
  // forward it would plan nothing for a day the interface shows as trainable.
  const phases = [phase(1, { Upper: 2, Lower: 0 })];
  assert.deepEqual(inheritedDayFrequencies(phases, ['Upper', 'Lower']), { Upper: 2 });
});

check('a first cycle inherits nothing, so it is stored as it always was', () => {
  assert.deepEqual(inheritedDayFrequencies([], ['Upper', 'Lower']), {});
  assert.deepEqual(inheritedDayFrequencies([{ order: 1 }], ['Upper']), {});
  assert.deepEqual(inheritedDayFrequencies(undefined, undefined), {});
});

check('rubbish in the stored plan cannot throw or leak through', () => {
  const phases = [phase(1, { '  Upper  ': '2', '': 5, Lower: 'rất nhiều' })];
  assert.deepEqual(inheritedDayFrequencies(phases, ['Upper', 'Lower']), { Upper: 2 });
});

check('the inherited plan reproduces the previous cycle\'s planned volume exactly', () => {
  // The point of the whole change: the figures the coach checks against MEV and
  // MRV must not move just because a new cycle began.
  const assignments = [
    { dayLabel: 'Upper', schemeParams: { startingSets: 3 }, state: { currentSets: 3 }, volumeConfig: { credits: [{ muscleGroup: 'Ngực', credit: 1 }] } },
    { dayLabel: 'Lower', schemeParams: { startingSets: 4 }, state: { currentSets: 4 }, volumeConfig: { credits: [{ muscleGroup: 'Đùi trước', credit: 1 }] } },
  ];
  const lookup = () => null;
  const oldPhase = phase(1, { Upper: 2, Lower: 3 });

  const before = plannedVolumeByMuscle(assignments, lookup, phaseDayFrequencies(assignments, oldPhase));
  assert.equal(before['Ngực'], 6);
  assert.equal(before['Đùi trước'], 12);

  // What the old code produced for the next cycle: nothing carried, so 1× each.
  const withoutInheritance = plannedVolumeByMuscle(assignments, lookup, phaseDayFrequencies(assignments, { volumePlan: {} }));
  assert.equal(withoutInheritance['Ngực'], 3, 'the bug being fixed: volume silently halves');
  assert.equal(withoutInheritance['Đùi trước'], 4);

  const newPhase = { order: 2, volumePlan: { dayFrequencies: inheritedDayFrequencies([oldPhase], ['Upper', 'Lower']) } };
  const after = plannedVolumeByMuscle(assignments, lookup, phaseDayFrequencies(assignments, newPhase));
  assert.deepEqual(after, before, 'a new cycle must plan the same volume as the one it follows');
});

check('inheritance and pausing stay independent', () => {
  // Pausing lives on the student and is applied on read, so an inherited plan
  // must still show zero for a paused day while keeping the coach's number.
  const assignments = [{ dayLabel: 'Upper' }, { dayLabel: 'Lower' }];
  const inherited = inheritedDayFrequencies([phase(1, { Upper: 2, Lower: 3 })], ['Upper', 'Lower']);
  const newPhase = { order: 2, volumePlan: { dayFrequencies: inherited } };
  assert.deepEqual(phaseDayFrequencies(assignments, newPhase, ['Lower']), { Upper: 2, Lower: 0 });
  assert.deepEqual(newPhase.volumePlan.dayFrequencies.Lower, 3, 'the stored number must survive the pause');
  assert.deepEqual(phaseDayFrequencies(assignments, newPhase, []), { Upper: 2, Lower: 3 });
});

check('the frequency form must offer the stored number for a paused day, not zero', () => {
  // Found while wiring inheritance up. coach.html filled the inputs from the
  // paused-adjusted frequencies, so a paused day showed 0 — and "Lưu tần suất
  // tuần" posts whatever is in the inputs, which wrote that 0 straight into the
  // plan. The day then resumed at nothing, which is exactly what pausing was
  // built not to do. The form reads the plan; only the volume figures subtract.
  const assignments = [{ dayLabel: 'Upper' }, { dayLabel: 'Lower' }];
  const stored = { order: 1, volumePlan: { dayFrequencies: { Upper: 2, Lower: 3 } } };

  const forTheForm = phaseDayFrequencies(assignments, stored);
  assert.equal(forTheForm.Lower, 3, 'the input must show what the coach chose');

  // Saving the form unchanged must be a no-op on the stored plan.
  assert.deepEqual(forTheForm, stored.volumePlan.dayFrequencies);

  const forTheVolumeFigures = phaseDayFrequencies(assignments, stored, ['Lower']);
  assert.equal(forTheVolumeFigures.Lower, 0, 'planned volume must still subtract the pause');
});

if (process.exitCode) process.exit(1);
console.log(`VOLUME_FREQUENCY_INHERITANCE_OK ${passed} / ${passed} passed`);
