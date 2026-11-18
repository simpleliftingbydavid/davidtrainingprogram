// Pure volume math. No Firebase and no DOM so the rules can be regression-tested.

import { t } from './i18n.js';
import { frequenciesWithPausedDays } from './training-day-visibility.js';

export const MUSCLE_GROUPS = Object.freeze([
  'Ngực', 'Lưng', 'Vai', 'Đùi trước', 'Đùi sau & Mông', // i18n-data
  'Bắp chân', 'Tay trước', 'Tay sau', 'Bụng', // i18n-data
]);

const SECONDARY_BY_PATTERN = Object.freeze({
  compound_pec: [['Vai', 0.5], ['Tay sau', 0.5]],
  accessory_pec: [['Vai', 0.5], ['Tay sau', 0.5]],
  compound_back_horizontal: [['Tay trước', 0.5]], // i18n-data
  accessory_back_horizontal: [['Tay trước', 0.5]], // i18n-data
  accessory_back_vertical: [['Tay trước', 0.5]], // i18n-data
  accessory_shoulder: [['Tay sau', 0.5]],
  compound_shoulder: [['Tay sau', 0.5]],
  compound_knee: [['Đùi sau & Mông', 0.5]], // i18n-data
  accessory_knee: [['Đùi sau & Mông', 0.5]], // i18n-data
});

const SECONDARY_BY_EXERCISE = Object.freeze({
  deadlift: [['Lưng', 0.5], ['Đùi trước', 0.5]], // i18n-data
  rack_pulls: [['Đùi sau & Mông', 0.5]], // i18n-data
  sumo_deadlift: [['Đùi trước', 0.5]], // i18n-data
  glute_biased_split_squat: [['Đùi trước', 0.5]], // i18n-data
  db_bulgarian_split_squat: [['Đùi sau & Mông', 0.5]], // i18n-data
  db_walking_lunge: [['Đùi sau & Mông', 0.5]], // i18n-data
  db_step_ups: [['Đùi sau & Mông', 0.5]], // i18n-data
  // David, 2026-11-18: Weighted Back Extension thuộc Lưng (1 set), Đùi sau & Mông 0,5 set.
  weighted_back_extension: [['Đùi sau & Mông', 0.5]], // i18n-data
});

// Bài đổi cách tính volume sau khi đã có học viên được gán (David, 2026-11-18). Giáo án đã gán và log
// đã ghi lưu bản chép cách tính cũ; nếu bản chép đúng bằng mặc định cũ thì tính theo cách mới (như
// Deadlift ở dưới). Bản David đã tự chỉnh tay khác mặc định cũ thì giữ nguyên.
const RECLASSIFIED_CREDITS = Object.freeze({
  weighted_back_extension: Object.freeze({
    oldDefault: [['Đùi sau & Mông', 1]], // i18n-data
    note: 'volume.note.backExtension',
  }),
});

function isOldDefault(source, oldDefault) {
  const clean = source
    .map((item) => [String(item?.muscleGroup || '').trim(), Number(item?.credit)])
    .filter(([group, credit]) => group && credit > 0);
  return clean.length === oldDefault.length
    && oldDefault.every(([group, credit]) => clean.some(([g, c]) => g === group && c === credit));
}

/** Dòng ghi chú cách tính volume cho David ở chỗ chọn bài (rỗng khi bài không có ghi chú). */
export function volumeNoteFor(exercise) {
  const key = RECLASSIFIED_CREDITS[exercise?.exerciseId]?.note;
  return key ? t(key) : '';
}

// David, 2026-11-17: mọi bài Deadlift (kể cả RDL, Sumo, Trap Bar, Deficit, bài HLV tự thêm có chữ
// Deadlift/RDL trong tên) đều cộng 0,5 set cho Lưng. Áp ở normalizeVolumeCredits nên cả giáo án
// đã gán, lịch sử đã ghi và khung dựng giáo án đều tính theo.
const DEADLIFT_BACK = Object.freeze(['Lưng', 0.5]); // i18n-data
export function isDeadliftExercise(exercise) {
  const text = [exercise?.exerciseId, exercise?.nameVi, exercise?.nameEn, exercise?.name]
    .filter((value) => typeof value === 'string').join(' ');
  return /deadlift|(^|[^a-z])rdl([^a-z]|$)/i.test(text);
}

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
  const [backGroup, backCredit] = DEADLIFT_BACK;
  if (isDeadliftExercise(exercise) && !result.some((item) => item.muscleGroup === backGroup)) {
    result.push({ muscleGroup: backGroup, credit: backCredit });
  }
  return result;
}

