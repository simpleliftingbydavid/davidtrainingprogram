// Run with:  node tests/meal-plan-intake.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INTAKE_SECTIONS, intakeQuestionCount, intakeText } from '../meal-plan-intake.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const page = readFileSync(new URL('../meal-plan-intake.html', import.meta.url), 'utf8');
const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const builder = readFileSync(new URL('../nutrition-builder.html', import.meta.url), 'utf8');

check('every section has an id, a title and at least one question, and no id is used twice', () => {
  const ids = INTAKE_SECTIONS.map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const section of INTAKE_SECTIONS) {
    assert.ok(section.id && section.title && section.questions.length > 0, section.id);
    for (const question of section.questions) assert.ok(question.trim().length > 5, `${section.id}: empty question`);
  }
});

check('the questionnaire covers what the meal plan needs to know', () => {
  const text = intakeText(INTAKE_SECTIONS.map((section) => section.id)).toLowerCase();
  for (const topic of ['giới tính', 'tuổi', 'chiều cao', 'cân nặng', 'mục tiêu', 'tập', 'thức dậy', 'bữa', 'dị ứng', 'tiêu hóa', 'bệnh lý', 'kinh nguyệt', 'ngân sách', 'bếp']) {
    assert.ok(text.includes(topic), `missing: ${topic}`);
  }
});

check('questions are numbered one after another across the sections, with no gaps', () => {
  const text = intakeText(INTAKE_SECTIONS.map((section) => section.id));
  const numbers = [...text.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
  assert.deepEqual(numbers, numbers.map((_, index) => index + 1));
  assert.equal(numbers.length, intakeQuestionCount(INTAKE_SECTIONS.map((section) => section.id)));
});

check('by default the section for women is left out, and leaving a section out renumbers the rest', () => {
  const normal = intakeText();
  assert.doesNotMatch(normal, /DÀNH RIÊNG CHO NỮ/);
  assert.doesNotMatch(normal, /kinh nguyệt/);
  const withWomen = intakeText([...INTAKE_SECTIONS.filter((section) => section.defaultOn).map((section) => section.id), 'women']);
  assert.match(withWomen, /DÀNH RIÊNG CHO NỮ/);
  const justGoal = intakeText(['goal']);
  assert.match(justGoal, /^1\. Mục tiêu chính/m);
  assert.match(justGoal, /PHẦN 1 — MỤC TIÊU/);
});

check('the text opens with a title and a friendly introduction and ends with a thank-you', () => {
  const text = intakeText();
  assert.ok(text.startsWith('KHẢO SÁT THÔNG TIN ĐỂ LÊN KẾ HOẠCH DINH DƯỠNG\n\nChào bạn'));
  assert.match(text, /Cảm ơn bạn!/);
  assert.match(text, /mình/);
});

check('it is plain text that can be pasted into a chat: no markup, tags or tables', () => {
  const text = intakeText(INTAKE_SECTIONS.map((section) => section.id));
  assert.doesNotMatch(text, /<[a-z/]|\*\*|^#|\|/m);
});

check('nothing is left as a placeholder', () => {
  assert.doesNotMatch(intakeText(INTAKE_SECTIONS.map((section) => section.id)), /lorem|TODO|\.\.\.\.|đang cập nhật/i);
});

check('the page is for coaches only, offers copying, and lets the sections be chosen', () => {
  assert.match(page, /redirectForUnexpectedRole\(role, \['coach'\]\)/);
  assert.match(page, /if \(role !== 'coach'\)/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(page, /document\.execCommand\('copy'\)/, 'a fallback when the clipboard is not available');
  assert.match(page, /<textarea id="intake-text"/);
  assert.match(page, /meta name="robots" content="noindex"/);
});

check('the questionnaire can be reached from the coach dashboard, the nutrition view and the builder', () => {
  assert.match(coach, /<a href="meal-plan-intake\.html"[^>]*>Câu hỏi Meal Plan<\/a>/);
  assert.match(coach, /intakeLink\.href = 'meal-plan-intake\.html'/);
  assert.match(builder, /<a href="meal-plan-intake\.html"[^>]*>Bộ câu hỏi khách<\/a>/);
});

console.log(`meal-plan-intake: ${passed} passed`);
