// Run with:  node tests/nutrition-builder-restore.test.mjs
//
// Loading a client's current plan, or reopening a saved version, has to put the
// plan's template, supplements and functional foods back into the controls
// "Tạo kế hoạch để duyệt" reads. When it did not, a plan made from it silently
// lost Omega 3, Creatine, Kim chi and the rest unless the coach re-ticked them.
//
// The page needs Firebase and a signed-in coach, so its own functions are lifted
// out of the module script and run against a small stand-in for the DOM.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { PLAN_TEMPLATES, SUPPLEMENT_OPTIONS, FUNCTIONAL_FOODS } from '../nutrition-engine.js';

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const builder = readFileSync(new URL('../nutrition-builder.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const moduleCode = builder.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
/**
 * Every top-level function of the page. Each one ends at the first line ending
 * in "}" where the source so far parses as a single function — the parser does
 * the brace matching, so braces in strings and one-line functions are handled.
 */
function topLevelFunctions(code) {
  const lines = code.split('\n');
  const found = [];
  lines.forEach((line, start) => {
    if (!/^(?:async )?function \w+\(/.test(line)) return;
    for (let end = start; end < lines.length; end++) {
      if (!/\}\s*$/.test(lines[end])) continue;
      const source = lines.slice(start, end + 1).join('\n');
      try { new vm.Script(`(${source})`); found.push(source); return; } catch { /* not the end yet */ }
    }
    throw new Error(`no end found for: ${line}`);
  });
  return found;
}
const pageFunctions = topLevelFunctions(moduleCode);

function openBuilder({ currentPlan = null } = {}) {
  const field = () => ({ value: '' });
  const elements = {
    'template-id': { value: 'auto', options: Object.keys(PLAN_TEMPLATES).map((value) => ({ value })) },
    'target-kcal': field(), 'target-protein': field(), 'target-carbs': field(), 'target-fat': field(),
    preview: { scrollIntoView() {} },
  };
  const boxes = [
    ...SUPPLEMENT_OPTIONS.map((value) => ({ value, className: 'supplement-check', checked: false })),
    ...FUNCTIONAL_FOODS.map((value) => ({ value, className: 'functional-food-check', checked: false })),
  ];
  const document = {
    getElementById: (id) => elements[id],
    querySelectorAll: (selector) => boxes.filter((box) => selector === '.' + box.className),
  };
  const context = vm.createContext({ document, console, currentPlan });
  const page = vm.runInContext([
    'const $ = (id) => document.getElementById(id);',
    "const studentUid = 'student-1';",
    'let generatedPlan = null, profileCache = null, livePlanVersionId = null, activeDayIndex = 0, dayReports = [], editorShown = false;',
    'const getNutritionProfile = async () => ({});',
    'const getNutritionPlan = async () => currentPlan;',
    'const listNutritionPlanVersions = async () => [];',
    ...pageFunctions,
    // The parts that only draw or fill the profile form are not what is under test.
    'fillProfile = renderPreview = renderVersions = validateTargetsUI = showMessage = () => {};',
    '({ loadData, openVersion, plan: () => generatedPlan })',
  ].join('\n'), context);
  const ticked = (className) => boxes.filter((box) => box.className === className && box.checked).map((box) => box.value);
  return {
    ...page,
    template: () => elements['template-id'].value,
    supplements: () => ticked('supplement-check'),
    functionalFoods: () => ticked('functional-food-check'),
    kcal: () => elements['target-kcal'].value,
  };
}

const CURRENT = {
  kcal: 2400, protein: 160, carbs: 280, fat: 70, sourceTemplateId: 'gain',
  supplements: ['Omega 3', 'D3 + K2', 'Creatine'], functionalFoods: ['Kim chi'],
};

await check('these are the controls the generator reads', () => {
  assert.match(builder, /templateId: \$\('template-id'\)\.value,/);
  assert.match(builder, /functionalFoods: checkedValues\('\.functional-food-check'\),/);
  assert.match(builder, /supplements: checkedValues\('\.supplement-check'\),/);
});

await check('loading the current plan puts its template, supplements and functional foods back', async () => {
  const page = openBuilder({ currentPlan: CURRENT });
  await page.loadData();
  assert.equal(page.template(), 'gain');
  assert.deepEqual(page.supplements(), ['Omega 3', 'D3 + K2', 'Creatine']);
  assert.deepEqual(page.functionalFoods(), ['Kim chi']);
  assert.equal(page.kcal(), 2400, 'the targets are still filled from the plan');
  assert.equal(page.plan(), CURRENT, 'and the plan is still the one previewed');
});

await check('with no current plan the controls stay as the page starts them', async () => {
  const page = openBuilder();
  await page.loadData();
  assert.equal(page.template(), 'auto');
  assert.deepEqual(page.supplements(), []);
  assert.deepEqual(page.functionalFoods(), []);
});

await check('reopening a version replaces the ticks with that version\'s own, rather than adding to them', async () => {
  const page = openBuilder({ currentPlan: CURRENT });
  await page.loadData();
  page.openVersion({ kcal: 1900, sourceTemplateId: 'fat_loss', supplements: ['Taurine'], functionalFoods: ['Matcha', 'Gừng'] });
  assert.equal(page.template(), 'fat_loss');
  assert.deepEqual(page.supplements(), ['Taurine']);
  assert.deepEqual(page.functionalFoods(), ['Matcha', 'Gừng']);
  page.openVersion({ kcal: 2000, sourceTemplateId: 'maintain', supplements: [], functionalFoods: [] });
  assert.deepEqual([page.supplements(), page.functionalFoods()], [[], []]);
});

await check('a template or option the builder no longer offers is skipped, not forced in', async () => {
  const page = openBuilder();
  page.openVersion({ kcal: 2000, sourceTemplateId: 'maintain', supplements: [], functionalFoods: [] });
  page.openVersion({ kcal: 2000, sourceTemplateId: 'manual', supplements: ['Omega 3', 'Vitamin đã bỏ'], functionalFoods: ['Món đã bỏ'] });
  assert.equal(page.template(), 'maintain', "'manual' is not an option, so the selector keeps its value");
  assert.deepEqual(page.supplements(), ['Omega 3']);
  assert.deepEqual(page.functionalFoods(), []);
});

console.log(`nutrition-builder-restore: ${passed} passed`);
