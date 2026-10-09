// Run with:  node tests/training-section.test.mjs
// The student's navigation: Trang chủ, Tập luyện (workout, programme, history), then the rest.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appShellItems } from '../app-shell.js';
import { roleDestination } from '../auth-session-utils.js';
import { TRAINING_TABS, trainingTabsMarkup } from '../training-tabs.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

check('the student has five navigation items, history is no longer one of them', () => {
  const items = appShellItems('student');
  assert.deepEqual(items.map((item) => item.id), ['home', 'training', 'nutrition', 'habits', 'progress']);
  assert.deepEqual(items.map((item) => item.href), ['home.html', 'client.html', 'nutrition.html', 'habits.html', 'progress-photos.html']);
});

check('the coach navigation is unchanged', () => {
  assert.deepEqual(appShellItems('coach').map((item) => item.label), ['Cần xem lại', 'Giáo án', 'Dinh dưỡng', 'Học viên']);
});

check('a student signs in to the home page, a coach to the dashboard', () => {
  assert.equal(roleDestination('student'), 'home.html');
  assert.equal(roleDestination('coach'), 'coach.html');
});

check('the three Tập luyện pages are joined by one tab bar, the current one marked', () => {
  assert.deepEqual(TRAINING_TABS.map((tab) => tab.href), ['client.html', 'program.html', 'history.html']);
  const html = trainingTabsMarkup('program');
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.match(html, /class="training-tab active" href="program\.html"/);
});

check('all three pages mount the tab bar and highlight Tập luyện in the shell', () => {
  for (const [file, tab] of [['client.html', 'workout'], ['program.html', 'program'], ['history.html', 'history']]) {
    const page = read(file);
    assert.match(page, /id="training-tabs"/, `${file} host`);
    assert.match(page, new RegExp(`mountTrainingTabs\\('${tab}'\\)`), `${file} mount`);
    assert.match(page, /mountAppShell\(\{ role: 'student', active: 'training' \}\)/, `${file} shell`);
  }
});

check('the tab bar is hidden while a workout is running', () => {
  assert.match(read('app-shell.css'), /body\.app-shell-workout-active \.training-tabs \{ display:none; \}/);
});

check('the home page reads each card on its own, so one failed read cannot blank the page', () => {
  const page = read('home.html');
  assert.match(page, /Promise\.allSettled\(KEYS\.map/);
  assert.match(page, /mountAppShell\(\{ role: 'student', active: 'home' \}\)/);
  assert.match(page, /redirectForUnexpectedRole\(role, \['student'\]\)/);
});

check('the programme page is for students and shows paused days', () => {
  const page = read('program.html');
  assert.match(page, /redirectForUnexpectedRole\(role, \['student'\]\)/);
  assert.match(page, /tạm nghỉ/);
});

console.log(`training-section: ${passed} passed`);
