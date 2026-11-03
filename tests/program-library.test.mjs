// The programme library (2026-11-03): the list first with a search, and several days saved at once.
//   node tests/program-library.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dayExercises, plainText, searchTemplates, studentDays, templateNameFor } from '../program-library-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const templates = [
  { name: 'Strength A — Upper', sourceDayLabel: 'Upper', exercises: [{ exerciseNameSnapshot: { vi: 'Bench Press' } }, { exerciseNameSnapshot: { vi: 'DB Rows' } }] },
  { name: 'Chân — Đùi trước', sourceDayLabel: 'Lower', exercises: [{ exerciseNameSnapshot: { vi: 'Back Squat' } }] },
];

check('search finds by name, day or lift, without accents, every word must match', () => {
  assert.equal(plainText('Đùi trước'), 'dui truoc');
  assert.deepEqual(searchTemplates(templates, 'dui').map((t) => t.sourceDayLabel), ['Lower']);
  assert.deepEqual(searchTemplates(templates, 'squat').map((t) => t.sourceDayLabel), ['Lower']);
  assert.deepEqual(searchTemplates(templates, 'upper rows').map((t) => t.sourceDayLabel), ['Upper']);
  assert.equal(searchTemplates(templates, 'upper squat').length, 0);
  assert.equal(searchTemplates(templates, '  ').length, 2);
});

check('a student\'s days keep the programme order and count their lifts', () => {
  const assignments = [{ dayLabel: 'Upper' }, { dayLabel: 'Lower' }, { dayLabel: 'Upper' }, { dayLabel: '' }];
  assert.deepEqual(studentDays(assignments), [{ label: 'Upper', count: 2 }, { label: 'Lower', count: 1 }]);
});

check('each saved day gets its own name, sharing the name typed', () => {
  assert.equal(templateNameFor('Upper', 'Strength A'), 'Strength A — Upper');
  assert.equal(templateNameFor('Upper', '  '), 'Upper');
});

check('a day is stored in its lift order', () => {
  const assignments = [
    { dayLabel: 'Upper', exerciseId: 'b', orderInDay: 2, exerciseNameSnapshot: { vi: 'B' } },
    { dayLabel: 'Upper', exerciseId: 'a', orderInDay: 1, exerciseNameSnapshot: { vi: 'A' } },
    { dayLabel: 'Lower', exerciseId: 'c', orderInDay: 0 },
  ];
  assert.deepEqual(dayExercises(assignments, 'Upper').map((e) => e.exerciseId), ['a', 'b']);
});

const page = readFileSync(new URL('../program-library.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('the page puts the saved list first and folds the save form', () => {
  assert.ok(page.indexOf('id="template-search"') < page.indexOf('id="save-details"'), 'search and list before the save form');
  assert.ok(page.includes('<details class="card save-card" id="save-details">'));
  assert.ok(page.includes('id="save-day-list"'));
});

console.log(`PROGRAM_LIBRARY_OK ${passed} passed`);
