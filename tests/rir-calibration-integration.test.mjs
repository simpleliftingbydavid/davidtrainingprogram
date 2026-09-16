import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const engine = readFileSync(new URL('../rir-calibration-engine.js', import.meta.url), 'utf8');
const alertBuilder = readFileSync(new URL('../functions/review-alert-builder.js', import.meta.url), 'utf8');

test('coach page loads the RIR engine before the module that renders the dashboard', () => {
  const engineScript = coach.indexOf('<script src="./rir-calibration-engine.js"></script>');
  const moduleScript = coach.indexOf('<script type="module">');
  assert.ok(engineScript >= 0);
  assert.ok(engineScript < moduleScript);
  assert.match(coach, /id="rir-calibration-dashboard"/);
  assert.match(coach, /buildRirCalibrationReport\(activePhase\s*\?\s*sessionsForPhase\(sessionHistoryCache, assignments, activePhase\)\s*:\s*sessionHistoryCache\)/);
});

test('coach UI shows planned and actual RIR across all approved windows', () => {
  assert.match(coach, /\[4, 8, 12\]/);
  assert.match(coach, /averagePlannedRir/);
  assert.match(coach, /averageActualRir/);
  assert.match(coach, /không tự điều chỉnh Training Max hay giáo án/i);
});

test('RIR engine and alert builder have no assignment write dependency', () => {
  assert.doesNotMatch(engine, /updateAssignment|setDoc|runTransaction|firebase-firestore/);
  assert.doesNotMatch(alertBuilder, /updateAssignment|trainingMax\s*=|nextPrescription\s*=/);
  assert.match(alertBuilder, /không tự sửa giáo án/i);
});
