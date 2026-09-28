import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('client distinguishes a saved session refresh failure from a real save failure', async () => {
  const client = await read('client.html');
  assert.match(client, /operation: 'post-session-refresh'[\s\S]*?saveState: 'saved'/);
  assert.match(client, /operation: 'session-save'[\s\S]*?saveState: 'not-saved'/);
  assert.match(client, /technicalIssueMessage\(issue, \{ saved: true \}\)/);
});

test('technical inbox is isolated from coaching alerts and protected by rules', async () => {
  const [rules, functions, dashboard] = await Promise.all([
    read('firestore.rules'), read('functions/index.js'), read('review-dashboard-ui.js'),
  ]);
  assert.match(rules, /match \/technicalIssues\/\{issueId\}/);
  assert.match(rules, /validTechnicalIssueCreate/);
  assert.match(functions, /mirrorStudentTechnicalIssue/);
  assert.match(functions, /cleanupTechnicalIssues/);
  assert.match(dashboard, /Lỗi kỹ thuật/);
  assert.match(dashboard, /không lưu mức tạ, reps, ghi chú hay kế hoạch dinh dưỡng/i);
});

test('technical payload never includes workout or nutrition content fields', async () => {
  const reporter = await read('technical-inbox-utils.js');
  assert.doesNotMatch(reporter, /exerciseLogs\s*:/);
  assert.doesNotMatch(reporter, /clientNote\s*:/);
  assert.doesNotMatch(reporter, /mealPlan\s*:/);
});
