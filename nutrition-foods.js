// ============================================================
// DAVID TRAINING PROGRAM — Nutrition food data
// ============================================================
// Ported from the coach's standalone tool (nutrition-automation.netlify.app)
// so both surfaces use one shared table instead of drifting apart.
//
// All macros are per 100 g of the food AS NAMED — "sống" means raw weight,
// "chín"/"luộc" means cooked weight. That distinction matters: 100 g raw
// chicken and 100 g cooked chicken are not the same food, and the generated
// plan prints the name so the client weighs the right thing.
//
// These are reference values for common Vietnamese foods. Real items vary
// with cut, cooking method and supplier, so treat them as close estimates,
// not lab numbers.

/** Macro group. RAU (vegetables) is tracked separately from CARB because the
 *  generator allocates vegetables by volume for satiety/fibre, not to hit a
 *  macro target. */
export const FOOD_GROUPS = Object.freeze({
  CARB: 'Tinh bột / trái cây',
  PROTEIN: 'Đạm',
  FAT: 'Béo',
  RAU: 'Rau',
});

/** kcal, carb, fat, protein, fiber — all grams per 100 g. */
function food(name, group, kcal, carb, fat, protein, fiber) {
  return Object.freeze({ name, group, kcal, carb, fat, protein, fiber });
}

