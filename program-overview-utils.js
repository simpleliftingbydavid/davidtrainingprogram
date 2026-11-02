import { getInitialPrescription } from './progression-engine.js';
import { phaseDayFrequencies } from './volume-engine.js';
import { isDayHidden, normalizeHiddenDays } from './training-day-visibility.js';
import { dayOf, daysBetween } from './home-utils.js';

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

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Where the client is in the running cycle: week n (counted from its start, 7 days a week)
 * and, when David set an end date, of how many weeks. The start is the planned start date,
 * else the day the cycle was switched on. Null when neither is known.
 */
export function cycleWeek(phase, today) {
  if (!phase) return null;
  const planned = String(phase.plannedStartDate || '');
  const start = ISO_DAY.test(planned) ? planned : dayOf(phase.activatedAt);
  if (!start) return null;
  const endRaw = String(phase.plannedEndDate || '');
  const end = ISO_DAY.test(endRaw) && endRaw >= start ? endRaw : null;
  const elapsed = daysBetween(start, today);
  const totalWeeks = end ? Math.max(1, Math.ceil((daysBetween(start, end) + 1) / 7)) : null;
  return {
    start, end, totalWeeks,
    beforeStart: elapsed < 0,
    afterEnd: Boolean(end) && today > end,
    week: elapsed < 0 ? 0 : Math.floor(elapsed / 7) + 1,
  };
}
