import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FAILURE_STANDARD,
  normalizeFailureStandard,
  normalizeSingleAt8Config,
  singleAt8Prescription,
  normalizeRepOutConfig,
  repOutCalibration,
  stage5SessionMetadata,
} from '../stage5-autoregulation.js';

test('failure standard only accepts the three explicit SBS definitions', () => {
  assert.equal(normalizeFailureStandard(FAILURE_STANDARD.ZERO_RIR), FAILURE_STANDARD.ZERO_RIR);
  assert.equal(normalizeFailureStandard(FAILURE_STANDARD.TRUE_FAILURE), FAILURE_STANDARD.TRUE_FAILURE);
  assert.equal(normalizeFailureStandard('unknown'), FAILURE_STANDARD.TECHNICAL);
});

test('single @8 remains advisory and clamps the coach setting to 85-93%', () => {
  assert.deepEqual(normalizeSingleAt8Config({ enabled: true, percentage: 99 }), {
    enabled: true, percentage: 93, useForDailyLoad: false,
  });
  assert.deepEqual(singleAt8Prescription(100, { enabled: true, percentage: 87.5 }, 2.5), {
    percentage: 87.5, weight: 87.5, targetRpe: 8, targetRir: 2, useForDailyLoad: false,
  });
  assert.equal(singleAt8Prescription(100, { enabled: false }), null);
});

test('rep-out cadence and RIR calibration are bounded and explain the direction', () => {
  assert.deepEqual(normalizeRepOutConfig({ enabled: true, everyExposures: 1 }), {
    enabled: true, everyExposures: 2,
  });
  assert.deepEqual(repOutCalibration({ predictedRir: 2, extraReps: 5 }), {
    predictedRir: 2,
    extraReps: 5,
    error: 3,
    absoluteError: 3,
    rating: 'recalibrate',
    message: 'Bạn còn nhiều hơn dự đoán 3 rep.',
  });
  assert.equal(repOutCalibration({ predictedRir: '', extraReps: 2 }), null);
});

test('session metadata only stores enabled and actually performed checks', () => {
  const metadata = stage5SessionMetadata({
    schemeParams: {
      failureStandard: FAILURE_STANDARD.ZERO_RIR,
      singleAt8: { enabled: true, percentage: 90 },
      repOutTest: { enabled: true, everyExposures: 4 },
    },
    singleAt8: { weight: 90, rpe: 8.5 },
    repOut: { performed: true, predictedRir: 3, extraReps: 2 },
  });
  assert.equal(metadata.failureStandard, FAILURE_STANDARD.ZERO_RIR);
  assert.deepEqual(metadata.singleAt8, {
    weight: 90, rpe: 8.5, percentage: 90, useForDailyLoad: false,
  });
  assert.equal(metadata.repOutTest.error, -1);
  assert.equal(metadata.repOutTest.rating, 'accurate');
});