export const FOODS = Object.freeze([
  // ---------------- Tinh bột & trái cây ----------------
  food('Cơm trắng (chín)', 'CARB', 130, 28, 0.3, 2.7, 0.4),
  food('Cơm gạo lứt (chín)', 'CARB', 123, 26, 1.0, 2.6, 1.6),
  food('Bún tươi', 'CARB', 110, 25, 0.1, 1.7, 0.5),
  food('Bánh phở tươi', 'CARB', 130, 29, 0.2, 2.2, 0.6),
  food('Bánh phở khô', 'CARB', 360, 80, 0.6, 6.0, 1.6),
  food('Miến dong (khô)', 'CARB', 340, 84, 0.1, 0.2, 1.0),
  food('Bánh mì trắng', 'CARB', 265, 49, 3.2, 9.0, 2.7),
  food('Bánh mì nguyên cám', 'CARB', 250, 46, 3.4, 9.0, 6.5),
  food('Yến mạch (khô)', 'CARB', 380, 67, 7.0, 13.0, 10.0),
  food('Khoai lang (luộc)', 'CARB', 90, 21, 0.2, 1.6, 3.3),
  food('Khoai tây (luộc)', 'CARB', 87, 20, 0.1, 2.0, 1.8),
  food('Bắp ngọt (luộc)', 'CARB', 96, 21, 1.5, 3.4, 2.4),
  food('Bí đỏ', 'CARB', 26, 7, 0.1, 1.0, 0.5),
  food('Cà rốt', 'CARB', 41, 10, 0.2, 0.9, 2.8),
  food('Chuối', 'CARB', 89, 23, 0.3, 1.1, 2.6),
  food('Táo', 'CARB', 52, 14, 0.2, 0.3, 2.4),
  food('Cam', 'CARB', 47, 12, 0.1, 0.9, 2.4),
  food('Xoài chín', 'CARB', 60, 15, 0.4, 0.8, 1.6),
  food('Thanh long ruột trắng', 'CARB', 60, 13, 0.4, 1.2, 3.0),
  food('Ổi', 'CARB', 68, 14, 1.0, 2.6, 5.4),
  food('Đu đủ chín', 'CARB', 43, 11, 0.3, 0.5, 1.7),
  food('Dưa hấu', 'CARB', 30, 8, 0.2, 0.6, 0.4),
  food('Nho', 'CARB', 69, 18, 0.2, 0.7, 0.9),
  food('Đường trắng', 'CARB', 400, 100, 0, 0, 0),

  // ---------------- Đạm ----------------
  food('Ức gà bỏ da (sống)', 'PROTEIN', 120, 0, 2.6, 23.0, 0),
  food('Đùi gà bỏ da (sống)', 'PROTEIN', 121, 0, 4.5, 20.0, 0),
  food('Thịt heo thăn nạc', 'PROTEIN', 143, 0, 5.0, 22.0, 0),
  food('Thịt heo ba chỉ', 'PROTEIN', 518, 0, 53.0, 9.0, 0),
  food('Thịt bò thăn', 'PROTEIN', 143, 0, 5.0, 22.0, 0),
  food('Thịt bò bắp', 'PROTEIN', 130, 0, 4.0, 22.0, 0),
  food('Cá basa fillet', 'PROTEIN', 124, 0, 6.0, 17.0, 0),
  food('Cá hồi fillet', 'PROTEIN', 208, 0, 13.0, 20.0, 0),
  food('Cá thu', 'PROTEIN', 190, 0, 12.0, 19.0, 0),
  food('Cá ngừ tươi', 'PROTEIN', 110, 0, 1.0, 24.0, 0),
  food('Cá rô phi', 'PROTEIN', 96, 0, 1.7, 20.0, 0),
  food('Tôm bỏ vỏ', 'PROTEIN', 99, 0.2, 0.9, 21.0, 0),
  food('Mực tươi', 'PROTEIN', 92, 3.0, 1.4, 16.0, 0),
  food('Trứng gà nguyên quả', 'PROTEIN', 143, 0.7, 9.5, 13.0, 0),
  food('Lòng trắng trứng', 'PROTEIN', 52, 0.7, 0.2, 11.0, 0),
  food('Đậu phụ trắng', 'PROTEIN', 76, 1.9, 4.8, 8.0, 0.3),
  food('Edamame (luộc)', 'PROTEIN', 121, 9.0, 5.0, 12.0, 5.0),
  food('Sữa đậu nành không đường', 'PROTEIN', 33, 1.3, 1.8, 3.3, 0.4),
  food('Sữa tươi không đường', 'PROTEIN', 60, 4.7, 3.3, 3.2, 0),
  food('Sữa chua Hy Lạp không đường', 'PROTEIN', 59, 3.6, 0.4, 10.0, 0),
  food('Whey protein isolate (bột)', 'PROTEIN', 370, 5.0, 1.0, 85.0, 0),

  // ---------------- Béo ----------------
  food('Dầu ăn (oliu, đậu nành)', 'FAT', 884, 0, 100, 0, 0),
  food('Bơ đậu phộng', 'FAT', 588, 20, 50, 25, 6.0),
  food('Đậu phộng rang', 'FAT', 567, 16, 49, 26, 8.5),
  food('Hạnh nhân', 'FAT', 579, 22, 50, 21, 12.5),
  food('Hạt điều', 'FAT', 553, 30, 44, 18, 3.3),
  food('Mè (vừng)', 'FAT', 573, 23, 50, 18, 12.0),
  food('Quả bơ', 'FAT', 160, 9, 15, 2.0, 7.0),
  food('Phô mai cheddar', 'FAT', 403, 1.3, 33, 25, 0),
  food('Phô mai mozzarella', 'FAT', 300, 2.2, 22, 22, 0),
  food('Cream cheese', 'FAT', 342, 4.0, 34, 6.0, 0),
  food('Nước cốt dừa', 'FAT', 230, 5.5, 24, 2.3, 2.2),
  food('Dừa nạo', 'FAT', 354, 15, 33, 3.3, 9.0),

  // ---------------- Rau ----------------
  food('Rau muống', 'RAU', 19, 3.1, 0.2, 2.6, 2.1),
  food('Cải ngọt', 'RAU', 22, 3.5, 0.3, 2.2, 2.0),
  food('Súp lơ xanh', 'RAU', 34, 7.0, 0.4, 2.8, 2.6),
  food('Bắp cải', 'RAU', 25, 6.0, 0.1, 1.3, 2.5),
  food('Dưa leo', 'RAU', 15, 3.6, 0.1, 0.7, 0.5),
  food('Cà chua', 'RAU', 18, 3.9, 0.2, 0.9, 1.2),
  food('Giá đỗ', 'RAU', 30, 6.0, 0.2, 3.0, 1.8),
  food('Rau dền', 'RAU', 23, 4.0, 0.3, 2.5, 2.2),
  food('Mướp', 'RAU', 20, 4.4, 0.2, 1.2, 1.1),
  food('Bí xanh', 'RAU', 13, 3.0, 0.2, 0.4, 1.0),
]);

const FOOD_BY_NAME = new Map(FOODS.map((item) => [item.name, item]));

export function getFood(name) {
  return FOOD_BY_NAME.get(name) || null;
}

/** Per-meal-slot candidate lists with sane gram ranges. The ranges are what
 *  keep the generator honest: without them the solver happily prescribes
 *  900 g of rice or 4 g of chicken to hit a macro exactly. */
function option(name, min, max) {
  return Object.freeze({ name, min, max });
}

