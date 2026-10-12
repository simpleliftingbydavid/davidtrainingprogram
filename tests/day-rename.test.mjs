// Run with:  node tests/day-rename.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MAX_DAY_LABEL_LENGTH, cleanDayLabel, currentDayName, recordRename, renameInList, renameKey, validateDayRename,
} from '../day-rename-utils.js';
import { nextTrainingDay } from '../home-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const days = ['Upper A', 'Lower A', 'Upper B'];

check('a new name is trimmed and tidied, and a good one passes', () => {
  assert.deepEqual(validateDayRename({ fromLabel: 'Upper A', typed: '  Full   Body ', existingLabels: days }), { ok: true, label: 'Full Body', error: '' });
});

check('an empty, unchanged or over-long name is refused with a reason', () => {
  assert.match(validateDayRename({ fromLabel: 'Upper A', typed: '   ', existingLabels: days }).error, /Nhập tên mới/);
  assert.match(validateDayRename({ fromLabel: 'Upper A', typed: 'Upper A', existingLabels: days }).error, /giống tên hiện tại/);
  assert.match(validateDayRename({ fromLabel: 'Upper A', typed: 'x'.repeat(MAX_DAY_LABEL_LENGTH + 1), existingLabels: days }).error, /tối đa 40/);
});

check('a name another day already has is refused, however it is spelled, because it would merge two days', () => {
  for (const typed of ['Lower A', 'lower a', 'LOWER-A', 'Lower  A']) {
    const result = validateDayRename({ fromLabel: 'Upper A', typed, existingLabels: days });
    assert.equal(result.ok, false, typed);
    assert.match(result.error, /Đã có buổi “Lower A”/);
  }
});

check('changing only the capital letters or spacing of the day itself is allowed', () => {
  assert.equal(validateDayRename({ fromLabel: 'Upper A', typed: 'UPPER A', existingLabels: days }).ok, true);
});

check('the paused-days list follows the rename and never repeats a name', () => {
  assert.deepEqual(renameInList(['Upper A', 'Lower A'], 'Upper A', 'Full Body'), ['Full Body', 'Lower A']);
  assert.deepEqual(renameInList(['Upper A', 'Full Body'], 'Upper A', 'Full Body'), ['Full Body']);
  assert.deepEqual(renameInList(undefined, 'a', 'b'), []);
});

check('the planned frequency moves to the new name and nothing else changes', () => {
  assert.deepEqual(renameKey({ 'Upper A': 2, 'Lower A': 1 }, 'Upper A', 'Full Body'), { 'Lower A': 1, 'Full Body': 2 });
  assert.deepEqual(renameKey({ 'Lower A': 1 }, 'Upper A', 'Full Body'), { 'Lower A': 1 });
  assert.deepEqual(renameKey(undefined, 'a', 'b'), {});
});

check('the record of old names points every old name at the newest one', () => {
  const first = recordRename({}, 'Upper A', 'Push');
  assert.deepEqual(first, { 'Upper A': 'Push' });
  const second = recordRename(first, 'Push', 'Full Body');
  assert.deepEqual(second, { 'Upper A': 'Full Body', Push: 'Full Body' });
  assert.equal(currentDayName('Upper A', second), 'Full Body');
  assert.equal(currentDayName('Push', second), 'Full Body');
  assert.equal(currentDayName('Lower A', second), 'Lower A');
});

check('a name that is in use again stops being an old name, and a rename back leaves no loop', () => {
  const there = recordRename({}, 'Upper A', 'Push');
  const back = recordRename(there, 'Push', 'Upper A');
  assert.deepEqual(back, { Push: 'Upper A' });
  assert.equal(currentDayName('Upper A', back), 'Upper A');
  assert.equal(currentDayName('x', { x: 'y', y: 'x' }), 'x', 'a loop in bad data cannot hang');
});

check('the record keeps only the newest thirty renames', () => {
  let renames = {};
  for (let i = 0; i < 40; i++) renames = recordRename(renames, `d${i}`, `d${i + 1}`);
  assert.ok(Object.keys(renames).length <= 30);
  assert.equal(renames.d39, 'd40');
});

const session = (dayLabel, daysAgo) => ({ dayLabel, performedAt: new Date(Date.now() - daysAgo * 86400000) });

check('after a rename, the last session under the old name still gives the right next day', () => {
  const rotation = ['Full Body', 'Lower A', 'Upper B'];
  const sessions = [session('Upper A', 2)];
  assert.equal(nextTrainingDay(sessions, rotation, []).day, 'Full Body', 'without the record the rotation starts over');
  assert.equal(nextTrainingDay(sessions, rotation, [], undefined, { 'Upper A': 'Full Body' }).day, 'Lower A');
});

check('without any rename the next day works as before', () => {
  assert.equal(nextTrainingDay([session('Lower A', 1)], days, []).day, 'Upper B');
});

const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');
const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../home.html', import.meta.url), 'utf8');

check('the whole rename is one transaction that also bumps the reorder revision', () => {
  const body = data.slice(data.indexOf('export async function renameAssignmentDay'), data.indexOf('// Phases (periodization)'));
  assert.match(body, /return runTransaction\(db, async \(tx\) => \{/);
  assert.match(body, /tx\.update\(ref, \{ dayLabel: to, updatedAt: serverTimestamp\(\) \}\)/);
  assert.match(body, /assignmentOrderRevision: revision/);
  assert.match(body, /'volumePlan\.dayFrequencies': renameKey\(frequencies, from, to\)/);
  assert.match(body, /dayRenames: recordRename\(student\.dayRenames, from, to\)/);
});

check('the coach page has a rename button on each day, which asks for the new name first', () => {
  assert.match(coach, /id="rename-day-dialog"/);
  assert.match(coach, /maxlength="40"/);
  assert.equal(MAX_DAY_LABEL_LENGTH, 40);
  assert.match(coach, /renameBtn\.addEventListener\('click', \(\) => openRenameDay\(dayLabel, \[\.\.\.groups\.keys\(\)\]\)\)/);
  assert.match(coach, /head\.append\(toggle, renameBtn, pauseBtn\)/);
  assert.match(coach, /updatePausedDays: !editingDraftPhaseId/);
  assert.match(coach, /await loadStudents\(\);\s*await loadPhaseInfo\(\);\s*await loadAssignments\(\{ openDayLabel: check\.label \}\)/);
});

check('the student home page hands the record of renames to the next-day suggestion', () => {
  assert.match(home, /\(val\('profile', null\) \|\| \{\}\)\.dayRenames \|\| \{\}\)/);
});

console.log(`day-rename: ${passed} passed`);
