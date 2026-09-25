import { db } from './firebase-init.js';
import { doc, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { buildTechnicalIssue, isSafeTechnicalIssue } from './technical-inbox-utils.js';

const QUEUE_KEY = 'dc_technical_issue_queue_v1';
const DEDUPE_PREFIX = 'dc_technical_issue_seen_';
const DEDUPE_MS = 10 * 60 * 1000;
const MAX_QUEUE = 20;
let reporter = null;
let listenersInstalled = false;

function readQueue() {
  try {
    const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(value) ? value.filter((item) => item?.id && item?.data && isSafeTechnicalIssue(item.data)).slice(-MAX_QUEUE) : [];
  } catch (error) { return []; }
}

function writeQueue(items) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUE))); } catch (error) { /* best effort */ }
}

function queueIssue(issue) {
  const queue = readQueue();
  if (!queue.some((item) => item.data.lastEventId === issue.data.lastEventId)) queue.push(issue);
  writeQueue(queue);
}

function recentlyReported(fingerprint) {
  try {
    const key = `${DEDUPE_PREFIX}${fingerprint}`;
    const previous = Number(localStorage.getItem(key)) || 0;
    if (Date.now() - previous < DEDUPE_MS) return true;
    localStorage.setItem(key, String(Date.now()));
  } catch (error) { /* reporting still works without storage */ }
  return false;
}

function issueRef(issue) {
  const ownerCollection = issue.data.reporterRole === 'coach' ? 'coaches' : 'students';
  return doc(db, ownerCollection, issue.data.ownerUid, 'technicalIssues', issue.id);
}

async function persistIssue(issue) {
  if (!navigator.onLine) throw new Error('offline');
  await runTransaction(db, async (tx) => {
    const ref = issueRef(issue);
    const snap = await tx.get(ref);
    if (snap.exists() && snap.data().lastEventId === issue.data.lastEventId) return;
    if (snap.exists()) {
      tx.update(ref, {
        occurrences: Math.max(1, Number(snap.data().occurrences) || 1) + 1,
        lastEventId: issue.data.lastEventId,
        page: issue.data.page,
        device: issue.data.device,
        online: issue.data.online,
        saveState: issue.data.saveState,
        referenceId: issue.data.referenceId,
        lastSeenAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      return;
    }
    tx.set(ref, {
      ...issue.data, occurrences: 1,
      firstSeenAt: serverTimestamp(), lastSeenAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  });
}

async function persistWithDeadline(issue, milliseconds = 1400) {
  let timer;
  try {
    await Promise.race([
      persistIssue(issue),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('technical-report-timeout')), milliseconds); }),
    ]);
    return true;
  } finally { clearTimeout(timer); }
}

export function configureTechnicalReporter({ ownerUid, reporterRole = 'student' } = {}) {
  reporter = { ownerUid: String(ownerUid || '').trim(), reporterRole: reporterRole === 'coach' ? 'coach' : 'student' };
  if (reporter.ownerUid) void flushTechnicalIssueQueue();
}

export async function reportTechnicalIssue({ operation, error, saveState = 'unknown', referenceId = '' } = {}) {
  const issue = buildTechnicalIssue({
    ownerUid: reporter?.ownerUid || '', reporterRole: reporter?.reporterRole || 'student', operation, error,
    saveState, referenceId, page: `${location.pathname}${location.search}`,
    userAgent: navigator.userAgent, mobileHint: navigator.userAgentData?.mobile === true,
    online: navigator.onLine, eventId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  });
  if (!reporter?.ownerUid || recentlyReported(issue.data.fingerprint)) return issue;
  try { await persistWithDeadline(issue); }
  catch (persistError) { queueIssue(issue); }
  return issue;
}

export async function flushTechnicalIssueQueue() {
  if (!reporter?.ownerUid || !navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;
  const remaining = [];
  for (const issue of queue) {
    if (issue.data.ownerUid !== reporter.ownerUid || issue.data.reporterRole !== reporter.reporterRole) { remaining.push(issue); continue; }
    try { await persistWithDeadline(issue, 2500); }
    catch (error) { remaining.push(issue); }
  }
  writeQueue(remaining);
}

export function installTechnicalErrorCapture() {
  if (listenersInstalled) return;
  listenersInstalled = true;
  addEventListener('online', () => void flushTechnicalIssueQueue());
  addEventListener('error', (event) => {
    void reportTechnicalIssue({ operation: 'browser-error', error: event.error || { name: 'WindowError' } });
  });
  addEventListener('unhandledrejection', (event) => {
    void reportTechnicalIssue({ operation: 'unhandled-promise', error: event.reason || { name: 'UnhandledPromise' } });
  });
}
