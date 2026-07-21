// ============================================================
// DAVID TRAINING PROGRAM — Exercise seed data
// ============================================================
// Static array, not a Firestore collection (see plan Section on
// Firestore data model). Promoting this to a coach-editable Firestore
// collection with full movement-pattern substitution is Phase 2.
//
// Source: "The Ripped Body Training Programs.xlsx" → sheet "Exercise
// Video Database", gym section only (rows 4-12, cols F-R). Exercise
// names + YouTube/Vimeo links were extracted from the sheet's actual
// hyperlink objects (not visible cell text) — each `videoUrl` below is
// the real link attached to that exercise's cell in the source file.
//
// `muscleGroup` (Vietnamese, shown to the coach) groups the picker via
// <optgroup>. `movementPattern` is the finer-grained internal tag kept
// for future exercise-substitution logic, mapped from the sheet's own
// column headers (Horizontal Push, Vertical Pull, Hinge Primary, etc).
//
// scheme: 2 = Last-set RIR (Training-Max tracked, see
// progression-engine.js), 8 = Set increase then rep increase. Only the
// 5 classic barbell "big lifts" use scheme 2 — everything else uses
// scheme 8, so the coach isn't managing a Training Max for exercises
// that don't need one.
//
// IDs for the 8 exercises that predate this expansion (squat,
// bench_press, deadlift, barbell_row, overhead_press, leg_press,
// lat_pulldown, lateral_raise) are unchanged on purpose — any
// already-assigned student programs keep working without needing
// reassignment.

import { SCHEME } from './progression-engine.js';

function scheme2(intensityPct, repsPerSet, plannedSets = 3, roundingIncrement = 2.5) {
  return { intensityPct, repsPerSet, plannedSets, targetRIR: 0, roundingIncrement };
}
function scheme8(roundingIncrement = 5) {
  return {
    startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
    setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10, roundingIncrement,
  };
}

