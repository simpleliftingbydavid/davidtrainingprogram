// Bài tính tạ một bên: nhãn "mỗi bên"/"mỗi tay" sau số kg ở mọi trang (David chốt 2026-11-10).
//   node tests/unilateral-load.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EXERCISES, getExerciseById } from '../exercise-seed-data.js';
import { LOAD_PER_LABELS, liftLoadText, loadPerLabel, loadPerSuffix, plateFigure, plateStrip } from '../client-ui.js';
import { liftSummary } from '../home-utils.js';
import { setTableMarkup } from '../history-view.js';
import { strengthMarkup } from '../progress-views.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const SIDE = ['db_rows', 'landmine_row_1arm', 'lat_pulldown_1arm', 'landmine_press_1arm_kneeling', 'single_leg_leg_extension',
  'db_step_ups', 'single_leg_leg_press', 'single_leg_rdl', 'cable_kickback',
  'one_arm_cable_pushdown', 'cross_body_cable_triceps_extension', 'lying_cross_body_tricep_extension', 'glute_biased_split_squat',
  'weighted_single_leg_squat', 'db_side_bend', 'cable_lateral_raise',
  'behind_body_cable_lateral_raise', 'bayesian_curls',
  'machine_rows', 'machine_lat_pulldowns', 'machine_lat_pullover',
  'machine_shoulder_press', 'machine_hip_thrust', 'machine_tricep_dips', 'chest_supported_row'];
const HAND = ['db_incline_bench_press', 'db_seated_shoulder_press', 'db_lateral_raise', 'incline_db_curl', 'db_hammer_curl', 'db_rdl',
  'db_walking_lunge', 'kelso_shrug',
  'seated_rdl', 'db_bulgarian_split_squat', 'ring_weighted_bulgarian_split_squat', 'b_stance_rdl'];

check('the library tags exactly the 25 one-side and 12 one-dumbbell-a-hand lifts David approved', () => {
  const tagged = (value) => EXERCISES.filter((e) => e.loadPer === value).map((e) => e.exerciseId).sort();
  assert.deepEqual(tagged('side'), [...SIDE].sort());
  assert.deepEqual(tagged('hand'), [...HAND].sort());
  assert.equal(EXERCISES.filter((e) => 'loadPer' in e).length, 37, 'mọi bài còn lại không có trường này');
  assert.deepEqual({ ...LOAD_PER_LABELS }, { side: 'mỗi bên', hand: 'mỗi tay' });
});

check('one helper names the label from the lift, its id or its tag', () => {
  assert.equal(loadPerLabel(getExerciseById('db_rows')), 'mỗi bên');
  assert.equal(loadPerLabel('db_lateral_raise'), 'mỗi tay');
  assert.equal(loadPerLabel('side'), 'mỗi bên');
  assert.equal(loadPerLabel('bench_press'), '');
  ['smith_machine_row', 't_bar_row'].forEach((id) => assert.equal(loadPerLabel(id), '', `${id}: thanh đòn, số là tổng`));
  ['db_pullover', 'db_tricep_extension', 'goblet_squat', 'weighted_russian_twist'].forEach((id) => assert.equal(loadPerLabel(id), '', `${id}: một quả tạ, số là tổng`));
  assert.equal(loadPerLabel(null), '');
  assert.equal(loadPerSuffix('db_rows'), ' mỗi bên');
  assert.equal(loadPerSuffix('squat'), '');
});

check('a lift reads "20 kg mỗi bên"; a barbell lift stays "100 kg"', () => {
  const planned = { sets: 3, reps: 10, weight: 20 };
  const side = liftSummary({ scheme: 8 }, planned, getExerciseById('db_rows'));
  assert.equal(side.loadPer, 'side');
  assert.equal(liftLoadText(side), '20 kg mỗi bên');
  assert.equal(liftLoadText(liftSummary({ scheme: 8 }, planned, getExerciseById('db_hammer_curl'))), '20 kg mỗi tay');
  const bar = liftSummary({ scheme: 2 }, { ...planned, weight: 100 }, getExerciseById('squat'));
  assert.equal(liftLoadText(bar), '100 kg');
  assert.equal('loadPer' in bar, false);
});

check('a one-arm landmine lift is never drawn as a two-sided barbell', () => {
  const ex = getExerciseById('landmine_row_1arm');
  assert.ok(ex.equipmentTags.includes('barbell'));
  const lift = liftSummary({ scheme: 8 }, { sets: 3, reps: 10, weight: 40 }, ex);
  assert.equal(plateFigure(lift, ex), '');
  assert.equal(plateStrip(lift, ex), '');
  assert.notEqual(plateFigure({ weight: 60 }, getExerciseById('squat')), '');
});

check('history tables and strength cards carry the label', () => {
  const log = { exerciseId: 'db_rows', planned: { sets: 2, reps: 10, weight: 20 }, actualSets: [{ weight: 20, reps: 10 }, { weight: 20, reps: 9 }] };
  assert.match(setTableMarkup(log), /<p class="set-per">Số kg là mỗi bên\.<\/p>/);
  assert.doesNotMatch(setTableMarkup({ ...log, exerciseId: 'squat' }), /set-per/);
  assert.match(setTableMarkup({ ...log, exerciseId: 'squat', substitutedExerciseId: 'db_lateral_raise' }), /Số kg là mỗi tay/);
  const card = strengthMarkup([{ id: 'db_rows', name: 'DB Rows', first: { weight: 18 }, latest: { weight: 24 }, gain: 6, best: 24, sessions: 3, series: [{ weight: 18 }, { weight: 24 }] }]);
  assert.match(card, /24 kg mỗi bên/);
});

check('the pages use the shared helper, never a label typed in place', () => {
  const pages = {
    'client.html': [/Tạ \(kg\$\{loadPerSuffix\(activeExercise\)\}\)/,
      /plannedLineFor\(activeContext, planned, ex\)/, /const per = loadPerSuffix\(resultExercise\);/],
    'home.html': [/loadPerLabel\(each\.loadPer\)/, /kg\$\{loadPerSuffix\(record\.id\)\}/],
    'program.html': [/loadPerLabel\(lift\.loadPer\)/],
    'history.html': [/const per = loadPerSuffix\(log\.substitutedExerciseId \|\| log\.exerciseId\);/],
    'coach.html': [/const per = loadPerSuffix\(a\.exerciseId\);/, /kg\$\{loadPerSuffix\(performedId\)\} × \$\{log\.planned\.sets\} set/],
    'program-overview-utils.js': [/const per = loadPerSuffix\(assignment\.exerciseId\);/],
  };
  Object.entries(pages).forEach(([file, patterns]) => {
    const text = read(file);
    patterns.forEach((pattern) => assert.match(text, pattern, file));
    if (file !== 'client-ui.js') assert.doesNotMatch(text, /['"`]mỗi tay['"`]/, `${file}: nhãn chỉ nằm trong client-ui.js`);
  });
});

check('only a label: stored loads, volume and progression are untouched', () => {
  ['volume-engine.js', 'progression-engine.js', 'dose-planner.js'].forEach((file) => assert.doesNotMatch(read(file), /loadPer/, file));
});

console.log(`UNILATERAL_LOAD_OK ${passed} passed`);
