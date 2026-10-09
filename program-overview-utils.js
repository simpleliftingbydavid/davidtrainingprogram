import { getInitialPrescription } from './progression-engine.js';
import { phaseDayFrequencies } from './volume-engine.js';
import { isDayHidden, normalizeHiddenDays } from './training-day-visibility.js';

// The student's whole programme at a glance: every day of the active cycle, every
// exercise with the prescription David has set, and which days are paused.
// Pure — the page only has to draw it.

function kg(value) {
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
}

/** One line a student can read: "60 kg · 3 set × 8 rep". Empty if the scheme
 *  cannot be evaluated, so one bad assignment never blanks the whole page. */
export function prescriptionSummary(assignment) {
  let planned;
  try {
    planned = getInitialPrescription({ scheme: assignment.scheme, schemeParams: assignment.schemeParams || {}, state: assignment.state || {} });
  } catch {
    return '';
  }
  if (Array.isArray(planned.setPrescriptions) && planned.setPrescriptions.length) {
    return `${planned.setPrescriptions.length} set: ${planned.setPrescriptions.map((set) => `${kg(set.weight)}×${set.reps}`).join(' · ')} kg`;
  }
  const load = Number(planned.weight) > 0 ? `${kg(planned.weight)} kg` : 'Tạ cơ thể';
  if (Number.isFinite(Number(planned.lowerSets)) && Number.isFinite(Number(planned.upperSets)) && planned.lowerSets !== planned.upperSets) {
    return `${load} · ${planned.reps} rep mỗi set · ${planned.lowerSets}–${planned.upperSets} set`;
  }
  return `${load} · ${planned.sets} set × ${planned.reps} rep`;
}

/** Days in the order the programme lists them, exercises in their set order.
 *  `weeklyTarget` is the sessions a week the coach has planned, paused days
 *  excluded — the same number the volume plan uses. */
export function buildProgramOverview({ assignments = [], phase = null, hiddenDays = [] } = {}) {
  const paused = normalizeHiddenDays(hiddenDays);
  const labels = [...new Set(assignments.map((item) => String(item.dayLabel || '').trim()).filter(Boolean))];
  const frequencies = phaseDayFrequencies(assignments, phase, paused);
  const days = labels.map((label) => ({
    label,
    paused: isDayHidden(label, paused),
    perWeek: frequencies[label] ?? 0,
    exercises: assignments
      .filter((item) => String(item.dayLabel || '').trim() === label)
      .sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0))
      .map((item) => ({
        id: item.id,
        name: item.exerciseNameSnapshot?.vi || item.exerciseId || 'Bài tập',
        summary: prescriptionSummary(item),
        note: String(item.note || '').trim(),
      })),
  }));
  const weeklyTarget = Object.values(frequencies).reduce((sum, value) => sum + value, 0);
  return { phaseName: String(phase?.name || '').trim(), days, weeklyTarget };
}
