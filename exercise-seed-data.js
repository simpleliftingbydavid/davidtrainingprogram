// ============================================================
// DAVID TRAINING PROGRAM — Exercise seed data
// ============================================================
// Static array, not a Firestore collection (see plan Section on
// Firestore data model). Promoting this to a coach-editable Firestore
// collection with full movement-pattern substitution is Phase 2.
//
// Source: "The Ripped Body Training Programs.xlsx" → sheet "Exercise
// Video Database", gym section only (rows 4-12, cols F-R), later
// trimmed/curated by the coach. `videoUrl` values are a mix of the
// sheet's original hyperlinks and short Renaissance Periodization demo
// clips swapped in later for exercises whose original video was a
// long-form tutorial rather than a quick technique reference.
//
// `technique` is a short, plain-language cue list (not a translation of
// any source text) — written in a "coach standing next to you" voice,
// everyday imagery instead of anatomical jargon. Not every exercise has
// one yet; `getExerciseById`/`technique` consumers must handle absence.
//
// `muscleGroup` (Vietnamese, shown to the coach) groups the picker via
// <optgroup>. `movementPattern` is the finer-grained internal tag kept
// for future exercise-substitution logic, mapped from the sheet's own
// column headers (Horizontal Push, Vertical Pull, Hinge Primary, etc).
//
// scheme: 2 = Last-set RIR (Training-Max tracked, see
// progression-engine.js), 8 = Set increase then rep increase. Only
// squat, bench_press, barbell_row, deadlift, and overhead_press use
// scheme 2 — everything else uses scheme 8, so the coach isn't managing
// a Training Max for exercises that don't need one.
//
// IDs for exercises that predate the various library revisions are kept
// stable on purpose — any already-assigned student programs keep
// working without needing reassignment.

import { PROGRESSION_MODE, SCHEME } from './progression-engine.js';

// Flat default rest time (seconds) for a newly-assigned exercise — deliberately not
// varied by exercise type; the coach sets the real value per assignment in the form.
const DEFAULT_REST_SECONDS = 90;

function scheme2(intensityPct, repsPerSet, plannedSets = 3, roundingIncrement = 2.5) {
  return { intensityPct, repsPerSet, plannedSets, targetRIR: 0, roundingIncrement, restSeconds: DEFAULT_REST_SECONDS };
}
function scheme8(roundingIncrement = 5, options = {}) {
  const repsSetsOnly = options.progressionMode === PROGRESSION_MODE.REPS_SETS_ONLY;
  return {
    startingSets: 3, endingSets: 5, startingReps: 8, endingReps: 12,
    setIncreaseStep: 1, repIncreaseStep: 2,
    weightIncreasePct: repsSetsOnly ? 0 : 10,
    roundingIncrement: repsSetsOnly ? 0 : roundingIncrement,
    restSeconds: DEFAULT_REST_SECONDS,
    ...(repsSetsOnly ? { progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY } : {}),
  };
}

