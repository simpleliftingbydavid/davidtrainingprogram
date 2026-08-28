// ============================================================
// DAVID TRAINING PROGRAM — Progress check & plateau protocol
// ============================================================
// Decides whether a client's calories should change, and if so by how much.
// Pure module returning a structured verdict — the caller renders it.
//
// Ported from the coach's standalone tool (nutrition-automation.netlify.app).
//
// The whole point of this engine is to STOP premature changes. Most stalled
// fat loss is not metabolic adaptation, it is (a) not enough data, (b) poor
// adherence, or (c) a change made too recently to have shown up yet. So the
// order of checks is deliberate and must not be rearranged:
//
//   1. Enough data?        -> refuse to conclude anything without it
//   2. Safety problems?    -> losing too fast, sleep/energy tanking, at floor
//   3. Adherence >= 80%?   -> if not, the target was never actually tested
//   4. Only then           -> diagnose the trend and adjust
//
// And when an adjustment IS warranted, movement is added before food is
// removed: extra steps cost the client almost nothing, another calorie cut
// costs them hunger and energy they may not have to spare.

import { aggregateWeeks, adherencePct, MIN_WEIGH_INS_PER_WEEK } from './nutrition-log-utils.js';
import { KCAL_PER_KG, SAFETY_FLOORS } from './nutrition-meal-builder.js';

export const PLATEAU_ENGINE_VERSION = '1.0.0';

export const PLATEAU_CONFIG = Object.freeze({
  minWeeks: 2,                       // weeks of reliable data before concluding
  minWeighIns: MIN_WEIGH_INS_PER_WEEK,
  flatPct: 0.25,                     // |weekly % change| under this counts as flat
  adherenceMin: 80,                  // % adherence required before touching calories
  stepBump: 1500,                    // extra daily steps tried before cutting food
  stepCeiling: 12000,                // above this, more steps is no longer the easy win
  cutPctHi: 10,                      // max % of calories removed in one adjustment
  cutMin: 100,
  cutMax: 200,
  dietBreakWeeks: 10,                // continuous deficit before a maintenance break
  biofeedbackLow: 2,                 // sleep/energy score at or below this is a red flag
  fastLossPctPerWeek: 1.0,           // losing faster than this costs muscle
  fastGainPctPerWeek: 0.6,
  onTrackTolerancePct: 0.25,
  reviewWeeks: 2,                    // how long to hold any change before re-reading
});

/** Default rates when the coach has not set one explicitly. */
export const DEFAULT_RATES = Object.freeze({ lossPctPerWeek: 0.7, gainPctPerMonth: 1.0 });

const AVG_WEEKS_PER_MONTH = 4.345;

function normalizeGoal(goalType) {
  if (goalType === 'gain') return 'gain';
  if (goalType === 'maintain') return 'maintain';
  return 'loss'; // fat_loss and deep_cut behave identically here
}

/** Target weekly % change implied by the goal and rate. */
export function targetWeeklyPct(goalType, rate = {}) {
  const goal = normalizeGoal(goalType);
  if (goal === 'loss') return -(Number(rate.lossPctPerWeek) || DEFAULT_RATES.lossPctPerWeek);
  if (goal === 'gain') return (Number(rate.gainPctPerMonth) || DEFAULT_RATES.gainPctPerMonth) / AVG_WEEKS_PER_MONTH;
  return 0;
}

/**
 * Recalculate maintenance from what actually happened, rather than trusting
 * the original estimate. If someone ate 2000 kcal and lost 0.5 kg in a week,
 * their real maintenance is 2000 + (0.5 × 7700 ÷ 7). This is the single most
 * useful number in the whole check, because it is measured, not predicted.
 */
export function trueMaintenance(avgKcal, avgKgPerWeek) {
  if (!Number.isFinite(avgKcal)) return null;
  return avgKcal - (avgKgPerWeek * KCAL_PER_KG) / 7;
}

/** Re-split macros for a new calorie level: protein is never cut, fat holds a
 *  floor, carbohydrate absorbs the rest. */
