# Bật chức năng "Chụp nhãn để điền sẵn"

Chức năng đã có trong code (Món theo nhãn của coach, Sản phẩm của tôi của học viên) nhưng **chưa chạy**
cho tới khi David làm 3 bước dưới đây trên máy tính của David. Tổng cộng khoảng 20 phút.

Trước khi làm, nếu bấm "Đọc nhãn" app sẽ báo "Chức năng đọc nhãn chưa được bật", và học viên lưu
"Sản phẩm của tôi" sẽ bị báo lỗi không có quyền.

> ⚠ Repo này để **Public**. Không bao giờ dán API key vào file nào trong repo, không gửi key qua chat.
> Key chỉ nằm trong Secret Manager của Firebase. Lỡ lộ thì vào platform.claude.com xoá key và tạo key mới.

---

## Bước 1 — Tạo API key và cất vào Firebase

Không cần tải code về máy cho bước này.

**A. Tạo API key**

1. Vào https://platform.claude.com và đăng nhập (hoặc tạo tài khoản).
2. **Billing**: nạp một ít tiền (ví dụ 5 USD). Có thể đặt luôn giới hạn chi tiêu hằng tháng.
3. **API Keys** → **Create Key**, đặt tên ví dụ `david-coaching-label` → tạo.
4. Sao chép key **ngay** (bắt đầu bằng `sk-ant-…`, chỉ hiện một lần). Tạm dán vào Notepad, xong việc thì xoá.

**B. Cài công cụ Firebase (một lần)**

1. Cài Node.js bản LTS từ https://nodejs.org.
2. Mở **PowerShell** rồi chạy:
   ```
   npm install -g firebase-tools
   firebase login
   ```
   Đăng nhập bằng tài khoản Google đang quản lý Firebase của app.

**C. Cất key vào Firebase**

```
firebase functions:secrets:set ANTHROPIC_API_KEY --project david-training-program
```

- Nếu được hỏi bật Secret Manager: chọn **Yes**.
- Khi hiện "Enter a value for ANTHROPIC_API_KEY": dán key rồi Enter (màn hình không hiện chữ là bình thường).
- Thấy "Created a new secret version…" là xong.

Kiểm tra (chỉ hiện phiên bản, không hiện key):

```
firebase functions:secrets:get ANTHROPIC_API_KEY --project david-training-program
```

---

## Bước 2 — Lấy code về máy và cài thư viện cho máy chủ

Lấy code (chọn một cách):

- Trên GitHub: nút xanh **Code** → **Download ZIP** → giải nén; hoặc
- Nếu máy có Git: `git clone https://github.com/simpleliftingbydavid/davidtrainingprogram.git`

Rồi trong PowerShell, mở thư mục code và chạy:

```
cd davidtrainingprogram
cd functions
npm install
cd ..
```

(Lần sau chỉ cần lấy bản mới nhất: `git pull`, hoặc tải ZIP lại.)

---

## Bước 3 — Đưa hàm đọc nhãn, thông báo đổi thứ tự và quyền dữ liệu mới lên Firebase

Vẫn trong thư mục `davidtrainingprogram`:

```
firebase deploy --only functions:readFoodLabel,functions:notifyCoachOfProgrammeEdit,firestore:rules --project david-training-program
```

Xong là dùng được ngay: vào trang **Món theo nhãn**, bấm "Chụp bảng dinh dưỡng" → "Đọc nhãn".

Lệnh này cũng bật luôn phần **học viên đổi thứ tự bài** (2026-11-18):

- `firestore:rules` cho phép học viên lưu thứ tự mới khi chọn "Lưu cho các lần sau". Trước khi
  deploy, chọn "Chỉ hôm nay" vẫn chạy bình thường; chọn "Lưu cho các lần sau" thì buổi tập vẫn được
  lưu nhưng app báo chưa lưu được thứ tự vào giáo án.
- `notifyCoachOfProgrammeEdit` gửi David thông báo "Đổi thứ tự buổi A".

---

## Ghi nhớ

- Mỗi người được **10 lần đọc nhãn mỗi ngày** (theo giờ Việt Nam).
- Ảnh không được lưu ở đâu; app chỉ điền sẵn, người dùng tự kiểm tra rồi bấm lưu.
- Chi phí ước tính khoảng 0,016 USD mỗi ảnh (Claude Opus 5.5). Theo dõi trong
  Firebase Console → Functions → `readFoodLabel` → Logs (dòng "readFoodLabel usage" ghi số token),
  và trong platform.claude.com → Usage.
