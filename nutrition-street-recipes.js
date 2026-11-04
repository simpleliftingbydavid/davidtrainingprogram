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
// recipe null: món không tách được bằng bảng hiện có (đồ uống, bánh có vỏ bột…): giữ calo và đạm.

export const STREET_SODIUM_NOTE = 'Natri không tính: nằm chủ yếu ở nước dùng, nước mắm, nước chấm và dao động lớn theo quán.';

// David duyệt toàn bộ công thức ngày 2026-11-03: món có công thức được tính đủ chất (trừ natri).
const r = (name, recipe, assumptions = '') => Object.freeze({
  name,
  recipe: recipe ? Object.freeze(recipe.map(([food, grams]) => Object.freeze({ food, grams }))) : null,
  assumptions,
  approved: Boolean(recipe),
});

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
  r('Bánh canh cua', null, 'Sợi bánh canh và chả cua chưa có trong bảng.'),
  r('Mì xào bò', null, 'Mì trứng chưa có trong bảng.'),
  r('Phở xào', [['Bánh phở tươi', 250], ['Thịt bò thăn', 80], ['Cải ngọt', 60], ['Dầu ăn (oliu, đậu nành)', 20]],
    'Xào thấm dầu 20 g.'),
  r('Bánh mì thịt', [['Bánh mì trắng', 100], ['Chả lụa', 40], ['Thịt heo ba chỉ', 30], ['Dưa leo', 20], ['Cà rốt', 15]],
    'Một ổ ≈ 100 g. Pate và bơ không tính; thịt nguội ≈ ba chỉ.'),
  r('Bánh mì trứng', [['Bánh mì trắng', 100], ['Trứng gà nguyên quả', 100], ['Dầu ăn (oliu, đậu nành)', 8], ['Dưa leo', 20]],
    'Hai quả trứng chiên.'),
  r('Bánh mì chả cá', [['Bánh mì trắng', 100], ['Cá basa fillet', 60], ['Dầu ăn (oliu, đậu nành)', 8], ['Dưa leo', 20]],
    'Chả cá ≈ cá basa 60 g, chiên. Bột trong chả cá không tính.'),
  r('Bánh bao nhân thịt trứng', null, 'Vỏ bánh bao chưa có trong bảng.'),
  r('Xôi mặn', [['Gạo nếp (xôi chín)', 250], ['Chả lụa', 30], ['Trứng gà nguyên quả', 25], ['Dầu ăn (oliu, đậu nành)', 8]],
    'Lạp xưởng, ruốc ≈ chả lụa 30 g. Hành phi ≈ dầu 8 g.'),
  r('Xôi xéo', [['Gạo nếp (xôi chín)', 250], ['Dầu ăn (oliu, đậu nành)', 10]],
    'Đậu xanh chưa có trong bảng: tính như xôi trắng. Hành phi ≈ dầu 10 g.'),
  r('Cháo lòng', null, 'Lòng, dồi, huyết chưa có trong bảng.'),
  r('Cháo gà', null, 'Cháo (gạo nấu loãng) chưa có trong bảng.'),
  r('Bánh cuốn', null, 'Vỏ bánh cuốn chưa có trong bảng.'),
  r('Bánh xèo (1 cái)', null, 'Bột bánh xèo chưa có trong bảng.'),
  r('Gỏi cuốn (2 cuốn)', [['Bún tươi', 50], ['Tôm bỏ vỏ', 30], ['Thịt heo ba chỉ', 20], ['Rau muống', 20]],
    'Bánh tráng chưa có trong bảng. Rau sống ≈ rau muống 20 g. Tương chấm không tính.'),
  r('Nem nướng', [['Bún tươi', 150], ['Thịt heo thăn nạc', 100], ['Thịt heo ba chỉ', 30], ['Dưa leo', 40], ['Đường trắng', 10]],
    'Nem ≈ thăn 100 g + ba chỉ 30 g. Bánh tráng và nước chấm không tính.'),
  r('Trà sữa trân châu (500ml)', null, 'Trà, trân châu, bột sữa chưa có trong bảng.'),
  r('Trà sữa ít đường, không trân châu', null, 'Trà, bột sữa chưa có trong bảng.'),
  r('Cà phê sữa đá', null, 'Cà phê và sữa đặc chưa có trong bảng.'),
  r('Cà phê đen không đường', null, 'Cà phê chưa có trong bảng.'),
  r('Nước ngọt (lon 330ml)', null, 'Nước ngọt chưa có trong bảng.'),
  r('Bia (lon 330ml)', null, 'Bia chưa có trong bảng.'),
  r('Nước mía (500ml)', null, 'Nước mía chưa có trong bảng.'),
  r('Sinh tố bơ', [['Quả bơ', 120], ['Sữa tươi không đường', 100], ['Đường trắng', 25]],
    'Sữa đặc thay bằng sữa tươi + đường 25 g.'),
  r('Chè (1 ly)', null, 'Đậu, nước cốt và thạch chưa có trong bảng.'),
]);