export function macrosForCalories(newKcal, { weightKg, proteinG, fatPct }) {
  const fatFloor = weightKg * SAFETY_FLOORS.fatPerKg;
  const fat = Math.max(fatFloor, newKcal * (fatPct / 100) / 9);
  const carbs = (newKcal - proteinG * 4 - fat * 9) / 4;
  return {
    kcal: Math.round(newKcal),
    protein: Math.round(proteinG),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    carbsBelowFloor: carbs < weightKg * SAFETY_FLOORS.carbPerKg,
  };
}

function alert(level, title, body) {
  return { level, title, body };
}

/**
 * Run the progress check.
 *
 * @param {Object} input
 *   days        per-day log keyed by ISO date (from buildDailyLog)
 *   targets     current daily targets { kcal, protein, fat, carbs }
 *   weightKg    current body weight
 *   goalType    'gain' | 'maintain' | 'fat_loss' | 'deep_cut'
 *   rate        { lossPctPerWeek, gainPctPerMonth }
 * @returns {Object} verdict — see shape below.
 */
export function runProgressCheck({ days, targets, weightKg, goalType = 'fat_loss', rate = {} } = {}) {
  const C = PLATEAU_CONFIG;
  const goal = normalizeGoal(goalType);
  const weight = Number(weightKg) || 0;
  const targetKcal = Number(targets?.kcal) || 0;
  const proteinG = Number(targets?.protein) || 0;
  const fatPct = targetKcal ? (Number(targets?.fat) || 0) * 9 / targetKcal * 100 : 25;

  const allWeeks = aggregateWeeks(days).filter((week) => week.weight !== null);
  const weeks = allWeeks.filter((week) => week.reliable);

  if (!weight || !targetKcal) {
    return {
      status: 'no_targets',
      headline: 'Chưa có mục tiêu để đối chiếu',
      alerts: [alert('info', 'Chưa có mục tiêu', 'Cần cân nặng và mục tiêu calo hiện tại trước khi chạy kiểm tra tiến độ.')],
      metrics: null, verdict: null, adjustment: null, weeks: allWeeks,
    };
  }

  if (weeks.length < C.minWeeks) {
    return {
      status: 'insufficient_data',
      headline: 'Chưa đủ dữ liệu để kết luận',
      alerts: [alert('info', 'Chưa đủ dữ liệu để kết luận',
        `Cần ít nhất ${C.minWeeks} tuần, mỗi tuần cân từ ${C.minWeighIns} lần trở lên. Hiện có ${weeks.length} tuần đạt chuẩn. Cứ cân đều rồi quay lại — đừng đổi calo lúc này.`)],
      metrics: { weeksValid: weeks.length, weeksLogged: allWeeks.length },
      verdict: null, adjustment: null, weeks: allWeeks,
    };
  }

  // --- measure ---
  const changes = [];
  for (let i = 1; i < weeks.length; i++) {
    changes.push({
      pct: (weeks[i].weight - weeks[i - 1].weight) / weeks[i - 1].weight * 100,
      kg: weeks[i].weight - weeks[i - 1].weight,
    });
  }
  const recent = changes.slice(-3);
  let flatStreak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (Math.abs(recent[i].pct) < C.flatPct) flatStreak++; else break;
  }

  const kcalWeeks = weeks.slice(-3).filter((week) => Number.isFinite(week.kcal));
  const totalKcalDays = kcalWeeks.reduce((sum, week) => sum + week.kcalDays, 0);
  const avgKcal = totalKcalDays
    ? kcalWeeks.reduce((sum, week) => sum + week.kcal * week.kcalDays, 0) / totalKcalDays
    : null;

  const avgPct = recent.length ? recent.reduce((s, c) => s + c.pct, 0) / recent.length : 0;
  const avgKg = recent.length ? recent.reduce((s, c) => s + c.kg, 0) / recent.length : 0;
  const tdee = trueMaintenance(avgKcal, avgKg);
  const adherence = adherencePct(avgKcal, targetKcal);
  const targetPct = targetWeeklyPct(goalType, rate);
  const floor = weight * 22 * SAFETY_FLOORS.calorieFactor;
  const targetKgPerWeek = weight * targetPct / 100;
  const recommendedKcal = tdee !== null
    ? Math.round((tdee + targetKgPerWeek * KCAL_PER_KG / 7) / 10) * 10
    : null;

  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const tooFast = (goal === 'loss' && avgPct < -C.fastLossPctPerWeek)
    || (goal === 'gain' && avgPct > C.fastGainPctPerWeek);

  const metrics = {
    weeksValid: weeks.length, weeksLogged: allWeeks.length,
    avgPct, avgKg, targetPct, adherence, avgKcal, trueTdee: tdee,
    floor: Math.round(floor), flatStreak, recommendedKcal,
    currentKcal: targetKcal,
  };

  // --- safety first, before any conclusion about the trend ---
  const alerts = [];
  const bothWeeksLow = (key) => Number.isFinite(last[key]) && last[key] <= C.biofeedbackLow
    && Number.isFinite(prev[key]) && prev[key] <= C.biofeedbackLow;

  if (tooFast && goal === 'loss') {
    alerts.push(alert('stop', 'Đang giảm quá nhanh',
      `Trung bình ${avgPct.toFixed(2)}% mỗi tuần, vượt ngưỡng ${C.fastLossPctPerWeek}%. Tăng calo lên khoảng ${recommendedKcal || targetKcal + 250} kcal. Giảm nhanh kéo dài làm mất cơ và tụt hormone.`));
  }
  if (tooFast && goal === 'gain') {
    alerts.push(alert('warn', 'Đang tăng nhanh hơn mục tiêu',
      `Trung bình ${avgPct.toFixed(2)}% mỗi tuần. Phần vượt chủ yếu tích thành mỡ. Hạ calo về khoảng ${recommendedKcal || targetKcal} kcal.`));
  }
  if (bothWeeksLow('energy')) {
    alerts.push(alert('stop', 'Năng lượng thấp 2 tuần liên tiếp',
      `Đừng hạ calo nữa. Ăn ở mức duy trì ${Math.round(tdee || targetKcal)} kcal trong 1 đến 2 tuần rồi tính tiếp.`));
  }
  if (bothWeeksLow('sleep')) {
    alerts.push(alert('stop', 'Giấc ngủ kém 2 tuần liên tiếp',
      'Ngủ kém làm cân nặng nhiễu và làm đói tăng. Xử lý giấc ngủ trước khi động vào calo.'));
  }
  if (targetKcal <= floor) {
    alerts.push(alert('stop', 'Calo đã chạm sàn',
      `Sàn của khách là ${Math.round(floor)} kcal. Không hạ thêm. Cách còn lại là tăng vận động hoặc nghỉ ăn kiêng một thời gian.`));
  }
  if (weeks.length >= C.dietBreakWeeks && goal === 'loss') {
    alerts.push(alert('warn', `Đã thâm hụt ${weeks.length} tuần liên tục`,
      `Nên ăn ở mức duy trì ${Math.round(tdee || targetKcal)} kcal trong 1 đến 2 tuần rồi mới quay lại giảm. Đây không phải bỏ cuộc — nó giúp giảm tiếp được lâu hơn.`));
  }

  // --- diagnosis ---
  const isFlat = flatStreak >= 2;
  const onTrack = goal !== 'maintain' && Math.abs(avgPct - targetPct) <= C.onTrackTolerancePct;
  let verdict = null;
  let adjustment = null;

  const buildAdjustment = (newKcal, note) => {
    const capped = Math.max(newKcal, Math.round(floor));
    const macros = macrosForCalories(capped, { weightKg: weight, proteinG, fatPct });
    return {
      ...macros,
      deltaKcal: macros.kcal - targetKcal,
      applyWeeks: C.reviewWeeks,
      hitFloor: newKcal < floor,
      note: note || null,
      warning: macros.carbsBelowFloor
        ? `Ở mức calo này tinh bột chỉ còn ${macros.carbs} g, dưới ngưỡng 1 g/kg. Cân nhắc hạ % béo để trả lại tinh bột.`
        : null,
    };
  };

  if (tooFast) {
    // Safety outranks the adherence rule: if someone is losing dangerously
    // fast we cannot answer "adherence too low, change nothing" and walk away.
    const newKcal = recommendedKcal || Math.round((targetKcal + (goal === 'loss' ? 250 : -250)) / 10) * 10;
    verdict = {
      code: 'too_fast', level: 'stop',
      title: goal === 'loss' ? 'Phải ăn thêm ngay' : 'Phải hạ bớt calo',
      body: `Đang đổi cân ${avgPct.toFixed(2)}% mỗi tuần, mục tiêu là ${targetPct.toFixed(2)}%. ` +
        (goal === 'loss' ? 'Ở tốc độ này khách đang mất cả cơ, không chỉ mỡ.' : 'Phần vượt mục tiêu chủ yếu tích thành mỡ.'),
    };
    adjustment = buildAdjustment(newKcal, tdee !== null ? `Tính từ mức duy trì thật ${Math.round(tdee)} kcal, không phải ước tính ban đầu.` : null);
  } else if (adherence !== null && adherence < C.adherenceMin) {
    verdict = {
      code: 'low_adherence', level: 'warn',
      title: 'Chưa được đổi calo',
      body: `Tuân thủ ${adherence.toFixed(0)}%, dưới ngưỡng ${C.adherenceMin}%. Khách ăn trung bình ${Math.round(avgKcal)} kcal so với mục tiêu ${targetKcal} kcal. Mục tiêu chưa thực sự được thực hiện, nên chưa có gì để kết luận về nó.`,
      action: `Giữ nguyên ${targetKcal} kcal. Ghi nhật ký ít nhất 5 ngày mỗi tuần trong 2 tuần rồi kiểm tra lại.`,
    };
  } else if (goal === 'maintain') {
    verdict = Math.abs(avgPct) < C.flatPct
      ? { code: 'maintaining', level: 'ok', title: 'Đang duy trì tốt', body: 'Cân nặng gần như đứng yên, đúng mục tiêu. Không cần đổi gì.' }
      : { code: 'drifting', level: 'warn', title: 'Đang trôi khỏi mức duy trì', body: `Trung bình ${avgPct.toFixed(2)}% mỗi tuần. Chỉnh calo về khoảng ${Math.round(tdee || targetKcal)} kcal.` };
    if (verdict.code === 'drifting' && tdee !== null) adjustment = buildAdjustment(Math.round(tdee / 10) * 10);
  } else if (!isFlat && onTrack) {
    verdict = {
      code: 'on_track', level: 'ok', title: 'Đang đi đúng tốc độ',
      body: `Trung bình ${avgPct.toFixed(2)}% mỗi tuần so với mục tiêu ${targetPct.toFixed(2)}%. Đừng đổi gì cả — đổi lúc này chỉ làm nhiễu dữ liệu.`,
    };
  } else if (!isFlat && !onTrack) {
    const faster = goal === 'loss' ? avgPct < targetPct : avgPct > targetPct;
    verdict = {
      code: faster ? 'faster_than_target' : 'slower_than_target', level: 'warn',
      title: faster ? 'Đang nhanh hơn mục tiêu' : 'Đang chậm hơn mục tiêu',
      body: `Trung bình ${avgPct.toFixed(2)}% mỗi tuần, mục tiêu ${targetPct.toFixed(2)}%. Chưa phải chững cân, nhưng đáng chỉnh nhẹ.`,
    };
    adjustment = buildAdjustment(recommendedKcal || Math.round((targetKcal + (faster ? 1 : -1) * targetKcal * 0.05) / 10) * 10);
  } else {
    // --- genuine plateau ---
    const avgSteps = (() => {
      const withSteps = weeks.slice(-2).filter((w) => Number.isFinite(w.steps));
      return withSteps.length ? withSteps.reduce((s, w) => s + w.steps, 0) / withSteps.length : null;
    })();

    if (goal === 'gain') {
      const addTo = recommendedKcal && recommendedKcal > targetKcal ? recommendedKcal : Math.round((targetKcal + 150) / 10) * 10;
      verdict = {
        code: 'plateau_gain', level: 'warn', title: `Đang chững ${flatStreak} tuần`,
        body: 'Đang tăng cơ mà cân đứng yên nghĩa là chưa dư năng lượng. Ăn thêm, chủ yếu từ tinh bột. Giữ nguyên đạm.',
      };
      adjustment = buildAdjustment(addTo);
    } else if (flatStreak < 3 && (avgSteps === null || avgSteps < PLATEAU_CONFIG.stepCeiling)) {
      // Movement before food. Deliberately no calorie change here.
      verdict = {
        code: 'plateau_add_steps', level: 'warn', title: `Đang chững ${flatStreak} tuần — tăng vận động trước`,
        body: `Thay đổi dưới ${C.flatPct}%/tuần trong ${flatStreak} tuần liên tiếp trong khi vẫn tuân thủ tốt (${adherence === null ? '–' : adherence.toFixed(0)}%). Cơ thể đã thích nghi.`,
        action: `Tăng thêm ${C.stepBump.toLocaleString('vi-VN')} bước mỗi ngày trong ${C.reviewWeeks} tuần. `
          + (avgSteps === null ? 'Khách chưa ghi số bước — đặt mốc khoảng 10.000 bước.' : `Đang ở ${Math.round(avgSteps).toLocaleString('vi-VN')} bước, mốc mới là ${Math.round(avgSteps + C.stepBump).toLocaleString('vi-VN')} bước.`)
          + ` Giữ nguyên ${targetKcal} kcal.`,
        why: 'Cắt calo thêm sẽ làm khách đói và mệt hơn; tăng bước chân thì gần như không. Chỉ khi cách này hết tác dụng mới hạ calo.',
      };
    } else {
      const cut = Math.max(C.cutMin, Math.min(C.cutMax, Math.round(targetKcal * C.cutPctHi / 100 / 10) * 10));
      const newKcal = targetKcal - cut;
      if (newKcal < floor) {
        verdict = {
          code: 'plateau_at_floor', level: 'stop', title: 'Không hạ được nữa',
          body: `Sàn của khách là ${Math.round(floor)} kcal; hạ ${cut} kcal sẽ xuống ${newKcal}. Dừng lại. Hai lựa chọn: ăn duy trì ${Math.round(tdee || targetKcal)} kcal trong 2 tuần rồi giảm lại, hoặc đổi hướng tiếp cận.`,
        };
      } else {
        verdict = {
          code: 'plateau_cut', level: 'warn', title: `Đang chững ${flatStreak} tuần — giờ mới hạ calo`,
          body: `Vận động đã tăng mà cân vẫn đứng, nên giờ mới hạ calo. Cắt ${cut} kcal (${(cut / targetKcal * 100).toFixed(1)}% mức hiện tại). Giữ nguyên đạm, cắt từ tinh bột và béo.`,
        };
        adjustment = buildAdjustment(newKcal);
      }
    }
  }

  return {
    status: 'ok',
    headline: verdict?.title || 'Kết quả kiểm tra',
    metrics, alerts, verdict, adjustment,
    weeks: allWeeks,
    reminders: [
      'Cân nặng dao động 1–2 kg trong ngày là bình thường (nước, muối, thức ăn trong ruột, chu kỳ kinh nguyệt). Vì vậy chỉ đọc trung bình tuần.',
      `Sau mỗi lần chỉnh, chờ đủ ${C.reviewWeeks} tuần rồi mới đánh giá. Chỉnh liên tục thì không bao giờ biết cái gì có tác dụng.`,
      `Nếu tuân thủ dưới ${C.adherenceMin}%, vấn đề nằm ở chỗ thực hiện, không nằm ở con số calo.`,
    ],
  };
}
