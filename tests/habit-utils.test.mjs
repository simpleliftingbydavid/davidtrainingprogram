// Run with:  node tests/habit-utils.test.mjs
import assert from 'node:assert/strict';
import {
  MAX_HABITS, addDays, adherence, currentStreak, habitDayStatus, habitSummary, isIsoDay, isLoggableDay,
  logsByDate, missedInARow, nextHabitId, normalizeHabitLog, normalizeHabitPlan, recentDays,
  trackerGrid, validateHabitPlan, withHabitStatus,
} from '../habit-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const TODAY = '2026-10-10';
const habit = (overrides = {}) => ({
  id: 'h1', name: 'Ăn đủ protein bữa sáng', cue: 'Sau khi đánh răng', twoMinute: 'Uống một ly sữa',
  reward: '', startedOn: '2026-10-01', ...overrides,
});
const logs = (map) => Object.fromEntries(Object.entries(map).map(([day, status]) => [day, { h1: status }]));

check('day arithmetic crosses months and leap days without timezone drift', () => {
  assert.equal(addDays('2026-10-01', -1), '2026-09-30');
  assert.equal(addDays('2028-03-01', -1), '2028-02-29');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.deepEqual(recentDays('2026-10-02', 3), ['2026-10-02', '2026-10-01', '2026-09-30']);
});

check('only real calendar days are accepted', () => {
  assert.equal(isIsoDay('2026-10-10'), true);
  assert.equal(isIsoDay('2026-02-30'), false);
  assert.equal(isIsoDay('10/10/2026'), false);
  assert.equal(isIsoDay(null), false);
});

check('a plan keeps at most three habits and drops nameless or duplicate ones', () => {
  const plan = normalizeHabitPlan({
    identity: '  Tôi là người   chăm sóc cơ thể ',
    habits: [
      habit({ id: 'h1' }), habit({ id: 'h1', name: 'Trùng id' }), { id: 'h2', name: '   ' },
      habit({ id: 'h3' }), habit({ id: 'h4' }), habit({ id: 'h5' }),
    ],
  }, TODAY);
  assert.equal(plan.habits.length, MAX_HABITS);
  assert.deepEqual(plan.habits.map((item) => item.id), ['h1', 'h3', 'h4']);
  assert.equal(plan.identity, 'Tôi là người chăm sóc cơ thể');
});

check('a plan read from garbage does not throw', () => {
  for (const raw of [undefined, null, 'x', 5, { habits: 'x' }, { habits: [null, 3, 'a'] }]) {
    assert.deepEqual(normalizeHabitPlan(raw, TODAY).habits, []);
  }
});

check('a habit with no start date starts today, so it never owes missed days', () => {
  const [item] = normalizeHabitPlan({ habits: [{ id: 'h1', name: 'Đi bộ' }] }, TODAY).habits;
  assert.equal(item.startedOn, TODAY);
  assert.equal(missedInARow({}, item, TODAY), 0);
});

check('over-long text is cut to the stored limit', () => {
  const [item] = normalizeHabitPlan({ habits: [habit({ name: 'a'.repeat(500) })] }, TODAY).habits;
  assert.equal(item.name.length, 80);
});

check('a habit needs a what, a cue and a two-minute version', () => {
  assert.equal(validateHabitPlan({ habits: [habit()] }).ok, true);
  for (const missing of ['name', 'cue', 'twoMinute']) {
    const result = validateHabitPlan({ habits: [habit({ [missing]: '  ' })] });
    assert.equal(result.ok, false, missing);
    assert.match(result.errors[0], /Thói quen 1/);
  }
  assert.equal(validateHabitPlan({ habits: [habit({ reward: '' })] }).ok, true);
  assert.equal(validateHabitPlan({ habits: [habit(), habit(), habit(), habit()] }).ok, false);
});

check('new habit ids fill the gaps and never collide', () => {
  assert.equal(nextHabitId([]), 'h1');
  assert.equal(nextHabitId([{ id: 'h1' }, { id: 'h3' }]), 'h2');
});

check('only today and yesterday can be ticked', () => {
  assert.equal(isLoggableDay('2026-10-10', TODAY), true);
  assert.equal(isLoggableDay('2026-10-09', TODAY), true);
  assert.equal(isLoggableDay('2026-10-08', TODAY), false);
  assert.equal(isLoggableDay('2026-10-11', TODAY), false);
  assert.equal(isLoggableDay('banana', TODAY), false);
});

check('ticking sets a status, clearing removes it, unknown statuses are refused', () => {
  assert.deepEqual(withHabitStatus({}, 'h1', 'full'), { h1: 'full' });
  assert.deepEqual(withHabitStatus({ h1: 'full', h2: 'minimum' }, 'h1', null), { h2: 'minimum' });
  assert.deepEqual(withHabitStatus({ h1: 'full' }, 'h1', 'perfect'), {});
  assert.deepEqual(normalizeHabitLog({ done: { h1: 'full', h2: 'bogus', h9: 'minimum' } }, ['h1', 'h2']), { h1: 'full' });
});

