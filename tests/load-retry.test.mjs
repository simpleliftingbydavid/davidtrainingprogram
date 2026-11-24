// Thử lại khi đọc dữ liệu lỗi tạm thời (2026-11-24): phân loại lỗi, thử lại đúng một lần, không thử
// lại lỗi quyền, thôi khi David đã mở học viên khác, phần phụ lỗi không làm hỏng phần chính; và chỗ
// nối trong coach.html.
//   node tests/load-retry.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isTransientError, isPermissionError, withRetry, settleAll } from '../load-retry.js';

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const err = (code, message = 'x') => Object.assign(new Error(message), code ? { code } : {});
const noSleep = async () => {};

await check('which errors are worth one more try', () => {
  for (const e of [err('unavailable'), err('deadline-exceeded'), err('firestore/unavailable'), err('', 'Failed to get document because the client is offline.'), Object.assign(new TypeError('Failed to fetch'), {})]) {
    assert.equal(isTransientError(e), true, e.code || e.message);
  }
  for (const e of [err('permission-denied'), err('unauthenticated'), err('not-found'), err('failed-precondition', 'The query requires an index'), new TypeError("Cannot read properties of undefined (reading 'x')"), null]) {
    assert.equal(isTransientError(e), false, e?.code || e?.message || 'null');
  }
  assert.equal(isPermissionError(err('permission-denied')), true);
  assert.equal(isPermissionError(err('unavailable')), false);
});

await check('a transient failure is retried once, then succeeds', async () => {
  let calls = 0;
  const value = await withRetry(async () => { calls += 1; if (calls === 1) throw err('unavailable'); return 'ok'; }, { sleep: noSleep });
  assert.equal(value, 'ok');
  assert.equal(calls, 2);
});

await check('fails after the one retry; permission errors are not retried', async () => {
  let calls = 0;
  await assert.rejects(withRetry(async () => { calls += 1; throw err('unavailable'); }, { sleep: noSleep }), (e) => e.code === 'unavailable');
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(withRetry(async () => { calls += 1; throw err('permission-denied'); }, { sleep: noSleep }));
  assert.equal(calls, 1);
});

await check('stops retrying once another client is opened', async () => {
  let calls = 0;
  let current = true;
  await assert.rejects(withRetry(async () => { calls += 1; throw err('unavailable'); }, { sleep: async () => { current = false; }, shouldContinue: () => current }));
  assert.equal(calls, 1);
});

await check('secondary reads: a failure gives the fallback and is named, the rest come through', async () => {
  const out = await settleAll({
    checkIns: async () => [1],
    alerts: async () => { throw err('unavailable'); },
    audits: async () => [3],
  }, { checkIns: [], alerts: [], audits: [] }, { sleep: noSleep });
  assert.deepEqual(out.values, { checkIns: [1], alerts: [], audits: [3] });
  assert.deepEqual(out.failed, ['alerts']);
});

await check('coach.html: opening a client never leaves "Đang tải…" with no message', () => {
  const html = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
  const fn = html.slice(html.indexOf('async function selectStudent('), html.indexOf('function safeRender('));
  assert.match(fn, /try \{[\s\S]*\} catch \(error\) \{[\s\S]*showStudentLoadError\(/, 'every failure ends in the message with Try again');
  assert.match(fn, /const fresh = \(\) => request === studentSelectionRequest && selectedStudentId === studentId;/);
  assert.ok((fn.match(/if \(!fresh\(\)\) return;/g) || []).length >= 4, 'an old client never paints over the new one');
  assert.match(fn, /settleAll\(\{\s*checkIns:/, 'secondary reads cannot break the page');
  const phase = html.slice(html.indexOf('async function loadPhaseInfo('), html.indexOf('function renderPhaseBar('));
  assert.match(phase, /if \(!isPermissionError\(err\)\) throw err;/, 'a network error is not shown as "no cycle yet"');
  assert.match(html, /withRetry\(\(\) => loadStudents\(\)\)/);
  assert.match(html, /reload\.addEventListener\('click', \(\) => location\.reload\(\)\);/);
  assert.match(html, /\$\('boot-status'\)\.style\.display = '';/, 'the boot error is shown, not written into a hidden box');
});

console.log(`LOAD_RETRY_OK ${passed} passed`);
