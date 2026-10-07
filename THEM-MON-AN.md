# Thêm món ăn vào thư viện dinh dưỡng

Tài liệu này dành cho David. Mục tiêu: thêm món mới mà **không thể sai âm thầm**.

Có **hai thư viện** khác nhau, dùng cho hai việc khác nhau:

| File | Chứa gì | Dùng khi |
|---|---|---|
| `nutrition-foods.js` | **Nguyên liệu** — 100 g cơm có bao nhiêu carb | Luôn luôn. Mọi món ăn đều phải trỏ về đây. |
| `nutrition-dishes.js` | **Món ăn** — "Cơm + bò xào rau muống", kèm cách làm | Chế độ *Theo món ăn Việt* (mặc định) |

Muốn thêm **một nguyên liệu mới** (cá lóc, hạt óc chó) → đọc phần dưới.
Muốn thêm **một món ăn mới** (bò kho, canh chua cá) → nhảy xuống [Thêm một MÓN ĂN](#thêm-một-món-ăn).

---

## Cách nhanh nhất: gửi danh sách cho Claude

Chỉ cần gửi **tên món**. Không cần tra macro — nhưng nếu bạn có số liệu tin cậy thì gửi kèm, sẽ chính xác hơn.

Mẫu tin nhắn:

> Thêm giúp tôi các món sau:
> - Cá lóc
> - Thịt vịt bỏ da
> - Bánh mì đen
> - Hạt óc chó

Claude sẽ điền macro, xếp nhóm, gán bữa và khoảng gram, rồi chạy bộ kiểm tra. Bạn chỉ cần deploy.

Nếu muốn tự làm, đọc tiếp.

---

## Một món cần khai ở HAI chỗ

Đây là chỗ dễ sai nhất. Thiếu chỗ thứ hai thì món **không báo lỗi gì cả, chỉ đơn giản là không bao giờ xuất hiện**.

### Chỗ 1 — `FOODS`: món này có gì trong 100 g

```js
food('Cá lóc', 'PROTEIN', 97, 0, 2.0, 18.8, 0),
//     tên      nhóm      kcal carb fat protein xơ
```

**Bốn nhóm** (`group`):

| Mã | Nghĩa | Dùng cho |
|---|---|---|
| `PROTEIN` | Đạm | Thịt, cá, trứng, sữa, đậu phụ, whey |
| `CARB` | Tinh bột / trái cây | Cơm, bún, bánh mì, khoai, trái cây |
| `FAT` | Béo | Dầu, hạt, bơ, phô mai, nước cốt dừa |
| `RAU` | Rau | Rau lá, rau củ ít calo |

**Ba quy tắc bắt buộc:**

1. **Luôn là số liệu của 100 g.** Không phải một phần ăn, không phải một chén.
2. **Ghi rõ sống hay chín trong tên.** `Ức gà bỏ da (sống)`, `Cơm trắng (chín)`, `Yến mạch (khô)`. 100 g gà sống và 100 g gà chín là hai món khác nhau — khách cân theo đúng chữ trong tên.
3. **kcal phải khớp với macro.** Công thức: `(carb − xơ) × 4 + xơ × 2 + đạm × 4 + béo × 9`. Lệch quá 15 kcal *và* quá 12% là bộ kiểm tra báo đỏ.

### Chỗ 2 — `MEAL_POOLS`: món này ăn ở bữa nào, bao nhiêu gram

```js
chinh: {
  P: [
    option('Cá lóc', 80, 250),
    //       tên      min max   ← gram tối thiểu / tối đa mỗi bữa
  ],
}
```

**Ba khe bữa:**

| Khe | Là bữa gì |
|---|---|
| `sang` | Bữa sáng |
| `chinh` | Bữa trưa, bữa tối |
| `phu` | Bữa phụ, ăn nhẹ |

**Ô trong mỗi khe phải khớp với `group`:** `P`=PROTEIN, `C`=CARB, `F`=FAT, `R`=RAU. Đặt cơm vào ô `P` là bộ kiểm tra báo đỏ ngay — vì máy sẽ coi cơm là nguồn đạm của bữa đó và cả ngày hụt đạm.

Một món có thể nằm ở nhiều khe với khoảng gram khác nhau. Ví dụ trứng: `sang` 50–180 g, `chinh` 50–200 g, `phu` 50–120 g.

**Đặt min/max thế nào:** nghĩ xem khẩu phần nhỏ nhất và lớn nhất **hợp lý** của món đó trong một bữa là bao nhiêu. Khoảng này chính là thứ giữ cho máy không kê 900 g cơm hay 4 g thịt bò để ép cho đúng con số.

---

## Món cố ý KHÔNG đưa vào thực đơn

Có món nên nằm trong bảng để tra cứu (khi khách khai báo đã ăn gì) nhưng không bao giờ nên kê vào thực đơn. Khai vào `POOL_EXCLUDED` **kèm lý do**:

```js
export const POOL_EXCLUDED = Object.freeze({
  'Đường trắng': 'Đường tinh luyện. Giữ để tra cứu, không bao giờ kê vào thực đơn.',
});
```

Có danh sách này thì "cố ý bỏ ra" và "quên khai" không còn giống nhau nữa — quên khai sẽ bị bộ kiểm tra bắt.

---

## Kiểm tra trước khi deploy

Mở `engine-test-harness.html` (qua `serve.ps1`, không mở bằng `file://`). Phải thấy **tất cả xanh**.

Bộ kiểm tra bắt được các lỗi sau, và nói rõ món nào sai chỗ nào:

| Lỗi | Hậu quả nếu lọt |
|---|---|
| Trùng tên món | Món khai sau đè món khai trước, macro cũ biến mất |
| Có trong `MEAL_POOLS` nhưng thiếu macro | **Sập trang** khi máy bốc trúng món đó |
| Xếp sai ô (cơm vào ô đạm) | Cả ngày hụt đạm |
| Khoảng gram vô lý (min ≥ max) | Máy chia khẩu phần sai |
| Thêm macro nhưng quên `MEAL_POOLS` | Món không bao giờ xuất hiện, không báo gì |
| kcal không khớp macro | Sai lệch calo tích luỹ trên mọi kế hoạch dùng món đó |
| Macro âm, hoặc xơ nhiều hơn carb | Số liệu vô nghĩa |
| Tổng macro > 100 g trong 100 g | Số liệu bất khả thi |
| Một ô bữa trống rỗng | **Không tạo được kế hoạch cho bất kỳ khách nào** |

---

## Sau khi thêm

Nguyên liệu mới tự động xuất hiện ở bảng tick **"Món khách thường ăn"** và **"Món cần tránh"** trong trang lập kế hoạch. Không phải sửa gì thêm ở giao diện — bảng đó được sinh ra từ `MEAL_POOLS`, nên nó không bao giờ lệch với thứ máy thật sự dùng được.

Deploy `nutrition-foods.js` là xong. Nguyên liệu mới chỉ dùng được ở chế độ *Theo nhóm thực phẩm* cho tới khi nó được đưa vào ít nhất một món ăn.

---

# Thêm một MÓN ĂN

File: `nutrition-dishes.js`.

## Cách nhanh nhất

Gửi cho Claude tên món và cách nấu, ví dụ:

> Thêm giúp tôi món: Canh chua cá lóc ăn với cơm. Cá lóc, cà chua, đậu bắp, me, nấu canh.

Claude sẽ dựng công thức, gán khoảng gram, thêm nguyên liệu còn thiếu vào `nutrition-foods.js`, và chạy bộ kiểm tra.

Nếu muốn tự làm, đọc tiếp.

## Cấu trúc một món

```js
dish('chinh-bo-xao-rau-muong', 'Cơm + bò xào rau muống', ['chinh'], 'cook',
  'Phi tỏi, xào bò lửa lớn 2 phút rồi trút ra; xào rau muống, trộn bò lại vào, nêm nước mắm.', {
  protein: [ing('Thịt bò thăn', 80, 250), ing('Thịt bò bắp', 80, 250)],
  carb:    [ing('Cơm trắng (chín)', 100, 450), ing('Cơm gạo lứt (chín)', 100, 450)],
  fat:     [ing('Dầu ăn (oliu, đậu nành)', 3, 20)],
  vegetables: [ing('Rau muống', 100, 300)],
}),
```

| Trường | Ý nghĩa |
|---|---|
| id | Chuỗi duy nhất. Quy ước: `khebữa-tên-không-dấu` |
| tên | Cái khách đọc thấy. Viết như tên món thật, không phải danh sách nguyên liệu |
| khe bữa | `['sang']`, `['chinh']`, `['phu']` — hoặc nhiều khe nếu món ăn được ở cả hai |
| loại | `'cook'` (tự nấu) hoặc `'buy'` (mua sẵn được) |
| cách làm | **Một câu**, khách làm theo được mà không cần công thức |

## Quy tắc quan trọng nhất

**`protein` / `carb` / `fat` là các LỰA CHỌN THAY THẾ — máy chỉ chọn MỘT.**
Hai dòng trong `protein` nghĩa là "món này dùng bò thăn *hoặc* bò bắp đều được", **không phải** "cho cả hai vào".

**`vegetables` thì NGƯỢC LẠI — tất cả đều được dọn ra.**
Ghi hai loại rau là món đó có cả hai (ví dụ món xào + một bát canh), và lượng rau cả ngày sẽ chia cho chúng.

Vì vậy: tránh một loại rau trong `vegetables` sẽ **loại cả món**, chứ không phải bỏ mỗi loại rau đó. "Bò xào rau muống" mà bỏ rau muống thì không còn là món đó nữa.

## Ba ràng buộc bắt buộc

1. **Đúng một đạm, đúng một tinh bột.** Món cần hai nguồn đạm (trứng đúc thịt) không giải được — bộ giải chỉ có ba ẩn số. Món như thế để chế độ *Theo nhóm thực phẩm*.
2. **`fat` được phép để trống.** Bánh mì chả lụa, ba chỉ rang, trứng luộc đã đủ béo sẵn. Nhét thêm một thìa dầu vào cho đủ ẩn số là bịa ra món không ai ăn. Máy tự bù chất béo cả ngày ở những bữa có dùng dầu thật.
3. **Tên nguyên liệu phải khớp `FOODS` từng chữ.** Sai một dấu là bộ kiểm tra báo đỏ — chứ không phải sập trang ba tuần sau, ngay trước mặt khách.

## Gia vị thì sao?

Nước mắm, tỏi, hành, tiêu, ớt, chanh, rau thơm: **không khai**. Macro không đáng kể, và bắt khách cân nước mắm là cách nhanh nhất để họ bỏ kế hoạch.

Đường là ngoại lệ duy nhất đáng kể. Vì vậy thư viện **không có món kho ngọt**, và vài dòng cách làm ghi thẳng "không thêm đường".

## Bộ kiểm tra bắt những gì

| Lỗi | Hậu quả nếu lọt |
|---|---|
| Sai tên nguyên liệu | Sập khi máy bốc trúng món đó |
| Nguyên liệu không tick chặn được ở giao diện | **Lỗ hổng dị ứng** — món vào đĩa mà không cách nào chặn |
| Xếp sai ô (cơm vào ô đạm) | Cả ngày hụt đạm |
| Thiếu đạm hoặc thiếu tinh bột | Không giải được gram |
| Trùng id hoặc trùng tên | Món khai sau đè món khai trước |
| Khoảng gram vô lý | Máy chia khẩu phần sai |
| Dòng cách làm trông giống dòng gram | Máy đếm nó thành thức ăn, macro bị cộng đôi |
| Một khe bữa quá ít món | Ngày 6 bữa dọn lại cùng một bữa phụ ba lần |

## Sau khi thêm

Món mới tự động xuất hiện ở bảng tick **"Món ăn khách nấu được / hay ăn"** và **"Món ăn không dùng"**. Không phải sửa gì ở giao diện.

Deploy `nutrition-dishes.js` (và `nutrition-foods.js` nếu có thêm nguyên liệu) là xong.
