// SBS Stage 5 — small, explicit rules shared by Coach and Client UIs.
// This module never reads or writes Firebase. It only normalizes the coach's
// choices and calculates display-only guidance from data entered in a workout.

export const FAILURE_STANDARD = Object.freeze({
  ZERO_RIR: 'zero_rir',
  TECHNICAL: 'technical_failure',
  TRUE_FAILURE: 'true_failure',
});

export const FAILURE_STANDARD_OPTIONS = Object.freeze([
  Object.freeze({ value: FAILURE_STANDARD.ZERO_RIR, label: '0 RIR', description: 'Dừng khi biết chắc không thể hoàn thành thêm một rep.' }),
  Object.freeze({ value: FAILURE_STANDARD.TECHNICAL, label: 'Technical failure', description: 'Dừng khi kỹ thuật bắt đầu mất ổn định.' }),
  Object.freeze({ value: FAILURE_STANDARD.TRUE_FAILURE, label: 'True failure', description: 'Tiếp tục cho đến khi thực sự không hoàn thành được rep.' }),
]);

export function normalizeFailureStandard(value, fallback = FAILURE_STANDARD.TECHNICAL) {
  return FAILURE_STANDARD_OPTIONS.some((option) => option.value === value) ? value : fallback;
}

export function failureStandardInfo(value) {
  const normalized = normalizeFailureStandard(value);
  return FAILURE_STANDARD_OPTIONS.find((option) => option.value === normalized);
}

export function normalizeSingleAt8Config(config = {}) {
  const pct = Number(config.percentage);
  return {
    enabled: config.enabled === true,
    percentage: Number.isFinite(pct) ? Math.max(85, Math.min(93, pct)) : 90,
    useForDailyLoad: config.useForDailyLoad === true,
  };
}

export function singleAt8Prescription(trainingMax, config = {}, roundingIncrement = 0.5) {
  const normalized = normalizeSingleAt8Config(config);
  const tm = Number(trainingMax);
  const increment = Number(roundingIncrement) > 0 ? Number(roundingIncrement) : 0.5;
  if (!normalized.enabled || !Number.isFinite(tm) || tm <= 0) return null;
  const raw = tm * normalized.percentage / 100;
  return {
    percentage: normalized.percentage,
    weight: Math.round(raw / increment) * increment,
    targetRpe: 8,
    targetRir: 2,
    useForDailyLoad: normalized.useForDailyLoad,
  };
}

export function normalizeRepOutConfig(config = {}) {
  const every = Math.trunc(Number(config.everyExposures));
  return {
    enabled: config.enabled === true,
    everyExposures: Number.isFinite(every) ? Math.max(2, Math.min(12, every)) : 4,
  };
}

export function repOutCalibration({ predictedRir, extraReps }) {
  if (String(predictedRir ?? '').trim() === '' || String(extraReps ?? '').trim() === '') return null;
  const predicted = Math.trunc(Number(predictedRir));
  const actual = Math.trunc(Number(extraReps));
  if (!Number.isFinite(predicted) || !Number.isFinite(actual) || predicted < 0 || actual < 0) return null;
  const error = actual - predicted;
  const absoluteError = Math.abs(error);
  return {
    predictedRir: predicted,
    extraReps: actual,
    error,
    absoluteError,
    rating: absoluteError <= 1 ? 'accurate' : absoluteError === 2 ? 'review' : 'recalibrate',
    message: absoluteError <= 1
      ? 'Ước lượng RIR đang khá sát.'
      : error > 0
        ? `Bạn còn nhiều hơn dự đoán ${absoluteError} rep.`
        : `Bạn còn ít hơn dự đoán ${absoluteError} rep.`,
  };
}

export function stage5SessionMetadata({ schemeParams = {}, singleAt8 = null, repOut = null } = {}) {
  const singleConfig = normalizeSingleAt8Config(schemeParams.singleAt8);
  const repOutConfig = normalizeRepOutConfig(schemeParams.repOutTest);
  const metadata = {
    failureStandard: normalizeFailureStandard(schemeParams.failureStandard),
  };
  if (singleConfig.enabled && Number(singleAt8?.weight) > 0) {
    metadata.singleAt8 = {
      weight: Math.max(0, Number(singleAt8.weight) || 0),
      rpe: Math.max(1, Math.min(10, Number(singleAt8.rpe) || 8)),
      percentage: singleConfig.percentage,
      useForDailyLoad: singleConfig.useForDailyLoad,
    };
  }
  if (repOutConfig.enabled && repOut?.performed === true) {
    const calibration = repOutCalibration(repOut);
    if (calibration) metadata.repOutTest = calibration;
  }
  return metadata;
}
