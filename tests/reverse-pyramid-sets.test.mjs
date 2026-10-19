// Run with:  node tests/reverse-pyramid-sets.test.mjs
//
// David (2026-10-19): a reverse pyramid is not fixed at three sets. The coach adds and
// removes sets in the assignment form, two to six; a new set is proposed from the one before
// it, and removing takes the last set so the others keep the weights they have reached.
//
// The engine part is pure. The form needs Firebase and a signed-in coach, so its own
// functions are lifted out of coach.html and run against a small stand-in for the DOM.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
  REVERSE_PYRAMID_SET_RANGE, SCHEME, calculateNextPrescription, getInitialPrescription, nextReversePyramidSet,
  validateReversePyramidSets,
} from '../progression-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

// ---------- the engine ----------

check('two to six sets', () => {
  assert.deepEqual({ ...REVERSE_PYRAMID_SET_RANGE }, { min: 2, max: 6 });
});

check('a new set proposes two more reps at about 10% less weight, on the plate step', () => {
  assert.deepEqual(nextReversePyramidSet({ reps: 10, weight: 60 }, 2.5), { reps: 12, weight: 55 });
  assert.deepEqual(nextReversePyramidSet({ reps: 6, weight: 100 }, 2.5), { reps: 8, weight: 90 });
  assert.deepEqual(nextReversePyramidSet({ reps: 12, weight: 21 }, 1), { reps: 14, weight: 19 });
  assert.deepEqual(nextReversePyramidSet({ reps: 12, weight: 2.5 }, 2.5), { reps: 14, weight: 2.5 }, 'never below one plate step');
  assert.deepEqual(nextReversePyramidSet({ reps: 12, weight: 0 }, 2.5), { reps: 14, weight: 0 }, 'no weight yet, none proposed');
  assert.deepEqual(nextReversePyramidSet({ reps: 8, weight: 50 }, 0), { reps: 10, weight: 45 }, 'no step set: half a kilo');
});

check('a pyramid saves with every set filled and two to six sets, and says what is missing', () => {
  assert.equal(validateReversePyramidSets([6, 10], [80, 70]).ok, true);
  assert.equal(validateReversePyramidSets([6, 8, 10, 12, 14, 16], [80, 75, 70, 65, 60, 55]).ok, true);
  assert.match(validateReversePyramidSets([6], [80]).error, /từ 2 đến 6 set/);
  assert.match(validateReversePyramidSets([6, 8, 10, 12, 14, 16, 18], Array(7).fill(50)).error, /từ 2 đến 6 set/);
  assert.match(validateReversePyramidSets([6, 10, 12, 14], [80, 70, 0, 55]).error, /cả 4 set/);
  assert.match(validateReversePyramidSets([6, 0], [80, 70]).error, /cả 2 set/);
});

check('the engine prescribes and progresses however many sets the pyramid has', () => {
  for (const [setTargets, setWeights, done, next] of [
    [[6, 10], [80, 70], [{ reps: 6 }, { reps: 9 }], [82.5, 70]],
    [[5, 7, 9, 11, 13], [90, 85, 80, 75, 70], [{ reps: 5 }, { reps: 7 }, { reps: 8 }, { reps: 11 }, { reps: 13 }], [92.5, 87.5, 80, 77.5, 72.5]],
  ]) {
    const context = { scheme: SCHEME.REVERSE_PYRAMID, schemeParams: { setTargets, weightIncreasePct: 3, roundingIncrement: 2.5 }, state: { setWeights } };
    const planned = getInitialPrescription(context);
    assert.equal(planned.sets, setTargets.length);
    assert.deepEqual(planned.setPrescriptions.map((set) => set.reps), setTargets);
    const result = calculateNextPrescription({ ...context, lastLog: { actualSets: done } });
    assert.deepEqual(result.nextState.setWeights, next);
    assert.equal(result.nextPrescription.sets, setTargets.length);
  }
});

// ---------- the coach's form ----------

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'latin1');
const page = Buffer.from(coach, 'latin1').toString('utf8').replace(/\r\n/g, '\n');
const moduleCode = page.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
function pageFunction(name) {
  const lines = moduleCode.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`function ${name}(`));
  assert.ok(start >= 0, `coach.html has no function ${name}`);
  for (let end = start; end < lines.length; end++) {
    if (!/\}\s*$/.test(lines[end])) continue;
    const source = lines.slice(start, end + 1).join('\n');
    try { new vm.Script(`(${source})`); return source; } catch { /* not the end yet */ }
  }
  throw new Error(`no end found for ${name}`);
}

