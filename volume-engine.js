// Pure volume math. No Firebase and no DOM so the rules can be regression-tested.

export const MUSCLE_GROUPS = Object.freeze([
  'Ngực', 'Lưng', 'Vai', 'Đùi trước', 'Đùi sau & Mông',
  'Bắp chân', 'Tay trước', 'Tay sau', 'Bụng',
]);

const SECONDARY_BY_PATTERN = Object.freeze({
  compound_pec: [['Vai', 0.5], ['Tay sau', 0.5]],
  accessory_pec: [['Vai', 0.5], ['Tay sau', 0.5]],
  compound_back_horizontal: [['Tay trước', 0.5]],
  accessory_back_horizontal: [['Tay trước', 0.5]],
  accessory_back_vertical: [['Tay trước', 0.5]],
  accessory_shoulder: [['Tay sau', 0.5]],
  compound_shoulder: [['Tay sau', 0.5]],
  compound_knee: [['Đùi sau & Mông', 0.5]],
  accessory_knee: [['Đùi sau & Mông', 0.5]],
});

const SECONDARY_BY_EXERCISE = Object.freeze({
  deadlift: [['Lưng', 0.5], ['Đùi trước', 0.5]],
  rack_pulls: [['Đùi sau & Mông', 0.5]],
  sumo_deadlift: [['Đùi trước', 0.5]],
  glute_biased_split_squat: [['Đùi trước', 0.5]],
  db_bulgarian_split_squat: [['Đùi sau & Mông', 0.5]],
  db_walking_lunge: [['Đùi sau & Mông', 0.5]],
  db_step_ups: [['Đùi sau & Mông', 0.5]],
});

function cleanNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function defaultVolumeCredits(exercise) {
  if (!exercise?.muscleGroup) return [];
  const result = [{ muscleGroup: exercise.muscleGroup, credit: 1 }];
  for (const [muscleGroup, credit] of SECONDARY_BY_EXERCISE[exercise.exerciseId] || SECONDARY_BY_PATTERN[exercise.movementPattern] || []) {
    if (muscleGroup !== exercise.muscleGroup) result.push({ muscleGroup, credit });
  }
  return result;
}

export function normalizeVolumeCredits(credits, exercise) {
  const source = Array.isArray(credits) && credits.length ? credits : defaultVolumeCredits(exercise);
  const byMuscle = new Map();
  source.forEach((item) => {
    const muscleGroup = String(item?.muscleGroup || '').trim();
    const credit = Math.max(0, Math.min(1, cleanNumber(item?.credit)));
    if (MUSCLE_GROUPS.includes(muscleGroup) && credit > 0) {
      byMuscle.set(muscleGroup, Math.max(credit, byMuscle.get(muscleGroup) || 0));
    }
  });
  return [...byMuscle].map(([muscleGroup, credit]) => ({ muscleGroup, credit }));
}

export function prescribedSetCount(assignment) {
  if (Number(assignment?.scheme) === 2) return Math.max(0, cleanNumber(assignment?.schemeParams?.plannedSets));
  return Math.max(0, cleanNumber(assignment?.state?.currentSets, assignment?.schemeParams?.startingSets));
}

export function phaseDayFrequencies(assignments, phase) {
  const configured = phase?.volumePlan?.dayFrequencies || {};
  return [...new Set((assignments || []).map((item) => String(item.dayLabel || '').trim()).filter(Boolean))]
    .reduce((result, dayLabel) => {
      result[dayLabel] = Math.max(0, cleanNumber(configured[dayLabel], 1));
      return result;
    }, {});
}

export function plannedVolumeByMuscle(assignments, exerciseLookup, dayFrequencies = {}) {
  const totals = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0]));
  (assignments || []).forEach((assignment) => {
    const exercise = exerciseLookup(assignment.exerciseId);
    const credits = normalizeVolumeCredits(assignment.volumeConfig?.credits, exercise);
    const frequency = Math.max(0, cleanNumber(dayFrequencies[assignment.dayLabel], 1));
    const sets = prescribedSetCount(assignment) * frequency;
    credits.forEach(({ muscleGroup, credit }) => { totals[muscleGroup] += sets * credit; });
  });
  return totals;
}

function millis(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return Number(value.seconds) * 1000;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function actualExerciseId(log) {
  return log?.substitutedExerciseId || log?.exerciseId || null;
}

export function actualVolumeByMuscle(sessions, exerciseLookup, { now = Date.now(), days = 7, assignmentLookup = () => null } = {}) {
  const totals = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0]));
  const start = now - days * 86400000;
  (sessions || []).forEach((session) => {
    const performed = millis(session.performedAt || session.loggedAt);
    if (!(performed > start && performed <= now)) return;
    (session.exerciseLogs || []).forEach((log) => {
      if (log.status === 'skipped' || log.outcome === 'skipped') return;
      const setCount = Array.isArray(log.actualSets) ? log.actualSets.length : 0;
      if (!setCount) return;
      const exercise = exerciseLookup(actualExerciseId(log));
      const fallbackCredits = log.source === 'assigned' ? assignmentLookup(log.assignmentId)?.volumeConfig?.credits : null;
      const credits = normalizeVolumeCredits(log.volumeCredits || fallbackCredits, exercise);
      credits.forEach(({ muscleGroup, credit }) => { totals[muscleGroup] += setCount * credit; });
    });
  });
  return totals;
}

