import assert from 'node:assert/strict';
import test from 'node:test';
import { filterReviewAlerts, groupReviewAlerts, reviewSummary } from '../review-dashboard-utils.js';
const items = [
  { id: '1', studentUid: 'a', studentName: 'An', clientCategory: 'online', type: 'pain', priority: 'urgent', status: 'open', lastDetectedAt: 2 },
  { id: '2', studentUid: 'a', studentName: 'An', clientCategory: 'online', type: 'exercise-feedback', priority: 'normal', status: 'resolved', lastDetectedAt: 3 },
  { id: '3', studentUid: 'b', studentName: 'Bình', clientCategory: 'gym', type: 'reduced-sets', priority: 'high', status: 'acknowledged', lastDetectedAt: 1 },
];
test('summaries and filters are stable', () => {
  assert.deepEqual(reviewSummary(items), { open: 1, urgent: 1, inProgress: 1, resolved: 1 });
  assert.deepEqual(filterReviewAlerts(items, { category: 'online', status: 'open' }).map((x) => x.id), ['1']);
  assert.deepEqual(filterReviewAlerts(items, { search: 'bình' }).map((x) => x.id), ['3']);
});
test('groups alerts by student after priority sorting', () => {
  const groups = groupReviewAlerts(filterReviewAlerts(items));
  assert.equal(groups.length, 2); assert.equal(groups[0].studentUid, 'a');
});

test('RIR calibration is available as a first-class dashboard filter', async () => {
  const { REVIEW_TYPE } = await import('../review-dashboard-utils.js');
  assert.equal(REVIEW_TYPE['rir-calibration'], 'Hiệu chỉnh RIR');
  const result = filterReviewAlerts([{ id: 'rir', studentUid: 'a', type: 'rir-calibration', priority: 'high', status: 'open' }], { type: 'rir-calibration' });
  assert.deepEqual(result.map((item) => item.id), ['rir']);
});