check('logs from Firestore documents are keyed by their date', () => {
  const map = logsByDate([{ id: '2026-10-09', done: { h1: 'full' } }, { id: 'junk', done: { h1: 'full' } }]);
  assert.deepEqual(Object.keys(map), ['2026-10-09']);
});

check('the two-minute version keeps a streak alive exactly like a full day', () => {
  const map = logs({ '2026-10-10': 'full', '2026-10-09': 'minimum', '2026-10-08': 'full' });
  assert.equal(currentStreak(map, habit(), TODAY), 3);
});

check('an unticked today does not zero a streak, it is just not counted yet', () => {
  const map = logs({ '2026-10-09': 'full', '2026-10-08': 'full' });
  assert.equal(currentStreak(map, habit(), TODAY), 2);
});

check('a gap ends the streak', () => {
  const map = logs({ '2026-10-10': 'full', '2026-10-08': 'full' });
  assert.equal(currentStreak(map, habit(), TODAY), 1);
});

check('ticks from before a habit started belong to a deleted habit that shared its id', () => {
  const map = logs({ '2026-10-10': 'full', '2026-10-09': 'full', '2026-10-08': 'full' });
  const successor = habit({ startedOn: '2026-10-10' });
  assert.equal(currentStreak(map, successor, TODAY), 1);
  assert.equal(habitDayStatus(map, '2026-10-09', successor), null);
  assert.equal(adherence(map, successor, TODAY, 7).possible, 1);
  assert.equal(trackerGrid(map, successor, TODAY, 3)[1].status, null);
});

check('one missed day is an accident, two in a row is flagged', () => {
  const one = logs({ '2026-10-08': 'full' });
  assert.equal(missedInARow(one, habit(), TODAY), 1);
  assert.equal(habitSummary({ habits: [habit()] }, one, TODAY).needsAttention, false);

  const two = logs({ '2026-10-07': 'full' });
  assert.equal(missedInARow(two, habit(), TODAY), 2);
  assert.equal(habitSummary({ habits: [habit()] }, two, TODAY).needsAttention, true);
});

check('today does not count as missed while it is still open', () => {
  const map = logs({ '2026-10-09': 'full' });
  assert.equal(missedInARow(map, habit(), TODAY), 0);
});

check('days before the habit was started are never counted as missed', () => {
  assert.equal(missedInARow({}, habit({ startedOn: '2026-10-09' }), TODAY), 1);
  assert.equal(missedInARow({}, habit({ startedOn: TODAY }), TODAY), 0);
});

check('adherence ignores an unfinished today and days before the start', () => {
  const map = logs({ '2026-10-09': 'full', '2026-10-08': 'minimum', '2026-10-07': 'full' });
  const week = adherence(map, habit({ startedOn: '2026-10-06' }), TODAY, 7);
  assert.deepEqual({ done: week.done, possible: week.possible }, { done: 3, possible: 4 });
  assert.equal(week.rate, 0.75);
  assert.equal(adherence({}, habit({ startedOn: TODAY }), TODAY, 7).rate, null);
});

check('a tick for today does count towards adherence', () => {
  const week = adherence(logs({ '2026-10-10': 'full' }), habit({ startedOn: TODAY }), TODAY, 7);
  assert.deepEqual({ done: week.done, possible: week.possible }, { done: 1, possible: 1 });
});

check('the tracker grid runs oldest to newest and marks days before the start', () => {
  const grid = trackerGrid(logs({ '2026-10-10': 'full' }), habit({ startedOn: '2026-10-09' }), TODAY, 3);
  assert.deepEqual(grid.map((cell) => cell.date), ['2026-10-08', '2026-10-09', '2026-10-10']);
  assert.deepEqual(grid.map((cell) => cell.before), [true, false, false]);
  assert.equal(grid[2].status, 'full');
});

check('the coach summary of a client with no plan is empty, not an error', () => {
  const summary = habitSummary(undefined, {}, TODAY);
  assert.deepEqual({ hasPlan: summary.hasPlan, needsAttention: summary.needsAttention, rows: summary.habits.length },
    { hasPlan: false, needsAttention: false, rows: 0 });
});

check('the summary reports each habit separately', () => {
  const plan = { habits: [habit(), habit({ id: 'h2', name: 'Ngủ trước 23h' })] };
  const map = { '2026-10-09': { h1: 'full', h2: 'full' }, '2026-10-08': { h1: 'full' } };
  const summary = habitSummary(plan, map, TODAY);
  assert.equal(summary.habits[0].streak, 2);
  assert.equal(summary.habits[1].streak, 1);
  assert.equal(summary.habits[1].missedInARow, 0);
});

console.log(`habit-utils: ${passed} passed`);
