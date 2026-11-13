// ============================================================
// DAVID COACHING — Bài tập đề xuất bổ sung thư viện (Claude đề xuất, 2026-11-13)
// ============================================================
// David báo: "các bài tập cho từng nhóm cơ chưa được bổ sung đầy đủ". Chốt cùng ngày: Claude đề
// xuất, David duyệt từng bài; chỉ bổ sung trong 9 nhóm cơ hiện có.
//
// File này CHƯA nằm trong thư viện thật: bài approved:false không xuất hiện ở bộ dựng, màn hình
// tập hay giáo án của khách. Khi David duyệt, bài được chuyển vào EXERCISES (exercise-seed-data.js).
//
// Lý do thêm (`gap`) chỉ nói về khoảng trống của thư viện (nhóm cơ, dạng chuyển động hoặc dụng cụ đang
// ít bài), không khẳng định bài này tốt hơn bài khác. Không có nguồn số liệu nào ở đây.
// videoUrl để trống: Claude không tự tạo đường link video; David thêm khi có.
// `loadPer` theo quy tắc đã chốt: 'side' một tay/một chân hoặc máy lắp bánh tạ hai bên; 'hand' hai tay mỗi
// tay một quả tạ đơn; không có = một thanh hoặc một quả tạ chung, số kg là tổng.

const PROPOSED_ON = '2026-11-13';

const p = (exerciseId, nameVi, muscleGroup, movementPattern, equipmentTags, technique, gap, extra = {}) => Object.freeze({
  exerciseId, nameVi, muscleGroup, movementPattern,
  equipmentTags: Object.freeze([...equipmentTags]),
  isBodyweight: equipmentTags.length === 1 && equipmentTags[0] === 'bodyweight',
  ...(extra.loadPer ? { loadPer: extra.loadPer } : {}),
  videoUrl: '',
  technique: Object.freeze([...technique]),
  gap,
  proposedOn: PROPOSED_ON, approved: false, approvedOn: null,
});

