// Picking a day label ("Buổi (nhãn)") when adding an exercise, without having to
// remember what the programme calls its days. Pure: no DOM, no Firebase.
//
// The costly mistake is a near-miss. "Lower1" typed where the programme has
// "Lower 1" does not fail; it quietly creates a second, one-exercise day. So
// besides filtering, this notices labels that differ only by case, spacing or one
// slipped character, and says so before the exercise is saved.

/** Starter labels for a cycle that has none yet. */
export const STARTER_DAY_LABELS = Object.freeze(['A', 'B', 'C', 'D', 'Upper', 'Lower', 'Push', 'Pull', 'Legs', 'Full Body']);

/** Case, accents and spacing removed: "Lower 1", "lower1" and "LOWER-1" are one key. */
export function labelKey(label) {
  return String(label ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function words(label) {
  return String(label ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** Days matching what has been typed: its start first, then anywhere in the label.
 *  Each item is { label, count, paused }. An empty query returns everything, as is. */
export function filterDayLabels(items, query) {
  const key = labelKey(query);
  if (!key) return [...items];
  const starts = [];
  const contains = [];
  for (const item of items) {
    const itemKey = labelKey(item.label);
    if (itemKey.startsWith(key) || words(item.label).some((word) => word.startsWith(key))) starts.push(item);
    else if (itemKey.includes(key)) contains.push(item);
  }
  return [...starts, ...contains];
}

function editDistanceAtMostOne(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  return short.slice(i) === long.slice(i + 1);
}

/** An existing day the typed label is probably meant to be, or null.
 *  kind 'same': identical apart from case, accents or spacing.
 *  kind 'typo': one character off (only for keys of 3+ characters, so "A" and "B"
 *  are never taken for each other). */
export function nearDuplicateLabel(existing, typed) {
  const typedText = String(typed ?? '').trim();
  const key = labelKey(typedText);
  if (!key) return null;
  const labels = existing.map((item) => (typeof item === 'string' ? item : item.label));
  if (labels.includes(typedText)) return null;
  const same = labels.find((label) => labelKey(label) === key);
  if (same) return { label: same, kind: 'same' };
  if (key.length < 3) return null;
  // Days that differ only in their number ("Lower 1" and "Lower 3") are different days,
  // not a slip: a new numbered day must never be flagged as a typo of its neighbour.
  const skeleton = (text) => text.replace(/\d+/g, '#');
  const typo = labels.find((label) => {
    const other = labelKey(label);
    return other.length >= 3 && skeleton(other) !== skeleton(key) && editDistanceAtMostOne(key, other);
  });
  return typo ? { label: typo, kind: 'typo' } : null;
}

/** Labels that continue the programme's own pattern: A, B → C; Lower 1, Lower 2 →
 *  Lower 3. Only what is not already a day. */
export function nextDayLabels(existing) {
  const labels = existing.map((item) => (typeof item === 'string' ? item : item.label).trim()).filter(Boolean);
  const taken = new Set(labels.map(labelKey));
  const out = [];
  const letters = labels.filter((label) => /^[A-Za-z]$/.test(label));
  if (letters.length) {
    const highest = Math.max(...letters.map((label) => label.toUpperCase().charCodeAt(0)));
    if (highest < 90) {
      const next = String.fromCharCode(highest + 1);
      if (!taken.has(labelKey(next))) out.push(next);
    }
  }
  // "Lower 1" and "lower 2" belong to one series; the first spelling seen is the one continued.
  const series = new Map();
  for (const label of labels) {
    const match = label.match(/^(.*?)(\d+)$/);
    if (!match || !match[1].trim()) continue;
    const key = labelKey(match[1]);
    const entry = series.get(key) || { prefix: match[1], highest: 0 };
    entry.highest = Math.max(entry.highest, Number(match[2]));
    series.set(key, entry);
  }
  for (const { prefix, highest } of series.values()) {
    const next = `${prefix}${highest + 1}`;
    if (!taken.has(labelKey(next)) && !out.includes(next)) out.push(next);
  }
  return out.slice(0, 3);
}

/** Labels used in the student's earlier cycles that this one does not have yet. */
export function earlierCycleLabels(earlier, current) {
  const have = new Set(current.map((item) => labelKey(typeof item === 'string' ? item : item.label)));
  const seen = new Set();
  const out = [];
  for (const label of earlier) {
    const text = String(label ?? '').trim();
    const key = labelKey(text);
    if (!text || have.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}
