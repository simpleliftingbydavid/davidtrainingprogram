# Bản dịch tiếng Anh — để David duyệt

File này được tạo từ `i18n-vi.js` và `i18n-en.js` bằng `node scripts/i18n-review.mjs`. Đừng sửa tay: sửa câu trong `i18n-en.js` rồi chạy lại.

Tổng: 1206 câu. Cần David quyết: 14 chỗ (đánh ⚠).

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
