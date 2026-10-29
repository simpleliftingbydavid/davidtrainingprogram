// Run with:  node tests/home-utils.test.mjs
import assert from 'node:assert/strict';
import {
  BAR_KG, daysBetween, latestRecord, liftSummary, nextTrainingDay, photoReminder, plateLayout, platesPerSide, sessionsThisWeek,
  weekPunch, weekStart, weeksActive, weightSeries, weightTrend,
} from '../home-utils.js';
import { SCHEME, PROGRESSION_MODE, getInitialPrescription } from '../progression-engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

// 2026-10-09 is a Friday. Noon Vietnam time is 05:00 UTC, so a Date made from
// `${iso}T05:00:00Z` is that calendar day in Vietnam whatever the machine's zone.
const TODAY = '2026-10-09';
const at = (iso) => new Date(`${iso}T05:00:00Z`);
const session = (iso, dayLabel, exerciseLogs = []) => ({ performedAt: at(iso), dayLabel, exerciseLogs });
const weigh = (iso, weight) => ({ loggedAt: at(iso), weight });

check('weeks run Monday to Sunday', () => {
  assert.equal(weekStart('2026-10-09'), '2026-10-05');
  assert.equal(weekStart('2026-10-05'), '2026-10-05');
  assert.equal(weekStart('2026-10-11'), '2026-10-05');
  assert.equal(weekStart('2026-10-12'), '2026-10-12');
});

check('days between two dates, across a month end', () => {
  assert.equal(daysBetween('2026-09-28', '2026-10-09'), 11);
  assert.equal(daysBetween(TODAY, TODAY), 0);
});

check('the next training day follows the last session and wraps round', () => {
  const sessions = [session('2026-10-07', 'B'), session('2026-10-05', 'A')];
  assert.deepEqual(nextTrainingDay(sessions, ['A', 'B', 'C'], [], TODAY), { day: 'C', trainedToday: false, lastDay: 'B' });
  assert.equal(nextTrainingDay([session('2026-10-07', 'C')], ['A', 'B', 'C'], [], TODAY).day, 'A');
});

check('a student with no sessions starts on the first day', () => {
  assert.equal(nextTrainingDay([], ['A', 'B'], [], TODAY).day, 'A');
});

check('a paused day is skipped', () => {
  assert.equal(nextTrainingDay([session('2026-10-07', 'A')], ['A', 'B', 'C'], ['B'], TODAY).day, 'C');
  assert.equal(nextTrainingDay([session('2026-10-07', 'B')], ['A', 'B', 'C'], ['B'], TODAY).day, 'A', 'last session was on a day now paused');
  assert.equal(nextTrainingDay([], ['A'], ['A'], TODAY).day, null, 'nothing left to train');
});

check('having trained today is reported, so the page can say done', () => {
  const result = nextTrainingDay([session(TODAY, 'A')], ['A', 'B'], [], TODAY);
  assert.deepEqual({ day: result.day, trainedToday: result.trainedToday }, { day: 'B', trainedToday: true });
});

check('sessions this week count from Monday, not from seven days back', () => {
  const sessions = [session('2026-10-04', 'A'), session('2026-10-05', 'B'), session('2026-10-08', 'A'), session(TODAY, 'B')];
  assert.equal(sessionsThisWeek(sessions, TODAY), 3);
});

check('weeks active counts rolling seven-day windows with a session', () => {
  const now = at(TODAY).getTime();
  assert.equal(weeksActive([session('2026-10-08', 'A'), session('2026-10-01', 'A'), session('2026-09-24', 'A'), session('2026-09-17', 'A')], now), 4);
  assert.equal(weeksActive([session('2026-10-08', 'A'), session('2026-10-07', 'B')], now), 1);
  assert.equal(weeksActive([], now), 0);
});

check('a weight trend needs enough weigh-ins in both weeks before it claims anything', () => {
  const some = [weigh('2026-10-09', 70), weigh('2026-10-02', 71)];
  const trend = weightTrend(some, TODAY);
  assert.deepEqual({ latest: trend.latest.weight, enough: trend.enough, delta: trend.delta }, { latest: 70, enough: false, delta: null });
});

