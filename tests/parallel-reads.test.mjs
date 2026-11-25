// Mở trang nhanh hơn (2026-11-25): các lượt đọc Firestore không phụ thuộc nhau chạy cùng lúc.
//   node tests/parallel-reads.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');

check('getMyRole đọc coaches và students cùng lúc, getStudent dùng lại hồ sơ vừa đọc một lần', () => {
  const data = read('training-data.js');
  const role = data.slice(data.indexOf('export async function getMyRole'), data.indexOf('export async function getMyRole') + 600);
  assert.match(role, /Promise\.all\(\[\s*getDoc\(doc\(db, 'coaches', uid\)\),\s*getDoc\(doc\(db, 'students', uid\)\)\.catch/);
  const student = data.slice(data.indexOf('export async function getStudent('), data.indexOf('export async function getStudent(') + 400);
  assert.match(student, /roleStudentDoc = null;/, 'chỉ dùng lại một lần');
  assert.match(student, /reuse\.uid === studentUid/);
});

check('trang Tập luyện: giáo án, lịch sử, bài thêm, tổng kết, buổi dở đọc cùng lúc', () => {
  const page = read('client.html');
  assert.match(page, /const remoteDraftRead = readRemoteDraft\(\);\s*await Promise\.all\(\[loadAssignments\(\), loadPhaseReviewHistory\(\)\]\);\s*await resumeActiveWorkoutIfAvailable\(remoteDraftRead\);/);
  const load = page.slice(page.indexOf('async function loadAssignments'), page.indexOf('async function loadAssignments') + 700);
  assert.ok(load.indexOf('listExtraExerciseStates') < load.indexOf('await getActivePhaseAssignments'), 'bài thêm bắt đầu đọc trước khi chờ giáo án');
});

check('trang Dinh dưỡng: dữ liệu theo dõi và của chế độ bắt đầu đọc trước khi chờ kế hoạch', () => {
  const page = read('nutrition.html');
  const load = page.slice(page.indexOf('async function loadPage'), page.indexOf('async function loadPage') + 900);
  assert.ok(load.indexOf('startTrackingReads()') < load.indexOf('getNutritionPlan(studentUid)'));
  assert.ok(load.indexOf('startFoodLogReads()') < load.indexOf('getNutritionPlan(studentUid)'));
});

console.log(`PARALLEL_READS_OK ${passed} passed`);
