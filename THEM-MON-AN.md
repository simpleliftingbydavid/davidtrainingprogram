# Thêm món ăn vào thư viện dinh dưỡng

Tài liệu này dành cho David. Mục tiêu: thêm món mới mà **không thể sai âm thầm**.

Tất cả nằm trong một file duy nhất: `nutrition-foods.js`.

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

Món mới tự động xuất hiện ở bảng tick **"Món khách thường ăn"** và **"Món cần tránh"** trong trang lập kế hoạch. Không phải sửa gì thêm ở giao diện — bảng đó được sinh ra từ `MEAL_POOLS`, nên nó không bao giờ lệch với thứ máy thật sự dùng được.

Deploy `nutrition-foods.js` là xong.
