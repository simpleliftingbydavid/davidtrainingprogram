# Bật "Lưu cho các lần sau" khi học viên đổi thứ tự bài

Học viên đã đổi được thứ tự bài (trước và trong buổi tập) và chọn "Chỉ hôm nay" bình thường.
Riêng lựa chọn **"Lưu cho các lần sau"** cần David làm bước dưới đây. Chưa làm thì buổi tập vẫn
được lưu, nhưng app báo chưa lưu được thứ tự vào giáo án. Khoảng 10 phút.

Bước này **không cần** API key và **độc lập** với hướng dẫn bật đọc nhãn
(`HUONG-DAN-BAT-CHUP-NHAN.md`). Làm cái nào trước cũng được.

---

## Bước 1 — Công cụ Firebase (bỏ qua nếu đã cài)

1. Cài Node.js bản LTS từ https://nodejs.org.
2. Mở **PowerShell** rồi chạy:
   ```
   npm install -g firebase-tools
   firebase login
   ```
   Đăng nhập bằng tài khoản Google đang quản lý Firebase của app.

## Bước 2 — Lấy code mới nhất và cài thư viện cho máy chủ

- Trên GitHub: nút xanh **Code** → **Download ZIP** → giải nén; hoặc
  `git clone https://github.com/simpleliftingbydavid/davidtrainingprogram.git` (đã có thì `git pull`).

```
cd davidtrainingprogram
cd functions
npm install
cd ..
```

## Bước 3 — Deploy

```
firebase deploy --only functions:notifyCoachOfProgrammeEdit,firestore:rules --project david-training-program
```

Thấy "Deploy complete!" là xong.

- `firestore:rules`: cho phép học viên lưu thứ tự mới (chỉ số thứ tự, chỉ bài còn trong giáo án,
  kèm buổi tập của chính học viên). File rules này cũng có sẵn quyền cho "Sản phẩm của tôi"
  (đã duyệt trước), nên sau bước này học viên lưu được sản phẩm tự nhập. **Đọc nhãn từ ảnh vẫn
  chưa chạy** cho tới khi làm hướng dẫn bật đọc nhãn.
- `notifyCoachOfProgrammeEdit`: David nhận thông báo "Đổi thứ tự buổi A" khi học viên lưu thứ tự mới.

Nếu Bước 3 báo lỗi về `ANTHROPIC_API_KEY` (máy chủ đọc nhãn chưa có key), chụp màn hình gửi lại,
mình sẽ chỉnh để hai phần tách hẳn nhau.