check('with enough weigh-ins the trend is the change in weekly averages', () => {
  const logs = [
    weigh('2026-10-09', 70), weigh('2026-10-08', 70.2), weigh('2026-10-07', 69.8), weigh('2026-10-05', 70),
    weigh('2026-10-02', 71), weigh('2026-10-01', 71.2), weigh('2026-09-30', 70.8), weigh('2026-09-28', 71),
  ];
  const trend = weightTrend(logs, TODAY);
  assert.equal(trend.enough, true);
  assert.equal(trend.delta, -1);
  assert.equal(trend.thisWeek.count, 4);
});

check('no weigh-ins, or junk ones, give an empty trend', () => {
  assert.equal(weightTrend([], TODAY).latest, null);
  assert.equal(weightTrend([{ loggedAt: at(TODAY), weight: 'x' }, { loggedAt: null, weight: 70 }], TODAY).latest, null);
});

const lift = (exerciseId, weight, reps = 5, extra = {}) => ({ exerciseId, actualSets: [{ weight, reps }, { weight: weight - 10, reps }], ...extra });
const name = (id) => id.toUpperCase();

check('a heavier top set than any earlier session is a record, with before and after', () => {
  const sessions = [session('2026-09-20', 'A', [lift('squat', 80)]), session('2026-10-07', 'A', [lift('squat', 85)])];
  assert.deepEqual(latestRecord(sessions, name, TODAY), { id: 'squat', name: 'SQUAT', from: 80, to: 85, day: '2026-10-07' });
});

check('a first appearance, a repeat and a lighter day are not records', () => {
  assert.equal(latestRecord([session('2026-10-07', 'A', [lift('squat', 85)])], name, TODAY), null, 'first appearance');
  assert.equal(latestRecord([session('2026-09-20', 'A', [lift('squat', 85)]), session('2026-10-07', 'A', [lift('squat', 85)])], name, TODAY), null, 'repeat');
  assert.equal(latestRecord([session('2026-09-20', 'A', [lift('squat', 85)]), session('2026-10-07', 'A', [lift('squat', 80)])], name, TODAY), null, 'lighter');
});

check('a record older than the window, and bodyweight work, are ignored', () => {
  const old = [session('2026-08-01', 'A', [lift('squat', 80)]), session('2026-08-20', 'A', [lift('squat', 90)])];
  assert.equal(latestRecord(old, name, TODAY), null);
  assert.equal(latestRecord([session('2026-09-20', 'A', [lift('pushup', 0)]), session('2026-10-07', 'A', [lift('pushup', 0)])], name, TODAY), null);
});

check('a substituted exercise is judged as the exercise actually done', () => {
  const sessions = [
    session('2026-09-20', 'A', [lift('hack_squat', 100)]),
    session('2026-10-07', 'A', [lift('squat', 60, 5, { substitutedExerciseId: 'hack_squat' }), lift('squat', 120)]),
  ];
  assert.equal(latestRecord(sessions, name, TODAY), null, 'the 60 kg hack squat is lighter than 100, and the real squat has no earlier record');
  assert.equal(latestRecord([sessions[0], session('2026-10-07', 'A', [lift('squat', 110, 5, { substitutedExerciseId: 'hack_squat' })])], name, TODAY).id, 'hack_squat');
});

check('sets with no reps do not count as a heaviest set', () => {
  const sessions = [session('2026-09-20', 'A', [lift('squat', 80)]), session('2026-10-07', 'A', [{ exerciseId: 'squat', actualSets: [{ weight: 200, reps: 0 }] }])];
  assert.equal(latestRecord(sessions, name, TODAY), null);
});

check('a photo reminder: none yet, recent, and overdue', () => {
  assert.deepEqual(photoReminder([], TODAY), { daysSince: null, due: true, first: true });
  assert.deepEqual(photoReminder([{ takenAt: at('2026-10-01') }], TODAY), { daysSince: 8, due: false, first: false });
  assert.deepEqual(photoReminder([{ takenAt: at('2026-09-01') }, { takenAt: at('2026-09-20') }], TODAY), { daysSince: 19, due: true, first: false });
});

// ---------- the redesigned home page (David, 2026-10-29) ----------

