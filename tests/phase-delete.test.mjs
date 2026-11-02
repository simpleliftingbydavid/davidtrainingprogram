// David removes old cycles from a student's list (2026-11-02). A removed cycle keeps all its
// data and can be restored; it only leaves the list and the "pick sessions" options.
//   node tests/phase-delete.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPhaseSourceOptions, canDeletePhase, isPhaseDeleted } from '../phase-draft-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const stamp = { toDate: () => new Date('2026-11-02T08:00:00+07:00') };

check('only an archived cycle that is still listed can be removed', () => {
  assert.equal(canDeletePhase({ status: 'completed' }), true);
  assert.equal(canDeletePhase({ status: 'completed', deletedAt: stamp }), false);
  assert.equal(canDeletePhase({ status: 'active' }), false);
  assert.equal(canDeletePhase({ status: 'draft' }), false);
  assert.equal(canDeletePhase(null), false);
});

check('a restored cycle (deletedAt cleared) counts as listed again', () => {
  assert.equal(isPhaseDeleted({ deletedAt: stamp }), true);
  assert.equal(isPhaseDeleted({ deletedAt: null }), false);
  assert.equal(isPhaseDeleted({}), false);
});

check('a removed cycle no longer offers its sessions for a new cycle', () => {
  const phases = [
    { id: 'old', name: 'Cũ', status: 'completed', deletedAt: stamp },
    { id: 'kept', name: 'Giữ', status: 'completed' },
    { id: 'now', name: 'Hiện tại', status: 'active' },
  ];
  const assignments = ['old', 'kept', 'now'].map((phaseId, index) => ({
    id: `a${index}`, phaseId, dayLabel: 'Upper', orderInDay: 0, exerciseId: 'x',
  }));
  const { student } = buildPhaseSourceOptions(assignments, phases, []);
  assert.deepEqual(student.map((option) => option.sourceId).sort(), ['kept', 'now']);
  assert.ok(student.every((option) => option.sourceName !== 'Giáo án trước chu kỳ'),
    'its exercises must not show up as the pre-cycle program');
});

check('removing never erases: the data call only stamps deletedAt, and activation clears it', () => {
  const source = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('export async function setPhasesDeleted'));
  const fn = body.slice(0, body.search(/\r?\n}\r?\n/) + 4);
  assert.match(fn, /deletedAt: deleted \? serverTimestamp\(\) : null/);
  assert.doesNotMatch(fn, /batch\.delete|deleteDoc/);
  assert.match(fn, /status !== 'completed'/);
  assert.match(source, /target\.deletedAt \? \{ deletedAt: null \}/);
});

check('the coach list hides removed cycles and offers them back', () => {
  const page = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  assert.match(page, /phasesCache\.filter\(\(phase\) => !isPhaseDeleted\(phase\)\)/);
  assert.match(page, /id="phase-deleted-wrap"/);
  assert.match(page, /Khôi phục/);
  assert.match(page, /id="phase-select-toggle"/);
});

console.log(`PHASE_DELETE_OK ${passed} passed`);
