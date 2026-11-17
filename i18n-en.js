// English. Same keys as i18n-vi.js; David reviews the wording (see i18n-review-en.md).
import home, { NOTES as homeNotes } from './i18n-en-home.js';
import workout, { NOTES as workoutNotes } from './i18n-en-workout.js';
import program, { NOTES as programNotes } from './i18n-en-program.js';
import history, { NOTES as historyNotes } from './i18n-en-history.js';
import progress, { NOTES as progressNotes } from './i18n-en-progress.js';
import habits, { NOTES as habitsNotes } from './i18n-en-habits.js';
import nutrition, { NOTES as nutritionNotes } from './i18n-en-nutrition.js';
import foods, { NOTES as foodsNotes } from './i18n-en-foods.js';

import coach, { NOTES as coachNotes } from './i18n-en-coach.js';
const BASE = {
  // Common
  'lang.label': 'Language',
  'lang.laterNote': 'Language changed. What you are entering is kept; the whole page switches the next time you open it.',
  'date.weekday.0': 'Sunday',
  'date.weekday.1': 'Monday',
  'date.weekday.2': 'Tuesday',
  'date.weekday.3': 'Wednesday',
  'date.weekday.4': 'Thursday',
  'date.weekday.5': 'Friday',
  'date.weekday.6': 'Saturday',
  'date.short.0': 'Sun',
  'date.short.1': 'Mon',
  'date.short.2': 'Tue',
  'date.short.3': 'Wed',
  'date.short.4': 'Thu',
  'date.short.5': 'Fri',
  'date.short.6': 'Sat',

  // Nhóm cơ (muscle-labels.js)
  'muscle.chest': 'Chest',
  'muscle.back': 'Back',
  'muscle.shoulders': 'Shoulders',
  'muscle.biceps': 'Biceps',
  'muscle.triceps': 'Triceps',
  'muscle.quads': 'Quads',
  'muscle.hamsGlutes': 'Hamstrings & glutes',
  'muscle.calves': 'Calves',
  'muscle.abs': 'Abs',

  // App shell: navigation, account menu
  'shell.nav.label': 'Main navigation',
  'shell.nav.home': 'Home',
  'shell.nav.training': 'Training',
  'shell.nav.nutrition': 'Nutrition',
  'shell.nav.habits': 'Habits',
  'shell.nav.progress': 'Progress',
  'shell.nav.review': 'To review',
  'shell.nav.programs': 'Training Program',
  'shell.nav.students': 'Clients',
  'shell.tool.exerciseReview': 'Review new exercises',
  'shell.tool.dosePlanner': 'Program builder',
  'shell.tool.programLibrary': 'Program library',
  'shell.tool.templates': 'Program templates',
  'shell.tool.coachDishes': 'Suggested dishes',
  'shell.tool.labelFoods': 'Label foods',
  'shell.tool.mealPlanIntake': 'Meal Plan questions',
  'shell.tool.nutritionReview': 'Review nutrition data',
  'shell.tool.overview': 'Client overview',
  'shell.tools.label': 'Tools',
  'shell.collapse': 'Collapse',
  'shell.collapse.aria': 'Collapse the sidebar',
  'shell.account.open': 'Open account menu',
  'shell.account.title': 'Account',
  'shell.account.version': 'Version',
  'shell.account.logout': 'Log out',

  // Shared dialogs
  'dialog.ok': 'OK',
  'dialog.cancel': 'Cancel',
  'dialog.gotIt': 'Got it',

  // Login
  'login.pageTitle': 'Log in — David Coaching',
  'login.title': 'Back to training.',
  'login.lede': 'Track your sessions, your nutrition and the adjustments David makes just for you.',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Log in',
  'login.submitting': 'Logging in…',
  'login.checking': 'Checking your account…',
  'login.noAccount': 'This account has not been set up yet. Contact David to be added.',
  'login.checkFailed': 'Your account cannot be checked right now. Check your connection and try again.',
  'login.failed': 'Login failed. Check your email and password.',
  'login.foot': 'David reviews every plan before it is sent.',
};

// Chỗ David cần quyết (⚠ trong i18n-review-en.md). Key → điều cần xem.
const BASE_NOTES = {
  'lang.label': 'Thông báo đẩy (push) gửi từ máy chủ vẫn luôn bằng tiếng Việt: nhắc học viên ghi dinh dưỡng ("Hôm nay bạn ăn thế nào?") và các thông báo gửi coach. Máy chủ chưa biết người nhận chọn ngôn ngữ nào (lựa chọn chỉ lưu trên trình duyệt). Muốn gửi đúng ngôn ngữ: lưu ngôn ngữ đã chọn vào hồ sơ học viên trên Firestore (thêm trường mới, có thể phải sửa firestore.rules) rồi máy chủ đọc trường đó. David quyết có làm không.',
  'shell.nav.review': 'Cảnh báo ở mục "To review" do máy chủ tạo và lưu bằng tiếng Việt; app đổi sang tiếng Anh lúc hiển thị theo mẫu câu (review-alert-text.js). Nếu sau này sửa câu trong functions/review-alert-builder.js thì phải sửa mẫu tương ứng, test sẽ báo nếu lệch.',
};

// Từng khu nằm ở file riêng (i18n-en-<khu>.js) cho dễ sửa; trang nào cũng nạp đủ.
export default { ...BASE, ...home, ...workout, ...program, ...history, ...progress, ...habits, ...nutrition, ...foods, ...coach };
export const NOTES = { ...BASE_NOTES, ...homeNotes, ...workoutNotes, ...programNotes, ...historyNotes, ...progressNotes, ...habitsNotes, ...foodsNotes, ...nutritionNotes, ...coachNotes };
