// ============================================================
// DAVID TRAINING PROGRAM — Exercise seed data (Phase 1)
// ============================================================
// Static array, not a Firestore collection (see plan Section on
// Firestore data model). Promoting this to a coach-editable Firestore
// collection with full movement-pattern substitution is Phase 2.
//
// `muscleGroup` (Vietnamese, shown to the coach) groups the picker via
// <optgroup>. `movementPattern` is the finer-grained internal tag
// (compound/accessory/isolation by movement direction) kept for future
// exercise-substitution logic — the taxonomy and the two scheme
// defaults are transcribed from "SBS Novice hypertrophy program__Quick
// Setup.txt" (movement categories + starting/ending sets/reps/weight
// increase) and "SBS Linear Progression__Setup.txt" / "__Quick
// Setup.txt" (intensity%, reps-per-set, RIR target, rounding).
//
// scheme: 2 = Last-set RIR (see progression-engine.js), 8 = Set
// increase then rep increase. Only the 5 classic barbell "big lifts"
// use scheme 2 (Training-Max-tracked); every accessory/isolation
// exercise uses scheme 8 (double progression) — keeps the coach from
// having to manage a Training Max for exercises that don't need one.

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
  // ---------------- Ngực (Chest) ----------------
  { exerciseId: 'bench_press', nameVi: 'Đẩy ngực (Bench Press)', nameEn: 'Barbell Bench Press',
    muscleGroup: 'Ngực', movementPattern: 'compound_pec', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3) },
  { exerciseId: 'incline_db_press', nameVi: 'Đẩy ngực nghiêng tạ đơn', nameEn: 'Incline Dumbbell Press',
    muscleGroup: 'Ngực', movementPattern: 'accessory_pec', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'chest_press_machine', nameVi: 'Đẩy ngực máy', nameEn: 'Machine Chest Press',
    muscleGroup: 'Ngực', movementPattern: 'accessory_pec', equipmentTags: ['machine'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_fly', nameVi: 'Ép ngực cáp (Cable Fly)', nameEn: 'Cable Fly',
    muscleGroup: 'Ngực', movementPattern: 'isolation_pec', equipmentTags: ['cable'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'push_up', nameVi: 'Chống đẩy (Push-up)', nameEn: 'Push-up',
    muscleGroup: 'Ngực', movementPattern: 'accessory_pec', equipmentTags: ['bodyweight'], isBodyweight: true,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },

  // ---------------- Lưng (Back) ----------------
  { exerciseId: 'deadlift', nameVi: 'Deadlift', nameEn: 'Barbell Deadlift',
    muscleGroup: 'Lưng', movementPattern: 'compound_hip', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3) },
  { exerciseId: 'barbell_row', nameVi: 'Chèo tạ đòn (Barbell Row)', nameEn: 'Barbell Row',
    muscleGroup: 'Lưng', movementPattern: 'compound_back_horizontal', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(75.0, 8) },
  { exerciseId: 'lat_pulldown', nameVi: 'Kéo xà cáp (Lat Pulldown)', nameEn: 'Lat Pulldown',
    muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical', equipmentTags: ['cable'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'seated_cable_row', nameVi: 'Kéo cáp ngồi (Seated Cable Row)', nameEn: 'Seated Cable Row',
    muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal', equipmentTags: ['cable'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'pull_up', nameVi: 'Kéo xà (Pull-up)', nameEn: 'Pull-up',
    muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical', equipmentTags: ['bodyweight'], isBodyweight: true,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'db_row', nameVi: 'Chèo tạ đơn 1 tay', nameEn: 'One-Arm Dumbbell Row',
    muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Vai (Shoulders) ----------------
  { exerciseId: 'overhead_press', nameVi: 'Đẩy vai đòn tạ (Overhead Press)', nameEn: 'Barbell Overhead Press',
    muscleGroup: 'Vai', movementPattern: 'compound_shoulder', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(75.0, 8) },
  { exerciseId: 'db_shoulder_press', nameVi: 'Đẩy vai tạ đơn (DB Shoulder Press)', nameEn: 'Seated Dumbbell Shoulder Press',
    muscleGroup: 'Vai', movementPattern: 'accessory_shoulder', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'lateral_raise', nameVi: 'Nâng tạ vai ngang (Lateral Raise)', nameEn: 'Dumbbell Lateral Raise',
    muscleGroup: 'Vai', movementPattern: 'isolation_shoulder', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'rear_delt_fly', nameVi: 'Bay vai sau (Rear Delt Fly)', nameEn: 'Rear Delt Fly',
    muscleGroup: 'Vai', movementPattern: 'isolation_shoulder', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'face_pull', nameVi: 'Kéo mặt (Face Pull)', nameEn: 'Cable Face Pull',
    muscleGroup: 'Vai', movementPattern: 'isolation_shoulder', equipmentTags: ['cable'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Tay trước (Biceps) ----------------
  { exerciseId: 'barbell_curl', nameVi: 'Cuốn tay đòn tạ (Barbell Curl)', nameEn: 'Barbell Curl',
    muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'db_curl', nameVi: 'Cuốn tay tạ đơn (Dumbbell Curl)', nameEn: 'Dumbbell Curl',
    muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'cable_curl', nameVi: 'Cuốn tay cáp (Cable Curl)', nameEn: 'Cable Curl',
    muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps', equipmentTags: ['cable'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Tay sau (Triceps) ----------------
  { exerciseId: 'triceps_pushdown', nameVi: 'Đẩy cáp tay sau (Triceps Pushdown)', nameEn: 'Cable Triceps Pushdown',
    muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps', equipmentTags: ['cable'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'skullcrusher', nameVi: 'Ép tạ tay sau (Skullcrusher)', nameEn: 'Lying Triceps Extension',
    muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'overhead_triceps_extension', nameVi: 'Đẩy tạ qua đầu tay sau', nameEn: 'Overhead Triceps Extension',
    muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'dips', nameVi: 'Xà kép (Dips)', nameEn: 'Triceps Dips',
    muscleGroup: 'Tay sau', movementPattern: 'accessory_triceps', equipmentTags: ['bodyweight'], isBodyweight: true,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },

  // ---------------- Đùi trước (Quads) ----------------
  { exerciseId: 'squat', nameVi: 'Squat', nameEn: 'Barbell Back Squat',
    muscleGroup: 'Đùi trước', movementPattern: 'compound_knee', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3) },
  { exerciseId: 'leg_press', nameVi: 'Đạp đùi (Leg Press)', nameEn: 'Leg Press',
    muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee', equipmentTags: ['machine'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'leg_extension', nameVi: 'Duỗi chân máy (Leg Extension)', nameEn: 'Leg Extension',
    muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee', equipmentTags: ['machine'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'bulgarian_split_squat', nameVi: 'Lunge Bulgari (Bulgarian Split Squat)', nameEn: 'Bulgarian Split Squat',
    muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee', equipmentTags: ['dumbbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Đùi sau & Mông (Hamstrings & Glutes) ----------------
  { exerciseId: 'romanian_deadlift', nameVi: 'Romanian Deadlift (RDL)', nameEn: 'Romanian Deadlift',
    muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'leg_curl', nameVi: 'Gập chân máy (Leg Curl)', nameEn: 'Leg Curl',
    muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip', equipmentTags: ['machine'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'hip_thrust', nameVi: 'Đẩy hông (Hip Thrust)', nameEn: 'Barbell Hip Thrust',
    muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip', equipmentTags: ['barbell'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },

  // ---------------- Bắp chân (Calves) ----------------
  { exerciseId: 'standing_calf_raise', nameVi: 'Nhón chân đứng (Standing Calf Raise)', nameEn: 'Standing Calf Raise',
    muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves', equipmentTags: ['machine'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },
  { exerciseId: 'seated_calf_raise', nameVi: 'Nhón chân ngồi (Seated Calf Raise)', nameEn: 'Seated Calf Raise',
    muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves', equipmentTags: ['machine'], isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8() },

  // ---------------- Bụng (Core) ----------------
  { exerciseId: 'hanging_leg_raise', nameVi: 'Nâng chân treo xà (Hanging Leg Raise)', nameEn: 'Hanging Leg Raise',
    muscleGroup: 'Bụng', movementPattern: 'isolation_core', equipmentTags: ['bodyweight'], isBodyweight: true,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5) },
  { exerciseId: 'cable_crunch', nameVi: 'Gập bụng cáp (Cable Crunch)', nameEn: 'Cable Crunch',
    muscleGroup: 'Bụng', movementPattern: 'isolation_core', equipmentTags: ['cable'], isBodyweight: false,
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
