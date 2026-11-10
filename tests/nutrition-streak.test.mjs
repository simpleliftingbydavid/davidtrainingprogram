// Chuỗi ghi bữa (David, 2026-11-10): "đừng bỏ 2 ngày liền". Lỡ 1 ngày vẫn giữ chuỗi và app nhắc;
// bỏ 2 ngày liền thì về 0. Hiện ở thẻ Dinh dưỡng trang chủ và đầu trang Dinh dưỡng.
//   node tests/nutrition-streak.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hasNutritionLog, loggingStreak, streakCopy, streakMarkup } from '../nutrition-streak.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const T = '2026-11-10';
const day = (id, logged = true) => ({ id, simpleMeals: logged ? [0] : [] });
const days = (...ids) => ids.map((id) => day(id));

check('ghi liền mỗi ngày: hôm nay chưa ghi chưa làm đứt chuỗi', () => {
  const s = loggingStreak(days('2026-11-09', '2026-11-08', '2026-11-07'), T);
  assert.equal(s.count, 3);
  assert.equal(s.loggedToday, false);
  assert.equal(s.atRisk, false);
  assert.equal(streakCopy(s).hint, 'Ghi hôm nay để lên 4 ngày.');
});

check('hôm nay đã ghi thì cộng thêm 1', () => {
  const s = loggingStreak(days('2026-11-10', '2026-11-09'), T);
  assert.equal(s.count, 2);
  assert.equal(s.loggedToday, true);
});

check('lỡ 1 ngày giữa chừng: chuỗi vẫn giữ, ngày lỡ không được tính', () => {
  const s = loggingStreak(days('2026-11-10', '2026-11-09', '2026-11-07', '2026-11-06'), T);
  assert.equal(s.count, 4);
});

check('lỡ hôm qua: vẫn giữ chuỗi nhưng nhắc ghi hôm nay', () => {
  const s = loggingStreak(days('2026-11-08', '2026-11-07'), T);
  assert.equal(s.count, 2);
  assert.equal(s.atRisk, true);
  assert.match(streakCopy(s).hint, /lỡ một ngày/);
  assert.match(streakMarkup(s), /cu-streak is-risk/);
});

check('bỏ 2 ngày liền: chuỗi về 0', () => {
  const s = loggingStreak(days('2026-11-07', '2026-11-06', '2026-11-05'), T);
  assert.equal(s.count, 0);
  assert.equal(s.atRisk, false);
  assert.equal(streakCopy(s).title, 'Bắt đầu chuỗi ghi bữa');
});

check('ngày có doc nhưng không tick bữa nào không tính là đã ghi', () => {
  const s = loggingStreak([day('2026-11-09', false), day('2026-11-08', false), day('2026-11-07')], T);
  assert.equal(s.count, 0);
});

check('trang đang mở biết hôm nay trước khi lưu xong', () => {
  assert.equal(loggingStreak(days('2026-11-09'), T, { loggedToday: true }).count, 2);
  assert.equal(loggingStreak(days('2026-11-10', '2026-11-09'), T, { loggedToday: false }).count, 1, 'bỏ tick hết thì hôm nay không tính');
});

check('đọc hết lịch sử mà chuỗi chưa đứt thì hiện "+"', () => {
  const rows = Array.from({ length: 60 }, (_, index) => day(new Date(Date.parse(`${T}T00:00:00Z`) - (index + 1) * 86400000).toISOString().slice(0, 10)));
  const s = loggingStreak(rows, T, { limit: 60 });
  assert.equal(s.count, 60);
  assert.equal(s.capped, true);
  assert.equal(streakCopy(s).title, 'Chuỗi ghi bữa: 60+ ngày');
  assert.equal(loggingStreak(rows.slice(0, 10), T, { limit: 60 }).capped, false);
});

check('7 chấm: cũ trước, hôm nay cuối', () => {
  const s = loggingStreak(days('2026-11-09', '2026-11-04'), T);
  assert.deepEqual(s.last7.map((d) => d.state), ['logged', 'missed', 'missed', 'missed', 'missed', 'logged', 'today']);
  assert.equal(s.last7[0].date, '2026-11-04');
});

check('món ghi chi tiết và dữ liệu cũ cũng tính là đã ghi', () => {
  assert.equal(hasNutritionLog({ foodEntries: [{}] }), true);
  assert.equal(hasNutritionLog({ completedMealIds: ['a'] }), true);
  assert.equal(hasNutritionLog({ mealLogs: [{}] }), true);
  assert.equal(hasNutritionLog({ foodLog: [{}] }), true);
  assert.equal(hasNutritionLog({ steps: 9000 }), false);
  assert.equal(hasNutritionLog(null), false);
});

const fields = (text) => [...text.matchAll(/any\(checkin\??\.(\w+)\)/g)].map((m) => m[1]).sort();
check('"đã ghi" giống hệt cảnh báo của coach (functions)', () => {
  const server = readFileSync(new URL('../functions/review-alert-builder.js', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../nutrition-streak.js', import.meta.url), 'utf8');
  assert.deepEqual(fields(client), fields(server));
  assert.equal(fields(client).length, 5);
});

const home = readFileSync(new URL('../home.html', import.meta.url), 'utf8').replace(/\r/g, '');
const page = readFileSync(new URL('../nutrition.html', import.meta.url), 'utf8').replace(/\r/g, '');
check('hiện ở trang chủ và cả hai chế độ của trang Dinh dưỡng', () => {
  assert.match(home, /nutritionDays: \(\) => listNutritionCheckins\(uid, \{ max: STREAK_READ_DAYS \}\)/);
  assert.match(home, /\$\{streak\}/);
  assert.ok(page.includes('${streakBlock(simpleDay.simpleMeals.length > 0)}'));
  assert.ok(page.includes('${streakBlock(flEntries.length > 0)}'));
  assert.ok(page.includes('flDays = streakRows.slice(0, 15);'), 'món hay ăn vẫn chỉ lấy 15 ngày');
});

console.log(`NUTRITION_STREAK_OK ${passed} passed`);
