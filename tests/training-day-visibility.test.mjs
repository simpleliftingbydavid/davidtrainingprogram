// Run with:  node tests/training-day-visibility.test.mjs
import assert from 'node:assert/strict';
import {
  canHideDay, frequenciesWithPausedDays, isDayHidden, normalizeHiddenDays,
  prunedHiddenDays, splitDaysByVisibility, toggleHiddenDay,
} from '../training-day-visibility.js';
import { phaseDayFrequencies, plannedVolumeByMuscle } from '../volume-engine.js';
import { buildPhaseReviewSnapshot } from '../deload-review-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('a stored list is cleaned of blanks, padding and duplicates', () => {
  assert.deepEqual(normalizeHiddenDays([' Upper ', 'Upper', '', null, 'Lower']), ['Upper', 'Lower']);
  assert.deepEqual(normalizeHiddenDays(undefined), []);
  // Firestore can hand back anything a bad write put there; it must not throw.
  assert.deepEqual(normalizeHiddenDays('Upper'), []);
});

check('a day is matched after trimming, so a stray space does not un-pause it', () => {
  assert.equal(isDayHidden(' Upper ', ['Upper']), true);
  assert.equal(isDayHidden('Upper', ['Lower']), false);
});

check('toggling adds then removes, leaving the rest alone', () => {
  assert.deepEqual(toggleHiddenDay('Upper', []), ['Upper']);
  assert.deepEqual(toggleHiddenDay('Upper', ['Upper', 'Lower']), ['Lower']);
  assert.deepEqual(toggleHiddenDay('  ', ['Lower']), ['Lower']);
});

check('the last remaining day cannot be paused', () => {
  const days = ['Upper', 'Lower', 'Push', 'Pull'];
  assert.equal(canHideDay('Upper', days, []).allowed, true);
  assert.equal(canHideDay('Pull', days, ['Upper', 'Lower']).allowed, true);
  // Three already paused: pausing the fourth would leave nothing to train.
  const verdict = canHideDay('Pull', days, ['Upper', 'Lower', 'Push']);
  assert.equal(verdict.allowed, false);
  assert.match(verdict.reason, /duy nhất còn lại/);
});

check('a paused day can always be un-paused, even when it is the only one left', () => {
  // Resuming never reduces what the student has to train, so the guard above
  // must not block it — otherwise a programme could be locked into one state.
  assert.equal(canHideDay('Pull', ['Upper', 'Pull'], ['Upper', 'Pull']).allowed, true);
});

check('the student keeps seeing paused days, listed separately', () => {
  const split = splitDaysByVisibility(['Upper', 'Lower', 'Push'], ['Lower']);
  assert.deepEqual(split.activeDays, ['Upper', 'Push']);
  assert.deepEqual(split.pausedDays, ['Lower']);
});

check('a paused day counts as zero sets while paused', () => {
  const frequencies = { Upper: 2, Lower: 1.5, Push: 1 };
  assert.deepEqual(frequenciesWithPausedDays(frequencies, ['Lower']), { Upper: 2, Lower: 0, Push: 1 });
});

check("pausing never overwrites the coach's own weekly frequency", () => {
  // The whole reason pausing is stored separately: resume must bring back the
  // number the coach chose, not a zero left behind by the pause.
  const phase = { volumePlan: { dayFrequencies: { Upper: 2, Lower: 3 } } };
  const assignments = [{ dayLabel: 'Upper' }, { dayLabel: 'Lower' }];
  assert.deepEqual(phaseDayFrequencies(assignments, phase, ['Lower']), { Upper: 2, Lower: 0 });
  
  assert.deepEqual(phaseDayFrequencies(assignments, phase, []), { Upper: 2, Lower: 3 });
});

