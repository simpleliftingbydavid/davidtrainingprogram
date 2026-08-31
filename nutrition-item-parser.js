// ============================================================
// DAVID TRAINING PROGRAM — Meal item text → structured grams
// ============================================================
// Kept out of nutrition-meal-builder.js on purpose: every page that touches
// training-data.js needs this parser to save a plan, and none of them need
// the 30 KB solver that generates one.
//
// The round-trip against gramMealToPlanMeal's output format is covered in
// engine-test-harness.html, which is what stops the two drifting apart now
// that they no longer sit in the same file.

import { getFood } from './nutrition-foods.js';

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
