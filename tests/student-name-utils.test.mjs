// Run with:  node tests/student-name-utils.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NICKNAME_MAX, cleanNickname, confusableNames, studentHintMap } from '../student-name-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const student = (id, displayName, email = '') => ({ id, displayName, email });

check('a name inside another is confusable, however the accents or case fall', () => {
  assert.equal(confusableNames('Khánh Linh', 'Nguyễn Khánh Linh'), true);
  assert.equal(confusableNames('khanh linh', 'NGUYỄN KHÁNH LINH'), true);
  assert.equal(confusableNames('Linh', 'Phương Linh'), true);
  assert.equal(confusableNames('Hải Phong', 'Hải Phong'), true);
});

check('sharing only a given name or a surname is not enough', () => {
  assert.equal(confusableNames('Phương Linh', 'Ngọc Linh'), false);
  assert.equal(confusableNames('Phương Thảo', 'Thảo Trang'), false);
  assert.equal(confusableNames('Anh Quân', 'Anh Tú'), false);
});

check('empty and missing names are never confusable', () => {
  assert.equal(confusableNames('', 'Linh'), false);
  assert.equal(confusableNames(null, undefined), false);
});

check('only the students who could be mistaken for each other get a hint', () => {
  const hints = studentHintMap([
    student('a', 'Khánh Linh', 'khanhlinh@gmail.com'),
    student('b', 'Nguyễn Khánh Linh', 'linh.nguyen.k@gmail.com'),
    student('c', 'Phương Linh', 'phuonglinh@gmail.com'),
    student('d', 'Xuân Huy', 'huy@gmail.com'),
  ]);
  assert.deepEqual([...hints.entries()], [['a', 'khanhlinh'], ['b', 'linh.nguyen.k']]);
});

check('a student with no email falls back to the end of the id', () => {
  const hints = studentHintMap([student('uid-aaaa1111', 'Linh', ''), student('uid-bbbb2222', 'Khánh Linh', 'kl@x.com')]);
  assert.equal(hints.get('uid-aaaa1111'), '…1111');
  assert.equal(hints.get('uid-bbbb2222'), 'kl');
});

check('two confusable students with the same email prefix still get different hints', () => {
  const hints = studentHintMap([student('id-one1', 'Linh', 'linh@a.com'), student('id-two2', 'Khánh Linh', 'linh@b.com')]);
  assert.notEqual(hints.get('id-one1'), hints.get('id-two2'));
});

check('a long email prefix is shortened', () => {
  const hints = studentHintMap([student('a', 'Linh', `${'x'.repeat(40)}@a.com`), student('b', 'Khánh Linh', 'k@a.com')]);
  assert.ok(hints.get('a').length <= 24);
  assert.ok(hints.get('a').endsWith('…'));
});

check('nobody is flagged when no two names are alike, and an empty list is fine', () => {
  assert.equal(studentHintMap([student('a', 'Xuân Huy'), student('b', 'Hải Phong')]).size, 0);
  assert.equal(studentHintMap([]).size, 0);
  assert.equal(studentHintMap().size, 0);
});

check('a nickname is shown beside the name, even for a student whose name is not confusable', () => {
  const hints = studentHintMap([{ ...student('a', 'Xuân Huy', 'huy@x.com'), nickname: 'Huy 6h sáng' }, student('b', 'Hải Phong', 'hp@x.com')]);
  assert.deepEqual([...hints.entries()], [['a', 'Huy 6h sáng']]);
});

check('a nickname replaces the email hint for a confusable name', () => {
  const hints = studentHintMap([
    { ...student('a', 'Khánh Linh', 'khanhlinh@x.com'), nickname: 'Linh nhóm sáng' },
    student('b', 'Nguyễn Khánh Linh', 'nkl@x.com'),
  ]);
  assert.equal(hints.get('a'), 'Linh nhóm sáng');
  assert.equal(hints.get('b'), 'nkl');
});

check('a nickname is trimmed, single-spaced and cut to 24 characters', () => {
  assert.equal(cleanNickname('  Linh   nhóm   sáng '), 'Linh nhóm sáng');
  assert.equal(cleanNickname('x'.repeat(60)).length, NICKNAME_MAX);
  assert.equal(cleanNickname(null), '');
  assert.equal(studentHintMap([{ ...student('a', 'Linh'), nickname: '   ' }, student('b', 'Hải Phong')]).size, 0, 'a blank nickname shows nothing');
});

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');
const reviewUi = readFileSync(new URL('../review-dashboard-ui.js', import.meta.url), 'utf8');
const habitUi = readFileSync(new URL('../habit-overview-ui.js', import.meta.url), 'utf8');

check('the hint is shown on the student chip, the detail header, the review queue and the habit overview', () => {
  assert.match(coach, /studentHints = studentHintMap\(students\)/);
  assert.match(coach, /small\.className = 'student-hint'/);
  assert.match(reviewUi, /studentHintMap\(students\)/);
  assert.match(habitUi, /studentHintMap\(students\)/);
});

check('the coach can set and clear a nickname from the student page', () => {
  assert.match(data, /export async function setStudentNickname\(studentUid, nickname\)/);
  assert.match(data, /updateDoc\(doc\(db, 'students', studentUid\), \{ nickname: clean, updatedAt: serverTimestamp\(\) \}\)/);
  assert.match(coach, /id="detail-nickname-btn"/);
  assert.match(coach, /await setStudentNickname\(student\.id, answer\)/);
});

console.log(`student-name-utils: ${passed} passed`);
