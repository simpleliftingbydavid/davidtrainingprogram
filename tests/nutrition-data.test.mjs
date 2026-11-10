// Dữ liệu dinh dưỡng chi tiết, Mốc 1 (David, 2026-11-03): vi chất, khẩu phần, món ăn ngoài.
//   node tests/nutrition-data.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FOODS, STREET_DISHES, getFood } from '../nutrition-foods.js';
import { FOOD_MICROS, MACRO_MISMATCHES, MICRO_KEYS, VITAMIN_KEYS } from '../nutrition-micros.js';
import { PORTIONS, portionsFor } from '../nutrition-portions.js';
import { STREET_RECIPES, STREET_SODIUM_NOTE } from '../nutrition-street-recipes.js';
import { getExtraFood } from '../nutrition-foods-extra.js';
import { NUTRIENT_KEYS, foodNutrients, recipeNutrients, roundNutrients, streetDishNutrients, sumNutrients } from '../nutrition-composition.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('six minerals and nine vitamins, twenty nutrients in all', () => {
  assert.deepEqual([...MICRO_KEYS], ['potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc']);
  assert.deepEqual([...VITAMIN_KEYS], ['vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'vitaminB1', 'vitaminB6', 'folate', 'vitaminB12']);
  assert.equal(NUTRIENT_KEYS.length, 20);
});

check('vitamins come straight from USDA SR Legacy (egg, FDC 171287) and are never negative', () => {
  const egg = FOOD_MICROS['Trứng gà nguyên quả'];
  assert.equal(egg.source.fdcId, 171287);
  assert.deepEqual({ ...egg.vitamins }, { vitaminA: 160, vitaminC: 0, vitaminD: 2, vitaminE: 1.05, vitaminK: 0.3, vitaminB1: 0.04, vitaminB6: 0.17, folate: 47, vitaminB12: 0.89 });
  Object.values(FOOD_MICROS).forEach((entry) => VITAMIN_KEYS.forEach((key) => {
    const value = entry.vitamins[key];
    assert.ok(value === null || (Number.isFinite(value) && value >= 0), key);
  }));
  // Vitamin A theo µg RAE, không phải IU: gan và cà rốt có số lớn, nhưng không món nào vượt 10.000 µg/100 g.
  Object.values(FOOD_MICROS).forEach((entry) => assert.ok(entry.vitamins.vitaminA === null || entry.vitamins.vitaminA < 10000));
});

check('every food in the table has a micronutrient entry, with its source or an explicit gap', () => {
  FOODS.forEach((food) => {
    const entry = FOOD_MICROS[food.name];
    assert.ok(entry, food.name);
    MICRO_KEYS.forEach((key) => {
      const value = entry.micros[key];
      assert.ok(value === null || (Number.isFinite(value) && value >= 0), `${food.name} ${key}`);
      assert.equal(entry.microSource[key], value === null ? null : entry.microSource[key], `${food.name} ${key} source`);
      if (value !== null) assert.ok(['VN', 'USDA', 'AU', 'NO'].includes(entry.microSource[key]), `${food.name} ${key} has a source`);
    });
    if (entry.source) {
      assert.equal(entry.source.db, 'USDA');
      assert.ok(Number.isInteger(entry.source.fdcId) && entry.source.description, food.name);
    }
  });
  assert.equal(Object.keys(FOOD_MICROS).length, FOODS.length, 'no entry for a food the table does not have');
});

check('foods USDA does not have are left empty, never guessed', () => {
  ['Thanh long ruột trắng', 'Chả lụa'].forEach((name) => {
    assert.equal(FOOD_MICROS[name].source, null, name);
    assert.ok(MICRO_KEYS.every((key) => FOOD_MICROS[name].micros[key] === null), name);
    assert.ok(FOOD_MICROS[name].note, name);
  });
  assert.equal(FOOD_MICROS['Nấm rơm'].micros.sodium, null, 'canned straw mushrooms: brine sodium left out');
  assert.equal(FOOD_MICROS['Cơm trắng (chín)'].source.fdcId, 169757, 'unenriched rice, not the iron-fortified US rice');
});

check('the existing calories and macros are not changed; mismatches are only listed', () => {
  const rice = getFood('Cơm trắng (chín)');
  assert.deepEqual([rice.kcal, rice.carb, rice.fat, rice.protein, rice.fiber], [130, 28, 0.3, 2.7, 0.4]);
  assert.ok(MACRO_MISMATCHES.length > 0);
  MACRO_MISMATCHES.forEach((line) => assert.match(line, /^.+: .+\(USDA [\d.]+\)/));
});