/** The assignment form with the reverse pyramid rows for `targets` and `weights`. */
function openForm(targets, weights, { hasState = true, roundingIncrement = 2.5 } = {}) {
  const elements = new Map();
  const field = (id, value = '') => { const element = { id, value: String(value) }; elements.set(id, element); return element; };
  const rows = [];
  const addRow = (html) => {
    const inputs = [...html.matchAll(/id="(p-set(?:Target|Weight)-\d+)" value="([^"]*)"/g)];
    const row = { inputs: inputs.map(([, id, value]) => field(id, value)), labels: [...html.matchAll(/<label>([^<]*)<\/label>/g)].map((m) => m[1]) };
    row.remove = () => { rows.splice(rows.indexOf(row), 1); row.inputs.forEach((input) => elements.delete(input.id)); };
    rows.push(row);
  };
  const list = {
    querySelectorAll: (selector) => (selector === '[data-rpt-set]' ? [...rows] : []),
    insertAdjacentHTML: (where, html) => { assert.equal(where, 'beforeend'); addRow(html); },
    get lastElementChild() { return rows[rows.length - 1]; },
  };
  elements.set('rpt-sets', list);
  const button = (id) => { const element = { id, disabled: false, listeners: [], addEventListener: (type, fn) => element.listeners.push(fn), click: () => element.listeners.forEach((fn) => fn()) }; elements.set(id, element); return element; };
  button('rpt-add-set');
  button('rpt-remove-set');
  elements.set('rpt-set-count', { textContent: '' });
  field('volume-baseline-sets', targets.length);
  field('p-roundingIncrement', roundingIncrement);
  const context = vm.createContext({
    REVERSE_PYRAMID_SET_RANGE, nextReversePyramidSet,
    document: { getElementById: (id) => elements.get(id) },
  });
  vm.runInContext(`const $ = (id) => document.getElementById(id);\n${['num', 'reversePyramidSetRow', 'wireReversePyramidSets'].map(pageFunction).join('\n')}`, context);
  targets.forEach((target, index) => addRow(vm.runInContext(`reversePyramidSetRow(${index}, ${target}, ${JSON.stringify(weights[index] ?? '')}, ${hasState})`, context)));
  vm.runInContext(`wireReversePyramidSets(${hasState})`, context);
  const value = (id) => elements.get(id)?.value;
  return {
    add: () => elements.get('rpt-add-set').click(),
    remove: () => elements.get('rpt-remove-set').click(),
    sets: () => rows.map((_, index) => [Number(value(`p-setTarget-${index}`)), Number(value(`p-setWeight-${index}`) || 0)]),
    labels: () => rows.flatMap((row) => row.labels),
    addDisabled: () => elements.get('rpt-add-set').disabled,
    removeDisabled: () => elements.get('rpt-remove-set').disabled,
    countText: () => elements.get('rpt-set-count').textContent,
    baseline: () => value('volume-baseline-sets'),
  };
}

check('"+ Thêm set" adds a set proposed from the last one, up to six, and the volume baseline follows', () => {
  const form = openForm([6, 10, 12], [80, 70, 60]);
  assert.equal(form.countText(), '3 set · từ 2 đến 6 set');
  form.add();
  assert.deepEqual(form.sets(), [[6, 80], [10, 70], [12, 60], [14, 55]]);
  assert.equal(form.baseline(), '4');
  form.add();
  form.add();
  assert.deepEqual(form.sets().map(([reps]) => reps), [6, 10, 12, 14, 16, 18]);
  assert.equal(form.addDisabled(), true, 'six is the most');
  form.add();
  assert.equal(form.sets().length, 6);
  assert.equal(form.countText(), '6 set · từ 2 đến 6 set');
});

check('"− Bớt set" takes the last set and leaves the others, down to two', () => {
  const form = openForm([6, 10, 12], [82.5, 72.5, 60]);
  assert.equal(form.removeDisabled(), false);
  form.remove();
  assert.deepEqual(form.sets(), [[6, 82.5], [10, 72.5]], 'the weights reached are kept');
  assert.equal(form.baseline(), '2');
  assert.equal(form.removeDisabled(), true, 'two is the fewest');
  form.remove();
  assert.equal(form.sets().length, 2);
  form.add();
  assert.deepEqual(form.sets()[2], [12, 65]);
});

check('a new pyramid with no weights yet adds a set with its reps and leaves the weight to the coach', () => {
  const form = openForm([6, 10, 12], ['', '', ''], { hasState: false });
  form.add();
  assert.deepEqual(form.sets()[3], [14, 0]);
  assert.ok(form.labels().includes('Set 4 · Tạ khởi điểm (kg)'));
});

check('the form saves every row it shows, not a fixed three', () => {
  assert.doesNotMatch(moduleCode, /\[0, 1, 2\]\.map\(\(index\) => num\(`p-set/);
  assert.match(moduleCode, /const rows = \[\.\.\.document\.querySelectorAll\('#rpt-sets \[data-rpt-set\]'\)\];/);
  assert.match(moduleCode, /validateReversePyramidSets\(setTargets, setWeights\)/);
});

console.log(`REVERSE_PYRAMID_SETS_OK ${passed} passed`);