check('planned volume drops by exactly the paused day and comes back on resume', () => {
  const assignments = [
    { dayLabel: 'Upper', schemeParams: { startingSets: 3 }, state: { currentSets: 3 }, volumeConfig: { credits: [{ muscleGroup: 'Ngực', credit: 1 }] } },
    { dayLabel: 'Lower', schemeParams: { startingSets: 4 }, state: { currentSets: 4 }, volumeConfig: { credits: [{ muscleGroup: 'Đùi trước', credit: 1 }] } },
  ];
  const lookup = () => null;
  const phase = { volumePlan: { dayFrequencies: { Upper: 1, Lower: 2 } } };
  const before = plannedVolumeByMuscle(assignments, lookup, phaseDayFrequencies(assignments, phase, []));
  assert.equal(before['Ngực'], 3);
  assert.equal(before['Đùi trước'], 8);

  
  const during = plannedVolumeByMuscle(assignments, lookup, phaseDayFrequencies(assignments, phase, ['Lower']));
  assert.equal(during['Ngực'], 3, 'the day still trained must be untouched');
  assert.equal(during['Đùi trước'], 0, 'the paused day must contribute nothing');

  const after = plannedVolumeByMuscle(assignments, lookup, phaseDayFrequencies(assignments, phase, []));
  assert.deepEqual(after, before, 'resuming must restore the original plan exactly');
});

check('a phase with no pause list behaves exactly as before the feature existed', () => {
  const assignments = [{ dayLabel: 'Upper' }, { dayLabel: 'Lower' }];
  assert.deepEqual(phaseDayFrequencies(assignments, { volumePlan: { dayFrequencies: { Upper: 2 } } }), { Upper: 2, Lower: 1 });
  assert.deepEqual(phaseDayFrequencies(assignments, null), { Upper: 1, Lower: 1 });
});


check('a paused day is not counted as sessions the student failed to do', () => {
  // deload-review-engine reads the weekly frequency to work out how many
  // sessions a phase planned for. Read without the pause applied, a paused day
  // keeps demanding sessions, and the phase summary reports the student as
  // behind on work the coach switched off.
  const start = Date.UTC(2026, 0, 1);
  const end = Date.UTC(2026, 0, 28);
  const phase = { volumePlan: { dayFrequencies: { Upper: 1, Lower: 1 } }, plannedStartDate: '2026-01-01', plannedEndDate: '2026-01-28' };
  const full = buildPhaseReviewSnapshot({ phase, coachReflection: { workedWell: 'ok', needsChange: 'ok', nextCycleDecision: 'ok' }, assignments: [], sessions: [], checkIns: [], coachingAlerts: [], now: end });
  const paused = buildPhaseReviewSnapshot({ phase, hiddenDays: ['Lower'], coachReflection: { workedWell: 'ok', needsChange: 'ok', nextCycleDecision: 'ok' }, assignments: [], sessions: [], checkIns: [], coachingAlerts: [], now: end });
  assert.ok(full.adherence.plannedSessions > 0, 'baseline must plan some sessions');
  assert.equal(paused.adherence.plannedSessions, Math.round(full.adherence.plannedSessions / 2),
    'pausing one of two equal days must halve the planned sessions');
  void start;
});


check('stale pauses are pruned on write, live ones kept', () => {
  // The coach switched the day off for a reason that outlives one cycle. A new
  // phase quietly switching it back on would put the student on four days again
  // without anyone deciding to.
  assert.deepEqual(prunedHiddenDays(['Lower'], ['Upper', 'Lower', 'Push']), ['Lower']);
});

check('a pause for a day the programme no longer has is dropped', () => {
  // Kept, it would be invisible in the interface, impossible to clear, and
  // waiting to silently pause a future day that reuses the name.
  assert.deepEqual(prunedHiddenDays(['Lower Accessory'], ['Upper', 'Lower']), []);
  assert.deepEqual(prunedHiddenDays(['Lower', 'Gone'], ['Lower']), ['Lower']);
});

check('an empty list and an empty programme both prune to nothing', () => {
  assert.deepEqual(prunedHiddenDays(undefined, ['Upper', 'Lower']), []);
  assert.deepEqual(prunedHiddenDays(['Upper'], []), []);
});
if (process.exitCode) process.exit(1);
console.log(`TRAINING_DAY_VISIBILITY_OK ${passed} / ${passed} passed`);
