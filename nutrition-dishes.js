// ============================================================
// DAVID TRAINING PROGRAM — Vietnamese dish library
// ============================================================
// The layer that was missing between the food table and the gram solver.
//
// WHY THIS EXISTS: buildCandidate() used to draw a protein, a carb, a fat and
// a vegetable independently from four pools and then solve the grams. The
// macros came out right and the food came out uncookable — a real generated
// day read "Cá hồi fillet 150 g + Bánh phở khô 45 g + Dầu ăn 3 g + Giá đỗ
// 200 g" and "Lòng trắng trứng 125 g + Nho 130 g + Phô mai cheddar 20 g".
// Nothing in the generator knew what a dish was, so "bò xào rau muống" and
// "cá hồi with dry pho noodles" scored identically. A client cannot cook the
// second one, so they cook something else, and the plan stops being a plan.
//
// A dish here is a real recipe: the ingredients that belong together, the
// gram range each one sensibly occupies inside that dish, and one line of how
// to cook it. The solver picks a DISH and then solves grams inside it, so the
// macro machinery (solve3, refine, optimiseCandidate, the accuracy limits) is
// untouched — only the thing being chosen changed.
//
// ------------------------------------------------------------
// HOW TO READ A DISH
// ------------------------------------------------------------
// proteinOptions / carbOptions / fatOptions — ALTERNATIVES. The generator
//   picks exactly ONE from each list. Two entries mean "either works in this
//   dish", not "serve both".
// vegetables — ALL SERVED. Every entry is part of the dish, and the day's
//   vegetable volume is split between them.
//
// fatOptions may be empty, and that is a statement, not an omission: bánh mì
// chả lụa, thịt ba chỉ rang and trứng luộc already carry their fat. Adding a
// spoon of oil to them to satisfy the solver would be inventing food nobody
// eats. The solver handles a two-unknown dish and makes up the day's fat in
// the meals that genuinely use oil.
//
// Seasoning (nước mắm, tỏi, hành, tiêu, ớt, chanh, rau thơm) is deliberately
// absent from every ingredient list. Its macros are negligible and weighing
// fish sauce is how a plan gets abandoned. Sugar is the one seasoning that
// would matter, which is why no dish here is a kho ngọt and several cook notes
// say so outright.
//
// ------------------------------------------------------------
// ADDING A DISH
// ------------------------------------------------------------
// 1. Every ingredient name must match FOODS exactly — engine-test-harness.html
//    fails on a typo rather than letting the dish silently never appear.
// 2. One protein, one carb. A dish needing two proteins (trứng đúc thịt) does
//    not fit the three-unknown solve and belongs in the food-composition mode.
// 3. Ranges are per person per meal. Keep them to what someone would actually
//    put on the plate, because the solver will use the whole range.
// 4. Keep the cook line to one sentence a client can follow without a recipe.

/**
 * Which meal a dish may be served at. David's rules (2026-10-16):
 *   sang  — easy to digest, keeps you full, ready in minutes or easy to buy on the way.
 *   trua  — lunch the client prepares at home and takes along (a lunch box), so no soups.
 *   ngoai — the same lunch ordered or eaten out. Every lunch shows both, and the client
 *           picks one each day; only the home one goes on the shopping list.
 *   toi   — cooked at home: fish, shrimp, chicken, eggs or tofu, steamed, boiled, in a
 *           soup or lightly pan-seared. No beef, no pork and no fried noodles at night.
 *   phu   — snacks.
 */
export const MEAL_MENUS = Object.freeze(['sang', 'trua', 'ngoai', 'toi', 'phu']);

/** Whether the client cooks it or buys it. Both are honest options for a
 *  Vietnamese client; the difference is that a bought portion's grams are an
 *  estimate of what is in the bowl, not something they measured. */
export const DISH_KINDS = Object.freeze({
  cook: 'Tự nấu',
  buy: 'Mua sẵn / ăn ngoài',
});

export const DISH_KIND_NOTES = Object.freeze({
  cook: '',
  buy: 'Mua ngoài được — gram chỉ là ước lượng khẩu phần, hãy dặn quán theo ghi chú.',
});

function ing(name, min, max) {
  return Object.freeze({ name, min, max });
}

function dish(id, name, mealTypes, kind, cook, slots) {
  return Object.freeze({
    id,
    name,
    mealTypes: Object.freeze(mealTypes),
    kind,
    cook,
    proteinOptions: Object.freeze(slots.protein),
    carbOptions: Object.freeze(slots.carb),
    fatOptions: Object.freeze(slots.fat || []),
    vegetables: Object.freeze(slots.vegetables || []),
  });
}

