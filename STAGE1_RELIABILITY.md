# Stage 1 — Reliability & Visibility

## Phạm vi

Stage này bổ sung mã phiên bản, mã hỗ trợ, hộp thư lỗi kỹ thuật đã loại bỏ dữ liệu nhạy cảm và cổng kiểm thử GitHub. Nó không thay đổi progression, Training Max, RIR, volume, chu kỳ, dinh dưỡng hoặc cấu trúc buổi tập.

## Luồng lỗi kỹ thuật

1. Trình duyệt tạo một bản ghi chỉ gồm metadata tối thiểu: thao tác, mã lỗi, phiên bản, trang, loại thiết bị, trạng thái mạng và trạng thái lưu.
2. Không gửi mức tạ, reps, set, ghi chú, feedback, meal plan, payload hoặc stack trace.
3. Bản ghi được gộp theo loại lỗi trong từng tuần; cùng một lỗi bị giới hạn tối đa một lần mỗi 10 phút trên thiết bị.
4. Cloud Function chuyển bản ghi thành thẻ riêng trong nhóm **Lỗi kỹ thuật** của Dashboard Coach.
5. David có thể đánh dấu đã xem, ghi chú cách xử lý, đánh dấu hoàn tất và sao chép mã hỗ trợ.
6. Bản ghi nguồn quá 90 ngày được dọn bằng lịch chạy hàng tuần.

## Release gate

GitHub Actions chỉ chạy kiểm thử. Workflow không chứa token Vercel, không build production và không deploy production. Việc publish Firestore Rules, Cloud Functions và promote Preview vẫn cần David duyệt riêng.

## Backup / restore

Kiểm tra mã nguồn không tìm thấy cấu hình export Firestore định kỳ hoặc tài liệu diễn tập restore. Điều này không chứng minh Firebase Console chưa có backup; trạng thái trên Console cần được kiểm tra bằng tài khoản dự án.

Đề xuất cho đợt sau, chưa thực hiện trong Stage này:

- Xác nhận gói Firebase/GCP có hỗ trợ scheduled backup hoặc Firestore export.
- Đặt lịch backup hằng ngày và chính sách giữ 14–30 ngày tùy chi phí.
- Dùng bucket tách biệt, bật lifecycle và quyền truy cập tối thiểu.
- Mỗi quý phục hồi vào một project thử nghiệm, đối chiếu số học viên, sessions, assignments và nutrition plans.
- Không thử restore trực tiếp trên production.

## Điều kiện publish

- Pure tests, kiểm tra cú pháp và ba bộ test Firebase Emulator đều đạt.
- Preview được kiểm tra desktop/mobile, console và network sạch.
- David kiểm duyệt giao diện Dashboard và thông báo lỗi.
- Chỉ sau đó mới publish Rules/Functions và promote production.
