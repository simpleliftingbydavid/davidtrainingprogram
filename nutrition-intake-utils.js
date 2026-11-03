// ============================================================
// DAVID TRAINING PROGRAM — Raw or cooked weights
// ============================================================
// Pure module: no DOM, no Firebase.
//
// The food table weighs meat and fish raw ("Ức gà bỏ da (sống)", "Thịt bò thăn"). A client
// weighs what is on the plate, so meat and fish can be logged cooked and are turned back into
// raw grams with an average yield: 200 g of cooked chicken breast is about 270 g raw, and read
// as raw it would under-count protein by a quarter. The yields are estimates (about ±10%).
//
// 2026-11-03: the menu comparison that used to live here (meal logs against the plan, make-up
// suggestions) went with the sample menus. Only the raw/cooked helpers the food log uses stay.

/** Cooked weight from 1 g raw, for the foods the table weighs raw. */
export const COOKED_YIELD = Object.freeze({
  'Ức gà bỏ da (sống)': 0.75,
  'Đùi gà bỏ da (sống)': 0.75,
  'Thịt heo thăn nạc': 0.72,
  'Thịt heo ba chỉ': 0.7,
  'Thịt bò thăn': 0.72,
  'Thịt bò bắp': 0.68,
  'Cá basa fillet': 0.8,
  'Cá hồi fillet': 0.8,
  'Cá thu': 0.8,
  'Cá ngừ tươi': 0.78,
  'Cá rô phi': 0.8,
  'Tôm bỏ vỏ': 0.8,
  'Mực tươi': 0.7,
});

export function canWeighCooked(name) {
  return Object.prototype.hasOwnProperty.call(COOKED_YIELD, name);
}

/** The grams the food table counts for an entry: raw for meat and fish weighed cooked. */
export function planGrams(entry) {
  const grams = Math.max(0, Number(entry?.grams) || 0);
  return entry?.cooked && canWeighCooked(entry.name) ? grams / COOKED_YIELD[entry.name] : grams;
}

/** The same amount as the client would weigh it, raw or cooked. */
export function weighedGrams(rawGrams, name, cooked) {
  const grams = Math.max(0, Number(rawGrams) || 0);
  return cooked && canWeighCooked(name) ? grams * COOKED_YIELD[name] : grams;
}
