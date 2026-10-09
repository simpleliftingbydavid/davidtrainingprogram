// Run with:  node tests/day-label-utils.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  STARTER_DAY_LABELS, earlierCycleLabels, filterDayLabels, labelKey, nearDuplicateLabel, nextDayLabels,
} from '../day-label-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const day = (label, count = 3, paused = false) => ({ label, count, paused });
const xuanHuy = [day('Lower 1'), day('Lower 2'), day('NH - Upper'), day('Practice - Fullbody')];

check('case, accents, spacing and punctuation do not change a label key', () => {
  assert.equal(labelKey('Lower 1'), 'lower1');
  assert.equal(labelKey(' LOWER-1 '), 'lower1');
  assert.equal(labelKey('Đùi trước'), 'duitruoc');
  assert.equal(labelKey(null), '');
});

check('an empty search lists every day, unchanged', () => {
  assert.deepEqual(filterDayLabels(xuanHuy, '').map((item) => item.label), xuanHuy.map((item) => item.label));
  assert.deepEqual(filterDayLabels(xuanHuy, '  ').length, 4);
});

check('typing finds days by the start of the label or of any word in it', () => {
  assert.deepEqual(filterDayLabels(xuanHuy, 'low').map((item) => item.label), ['Lower 1', 'Lower 2']);
  assert.deepEqual(filterDayLabels(xuanHuy, 'upp').map((item) => item.label), ['NH - Upper'], 'a later word counts');
  assert.deepEqual(filterDayLabels(xuanHuy, 'full').map((item) => item.label), ['Practice - Fullbody']);
});

check('a match anywhere inside a label is found too, after the matches at the start', () => {
  const found = filterDayLabels([day('Slow tempo'), day('Lower 1'), day('Allow')], 'low').map((item) => item.label);
  assert.deepEqual(found, ['Lower 1', 'Slow tempo', 'Allow']);
});

check('typing a space or a hyphen still finds the day', () => {
  assert.deepEqual(filterDayLabels(xuanHuy, 'lower 2').map((item) => item.label), ['Lower 2']);
  assert.deepEqual(filterDayLabels(xuanHuy, 'nh-up').map((item) => item.label), ['NH - Upper']);
});

check('nothing matches nonsense', () => {
  assert.deepEqual(filterDayLabels(xuanHuy, 'zzz'), []);
});

check('a label that differs only by case, accents or spacing is flagged as the same day', () => {
  assert.deepEqual(nearDuplicateLabel(xuanHuy, 'Lower1'), { label: 'Lower 1', kind: 'same' });
  assert.deepEqual(nearDuplicateLabel(xuanHuy, 'lower 2'), { label: 'Lower 2', kind: 'same' });
  assert.deepEqual(nearDuplicateLabel(xuanHuy, 'nh upper'), { label: 'NH - Upper', kind: 'same' });
});

check('one slipped character is flagged as a probable typo', () => {
  assert.deepEqual(nearDuplicateLabel(xuanHuy, 'Lowr 1'), { label: 'Lower 1', kind: 'typo' });
  assert.deepEqual(nearDuplicateLabel(xuanHuy, 'Lowerr 2'), { label: 'Lower 2', kind: 'typo' });
});

check('a new numbered day is not mistaken for a typo of its neighbour', () => {
  assert.equal(nearDuplicateLabel(xuanHuy, 'Lower 3'), null);
  assert.equal(nearDuplicateLabel([day('Upper 1')], 'Upper 2'), null);
  assert.equal(nearDuplicateLabel([day('Day 1'), day('Day 2')], 'Day 3'), null);
});

check('an exact existing label, a genuinely new one, and an empty box raise no warning', () => {
  assert.equal(nearDuplicateLabel(xuanHuy, 'Lower 1'), null);
  assert.equal(nearDuplicateLabel(xuanHuy, 'Push'), null);
  assert.equal(nearDuplicateLabel(xuanHuy, ''), null);
});

check('short labels are never taken for each other', () => {
  const letters = [day('A'), day('B')];
  assert.equal(nearDuplicateLabel(letters, 'C'), null);
  assert.equal(nearDuplicateLabel(letters, 'AB'), null);
  assert.deepEqual(nearDuplicateLabel(letters, 'a'), { label: 'A', kind: 'same' });
});

check('the next label continues the programme\'s own pattern', () => {
  assert.deepEqual(nextDayLabels([day('A'), day('B')]), ['C']);
  assert.deepEqual(nextDayLabels(xuanHuy), ['Lower 3']);
  assert.deepEqual(nextDayLabels([day('Upper 1'), day('Lower 1'), day('Upper 2')]), ['Upper 3', 'Lower 2']);
});

check('there is no next label when nothing follows a pattern, or the pattern is exhausted', () => {
  assert.deepEqual(nextDayLabels([day('Push'), day('Pull')]), []);
  assert.deepEqual(nextDayLabels([]), []);
  assert.deepEqual(nextDayLabels([day('Z')]), []);
});

check('a suggested next label is never one that already exists', () => {
  assert.deepEqual(nextDayLabels([day('Lower 1'), day('Lower 3'), day('lower 4')]), ['Lower 5']);
  assert.deepEqual(nextDayLabels([day('Lower 1'), day('Lower 2'), day('Lower 3')]), ['Lower 4']);
  assert.ok(!nextDayLabels([day('A'), day('C')]).includes('A'));
});

check('earlier-cycle labels leave out days this cycle already has, and repeats', () => {
  assert.deepEqual(earlierCycleLabels(['Lower 1', 'Upper', 'upper', 'Push', '', null], [day('Lower1')]), ['Upper', 'Push']);
});

check('the starter set is what a new cycle is offered', () => {
  assert.ok(STARTER_DAY_LABELS.includes('A') && STARTER_DAY_LABELS.includes('Upper') && STARTER_DAY_LABELS.length >= 8);
});

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');

check('coach.html wires the picker to the day field and keeps the field required', () => {
  assert.match(coach, /id="assign-day"[^>]*required/);
  assert.match(coach, /id="assign-day-picker"/);
  assert.match(coach, /\$\('assign-day'\)\.addEventListener\('input', refreshDayPicker\)/);
  assert.match(coach, /from '\.\/day-label-utils\.js'/);
});

check('the picker lists days of the cycle being managed, not of every cycle at once', () => {
  assert.match(coach, /const \{ visibleAssignments, phaseId \} = managedAssignmentContext\(\)/);
});

console.log(`day-label-utils: ${passed} passed`);
