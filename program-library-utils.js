// The programme library page (program-library.html), 2026-11-03: find a saved template by
// name or by a lift in it, and save several of a student's days at once, one template each.
// Pure: no DOM, no Firebase.

/** Lower case, accents and đ dropped, so "dui" finds "Đùi" and "squat" finds "Squat". */
export const plainText = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

/** Templates whose name, source day or any lift matches every word typed. */
export function searchTemplates(templates = [], query = '') {
  const words = plainText(query).split(/\s+/).filter(Boolean);
  if (!words.length) return templates;
  return templates.filter((template) => {
    const haystack = plainText([
      template.name, template.sourceDayLabel,
      ...(template.exercises || []).map((exercise) => exercise.exerciseNameSnapshot?.vi || exercise.exerciseId),
    ].join(' '));
    return words.every((word) => haystack.includes(word));
  });
}

/** A student's days, in the order the programme lists them, each with its lift count. */
export function studentDays(assignments = []) {
  const days = new Map();
  for (const assignment of assignments) {
    const label = String(assignment.dayLabel || '').trim();
    if (!label) continue;
    days.set(label, (days.get(label) || 0) + 1);
  }
  return [...days].map(([label, count]) => ({ label, count }));
}

/** One template name per day: "Strength A — Upper" with a shared name, or the day itself. */
export function templateNameFor(day, prefix = '') {
  const shared = String(prefix || '').trim();
  return shared ? `${shared} — ${day}` : day;
}

/** The lifts of one day, in order, as a template stores them. */
export function dayExercises(assignments = [], day) {
  return assignments
    .filter((assignment) => assignment.dayLabel === day)
    .sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0))
    .map((assignment) => ({
      exerciseId: assignment.exerciseId,
      exerciseNameSnapshot: assignment.exerciseNameSnapshot,
      orderInDay: assignment.orderInDay || 0,
    }));
}