export const DISHES = Object.freeze([
  // ============================================================
  // BỮA SÁNG
  // ============================================================
  dish('sang-banh-mi-op-la', 'Bánh mì trứng ốp la + dưa leo cà chua', ['sang'], 'buy',
    'Ốp la với 1 thìa dầu, lòng đào. Kẹp bánh mì, thêm dưa leo cà chua. Mua ngoài thì dặn không bơ, không sốt mayonnaise.', {
    protein: [ing('Trứng gà nguyên quả', 50, 180)],
    carb: [ing('Bánh mì trắng', 40, 140), ing('Bánh mì nguyên cám', 40, 140)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 12)],
    vegetables: [ing('Dưa leo', 30, 120), ing('Cà chua', 30, 120)],
  }),

  dish('sang-yen-mach-sua-hat', 'Yến mạch trộn sữa và hạt', ['sang'], 'cook',
    'Ngâm yến mạch với sữa 10 phút (hoặc nấu 3 phút), rắc hạt lên trên. Làm tối hôm trước để sáng ăn ngay.', {
    protein: [ing('Sữa tươi không đường', 150, 400), ing('Sữa đậu nành không đường', 150, 400), ing('Whey protein isolate (bột)', 20, 50)],
    carb: [ing('Yến mạch (khô)', 30, 110)],
    fat: [ing('Hạnh nhân', 8, 30), ing('Bơ đậu phộng', 8, 30), ing('Mè (vừng)', 5, 20)],
  }),

  dish('sang-trung-luoc-khoai-lang', 'Trứng luộc + khoai lang + dưa leo', ['sang'], 'cook',
    'Luộc trứng 8 phút, khoai lang hấp hoặc luộc. Chuẩn bị sẵn tối hôm trước, sáng hâm lại.', {
    protein: [ing('Trứng gà nguyên quả', 50, 180)],
    carb: [ing('Khoai lang (luộc)', 100, 350)],
    fat: [ing('Hạnh nhân', 8, 25), ing('Mè (vừng)', 5, 20)],
    vegetables: [ing('Dưa leo', 30, 120)],
  }),

  dish('sang-pho-bo', 'Phở bò tái', ['sang', 'ngoai'], 'buy',
    'Dặn quán ít béo, nhiều thịt, không quẩy. Nấu ở nhà thì luộc bánh phở, chần thịt bò lát mỏng, chan nước dùng.', {
    protein: [ing('Thịt bò thăn', 80, 220)],
    carb: [ing('Bánh phở tươi', 150, 400)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 2, 10)],
    vegetables: [ing('Giá đỗ', 50, 180)],
  }),

  dish('sang-banh-mi-cha-lua', 'Bánh mì chả lụa + dưa leo', ['sang'], 'buy',
    'Kẹp chả lụa, dưa leo, rau thơm. Dặn không bơ, không sốt — chả lụa đã đủ béo.', {
    protein: [ing('Chả lụa', 50, 150)],
    carb: [ing('Bánh mì trắng', 50, 140), ing('Bánh mì nguyên cám', 50, 140)],
    fat: [],
    vegetables: [ing('Dưa leo', 30, 120), ing('Cà chua', 30, 100)],
  }),

  // NOT HERE: "Xôi + trứng luộc". David took it off breakfast on 2026-10-16: sticky rice
  // sits heavy, and breakfast has to be easy to digest. It had no other meal to go to.

  dish('sang-dau-phu-sot-ca-com', 'Cơm + đậu phụ sốt cà chua', ['trua'], 'cook',
    'Rán sơ đậu phụ, sốt với cà chua bằm và nước mắm, không thêm đường. Ăn với cơm nóng.', {
    protein: [ing('Đậu phụ trắng', 100, 300)],
    carb: [ing('Cơm trắng (chín)', 100, 350)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Cà chua', 60, 200)],
  }),

  // Was a breakfast: cooking beef in the morning is not quick. Now a lunch to order.
  dish('sang-bun-bo-xao', 'Bún bò Nam Bộ (bún bò xào)', ['ngoai'], 'buy',
    'Dặn quán nhiều thịt, ít nước sốt và đậu phộng, thêm rau. Tự làm: xào bò lửa lớn 2 phút, trút lên bún với giá và dưa leo.', {
    protein: [ing('Thịt bò thăn', 80, 220)],
    carb: [ing('Bún tươi', 150, 480)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Giá đỗ', 50, 180), ing('Dưa leo', 40, 150)],
  }),

  dish('sang-chao-ga-xe', 'Cháo gà xé', ['sang'], 'buy',
    'Mua ở quán: dặn nhiều thịt ức, ít hành phi, không quẩy. Tự nấu: nấu cơm nguội với nhiều nước 15 phút cho nhừ, xé ức gà luộc vào.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 200)],
    carb: [ing('Cơm trắng (chín)', 80, 250)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 2, 10)],
  }),

  dish('sang-banh-mi-bo-dau-phong', 'Bánh mì bơ đậu phộng + sữa đậu nành', ['sang'], 'cook',
    'Phết bơ đậu phộng nguyên chất lên bánh mì, uống kèm sữa đậu nành không đường. Bữa sáng 2 phút.', {
    // Soy milk only: both the name and the cook note say so. Cow's milk with peanut butter
    // already has its own dish (Sữa tươi + chuối + bơ đậu phộng).
    protein: [ing('Sữa đậu nành không đường', 200, 400)],
    carb: [ing('Bánh mì nguyên cám', 40, 120), ing('Bánh mì trắng', 40, 120)],
    fat: [ing('Bơ đậu phộng', 10, 35)],
  }),

  dish('sang-com-trung-chien', 'Cơm + trứng chiên + cà chua dưa leo', ['trua'], 'cook',
    'Đánh trứng với hành lá, chiên lửa vừa. Ăn với cơm và đĩa cà chua dưa leo.', {
    protein: [ing('Trứng gà nguyên quả', 50, 180)],
    carb: [ing('Cơm trắng (chín)', 100, 350)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 12)],
    vegetables: [ing('Cà chua', 50, 180), ing('Dưa leo', 40, 150)],
  }),

  dish('sang-pho-ga', 'Phở gà', ['sang', 'ngoai'], 'buy',
    'Dặn quán lấy thịt ức, ít mỡ gà, không quẩy. Thêm giá và rau thơm.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 220)],
    carb: [ing('Bánh phở tươi', 150, 400)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 2, 10)],
    vegetables: [ing('Giá đỗ', 50, 180)],
  }),

  dish('sang-banh-mi-trung-luoc', 'Bánh mì + trứng luộc + dưa leo', ['sang'], 'cook',
    'Luộc sẵn trứng từ tối hôm trước. Sáng ăn với bánh mì và dưa leo, uống kèm trà hoặc cà phê không đường. Xong trong 3 phút.', {
    protein: [ing('Trứng gà nguyên quả', 50, 180)],
    carb: [ing('Bánh mì nguyên cám', 40, 140), ing('Bánh mì trắng', 40, 140)],
    fat: [],
    vegetables: [ing('Dưa leo', 30, 120)],
  }),

  dish('sang-sua-chua-chuoi-hat', 'Sữa chua Hy Lạp + chuối + hạt', ['sang', 'phu'], 'cook',
    'Cắt chuối vào sữa chua không đường, rắc hạt. Không cần nấu.', {
    protein: [ing('Sữa chua Hy Lạp không đường', 100, 300)],
    carb: [ing('Chuối', 80, 250)],
    fat: [ing('Hạnh nhân', 8, 30), ing('Hạt điều', 8, 30), ing('Mè (vừng)', 5, 20)],
  }),

  // ============================================================
  // BỮA TRƯA (tự chuẩn bị) VÀ BỮA TỐI (nấu tại nhà)
  // ============================================================
  dish('chinh-bo-xao-rau-muong', 'Cơm + bò xào rau muống', ['trua'], 'cook',
    'Phi tỏi, xào bò lửa lớn 2 phút rồi trút ra; xào rau muống, trộn bò lại vào, nêm nước mắm.', {
    protein: [ing('Thịt bò thăn', 80, 250), ing('Thịt bò bắp', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 450), ing('Cơm gạo lứt (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Rau muống', 100, 300)],
  }),

  dish('chinh-ga-ap-chao-sup-lo', 'Cơm + gà áp chảo + súp lơ luộc', ['trua', 'toi'], 'cook',
    'Ướp ức gà với nước mắm tiêu tỏi 10 phút, áp chảo 4 phút mỗi mặt. Súp lơ luộc 3 phút.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450), ing('Cơm gạo lứt (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Súp lơ xanh', 100, 280)],
  }),

  dish('chinh-ca-basa-sot-ca-canh-bi', 'Cơm + cá basa sốt cà + canh bí xanh', ['toi'], 'cook',
    'Áp chảo cá basa, sốt với cà chua bằm và nước mắm. Canh bí xanh nấu suông, không thêm đường.', {
    protein: [ing('Cá basa fillet', 100, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cà chua', 60, 200), ing('Bí xanh', 80, 250)],
  }),

  dish('chinh-tom-rang-cai-luoc', 'Cơm + tôm rang + cải ngọt luộc', ['trua', 'toi'], 'cook',
    'Rang tôm với tỏi và chút nước mắm cho săn. Cải ngọt luộc, chấm nước mắm tỏi.', {
    protein: [ing('Tôm bỏ vỏ', 80, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cải ngọt', 100, 280)],
  }),

  dish('chinh-thit-luoc-bap-cai', 'Cơm + thịt heo luộc + bắp cải luộc', ['trua'], 'cook',
    'Luộc thịt thăn 20 phút, thái mỏng, chấm muối vừng hoặc muối đậu. Bắp cải luộc cùng nồi.', {
    protein: [ing('Thịt heo thăn nạc', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Mè (vừng)', 5, 25), ing('Đậu phộng rang', 8, 30)],
    vegetables: [ing('Bắp cải', 100, 280)],
  }),

  // Steamed rather than fried since it became a dinner (the id is older than that).
  dish('chinh-trung-chien-canh-ca', 'Cơm + trứng hấp + canh cà chua bí xanh', ['toi'], 'cook',
    'Đánh trứng với chút nước và hành lá, hấp 10–12 phút cho mềm. Canh cà chua bí xanh nấu nhanh, nêm nước mắm.', {
    protein: [ing('Trứng gà nguyên quả', 50, 200)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cà chua', 60, 200), ing('Bí xanh', 80, 250)],
  }),

  dish('chinh-ca-hoi-ap-chao', 'Cơm gạo lứt + cá hồi áp chảo + súp lơ', ['trua', 'toi'], 'cook',
    'Áp chảo cá hồi da giòn 3 phút mỗi mặt, không cần nhiều dầu vì cá đã béo. Súp lơ luộc.', {
    protein: [ing('Cá hồi fillet', 80, 250)],
    // Brown rice only: the dish is named for it, and an alternative here printed
    // "Cơm trắng" under a dish called "Cơm gạo lứt".
    carb: [ing('Cơm gạo lứt (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 12)],
    vegetables: [ing('Súp lơ xanh', 100, 280)],
  }),

  dish('chinh-muc-xao-ca', 'Cơm + mực xào cà chua + dưa leo', ['trua'], 'cook',
    'Mực khứa vảy rồng, xào lửa lớn 2 phút với cà chua và tỏi. Xào lâu mực sẽ dai.', {
    protein: [ing('Mực tươi', 100, 300)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cà chua', 60, 200), ing('Dưa leo', 50, 150)],
  }),

  dish('chinh-dui-ga-nuong', 'Cơm + đùi gà nướng + dưa leo cà chua', ['trua'], 'cook',
    'Ướp đùi gà với nước mắm, tỏi, tiêu, sả 20 phút rồi nướng hoặc air-fryer 20 phút. Không dùng mật ong hay đường.', {
    protein: [ing('Đùi gà bỏ da (sống)', 80, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Dưa leo', 50, 180), ing('Cà chua', 50, 180)],
  }),

  dish('chinh-ca-ro-phi-hap-gung', 'Cơm + cá rô phi hấp gừng + cải ngọt luộc', ['toi'], 'cook',
    'Hấp cá với gừng, hành lá 12 phút, rưới nước mắm chanh. Cải ngọt luộc.', {
    protein: [ing('Cá rô phi', 100, 300)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Cải ngọt', 100, 280)],
  }),

  dish('chinh-dau-phu-sot-ca-rau-den', 'Cơm + đậu phụ sốt cà + canh rau dền', ['toi'], 'cook',
    'Đậu phụ rán sơ rồi sốt cà chua. Canh rau dền nấu suông với tỏi.', {
    protein: [ing('Đậu phụ trắng', 100, 350)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Cà chua', 60, 200), ing('Rau dền', 80, 250)],
  }),

  dish('chinh-bun-thit-nuong', 'Bún thịt nướng + rau sống', ['ngoai'], 'buy',
    'Dặn quán lấy thịt nạc, không chả giò, nước mắm pha loãng, nhiều rau. Tự làm: ướp thịt thăn với sả, tỏi, nước mắm rồi nướng.', {
    protein: [ing('Thịt heo thăn nạc', 80, 250)],
    carb: [ing('Bún tươi', 150, 500)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18), ing('Đậu phộng rang', 8, 30)],
    vegetables: [ing('Dưa leo', 50, 180), ing('Giá đỗ', 50, 180)],
  }),

  dish('chinh-bo-xao-bi-do', 'Cơm + bò xào bí đỏ', ['trua'], 'cook',
    'Xào bò riêng 2 phút, trút ra. Xào bí đỏ thái mỏng cho mềm rồi trộn bò lại, nêm nước mắm tiêu.', {
    protein: [ing('Thịt bò bắp', 80, 250), ing('Thịt bò thăn', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Bí đỏ', 100, 280)],
  }),

  dish('chinh-ga-xao-nam', 'Cơm + gà xào nấm rơm + cải ngọt', ['trua'], 'cook',
    'Xào ức gà thái lát với nấm rơm và tỏi, nêm nước mắm tiêu. Cải ngọt luộc riêng.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Nấm rơm', 60, 200), ing('Cải ngọt', 80, 250)],
  }),

  dish('chinh-ca-thu-sot-ca-canh-muop', 'Cơm + cá thu sốt cà + canh mướp', ['toi'], 'cook',
    'Áp chảo cá thu rồi sốt cà chua. Canh mướp nấu nhanh, tắt bếp ngay khi mướp trong.', {
    protein: [ing('Cá thu', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Cà chua', 60, 200), ing('Mướp', 80, 250)],
  }),

  dish('chinh-tom-hap-canh-muop-nam', 'Cơm + tôm hấp + canh mướp nấu nấm', ['toi'], 'cook',
    'Hấp tôm với sả 6 phút, chấm muối tiêu chanh. Canh mướp nấu với nấm rơm.', {
    protein: [ing('Tôm bỏ vỏ', 80, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Mướp', 80, 250), ing('Nấm rơm', 60, 200)],
  }),

  dish('chinh-ga-khoai-lang', 'Khoai lang + gà áp chảo + rau cải', ['trua'], 'cook',
    'Gà áp chảo, khoai lang hấp. Rau cải luộc hoặc xào tỏi. Bữa dễ mang đi làm.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 280)],
    carb: [ing('Khoai lang (luộc)', 120, 400)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cải ngọt', 80, 250), ing('Súp lơ xanh', 80, 250)],
  }),

  dish('chinh-ca-ngu-dau-bap', 'Cơm + cá ngừ áp chảo + đậu bắp luộc', ['trua', 'toi'], 'cook',
    'Áp chảo cá ngừ 2 phút mỗi mặt, để hồng giữa. Đậu bắp luộc 4 phút, chấm nước mắm tỏi.', {
    protein: [ing('Cá ngừ tươi', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Đậu bắp', 80, 250)],
  }),

  dish('chinh-mien-xao-tom', 'Miến xào tôm rau củ', ['trua'], 'cook',
    'Ngâm miến 10 phút cho mềm. Xào tôm với tỏi, thêm cà rốt và giá, cho miến vào xào nhanh.', {
    protein: [ing('Tôm bỏ vỏ', 80, 250)],
    carb: [ing('Miến dong (khô)', 40, 120)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cà rốt', 60, 180), ing('Giá đỗ', 60, 200)],
  }),

  dish('chinh-thit-xao-ca-tim', 'Cơm + thịt heo xào cà tím', ['trua'], 'cook',
    'Cà tím cắt khúc, ngâm nước muối cho khỏi thâm. Xào thịt trước, thêm cà tím và chút nước cho mềm.', {
    protein: [ing('Thịt heo thăn nạc', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Cà tím', 100, 280)],
  }),

  dish('chinh-pho-xao-bo', 'Phở xào bò + cải ngọt', ['ngoai'], 'buy',
    'Dặn quán ít dầu, nhiều cải. Tự làm: xào bò riêng, trút ra, xào bánh phở với cải ngọt rồi trộn bò lại.', {
    protein: [ing('Thịt bò thăn', 80, 230)],
    carb: [ing('Bánh phở tươi', 150, 480)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Cải ngọt', 80, 250)],
  }),

  // NOT HERE: "Cơm + ba chỉ rang + bắp cải". It was written, tested and
  // removed. Thịt heo ba chỉ is 53 g fat and 9 g protein per 100 g, so at a
  // sane 60–150 g portion it brings at most 13 g of protein — a main meal on a
  // 130 g/day target needs around 39. As the dish's only protein source it can
  // never close that gap, so the day was rejected every time and the dish was
  // simply never served. A dish that cannot be chosen is worse than no dish:
  // it looks like an option in the coach's picker and silently is not.
  // The food itself stays in FOODS and MEAL_POOLS, where it is reachable as a
  // flavour portion and for looking up what a client reports eating.

  dish('chinh-edamame-com-lut', 'Cơm gạo lứt + edamame luộc + cải ngọt', ['trua'], 'cook',
    'Luộc edamame 5 phút, rắc chút muối. Cải ngọt xào tỏi. Bữa chay đủ đạm thực vật.', {
    protein: [ing('Edamame (luộc)', 100, 250)],
    carb: [ing('Cơm gạo lứt (chín)', 100, 400)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18), ing('Mè (vừng)', 5, 25)],
    vegetables: [ing('Cải ngọt', 100, 280)],
  }),

  dish('chinh-ga-luoc-canh-bi-do', 'Cơm + gà luộc + canh bí đỏ', ['toi'], 'cook',
    'Luộc đùi gà với gừng, chấm muối tiêu chanh. Canh bí đỏ nấu với nước luộc gà.', {
    protein: [ing('Đùi gà bỏ da (sống)', 80, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Mè (vừng)', 5, 25), ing('Đậu phộng rang', 8, 30)],
    vegetables: [ing('Bí đỏ', 100, 280)],
  }),

  dish('chinh-bo-khoai-tay', 'Khoai tây + bò áp chảo + súp lơ', ['trua'], 'cook',
    'Bò áp chảo 2 phút mỗi mặt rồi để nghỉ 3 phút mới cắt. Khoai tây luộc, súp lơ luộc.', {
    protein: [ing('Thịt bò thăn', 80, 250)],
    carb: [ing('Khoai tây (luộc)', 120, 400)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Súp lơ xanh', 100, 280)],
  }),

  dish('chinh-ca-basa-hap-rau-muong', 'Cơm + cá basa hấp + rau muống xào tỏi', ['toi'], 'cook',
    'Hấp cá basa với gừng hành 12 phút. Rau muống xào tỏi lửa lớn 2 phút.', {
    protein: [ing('Cá basa fillet', 100, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 450)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
    vegetables: [ing('Rau muống', 100, 300)],
  }),

  // ============================================================
  // BỮA TRƯA ĐẶT NGOÀI
  // ============================================================
  // Grams here are what the bowl or plate usually holds, for the macros only: the client
  // cannot weigh a lunch they order, so each note says what to ask the shop for instead.
  dish('ngoai-com-ga-xe', 'Cơm gà xé + dưa leo', ['ngoai'], 'buy',
    'Dặn quán lấy thịt ức, ít mỡ gà và nước sốt, thêm dưa leo.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 500)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 2, 12)],
    vegetables: [ing('Dưa leo', 40, 150)],
  }),

  dish('ngoai-com-bo-luc-lac', 'Cơm bò lúc lắc + salad', ['ngoai'], 'buy',
    'Dặn quán ít bơ và dầu, thêm salad cà chua dưa leo.', {
    protein: [ing('Thịt bò thăn', 80, 250)],
    carb: [ing('Cơm trắng (chín)', 100, 500)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Cà chua', 40, 150), ing('Dưa leo', 40, 150)],
  }),

  dish('ngoai-com-van-phong-ca', 'Cơm văn phòng: cá sốt cà + rau luộc', ['ngoai'], 'buy',
    'Chọn cá sốt cà hoặc cá hấp, thêm một đĩa rau luộc, bỏ qua món chiên.', {
    protein: [ing('Cá basa fillet', 100, 280)],
    carb: [ing('Cơm trắng (chín)', 100, 500)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 15)],
    vegetables: [ing('Cải ngọt', 80, 250), ing('Cà chua', 40, 120)],
  }),

  dish('ngoai-mien-ga', 'Miến gà', ['ngoai'], 'buy',
    'Dặn quán lấy thịt ức, ít mỡ gà, thêm giá và rau.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 220)],
    carb: [ing('Miến dong (khô)', 40, 130)],
    // The broth carries chicken fat; a lean bowl with only a dash of oil undershoots the day.
    fat: [ing('Dầu ăn (oliu, đậu nành)', 2, 15)],
    vegetables: [ing('Giá đỗ', 50, 180)],
  }),

  dish('chinh-ga-bap-ngot', 'Bắp ngọt + gà áp chảo + dưa leo cà chua', ['trua'], 'cook',
    'Bắp ngọt luộc. Gà ướp tiêu tỏi, áp chảo. Bữa nhẹ bụng, dễ mang hộp đi làm.', {
    protein: [ing('Ức gà bỏ da (sống)', 80, 280)],
    carb: [ing('Bắp ngọt (luộc)', 100, 300)],
    fat: [ing('Dầu ăn (oliu, đậu nành)', 3, 18)],
    vegetables: [ing('Dưa leo', 50, 180), ing('Cà chua', 50, 180)],
  }),

  // ============================================================
  // BỮA PHỤ
  // ============================================================
  dish('phu-whey-tao', 'Whey lắc + táo', ['phu'], 'cook',
    'Lắc whey với nước lạnh, ăn kèm táo cả vỏ.', {
    protein: [ing('Whey protein isolate (bột)', 20, 50)],
    carb: [ing('Táo', 100, 250)],
    fat: [ing('Hạt điều', 8, 30)],
  }),

  dish('phu-trung-luoc-oi', 'Trứng luộc + ổi', ['phu'], 'cook',
    'Luộc trứng sẵn 2–3 quả từ sáng, mang theo cùng miếng ổi. Trứng đã đủ béo nên không cần thêm hạt.', {
    protein: [ing('Trứng gà nguyên quả', 50, 120)],
    carb: [ing('Ổi', 100, 250)],
    fat: [],
  }),

  dish('phu-sua-chuoi-bo-dau-phong', 'Sữa tươi + chuối + bơ đậu phộng', ['phu'], 'cook',
    'Xay chuối với sữa, thêm bơ đậu phộng. Hoặc ăn riêng từng thứ nếu không có máy xay.', {
    protein: [ing('Sữa tươi không đường', 150, 350)],
    carb: [ing('Chuối', 80, 220)],
    fat: [ing('Bơ đậu phộng', 8, 30)],
  }),

  dish('phu-sua-dau-nanh-du-du', 'Sữa đậu nành + đu đủ', ['phu'], 'cook',
    'Đu đủ chín cắt miếng, uống kèm sữa đậu nành không đường. Nhẹ bụng, tốt cho tiêu hoá.', {
    protein: [ing('Sữa đậu nành không đường', 150, 350)],
    carb: [ing('Đu đủ chín', 100, 300)],
    fat: [ing('Đậu phộng rang', 8, 30)],
  }),

  dish('phu-sua-chua-xoai', 'Sữa chua Hy Lạp + xoài', ['phu'], 'cook',
    'Xoài chín cắt hạt lựu trộn sữa chua không đường, rắc dừa nạo.', {
    protein: [ing('Sữa chua Hy Lạp không đường', 100, 250)],
    carb: [ing('Xoài chín', 80, 250)],
    fat: [ing('Dừa nạo', 10, 30)],
  }),

  dish('phu-whey-thanh-long', 'Whey lắc + thanh long', ['phu'], 'cook',
    'Thanh long cắt miếng, lắc whey với nước lạnh. Bữa phụ mát, ít ngọt.', {
    protein: [ing('Whey protein isolate (bột)', 20, 50)],
    carb: [ing('Thanh long ruột trắng', 100, 300)],
    fat: [ing('Hạnh nhân', 8, 30)],
  }),

  dish('phu-trung-luoc-cam', 'Trứng luộc + cam', ['phu'], 'cook',
    'Trứng luộc sẵn, cam bóc múi. Mang đi làm được cả ngày.', {
    protein: [ing('Trứng gà nguyên quả', 50, 120)],
    carb: [ing('Cam', 100, 300)],
    fat: [ing('Hạt điều', 8, 25)],
  }),

  dish('phu-yen-mach-ngam-sua', 'Yến mạch ngâm sữa', ['phu'], 'cook',
    'Ngâm yến mạch với sữa trong hộp, để tủ lạnh. Lấy ra ăn luôn, không cần nấu.', {
    protein: [ing('Sữa tươi không đường', 150, 350)],
    carb: [ing('Yến mạch (khô)', 30, 70)],
    fat: [ing('Mè (vừng)', 5, 20), ing('Hạnh nhân', 8, 25)],
  }),

  dish('phu-long-trang-chuoi', 'Lòng trắng trứng + chuối', ['phu'], 'cook',
    'Luộc trứng, ăn lòng trắng với chuối. Bữa phụ gần như không béo, dùng khi ngày đó đã nhiều dầu mỡ.', {
    protein: [ing('Lòng trắng trứng', 100, 200)],
    carb: [ing('Chuối', 80, 220)],
    fat: [ing('Hạnh nhân', 8, 25)],
  }),

  dish('phu-sua-chua-nho', 'Sữa chua Hy Lạp + nho', ['phu'], 'cook',
    'Nho rửa sạch để ráo, trộn sữa chua không đường, rắc hạt điều.', {
    protein: [ing('Sữa chua Hy Lạp không đường', 100, 250)],
    carb: [ing('Nho', 80, 250)],
    fat: [ing('Hạt điều', 8, 25)],
  }),

  dish('phu-banh-mi-pho-mai', 'Bánh mì nguyên cám + phô mai + sữa', ['phu'], 'cook',
    'Kẹp phô mai vào bánh mì nguyên cám, uống kèm sữa không đường.', {
    protein: [ing('Sữa tươi không đường', 150, 300)],
    carb: [ing('Bánh mì nguyên cám', 40, 100)],
    fat: [ing('Phô mai cheddar', 15, 40), ing('Phô mai mozzarella', 20, 50)],
  }),

  dish('phu-dau-phu-ca-chua', 'Đậu phụ hấp + cà chua + trái cây', ['phu'], 'cook',
    'Hấp đậu phụ 5 phút, rưới nước tương và hành lá, ăn với cà chua, tráng miệng bằng ổi hoặc táo. Bữa phụ chay, nhẹ bụng.', {
    protein: [ing('Đậu phụ trắng', 100, 250)],
    carb: [ing('Ổi', 100, 220), ing('Táo', 100, 220)],
    fat: [ing('Mè (vừng)', 5, 20)],
    vegetables: [ing('Cà chua', 50, 150)],
  }),
]);

const DISH_BY_ID = new Map(DISHES.map((item) => [item.id, item]));

export function getDish(id) {
  return DISH_BY_ID.get(id) || null;
}

/** Dishes reachable from each meal slot type, in the shape the generator wants
 *  (one flat list per slot type, exactly like MEAL_POOLS is one pool per slot
 *  type). Derived rather than hand-listed so a dish cannot be declared for
 *  'phu' and then be missing from the snack list. */
export const DISHES_BY_MEAL_TYPE = Object.freeze(MEAL_MENUS.reduce((acc, mealType) => {
  acc[mealType] = Object.freeze(DISHES.filter((item) => item.mealTypes.includes(mealType)));
  return acc;
}, {}));

/** Every ingredient a dish can put on a plate. The harness checks this against
 *  FOODS and against SELECTABLE_FOOD_NAMES: a dish must never be able to serve
 *  a food the coach has no way to mark as avoided. */
export const DISH_FOOD_NAMES = Object.freeze([...new Set(DISHES.flatMap((item) => [
  ...item.proteinOptions, ...item.carbOptions, ...item.fatOptions, ...item.vegetables,
].map((option) => option.name)))]);

export const MEAL_MENU_LABELS = Object.freeze({
  sang: 'Bữa sáng',
  trua: 'Bữa trưa · tự chuẩn bị',
  ngoai: 'Bữa trưa · đặt ngoài',
  toi: 'Bữa tối · nấu tại nhà',
  phu: 'Bữa phụ',
});

/**
 * The dish list the coach ticks from, grouped by meal slot.
 *
 * Grouped by slot rather than alphabetically because the question a coach is
 * answering is "what does this client eat for breakfast", and because ticking
 * only main-meal dishes says nothing about their snacks — the same trap the
 * food picker had to spell out.
 */
export const SELECTABLE_DISHES = Object.freeze(MEAL_MENUS.map((mealType) => Object.freeze({
  mealType,
  label: MEAL_MENU_LABELS[mealType],
  items: Object.freeze(DISHES_BY_MEAL_TYPE[mealType].map((item) => Object.freeze({
    id: item.id,
    name: item.name,
    kind: item.kind,
    kindLabel: DISH_KINDS[item.kind],
  }))),
})));

export const SELECTABLE_DISH_IDS = Object.freeze(DISHES.map((item) => item.id));