export function normalizeVolumeCredits(credits, exercise) {
  const reclassified = RECLASSIFIED_CREDITS[exercise?.exerciseId];
  const stored = Array.isArray(credits) && credits.length ? credits : null;
  const source = stored && !(reclassified && isOldDefault(stored, reclassified.oldDefault)) ? stored : defaultVolumeCredits(exercise);
  const byMuscle = new Map();
  source.forEach((item) => {
    const muscleGroup = String(item?.muscleGroup || '').trim();
    const credit = Math.max(0, Math.min(1, cleanNumber(item?.credit)));
    if (MUSCLE_GROUPS.includes(muscleGroup) && credit > 0) {
      byMuscle.set(muscleGroup, Math.max(credit, byMuscle.get(muscleGroup) || 0));
    }
  });
  const [backGroup, backCredit] = DEADLIFT_BACK;
  if (byMuscle.size && isDeadliftExercise(exercise)) byMuscle.set(backGroup, Math.max(backCredit, byMuscle.get(backGroup) || 0));
  return [...byMuscle].map(([muscleGroup, credit]) => ({ muscleGroup, credit }));
}

export function prescribedSetCount(assignment) {
  const scheme = Number(assignment?.scheme);
  if (scheme === 1) return Math.max(0, cleanNumber(assignment?.schemeParams?.upperSets));
  if ([2, 3, 4, 5, 9, 10].includes(scheme)) return Math.max(0, cleanNumber(assignment?.schemeParams?.plannedSets));
  if (scheme === 6) return Math.max(0, assignment?.schemeParams?.setTargets?.length || 0);
  return Math.max(0, cleanNumber(assignment?.state?.currentSets, assignment?.schemeParams?.startingSets));
}

/**
 * @param {Array}  assignments
 * @param {object} phase        carries volumePlan.dayFrequencies
 * @param {string[]} hiddenDays days the coach has paused, from the STUDENT
 *   record — passed in rather than read off the phase, because pausing is not
 *   tied to a cycle and works for students who have no phases at all.
 */
export function phaseDayFrequencies(assignments, phase, hiddenDays = []) {
  const configured = phase?.volumePlan?.dayFrequencies || {};
  const frequencies = [...new Set((assignments || []).map((item) => String(item.dayLabel || '').trim()).filter(Boolean))]
    .reduce((result, dayLabel) => {
      result[dayLabel] = Math.max(0, cleanNumber(configured[dayLabel], 1));
      return result;
    }, {});
  // A paused day counts as zero sets for as long as it is paused. Derived here
  // rather than written into volumePlan, so the coach's own weekly frequency
  // survives the pause and comes back untouched when the day resumes.
  return frequenciesWithPausedDays(frequencies, hiddenDays);
}

/**
 * The weekly frequencies a new cycle should start with, taken from the ones
 * before it.
 *
 * Nothing used to carry them, so every new cycle silently reset every day to
 * the default of one session a week — a coach who had set Lower to 2× and Upper
 * to 1.5× found the plan quietly back at 1× each, and the planned-volume figures
 * they check against MEV and MRV were wrong until they noticed and typed the
 * numbers in again. Nobody chose those defaults; they were just what was left
 * when the old plan was not read.
 *
 * Read from the most recent cycle that configured each day, not only the last
 * one, so a day that sat out a cycle still comes back at the number the coach
 * last chose for it rather than at the default.
 *
 * Only positive numbers are inherited. A stored zero predates paused days and
 * was how a coach used to switch a day off; carried into a new cycle it would
 * plan nothing for that day while the interface showed it as trainable — the
 * same silent-zero problem in a new place. Pausing is what expresses "not this
 * cycle" now, and it lives on the student, so it needs no inheriting at all.
 *
 * @param {Array} phases      every phase, in the ascending order listPhases returns
 * @param {string[]} dayLabels the new cycle's own days; anything else is dropped,
 *   so a renamed or retired day cannot keep a frequency nothing can reach.
 * @returns {object} day label to frequency, empty when there is nothing to inherit
 */