export const EXERCISES = Object.freeze([
  // ---------------- Ngực (Chest) — Horizontal Push + Chest Accessory ----------------
  { exerciseId: 'bench_press', nameVi: 'BB Bench Press', muscleGroup: 'Ngực', movementPattern: 'compound_pec',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=IwpbvOc2g7I',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3) },
  { exerciseId: 'db_bench_press', nameVi: 'DB Bench Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'machine_chest_press', nameVi: 'Machine Chest Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=aV1U_mK3XOs',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'smith_bench_press', nameVi: 'Smith Machine Bench Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=O5viuEPDXKY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_alternating_press', nameVi: '1-Arm Alternating DB Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=5TVBnqJE8IA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'bb_incline_bench_press', nameVi: 'BB Incline Bench Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=lJ2o89kcnxY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'db_incline_bench_press', nameVi: 'DB Incline Bench Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=B09ZkYsnKko',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'smith_incline_press', nameVi: 'Smith Machine Incline Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=8urE8Z8AMQ4',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'push_up', nameVi: 'Push-up', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=mm6_WcoCVTA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'db_flys', nameVi: 'DB Flys', muscleGroup: 'Ngực', movementPattern: 'isolation_pec',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=JFm8KbhjibM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_flys', nameVi: 'Cable Flys', muscleGroup: 'Ngực', movementPattern: 'isolation_pec',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=4mfLHnFL0Uw',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'machine_flys', nameVi: 'Machine Flys', muscleGroup: 'Ngực', movementPattern: 'isolation_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=FDay9wFe5uE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Lưng (Back) — Horizontal Pull + Vertical Pull ----------------
  { exerciseId: 'seated_cable_row', nameVi: 'Seated Cable Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=UCXxvVItLoM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_rows', nameVi: 'DB Rows', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://youtu.be/f7U1Wfx94UQ?t=1m35s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'barbell_row', nameVi: 'Barbell Rows', muscleGroup: 'Lưng', movementPattern: 'compound_back_horizontal',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/KoYm_DZf-LA?t=1m7s',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(75.0, 8) },
  { exerciseId: 'landmine_row_1arm', nameVi: '1-Arm Landmine Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Z1nti67Nb7I',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'seal_rows', nameVi: 'Seal Rows', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=UzOhDqu-5Tw',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'smith_machine_row', nameVi: 'Smith Machine Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=3QcJggd_L24',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 't_bar_row', nameVi: 'T-Bar Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['barbell', 'machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yPis7nlbqdY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'inverted_row', nameVi: 'Inverted Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=KOaCM1HMwU0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'pull_up', nameVi: 'Pull-ups', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=GRgWPT9XSQQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'chin_up', nameVi: 'Chin-ups', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://vimeo.com/404918872',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'lat_pulldown', nameVi: 'Lat Pull-down', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://youtu.be/5Q7oFnQqQQc?t=440',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'lat_pulldown_1arm', nameVi: 'One-Arm Lat Pull-down', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=HBC5s98wXko',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'straight_arm_pulldown', nameVi: 'Straight-Arm Pull-down', muscleGroup: 'Lưng', movementPattern: 'isolation_back_vertical',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=G9uNaXGTJ4w',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_pullover', nameVi: 'DB Pullover', muscleGroup: 'Lưng', movementPattern: 'isolation_back_vertical',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=jQjWlIwG4sI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Vai (Shoulders) — Vertical Push + Shoulder Accessory ----------------
  { exerciseId: 'overhead_press', nameVi: 'Standing BB Overhead Press', muscleGroup: 'Vai', movementPattern: 'compound_shoulder',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=ZXpdJOLNoWw',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(75.0, 8) },
  { exerciseId: 'db_seated_shoulder_press', nameVi: 'DB Seated Shoulder Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=HzIiNhHhhtA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_shoulder_press', nameVi: 'DB Standing Shoulder Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Raemd3qWgJc',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'landmine_press_1arm_standing', nameVi: '1-Arm Standing Landmine Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=jCfcGei-NqM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'landmine_press_1arm_kneeling', nameVi: '1-Arm Half-Kneeling Landmine Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=_ArzG9qz-yM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'machine_shoulder_press', nameVi: 'Machine Shoulder Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=WvLMauqrnK8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'smith_seated_overhead_press', nameVi: 'Seated Smith Machine Overhead Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=OLqZDUUD2b0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'lateral_raise', nameVi: 'DB Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=OuG1smZTsQQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_lateral_raise', nameVi: 'Cable Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=SgyUoY0IZ7A',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'machine_lateral_raise', nameVi: 'Machine Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=0o07iGKUarI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_upright_row', nameVi: 'Cable Upright Row', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=qr3ziolhjvQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_upright_row', nameVi: 'DB Upright Row', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Ub6QruNKfbY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_face_pull', nameVi: 'Cable Face Pulls', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=-MODnZdnmAQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_bent_lateral_raise', nameVi: 'DB Bent Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=34gVHrkaiz0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'machine_reverse_fly', nameVi: 'Machine Reverse Fly', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=5YK4bgzXDp0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Đùi trước (Quads) — Squat + Quad Accessory ----------------
  { exerciseId: 'squat', nameVi: 'BB Back Squat', muscleGroup: 'Đùi trước', movementPattern: 'compound_knee',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=y5XJ5XspJxo',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3) },
  { exerciseId: 'bb_front_squat', nameVi: 'BB Front Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/k_DAHKxhIY0?t=1m52s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'safety_bar_squat', nameVi: 'Safety Bar Back Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/b2jmZyptN64?t=1m4s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'smith_machine_squat', nameVi: 'Smith Machine Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=-eO_VydErV0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'hack_squat', nameVi: 'Hack Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=rYgNArpwE7E',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'leg_press', nameVi: 'Leg Press', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yZmx_Ac3880',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'goblet_squat', nameVi: 'DB/KB Goblet Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://youtu.be/FAu6b-KcK0U?t=93',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'leg_extension', nameVi: 'Leg Extension', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=m0FOpMEgero',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_bulgarian_split_squat', nameVi: 'DB Bulgarian Split Squat', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=r3jzvjt-0l8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'bb_bulgarian_split_squat', nameVi: 'BB Bulgarian Split Squat', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=jNihW0WDIL4',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'static_db_lunge', nameVi: 'Static DB Lunge', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://youtu.be/iTo2oL8LIXc?t=18s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_step_ups', nameVi: 'DB Step Ups', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=9ZknEYboBOQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Đùi sau & Mông (Hamstrings & Glutes) — Hinge Primary + Hamstring Accessory ----------------
  { exerciseId: 'deadlift', nameVi: 'Conventional Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'compound_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=fc4_hq7tjkU',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3) },
  { exerciseId: 'sumo_deadlift', nameVi: 'Sumo Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/SF0WyLOodqo?t=3m26s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'rack_pulls', nameVi: 'Rack Pulls', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/aAjN8zS7Idg?t=119',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'bb_hip_thrust', nameVi: 'BB Hip Thrust', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/NT0sVO4QfPE?t=283',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'machine_hip_thrust', nameVi: 'Machine Hip Thrust', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=EF7jXP17DPE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'bb_rdl', nameVi: 'BB Romanian Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/0Sd1AZZ77aw?t=1m57s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'db_rdl', nameVi: 'DB Romanian Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://youtu.be/hQgFixeXdZo?t=28',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'lying_leg_curl', nameVi: 'Lying Leg Curl', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=n5WDXD_mpVY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'seated_leg_curl', nameVi: 'Seated Leg Curl', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Orxowest56U',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'weighted_back_extension', nameVi: 'Weighted Back Extension', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=rWeVENnLagg',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_pull_through', nameVi: 'Cable Pull-throughs', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=pv8e6OSyETE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'bb_good_morning', nameVi: 'BB Good Mornings', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=mnxn-7SO9Ks',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'glute_ham_raise', nameVi: 'Glute Ham Raise', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine', 'bodyweight'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=SBGYSfoqyfU',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_1arm_1leg_rdl', nameVi: 'DB 1-Arm 1-Leg RDL', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=7LZgUUQdT2c',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_2arm_1leg_rdl', nameVi: 'DB 2-Arm 1-Leg RDL', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=teKN7sY_vDQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Bắp chân (Calves) ----------------
  { exerciseId: 'standing_smith_calf_raise', nameVi: 'Standing Smith Machine Calf Raise', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=hh5516HCu4k',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'leg_press_calf_raise', nameVi: 'Leg Press Calf Raise', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=KxEYX_cuesM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'standing_1leg_calf_raise', nameVi: 'Standing 1-Leg BW + DB Calf Raise', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['dumbbell', 'bodyweight'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=1D7s-VyLq0Y',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'seated_calf_raise_machine', nameVi: 'Seated Calf Raise Machine', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://youtu.be/1MS72x5D8u8?t=32',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'seated_1leg_db_calf_raise', nameVi: 'Seated 1-Leg DB Weighted Calf Raise', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/NwA1N_EFTtk',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Tay trước (Biceps) ----------------
  { exerciseId: 'incline_db_curl', nameVi: 'Incline Bench DB Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=aTYlqC_JacQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_curl', nameVi: 'Alternating DB Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=iixND1P2lik',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'ezbar_cable_curl', nameVi: 'EZ-Bar Cable Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=opFVuRi_3b8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'ezbar_preacher_curl', nameVi: 'EZ-Bar Preacher Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=sxA__DoLsgo',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'db_hammer_curl', nameVi: 'DB Hammer Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=XOEL4MgekYE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Tay sau (Triceps) ----------------
  { exerciseId: 'triceps_pushdown', nameVi: 'Tricep Cable Press-downs', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=6Fzep104f0s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'dips', nameVi: 'Dip', muscleGroup: 'Tay sau', movementPattern: 'accessory_triceps',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=4LA1kF7yCGo',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'assisted_dip', nameVi: 'Assisted Dip', muscleGroup: 'Tay sau', movementPattern: 'accessory_triceps',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yZ83t4mrPrI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'lying_ezbar_skullcrusher', nameVi: 'Lying EZ-Bar Skullcrusher', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://youtu.be/-rh3MHnRI_I?t=660',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'lying_db_skullcrusher', nameVi: 'Lying DB Skullcrusher', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=jPjhQ2hsAds',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'inverted_skullcrusher', nameVi: 'Inverted Skullcrusher', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=1lrjpLuXH4w',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'cable_overhead_extension', nameVi: 'Triceps Cable Overhead Extension', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://youtu.be/OpRMRhr0Ycc?t=193',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'db_standing_overhead_extension', nameVi: '2-Arm DB Standing Overhead Extension', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://youtu.be/-Vyt2QdsR7E?t=15s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Bụng (Core) — no source column in the sheet; kept from the earlier hand-picked set ----------------
  { exerciseId: 'hanging_leg_raise', nameVi: 'Hanging Leg Raise', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: '',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'cable_crunch', nameVi: 'Cable Crunch', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: '',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
]);

export function getExerciseById(exerciseId) {
  return EXERCISES.find((e) => e.exerciseId === exerciseId) || null;
}

/** Exercise IDs grouped by muscleGroup, in the order groups first appear — for building a grouped <select>. */
export function groupExercisesByMuscleGroup() {
  const groups = new Map();
  EXERCISES.forEach((ex) => {
    if (!groups.has(ex.muscleGroup)) groups.set(ex.muscleGroup, []);
    groups.get(ex.muscleGroup).push(ex);
  });
  return groups;
}
