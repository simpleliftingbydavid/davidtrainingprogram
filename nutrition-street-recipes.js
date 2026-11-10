// ============================================================
// DAVID COACHING — Món ăn ngoài tách thành thành phần (Claude đề xuất, David đã duyệt)
// ============================================================
// Mỗi món trong STREET_DISHES (nutrition-foods.js) được tách thành thực phẩm có trong bảng, với
// gram ƯỚC LƯỢNG cho 1 phần, để tính đủ đa chất và vi chất. Đây là đề xuất của Claude
// (2026-11-03), không phải số đo. David đã duyệt ngày 2026-11-03.
//
// Natri KHÔNG được tính cho món ăn ngoài: phần lớn natri nằm ở nước dùng, nước mắm, mắm tôm, nước
// chấm, mà bảng thực phẩm chưa có và lượng dao động lớn theo quán. Tính từ thành phần sẽ ra một số
// thấp sai, nên để trống kèm cảnh báo.
//
// recipe null: món không tách được bằng bảng hiện có: giữ calo và đạm.
//
// 2026-11-10: Claude đề xuất thêm 14 công thức (p(...), approved false) sau khi thêm nguyên liệu từ
// USDA SR Legacy (bột mì, gạo sống, cola, bia, trà đen, lòng non, bao tử, tim heo). Gram và kích cỡ
// phần là ƯỚC LƯỢNG của Claude. David duyệt cả 14 công thức và 8 nguyên liệu ngày 2026-11-10.
// Đồ uống quy ml ra g theo khẩu phần của chính dòng USDA: cola 1 fl oz = 30,7 g (≈ 1,04 g/ml),
// bia 29,7 g (≈ 1,0), trà 29,6 g (≈ 1,0), cà phê 1 cốc 237 g (1,0), sữa đặc 1 cốc 306 g (1,29).

export const STREET_SODIUM_NOTE = 'Natri không tính: nằm chủ yếu ở nước dùng, nước mắm, nước chấm và dao động lớn theo quán.';

// David duyệt toàn bộ công thức ngày 2026-11-03: món có công thức được tính đủ chất (trừ natri).
const r = (name, recipe, assumptions = '') => Object.freeze({
  name,
  recipe: recipe ? Object.freeze(recipe.map(([food, grams]) => Object.freeze({ food, grams }))) : null,
  assumptions,
  approved: Boolean(recipe),
});
/** Công thức Claude đề xuất 2026-11-10, David duyệt toàn bộ 2026-11-10 ("duyệt hết"). */
const p = (name, recipe, assumptions) => Object.freeze({ ...r(name, recipe, assumptions), approved: true, proposedOn: '2026-11-10', approvedOn: '2026-11-10' });

