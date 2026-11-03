// The student overview's layout (2026-11-03): the roster as one line per student, a student's
// results before the nutrition settings (folded), and links both ways to the coach's page.
//   node tests/overview-layout.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8').replace(/\r/g, '');
const page = read('overview.html');
const coach = read('coach.html');
let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('the roster is one linked line per student, flagged lines marked', () => {
  assert.ok(page.includes('<div class="ov-table" role="table" aria-label="Học viên">'));
  assert.ok(page.includes('<a class="ov-trow${row.reasons.length ? \' is-flagged\' : \'\'}" role="row" href="${link}">'));
  assert.ok(page.includes("document.body.classList.toggle('ov-wide', view === 'all');"));
});

check('a student page shows results first and folds the settings, kept open after a save', () => {
  const body = page.slice(page.indexOf('// Results first'), page.indexOf('bindStudent(row);'));
  assert.ok(body.indexOf('nutritionDetail(row)') < body.indexOf('settingsDetail(row)'), 'nutrition before settings');
  assert.ok(page.includes('<details class="cu-card ov-section ov-settings-card" id="ov-settings-card"${settingsOpen ? \' open\' : \'\'}>'));
  assert.ok(page.includes('settingsOpen = true;'));
});

check('the overview and the coach page link to each other', () => {
  assert.ok(page.includes('href="coach.html?student=${id}">Giáo án</a>'));
  assert.ok(page.includes('href="nutrition.html?student=${id}">Dinh dưỡng</a>'));
  assert.ok(coach.includes('<a id="student-overview-link" href="#" class="btn btn-outline"'));
  assert.ok(coach.includes("$('student-overview-link').href = 'overview.html?student=' + encodeURIComponent(studentId);"));
  assert.ok(coach.includes("if (studentUid && !noteId && students.some((item) => item.id === studentUid)) { await selectStudent(studentUid); return; }"));
});

console.log(`OVERVIEW_LAYOUT_OK ${passed} passed`);
