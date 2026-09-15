# SBS Stage 2 — Dashboard “Cần David xem lại”

## Mục tiêu

Gom các sự kiện cần HLV can thiệp về một hàng đợi theo thời gian thực. David không phải mở từng học viên để tìm vấn đề. Dashboard chỉ hỗ trợ ưu tiên và lưu quyết định; nó không tự chẩn đoán, không tự sửa giáo án và không tự mở lại progression đang bị giữ vì đau.

## Luồng dữ liệu

1. Học viên ghi nhận buổi tập, check-in hoặc feedback; David có thể tạo một progression audit khi chỉnh tay.
2. Cloud Functions đọc sự kiện mới và tạo một bản tóm tắt tại `coaches/{coachUid}/reviewAlerts/{alertId}`.
3. `alertId` được tạo ổn định từ loại + học viên + nguồn. Nếu Functions chạy lại cùng sự kiện, cảnh báo không bị nhân đôi và quyết định đã lưu không bị ghi đè.
4. Trang Coach chỉ nghe tối đa 200 cảnh báo gần nhất trong một collection. Việc này tránh N+1 reads qua toàn bộ lịch sử của từng học viên.
5. David có thể ghi nhận `Đã xem`, `Điều chỉnh giáo án`, `Trao đổi với khách`, `Đã xử lý` hoặc `Mở lại`. Mọi cập nhật tăng `version`; quyết định cũ trên thiết bị khác không thể âm thầm ghi đè bản mới.

## Nguồn cảnh báo

- Đau/khó chịu trong bài hoặc đau khớp từ check-in (ưu tiên cao nhất).
- Bỏ bài, giảm set, kết thúc buổi sớm.
- Progression đang bị giữ.
- Feedback bài tập do học viên gửi.
- Training Max do David chỉnh tay biến động trên 10%.
- Hiệu suất giảm: ít nhất hai bài giảm trong cùng buổi, hoặc cùng bài giảm ở hai lần xuất hiện gần nhau.
- Chất lượng dữ liệu: log thiếu/sai, bài trùng hoặc thời lượng buổi trên 4 giờ.

Hai ngưỡng 10% và 4 giờ là **quy tắc triage vận hành David Coaching**, không phải khuyến nghị khoa học của SBS. Chúng chỉ đưa vấn đề vào hàng đợi để David kiểm tra, không tự thay đổi dữ liệu hay progression.

## Bảo mật

- Chỉ tài khoản coach sở hữu `coaches/{coachUid}` được đọc và cập nhật `reviewAlerts`.
- Trình duyệt không được tạo hoặc xóa cảnh báo; chỉ Cloud Functions dùng Admin SDK được tạo.
- Học viên không thể đọc, tạo hoặc giả mạo hàng đợi của HLV.
- Khi cập nhật, Rules chỉ cho phép thay đổi trường xử lý, bắt buộc `handledBy`, timestamp máy chủ và `version + 1`.

## Phạm vi dữ liệu và migration

- Không backfill lịch sử cũ, đúng phạm vi Stage 2 đã duyệt.
- Chỉ sự kiện mới sau khi Functions được publish mới sinh cảnh báo trung tâm.
- Cảnh báo đau hiện tại trong `students/{studentId}/coachingAlerts` vẫn là nguồn an toàn có quyền giữ progression; dashboard không thay thế hoặc tự đóng nguồn này.
- Không thay đổi schema của session/assignment, không sửa UID và không ghi vào dữ liệu production trong giai đoạn kiểm thử local.

## Triển khai và rollback (chỉ thực hiện sau khi David duyệt)

Thứ tự an toàn: publish Firestore Rules → deploy Cloud Functions → deploy giao diện Vercel. Rollback giao diện không xóa cảnh báo đã sinh. Nếu cần rollback hoàn toàn, quay lại Functions/Rules Stage 1; collection `reviewAlerts` dư thừa sẽ không ảnh hưởng app cũ và có thể giữ nguyên để audit.