export const EXERCISE_PROPOSALS = Object.freeze([
  // ---------------- Bắp chân: hiện 2 bài, cả hai là máy ----------------
  p('standing_calf_raise_machine', 'Standing Calf Raise Machine', 'Bắp chân', 'isolation_calves', ['machine'], [
    'Đặt vai dưới đệm, mũi chân trên bục, gót thả thấp hết cỡ.',
    'Nhón gót lên cao nhất, giữ 1 giây rồi hạ xuống chậm.',
    'Giữ đầu gối thẳng nhưng không khóa cứng, không nảy người.',
  ], 'Bắp chân chỉ có 2 bài; thêm máy đứng chuyên dụng.'),
  p('leg_press_calf_raise', 'Leg Press Calf Raise', 'Bắp chân', 'isolation_calves', ['machine'], [
    'Ngồi vào máy, đặt phần mũi chân lên mép dưới của bệ, gối gần thẳng.',
    'Đẩy mũi chân xuống hết cỡ, rồi thả gót về chậm để bắp chân giãn.',
    'Không khóa cứng gối, giữ nhịp chậm, không giật.',
  ], 'Bắp chân chỉ có 2 bài; thêm bài dùng máy đạp đùi có sẵn ở phòng tập.'),
  p('single_leg_db_calf_raise', 'Single-leg DB Calf Raise', 'Bắp chân', 'isolation_calves', ['dumbbell'], [
    'Đứng một chân trên bục, tay cùng bên cầm tạ, tay kia vịn vào chỗ chắc.',
    'Thả gót thấp hết cỡ rồi nhón cao nhất, giữ 1 giây.',
    'Làm xong một chân mới đổi chân, giữ thân người thẳng.',
  ], 'Bắp chân chưa có bài tạ đơn hay bài từng chân.', { loadPer: 'side' }),
  p('bodyweight_calf_raise', 'Bodyweight Calf Raise', 'Bắp chân', 'isolation_calves', ['bodyweight'], [
    'Đứng mũi chân trên mép bậc, gót thả xuống thấp.',
    'Nhón gót lên cao nhất, giữ 1 giây rồi hạ chậm.',
    'Khi hai chân đã dễ, tăng rep hoặc chuyển sang làm từng chân.',
  ], 'Bắp chân chưa có bài thân người cho khách tập ở nhà hoặc phòng tập thiếu máy.'),

  // ---------------- Ngực: 3 bài chính, 2 bài cô lập ----------------
  p('db_flat_bench_press', 'DB Flat Bench Press', 'Ngực', 'compound_pec', ['dumbbell'], [
    'Nằm ngửa trên ghế phẳng, hai tạ ở ngang ngực, ép bả vai xuống ghế.',
    'Đẩy hai tạ lên thẳng trên ngực, khuỷu tay hơi chếch về hai bên thân.',
    'Hạ chậm đến khi ngực căng, không để tạ kéo vai ra trước.',
  ], 'Ngực chỉ có 3 bài đẩy chính, chưa có bài tạ đơn nằm phẳng.', { loadPer: 'hand' }),
  p('chest_dip', 'Dips (bodyweight)', 'Ngực', 'compound_pec', ['bodyweight'], [
    'Chống hai tay lên xà kép, người hơi nghiêng ra trước.',
    'Hạ người đến khi vai ngang khuỷu tay rồi đẩy lên.',
    'Nếu vai khó chịu khi hạ sâu thì hạ nông hơn.',
  ], 'Ngực chỉ có bản dips có thêm tạ; chưa có bản thân người cho khách mới.'),
  p('bb_incline_bench_press', 'BB Incline Bench Press', 'Ngực', 'accessory_pec', ['barbell'], [
    'Ghế nghiêng khoảng 30 độ, nắm tạ rộng hơn vai một chút.',
    'Hạ thanh tạ chậm xuống ngực trên rồi đẩy lên.',
    'Ép bả vai xuống ghế, không ưỡn lưng quá mức.',
  ], 'Ngực chưa có bài đẩy dốc lên bằng tạ đòn.'),
  p('incline_machine_chest_press', 'Incline Machine Chest Press', 'Ngực', 'accessory_pec', ['machine'], [
    'Chỉnh ghế để tay cầm ngang ngực trên, lưng tựa sát.',
    'Đẩy hai tay ra trước, siết ngực ở cuối.',
    'Hạ về chậm đến khi ngực căng, không nảy.',
  ], 'Ngực chưa có máy đẩy dốc lên.', { loadPer: 'side' }),
  p('db_fly', 'DB Fly', 'Ngực', 'isolation_pec', ['dumbbell'], [
    'Nằm ngửa trên ghế, hai tạ trên ngực, khuỷu tay hơi cong.',
    'Dang hai tay ra hai bên theo đường vòng cung đến khi ngực căng.',
    'Khép tạ về lại như đang ôm một thân cây; giữ khuỷu tay cong cố định, dùng tạ nhẹ.',
  ], 'Ngực chỉ có 2 bài cô lập (cáp và máy), chưa có bài tạ đơn.', { loadPer: 'hand' }),
  p('low_to_high_cable_fly', 'Low-to-High Cable Fly', 'Ngực', 'isolation_pec', ['cable'], [
    'Cáp đặt thấp, mỗi tay một tay cầm, bước một bước ra trước.',
    'Đưa hai tay vòng lên trước ngực đến ngang cằm, siết ngực ở đỉnh.',
    'Hạ về chậm, giữ khuỷu tay hơi cong, không nhún vai.',
  ], 'Ngực chỉ có 2 bài cô lập; thêm hướng kéo cáp từ thấp lên cao.'),
  p('single_arm_cable_fly', 'Single-arm Cable Fly', 'Ngực', 'isolation_pec', ['cable'], [
    'Đứng nghiêng cạnh cột cáp, một tay cầm tay cầm ngang vai.',
    'Đưa tay vòng ra trước ngực, siết ngực ở cuối.',
    'Giữ thân người ổn định, không xoay theo tay kéo.',
  ], 'Ngực chưa có bài cô lập từng bên.', { loadPer: 'side' }),

  // ---------------- Vai: 1 bài đẩy chính, 4 bài đẩy phụ ----------------
  p('seated_bb_overhead_press', 'Seated BB Overhead Press', 'Vai', 'compound_shoulder', ['barbell'], [
    'Ngồi tựa lưng thẳng, thanh tạ ngang vai.',
    'Đẩy thẳng lên qua đầu đến khi tay duỗi.',
    'Siết bụng, đừng ưỡn lưng để mượn đà.',
  ], 'Vai chỉ có 1 bài đẩy chính (Military Press đứng).'),
  p('arnold_press', 'Arnold Press', 'Vai', 'accessory_shoulder', ['dumbbell'], [
    'Ngồi tựa lưng, hai tạ trước ngực, lòng bàn tay hướng vào người.',
    'Vừa đẩy lên vừa xoay lòng bàn tay ra trước, kết thúc ở trên đầu.',
    'Hạ xuống theo chiều ngược lại, có kiểm soát.',
  ], 'Vai chỉ có 4 bài đẩy phụ.', { loadPer: 'hand' }),
  p('db_rear_delt_fly', 'DB Rear Delt Fly', 'Vai', 'isolation_shoulder', ['dumbbell'], [
    'Ngồi hoặc đứng gập hông, lưng thẳng, hai tạ buông dưới ngực.',
    'Dang hai tay ra hai bên đến ngang vai, khuỷu tay hơi cong.',
    'Hạ chậm, không dùng đà để nâng tạ.',
  ], 'Vai sau chỉ có máy reverse fly và face pull, chưa có bài tạ đơn.', { loadPer: 'hand' }),
  p('cable_rear_delt_fly', 'Cable Rear Delt Fly', 'Vai', 'isolation_shoulder', ['cable'], [
    'Đứng giữa hai cột cáp, tay trái cầm cáp bên phải và ngược lại, cáp ở ngang vai.',
    'Kéo hai tay ra hai bên đến khi ngang vai.',
    'Giữ khuỷu tay hơi cong, không nhún vai.',
  ], 'Vai sau chưa có bài cáp cô lập.', { loadPer: 'side' }),

  // ---------------- Bụng: 6 bài ----------------
  p('ab_wheel_rollout', 'Ab Wheel Rollout', 'Bụng', 'isolation_core', ['bodyweight'], [
    'Quỳ gối, hai tay cầm bánh xe, lưng tròn nhẹ, siết bụng.',
    'Đẩy bánh xe ra trước đến mức lưng vẫn giữ được, rồi kéo về.',
    'Không để bụng võng xuống; khi mệt thì rút ngắn tầm.',
  ], 'Bụng chưa có bài chống duỗi (anti-extension).'),
  p('ab_crunch_machine', 'Ab Crunch Machine', 'Bụng', 'isolation_core', ['machine'], [
    'Ngồi vào máy, chỉnh ghế để tay cầm ngang ngực.',
    'Cuộn thân trên về phía hông bằng cơ bụng.',
    'Về chậm, không dùng đà từ hông.',
  ], 'Bụng chưa có bài máy.'),
  p('pallof_press', 'Pallof Press', 'Bụng', 'isolation_core', ['cable'], [
    'Đứng nghiêng cạnh cột cáp ngang ngực, hai tay cầm tay cầm trước ngực.',
    'Đẩy hai tay thẳng ra trước, giữ thân người không bị cáp kéo xoay.',
    'Giữ 1–2 giây rồi đưa về; làm đủ rep một bên rồi đổi bên.',
  ], 'Bụng chưa có bài chống xoay (anti-rotation).', { loadPer: 'side' }),
  p('cable_woodchop', 'Cable Woodchop', 'Bụng', 'isolation_core', ['cable'], [
    'Đứng nghiêng cạnh cột cáp đặt cao, hai tay cầm tay cầm.',
    'Kéo chéo xuống thấp qua thân người, xoay thân từ hông và bụng.',
    'Chân vững, chuyển động chậm, không giật.',
  ], 'Bụng chưa có bài xoay thân bằng cáp.', { loadPer: 'side' }),
  p('reverse_crunch', 'Reverse Crunch', 'Bụng', 'isolation_core', ['bodyweight'], [
    'Nằm ngửa, hai gối co, tay đặt dọc thân.',
    'Cuộn hông lên khỏi sàn, đưa gối về phía ngực bằng cơ bụng.',
    'Hạ chậm, không vung chân lấy đà.',
  ], 'Bụng chưa có bài cuộn hông nằm sàn cho khách mới.'),
  p('hanging_knee_raise', 'Hanging Knee Raise', 'Bụng', 'isolation_core', ['bodyweight'], [
    'Treo người trên xà, siết nhẹ hai vai xuống.',
    'Co gối lên ngang hông hoặc cao hơn, cuộn nhẹ hông.',
    'Hạ chậm, không đung đưa người.',
  ], 'Bụng chỉ có bản treo xà duỗi thẳng chân (khó hơn).'),

  // ---------------- Tay trước: 8 bài ----------------
  p('ez_bar_curl', 'EZ-bar Curl', 'Tay trước', 'isolation_biceps', ['barbell'], [
    'Đứng thẳng, cầm thanh EZ ở phần cong, khuỷu tay sát thân.',
    'Co tạ lên đến khi tay trước co hết, không đung đưa người.',
    'Hạ chậm xuống hết tầm.',
  ], 'Tay trước chưa có thanh EZ (nhẹ cổ tay hơn thanh thẳng).'),
  p('machine_preacher_curl', 'Machine Preacher Curl', 'Tay trước', 'isolation_biceps', ['machine'], [
    'Chỉnh ghế để cánh tay trên tựa sát đệm.',
    'Co tay lên, siết tay trước, rồi hạ chậm.',
    'Không nhấc khuỷu tay khỏi đệm.',
  ], 'Tay trước chưa có bài máy.'),
  p('concentration_curl', 'Concentration Curl', 'Tay trước', 'isolation_biceps', ['dumbbell'], [
    'Ngồi, khuỷu tay chống vào mặt trong đùi, tay cầm tạ buông thẳng.',
    'Co tạ lên, siết tay trước ở đỉnh.',
    'Hạ chậm; làm đủ rep một tay rồi đổi tay.',
  ], 'Tay trước chưa có bài tạ đơn từng tay ngồi.', { loadPer: 'side' }),
  p('db_curl', 'DB Curl', 'Tay trước', 'isolation_biceps', ['dumbbell'], [
    'Đứng thẳng, hai tạ buông hai bên, lòng bàn tay hướng lên.',
    'Co tạ lên, khuỷu tay giữ sát thân.',
    'Hạ chậm, không đung đưa người.',
  ], 'Tay trước chưa có bài curl tạ đơn cơ bản (chỉ có bản ghế nghiêng và bản búa).', { loadPer: 'hand' }),

  // ---------------- Tay sau: 8 bài ----------------
  p('reverse_grip_pushdown', 'Reverse-grip Pushdown', 'Tay sau', 'isolation_triceps', ['cable'], [
    'Nắm thanh cáp úp ngược (lòng bàn tay hướng lên), ép khuỷu tay sát thân.',
    'Duỗi tay xuống hết tầm, siết tay sau.',
    'Đưa lên chậm, không để khuỷu tay chạy ra trước.',
  ], 'Tay sau chưa có kiểu cầm ngược cho bài pushdown.'),
  p('db_triceps_kickback', 'DB Triceps Kickback', 'Tay sau', 'isolation_triceps', ['dumbbell'], [
    'Cúi người, một tay chống ghế, khuỷu tay cầm tạ ép sát thân.',
    'Duỗi cẳng tay ra sau đến khi thẳng, siết tay sau.',
    'Giữ cánh tay trên đứng yên; dùng tạ nhẹ.',
  ], 'Tay sau chưa có bài kickback.', { loadPer: 'side' }),
  p('single_arm_overhead_db_extension', 'Single-arm Overhead DB Extension', 'Tay sau', 'isolation_triceps', ['dumbbell'], [
    'Ngồi hoặc đứng, một tay cầm tạ đưa thẳng lên trên đầu.',
    'Gập khuỷu hạ tạ ra sau đầu rồi duỗi lên.',
    'Giữ khuỷu hướng lên trần, siết bụng để lưng không ưỡn.',
  ], 'Tay sau chỉ có bản tạ đơn hai tay chung một quả.', { loadPer: 'side' }),
  p('bench_dip', 'Bench Dip', 'Tay sau', 'isolation_triceps', ['bodyweight'], [
    'Chống hai tay lên ghế phía sau, chân duỗi hoặc co gối.',
    'Hạ người đến khi khuỷu khoảng 90 độ rồi đẩy lên.',
    'Giữ lưng sát ghế; vai khó chịu thì dừng.',
  ], 'Tay sau chưa có bài thân người.'),

  // ---------------- Đùi trước: chỉ 1 bài chính (Squat) ----------------
  p('box_squat', 'Box Squat', 'Đùi trước', 'compound_knee', ['barbell'], [
    'Đặt ghế hoặc hộp sau lưng ở độ cao ngang gối hoặc thấp hơn.',
    'Ngồi xuống chạm hộp có kiểm soát, giữ lưng thẳng rồi đứng lên.',
    'Không thả người ngồi phịch xuống hộp.',
  ], 'Đùi trước dạng bài chính chỉ có 1 bài (BB Back Squat).'),
  p('bb_reverse_lunge', 'BB Reverse Lunge', 'Đùi trước', 'accessory_knee', ['barbell'], [
    'Thanh tạ trên vai sau, bước một chân ra sau.',
    'Hạ gối sau gần chạm sàn, chân trước chịu lực chính.',
    'Đạp chân trước để đứng lên về chỗ cũ rồi đổi chân.',
  ], 'Đùi trước chưa có bài bước lùi.'),
  p('db_reverse_lunge', 'DB Reverse Lunge', 'Đùi trước', 'accessory_knee', ['dumbbell'], [
    'Hai tạ buông hai bên, bước một chân ra sau.',
    'Hạ gối sau gần chạm sàn, chân trước chịu lực chính.',
    'Đạp chân trước để đứng lên về chỗ cũ rồi đổi chân.',
  ], 'Đùi trước chưa có bài bước lùi bằng tạ đơn.', { loadPer: 'hand' }),
  p('pendulum_squat', 'Pendulum Squat', 'Đùi trước', 'accessory_knee', ['machine'], [
    'Đặt vai dưới đệm, bàn chân ở giữa bệ.',
    'Hạ người xuống sâu theo quỹ đạo của máy.',
    'Đứng lên bằng cả bàn chân, không khóa cứng gối.',
  ], 'Đùi trước chưa có máy squat quỹ đạo cung tròn.'),

  // ---------------- Đùi sau & Mông: chỉ 1 bài chính (Deadlift) ----------------
  p('trap_bar_deadlift', 'Trap Bar Deadlift', 'Đùi sau & Mông', 'compound_hip', ['barbell'], [
    'Đứng trong khung thanh tạ, nắm hai tay cầm, lưng thẳng, ngực mở.',
    'Đẩy sàn bằng chân, đứng thẳng người rồi hạ về.',
    'Giữ thanh tạ sát thân, không gập lưng.',
  ], 'Đùi sau & Mông dạng bài chính chỉ có 1 bài (BB Conventional Deadlift).'),
  p('cable_pull_through', 'Cable Pull-through', 'Đùi sau & Mông', 'accessory_hip', ['cable'], [
    'Quay lưng cột cáp đặt thấp, dây đi giữa hai chân, hai tay cầm dây.',
    'Đẩy hông ra sau, lưng thẳng, rồi duỗi hông về trước và siết mông.',
    'Để hai tay thả lỏng; chuyển động xuất phát từ hông.',
  ], 'Đùi sau & Mông chưa có bài gập hông bằng cáp.'),
  p('glute_bridge', 'Glute Bridge', 'Đùi sau & Mông', 'isolation_hip', ['bodyweight'], [
    'Nằm ngửa, hai gối co, bàn chân đặt sát mông.',
    'Nâng hông lên đến khi thân thẳng, siết mông 1 giây.',
    'Hạ chậm, không ưỡn lưng.',
  ], 'Đùi sau & Mông chưa có bài mông thân người.'),
  p('single_leg_hip_thrust', 'Single-leg Hip Thrust', 'Đùi sau & Mông', 'isolation_hip', ['bodyweight'], [
    'Lưng trên tựa ghế, một chân đặt sàn, chân kia nhấc khỏi sàn.',
    'Đẩy hông lên đến khi thân thẳng, siết mông.',
    'Hạ chậm; xong một chân mới đổi chân.',
  ], 'Đùi sau & Mông chưa có bài hip thrust từng chân.', { loadPer: 'side' }),
  p('standing_leg_curl_machine', 'Standing Leg Curl Machine', 'Đùi sau & Mông', 'isolation_hip', ['machine'], [
    'Đứng đối diện máy, đệm ở phía sau mắt cá chân.',
    'Co chân về phía mông, siết đùi sau.',
    'Hạ chậm; xong một chân mới đổi chân.',
  ], 'Đùi sau & Mông chỉ có máy gập đùi sau nằm và ngồi.', { loadPer: 'side' }),

  // ---------------- Lưng: 23 bài, thêm một bài cáp từng bên ----------------
  p('single_arm_cable_row', 'Single-arm Cable Row', 'Lưng', 'accessory_back_horizontal', ['cable'], [
    'Ngồi hoặc đứng trước cáp đặt ngang ngực, một tay cầm tay cầm.',
    'Kéo khuỷu ra sau sát hông, ép bả vai.',
    'Về chậm, không xoay thân.',
  ], 'Lưng chưa có bài kéo ngang cáp từng bên.', { loadPer: 'side' }),
]);

export const PROPOSAL_GROUP_ORDER = Object.freeze(['Bắp chân', 'Ngực', 'Vai', 'Bụng', 'Tay trước', 'Tay sau', 'Đùi trước', 'Đùi sau & Mông', 'Lưng']);

export const pendingProposals = () => EXERCISE_PROPOSALS.filter((item) => !item.approved);
export const approvedProposals = () => EXERCISE_PROPOSALS.filter((item) => item.approved);
