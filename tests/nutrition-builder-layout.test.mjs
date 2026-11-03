// The nutrition builder's layout (2026-11-03): the four food pickers named as dishes and
// ingredients, the older ways of building folded away, and the client's mode shown with a
// warning when the meal counts disagree.
//   node tests/nutrition-builder-layout.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../nutrition-builder.html', import.meta.url), 'utf8').replace(/\r/g, '');
let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('dishes come before ingredients, each pair clearly named', () => {
  const order = ['<label>Món ăn · khách nấu được / hay ăn</label>', '<label>Món ăn · không kê</label>',
    '<label>Nguyên liệu · khách hay ăn</label>', '<label>Nguyên liệu · cần tránh (dị ứng, hại dạ dày)</label>'];
  const at = order.map((label) => page.indexOf(label));
  assert.ok(at.every((index) => index > 0), 'every label is there');
  assert.deepEqual([...at].sort((a, b) => a - b), at, 'in this order');
  assert.ok(!page.includes('Chọn món theo thói quen của khách'), 'the old look-alike summary is gone');
});

check('the older options are folded, and open when one is not the default', () => {
  const folded = page.slice(page.indexOf('id="advanced-options"'), page.indexOf('id="week-variety-field"'));
  ['id="plan-composition"', 'id="plan-style"', 'id="plan-span"'].forEach((id) => assert.ok(folded.includes(id), `${id} folded`));
  assert.ok(page.includes("const changed = $('plan-composition').value !== 'dish' || $('plan-style').value !== 'grams' || $('plan-span').value !== 'week';"));
});

check('the client mode is shown and a different meal count is flagged', () => {
  assert.ok(page.includes('clientSettings = normalizeNutritionSettings(student.nutritionSettings);'));
  assert.ok(page.includes('<p id="client-mode" class="client-mode" hidden></p>'));
  assert.ok(page.includes("const set = clientSettings.mode === 'simple' ? clientSettings.mealsPerDay : null;"));
  assert.ok(page.includes("warn.hidden = !set || set === here;"));
});

console.log(`NUTRITION_BUILDER_LAYOUT_OK ${passed} passed`);
