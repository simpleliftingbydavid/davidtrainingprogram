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

## Nguồn còn thiếu

Danh sách này được soát lại ngày 07/10/2026, sau khi website đã đi tới Stage 6.
Ba mục đã được lấp, bằng nguồn thật, nên đã bỏ khỏi danh sách:

- **Quy tắc tám progression scheme.** `progression-engine.js` triển khai đủ cả
  tám, và tự khai nguồn: "Scheme numbering matches the source spreadsheet's own
  tab order". Registry trong tài liệu này vì vậy đã đổi từ `source_required`
  sang `workbook_mapped_sbs`.
- **Ước lượng TM từ rep test.** `estimateTrainingMaxFromTestSet` tính TM từ một
  set thử qua bảng phần trăm–rep, và Stage 5 có `repOutTest`.
- **Xử lý deload.** `deload-review-engine.js` đưa ra đề xuất và David chốt, tức
  giải theo hướng `coach_managed` thay vì một rule riêng cho từng template.

Còn thiếu thật:

- Prescription theo tuần/block của từng template SBS. Website không có khái niệm
  block hay tuần; đây là khoảng trống lớn nhất và là lý do chưa blueprint nào
  kích hoạt được.
- Mapping tần suất cho Low Frequency và các biến thể chương trình. Hiện David tự
  đặt số lần tập mỗi tuần cho từng buổi (`volumePlan.dayFrequencies`), nên
  khoảng trống này không còn chặn việc gì, nhưng vẫn chưa phải mapping theo
  chương trình.
- Quy ước failure theo từng chương trình. Website lưu `schemeParams.failureStandard`
  cho từng bài và do David chọn — đúng dữ liệu nhưng khác trục: theo bài, không
  theo chương trình.
- Đường nhập Known 1RM riêng. Chỉ có đường ước lượng từ set thử.

Không triển khai các giá trị trên bằng suy đoán. Registry giữ chúng ở trạng thái
`source_required` cho đến khi có tài liệu và test fixture tương ứng.

## Trạng thái, 07/10/2026

Tầng này **chưa được áp dụng**. Không file nào ngoài `sbs-legacy-adapter.js` và bộ
test của nó import `sbs-program-schema.js`; website vẫn chạy engine và cấu trúc
Firestore cũ, đúng như phạm vi Stage 1 đặt ra.

Dấu vết duy nhất đã vào `main` là hai chỗ đọc phòng xa,
`log.programInstanceId || log.phaseId` trong `rir-calibration-engine.js` và
`functions/review-alert-builder.js`. Không chỗ nào ghi `programInstanceId`.

Scheme vẫn ở `legacy_partial`, không phải `ready`. `blueprintActivationStatus`
đòi `ready` cùng `sourceReferences` nêu tên tài liệu cụ thể, mà
`workbook_mapped_sbs` theo chính tài liệu này "chưa coi là prescription hoàn
chỉnh". Nâng lên `ready` sẽ là một khẳng định về nguồn mà repo không chứng minh
được.
