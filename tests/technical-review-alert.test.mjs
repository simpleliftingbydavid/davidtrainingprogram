import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildTechnicalReviewAlert } = require('../functions/technical-issue-utils.js');

test('student technical issue becomes a separate redacted coach alert', () => {
  const result = buildTechnicalReviewAlert({
    ownerType: 'student', ownerId: 'student-1', issueId: '2026-W39_ABC',
    owner: { coachUid: 'coach-1', displayName: 'Hải Phong', clientCategory: 'online' },
    issue: {
      operationLabel: 'Ghi nhận buổi tập', errorCode: 'permission-denied', supportCode: 'DC-SS-ABC',
      appVersion: '2026.09.23-stage1.1', device: 'iOS · Safari · điện thoại', page: '/client.html',
      online: true, saveState: 'not-saved', priority: 'high', occurrences: 2,
    },
  });
  assert.equal(result.data.type, 'technical-error');
  assert.equal(result.data.coachUid, 'coach-1');
  assert.equal(result.data.studentUid, 'student-1');
  assert.equal(result.data.supportCode, 'DC-SS-ABC');
  assert.match(result.data.summary, /2 lần ghi nhận/);
  assert.doesNotMatch(JSON.stringify(result), /exerciseLogs|clientNote|mealPlan/);
});

test('coach-side issue is grouped as system without a fake student', () => {
  const result = buildTechnicalReviewAlert({
    ownerType: 'coach', ownerId: 'coach-1', issueId: 'issue-1', owner: { displayName: 'David' },
    issue: { operationLabel: 'Tải Dashboard', supportCode: 'DC-RDL-XYZ', occurrences: 1 },
  });
  assert.equal(result.data.coachUid, 'coach-1');
  assert.equal(result.data.studentUid, '');
  assert.equal(result.data.studentName, 'David');
});