check('the lead lift reads sets, reps and load from the same prescription the workout page uses', () => {
  const plain = { scheme: SCHEME.SET_THEN_REP_INCREASE, schemeParams: { startingSets: 3, endingSets: 5, startingReps: 5, endingReps: 8, setIncreaseStep: 1, repIncreaseStep: 1, weightIncreasePct: 3, roundingIncrement: 2.5 }, state: { workingWeight: 70, currentSets: 3, currentReps: 5, progressionStep: 2 } };
  const lift = liftSummary(plain, getInitialPrescription(plain));
  assert.equal(lift.weight, 70);
  assert.ok(lift.sets >= 1 && Number(lift.reps) >= 1);
  const pyramid = { scheme: SCHEME.REVERSE_PYRAMID, schemeParams: { setTargets: [6, 10, 12] }, state: { setWeights: [80, 70, 60] } };
  assert.deepEqual(liftSummary(pyramid, getInitialPrescription(pyramid)), { sets: 3, reps: '6–12', weight: 80, bodyweight: false, pyramid: true });
  const total = { scheme: SCHEME.FIXED_TOTAL_REPS, schemeParams: { plannedSets: 3, totalRepsTarget: 40 }, state: { workingWeight: 40 } };
  assert.deepEqual(liftSummary(total, getInitialPrescription(total)), { sets: 3, reps: '', totalReps: 40, weight: 40, bodyweight: false });
  const pullups = { scheme: SCHEME.REP_INCREASE, schemeParams: { startingSets: 4, endingSets: 6, startingReps: 8, repIncreaseStep: 1, progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY }, state: { currentSets: 4, currentReps: 8 } };
  assert.deepEqual(liftSummary(pullups, getInitialPrescription(pullups)), { sets: 4, reps: '8', weight: null, bodyweight: true });
  assert.equal(liftSummary(plain, { sets: 3, reps: 5, weight: 0 }).weight, null, 'no weight set yet: nothing to load');
});

check('plates per side for a 20 kg bar, biggest first, and only when they make the load exactly', () => {
  assert.equal(BAR_KG, 20);
  assert.deepEqual(platesPerSide(70), [25]);
  assert.deepEqual(platesPerSide(72.5), [25, 1.25]);
  assert.deepEqual(platesPerSide(140), [25, 25, 10]);
  assert.deepEqual(platesPerSide(20), [], 'the bar alone');
  assert.equal(platesPerSide(15), null, 'lighter than the bar');
  assert.equal(platesPerSide(71), null, 'between plate steps');
});

check('the plate drawing is the same on both sides and stays inside its frame', () => {
  for (const kg of [60, 70, 140, 200, 250]) {
    const layout = plateLayout(platesPerSide(kg), { width: 350, height: 150 });
    const left = layout.filter((plate) => plate.side === 'left');
    const right = layout.filter((plate) => plate.side === 'right');
    assert.equal(left.length, right.length);
    left.forEach((plate, index) => {
      assert.ok(Math.abs((plate.x + plate.w / 2) + (right[index].x + right[index].w / 2) - 350) < 0.5, `${kg}: mirrored`);
      assert.ok(plate.x >= 0 && right[index].x + right[index].w <= 350, `${kg}: inside the frame`);
      assert.ok(plate.y >= 0 && plate.y + plate.h <= 150);
    });
  }
  const [first, , second] = plateLayout([25, 5]);
  assert.ok(first.h > second.h, 'a heavier plate is drawn bigger');
});

check('the punch card runs Monday to Sunday and marks the days trained and today', () => {
  const week = weekPunch([session('2026-10-05', 'A'), session('2026-10-07', 'B'), session('2026-10-02', 'A')], TODAY);
  assert.deepEqual(week.map((day) => day.label), ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
  assert.deepEqual(week.filter((day) => day.trained).map((day) => day.iso), ['2026-10-05', '2026-10-07'], 'a session from last week is not counted');
  assert.deepEqual(week.filter((day) => day.today).map((day) => day.label), ['T6']);
  assert.deepEqual(week.filter((day) => day.future).map((day) => day.label), ['T7', 'CN']);
});

check('the weight chart keeps one weigh-in a day, the latest, over the last two weeks', () => {
  const logs = [
    weigh('2026-10-09', 59.2), { loggedAt: new Date('2026-10-09T01:00:00Z'), weight: 60 },
    weigh('2026-10-07', 59.0), weigh('2026-09-20', 58), { loggedAt: at('2026-10-08'), weight: 'x' },
  ];
  assert.deepEqual(weightSeries(logs, TODAY), [{ day: '2026-10-07', weight: 59 }, { day: '2026-10-09', weight: 59.2 }]);
});

console.log(`home-utils: ${passed} passed`);
