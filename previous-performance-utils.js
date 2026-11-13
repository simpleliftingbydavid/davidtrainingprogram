// Pure helpers for showing the student's most recent completed weight per set.
// Session history is expected newest-first, matching listSessionHistory().

function normalizedCompletedSets(log) {
  if (log?.status === 'skipped' || log?.outcome === 'skipped') return [];
  return (Array.isArray(log?.actualSets) ? log.actualSets : [])
    .map((set, index) => ({
      setIndex: Math.max(1, Math.trunc(Number(set?.setIndex)) || index + 1),
      weight: Number(set?.weight),
      reps: Math.max(0, Math.trunc(Number(set?.reps)) || 0),
    }))
    .filter((set) => Number.isFinite(set.weight));
}

export function performedExerciseId(log) {
  if (normalizedCompletedSets(log).length === 0) return null;
  return String(log?.substitutedExerciseId || log?.exerciseId || '').trim() || null;
}

export function latestPerformanceByExercise(sessions = []) {
  const latest = new Map();
  (Array.isArray(sessions) ? sessions : []).forEach((session) => {
    (Array.isArray(session?.exerciseLogs) ? session.exerciseLogs : []).forEach((log) => {
      const exerciseId = performedExerciseId(log);
      if (!exerciseId || latest.has(exerciseId)) return;
      latest.set(exerciseId, {
        exerciseId,
        sessionId: session.id || null,
        performedAt: session.performedAt || null,
        sets: normalizedCompletedSets(log),
      });
    });
  });
  return latest;
}

export function previousSetForIndex(performance, setIndex) {
  const safeIndex = Math.max(1, Math.trunc(Number(setIndex)) || 1);
  return performance?.sets?.find((set) => set.setIndex === safeIndex) || null;
}

export function performanceForExercise(latestByExercise, exerciseId) {
  const safeId = String(exerciseId || '').trim();
  return safeId && latestByExercise instanceof Map ? (latestByExercise.get(safeId) || null) : null;
}

// Rep điền sẵn cho buổi sau (David chốt 2026-11-13: 1a, 2a, 3a).
// Chỉ các kiểu mà rep thay đổi giữa các buổi: 5 tổng rep cố định, 7 tăng rep, 8 tăng set rồi tăng rep,
// 9 double progression, và mọi bài không tạ. Kiểu khác giữ rep giáo án (rep là chỉ định của David).
export const PREFILL_REPS_SCHEMES = Object.freeze([5, 7, 8, 9]);

/**
 * Số rep điền sẵn vào ô rep của một set.
 * Lấy rep buổi trước khi set đó có ở buổi trước và cùng kg (bài không tạ bỏ qua kg),
 * nhưng không bao giờ thấp hơn rep giáo án. Còn lại trả rep giáo án.
 */
export function prefillReps({ scheme, bodyweightOnly = false, plannedReps, plannedWeight, previousSet } = {}) {
  if (!bodyweightOnly && !PREFILL_REPS_SCHEMES.includes(Number(scheme))) return plannedReps;
  const previous = Math.trunc(Number(previousSet?.reps));
  if (!previousSet || !Number.isFinite(previous) || previous <= 0) return plannedReps;
  if (!bodyweightOnly) {
    const today = Number(plannedWeight);
    if (!Number.isFinite(today) || Math.abs(Number(previousSet.weight) - today) > 1e-9) return plannedReps;
  }
  const planned = Math.trunc(Number(plannedReps));
  return Number.isFinite(planned) && planned > previous ? plannedReps : previous;
}
