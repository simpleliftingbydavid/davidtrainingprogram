import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appShellItems, shellPageFile } from '../app-shell.js';
import { APP_VERSION, appVersionLabel } from '../app-version.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

assert.deepEqual(appShellItems('student').map((item) => item.label), ['Trang chủ', 'Tập luyện', 'Dinh dưỡng', 'Thói quen', 'Tiến trình']);
assert.deepEqual(appShellItems('coach').map((item) => item.label), ['Cần xem lại', 'Giáo án', 'Dinh dưỡng', 'Học viên']);
assert.notEqual(appShellItems('student'), appShellItems('student'), 'Mỗi lần đọc phải trả về bản sao an toàn.');
assert.match(APP_VERSION, /^\d{4}\.\d{2}\.\d{2}-stage1\.\d+$/);
assert.equal(appVersionLabel(), `v${APP_VERSION}`);

for (const file of ['client.html', 'history.html', 'nutrition.html', 'progress-photos.html', 'habits.html', 'home.html', 'program.html', 'coach.html', 'program-library.html', 'templates.html', 'nutrition-builder.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(html, /app-shell\.css/, `${file} phải tải style điều hướng chung.`);
  assert.match(html, /mountAppShell/, `${file} phải khởi tạo điều hướng theo vai trò.`);
}

const history = fs.readFileSync(path.join(root, 'history.html'), 'utf8');
assert.match(history, /visibleSessionCount = 5/);
assert.match(history, /sessions\.slice\(0, visibleSessionCount\)/);

const progress = fs.readFileSync(path.join(root, 'progress-photos.html'), 'utf8');
assert.match(progress, /data-progress-tab="update"/);
assert.match(progress, /data-progress-panel="gallery"/);

const nutrition = fs.readFileSync(path.join(root, 'nutrition.html'), 'utf8');
assert.match(nutrition, /@media\(max-width:600px\)/);
assert.match(nutrition, /daily-metrics-grid/);

// Công cụ coach nằm theo nhóm ở thanh bên; hàng nút cũ ở đầu trang coach đã bỏ (audit 2026-11-13).
const tools = Object.fromEntries(appShellItems('coach').map((item) => [item.label, item.tools.map((tool) => `${tool.label}|${tool.href}`)]));
assert.deepEqual(tools, {
  'Cần xem lại': ['Duyệt bài tập mới|exercise-review.html'],
  'Giáo án': ['Bộ dựng giáo án|dose-planner.html', 'Thư viện giáo án|program-library.html', 'Mẫu giáo án|templates.html'],
  'Dinh dưỡng': ['Món gợi ý|coach-dishes.html', 'Món theo nhãn|label-foods.html', 'Câu hỏi Meal Plan|meal-plan-intake.html', 'Duyệt dữ liệu dinh dưỡng|nutrition-review.html'],
  'Học viên': ['Tổng quan học viên|overview.html'],
});
assert.ok(appShellItems('student').every((item) => !item.tools), 'học viên không có công cụ phụ');
appShellItems('coach')[0].tools.push({ label: 'x', href: 'x' });
assert.equal(appShellItems('coach')[0].tools.length, 1, 'bản sao an toàn cả danh sách công cụ');
assert.equal(shellPageFile('/app/dose-planner.html'), 'dose-planner.html');
assert.equal(shellPageFile('/'), '');
const toolFiles = appShellItems('coach').flatMap((item) => item.tools.map((tool) => tool.href));
const group = { 'exercise-review.html': 'review', 'dose-planner.html': 'programs', 'program-library.html': 'programs', 'templates.html': 'programs',
  'coach-dishes.html': 'nutrition', 'label-foods.html': 'nutrition', 'meal-plan-intake.html': 'nutrition', 'nutrition-review.html': 'nutrition', 'overview.html': 'students' };
toolFiles.forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} tồn tại`);
  assert.match(fs.readFileSync(path.join(root, file), 'utf8'), new RegExp(`mountAppShell\\(\\{ role: 'coach', active: '${group[file]}'`), `${file} mở đúng nhóm`);
});
const coach = fs.readFileSync(path.join(root, 'coach.html'), 'utf8');
const coachHeader = coach.slice(coach.indexOf('<header class="app-header">'), coach.indexOf('</header>'));
assert.doesNotMatch(coachHeader, /<a href=/, 'đầu trang coach không còn hàng nút công cụ');
assert.doesNotMatch(coachHeader, /David Coaching — HLV/, 'không lặp logo');
assert.match(coachHeader, /id="notification-bell"/, 'chuông thông báo vẫn còn');
assert.match(coachHeader, /id="logout-btn"/, 'nút đăng xuất gốc vẫn còn cho menu tài khoản');
const shellCss = fs.readFileSync(path.join(root, 'app-shell.css'), 'utf8');
assert.match(shellCss, /\.app-shell-toolstrip \{ display:none;/);
assert.match(shellCss, /\.app-shell-sidebar \{ display:none; \}\n  \.app-shell-toolstrip \{ display:flex; \}/);

assert.match(shellCss, /\.app-shell-sidebar \{[^}]*overflow-y:auto;/, 'thanh bên cuộn được trên màn hình thấp');

console.log('app-shell tests passed');