export const MEAL_POOLS = Object.freeze({
  sang: Object.freeze({
    P: Object.freeze([
      option('Trứng gà nguyên quả', 50, 180),
      option('Sữa chua Hy Lạp không đường', 100, 300),
      option('Whey protein isolate (bột)', 20, 60),
      option('Sữa tươi không đường', 150, 400),
      option('Đậu phụ trắng', 80, 250),
    ]),
    C: Object.freeze([
      option('Yến mạch (khô)', 30, 110),
      option('Bánh mì nguyên cám', 40, 150),
      option('Bánh mì trắng', 40, 140),
      option('Khoai lang (luộc)', 100, 350),
      option('Chuối', 80, 250),
    ]),
    F: Object.freeze([
      option('Bơ đậu phộng', 8, 35),
      option('Hạnh nhân', 8, 35),
      option('Quả bơ', 30, 120),
      option('Mè (vừng)', 5, 25),
    ]),
    R: Object.freeze([option('Cà chua', 50, 150), option('Dưa leo', 50, 150)]),
  }),
  chinh: Object.freeze({
    P: Object.freeze([
      option('Ức gà bỏ da (sống)', 80, 280),
      option('Thịt heo thăn nạc', 80, 250),
      option('Thịt bò thăn', 80, 250),
      option('Thịt bò bắp', 80, 250),
      option('Cá basa fillet', 100, 280),
      option('Cá rô phi', 100, 300),
      option('Tôm bỏ vỏ', 80, 280),
      option('Cá ngừ tươi', 80, 250),
      option('Mực tươi', 100, 300),
      option('Trứng gà nguyên quả', 50, 200),
      option('Đậu phụ trắng', 100, 350),
    ]),
    C: Object.freeze([
      option('Cơm trắng (chín)', 100, 450),
      option('Cơm gạo lứt (chín)', 100, 450),
      option('Bún tươi', 100, 450),
      option('Bánh phở tươi', 100, 400),
      option('Khoai lang (luộc)', 100, 400),
      option('Khoai tây (luộc)', 100, 400),
      option('Bắp ngọt (luộc)', 80, 300),
    ]),
    F: Object.freeze([
      option('Dầu ăn (oliu, đậu nành)', 3, 20),
      option('Quả bơ', 30, 120),
      option('Hạt điều', 8, 35),
      option('Đậu phộng rang', 8, 35),
      option('Mè (vừng)', 5, 25),
    ]),
    R: Object.freeze([
      option('Rau muống', 80, 250), option('Cải ngọt', 80, 250),
      option('Súp lơ xanh', 80, 250), option('Bắp cải', 80, 250),
      option('Bí xanh', 80, 250), option('Mướp', 80, 250),
      option('Giá đỗ', 60, 200), option('Cà chua', 60, 200),
    ]),
  }),
  phu: Object.freeze({
    P: Object.freeze([
      option('Sữa chua Hy Lạp không đường', 100, 250),
      option('Whey protein isolate (bột)', 20, 50),
      option('Sữa tươi không đường', 150, 350),
      option('Trứng gà nguyên quả', 50, 120),
    ]),
    C: Object.freeze([
      option('Chuối', 80, 220), option('Táo', 100, 250),
      option('Ổi', 100, 250), option('Cam', 100, 300),
      option('Xoài chín', 80, 250),
    ]),
    F: Object.freeze([
      option('Hạnh nhân', 8, 30), option('Hạt điều', 8, 30),
      option('Đậu phộng rang', 8, 30), option('Bơ đậu phộng', 8, 30),
    ]),
    R: Object.freeze([]),
  }),
});

/** Grams that one hand-sized portion stands in for, so a client who will not
 *  weigh food still has a usable instruction. */
export const HAND_PORTIONS = Object.freeze({
  male: Object.freeze({ PROTEIN: 25, CARB: 25, FAT: 12, RAU: 100 }),
  female: Object.freeze({ PROTEIN: 20, CARB: 20, FAT: 9, RAU: 100 }),
});

export const HAND_DESCRIPTIONS = Object.freeze({
  PROTEIN: '1 lòng bàn tay (không tính ngón)',
  CARB: '1 nắm tay khum',
  FAT: '1 đốt ngón cái',
  RAU: '1 nắm tay đầy',
});

/** Restaurant/street dishes priced per SERVING (one bowl/plate/glass), not
 *  per 100 g. Ranges are wide on purpose — the same dish at two shops can
 *  differ 30% depending on oil, meat quantity and bowl size. Good enough to
 *  make a decision with, not good enough to count precisely.
 *  [name, kcalLow, kcalHigh, proteinG] */
