import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appShellItems } from '../app-shell.js';
import { APP_VERSION, appVersionLabel } from '../app-version.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

assert.deepEqual(appShellItems('student').map((item) => item.label), ['Hôm nay', 'Dinh dưỡng', 'Lịch sử', 'Tiến trình']);
assert.deepEqual(appShellItems('coach').map((item) => item.label), ['Cần xem lại', 'Giáo án', 'Dinh dưỡng', 'Học viên']);
assert.notEqual(appShellItems('student'), appShellItems('student'), 'Mỗi lần đọc phải trả về bản sao an toàn.');
assert.match(APP_VERSION, /^\d{4}\.\d{2}\.\d{2}-stage1\.\d+$/);
assert.equal(appVersionLabel(), `v${APP_VERSION}`);

for (const file of ['client.html', 'history.html', 'nutrition.html', 'progress-photos.html', 'coach.html', 'program-library.html', 'templates.html', 'nutrition-builder.html']) {
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
assert.match(nutrition, /street-entry-grid/);

console.log('app-shell tests passed');
