# SBS Stage 3 — Theo dõi và hiệu chỉnh RIR

## Mục tiêu

So sánh RIR kế hoạch với RIR học viên thực tế ghi ở set cuối của từng bài. Hệ thống giúp David nhìn ra sai lệch có tính lặp lại nhưng chỉ đưa đề xuất; không tự đổi Training Max, độ khó, số set, rep hoặc giáo án.

## Quy tắc

- Theo dõi riêng từng bài trong đúng chu kỳ/assignment, không trộn dữ liệu giữa các chu kỳ.
- Hiển thị ba khung 4, 8 và 12 tuần: số lần tập, RIR kế hoạch trung bình, RIR thực tế trung bình, độ lệch trung bình và số lần thiếu RIR.
- Đưa vào “Cần David xem lại” khi hai lần tập liên tiếp lệch từ 2 RIR trở lên, hoặc hai lần liên tiếp không ghi RIR set cuối.
- Nếu RIR thực tế thấp hơn kế hoạch liên tiếp: đề xuất kiểm tra cách đánh giá RIR và cân nhắc giảm độ khó/hiệu chỉnh Training Max.
- Nếu RIR thực tế cao hơn kế hoạch liên tiếp: đề xuất cân nhắc tăng độ khó khi kỹ thuật và phục hồi cho phép.
- Nếu sai lệch đổi hướng: ưu tiên hiệu chỉnh cách học viên tự đánh giá RIR trước khi đổi giáo án.
- Dữ liệu cũ không xác định được chu kỳ vẫn được giữ để tham khảo nhưng không được dùng để đề xuất cho chu kỳ hiện tại.

## Phạm vi dữ liệu

- Dùng dữ liệu session đã có; không sửa schema session và không backfill lịch sử.
- Dashboard hồ sơ đọc tối đa 120 buổi gần nhất giống màn hình Coach hiện tại.
- Cloud Function chỉ tạo cảnh báo cho buổi tập mới. Mọi cảnh báo có ID ổn định để retry không tạo trùng.
- Không có thao tác nào từ Stage 3 tự cập nhật assignment hoặc progression.

## Triển khai

Stage 3 phải được tích hợp cùng lớp giao diện Dashboard Stage 2. Trước khi deploy cần hợp nhất lại Stage 2 vào GitHub `main`, vì production hiện tại đang thiếu hai file giao diện Dashboard dù dữ liệu cảnh báo trong Firebase vẫn còn.
