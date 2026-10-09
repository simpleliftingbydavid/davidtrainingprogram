// Run with:  node tests/progress-utils.test.mjs
import assert from 'node:assert/strict';
import {
  activeWeekStreak, angleLabel, beforeAfterPairs, buildMilestones, filterPhotos, measurementTrend,
  normalizeAngle, strengthProgress, weeklyWeightAverages,
} from '../progress-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

// 2026-10-09 is a Friday; noon Vietnam time is 05:00 UTC.
const TODAY = '2026-10-09';
const at = (iso) => new Date(`${iso}T05:00:00Z`);
const photo = (iso, angle, id = `${angle || 'none'}-${iso}`) => ({ id, takenAt: at(iso), angle });
const weigh = (iso, weight) => ({ loggedAt: at(iso), weight });
const session = (iso, exerciseLogs = []) => ({ performedAt: at(iso), dayLabel: 'A', exerciseLogs });
const lift = (exerciseId, weight, reps = 5, extra = {}) => ({ exerciseId, actualSets: [{ weight, reps }], ...extra });
const name = (id) => id.toUpperCase();

check('only the three known angles are accepted, anything else is unclassified', () => {
  assert.equal(normalizeAngle('front'), 'front');
  for (const bad of ['', 'FRONT', 'left', null, undefined, 3]) assert.equal(normalizeAngle(bad), '');
  assert.equal(angleLabel('side'), 'Side');
  assert.equal(angleLabel(''), 'Chưa phân loại');
});

check('photos filter by angle, and the unclassified ones have their own filter', () => {
  const photos = [photo('2026-09-01', 'front'), photo('2026-09-02', 'back'), photo('2026-09-03', ''), photo('2026-09-04', undefined), photo('2026-09-05', 'weird')];
  assert.equal(filterPhotos(photos, 'all').length, 5);
  assert.equal(filterPhotos(photos, 'front').length, 1);
  assert.equal(filterPhotos(photos, 'none').length, 3);
  assert.equal(filterPhotos(photos, 'side').length, 0);
});

check('before and after is the first and the latest photo of each angle, days apart', () => {
  const photos = [
    photo('2026-08-01', 'front'), photo('2026-09-01', 'front'), photo('2026-10-01', 'front'),
    photo('2026-08-02', 'back'), photo('2026-10-02', 'back'),
    photo('2026-09-01', 'side'),
    photo('2026-08-01', ''),
  ];
  const pairs = beforeAfterPairs(photos);
  assert.deepEqual(pairs.map((pair) => pair.angle), ['front', 'back']);
  assert.deepEqual([pairs[0].beforeDay, pairs[0].afterDay, pairs[0].days], ['2026-08-01', '2026-10-01', 61]);
  assert.equal(pairs[1].days, 61);
});

check('two photos of an angle on the same day are not a before and after', () => {
  assert.deepEqual(beforeAfterPairs([photo('2026-10-01', 'front', 'a'), photo('2026-10-01', 'front', 'b')]), []);
});

check('weekly averages group Monday to Sunday and flag thin weeks', () => {
  const logs = [
    weigh('2026-10-09', 70), weigh('2026-10-08', 70.2), weigh('2026-10-07', 69.8), weigh('2026-10-05', 70),
    weigh('2026-10-04', 71), weigh('2026-09-30', 71.4),
  ];
  const { weeks, daily } = weeklyWeightAverages(logs, TODAY, 12);
  assert.deepEqual(weeks.map((week) => [week.start, week.count, week.enough]), [['2026-09-28', 2, false], ['2026-10-05', 4, true]]);
  assert.equal(weeks[1].avg, 70);
  assert.equal(weeks[0].avg, 71.2);
  assert.equal(daily.length, 6);
});

check('weigh-ins outside the window, in the future, or unreadable are ignored', () => {
  const logs = [weigh('2026-01-01', 90), weigh('2026-10-20', 60), { loggedAt: at('2026-10-08'), weight: 'x' }, { loggedAt: null, weight: 70 }, weigh('2026-10-08', 70)];
  const { weeks } = weeklyWeightAverages(logs, TODAY, 12);
  assert.deepEqual(weeks.map((week) => week.count), [1]);
});

check('strength follows each exercise from its first heaviest set to its best', () => {
  const sessions = [
    session('2026-09-01', [lift('squat', 60)]), session('2026-09-08', [lift('squat', 70)]),
    session('2026-09-15', [lift('squat', 65)]), session('2026-10-01', [lift('squat', 75)]),
  ];
  const [row] = strengthProgress(sessions, name);
  assert.deepEqual({ id: row.id, sessions: row.sessions, first: row.first.weight, best: row.best, latest: row.latest.weight, gain: row.gain, isRecord: row.isRecord }, { id: 'squat', sessions: 4, first: 60, best: 75, latest: 75, gain: 15, isRecord: true });
  assert.deepEqual(row.series.map((point) => point.weight), [60, 70, 65, 75]);
});