export const STREET_RECIPES = Object.freeze([
  r('Cơm tấm sườn bì chả', [['Cơm trắng (chín)', 250], ['Thịt heo thăn nạc', 90], ['Thịt heo ba chỉ', 30], ['Trứng gà nguyên quả', 40], ['Dầu ăn (oliu, đậu nành)', 8], ['Dưa leo', 40], ['Cà chua', 20]],
    'Sườn nướng ≈ thịt thăn 90 g + ba chỉ 30 g (phần mỡ). Bì và chả trứng ≈ trứng 40 g. Không tính nước mắm.'),
  r('Cơm tấm sườn', [['Cơm trắng (chín)', 250], ['Thịt heo thăn nạc', 100], ['Thịt heo ba chỉ', 30], ['Dầu ăn (oliu, đậu nành)', 6], ['Dưa leo', 40], ['Cà chua', 20]],
    'Sườn nướng ≈ thịt thăn 100 g + ba chỉ 30 g. Không tính nước mắm.'),
  r('Cơm sườn trứng ốp la', [['Cơm trắng (chín)', 250], ['Thịt heo thăn nạc', 100], ['Thịt heo ba chỉ', 30], ['Trứng gà nguyên quả', 50], ['Dầu ăn (oliu, đậu nành)', 12], ['Dưa leo', 40]],
    'Trứng ốp la 1 quả chiên dầu.'),
  r('Cơm gà xối mỡ', [['Cơm trắng (chín)', 250], ['Đùi gà bỏ da (sống)', 180], ['Dầu ăn (oliu, đậu nành)', 20], ['Dưa leo', 40], ['Cà chua', 20]],
    'Đùi gà chiên giòn, tính dầu thấm 20 g.'),
  r('Cơm gà Hải Nam', [['Cơm trắng (chín)', 250], ['Đùi gà bỏ da (sống)', 150], ['Dầu ăn (oliu, đậu nành)', 10], ['Dưa leo', 50]],
    'Cơm nấu với mỡ gà ≈ dầu 10 g.'),
  r('Cơm chiên dương châu', [['Cơm trắng (chín)', 300], ['Trứng gà nguyên quả', 50], ['Tôm bỏ vỏ', 30], ['Chả lụa', 30], ['Cà rốt', 20], ['Dầu ăn (oliu, đậu nành)', 20]],
    'Lạp xưởng thay bằng chả lụa. Chả lụa chưa có vi chất nên tổng vi chất thiếu phần này.'),
  r('Phở bò tái', [['Bánh phở tươi', 220], ['Thịt bò thăn', 80], ['Giá đỗ', 30]],
    'Chỉ tính bánh, thịt, giá. Nước dùng (mỡ, muối) không tính: calo thật có thể cao hơn.'),
  r('Phở bò tái nạm', [['Bánh phở tươi', 220], ['Thịt bò thăn', 50], ['Thịt bò bắp', 50], ['Giá đỗ', 30]],
    'Nạm ≈ bắp bò. Nước dùng không tính.'),
  r('Phở gà', [['Bánh phở tươi', 220], ['Ức gà bỏ da (sống)', 100], ['Giá đỗ', 20]],
    'Gà luộc xé, tính theo ức gà sống. Nước dùng không tính.'),
  r('Bún bò Huế', [['Bún tươi', 250], ['Thịt bò bắp', 80], ['Thịt heo ba chỉ', 30], ['Dầu ăn (oliu, đậu nành)', 8]],
    'Giò heo ≈ ba chỉ 30 g. Dầu sa tế 8 g. Huyết, chả cua và nước dùng không tính.'),
  r('Bún chả', [['Bún tươi', 200], ['Thịt heo thăn nạc', 80], ['Thịt heo ba chỉ', 60], ['Đường trắng', 10], ['Dưa leo', 30]],
    'Chả miếng ≈ ba chỉ, chả viên ≈ thăn. Đường trong nước chấm 10 g. Nước mắm không tính.'),
  r('Bún thịt nướng', [['Bún tươi', 200], ['Thịt heo ba chỉ', 50], ['Thịt heo thăn nạc', 50], ['Đậu phộng rang', 10], ['Dầu ăn (oliu, đậu nành)', 5], ['Dưa leo', 30], ['Đường trắng', 8]],
    'Mỡ hành ≈ dầu 5 g. Chả giò và nước mắm không tính.'),
  r('Bún riêu', [['Bún tươi', 250], ['Đậu phụ trắng', 60], ['Trứng gà nguyên quả', 30], ['Cà chua', 60]],
    'Riêu cua ≈ trứng 30 g (bảng chưa có cua). Nước dùng không tính.'),
  r('Bún cá', [['Bún tươi', 250], ['Cá rô phi', 100], ['Dầu ăn (oliu, đậu nành)', 8], ['Cà chua', 50], ['Cải ngọt', 30]],
    'Cá rán/chả cá ≈ cá rô phi 100 g chiên, tính dầu thấm 8 g. Rau cải, cà chua. Nước dùng không tính.'),
  r('Bún đậu mắm tôm', [['Bún tươi', 200], ['Đậu phụ trắng', 150], ['Dầu ăn (oliu, đậu nành)', 15], ['Thịt heo ba chỉ', 50], ['Chả lụa', 30], ['Dưa leo', 30]],
    'Đậu rán thấm dầu 15 g. Chả cốm ≈ chả lụa. Mắm tôm không tính.'),
  r('Hủ tiếu Nam Vang', [['Bánh phở tươi', 220], ['Thịt heo thăn nạc', 60], ['Tôm bỏ vỏ', 30], ['Trứng gà nguyên quả', 20], ['Giá đỗ', 30]],
    'Hủ tiếu ≈ bánh phở tươi. Gan, trứng cút ≈ trứng 20 g. Nước dùng không tính.'),
  r('Mì Quảng', [['Bánh phở tươi', 220], ['Thịt heo ba chỉ', 40], ['Tôm bỏ vỏ', 40], ['Đậu phộng rang', 10], ['Trứng gà nguyên quả', 25], ['Dầu ăn (oliu, đậu nành)', 6]],
    'Sợi mì Quảng ≈ bánh phở tươi. Bánh tráng nướng không tính.'),
  p('Bánh canh cua', [['Bột gạo', 40], ['Trân châu khô (bột năng)', 40], ['Cua biển (sống)', 50], ['Tôm bỏ vỏ', 20], ['Chả lụa', 20], ['Hành lá', 5], ['Dầu ăn (oliu, đậu nành)', 8]],
    'Sợi bánh canh ≈ 40 g bột gạo + 40 g bột năng (tính theo trân châu khô, cùng là tinh bột sắn). Chả cua ≈ chả lụa 20 g. Dầu điều 8 g. Nước dùng không tính.'),
  p('Mì xào bò', [['Mì trứng khô', 100], ['Thịt bò thăn', 80], ['Cải ngọt', 60], ['Cà rốt', 20], ['Hành tây', 20], ['Dầu ăn (oliu, đậu nành)', 20]],
    'Mì trứng 100 g khô (trước khi luộc). Dầu xào 20 g. Nước sốt không tính.'),
  r('Phở xào', [['Bánh phở tươi', 250], ['Thịt bò thăn', 80], ['Cải ngọt', 60], ['Dầu ăn (oliu, đậu nành)', 20]],
    'Xào thấm dầu 20 g.'),
  r('Bánh mì thịt', [['Bánh mì trắng', 100], ['Chả lụa', 40], ['Thịt heo ba chỉ', 30], ['Dưa leo', 20], ['Cà rốt', 15]],
    'Một ổ ≈ 100 g. Pate và bơ không tính; thịt nguội ≈ ba chỉ.'),
  r('Bánh mì trứng', [['Bánh mì trắng', 100], ['Trứng gà nguyên quả', 100], ['Dầu ăn (oliu, đậu nành)', 8], ['Dưa leo', 20]],
    'Hai quả trứng chiên.'),
  r('Bánh mì chả cá', [['Bánh mì trắng', 100], ['Cá basa fillet', 60], ['Dầu ăn (oliu, đậu nành)', 8], ['Dưa leo', 20]],
    'Chả cá ≈ cá basa 60 g, chiên. Bột trong chả cá không tính.'),
  p('Bánh bao nhân thịt trứng', [['Bột mì đa dụng', 55], ['Đường trắng', 8], ['Thịt heo xay (sống)', 35], ['Trứng gà nguyên quả', 15], ['Mộc nhĩ tươi (nấm mèo)', 5], ['Dầu ăn (oliu, đậu nành)', 3]],
    '1 cái khoảng 150 g. Vỏ ≈ 55 g bột mì + 8 g đường. Trứng cút hoặc một phần trứng gà ≈ 15 g. Lạp xưởng (nếu có) không tính.'),
  r('Xôi mặn', [['Gạo nếp (xôi chín)', 250], ['Chả lụa', 30], ['Trứng gà nguyên quả', 25], ['Dầu ăn (oliu, đậu nành)', 8]],
    'Lạp xưởng, ruốc ≈ chả lụa 30 g. Hành phi ≈ dầu 8 g.'),
  r('Xôi xéo', [['Gạo nếp (xôi chín)', 250], ['Dầu ăn (oliu, đậu nành)', 10]],
    'Đậu xanh chưa có trong bảng: tính như xôi trắng. Hành phi ≈ dầu 10 g.'),
  p('Cháo lòng', [['Gạo trắng (sống)', 50], ['Lòng non heo (sống)', 50], ['Bao tử heo (sống)', 30], ['Tim heo (sống)', 30], ['Gan heo (sống)', 30], ['Hành lá', 5]],
    '1 tô: 50 g gạo sống nấu cháo. Huyết heo và dồi KHÔNG có nguồn trong USDA SR Legacy: không tính, calo và đạm thật có thể cao hơn. Quẩy không tính.'),
  p('Cháo gà', [['Gạo trắng (sống)', 50], ['Đùi gà bỏ da (sống)', 100], ['Hành lá', 5], ['Dầu ăn (oliu, đậu nành)', 5]],
    '1 tô: 50 g gạo sống nấu cháo, 100 g thịt gà. Gừng và tiêu không tính.'),
  p('Bánh cuốn', [['Bột gạo', 70], ['Thịt heo xay (sống)', 40], ['Mộc nhĩ tươi (nấm mèo)', 10], ['Hành tây', 10], ['Dầu ăn (oliu, đậu nành)', 5], ['Chả lụa', 30], ['Giá đỗ', 30]],
    '1 dĩa: vỏ bánh ≈ 70 g bột gạo, nhân thịt xay và mộc nhĩ, hành phi 5 g dầu, chả lụa 30 g. Nước chấm không tính.'),
  p('Bánh xèo (1 cái)', [['Bột gạo', 50], ['Nước cốt dừa', 30], ['Tôm bỏ vỏ', 30], ['Thịt heo ba chỉ', 25], ['Giá đỗ', 50], ['Dầu ăn (oliu, đậu nành)', 15]],
    '1 cái cỡ lớn: 50 g bột gạo, dầu chiên thấm 15 g. Rau sống và nước chấm không tính.'),
  r('Gỏi cuốn (2 cuốn)', [['Bún tươi', 50], ['Tôm bỏ vỏ', 30], ['Thịt heo ba chỉ', 20], ['Rau muống', 20]],
    'Bánh tráng chưa có trong bảng. Rau sống ≈ rau muống 20 g. Tương chấm không tính.'),
  r('Nem nướng', [['Bún tươi', 150], ['Thịt heo thăn nạc', 100], ['Thịt heo ba chỉ', 30], ['Dưa leo', 40], ['Đường trắng', 10]],
    'Nem ≈ thăn 100 g + ba chỉ 30 g. Bánh tráng và nước chấm không tính.'),
  p('Trà sữa trân châu (500ml)', [['Trà đen (pha)', 250], ['Sữa đặc có đường', 40], ['Sữa tươi không đường', 80], ['Đường trắng', 30], ['Trân châu khô (bột năng)', 40]],
    'Ly 500 ml có đá: 250 ml trà, 40 g sữa đặc, 80 ml sữa tươi, 30 g đường, 40 g trân châu khô (≈ 90 g sau khi nấu). Quán dùng bột kem béo thay sữa thì béo cao hơn: bảng chưa có bột kem béo.'),
  p('Trà sữa ít đường, không trân châu', [['Trà đen (pha)', 300], ['Sữa đặc có đường', 40], ['Sữa tươi không đường', 100], ['Đường trắng', 10]],
    'Ly 500 ml có đá, ít đường: 300 ml trà, 40 g sữa đặc, 100 ml sữa tươi, 10 g đường. Bột kem béo chưa có trong bảng.'),
  p('Cà phê sữa đá', [['Cà phê đen (pha)', 60], ['Sữa đặc có đường', 40]],
    'Cà phê phin 60 ml, sữa đặc 40 g (khoảng 2 thìa canh đầy).'),
  p('Cà phê đen không đường', [['Cà phê đen (pha)', 100]],
    'Cà phê phin khoảng 100 ml, không đường.'),
  p('Nước ngọt (lon 330ml)', [['Nước ngọt cola', 343]],
    'Lon 330 ml × 1,04 g/ml = 343 g (khẩu phần USDA). Tính theo cola có đường; nước ngọt vị khác có thể lệch.'),
  p('Bia (lon 330ml)', [['Bia thường', 331]],
    'Lon 330 ml × 1,0 g/ml = 331 g (khẩu phần USDA). Bia thường, không phải bia nhẹ. Calo có tính phần cồn theo số của USDA.'),
  r('Nước mía (500ml)', null, 'Nước mía không có trong USDA SR Legacy (đã tìm 2026-11-10): giữ calo và đạm ước tính.'),
  r('Sinh tố bơ', [['Quả bơ', 120], ['Sữa tươi không đường', 100], ['Đường trắng', 25]],
    'Sữa đặc thay bằng sữa tươi + đường 25 g.'),
  p('Chè (1 ly)', [['Đậu xanh (hạt khô)', 40], ['Đường trắng', 35], ['Nước cốt dừa', 30], ['Trân châu khô (bột năng)', 15]],
    'Tính theo chè đậu xanh nước cốt dừa: 40 g đậu khô, 35 g đường, 30 g nước cốt dừa, 15 g bột báng/trân châu. Chè khác (thập cẩm, chuối…) có thể lệch nhiều.'),
]);