export const EXERCISES = Object.freeze([
  // ---------------- Ngực (Chest) — Horizontal Push + Chest Accessory ----------------
  { exerciseId: 'bench_press', nameVi: 'BB Bench Press', muscleGroup: 'Ngực', movementPattern: 'compound_pec',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/IqvIZ89KYc4',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3),
    technique: [
      'Hạ tạ xuống ngực, khuỷu tay chếch khoảng 45 độ — đừng xòe ngang như chữ T.',
      'Đạp chân xuống sàn, đẩy tạ thẳng lên như đẩy trần nhà ra xa.',
      'Giữ vai ép chặt xuống ghế suốt hiệp, đừng để tạ nảy trên ngực.',
    ] },
  { exerciseId: 'weighted_dips', nameVi: 'Weighted Dips', muscleGroup: 'Ngực', movementPattern: 'compound_pec',
    equipmentTags: ['bodyweight', 'weighted'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=MhPl9Vf4toc',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Cố định tạ chắc chắn, hơi nghiêng thân về trước và giữ vai kéo xuống.',
      'Hạ người có kiểm soát đến khi khuỷu tay gập khoảng 90 độ hoặc ngực được kéo giãn vừa đủ.',
      'Đẩy người lên bằng ngực và tay sau, không đung đưa chân để lấy đà.',
    ] },
  { exerciseId: 'flat_bench_press', nameVi: 'Flat Bench Press', muscleGroup: 'Ngực', movementPattern: 'compound_pec',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/IqvIZ89KYc4',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Hạ tạ xuống ngực, khuỷu tay chếch khoảng 45 độ — đừng xòe ngang như chữ T.',
      'Đạp chân xuống sàn, đẩy tạ thẳng lên như đẩy trần nhà ra xa.',
      'Giữ vai ép chặt xuống ghế suốt hiệp, đừng để tạ nảy trên ngực.',
    ] },
  { exerciseId: 'machine_chest_press', nameVi: 'Machine Chest Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=0Wa9CfRXUkA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, tay nắm ngang ngực, lưng tựa chắc vào đệm.',
      'Đẩy tay ra trước từ từ, không khóa cứng khuỷu tay ở cuối.',
      'Kéo về chậm, cảm nhận ngực căng ra chứ không phải vai gánh lực.',
    ] },
  { exerciseId: 'smith_bench_press', nameVi: 'Smith Machine Bench Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=O5viuEPDXKY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Nằm dưới thanh, vai ép xuống ghế như Bench Press thường.',
      'Hạ thanh chạm ngực rồi đẩy thẳng lên theo đường ray cố định.',
      'Thanh chạy cố định nên dồn toàn lực vào đẩy, không cần lo giữ thăng bằng.',
    ] },
  { exerciseId: 'db_incline_bench_press', nameVi: 'DB Incline Bench Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=B09ZkYsnKko',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ghế nghiêng khoảng 30 độ, đẩy hai tạ lên chéo về phía ngực trên.',
      'Hạ tạ chậm xuống ngang ngực trên, khuỷu tay hơi mở.',
      'Đừng để ghế dốc quá cao — dễ biến thành bài vai thay vì ngực.',
    ] },
  { exerciseId: 'smith_incline_press', nameVi: 'Smith Machine Incline Press', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=8urE8Z8AMQ4',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Giống Incline Bench Press nhưng đẩy theo đường ray cố định của thanh Smith.',
      'Đẩy thanh lên theo đường thẳng phía trên ngực trên, hạ xuống có kiểm soát.',
      'Tập trung ép ngực trên ở đỉnh chuyển động.',
    ] },
  { exerciseId: 'push_up', nameVi: 'Push-up', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=mm6_WcoCVTA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Tay đặt rộng hơn vai, thân người thẳng từ đầu đến gót như một tấm ván.',
      'Hạ người xuống đến khi ngực gần chạm sàn, đẩy lên hết cỡ.',
      'Đừng để hông võng xuống hoặc nhô lên cao.',
    ] },
  { exerciseId: 'weighted_push_up', nameVi: 'Weighted Push-Ups', muscleGroup: 'Ngực', movementPattern: 'accessory_pec',
    equipmentTags: ['bodyweight', 'weighted'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=mm6_WcoCVTA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Cố định áo tạ hoặc bánh tạ chắc chắn trên lưng, giữ thân thẳng từ đầu đến gót.',
      'Hạ ngực xuống gần sàn với khuỷu tay chếch vừa phải, không để hông võng.',
      'Đẩy lên hết tầm có kiểm soát; giảm tải nếu không giữ được thân người ổn định.',
    ] },
  { exerciseId: 'cable_flys', nameVi: 'Cable Flys', muscleGroup: 'Ngực', movementPattern: 'isolation_pec',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=4mfLHnFL0Uw',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng giữa hai cột cáp, tay hơi khuỵu, kéo hai tay vòng vào nhau trước ngực như đang ôm một thân cây lớn.',
      'Siết ngực ở điểm giữa rồi mở tay ra từ từ.',
      'Đừng gập khuỷu tay nhiều làm động tác biến thành đẩy.',
    ] },
  { exerciseId: 'machine_flys', nameVi: 'Machine Flys', muscleGroup: 'Ngực', movementPattern: 'isolation_pec',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=FDay9wFe5uE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, tay đặt lên đệm ngang vai.',
      'Khép hai tay vào nhau phía trước ngực như đang ôm một quả bóng lớn.',
      'Đừng ngả người ra sau để mượn đà kéo tay về.',
    ] },

  // ---------------- Lưng (Back) — Horizontal Pull + Vertical Pull ----------------
  { exerciseId: 'seated_cable_row', nameVi: 'Seated Cable Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=UCXxvVItLoM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, kéo tay cầm về phía bụng, ép hai bả vai lại gần nhau ở cuối.',
      'Giữ thân người ổn định, đừng ngả ra sau lấy đà.',
      'Duỗi tay ra từ từ, cảm nhận lưng giãn ra ở đầu hiệp.',
    ] },
  { exerciseId: 'machine_rows', nameVi: 'Machine Rows', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/QCrHBySLtNE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Tựa ngực chắc vào đệm, giữ thân người ổn định suốt hiệp.',
      'Kéo tay cầm về sát thân, đưa khuỷu tay ra sau và ép lưng ở cuối chuyển động.',
      'Thả tay ra chậm đến khi lưng được kéo giãn, không để khối tạ rơi tự do.',
    ] },
  { exerciseId: 'db_rows', nameVi: 'DB Rows', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=k2kVniB5eQI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Một tay chống lên ghế, lưng song song sàn.',
      'Kéo tạ lên sát hông như đang giật dây khởi động máy cắt cỏ.',
      'Đừng xoay thân người để mượn đà — chỉ tay và lưng làm việc.',
    ] },
  { exerciseId: 'barbell_row', nameVi: 'Barbell Rows', muscleGroup: 'Lưng', movementPattern: 'compound_back_horizontal',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=p9RihhjmJsw',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(75.0, 8),
    technique: [
      'Gập người 45 độ, lưng thẳng như tấm ván, gối hơi chùng.',
      'Kéo tạ về bụng dưới như giật dây khởi động máy cắt cỏ, ép hai bả vai lại ở cuối.',
      'Đừng đứng thẳng dậy rồi lắc đà để kéo.',
    ] },
  { exerciseId: 'landmine_row_1arm', nameVi: '1-Arm Landmine Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Z1nti67Nb7I',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng cạnh đầu thanh tạ, gập người, một tay kéo đầu tạ lên sát hông.',
      'Ép bả vai lại ở đỉnh, hạ xuống có kiểm soát.',
      'Giữ lưng thẳng suốt hiệp, không xoay người theo lực kéo.',
    ] },
  { exerciseId: 'seal_rows', nameVi: 'Seal Rows', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=UzOhDqu-5Tw',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Nằm sấp trên ghế cao, hai tay thả thẳng xuống nắm tạ.',
      'Kéo tạ lên chạm ghế, ép lưng ở đỉnh.',
      'Ngực tựa ghế nên không thể mượn đà — toàn lực dồn vào lưng.',
    ] },
  { exerciseId: 'smith_machine_row', nameVi: 'Smith Machine Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=3QcJggd_L24',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng gập người dưới thanh Smith, kéo thanh lên sát bụng.',
      'Ép bả vai ở cuối chuyển động, hạ xuống chậm.',
      'Giữ lưng thẳng, gối hơi chùng suốt hiệp.',
    ] },
  { exerciseId: 't_bar_row', nameVi: 'T-Bar Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['barbell', 'machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yPis7nlbqdY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng dạng chân trên thanh, gập người nắm tay cầm hai bên.',
      'Kéo tạ lên sát ngực dưới, ép lưng ở đỉnh.',
      'Đừng đứng dậy giữa chừng để mượn đà.',
    ] },
  { exerciseId: 'inverted_row', nameVi: 'Inverted Row', muscleGroup: 'Lưng', movementPattern: 'accessory_back_horizontal',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=KOaCM1HMwU0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Nằm dưới thanh xà thấp, thân người thẳng như tấm ván.',
      'Kéo ngực lên chạm thanh, ép bả vai lại.',
      'Hạ xuống chậm, giữ thân không võng.',
    ] },
  { exerciseId: 'pull_up', nameVi: 'Pull-ups', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=iWpoegdfgtc',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Treo người trên xà, tay nắm rộng hơn vai, lòng bàn tay úp ra trước.',
      'Kéo người lên đến khi cằm qua xà, hạ xuống có kiểm soát.',
      'Đừng đá chân lấy đà.',
    ] },
  { exerciseId: 'chin_up', nameVi: 'Chin-ups', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=9JC1EwqezGY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Giống Pull-up nhưng lòng bàn tay hướng vào người, tay hẹp hơn vai một chút.',
      'Kéo người lên đến khi cằm qua xà, hạ xuống có kiểm soát.',
      'Cách cầm này dùng thêm tay trước nên thường kéo được nhiều rep hơn Pull-up.',
    ] },
  { exerciseId: 'weighted_pull_up', nameVi: 'Weighted Pull-Ups', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['bodyweight', 'weighted'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/XtwelwPhcaw',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Cố định tạ chắc chắn, treo người với tay nắm sấp rộng hơn vai một chút.',
      'Kéo khuỷu tay xuống cho đến khi cằm vượt qua xà, giữ ngực hướng lên.',
      'Hạ người chậm về tay gần thẳng, không đá chân hoặc đung đưa để lấy đà.',
    ] },
  { exerciseId: 'weighted_chin_up', nameVi: 'Weighted Chin-Ups', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['bodyweight', 'weighted'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/Oi3bW9nQmGI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Cố định tạ chắc chắn, nắm xà với lòng bàn tay hướng vào người và tay gần ngang vai.',
      'Kéo ngực về phía xà đến khi cằm vượt qua xà, giữ khuỷu tay hướng xuống.',
      'Hạ người có kiểm soát và tránh đung đưa thân để hoàn thành rep.',
    ] },
  { exerciseId: 'lat_pulldown', nameVi: 'Lat Pull-down', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/kNIWD0-xJpk',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, đùi được giữ chắc phía trên.',
      'Kéo thanh xuống dưới cằm bằng cách ép khuỷu tay xuống và ra sau — như kéo cành cây xuống thấp.',
      'Ưỡn ngực nhẹ, đừng ngả cả người ra sau để mượn đà.',
    ] },
  { exerciseId: 'machine_lat_pulldowns', nameVi: 'Machine Lat Pull-downs', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/3q1Zsi3vkjo',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Chỉnh ghế và đệm đùi chắc chắn, giữ ngực hướng lên nhưng không ngả người quá sâu.',
      'Kéo tay cầm xuống bằng cách đưa khuỷu tay về phía hông và siết lưng ở cuối.',
      'Đưa tay lên chậm đến khi lưng được kéo giãn, không để máy kéo bật người lên.',
    ] },
  { exerciseId: 'lat_pulldown_1arm', nameVi: 'One-Arm Lat Pull-down', muscleGroup: 'Lưng', movementPattern: 'accessory_back_vertical',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=HBC5s98wXko',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Một tay kéo tay cầm xuống ngang vai, ép khuỷu tay ra sau.',
      'Giữ thân người ổn định, không xoay theo tay kéo.',
      'Cảm nhận lưng một bên làm việc rõ hơn so với kéo hai tay cùng lúc.',
    ] },
  { exerciseId: 'straight_arm_pulldown', nameVi: 'Straight-Arm Pull-down', muscleGroup: 'Lưng', movementPattern: 'isolation_back_vertical',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=G9uNaXGTJ4w',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng thẳng, tay gần như thẳng, kéo thanh từ trên cao xuống đến đùi như đang đóng một cánh cửa lớn.',
      'Chỉ khớp vai chuyển động, khuỷu tay giữ nguyên độ cong nhẹ.',
      'Đừng gập khuỷu tay làm động tác biến thành kéo tay.',
    ] },
  { exerciseId: 'db_pullover', nameVi: 'DB Pullover', muscleGroup: 'Lưng', movementPattern: 'isolation_back_vertical',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=jQjWlIwG4sI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Nằm ngang trên ghế (vai tựa ghế, hông thấp), hai tay giữ một tạ đưa qua đầu ra sau.',
      'Kéo tạ vòng lên trên ngực như đang kéo một vật nặng qua đầu.',
      'Giữ khuỷu tay cong nhẹ cố định suốt hiệp.',
    ] },

  // ---------------- Vai (Shoulders) — Vertical Push + Shoulder Accessory ----------------
  { exerciseId: 'overhead_press', nameVi: 'Military Press', muscleGroup: 'Vai', movementPattern: 'compound_shoulder',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/1M6JMpgAtS0',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(75.0, 8),
    technique: [
      'Đứng thẳng, siết bụng chắc, thanh tạ đặt ngang vai và tay nắm rộng hơn vai một chút.',
      'Đẩy tạ thẳng qua đầu; hơi đưa đầu ra sau để thanh đi sát mặt rồi đưa đầu trở lại khi tạ đã qua trán.',
      'Giữ mông và bụng siết chặt, không ưỡn lưng để mượn đà đẩy tạ.',
    ] },
  { exerciseId: 'db_seated_shoulder_press', nameVi: 'DB Seated Shoulder Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=HzIiNhHhhtA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi tựa lưng, đẩy hai tạ thẳng lên qua đầu.',
      'Hạ tạ xuống ngang tai, kiểm soát tốc độ.',
      'Đừng ưỡn lưng quá mức để mượn đà đẩy.',
    ] },
  { exerciseId: 'landmine_press_1arm_kneeling', nameVi: '1-Arm Half-Kneeling Landmine Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=fx6lSVNvu-4',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Quỳ một gối, một tay đẩy đầu thanh tạ lên chéo qua vai đối diện.',
      'Xiết bụng, đừng để thân xoay theo lực đẩy.',
      'Hạ xuống có kiểm soát về đúng vị trí vai.',
    ] },
  { exerciseId: 'machine_shoulder_press', nameVi: 'Machine Shoulder Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=WvLMauqrnK8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, đẩy tay cầm lên trên.',
      'Hạ xuống ngang vai, kiểm soát tốc độ, không khóa cứng khuỷu tay ở đỉnh.',
      'Ghế có tựa lưng nên tập trung hoàn toàn vào lực đẩy vai.',
    ] },
  { exerciseId: 'smith_seated_overhead_press', nameVi: 'Seated Smith Machine Overhead Press', muscleGroup: 'Vai', movementPattern: 'accessory_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=OLqZDUUD2b0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi dưới thanh Smith, đẩy thẳng lên qua đầu theo đường ray cố định.',
      'Hạ xuống ngang tai.',
      'Thanh chạy cố định nên không cần lo giữ thăng bằng, chỉ tập trung đẩy.',
    ] },
  { exerciseId: 'cable_lateral_raise', nameVi: 'Cable Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Z5FA9aq3L6A',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng nghiêng người, tay gần cột cáp, nâng tay ra ngang như đang rót nước ra khỏi bình.',
      'Nâng đến ngang vai rồi hạ chậm.',
      'Cáp giữ lực căng suốt hiệp, kể cả ở điểm thấp nhất.',
    ] },
  { exerciseId: 'behind_body_cable_lateral_raise', nameVi: 'Behind-the-body Cable Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=tHgVTrZUoHQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng chếch trước cột cáp, để dây đi từ phía sau thân người và tay bắt đầu hơi sau hông.',
      'Giữ khuỷu tay cong nhẹ rồi nâng tay ra ngoài đến khoảng ngang vai.',
      'Hạ tay chậm về sau hông, giữ thân người yên và không nhún vai để kéo tạ.',
    ] },
  { exerciseId: 'machine_lateral_raise', nameVi: 'Machine Lateral Raise', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=0o07iGKUarI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng, tay đặt lên đệm hai bên.',
      'Nâng tay ra ngang đến khi ngang vai, hạ chậm có kiểm soát.',
      'Đừng nhún vai để đẩy tạ lên.',
    ] },
  { exerciseId: 'cable_face_pull', nameVi: 'Cable Face Pulls', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=-MODnZdnmAQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đặt dây cáp ngang mặt, kéo về phía mặt sao cho khuỷu tay cao hơn vai.',
      'Ép hai bả vai lại và xoay cổ tay ra ngoài ở cuối.',
      'Bài này chuyên trị vai tròn — kéo chậm, cảm nhận vai sau làm việc.',
    ] },
  { exerciseId: 'machine_reverse_fly', nameVi: 'Machine Reverse Fly', muscleGroup: 'Vai', movementPattern: 'isolation_shoulder',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=5YK4bgzXDp0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi quay mặt vào đệm, mở hai tay ra sau như đang dang tay ôm một vòng tròn lớn.',
      'Ép bả vai lại ở cuối chuyển động.',
      'Giữ khuỷu tay cong nhẹ cố định, đừng gập duỗi liên tục.',
    ] },

  // ---------------- Đùi trước (Quads) — Squat + Quad Accessory ----------------
  { exerciseId: 'squat', nameVi: 'BB Back Squat', muscleGroup: 'Đùi trước', movementPattern: 'compound_knee',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=i7J5h7BJ07g',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3),
    technique: [
      'Tạ tựa lên vai trên (không phải cổ), đứng rộng bằng vai.',
      'Ngồi xuống như ngồi vào ghế thấp phía sau, đầu gối đẩy ra ngoài theo mũi chân.',
      'Đứng lên bằng lực gót chân — đừng để đầu gối đổ vào trong hay lưng cong tròn.',
    ] },
  { exerciseId: 'bb_front_squat', nameVi: 'BB Front Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=HHxNbhP16UE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Tạ tựa lên vai trước, khuỷu tay nâng cao song song sàn.',
      'Ngồi xuống thẳng người hơn Back Squat vì tạ ở phía trước.',
      'Nếu khuỷu tay tụt xuống thấp là dấu hiệu tạ sắp rơi khỏi vai — chỉnh lại tư thế.',
    ] },
  { exerciseId: 'smith_machine_squat', nameVi: 'Smith Machine Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=-eO_VydErV0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng dưới thanh Smith, chân bước ra trước một chút vì thanh chạy theo đường thẳng đứng.',
      'Ngồi xuống như ngồi ghế, đứng lên bằng gót chân.',
      'Thanh cố định nên tập trung vào độ sâu và tốc độ thay vì giữ thăng bằng.',
    ] },
  { exerciseId: 'hack_squat', nameVi: 'Hack Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=rYgNArpwE7E',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Lưng tựa chắc vào đệm, chân đặt rộng bằng vai trên bệ.',
      'Hạ xuống đến khi đùi gần song song sàn, đẩy lên bằng gót chân.',
      'Đừng khóa cứng đầu gối ở điểm cao nhất.',
    ] },
  { exerciseId: 'leg_press', nameVi: 'Leg Press', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yZmx_Ac3880',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Chân đặt rộng bằng vai trên bệ đạp, lưng và hông áp sát ghế.',
      'Hạ bệ xuống đến khi đầu gối gần chạm ngực, đẩy lên bằng gót chân.',
      'Đừng khóa cứng đầu gối ở đỉnh hay để hông nhấc khỏi ghế.',
    ] },
  { exerciseId: 'goblet_squat', nameVi: 'Dumbbell Goblet Squat', muscleGroup: 'Đùi trước', movementPattern: 'accessory_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=xRTMjjZ76GI',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ôm một tạ trước ngực, khuỷu tay hướng xuống.',
      'Ngồi xuống giữa hai đùi, giữ lưng thẳng và ngực mở.',
      'Tạ ở phía trước giúp bạn tự nhiên ngồi sâu và thẳng lưng hơn.',
    ] },
  { exerciseId: 'leg_extension', nameVi: 'Leg Extension', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=m0FOpMEgero',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, đệm chân đặt ngay trên mắt cá.',
      'Duỗi thẳng chân lên, siết đùi trước ở đỉnh rồi hạ chậm xuống.',
      'Đừng dùng đà đá chân lên nhanh.',
    ] },
  { exerciseId: 'hip_adduction', nameVi: 'Hip Adduction', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=36EB4I915sU',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi chắc trên máy, đặt mặt trong hai chân vào đệm và giữ thân người ổn định.',
      'Khép hai chân vào nhau có kiểm soát, siết đùi trong ở điểm gần nhất.',
      'Mở chân trở lại chậm, không để khối tạ kéo chân bật ra ngoài.',
    ] },
  { exerciseId: 'db_bulgarian_split_squat', nameVi: 'DB Bulgarian Split Squat', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=r3jzvjt-0l8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Chân sau gác lên ghế, chân trước bước đủ xa để đầu gối không vượt quá mũi chân khi hạ xuống.',
      'Hạ người thẳng xuống, đứng lên bằng chân trước.',
      'Đây là bài dễ mất thăng bằng — tập nhẹ trước khi tăng tạ.',
    ] },
  { exerciseId: 'db_walking_lunge', nameVi: 'Walking Lunge', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=eFWCn5iEbTU',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Bước dài về trước, hạ người xuống đến khi đầu gối sau gần chạm sàn.',
      'Đẩy người lên và bước tiếp bằng chân kia, đi liên tục về phía trước.',
      'Giữ thân người thẳng, đừng đổ người về trước.',
    ] },
  { exerciseId: 'db_step_ups', nameVi: 'DB Step Ups', muscleGroup: 'Đùi trước', movementPattern: 'isolation_knee',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=9ZknEYboBOQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đặt cả bàn chân lên bục, bước lên bằng lực chân đó — đừng đạp chân dưới để đẩy người lên.',
      'Đứng thẳng trên bục rồi bước xuống có kiểm soát.',
      'Chọn độ cao bục sao cho đầu gối không vượt quá 90 độ.',
    ] },

  // ---------------- Đùi sau & Mông (Hamstrings & Glutes) — Hinge Primary + Hamstring Accessory ----------------
  { exerciseId: 'deadlift', nameVi: 'BB Conventional Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'compound_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yPqv3ejnZvc',
    defaultScheme: SCHEME.LAST_SET_RIR, defaultParams: scheme2(87.5, 3),
    technique: [
      'Đứng sát thanh tạ, cúi xuống nắm thanh rộng bằng vai rồi hạ hông vừa đủ để giữ lưng chắc và ngực hướng trước.',
      'Kéo thanh sát theo ống chân khi đứng lên; nghĩ đến việc đẩy sàn ra xa thay vì giật tạ bằng lưng.',
      'Đưa hông về trước ở đỉnh, không ngả người ra sau; hạ tạ xuống theo đúng đường đi sát cơ thể.',
    ] },
  { exerciseId: 'sumo_deadlift', nameVi: 'Sumo Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=pfSMst14EFk',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Đứng chân rộng, mũi chân hướng chéo ra ngoài, tay nắm tạ ở giữa hai chân.',
      'Đẩy hông về trước khi đứng lên, giữ lưng thẳng.',
      'Đứng rộng nên lực đến từ đùi trong và mông nhiều hơn Deadlift thường.',
    ] },
  { exerciseId: 'hip_abduction', nameVi: 'Hip Abduction', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=G_8LItOiZ0Q',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi chắc trên máy, đặt hai chân vào đệm và giữ thân người ổn định.',
      'Mở hai gối sang hai bên có kiểm soát, siết mông ở điểm rộng nhất.',
      'Khép chân lại chậm, không để khối tạ kéo chân bật vào trong.',
    ] },
  { exerciseId: 'glute_biased_split_squat', nameVi: 'Glute-biased Split Squat', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=yuLxFEqQ-K8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Bước chân trước đủ xa, hơi nghiêng thân về trước nhưng giữ lưng thẳng.',
      'Hạ hông xuống và ra sau, giữ bàn chân trước bám chắc sàn để mông chịu lực chính.',
      'Đạp qua gót chân trước để đứng lên; chân sau chỉ giữ thăng bằng, không đẩy người.',
    ] },
  { exerciseId: 'rack_pulls', nameVi: 'Rack Pulls', muscleGroup: 'Lưng', movementPattern: 'accessory_back_hinge',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=9vYBWV5OeKg',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Đặt tạ trên giá đỡ ngang gối, nắm tạ và đứng lên như Deadlift nhưng chỉ đi nửa quãng đường.',
      'Đẩy hông về trước ở đỉnh, giữ lưng thẳng suốt hiệp.',
      'Quãng đường ngắn hơn nên thường tập được tạ nặng hơn Deadlift đầy đủ.',
    ] },
  { exerciseId: 'bb_hip_thrust', nameVi: 'BB Hip Thrust', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=EF7jXP17DPE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Lưng trên tựa ghế, tạ đặt ngang hông, chân đạp sàn.',
      'Đẩy hông lên cao hết cỡ, siết mông ở đỉnh như đang kẹp một đồng xu giữa hai mông.',
      'Hạ xuống có kiểm soát, đừng để hông rơi tự do.',
    ] },
  { exerciseId: 'machine_hip_thrust', nameVi: 'Machine Hip Thrust', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=ZSPmIyX9RZs',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi vào máy, đệm tựa ngang hông.',
      'Đẩy hông lên hết cỡ, siết mông ở đỉnh.',
      'Máy giữ quỹ đạo cố định nên tập trung hoàn toàn vào siết mông.',
    ] },
  { exerciseId: 'bb_rdl', nameVi: 'BB Romanian Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/zUM1S1aq7bo',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Đứng thẳng, tạ áp sát đùi, đẩy hông ra sau trong khi hạ tạ xuống — như đang đóng cửa xe bằng mông.',
      'Giữ lưng thẳng, gối chùng nhẹ cố định suốt hiệp.',
      'Hạ đến khi cảm nhận đùi sau căng, không cần chạm sàn.',
    ] },
  { exerciseId: 'db_rdl', nameVi: 'DB Romanian Deadlift', muscleGroup: 'Đùi sau & Mông', movementPattern: 'accessory_hip',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/cjRSNsvqpd8',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Giống BB RDL nhưng cầm hai tạ hai bên đùi.',
      'Đẩy hông ra sau, giữ lưng thẳng, hạ tạ dọc theo chân.',
      'Dễ tập hơn để làm quen cảm giác gập hông trước khi lên tạ đòn.',
    ] },
  { exerciseId: 'lying_leg_curl', nameVi: 'Lying Leg Curl', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=n5WDXD_mpVY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Nằm sấp, đệm chân đặt ngay gót chân.',
      'Co chân lên hết cỡ, siết đùi sau ở đỉnh rồi hạ chậm.',
      'Đừng nhấc hông lên khỏi ghế để mượn đà.',
    ] },
  { exerciseId: 'seated_leg_curl', nameVi: 'Seated Leg Curl', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=Orxowest56U',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi thẳng lưng, đệm chân đặt sau gót.',
      'Kéo chân xuống dưới ghế, siết đùi sau ở cuối.',
      'Giữ đùi trên cố định, chỉ khớp gối chuyển động.',
    ] },
  { exerciseId: 'weighted_back_extension', nameVi: 'Weighted Back Extension', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=rWeVENnLagg',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Hông tựa vào đệm, chân cố định phía sau.',
      'Gập người xuống rồi nâng lên đến khi thân thẳng hàng với chân — đừng ưỡn quá lên phía sau.',
      'Có thể ôm thêm tạ trước ngực khi đã quen động tác.',
    ] },
  { exerciseId: 'bb_good_morning', nameVi: 'BB Good Mornings', muscleGroup: 'Đùi sau & Mông', movementPattern: 'isolation_hip',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=mnxn-7SO9Ks',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Tạ đặt trên vai như Squat, gối chùng nhẹ cố định.',
      'Gập người về trước từ hông, giữ lưng thẳng, đến khi thân gần song song sàn.',
      'Đứng lên bằng cách đẩy hông về trước — cảm nhận đùi sau rất rõ ở bài này.',
    ] },

  // ---------------- Bắp chân (Calves) ----------------
  { exerciseId: 'standing_smith_calf_raise', nameVi: 'Standing Smith Machine Calf Raise', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=hh5516HCu4k',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng dưới thanh Smith, mũi chân đặt trên bục kê, gót thả xuống thấp hết cỡ.',
      'Nhón gót lên cao hết cỡ, giữ 1 giây rồi hạ xuống chậm.',
      'Biên độ càng lớn — từ thả sâu đến nhón cao — hiệu quả càng tốt.',
    ] },
  { exerciseId: 'seated_calf_raise_machine', nameVi: 'Seated Calf Raise Machine', muscleGroup: 'Bắp chân', movementPattern: 'isolation_calves',
    equipmentTags: ['machine'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=I02fKccNIoc',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi vào máy, đệm gối tựa lên đùi, mũi chân trên bục.',
      'Nhón gót lên cao, hạ xuống thấp hết cỡ có kiểm soát.',
      'Tư thế ngồi nhắm vào phần bắp chân dưới nhiều hơn đứng.',
    ] },

  // ---------------- Tay trước (Biceps) ----------------
  { exerciseId: 'incline_db_curl', nameVi: 'Incline Bench DB Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=aTYlqC_JacQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Ngồi tựa lưng trên ghế nghiêng, hai tay thả thẳng xuống.',
      'Co tạ lên mà không đung đưa vai ra trước — ghế nghiêng giúp khóa vai lại.',
      'Hạ tạ xuống chậm, cảm nhận tay trước kéo giãn hết cỡ.',
    ] },
  { exerciseId: 'db_hammer_curl', nameVi: 'DB Hammer Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=XOEL4MgekYE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng thẳng, cầm tạ theo kiểu búa (lòng bàn tay hướng vào người).',
      'Co tạ lên mà không đung đưa người lấy đà.',
      'Kiểu cầm này tác động thêm vào cơ cẳng tay ngoài tay trước.',
    ] },
  { exerciseId: 'preacher_curl', nameVi: 'Preacher Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=sxA__DoLsgo',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Ngồi tựa cánh tay lên đệm nghiêng, nắm thanh tạ.',
      'Co tạ lên hết cỡ, hạ xuống chậm đến khi tay gần thẳng.',
      'Đệm giữ khuỷu tay cố định nên không thể mượn đà từ vai.',
    ] },
  { exerciseId: 'cable_hammer_curl', nameVi: 'Cable Hammer Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=2CDKTFFp5fA',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng cầm dây thừng theo kiểu búa, khuỷu tay ép sát người.',
      'Co lên và hơi xoay cổ tay vào trong ở đỉnh.',
      'Cáp giữ lực căng suốt hiệp, kể cả lúc tay duỗi thẳng.',
    ] },
  { exerciseId: 'bayesian_curls', nameVi: 'Bayesian Curls', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/w3sXATQzGvc',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng quay lưng về phía cáp, để cánh tay kéo nhẹ ra sau thân người.',
      'Giữ khuỷu tay gần như cố định rồi co tay lên, siết tay trước ở điểm cao nhất.',
      'Duỗi tay ra chậm đến hết tầm, không xoay vai về trước để mượn lực.',
    ] },
  { exerciseId: 'cable_curl', nameVi: 'Cable Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/CrbTqNOlFgE',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng vững trước cáp thấp, giữ khuỷu tay sát thân và vai ở đúng vị trí.',
      'Co tay đưa thanh lên mà không đẩy khuỷu tay ra trước hoặc ngả người lấy đà.',
      'Hạ thanh chậm đến khi tay gần duỗi hết, giữ lực căng liên tục trên tay trước.',
    ] },
  { exerciseId: 'barbell_curl', nameVi: 'Barbell Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/54x2WF1_Suc',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Đứng thẳng, nắm thanh rộng gần bằng vai và giữ khuỷu tay sát thân.',
      'Co thanh lên bằng tay trước, không ngả lưng hoặc đẩy hông để lấy đà.',
      'Hạ thanh chậm đến khi tay gần thẳng rồi bắt đầu rep tiếp theo.',
    ] },
  { exerciseId: 'bw_bicep_curl', nameVi: 'BW Bicep Curl', muscleGroup: 'Tay trước', movementPattern: 'isolation_biceps',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/shorts/86oG0kwqyGU',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE,
    defaultParams: scheme8(0, { progressionMode: PROGRESSION_MODE.REPS_SETS_ONLY }),
    technique: [
      'Nắm thanh hoặc tay cầm chắc, giữ thân người thẳng và gót chân bám sàn.',
      'Co khuỷu tay kéo trán hoặc ngực về phía tay cầm, không gập hông để rút ngắn động tác.',
      'Hạ người chậm về vị trí tay gần thẳng; David sẽ chỉnh góc người khi cần tăng độ khó.',
    ] },

  // ---------------- Tay sau (Triceps) ----------------
  { exerciseId: 'triceps_pushdown', nameVi: 'Tricep Cable Press-downs', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=6Fzep104f0s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng thẳng, khuỷu tay ép sát người, đẩy thanh xuống hết cỡ.',
      'Siết tay sau ở đáy, để tay từ từ trở lên — đừng để thanh bật lên nhanh.',
      'Chỉ khớp khuỷu tay chuyển động, vai giữ cố định.',
    ] },
  { exerciseId: 'cable_overhead_extension', nameVi: 'Triceps Cable Overhead Extension', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=1u18yJELsh0',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Quay lưng về phía cáp, hai tay đưa qua đầu nắm tay cầm.',
      'Duỗi thẳng tay lên trên, hạ xuống sau đầu có kiểm soát.',
      'Giữ khuỷu tay cố định, đừng để chĩa ra ngoài.',
    ] },
  { exerciseId: 'cross_body_cable_triceps_extension', nameVi: 'Cross-body Cable Triceps Extension', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/HCc3kDzTyTQ',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng nghiêng cạnh cột cáp, dùng tay đối diện nắm dây ở ngang ngực.',
      'Giữ cánh tay trên yên rồi duỗi cẳng tay chéo xuống và ra ngoài đến khi tay thẳng.',
      'Siết tay sau ở cuối, sau đó đưa tay trở lại chậm mà không xoay vai hoặc vặn thân.',
    ] },
  { exerciseId: 'one_arm_cable_pushdown', nameVi: 'One-arm Cable Push-down', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/w5a5sErWIEw',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Đứng vững, giữ khuỷu tay bên tập ép sát thân người.',
      'Duỗi cẳng tay xuống hết tầm và siết tay sau ở điểm thấp nhất.',
      'Đưa tay trở lên chậm, không để vai hoặc khuỷu tay chạy theo dây cáp.',
    ] },
  { exerciseId: 'barbell_skull_crushers', nameVi: 'Barbell Skull Crushers', muscleGroup: 'Tay sau', movementPattern: 'isolation_triceps',
    equipmentTags: ['barbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/shorts/K3mFeNz4e3w',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Nằm chắc trên ghế, giữ thanh tạ phía trên vai với khuỷu tay hướng lên.',
      'Gập khuỷu tay để hạ thanh về gần trán, giữ cánh tay trên ổn định.',
      'Duỗi tay đưa thanh lên lại có kiểm soát, không xòe khuỷu tay sang hai bên.',
    ] },

  // ---------------- Bụng (Core) — no source column in the sheet; kept from the earlier hand-picked set ----------------
  { exerciseId: 'hanging_leg_raise', nameVi: 'Hanging Leg Raise', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=_jLskVdzS4o',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Treo người trên xà, thân không đung đưa.',
      'Cuộn xương chậu lên trước rồi mới kéo chân lên cao — như đang cuộn một tờ giấy từ dưới lên.',
      'Hạ chân xuống có kiểm soát, đừng đung đưa lấy đà.',
    ] },
  { exerciseId: 'cable_crunch', nameVi: 'Cable Crunch', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['cable'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=ToJeyhydUxU',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(),
    technique: [
      'Quỳ trước cáp, dây kéo qua đầu, tay giữ hai bên đầu.',
      'Gập bụng cong người xuống như đang cuộn tròn lại — không kéo bằng tay hay hông.',
      'Hóp bụng ở điểm cuối rồi thả ra từ từ.',
    ] },
  { exerciseId: 'weighted_russian_twist', nameVi: 'Weighted Russian Twist', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=MGHju5WajqY',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Ngồi hơi ngả người ra sau, chân nhấc khỏi sàn hoặc giữ cố định.',
      'Xoay tạ sang hai bên hông, giữ lưng thẳng.',
      'Xoay chậm có kiểm soát, đừng vung tạ bằng đà.',
    ] },
  { exerciseId: 'db_side_bend', nameVi: 'Dumbbell Side Bend', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['dumbbell'], isBodyweight: false, videoUrl: 'https://www.youtube.com/watch?v=M0KGYdsKVPM',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Đứng thẳng, một tay cầm tạ bên hông.',
      'Nghiêng người sang bên có tạ rồi kéo người thẳng lại bằng cơ bụng bên hông đối diện.',
      'Đừng nghiêng quá sâu hay ngả người ra trước/sau.',
    ] },
  { exerciseId: 'decline_situp', nameVi: 'Decline Sit Ups', muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=N7hf1_vcX5w',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Nằm trên ghế dốc, chân móc cố định phía trên.',
      'Cuộn người lên từ từ bằng bụng, không giật bằng cổ hay tay.',
      'Hạ xuống có kiểm soát, đừng để lưng rơi tự do.',
    ] },
  { exerciseId: 'captains_chair_leg_raise', nameVi: "Captain's Chair Leg Raises", muscleGroup: 'Bụng', movementPattern: 'isolation_core',
    equipmentTags: ['bodyweight'], isBodyweight: true, videoUrl: 'https://www.youtube.com/watch?v=-_oGkbv4R8s',
    defaultScheme: SCHEME.SET_THEN_REP_INCREASE, defaultParams: scheme8(2.5),
    technique: [
      'Tựa lưng và tay vào giá đỡ, treo người.',
      'Cuộn xương chậu lên trước rồi kéo gối lên cao — giống Hanging Leg Raise nhưng có điểm tựa nên ổn định hơn.',
      'Đừng đung đưa người lấy đà.',
    ] },
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
