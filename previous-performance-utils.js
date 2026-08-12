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