export const STREET_DISHES = Object.freeze([
  ['Cơm tấm sườn bì chả', 600, 900, 35],
  ['Cơm tấm sườn', 550, 750, 32],
  ['Cơm sườn trứng ốp la', 650, 900, 38],
  ['Cơm gà xối mỡ', 600, 850, 35],
  ['Cơm gà Hải Nam', 550, 750, 35],
  ['Cơm chiên dương châu', 600, 800, 20],
  ['Phở bò tái', 350, 500, 25],
  ['Phở bò tái nạm', 400, 550, 28],
  ['Phở gà', 350, 450, 25],
  ['Bún bò Huế', 450, 650, 28],
  ['Bún chả', 500, 700, 30],
  ['Bún thịt nướng', 450, 650, 25],
  ['Bún riêu', 400, 550, 20],
  ['Bún đậu mắm tôm', 600, 900, 25],
  ['Hủ tiếu Nam Vang', 400, 600, 25],
  ['Mì Quảng', 450, 650, 25],
  ['Bánh canh cua', 400, 600, 22],
  ['Mì xào bò', 550, 750, 25],
  ['Phở xào', 550, 750, 22],
  ['Bánh mì thịt', 400, 600, 20],
  ['Bánh mì trứng', 350, 500, 16],
  ['Bánh mì chả cá', 400, 550, 18],
  ['Bánh bao nhân thịt trứng', 250, 350, 12],
  ['Xôi mặn', 450, 650, 15],
  ['Xôi xéo', 400, 550, 10],
  ['Cháo lòng', 350, 500, 18],
  ['Cháo gà', 300, 450, 18],
  ['Bánh cuốn', 300, 450, 12],
  ['Bánh xèo (1 cái)', 350, 550, 15],
  ['Gỏi cuốn (2 cuốn)', 150, 220, 10],
  ['Nem nướng', 450, 650, 25],
  ['Trà sữa trân châu (500ml)', 350, 500, 5],
  ['Trà sữa ít đường, không trân châu', 250, 380, 5],
  ['Cà phê sữa đá', 120, 200, 2],
  ['Cà phê đen không đường', 5, 20, 0],
  ['Nước ngọt (lon 330ml)', 130, 150, 0],
  ['Bia (lon 330ml)', 130, 160, 1],
  ['Nước mía (500ml)', 250, 350, 0],
  ['Sinh tố bơ', 300, 450, 5],
  ['Chè (1 ly)', 250, 400, 4],
].map((row) => Object.freeze({ name: row[0], kcalLow: row[1], kcalHigh: row[2], protein: row[3] })));

/** Pool letter → macro group, so a coach's tick on "Ức gà" is understood as a
 *  statement about the Đạm group and nothing else. */
export const POOL_LETTER_GROUP = Object.freeze({ P: 'PROTEIN', C: 'CARB', F: 'FAT', R: 'RAU' });

const MEAL_TYPE_LABELS = Object.freeze({ sang: 'Sáng', chinh: 'Bữa chính', phu: 'Bữa phụ' });

/**
 * The foods the gram generator can actually put on a plate, grouped for the
 * coach's preference picker.
 *
 * FOODS holds every food the tool knows about, but only those listed in
 * MEAL_POOLS are reachable by the generator. Offering the rest in the picker
 * would let a coach tick a food, trust it was honoured, and never see it
 * appear. Derived from MEAL_POOLS rather than hand-maintained so the picker
 * and the generator can never drift apart.
 *
 * `meals` records which slots each food can appear in, so the coach can see
 * that ticking only "Cơm trắng" says nothing about breakfast.
 */
export const SELECTABLE_FOODS = (() => {
  const found = new Map();
  for (const [mealType, pool] of Object.entries(MEAL_POOLS)) {
    for (const [letter, list] of Object.entries(pool)) {
      for (const option of list) {
        if (!found.has(option.name)) {
          found.set(option.name, { name: option.name, group: POOL_LETTER_GROUP[letter], meals: [] });
        }
        const entry = found.get(option.name);
        const label = MEAL_TYPE_LABELS[mealType];
        if (label && !entry.meals.includes(label)) entry.meals.push(label);
      }
    }
  }
  const order = ['PROTEIN', 'CARB', 'FAT', 'RAU'];
  return Object.freeze(order.map((group) => Object.freeze({
    group,
    label: FOOD_GROUPS[group],
    items: Object.freeze([...found.values()].filter((item) => item.group === group).map(Object.freeze)),
  })));
})();

/** Every name the picker offers — used to drop stale names from a saved
 *  profile rather than silently treating them as a constraint that can never
 *  be satisfied. */
export const SELECTABLE_FOOD_NAMES = Object.freeze(
  SELECTABLE_FOODS.flatMap((section) => section.items.map((item) => item.name)),
);
