# Bản dịch tiếng Anh — để David duyệt

File này được tạo từ `i18n-vi.js` và `i18n-en.js` bằng `node scripts/i18n-review.mjs`. Đừng sửa tay: sửa câu trong `i18n-en.js` rồi chạy lại.

Tổng: 2391 câu. Cần David quyết: 17 chỗ (đánh ⚠).

## ⚠ Cần David quyết

| Key | Tiếng Việt | Tiếng Anh | Cần xem |
|---|---|---|---|
| `shell.nav.students` | Học viên | Clients | "Học viên": Clients (common for personal coaching) or Students? |
| `shell.nav.programs` | Giáo án | Programs | "Giáo án": Programs, or Training plans? |
| `shell.nav.review` | Cần xem lại | To review | "Cần xem lại": To review, or Needs attention? |
| `shell.tool.labelFoods` | Món theo nhãn | Label foods | "Món theo nhãn" (packaged foods entered from the nutrition label): Label foods, or Packaged foods? |
| `shell.tool.mealPlanIntake` | Câu hỏi Meal Plan | Meal Plan questions | Kept "Meal Plan" as in Vietnamese; or Meal plan questionnaire? |
| `login.title` | Quay lại tập tiếp. | Back to training. | David's voice: "Quay lại tập tiếp." → "Back to training." Keep or reword? |
| `login.foot` | Mỗi kế hoạch đều được David xem lại trước khi gửi. | David reviews every plan before it is sent. | David's promise line; check the wording. |
| `home.todayDay` | Hôm nay · Buổi {day} | Today · Session {day} | "Buổi A": Session A, Workout A or Day A? Used across the app. |
| `home.identity` | Tôi là kiểu người <strong>{identity}</strong> | I am the kind of person who <strong>{identity}</strong> | Identity line ("Tôi là kiểu người…"); the habit identity itself is typed by the client and stays as typed, so an English line can end in Vietnamese. |
| `lift.load.choose` | tự chọn mức tạ | choose your load | "tự chọn mức tạ" (no load set yet): "choose your load" or "your choice of weight"? |
| `workout.plan.rtf` | Hôm nay: <strong>{load}</strong> — {sets} set × {reps} rep, set cuối rep-out mục tiêu {target} rep. Dừng theo chuẩn <strong>{standard}</strong>. | Today: <strong>{load}</strong> — {sets} sets × {reps} reps, then a last-set rep-out aiming for {target} reps. Stop by the <strong>{standard}</strong> standard. | RTF wording: "rep-out" and the failure standard name ({standard}) — check the terms. |
| `workout.tap_trung` | Tập trung | Focus | "Tập trung" view: Focus, or One set at a time? |
| `guide.photoTitle` | Cách chụp ảnh 3 góc (Front · Side · Back) | How to take the 3 angles (Front · Side · Back) | The three long guides (photo, weighing, measuring) have English versions in progress-guides.js (PHOTO_GUIDE_EN, WEIGHT_GUIDE_EN, MEASURE_GUIDE_EN); please read them there. |
| `hb.title` | Thay đổi hành vi, thay đổi cuộc sống | Change your behaviour, change your life | The whole habits handbook has an English version in habit-handbook-en.js (translated from habit-handbook.js); please read it there. |
| `dp.me_ta_don` | Mê tạ đòn | Barbell enthusiast | "Mê tạ đòn" dịch là "Barbell enthusiast". David xem có tên gọi tiếng Anh nào quen hơn không. |
| `dp.sach_khuyen_3_4_buoi` | sách khuyên 3–4 buổi | the book recommends 3–4 sessions | "sách khuyên" dịch là "the book recommends". Nếu muốn ghi tên sách, David bổ sung. |
| `dp.tap_giai_tri_may` | Tập giải trí (máy) | Recreational (machines) | "Tập giải trí (máy)" dịch là "Recreational (machines)". |

## lang

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `lang.label` | Ngôn ngữ | Language |
| `lang.laterNote` | Đã đổi ngôn ngữ. Phần bạn đang nhập được giữ nguyên; cả trang sẽ đổi khi bạn mở lại trang. | Language changed. What you are entering is kept; the whole page switches the next time you open it. |

## date

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `date.weekday.0` | Chủ nhật | Sunday |
| `date.weekday.1` | Thứ Hai | Monday |
| `date.weekday.2` | Thứ Ba | Tuesday |
| `date.weekday.3` | Thứ Tư | Wednesday |
| `date.weekday.4` | Thứ Năm | Thursday |
| `date.weekday.5` | Thứ Sáu | Friday |
| `date.weekday.6` | Thứ Bảy | Saturday |
| `date.short.0` | CN | Sun |
| `date.short.1` | T2 | Mon |
| `date.short.2` | T3 | Tue |
| `date.short.3` | T4 | Wed |
| `date.short.4` | T5 | Thu |
| `date.short.5` | T6 | Fri |
| `date.short.6` | T7 | Sat |

## muscle

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `muscle.chest` | Ngực | Chest |
| `muscle.back` | Lưng | Back |
| `muscle.shoulders` | Vai | Shoulders |
| `muscle.biceps` | Tay trước | Biceps |
| `muscle.triceps` | Tay sau | Triceps |
| `muscle.quads` | Đùi trước | Quads |
| `muscle.hamsGlutes` | Đùi sau & Mông | Hamstrings & glutes |
| `muscle.calves` | Bắp chân | Calves |
| `muscle.abs` | Bụng | Abs |

## shell

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `shell.nav.label` | Điều hướng chính | Main navigation |
| `shell.nav.home` | Trang chủ | Home |
| `shell.nav.training` | Tập luyện | Training |
| `shell.nav.nutrition` | Dinh dưỡng | Nutrition |
| `shell.nav.habits` | Thói quen | Habits |
| `shell.nav.progress` | Tiến trình | Progress |
| ⚠ `shell.nav.review` | Cần xem lại | To review |
| ⚠ `shell.nav.programs` | Giáo án | Programs |
| ⚠ `shell.nav.students` | Học viên | Clients |
| `shell.tool.exerciseReview` | Duyệt bài tập mới | Review new exercises |
| `shell.tool.dosePlanner` | Bộ dựng giáo án | Program builder |
| `shell.tool.programLibrary` | Thư viện giáo án | Program library |
| `shell.tool.templates` | Mẫu giáo án | Program templates |
| `shell.tool.coachDishes` | Món gợi ý | Suggested dishes |
| ⚠ `shell.tool.labelFoods` | Món theo nhãn | Label foods |
| ⚠ `shell.tool.mealPlanIntake` | Câu hỏi Meal Plan | Meal Plan questions |
| `shell.tool.nutritionReview` | Duyệt dữ liệu dinh dưỡng | Review nutrition data |
| `shell.tool.overview` | Tổng quan học viên | Client overview |
| `shell.tools.label` | Công cụ | Tools |
| `shell.collapse` | Thu gọn | Collapse |
| `shell.collapse.aria` | Thu gọn thanh công cụ | Collapse the sidebar |
| `shell.account.open` | Mở menu tài khoản | Open account menu |
| `shell.account.title` | Tài khoản | Account |
| `shell.account.version` | Phiên bản | Version |
| `shell.account.logout` | Đăng xuất | Log out |

## dialog

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `dialog.ok` | Đồng ý | OK |
| `dialog.cancel` | Huỷ | Cancel |
| `dialog.gotIt` | Đã hiểu | Got it |

## login

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `login.pageTitle` | Đăng nhập — David Coaching | Log in — David Coaching |
| ⚠ `login.title` | Quay lại tập tiếp. | Back to training. |
| `login.lede` | Theo dõi buổi tập, dinh dưỡng và những điều chỉnh David dành riêng cho bạn. | Track your sessions, your nutrition and the adjustments David makes just for you. |
| `login.email` | Email | Email |
| `login.password` | Mật khẩu | Password |
| `login.submit` | Đăng nhập | Log in |
| `login.submitting` | Đang đăng nhập… | Logging in… |
| `login.checking` | Đang kiểm tra tài khoản… | Checking your account… |
| `login.noAccount` | Tài khoản chưa được thiết lập trong hệ thống. Liên hệ David để được thêm vào. | This account has not been set up yet. Contact David to be added. |
| `login.checkFailed` | Chưa thể kiểm tra tài khoản lúc này. Hãy kiểm tra mạng rồi thử lại. | Your account cannot be checked right now. Check your connection and try again. |
| `login.failed` | Đăng nhập thất bại — kiểm tra lại email/mật khẩu. | Login failed. Check your email and password. |
| ⚠ `login.foot` | Mỗi kế hoạch đều được David xem lại trước khi gửi. | David reviews every plan before it is sent. |

## home

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `home.trang_chu_david_coaching` | Trang chủ — David Coaching | Home — David Coaching |
| `home.dang_xuat` | Đăng xuất | Log out |
| `home.dang_tai` | Đang tải | Loading |
| `home.hom_nay_cua_ban` | Hôm nay của bạn | Your day |
| `home.buoi_tap_hom_nay` | Buổi tập hôm nay | Today's session |
| `home.viec_hom_nay` | Việc hôm nay | Today |
| `home.thoi_quen` | Thói quen | Habits |
| `home.dinh_duong` | Dinh dưỡng | Nutrition |
| `home.tuan_nay_va_tien_trinh` | Tuần này và tiến trình | This week and progress |
| `home.tuan_nay` | Tuần này | This week |
| `home.can_nang_va_ky_luc` | Cân nặng và kỷ lục | Weight and records |
| `home.hello` | Chào | Hi |
| `home.cardFailed` | Chưa tải được mục này lúc này. Các mục khác vẫn dùng được. | This section could not load right now. Everything else still works. |
| `home.training` | Tập luyện | Training |
| `home.trainingFailed` | Chưa tải được buổi tập lúc này. Các mục khác vẫn dùng được. | Today's session could not load right now. Everything else still works. |
| `home.noProgram` | Chưa có giáo án | No program yet |
| `home.noProgramCopy` | David chưa thiết lập giáo án cho bạn. Hãy nhắn David nhé. | David hasn't set up your program yet. Send David a message. |
| `home.paused` | Đang tạm nghỉ | On a break |
| `home.pausedCopy` | Mọi buổi trong chu kỳ này đang tạm tắt. David sẽ mở lại khi phù hợp. | Every session in this cycle is paused. David will turn them back on when the time is right. |
| `home.exercise` | Bài tập | Exercise |
| ⚠ `home.todayDay` | Hôm nay · Buổi {day} | Today · Session {day} |
| `home.doneToday` | Đã tập xong | Done for today |
| `home.nextSession` | Buổi kế tiếp: <strong>Buổi {day}</strong> · {n} bài. | one: Next: <strong>Session {day}</strong> · {n} exercise.<br>other: Next: <strong>Session {day}</strong> · {n} exercises. |
| `home.seeProgram` | Xem giáo án | See program |
| `home.more` | và {n} bài nữa · {names} | one: and {n} more · {names}<br>other: and {n} more · {names} |
| `home.gapNudge` | Đã {n} ngày bạn chưa tập. Một buổi hôm nay, dù nhẹ hơn mọi khi, là đủ để giữ nhịp. | It's been {n} days since your last session. One session today, even a lighter one, is enough to keep the rhythm. |
| `home.todayDayCount` | Hôm nay · Buổi {day} · {n} bài | one: Today · Session {day} · {n} exercise<br>other: Today · Session {day} · {n} exercises |
| `home.pyramidNote` | Mỗi set một mức tạ riêng; xem đủ trong buổi tập. | Each set has its own load; see them all in the session. |
| `home.then` | Sau đó | Then |
| `home.go` | Vào tập | Start training |
| `home.habits` | Thói quen | Habits |
| `home.habitsEmpty` | Làm đều một việc đơn giản mỗi ngày quan trọng hơn làm nhiều. | Doing one simple thing every day matters more than doing a lot. |
| `home.habitsPick` | Chọn 1 thói quen nhỏ → | Pick one small habit → |
| `home.streakDays` | Chuỗi {n} ngày | one: {n}-day streak<br>other: {n}-day streak |
| `home.noStreak` | Chưa có chuỗi | No streak yet |
| `home.habitNudge` |  · hôm nay quay lại bằng bản 2 phút |  · come back today with the 2-minute version |
| `home.habitDone` | Xong | Done |
| `home.habit2min` | 2 phút | 2 min |
| `home.logged` |  đã ghi |  logged |
| `home.openHabits` | Mở thói quen → | Open habits → |
| `home.saveFailed` | Chưa lưu được. Kiểm tra kết nối rồi thử lại. | Couldn't save. Check your connection and try again. |
| `home.nutrition` | Dinh dưỡng | Nutrition |
| `home.protein` | đạm {g} g | protein {g} g |
| `home.kcalOfToday` | / {kcal} kcal hôm nay | / {kcal} kcal today |
| `home.kcalToday` | kcal hôm nay | kcal today |
| `home.foodsLogged` | Đã ghi {n} món | one: {n} food logged<br>other: {n} foods logged |
| `home.kcalLeft` |  · còn {kcal} kcal |  · {kcal} kcal left |
| `home.noFoods` | Chưa ghi món nào hôm nay. | Nothing logged today. |
| `home.mealsOk` | bữa đủ đạm và rau | meals with protein and vegetables |
| `home.noMealCount` | David chưa đặt số bữa mỗi ngày cho bạn. | David hasn't set your number of meals per day yet. |
| `home.openNutrition` | Mở dinh dưỡng → | Open nutrition → |
| `home.week` | Tuần này | This week |
| `home.today` | Hôm nay | Today |
| `home.trained` | đã tập | trained |
| `home.notTrained` | chưa tập | not trained |
| `home.firstSession` | Buổi tập đầu tiên của bạn sẽ hiện ở đây. | Your first session will show up here. |
| `home.weekDone` | Đã đủ {n} buổi tuần này.  | one: {n} session done this week. <br>other: All {n} sessions done this week.  |
| `home.weekLeft` | Còn {n} buổi để đủ tuần.  | one: {n} more session to complete the week. <br>other: {n} more sessions to complete the week.  |
| `home.weeksActive` | Bạn tập đều <strong>{n}/4</strong> tuần gần đây. | You trained consistently in <strong>{n}/4</strong> recent weeks. |
| `home.ofSessions` |  / {n} buổi | one:  / {n} session<br>other:  / {n} sessions |
| `home.sessions` |  buổi | one:  session<br>other:  sessions |
| `home.weekDays` | Các ngày trong tuần | Days of the week |
| `home.sparkAria` | Cân nặng {n} lần gần nhất, từ {from} đến {to} kg | Last {n} weigh-ins, from {from} to {to} kg |
| `home.noWeight` | Chưa có số cân. Cân đều từ 4 lần mỗi tuần để thấy xu hướng. | No weigh-ins yet. Weigh yourself at least 4 times a week to see the trend. |
| `home.thisMorning` | sáng nay | this morning |
| `home.days14` | 14 ngày | 14 days |
| `home.newRecord` | Kỷ lục mới · {date} | New record · {date} |
| `home.weight` | Cân nặng | Weight |
| `home.openProgress` | Mở tiến trình → | Open progress → |
| `home.vsLastWeek` | {d} kg so với tuần trước | {d} kg vs last week |
| `home.weighedOf` | Đã cân {n}/4 lần trong 7 ngày | Weighed {n}/4 times in 7 days |
| `home.sinceWeek` | từ tuần {date} | since the week of {date} |
| `home.need2Weeks` | Cần 2 tuần số cân | Needs 2 weeks of weigh-ins |
| `home.avg7` | TB 7 ngày | 7-day avg |
| `home.sinceStart` | Từ tuần đầu | Since week one |
| `home.notWeighed` | Chưa cân hôm nay | Not weighed today |
| `home.todayWeight` | Hôm nay: <strong>{kg} kg</strong> | Today: <strong>{kg} kg</strong> |
| `home.logWeight` | Ghi cân ở Dinh dưỡng → | Log weight in Nutrition → |
| `home.firstPhoto` | Chưa có ảnh tiến trình. Chụp ảnh đầu tiên để so sánh về sau. | No progress photos yet. Take the first one to compare later. |
| `home.photoDue` | <strong>{n} ngày</strong> chưa chụp ảnh tiến trình | one: <strong>{n} day</strong> since your last progress photo<br>other: <strong>{n} days</strong> since your last progress photo |
| `home.shoot` | Chụp | Take |
| `home.coachNote` | Lưu ý của David | David's note |
| ⚠ `home.identity` | Tôi là kiểu người <strong>{identity}</strong> | I am the kind of person who <strong>{identity}</strong> |
| `home.notStudent` | Tài khoản chưa được thiết lập cho học viên. | This account is not set up as a client. |
| `home.loadFailed` | Chưa tải được trang chủ lúc này. Kiểm tra kết nối rồi thử lại. | The home page couldn't load right now. Check your connection and try again. |

## lift

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `lift.sets` | {n} set | one: {n} set<br>other: {n} sets |
| `lift.totalReps` | tổng {n} | {n} total |
| `lift.setsTotalReps` | {sets} set · tổng {n} | {sets} sets · {n} total |
| `lift.per.side` | mỗi bên | per side |
| `lift.per.hand` | mỗi tay | per hand |
| `lift.load.from` | từ {kg} kg | from {kg} kg |
| `lift.load.kg` | {kg} kg | {kg} kg |
| `lift.load.bodyweight` | thân người | bodyweight |
| ⚠ `lift.load.choose` | tự chọn mức tạ | choose your load |

## plates

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `plates.aria` | Lắp tạ cho {kg} kg: đòn {bar} kg, mỗi bên {list} kg | Plates for {kg} kg: {bar} kg bar, {list} kg per side |
| `plates.ariaBarOnly` | Chỉ đòn {bar} kg, không lắp bánh | Just the {bar} kg bar, no plates |
| `plates.caption` | Mỗi bên lắp {list} kg <span>· đòn {bar} kg</span> | {list} kg per side <span>· {bar} kg bar</span> |
| `plates.captionBarOnly` | Chỉ cần đòn {bar} kg <span>· không lắp bánh</span> | Just the {bar} kg bar <span>· no plates</span> |
| `plates.strip` | <strong>Mỗi bên {list} kg</strong> <span>· đòn {bar}</span> | <strong>{list} kg per side</strong> <span>· {bar} kg bar</span> |
| `plates.stripBarOnly` | <strong>Chỉ cần đòn {bar} kg</strong> <span>· không lắp bánh</span> | <strong>Just the {bar} kg bar</strong> <span>· no plates</span> |

## workout

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `workout.buoi_tap_cua_toi_david_coaching` | Buổi tập của tôi — David Coaching | My training — David Coaching |
| `workout.dang_xuat` | Đăng xuất | Log out |
| `workout.dang_tai` | Đang tải | Loading |
| `workout.hom_nay_minh_tap_gi` | Hôm nay mình tập gì? | What are we training today? |
| `workout.ngay_tap` | Ngày tập | Training date |
| `workout.bat_dau_buoi_tap` | Bắt đầu buổi tập | Start session |
| `workout.nhip_tap` | Nhịp tập | Training rhythm |
| `workout.khoang_mot_phut_de_david_dieu` | Khoảng một phút để David điều chỉnh volume phù hợp với khả năng hồi phục của bạn. | About a minute, so David can match your volume to how well you are recovering. |
| `workout.met_moi_toan_than` | Mệt mỏi toàn thân | Overall fatigue |
| `workout.1_rat_khoe` | 1 · Rất khỏe | 1 · Very fresh |
| `workout.2_on` | 2 · Ổn | 2 · Good |
| `workout.3_binh_thuong` | 3 · Bình thường | 3 · Normal |
| `workout.4_met` | 4 · Mệt | 4 · Tired |
| `workout.5_rat_met` | 5 · Rất mệt | 5 · Very tired |
| `workout.dau_kho_chiu_o_khop` | Đau/khó chịu ở khớp | Joint pain or discomfort |
| `workout.0_khong_co` | 0 · Không có | 0 · None |
| `workout.1_nhe` | 1 · Nhẹ | 1 · Mild |
| `workout.2_dang_chu_y` | 2 · Đáng chú ý | 2 · Noticeable |
| `workout.3_nhieu` | 3 · Nhiều | 3 · A lot |
| `workout.hieu_suat_gan_day` | Hiệu suất gần đây | Recent performance |
| `workout.giam` | Giảm | Down |
| `workout.giu_on_dinh` | Giữ ổn định | Steady |
| `workout.tang` | Tăng | Up |
| `workout.dieu_muon_david_biet_tuy_chon` | Điều muốn David biết (tuỳ chọn) | Anything you want David to know (optional) |
| `workout.gui_check_in` | Gửi check-in | Send check-in |
| `workout.tong_ket_cac_chu_ky_da` | Tổng kết các chu kỳ đã hoàn thành | Completed cycle reviews |
| `workout.dang_tap` | Đang tập | Training |
| `workout.thoi_gian_tap` | Thời gian tập | Session time |
| `workout.cach_xem_buoi_tap` | Cách xem buổi tập | Session view |
| `workout.danh_sach` | Danh sách | List |
| ⚠ `workout.tap_trung` | Tập trung | Focus |
| `workout.dang_nghi_giua_set` | Đang nghỉ giữa set | Resting between sets |
| `workout.nghi` | Nghỉ | Rest |
| `workout.bo_qua` | Bỏ qua | Skip |
| `workout.them_bai_tap_ngoai_giao_an` | + Thêm bài tập ngoài giáo án | + Add an exercise not in the program |
| `workout.chon_bai_muon_tap_them` | Chọn bài muốn tập thêm | Choose an exercise to add |
| `workout.tim_ten_bai_tap` | Tìm tên bài tập… | Search exercises… |
| `workout.them_vao_buoi` | Thêm vào buổi | Add to session |
| `workout.nghi_giua_set` | Nghỉ giữa set | Rest between sets |
| `workout.60_giay` | 60 giây | 60 seconds |
| `workout.90_giay` | 90 giây | 90 seconds |
| `workout.120_giay` | 120 giây | 120 seconds |
| `workout.180_giay` | 180 giây | 180 seconds |
| `workout.bai_nay_chi_co_trong_buoi` | Bài này chỉ có trong buổi hôm nay. Kết quả và tiến trình vẫn được ghi nhớ cho lần sau. | This exercise is only in today's session. Its results and progress are still remembered for next time. |
| `workout.ghi_chu_cho_david_tuy_chon` | Ghi chú cho David (tuỳ chọn) | Note for David (optional) |
| `workout.cam_nhan_hom_nay_cho_nao` | Cảm nhận hôm nay, chỗ nào khó, điều muốn nhắn cho David… | How today felt, what was hard, anything for David… |
| `workout.ghi_nhan_buoi_tap` | Ghi nhận buổi tập | Save session |
| `workout.huy_buoi_tap` | Hủy buổi tập | Cancel session |
| `workout.da_ghi_nhan` | Đã ghi nhận | Saved |
| `workout.lan_sau_ban_tap` | Lần sau bạn tập | Next time you train |
| `workout.ve_trang_chu` | Về trang chủ | Back to home |
| `workout.xem_lich_su_tap` | Xem lịch sử tập → | See training history → |
| `workout.buoi_tap_hien_tai` | Buổi tập hiện tại | Current session |
| `workout.huy_buoi_tap_nay` | Hủy buổi tập này? | Cancel this session? |
| `workout.toan_bo_thong_tin_ban_vua` | Toàn bộ thông tin bạn vừa nhập sẽ không được lưu. Giáo án và lịch sử các buổi trước vẫn được giữ nguyên. | Everything you just entered won't be saved. Your program and past sessions stay as they are. |
| `workout.tiep_tuc_tap` | Tiếp tục tập | Keep training |
| `workout.ghi_nhan_dung_hoan_canh` | Ghi nhận đúng hoàn cảnh | Log what really happened |
| `workout.dieu_gi_khien_ban_thay_doi` | Điều gì khiến bạn thay đổi kế hoạch? | What made you change the plan? |
| `workout.ly_do` | Lý do | Reason |
| `workout.ghi_chu_ngan` | Ghi chú ngắn | Short note |
| `workout.chia_se_them_de_david_hieu` | Chia sẻ thêm để David hiểu đúng tình trạng hôm nay | Tell David a bit more about how today went |
| `workout.quay_lai` | Quay lại | Back |
| `workout.xac_nhan` | Xác nhận | Confirm |
| `workout.giao_an_nhung_buoi_sau` | Giáo án những buổi sau | Program for future sessions |
| `workout.ban_co_muon_luu_thay_doi` | Bạn có muốn lưu thay đổi bài tập? | Save your exercise changes? |
| `workout.set_va_thoi_gian_nghi_hom` | Set và thời gian nghỉ hôm nay vẫn chỉ áp dụng cho buổi này. | Today's sets and rest times still apply to this session only. |
| `workout.chi_ap_dung_hom_nay` | Chỉ áp dụng hôm nay | Today only |
| `workout.luu_cho_nhung_buoi_sau` | Lưu cho những buổi sau | Save for future sessions |
| `workout.buoi_tap_dang_dang_do` | Buổi tập đang dang dở | Unfinished session |
| `workout.ban_muon_tiep_tuc_the_nao` | Bạn muốn tiếp tục thế nào? | How do you want to continue? |
| `workout.tiep_tuc_buoi_cu` | Tiếp tục buổi cũ | Continue the old session |
| `workout.giu_du_lieu_dat_lai_thoi` | Giữ dữ liệu, đặt lại thời gian | Keep data, reset the timer |
| `workout.xac_nhan_thoi_gian_tap` | Xác nhận thời gian tập | Confirm session time |
| `workout.buoi_tap_nay_da_mo_kha` | Buổi tập này đã mở khá lâu | This session has been open a while |
| `workout.so_phut_ban_thuc_su_tap` | Số phút bạn thực sự tập | Minutes you actually trained |
| `workout.vi_du_75` | Ví dụ: 75 | E.g. 75 |
| `workout.quay_lai_buoi_tap` | Quay lại buổi tập | Back to the session |
| `workout.dung_thoi_gian_nay` | Dùng thời gian này | Use this time |
| `workout.minh_quay_lai_set_tiep_theo` | Mình quay lại set tiếp theo nhé — giữ nhịp để buổi tập hiệu quả hơn. | Let's get back to the next set — keep the rhythm so the session works better. |
| `workout.outcome.up` | Tiến bộ rồi đó | You progressed |
| `workout.outcome.hold` | Đúng kế hoạch | On plan |
| `workout.outcome.down` | Giữ nguyên lần sau | Same next time |
| `workout.outcome.sub` | Đã đổi bài tập | Exercise swapped |
| `workout.outcome.skipped` | Đã bỏ qua | Skipped |
| `workout.outcomeMsg.up` | Bạn làm tốt hơn kế hoạch — lần sau sẽ nặng/nhiều hơn một chút. | You beat the plan — next time will be a little heavier or more. |
| `workout.outcomeMsg.hold` | Đúng như dự kiến — cứ tiếp tục nhịp độ này. | Right on plan — keep this pace. |
| `workout.outcomeMsg.down` | Chưa đạt hết lần này, không sao cả — giữ nguyên mức này và thử lại vào buổi sau. | Not all of it this time, and that's fine — same level, try again next session. |
| `workout.outcomeMsg.sub` | Bài gốc được giữ nguyên; bài thay thế đã ghi nhớ kết quả và tiến trình riêng cho lần sau. | The original exercise is unchanged; the substitute keeps its own results and progress for next time. |
| `workout.outcomeMsg.skipped` | Bài này được ghi nhận là bỏ qua do thể trạng. Tiến độ chung không thay đổi. | Logged as skipped for how you felt today. Your overall progress doesn't change. |
| `workout.apreDown.label` | Giảm nhẹ tạ tuần sau | Slightly lighter next week |
| `workout.apreDown.msg` | Plus Set chưa đủ rep mục tiêu, không sao cả — tuần sau tạ nhẹ hơn một chút để làm đủ rep. | The Plus Set fell short of the target reps, and that's fine — next week is a little lighter so you can hit them. |
| `workout.bucket.fewer2` | Thiếu từ 2 set | 2+ fewer sets completed |
| `workout.bucket.fewer1` | Thiếu 1 set hoặc set cuối còn ít rep dự trữ hơn mục tiêu | 1 fewer set, or last set below the RIR target |
| `workout.bucket.atTarget` | Đủ set, set cuối đúng mức rep dự trữ | All sets done; last set at the RIR target |
| `workout.bucket.above1` | Set cuối còn dư 1 rep so với mục tiêu | Last set 1 rep above the RIR target |
| `workout.bucket.above2` | Set cuối còn dư 2 rep so với mục tiêu | Last set 2 reps above the RIR target |
| `workout.bucket.above3` | Set cuối còn dư từ 3 rep so với mục tiêu | Last set 3+ reps above the RIR target |
| `workout.loadDown` | Chưa đạt hết lần này, không sao cả — buổi sau tạ nhẹ hơn một chút ({from} → {to} kg{per}) để tập đủ chất lượng. | Not all of it this time, and that's fine — next session is a little lighter ({from} → {to} kg{per}) so every rep is quality. |
| `workout.notStudent` | Tài khoản chưa được thiết lập cho học viên. Liên hệ David để được kiểm tra. | This account is not set up as a client. Contact David to check it. |
| `workout.clientFallback` | Học viên | Client |
| `workout.bootFailed` | Chưa thể tải tài khoản lúc này. Kiểm tra mạng rồi tải lại trang. Mã hỗ trợ: {code}. | Your account can't load right now. Check your connection and reload the page. Support code: {code}. |
| `workout.streak.all` | Bạn đã tập đều cả <strong>4/4 tuần</strong> gần đây. Giữ nhịp này nhé. | You trained in all of the last <strong>4/4 weeks</strong>. Keep this rhythm. |
| `workout.streak.none` | Chưa có buổi tập nào trong 4 tuần gần đây — quay lại lịch tập đều nhé, mỗi buổi đều có giá trị. | No sessions in the last 4 weeks — get back to a regular schedule; every session counts. |
| `workout.streak.some` | Bạn đã tập đều trong <strong>{n}/4 tuần</strong> gần đây — cố giữ nhịp độ này nhé. | You trained in <strong>{n}/4 weeks</strong> recently — try to keep this pace. |
| `workout.streak.title` | 4 tuần gần đây | Last 4 weeks |
| `workout.streak.of4` | /4 tuần | /4 weeks |
| `workout.noProgram` | Chưa có giáo án | No program yet |
| `workout.noProgramCopy` | David chưa thiết lập giáo án cho bạn. Trong lúc chờ, bạn vẫn ghi được thói quen và bữa ăn mỗi ngày. | David hasn't set up your program yet. Meanwhile you can still log your habits and meals every day. |
| `workout.openHabits` | Mở thói quen | Open habits |
| `workout.openNutrition` | Mở dinh dưỡng | Open nutrition |
| `workout.dayName` | Buổi {day} | Session {day} |
| `workout.chipNext` |  · kế tiếp |  · next |
| `workout.chipPaused` | tạm nghỉ | paused |
| `workout.chipPausedTitle` | David đang tạm tắt buổi này. Bạn không cần tập buổi này cho tới khi David mở lại. | David has paused this session. You don't need to do it until David turns it back on. |
| `workout.exerciseCount` | {n} bài | one: {n} exercise<br>other: {n} exercises |
| `workout.lastTime` | lần trước {date} | last time {date} |
| `workout.firstTime` | lần đầu tập buổi này | first time doing this session |
| `workout.exerciseFallback` | Bài tập | Exercise |
| `workout.trainedToday` | Hôm nay bạn đã tập <strong>Buổi {last}</strong>. Buổi kế tiếp: <strong>Buổi {next}</strong>. | You already did <strong>Session {last}</strong> today. Next: <strong>Session {next}</strong>. |
| `workout.review.appendix` | Phụ lục: | Addendum: |
| `workout.review.cycle` | Chu kỳ | Cycle |
| `workout.review.sessions` |  buổi |  sessions |
| `workout.review.worked` | Điều hiệu quả: | What worked: |
| `workout.review.change` | Điều cần thay đổi: | What to change: |
| `workout.review.next` | Hướng tiếp theo: | Next direction: |
| `workout.endedElsewhere` | Buổi tập vừa được lưu hoặc kết thúc trên thiết bị khác. Bạn có thể chọn buổi tập tiếp theo. | This session was just saved or ended on another device. You can pick your next session. |
| `workout.restOver` | Đã hết thời gian nghỉ | Rest is over |
| `workout.restBackTo` | Quay lại set tiếp theo của {name} nhé. | Back to your next set of {name}. |
| `workout.restBack` | Mình quay lại set tiếp theo nhé. | Let's get back to the next set. |
| `workout.staleCopy` | Buổi này đã mở khoảng {n} phút. Bạn có thể giữ nguyên thời gian cũ hoặc giữ toàn bộ dữ liệu và bắt đầu lại timer từ 0. | one: This session has been open for about {n} minute. Keep the original time, or keep everything you entered and restart the timer from 0.<br>other: This session has been open for about {n} minutes. Keep the original time, or keep everything you entered and restart the timer from 0. |
| `workout.durationCopy` | Timer đang ghi nhận khoảng {n} phút. Hãy nhập thời gian bạn thực sự tập để lịch sử được chính xác. | one: The timer shows about {n} minute. Enter how long you actually trained so your history is accurate.<br>other: The timer shows about {n} minutes. Enter how long you actually trained so your history is accurate. |
| `workout.durationInvalid` | Hãy nhập số phút lớn hơn 0. | Enter a number of minutes above 0. |
| `workout.resume.title` | Tiếp tục buổi tập đang dang dở? | Continue your unfinished session? |
| `workout.resume.body` | Bạn có buổi "Buổi {day}" đang dang dở (lưu {ago}). | You have "Session {day}" in progress (saved {ago}). |
| `workout.resume.secondsAgo` | vài giây trước | a few seconds ago |
| `workout.resume.minutesAgo` | {n} phút trước | one: {n} minute ago<br>other: {n} minutes ago |
| `workout.resume.continue` | Tiếp tục buổi này | Continue this session |
| `workout.resume.restart` | Tập lại từ đầu | Start over |
| `workout.focusBackTo` | Mình quay lại set tiếp theo của {name} nhé — giữ nhịp nào. | Back to your next set of {name} — keep the rhythm. |
| `workout.plan.original` | Hôm nay: <strong>{load}</strong> — {reps} rep mỗi set. Tập đến khi còn khoảng {rir} rep dự trữ; khung mục tiêu {lo}–{hi} set. | Today: <strong>{load}</strong> — {reps} reps per set. Train until about {rir} reps in reserve; target range {lo}–{hi} sets. |
| `workout.plan.stopAtFailure` | dừng set cuối khi vừa hết sức | stop the last set right at failure |
| `workout.plan.stopAtRir` | dừng set cuối khi còn khoảng {n} rep mới hết sức | one: stop the last set about {n} rep short of failure<br>other: stop the last set about {n} reps short of failure |
| `workout.plan.lastSetRir` | Hôm nay: <strong>{load}</strong> — {sets} set × {reps} rep. Cứ tập trung vào kỹ thuật, {hint}. | Today: <strong>{load}</strong> — {sets} sets × {reps} reps. Focus on technique; {hint}. |
| ⚠ `workout.plan.rtf` | Hôm nay: <strong>{load}</strong> — {sets} set × {reps} rep, set cuối rep-out mục tiêu {target} rep. Dừng theo chuẩn <strong>{standard}</strong>. | Today: <strong>{load}</strong> — {sets} sets × {reps} reps, then a last-set rep-out aiming for {target} reps. Stop by the <strong>{standard}</strong> standard. |
| `workout.plan.classic` | Hôm nay: <strong>{load}</strong> — {sets} set × {reps} rep. Hoàn thành đủ tất cả set và rep mới tăng tạ lần sau. | Today: <strong>{load}</strong> — {sets} sets × {reps} reps. Complete every set and rep to add weight next time. |
| `workout.plan.totalReps` | Hôm nay: <strong>{load}</strong> — {sets} set, hướng tới tổng <strong>{total} rep</strong>. Dừng mỗi set khi kỹ thuật không còn đạt chuẩn. | Today: <strong>{load}</strong> — {sets} sets, aiming for <strong>{total} total reps</strong>. End each set when your technique breaks down. |
| `workout.plan.pyramidSet` | Set {i}: <strong>{load} × {reps} rep</strong> | Set {i}: <strong>{load} × {reps} reps</strong> |
| `workout.plan.pyramid` | Hôm nay: {sets}. Mỗi set được đánh giá và tăng tạ độc lập. | Today: {sets}. Each set is judged and progressed on its own. |
| `workout.plan.rirLeft` | còn khoảng {n} rep dự trữ | one: about {n} rep in reserve<br>other: about {n} reps in reserve |
| `workout.plan.rirRange` | còn khoảng {lo}–{hi} rep dự trữ | about {lo}–{hi} reps in reserve |
| `workout.plan.doubleBw` | Hôm nay: <strong>trọng lượng cơ thể</strong> — {sets} set × {reps} rep (khung {lo}–{hi}). Dừng mỗi set khi {effort}. Đủ {hi} rep ở mọi set thì David tăng độ khó. | Today: <strong>bodyweight</strong> — {sets} sets × {reps} reps (range {lo}–{hi}). End each set at {effort}. Once every set reaches {hi} reps, David makes it harder. |
| `workout.plan.chooseRamp` | <strong>tự chọn mức tạ</strong> qua vài set khởi động tăng dần | <strong>choose your load</strong> over a few ramping warm-up sets |
| `workout.plan.double` | Hôm nay: {load} — {sets} set × {reps} rep (khung {lo}–{hi}). Dừng mỗi set khi {effort}. Đủ {hi} rep ở mọi set thì buổi sau tăng tạ; chưa đủ thì thêm 1 rep. | Today: {load} — {sets} sets × {reps} reps (range {lo}–{hi}). End each set at {effort}. Once every set reaches {hi} reps, the weight goes up next session; if not, add 1 rep. |
| `workout.plan.repIncrease` | Hôm nay: <strong>trọng lượng cơ thể</strong> — {sets} set × {reps} rep. Khi đủ set và rep, lần sau hệ thống tăng set hoặc rep; không tự tăng tạ. | Today: <strong>bodyweight</strong> — {sets} sets × {reps} reps. Once you complete them, next time adds a set or a rep; the load doesn't go up on its own. |
| `workout.plan.bwOnly` | Hôm nay: <strong>trọng lượng cơ thể</strong> — {sets} set × {reps} rep. Giữ kỹ thuật ổn định; David sẽ điều chỉnh độ khó khi cần. | Today: <strong>bodyweight</strong> — {sets} sets × {reps} reps. Keep your technique steady; David adjusts the difficulty when needed. |
| `workout.plan.default` | Hôm nay: <strong>{load}</strong> — {sets} set × {reps} rep. Cố hết khả năng trong khung này, không cần vắt kiệt sức. | Today: <strong>{load}</strong> — {sets} sets × {reps} reps. Give your best within this range; no need to grind to exhaustion. |
| `workout.reason.pick` | Chọn lý do phù hợp | Choose a reason |
| `workout.reason.noteNeeded` | Hãy ghi chú ngắn cho lý do khác. | Add a short note for "other". |
| `workout.reason.needed` | Hãy chọn một lý do. | Choose a reason. |
| `workout.block.safetyHold` | Đang giữ progression — chờ David xem. | Progression on hold — waiting for David to review. |
| `workout.block.rest` | Nghỉ: | Rest: |
| `workout.block.details` | Chi tiết | Details |
| `workout.block.setsToday` | Set hôm nay | Today's sets |
| `workout.block.setMinus` | Giảm một set | One set fewer |
| `workout.block.setCount` | Số set hôm nay | Number of sets today |
| `workout.block.setPlus` | Tăng một set | One more set |
| `workout.block.setAdjust` | Kế hoạch gốc: {n} set · điều chỉnh chỉ áp dụng hôm nay | one: Original plan: {n} set · changes apply to today only<br>other: Original plan: {n} sets · changes apply to today only |
| `workout.block.skippedToday` | Đã bỏ qua trong buổi hôm nay. | Skipped in today's session. |
| `workout.block.undoSet` | Hoàn tác set vừa xong | Undo last set |
| `workout.block.moreAria` | Thêm lựa chọn cho bài này | More options for this exercise |
| `workout.block.more` | Thêm | More |
| `workout.block.notes` | Ghi chú & phản hồi | Notes & feedback |
| `workout.block.swap` | Đổi bài tập (máy đang bận, không có sẵn…) | Swap exercise (machine busy, not available…) |
| `workout.block.skip` | Bỏ qua bài hôm nay | Skip this exercise today |
| `workout.block.custom` | Tùy chỉnh | Custom |
| `workout.block.seconds` | Số giây | Seconds |
| `workout.block.restNote` | Điều chỉnh theo thể trạng hôm nay · không thay đổi giáo án. | Adjust to how you feel today · your program doesn't change. |
| `workout.block.removeExtra` | Bỏ bài thêm khỏi buổi này | Remove this extra exercise from the session |
| `workout.ladder.title` | Nấc tiến bộ hiện tại | Current progression step |
| `workout.ladder.cycles` | Đã hoàn thành {n} vòng | one: {n} round completed<br>other: {n} rounds completed |
| `workout.s5.repoutOnlyPlanned` | Chỉ thực hiện khi đây là lần kiểm tra rep-out đã được David lên kế hoạch. | Only when this is a rep-out test David has planned. |
| `workout.s5.repoutEnter` | Nhập RIR đã dự đoán và số rep còn làm thêm được. | Enter your predicted RIR and how many more reps you actually did. |
| `workout.s5.standard` | Chuẩn điểm dừng: {label} | Stopping standard: {label} |
| `workout.s5.single` | Overwarm single @8 · gợi ý {kg} kg | Overwarm single @8 · suggested {kg} kg |
| `workout.s5.singleNote` | 1 rep khoảng RPE 8 (xấp xỉ 2 RIR). Kết quả chỉ để David đánh giá, không tự đổi tạ work set hay Training Max. | 1 rep at about RPE 8 (roughly 2 RIR). The result is for David to review; it doesn't change your work-set load or Training Max by itself. |
| `workout.s5.weightDone` | Tạ đã làm (kg) | Weight used (kg) |
| `workout.s5.leaveEmpty` | Không làm thì để trống | Leave empty if you didn't do it |
| `workout.s5.rpe` | RPE thực tế | Actual RPE |
| `workout.s5.repoutToday` | Hôm nay là lần rep-out test | Today is a rep-out test |
| `workout.s5.predicted` | RIR dự đoán trước test | RIR predicted before the test |
| `workout.s5.extraReps` | Số rep thực tế còn làm thêm | Extra reps you actually did |
| `workout.restApply.msg` | Áp dụng thời gian nghỉ mới cho lượt nghỉ đang chạy? | Apply the new rest time to the rest that is running now? |
| `workout.restApply.now` | Áp dụng ngay | Apply now |
| `workout.restApply.later` | Để lượt sau | From the next rest |
| `workout.extraBadge` | Tập thêm | Extra |
| `workout.prev.repsHint` | Số rep từng set ở lần gần nhất — dùng để tham khảo khi điều chỉnh độ khó. | Reps per set last time — for reference when adjusting the difficulty. |
| `workout.prev.loadHint` | Mức tạ từng set ở lần gần nhất — dùng để tham khảo, không thay đổi mức đề xuất hôm nay. | Load per set last time — for reference; it doesn't change today's suggestion. |
| `workout.prev.noReps` | Chưa có số rep từ buổi trước. | No reps from last time yet. |
| `workout.prev.noLoad` | Chưa có mức tạ từ buổi trước. | No load from last time yet. |
| `workout.swap.keepPlan` | Đang dùng bài thay thế, giữ nguyên số set, số rep và cách tăng tiến của bài gốc. | Using a substitute: same sets, reps and progression as the original. |
| `workout.swap.enterLoad` |  Bạn tự nhập mức tạ phù hợp với bài này. |  Enter a load that suits this exercise. |
| `workout.swap.keepLater` |  Khi ghi nhận, bạn có thể chọn giữ thay đổi này cho những buổi sau. |  When you save, you can choose to keep this change for future sessions. |
| `workout.swap.using` | Đang dùng bài thay thế. | Using a substitute. |
| `workout.extra.remembered` | Mức đã ghi nhớ: <strong>{level}</strong>. Bạn vẫn có thể điều chỉnh set cho riêng hôm nay. | Remembered level: <strong>{level}</strong>. You can still adjust the sets for today only. |
| `workout.extra.levelBw` | Trọng lượng cơ thể × {sets} set × {reps} rep | Bodyweight × {sets} sets × {reps} reps |
| `workout.extra.levelKg` | {kg} kg{per} × {sets} set × {reps} rep | {kg} kg{per} × {sets} sets × {reps} reps |
| `workout.extra.firstReps` | Lần đầu tập thêm bài này — chọn số rep phù hợp. Hệ thống sẽ ghi nhớ cho lần sau. | First time adding this exercise — choose the reps that suit you. It's remembered for next time. |
| `workout.extra.firstLoad` | Lần đầu tập thêm bài này — nhập mức tạ phù hợp. Hệ thống sẽ ghi nhớ cho lần sau. | First time adding this exercise — enter a load that suits you. It's remembered for next time. |
| `workout.coachNote` | Lưu ý từ David: {note} | Note from David: {note} |
| `workout.technique` | Kỹ thuật chi tiết | Technique details |
| `workout.skip.undo` | Hoàn tác bỏ qua | Undo skip |
| `workout.skip.summary` | Đã bỏ qua hôm nay{reason}. Progression được giữ nguyên. | Skipped today{reason}. Progression stays as it is. |
| `workout.skip.why` | Vì sao bạn bỏ qua bài này? | Why are you skipping this exercise? |
| `workout.skip.whyCopy` | Lý do giúp David hiểu đúng buổi tập và tránh điều chỉnh progression sai. | The reason helps David read the session right and avoid adjusting your progression the wrong way. |
| `workout.head.load` | Mức tải | Load |
| `workout.head.kg` | Tạ (kg{per}) | Weight (kg{per}) |
| `workout.head.reps` | Rep | Reps |
| `workout.head.rir` | RIR (chỉ set cuối) | RIR (last set only) |
| `workout.prev.reps` | Buổi trước: {n} rep | one: Last time: {n} rep<br>other: Last time: {n} reps |
| `workout.prev.kg` | Buổi trước: {kg} kg | Last time: {kg} kg |
| `workout.prev.none` | Chưa có dữ liệu | No data yet |
| `workout.setWord` | Set  | Set  |
| `workout.bodyweight` | Trọng lượng cơ thể | Bodyweight |
| `workout.setMinusBlocked` | Bạn đã hoàn thành {n} set nên không thể giảm thấp hơn. | one: You've completed {n} set, so you can't go lower.<br>other: You've completed {n} sets, so you can't go lower. |
| `workout.fewerSets.why` | Vì sao bạn giảm set hôm nay? | Why fewer sets today? |
| `workout.fewerSets.copy` | Thay đổi này chỉ áp dụng cho buổi hiện tại và giúp hệ thống giữ progression đúng bối cảnh. | This only applies to this session and helps keep your progression in the right context. |
| `workout.alreadyInSession` | Bài này đã có trong buổi tập hôm nay. Hãy chọn một bài khác. | This exercise is already in today's session. Choose another one. |
| `workout.removeExtra.msg` | Bài này đã có set hoàn thành. Bạn vẫn muốn bỏ khỏi buổi hôm nay? | This exercise already has completed sets. Remove it from today's session anyway? |
| `workout.removeExtra.ok` | Bỏ bài này | Remove it |
| `workout.removeExtra.keep` | Giữ lại | Keep it |
| `workout.recovery.1` | 1 · Chưa hồi phục | 1 · Not recovered |
| `workout.recovery.2` | 2 · Còn đau nhiều | 2 · Still very sore |
| `workout.recovery.3` | 3 · Tạm ổn | 3 · Okay |
| `workout.recovery.4` | 4 · Đã hồi phục | 4 · Recovered |
| `workout.recovery.5` | 5 · Rất sung sức | 5 · Feeling great |
| `workout.recovery.last` | · lần cuối {date} | · last sent {date} |
| `workout.recovery.notSent` | · chưa gửi | · not sent |
| `workout.recovery.sending` | Đang gửi… | Sending… |
| `workout.recovery.sent` | Đã gửi check-in cho David. Cảm ơn bạn. | Check-in sent to David. Thank you. |
| `workout.recovery.failed` | Chưa thể gửi check-in: {error} | Couldn't send the check-in: {error} |
| `workout.noMatch` | Không tìm thấy bài tập phù hợp. | No matching exercise found. |
| `workout.alreadyInSession2` | Bài này đã có trong buổi tập hôm nay rồi. | This exercise is already in today's session. |
| `workout.cancelledLocal` | Buổi tập đã được hủy trên thiết bị này. Hệ thống sẽ tiếp tục xóa bản nháp đồng bộ khi có mạng trở lại. | The session was cancelled on this device. The synced draft will be cleared once you're back online. |
| `workout.change.addNote` | Bạn tự chọn mức tạ, hệ thống ghi nhớ cho lần sau. | You choose the load; it is remembered for next time. |
| `workout.change.replaceNote` | Giữ nguyên số set, số rep và cách tăng tiến của bài gốc; mức tạ tính từ hôm nay. | Same sets, reps and progression as the original; the load starts from today's. |
| `workout.save.dateInvalid` | Hãy chọn ngày tập hợp lệ trước khi ghi nhận buổi tập. | Choose a valid training date before saving the session. |
| `workout.save.reasonMissing` | Hãy chọn lý do cho bài bị bỏ qua hoặc giảm set trước khi ghi nhận. | Choose a reason for every skipped exercise or reduced set count before saving. |
| `workout.save.earlyTitle` | Bạn muốn kết thúc buổi tập sớm? | End the session early? |
| `workout.save.earlyCopy` | Còn {n} bài chưa hoàn thành. Hãy cho David biết lý do để progression không bị hiểu sai. | one: {n} exercise is not finished. Tell David why so your progression is read correctly.<br>other: {n} exercises are not finished. Tell David why so your progression is read correctly. |
| `workout.save.nothingDone` | Hãy hoàn thành ít nhất 1 set hoặc chọn bỏ qua bài do thể trạng trước khi ghi nhận buổi tập. | Complete at least 1 set, or skip exercises for how you feel, before saving the session. |
| `workout.save.confirming` | Đang xác nhận… | Confirming… |
| `workout.save.saving` | Đang lưu… | Saving… |
| `workout.save.savedLocalDraft` | Buổi tập đã được lưu an toàn. Bản nháp cũ sẽ được dọn tiếp khi có mạng trở lại. | The session is saved. The old draft will be cleaned up once you're back online. |
| `workout.save.programChangeFailed` | Buổi tập đã được lưu an toàn, nhưng thay đổi giáo án chưa được áp dụng. Giáo án cũ vẫn được giữ nguyên. Mã hỗ trợ: {code}. | The session is saved, but the program change wasn't applied. Your program stays as it was. Support code: {code}. |
| `workout.supportCode` | Mã hỗ trợ: {code}. | Support code: {code}. |
| `workout.sub.keptCarried` | Đã lưu cho những buổi sau: bài này thay bài gốc, giữ nguyên mức progression của bài gốc và bắt đầu từ mức tạ hôm nay. | Saved for future sessions: this exercise replaces the original, keeps the original's progression and starts from today's load. |
| `workout.sub.kept` | Đã lưu cho những buổi sau: bài này thay bài gốc trong giáo án. | Saved for future sessions: this exercise replaces the original in your program. |
| `workout.sub.today` | Hôm nay bài thay thế tập theo mức của bài gốc. Buổi sau quay lại bài gốc, mức của bài gốc giữ nguyên. | Today the substitute followed the original's level. Next session goes back to the original, at the same level. |
| `workout.sub.did` |  (đã tập: {name}) |  (did: {name}) |
| `workout.next.pyramidSet` | Set {i}: {kg} kg{per} × {reps} rep | Set {i}: {kg} kg{per} × {reps} reps |
| `workout.next.chosenLoad` | tạ tự chọn | your chosen load |
| `workout.newRecord` | Kỷ lục mới | New record |
| `workout.outcome.lighter` | Giảm nhẹ tạ buổi sau | Slightly lighter next session |
| `workout.next.load` | Mức tạ | Load |
| `workout.next.session` | Buổi sau | Next session |
| `workout.foot.none` | Buổi tập đã được ghi nhận. Nghỉ ngơi và quay lại khi thể trạng phù hợp hơn nhé. | Session saved. Rest up and come back when you're feeling better. |
| `workout.foot.allUp` | Cả buổi đều tiến bộ — làm rất tốt. Cứ giữ nhịp độ đều đặn như vậy. | Progress on everything — great work. Keep this steady rhythm. |
| `workout.foot.anyDown` | Có bài chưa đạt cũng bình thường — điều quan trọng nhất là bạn vẫn có mặt hôm nay. | Missing a target on some exercises is normal — what matters most is that you showed up today. |
| `workout.foot.steady` | Buổi tập ổn định, đúng kế hoạch — sự đều đặn này chính là thứ tạo ra kết quả lâu dài. | A steady session, right on plan — this consistency is what builds long-term results. |
| `workout.foot.prs` | {n} kỷ lục cá nhân mới trong buổi này! | one: {n} new personal record this session!<br>other: {n} new personal records this session! |
| `workout.result.session` | Buổi tập | Session |
| `workout.result.time` | Thời gian | Time |
| `workout.result.min` |  phút |  min |
| `workout.result.exercises` | Bài tập | Exercises |
| `workout.result.sets` | Set | Sets |
| `workout.result.reps` | {n} rep | one: {n} rep<br>other: {n} reps |
| `workout.fields.weight` | nhập mức tạ bằng số, ví dụ 12 hoặc 12,5 | enter the weight as a number, e.g. 12 or 12.5 |
| `workout.fields.reps` | nhập số rep là số nguyên lớn hơn 0 | enter reps as a whole number above 0 |
| `workout.fields.rir` | RIR là số từ 0 đến 10 | RIR is a number from 0 to 10 |
| `workout.fields.wrap` | hãy {parts}. | please {parts}. |
| `workout.save.mixedPhases` | Các bài trong buổi không cùng một chu kỳ. | The exercises in this session aren't in the same cycle. |
| `workout.draftDeleteFailed` | Không thể xóa bản nháp buổi tập. | Couldn't delete the session draft. |
| `workout.recovery.title` | Check-in phục hồi | Recovery check-in |
| `workout.view.skippedToday` | Bỏ qua hôm nay | Skipped today |
| `workout.view.doneOf` | {done}/{n} set | one: {done}/{n} set<br>other: {done}/{n} sets |
| `workout.view.nextSet` | Tiếp theo: set {set} · {name} | Next: set {set} · {name} |
| `workout.view.allDone` | Đã xong mọi set hôm nay. Bấm “Ghi nhận buổi tập” khi bạn sẵn sàng. | Every set is done today. Tap “Save session” when you are ready. |
| `workout.view.next` | Tiếp theo: {name} | Next: {name} |
| `workout.view.prevSet` | Set trước | Previous set |
| `workout.view.nextSetBtn` | Set sau | Next set |
| `workout.view.prevLift` | ‹ Bài trước | ‹ Previous exercise |
| `workout.view.nextLift` | Bài kế › | Next exercise › |
| `workout.view.eyebrow` | Bài {i}/{n} · {state} | Exercise {i}/{n} · {state} |
| `workout.view.stSkipped` | bỏ qua | skipped |
| `workout.view.stDone` | đã xong | done |
| `workout.view.stActive` | đang tập | in progress |
| `workout.view.exOf` | Bài {i}/{n} | Exercise {i}/{n} |
| `workout.view.left` | Còn {time} | {time} left |
| `workout.setDone` | Xong | Done |
| `workout.firstSessionHere` | Buổi tập đầu tiên bạn ghi nhận sẽ hiện ở đây. | The first session you save will show up here. |

