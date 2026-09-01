export const STUDENT_DATA_COLLECTIONS = Object.freeze([
  'assignments', 'phases', 'sessions', 'workoutDrafts', 'extraExerciseStates',
  'progressPhotos', 'bodyWeightLogs', 'programMeta', 'nutritionProfile',
  'nutritionPlans', 'nutritionCheckins', 'nutritionDays', 'checkIns', 'messages',
  'exerciseNotes',
]);

// Immutable decision history is removed only by the trusted backend after the
// parent student profile is deleted. Keeping it out of browser-side cleanup
// prevents a coach session from deleting individual audit records.
export const IMMUTABLE_STUDENT_DATA_COLLECTIONS = Object.freeze([
  'coachingAlerts', 'coachingAlertEvents', 'progressionAudits',
]);
