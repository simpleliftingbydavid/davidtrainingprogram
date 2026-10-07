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

## Bộ nguồn SBS gốc

David cung cấp ngày 07/10/2026, tại `G:\My Documents\Downloads\SBS Program`.
13 workbook, trong đó 11 template, 1 bản Program Builder và 1 bản đã điền cho
học viên (`Em Hiếu.xlsx`). Mỗi program type trong registry khớp đúng một file.

| Program type | Workbook | Tuần | Tần suất |
| --- | --- | --- | --- |
| `sbs_linear_progression` | SBS Linear Progression.xlsx | 21 | 3x 4x 5x 6x |
| `sbs_novice_hypertrophy` | SBS Novice hypertrophy program.xlsx | **53** | 3x 4x 5x |
| `sbs_hypertrophy_template` | SBS Hypertrophy Template.xlsx | 21 | 2x–6x |
| `sbs_reps_to_failure` | SBS Strength Program reps to failure.xlsx | 21 | 2x–6x |
| `sbs_last_set_rir` | SBS Strength Program last set RIR.xlsx | 21 | 2x–6x |
| `sbs_strength_sets` | SBS Strength Program.xlsx | 21 | 2x–6x |
| `sbs_low_frequency` | Lower Frequency Templates (5 file) | 21 | 3x 4x **5xa 5xb** 6x |
| `sbs_program_builder` | SBS Program Builder.xlsx | 21 | — |

Bản LF tách 5x thành **5xa** và **5xb**, điều không template chuẩn nào có.

## Cấu trúc 21 tuần

Đọc từ `SBS Program Builder.xlsx`, sheet Quick Setup: hàng cường độ theo tuần
và hàng cờ `Deload?`. Hai hàng này khớp nhau tuyệt đối.

**Ba khối, mỗi khối 7 tuần.** Mỗi khối là hai đợt sóng 3 tuần, rồi một tuần
deload. Deload rơi đúng tuần **7, 14, 21**.

Họ Strength — cường độ tính theo % Training Max:

| | Tuần 1–3 | Tuần 4–6 | Tuần 7 |
| --- | --- | --- | --- |
| Khối 1 | 0.70 · 0.75 · 0.80 | 0.725 · 0.775 · 0.825 | **0.60** |
| Khối 2 | 0.75 · 0.80 · 0.85 | 0.775 · 0.825 · 0.875 | **0.60** |
| Khối 3 | 0.80 · 0.85 · 0.90 | 0.85 · 0.90 · 0.95 | **0.60** |

Họ Hypertrophy — tiến theo rep, không theo % TM. Rep mỗi set thường:

| | Tuần 1–3 | Tuần 4–6 | Tuần 7 |
| --- | --- | --- | --- |
| Khối 1 | 10 · 9 · 8 | 9 · 8 · 7 | **5** |
| Khối 2 | 9 · 8 · 7 | 8 · 7 · 6 | **5** |
| Khối 3 | 8 · 7 · 6 | 7 · 6 · 5 | **5** |

Kiểm chứng: sóng 0.725/0.825/0.875 có trong SBS Strength Program và SBS Linear
Progression, **không có** trong SBS Hypertrophy Template — đúng với việc hai họ
dùng hai trục tiến bộ khác nhau.

**Chi tiết deload** (Program Builder): 4 set × 5 rep @ 60%, và **thay đổi
Training Max sau tuần deload = 0%**.

## Cột prescription theo từng họ

Mỗi tuần chiếm 7 cột, cụm cột khác nhau theo loại progression:

| Cụm cột | Template |
| --- | --- |
| Reps / RIR cutoff / Set goal / Sets completed | Strength Program |
| Set goal / Sets completed | Linear Progression, Strength last set RIR |
| Reps per normal set / Rep out target / Set goal / Reps on last set | Hypertrophy, reps to failure |
| Reps | Novice hypertrophy |

Mỗi bài có hai hàng: một hàng `<Tên bài> TM` giữ `single @8` để kiểm TM, và một
hàng prescription. Hàng `Accessories` nằm cuối mỗi ngày.

