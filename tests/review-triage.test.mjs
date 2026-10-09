// Run with:  node tests/review-triage.test.mjs
// The "Cần xem lại" queue: routine signals separated from the ones that need a coach.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ROUTINE_TYPES, alertAgeDays, alertAgeText, displayPriority, filterReviewAlerts, groupRoutineAlerts,
  normalizeReviewAlert, reviewSections, reviewSummary,
} from '../review-dashboard-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const NOW = new Date('2026-10-09T05:00:00Z').getTime();
const DAY = 86400000;
const ago = (days) => new Date(NOW - days * DAY);
let counter = 0;
const alert = (overrides = {}) => ({
  id: `a${++counter}`, studentUid: 's1', studentName: 'Khánh Linh', type: 'progression-held', priority: 'high',
  status: 'open', exerciseName: 'Squat', dayLabel: 'A', lastDetectedAt: ago(1), version: 1, ...overrides,
});

check('routine signals show as follow-up whatever they were stored as', () => {
  for (const type of ROUTINE_TYPES) assert.equal(displayPriority(alert({ type, priority: 'high' })), 'normal', type);
});

check('urgent stays urgent, and safety and feedback keep their stored priority', () => {
  assert.equal(displayPriority(alert({ type: 'pain', priority: 'urgent' })), 'urgent');
  assert.equal(displayPriority(alert({ type: 'progression-held', priority: 'urgent' })), 'urgent', 'a routine type that was escalated stays escalated');
  assert.equal(displayPriority(alert({ type: 'exercise-feedback', priority: 'high' })), 'high');
  assert.equal(displayPriority(alert({ type: 'performance-decline', priority: 'high' })), 'high');
  assert.equal(displayPriority({ type: 'pain', priority: 'bogus' }), 'normal');
});

check('the stored priority is untouched, and the urgent count still comes from it', () => {
  const items = [alert({ type: 'pain', priority: 'urgent' }), alert({ type: 'progression-held', priority: 'high' })];
  assert.equal(normalizeReviewAlert(items[1]).priority, 'high');
  assert.equal(normalizeReviewAlert(items[1]).displayPriority, 'normal');
  assert.equal(reviewSummary(items).urgent, 1);
});

check('the queue is sorted by what is shown, so routine items sink below real coaching items', () => {
  const items = [
    alert({ id: 'routine-new', type: 'progression-held', lastDetectedAt: ago(0) }),
    alert({ id: 'feedback-old', type: 'exercise-feedback', lastDetectedAt: ago(10) }),
    alert({ id: 'pain', type: 'pain', priority: 'urgent', lastDetectedAt: ago(20) }),
  ];
  assert.deepEqual(filterReviewAlerts(items, {}).map((item) => item.id), ['pain', 'feedback-old', 'routine-new']);
});

check('the dashboard has four blocks, in reading order', () => {
  const s = reviewSections([
    alert({ type: 'pain', priority: 'urgent' }), alert({ type: 'deload-recommendation', priority: 'urgent' }),
    alert({ type: 'exercise-feedback' }), alert({ type: 'performance-decline' }),
    alert({ type: 'progression-held' }), alert({ type: 'reduced-sets' }), alert({ type: 'skipped-exercise' }),
    alert({ type: 'technical-error', priority: 'high' }),
  ].map(normalizeReviewAlert));
  assert.deepEqual(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.length])), { urgent: 2, coaching: 2, routine: 3, technical: 1 });
});

check('an escalated routine alert goes with the urgent ones, not the day-to-day group', () => {
  const s = reviewSections([alert({ type: 'reduced-sets', priority: 'urgent' })].map(normalizeReviewAlert));
  assert.equal(s.urgent.length, 1);
  assert.equal(s.routine.length, 0);
});