check('a lighter latest session is not marked as a record, and the best stays the best', () => {
  const sessions = [session('2026-09-01', [lift('squat', 80)]), session('2026-10-01', [lift('squat', 70)])];
  const [row] = strengthProgress(sessions, name);
  assert.deepEqual({ best: row.best, isRecord: row.isRecord, gain: row.gain }, { best: 80, isRecord: false, gain: 0 });
});

check('an exercise done once, and bodyweight work, have nothing to follow', () => {
  const sessions = [session('2026-09-01', [lift('squat', 80), lift('pushup', 0)]), session('2026-10-01', [lift('pushup', 0)])];
  assert.deepEqual(strengthProgress(sessions, name), []);
});

check('the most-trained exercises come first and the list is capped', () => {
  const sessions = [];
  for (let day = 1; day <= 8; day++) sessions.push(session(`2026-09-0${day}`, [lift('squat', 60 + day), ...(day <= 3 ? [lift('curl', 10 + day)] : [])]));
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) { sessions.push(session('2026-09-20', [lift(id, 20)]), session('2026-09-21', [lift(id, 25)])); }
  const rows = strengthProgress(sessions, name, { limit: 3 });
  assert.equal(rows.length, 3);
  assert.equal(rows[0].id, 'squat');
});

check('a substituted exercise is followed as the exercise actually done', () => {
  const sessions = [session('2026-09-01', [lift('squat', 60, 5, { substitutedExerciseId: 'hack' })]), session('2026-10-01', [lift('squat', 70, 5, { substitutedExerciseId: 'hack' })])];
  assert.equal(strengthProgress(sessions, name)[0].id, 'hack');
});

check('the waist trend is the change from the first measurement to the latest', () => {
  const logs = [{ loggedAt: at('2026-10-05'), waistCm: 84 }, { loggedAt: at('2026-09-01'), waistCm: 88 }, { loggedAt: at('2026-09-20'), waistCm: 86.5 }];
  const trend = measurementTrend(logs);
  assert.deepEqual({ count: trend.count, first: trend.first.value, latest: trend.latest.value, delta: trend.delta }, { count: 3, first: 88, latest: 84, delta: -4 });
  assert.deepEqual(trend.series.map((point) => point.value), [88, 86.5, 84]);
});

check('one measurement has no change yet, none gives an empty trend', () => {
  assert.equal(measurementTrend([{ loggedAt: at('2026-10-05'), waistCm: 84 }]).delta, null);
  assert.deepEqual(measurementTrend([{ loggedAt: at('2026-10-05'), waistCm: 'x' }, { loggedAt: null, waistCm: 80 }]).count, 0);
});

check('the active week streak counts back through weeks with a session', () => {
  const sessions = [session('2026-10-07'), session('2026-09-30'), session('2026-09-22'), session('2026-09-10')];
  assert.equal(activeWeekStreak(sessions, TODAY), 3);
});

check('a current week with no session yet does not break a streak', () => {
  assert.equal(activeWeekStreak([session('2026-10-02'), session('2026-09-25')], TODAY), 2);
  assert.equal(activeWeekStreak([session('2026-09-10')], TODAY), 0);
  assert.equal(activeWeekStreak([], TODAY), 0);
});

check('milestones: a brand-new student has earned nothing and is told what is next', () => {
  const result = buildMilestones({ today: TODAY });
  assert.equal(result.earned.length, 0);
  assert.deepEqual(result.next.map((item) => [item.group, item.target, item.remaining]), [['sessions', 1, 1], ['weeks', 4, 4], ['habit', 7, 7]]);
});

check('milestones are earned from what the student has actually done', () => {
  const sessions = Array.from({ length: 12 }, (_, i) => session(`2026-09-${String(i + 1).padStart(2, '0')}`));
  const result = buildMilestones({
    sessions,
    photos: [photo('2026-09-01', 'front'), photo('2026-09-01', 'side'), photo('2026-09-01', 'back')],
    weightWeeks: [{ count: 5, enough: true }],
    measurements: [{ waistCm: 85 }],
    bestHabitStreak: 9,
    strength: [{ gain: 5 }],
    today: TODAY,
  });
  const ids = result.earned.map((item) => item.id);
  for (const id of ['sessions-1', 'sessions-10', 'habit-7', 'photo-first', 'photo-set', 'weigh-week', 'waist-first', 'strength-up']) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes('sessions-25'));
  assert.deepEqual(result.next.find((item) => item.group === 'sessions'), { id: 'sessions-25', group: 'sessions', label: '25 buổi tập', earned: false, value: 12, target: 25, remaining: 13 });
});

check('the 3-angle badge needs all three, not just three photos', () => {
  const two = buildMilestones({ photos: [photo('2026-09-01', 'front'), photo('2026-09-02', 'front'), photo('2026-09-03', 'side')], today: TODAY });
  assert.ok(!two.earned.some((item) => item.id === 'photo-set'));
  assert.ok(two.earned.some((item) => item.id === 'photo-first'));
});

console.log(`progress-utils: ${passed} passed`);
