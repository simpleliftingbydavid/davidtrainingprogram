# SBS Stage 1 — Nền tảng dữ liệu

## Phạm vi

Stage 1 chỉ tạo ngôn ngữ dữ liệu chung và lớp đọc tương thích. Website hiện tại
tiếp tục sử dụng progression engine và cấu trúc Firestore cũ. Không có migration,
không có ghi dữ liệu SBS và không có thay đổi giao diện trong giai đoạn này.

## Ranh giới nguồn

| Nhóm | Cách xử lý |
| --- | --- |
| Quy tắc được workbook ánh xạ từ SBS | Gắn `workbook_mapped_sbs`; chưa coi là prescription hoàn chỉnh. |
| Quy tắc có tài liệu SBS gốc | Gắn `sbs_source` cùng tài liệu và phiên bản cụ thể. |
| Kỹ thuật, volume, cảnh báo và coach review của BODY FIX | Gắn `body_fix_extension`; không thay đổi phép tính progression SBS. |
| Dữ liệu website hiện tại | Gắn `legacy_david_coaching`; adapter chỉ đọc và giữ nguyên bản gốc. |
| Quy tắc chưa có đủ nguồn | Gắn `source_required`; blueprint/scheme không thể kích hoạt. |

## Mô hình đề xuất

### Program blueprint

Định nghĩa loại chương trình, phiên bản, nguồn, tần suất, block/tuần, deload,
quy ước failure và mapping vai trò bài tập sang progression scheme. Blueprint
không chứa Training Max hay lịch sử riêng của học viên.

### Program instance / phase

Là một lần áp dụng blueprint cho học viên. Instance giữ blueprint/version, block
và tuần hiện tại, Training Max policy, failure policy, trạng thái migration và
tham chiếu rollback.

### Assignment

Mỗi bài giữ `exerciseRole`, `progressionSchemeId`, version của scheme,
prescription config, progression state, readiness gate và coach overrides.
Scheme được chọn từ blueprint + vai trò bài tập, không suy ra từ tên bài.

### Session snapshot

Mỗi buổi chụp lại program instance, phase, blueprint/version, block/tuần,
scheme/version, prescription kế hoạch, kết quả thực tế và progression decision.
Nhờ vậy lịch sử không đổi khi blueprint được cập nhật sau này.

## Mapping dữ liệu cũ

| Legacy | SBS foundation | Ghi chú |
| --- | --- | --- |
| `phaseId` | `programInstanceId` + `phaseId` | Chỉ ánh xạ để đọc. |
| `scheme` số 1–8 | `progressionSchemeId` | Giữ nguyên số legacy trong registry. |
| `schemeParams` | `prescriptionConfig` | Không diễn giải lại công thức. |
| `state` | `progressionState` | Không thay đổi Training Max hoặc progression. |
| `progressionStep` / checklist | `readinessGate` | BODY FIX extension, không phải phép tính SBS. |
| `exerciseLogs` | versioned session snapshots | Giữ session gốc làm nguồn sự thật. |

Vai trò Core/Auxiliary/Accessory không được suy đoán từ tên bài. Dữ liệu cũ phải
chờ blueprint hoặc David xác nhận trước khi migration.

## Migration dự kiến

1. Chỉ chạy khi học viên bắt đầu chu kỳ mới.
2. Dry-run thuần trước, không ghi Firebase.
3. Chốt blueprint, vai trò bài và nguồn prescription.
4. Lưu snapshot phase/assignment cũ cùng version.
5. Tạo program instance mới bằng idempotency key.
6. Không sửa session lịch sử.
7. Nếu có lỗi, bỏ instance mới và quay lại reference cũ.

## Nguồn còn thiếu trước Stage 2–3

- Prescription theo tuần/block của từng template SBS.
- Quy tắc đầy đủ của Original Progression, Reps To Failure và năm scheme phụ.
- Mapping tần suất cho Low Frequency và các biến thể chương trình.
- Quy ước failure chính xác cho từng chương trình.
- Cách xử lý deload của từng template, thay vì dùng một rule chung.
- Đường nhập Known 1RM riêng với cách ước lượng TM từ rep test.

Không triển khai các giá trị trên bằng suy đoán. Registry giữ chúng ở trạng thái
`source_required` cho đến khi có tài liệu và test fixture tương ứng.