check('routine alerts group by student and signal, the biggest group first', () => {
  const items = [
    ...Array.from({ length: 3 }, (_, i) => alert({ studentUid: 's1', studentName: 'Khánh Linh', exerciseName: `Bài ${i}` })),
    ...Array.from({ length: 5 }, (_, i) => alert({ studentUid: 's2', studentName: 'Nguyễn Khánh Linh', exerciseName: `Bài ${i}` })),
    alert({ studentUid: 's1', studentName: 'Khánh Linh', type: 'reduced-sets' }),
  ];
  const groups = groupRoutineAlerts(items, NOW);
  assert.deepEqual(groups.map((g) => [g.studentName, g.type, g.items.length]), [['Nguyễn Khánh Linh', 'progression-held', 5], ['Khánh Linh', 'progression-held', 3], ['Khánh Linh', 'reduced-sets', 1]]);
});

check('a group knows which alerts are still open, how many are old, and which exercises', () => {
  const [group] = groupRoutineAlerts([
    alert({ exerciseName: 'Squat', lastDetectedAt: ago(2) }),
    alert({ exerciseName: 'Squat', lastDetectedAt: ago(20), status: 'acknowledged' }),
    alert({ exerciseName: 'Row', lastDetectedAt: ago(30) }),
  ], NOW);
  assert.equal(group.openItems.length, 2);
  assert.equal(group.oldCount, 2);
  assert.deepEqual(group.exercises, ['Squat', 'Row']);
});

check('age is counted in whole days, and an alert from today says so', () => {
  assert.equal(alertAgeDays(alert({ lastDetectedAt: ago(0.2) }), NOW), 0);
  assert.equal(alertAgeDays(alert({ lastDetectedAt: ago(24) }), NOW), 24);
  assert.equal(alertAgeText(alert({ lastDetectedAt: ago(0.2) }), NOW), 'hôm nay');
  assert.equal(alertAgeText(alert({ lastDetectedAt: ago(3) }), NOW), '3 ngày trước');
  assert.equal(alertAgeDays({}, NOW), 0);
});

check('the age filter finds the recent ones and the stale ones, and nothing in between for "old"', () => {
  // The filter reads the real clock, so the ages are taken from it rather than from NOW.
  const before = (days) => new Date(Date.now() - days * DAY);
  const items = [alert({ id: 'new', lastDetectedAt: before(1) }), alert({ id: 'mid', lastDetectedAt: before(10) }), alert({ id: 'old', lastDetectedAt: before(30) })];
  assert.deepEqual(filterReviewAlerts(items, { age: 'recent' }).map((i) => i.id), ['new']);
  assert.deepEqual(filterReviewAlerts(items, { age: 'old' }).map((i) => i.id), ['old']);
  assert.equal(filterReviewAlerts(items, {}).length, 3);
});

const ui = readFileSync(new URL('../review-dashboard-ui.js', import.meta.url), 'utf8');
const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8');

check('urgent and technical alerts ride along with the summary, so no page of routine ones can hide them', () => {
  assert.match(data, /\[\.\.\.urgentSnap\.docs, \.\.\.technicalSnap\.docs\]\.filter\(isActive\)/);
  assert.match(data, /pinned: \[\.\.\.pinned\.values\(\)\]/);
  assert.match(ui, /if \(Array\.isArray\(next\?\.pinned\)\) pinned = next\.pinned/);
  assert.match(ui, /mergeReviewAlertPages\(pinned, olderPages, firstPage\)/);
});

check('marking a whole group as seen asks first, and only touches alerts that are still open', () => {
  assert.match(ui, /if \(!confirm\(/);
  assert.match(ui, /await onBulkAction\(group\.openItems, 'viewed'\)/);
  assert.match(coach, /onBulkAction: async \(items, action\) => \{\s*if \(action !== 'viewed'\) return;/);
});

check('the routine block stays open across a re-render, so a bulk action does not close it', () => {
  assert.match(ui, /section\.open = routineOpen/);
  assert.match(ui, /row\.open = openRoutineRows\.has\(group\.key\)/);
});

console.log(`review-triage: ${passed} passed`);
