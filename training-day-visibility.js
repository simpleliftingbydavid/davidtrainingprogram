// ============================================================
// DAVID TRAINING PROGRAM — Paused training days
// ============================================================
// A coach can pause one of a student's training days without touching the
// exercises in it: a client training four days who needs to drop to three for a
// few weeks keeps the fourth day's programme, its weights and its progression
// state exactly where they were, and gets them all back when the day resumes.
//
// WHY NOT JUST DEACTIVATE THE EXERCISES: setting active:false on every
// assignment in the day would look identical, in stored data, to the student
// having dropped those exercises themselves mid-session. That state already
// means something — it drives the "Học viên đã bỏ" list and the restore button
// — and overloading it would put a coach's deliberate scheduling decision into
// a list of things the student removed. Different cause, different meaning,
// different field.
//
// WHY NOT JUST SET THE WEEKLY FREQUENCY TO 0: the frequency is the coach's
// volume plan for that day. Writing 0 into it would destroy the number they had
// chosen, so resuming the day would silently come back at a frequency nobody
// picked. Pausing is stored on its own, and the frequency is DERIVED from it —
// a paused day counts as 0 while paused, and the coach's own number is still
// there, untouched, when it resumes.

/** Firestore stores this as an array of dayLabel strings on the phase. */
export function normalizeHiddenDays(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  for (const item of value) {
    const label = String(item || '').trim();
    if (label) seen.add(label);
  }
  return [...seen];
}

export function isDayHidden(dayLabel, hiddenDays) {
  return normalizeHiddenDays(hiddenDays).includes(String(dayLabel || '').trim());
}

/**
 * Toggle one day, returning the new list.
 *
 * Pure and list-in/list-out so the caller can show the result before writing it,
 * and so the rule below is testable on its own.
 */
export function toggleHiddenDay(dayLabel, hiddenDays) {
  const label = String(dayLabel || '').trim();
  const current = normalizeHiddenDays(hiddenDays);
  if (!label) return current;
  return current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
}

/**
 * Whether this day may be paused, and why not when it may not.
 *
 * The last remaining day cannot be paused. A programme where every day is
 * paused is not a lighter week — it is a student who opens the app and finds
 * nothing to do, with no error to explain it. Caught here rather than in the
 * interface so the rule holds wherever it is called from.
 *
 * @param {string} dayLabel          the day being paused
 * @param {string[]} allDayLabels    every day in the programme
 * @param {string[]} hiddenDays      days already paused
 */
export function canHideDay(dayLabel, allDayLabels = [], hiddenDays = []) {
  const label = String(dayLabel || '').trim();
  if (!label) return { allowed: false, reason: 'Buổi tập không hợp lệ.' };
  if (isDayHidden(label, hiddenDays)) return { allowed: true, reason: '' };
  const all = [...new Set(allDayLabels.map((item) => String(item || '').trim()).filter(Boolean))];
  const remaining = all.filter((item) => item !== label && !isDayHidden(item, hiddenDays));
  if (!remaining.length) {
    return {
      allowed: false,
      reason: 'Đây là buổi tập duy nhất còn lại. Ẩn nốt thì học viên mở app ra sẽ không còn gì để tập.',
    };
  }
  return { allowed: true, reason: '' };
}

/**
 * The days a student is actually asked to train, and the ones on pause.
 *
 * Both lists are returned because the student's screen shows the paused days
 * too, greyed out and labelled. Hiding them outright was the other option and
 * was rejected: a day that silently vanishes from the app reads as a bug to the
 * person it happened to, and they message the coach to ask where it went.
 */
export function splitDaysByVisibility(dayLabels = [], hiddenDays = []) {
  const hidden = normalizeHiddenDays(hiddenDays);
  const all = [...new Set(dayLabels.map((item) => String(item || '').trim()).filter(Boolean))];
  return {
    activeDays: all.filter((label) => !hidden.includes(label)),
    pausedDays: all.filter((label) => hidden.includes(label)),
  };
}

/**
 * Weekly frequencies with paused days forced to zero.
 *
 * This is the whole reason pausing does not need to write anything into the
 * volume plan: the planned-volume figures read frequencies through here, so a
 * paused day stops counting the moment it is paused and starts counting again,
 * at the coach's original number, the moment it resumes.
 */
export function frequenciesWithPausedDays(frequencies = {}, hiddenDays = []) {
  const hidden = normalizeHiddenDays(hiddenDays);
  return Object.fromEntries(Object.entries(frequencies || {})
    .map(([label, value]) => [label, hidden.includes(label) ? 0 : value]));
}