## reason

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `reason.time` | Không đủ thời gian | Not enough time |
| `reason.equipment` | Không có thiết bị phù hợp | No suitable equipment |
| `reason.pain` | Đau hoặc khó chịu | Pain or discomfort |
| `reason.technique` | Kỹ thuật không ổn | Technique not right |
| `reason.fatigue` | Mệt hoặc thể trạng kém | Tired or feeling unwell |
| `reason.other` | Lý do khác | Other reason |
| `reason.none` | Chưa ghi lý do | No reason given |

## bucket

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `bucket.skipped` | Bỏ qua do thể trạng — không ảnh hưởng tiến trình | Skipped for how you felt — doesn't affect progress |
| `bucket.contextHold` | Giữ nguyên tiến độ theo bối cảnh buổi tập | Progress held given the session context |
| `bucket.fewerSets` | Giảm set theo thể trạng — giữ nguyên tiến độ | Fewer sets for how you felt — progress held |
| `bucket.safetyHold` | Đang giữ progression — chờ David xem | Progression on hold — waiting for David to review |
| `bucket.reasonHold` | {reason} — giữ nguyên progression | {reason} — progression held |
| `bucket.e.sch1.below2` | Thấp hơn ngưỡng dưới từ 2 set | 2+ sets below the lower bound |
| `bucket.e.sch1.below1` | Thấp hơn ngưỡng dưới 1 set | 1 set below the lower bound |
| `bucket.e.sch1.within` | Nằm trong khung set mục tiêu | Within the target set range |
| `bucket.e.sch1.above1` | Vượt ngưỡng trên 1 set | 1 set above the upper bound |
| `bucket.e.sch1.above2` | Vượt ngưỡng trên 2 set | 2 sets above the upper bound |
| `bucket.e.sch1.above3` | Vượt ngưỡng trên 3 set | 3 sets above the upper bound |
| `bucket.e.sch1.above4` | Vượt ngưỡng trên từ 4 set | 4+ sets above the upper bound |
| `bucket.e.missed` | missed target reps | Missed target reps — same sets, reps and load next time |
| `bucket.e.addSets` | Đạt đủ rep mọi set — lần sau thêm set | All reps hit on every set — add a set next time |
| `bucket.e.cycleDone` | Đạt đủ rep mọi set — lần sau tăng rep, hoàn thành một vòng tăng set/rep; David sẽ điều chỉnh độ khó khi cần | All reps hit on every set — more reps next time, completing a set/rep round; David will adjust difficulty when needed |
| `bucket.e.addReps` | Đạt đủ rep mọi set — lần sau tăng rep | All reps hit on every set — more reps next time |
| `bucket.e.addWeightReset` | Đạt đủ rep mọi set — lần sau tăng tạ, quay về số set và rep ban đầu | All reps hit on every set — more load next time, back to the starting sets and reps |
| `bucket.e.holdLoad` | Chưa hoàn thành đủ set và rep — giữ nguyên tạ | Not all sets and reps done — same load |
| `bucket.e.addLoad` | Hoàn thành đủ set và rep — lần sau tăng tạ | All sets and reps done — more load next time |
| `bucket.e.hold` | Chưa hoàn thành đủ set và rep — giữ nguyên | Not all sets and reps done — no change |
| `bucket.e.noLoad` | Chưa ghi mức tạ — buổi sau tự chọn tạ qua set khởi động và ghi lại số kg | No load logged — next time pick a load through warm-up sets and log the kg |
| `bucket.e.holdLoadReps` | Chưa đủ rep ở mọi set — buổi sau giữ nguyên tạ và rep | Not all reps on every set — same load and reps next time |
| `bucket.e.rpNone` | Chưa set nào đạt rep mục tiêu — giữ nguyên từng mức tạ | No set hit its target reps — each load stays the same |
| `bucket.e.apreKeepPrev` | Chưa đủ set hoặc chưa ghi Plus Set — giữ kết quả buổi trước trong tuần | Not enough sets or no Plus Set logged — keeping the earlier result this week |
| `bucket.e.apreHold` | Chưa đủ set hoặc chưa ghi Plus Set — tuần sau giữ nguyên mức tạ | Not enough sets or no Plus Set logged — same load next week |
| `bucket.e.ro.below2` | Thấp hơn rep-out target từ 2 rep | 2+ reps below the rep-out target |
| `bucket.e.ro.below1` | Thấp hơn rep-out target 1 rep | 1 rep below the rep-out target |
| `bucket.e.ro.at` | Đạt rep-out target | Rep-out target hit |
| `bucket.e.ro.above1` | Vượt rep-out target 1 rep | 1 rep above the rep-out target |
| `bucket.e.ro.above2` | Vượt rep-out target 2 rep | 2 reps above the rep-out target |
| `bucket.e.ro.above3` | Vượt rep-out target 3 rep | 3 reps above the rep-out target |
| `bucket.e.ro.above4` | Vượt rep-out target 4 rep | 4 reps above the rep-out target |
| `bucket.e.ro.above5` | Vượt rep-out target từ 5 rep | 5+ reps above the rep-out target |
| `bucket.e.plus.below4` | Plus Set ít hơn mục tiêu từ 4 rep | Plus Set 4+ reps below target |
| `bucket.e.plus.below2` | Plus Set ít hơn mục tiêu 2–3 rep | Plus Set 2–3 reps below target |
| `bucket.e.plus.below1` | Plus Set ít hơn mục tiêu 1 rep | Plus Set 1 rep below target |
| `bucket.e.plus.at` | Plus Set đạt đúng mục tiêu | Plus Set right on target |
| `bucket.e.plus.above1` | Plus Set nhiều hơn mục tiêu 1 rep | Plus Set 1 rep above target |
| `bucket.e.plus.above2` | Plus Set nhiều hơn mục tiêu 2 rep | Plus Set 2 reps above target |
| `bucket.e.plus.above3` | Plus Set nhiều hơn mục tiêu 3 rep | Plus Set 3 reps above target |
| `bucket.e.plus.above4` | Plus Set nhiều hơn mục tiêu từ 4 rep | Plus Set 4+ reps above target |
| `bucket.e.totalHold` | Tổng {a}/{b} rep — giữ nguyên tạ | Total {a}/{b} reps — same load |
| `bucket.e.totalUp` | Đạt {a}/{b} rep — lần sau tăng tạ | {a}/{b} reps hit — more load next time |
| `bucket.e.toSets` | Hoàn thành mục tiêu — lần sau tăng lên {a} set | Target hit — up to {a} sets next time |
| `bucket.e.toReps` | Đạt đủ {a} set — lần sau tăng lên {b} rep và quay về {c} set | All {a} sets done — up to {b} reps next time, back to {c} sets |
| `bucket.e.bwCap` | Đủ {a} rep ở mọi set — David sẽ tăng độ khó | {a} reps on every set — David will make it harder |
| `bucket.e.dpUp` | Đủ rep — tăng lên {a} kg, về {b} rep | Reps hit — up to {a} kg, back to {b} reps |
| `bucket.e.dpRep` | Đủ rep — buổi sau thêm 1 rep ({a} rep) | Reps hit — 1 more rep next time ({a} reps) |
| `bucket.e.dpEffort` | Đủ {a} rep nhưng set cuối còn ít hơn {b} rep dự trữ — giữ tạ thêm một buổi | {a} reps, but the last set had fewer than {b} reps in reserve — same load one more session |
| `bucket.e.rpSome` | {a}/{b} set đạt mục tiêu — chỉ tăng tạ ở set đã đạt | {a}/{b} sets hit target — more load only on those sets |

## apre

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `apre.noLoad` | Chưa có mức tạ | No load yet |
| `apre.fromDate` |  · từ {date}: {kg} kg{per} |  · from {date}: {kg} kg{per} |
| `apre.coachSummary` | {load} × {sets} set × {reps} rep · set cuối tối đa · đổi tạ theo tuần{next} | {load} × {sets} sets × {reps} reps · last set max · load changes weekly{next} |
| `apre.today` | Hôm nay: <strong>{load}</strong> — {sets} set × {reps} rep, set cuối tập tối đa (<strong>Plus Set</strong>). Dừng khi kỹ thuật không còn đạt chuẩn. Số rep Plus Set quyết định mức tạ tuần sau. | Today: <strong>{load}</strong> — {sets} sets × {reps} reps, last set as many as you can (<strong>Plus Set</strong>). Stop when your technique breaks down. Your Plus Set reps set next week's load. |
| `apre.appliesFrom` |  (áp dụng từ thứ Hai {date}) |  (from Monday {date}) |
| `apre.noLoadLogged` | Chưa ghi mức tạ — buổi sau tự chọn tạ qua set khởi động | No load logged — next session, choose your load through warm-up sets |
| `apre.noPlus` | Chưa có Plus Set mới → tuần sau {kg} kg{per}{from} | No new Plus Set → next week {kg} kg{per}{from} |
| `apre.resultHold` | Plus Set {reps} rep ({sign}) → tuần sau giữ {kg} kg{per} | Plus Set {reps} reps ({sign}) → next week stays at {kg} kg{per} |
| `apre.result` | Plus Set {reps} rep ({sign}) → tuần sau {kg} kg{per}{from} | Plus Set {reps} reps ({sign}) → next week {kg} kg{per}{from} |

## stage5

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `stage5.standard.zeroRir` | Dừng khi biết chắc không thể hoàn thành thêm một rep. | Stop when you're sure you couldn't complete one more rep. |
| `stage5.standard.technical` | Dừng khi kỹ thuật bắt đầu mất ổn định. | Stop when your technique starts to break down. |
| `stage5.standard.trueFailure` | Tiếp tục cho đến khi thực sự không hoàn thành được rep. | Keep going until you truly can't complete a rep. |
| `stage5.calib.accurate` | Ước lượng RIR đang khá sát. | Your RIR estimates are close. |
| `stage5.calib.more` | Bạn còn nhiều hơn dự đoán {n} rep. | one: You had {n} more rep left than you predicted.<br>other: You had {n} more reps left than you predicted. |
| `stage5.calib.less` | Bạn còn ít hơn dự đoán {n} rep. | one: You had {n} fewer rep left than you predicted.<br>other: You had {n} fewer reps left than you predicted. |

## entry

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `entry.exerciseN` | Bài {n} | Exercise {n} |
| `entry.missingExtraId` | thiếu mã bài tập thêm. | the extra exercise has no id. |
| `entry.dupExtra` | bài tập thêm đang bị trùng trong buổi. | this extra exercise appears twice in the session. |
| `entry.missingAssignment` | thiếu liên kết với giáo án. | not linked to the program. |
| `entry.dupAssigned` | bài trong giáo án đang bị trùng trong buổi. | this program exercise appears twice in the session. |
| `entry.singleWeight` | tạ single @8 phải lớn hơn 0. | the single @8 weight must be above 0. |
| `entry.singleRpe` | RPE của single @8 phải từ 1 đến 10. | the single @8 RPE must be from 1 to 10. |
| `entry.predictedRir` | RIR dự đoán phải từ 0 đến 10. | predicted RIR must be from 0 to 10. |
| `entry.extraReps` | số rep làm thêm phải từ 0 đến 20. | extra reps must be from 0 to 20. |
| `entry.dupOther` | bài tập đang bị trùng với một bài khác trong buổi. | this exercise duplicates another one in the session. |
| `entry.setLabel` | {label} · set {n} | {label} · set {n} |
| `entry.badWeight` | mức tạ không hợp lệ. | the weight is not valid. |
| `entry.badReps` | số rep phải lớn hơn 0. | reps must be above 0. |
| `entry.badRir` | RIR phải từ 0 đến 10. | RIR must be from 0 to 10. |

## save

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `save.dataInvalid` | Dữ liệu buổi tập chưa đồng bộ đúng định dạng. Toàn bộ phần vừa nhập vẫn được giữ nguyên; hãy gửi mã SAVE_DATA_INVALID cho David. | The session data isn't in the right format. Everything you entered is kept; send the code SAVE_DATA_INVALID to David. |
| `save.authPending` | Phiên đăng nhập chưa được Firebase xác nhận. Hãy kiểm tra mạng hoặc đăng nhập lại rồi thử lưu. Dữ liệu buổi tập vừa nhập vẫn được giữ nguyên. | Your login hasn't been confirmed by Firebase. Check your connection or log in again, then try saving. What you entered is kept. |
| `save.offline` | Kết nối đang không ổn định. Hãy giữ nguyên trang và thử lại sau ít phút; dữ liệu vừa nhập chưa bị mất. | The connection is unstable. Stay on this page and try again in a few minutes; nothing you entered is lost. |
| `save.duplicate` | Buổi tập này đã được ghi nhận trước đó. Hãy tải lại lịch sử trước khi thử lại để tránh lưu trùng. | This session was already saved. Reload your history before trying again so it is not saved twice. |
| `save.generic` | Chưa thể ghi nhận buổi tập lúc này. Dữ liệu vừa nhập vẫn được giữ nguyên; hãy thử lại hoặc gửi ảnh màn hình cho David. | The session can't be saved right now. What you entered is kept; try again or send David a screenshot. |

## rebase

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `rebase.sets` | Bạn tập khác giáo án ở set {sets}, nên buổi sau tính từ số tạ bạn đã tập. | You trained differently from the plan on set {sets}, so next session starts from the loads you used. |
| `rebase.from` | Buổi sau tính từ {kg} bạn đã tập. | Next session starts from the {kg} you used. |
| `rebase.instead` | Bạn tập {to} thay vì {from}, nên buổi sau tính từ {to}. | You used {to} instead of {from}, so next session starts from {to}. |

## change

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `change.replace` | Đổi {from} → {to} | Swap {from} → {to} |
| `change.add` | Thêm {name} | Add {name} |
| `change.remove` | Bỏ {name} | Remove {name} |

## tabs

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `tabs.workout` | Buổi tập | Session |
| `tabs.program` | Giáo án | Program |
| `tabs.history` | Lịch sử | History |
| `tabs.label` | Tập luyện | Training |

## tech

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `tech.savedNotShown` | Dữ liệu đã được lưu an toàn. Phần hiển thị chưa cập nhật; bạn có thể tải lại trang. Mã hỗ trợ: {code}. | Your data is saved. The screen hasn't caught up; you can reload the page. Support code: {code}. |
| `tech.failed` | Chưa thể hoàn tất thao tác lúc này. Dữ liệu bạn vừa nhập vẫn được giữ nguyên. Hãy thử lại hoặc gửi David mã {code}. | This couldn't be completed right now. What you entered is kept. Try again, or send David the code {code}. |

## notes

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `notes.justNow` | Vừa xong | Just now |
| `notes.eyebrow` | NHẬT KÝ BÀI TẬP | EXERCISE LOG |
| `notes.history` | Xem lịch sử của bài tập này | See this exercise’s history |
| `notes.label` | Điều bạn muốn ghi lại | What you want to note |
| `notes.placeholder` | Cảm nhận kỹ thuật, điểm còn vướng hoặc điều cần điều chỉnh lần sau… | How the technique felt, what still feels off, or what to adjust next time… |
| `notes.visibility` | Ai có thể xem | Who can see it |
| `notes.shared` | Chia sẻ với học viên | Shared with the client |
| `notes.private` | Riêng tư — chỉ David | Private — David only |
| `notes.cancelReply` | Hủy phản hồi | Cancel reply |
| `notes.send` | Gửi ghi chú | Send note |
| `notes.privateTag` | Riêng tư | Private |
| `notes.reply` | Phản hồi | Reply |
| `notes.clientLower` | học viên | client |
| `notes.coachHint` | Ghi chú chia sẻ chỉ hiện với đúng học viên này. Ghi chú riêng tư chỉ David nhìn thấy. | Shared notes are shown only to this client. Private notes are seen only by David. |
| `notes.clientHint` | Phản hồi này chỉ được chia sẻ với David, không hiển thị cho học viên khác. | This feedback is shared only with David and isn't shown to other clients. |
| `notes.loading` | Đang tải nhật ký… | Loading the log… |
| `notes.loadFailed` | Chưa thể tải ghi chú. Kiểm tra kết nối rồi thử lại. | Notes couldn't load. Check your connection and try again. |
| `notes.empty` | Hãy nhập nội dung trước khi gửi. | Write something before sending. |
| `notes.sentClient` | Đã gửi phản hồi cho David. | Feedback sent to David. |
| `notes.savedCoach` | Đã lưu ghi chú. | Note saved. |
| `notes.sendClient` | Gửi cho David | Send to David |
| `notes.saveCoach` | Lưu ghi chú | Save note |
| `notes.exerciseLog` | Nhật ký riêng của bài tập | This exercise’s own log |
| `notes.noneSession` | Chưa có ghi chú nào trong buổi này. | No notes in this session yet. |
| `notes.nonePast` | Chưa có ghi chú từ các buổi trước. | No notes from earlier sessions yet. |
| `notes.replyingTo` | Đang phản hồi {name} | Replying to {name} |
| `notes.sendFailed` | Chưa thể gửi ghi chú: {error} | Couldn't send the note: {error} |

## ladder

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `ladder.sets.label` | Tăng set | Add sets |
| `ladder.sets.hint` | Đạt đủ rep ở mọi set thì buổi sau thêm set. | Hit the reps on every set and the next session adds a set. |
| `ladder.reps.label` | Tăng rep | Add reps |
| `ladder.reps.hint` | Đạt đủ rep ở mọi set thì buổi sau tăng rep. | Hit the reps on every set and the next session adds reps. |
| `ladder.weight.label` | Tăng tạ | Add weight |
| `ladder.weight.hint` | Đạt đủ rep ở mọi set thì buổi sau tăng tạ và quay về số set, rep ban đầu. | Hit the reps on every set and the next session adds weight and goes back to the starting sets and reps. |

## program

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `program.giao_an_david_coaching` | Giáo án — David Coaching | Program — David Coaching |
| `program.giao_an` | Giáo án | Program |
| `program.quay_lai` | ◀ Quay lại | ◀ Back |
| `program.dang_xuat` | Đăng xuất | Log out |
| `program.dang_tai` | Đang tải | Loading |
| `program.giao_an_cua_ban` | Giáo án của bạn | Your program |
| `program.toan_bo_cac_buoi_va_bai` | Toàn bộ các buổi và bài tập David đã chuẩn bị cho chu kỳ này. | Every session and exercise David has prepared for this cycle. |
| `program.muc_tap_o_day_la_muc` | Mức tập ở đây là mức dự kiến cho buổi kế tiếp. Hệ thống tự điều chỉnh sau mỗi buổi bạn ghi nhận, nên con số có thể thay đổi theo kết quả của bạn. | The levels here are planned for your next session. They adjust after every session you save, so the numbers can change with your results. |
| `program.perWeek` | {n} lần / tuần | one: {n}× / week<br>other: {n}× / week |
| `program.from` | từ  | from  |
| `program.howTo` | Cách làm | How to do it |
| `program.video` | Xem video | Watch video |
| `program.sessionsPerWeek` | {n} buổi / tuần | one: {n} session / week<br>other: {n} sessions / week |
| `program.sessionsPerWeekUnit` | buổi / tuần | one: session / week<br>other: sessions / week |
| `program.starts` | Bắt đầu | Starts |
| `program.week` | Tuần | Week |
| `program.weekOf` | Tuần {n} trên {total} | Week {n} of {total} |
| `program.startedOn` | Bắt đầu {date} | Started {date} |
| `program.pastEnd` | đã qua ngày kết thúc dự kiến {date} ({n} tuần) | one: past the planned end, {date} ({n} week)<br>other: past the planned end, {date} ({n} weeks) |
| `program.endsOn` | kết thúc dự kiến {date} | planned end {date} |
| `program.nextSession` | Buổi kế tiếp | Next session |
| `program.pausedNote` | David đang tạm tắt buổi này. Bạn không cần tập cho tới khi David mở lại. | David has paused this session. You don't need to do it until David turns it back on. |
| `program.tapHint` | Chạm vào một bài để xem cách làm. | Tap an exercise to see how it is done. |
| `program.loadFailed` | Chưa tải được giáo án lúc này. Kiểm tra kết nối rồi thử lại. | Your program couldn't load right now. Check your connection and try again. |

