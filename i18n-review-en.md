# Bản dịch tiếng Anh — để David duyệt

File này được tạo từ `i18n-vi.js` và `i18n-en.js` bằng `node scripts/i18n-review.mjs`. Đừng sửa tay: sửa câu trong `i18n-en.js` rồi chạy lại.

Tổng: 156 câu. Cần David quyết: 10 chỗ (đánh ⚠).

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
