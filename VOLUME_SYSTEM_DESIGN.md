# Hệ thống theo dõi volume

## Nguyên tắc

- Volume là số set kích thích theo nhóm cơ, không phải tổng kg x rep x set.
- Một set được tính 1.0 cho cơ chính và 0.5 cho cơ phụ. David có thể sửa tỷ lệ của từng bài.
- Giáo án cũ vẫn hoạt động: khi chưa có cấu hình volume, hệ thống suy ra từ nhóm cơ và dạng chuyển động trong thư viện.
- Số liệu thực tế chỉ lấy các set đã hoàn thành. Bài bỏ qua, set chưa hoàn thành và buổi bị huỷ không được tính.
- Tăng volume chỉ là đề xuất. David luôn là người quyết định cuối cùng.

## Dữ liệu bổ sung, tương thích ngược

- `assignments/{id}.volumeConfig`: credits theo nhóm cơ, xác nhận kỹ thuật và lịch sử chỉnh baseline.
- `phases/{id}.volumePlan.dayFrequencies`: số lần mỗi buổi/nhãn dự kiến lặp lại trong một tuần.
- `sessions/{id}.exerciseLogs[].volumeCredits`: snapshot quy đổi tại thời điểm tập để lịch sử không đổi khi giáo án được sửa sau này.
- `checkIns/{id}` với `type = "volume-recovery"`: câu trả lời phục hồi do học viên gửi. Dùng collection đã có và quyền hiện tại; không mở thêm quyền Firestore.

Không đổi UID, không đổi đường dẫn document hiện có và không xoá/migrate dữ liệu cũ.

## Quy tắc đề xuất bảo thủ

- `Tăng`: chỉ khi hiệu suất đã chững, phục hồi tốt, không đau khớp đáng kể, kỹ thuật đã ổn định và dữ liệu RIR cho thấy set đủ gần thất bại.
- `Giữ`: khi vẫn tiến bộ, chưa đủ dữ liệu hoặc chưa hội đủ điều kiện tăng.
- `Giảm / xem lại`: khi đau khớp, phục hồi kém hoặc hiệu suất giảm lặp lại.
- `Chưa đủ dữ liệu`: hiển thị rõ lý do, không suy đoán.

## Hiển thị

- Coach: volume kế hoạch/tuần, thực tế 7 ngày, xu hướng 4/8/12 tuần, check-in mới nhất và lý do đề xuất.
- Học viên: check-in ngắn về phục hồi cơ, mệt mỏi, đau khớp và cảm nhận hiệu suất.