check('a food\'s nutrients scale with grams; a gap stays a gap', () => {
  const egg = roundNutrients(foodNutrients('Trứng gà nguyên quả', 50));
  assert.equal(egg.values.kcal, Math.round(getFood('Trứng gà nguyên quả').kcal / 2));
  assert.equal(egg.values.sodium, Math.round(FOOD_MICROS['Trứng gà nguyên quả'].micros.sodium * 5) / 10);
  assert.deepEqual(egg.missing, []);
  const pitaya = foodNutrients('Thanh long ruột trắng', 100);
  assert.deepEqual(pitaya.missing, [...MICRO_KEYS, ...VITAMIN_KEYS]);
  const total = sumNutrients([foodNutrients('Chuối', 100), pitaya]);
  assert.deepEqual(total.missing, [...MICRO_KEYS, ...VITAMIN_KEYS], 'one food without data makes the total incomplete, not lower');
  assert.equal(foodNutrients('Không có món này', 100), null);
});

check('portions: USDA ones carry their source; Vietnamese ones are filled only from researched sources, the rest wait for David', () => {
  assert.ok(PORTIONS.length > 0);
  PORTIONS.forEach((p) => {
    assert.ok(getFood(p.food), p.food);
    if (p.source?.db === 'USDA') assert.ok(p.grams > 0 && Number.isInteger(p.source.fdcId) && p.source.measure, p.id);
    else if (p.grams !== null) {
      assert.equal(p.source.db, 'David', p.id);
      assert.ok(p.refs.length >= 2, `${p.id}: at least two references`);
      assert.equal(p.approved, true, p.id);
    } else {
      assert.ok(p.proposal, `${p.id}: says what David has to decide`);
      assert.equal(p.approved, false, p.id);
    }
    if (p.source?.db === 'USDA') assert.equal(p.approved, true, p.id);
  });
  assert.equal(new Set(PORTIONS.map((p) => p.id)).size, PORTIONS.length, 'ids are unique');
  assert.equal(PORTIONS.find((p) => p.food === 'Trứng gà nguyên quả' && p.label === '1 quả to').grams, 50);
  assert.deepEqual(portionsFor('Trứng gà nguyên quả').map((p) => p.grams), [50, 44]);
  assert.deepEqual(portionsFor('Cơm trắng (chín)').map((p) => p.grams), [110]);
  assert.deepEqual(portionsFor('Cá hồi fillet').map((p) => p.grams), [105], 'a palm: 85 g cooked (CDC, USDA, AHA), as raw');
  assert.deepEqual(portionsFor('Ức gà bỏ da (sống)').map((p) => p.grams), [115]);
  assert.deepEqual(portionsFor('Gạo nếp (xôi chín)'), [], 'skipped by David: entered in grams');
  assert.ok(PORTIONS.every((p) => p.grams !== null), 'no portion is left waiting for grams');
  assert.equal(PORTIONS.find((p) => p.food === 'Sữa tươi không đường' && p.label === '1 hộp 180 ml').grams, 185);
});

check('street dishes: every dish has a proposal, only table foods; David approved the 2026-11-03 and 2026-11-10 recipes', () => {
  assert.deepEqual(STREET_RECIPES.map((d) => d.name), STREET_DISHES.map((d) => d.name));
  STREET_RECIPES.forEach((dish) => {
    assert.equal(dish.approved, Boolean(dish.recipe), dish.name);
    assert.ok(dish.assumptions, dish.name);
    (dish.recipe || []).forEach((part) => assert.ok((getFood(part.food) || getExtraFood(part.food)) && part.grams > 0, `${dish.name}: ${part.food}`));
  });
  assert.equal(STREET_RECIPES.filter((d) => d.approved).length, 40);
  assert.equal(STREET_RECIPES.filter((d) => d.proposedOn === '2026-11-10').length, 14);
  assert.equal(STREET_RECIPES.find((d) => d.name === 'Nước mía (500ml)').recipe, null, 'USDA SR Legacy không có nước mía');
});

check('each 2026-11-03 recipe lands within 15% of the dish\'s known calorie range (the 2026-11-10 ones were approved knowing 6 fall outside)', () => {
  STREET_RECIPES.filter((d) => d.recipe && !d.proposedOn).forEach((dish) => {
    const street = STREET_DISHES.find((d) => d.name === dish.name);
    const kcal = recipeNutrients(dish.recipe).values.kcal;
    assert.ok(kcal >= street.kcalLow * 0.85 && kcal <= street.kcalHigh * 1.15, `${dish.name}: ${Math.round(kcal)} kcal`);
  });
});