export function inheritedDayFrequencies(phases = [], dayLabels = []) {
  const wanted = new Set((dayLabels || []).map((label) => String(label || '').trim()).filter(Boolean));
  const inherited = {};
  for (const phase of phases || []) {
    for (const [label, value] of Object.entries(phase?.volumePlan?.dayFrequencies || {})) {
      const dayLabel = String(label || '').trim();
      const frequency = cleanNumber(value, 0);
      if (wanted.has(dayLabel) && frequency > 0) inherited[dayLabel] = frequency;
    }
  }
  return inherited;
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
  const safeWeeks = Math.max(1, Math.trunc(Number(weeks)) || 12);
  const weekMs = 7 * 86400000;
  const result = Array.from({ length: safeWeeks }, (_, index) => {
    const offset = safeWeeks - 1 - index;
    const end = now - offset * weekMs;
    return {
      start: end - weekMs,
      end,
      volume: Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0])),
    };
  });

  // Assign every session directly to its week. The previous implementation scanned
  // the complete history once per week, which became visibly slow as client data grew.
  (sessions || []).forEach((session) => {
    const performed = millis(session.performedAt || session.loggedAt);
    const age = now - performed;
    if (!performed || age < 0) return;
    const offset = Math.floor(age / weekMs);
    if (offset >= safeWeeks) return;
    const bucket = result[safeWeeks - 1 - offset].volume;
    (session.exerciseLogs || []).forEach((log) => {
      if (log.status === 'skipped' || log.outcome === 'skipped') return;
      const setCount = Array.isArray(log.actualSets) ? log.actualSets.length : 0;
      if (!setCount) return;
      const exercise = exerciseLookup(actualExerciseId(log));
      const fallbackCredits = log.source === 'assigned' ? assignmentLookup(log.assignmentId)?.volumeConfig?.credits : null;
      normalizeVolumeCredits(log.volumeCredits || fallbackCredits, exercise).forEach(({ muscleGroup, credit }) => {
        bucket[muscleGroup] += setCount * credit;
      });
    });
  });
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

export function recentAssignmentLogsIndex(sessions, max = 4) {
  const safeMax = Math.max(1, Math.trunc(Number(max)) || 4);
  const indexed = new Map();
  (sessions || []).forEach((session) => {
    const at = millis(session.performedAt || session.loggedAt);
    (session.exerciseLogs || []).forEach((log) => {
      if (!log.assignmentId || log.source !== 'assigned' || log.outcome === 'skipped' || log.status === 'skipped') return;
      const items = indexed.get(log.assignmentId) || [];
      items.push({ log, at });
      indexed.set(log.assignmentId, items);
    });
  });
  indexed.forEach((items, assignmentId) => {
    indexed.set(assignmentId, items.sort((a, b) => b.at - a.at).slice(0, safeMax).map(({ log }) => log));
  });
  return indexed;
}

export function volumeSuggestion({ assignment, sessions = [], recentLogs = null, latestCheckIn = null, activeAlerts = [] }) {
  const logs = Array.isArray(recentLogs) ? recentLogs : recentExerciseLogs(sessions, assignment);
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
    return { action: 'decrease', label: t('cj.giam_xem_lai'), reason: jointPain >= 2 ? t('cj.hoc_vien_bao_dau_khop_dang') : t('cj.phuc_hoi_hoac_hieu_suat_gan') };
  }
  if (logs.length < 2 || !latestCheckIn || !checkInRecent) {
    return { action: 'insufficient', label: t('pv.notEnough'), reason: t('cj.can_it_nhat_2_lan_tap') };
  }
  if (outcomes.some((value) => value === 'up')) {
    return { action: 'hold', label: t('cj.giu'), reason: t('cj.hieu_suat_van_dang_tien_bo') };
  }
  const plateaued = outcomes.slice(0, 2).every((value) => value === 'hold');
  if (plateaued && recovered && techniqueReady && closeEnough && !volumeIncreaseBlocked) {
    return { action: 'increase', label: t('cj.co_the_tang'), reason: t('cj.hieu_suat_da_chung_phuc_hoi') };
  }
  const missing = [];
  if (!plateaued) missing.push(t('cj.chua_xac_nhan_chung_hieu_suat'));
  if (!recovered) missing.push(t('cj.phuc_hoi_chua_du_tot'));
  if (!techniqueReady) missing.push(t('cj.david_chua_xac_nhan_ky_thuat'));
  if (!closeEnough) missing.push(t('cj.chua_co_bang_chung_set_du'));
  if (volumeIncreaseBlocked) missing.push(t('cj.dang_co_canh_bao_dau_khop'));
  return { action: 'hold', label: t('cj.giu'), reason: `${t('cj.chua_tang_vi', { p0: missing.join(', ') })}` };
}

export function latestVolumeCheckIn(checkIns) {
  return [...(checkIns || [])]
    .filter((item) => item.type === 'volume-recovery')
    .sort((a, b) => millis(b.submittedAt || b.createdAt) - millis(a.submittedAt || a.createdAt))[0] || null;
}