## overview

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `overview.pyramid` | {n} set: {sets} kg{per} | one: {n} set: {sets} kg{per}<br>other: {n} sets: {sets} kg{per} |
| `overview.bodyweight` | Tạ cơ thể | Bodyweight |
| `overview.original` | {load} · {reps} rep mỗi set · {lo}–{hi} set | {load} · {reps} reps per set · {lo}–{hi} sets |
| `overview.default` | {load} · {sets} set × {reps} rep | {load} · {sets} sets × {reps} reps |

## history

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `history.lich_su_tap_luyen_david_coaching` | Lịch sử tập luyện — David Coaching | Training history — David Coaching |
| `history.lich_su_tap_luyen` | Lịch sử tập luyện | Training history |
| `history.buoi_tap` | ◀ Buổi tập | ◀ Session |
| `history.dang_xuat` | Đăng xuất | Log out |
| `history.dang_tai` | Đang tải | Loading |
| `history.ban_da_tap_nhung_gi` | Bạn đã tập những gì | What you've trained |
| `history.toan_bo_buoi_tap_da_ghi` | Toàn bộ buổi tập đã ghi nhận — đúng những gì bạn nhập, không thêm bớt. | Every session you saved — exactly what you entered, nothing added or removed. |
| `history.tim_va_loc_lich_su` | Tìm và lọc lịch sử | Search and filter history |
| `history.tim_theo_ten_bai_tap` | Tìm theo tên bài tập… | Search by exercise name… |
| `history.loc_lich_su` | Lọc lịch sử | Filter history |
| `history.tat_ca` | Tất cả | All |
| `history.co_phan_hoi` | Có phản hồi | With feedback |
| `history.co_ky_luc` | Có kỷ lục | With records |
| `history.co_dieu_chinh_bo_bai` | Có điều chỉnh / bỏ bài | With changes / skips |
| `history.mo_mot_buoi_de_xem_chi` | Mở một buổi để xem chi tiết | Open a session to see the details |
| `history.xem_them_5_buoi` | Xem thêm 5 buổi | Show 5 more sessions |
| `history.outcome.up` | Tiến bộ | Progressed |
| `history.outcome.sub` | Đã đổi bài | Swapped |
| `history.outcome.skipped` | Bỏ qua do thể trạng | Skipped (how you felt) |
| `history.none` | Chưa có buổi nào | No sessions yet |
| `history.records` | Kỷ lục | Records |
| `history.perSession` | Mỗi buổi | Per session |
| `history.saved` | buổi đã ghi | one: session saved<br>other: sessions saved |
| `history.latest` | Gần nhất: <strong>{date} · Buổi {day}</strong> | Latest: <strong>{date} · Session {day}</strong> |
| `history.loadFailed` | Chưa thể tải lịch sử lúc này. Kiểm tra mạng rồi thử lại. | Your history can't load right now. Check your connection and try again. |
| `history.extra` |  (tập thêm) |  (extra) |
| `history.sameLoad` | {kg} kg{per} × {n} set — rep: {reps} | one: {kg} kg{per} × {n} set — reps: {reps}<br>other: {kg} kg{per} × {n} sets — reps: {reps} |
| `history.lastRir` |  (RIR set cuối: {n}) |  (last-set RIR: {n}) |
| `history.matching` | {n} buổi phù hợp | one: {n} matching session<br>other: {n} matching sessions |
| `history.noMatch` | Không có buổi nào khớp | No matching sessions |
| `history.noMatchCopy` | Không có buổi tập nào khớp tìm kiếm hoặc bộ lọc này. | No session matches this search or filter. |
| `history.clear` | Xoá tìm kiếm và bộ lọc | Clear search and filter |
| `history.noSessions` | Chưa có buổi tập nào | No sessions yet |
| `history.goTrain` | Vào Buổi tập | Go to Session |
| `history.endedEarly` | Kết thúc sớm | Ended early |
| `history.skippedOnly` | Bỏ qua trong riêng buổi này — không ảnh hưởng tiến trình | Skipped in this session only — doesn't affect progress |
| `history.rest` |  · Nghỉ {n} giây |  · Rest {n} s |
| `history.reason` |  · Lý do: {reason} |  · Reason: {reason} |
| `history.adjusted` |  · Hôm đó điều chỉnh còn {n} set | one:  · Reduced to {n} set that day<br>other:  · Reduced to {n} sets that day |
| `history.record` | Kỷ lục | Record |
| `history.plan` | Kế hoạch: {plan} · Không cập nhật tiến trình | Plan: {plan} · Progress not updated |
| `history.did` | Bạn đã tập: {what} | You did: {what} |
| `history.yourNote` | Ghi chú của bạn: "{note}" | Your note: "{note}" |
| `history.coachNote` | David nhắn: "{note}" | David says: "{note}" |

## hview

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `hview.set` | Set | Set |
| `hview.plan` | Kế hoạch | Plan |
| `hview.done` | Đã tập | Done |
| `hview.missed` | chưa tập | not done |
| `hview.short` | thiếu {n} | {n} short |
| `hview.total` | Tổng {done} / {target} rep | Total {done} / {target} reps |
| `hview.per` | Số kg là {per}. | Weights are {per}. |
| `hview.records` | {n} kỷ lục | one: {n} record<br>other: {n} records |
| `hview.progressed` | {n} tiến bộ | {n} progressed |
| `hview.volume` | Khối lượng {v} | Volume {v} |

