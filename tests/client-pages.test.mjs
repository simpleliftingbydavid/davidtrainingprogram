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

console.log(`client-pages: ${passed} passed`);