**Autoregulation** (Program Builder, Quick Setup): ngưỡng dưới 4 set, ngưỡng
trên 6 set, lệch 2+ set thì điều chỉnh TM −5%. Website đã triển khai đúng quy
tắc này trong `progression-engine.js`.

## Sửa lại một điều từng ghi sai ở đây

Tài liệu này từng ghi thiếu "prescription theo tuần/block". **Thông tin chưa bao
giờ thiếu** — nó nằm trong chính những workbook mà `progression-engine.js` đã
lấy bảng phần trăm→rep và quy tắc ngưỡng. Thứ còn thiếu là nó chưa được **mã hoá
thành dữ liệu blueprint**, không phải thiếu kiến thức.

Lần quét đầu tôi còn kết luận SBS "không có khái niệm block", vì không workbook
nào chứa chữ "block" — chuỗi duy nhất tìm thấy là tên bài tập "Block Pulls".
Cấu trúc khối **có thật**, chỉ không được gọi tên: 3 khối × 7 tuần như bảng trên.

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

Hai mục nữa được lấp bằng bộ workbook gốc ngày 07/10/2026, xem phần **Cấu trúc
21 tuần** ở trên:

- **Prescription theo tuần/block của từng template.** Có đủ: 21 tuần, ba khối 7
  tuần, deload ở tuần 7/14/21, và hai trục tiến bộ khác nhau cho họ Strength và
  họ Hypertrophy.
- **Mapping tần suất.** Có đủ: mỗi template khai sheet tần suất của chính nó, và
  bản LF tách 5x thành 5xa/5xb.

Còn thiếu thật:

- **Quy ước failure theo từng chương trình.** Website lưu
  `schemeParams.failureStandard` cho từng bài và do David chọn — đúng dữ liệu
  nhưng khác trục: theo bài, không theo chương trình. Workbook không khai
  failure standard ở cấp chương trình, nên đây có thể là khác biệt thiết kế chứ
  không phải thiếu nguồn.
- **Đường nhập Known 1RM riêng.** Chỉ có đường ước lượng từ set thử
  (`estimateTrainingMaxFromTestSet`). Workbook nhận trực tiếp cột `Maxes` cho
  từng bài, nên nguồn thì có; website chưa có ô nhập tương ứng.
- **Bản thân dữ liệu blueprint.** Đây mới là khoảng trống thật còn lại, và nó là
  việc mã hoá, không phải việc tìm nguồn: chưa ai rút 21 tuần × từng tần suất ×
  từng template từ 13 workbook thành dữ liệu mà `blueprintActivationStatus` đọc
  được. Cho đến khi làm, không blueprint nào kích hoạt được.

Không triển khai các giá trị còn thiếu bằng suy đoán. Registry giữ chúng ở trạng
thái `source_required` cho đến khi có tài liệu và test fixture tương ứng.

## Trạng thái, 07/10/2026

Tầng này **chưa được áp dụng**. Không file nào ngoài `sbs-legacy-adapter.js` và bộ
test của nó import `sbs-program-schema.js`; website vẫn chạy engine và cấu trúc
Firestore cũ, đúng như phạm vi Stage 1 đặt ra.

Dấu vết duy nhất đã vào `main` là hai chỗ đọc phòng xa,
`log.programInstanceId || log.phaseId` trong `rir-calibration-engine.js` và
`functions/review-alert-builder.js`. Không chỗ nào ghi `programInstanceId`.

Program type đã chuyển sang `sbs_source` + `foundation_only`, mỗi cái nêu đích
danh workbook của nó. Nêu được nguồn không có nghĩa là đã dựng blueprint từ
nguồn đó, nên không cái nào ở `ready`.

Scheme vẫn ở `legacy_partial`, không phải `ready`. `blueprintActivationStatus`
đòi `ready` cùng `sourceReferences` nêu tên tài liệu cụ thể, mà
`workbook_mapped_sbs` theo chính tài liệu này "chưa coi là prescription hoàn
chỉnh". Nâng lên `ready` sẽ là một khẳng định về nguồn mà repo không chứng minh
được.
