export const NOTE_VISIBILITY = Object.freeze({
  PRIVATE: 'private',
  SHARED: 'shared',
});

export const MAX_EXERCISE_NOTE_LENGTH = 2000;

export function normalizeExerciseNoteText(value) {
  return String(value || '').trim().replace(/\r\n/g, '\n').slice(0, MAX_EXERCISE_NOTE_LENGTH);
}

export function performedExerciseIdForNote({ exerciseId = '', substitutedExerciseId = '' } = {}) {
  return String(substitutedExerciseId || exerciseId || '').trim();
}

export function sessionExerciseNoteKey({ sessionExerciseId = '', assignmentId = '', exerciseId = '' } = {}) {
  const stableInstance = String(sessionExerciseId || '').trim();
  if (stableInstance) return stableInstance;
  const assignment = String(assignmentId || '').trim();
  if (assignment) return `assigned:${assignment}`;
  return `exercise:${String(exerciseId || '').trim()}`;
}

export function normalizeExerciseNoteVisibility(role, value) {
  if (role !== 'coach') return NOTE_VISIBILITY.SHARED;
  return value === NOTE_VISIBILITY.PRIVATE ? NOTE_VISIBILITY.PRIVATE : NOTE_VISIBILITY.SHARED;
}

export function noteTimestampMs(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  const parsed = value instanceof Date ? value.getTime() : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortExerciseNotes(notes = []) {
  return [...notes].sort((a, b) => noteTimestampMs(a.createdAt) - noteTimestampMs(b.createdAt));
}

export function splitExerciseNotesBySession(notes = [], sessionId = '') {
  const current = [];
  const previous = [];
  sortExerciseNotes(notes).forEach((note) => {
    (note.sessionId === sessionId ? current : previous).push(note);
  });
  return { current, previous: previous.reverse() };
}

export function exerciseFeedbackPreview(value, maxLength = 110) {
  const normalized = normalizeExerciseNoteText(value).replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

export function unreadNotificationCount(notifications = []) {
  return notifications.filter((item) => !item.readAt).length;
}

export function exerciseFeedbackTargetUrl({ studentUid = '', noteId = '', sessionId = '', exerciseId = '' } = {}) {
  const params = new URLSearchParams();
  if (studentUid) params.set('student', studentUid);
  if (noteId) params.set('note', noteId);
  if (sessionId) params.set('session', sessionId);
  if (exerciseId) params.set('exercise', exerciseId);
  return `coach.html?${params.toString()}`;
}