export function weeklyVolumeTrend(sessions, exerciseLookup, { weeks = 12, now = Date.now(), assignmentLookup = () => null } = {}) {
  const result = [];
  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const end = now - offset * 7 * 86400000;
    const start = end - 7 * 86400000;
    const bucket = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0]));
    (sessions || []).forEach((session) => {
      const performed = millis(session.performedAt || session.loggedAt);
      if (!(performed > start && performed <= end)) return;
      (session.exerciseLogs || []).forEach((log) => {
        if (log.status === 'skipped' || log.outcome === 'skipped') return;
        const setCount = Array.isArray(log.actualSets) ? log.actualSets.length : 0;
        const exercise = exerciseLookup(actualExerciseId(log));
        const fallbackCredits = log.source === 'assigned' ? assignmentLookup(log.assignmentId)?.volumeConfig?.credits : null;
        normalizeVolumeCredits(log.volumeCredits || fallbackCredits, exercise).forEach(({ muscleGroup, credit }) => {
          bucket[muscleGroup] += setCount * credit;
        });
      });
    });
    result.push({ start, end, volume: bucket });
  }
  return result;
}

function recentExerciseLogs(sessions, assignment, max = 4) {
  return (sessions || [])
    .flatMap((session) => (session.exerciseLogs || []).map((log) => ({ log, at: millis(session.performedAt || session.loggedAt) })))
    .filter(({ log }) => log.assignmentId === assignment.id && log.source === 'assigned' && log.outcome !== 'skipped')
    .sort((a, b) => b.at - a.at)
    .slice(0, max)
    .map(({ log }) => log);
}

export function volumeSuggestion({ assignment, sessions = [], latestCheckIn = null, activeAlerts = [] }) {
  const logs = recentExerciseLogs(sessions, assignment);
  const credits = assignment?.volumeConfig?.credits || [];
  const relevantRecovery = credits
    .map((item) => cleanNumber(latestCheckIn?.muscleRecovery?.[item.muscleGroup], 0))
    .filter((value) => value > 0);
  const fatigue = cleanNumber(latestCheckIn?.fatigue, 0);
  const jointPain = cleanNumber(latestCheckIn?.jointPain, 0);
  const reportedPerformance = cleanNumber(latestCheckIn?.performance, 0);
  const techniqueReady = assignment?.volumeConfig?.techniqueReady === true;
  const outcomes = logs.map((log) => log.outcome);
  const rirValues = logs.flatMap((log) => (log.actualSets || []).map((set) => cleanNumber(set.rir, NaN))).filter(Number.isFinite);
  const closeEnough = rirValues.length > 0 && rirValues.reduce((sum, value) => sum + value, 0) / rirValues.length <= 3;
  const recovered = relevantRecovery.length > 0 && Math.min(...relevantRecovery) >= 4 && fatigue > 0 && fatigue <= 2;
  const checkInAt = millis(latestCheckIn?.submittedAt || latestCheckIn?.createdAt);
  const checkInRecent = checkInAt > Date.now() - 14 * 86400000;
  const volumeIncreaseBlocked = (activeAlerts || []).some((alert) => alert.status !== 'resolved' && alert.blocksVolumeIncrease === true);

  if (jointPain >= 2 || (relevantRecovery.length && Math.min(...relevantRecovery) <= 2) || fatigue >= 4 || reportedPerformance === 1 || (outcomes.length >= 2 && outcomes.slice(0, 2).every((value) => value === 'down'))) {
    return { action: 'decrease', label: 'Giảm / xem lại', reason: jointPain >= 2 ? 'Học viên báo đau khớp đáng kể.' : 'Phục hồi hoặc hiệu suất gần đây đang giảm.' };
  }
  if (logs.length < 2 || !latestCheckIn || !checkInRecent) {
    return { action: 'insufficient', label: 'Chưa đủ dữ liệu', reason: 'Cần ít nhất 2 lần tập và một check-in trong 14 ngày gần đây.' };
  }
  if (outcomes.some((value) => value === 'up')) {
    return { action: 'hold', label: 'Giữ', reason: 'Hiệu suất vẫn đang tiến bộ; chưa cần thêm volume.' };
  }
  const plateaued = outcomes.slice(0, 2).every((value) => value === 'hold');
  if (plateaued && recovered && techniqueReady && closeEnough && !volumeIncreaseBlocked) {
    return { action: 'increase', label: 'Có thể tăng', reason: 'Hiệu suất đã chững, phục hồi tốt, kỹ thuật ổn và set đủ gần thất bại.' };
  }
  const missing = [];
  if (!plateaued) missing.push('chưa xác nhận chững hiệu suất');
  if (!recovered) missing.push('phục hồi chưa đủ tốt');
  if (!techniqueReady) missing.push('David chưa xác nhận kỹ thuật ổn định');
  if (!closeEnough) missing.push('chưa có bằng chứng set đủ gần thất bại');
  if (volumeIncreaseBlocked) missing.push('đang có cảnh báo đau khớp cần David xử lý');
  return { action: 'hold', label: 'Giữ', reason: `Chưa tăng vì ${missing.join(', ')}.` };
}

export function latestVolumeCheckIn(checkIns) {
  return [...(checkIns || [])]
    .filter((item) => item.type === 'volume-recovery')
    .sort((a, b) => millis(b.submittedAt || b.createdAt) - millis(a.submittedAt || a.createdAt))[0] || null;
}