## progress

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `progress.anh_tien_trinh_david_coaching` | Ảnh tiến trình — David Coaching | Progress photos — David Coaching |
| `progress.anh_tien_trinh` | Ảnh tiến trình | Progress photos |
| `progress.quay_lai` | ◀ Quay lại | ◀ Back |
| `progress.dang_xuat` | Đăng xuất | Log out |
| `progress.dang_tai` | Đang tải | Loading |
| `progress.tien_trinh_cua_ban` | Tiến trình của bạn | Your progress |
| `progress.anh_tien_trinh_cua_ban` | Ảnh tiến trình của bạn | Your progress photos |
| `progress.chup_deu_dan_moi_vai_tuan` | Chụp đều đặn mỗi vài tuần để thấy rõ thay đổi — tạ có thể chưa đổi nhiều nhưng hình dáng thì có. | Take photos every few weeks to see the change clearly — the weights may not have moved much, but your shape has. |
| `progress.thanh_tuu` | Thành tựu | Milestones |
| `progress.noi_dung_tien_trinh` | Nội dung tiến trình | Progress sections |
| `progress.tong_quan` | Tổng quan | Overview |
| `progress.so_do` | Số đo | Measurements |
| `progress.anh` | Ảnh | Photos |
| `progress.can_nang_co_the` | Cân nặng cơ thể | Body weight |
| `progress.xem_tat_ca_lan_can` | Xem tất cả lần cân | See all weigh-ins |
| `progress.chua_co_so_can_nao` | Chưa có số cân nào | No weigh-ins yet |
| `progress.ghi_can_o_dinh_duong` | Ghi cân ở Dinh dưỡng | Log weight in Nutrition |
| `progress.ghi_bu_ngay_truoc` | + Ghi bù ngày trước | + Log a past day |
| `progress.can_hang_ngay_ghi_o_trang` | Cân hằng ngày ghi ở trang Dinh dưỡng. Ở đây ghi bù ngày quên; ngày đã có số thì số mới thay số cũ. | Daily weigh-ins are logged in Nutrition. Here you can fill in a day you missed; a day that already has a number gets the new one instead. |
| `progress.can_nang_kg` | Cân nặng (kg) | Weight (kg) |
| `progress.ngay_can` | Ngày cân | Weigh-in date |
| `progress.luu` | Lưu | Save |
| `progress.so_do_vong` | Số đo vòng | Body measurements |
| `progress.nhap_so_do_moi` | + Nhập số đo mới | + Add new measurements |
| `progress.so_do_cho_thay_thay_doi` | Số đo cho thấy thay đổi mà cân nặng không thấy. Đo cùng một chỗ, cùng một giờ mỗi lần. Mỗi lần đo không cần đủ mọi điểm — chỉ nhập những điểm bạn đã đo. | Measurements show changes the scale doesn't. Measure the same spot at the same time each time. You don't need every point each time — enter only the ones you measured. |
| `progress.ngay_do` | Ngày đo | Measurement date |
| `progress.luu_so_do` | Lưu số đo | Save measurements |
| `progress.suc_manh` | Sức mạnh | Strength |
| `progress.ta_nang_nhat_moi_buoi_cua` | Tạ nặng nhất mỗi buổi của những bài bạn tập nhiều nhất, từ lần đầu đến hiện tại. | The heaviest load each session on the exercises you train most, from the first time until now. |
| `progress.them_anh` | + Thêm ảnh | + Add photos |
| `progress.them_anh_moi` | Thêm ảnh mới | Add new photos |
| `progress.anh_chon_duoc_nhieu_anh_cung` | Ảnh (chọn được nhiều ảnh cùng lúc) | Photos (you can pick several at once) |
| `progress.goc_cua_anh_dau_tien` | Góc của ảnh đầu tiên | Angle of the first photo |
| `progress.front_chinh_dien` | Front — chính diện | Front — facing the camera |
| `progress.side_ben_hong` | Side — bên hông | Side — from the side |
| `progress.back_phia_sau` | Back — phía sau | Back — from behind |
| `progress.ngay_chup` | Ngày chụp | Date taken |
| `progress.ghi_chu_tuy_chon_ap_dung` | Ghi chú (tuỳ chọn, áp dụng cho tất cả ảnh vừa chọn) | Note (optional, applies to every photo you picked) |
| `progress.vd_sau_4_tuan_can_nang` | VD: sau 4 tuần, cân nặng 62kg… | E.g. after 4 weeks, weight 62 kg… |
| `progress.tai_anh_len` | Tải ảnh lên | Upload photos |
| `progress.thu_vien_anh` | Thư viện ảnh | Photo library |
| `progress.so_sanh_2_anh` | So sánh 2 ảnh | Compare 2 photos |
| `progress.chon_2_anh_bat_ky_de` | Chọn 2 ảnh bất kỳ để so sánh cạnh nhau. | Pick any 2 photos to compare side by side. |
| `progress.so_sanh` | So sánh | Compare |
| `progress.chua_co_anh_nao_them_anh` | Chưa có ảnh nào — thêm ảnh đầu tiên ở trên nhé. | No photos yet — add your first one above. |
| `progress.goc_chup` | Góc chụp | Angle |
| `progress.chua_phan_loai` | Chưa phân loại | Unsorted |
| `progress.dong` | Đóng | Close |
| `progress.xoa_anh_nay` | Xoá ảnh này | Delete this photo |
| `progress.weighEmptyCopy` | Cân mỗi sáng ở trang Dinh dưỡng; từ 4 lần mỗi tuần là thấy được xu hướng. | Weigh yourself each morning in Nutrition; 4 times a week is enough to see the trend. |
| `progress.openFromCoach` | Mở trang này từ hồ sơ học viên trong Bảng điều khiển Coach. | Open this page from the client's profile in the Coach dashboard. |
| `progress.noAccess` | Không tìm thấy học viên này, hoặc bạn không có quyền xem. | This client wasn't found, or you don't have access. |
| `progress.photosOf` | Ảnh tiến trình của {name} | {name}'s progress photos |
| `progress.startTracking` | Bắt đầu theo dõi | Start tracking |
| `progress.startTrackingCopy` | Ghi cân mỗi sáng ở trang Dinh dưỡng. Cân đều từ 4 lần mỗi tuần để thấy xu hướng. | Log your weight each morning in Nutrition. Weigh in at least 4 times a week to see the trend. |
| `progress.weigh4` | Cân đều từ 4 lần mỗi tuần để thấy xu hướng. | Weigh in at least 4 times a week to see the trend. |
| `progress.weekAvg` | Trung bình tuần <strong>{avg} kg</strong> · <strong>{d} kg</strong> so với tuần trước. | Weekly average <strong>{avg} kg</strong> · <strong>{d} kg</strong> vs last week. |
| `progress.milestones` | Mốc | Milestones |
| `progress.daysInRow` |  ngày liền | one:  day in a row<br>other:  days in a row |
| `progress.noPhotosAngle` | Chưa có ảnh nào ở góc này. | No photos at this angle yet. |
| `progress.photoAlt` | Ảnh tiến trình {date} | Progress photo {date} |
| `progress.seeAllDays` | Xem tất cả {n} ngày cân | one: See all {n} weigh-in day<br>other: See all {n} weigh-in days |
| `progress.weightInvalid` | Nhập cân nặng hợp lệ. | Enter a valid weight. |
| `progress.pickWeighDate` | Chọn ngày cân. | Choose the weigh-in date. |
| `progress.updatedDay` | Đã sửa ngày này: {from} → {to} kg. | Updated this day: {from} → {to} kg. |
| `progress.saved` | Đã lưu. | Saved. |
| `progress.saveError` | Lỗi khi lưu: {error} | Error saving: {error} |
| `progress.angleSaveError` | Chưa lưu được góc chụp: {error} | Couldn't save the angle: {error} |
| `progress.deleteConfirm` | Xoá ảnh này? Không thể hoàn tác. | Delete this photo? This can't be undone. |
| `progress.deletePhoto` | Xoá ảnh | Delete photo |
| `progress.noStoragePath` | Ảnh cũ đang thiếu đường dẫn Storage nên chưa thể xóa an toàn. | This older photo has no Storage path, so it can't be deleted safely yet. |
| `progress.deleteError` | Lỗi khi xoá ảnh: {error} | Error deleting the photo: {error} |
| `progress.cancelCompare` | Huỷ so sánh | Cancel comparing |
| `progress.q.busy` | Đang xử lý… | Processing… |
| `progress.q.done` | ✓ Đã lưu | ✓ Saved |
| `progress.q.error` | Lỗi | Error |
| `progress.maxPhotos` | Mỗi lần tải tối đa {n} ảnh — mình lấy {n} ảnh đầu, phần còn lại bạn chọn ở lần sau. | Up to {n} photos per upload — the first {n} are taken; pick the rest next time. |
| `progress.slowUpload` | Tải ảnh lên quá lâu — kiểm tra kết nối mạng rồi thử lại. | The upload is taking too long — check your connection and try again. |
| `progress.slowUrl` | Lấy đường dẫn ảnh quá lâu — thử lại sau ít phút. | Getting the photo link is taking too long — try again in a few minutes. |
| `progress.pickPhoto` | Chọn ít nhất một ảnh trước đã. | Pick at least one photo first. |
| `progress.pickPhotoDate` | Chọn ngày chụp. | Choose the date taken. |
| `progress.pickAngle` | Chọn góc chụp: Front, Side hoặc Back cho từng ảnh. | Choose an angle — Front, Side or Back — for each photo. |
| `progress.uploading` | Đang tải ảnh {i}/{n}… (đừng đóng trang) | Uploading photo {i}/{n}… (don't close the page) |
| `progress.uploadFailed` | Không tải được | Upload failed |
| `progress.partial` | Đã lưu {saved}/{n} ảnh. {failed} ảnh chưa tải được — bấm "Tải ảnh lên" để thử lại những ảnh đó. | Saved {saved}/{n} photos. {failed} didn't upload — tap "Upload photos" to retry them. |
| `progress.savedN` | Đã lưu {n} ảnh. | Saved {n} photos. |
| `progress.savedNext` | Đã lưu. Góc tiếp theo đã được chọn sẵn. | Saved. The next angle is already selected. |
| `progress.pickMeasureDate` | Chọn ngày đo. | Choose the measurement date. |

## measure

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `measure.site.chestCm` | Ngực / Lưng | Chest / back |
| `measure.site.armLeftCm` | Tay trái | Left arm |
| `measure.site.armRightCm` | Tay phải | Right arm |
| `measure.site.waistAboveCm` | Trên rốn 5cm | 5 cm above the navel |
| `measure.site.waistCm` | Ngang rốn | At the navel |
| `measure.site.waistBelowCm` | Dưới rốn 5cm | 5 cm below the navel |
| `measure.site.hipsCm` | Hông | Hips |
| `measure.site.thighLeftCm` | Đùi trái | Left thigh |
| `measure.site.thighRightCm` | Đùi phải | Right thigh |
| `measure.group.chest` | Ngực / Lưng | Chest / back |
| `measure.group.arms` | Tay | Arms |
| `measure.group.waist` | Bụng | Waist |
| `measure.group.hips` | Hông | Hips |
| `measure.group.legs` | Chân | Legs |
| `measure.range` | Nhập {site} từ {min} đến {max} cm. | Enter {site} between {min} and {max} cm. |
| `measure.none` | Nhập ít nhất một số đo. | Enter at least one measurement. |

## ms

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `ms.firstSession` | Buổi tập đầu tiên | First session |
| `ms.sessions` | {n} buổi tập | {n} sessions |
| `ms.weeks` | {n} tuần tập liên tục | {n} weeks in a row |
| `ms.habit` | {n} ngày thói quen liên tục | {n}-day habit streak |
| `ms.photoFirst` | Ảnh tiến trình đầu tiên | First progress photo |
| `ms.photoSet` | Đủ 3 góc Front · Side · Back | All 3 angles: Front · Side · Back |
| `ms.weighWeek` | Một tuần cân đủ 4 lần | A week with 4 weigh-ins |
| `ms.waistFirst` | Bắt đầu theo dõi số đo vòng | Started tracking measurements |
| `ms.strengthUp` | Nâng nặng hơn lần đầu | Lifted heavier than the first time |

## upload

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `upload.noFile` | Chưa chọn ảnh. | No photo chosen. |
| `upload.notImage` | "{name}" không phải là ảnh. | "{name}" is not a photo. |
| `upload.unreadable` | Không đọc được định dạng ảnh "{name}" để thu nhỏ, và ảnh gốc lớn hơn {max}. Hãy chụp lại ở dạng JPEG hoặc chọn ảnh khác. | Can't read the format of "{name}" to shrink it, and the original is larger than {max}. Retake it as a JPEG or pick another photo. |

## pv

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `pv.noWeight` | Chưa có số cân nào. | No weigh-ins yet. |
| `pv.latest` | Cân gần nhất <strong>{kg} kg</strong> ({date}). | Latest weigh-in <strong>{kg} kg</strong> ({date}). |
| `pv.thisWeek` | Trung bình tuần này <strong>{avg} kg</strong> — <strong>{d} kg</strong> so với tuần trước. | This week's average <strong>{avg} kg</strong> — <strong>{d} kg</strong> vs last week. |
| `pv.sinceLabel` | Từ tuần đầu ({date}) · {n} tuần | one: Since week one ({date}) · {n} week<br>other: Since week one ({date}) · {n} weeks |
| `pv.sinceSub` | Trung bình tuần {d1}: {a1} kg → tuần {d2}: {a2} kg | Week of {d1} average: {a1} kg → week of {d2}: {a2} kg |
| `pv.lgLine` | Trung bình mỗi tuần | Weekly average |
| `pv.lgDot` | Từng lần cân | Each weigh-in |
| `pv.lgHollow` | Tuần cân dưới 4 lần | Week with under 4 weigh-ins |
| `pv.notEnough` | Chưa đủ dữ liệu | Not enough data |
| `pv.need2Weeks` | Cần số cân của ít nhất 2 tuần để vẽ xu hướng | Needs weigh-ins from at least 2 weeks to draw the trend |
| `pv.chartAria` | Cân nặng trung bình theo tuần | Weekly average body weight |
| `pv.noStrength` | Chưa đủ dữ liệu sức mạnh | Not enough strength data yet |
| `pv.noStrengthCopy` | Cần ít nhất 2 buổi tập có tạ cho cùng một bài để thấy tiến bộ sức mạnh. | You need at least 2 weighted sessions of the same exercise to see strength progress. |
| `pv.strengthFoot` | {n} buổi · tốt nhất {best} kg{per} | one: {n} session · best {best} kg{per}<br>other: {n} sessions · best {best} kg{per} |
| `pv.noMilestones` | Chưa có mốc nào — buổi tập hay lần chụp ảnh đầu tiên sẽ mở mốc đầu tiên của bạn. | No milestones yet — your first session or first photo unlocks one. |
| `pv.seeEarned` | Xem các mốc đã đạt ({n}) | See earned milestones ({n}) |
| `pv.earnedOf` | <strong>{n}</strong> / {total} mốc đã đạt | <strong>{n}</strong> / {total} milestones earned |
| `pv.remaining` | còn {n} | {n} to go |
| `pv.all` | Tất cả | All |
| `pv.firstAlt` | {angle} ngày đầu | {angle}, first day |
| `pv.firstDay` | Ngày đầu | First day |
| `pv.latestAlt` | {angle} mới nhất | {angle}, latest |
| `pv.after` | Sau {n} ngày | one: After {n} day<br>other: After {n} days |
| `pv.beforeAfter` | Trước và sau | Before and after |
| `pv.beforeAfterCopy` | Ảnh đầu tiên và ảnh mới nhất của từng góc. | The first and the latest photo of each angle. |
| `pv.noMeasure` | Chưa có số đo nào. Đo cùng một chỗ, cùng một giờ mỗi lần. | No measurements yet. Measure the same spot at the same time each time. |
| `pv.since` | từ {date} | since {date} |
| `pv.arrowNote` | Mũi tên là thay đổi từ lần đo đầu tiên của từng điểm đến lần đo mới nhất. | The arrow is the change from the first to the latest measurement of each point. |

## guide

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `guide.angle.front` | Front — chụp chính diện | Front — facing the camera |
| `guide.angle.side` | Side — chụp bên hông | Side — from the side |
| `guide.angle.back` | Back — chụp từ phía sau | Back — from behind |
| ⚠ `guide.photoTitle` | Cách chụp ảnh 3 góc (Front · Side · Back) | How to take the 3 angles (Front · Side · Back) |
| `guide.measureTitle` | Cách lấy số đo vòng | How to take body measurements |
| `guide.weightTitle` | Cách cân trên cân điện tử | How to weigh yourself on a digital scale |

## habits

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `habits.thoi_quen_david_coaching` | Thói quen — David Coaching | Habits — David Coaching |
| `habits.thoi_quen` | Thói quen | Habits |
| `habits.quay_lai` | ◀ Quay lại | ◀ Back |
| `habits.dang_xuat` | Đăng xuất | Log out |
| `habits.dang_tai` | Đang tải | Loading |
| `habits.thoi_quen_hom_nay` | Thói quen hôm nay | Today's habits |
| `habits.thoi_quen_cua_ban` | Thói quen của bạn | Your habits |
| `habits.it_thoi_quen_lam_deu_moi` | Ít thói quen, làm đều mỗi ngày — quan trọng hơn làm nhiều. | Few habits, done every day — that matters more than doing a lot. |
| `habits.noi_dung_thoi_quen` | Nội dung thói quen | Habit sections |
| `habits.theo_doi` | Theo dõi | Track |
| `habits.thiet_lap` | Thiết lập | Set up |
| `habits.cam_nang` | Cẩm nang | Handbook |
| `habits.msgFull` | Xong. Thêm một lá phiếu cho kiểu người bạn muốn trở thành. | Done. One more vote for the person you want to become. |
| `habits.msgMin` | Bản 2 phút cũng tính — bạn đã xuất hiện, và đó là điều quan trọng nhất. | The 2-minute version counts — you showed up, and that matters most. |
| `habits.msgMissed1` | Hôm qua bỏ lỡ một ngày — không sao. Chỉ cần đừng bỏ lỡ hai lần liên tiếp. | You missed yesterday — that's okay. Just don't miss twice in a row. |
| `habits.msgMissedN` | Đã {n} ngày liền chưa ghi. Hôm nay quay lại bằng bản 2 phút là đủ. | {n} days in a row without a log. Coming back today with the 2-minute version is enough. |
| `habits.cell.before` | trước khi bắt đầu | before starting |
| `habits.cell.full` | xong | done |
| `habits.cell.min` | bản 2 phút | 2-minute version |
| `habits.cell.none` | chưa ghi | not logged |
| `habits.doneBtn` | Đã xong | Done |
| `habits.minBtn` | Bản 2 phút | 2-minute version |
| `habits.minHint` | Bản 2 phút: {text} | 2-minute version: {text} |
| `habits.missedRow` | Bỏ lỡ {n} ngày liền. | Missed {n} days in a row. |
| `habits.streakDays` | ngày liên tục | one: day in a row<br>other: days in a row |
| `habits.last5Weeks` | 5 tuần gần đây | Last 5 weeks |
| `habits.legendFull` | Xong {n} | Done {n} |
| `habits.legendMin` | Bản 2 phút {n} | 2-minute {n} |
| `habits.legend7` | 7 ngày gần nhất: {done}/{n} | Last 7 days: {done}/{n} |
| `habits.coachEmpty` | Chưa thiết lập thói quen | No habits set up |
| `habits.coachEmptyCopy` | Học viên này chưa chọn thói quen nào để theo dõi. | This client hasn't chosen any habits to track yet. |
| `habits.startSmall` | Bắt đầu với một thói quen nhỏ | Start with one small habit |
| `habits.startSmallCopy` | Chọn 1–3 việc đơn giản, rõ ràng và làm đều mỗi ngày. Mỗi việc có một phiên bản 2 phút cho ngày bận. | Choose 1–3 simple, clear things and do them every day. Each one has a 2-minute version for busy days. |
| `habits.setUp` | Thiết lập thói quen | Set up habits |
| `habits.identityLead` | Tôi là kiểu người | I am the kind of person who |
| `habits.pickDay` | Chọn ngày ghi | Choose the day to log |
| `habits.yesterday` | Hôm qua | Yesterday |
| `habits.loggedToday` | {done}/{n} thói quen đã ghi hôm nay. | {done}/{n} habits logged today. |
| `habits.loggedYesterday` | {done}/{n} thói quen đã ghi hôm qua. | {done}/{n} habits logged yesterday. |
| `habits.pickFirst` | Chọn thói quen đầu tiên | Choose your first habit |
| `habits.pickFirstCopy` | Chọn 1–3 việc đơn giản và làm đều mỗi ngày. Mỗi việc có một bản 2 phút cho ngày bận. | Choose 1–3 simple things and do them every day. Each one has a 2-minute version for busy days. |
| `habits.whenToday` | đã ghi hôm nay | logged today |
| `habits.whenYesterday` | đã ghi hôm qua | logged yesterday |
| `habits.editor.n` | Thói quen {n} | Habit {n} |
| `habits.editor.remove` | Bỏ thói quen này | Remove this habit |
| `habits.f.name` | Việc bạn sẽ làm | What you will do |
| `habits.f.namePh` | Ăn đủ protein ở bữa sáng | Eat enough protein at breakfast |
| `habits.f.nameHint` | Cụ thể và làm được ngay, không phải mục tiêu lớn. | Specific and doable right away — not a big goal. |
| `habits.f.cue` | Khi nào, ở đâu? | When and where? |
| `habits.f.cuePh` | Sau khi đánh răng, tại bếp nhà mình | After brushing my teeth, in my kitchen |
| `habits.f.cueHint` | Dạng “Sau khi… tôi sẽ…” hoặc “Vào lúc… tại…”. | Like “After I…, I will…” or “At… in…”. |
| `habits.f.min` | Phiên bản 2 phút (cho ngày bận hoặc mệt) | 2-minute version (for busy or tired days) |
| `habits.f.minPh` | Uống một ly sữa | Drink a glass of milk |
| `habits.f.minHint` | Bản nhỏ đến mức không thể bỏ qua. | So small you can't skip it. |
| `habits.f.reward` | Phần thưởng nhỏ (tuỳ chọn) | Small reward (optional) |
| `habits.f.rewardPh` | Đánh dấu vào bảng theo dõi | Tick it off on the tracker |
| `habits.errorsLead` | Cần bổ sung trước khi lưu: | Fill these in before saving: |
| `habits.identityLabel` | Tôi là kiểu người… | I am the kind of person who… |
| `habits.identityPh` | chăm sóc cơ thể mình mỗi ngày, kể cả ngày bận | takes care of my body every day, even on busy days |
| `habits.identityHint` | Mỗi lần làm một thói quen là một lá phiếu cho kiểu người này. | Every time you do a habit is a vote for this kind of person. |
| `habits.countOf` | {n}/{max} thói quen | {n}/{max} habits |
| `habits.enough` | Mới bắt đầu thì 1–2 thói quen là đủ. | When starting out, 1–2 habits are enough. |
| `habits.few` | Ít thói quen, làm đều — hiệu quả hơn làm nhiều. | Few habits, done consistently — works better than doing a lot. |
| `habits.add` | + Thêm thói quen | + Add a habit |
| `habits.save` | Lưu thói quen | Save habits |
| `habits.full` | Đã đủ {max} thói quen. Muốn thêm, hãy bỏ bớt một thói quen trước. | You have {max} habits. To add another, remove one first. |
| `habits.thisHabit` | thói quen này | this habit |
| `habits.removeConfirm` | Bỏ {label}? Chuỗi ngày của thói quen này sẽ không còn hiển thị. | Remove {label}? This habit's streak will no longer show. |
| `habits.removeOk` | Bỏ thói quen | Remove habit |
| `habits.saved` | Đã lưu thói quen của bạn. | Your habits are saved. |
| `habits.loadFailed` | Chưa tải được thói quen lúc này. Kiểm tra kết nối rồi thử lại. | Your habits couldn't load right now. Check your connection and try again. |
| `habits.retry` | Thử lại | Try again |
| `habits.of` | Thói quen của {name} | {name}'s habits |
| `habits.coachSub` | Học viên tự thiết lập và tự ghi. Bạn chỉ xem được, không ghi thay được. | The client sets these up and logs them. You can view them but can't log for them. |
| `habits.status` | Tình hình | Status |

## hb

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `hb.coachNote` | Ghi chú cho Coach · {title} | Note for the coach · {title} |
| `hb.struggling` | Tôi đang vật lộn với… | I’m struggling with… |
| `hb.part` | Phần {id} | Part {id} |
| ⚠ `hb.title` | Thay đổi hành vi, thay đổi cuộc sống | Change your behaviour, change your life |
| `hb.sub` | Cẩm nang khoa học hành vi cho hành trình tập luyện và dinh dưỡng, biên soạn bởi David. | A behavioural-science handbook for your training and nutrition journey, written by David. |

## hu

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `hu.max` | Chỉ giữ tối đa {max} thói quen. | Keep at most {max} habits. |
| `hu.name` | cần ghi rõ việc bạn sẽ làm. | say clearly what you will do. |
| `hu.cue` | cần một tín hiệu (sau khi… hoặc vào lúc…). | needs a cue (after… or at…). |
| `hu.min` | cần phiên bản 2 phút cho ngày bận. | needs a 2-minute version for busy days. |

## nutrition

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `nutrition.ke_hoach_dinh_duong_david_coaching` | Kế hoạch dinh dưỡng — David Coaching | Nutrition plan — David Coaching |
| `nutrition.tao_ke_hoach` | Tạo kế hoạch | Build plan |
| `nutrition.quay_lai` | ← Quay lại | ← Back |
| `nutrition.dang_xuat` | Đăng xuất | Log out |
| `nutrition.dang_tai` | Đang tải | Loading |
| `nutrition.dinh_duong_hom_nay` | Dinh dưỡng hôm nay | Today's nutrition |
| `nutrition.ke_hoach_dinh_duong` | Kế hoạch dinh dưỡng | Nutrition plan |
| `nutrition.chua_co_ke_hoach_dinh_duong` | Chưa có kế hoạch dinh dưỡng | No nutrition plan yet |
| `nutrition.kcal_ngay` | kcal / ngày | kcal / day |
| `nutrition.chat_beo` | Chất béo | Fat |
| `nutrition.dang_tai_tuan_nay` | Đang tải tuần này… | Loading this week… |
| `nutrition.ke_hoach_da_giao` | Kế hoạch đã giao | Assigned plan |
| `nutrition.luu_y_cua_david` | Lưu ý của David | David's note |
| `nutrition.cuoi_ngay_va_theo_doi` | Cuối ngày và theo dõi | End of day and tracking |
| `nutrition.ghi_hom_nay` | Ghi hôm nay | Log today |
| `nutrition.vai_con_so_cho_david` | Vài con số cho David | A few numbers for David |
| `nutrition.bo_trong_o_nao_ban_khong` | Bỏ trống ô nào bạn không theo dõi cũng được. Cân nặng ghi ở thẻ “Cân buổi sáng”. | Leave blank anything you don't track. Weight goes in the “Morning weigh-in” card. |
| `nutrition.calo_da_an` | Calo đã ăn | Calories eaten |
| `nutrition.so_buoc_chan` | Số bước chân | Steps |
| `nutrition.ngu_1_5` | Ngủ (1–5) | Sleep (1–5) |
| `nutrition.nang_luong_1_5` | Năng lượng (1–5) | Energy (1–5) |
| `nutrition.muc_doi_1_5` | Mức đói (1–5) | Hunger (1–5) |
| `nutrition.luu_hom_nay` | Lưu hôm nay | Save today |
| `nutrition.da_luu` | Đã lưu. | Saved. |
| `nutrition.so_lieu_do_hoc_vien_tu` | Số liệu do học viên tự ghi. Bạn xem được nhưng không ghi thay được. | The client logs these numbers. You can view them but can't log for them. |
| `nutrition.kiem_tra_tien_trinh` | Kiểm tra tiến trình | Progress check |
| `nutrition.co_nen_doi_calo_chua` | Có nên đổi calo chưa? | Time to change calories? |
| `nutrition.chi_doc_trung_binh_tuan_khong` | Chỉ đọc trung bình tuần, không bao giờ đọc cân của một ngày. Cần ít nhất 2 tuần, mỗi tuần cân từ 4 lần. | Reads weekly averages only, never a single day's weight. Needs at least 2 weeks with 4+ weigh-ins each. |
| `nutrition.chay_kiem_tra` | Chạy kiểm tra | Run check |
| `nutrition.hoc_vien_da_ghi_14_ngay` | Học viên đã ghi · 14 ngày gần nhất | Client log · last 14 days |
| `nutrition.bao_cao_cua_hoc_vien` | Báo cáo của học viên | Client's report |
| `nutrition.chua_co_bao_cao` | Chưa có báo cáo. | No report yet. |
| `nutrition.xem_muc_tieu_nen_tang` | Xem mục tiêu nền tảng | See base targets |
| `nutrition.thuc_pham_bo_tro` | Thực phẩm bổ trợ | Supplements |
| `nutrition.supplement_david_da_chon` | Supplement David đã chọn | Supplements chosen by David |
| `nutrition.ke_hoach_phuc_vu_coaching_loi` | Kế hoạch phục vụ coaching lối sống và hiệu suất. Nếu có bệnh lý, đang mang thai hoặc dùng thuốc, hãy tham khảo bác sĩ hoặc chuyên gia dinh dưỡng lâm sàng. | This plan is for lifestyle and performance coaching. If you have a medical condition, are pregnant or take medication, check with a doctor or a clinical dietitian. |

## nu

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `nu.noAccount` | Tài khoản chưa được thiết lập trong hệ thống. | This account is not set up in the system. |
| `nu.pickClient` | Hãy quay lại bảng điều khiển và chọn một học viên trước. | Go back to the dashboard and pick a client first. |
| `nu.noClient` | Không tìm thấy hồ sơ học viên. | The client's profile wasn't found. |
| `nu.noRights` | Bạn không có quyền quản lý học viên này. | You don't have access to this client. |
| `nu.forClient` | Dành cho học viên | For the client |
| `nu.yourPlan` | Kế hoạch của bạn | Your plan |
| `nu.nutritionFor` | Dinh dưỡng cho {name} | Nutrition for {name} |
| `nu.howToday` | Hôm nay ăn thế nào? | How are you eating today? |
| `nu.hello` | Xin chào {name} | Hello {name} |
| `nu.loadError` | Không thể tải dữ liệu dinh dưỡng: {error} | Couldn't load the nutrition data: {error} |
| `nu.latestWeight` | Cân gần nhất: {kg} kg | Latest weigh-in: {kg} kg |
| `nu.loading` | Đang tải… | Loading… |
| `nu.partialLoad` | Chưa tải đủ dữ liệu. Kiểm tra kết nối rồi tải lại trang. | Not all data loaded. Check your connection and reload the page. |
| `nu.rem.onTitle` | Đang bật nhắc | Reminder is on |
| `nu.rem.onCopy` | Nếu đến 20:00 bạn chưa ghi bữa nào, app sẽ nhắc bạn một lần. | If you haven't logged a meal by 20:00, the app reminds you once. |
| `nu.rem.turnOff` | Tắt nhắc | Turn off |
| `nu.rem.offTitle` | Nhắc tôi ghi bữa | Remind me to log meals |
| `nu.rem.offCopy` | Mỗi tối 20:00, nếu hôm nay bạn chưa ghi bữa nào, app nhắc một lần. Ghi rồi thì không nhắc. | Every evening at 20:00, if you haven't logged a meal today, the app reminds you once. No reminder once you've logged. |
| `nu.rem.turnOn` | Bật nhắc | Turn on |
| `nu.rem.deniedTitle` | Trình duyệt đang chặn thông báo | Your browser is blocking notifications |
| `nu.rem.deniedCopy` | Mở cài đặt của trình duyệt cho trang này, cho phép thông báo, rồi tải lại trang để bật nhắc. | Open your browser's settings for this site, allow notifications, then reload the page to turn the reminder on. |
| `nu.rem.title` | Nhắc ghi bữa | Meal reminder |
| `nu.rem.iphone` | Trên iPhone: bấm nút Chia sẻ, chọn "Thêm vào MH chính", rồi mở app từ màn hình chính để bật nhắc. | On iPhone: tap Share, choose "Add to Home Screen", then open the app from your home screen to turn the reminder on. |
| `nu.rem.unsupported` | Trình duyệt này chưa nhận được thông báo. Thử mở bằng Chrome để bật nhắc. | This browser can't receive notifications yet. Try opening it in Chrome to turn the reminder on. |
| `nu.rem.offDone` | Đã tắt nhắc ghi bữa. | Meal reminder turned off. |
| `nu.rem.onDone` | Đã bật nhắc lúc 20:00. | Reminder on at 20:00. |
| `nu.rem.failed` | Chưa bật được nhắc. Thử lại sau. | Couldn't turn the reminder on. Try again later. |
| `nu.meal.sang` | Sáng | Breakfast |
| `nu.meal.trua` | Trưa | Lunch |
| `nu.meal.toi` | Tối | Dinner |
| `nu.meal.phu` | Bữa phụ | Snack |
| `nu.protein` | Đạm | Protein |
| `nu.carb` | Tinh bột | Carbs |
| `nu.fat` | Chất béo | Fat |
| `nu.or` |  hoặc  |  or  |
| `nu.veg` | Rau | Vegetables |
| `nu.sx.title` | Không biết ăn gì? Món gợi ý | Not sure what to eat? Suggested dishes |
| `nu.sx.guide` | Món Việt dễ nấu, đủ đạm và rau. Chọn một món, nấu theo gợi ý, rồi tick bữa đó ở trên. | Easy Vietnamese dishes with enough protein and vegetables. Pick one, cook it as suggested, then tick that meal above. |
| `nu.mealAria` | Bữa | Meal |
| `nu.collapse` | Thu gọn | Show less |
| `nu.showMore` | Xem thêm {n} món | one: Show {n} more dish<br>other: Show {n} more dishes |
| `nu.mealN` | Bữa {n} | Meal {n} |
| `nu.steps` | Bước chân | Steps |
| `nu.target` | mục tiêu {n} | target {n} |
| `nu.met` | Đạt | Met |
| `nu.notMet` | Chưa đạt | Not met |
| `nu.stepsOptional` | Số bước (không bắt buộc) | Step count (optional) |
| `nu.tasksToday` | việc hôm nay | done today |
| `nu.enoughPv` | Đủ đạm và rau | Protein and vegetables |
| `nu.mealsOf` | {done}/{n} bữa | {done}/{n} meals |
| `nu.morningWeigh` | Cân buổi sáng | Morning weigh-in |
| `nu.loggedKg` | đã ghi {kg} kg | logged {kg} kg |
| `nu.weightAria` | Cân nặng sáng nay (kg) | This morning's weight (kg) |
| `nu.edit` | Sửa | Edit |
| `nu.save` | Lưu | Save |
| `nu.weighHow` | Cân sau khi đi vệ sinh, trước khi ăn uống. | Weigh yourself after using the toilet, before eating or drinking. |
| `nu.saveTapAgain` | Chưa lưu được. Kiểm tra kết nối rồi chạm lại. | Couldn't save. Check your connection and tap again. |
| `nu.weightRange` | Nhập cân nặng từ 20 đến 300 kg. | Enter a weight between 20 and 300 kg. |
| `nu.weightSaved` | Đã lưu cân nặng. | Weight saved. |
| `nu.weightFailed` | Chưa lưu được cân nặng. Kiểm tra kết nối rồi thử lại. | Couldn't save your weight. Check your connection and try again. |
| `nu.wk.noWeigh` | Chưa có lần cân nào trong 7 ngày qua. | No weigh-ins in the last 7 days. |
| `nu.wk.vsLast` | So với tuần trước <strong>{d}</strong> | Vs last week <strong>{d}</strong> |
| `nu.wk.baseline` | Mốc để so với tuần sau. | The baseline to compare next week against. |
| `nu.wk.last7` | 7 ngày gần nhất | Last 7 days |
| `nu.wk.avg` | Cân trung bình | Average weight |
| `nu.wk.weighed` | Đã cân {n}/7 ngày | Weighed {n}/7 days |
| `nu.wk.meals` | Bữa đủ đạm và rau | Meals with protein and vegetables |
| `nu.wk.mealsPct` | {n}% bữa đủ đạm và rau | {n}% of meals with protein and vegetables |
| `nu.wk.steps` | Đạt bước <strong>{n}/7</strong> ngày | Step target met <strong>{n}/7</strong> days |
| `nu.wk.coachFoot` | Học viên đang ở chế độ đơn giản: mỗi ngày ghi bữa đủ đạm và rau{steps} và cân buổi sáng. | This client is in simple mode: each day they log meals with protein and vegetables{steps} and a morning weigh-in. |
| `nu.wk.coachSteps` | , bước chân (mục tiêu {n}) | , steps (target {n}) |
| `nu.wk.clientFoot` | Không cần hoàn hảo từng bữa. David nhìn cân nặng trung bình cả tuần để quyết định có cần điều chỉnh không. | Every meal doesn't need to be perfect. David looks at your weekly average weight to decide whether anything needs adjusting. |
| `nu.fl.enough` | Đã đủ | Done |
| `nu.fl.leftG` | Còn {n} g | {n} g left |
| `nu.fl.someMissing` |  · có món chưa đủ số liệu |  · some foods lack data |
| `nu.fl.kcalLeft` | Còn lại <strong>{n} kcal</strong> cho hôm nay. | <strong>{n} kcal</strong> left for today. |
| `nu.fl.kcalOver` | Đã vượt <strong>{n} kcal</strong> so với mục tiêu. | <strong>{n} kcal</strong> over your target. |
| `nu.fl.noTarget` | David chưa đặt mục tiêu calo: app chỉ cộng những gì bạn đã ăn. | David hasn't set a calorie target: the app just adds up what you've eaten. |
| `nu.fl.estimated` | Có món ăn ngoài: số liệu là ước tính. | Includes eating-out dishes: the numbers are estimates. |
| `nu.fl.macroLine` | {kcal} kcal · Đ {p} · C {c} · B {f} | {kcal} kcal · P {p} · C {c} · F {f} |
| `nu.fl.streetOnly` | Đạm {n} g. Món này chưa tách được thành nguyên liệu: chỉ tính calo và đạm. | Protein {n} g. This dish isn't broken down into ingredients yet: only calories and protein are counted. |
| `nu.fl.dash` | "—": chưa có số liệu cho chất này. | "—": no data for this nutrient yet. |
| `nu.delete` | Xoá | Delete |
| `nu.fl.noneMeal` | Chưa ghi món nào. | Nothing logged yet. |
| `nu.fl.add` | + Thêm món | + Add food |
| `nu.fl.mine` | Món của tôi | My dishes |
| `nu.fl.suggest` | Món gợi ý | Suggested dishes |
| `nu.fl.copy` | Chép bữa {meal} hôm qua | Copy yesterday's {meal} |
| `nu.fl.keep` | Lưu thành món của tôi | Save as my dish |
| `nu.fl.portion` | {n} phần | {n} serving |
| `nu.fl.mineRow` | {n} nguyên liệu · {kcal} kcal · {p} g đạm | one: {n} ingredient · {kcal} kcal · {p} g protein<br>other: {n} ingredients · {kcal} kcal · {p} g protein |
| `nu.fl.deleteDish` | Xoá món {name} | Delete {name} |
| `nu.fl.mineInto` | Món của tôi · ghi vào bữa {meal} | My dishes · log to {meal} |
| `nu.fl.serving` | Khẩu phần | Serving |
| `nu.fl.mineHint` | Bấm vào món để ghi. Mỗi nguyên liệu thành một dòng, sửa gram được như thường. | Tap a dish to log it. Each ingredient becomes its own line, and you can edit the grams as usual. |
| `nu.fl.keepTitle` | Lưu bữa {meal} hôm nay thành món của tôi | Save today's {meal} as my dish |
| `nu.fl.keepFull` | Bạn đã lưu {n} món, mức tối đa. Xoá bớt món ít dùng trong "Món của tôi" rồi lưu lại. | You have saved {n} dishes, the maximum. Delete some you rarely use in "My dishes", then save again. |
| `nu.fl.dishName` | Tên món | Dish name |
| `nu.fl.dishNamePh` | Tên món, ví dụ: Cơm gà luộc của mẹ | Dish name, e.g. Mum's boiled chicken rice |
| `nu.fl.keepHint` | Lưu đúng các nguyên liệu và gram của bữa này. Lần sau chọn "Món của tôi" để ghi lại, theo ½, 1, 1½ hoặc 2 phần. | Saves exactly the ingredients and grams of this meal. Next time choose "My dishes" to log it again, as ½, 1, 1½ or 2 servings. |
| `nu.fl.saveDish` | Lưu món | Save dish |
| `nu.fl.mineEmpty` | Món này không còn nguyên liệu ghi được. | This dish has no ingredients left that can be logged. |
| `nu.fl.loggedPortion` | Đã ghi {name}{portion}. | Logged {name}{portion}. |
| `nu.fl.deleteMine` | Xoá "{name}" khỏi món của tôi? Các bữa đã ghi vẫn giữ nguyên. | Delete "{name}" from my dishes? Meals already logged stay as they are. |
| `nu.fl.deleteMineOk` | Xoá món | Delete dish |
| `nu.fl.deleted` | Đã xoá {name}. | Deleted {name}. |
| `nu.fl.deleteFailed` | Chưa xoá được. Kiểm tra kết nối rồi thử lại. | Couldn't delete. Check your connection and try again. |
| `nu.fl.keepNothing` | Bữa này chưa có món nào lưu được. | This meal has nothing that can be saved yet. |
| `nu.fl.keepName` | Đặt tên cho món trước khi lưu. | Name the dish before saving. |
| `nu.fl.kept` | Đã lưu "{name}" vào món của tôi. | Saved "{name}" to my dishes. |
| `nu.fl.keepFailed` | Chưa lưu được món. Kiểm tra kết nối rồi thử lại. | Couldn't save the dish. Check your connection and try again. |
| `nu.fl.noResults` | Không thấy món này. Thử tên ngắn hơn, hoặc chọn món gần giống. | No match. Try a shorter name, or pick something similar. |
| `nu.fl.streetTag` | Món ăn ngoài · ước tính | Eating out · estimate |
| `nu.fl.noDishes` | Không có món nào khớp. Thử chữ khác. | No matching dishes. Try another word. |
| `nu.fl.about` | khoảng {kcal} kcal · {p} g đạm | about {kcal} kcal · {p} g protein |
| `nu.kind.cook` | Tự nấu | Home-cooked |
| `nu.kind.buy` | Mua ngoài | Bought |
| `nu.fl.sgTitle` | Không biết ăn gì? Chọn một món cho bữa {meal} | Not sure what to eat? Pick a dish for {meal} |
| `nu.fl.kindAria` | Loại món | Dish type |
| `nu.fl.sgSearchPh` | Tìm món: gà, trứng, bún… | Search dishes: chicken, egg, noodles… |
| `nu.fl.sgSearchAria` | Tìm món gợi ý | Search suggested dishes |
| `nu.fl.gramsOf` | Số gram {name} | Grams of {name} |
| `nu.fl.sgNote` | Gram là lượng gợi ý cho 1 phần{fit}. Sửa cho đúng lượng bạn ăn rồi bấm Ghi. | Grams are a suggestion for 1 serving{fit}. Change them to what you actually ate, then tap Log. |
| `nu.fl.sgFit` |  vừa với calo một bữa của bạn |  sized to your calories per meal |
| `nu.fl.other` | Món khác | Another dish |
| `nu.fl.logThis` | Ghi món này | Log this dish |
| `nu.fl.needGrams` | Nhập số gram cho ít nhất một nguyên liệu. | Enter grams for at least one ingredient. |
| `nu.fl.logged` | Đã ghi {name}. | Logged {name}. |
| `nu.fl.byMl` | Nhập theo ml | Enter in ml |
| `nu.fl.searchPh` | Tìm món: cơm, ức gà, phở… | Search foods: rice, chicken breast, pho… |
| `nu.fl.searchAria` | Tìm món | Search foods |
| `nu.fl.frequent` | Món hay ăn | Frequent foods |
| `nu.fl.ml` | Số ml | Millilitres |
| `nu.fl.grams` | Số gram | Grams |
| `nu.fl.labelNote` | Số liệu theo nhãn của sản phẩm. | Numbers from the product's nutrition label. |
| `nu.fl.servings` | Số phần | Servings |
| `nu.fl.streetNote` | Món ăn ngoài là ước tính theo một phần thường gặp. Natri không tính. | Eating-out dishes are estimated from a typical serving. Sodium isn't counted. |
| `nu.fl.liquidNote` | Đồ uống và chất lỏng ghi theo ml; app tự đổi ra gram để tính chất. | Drinks and liquids are entered in ml; the app converts them to grams for the nutrients. |
| `nu.fl.rawOrCooked` | Cân sống hay chín | Weighed raw or cooked |
| `nu.fl.raw` | Cân sống | Raw weight |
| `nu.fl.cooked` | Cân chín | Cooked weight |
| `nu.fl.previewHint` | Nhập lượng để xem calo. | Enter an amount to see the calories. |
| `nu.fl.addBtn` | Thêm | Add |
| `nu.mc.max` | tối đa | max |
| `nu.mc.over` | Vượt mức tối đa | Over the maximum |
| `nu.mc.under` | Dưới mức tối đa | Under the maximum |
| `nu.mc.left` | Còn {n} | {n} left |
| `nu.mc.uncounted` | có món chưa tính | some foods not counted |
| `nu.mc.title` | Vi chất hôm nay | Today's micronutrients |
| `nu.mc.vitamins` | Vitamin | Vitamins |
| `nu.mc.metOf` |  · đạt {met}/{n} |  · {met}/{n} met |
| `nu.mc.noTarget` | Vitamin {list}: chưa có mục tiêu, app chỉ cộng lượng đã ăn. | Vitamins {list}: no target yet; the app just adds up what you ate. |
| `nu.mc.partial` | Một số món chưa có số liệu cho vài chất: tổng của những chất đó có thể thấp hơn thật. | Some foods lack data for a few nutrients: those totals may be lower than they really are. |
| `nu.mc.source` | Mục tiêu vi chất theo nhu cầu khuyến nghị của Viện Dinh dưỡng Quốc gia; vitamin E, K, B12 theo DRI của Mỹ (USDA) | Micronutrient targets follow the recommended intakes of Vietnam's National Institute of Nutrition; vitamins E, K and B12 follow the US DRIs (USDA) |
| `nu.mc.noPlan` | Chưa có kế hoạch: app chỉ cộng những gì bạn đã ăn. | No plan yet: the app just adds up what you've eaten. |
| `nu.snack.title` | Còn lại hôm nay | Left for today |
| `nu.sources` | Nguồn số liệu: {list}. | Data sources: {list}. |
| `nu.fl.copied` | Đã chép {n} món từ hôm qua. | one: Copied {n} food from yesterday.<br>other: Copied {n} foods from yesterday. |
| `nu.fl.removed` | Đã xoá món. | Food removed. |
| `nu.fl.badServings` | Số phần phải lớn hơn 0 và không quá 20. | Servings must be above 0 and at most 20. |
| `nu.fl.badUnit` | Nhập số {unit} lớn hơn 0 (tối đa 3.000). | Enter {unit} above 0 (at most 3,000). |
| `nu.fl.badMl` | Nhập số ml lớn hơn 0 (tối đa 3.000). | Enter ml above 0 (at most 3,000). |
| `nu.fl.badGrams` | Nhập số gram lớn hơn 0 (tối đa 3.000). | Enter grams above 0 (at most 3,000). |
| `nu.fl.edited` | Đã sửa món. | Food updated. |
| `nu.cv.meals` | {n} bữa | one: {n} meal<br>other: {n} meals |
| `nu.cv.none` | không ghi | no log |
| `nu.cv.eyebrow` | Học viên tự ghi · chế độ chi tiết | Client log · detailed mode |
| `nu.cv.title` | Nhật ký ăn uống | Food log |
| `nu.cv.logged` | Ghi {n}/7 ngày gần nhất | Logged {n}/7 recent days |
| `nu.cv.protein` |  · đạm đạt (±10%) {n}/{days} ngày có ghi |  · protein on target (±10%) {n}/{days} logged days |
| `nu.cv.pickDay` | Chọn ngày | Choose a day |
| `nu.cv.avg7` | Trung bình 7 ngày gần nhất | Last 7 days average |
| `nu.cv.noTargets` | Kế hoạch chưa có mục tiêu: tạo bằng "Tạo kế hoạch" để so sánh. | The plan has no targets yet: create them with "Build plan" to compare. |
| `nu.cv.mine` | Món của học viên | Client's dishes |
| `nu.cv.mineNone` | Học viên chưa lưu món nào. Khi ghi xong một bữa, học viên bấm "Lưu thành món của tôi" để lần sau ghi lại bằng một lần bấm. | The client hasn't saved any dishes. After logging a meal, they can tap "Save as my dish" to log it again with one tap next time. |
| `nu.cv.kcalP` | {kcal} kcal · {p} g đạm | {kcal} kcal · {p} g protein |
| `nu.cv.partial` | Chưa tải đủ dữ liệu theo dõi. Hãy kiểm tra kết nối rồi thử lại. | Not all tracking data loaded. Check your connection and try again. |
| `nu.cv.clientLogged` | Học viên đã ghi | Client log |
| `nu.cv.weekly` | Số liệu theo tuần | Weekly numbers |
| `nu.logFailed` | Chưa lưu được nhật ký hôm nay. Kiểm tra kết nối rồi thử lại. | Couldn't save today's log. Check your connection and try again. |
| `nu.wt.none` | Chưa có dữ liệu. Ghi ngày đầu tiên ở trên. | No data yet. Log your first day above. |
| `nu.wt.week` | Tuần {n} | Week {n} |
| `nu.wt.avgW` | Cân TB | Avg weight |
| `nu.wt.avgK` | Calo TB | Avg calories |
| `nu.wt.weighIns` | Lần cân | Weigh-ins |
| `nu.wt.warn` | ⚠ = tuần cân dưới 4 lần, chưa đủ để đọc thành xu hướng. | ⚠ = a week with under 4 weigh-ins, not enough to read as a trend. |
| `nu.pc.noGoal` | Chưa xác định mục tiêu | No goal set |
| `nu.pc.noGoalBody` | Hãy mở Builder và chọn mục tiêu trước khi đánh giá tiến độ. | Open the Builder and choose a goal before checking progress. |
| `nu.pc.wkChange` | đổi cân mỗi tuần | weekly weight change |
| `nu.pc.target` | mục tiêu | target |
| `nu.pc.adherence` | tuân thủ calo | calorie adherence |
| `nu.pc.tdee` | duy trì thật | true maintenance |
| `nu.pc.carbs` | tinh bột | carbs |
| `nu.pc.fat` | béo | fat |
| `nu.pc.todo` | Việc cần làm: | To do: |
| `nu.pc.newKcal` | kcal mới ({d}) | new kcal ({d}) |
| `nu.pc.proteinKept` | đạm (giữ nguyên) | protein (unchanged) |
| `nu.pc.apply` | Áp dụng trong {n} tuần rồi kiểm tra lại. | one: Apply for {n} week, then check again.<br>other: Apply for {n} weeks, then check again. |
| `nu.pc.remember` | Nhớ ba điều này | Remember these three things |
| `nu.empty.coach` | Mở “Tạo kế hoạch” để thiết lập và giao kế hoạch đầu tiên cho học viên. | Open “Build plan” to set up and assign the first plan for this client. |
| `nu.empty.client` | Coach chưa giao kế hoạch. Khi kế hoạch được tạo, bạn sẽ xem và theo dõi ngay tại đây. | Your coach hasn't assigned a plan yet. Once it's created, you'll see and follow it right here. |
| `nu.plan.noGoal` | Chưa ghi mục tiêu | No goal written |
| `nu.plan.meals` | Số bữa/ngày: <strong>{n}</strong> | Meals/day: <strong>{n}</strong> |
| `nu.plan.mealsUnset` | Số bữa/ngày: <strong>chưa đặt</strong> (mở “Tạo kế hoạch” để nhập) | Meals/day: <strong>not set</strong> (open “Build plan” to enter it) |
| `nu.plan.note` | Lưu ý: {notes} | Note: {notes} |
| `nu.std.perf` | Ưu tiên: hiệu suất và form tập. | Priority: performance and training form. |
| `nu.std.reassess` | Tái đánh giá sau {n} tuần. | one: Reassess after {n} week.<br>other: Reassess after {n} weeks. |
| `nu.std.noTarget` | {name} chưa có mục tiêu | {name}: no target yet |
| `nu.std.sodiumMax` | Natri tối đa {amount} | Sodium max {amount} |
| `nu.std.source` | Nguồn: nhu cầu khuyến nghị của Viện Dinh dưỡng Quốc gia; vitamin E, K, B12 theo DRI của Mỹ (USDA NAL) | Source: recommended intakes of Vietnam's National Institute of Nutrition; vitamins E, K and B12 follow the US DRIs (USDA NAL) |
| `nu.std.slowCarb` | {n}% carb chậm · chất xơ hoà tan và không hoà tan. | {n}% slow carbs · soluble and insoluble fibre. |
| `nu.mode.simple` | Chế độ đơn giản | Simple mode |
| `nu.mode.detailed` | Chế độ chi tiết | Detailed mode |
| `nu.reportFailed` | Chưa tải được báo cáo của học viên. Đây là lỗi kết nối, không phải chưa có dữ liệu. | The client's report couldn't load. This is a connection error, not missing data. |

## nutrient

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `nutrient.kcal` | Calo | Calories |
| `nutrient.protein` | Đạm | Protein |
| `nutrient.carb` | Carb | Carbs |
| `nutrient.fat` | Béo | Fat |
| `nutrient.fiber` | Chất xơ | Fiber |
| `nutrient.potassium` | Kali | Potassium |
| `nutrient.sodium` | Natri | Sodium |
| `nutrient.calcium` | Canxi | Calcium |
| `nutrient.magnesium` | Magie | Magnesium |
| `nutrient.iron` | Sắt | Iron |
| `nutrient.zinc` | Kẽm | Zinc |
| `nutrient.vitaminA` | Vitamin A | Vitamin A |
| `nutrient.vitaminC` | Vitamin C | Vitamin C |
| `nutrient.vitaminD` | Vitamin D | Vitamin D |
| `nutrient.vitaminE` | Vitamin E | Vitamin E |
| `nutrient.vitaminK` | Vitamin K | Vitamin K |
| `nutrient.vitaminB1` | Vitamin B1 | Vitamin B1 |
| `nutrient.vitaminB6` | Vitamin B6 | Vitamin B6 |
| `nutrient.folate` | Folate (B9) | Folate (B9) |
| `nutrient.vitaminB12` | Vitamin B12 | Vitamin B12 |

## streak

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `streak.days` | {n} ngày | one: {n} day<br>other: {n} days |
| `streak.start` | Bắt đầu chuỗi ghi bữa | Start your meal-log streak |
| `streak.startHint` | Ghi một bữa hôm nay là ngày thứ nhất. | Log one meal today to make day one. |
| `streak.title` | Chuỗi ghi bữa: {days} | Meal-log streak: {days} |
| `streak.done` | Hôm nay đã ghi. Mai ghi tiếp để chuỗi dài thêm. | Logged today. Log again tomorrow to keep it growing. |
| `streak.risk` | Hôm qua lỡ một ngày: ghi hôm nay để giữ chuỗi. | You missed yesterday: log today to keep the streak. |
| `streak.next` | Ghi hôm nay để lên {n} ngày. | Log today to reach {n} days. |
| `streak.dot.logged` | đã ghi | logged |
| `streak.dot.missed` | không ghi | not logged |
| `streak.dot.today` | hôm nay, chưa ghi | today, not logged yet |
| `streak.aria` | 7 ngày gần nhất: {n} ngày đã ghi | Last 7 days: {n} days logged |

## simple

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `simple.proteinPerMeal` | Khoảng {n} g đạm mỗi bữa, kèm một phần rau. | About {n} g of protein per meal, with a serving of vegetables. |
| `simple.proteinGeneric` | Mỗi bữa có một món đạm và một phần rau. | Each meal has a protein food and a serving of vegetables. |

## source

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `source.AU` | Úc | Australia |
| `source.NO` | Na Uy | Norway |
| `source.VN` | Việt Nam | Vietnam |
| `source.JP` | Nhật | Japan |
| `source.line` | Nguồn: {db} | Source: {db} |
| `source.label` | Theo nhãn sản phẩm | From the product label |

## amount

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `amount.street` | {n} phần · ước tính | one: {n} serving · estimate<br>other: {n} servings · estimate |
| `amount.label` | {n} {unit} · theo nhãn | {n} {unit} · from label |
| `amount.cooked` |  chín {raw} |  cooked {raw} |
| `amount.raw` | ≈ {n} g sống | ≈ {n} g raw |

## flv

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `flv.eaten` | Đã ăn | Eaten |
| `flv.target` | Mục tiêu | Target |
| `flv.over` | Vượt | Over |
| `flv.under` | Dưới mức | Under |
| `flv.unknownTitle` | Có món chưa có số liệu | Some foods have no data |
| `flv.unknownNote` | * Có món chưa có số liệu cho chất này: tổng có thể thấp hơn thật. | * Some foods have no data for this nutrient: the total may be lower than it really is. |
| `flv.noneDay` | Học viên không ghi món nào hôm này. | The client didn't log anything that day. |
| `flv.kcalP` | {kcal} · Đ {p} | {kcal} · P {p} |
| `flv.noneRange` | Chưa có ngày nào ghi món trong khoảng này. | No days with logged food in this range. |
| `flv.avgOver` | Trung bình trên {n}/{of} ngày có ghi | Average over {n}/{of} logged days |
| `flv.withStreet` | , có món ăn ngoài (ước tính) | , includes eating-out dishes (estimated) |
| `flv.perDay` | TB/ngày | Avg/day |

## snack

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `snack.gap.kcal` | kcal | kcal |
| `snack.gap.protein` | đạm | protein |
| `snack.gap.carbs` | tinh bột | carbs |
| `snack.gap.fat` | béo | fat |
| `snack.enough` | Calo hôm nay đã đủ, không cần ăn thêm. | You've reached today's calories; no need to eat more. |
| `snack.title` | Bữa phụ bù macro | A snack to close the gap |
| `snack.need` | Cần bù: {list}. | Still needed: {list}. |
| `snack.minor` | Phần {list} còn thiếu ít, bỏ qua được. | The {list} gap is small; you can skip it. |
| `snack.none` | Chưa có món ăn nhẹ nào vừa phần còn thiếu. Ngày mai ăn đủ theo mục tiêu là được. | No snack fits what is missing. Just eat to your targets tomorrow. |
| `snack.byDavid` | David gợi ý | Suggested by David |
| `snack.pickOne` | Chọn một trong các món sau: | Pick one of these: |
| `snack.suggestion` | Gợi ý: | Suggestion: |
| `snack.foot` | Không cần bù chính xác, ăn gần đúng là đủ. | You don't need to close it exactly; close enough is fine. |

## rni

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `rni.under18` | Học viên dưới 18 tuổi: bảng này dành cho người lớn, đang dùng nhóm 18–29. | Client under 18: this table is for adults; using the 18–29 group. |
| `rni.noAge` | Chưa có tuổi: đang dùng nhóm 18–29. | No age yet: using the 18–29 group. |
| `rni.noSex` | Chưa chọn giới tính: đang dùng số của nam. | No sex chosen: using the male values. |
| `rni.folate` | Viện ghi “axit folic”; số liệu thực phẩm là folate (µg DFE). Chưa xác nhận hai số cùng cách tính. | The Institute lists “folic acid”; the food data is folate (µg DFE). Not yet confirmed that the two are measured the same way. |

## push

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `push.noKey` | Chưa cấu hình Web Push VAPID key trong notification-config.js. | The Web Push VAPID key is not set in notification-config.js. |
| `push.noSupport` | Trình duyệt này chưa hỗ trợ Web Push. | This browser doesn't support Web Push yet. |
| `push.denied` | Bạn chưa cho phép trình duyệt gửi thông báo. | You haven't allowed the browser to send notifications. |
| `push.noToken` | Không lấy được mã nhận thông báo cho thiết bị này. | Couldn't get a notification token for this device. |

## dish

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `dish.kind.cook` | Tự nấu | Home-cooked |
| `dish.kind.buy` | Mua sẵn / ăn ngoài | Bought / eating out |
| `dish.note.buy` | Mua ngoài được — gram chỉ là ước lượng khẩu phần, hãy dặn quán theo ghi chú. | Fine to buy — the grams are only an estimated serving; ask the shop as the note says. |
| `dish.menu.sang` | Bữa sáng | Breakfast |
| `dish.menu.trua` | Bữa trưa · tự chuẩn bị | Lunch · home-prepared |
| `dish.menu.ngoai` | Bữa trưa · đặt ngoài | Lunch · ordered in |
| `dish.menu.toi` | Bữa tối · nấu tại nhà | Dinner · cooked at home |
| `dish.menu.phu` | Bữa phụ | Snack |

## exrev

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `exrev.duyet_bai_tap_moi_david_coaching` | Duyệt bài tập mới — David Coaching | Review new exercises — David Coaching |
| `exrev.duyet_bai_tap_moi` | Duyệt bài tập mới | Review new exercises |
| `exrev.bang_dieu_khien` | ◀ Bảng điều khiển | ◀ Dashboard |
| `exrev.dang_xuat` | Đăng xuất | Log out |
| `exrev.dang_tai` | Đang tải | Loading |
| `exrev.danh_cho_coach` | Dành cho coach | For the coach |
| `exrev.ta_don` | tạ đòn | barbell |
| `exrev.ta_don_2` | tạ đơn | dumbbell |
| `exrev.cap` | cáp | cable |
| `exrev.may` | máy | machine |
| `exrev.them_ta` | thêm tạ | weighted |
| `exrev.vong_treo` | vòng treo | rings |
| `exrev.tai_khoan_chua_duoc_thiet_lap` | Tài khoản chưa được thiết lập cho huấn luyện viên. | This account is not set up as a coach. |
| `exrev.chua_the_tai_trang_luc_nay` | Chưa thể tải trang lúc này. Kiểm tra mạng rồi thử lại. | The page can't load right now. Check your connection and try again. |
| `exrev.so_kg` | · số kg {p0} | · weights {p0} |
| `exrev.duyet` | Duyệt | Approve |
| `exrev.bo` | Bỏ | Reject |
| `exrev.de_sau` | Để sau | Later |
| `exrev.cho_duyet` | Chờ duyệt | Pending |
| `exrev.vi_sao_them` | Vì sao thêm: | Why add it: |
| `exrev.video_chua_co_david_them_sau` | {p0} Video: chưa có, David thêm sau. | {p0} Video: none yet; David adds it later. |
| `exrev.quyet_dinh_cho` | Quyết định cho {p0} | Decision for {p0} |
| `exrev.bai_claude_de_xuat_cho_david` | {p0} bài Claude đề xuất, chờ David duyệt. Bài chưa duyệt không xuất hiện ở bộ dựng hay màn hình của học viên. | {p0} exercises proposed by Claude, waiting for David. Exercises not approved don't appear in the builder or on the client's screens. |
| `exrev.0_bai_cho_duyet_bai_da` | 0 bài chờ duyệt. {p0} bài đã vào thư viện, {p1} bài đã bỏ. | 0 exercises pending. {p0} went into the library, {p1} were rejected. |
| `exrev.bai_de_xuat` | {p0} bài đề xuất | {p0} proposed |
| `exrev.bai` | {p0} bài | {p0} exercises |
| `exrev.da_vao_thu_vien` | Đã vào thư viện | In the library |
| `exrev.da_bo` | Đã bỏ | Rejected |
| `exrev.da_duyet_xong` | Đã duyệt xong | All reviewed |
| `exrev.khong_con_bai_nao_cho_duyet` | Không còn bài nào chờ duyệt. Bài đã duyệt nằm trong thư viện bài tập; video để trống, David thêm link khi có. | No exercises left to review. Approved exercises are in the exercise library; videos are blank until David adds a link. |
| `exrev.cach_duyet` | Cách duyệt | How to review |
| `exrev.chon_duyet_bo_hoac_de_sau` | Chọn Duyệt, Bỏ hoặc Để sau cho từng bài. Lựa chọn lưu tạm trên máy này. Xong, bấm | Choose Approve, Reject or Later for each exercise. Your choices are kept on this device for now. When done, tap |
| `exrev.sao_chep_ket_qua` | Sao chép kết quả | Copy result |
| `exrev.roi_dan_vao_cuoc_tro_chuyen` | rồi dán vào cuộc trò chuyện với Claude; Claude sẽ đưa các bài đã duyệt vào thư viện. | and paste it into the chat with Claude; Claude adds the approved exercises to the library. |
| `exrev.so_kg_cua_bai_ghi_san` | Số kg của bài ghi sẵn | The weights of each exercise are preset |
| `exrev.hoac` | hoặc | or |
| `exrev.theo_quy_tac_da_chot_video` | theo quy tắc đã chốt. Video để trống: Claude không tự tạo đường link. | by the agreed rule. Videos are left blank: Claude doesn't make up links. |
| `exrev.khoang_trong_hien_tai` | Khoảng trống hiện tại | Current gaps |
| `exrev.nhom_co_dang` | Nhóm cơ · dạng | Muscle group · type |
| `exrev.co` | Có | Have |
| `exrev.ket_qua` | Kết quả | Result |
| `exrev.ket_qua_duyet` | Kết quả duyệt | Review result |
| `exrev.khong_co` | (không có) | (none) |
| `exrev.da_chon` | {p0}/{p1} đã chọn | {p0}/{p1} chosen |
| `exrev.da_sao_chep` | Đã sao chép. | Copied. |
| `exrev.chua_sao_chep_duoc_tu_dong` | Chưa sao chép được tự động: hãy chọn khung bên dưới và sao chép. | Couldn't copy automatically: select the box below and copy it. |

## coach

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `coach.bang_dieu_khien_coach_david_coaching` | Bảng điều khiển Coach — David Coaching | Coach dashboard — David Coaching |
| `coach.bang_dieu_khien` | Bảng điều khiển | Dashboard |
| `coach.thong_bao_phan_hoi` | Thông báo phản hồi | Feedback notifications |
| `coach.phan_hoi_moi` | Phản hồi mới | New feedback |
| `coach.da_doc_tat_ca` | Đã đọc tất cả | Mark all as read |
| `coach.chua_co_phan_hoi_moi` | Chưa có phản hồi mới. | No new feedback. |
| `coach.nhan_thong_bao` | Nhận thông báo | Get notifications |
| `coach.thong_bao_trong_website_luon_duoc` | Thông báo trong website luôn được giữ lại ở đây. | Notifications on the website are always kept here. |
| `coach.hoc_vien` | Học viên | Clients |
| `coach.hoc_vien_cua_toi` | Học viên của tôi | My clients |
| `coach.can_phan_loai_ho_so_cu` | Cần phân loại hồ sơ cũ | Older profiles to sort |
| `coach.chon_mot_nhom_de_dua_cac` | Chọn một nhóm để đưa các hồ sơ này vào danh sách quản lý. | Choose a group to move these profiles into your managed list. |
| `coach.them_hoc_vien_da_co_tai` | + Thêm học viên (đã có tài khoản đăng nhập) | + Add a client (who already has a login) |
| `coach.hoc_vien_can_duoc_tao_tai` | Học viên cần được tạo tài khoản đăng nhập trước (Firebase Console → Authentication → Add user). Dán UID của họ vào đây để tạo hồ sơ. | The client needs a login account first (Firebase Console → Authentication → Add user). Paste their UID here to create the profile. |
| `coach.uid_tai_khoan` | UID tài khoản | Account UID |
| `coach.ten_hien_thi` | Tên hiển thị | Display name |
| `coach.nhom_hoc_vien` | Nhóm học viên | Client group |
| `coach.chon_nhom` | Chọn nhóm | Choose a group |
| `coach.phong_tap` | Phòng tập | Gym |
| `coach.tao_ho_so_hoc_vien` | Tạo hồ sơ học viên | Create client profile |
| `coach.danh_sach_hoc_vien` | ← Danh sách học viên | ← Client list |
| `coach.tong_quan` | Tổng quan | Overview |
| `coach.xem_anh_tien_trinh` | Xem ảnh tiến trình | See progress photos |
| `coach.lap_ke_hoach_dinh_duong` | Lập kế hoạch dinh dưỡng | Build nutrition plan |
| `coach.them_lua_chon_cho_hoc_vien` | Thêm lựa chọn cho học viên này | More options for this client |
| `coach.span_aria_hidden_true_span_them` | <span aria-hidden="true">⋯</span> Thêm | <span aria-hidden="true">⋯</span> More |
| `coach.dat_biet_danh` | Đặt biệt danh | Set nickname |
| `coach.luu_nhom` | Lưu nhóm | Save group |
| `coach.cap_nhat_ke_hoach_theo_chuan` | Cập nhật kế hoạch theo chuẩn mới | Update the plan to the new standard |
| `coach.xoa_du_lieu_hoc_vien` | Xóa dữ liệu học viên | Delete client data |
| `coach.ho_so_hoc_vien` | Hồ sơ học viên | Client profile |
| `coach.giao_an` | Giáo án | Program |
| `coach.lich_su` | Lịch sử | History |
| `coach.muc_tieu_cua_chu_ky` | Mục tiêu của chu kỳ | Cycle goal |
| `coach.chua_chon` | Chưa chọn | Not chosen |
| `coach.tang_co` | Tăng cơ | Hypertrophy |
| `coach.suc_manh` | Sức mạnh | Strength |
| `coach.suc_manh_tang_co` | Sức mạnh + tăng cơ | Strength + hypertrophy |
| `coach.cac_chu_ky` | Các chu kỳ | Cycles |
| `coach.tao_chu_ky_moi` | Tạo chu kỳ mới | New cycle |
| `coach.giao_an_hien_tai_chua_duoc` | Giáo án hiện tại chưa được chia theo chu kỳ. Hãy chọn những buổi cần dùng cho chu kỳ đầu tiên. | The current program isn't split into cycles yet. Choose the sessions to use for the first cycle. |
| `coach.tao_chu_ky_dau_tien` | Tạo chu kỳ đầu tiên | Create the first cycle |
| `coach.ban_nhap_hoc_vien_chua_nhin` | BẢN NHÁP — HỌC VIÊN CHƯA NHÌN THẤY | DRAFT — THE CLIENT CAN'T SEE IT YET |
| `coach.them_buoi` | + Thêm buổi | + Add session |
| `coach.chinh_sua_ban_nhap` | Chỉnh sửa bản nháp | Edit draft |
| `coach.kich_hoat` | Kích hoạt | Activate |
| `coach.huy_ban_nhap` | Hủy bản nháp | Discard draft |
| `coach.ten_chu_ky` | Tên chu kỳ | Cycle name |
| `coach.vd_strength_6_tuan` | VD: Strength — 6 tuần | E.g. Strength — 6 weeks |
| `coach.muc_tieu_tuy_chon` | Mục tiêu (tuỳ chọn) | Goal (optional) |
| `coach.ngay_bat_dau_tuy_chon` | Ngày bắt đầu (tuỳ chọn) | Start date (optional) |
| `coach.ngay_ket_thuc_du_kien_tuy` | Ngày kết thúc dự kiến (tuỳ chọn) | Planned end date (optional) |
| `coach.ghi_chu_tuy_chon` | Ghi chú (tuỳ chọn) | Notes (optional) |
| `coach.tim_buoi_hoac_giao_an_mau` | Tìm buổi hoặc giáo án mẫu… | Search sessions or template programs… |
| `coach.bo_chon` | Bỏ chọn | Clear selection |
| `coach.giao_an_cua_hoc_vien` | Giáo án của học viên | Client's program |
| `coach.thu_vien_giao_an_mau` | Thư viện giáo án mẫu | Template program library |
| `coach.chua_chon_buoi_tap_nao` | Chưa chọn buổi tập nào. | No sessions chosen. |
| `coach.tao_ban_nhap` | Tạo bản nháp | Create draft |
| `coach.huy` | Huỷ | Cancel |
| `coach.cac_chu_ky_giao_an` | Các chu kỳ giáo án | Program cycles |
| `coach.chon_nhieu_de_xoa` | Chọn nhiều để xóa | Select several to delete |
| `coach.chua_chon_chu_ky_nao` | Chưa chọn chu kỳ nào. | No cycle chosen. |
| `coach.chon_tat_ca` | Chọn tất cả | Select all |
| `coach.xoa` | Xóa | Delete |
| `coach.da_xoa` | Đã xóa | Deleted |
| `coach.chu_ky_da_xoa_khong_hien` | Chu kỳ đã xóa không hiện trong danh sách và khi chọn buổi cho chu kỳ mới. Lịch sử buổi tập và tổng kết vẫn giữ nguyên. | Deleted cycles don't show in the list or when choosing sessions for a new cycle. Session history and reviews are kept. |
| `coach.bai_tap_trong_giao_an` | Bài tập trong giáo án | Exercises in the program |
| `coach.mo_tat_ca` | Mở tất cả | Expand all |
| `coach.thu_gon_tat_ca` | Thu gọn tất cả | Collapse all |
| `coach.them_bai_tap` | + Thêm bài tập | + Add exercise |
| `coach.them_bai_tap_2` | Thêm bài tập | Add exercise |
| `coach.bai_tap` | Bài tập | Exercise |
| `coach.tim_bai_tap` | Tìm bài tập… | Search exercises… |
| `coach.xem_video_ky_thuat` | ▶ Xem video kỹ thuật | ▶ Watch technique video |
| `coach.ky_thuat_chi_tiet` | Kỹ thuật chi tiết | Technique details |
| `coach.doi_sang_bai_khac_bai_moi` | Đổi sang bài khác: bài mới giữ nguyên cơ chế progression và các thiết lập của bài cũ (nếu dùng được cho bài mới), còn tạ khởi điểm và tiến trình đã đạt sẽ tính lại từ đầu — hãy nhập tạ khởi điểm mới. | Switching to another exercise: the new one keeps the old one's progression scheme and settings (where they fit), but the starting weight and progress start again — enter a new starting weight. |
| `coach.buoi_nhan` | Buổi (nhãn) | Session (label) |
| `coach.go_de_tim_buoi_hoac_nhap` | Gõ để tìm buổi, hoặc nhập tên buổi mới… | Type to find a session, or enter a new session name… |
| `coach.thu_tu_trong_buoi` | Thứ tự trong buổi | Order in the session |
| `coach.ghi_chu_cho_hoc_vien_ky` | Ghi chú cho học viên (kỹ thuật, grip, tempo…) | Note for the client (technique, grip, tempo…) |
| `coach.vd_grip_rong_hon_vai_1` | VD: Grip rộng hơn vai 1 nắm tay. Tempo 3-1-1, hạ chậm. | E.g. Grip one fist wider than shoulders. Tempo 3-1-1, slow descent. |
| `coach.doi_bai_tap_se_xoa_ghi` | Đổi bài tập sẽ xoá ghi chú cũ (không còn áp dụng cho bài mới) — nhập lại ghi chú mới nếu cần. | Changing the exercise clears the old note (it no longer applies) — write a new one if needed. |
| `coach.luu` | Lưu | Save |
| `coach.danh_gia_progression` | ĐÁNH GIÁ PROGRESSION | PROGRESSION REVIEW |
| `coach.tung_bai_co_dang_tien_bo` | Từng bài có đang tiến bộ không? | Is each exercise progressing? |
| `coach.do_bang_1rm_uoc_tinh_e1rm` | Đo bằng 1RM ước tính (e1RM, công thức Epley có cộng RIR), để so được mọi kiểu tăng tiến. e1RM là ước tính để xem xu hướng, không phải 1RM thật. Chững: 3 lần gần nhất không vượt mức cao nhất trước đó. Giảm: trung bình 2 lần gần nhất thấp hơn mức cao nhất từ 5%. Khác giáo án: học viên tập nặng hơn hoặc nhẹ hơn số giáo án ít nhất 2 trong 4 lần gần nhất. Chỉ là gợi ý, giáo án không tự đổi. | Measured by estimated 1RM (e1RM, Epley formula plus RIR) so every progression scheme compares. e1RM is an estimate to read the trend, not a real 1RM. Stalled: the last 3 sessions didn't beat the previous best. Down: the last 2 average 5%+ below the best. Off plan: the client lifted heavier or lighter than the program in at least 2 of the last 4 sessions. Suggestions only; the program doesn't change by itself. |
| `coach.loc_theo_trang_thai` | Lọc theo trạng thái | Filter by status |
| `coach.tat_ca` | Tất cả | All |
| `coach.chung` | Chững | Stalled |
| `coach.giam` | Giảm | Down |
| `coach.khac_giao_an` | Khác giáo án | Off plan |
| `coach.theo_muc_tieu` | THEO MỤC TIÊU | BY GOAL |
| `coach.theo_doi_tien_bo_va_khi` | Theo dõi tiến bộ và khi chững lại | Track progress and spot stalls |
| `coach.an_toan_quyet_dinh` | AN TOÀN & QUYẾT ĐỊNH | SAFETY & DECISIONS |
| `coach.canh_bao_va_lich_su_dieu` | Cảnh báo và lịch sử điều chỉnh | Alerts and adjustment history |
| `coach.khong_co_canh_bao_dang_mo` | Không có cảnh báo đang mở. | No open alerts. |
| `coach.lich_su_training_max_va_progression` | Lịch sử Training Max và progression | Training Max and progression history |
| `coach.chua_co_thay_doi_duoc_ghi` | Chưa có thay đổi được ghi nhận. | No changes recorded yet. |
| `coach.volume_theo_nhom_co` | VOLUME THEO NHÓM CƠ | VOLUME BY MUSCLE GROUP |
| `coach.ke_hoach_va_muc_chiu_dung` | Kế hoạch và mức chịu đựng thực tế | Plan and real tolerance |
| `coach.luu_tan_suat_tuan` | Lưu tần suất tuần | Save weekly frequency |
| `coach.ke_hoach_lay_tu_so_set` | Kế hoạch lấy từ số set hiện tại × số lần lặp lại từng buổi. Thực tế chỉ tính set đã hoàn thành. | The plan comes from the current set count × how often each session repeats. Actual counts only completed sets. |
| `coach.chua_co_check_in_phuc_hoi` | Chưa có check-in phục hồi của học viên. | No recovery check-ins from the client yet. |
| `coach.rir_theo_tung_bai` | RIR THEO TỪNG BÀI | RIR PER EXERCISE |
| `coach.ke_hoach_so_voi_thuc_te` | Kế hoạch so với thực tế | Plan vs actual |
| `coach.theo_doi_4_8_va_12` | Theo dõi 4, 8 và 12 tuần. Cảnh báo chỉ là tín hiệu để David xem lại, không tự điều chỉnh Training Max hay giáo án. | Tracked over 4, 8 and 12 weeks. Alerts are only a signal for David to look again; they don't change the Training Max or the program. |
| `coach.deload_tong_ket_chu_ky` | DELOAD & TỔNG KẾT CHU KỲ | DELOAD & CYCLE REVIEW |
| `coach.david_quyet_dinh_he_thong_chi` | David quyết định, hệ thống chỉ tổng hợp | David decides; the system only summarises |
| `coach.khong_co_de_xuat_nao_tu` | Không có đề xuất nào tự thay đổi Training Max, tạ, set, rep, RIR hoặc giáo án. | No suggestion changes the Training Max, load, sets, reps, RIR or program by itself. |
| `coach.chon_hoc_vien_de_xem` | Chọn học viên để xem. | Choose a client to view. |
| `coach.chua_co_buoi_tap_nao_duoc` | Chưa có buổi tập nào được ghi nhận. | No sessions saved yet. |
| `coach.thao_tac_khong_the_hoan_tac` | Thao tác không thể hoàn tác | This can't be undone |
| `coach.xoa_du_lieu_hoc_vien_2` | Xóa dữ liệu học viên? | Delete client data? |
| `coach.giu_lai` | Giữ lại | Keep |
| `coach.xoa_toan_bo_du_lieu` | Xóa toàn bộ dữ liệu | Delete all data |
| `coach.doi_ten_buoi_tap` | Đổi tên buổi tập | Rename session |
| `coach.doi_ten_buoi` | Đổi tên buổi | Rename session |
| `coach.ten_moi` | Tên mới | New name |
| `coach.huy_2` | Hủy | Cancel |
| `coach.doi_ten` | Đổi tên | Rename |
| `coach.xoa_bai_tap_khoi_giao_an` | Xóa bài tập khỏi giáo án? | Remove exercise from the program? |
| `coach.xoa_bai_tap` | Xóa bài tập | Remove exercise |
| `coach.luu_quyet_dinh_coaching` | LƯU QUYẾT ĐỊNH COACHING | SAVE COACHING DECISION |
| `coach.vi_sao_ban_dieu_chinh` | Vì sao bạn điều chỉnh? | Why are you adjusting? |
| `coach.ly_do` | Lý do | Reason |
| `coach.xem_lai_vao_ngay_tuy_chon` | Xem lại vào ngày (tùy chọn) | Review again on (optional) |
| `coach.xac_nhan` | Xác nhận | Confirm |
| `coach.da_xem` | Đã xem | Reviewed |
| `coach.dieu_chinh_giao_an` | Điều chỉnh giáo án | Program adjusted |
| `coach.trao_doi_voi_hoc_vien` | Trao đổi với học viên | Talked with the client |
| `coach.da_xu_ly` | Đã xử lý | Resolved |
| `coach.mo_lai_canh_bao` | Mở lại cảnh báo | Reopen alert |
| `coach.da_luu` | Đã lưu: {p0}. | Saved: {p0}. |
| `coach.da_danh_dau_da_xem_canh` | Đã đánh dấu đã xem {p0} cảnh báo. | Marked {p0} alerts as reviewed. |
| `coach.da_luu_mot_so_canh_bao` | Đã lưu {p0}/{p1}. Một số cảnh báo chưa lưu được, hãy thử lại. | Saved {p0}/{p1}. Some alerts weren't saved; try again. |
| `coach.ho_so_hoc_vien_khong_con` | Hồ sơ học viên không còn trong danh sách. | The client profile is no longer in the list. |
| `coach.chua_the_tai_dashboard_can_xem` | Chưa thể tải dashboard cần xem lúc này. | The review dashboard can't load right now. |
| `coach.buoi_gan_nhat_tien_bo` | Buổi gần nhất: tiến bộ | Latest session: progressed |
| `coach.buoi_gan_nhat_dung_ke_hoach` | Buổi gần nhất: đúng kế hoạch | Latest session: on plan |
| `coach.buoi_gan_nhat_chua_dat` | Buổi gần nhất: chưa đạt | Latest session: missed |
| `coach.p_class_notification_empty_chua_co` | <p class="notification-empty">Chưa có phản hồi mới.</p> | <p class="notification-empty">No new feedback.</p> |
| `coach.dang_nhan_thong_bao_tat` | Đang nhận thông báo · Tắt | Notifications on · Turn off |
| `coach.thiet_bi_nay_se_bao_ngay` | Thiết bị này sẽ báo ngay khi học viên gửi phản hồi. | This device alerts you as soon as a client sends feedback. |
| `coach.can_them_web_push_vapid_key` | Cần thêm Web Push VAPID key trước khi bật. Chuông trong website vẫn hoạt động. | A Web Push VAPID key is needed before turning this on. The bell on the website still works. |
| `coach.thong_bao_dang_bi_chan` | Thông báo đang bị chặn | Notifications are blocked |
| `coach.hay_cho_phep_thong_bao_trong` | Hãy cho phép thông báo trong cài đặt trình duyệt. Chuông trong website vẫn hoạt động. | Allow notifications in your browser settings. The bell on the website still works. |
| `coach.thiet_bi_chua_ho_tro_push` | Thiết bị chưa hỗ trợ Push | This device doesn't support Push |
| `coach.ban_van_nhan_day_du_phan` | Bạn vẫn nhận đầy đủ phản hồi trong chuông của website. | You still get all feedback in the website's bell. |
| `coach.bat_de_nhan_phan_hoi_ngay` | Bật để nhận phản hồi ngay cả khi không mở trang này. | Turn on to get feedback even when this page isn't open. |
| `coach.p_class_notification_empty_chua_the` | <p class="notification-empty">Chưa thể tải thông báo lúc này.</p> | <p class="notification-empty">Notifications can't load right now.</p> |
| `coach.ban_vua_nhan_mot_phan_hoi` | Bạn vừa nhận một phản hồi bài tập mới. | You just got new exercise feedback. |
| `coach.ghi_chu_nay_khong_con_kha` | Ghi chú này không còn khả dụng. | This note is no longer available. |
| `coach.chon_hoc_vien` | Chọn học viên | Choose a client |
| `coach.mo_ho_so_hoc_vien_de` | Mở hồ sơ học viên để xem hoặc điều chỉnh kế hoạch dinh dưỡng. | Open a client's profile to view or adjust their nutrition plan. |
| `coach.bo_cau_hoi_len_meal_plan` | Bộ câu hỏi lên Meal Plan (gửi học viên mới) | Meal Plan questionnaire (send to new clients) |
| `coach.chua_the_tai_tai_khoan_luc` | Chưa thể tải tài khoản lúc này. Kiểm tra mạng rồi tải lại trang. Mã hỗ trợ: {p0}. | Your account can't load right now. Check your connection and reload the page. Support code: {p0}. |
| `coach.hoc_vien_da_o_trong_nhom` | Học viên đã ở trong nhóm này. | The client is already in this group. |
| `coach.da_chuyen_sang_nhom` | Đã chuyển {p0} sang nhóm {p1}. | Moved {p0} to group {p1}. |
| `coach.chua_the_doi_nhom` | Chưa thể đổi nhóm: {p0} | Couldn't change the group: {p0} |
| `coach.toan_bo_giao_an_lich_su` | Toàn bộ giáo án, lịch sử tập, dinh dưỡng, check-in, ảnh và tài khoản đăng nhập của {p0} sẽ bị xóa vĩnh viễn khỏi hệ thống. | All programs, training history, nutrition, check-ins, photos and the login account of {p0} will be permanently deleted from the system. |
| `coach.nhap_de_xac_nhan` | Nhập “{p0}” để xác nhận | Type “{p0}” to confirm |
| `coach.dang_xoa` | Đang xóa… | Deleting… |
| `coach.da_xoa_toan_bo_du_lieu` | Đã xóa toàn bộ dữ liệu của {p0}. | Deleted all data for {p0}. |
| `coach.chua_the_xoa_du_lieu` | Chưa thể xóa dữ liệu: {p0} | Couldn't delete the data: {p0} |
| `coach.sua_biet_danh` | Sửa biệt danh | Edit nickname |
| `coach.biet_danh_ngan_de_phan_biet` | Biệt danh ngắn để phân biệt học viên này với người có tên gần giống (tối đa 24 ký tự). Để trống để xoá.<br><br>Chỉ hiện trong bảng điều khiển của bạn. Nên đặt trung tính, vì học viên có thể thấy dữ liệu hồ sơ của chính họ. | A short nickname to tell this client apart from someone with a similar name (up to 24 characters). Leave empty to remove.\n\nOnly shown in your dashboard. Keep it neutral, since clients can see their own profile data. |
| `coach.biet_danh` | Biệt danh | Nickname |
| `coach.da_luu_biet_danh` | Đã lưu biệt danh. | Nickname saved. |
| `coach.da_xoa_biet_danh` | Đã xoá biệt danh. | Nickname removed. |
| `coach.chua_luu_duoc_biet_danh_kiem` | Chưa lưu được biệt danh. Kiểm tra mạng rồi thử lại. | Couldn't save the nickname. Check your connection and try again. |
| `coach.hoc_vien_2` | {p0} học viên | {p0} clients |
| `coach.chua_co_hoc_vien_trong_nhom` | Chưa có học viên trong nhóm này. Thêm ở mục “+ Thêm học viên” phía trên, hoặc đổi nhóm trong hồ sơ học viên. | No clients in this group yet. Add one with “+ Add a client” above, or change the group in a client's profile. |
| `coach.tuan_nay` | {p0} · tuần này {p1} | {p0} · this week {p1} |
| `coach.khan` | {p0} khẩn | {p0} urgent |
| `coach.nhom_cho` | Nhóm cho {p0} | Group for {p0} |
| `coach.hay_chon_nhom_cho_hoc_vien` | Hãy chọn nhóm cho học viên. | Choose a group for the client. |
| `coach.da_dua_vao_nhom` | Đã đưa {p0} vào nhóm {p1}. | Added {p0} to group {p1}. |
| `coach.hay_chon_nhom_hoc_vien` | Hãy chọn nhóm học viên. | Choose a client group. |
| `coach.da_tao_ho_so_trong_nhom` | Đã tạo hồ sơ trong nhóm {p0}. | Profile created in group {p0}. |
| `coach.hoc_vien_dang_chon` | Học viên đang chọn | Selected client |
| `coach.p_class_small_note_dang_tai` | <p class="small-note">Đang tải 20 buổi gần nhất…</p> | <p class="small-note">Loading the last 20 sessions…</p> |
| `coach.hay_ghi_lai_ly_do_de` | Hãy ghi lại lý do để quyết định này có đủ bối cảnh. | Write down the reason so this decision has enough context. |
| `coach.vua_ghi_nhan` | Vừa ghi nhận | Just recorded |
| `coach.nac_progression` | Nấc progression | Progression step |
| `coach.co_che_progression` | Cơ chế progression | Progression scheme |
| `coach.set_ke_hoach` | Set kế hoạch | Planned sets |
| `coach.rep_moi_set` | Rep mỗi set | Reps per set |
| `coach.set_bat_dau` | Set bắt đầu | Starting sets |
| `coach.rep_bat_dau` | Rep bắt đầu | Starting reps |
| `coach.ta_tung_set` | Tạ từng set | Load per set |
| `coach.rep_muc_tieu_tung_set` | Rep mục tiêu từng set | Target reps per set |
| `coach.nguong_set_duoi` | Ngưỡng set dưới | Lower set threshold |
| `coach.nguong_set_tren` | Ngưỡng set trên | Upper set threshold |
| `coach.rir_muc_tieu` | RIR mục tiêu | Target RIR |
| `coach.tong_rep_muc_tieu` | Tổng rep mục tiêu | Total target reps |
| `coach.set_ket_thuc` | Set kết thúc | Ending sets |
| `coach.buoc_tang_rep` | Bước tăng rep | Rep increment |
| `coach.rep_muc_duoi` | Rep mức dưới | Rep range low |
| `coach.rep_muc_tren` | Rep mức trên | Rep range high |
| `coach.rir_thap_nhat_duoc_tang_ta` | RIR thấp nhất được tăng tạ | Lowest RIR that still adds weight |
| `coach.buoc_tang_ta` | Bước tăng tạ | Weight increment |
| `coach.giu_progression` | Giữ progression | Hold progression |
| `coach.canh_bao_dang_mo` | {p0} cảnh báo đang mở | {p0} open alerts |
| `coach.p_class_small_note_khong_co` | <p class="small-note">Không có cảnh báo đang mở.</p> | <p class="small-note">No open alerts.</p> |
| `coach.dau_kho_chiu` | Đau/khó chịu · {p0} | Pain/discomfort · {p0} |
| `coach.dau_khop_dang_chu_y_chua` | Đau khớp đáng chú ý · chưa xác định bài | Notable joint pain · exercise not identified |
| `coach.progression_dang_duoc_giu_cho_bai` | Progression đang được giữ cho bài này. | Progression is on hold for this exercise. |
| `coach.he_thong_khong_de_xuat_tang` | Hệ thống không đề xuất tăng volume cho đến khi David xử lý. | The system won't suggest more volume until David handles it. |
| `coach.bao_lan` | {p0} Báo {p1} lần · {p2} | {p0} Reported {p1} times · {p2} |
| `coach.tiep_tuc_giu` | Tiếp tục giữ | Keep holding |
| `coach.cho_phep_progression_lai` | Cho phép progression lại | Allow progression again |
| `coach.dong_canh_bao` | Đóng cảnh báo | Close alert |
| `coach.da_luu_quyet_dinh_xu_ly` | Đã lưu quyết định xử lý cảnh báo. | Alert decision saved. |
| `coach.chua_the_xu_ly_canh_bao` | Chưa thể xử lý cảnh báo: {p0} | Couldn't handle the alert: {p0} |
| `coach.p_class_small_note_chua_co` | <p class="small-note">Chưa có thay đổi được ghi nhận.</p> | <p class="small-note">No changes recorded yet.</p> |
| `coach.david_dieu_chinh` |  · David điều chỉnh | · Adjusted by David |
| `coach.an_toan` |  · An toàn | · Safety |
| `coach.bai_tap_ban_co_the_chinh` | {p0} bài tập · Bạn có thể chỉnh sửa trước khi kích hoạt. | {p0} exercises · You can edit them before activating. |
| `coach.chu_ky_dang_hoat_dong` | CHU KỲ ĐANG HOẠT ĐỘNG | ACTIVE CYCLE |
| `coach.khong_co_phase_active` | (không có Phase active) | (no active phase) |
| `coach.hay_hoan_tat_hoac_huy_ban` | Hãy hoàn tất hoặc hủy bản nháp hiện tại trước. | Finish or discard the current draft first. |
| `coach.p_class_small_note_chua_co_2` | <p class="small-note">Chưa có chu kỳ đang chạy.</p> | <p class="small-note">No cycle running.</p> |
| `coach.da_dat_muc_tieu_chu_ky` | Đã đặt mục tiêu chu kỳ: {p0}. | Cycle goal set: {p0}. |
| `coach.da_bo_muc_tieu_cua_chu` | Đã bỏ mục tiêu của chu kỳ. | Cycle goal removed. |
| `coach.chua_luu_duoc_muc_tieu` | Chưa lưu được mục tiêu: {p0} | Couldn't save the goal: {p0} |
| `coach.hoc_vien_da_co_mot_chu` | Học viên đã có một chu kỳ bản nháp. | The client already has a draft cycle. |
| `coach.them_buoi_vao` | Thêm buổi vào “{p0}” | Add sessions to “{p0}” |
| `coach.chu_ky_1` | Chu kỳ 1 | Cycle 1 |
| `coach.chon_them_toan_bo_buoi_nhan` | Chọn thêm toàn bộ buổi/nhãn. Nếu trùng tên, hệ thống sẽ tự tách thành buổi riêng để tránh gộp bài. | Pick whole sessions/labels to add. Duplicate names are split into separate sessions automatically so exercises don't merge. |
| `coach.chon_toan_bo_buoi_nhan_tu` | Chọn toàn bộ buổi/nhãn từ giáo án của học viên hoặc thư viện. Bản nháp chưa hiển thị cho học viên. | Pick whole sessions/labels from the client's program or the library. The draft isn't visible to the client yet. |
| `coach.them_vao_ban_nhap` | Thêm vào bản nháp | Add to draft |
| `coach.p_class_phase_source_empty_khong` | <p class="phase-source-empty">Không có buổi phù hợp.</p> | <p class="phase-source-empty">No matching sessions.</p> |
| `coach.chon_buoi_tu` | Chọn buổi {p0} từ {p1} | Choose session {p0} from {p1} |
| `coach.dang_hoat_dong` | Đang hoạt động | Active |
| `coach.da_luu_tru` | Đã lưu trữ | Archived |
| `coach.mau` | Mẫu | Template |
| `coach.giao_an_cu` | Giáo án cũ | Old program |
| `coach.bai_tap_2` | {p0} · {p1} bài tập | {p0} · {p1} exercises |
| `coach.xem_bai_tap` | Xem bài tập | See exercises |
| `coach.da_chon_buoi_bai_tap_ban` | Đã chọn {p0} buổi · {p1} bài tập. Bạn sẽ chỉnh sửa bản nháp trước khi kích hoạt. | Chose {p0} sessions · {p1} exercises. You'll edit the draft before activating it. |
| `coach.nhap_ten_chu_ky` | Nhập tên chu kỳ. | Enter a cycle name. |
| `coach.chon_it_nhat_mot_buoi_tap` | Chọn ít nhất một buổi tập cho chu kỳ. | Choose at least one session for the cycle. |
| `coach.dang_tao_ban_nhap` | Đang tạo bản nháp… | Creating draft… |
| `coach.da_them_buoi_vao_ban_nhap` | Đã thêm buổi vào bản nháp. | Sessions added to the draft. |
| `coach.da_tao_ban_nhap_hay_kiem` | Đã tạo bản nháp. Hãy kiểm tra và chỉnh sửa trước khi kích hoạt. | Draft created. Check and edit it before activating. |
| `coach.chua_the_them_buoi` | Chưa thể thêm buổi:  | Couldn't add sessions: |
| `coach.chua_the_tao_ban_nhap` | Chưa thể tạo bản nháp:  | Couldn't create the draft: |
| `coach.xem_giao_an_hien_tai` | Xem giáo án hiện tại | See the current program |
| `coach.kich_hoat_cho_hoc_vien_chu` | Kích hoạt “{p0}” cho học viên? Chu kỳ hiện tại sẽ được lưu trữ và học viên sẽ chuyển sang giáo án mới. | Activate “{p0}” for the client? The current cycle is archived and the client moves to the new program. |
| `coach.chua` | Chưa | Not yet |
| `coach.dang_kich_hoat` | Đang kích hoạt… | Activating… |
| `coach.da_kich_hoat_chu_ky_moi` | Đã kích hoạt chu kỳ mới. Chu kỳ cũ được lưu trữ nguyên vẹn. | New cycle activated. The old cycle is archived intact. |
| `coach.huy_ban_nhap_chi_du_lieu` | Hủy bản nháp “{p0}”? Chỉ dữ liệu trong bản nháp bị xóa; giáo án hiện tại không thay đổi. | Discard draft “{p0}”? Only the draft's data is deleted; the current program doesn't change. |
| `coach.dang_huy` | Đang hủy… | Discarding… |
| `coach.da_huy_ban_nhap_giao_an` | Đã hủy bản nháp. Giáo án hiện tại không thay đổi. | Draft discarded. The current program doesn't change. |
| `coach.da_chon_chu_ky` | Đã chọn {p0} chu kỳ. | {p0} cycles selected. |
| `coach.cham_vao_chu_ky_da_luu` | Chạm vào chu kỳ đã lưu trữ để chọn. | Tap archived cycles to select them. |
| `coach.bo_chon_tat_ca` | Bỏ chọn tất cả | Deselect all |
| `coach.xoa_chu_ky` | Xóa {p0} chu kỳ | Delete {p0} cycles |
| `coach.va_chu_ky_khac` | {p0} và {p1} chu kỳ khác | {p0} and {p1} other cycles |
| `coach.da_xoa_chu_ky_co_the` | Đã xóa {p0} chu kỳ. Có thể khôi phục ở mục “Đã xóa”. | Deleted {p0} cycles. You can restore them under “Deleted”. |
| `coach.da_khoi_phuc` | Đã khôi phục {p0}. | Restored {p0}. |
| `coach.da_xoa_2` | Đã xóa ({p0}) | Deleted ({p0}) |
| `coach.xoa_ngay` | · xóa ngày {p0} | · deleted {p0} |
| `coach.khoi_phuc` | Khôi phục | Restore |
| `coach.p_class_small_note_chua_co_3` | <p class="small-note">Chưa có chu kỳ nào.</p> | <p class="small-note">No cycles yet.</p> |
| `coach.hien_tai` | Hiện tại | Current |
| `coach.chua_kich_hoat` | Chưa kích hoạt | Not activated |
| `coach.ban_nhap` | Bản nháp | Draft |
| `coach.chon` | Chọn {p0} | Select {p0} |
| `coach.da_khoa_tong_ket` | Đã khóa tổng kết | Review locked |
| `coach.chua_co_tong_ket_cho_lan` | Chưa có tổng kết cho lần chạy này | No review for this run yet |
| `coach.kich_hoat_lai_chu_ky_nay` | Kích hoạt lại chu kỳ này | Reactivate this cycle |
| `coach.bai_tap_3` | {p0} bài tập: {p1} | {p0} exercises: {p1} |
| `coach.kich_hoat_lai_du_lieu_va` | Kích hoạt lại “{p0}”? Dữ liệu và progression cũ của chu kỳ này sẽ được tiếp tục. | Reactivate “{p0}”? This cycle's data and progression carry on. |
| `coach.kich_hoat_lai` | Kích hoạt lại | Reactivate |
| `coach.da_kich_hoat_lai_chu_ky` | Đã kích hoạt lại chu kỳ cùng dữ liệu cũ. | Cycle reactivated with its old data. |
| `coach.duoi_muc_volume_thuong_tao_thay` | Dưới mức volume thường tạo thay đổi rõ trong ngắn hạn | Below the volume that usually brings clear short-term change |
| `coach.baseline_thap_phu_hop_de_quan` | Baseline thấp — phù hợp để quan sát đáp ứng | Low baseline — good for watching the response |
| `coach.vung_thuc_hanh_thuong_dung_10` | Vùng thực hành thường dùng (10–20 set/tuần) | Common working range (10–20 sets/week) |
| `coach.volume_cao_chi_giu_khi_phuc` | Volume cao — chỉ giữ khi phục hồi và hiệu suất xác nhận | High volume — keep only while recovery and performance confirm it |
| `coach.em_class_volume_frequency_paused_tam` | <em class="volume-frequency-paused">tạm nghỉ</em> | <em class="volume-frequency-paused">paused</em> |
| `coach.so_lan_tap_buoi_moi_tuan` | Số lần tập buổi {p0} mỗi tuần | Times per week for session {p0} |
| `coach.tuan` | / tuần | / week |
| `coach.span_class_small_note_chu_ky` | <span class="small-note">Chu kỳ này chưa có bài tập.</span> | <span class="small-note">This cycle has no exercises yet.</span> |
| `coach.hay_tao_chu_ky_truoc_khi` | Hãy tạo chu kỳ trước khi lưu tần suất tuần. | Create a cycle before saving the weekly frequency. |
| `coach.ke_hoach` | Kế hoạch: | Plan: |
| `coach.set_tuan_7_ngay_qua` | set/tuần · 7 ngày qua: | sets/week · last 7 days: |
| `coach.tb_4_8_12_tuan` | TB 4 / 8 / 12 tuần: {p0} · {p1} · {p2} | Avg 4 / 8 / 12 weeks: {p0} · {p1} · {p2} |
| `coach.12_tuan_gan_nhat` | 12 tuần gần nhất | Last 12 weeks |
| `coach.p_class_small_note_chua_co_4` | <p class="small-note">Chưa có dữ liệu volume để hiển thị.</p> | <p class="small-note">No volume data to show yet.</p> |
| `coach.chua_co_check_in_phuc_hoi_2` | Chưa có check-in phục hồi của học viên. Hệ thống sẽ không đề xuất tăng volume khi thiếu dữ liệu này. | No recovery check-ins from the client yet. The system won't suggest more volume without this data. |
| `coach.gan_day` | gần đây | recent |
| `coach.met_moi_5_dau_khop_3` | · Mệt mỏi {p0}/5 · Đau khớp {p1}/3 · Hiệu suất {p2}/3{p3}{p4} | · Fatigue {p0}/5 · Joint pain {p1}/3 · Performance {p2}/3{p3}{p4} |
| `coach.p_class_small_note_chua_co_5` | <p class="small-note">Chưa có bài trong chu kỳ đang chạy.</p> | <p class="small-note">No exercises in the running cycle.</p> |
| `coach.bai` | bài | exercises |
| `coach.tien_bo` | tiến bộ | progressing |
| `coach.chung_2` | chững | stalled |
| `coach.giam_2` | giảm | down |
| `coach.chua_du_du_lieu` | chưa đủ dữ liệu | not enough data |
| `coach.khac_giao_an_2` | khác giáo án | off plan |
| `coach.tu_lan_dau` | · {p0}{p1}% từ lần đầu | · {p0}{p1}% since the first time |
| `coach.tong_rep_gan_nhat` | Tổng rep gần nhất | Latest total reps |
| `coach.e1rm_gan_nhat` | e1RM gần nhất | Latest e1RM |
| `coach.theo_doi_bang_rep` |  Theo dõi bằng rep. | Tracked by reps. |
| `coach.p_class_small_note_khong_co_2` | <p class="small-note">Không có bài nào ở trạng thái này.</p> | <p class="small-note">No exercises with this status.</p> |
| `coach.can_david_xem` | Cần David xem | Needs David's review |
| `coach.on_dinh` | Ổn định | Stable |
| `coach.can_xem` | cần xem | needs review |
| `coach.theo_doi` | theo dõi | watch |
| `coach.on_dinh_2` | ổn định | stable |
| `coach.p_class_small_note_chua_co_6` | <p class="small-note">Chưa có bài dùng RIR set cuối trong chu kỳ này, hoặc chưa có buổi tập được ghi nhận.</p> | <p class="small-note">No exercise uses last-set RIR in this cycle yet, or no sessions saved.</p> |
| `coach.chua_du_cap_du_lieu` | chưa đủ cặp dữ liệu | not enough data pairs |
| `coach.thieu` | · thiếu {p0} | · missing {p0} |
| `coach.tuan_lan` | {p0} tuần · {p1} lần | {p0} weeks · {p1} times |
| `coach.lech_tb` | Lệch TB {p0}{p1} | Avg gap {p0}{p1} |
| `coach.lan_gan_nhat` | Lần gần nhất · {p0} | Latest · {p0} |
| `coach.rir_thuc_te` | RIR · Thực tế | RIR · Actual |
| `coach.p_class_small_note_ban_preview` | <p class="small-note">Bản Preview chưa thể đọc dữ liệu Stage 4 cho tới khi bộ quy tắc đã được duyệt và xuất bản. Các chức năng hiện tại vẫn giữ nguyên.</p> | <p class="small-note">The Preview build can't read Stage 4 data until the rules are approved and published. Existing features are unchanged.</p> |
| `coach.chua_dat` | chưa đặt | not set |
| `coach.chua_can_deload` | Chưa cần deload | No deload needed yet |
| `coach.len_lich_deload` | Lên lịch deload | Schedule a deload |
| `coach.bat_dau_deload` | Bắt đầu deload | Start deload |
| `coach.da_hoan_tat_deload` | Đã hoàn tất deload | Deload done |
| `coach.bo_de_xuat` | Bỏ đề xuất | Dismiss suggestion |
| `coach.p_class_small_note_hoc_vien` | <p class="small-note">Học viên chưa có chu kỳ đang hoạt động.</p> | <p class="small-note">The client has no active cycle.</p> |
| `coach.chua_thay_nhu_cau_deload` | Chưa thấy nhu cầu deload | No sign a deload is needed |
| `coach.theo_doi_them` | Theo dõi thêm | Keep watching |
| `coach.can_nhac_deload` | Cân nhắc deload | Consider a deload |
| `coach.uu_tien_xem_lai_an_toan` | Ưu tiên xem lại an toàn | Review safety first |
| `coach.p_class_small_note_chua_co_7` | <p class="small-note">Chưa có tín hiệu đủ mạnh để đề xuất deload.</p> | <p class="small-note">No signal strong enough to suggest a deload yet.</p> |
| `coach.thieu_du_lieu` | Thiếu dữ liệu: {p0} | Missing data: {p0} |
| `coach.p_class_small_note_chua_co_8` | <p class="small-note">Chưa có quyết định deload được lưu.</p> | <p class="small-note">No deload decision saved yet.</p> |
| `coach.tong_ket_bat_buoc_truoc_khi` | Tổng kết bắt buộc trước khi đổi chu kỳ | Required review before changing cycle |
| `coach.snapshot_se_khoa_du_lieu_tai` | Snapshot sẽ khóa dữ liệu tại thời điểm xác nhận. Sau đó chỉ có thể thêm phụ lục có lý do và thời gian. | The snapshot locks the data at the moment you confirm. After that you can only add addenda with a reason and a time. |
| `coach.dieu_da_hieu_qua` | Điều đã hiệu quả | What worked |
| `coach.bai_tap_cau_truc_hoac_cach` | Bài tập, cấu trúc hoặc cách hướng dẫn đã phát huy hiệu quả | Exercises, structure or coaching cues that worked |
| `coach.dieu_can_thay_doi` | Điều cần thay đổi | What to change |
| `coach.diem_nghen_ve_hieu_suat_phuc` | Điểm nghẽn về hiệu suất, phục hồi, RIR, volume hoặc tuân thủ | Bottlenecks in performance, recovery, RIR, volume or adherence |
| `coach.quyet_dinh_cho_chu_ky_tiep` | Quyết định cho chu kỳ tiếp theo | Decision for the next cycle |
| `coach.giu_tang_giam_hoac_doi_cau` | Giữ, tăng, giảm hoặc đổi cấu trúc — và lý do | Keep, increase, decrease or restructure — and why |
| `coach.ghi_chu_them_tuy_chon` | Ghi chú thêm (tuỳ chọn) | Extra notes (optional) |
| `coach.xem_lai_va_khoa_tong_ket` | Xem lại và khóa tổng kết | Review and lock |
| `coach.lich_chu_ky` | Lịch chu kỳ | Cycle schedule |
| `coach.ket_thuc_du_kien` | Kết thúc dự kiến | Planned end |
| `coach.luu_lich` | Lưu lịch | Save schedule |
| `coach.de_xuat_deload` | Đề xuất deload | Deload suggestion |
| `coach.quyet_dinh_cua_david` | Quyết định của David | David's decision |
| `coach.quyet_dinh` | Quyết định | Decision |
| `coach.ngay_du_kien` | Ngày dự kiến | Planned date |
| `coach.vi_sao_david_chon_quyet_dinh` | Vì sao David chọn quyết định này? | Why did David choose this? |
| `coach.luu_quyet_dinh` | Lưu quyết định | Save decision |
| `coach.phu_luc` | Phụ lục | Addenda |
| `coach.ly_do_2` | Lý do: {p0} | Reason: {p0} |
| `coach.p_class_small_note_chua_co_9` | <p class="small-note">Chưa có phụ lục.</p> | <p class="small-note">No addenda yet.</p> |
| `coach.tong_ket_da_khoa` | Tổng kết đã khóa | Locked review |
| `coach.buoi` | {p0} / {p1} buổi{p2} | {p0} / {p1} sessions{p2} |
| `coach.hieu_qua` | Hiệu quả: | Worked: |
| `coach.can_doi` | Cần đổi: | To change: |
| `coach.chu_ky_sau` | Chu kỳ sau: | Next cycle: |
| `coach.noi_dung_phu_luc` | Nội dung phụ lục | Addendum text |
| `coach.ly_do_bo_sung` | Lý do bổ sung | Reason for adding |
| `coach.them_phu_luc` | Thêm phụ lục | Add addendum |
| `coach.da_luu_lich_chu_ky` | Đã lưu lịch chu kỳ. | Cycle schedule saved. |
| `coach.da_luu_quyet_dinh_cua_david` | Đã lưu quyết định của David. Giáo án không bị tự động thay đổi. | David's decision saved. The program doesn't change automatically. |
| `coach.khoa_ban_tong_ket_nay_sau` | Khóa bản tổng kết này? Sau khi xác nhận không thể sửa nội dung gốc; chỉ có thể thêm phụ lục có lý do. | Lock this review? Once confirmed the original can't be edited; you can only add addenda with a reason. |
| `coach.khoa_tong_ket` | Khóa tổng kết | Lock review |
| `coach.chua_khoa` | Chưa khóa | Not yet |
| `coach.da_khoa_tong_ket_chu_ky` | Đã khóa tổng kết chu kỳ. | Cycle review locked. |
| `coach.da_them_phu_luc_ban_tong` | Đã thêm phụ lục. Bản tổng kết gốc vẫn giữ nguyên. | Addendum added. The original review stays as it was. |
| `coach.da_luu_tan_suat_tuan_cho` | Đã lưu tần suất tuần cho chu kỳ này. | Weekly frequency saved for this cycle. |
| `coach.chua_the_sap_xep` | Chưa thể sắp xếp | Couldn't reorder |
| `coach.chua_the_sap_xep_bai_tap` | Chưa thể sắp xếp bài tập lúc này. Hãy tải lại trang rồi thử lại. | Exercises can't be reordered right now. Reload the page and try again. |
| `coach.da_luu_2` | Đã lưu | Saved |
| `coach.da_tai_lai_ban_moi` | Đã tải lại bản mới | Reloaded the latest version |
| `coach.giao_an_vua_duoc_chinh_o` | Giáo án vừa được chỉnh ở một phiên khác. Hệ thống đã tải lại thứ tự mới nhất. | The program was just changed in another session. The latest order has been reloaded. |
| `coach.chua_tai_lai_duoc` | Chưa tải lại được | Couldn't reload |
| `coach.giao_an_da_thay_doi_o` | Giáo án đã thay đổi ở phiên khác nhưng chưa thể tải lại. Hãy kiểm tra mạng và tải lại trang. | The program changed in another session but couldn't be reloaded. Check your connection and reload the page. |
| `coach.chua_luu_duoc` | Chưa lưu được | Couldn't save |
| `coach.chua_the_luu_thu_tu_thu` | Chưa thể lưu thứ tự. Thứ tự cũ đã được khôi phục; bạn có thể thử lại. | Couldn't save the order. The old order is back; you can try again. |
| `coach.ban_nhap_2` | Bản nháp · {p0} | Draft · {p0} |
| `coach.them_bai_vao_ban_nhap` | + Thêm bài vào bản nháp | + Add exercise to the draft |
| `coach.khong_nhan` | Không nhãn | No label |
| `coach.giao_an_trong_hoc_vien_da` | Giáo án trống — học viên đã bỏ hết các bài bên dưới. | Empty program — the client has removed all the exercises below. |
| `coach.chua_co_bai_tap_nao_trong` | Chưa có bài tập nào trong giáo án. | No exercises in the program yet. |
| `coach.bai_tap_4` | {p0} bài tập | {p0} exercises |
| `coach.thead_tr_th_class_assignment_drag` | <thead><tr><th class="assignment-drag-cell" aria-label="Sắp xếp"></th><th></th><th>Bài tập</th><th>Kiểu tiến bộ</th><th>Trạng thái hiện tại</th><th></th></tr></thead> | <thead><tr><th class="assignment-drag-cell" aria-label="Reorder"></th><th></th><th>Exercise</th><th>Progression</th><th>Current state</th><th></th></tr></thead> |
| `coach.rir_set_cuoi` | RIR set cuối | Last-set RIR |
| `coach.tang_rep_roi_tang_ta` | Tăng rep rồi tăng tạ | Add reps, then weight |
| `coach.apre_plus_set_theo_tuan` | APRE (Plus Set, theo tuần) | APRE (Plus Set, weekly) |
| `coach.set_rep_ta` | Set→rep→tạ | Sets→reps→weight |
| `coach.kg_set_tong_rep` | {p0} kg{p1} · {p2} set · tổng {p3} rep | {p0} kg{p1} · {p2} sets · {p3} total reps |
| `coach.trong_luong_co_the_set_rep` | Trọng lượng cơ thể × {p0} set × {p1} rep | Bodyweight × {p0} sets × {p1} reps |
| `coach.ta_tu_chon_buoi_dau` | Tạ tự chọn buổi đầu | Load chosen in the first session |
| `coach.kg_khi_du_rep` | · +{p0} kg khi đủ rep | · +{p0} kg once the reps are hit |
| `coach.set_rep_nac` | {p0} × {p1} set × {p2} rep · Nấc {p3}: {p4} | {p0} × {p1} sets × {p2} reps · Step {p3}: {p4} |
| `coach.xem_video_ky_thuat_2` | Xem video kỹ thuật | Watch technique video |
| `coach.buoi_lien_tiep_chua_dat_can` | {p0} buổi liên tiếp chưa đạt — cân nhắc reset | {p0} sessions in a row missed — consider a reset |
| `coach.keo_de_sap_xep_phim_mui` | Kéo để sắp xếp · Phím mũi tên để di chuyển · Shift + mũi tên để đổi buổi | Drag to reorder · Arrow keys to move · Shift + arrow to change session |
| `coach.sap_xep_mui_ten_len_xuong` | Sắp xếp {p0}. Mũi tên lên xuống để đổi thứ tự; giữ Shift để chuyển buổi. | Reorder {p0}. Up and down arrows change the order; hold Shift to move to another session. |
| `coach.se_bi_xoa_vinh_vien_khoi` | “{p0}” sẽ bị xóa vĩnh viễn khỏi buổi {p1}. Bài tập gốc trong thư viện và template vẫn được giữ nguyên. | “{p0}” will be permanently removed from session {p1}. The exercise in the library and templates is kept. |
| `coach.mo_lai_buoi` | Mở lại buổi | Reopen session |
| `coach.an_buoi_nay` | Ẩn buổi này | Hide this session |
| `coach.hoc_vien_se_thay_buoi_nay` | Học viên sẽ thấy buổi này trở lại và tập bình thường. | The client will see this session again and train it as normal. |
| `coach.hoc_vien_van_thay_buoi_nay` | Học viên vẫn thấy buổi này nhưng được ghi “tạm nghỉ” và không bấm vào tập được. Bài tập, mức tạ và tiến trình giữ nguyên. | The client still sees this session, marked “paused”, and can't start it. Exercises, loads and progress are kept. |
| `coach.dang_mo` | Đang mở… | Reopening… |
| `coach.dang_an` | Đang ẩn… | Hiding… |
| `coach.da_mo_lai_buoi` | Đã mở lại buổi {p0}. | Session {p0} reopened. |
| `coach.da_an_buoi_hoc_vien_thay` | Đã ẩn buổi {p0}. Học viên thấy buổi này là “tạm nghỉ”; bài tập và tiến trình được giữ nguyên. | Session {p0} hidden. The client sees it as “paused”; exercises and progress are kept. |
| `coach.chua_the_doi_trang_thai_buoi` | Chưa thể đổi trạng thái buổi tập: {p0} | Couldn't change the session's state: {p0} |
| `coach.cac_bai_nay_chua_co_nhan` | Các bài này chưa có nhãn buổi. Hãy gán nhãn cho từng bài bằng nút sửa bài tập. | These exercises have no session label. Give each one a label with the edit button. |
| `coach.doi_ten_buoi_nay_cho_hoc` | Đổi tên buổi này cho học viên. Bài tập, mức tạ và tiến trình giữ nguyên. | Rename this session for the client. Exercises, loads and progress are kept. |
| `coach.hoc_vien_da_bo` | Học viên đã bỏ | Removed by the client |
| `coach.nhung_bai_nay_hoc_vien_da` | Những bài này học viên đã bỏ trong lúc tập và chọn lưu vào giáo án. Chúng không còn được tính vào khối lượng tập dự kiến. | The client removed these during a session and chose to save that to the program. They no longer count towards planned training volume. |
| `coach.bo_ngay` | · bỏ ngày {p0} | · removed {p0} |
| `coach.bai_tap_5` | bài tập | exercises |
| `coach.dua_tro_lai` | Đưa trở lại | Put back |
| `coach.thoi` | Thôi | Never mind |
| `coach.dang_khoi_phuc` | Đang khôi phục… | Restoring… |
| `coach.da_dua_tro_lai_buoi` | Đã đưa “{p0}” trở lại buổi {p1}. | Put “{p0}” back in session {p1}. |
| `coach.chua_the_khoi_phuc_bai_tap` | Chưa thể khôi phục bài tập. Hãy tải lại trang rồi thử lại. | Couldn't restore the exercise. Reload the page and try again. |
| `coach.tha_vao` | {p0} · Thả vào {p1} | {p0} · Drop into {p1} |
| `coach.tha_bai_vao_vi_tri_moi` | Thả bài vào vị trí mới | Drop the exercise in its new place |
| `coach.da_xoa_khoi_buoi` | Đã xóa {p0} khỏi buổi {p1}. | Removed {p0} from session {p1}. |
| `coach.chua_the_xoa_bai_tap` | Chưa thể xóa bài tập: {p0} | Couldn't remove the exercise: {p0} |
| `coach.doi_ten_buoi_2` | Đổi tên buổi “{p0}” | Rename session “{p0}” |
| `coach.va_buoi_van_o_trang_thai` | , và buổi vẫn ở trạng thái tạm nghỉ | , and the session stays paused |
| `coach.buoi_nay_co_bai_tap_tat` | Buổi này có {p0} bài tập. Tất cả bài, mức tạ và tiến trình được giữ nguyên{p1}. | This session has {p0} exercises. All exercises, loads and progress are kept{p1}. |
| `coach.nhung_buoi_da_tap_truoc_day` | Những buổi đã tập trước đây vẫn hiện tên cũ trong lịch sử, vì lúc đó buổi mang tên ấy. | Sessions trained before still show the old name in the history, since that was the name then. |
| `coach.dang_doi` | Đang đổi… | Renaming… |
| `coach.da_doi_ten_buoi_thanh` | Đã đổi tên buổi “{p0}” thành “{p1}”. | Renamed session “{p0}” to “{p1}”. |
| `coach.chua_the_doi_ten_buoi` | Chưa thể đổi tên buổi: {p0} | Couldn't rename the session: {p0} |
| `coach.sua_bai_tap` | Sửa bài tập | Edit exercise |
| `coach.bai_tap_cu` | Bài tập cũ ( | Old exercise ( |
| `coach.khong_con_trong_danh_sach_vui` | ) không còn trong danh sách. Vui lòng chọn bài thay thế trước khi lưu. | ) is no longer in the list. Choose a replacement before saving. |
| `coach.ta_hien_tai` | Tạ hiện tại | Current load |
| `coach.ta_khoi_diem` | Tạ khởi điểm | Starting load |
| `coach.set_rep_muc_tieu` | Set {p0} · Rep mục tiêu | Set {p0} · Target reps |
| `coach.set_tu_den_set` | {p0} set · từ {p1} đến {p2} set | {p0} sets · from {p1} to {p2} sets |
| `coach.bat_rep_out_test_de_hieu` | Bật rep-out test để hiệu chỉnh RIR | Turn on rep-out tests to calibrate RIR |
| `coach.nhac_moi_so_lan_tap` | Nhắc mỗi số lần tập | Remind every N sessions |
| `coach.he_thong_chi_so_sanh_rir` | Hệ thống chỉ so sánh RIR dự đoán với số rep thực tế còn làm được; David vẫn là người quyết định cuối cùng. | The system only compares the predicted RIR with the reps actually left; David still makes the final call. |
| `coach.chuan_no_luc_sbs` | Chuẩn nỗ lực SBS | SBS effort standard |
| `coach.dinh_nghia_diem_dung` | Định nghĩa điểm dừng | Stopping-point definition |
| `coach.overwarm_single_8_truoc_work_set` | Overwarm single @8 trước work set | Overwarm single @8 before work sets |
| `coach.single_8_chi_ghi_nhan_va` | Single @8 chỉ ghi nhận và hỗ trợ David đánh giá. Stage 5 không tự thay đổi tạ trong ngày hay Training Max. | The single @8 is only logged to help David assess. Stage 5 doesn't change the day's load or the Training Max by itself. |
| `coach.set_rep_ta_2` | Set → rep → tạ | Sets → reps → weight |
| `coach.doi_co_che_se_dat_lai` | Đổi cơ chế sẽ đặt lại trạng thái progression của riêng bài này sau khi David xác nhận lý do. | Changing the scheme resets this exercise's progression state after David confirms the reason. |
| `coach.training_max_hien_tai_kg` | Training Max hiện tại (kg) | Current Training Max (kg) |
| `coach.training_max_khoi_diem_kg` | Training Max khởi điểm (kg) | Starting Training Max (kg) |
| `coach.kieu_tien_bo` | Kiểu tiến bộ: | Progression: |
| `coach.giu_rep_co_dinh_tap_den` | — giữ rep cố định, tập đến ngưỡng RIR dừng; Training Max thay đổi theo số set hoàn thành so với khung dưới/trên. | — fixed reps, train to the stopping RIR; the Training Max changes with the sets completed against the lower/upper range. |
| `coach.rir_dung` | RIR dừng | Stopping RIR |
| `coach.lam_tron_ta_kg` | Làm tròn tạ (kg) | Round load to (kg) |
| `coach.vd_100_bat_dau_bao_thu` | VD: 100 — bắt đầu bảo thủ | E.g. 100 — start conservative |
| `coach.nghi_giua_set_giay` | Nghỉ giữa set (giây) | Rest between sets (seconds) |
| `coach.p_class_small_note_sua_so` | <p class="small-note">Sửa số này nếu muốn điều chỉnh lại — VD: reset sau khi học viên bị chững nhiều buổi liên tiếp.</p> | <p class="small-note">Change this to adjust again — e.g. a reset after the client stalls several sessions in a row.</p> |
| `coach.rir_set_cuoi_autoregulation` | RIR set cuối (autoregulation) | Last-set RIR (autoregulation) |
| `coach.dieu_chinh_training_max_moi_buoi` | — điều chỉnh Training Max mỗi buổi dựa trên số set hoàn thành & RIR thực tế. | — adjusts the Training Max each session from the sets completed and the actual RIR. |
| `coach.so_set` | Số set | Sets |
| `coach.rir_muc_tieu_set_cuoi` | RIR mục tiêu (set cuối) | Target RIR (last set) |
| `coach.vd_60_bat_dau_bao_thu` | VD: 60 — bắt đầu bảo thủ | E.g. 60 — start conservative |
| `coach.cac_set_dau_theo_rep_ke` | — các set đầu theo rep kế hoạch, set cuối rep-out; Training Max đổi theo bucket SBS. | — the first sets follow the planned reps, the last set is a rep-out; the Training Max changes by SBS bucket. |
| `coach.rep_cac_set_dau` | Rep các set đầu | Reps for the first sets |
| `coach.rep_out_target_set_cuoi` | Rep-out target (set cuối) | Rep-out target (last set) |
| `coach.vd_80_bat_dau_bao_thu` | VD: 80 — bắt đầu bảo thủ | E.g. 80 — start conservative |
| `coach.ta_hien_tai_kg` | Tạ hiện tại (kg) | Current load (kg) |
| `coach.ta_khoi_diem_kg` | Tạ khởi điểm (kg) | Starting load (kg) |
| `coach.giu_set_rep_co_dinh_hoan` | — giữ set × rep cố định; hoàn thành đủ mới tăng tạ theo 3% hoặc nấc tạ nhỏ nhất, lấy mức lớn hơn. | — fixed sets × reps; complete them all to add 3% or the smallest plate step, whichever is larger. |
| `coach.tang_ta` | Tăng tạ (%) | Weight increase (%) |
| `coach.nac_ta_nho_nhat_kg` | Nấc tạ nhỏ nhất (kg) | Smallest load step (kg) |
| `coach.thuc_hien_du_so_set_den` | — thực hiện đủ số set đến chuẩn thất bại kỹ thuật; khi tổng rep đạt mục tiêu, lần sau tăng 3% hoặc nấc tạ nhỏ nhất. | — do all sets to technical failure; once total reps reach the target, add 3% or the smallest step next time. |
| `coach.so_set_co_dinh` | Số set cố định | Fixed sets |
| `coach.moi_set_co_rep_va_muc` | — mỗi set có rep và mức tạ riêng; set nào đạt mục tiêu thì chỉ set đó tăng tạ ở lần sau. | — each set has its own reps and load; only a set that hits its target gets more weight next time. |
| `coach.them_set` | + Thêm set | + Add set |
| `coach.bot_set` | − Bớt set | − Remove set |
| `coach.tang_ta_khi_set_dat` | Tăng tạ khi set đạt (%) | Increase when a set hits (%) |
| `coach.set_hien_tai` | Set hiện tại | Current sets |
| `coach.set_khoi_diem` | Set khởi điểm | Starting sets |
| `coach.rep_hien_tai` | Rep hiện tại | Current reps |
| `coach.rep_khoi_diem` | Rep khởi điểm | Starting reps |
| `coach.tang_dan_so_set_tu_muc` | — tăng dần số set từ mức đầu đến mức cuối; khi đạt set cuối, quay về set đầu và tăng rep. Không tự tăng tạ. | — adds sets from the start level to the end level; at the last level it goes back to the first and adds reps. Never adds weight by itself. |
| `coach.ta_tuan_nay_kg` | Tạ tuần này (kg) | This week's load (kg) |
| `coach.ta_tuan_dau_kg` | Tạ tuần đầu (kg) | First week's load (kg) |
| `coach.da_tinh_cho_tuan_sau` | Đã tính cho tuần sau: | Worked out for next week: |
| `coach.tu_sua_ta_tuan_nay_se` | (từ {p0}). Sửa tạ tuần này sẽ bỏ mức này. | (from {p0}). Editing this week's load drops it. |
| `coach.moi_set_cung_muc_ta_set` | — mọi set cùng mức tạ, set cuối tập tối đa. Rep Plus Set so với mục tiêu quyết định mức tạ tuần sau: ít hơn từ 4 rep −5% · 2–3 rep −4% · 1 rep −3% · đạt đúng giữ nguyên · nhiều hơn 1 rep +1% · 2 rep +2% · 3 rep +3% · từ 4 rep +5%. Đổi ít hơn một nấc thì đi đúng một nấc. Mức mới áp dụng từ thứ Hai tuần sau. | — every set at the same load, last set as many reps as possible. Plus Set reps against the target set next week's load: 4+ short −5% · 2–3 short −4% · 1 short −3% · on target, no change · 1 over +1% · 2 over +2% · 3 over +3% · 4+ over +5%. A change smaller than one step moves exactly one step. The new load applies from next Monday. |
| `coach.so_set_gom_plus_set` | Số set (gồm Plus Set) | Sets (including the Plus Set) |
| `coach.rep_muc_tieu_moi_set` | Rep mục tiêu mỗi set | Target reps per set |
| `coach.buoc_tang_ta_kg` | Bước tăng tạ (kg) | Load step (kg) |
| `coach.kg_bo_trong_hoc_vien_tu` | {p0} (kg, bỏ trống: học viên tự chọn) | {p0} (kg, leave empty: the client chooses) |
| `coach.giu_so_set_moi_buoi_du` | — giữ số set; mỗi buổi đủ rep thì thêm 1 rep; đủ rep mức trên ở mọi set thì tăng tạ một bước và quay về rep mức dưới. Không tự thêm set, không tự giảm tạ. | — fixed sets; each session that hits the reps adds 1 rep; once every set hits the top of the range, add one load step and go back to the bottom. Never adds sets or lowers the load by itself. |
| `coach.rir_muc_tieu_goi_y_diem` | RIR mục tiêu (gợi ý điểm dừng) | Target RIR (suggested stopping point) |
| `coach.tang_set_tang_rep` | Tăng set → tăng rep | Add sets → add reps |
| `coach.tang_set_tang_rep_tang_ta` | Tăng set → tăng rep → tăng tạ | Add sets → add reps → add weight |
| `coach.bai_bodyweight_nay_khong_tu_tang` | Bài bodyweight này không tự tăng tạ; David sẽ điều chỉnh góc tập hoặc độ khó khi cần. | This bodyweight exercise never adds load by itself; David adjusts the angle or difficulty when needed. |
| `coach.moi_lan_hoan_thanh_thanh_cong` | Mỗi lần hoàn thành thành công tăng một nấc; sau nấc tạ sẽ lặp lại với mức tạ mới. | Each successful session moves up one step; after the weight step it repeats at the new load. |
| `coach.tang_ta_khi_het_chu_ky` | Tăng tạ khi hết chu kỳ (%) | Weight increase at the end of the cycle (%) |
| `coach.label_muc_tai_label_input_type` | <label>Mức tải</label><input type="hidden" id="p-workingWeight" value="0"><p class="small-note">Trọng lượng cơ thể · không tự tăng tạ</p> | <label>Load</label><input type="hidden" id="p-workingWeight" value="0"><p class="small-note">Bodyweight · never adds load by itself</p> |
| `coach.vd_10_bat_dau_bao_thu` | VD: 10 — bắt đầu bảo thủ | E.g. 10 — start conservative |
| `coach.va_ta_hien_tai` |  (và Tạ hiện tại) | (and Current load) |
| `coach.set_rep_bat_dau` | Set/Rep bắt đầu | Starting sets/reps |
| `coach.va` | và | and |
| `coach.ket_thuc` | kết thúc | ending |
| `coach.chi_dinh_pham_vi_tien_bo` | chỉ định phạm vi tiến bộ (áp dụng cho chu kỳ sau) — không tự cập nhật số set/rep học viên đang tập. Sửa | set the progression range (applies to the next cycle) — they don't update the sets/reps the client is doing now. Edit |
| `coach.set_rep_hien_tai` | Set/Rep hiện tại | Current sets/reps |
| `coach.neu_muon_dieu_chinh_ngay_so` | {p0} nếu muốn điều chỉnh ngay số đang tập — VD: reset sau khi học viên bị chững nhiều buổi liên tiếp. | {p0} to adjust what they're doing right now — e.g. a reset after the client stalls several sessions in a row. |
| `coach.rep_ket_thuc` | Rep kết thúc | Ending reps |
| `coach.buoc_tang_set` | Bước tăng set | Set step |
| `coach.nac_progression_hien_tai` | Nấc progression hiện tại | Current progression step |
| `coach.david_co_the_chinh_thu_cong` | David có thể chỉnh thủ công khi cần. Dữ liệu lịch sử không bị sửa. | David can adjust this by hand when needed. History is not changed. |
| `coach.quy_doi_volume` | Quy đổi volume | Volume credit |
| `coach.mac_dinh_co_chinh_1_set` | Mặc định: cơ chính 1 set, cơ phụ 0,5 set. David có thể sửa. Baseline set được đồng bộ với số set hiện tại của bài. | Default: primary muscle 1 set, secondary 0.5 set. David can edit. Baseline sets follow the exercise's current set count. |
| `coach.baseline_set_lan_tap` | Baseline set / lần tập | Baseline sets / session |
| `coach.ky_thuat_da_on_dinh` | Kỹ thuật đã ổn định | Technique is stable |
| `coach.hay_chon_it_nhat_mot_nhom` | Hãy chọn ít nhất một nhóm cơ được tính volume. | Choose at least one muscle group to count volume for. |
| `coach.giong_buoi` | Giống buổi | Like session |
| `coach.co_phai_ban_muon_go` | Có phải bạn muốn gõ | Did you mean |
| `coach.neu_giu_nguyen_bai_nay_se` | {p0} “{p1}”? Nếu giữ nguyên, bài này sẽ nằm ở một buổi mới tên “{p2}”. | {p0} “{p1}”? If you keep it, this exercise goes into a new session called “{p2}”. |
| `coach.dung` | Dùng “{p0}” | Use “{p0}” |
| `coach.buoi_khop` | Buổi khớp | Matching sessions |
| `coach.buoi_trong_giao_an_nay` | Buổi trong giáo án này | Sessions in this program |
| `coach.tam_nghi` |  · tạm nghỉ | · paused |
| `coach.bai_2` | {p0} bài{p1} | {p0} exercises{p1} |
| `coach.goi_y_buoi_moi` | Gợi ý buổi mới | New session ideas |
| `coach.tu_chu_ky_truoc` | Từ chu kỳ trước | From the last cycle |
| `coach.ten_hay_dung` | Tên hay dùng | Common names |
| `coach.bai_nay_se_nam_trong_buoi` | Bài này sẽ nằm trong buổi “{p0}” (đang có {p1} bài). | This exercise goes into session “{p0}” ({p1} exercises there now). |
| `coach.chon_mot_buoi_o_tren_hoac` | Chọn một buổi ở trên, hoặc gõ đủ tên để tạo buổi mới “{p0}”. | Pick a session above, or type the full name to create a new session “{p0}”. |
| `coach.chua_co_buoi_nao_ten_nhu` | Chưa có buổi nào tên như vậy. Bài này sẽ nằm trong buổi mới “{p0}”. | No session has that name yet. This exercise goes into a new session “{p0}”. |
| `coach.nhap_nhan_buoi_tap_vd_a` | Nhập nhãn buổi tập (VD: A, Upper1…) | Enter a session label (e.g. A, Upper1…) |
| `coach.nguong_set_tren_phai_lon_hon` | Ngưỡng set trên phải lớn hơn hoặc bằng ngưỡng set dưới. | The upper set threshold must be at least the lower one. |
| `coach.nhap_training_max` | Nhập Training Max. | Enter the Training Max. |
| `coach.ban_vua_doi_sang_bai_tap` | Bạn vừa đổi sang bài tập khác — hãy nhập Training Max khởi điểm mới cho bài này trước khi lưu. | You switched to another exercise — enter a new starting Training Max for it before saving. |
| `coach.nhap_ta_khoi_diem` | Nhập tạ khởi điểm. | Enter the starting load. |
| `coach.set_hien_tai_phai_nam_trong` | Set hiện tại phải nằm trong khoảng set bắt đầu và set kết thúc. | Current sets must be between the starting and ending sets. |
| `coach.can_so_set_va_rep_muc` | Cần số set và rep mục tiêu từ 1 trở lên. | Sets and target reps must be 1 or more. |
| `coach.nhap_nac_ta_nho_nhat` | Nhập nấc tạ nhỏ nhất. | Enter the smallest load step. |
| `coach.nhap_muc_ta_tuan_dau` | Nhập mức tạ tuần đầu. | Enter the first week's load. |
| `coach.can_so_set_tu_1_tro` | Cần số set từ 1 trở lên và rep mức trên không nhỏ hơn rep mức dưới. | Sets must be 1 or more, and the top of the rep range can't be below the bottom. |
| `coach.rep_hien_tai_phai_nam_trong` | Rep hiện tại phải nằm trong khoảng rep mức dưới và mức trên. | Current reps must be within the rep range. |
| `coach.nhap_buoc_tang_ta` | Nhập bước tăng tạ. | Enter the load step. |
| `coach.ban_vua_doi_sang_bai_tap_2` | Bạn vừa đổi sang bài tập khác — hãy nhập tạ khởi điểm mới cho bài này trước khi lưu. | You switched to another exercise — enter a new starting load for it before saving. |
| `coach.nhap_ta` | Nhập tạ. | Enter the load. |
| `coach.co_che_progression_khong_hop_le` | Cơ chế progression không hợp lệ. | Invalid progression scheme. |
| `coach.loi_khi_luu_bai_tap` | Lỗi khi lưu bài tập:  | Error saving the exercise: |
| `coach.tien_bo_2` | Tiến bộ | Progressed |
| `coach.tap_thay` | {p0} → tập thay: {p1} | {p0} → did instead: {p1} |
| `coach.hoc_vien_tap_them` | {p0} (học viên tập thêm) | {p0} (client's extra) |
| `coach.set_rep_tung_set` | {p0} set — rep từng set: {p1} | {p0} sets — reps per set: {p1} |
| `coach.kg_set_rep_tung_set` | {p0} kg{p1} × {p2} set — rep từng set: {p3} | {p0} kg{p1} × {p2} sets — reps per set: {p3} |
| `coach.rir_set_cuoi_2` | (RIR set cuối: {p0}) | (last-set RIR: {p0}) |
| `coach.chuan_diem_dung` | Chuẩn điểm dừng: {p0} | Stopping standard: {p0} |
| `coach.uoc_luong_sat` | ước lượng sát | close estimate |
| `coach.can_xem_lai` | cần xem lại | needs review |
| `coach.can_hieu_chinh_rir` | cần hiệu chỉnh RIR | needs RIR calibration |
| `coach.rep_out_test_du_doan_rir` | Rep-out test: dự đoán {p0} RIR · còn {p1} rep · {p2} | Rep-out test: predicted {p0} RIR · {p1} reps left · {p2} |
| `coach.chua_the_tai_them_lich_su` | Chưa thể tải thêm lịch sử: {p0} | Couldn't load more history: {p0} |
| `coach.p_class_small_note_chua_co_10` | <p class="small-note">Chưa có buổi tập nào được ghi nhận.</p> | <p class="small-note">No sessions saved yet.</p> |
| `coach.phut` | · {p0} phút | · {p0} min |
| `coach.ket_thuc_som` | Kết thúc sớm · {p0}{p1} | Ended early · {p0}{p1} |
| `coach.buoi_2` | Buổi {p0} | Session {p0} |
| `coach.kg_set_rep_set_cuoi_rep` | {p0} kg{p1} · {p2} set × {p3} rep · set cuối rep-out {p4} rep | {p0} kg{p1} · {p2} sets × {p3} reps · last-set rep-out {p4} reps |
| `coach.bo_qua_trong_rieng_buoi_nay` | Bỏ qua trong riêng buổi này | Skipped in this session only |
| `coach.nghi_giay` | · Nghỉ {p0} giây | · Rest {p0} s |
| `coach.ly_do_3` | · Lý do: {p0}{p1} | · Reason: {p0}{p1} |
| `coach.bai_goc_khong_tinh_vao_tien` |  (bài gốc — không tính vào tiến độ buổi này) | (original exercise — not counted in this session's progress) |
| `coach.khong_cap_nhat_tien_trinh` |  · Không cập nhật tiến trình | · Progress not updated |
| `coach.hoc_vien_dieu_chinh_con_set` | · Học viên điều chỉnh còn {p0} set trong buổi | · The client reduced it to {p0} sets in the session |
| `coach.ta_khac_ke_hoach_kiem_tra` |  ⚠ tạ khác kế hoạch — kiểm tra lại với học viên | ⚠ load differs from the plan — check with the client |
| `coach.ke_hoach_2` | Kế hoạch: {p0}{p1}{p2}{p3}{p4}{p5} | Plan: {p0}{p1}{p2}{p3}{p4}{p5} |
| `coach.thuc_te` | Thực tế: {p0}{p1} | Actual: {p0}{p1} |
| `coach.xem_them_20_buoi` | Xem thêm 20 buổi | Show 20 more sessions |
| `coach.tab_track` | Theo dõi | Tracking |
| `coach.goal_label` | Mục tiêu | Goal |

## cj

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `cj.suc_tap_cung_bai_ta_hoac` | Sức tập: cùng bài, tạ hoặc rep tăng dần qua các tuần. | Training strength: same exercise, load or reps rising over the weeks. |
| `cj.anh_tien_trinh_chup_cung_dieu` | Ảnh tiến trình chụp cùng điều kiện ánh sáng. | Progress photos taken in the same lighting. |
| `cj.so_do_vong_tay_nguc_dui` | Số đo vòng (tay, ngực, đùi), nhất là khi cân nặng không đổi. | Body measurements (arms, chest, thighs), especially when weight doesn't change. |
| `cj.moi_tuan_mot_lan_nang_1` | Mỗi tuần một lần nâng 1 rep nặng ở RIR 1–3: thấy nhẹ hơn hoặc lên được tạ là đang tiến. | Once a week, lift one heavy rep at RIR 1–3: if it feels lighter or the weight goes up, they're progressing. |
| `cj.set_chinh_them_rep_o_cung` | Set chính: thêm rep ở cùng mức tạ, hoặc thêm tạ. | Main sets: more reps at the same load, or more load. |
| `cj.2_3_thang_tap_deu_ma` | 2–3 tháng tập đều mà sức tập, ảnh và số đo đều không đổi | 2–3 months of consistent training with no change in strength, photos or measurements |
| `cj.kiem_tra_rir_that_phan_lon` | Kiểm tra RIR thật: phần lớn set phải dừng ở RIR 1–2. Cho học viên thử một set tới thất bại để tự hiệu chỉnh. | Check real RIR: most sets should stop at RIR 1–2. Have the client take one set to failure to recalibrate. |
| `cj.kiem_tra_an_ngu_du_dam` | Kiểm tra ăn ngủ: đủ đạm, đủ calo, ngủ 7–9 tiếng. | Check food and sleep: enough protein, enough calories, 7–9 hours of sleep. |
| `cj.doi_sang_bai_keo_gian_co` | Đổi sang bài kéo giãn cơ nhiều hơn ở cuối biên độ. | Switch to exercises with more stretch at the end of the range. |
| `cj.them_1_2_set_cho_moi` | Thêm 1–2 set cho mỗi nhóm cơ, cứ 3–4 tuần thêm một lần (VD ngực 4 → 6 → 8 set/tuần). Có thể giữ vài tuần rồi giảm lại. | Add 1–2 sets per muscle group every 3–4 weeks (e.g. chest 4 → 6 → 8 sets/week). You can hold a few weeks, then reduce again. |
| `cj.8_12_tuan_ma_rep_nang` | 8–12 tuần mà rep nặng, set chính và 1RM đều không tăng | 8–12 weeks with no increase in heavy reps, main sets or 1RM |
| `cj.kiem_tra_an_ngu_truoc_du` | Kiểm tra ăn ngủ trước: đủ đạm, đủ calo, ngủ 7–9 tiếng. | Check food and sleep first: enough protein, enough calories, 7–9 hours of sleep. |
| `cj.them_1_2_set_moi_tuan` | Thêm 1–2 set mỗi tuần, 3–5 rep, ở các bài học viên muốn mạnh lên. | Add 1–2 sets a week of 3–5 reps on the lifts the client wants stronger. |
| `cj.don_them_phan_tap_vao_set` | Dồn thêm phần tập vào set 1–3 rep để quen tạ gần tối đa. | Put more work into sets of 1–3 reps to get used to near-max loads. |
| `cj.them_bien_the_cua_bai_chinh` | Thêm biến thể của bài chính (VD bench dừng lâu ở ngực, bench tay hẹp) bên cạnh bài chính, không thay thế. | Add variations of the main lift (e.g. long-pause bench, close-grip bench) alongside it, not instead of it. |
| `cj.con_tuan` | (còn {p0} tuần) | ({p0} weeks left) |
| `cj.kiem_tra_1rm_vao_tuan_cua` | Kiểm tra 1RM vào tuần {p0}–{p1} của chu kỳ{p2}. | Test 1RM in weeks {p0}–{p1} of the cycle{p2}. |
| `cj.da_toi_tuan_len_lich_kiem` | Đã tới tuần {p0}: lên lịch kiểm tra 1RM cho 2–3 bài chính. Cho học viên nghỉ hẳn 3–4 ngày trước buổi kiểm tra. | Week {p0} reached: schedule a 1RM test for 2–3 main lifts. Give the client 3–4 full rest days before the test. |
| `cj.da_tuan_qua_tuan_nen_kiem` | Đã tuần {p0}, quá {p1} tuần: nên kiểm tra 1RM ngay khi tiện, sau 3–4 ngày nghỉ hẳn. | Week {p0}, {p1} weeks past: test 1RM as soon as convenient, after 3–4 full rest days. |
| `cj.p_class_small_note_chu_ky` | <p class="small-note">Chu kỳ này chưa có mục tiêu. Chọn mục tiêu ở thanh chu kỳ (tab Giáo án) để xem cách theo dõi, lịch kiểm tra 1RM và việc nên làm khi học viên chững lại.</p> | <p class="small-note">This cycle has no goal yet. Choose one in the cycle bar (Program tab) to see how to track it, when to test 1RM and what to do when the client stalls.</p> |
| `cj.kiem_tra_1rm` | Kiểm tra 1RM | 1RM test |
| `cj.theo_doi_tien_bo_bang` | Theo dõi tiến bộ bằng | Track progress by |
| `cj.tang_co` | tăng cơ | hypertrophy |
| `cj.suc_manh` | sức mạnh | strength |
| `cj.khi_hoc_vien_chung_lai` | Khi học viên chững lại{p0} | When the client stalls{p0} |
| `cj.chu_ky_chua_bat_dau` | Chu kỳ chưa bắt đầu | Cycle not started |
| `cj.tuan_cua_chu_ky` | Tuần {p0} của chu kỳ | Week {p0} of the cycle |
| `cj.chi_la_loi_nhac_khong_co` | Chỉ là lời nhắc. Không có gì tự đổi set, tạ hay giáo án. | Only a reminder. Nothing changes sets, loads or the program by itself. |
| `cj.3_lan_tap_chua_vuot_lan` | 3 lần tập chưa vượt lần đầu ({p0}{p1}); cần thêm 1 lần để kết luận. | 3 sessions without beating the first ({p0}{p1}); one more is needed to conclude. |
| `cj.moi_co_lan_tap_can_tu` | Mới có {p0} lần tập; cần từ {p1} lần. | Only {p0} sessions so far; {p1} are needed. |
| `cj.tb_2_lan_gan_nhat_thap` | TB 2 lần gần nhất {p0}{p1}, thấp hơn mức cao nhất {p2}{p3} ({p4}) {p5}%. | The last 2 average {p0}{p1}, {p5}% below the best of {p2}{p3} ({p4}). |
| `cj.3_lan_gan_nhat_chua_vuot` | 3 lần gần nhất {p0}, chưa vượt mức cao nhất {p1}{p2} ({p3}). | The last 3 sessions {p0} haven't beaten the best of {p1}{p2} ({p3}). |
| `cj.tu_len_cao_nhat` | Từ {p0} lên {p1}{p2} · cao nhất {p3}{p4} ({p5}). | From {p0} to {p1}{p2} · best {p3}{p4} ({p5}). |
| `cj.gan_day_co_lan_giam_set` | Gần đây có {p0} lần giảm set hoặc kết thúc sớm ở bài này. | Recently {p0} sessions with fewer sets or an early finish on this exercise. |
| `cj.xem_phuc_hoi_can_nhac_tang` | Xem phục hồi; cân nhắc tăng độ khó (biến thể khó hơn, thêm tạ) hoặc thêm 1 set. | Check recovery; consider making it harder (harder variation, more load) or adding 1 set. |
| `cj.xem_phuc_hoi_va_rir_can` | Xem phục hồi và RIR; cân nhắc thêm 1 set, đổi biến thể bài, hoặc đổi kiểu tăng tiến. | Check recovery and RIR; consider adding 1 set, changing the variation, or changing the progression scheme. |
| `cj.xem_dau_ngu_dinh_duong_va` | Xem đau, ngủ, dinh dưỡng và check-in phục hồi; cân nhắc giảm tạ hoặc deload.{p0} | Check pain, sleep, nutrition and recovery check-ins; consider less load or a deload.{p0} |
| `cj.chua_co_lan_tap_nao_duoc` | Chưa có lần tập nào được ghi nhận. | No sessions recorded yet. |
| `cj.co_canh_bao_dau_can_xu` | Có cảnh báo đau cần xử lý trước | There's a pain alert to handle first |
| `cj.dau_khop_dang_duoc_theo_doi` | Đau khớp đang được theo dõi | Joint pain is being watched |
| `cj.canh_bao_dau_chua_duoc_giai` | {p0} cảnh báo đau chưa được giải quyết. | {p0} pain alerts not resolved. |
| `cj.hieu_suat_giam_lap_lai` | Hiệu suất giảm lặp lại | Repeated performance drop |
| `cj.buoi_gan_nhat_co_bai_giam` | {p0}/{p1} buổi gần nhất có bài giảm hiệu suất. | {p0}/{p1} recent sessions had an exercise drop in performance. |
| `cj.phuc_hoi_kem_lap_lai` | Phục hồi kém lặp lại | Repeated poor recovery |
| `cj.check_in_gan_nhat_bao_met` | {p0}/{p1} check-in gần nhất báo mệt cao hoặc hiệu suất giảm. | {p0}/{p1} recent check-ins reported high fatigue or lower performance. |
| `cj.kha_nang_hoan_thanh_giao_an` | Khả năng hoàn thành giáo án giảm | Lower ability to complete the program |
| `cj.buoi_gan_nhat_co_giam_set` | {p0}/{p1} buổi gần nhất có giảm set, bỏ bài hoặc kết thúc sớm. | {p0}/{p1} recent sessions had fewer sets, skipped exercises or an early finish. |
| `cj.rir_lech_ke_hoach_lap_lai` | RIR lệch kế hoạch lặp lại | RIR off plan repeatedly |
| `cj.bai_lech_tu_2_rir_tro` | {p0} bài lệch từ 2 RIR trở lên trong hai lần liên tiếp. | {p0} exercises off by 2+ RIR twice in a row. |
| `cj.bai_thieu_rir_set_cuoi_trong` | {p0} bài thiếu RIR set cuối trong hai lần liên tiếp. | {p0} exercises missing last-set RIR twice in a row. |
| `cj.chua_co_buoi_tap_thuoc_chu` | Chưa có buổi tập thuộc chu kỳ này. | No sessions in this cycle yet. |
| `cj.chua_co_check_in_phuc_hoi` | Chưa có check-in phục hồi trong chu kỳ. | No recovery check-ins in this cycle. |
| `cj.chua_co_du_lieu_rir_phu` | Chưa có dữ liệu RIR phù hợp để hiệu chỉnh. | No suitable RIR data to calibrate yet. |
| `cj.chua_dat_ngay_du_kien_ket` | Chưa đặt ngày dự kiến kết thúc chu kỳ. | No planned end date for the cycle. |
| `cj.hay_hoan_thanh_ba_phan_dieu` | Hãy hoàn thành ba phần: điều hiệu quả, điều cần thay đổi và quyết định cho chu kỳ tiếp theo. | Fill in all three parts: what worked, what to change, and the decision for the next cycle. |
| `cj.chu_ky_hien_tai` | chu kỳ hiện tại | the current cycle |
| `cj.hay_hoan_thanh_va_khoa_tong` | Hãy hoàn thành và khóa tổng kết “{p0}” trước khi kích hoạt chu kỳ khác. | Complete and lock the review of “{p0}” before activating another cycle. |
| `cj.con_canh_bao_dau_nghiem_trong` | Còn {p0} cảnh báo đau nghiêm trọng chưa xử lý. | {p0} serious pain alerts still open. |
| `cj.buoi_tap_khong_hop_le` | Buổi tập không hợp lệ. | Invalid session. |
| `cj.day_la_buoi_tap_duy_nhat` | Đây là buổi tập duy nhất còn lại. Ẩn nốt thì học viên mở app ra sẽ không còn gì để tập. | This is the only session left. Hide it and the client will have nothing to train when they open the app. |
| `cj.tat_ca_nhom` | Tất cả nhóm | All groups |
| `cj.tat_ca_van_de` | Tất cả vấn đề | All issues |
| `cj.tat_ca_trang_thai` | Tất cả trạng thái | All statuses |
| `cj.hang_doi_moi_ngay` | Hàng đợi mỗi ngày | Daily queue |
| `cj.can_david_xem_lai` | Cần David xem lại | Needs David's review |
| `cj.nhung_diem_anh_huong_an_toan` | Những điểm ảnh hưởng an toàn, tiến trình và trải nghiệm học viên được gom về một nơi. | Everything affecting safety, progress and the client experience, in one place. |
| `cj.cap_nhat_truc_tiep` | ● Cập nhật trực tiếp | ● Live updates |
| `cj.tom_tat_canh_bao` | Tóm tắt cảnh báo | Alert summary |
| `cj.tim_hoc_vien_hoac_van_de` | Tìm học viên hoặc vấn đề | Search clients or issues |
| `cj.vi_du_hai_phong_dau_vai` | Ví dụ: Hải Phong, đau vai… | E.g. a client name, shoulder pain… |
| `cj.nhom` | Nhóm | Group |
| `cj.loai` | Loại | Type |
| `cj.trang_thai` | Trạng thái | Status |
| `cj.7_ngay_gan_day` | 7 ngày gần đây | Last 7 days |
| `cj.cu_hon_14_ngay` | Cũ hơn 14 ngày | Older than 14 days |
| `cj.mo_lai` | Mở lại | Reopen |
| `cj.sao_chep_ma_ho_tro` | Sao chép mã hỗ trợ | Copy support code |
| `cj.da_sao_chep` | Đã sao chép | Copied |
| `cj.mo_ho_so_hoc_vien` | Mở hồ sơ học viên → | Open client profile → |
| `cj.cu_hon_14_ngay_2` | · {p0} cũ hơn 14 ngày | · {p0} older than 14 days |
| `cj.bai` | {p0}{p1} · {p2} bài{p3} | {p0}{p1} · {p2} exercises{p3} |
| `cj.da_xem_tat_ca` | Đã xem tất cả ({p0}) | Mark all reviewed ({p0}) |
| `cj.da_xem_tat_ca_2` | Đã xem tất cả | Mark all reviewed |
| `cj.theo_doi_thuong_ngay` | Theo dõi thường ngày | Routine tracking |
| `cj.tin_hieu_he_thong_thuong_gap` | Tín hiệu hệ thống thường gặp: giữ progression, giảm set, bỏ bài. Gom theo học viên, không đòi xử lý từng cái. | Common system signals: progression held, fewer sets, skipped exercises. Grouped by client; no need to handle each one. |
| `cj.tai_them_20_canh_bao` | Tải thêm 20 cảnh báo | Load 20 more alerts |
| `cj.can_xem` | Cần xem | To review |
| `cj.uu_tien_ngay` | Ưu tiên ngay | Urgent |
| `cj.loi_ky_thuat` | Lỗi kỹ thuật | Technical errors |
| `cj.dang_xu_ly` | Đang xử lý | In progress |
| `cj.div_class_review_state_dang_gom` | <div class="review-state">Đang gom các điểm cần xem…</div> | <div class="review-state">Gathering what needs review…</div> |
| `cj.chua_the_tai_dashboard_luc_nay` | Chưa thể tải dashboard lúc này. | The dashboard can't load right now. |
| `cj.kiem_tra_mang_roi_tai_lai` | Kiểm tra mạng rồi tải lại trang. Không có dữ liệu nào bị thay đổi. | Check your connection and reload the page. No data was changed. |
| `cj.phan_du_lieu_da_tai` | phần dữ liệu đã tải | the loaded data |
| `cj.bo_loc_nay` | bộ lọc này | this filter |
| `cj.ban_co_the_tai_them_de` | Bạn có thể tải thêm để tìm trong các cảnh báo cũ hơn. | You can load more to search older alerts. |
| `cj.mot_khoang_trong_tot_de_tap` | Một khoảng trống tốt để tập trung vào coaching trực tiếp. | A good gap to focus on direct coaching. |
| `cj.chua_thay_viec_ton_dong_trong` | Chưa thấy việc tồn đọng trong {p0}. | Nothing outstanding in {p0}. |
| `cj.can_xu_ly_ngay` | Cần xử lý ngay | Needs handling now |
| `cj.dau_de_xuat_deload_va_cac` | Đau, đề xuất deload và các tín hiệu an toàn. Luôn hiện đủ, kể cả khi đã cũ. | Pain, deload suggestions and safety signals. Always shown in full, even when old. |
| `cj.coaching_can_xem` | Coaching cần xem | Coaching to review |
| `cj.phan_hoi_hieu_suat_giam_hieu` | Phản hồi, hiệu suất giảm, hiệu chỉnh RIR và các việc cần mắt coach. | Feedback, performance drops, RIR calibration and anything that needs a coach's eye. |
| `cj.chi_chua_metadata_toi_thieu_khong` | Chỉ chứa metadata tối thiểu; không lưu mức tạ, reps, ghi chú hay kế hoạch dinh dưỡng. | Only minimal metadata; no loads, reps, notes or nutrition plans are stored. |
| `cj.quan_trong` | Quan trọng | Important |
| `cj.dau_kho_chiu` | Đau/khó chịu | Pain/discomfort |
| `cj.bo_bai` | Bỏ bài | Skipped exercise |
| `cj.giam_set` | Giảm set | Fewer sets |
| `cj.hieu_suat_giam` | Hiệu suất giảm | Performance drop |
| `cj.du_lieu_bat_thuong` | Dữ liệu bất thường | Unusual data |
| `cj.hieu_chinh_rir` | Hiệu chỉnh RIR | RIR calibration |
| `cj.tong_ket_chu_ky` | Tổng kết chu kỳ | Cycle review |
| `cj.lau_chua_tap` | Lâu chưa tập | Long time no training |
| `cj.lau_chua_ghi_dinh_duong` | Lâu chưa ghi dinh dưỡng | Long time no nutrition log |
| `cj.bai_chung` | Bài chững | Stalled exercise |
| `cj.bai_giam` | Bài giảm | Declining exercise |
| `cj.hom_nay` | hôm nay | today |
| `cj.ngay_truoc` | {p0} ngày trước | {p0} days ago |
| `cj.giam_xem_lai` | Giảm / xem lại | Reduce / review |
| `cj.hoc_vien_bao_dau_khop_dang` | Học viên báo đau khớp đáng kể. | The client reports significant joint pain. |
| `cj.phuc_hoi_hoac_hieu_suat_gan` | Phục hồi hoặc hiệu suất gần đây đang giảm. | Recovery or recent performance is dropping. |
| `cj.can_it_nhat_2_lan_tap` | Cần ít nhất 2 lần tập và một check-in trong 14 ngày gần đây. | Needs at least 2 sessions and one check-in in the last 14 days. |
| `cj.giu` | Giữ | Hold |
| `cj.hieu_suat_van_dang_tien_bo` | Hiệu suất vẫn đang tiến bộ; chưa cần thêm volume. | Performance is still improving; no extra volume needed yet. |
| `cj.co_the_tang` | Có thể tăng | Can increase |
| `cj.hieu_suat_da_chung_phuc_hoi` | Hiệu suất đã chững, phục hồi tốt, kỹ thuật ổn và set đủ gần thất bại. | Performance has stalled, recovery is good, technique is solid and sets are close enough to failure. |
| `cj.chua_xac_nhan_chung_hieu_suat` | chưa xác nhận chững hiệu suất | a performance plateau isn't confirmed |
| `cj.phuc_hoi_chua_du_tot` | phục hồi chưa đủ tốt | recovery isn't good enough |
| `cj.david_chua_xac_nhan_ky_thuat` | David chưa xác nhận kỹ thuật ổn định | David hasn't confirmed the technique is stable |
| `cj.chua_co_bang_chung_set_du` | chưa có bằng chứng set đủ gần thất bại | there's no evidence the sets are close enough to failure |
| `cj.dang_co_canh_bao_dau_khop` | đang có cảnh báo đau khớp cần David xử lý | there's a joint pain alert for David to handle |
| `cj.chua_tang_vi` | Chưa tăng vì {p0}. | Not increased because {p0}. |
| `cj.du_lieu_cu_chua_xac_dinh` | Dữ liệu cũ chưa xác định chu kỳ. Giữ để tham khảo, không dùng để hiệu chỉnh giáo án hiện tại. | Old data with no known cycle. Kept for reference, not used to adjust the current program. |
| `cj.kiem_tra_lai_du_lieu_rir` | Kiểm tra lại dữ liệu RIR trước khi điều chỉnh giáo án. | Re-check the RIR data before adjusting the program. |
| `cj.trao_doi_lai_cach_ghi_rir` | Trao đổi lại cách ghi RIR ở set cuối với học viên. | Go over how to log last-set RIR with the client again. |
| `cj.xem_lai_cach_danh_gia_rir` | Xem lại cách đánh giá RIR và cân nhắc giảm độ khó hoặc hiệu chỉnh Training Max. | Review how RIR is rated and consider lowering difficulty or adjusting the Training Max. |
| `cj.xem_lai_cach_danh_gia_rir_2` | Xem lại cách đánh giá RIR và cân nhắc tăng độ khó khi kỹ thuật, phục hồi vẫn tốt. | Review how RIR is rated and consider raising difficulty while technique and recovery stay good. |
| `cj.rir_dang_dao_dong_hai_huong` | RIR đang dao động hai hướng; ưu tiên hiệu chỉnh cách tự đánh giá trước khi đổi giáo án. | RIR swings both ways; calibrate self-rating first before changing the program. |
| `cj.can_it_nhat_hai_lan_tap` | Cần ít nhất hai lần tập có RIR hợp lệ để đánh giá. | Needs at least two sessions with valid RIR to assess. |
| `cj.giu_nguyen_va_theo_doi_them` | Giữ nguyên và theo dõi thêm; dữ liệu hiện chưa đủ liền mạch. | Keep as is and keep watching; the data isn't continuous enough yet. |
| `cj.rir_dang_bam_tuong_doi_sat` | RIR đang bám tương đối sát kế hoạch. Tiếp tục theo dõi. | RIR is tracking the plan fairly closely. Keep watching. |
| `cj.buoi_moi` | Buổi mới | New session |
| `cj.giao_an_truoc_chu_ky` | Giáo án trước chu kỳ | Pre-cycle program |
| `cj.buoi_mau` | Buổi mẫu | Sample session |
| `cj.chu_ky_chua_co_bai_tap` | Chu kỳ chưa có bài tập. | The cycle has no exercises. |
| `cj.can_thiet_lap_thong_so_truoc` | {p0}: cần thiết lập thông số trước khi kích hoạt. | {p0}: needs parameters before activation. |
| `cj.chua_co_muc_ta_khoi_diem` | {p0}: chưa có mức tạ khởi điểm. | {p0}: no starting load. |
| `cj.hoc_vien_co_buoi_tap_chua` | Học viên có buổi tập chưa ghi nhận. Hãy ghi nhận hoặc hủy buổi đang tập trước khi chuyển chu kỳ. | The client has an unlogged session. Log or cancel the session in progress before switching cycles. |
| `cj.ban_nhap_khong_con_kha_dung` | Bản nháp không còn khả dụng. Hãy tải lại trang. | The draft is no longer available. Please reload the page. |
| `cj.dang_co_nhieu_hon_mot_chu` | Đang có nhiều hơn một chu kỳ hoạt động. Không thể kích hoạt bản nháp. | More than one cycle is active. The draft can't be activated. |
| `cj.chua_the_kich_hoat` | Chưa thể kích hoạt: {p0} | Can't activate yet: {p0} |
| `cj.bai_khong_con_trong_thu_vien` | Bài {p0} không còn trong thư viện bài tập. Hãy chọn bài thay thế. | The exercise {p0} is no longer in the exercise library. Choose a replacement. |
| `cj.can_david_thiet_lap_thong_so` | {p0}: cần David thiết lập thông số. | {p0}: David needs to set the parameters. |
| `cj.kiem_tra_training_max_khung_set` | {p0}: kiểm tra Training Max, khung set, rep và RIR dừng. | {p0}: check the Training Max, set scheme, reps and stopping RIR. |
| `cj.kiem_tra_training_max_set_rep` | {p0}: kiểm tra Training Max, set, rep và cấu hình progression. | {p0}: check the Training Max, sets, reps and progression settings. |
| `cj.kiem_tra_training_max_set_rep_2` | {p0}: kiểm tra Training Max, set, rep-out target và cấu hình progression. | {p0}: check the Training Max, sets, rep-out target and progression settings. |
| `cj.kiem_tra_set_rep_buoc_tang` | {p0}: kiểm tra set, rep, bước tăng và nấc tạ nhỏ nhất. | {p0}: check sets, reps, increment and smallest load step. |
| `cj.kiem_tra_so_set_tong_rep` | {p0}: kiểm tra số set, tổng rep mục tiêu, bước tăng và tạ khởi điểm. | {p0}: check the number of sets, total target reps, increment and starting load. |
| `cj.kiem_tra_rep_va_ta_rieng` | {p0}: kiểm tra rep và tạ riêng cho từng set Reverse Pyramid. | {p0}: check the reps and load for each Reverse Pyramid set. |
| `cj.kiem_tra_set_bat_dau_ket` | {p0}: kiểm tra set bắt đầu/kết thúc, rep hiện tại và bước tăng rep. | {p0}: check the start/end sets, current reps and rep increment. |
| `cj.kiem_tra_set_rep_va_buoc` | {p0}: kiểm tra set, rep và bước tăng. | {p0}: check sets, reps and increment. |
| `cj.kiem_tra_buoc_tang_va_lam` | {p0}: kiểm tra bước tăng và làm tròn tạ. | {p0}: check the increment and load rounding. |
| `cj.kiem_tra_so_set_khoang_rep` | {p0}: kiểm tra số set, khoảng rep và RIR. | {p0}: check the number of sets, rep range and RIR. |
| `cj.kiem_tra_buoc_tang_ta` | {p0}: kiểm tra bước tăng tạ. | {p0}: check the load increment. |
| `cj.kiem_tra_so_set_rep_muc` | {p0}: kiểm tra số set, rep mục tiêu và nấc tạ. | {p0}: check the number of sets, target reps and load step. |
| `cj.chua_co_muc_ta_tuan_dau` | {p0}: chưa có mức tạ tuần đầu. | {p0}: no week-one load. |
| `cj.chua_co_co_che_progression_hop` | {p0}: chưa có cơ chế progression hợp lệ. | {p0}: no valid progression scheme. |
| `cj.can_thiet_lap_thoi_gian_nghi` | {p0}: cần thiết lập thời gian nghỉ. | {p0}: rest time needs to be set. |
| `cj.tai_lai_sau_khi_luu` | Tải lại sau khi lưu | Reload after saving |
| `cj.luu_thay_doi_giao_an` | Lưu thay đổi giáo án | Save program changes |
| `cj.dong_bo_buoi_tap_tam` | Đồng bộ buổi tập tạm | Sync temporary session |
| `cj.khoi_phuc_buoi_tap_tam` | Khôi phục buổi tập tạm | Restore temporary session |
| `cj.don_buoi_tap_tam` | Dọn buổi tập tạm | Clear temporary session |
| `cj.dong_bo_giua_thiet_bi` | Đồng bộ giữa thiết bị | Sync between devices |
| `cj.mo_tai_khoan` | Mở tài khoản | Open account |
| `cj.tai_dashboard` | Tải Dashboard | Load dashboard |
| `cj.loi_giao_dien` | Lỗi giao diện | Interface error |
| `cj.loi_xu_ly_nen` | Lỗi xử lý nền | Background processing error |
| `cj.chua_co` | chưa có | none yet |
| `cj.span_class_habit_row_flag_can` | <span class="habit-row-flag">Cần hỏi thăm</span> | <span class="habit-row-flag">Check in</span> |
| `cj.bo_lo_ngay_lien` | · bỏ lỡ {p0} ngày liền | · missed {p0} days in a row |
| `cj.chuoi_ngay_7_ngay` | Chuỗi {p0} ngày · 7 ngày {p1}{p2} | {p0}-day streak · 7 days {p1}{p2} |
| `cj.p_class_habit_overview_note_chua` | <p class="habit-overview-note">Chưa có học viên nào thiết lập thói quen.</p> | <p class="habit-overview-note">No client has set up habits yet.</p> |
| `cj.chua_thiet_lap` | Chưa thiết lập ({p0}): {p1}. | Not set up ({p0}): {p1}. |
| `cj.chua_tai_duoc` | Chưa tải được ({p0}): {p1}. | Couldn't load ({p0}): {p1}. |
| `cj.thoi_quen_cua_hoc_vien` | Thói quen của học viên | Client habits |
| `cj.mo_de_xem` | Mở để xem | Open to view |
| `cj.p_class_habit_overview_note_dang` | <p class="habit-overview-note">Đang tải thói quen của học viên…</p> | <p class="habit-overview-note">Loading client habits…</p> |
| `cj.chua_tai_duoc_2` | Chưa tải được | Couldn't load |
| `cj.p_class_habit_overview_note_is` | <p class="habit-overview-note is-error">Chưa tải được thói quen lúc này.</p><button type="button" class="btn btn-outline" data-reload>Thử lại</button> | <p class="habit-overview-note is-error">Couldn't load habits right now.</p><button type="button" class="btn btn-outline" data-reload>Try again</button> |
| `cj.can_hoi_tham` | {p0} cần hỏi thăm | {p0} to check in with |
| `cj.hoc_vien_dang_theo_doi` | {p0} học viên đang theo dõi | {p0} clients tracked |
| `cj.tai_lai` | Tải lại | Reload |
| `cj.da_tap_hom_nay` | Đã tập hôm nay | Trained today |
| `cj.nen_nhan_tin_hom_nay` | Nên nhắn tin hôm nay | Message today |
| `cj.canh_bao_khan_hoc_vien` | Cảnh báo khẩn · {p0} học viên | Urgent alerts · {p0} clients |
| `cj.canh_bao_khan` | Cảnh báo khẩn | Urgent alerts |
| `cj.ngay_chua_tap` | {p0} ngày chưa tập | {p0} days without training |
| `cj.chua_co_buoi_nao_vao_ngay` | chưa có buổi nào · vào {p0} ngày | no sessions yet · joined {p0} days ago |
| `cj.va_hoc_vien_nua_trong_danh` | và {p0} học viên nữa trong danh sách bên dưới. | and {p0} more clients in the list below. |
| `cj.p_class_today_clear_khong_ai` | <p class="today-clear">Không ai quá 7 ngày chưa tập. Một ngày nhẹ nhàng cho coaching trực tiếp.</p> | <p class="today-clear">Nobody has gone more than 7 days without training. A light day for direct coaching.</p> |
| `cj.da_ghi_buoi_tap` | đã ghi buổi tập | logged a session |
| `cj.da_tap_hom_nay_2` | Đã tập hôm nay ({p0}) | Trained today ({p0}) |
| `cj.hoc_vien_dang_duoc_cap_nhat` | {p0} học viên đang được cập nhật trạng thái tập luyện. | {p0} clients' training status is being updated. |
| `cj.hay_tap_nang_hon_giao_an` | Hay tập nặng hơn giáo án | Often trains heavier than the program |
| `cj.hay_tap_nhe_hon_giao_an` | Hay tập nhẹ hơn giáo án | Often trains lighter than the program |
| `cj.hay_tap_lech_giao_an_luc` | Hay tập lệch giáo án, lúc nặng lúc nhẹ | Often off program, sometimes heavier, sometimes lighter |
| `cj.lan_nang_hon` | {p0} lần nặng hơn | {p0}× heavier |
| `cj.lan_nhe_hon` | {p0} lần nhẹ hơn | {p0}× lighter |
| `cj.giao_an_tap` | {p0}: giáo án {p1} → tập {p2} | {p0}: program {p1} → trained {p2} |
| `cj.lan_gan_nhat_kg` | {p0} lần gần nhất: {p1}. {p2} (kg). | Last {p0} sessions: {p1}. {p2} (kg). |
| `cj.nhap_ten_moi_cho_buoi_tap` | Nhập tên mới cho buổi tập. | Enter a new name for the session. |
| `cj.ten_buoi_toi_da_ky_tu` | Tên buổi tối đa {p0} ký tự. | Session names can be at most {p0} characters. |
| `cj.ten_moi_giong_ten_hien_tai` | Tên mới giống tên hiện tại. | The new name is the same as the current one. |
| `cj.da_co_buoi_trong_giao_an` | Đã có buổi “{p0}” trong giáo án này. Hãy chọn tên khác — nếu muốn gộp hai buổi, hãy chuyển các bài sang buổi kia. | There's already a session “{p0}” in this program. Choose another name — to merge the two, move the exercises to the other session. |
| `cj.khong_tim_thay_bai_tap_trong` | Không tìm thấy bài tập trong chu kỳ đang chỉnh. | Exercise not found in the cycle being edited. |
| `cj.khong_xac_dinh_duoc_vi_tri` | Không xác định được vị trí hiện tại của bài tập. | Couldn't determine the exercise's current position. |
| `cj.chua_co_buoi_tap` | Chưa có buổi tập | No sessions yet |
| `cj.tap_hom_nay` | Tập hôm nay | Trained today |
| `cj.tap_hom_qua` | Tập hôm qua | Trained yesterday |
| `cj.tap_ngay_truoc` | Tập {p0} ngày trước | Trained {p0} days ago |
| `cj.chua_ghi_can_lan_nao` | Chưa ghi cân lần nào | Never logged weight |
| `cj.ngay_chua_ghi_can` | {p0} ngày chưa ghi cân | {p0} days without a weigh-in |
| `cj.chi_ghi_mon_ngay` | Chỉ ghi món {p0}/{p1} ngày | Logged food only {p0}/{p1} days |
| `cj.bua_du_dam_rau` | Bữa đủ đạm+rau | Meals with protein+veg |
| `cj.tick_bua` | Tick bữa | Meal ticks |
| `cj.chua_co_anh` | Chưa có ảnh | No photos yet |
| `cj.ngay_chua_chup_anh` | {p0} ngày chưa chụp ảnh | {p0} days without a photo |

## cx

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `cx.xoa_khoi_danh_sach` | Xóa {list} khỏi danh sách?<br><br>Lịch sử buổi tập và tổng kết vẫn giữ nguyên. Bạn có thể khôi phục ở mục “Đã xóa” cuối danh sách. | Remove {list} from the list?<br><br>Session history and reviews are kept. You can restore them under “Removed” at the end of the list. |
| `cx.kh_tt` | KH {plan} · TT {actual} | Plan {plan} · Actual {actual} |
| `cx.dua_tro_lai_buoi` | Đưa “{name}” trở lại buổi {day}?<br><br>Bài giữ nguyên mức tạ và lịch sử tiến bộ cũ, và sẽ nằm ở cuối buổi — bạn có thể kéo lên vị trí mong muốn. | Bring “{name}” back to session {day}?<br><br>The exercise keeps its load and past progress, and goes to the end of the session — you can drag it where you want. |
| `cx.hv_dieu_chinh_set` | Học viên điều chỉnh còn {n} set trong buổi | Client cut it to {n} sets in the session |
| `cx.danh_dau_da_xem` | Đánh dấu đã xem {n} cảnh báo “{type}” của {name}?<br><br>Bạn vẫn mở lại được từng cảnh báo sau đó. | Mark {n} “{type}” alerts for {name} as reviewed?<br><br>You can still reopen each alert afterwards. |

## ov

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `ov.tong_quan_hoc_vien_david_coaching` | Tổng quan học viên — David Coaching | Client overview — David Coaching |
| `ov.tong_quan_hoc_vien` | Tổng quan học viên | Client overview |
| `ov.khoang_thoi_gian` | Khoảng thời gian | Time range |
| `ov.che_do_xem` | Chế độ xem | View |
| `ov.dang_tai_du_lieu_hoc_vien` | Đang tải dữ liệu {p0} học viên… | Loading data for {p0} clients… |
| `ov.ngay` | {p0} ngày | {p0} days |
| `ov.tat_ca_hoc_vien` | ◀ Tất cả học viên | ◀ All clients |
| `ov.tat_ca_hoc_vien_2` | Tất cả học viên | All clients |
| `ov.hoc_vien` | học viên · | clients · |
| `ov.can_chu_y_ngay_gan_nhat` | cần chú ý · {p0} ngày gần nhất | need attention · last {p0} days |
| `ov.div_class_cu_card_ov_empty` | <div class="cu-card ov-empty">Chưa có học viên nào.</div> | <div class="cu-card ov-empty">No clients yet.</div> |
| `ov.can_chu_y_khi_khong_ghi` | Cần chú ý khi: không ghi cân từ {p0} ngày liền, tick bữa, bữa đủ đạm và rau (đơn giản) hoặc ngày ghi món (chi tiết) dưới {p1}%, hoặc quá {p2} ngày chưa chụp ảnh. | Needs attention when: no weigh-in for {p0} days in a row, meal ticks, meals with protein and veg (simple) or food-logging days (detailed) below {p1}%, or more than {p2} days without photos. |
| `ov.can_chu_y` | Cần chú ý | Needs attention |
| `ov.span_class_ov_chip_ov_chip` | <span class="ov-chip ov-chip-mode">Đơn giản</span> | <span class="ov-chip ov-chip-mode">Simple</span> |
| `ov.span_class_ov_chip_ov_chip_2` | <span class="ov-chip ov-chip-mode is-detailed">Chi tiết</span> | <span class="ov-chip ov-chip-mode is-detailed">Detailed</span> |
| `ov.chua_dat_so_bua` | Chưa đặt số bữa | Meals per day not set |
| `ov.bua_du_dam_rau` | {p0}/{p1} bữa đủ đạm+rau{p2} | {p0}/{p1} meals with protein+veg{p2} |
| `ov.ghi_mon_ngay` | ghi món {p0}/{p1} ngày{p2} | food logged {p0}/{p1} days{p2} |
| `ov.khong_tai_duoc_du_lieu_hoc` | Không tải được dữ liệu học viên này. | Couldn't load this client's data. |
| `ov.chua_co_so_lieu` | Chưa có số liệu | No data yet |
| `ov.chua_ghi_can` | Chưa ghi cân | No weigh-ins |
| `ov.tb_tuan` | {p0} · TB tuần {p1} | {p0} · weekly avg {p1} |
| `ov.ngay_2` | ngày | days |
| `ov.bo` | {p0} bộ{p1} | {p0} photo sets{p1} |
| `ov.span_class_ov_ok_on_span` | <span class="ov-ok">Ổn</span> | <span class="ov-ok">OK</span> |
| `ov.khong_tim_thay_hoc_vien` | Không tìm thấy học viên | Client not found |
| `ov.div_class_cu_card_ov_empty_2` | <div class="cu-card ov-empty">Học viên này không thuộc danh sách của bạn.</div> | <div class="cu-card ov-empty">This client isn't on your list.</div> |
| `ov.can_chu_y_2` | Cần chú ý: {p0} | Needs attention: {p0} |
| `ov.ngay_gan_nhat` | {p0} ngày gần nhất | last {p0} days |
| `ov.div_class_cu_card_ov_error` | <div class="cu-card ov-error">Không tải được dữ liệu học viên này. Kiểm tra mạng rồi tải lại trang.</div> | <div class="cu-card ov-error">Couldn't load this client's data. Check your connection and reload the page.</div> |
| `ov.section_class_cu_card_ov_section` | <section class="cu-card ov-section"><div class="cu-card-head"><h3>Dinh dưỡng</h3></div><p>Chưa có số liệu dinh dưỡng.</p></section> | <section class="cu-card ov-section"><div class="cu-card-head"><h3>Nutrition</h3></div><p>No nutrition data yet.</p></section> |
| `ov.chua_bat_dau` | Chưa bắt đầu | Not started |
| `ov.dat_buoc` | , đạt bước | , steps met |
| `ov.chua_dat_buoc` | , chưa đạt bước | , steps not met |
| `ov.bua_du_dam_va_rau` | {p0}: {p1}/{p2} bữa đủ đạm và rau{p3} | {p0}: {p1}/{p2} meals with protein and veg{p3} |
| `ov.p_class_ov_error_chua_co` | <p class="ov-error">Chưa có số bữa mỗi ngày: đặt ở mục Cài đặt dinh dưỡng phía trên, hoặc nhập “Số bữa/ngày” ở trang Tạo kế hoạch.</p> | <p class="ov-error">No meals per day yet: set it in Nutrition settings above, or enter “Meals/day” on the Create plan page.</p> |
| `ov.dinh_duong_don_gian` | Dinh dưỡng · đơn giản | Nutrition · simple |
| `ov.ngay_du_ca_ngay` | Ngày đủ cả ngày | Full days |
| `ov.dat_buoc_2` | Đạt bước | Steps met |
| `ov.du_moi_bua` | Đủ mọi bữa | All meals |
| `ov.du_mot_so_bua` | Đủ một số bữa | Some meals |
| `ov.khong_ghi` | Không ghi {p0} | Not logged {p0} |
| `ov.ghi_bua_kcal` | ghi {p0} bữa, {p1} kcal | {p0} meals logged, {p1} kcal |
| `ov.bua` | {p0} bữa | {p0} meals |
| `ov.dinh_duong_tu_ghi_mon` | Dinh dưỡng · tự ghi món | Nutrition · food logging |
| `ov.ngay_co_ghi` | Ngày có ghi | Days logged |
| `ov.dam_dat_10` | Đạm đạt ±10% | Protein within ±10% |
| `ov.calo_tb_ngay` | Calo TB/ngày | Avg calories/day |
| `ov.du_sang_trua_toi` | Đủ sáng, trưa, tối | Breakfast, lunch and dinner |
| `ov.ghi_mot_phan` | Ghi một phần | Partly logged |
| `ov.khong_ghi_2` | Không ghi | Not logged |
| `ov.trung_binh_trong_ky` | Trung bình trong kỳ | Average for the period |
| `ov.du_dam_va_rau` | đủ đạm và rau | protein and veg |
| `ov.chua` | chưa | not yet |
| `ov.bua_2` | Bữa {p0} | Meal {p0} |
| `ov.buoc_chan` | Bước chân: {p0}{p1} | Steps: {p0}{p1} |
| `ov.p_hoc_vien_khong_ghi_gi` | <p>Học viên không ghi gì hôm này.</p> | <p>The client logged nothing this day.</p> |
| `ov.buoc_3` | {p0} bước | {p0} steps |
| `ov.bua_ngay` | {p0} bữa/ngày | {p0} meals/day |
| `ov.bua_theo_ke_hoach` | {p0} bữa theo kế hoạch | {p0} meals per the plan |
| `ov.theo_ke_hoach` | Theo kế hoạch: {p0} | Per the plan: {p0} |
| `ov.chua_dat_2` | Chưa đặt | Not set |
| `ov.cai_dat_dinh_duong` | Cài đặt dinh dưỡng | Nutrition settings |
| `ov.che_do` | Chế độ | Mode |
| `ov.don_gian` | Đơn giản | Simple |
| `ov.moi_ngay_3_viec_du_dam` | · mỗi ngày 3 việc: đủ đạm và rau mỗi bữa, số bước, cân sáng | · 3 things a day: protein and veg at every meal, step count, morning weigh-in |
| `ov.hoc_vien_tu_ghi_tung_mon` | · học viên tự ghi từng món đã ăn, app tính calo, macro và vi chất | · the client logs each food eaten; the app works out calories, macros and micronutrients |
| `ov.so_buoc_muc_tieu` | Số bước mục tiêu | Step target |
| `ov.de_trong_khong_hoi` | Để trống: không hỏi | Leave empty: don't ask |
| `ov.so_bua_moi_ngay` | Số bữa mỗi ngày | Meals per day |
| `ov.du_dam` | Đủ đạm | Enough protein |
| `ov.nghia_la_gi_tuy_chon` | nghĩa là gì (tuỳ chọn) | means (optional) |
| `ov.vi_du_moi_bua_mot_mieng` | Ví dụ: mỗi bữa một miếng thịt hoặc cá cỡ lòng bàn tay, kèm một chén rau. | E.g. a palm-sized piece of meat or fish at each meal, with a bowl of vegetables. |
| `ov.de_trong_thi_app_ghi_so` | Để trống thì app ghi số gram đạm mỗi bữa theo kế hoạch (nếu có), không thì | Leave empty and the app shows the grams of protein per meal from the plan (if any); otherwise |
| `ov.mot_mon_dam_va_mot_phan` | một món đạm và một phần rau | one protein dish and one serving of vegetables |
| `ov.luu_cai_dat` | Lưu cài đặt | Save settings |
| `ov.p_class_ov_hint_cham_vao` | <p class="ov-hint">Chạm vào một ngày để xem chi tiết.</p> | <p class="ov-hint">Tap a day to see details.</p> |
| `ov.p_class_ov_none_khong_co` | <p class="ov-none">Không có lần ghi cân nào trong kỳ.</p> | <p class="ov-none">No weigh-ins in this period.</p> |
| `ov.can_nang_tung_ngay_trong_ngay` | Cân nặng từng ngày trong {p0} ngày | Daily weight over {p0} days |
| `ov.can_tung_ngay` | Cân từng ngày | Daily weight |
| `ov.trung_binh_7_ngay` | Trung bình 7 ngày | 7-day average |
| `ov.section_class_cu_card_ov_section_2` | <section class="cu-card ov-section"><div class="cu-card-head"><h3>Cân nặng</h3></div><p>Học viên chưa ghi cân lần nào.</p></section> | <section class="cu-card ov-section"><div class="cu-card-head"><h3>Weight</h3></div><p>The client hasn't logged weight yet.</p></section> |
| `ov.ngay_3` | ({p0} ngày) | ({p0} days) |
| `ov.ngay_4` | Ngày | Date |
| `ov.thay_doi` | Thay đổi | Change |
| `ov.ngay_5` | {p0}/{p1} ngày | {p0}/{p1} days |
| `ov.gan_nhat` | Gần nhất | Latest |
| `ov.thay_doi_trong_ky` | Thay đổi trong kỳ | Change in period |
| `ov.so_voi_tuan_truoc` | So với tuần trước | vs last week |
| `ov.thap_nhat` | Thấp nhất | Lowest |
| `ov.cao_nhat` | Cao nhất | Highest |
| `ov.trung_binh_ky` | Trung bình kỳ | Period average |
| `ov.chua_ghi` | Chưa ghi | Not logged |
| `ov.dang_dien_ra_ngay` | · đang diễn ra, {p0} ngày | · in progress, {p0} days |
| `ov.small_moc_small` | <small>mốc</small> | <small>baseline</small> |
| `ov.tuan` | Tuần {p0} | Week {p0} |
| `ov.thead_tr_th_tuan_th_th` | <thead><tr><th>Tuần</th><th>Ngày cân</th><th>Cân TB</th><th>So tuần trước</th><th>So tuần đầu</th><th>Ghi bữa</th></tr></thead> | <thead><tr><th>Week</th><th>Weigh-in days</th><th>Avg weight</th><th>vs last week</th><th>vs first week</th><th>Meals logged</th></tr></thead> |
| `ov.xem_tuan_truoc_do` | Xem {p0} tuần trước đó | Show {p0} earlier weeks |
| `ov.hanh_trinh_tu_luc_bat_dau` | Hành trình từ lúc bắt đầu | Journey since the start |
| `ov.tuan_2` | {p0} tuần | {p0} weeks |
| `ov.bat_dau_lan_can_hoac_ghi` | Bắt đầu {p0} (lần cân hoặc ghi bữa đầu tiên){p1}. Cân TB là trung bình những ngày có cân trong tuần. | Started {p0} (first weigh-in or meal log){p1}. Avg weight is the average of the days weighed that week. |
| `ov.can_tuan_dau` | Cân tuần đầu | First-week weight |
| `ov.can_tuan_gan_nhat` | Cân tuần gần nhất | Latest-week weight |
| `ov.tong_thay_doi` | Tổng thay đổi | Total change |
| `ov.tb_moi_tuan` | TB mỗi tuần | Avg per week |
| `ov.so_tuan` | Số tuần | Weeks |
| `ov.ngay_co_can` | Ngày có cân | Days weighed |
| `ov.ngay_ghi_bua` | Ngày ghi bữa | Days with meals logged |
| `ov.tong_so_ngay` | Tổng số ngày | Total days |
| `ov.section_class_cu_card_ov_section_3` | <section class="cu-card ov-section"><div class="cu-card-head"><h3>Ảnh tiến trình</h3></div><p>Học viên chưa có ảnh.</p></section> | <section class="cu-card ov-section"><div class="cu-card-head"><h3>Progress photos</h3></div><p>The client has no photos yet.</p></section> |
| `ov.khong_co` | Không có | None |
| `ov.anh_chua_phan_loai_goc` | + {p0} ảnh chưa phân loại góc | + {p0} photos without an angle |
| `ov.bo_2` | {p0} bộ | {p0} photo sets |
| `ov.hoc_vien_da_dong_y_cho` | Học viên đã đồng ý cho dùng ảnh | Client has agreed to photo use |
| `ov.chi_tick_khi_hoc_vien_da` | Chỉ tick khi học viên đã đồng ý. Bỏ tick thì học viên rời Portfolio ngay. | Only tick this once the client has agreed. Unticking removes them from the Portfolio right away. |
| `ov.can_it_nhat_2_anh_goc` | Cần ít nhất 2 ảnh góc này, chụp ở 2 ngày khác nhau. | Needs at least 2 photos at this angle, taken on 2 different days. |
| `ov.tuan_3` | tuần | weeks |
| `ov.p_class_ov_hint_khong_co` | <p class="ov-hint">Không có số cân đúng ngày chụp một trong hai ảnh.</p> | <p class="ov-hint">No weigh-in on the day either photo was taken.</p> |
| `ov.truoc` | Trước | Before |
| `ov.cach_nhau` | Cách nhau | Apart |
| `ov.thay_doi_can` | Thay đổi cân | Weight change |
| `ov.goc` | Góc | Angle |
| `ov.hien_ten_hoc_vien` | Hiện tên học viên | Show client name |
| `ov.hien_thay_doi_can_nang` | Hiện thay đổi cân nặng | Show weight change |
| `ov.xuat_anh_ghep` | Xuất ảnh ghép | Export collage |
| `ov.da_luu_hoc_vien_thay_thay` | Đã lưu. Học viên thấy thay đổi khi mở lại trang Dinh dưỡng. | Saved. The client sees the change when they reopen the Nutrition page. |
| `ov.chua_luu_duoc_kiem_tra_mang` | Chưa lưu được. Kiểm tra mạng rồi thử lại. | Couldn't save. Check your connection and try again. |
| `ov.xac_nhan_da_dong_y_cho` | Xác nhận {p0} đã đồng ý cho bạn dùng ảnh tiến trình làm portfolio? | Confirm that {p0} has agreed to let you use their progress photos in your portfolio? |
| `ov.bo_dong_y_cua_hoc_vien` | Bỏ đồng ý của {p0}? Học viên sẽ rời Portfolio ngay. | Withdraw {p0}'s consent? They'll leave the Portfolio right away. |
| `ov.bo_dong_y` | Bỏ đồng ý | Withdraw consent |
| `ov.kho_anh_chua_cho_phep_xuat` | Kho ảnh chưa cho phép xuất file. | The photo storage doesn't allow exporting files yet. |
| `ov.trinh_duyet_chi_cho_ghep_anh` | Trình duyệt chỉ cho ghép ảnh thành file khi kho ảnh Firebase Storage bật CORS. Làm một lần: | The browser can only combine photos into a file when Firebase Storage has CORS enabled. Do this once: |
| `ov.tao_file` | Tạo file | Create the file |
| `ov.chay_trong_google_cloud_shell` | Chạy trong Google Cloud Shell: | Run in Google Cloud Shell: |
| `ov.trong_luc_cho_khung_ghep_o` | Trong lúc chờ, khung ghép ở trên vẫn xem được: bạn chụp màn hình phần đó. | Meanwhile, the collage above can still be viewed: take a screenshot of it. |
| `ov.dang_ghep_anh` | Đang ghép ảnh… | Combining photos… |
| `ov.truoc_2` | TRƯỚC · {p0} | BEFORE · {p0} |
| `ov.tuan_4` | {p0} TUẦN | {p0} WEEKS |
| `ov.anh_ghep_truoc_va_sau` | Ảnh ghép trước và sau | Before and after collage |
| `ov.da_tao_anh_ghep_neu_may` | Đã tạo ảnh ghép. Nếu máy không tự tải về, nhấn giữ ảnh bên dưới để lưu. | Collage created. If it doesn't download automatically, long-press the image below to save it. |
| `ov.hoc_vien_da_dong_y_cho_2` | học viên đã đồng ý cho dùng ảnh | clients have agreed to photo use |
| `ov.div_class_cu_card_ov_empty_3` | <div class="cu-card ov-empty">Chưa có học viên nào được đánh dấu đồng ý. Mở trang chi tiết một học viên và tick "Học viên đã đồng ý cho dùng ảnh".</div> | <div class="cu-card ov-empty">No client is marked as agreeing yet. Open a client's detail page and tick "Client has agreed to photo use".</div> |
| `ov.khong_tai_duoc_anh` | Không tải được ảnh. | Couldn't load the photo. |
| `ov.tuan_5` | {p0} · {p1} tuần{p2} | {p0} · {p1} weeks{p2} |
| `ov.p_class_ov_none_chua_du` | <p class="ov-none">Chưa đủ 2 ảnh cùng góc để so sánh.</p> | <p class="ov-none">Not enough photos (2 at the same angle) to compare yet.</p> |
| `ov.angle.front` | Chính diện | Front |
| `ov.angle.side` | Bên hông | Side |
| `ov.angle.back` | Phía sau | Back |
| `ov.x.steps` | · bước {a}/{b} | · steps {a}/{b} |
| `ov.x.protein` | · đạm đạt {n} | · protein met {n} |
| `ov.x.missing` | · thiếu {list} | · missing {list} |
| `ov.x.stepsMet` | Đạt bước | Steps met |
| `ov.x.met` | đạt | met |
| `ov.x.notMet` | chưa đạt | not met |
| `ov.x.notLogged` | không ghi | not logged |
| `ov.x.stepsCount` | ({n} bước) | ({n} steps) |
| `ov.x.capped` | · chỉ tính {n} lần ghi gần nhất | · only the last {n} entries counted |
| `ov.x.after` | SAU · {p0} | AFTER · {p0} |

## dp

| Key | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `dp.moi_tap` | Mới tập | Beginner |
| `dp.trung_cap` | Trung cấp | Intermediate |
| `dp.nang_cao` | Nâng cao | Advanced |
| `dp.tong_quat` | Tổng quát | General |
| `dp.chuyen_sau` | Chuyên sâu | Specialized |
| ⚠ `dp.tap_giai_tri_may` | Tập giải trí (máy) | Recreational (machines) |
| ⚠ `dp.me_ta_don` | Mê tạ đòn | Barbell enthusiast |
| `dp.chuan_giao_an_mau` | Chuẩn (giáo án mẫu) | Standard (template program) |
| `dp.dui_truoc_squat` | Đùi trước · squat | Quads · squat |
| `dp.nguoi_moi_uu_tien_may_leg` | Người mới ưu tiên máy: Leg Press, Hack Squat. Squat tạ đòn khi học viên đã sẵn sàng học. | Beginners start with machines: Leg Press, Hack Squat. Barbell squat once the client is ready to learn it. |
| `dp.dui_sau_mong_hinge` | Đùi sau & mông · hinge | Hamstrings & glutes · hinge |
| `dp.romanian_deadlift_la_lua_chon_chinh` | Romanian deadlift là lựa chọn chính: ít bài máy đa khớp cho đùi sau. | Romanian deadlift is the main choice: there are few multi-joint machines for the hamstrings. |
| `dp.nguc_day_ngang` | Ngực · đẩy ngang | Chest · horizontal press |
| `dp.may_day_nguc_de_hoc_nhat` | Máy đẩy ngực dễ học nhất; bench press khi đã vững kỹ thuật. | The chest press machine is easiest to learn; bench press once technique is solid. |
| `dp.lung_keo_ngang` | Lưng · kéo ngang | Back · horizontal pull |
| `dp.may_cheo_hoac_cheo_co_tua` | Máy chèo hoặc chèo có tựa ngực để lưng dưới không phải giữ. | Row machine or chest-supported row so the lower back doesn't have to brace. |
| `dp.vai_day_doc` | Vai · đẩy dọc | Shoulders · vertical press |
| `dp.may_day_vai_hoac_day_vai` | Máy đẩy vai hoặc đẩy vai tạ đơn ngồi. | Shoulder press machine or seated dumbbell shoulder press. |
| `dp.lung_keo_doc` | Lưng · kéo dọc | Back · vertical pull |
| `dp.keo_xo_lat_pulldown_cho_nguoi` | Kéo xô (lat pulldown) cho người chưa kéo xà được. | Lat pulldown for those who can't do pull-ups yet. |
| `dp.tong_quat_4_bai_da_khop` | Tổng quát: 4 bài đa khớp mỗi buổi, khoảng 4 set/tuần cho mỗi nhóm cơ lớn. Nghỉ giữa set: khi nào học viên sẵn sàng thì tập. Vài tuần đầu dừng ở RIR 2, thỉnh thoảng một set tới thất bại để học cảm giác. | General: 4 multi-joint exercises per session, about 4 sets/week for each major muscle group. Rest between sets: go when the client is ready. For the first few weeks stop at RIR 2, with the occasional set to failure to learn the feeling. |
| `dp.chuyen_sau_bai_da_khop_truoc` | Chuyên sâu: bài đa khớp trước, bài cô lập sau. Nghỉ ít nhất 1,5 phút: bài đa khớp 1,5–3 phút, bài cô lập 1–2 phút. Ở các nhóm cơ lớn, khoảng 3/4 số set đến từ bài đa khớp. | Specialized: multi-joint exercises first, isolation after. Rest at least 1.5 minutes: multi-joint 1.5–3 minutes, isolation 1–2 minutes. For the major muscle groups, about 3/4 of the sets come from multi-joint exercises. |
| `dp.dui_truoc_co_lap` | Đùi trước · cô lập | Quads · isolation |
| `dp.leg_extension_phan_dui_truoc_ma` | Leg extension: phần đùi trước mà squat và leg press ít chạm tới. | Leg extension: the part of the quads that squats and leg presses barely reach. |
| `dp.dui_sau_co_lap` | Đùi sau · cô lập | Hamstrings · isolation |
| `dp.leg_curl_gap_goi_bo_sung` | Leg curl (gập gối) bổ sung cho hinge. | Leg curl (knee flexion) to complement the hinge. |
| `dp.vai_giua_co_lap` | Vai giữa · cô lập | Side delts · isolation |
| `dp.nang_ta_ngang_lateral_raise` | Nâng tạ ngang (lateral raise). | Lateral raise. |
| `dp.nguc_co_lap` | Ngực · cô lập | Chest · isolation |
| `dp.ep_nguc_may_hoac_cap` | Ép ngực máy hoặc cáp. | Machine or cable fly. |
| `dp.uu_tien_mot_bai_tay_qua` | Ưu tiên một bài tay qua đầu (overhead) cho đầu dài tay sau. | Prefer one overhead exercise for the long head of the triceps. |
| `dp.bap_chan_dung_thang_goi_neu` | Bắp chân đứng thẳng gối nếu có máy. | Straight-knee standing calf raise if there's a machine. |
| `dp.dui_truoc_leg_extension` | Đùi trước · leg extension | Quads · leg extension |
| `dp.dui_truoc_chan_don_split_squat` | Đùi trước · chân đơn (split squat) | Quads · single leg (split squat) |
| `dp.dui_sau_leg_curl` | Đùi sau · leg curl | Hamstrings · leg curl |
| `dp.vai_giua_lateral_raise` | Vai giữa · lateral raise | Side delts · lateral raise |
| `dp.nguc_ep_nguc` | Ngực · ép ngực | Chest · fly |
| `dp.giao_an_mau_tang_co_theo` | Giáo án mẫu tăng cơ theo số buổi. Ưu tiên tập gần thất bại; thêm rep hoặc tạ khi được. Nếu 2–3 tháng không tiến: kiểm tra RIR thật, ăn ngủ, đổi sang bài kéo giãn cơ nhiều hơn, rồi mới thêm 1–2 set mỗi nhóm cơ mỗi 3–4 tuần. | Template hypertrophy program by number of sessions. Train close to failure; add reps or load when possible. If there's no progress for 2–3 months: check real RIR, food and sleep, switch to exercises with more stretch, and only then add 1–2 sets per muscle group every 3–4 weeks. |
| `dp.giao_an_mau_suc_manh_theo` | Giáo án mẫu sức mạnh theo số buổi. Nghỉ 2–3 phút, tới 5 phút với bài nặng. Mỗi tuần một lần nâng 1 rep nặng ở RIR 1–3 để theo dõi; kiểm tra 1RM mỗi 8–12 tuần sau 3–4 ngày nghỉ. Nếu 8–12 tuần không tiến: thêm 1–2 set 3–5 rep ở bài chính. | Template strength program by number of sessions. Rest 2–3 minutes, up to 5 minutes on heavy lifts. Once a week lift one heavy rep at RIR 1–3 to track; test 1RM every 8–12 weeks after 3–4 rest days. If there's no progress for 8–12 weeks: add 1–2 sets of 3–5 reps on the main lifts. |
| `dp.suc_manh_tang_co_3_4` | Sức mạnh + tăng cơ: 3–4 buổi mỗi tuần. Bài chính 1–3 set nặng 1–5 rep ở RIR 2–4; bài phụ 2–4 set 8–15 rep ở RIR 0–2. Tăng tạ hoặc rep mỗi tuần khi được. | Strength + hypertrophy: 3–4 sessions a week. Main lifts 1–3 heavy sets of 1–5 reps at RIR 2–4; accessories 2–4 sets of 8–15 reps at RIR 0–2. Add load or reps each week when possible. |
| ⚠ `dp.sach_khuyen_3_4_buoi` | sách khuyên 3–4 buổi | the book recommends 3–4 sessions |
| `dp.suc_manh_tang_co_nen_tap` | Sức mạnh + tăng cơ nên tập 3–4 buổi/tuần. Chọn 3 hoặc 4 buổi. | Strength + hypertrophy should be 3–4 sessions/week. Choose 3 or 4 sessions. |
| `dp.tang_co_moi_tap_tong_quat` | Tăng cơ · Mới tập · Tổng quát: chỉ bài đa khớp, khoảng 4 set/tuần mỗi nhóm cơ, 6–12 rep, RIR 0–2. Nghỉ khi nào sẵn sàng thì tập. | Hypertrophy · Beginner · General: multi-joint exercises only, about 4 sets/week per muscle group, 6–12 reps, RIR 0–2. Rest until ready. |
| `dp.tang_co_moi_tap_chuyen_sau` | Tăng cơ · Mới tập · Chuyên sâu: 4–6 set/tuần mỗi nhóm cơ, đa khớp 6–12 rep, cô lập 8–15 rep, RIR 0–2. | Hypertrophy · Beginner · Specialized: 4–6 sets/week per muscle group, multi-joint 6–12 reps, isolation 8–15 reps, RIR 0–2. |
| `dp.tang_co_trung_cap_tong_quat` | Tăng cơ · Trung cấp · Tổng quát: 4–6 set/tuần mỗi nhóm cơ, một bài đa khớp và một bài cô lập, RIR 0–2. | Hypertrophy · Intermediate · General: 4–6 sets/week per muscle group, one multi-joint and one isolation exercise, RIR 0–2. |
| `dp.tang_co_trung_cap_chuyen_sau` | Tăng cơ · Trung cấp · Chuyên sâu: 6–8 set/tuần mỗi nhóm cơ, chia 2 buổi. Đa khớp lần A 5–7 rep, lần B 7–10 rep, cô lập 10–20 rep, RIR 0–1. | Hypertrophy · Intermediate · Specialized: 6–8 sets/week per muscle group, over 2 sessions. Multi-joint first time 5–7 reps, second time 7–10 reps, isolation 10–20 reps, RIR 0–1. |
| `dp.tang_co_nang_cao_tong_quat` | Tăng cơ · Nâng cao · Tổng quát: 5–7 set/tuần mỗi nhóm cơ. Đa khớp lần A 5–7 rep, lần B 7–10 rep, cô lập 10–20 rep, RIR 0–2. | Hypertrophy · Advanced · General: 5–7 sets/week per muscle group. Multi-joint first time 5–7 reps, second time 7–10 reps, isolation 10–20 reps, RIR 0–2. |
| `dp.tang_co_nang_cao_chuyen_sau` | Tăng cơ · Nâng cao · Chuyên sâu: 7–10 set/tuần mỗi nhóm cơ, chia 2–3 buổi, thêm bài cô lập cho nhóm cơ nhỏ, RIR 0–1. | Hypertrophy · Advanced · Specialized: 7–10 sets/week per muscle group, over 2–3 sessions, extra isolation for the small muscle groups, RIR 0–1. |
| `dp.suc_manh_moi_tap_tap_giai` | Sức mạnh · Mới tập · Tập giải trí: bài máy đa khớp, 1–4 set/tuần mỗi dạng bài, 5–7 rep, RIR 1–3, nghỉ 1–2 phút. | Strength · Beginner · Recreational: multi-joint machines, 1–4 sets/week per movement, 5–7 reps, RIR 1–3, rest 1–2 minutes. |
| `dp.suc_manh_moi_tap_me_ta` | Sức mạnh · Mới tập · Mê tạ đòn: 2–4 set/tuần mỗi dạng bài. Lần đầu trong tuần là bài tạ đòn 3–5 rep (nghỉ 3–4 phút), các lần sau máy hoặc tạ đơn 5–8 rep, RIR 2–3. | Strength · Beginner · Barbell enthusiast: 2–4 sets/week per movement. The first time in the week is a barbell lift at 3–5 reps (rest 3–4 minutes), later times machines or dumbbells at 5–8 reps, RIR 2–3. |
| `dp.suc_manh_moi_tap_squat_bench` | Sức mạnh · Mới tập · Squat · bench · deadlift: mỗi bài chính 2–4 set/tuần, 3–5 rep, RIR 2–3, nghỉ 3–4 phút. Bài phụ 1–2 set. | Strength · Beginner · Squat · bench · deadlift: each main lift 2–4 sets/week, 3–5 reps, RIR 2–3, rest 3–4 minutes. Accessories 1–2 sets. |
| `dp.suc_manh_trung_cap_tap_giai` | Sức mạnh · Trung cấp · Tập giải trí: bài máy đa khớp, 4–6 set/tuần mỗi dạng bài, 4–6 rep, RIR 1–3, nghỉ 2–5 phút. | Strength · Intermediate · Recreational: multi-joint machines, 4–6 sets/week per movement, 4–6 reps, RIR 1–3, rest 2–5 minutes. |
| `dp.suc_manh_trung_cap_me_ta` | Sức mạnh · Trung cấp · Mê tạ đòn: 4–6 set/tuần mỗi dạng bài. Tạ đòn 3–5 rep, máy hoặc tạ đơn 6–8 rep, nghỉ 2–5 phút. | Strength · Intermediate · Barbell enthusiast: 4–6 sets/week per movement. Barbell 3–5 reps, machines or dumbbells 6–8 reps, rest 2–5 minutes. |
| `dp.suc_manh_trung_cap_squat_bench` | Sức mạnh · Trung cấp · Squat · bench · deadlift: mỗi bài chính 4–6 set nặng/tuần, khoảng nửa ở 1–3 rep, nửa ở 3–6 rep. Thêm biến thể 1–2 set (squat dừng, bench tay hẹp, deadlift đứng bục) và bài phụ 2–3 set. | Strength · Intermediate · Squat · bench · deadlift: each main lift 4–6 heavy sets/week, about half at 1–3 reps and half at 3–6 reps. Add 1–2 sets of a variation (pause squat, close-grip bench, deficit deadlift) and 2–3 sets of accessories. |
| `dp.suc_manh_nang_cao_tap_giai` | Sức mạnh · Nâng cao · Tập giải trí: bài máy đa khớp, 4–6 set/tuần mỗi dạng bài, 4–6 rep, RIR 1–2. | Strength · Advanced · Recreational: multi-joint machines, 4–6 sets/week per movement, 4–6 reps, RIR 1–2. |
| `dp.suc_manh_nang_cao_me_ta` | Sức mạnh · Nâng cao · Mê tạ đòn: 4–6 set/tuần mỗi dạng bài. Tạ đòn 3–5 rep, máy hoặc tạ đơn 5–8 rep, RIR 1–3, nghỉ tới 3–6 phút với bài tạ tự do. | Strength · Advanced · Barbell enthusiast: 4–6 sets/week per movement. Barbell 3–5 reps, machines or dumbbells 5–8 reps, RIR 1–3, rest up to 3–6 minutes on free-weight lifts. |
| `dp.suc_manh_nang_cao_squat_bench` | Sức mạnh · Nâng cao · Squat · bench · deadlift: mỗi bài chính 4–6 set/tuần, 60–70% ở 1–3 rep. Thêm biến thể 2–3 set và bài phụ 2–4 set. | Strength · Advanced · Squat · bench · deadlift: each main lift 4–6 sets/week, 60–70% at 1–3 reps. Add 2–3 sets of variations and 2–4 sets of accessories. |
| `dp.squat_ta_don` | Squat tạ đòn | Barbell squat |
| `dp.bien_the_squat` | Biến thể squat | Squat variation |
| `dp.bien_the_bench` | Biến thể bench | Bench variation |
| `dp.bien_the_deadlift` | Biến thể deadlift | Deadlift variation |
| `dp.may_ta_don` | máy / tạ đơn | machine / dumbbell |
| `dp.so_set` | số set | number of sets |
| `dp.khoang_rep` | khoảng rep | rep range |
| `dp.hay_chon_du_muc_tieu_cap` | Hãy chọn đủ mục tiêu, cấp độ và kiểu tập. | Choose a goal, level and training style. |
| `dp.so_buoi_moi_tuan_phai_tu` | Số buổi mỗi tuần phải từ 1 đến 7. | Sessions per week must be 1 to 7. |
| `dp.david_chua_nhap_quy_tac_cho` | David chưa nhập quy tắc cho tổ hợp này. Điền vào dose-rules.js hoặc dựng giáo án tay. | David hasn't entered rules for this combination. Fill in dose-rules.js or build the program by hand. |
| `dp.david_chua_nhap_cach_chia_buoi` | David chưa nhập cách chia buổi cho {p0} buổi mỗi tuần. | David hasn't entered a split for {p0} sessions a week. |
| `dp.cach_chia_buoi_nhac_toi_slot` | Cách chia buổi nhắc tới slot | The split mentions slot |
| `dp.nhung_quy_tac_khong_co_slot` | nhưng quy tắc không có slot này. | but the rules have no such slot. |
| `dp.chua_co_slot_nao` | {p0} chưa có slot nào. | {p0} has no slots yet. |
| `dp.quy_tac_chua_co_buoc_tang` | Quy tắc chưa có bước tăng tạ cho slot này: dùng nấc tạ nhỏ nhất của bài. | The rules have no load increment for this slot: using the exercise's smallest load step. |
| `dp.thieu` | {p0}: thiếu {p1}. | {p0}: missing {p1}. |
| `dp.so_set_phai_tu_1_den` | {p0}: số set phải từ 1 đến 12. | {p0}: sets must be 1 to 12. |
| `dp.so_rep_phai_tu_1_tro` | {p0}: số rep phải từ 1 trở lên. | {p0}: reps must be 1 or more. |
| `dp.vai_sau_face_pull` | Vai sau · face pull | Rear delts · face pull |
| `dp.bo_dung_giao_an_david_coaching` | Bộ dựng giáo án — David Coaching | Program builder — David Coaching |
| `dp.bo_dung_giao_an` | Bộ dựng giáo án | Program builder |
| `dp.thu_vien_giao_an` | ◀ Thư viện giáo án | ◀ Program library |
| `dp.chon_muc_tieu_cap_do_kieu` | Chọn mục tiêu, cấp độ, kiểu tập và số buổi mỗi tuần để dựng sẵn bộ khung từ quy tắc của David. Mọi ô đều sửa được. Khi ổn, lưu thành bản nháp cho một học viên: bản nháp chưa kích hoạt và học viên chưa thấy. | Choose a goal, level, training style and sessions per week to build a framework from David's rules. Every field can be edited. When it looks right, save it as a draft for a client: the draft isn't active and the client can't see it. |
| `dp.cap_do` | Cấp độ | Level |
| `dp.kieu_tap` | Kiểu tập | Training style |
| `dp.so_buoi_moi_tuan` | Số buổi mỗi tuần | Sessions per week |
| `dp.dung_khung` | Dựng khung | Build framework |
| `dp.tang_set_roi_tang_rep` | Tăng set rồi tăng rep | Add sets, then reps |
| `dp.thap_hon_khoang_cua_david` | ▼ Thấp hơn khoảng của David | ▼ Below David's range |
| `dp.trong_khoang` | ✓ Trong khoảng | ✓ In range |
| `dp.cao_hon_khoang_cua_david` | ▲ Cao hơn khoảng của David | ▲ Above David's range |
| `dp.quy_tac_david_da_nhap_to` | Quy tắc David đã nhập: {p0} tổ hợp. | Rules David has entered: {p0} combinations. |
| `dp.quy_tac_david_da_nhap_chua` | Quy tắc David đã nhập: chưa có. Điền vào file dose-rules.js (nhờ Claude giúp) để công cụ gợi ý được. | Rules David has entered: none yet. Fill in dose-rules.js (ask Claude for help) so the tool can make suggestions. |
| `dp.buoi` | {p0} buổi{p1} | {p0} sessions{p1} |
| `dp.chon_bai` | — Chọn bài — | — Choose exercise — |
| `dp.p_class_slot_nopick_thu_vien` | <p class="slot-nopick">Thư viện không có bài khớp với nhóm cơ và dạng chuyển động của slot này. Chọn từ toàn bộ thư viện.</p> | <p class="slot-nopick">The library has no exercise matching this slot's muscle group and movement pattern. Choose from the whole library.</p> |
| `dp.thieu_nhap_tay_ben_duoi` | Thiếu: {p0}. Nhập tay bên dưới. | Missing: {p0}. Enter it below. |
| `dp.rep_tu` | Rep từ | Reps from |
| `dp.rep_den` | Rep đến | Reps to |
| `dp.nghi_giay` | Nghỉ (giây) | Rest (seconds) |
| `dp.p_class_small_note_buoi_nay` | <p class="small-note">Buổi này chưa có slot nào.</p> | <p class="small-note">This session has no slots yet.</p> |
| `dp.chon_hoc_vien` | — Chọn học viên — | — Choose client — |
| `dp.p_class_small_note_style_margin` | <p class="small-note" style="margin-top:10px;">Chưa có học viên nào để lưu bản nháp.</p> | <p class="small-note" style="margin-top:10px;">No clients to save a draft for yet.</p> |
| `dp.volume_ke_hoach_moi_tuan` | Volume kế hoạch mỗi tuần | Planned weekly volume |
| `dp.so_set_moi_nhom_co_bai` | Số set mỗi nhóm cơ, bài đa khớp tính thêm cho cơ phụ như trong app. Chỉ là đề xuất, không chặn gì. | Sets per muscle group; multi-joint exercises also count toward secondary muscles, as in the app. Only a suggestion; nothing is blocked. |
| `dp.luu_thanh_ban_nhap` | Lưu thành bản nháp | Save as draft |
| `dp.tao_ban_nhap_chua_kich_hoat` | Tạo bản nháp chưa kích hoạt cho một học viên; học viên chưa thấy gì. Tạ khởi điểm để trống: bạn nhập trong bản nháp ở Bảng điều khiển trước khi kích hoạt. Slot chưa chọn bài sẽ bị bỏ qua. | Creates an inactive draft for a client; the client sees nothing. Starting loads stay empty: you enter them in the draft on the Dashboard before activating. Slots without an exercise are skipped. |
| `dp.moi_buoi_duoc_tinh_mot_lan` | Mỗi buổi được tính một lần mỗi tuần. | Each session counts once per week. |
| `dp.kieu_tien_trien` | Kiểu tiến triển: {p0} | Progression: {p0} |
| `dp.nhom_co` | Nhóm cơ | Muscle group |
| `dp.set_tuan` | Set/tuần | Sets/week |
| `dp.khoang_cua_david` | Khoảng của David | David's range |
| `dp.p_class_small_note_style_margin_2` | <p class="small-note" style="margin-top:10px;">Chọn bài cho các slot để thấy volume theo nhóm cơ.</p> | <p class="small-note" style="margin-top:10px;">Choose exercises for the slots to see volume by muscle group.</p> |
| `dp.chon_hoc_vien_truoc` | Chọn học viên trước. | Choose a client first. |
| `dp.chua_tao_duoc_ban_nhap_sua` | Chưa tạo được bản nháp. Sửa các slot sau:{p0} | Couldn't create the draft. Fix these slots:{p0} |
| `dp.chon_bai_cho_it_nhat_mot` | Chọn bài cho ít nhất một slot trước khi tạo bản nháp. | Choose an exercise for at least one slot before creating the draft. |
| `dp.da_co_mot_chu_ky_ban` | {p0} đã có một chu kỳ bản nháp. Hoàn tất hoặc huỷ bản nháp đó trong Bảng điều khiển trước. | {p0} already has a draft cycle. Finish or cancel that draft on the Dashboard first. |
| `dp.tao_ban_nhap_cho` | Tạo bản nháp “{p0}” cho {p1}? | Create draft “{p0}” for {p1}? |
| `dp.buoi_bai` | {p0} buổi · {p1} bài. | {p0} sessions · {p1} exercises. |
| `dp.slot_chua_chon_bai_se_bi` | {p0} slot chưa chọn bài sẽ bị bỏ qua. | {p0} slots without an exercise will be skipped. |
| `dp.bai_chua_co_ta_khoi_diem` | {p0} bài chưa có tạ khởi điểm: bạn nhập trước khi kích hoạt. | {p0} exercises have no starting load: enter them before activating. |
| `dp.ban_nhap_chua_kich_hoat_va` | Bản nháp chưa kích hoạt và học viên chưa thấy. | The draft isn't active and the client can't see it. |
| `dp.da_tao_ban_nhap_cho_buoi` | Đã tạo bản nháp “{p0}” cho {p1}: {p2} buổi, {p3} bài. Mở | Draft “{p0}” created for {p1}: {p2} sessions, {p3} exercises. Open |
| `dp.chon_hoc_vien_nay_roi_chinh` | , chọn học viên này rồi “Chỉnh sửa bản nháp” để nhập tạ khởi điểm và kích hoạt. | , choose this client, then “Edit draft” to enter starting loads and activate. |
| `dp.da_tao_ban_nhap` | Đã tạo bản nháp | Draft created |
| `dp.loi_khong_ro` | lỗi không rõ | unknown error |
| `dp.chua_tao_duoc_ban_nhap` | Chưa tạo được bản nháp: {p0} | Couldn't create the draft: {p0} |
| `dp.day_letter` | Buổi {x} | Session {x} |
| `dp.day_lower_a` | Thân dưới {x} | Lower body {x} |
| `dp.day_upper_a` | Thân trên {x} | Upper body {x} |
| `dp.day_full` | Toàn thân · {x} | Full body · {x} |
