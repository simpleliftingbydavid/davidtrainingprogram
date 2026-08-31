// ============================================================
// DAVID TRAINING PROGRAM — Meal item line format
// ============================================================
// Owns the shape of one printed meal line in both directions: reading grams
// back out of it, and keeping its hand-portion hint truthful.
// Kept out of nutrition-meal-builder.js on purpose: every page that touches
// training-data.js needs this parser to save a plan, and none of them need
// the 30 KB solver that generates one.
//
// The round-trip against gramMealToPlanMeal's output format is covered in
// engine-test-harness.html, which is what stops the two drifting apart now
// that they no longer sit in the same file.

import { getFood, HAND_PORTIONS } from './nutrition-foods.js';

/**
 * Read gram amounts back out of a meal's item lines.
 *
 * The inverse of the line gramMealToPlanMeal writes
 * ("Ức gà bỏ da (sống) — 95 g (≈ 0.9 phần đạm)"), and deliberately the
 * inverse rather than a copy of the generator's own array.
 *
 * WHY DERIVE INSTEAD OF CARRY: the coach edits those lines by hand before
 * sending, and both coach editors rebuild every meal from that text. Carrying
 * the generated array through a save would keep the numbers the generator
 * picked, so a coach who changed 95 g to 150 g would leave a stored record
 * claiming 95 g. Structured data that quietly disagrees with the plan the
 * client is reading is worse than no structured data at all. Parsing the text
 * back means the two can never drift.
 *
 * Only lines naming a food in the table are returned. A free-text line
 * ("uống 500 ml nước") has no macros to give and is left alone — it still
 * appears in `items`, which is always stored in full. Comparing
 * gramItems.length against items.length is how a caller tells whether the
 * structured view covers the whole meal or only part of it.
 */
const GRAM_LINE = /^(.+?)\s*[—–-]\s*(\d+(?:[.,]\d+)?)\s*g(?![a-zA-ZÀ-ỹ])/;

export function parseGramItems(items) {
  if (!Array.isArray(items)) return [];
  const parsed = [];
  for (const raw of items) {
    const match = GRAM_LINE.exec(String(raw || '').trim());
    if (!match) continue;
    const food = getFood(match[1].trim());
    if (!food) continue;
    const grams = Number(match[2].replace(',', '.'));
    // A plan never legitimately prescribes 0 g or 3 kg of one food; a value
    // outside that range is a typo, and storing it would poison any later
    // per-food total.
    if (!Number.isFinite(grams) || grams <= 0 || grams > 2000) continue;
    const k = grams / 100;
    const round1 = (value) => Math.round(value * 10) / 10;
    parsed.push({
      name: food.name,
      group: food.group,
      grams: round1(grams),
      kcal: Math.round(food.kcal * k),
      protein: round1(food.protein * k),
      carbs: round1(food.carb * k),
      fat: round1(food.fat * k),
    });
  }
  return parsed;
}

/** Grams of each food expressed as hand-sized portions, for clients who will
 *  not weigh anything. */
export function handPortions(item, sex) {
  const table = HAND_PORTIONS[sex === 'female' ? 'female' : 'male'];
  if (item.group === 'PROTEIN' && item.protein > 0) return { count: Math.round(item.protein / table.PROTEIN * 10) / 10, unit: 'phần đạm' };
  if (item.group === 'CARB' && item.carbs > 0) return { count: Math.round(item.carbs / table.CARB * 10) / 10, unit: 'phần tinh bột' };
  if (item.group === 'FAT' && item.fat > 0) return { count: Math.round(item.fat / table.FAT * 10) / 10, unit: 'phần béo' };
  if (item.group === 'RAU') return { count: Math.round(item.grams / table.RAU * 10) / 10, unit: 'phần rau' };
  return null;
}

/** The hand-portion hint the generator appends, e.g. " (≈ 1.4 phần đạm)". */
const HAND_HINT = /\s*\(≈[^)]*\)/;

/**
 * Recompute the hand-portion hint on lines whose grams were edited by hand.
 *
 * The generator writes "Thịt bò thăn — 130 g (≈ 1.1 phần đạm)". A coach who
 * changes 130 to 175 has no reason to also recompute the parenthetical, so it
 * silently keeps describing the old amount — and the hint is precisely what a
 * client who will not weigh their food reads instead of the grams. Left alone,
 * the number they act on is the stale one.
 *
 * Only an existing hint is rewritten. A line the coach typed without one is
 * left exactly as written: fixing a stale number is asked for, appending
 * commentary to their prose is not. Anything else on the line — a cooking note
 * after the hint, a food outside the table — survives untouched.
 *
 * Needs the client's sex because a hand is a different size: one palm of
 * protein counts as 25 g for men and 20 g for women. Without it, nothing is
 * rewritten, since guessing would replace a stale number with a wrong one.
 */
export function refreshHandPortionHints(items, sex) {
  const lines = (Array.isArray(items) ? items : []).map((item) => String(item || '').trim()).filter(Boolean);
  if (sex !== 'male' && sex !== 'female') return lines;
  return lines.map((line) => {
    if (!HAND_HINT.test(line)) return line;
    const parsed = parseGramItems([line])[0];
    if (!parsed) return line;
    const hand = handPortions(parsed, sex);
    return line.replace(HAND_HINT, hand ? ` (≈ ${hand.count} ${hand.unit})` : '');
  });
}
