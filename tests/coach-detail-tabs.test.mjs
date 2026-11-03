// The coach's student page (2026-11-03): it opens in place of the lists, with a back button,
// and is split into Giáo án · Theo dõi · Lịch sử.
//   node tests/coach-detail-tabs.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

function panel(name) {
  const start = html.indexOf(`class="detail-panel" data-detail-panel="${name}"`);
  assert.ok(start > 0, `panel ${name} missing`);
  const next = html.indexOf('class="detail-panel"', start + 10);
  return html.slice(start, next > 0 ? next : html.indexOf('</section>\r\n</div>', start) + 1 || undefined);
}

check('each part of the student page sits in its own tab', () => {
  const plan = panel('plan');
  for (const id of ['phase-bar', 'phase-history-wrap', 'assignment-heading-title', 'assignment-groups', 'assign-form-wrap']) assert.ok(plan.includes(`id="${id}"`), `${id} not in Giáo án`);
  const track = panel('track');
  for (const id of ['coaching-foundation-card', 'volume-dashboard', 'rir-calibration-dashboard', 'stage4-dashboard']) assert.ok(track.includes(`id="${id}"`), `${id} not in Theo dõi`);
  assert.ok(panel('history').includes('id="session-history"'));
});

check('the exercise list follows its own heading, with no cards in between', () => {
  const between = html.slice(html.indexOf('id="assignment-heading-title"'), html.indexOf('id="assignment-groups"'));
  assert.ok(!between.includes('class="card'), 'a card sits between the heading and the list');
});

check('forms and jumps switch to the tab that holds them', () => {
  assert.ok(/function openPhaseForm\(mode\) \{\r?\n  setDetailTab\('plan'\)/.test(html));
  assert.ok(/function openAssignForm\(assignment\) \{\r?\n  setDetailTab\('plan'\)/.test(html));
  assert.ok(!html.includes("$('stage4-dashboard').scrollIntoView"), 'a jump to the deload card skips the tab switch');
  assert.ok(!html.includes("$('coaching-foundation-card').scrollIntoView"), 'a jump to the alerts card skips the tab switch');
});

check('opening a student hides the lists, and back returns to them', () => {
  assert.ok(html.includes('body.student-open #student-directory'));
  assert.ok(html.includes('id="detail-back-btn"'));
  assert.ok(html.includes('showStudentDetail();'));
  assert.ok(html.includes("window.addEventListener('popstate'"));
  assert.ok(html.includes("closeStudentDetail();\r\n    await loadStudents();") || html.includes("closeStudentDetail();\n    await loadStudents();"), 'deleting a student leaves the page open');
});

console.log(`COACH_DETAIL_TABS_OK ${passed} passed`);
