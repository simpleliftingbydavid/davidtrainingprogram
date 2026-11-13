// The cycle goal and its reminders on the coach's Theo dõi tab (2026-11-03).
//   node tests/cycle-goal-guide.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { goalGuide, goalGuideMarkup, normalizePhaseGoal } from '../cycle-goal-guide.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('only known goals are kept', () => {
  assert.equal(normalizePhaseGoal('strength'), 'strength');
  assert.equal(normalizePhaseGoal('cardio'), '');
  assert.equal(goalGuide({ goal: '' }), null);
  assert.match(goalGuideMarkup(null), /chưa có mục tiêu/);
});

check('strength: the 1RM test is announced, due from week 8, late after week 12', () => {
  assert.equal(goalGuide({ goal: 'strength', week: 3 }).oneRm.status, 'early');
  assert.match(goalGuide({ goal: 'strength', week: 3 }).oneRm.text, /còn 5 tuần/);
  assert.equal(goalGuide({ goal: 'strength', week: 8 }).oneRm.status, 'due');
  assert.match(goalGuide({ goal: 'strength', week: 10 }).oneRm.text, /nghỉ hẳn 3–4 ngày/);
  assert.equal(goalGuide({ goal: 'strength', week: 13 }).oneRm.status, 'late');
  assert.equal(goalGuide({ goal: 'strength', week: null }).oneRm.status, 'early');
});

check('muscle: no 1RM, the stall checklist opens from week 8', () => {
  const early = goalGuide({ goal: 'muscle', week: 4 });
  assert.equal(early.oneRm, null);
  assert.equal(early.stall[0].active, false);
  const late = goalGuide({ goal: 'muscle', week: 9 });
  assert.equal(late.stall[0].active, true);
  assert.match(goalGuideMarkup(late, { week: 9 }), /<details class="goal-stall is-active" open>/);
  assert.match(goalGuideMarkup(late, { week: 9 }), /Thêm 1–2 set cho mỗi nhóm cơ/);
});

check('powerbuilding carries both: the 1RM test and both checklists', () => {
  const guide = goalGuide({ goal: 'powerbuilding', week: 9 });
  assert.equal(guide.oneRm.status, 'due');
  assert.deepEqual(guide.stall.map((item) => item.part), ['strength', 'muscle']);
  assert.match(goalGuideMarkup(guide, { week: 9 }), /Khi học viên chững lại · sức mạnh/);
});

const coach = readFileSync(new URL('../coach.html', import.meta.url), 'utf8').replace(/\r/g, '');
const planner = readFileSync(new URL('../dose-planner.html', import.meta.url), 'utf8').replace(/\r/g, '');
const data = readFileSync(new URL('../training-data.js', import.meta.url), 'utf8').replace(/\r/g, '');
check('the goal is saved with the cycle: from the planner, the new-cycle form, or set later', () => {
  assert.ok(data.includes('...(normalizePhaseGoal(goal) ? { goal: normalizePhaseGoal(goal) } : {}),'), 'createPhaseDraft keeps a valid goal');
  assert.ok(data.includes('export async function setPhaseGoal(studentUid, phaseId, goal)'));
  assert.ok(planner.includes("goal: $('goal').value"), 'the planner passes its goal');
  assert.ok(coach.includes('id="phase-goal-input"'));
  assert.ok(coach.includes('id="phase-goal-select"'));
  assert.ok(coach.includes('id="goal-guide-card"'));
});

console.log(`CYCLE_GOAL_GUIDE_OK ${passed} passed`);
