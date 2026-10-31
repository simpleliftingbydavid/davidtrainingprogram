// Set boxes accept a decimal comma (Khánh Linh, 2026-10-31: an iPhone set to Vietnamese threw
// "12,5" away in a number box, the done set was locked, and the only way out was to skip DB Rows).
//   node tests/set-number-input.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { invalidSetFields, normalizeSetNumber, validateSessionExerciseInputs } from '../session-entry-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('a decimal comma reads as a decimal point', () => {
  assert.equal(normalizeSetNumber('12,5'), '12.5');
  assert.equal(normalizeSetNumber(' 12.5 '), '12.5');
  assert.equal(normalizeSetNumber(''), '');
  assert.equal(normalizeSetNumber(null), '');
});

check('the boxes that cannot be saved are named', () => {
  assert.deepEqual(invalidSetFields({ weight: '12,5', reps: '8', rir: '0' }), []);
  assert.deepEqual(invalidSetFields({ weight: '', reps: '8', rir: '0' }), ['set-weight']);
  assert.deepEqual(invalidSetFields({ weight: '12', reps: '0', rir: '11' }), ['set-reps', 'set-rir']);
});

check('a normalized comma weight passes the save check', () => {
  const sets = [{ setIndex: 1, weight: normalizeSetNumber('12,5'), reps: '10', rir: '0', completed: true }];
  assert.deepEqual(validateSessionExerciseInputs([{ source: 'assigned', assignmentId: 'a1', exerciseId: 'db_rows', exerciseNameSnapshot: { vi: 'DB Rows' }, sets }]), []);
});

check('the workout page uses text boxes, checks a set before locking it, and reopens bad done sets', () => {
  const page = readFileSync(new URL('../client.html', import.meta.url), 'utf8');
  assert.match(page, /type="text" inputmode="decimal" autocomplete="off" class="set-weight"/);
  assert.doesNotMatch(page, /type="number"[^>]*class="set-(weight|reps|rir)"/);
  assert.match(page, /weight: normalizeSetNumber\(row\.querySelector\('\.set-weight'\)\.value\)/);
  assert.match(page, /reopenInvalidSets\(\);\s+alert\(inputIssues\[0\]\);/);
});

console.log(`SET_NUMBER_INPUT_OK ${passed} passed`);
