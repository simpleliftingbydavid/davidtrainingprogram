import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTechnicalIssue, coarseDeviceLabel, isSafeTechnicalIssue, technicalIssueMessage } from '../technical-inbox-utils.js';

test('technical issue keeps only allowlisted metadata and creates a stable support code', () => {
  const options = {
    ownerUid: 'student-1', reporterRole: 'student', operation: 'session-save',
    error: { code: 'permission-denied', name: 'FirebaseError', message: 'private workout payload' },
    page: '/client.html', saveState: 'not-saved', referenceId: 'session-1',
    userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit Safari/605.1.15', mobileHint: true,
    now: new Date('2026-09-23T10:00:00Z'), eventId: 'event-1',
  };
  const first = buildTechnicalIssue(options);
  const second = buildTechnicalIssue({ ...options, eventId: 'event-2' });
  assert.equal(first.id, second.id);
  assert.equal(first.data.supportCode, second.data.supportCode);
  assert.match(first.data.supportCode, /^DC-SS-/);
  assert.equal(first.data.errorCode, 'permission-denied');
  assert.equal(first.data.device, 'iOS · Safari · điện thoại');
  assert.equal(isSafeTechnicalIssue(first.data), true);
  assert.equal('message' in first.data, false);
  assert.equal('stack' in first.data, false);
});

test('unknown operations are normalized and never expose the raw error message', () => {
  const issue = buildTechnicalIssue({
    ownerUid: 'student-1', operation: 'raw payload: 80kg x 10',
    error: { name: 'Error', message: 'bench press 80 kg x 10' }, now: new Date('2026-09-23T10:00:00Z'),
  });
  assert.equal(issue.data.operation, 'browser-error');
  assert.doesNotMatch(JSON.stringify(issue.data), /bench press|80 kg/i);
});

test('saved-state message explicitly prevents duplicate session submissions', () => {
  const issue = buildTechnicalIssue({ ownerUid: 'student-1', operation: 'post-session-refresh', now: new Date('2026-09-23T10:00:00Z') });
  assert.match(technicalIssueMessage(issue, { saved: true }), /đã được lưu an toàn/i);
  assert.match(technicalIssueMessage(issue, { saved: true }), /tải lại trang/i);
  assert.match(technicalIssueMessage(issue, { saved: true }), new RegExp(issue.data.supportCode));
});

test('device label is intentionally coarse', () => {
  assert.equal(coarseDeviceLabel('Mozilla/5.0 (Windows NT 10.0) Chrome/140.0'), 'Windows · Chrome · máy tính');
});
