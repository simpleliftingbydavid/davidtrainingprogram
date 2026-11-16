// Từ điển tiếng Việt. Mỗi key có một câu ở i18n-en.js (test i18n kiểm tra hai file cùng bộ key).
// Chữ ở đây phải trùng đúng chữ đang viết sẵn trong HTML, để trang tiếng Việt không đổi.
import home from './i18n-vi-home.js';
import workout from './i18n-vi-workout.js';
import program from './i18n-vi-program.js';
import history from './i18n-vi-history.js';
import progress from './i18n-vi-progress.js';
import habits from './i18n-vi-habits.js';

const BASE = {
  // Chung
  'lang.label': 'Ngôn ngữ',
  'lang.laterNote': 'Đã đổi ngôn ngữ. Phần bạn đang nhập được giữ nguyên; cả trang sẽ đổi khi bạn mở lại trang.',
  'date.weekday.0': 'Chủ nhật',
  'date.weekday.1': 'Thứ Hai',
  'date.weekday.2': 'Thứ Ba',
  'date.weekday.3': 'Thứ Tư',
  'date.weekday.4': 'Thứ Năm',
  'date.weekday.5': 'Thứ Sáu',
  'date.weekday.6': 'Thứ Bảy',
  'date.short.0': 'CN',
  'date.short.1': 'T2',
  'date.short.2': 'T3',
  'date.short.3': 'T4',
  'date.short.4': 'T5',
  'date.short.5': 'T6',
  'date.short.6': 'T7',

  // Khung app: điều hướng, menu tài khoản
  'shell.nav.label': 'Điều hướng chính',
  'shell.nav.home': 'Trang chủ',
  'shell.nav.training': 'Tập luyện',
  'shell.nav.nutrition': 'Dinh dưỡng',
  'shell.nav.habits': 'Thói quen',
  'shell.nav.progress': 'Tiến trình',
  'shell.nav.review': 'Cần xem lại',
  'shell.nav.programs': 'Giáo án',
  'shell.nav.students': 'Học viên',
  'shell.tool.exerciseReview': 'Duyệt bài tập mới',
  'shell.tool.dosePlanner': 'Bộ dựng giáo án',
  'shell.tool.programLibrary': 'Thư viện giáo án',
  'shell.tool.templates': 'Mẫu giáo án',
  'shell.tool.coachDishes': 'Món gợi ý',
  'shell.tool.labelFoods': 'Món theo nhãn',
  'shell.tool.mealPlanIntake': 'Câu hỏi Meal Plan',
  'shell.tool.nutritionReview': 'Duyệt dữ liệu dinh dưỡng',
  'shell.tool.overview': 'Tổng quan học viên',
  'shell.tools.label': 'Công cụ',
  'shell.collapse': 'Thu gọn',
  'shell.collapse.aria': 'Thu gọn thanh công cụ',
  'shell.account.open': 'Mở menu tài khoản',
  'shell.account.title': 'Tài khoản',
  'shell.account.version': 'Phiên bản',
  'shell.account.logout': 'Đăng xuất',

  // Hộp thoại dùng chung
  'dialog.ok': 'Đồng ý',
  'dialog.cancel': 'Huỷ',
  'dialog.gotIt': 'Đã hiểu',

  // Đăng nhập
  'login.pageTitle': 'Đăng nhập — David Coaching',
  'login.title': 'Quay lại tập tiếp.',
  'login.lede': 'Theo dõi buổi tập, dinh dưỡng và những điều chỉnh David dành riêng cho bạn.',
  'login.email': 'Email',
  'login.password': 'Mật khẩu',
  'login.submit': 'Đăng nhập',
  'login.submitting': 'Đang đăng nhập…',
  'login.checking': 'Đang kiểm tra tài khoản…',
  'login.noAccount': 'Tài khoản chưa được thiết lập trong hệ thống. Liên hệ David để được thêm vào.',
  'login.checkFailed': 'Chưa thể kiểm tra tài khoản lúc này. Hãy kiểm tra mạng rồi thử lại.',
  'login.failed': 'Đăng nhập thất bại — kiểm tra lại email/mật khẩu.',
  'login.foot': 'Mỗi kế hoạch đều được David xem lại trước khi gửi.',
};

// Từng khu nằm ở file riêng (i18n-vi-<khu>.js) cho dễ sửa; trang nào cũng nạp đủ.
export default { ...BASE, ...home, ...workout, ...program, ...history, ...progress, ...habits };
