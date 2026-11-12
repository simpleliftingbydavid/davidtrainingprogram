// Kết quả sau buổi nói đúng khi tạ buổi sau nhẹ hơn (kiểu 1–3), nhãn kiểu 2 bằng tiếng Việt (David, 2026-11-12).
//   node tests/load-down-message.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEME, calculateNextPrescription, classifyOutcome, getInitialPrescription } from '../progression-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const client = readFileSync(new URL('../client.html', import.meta.url), 'utf8');

check('the result screen says "lighter next session" only when the next weight is really lower', () => {
  assert.match(client, /const TM_SCHEMES = \[SCHEME\.ORIGINAL_PROGRESSION, SCHEME\.LAST_SET_RIR, SCHEME\.REPS_TO_FAILURE\];/);
  assert.match(client, /const loadDown = !apreDown && priorWeight > 0 && Number\(rx\?\.weight\) > 0 && Number\(rx\.weight\) < priorWeight;/);
  assert.match(client, /loadDown \? 'Giảm nhẹ tạ buổi sau' : OUTCOME_LABEL\[outcome\]/);
  assert.match(client, /buổi sau tạ nhẹ hơn một chút \(\$\{kg\(from\)\} → \$\{kg\(to\)\} kg\$\{per\}\)/);
  // The prior weight comes from the plan before saving: showNextUp runs before loadAssignments.
  assert.ok(client.indexOf('showNextUp(results, {') < client.indexOf('await loadAssignments(); // refresh in case state affects display later'));
});

check('a down result can keep the same weight after rounding; then "giữ nguyên" stays true', () => {
  const params = { intensityPct: 75, repsPerSet: 6, plannedSets: 3, targetRIR: 2, roundingIncrement: 5 };
  const state = { trainingMax: 100 };
  const before = getInitialPrescription({ scheme: SCHEME.LAST_SET_RIR, schemeParams: params, state }).weight;
  const r = calculateNextPrescription({ scheme: SCHEME.LAST_SET_RIR, schemeParams: params, state, lastLog: { actualSets: [{ weight: 75, reps: 6 }, { weight: 75, reps: 6 }, { weight: 75, reps: 6, rir: 0 }] } });
  assert.equal(classifyOutcome(SCHEME.LAST_SET_RIR, r.delta), 'down');
  assert.equal(r.nextPrescription.weight, before, 'TM −2% nhưng làm tròn 5 kg vẫn 75 kg');
});

check('scheme 2 reasons read in Vietnamese; weights use a decimal comma', () => {
  ['2+ fewer sets completed', '1 fewer set completed or last set below RIR target', 'Set target completed; last at RIR target',
    '1 above RIR target', '2 above RIR target', '3+ above RIR target'].forEach((key) => assert.ok(client.includes(`'${key}': '`), key));
  assert.match(client, /escapeHtml\(bucketText\(r\.resultBucket\)\)/);
  assert.match(client, /: `\$\{kg\(rx\?\.weight\)\} kg\$\{per\} × \$\{rx\?\.sets\} set × \$\{rx\?\.reps\} rep`;/);
});

console.log(`LOAD_DOWN_MESSAGE_OK ${passed} passed`);
