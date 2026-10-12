import { labelKey } from './day-label-utils.js';

// Renaming a training day ("Upper A" → "Full Body") for one student. The name of a day is
// stored in several places, so the rename has to carry all of them along:
//   * every assignment in the day (`dayLabel`),
//   * the student's list of paused days (`hiddenDays`),
//   * the planned frequency of the day in the cycle (`volumePlan.dayFrequencies`),
//   * `dayRenames` on the student: old name → new name, so "which day is next" still works
//     when the last session on file was logged under the old name.
// Past sessions keep the name they were logged under: that is what the day was called then.
// Pure: no DOM, no Firebase.

export const MAX_DAY_LABEL_LENGTH = 40;
const MAX_RENAMES_KEPT = 30;
const MAX_CHAIN = 10;

export const cleanDayLabel = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

/**
 * Whether `typed` is an acceptable new name for the day `fromLabel`, given the days that
 * exist in the same cycle. Returns { ok, label, error }.
 */
export function validateDayRename({ fromLabel, typed, existingLabels = [] }) {
  const from = cleanDayLabel(fromLabel);
  const label = cleanDayLabel(typed);
  if (!label) return { ok: false, label, error: 'Nhập tên mới cho buổi tập.' };
  if (label.length > MAX_DAY_LABEL_LENGTH) return { ok: false, label, error: `Tên buổi tối đa ${MAX_DAY_LABEL_LENGTH} ký tự.` };
  if (label === from) return { ok: false, label, error: 'Tên mới giống tên hiện tại.' };
  const clash = existingLabels.map(cleanDayLabel).find((other) => other !== from && labelKey(other) === labelKey(label));
  if (clash) {
    return {
      ok: false, label,
      error: `Đã có buổi “${clash}” trong giáo án này. Hãy chọn tên khác — nếu muốn gộp hai buổi, hãy chuyển các bài sang buổi kia.`,
    };
  }
  return { ok: true, label, error: '' };
}

/** Swap one entry in a list of day names, keeping it free of repeats. */
export function renameInList(list, from, to) {
  const result = [];
  for (const item of Array.isArray(list) ? list : []) {
    const name = cleanDayLabel(item) === from ? to : item;
    if (!result.includes(name)) result.push(name);
  }
  return result;
}

/** Move a value stored under a day's name to its new name. Other keys are untouched. */
export function renameKey(map, from, to) {
  const source = map && typeof map === 'object' ? map : {};
  if (!(from in source)) return { ...source };
  const { [from]: value, ...rest } = source;
  return { ...rest, [to]: value };
}

/**
 * The record of old → new names after renaming `from` to `to`. Earlier renames that ended at
 * `from` now end at `to`, and a name that is in use again stops being an old name.
 */
export function recordRename(renames, from, to) {
  const next = {};
  for (const [oldName, newName] of Object.entries(renames && typeof renames === 'object' ? renames : {})) {
    const target = newName === from ? to : newName;
    if (oldName !== target && oldName !== to) next[oldName] = target;
  }
  next[from] = to;
  // Newest wins when the record grows: only the most recent names matter for "which day is next".
  const entries = Object.entries(next);
  return Object.fromEntries(entries.slice(-MAX_RENAMES_KEPT));
}

/** The current name of a day that was logged under `label`, following renames. */
export function currentDayName(label, renames) {
  let name = cleanDayLabel(label);
  const seen = new Set();
  for (let step = 0; step < MAX_CHAIN && renames && Object.prototype.hasOwnProperty.call(renames, name) && !seen.has(name); step += 1) {
    seen.add(name);
    name = cleanDayLabel(renames[name]);
  }
  return name;
}