check('an approved recipe counts every nutrient but sodium; a dish without one keeps calories and protein', () => {
  const pho = streetDishNutrients('Phở bò tái', 2);
  const recipe = recipeNutrients(STREET_RECIPES.find((d) => d.name === 'Phở bò tái').recipe);
  assert.ok(Math.abs(pho.values.kcal - recipe.values.kcal * 2) < 1e-9);
  assert.equal(pho.values.sodium, 0);
  assert.ok(pho.missing.includes('sodium') && !pho.missing.includes('carb'));
  assert.equal(pho.estimated, true);
  const coffee = streetDishNutrients('Nước mía (500ml)', 2);
  const street = STREET_DISHES.find((d) => d.name === 'Nước mía (500ml)');
  assert.equal(coffee.values.kcal, street.kcalLow + street.kcalHigh);
  assert.equal(coffee.values.protein, street.protein * 2);
  assert.ok(coffee.missing.includes('carb') && coffee.missing.includes('sodium'));
  assert.match(STREET_SODIUM_NOTE, /Natri không tính/);
});

check('the review page is for the coach only and changes nothing', () => {
  const page = readFileSync(new URL('../nutrition-review.html', import.meta.url), 'utf8');
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  assert.match(page, /import \{ getMyRole \} from '\.\/training-data\.js';/, 'reads nothing from students, writes nothing');
  const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  assert.match(coach, /href="nutrition-review\.html"/);
});

check('the scripts that make the data are in the repository', () => {
  const build = readFileSync(new URL('../scripts/usda/build-micros.mjs', import.meta.url), 'utf8');
  assert.match(build, /SR Legacy 2018-04/);
  const vn = readFileSync(new URL('../scripts/import-vn-foods.mjs', import.meta.url), 'utf8');
  assert.match(vn, /vn-foods\.json/);
});

check('gaps are filled from the Australian table, then the Norwegian one, cell by cell, with the source', () => {
  const selected = JSON.parse(readFileSync(new URL('../scripts/foreign/selected.json', import.meta.url), 'utf8'));
  assert.match(selected.sources.AU.title, /Food Standards Australia New Zealand/);
  assert.match(selected.sources.NO.title, /Norwegian Food Composition Table 2022/);
  const whey = FOOD_MICROS['Whey protein isolate (bột)'];
  assert.equal(whey.foreign.source, 'AU');
  assert.equal(whey.foreign.id, 'F007493');
  MICRO_KEYS.forEach((key) => {
    assert.equal(whey.microSource[key], 'AU');
    assert.equal(whey.micros[key], selected.rows['AU:F007493'].values[key]);
  });
  const usdaRice = FOOD_MICROS['Cơm trắng (chín)'];
  assert.ok(MICRO_KEYS.every((key) => usdaRice.microSource[key] === 'USDA'), 'USDA comes before Australia');
});

check('the extraction script never turns a gap into zero and converts kJ to kcal', () => {
  // Strip CR so the multi-line regex below matches on CRLF checkouts (core.autocrlf=true).
  const script = readFileSync(new URL('../scripts/foreign/extract.py', import.meta.url), 'utf8').replace(/\r/g, '');
  assert.match(script, /round\(kj \/ 4\.184, 1\)/);
  assert.match(script, /return float\(value\) if value >= 0 else None\n {4}return None/);
});

check('only official nutrition sources: no shop, brand site, blog or calorie app is cited (David, 2026-11-03)', () => {
  const banned = /huggies|gnc\.com|fatsecret|toplist|dienmayxanh|precisionnutrition|myplate\.food|nhathuoclongchau|pharmacity|vinamilk\.com|thtruemilk/i;
  const official = new Set(['nhà nước', 'đại học', 'hiệp hội chuyên môn']);
  PORTIONS.forEach((p) => {
    (p.refs || []).forEach((ref) => {
      assert.doesNotMatch(String(ref.url || ''), banned, `${p.id}: ${ref.url}`);
      assert.ok(['nhà nước', 'đại học', 'hiệp hội chuyên môn', 'nhãn sản phẩm', 'bệnh viện (nguồn phụ)'].includes(ref.kind), `${p.id}: ${ref.title} has a kind`);
      if (ref.kind === 'nhãn sản phẩm') assert.equal(ref.url, '', `${p.id}: a label is cited without a shop link`);
    });
    const hasOfficial = p.source?.db === 'USDA' || (p.refs || []).some((ref) => official.has(ref.kind));
    assert.ok(hasOfficial, `${p.id}: at least one official source`);
  });
  const files = ['../scripts/usda/portion-map.json', '../scripts/usda/food-map.json', '../scripts/foreign/extra-map.json', '../nutrition-street-recipes.js', '../nutrition-review.html'];
  files.forEach((file) => assert.doesNotMatch(readFileSync(new URL(file, import.meta.url), 'utf8'), banned, file));
});

console.log(`NUTRITION_DATA_OK ${passed} passed`);
