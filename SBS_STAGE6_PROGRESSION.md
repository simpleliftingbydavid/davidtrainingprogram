# SBS Stage 6 — bốn cơ chế progression còn lại

## Phạm vi

Stage 6 bổ sung bốn cơ chế theo từng bài tập, song song với các cơ chế đã có:

1. Original Progression
2. Fixed Total Reps
3. Reverse Pyramid / Set-by-set
4. Rep Increase

Khi David đổi cơ chế, trạng thái progression của riêng bài đó được tạo mới. Lịch sử buổi tập và audit cũ vẫn giữ nguyên. Hệ thống không tự đổi cơ chế hay sửa giáo án thay David.

## Ma trận truy vết nguồn

| Cơ chế | Quy tắc đã triển khai | Nguồn đã đối chiếu |
|---|---|---|
| Original Progression | Tạ = Training Max × intensity; tập rep cố định đến RIR dừng; TM đổi theo số set so với khung dưới/trên. Mặc định 4–6 set; bucket lần lượt `-5%, -2%, 0%, +1%, +2%, +3%, +5%`. | `Giai_ma_SBS_Program_Instructions_David_Coaching_v2.docx`, đoạn 32–34; `SBS Program Builder.xlsx`, `Quick Setup!F2:AZ5`, `Program!B151:N153`. |
| Fixed Total Reps | Mặc định 3 set, mục tiêu tổng 40 rep. Đạt mục tiêu thì tăng 3% hoặc nấc tạ nhỏ nhất; chưa đạt thì giữ nguyên. | DOCX đoạn 67; `BODY_FIX_He_Thong_Quan_Ly_Giao_An_SBS_v2_1.xlsx`, sheet `9. PROGRAM BUILDER – ACCESSORY!A5:G11`; `SBS Program Builder.xlsx`, `Program!B599:N600`. |
| Reverse Pyramid | Mặc định mục tiêu 6/10/12 rep. Mỗi set có tạ riêng; set nào đạt mới tăng tạ riêng set đó 3% hoặc nấc nhỏ nhất. | DOCX đoạn 68; BODY FIX sheet 9, hàng Reverse Pyramid; `SBS Program Builder.xlsx`, `Program!B681:N684`. |
| Rep Increase | Mặc định 4–6 set. Hoàn thành thì tăng một set; khi đạt 6 set, quay về 4 set và tăng 1 rep. Không tự tăng tạ. | DOCX đoạn 64; BODY FIX sheet 9, hàng Rep Increase; `SBS Program Builder.xlsx`, `Program!B843:O844`. |

## Quyết định sản phẩm của David Coaching

Các điểm dưới đây là guardrail của website, không phải công thức gốc của bảng SBS:

- Giảm set do thể trạng ở các cơ chế cố định sẽ giữ progression, tránh hiểu nhầm là thất bại hiệu suất.
- Original Progression được phép kết thúc tự nhiên trong khung set khi đã chạm RIR dừng; trường hợp này không bị coi là “giảm set”.
- Đổi cơ chế hoặc chỉnh Training Max, tạ, set, rep và các mốc progression phải ghi lý do; audit lưu riêng theo thời gian.
- Reverse Pyramid lưu tạ từng set dưới dạng mảng độc lập và hiển thị lại đúng từng set ở buổi sau.
- Rep Increase là cơ chế bodyweight: website chỉ tự tăng set/rep; David tự điều chỉnh độ khó bài tập khi cần.
- Các cảnh báo và dashboard chỉ đề xuất. David vẫn quyết định cuối cùng.

## Trạng thái kiểm thử bắt buộc trước production

- Unit test đủ bucket và chu kỳ cho cả bốn cơ chế.
- Kiểm thử form Coach, giao diện Client, lưu/khôi phục bản nháp và lịch sử.
- Kiểm thử Firestore Emulator cho tạo/sửa assignment, ghi buổi tập, audit và trạng thái kế tiếp.
- Kiểm thử Preview trên desktop và mobile bằng tài khoản thật trước khi commit/push/production.
