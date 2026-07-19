// ============================================================
// DAVID TRAINING PROGRAM — Exercise seed data (Phase 1)
// ============================================================
// Static array, not a Firestore collection (see plan Section on
// Firestore data model). Promoting this to a coach-editable Firestore
// collection with full movement-pattern substitution is Phase 2.
//
// Movement-pattern tags and the two scheme defaults below are
// transcribed from "SBS Novice hypertrophy program__Quick Setup.txt"
// (movement categories + starting/ending sets/reps/weight-increase) and
// "SBS Linear Progression__Setup.txt" / "__Quick Setup.txt" (intensity%,
// reps-per-set, RIR target, rounding) — not invented.
//
// scheme: 2 = Last-set RIR (see progression-engine.js), 8 = Set
// increase then rep increase.

import { SCHEME } from '../../assets/js/progression-engine.js';

export const EXERCISES = Object.freeze([
  {
    exerciseId: 'squat',
    nameVi: 'Squat',
    nameEn: 'Barbell Back Squat',
    movementPattern: 'compound_knee',
    equipmentTags: ['barbell'],
    isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR,
    defaultParams: { intensityPct: 87.5, repsPerSet: 3, plannedSets: 3, targetRIR: 0, roundingIncrement: 2.5 },
  },
  {
    exerciseId: 'bench_press',
    nameVi: 'Đẩy ngực (Bench Press)',
    nameEn: 'Barbell Bench Press',
    movementPattern: 'compound_pec',
    equipmentTags: ['barbell'],
    isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR,
    defaultParams: { intensityPct: 87.5, repsPerSet: 3, plannedSets: 3, targetRIR: 0, roundingIncrement: 2.5 },
  },
  {
    exerciseId: 'deadlift',
    nameVi: 'Deadlift',
    nameEn: 'Barbell Deadlift',
    movementPattern: 'compound_hip',
    equipmentTags: ['barbell'],
    isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR,
    defaultParams: { intensityPct: 87.5, repsPerSet: 3, plannedSets: 3, targetRIR: 0, roundingIncrement: 2.5 },
  },
  {
    exerciseId: 'barbell_row',
    nameVi: 'Chèo tạ đòn (Barbell Row)',
    nameEn: 'Barbell Row',
    movementPattern: 'compound_back_horizontal',
    equipmentTags: ['barbell'],
    isBodyweight: false,
    defaultScheme: SCHEME.LAST_SET_RIR,
    defaultParams: { intensityPct: 75.0, repsPerSet: 8, plannedSets: 3, targetRIR: 0, roundingIncrement: 2.5 },
  },
  {
    exerciseId: 'leg_press',
    nameVi: 'Đạp đùi (Leg Press)',
    nameEn: 'Leg Press',
    movementPattern: 'compound_knee',
    equipmentTags: ['machine'],
    isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE,
    defaultParams: {
      startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
      setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10, roundingIncrement: 5,
    },
  },
  {
    exerciseId: 'lat_pulldown',
    nameVi: 'Kéo xà cáp (Lat Pulldown)',
    nameEn: 'Lat Pulldown',
    movementPattern: 'compound_back_vertical',
    equipmentTags: ['cable'],
    isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE,
    defaultParams: {
      startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
      setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10, roundingIncrement: 5,
    },
  },
  {
    exerciseId: 'db_shoulder_press',
    nameVi: 'Đẩy vai tạ đơn (DB Shoulder Press)',
    nameEn: 'Seated Dumbbell Shoulder Press',
    movementPattern: 'compound_shoulder',
    equipmentTags: ['dumbbell'],
    isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE,
    defaultParams: {
      startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
      setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10, roundingIncrement: 5,
    },
  },
  {
    exerciseId: 'lateral_raise',
    nameVi: 'Nâng tạ vai ngang (Lateral Raise)',
    nameEn: 'Dumbbell Lateral Raise',
    movementPattern: 'vanity_shoulder',
    equipmentTags: ['dumbbell'],
    isBodyweight: false,
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE,
    defaultParams: {
      startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
      setIncreaseStep: 1, repIncreaseStep: 2, weightIncreasePct: 10, roundingIncrement: 5,
    },
  },
]);

export function getExerciseById(exerciseId) {
  return EXERCISES.find((e) => e.exerciseId === exerciseId) || null;
}
