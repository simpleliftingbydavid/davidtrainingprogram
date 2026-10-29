// Run with:  node tests/client-pages.test.mjs
// The client pages that take frame D after the home and workout pages. Pages the coach
// opens too must keep the coach's look: frame D is switched on for a student only.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

/** Every selector of a stylesheet, comments and @media wrappers left out. */
function selectors(css) {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{/g, '');
  return [...flat.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((match) => match[1].split(',').map((part) => part.trim())).filter(Boolean);
}

check('nutrition: every rule of the student look is scoped to the student', () => {
  const loose = selectors(read('client-nutrition.css'))
    .filter((selector) => !/^body\.(client-ui|cu-nutri)\b/.test(selector) && !/^\.cu-/.test(selector));
  assert.deepEqual(loose, [], 'a rule that would also reach the coach');
});

check('nutrition: the look is switched on for a student only, never in the markup', () => {
  const page = read('nutrition.html');
  assert.match(page, /<body>/, 'no client-ui class written into the page');
  assert.match(page, /if \(role === 'student'\) useClientLook\(\);/);
  assert.equal(page.match(/useClientLook\(\)/g).length, 2, 'defined once, called once');
  assert.match(page, /id="cu-n-hero"[^>]*hidden/, 'the navy band starts hidden');
  assert.match(page, /<link rel="stylesheet" href="client-nutrition\.css">/);
});

check('nutrition: the band counts today\'s meals from memory, whichever day is on screen', () => {
  const page = read('nutrition.html');
  const hero = page.slice(page.indexOf('function renderClientHero'), page.indexOf('function loadPage'));
  assert.match(hero, /mealsForDate\(plan, today\)/);
  assert.match(hero, /completedToday\.has/);
  assert.doesNotMatch(hero, /shownMeals\(\)|querySelectorAll/, 'not read off the page');
});

check('habits: every rule of the student look is scoped to the student', () => {
  const loose = selectors(read('client-habits.css'))
    .filter((selector) => !/^body\.(client-ui|cu-habits)\b/.test(selector) && !/^\.cu-/.test(selector));
  assert.deepEqual(loose, [], 'a rule that would also reach the coach');
});

check('habits: the look is switched on for a student only; the coach stays read-only in the old look', () => {
  const page = read('habits.html');
  assert.match(page, /<body>/, 'no client-ui class written into the page');
  assert.match(page, /id="cu-h-hero"[^>]*hidden/, 'the navy band starts hidden');
  const student = page.slice(page.indexOf("if (role === 'student') {"), page.indexOf('} else {', page.indexOf("if (role === 'student') {")));
  assert.match(student, /useClientLook\(/, 'called in the student branch');
  assert.equal(page.match(/useClientLook\(/g).length, 2, 'defined once, called once');
  assert.match(page, /if \(!document\.body\.classList\.contains\('cu-habits'\)\) return;/, 'the band draws nothing for the coach');
});

check('progress: every rule of the student look is scoped to the student', () => {
  const loose = selectors(read('client-progress.css'))
    .filter((selector) => !/^body\.(client-ui|cu-progress)\b/.test(selector) && !/^\.cu-/.test(selector));
  assert.deepEqual(loose, [], 'a rule that would also reach the coach');
});

check('progress: the look is switched on for a student only; the coach stays read-only in the old look', () => {
  const page = read('progress-photos.html');
  assert.match(page, /<body>/, 'no client-ui class written into the page');
  assert.match(page, /id="cu-p-hero"[^>]*hidden/, 'the navy band starts hidden');
  const start = page.indexOf("if (myRole === 'student') {");
  const student = page.slice(start, page.indexOf('} else {', start));
  assert.match(student, /useClientLook\(/, 'called in the student branch');
  assert.equal(page.match(/useClientLook\(/g).length, 2, 'defined once, called once');
  assert.match(page, /if \(!document\.body\.classList\.contains\('cu-progress'\)\) return;/, 'the band draws nothing for the coach');
});

check('history: the student-only page wears frame D, with the "Tập luyện" tabs in the band', () => {
  const page = read('history.html');
  assert.match(page, /<body class="client-ui cu-history">/);
  assert.match(page, /<link rel="stylesheet" href="client-history\.css">/);
  const band = page.slice(page.indexOf('<section class="cu-hero"'), page.indexOf('</section>'));
  assert.match(band, /id="training-tabs"/);
  assert.match(page, /HISTORY_MAX\}\+/, 'a full list reads as "at least", not as the total');
  // The tabs' look on the band is shared by the workout page and this one.
  assert.match(read('client-ui.css'), /\.cu-hero \.training-tab\.active/);
  assert.doesNotMatch(read('client-workout.css'), /\.cu-hero \.training-tab/);
});

console.log(`client-pages: ${passed} passed`);
