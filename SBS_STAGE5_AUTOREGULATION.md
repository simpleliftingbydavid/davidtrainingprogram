# SBS Stage 5 — Autoregulation & Progression

## Phạm vi đã triển khai

Stage 5 bổ sung bốn lớp dữ liệu/tính năng nhưng không tự thay quyết định của David:

1. **Chuẩn điểm dừng nhất quán** cho bài RIR và Reps to Failure: `0 RIR`, `technical failure` hoặc `true failure`.
2. **Overwarm single @8 tùy chọn** ở 85–93% Training Max. Hệ thống gợi ý tạ, học viên ghi tạ/RPE thực tế; kết quả chỉ để tham khảo.
3. **Rep-out test tùy chọn** cho bài RIR set cuối: lưu RIR học viên dự đoán và số rep thực tế còn làm thêm được. Sai số từ 2 rep tạo tín hiệu để David xem lại.
4. Hai cơ chế có quy tắc nguồn đầy đủ:
   - **SBS Reps to Failure**: set cuối là rep-out; Training Max đổi theo bucket `-5, -2, 0, +0.5, +1, +1.5, +2, +3%`.
   - **SBS Classic Overload**: giữ set × rep cố định; khi hoàn thành đủ mới tăng tạ theo `3%` hoặc nấc tạ nhỏ nhất, lấy mức lớn hơn.

## Quy tắc an toàn

- Single @8 không tự đổi tạ work set hoặc Training Max trong Stage 5.
- Rep-out chỉ tạo đề xuất hiệu chỉnh; không tự sửa giáo án.
- `True failure` được hiển thị như một lựa chọn rõ ràng, không phải mặc định. Mặc định RTF là `0 RIR`; mặc định RIR set cuối là `technical failure`.
- Mọi thay đổi cơ chế progression từ Coach đều yêu cầu lý do và đặt lại trạng thái của riêng bài đó. Lịch sử cũ vẫn được giữ.
- Dữ liệu buổi tập tạm của single @8 và rep-out được lưu trong draft để có thể reload hoặc tiếp tục trên thiết bị khác.

## Phân biệt “nguồn” và “quyết định thiết kế”

### Quy tắc lấy trực tiếp từ tài liệu SBS

- @8 tương ứng khoảng 2 RIR và được dùng như overwarm single trước work set.
- RIR đáng tin hơn khi người tập ở gần failure; rep-out test dùng để hiệu chỉnh khả năng tự đánh giá.
- Reps to Failure dùng các bucket thay đổi Training Max nêu trên.
- Classic Overload chỉ tăng tạ sau khi hoàn thành toàn bộ set và rep; mức tăng là 3% hoặc nấc tạ nhỏ nhất.
- Điểm dừng có thể được định nghĩa là true failure, 0 RIR hoặc technical failure nhưng phải nhất quán.

### Quyết định sản phẩm của David Coaching

- Sai số rep-out `±1` được xem là sát; `2` là cần xem lại; trên `2` là cần hiệu chỉnh. Đây là ngưỡng giao diện để triage, không phải một ngưỡng được tài liệu SBS tuyên bố nguyên văn.
- Single @8 chỉ advisory trong Stage 5 để tránh hệ thống tự điều chỉnh quá mức.
- Chỉ bật hai cơ chế progression có đủ quy tắc nguồn và đủ luồng Coach/Học viên.

## Chưa bật trong Stage 5

Các scheme `Original Progression`, `Fixed Total Reps`, `Reverse Pyramid` và `Rep Increase` vẫn bị chặn. Tài liệu có nhắc tới chúng nhưng chưa đủ quy tắc đầu-cuối hoặc chưa có UX phù hợp để triển khai mà không phải suy diễn. Chúng chỉ nên được bật sau khi David duyệt riêng từng cơ chế và có test độc lập.

## Nguồn nội bộ đã đối chiếu

- `Instructions.docx`
- `Giai_ma_SBS_Program_Instructions_David_Coaching_v2.docx`
- `BODY_FIX_He_Thong_Quan_Ly_Giao_An_SBS_v2_1.xlsx`
- Các workbook gốc trong thư mục `SBS Program`, đặc biệt `SBS Strength Program reps to failure.xlsx` và phần Quick Setup.
