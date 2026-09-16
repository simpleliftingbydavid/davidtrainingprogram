import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const coach = await readFile(new URL('../coach.html', import.meta.url), 'utf8');
const client = await readFile(new URL('../client.html', import.meta.url), 'utf8');
const data = await readFile(new URL('../training-data.js', import.meta.url), 'utf8');
const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');

test('coach exposes advisory deload and immutable review controls', () => {
  assert.match(coach, /DELOAD & TỔNG KẾT CHU KỲ/);
  assert.match(coach, /Không có đề xuất nào tự thay đổi Training Max/);
  assert.match(coach, /createLockedPhaseReview/);
  assert.match(coach, /addPhaseReviewAppendix/);
});

test('student receives read-only locked phase history', () => {
  assert.match(client, /Tổng kết các chu kỳ đã hoàn thành/);
  assert.match(client, /listLockedPhaseReviews/);
  assert.doesNotMatch(client, /createLockedPhaseReview/);
});

test('review and deload records are append-only at data and rules layers', () => {
  assert.match(data, /if \(reviewSnap\.exists\(\)\) throw new Error/);
  assert.match(rules, /match \/phaseReviews\/\{reviewId\}[\s\S]*?allow update, delete: if false/);
  assert.match(rules, /match \/deloadDecisions\/\{decisionId\}[\s\S]*?allow update, delete: if false/);
});

test('phase activation uses the current activation review key', () => {
  assert.match(data, /phaseReviewDocumentId\(preflightActive\.id, preflightActive\.activationRevision\)/);
  assert.match(data, /activationRevision: Math\.max\(0, Number\(target\.activationRevision\)/);
});
