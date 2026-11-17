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

import { t, fmtNumber, getLang } from './i18n.js';
// Số thập phân: dấu phẩy (vi) / dấu chấm (en).
const decimalText = (value) => (getLang() === 'en' ? String(value) : String(value).replace('.', ','));
import { aggregateWeeks, adherencePct, MIN_WEIGH_INS_PER_WEEK } from './nutrition-log-utils.js';
import { KCAL_PER_KG, SAFETY_FLOORS, carbRangeFor, splitMacros } from './nutrition-engine.js';

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
 *  floor, carbohydrate absorbs the rest. With a goal (David, 2026-11-04) the split is the plan
 *  builder's own: protein and fat start from the plan, carb is kept inside the goal's range
 *  (extra to protein up to 2.2 g/kg then fat; short of the bottom, fat gives way down to
 *  0.6 g/kg and the rest is flagged). */
export function macrosForCalories(newKcal, { weightKg, proteinG, fatPct, fatG = null, goalType = '', profile = {} }) {
  const weight = Number(weightKg) || 0;
  if (goalType && weight > 0) {
    const carbRange = carbRangeFor(goalType, profile);
    const startFat = Number(fatG) > 0 ? Number(fatG) : newKcal * (fatPct / 100) / 9;
    const split = splitMacros({
      weightKg: weight,
      kcal: newKcal,
      proteinPerKg: (Number(proteinG) || 0) / weight,
      fatPerKg: Math.max(startFat, weight * SAFETY_FLOORS.fatPerKg) / weight,
      carbRange,
    });
    return {
      kcal: Math.round(newKcal),
      protein: split.protein,
      fat: split.fat,
      carbs: split.carbs,
      carbsBelowFloor: split.carbCap.belowFloor,
      carbRange: { min: carbRange.min, max: carbRange.max },
      carbCap: split.carbCap,
    };
  }
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
export function runProgressCheck({ days, targets, weightKg, goalType = 'fat_loss', rate = {}, profile = {} } = {}) {
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
      headline: t('pl.chua_co_muc_tieu_de_doi'),
      alerts: [alert('info', t('pl.chua_co_muc_tieu'), t('pl.can_can_nang_va_muc_tieu'))],
      metrics: null, verdict: null, adjustment: null, weeks: allWeeks,
    };
  }

  if (weeks.length < C.minWeeks) {
    return {
      status: 'insufficient_data',
      headline: t('pl.chua_du_du_lieu_de_ket'),
      alerts: [alert('info', t('pl.chua_du_du_lieu_de_ket'),
        `${t('pl.can_it_nhat_tuan_moi_tuan', { p0: C.minWeeks, p1: C.minWeighIns, p2: weeks.length })}`)],
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
    alerts.push(alert('stop', t('pl.dang_giam_qua_nhanh'),
      `${t('pl.trung_binh_moi_tuan_vuot_nguong', { p0: avgPct.toFixed(2), p1: C.fastLossPctPerWeek, p2: recommendedKcal || targetKcal + 250 })}`));
  }
  if (tooFast && goal === 'gain') {
    alerts.push(alert('warn', t('pl.dang_tang_nhanh_hon_muc_tieu'),
      `${t('pl.trung_binh_moi_tuan_phan_vuot', { p0: avgPct.toFixed(2), p1: recommendedKcal || targetKcal })}`));
  }
  if (bothWeeksLow('energy')) {
    alerts.push(alert('stop', t('pl.nang_luong_thap_2_tuan_lien'),
      `${t('pl.dung_ha_calo_nua_an_o', { p0: Math.round(tdee || targetKcal) })}`));
  }
  if (bothWeeksLow('sleep')) {
    alerts.push(alert('stop', t('pl.giac_ngu_kem_2_tuan_lien'),
      t('pl.ngu_kem_lam_can_nang_nhieu')));
  }
  if (targetKcal <= floor) {
    alerts.push(alert('stop', t('pl.calo_da_cham_san'),
      `${t('pl.san_cua_hoc_vien_la_kcal', { p0: Math.round(floor) })}`));
  }
  if (weeks.length >= C.dietBreakWeeks && goal === 'loss') {
    alerts.push(alert('warn', `${t('pl.da_tham_hut_tuan_lien_tuc', { p0: weeks.length })}`,
      `${t('pl.nen_an_o_muc_duy_tri', { p0: Math.round(tdee || targetKcal) })}`));
  }

  // --- diagnosis ---
  const isFlat = flatStreak >= 2;
  const onTrack = goal !== 'maintain' && Math.abs(avgPct - targetPct) <= C.onTrackTolerancePct;
  let verdict = null;
  let adjustment = null;

  const buildAdjustment = (newKcal, note) => {
    const capped = Math.max(newKcal, Math.round(floor));
    const macros = macrosForCalories(capped, { weightKg: weight, proteinG, fatPct, fatG: Number(targets?.fat) || null, goalType, profile });
    return {
      ...macros,
      deltaKcal: macros.kcal - targetKcal,
      applyWeeks: C.reviewWeeks,
      hitFloor: newKcal < floor,
      note: note || null,
      warning: macros.carbsBelowFloor
        ? (macros.carbRange
          ? `${t('pl.carb_duoi_g_kg_o_muc', { p0: decimalText(macros.carbRange.min), p1: macros.carbs })}`
          : `${t('pl.o_muc_calo_nay_tinh_bot', { p0: macros.carbs })}`)
        : null,
    };
  };

  if (tooFast) {
    // Safety outranks the adherence rule: if someone is losing dangerously
    // fast we cannot answer "adherence too low, change nothing" and walk away.
    const newKcal = recommendedKcal || Math.round((targetKcal + (goal === 'loss' ? 250 : -250)) / 10) * 10;
    verdict = {
      code: 'too_fast', level: 'stop',
      title: goal === 'loss' ? t('pl.phai_an_them_ngay') : t('pl.phai_ha_bot_calo'),
      body: `${t('pl.dang_doi_can_moi_tuan_muc', { p0: avgPct.toFixed(2), p1: targetPct.toFixed(2) })} ` +
        (goal === 'loss' ? t('pl.o_toc_do_nay_hoc_vien') : t('pl.phan_vuot_muc_tieu_chu_yeu')),
    };
    adjustment = buildAdjustment(newKcal, tdee !== null ? `${t('pl.tinh_tu_muc_duy_tri_that', { p0: Math.round(tdee) })}` : null);
  } else if (adherence !== null && adherence < C.adherenceMin) {
    verdict = {
      code: 'low_adherence', level: 'warn',
      title: t('pl.chua_duoc_doi_calo'),
      body: `${t('pl.tuan_thu_duoi_nguong_hoc_vien', { p0: adherence.toFixed(0), p1: C.adherenceMin, p2: Math.round(avgKcal), p3: targetKcal })}`,
      action: `${t('pl.giu_nguyen_kcal_ghi_nhat_ky', { p0: targetKcal })}`,
    };
  } else if (goal === 'maintain') {
    verdict = Math.abs(avgPct) < C.flatPct
      ? { code: 'maintaining', level: 'ok', title: t('pl.dang_duy_tri_tot'), body: t('pl.can_nang_gan_nhu_dung_yen') }
      : { code: 'drifting', level: 'warn', title: t('pl.dang_troi_khoi_muc_duy_tri'), body: `${t('pl.trung_binh_moi_tuan_chinh_calo', { p0: avgPct.toFixed(2), p1: Math.round(tdee || targetKcal) })}` };
    if (verdict.code === 'drifting' && tdee !== null) adjustment = buildAdjustment(Math.round(tdee / 10) * 10);
  } else if (!isFlat && onTrack) {
    verdict = {
      code: 'on_track', level: 'ok', title: t('pl.dang_di_dung_toc_do'),
      body: `${t('pl.trung_binh_moi_tuan_so_voi', { p0: avgPct.toFixed(2), p1: targetPct.toFixed(2) })}`,
    };
  } else if (!isFlat && !onTrack) {
    const faster = goal === 'loss' ? avgPct < targetPct : avgPct > targetPct;
    verdict = {
      code: faster ? 'faster_than_target' : 'slower_than_target', level: 'warn',
      title: faster ? t('pl.dang_nhanh_hon_muc_tieu') : t('pl.dang_cham_hon_muc_tieu'),
      body: `${t('pl.trung_binh_moi_tuan_muc_tieu', { p0: avgPct.toFixed(2), p1: targetPct.toFixed(2) })}`,
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
        code: 'plateau_gain', level: 'warn', title: `${t('pl.dang_chung_tuan', { p0: flatStreak })}`,
        body: t('pl.dang_tang_co_ma_can_dung'),
      };
      adjustment = buildAdjustment(addTo);
    } else if (flatStreak < 3 && (avgSteps === null || avgSteps < PLATEAU_CONFIG.stepCeiling)) {
      // Movement before food. Deliberately no calorie change here.
      verdict = {
        code: 'plateau_add_steps', level: 'warn', title: `${t('pl.dang_chung_tuan_tang_van_dong', { p0: flatStreak })}`,
        body: `${t('pl.thay_doi_duoi_tuan_trong_tuan', { p0: C.flatPct, p1: flatStreak, p2: adherence === null ? '–' : adherence.toFixed(0) })}`,
        action: `${t('pl.tang_them_buoc_moi_ngay_trong', { p0: fmtNumber(C.stepBump, { grouping: true }), p1: C.reviewWeeks })} `
          + (avgSteps === null ? t('pl.hoc_vien_chua_ghi_so_buoc') : `${t('pl.dang_o_buoc_moc_moi_la', { p0: fmtNumber(Math.round(avgSteps), { grouping: true }), p1: fmtNumber(Math.round(avgSteps + C.stepBump), { grouping: true }) })}`)
          + ` ${t('pl.giu_nguyen_kcal', { p0: targetKcal })}`,
        why: t('pl.cat_calo_them_se_lam_hoc'),
      };
    } else {
      const cut = Math.max(C.cutMin, Math.min(C.cutMax, Math.round(targetKcal * C.cutPctHi / 100 / 10) * 10));
      const newKcal = targetKcal - cut;
      if (newKcal < floor) {
        verdict = {
          code: 'plateau_at_floor', level: 'stop', title: t('pl.khong_ha_duoc_nua'),
          body: `${t('pl.san_cua_hoc_vien_la_kcal_2', { p0: Math.round(floor), p1: cut, p2: newKcal, p3: Math.round(tdee || targetKcal) })}`,
        };
      } else {
        verdict = {
          code: 'plateau_cut', level: 'warn', title: `${t('pl.dang_chung_tuan_gio_moi_ha', { p0: flatStreak })}`,
          body: `${t('pl.van_dong_da_tang_ma_can', { p0: cut, p1: (cut / targetKcal * 100).toFixed(1) })}`,
        };
        adjustment = buildAdjustment(newKcal);
      }
    }
  }

  return {
    status: 'ok',
    headline: verdict?.title || t('pl.ket_qua_kiem_tra'),
    metrics, alerts, verdict, adjustment,
    weeks: allWeeks,
    reminders: [
      t('pl.can_nang_dao_dong_1_2'),
      `${t('pl.sau_moi_lan_chinh_cho_du', { p0: C.reviewWeeks })}`,
      `${t('pl.neu_tuan_thu_duoi_van_de', { p0: C.adherenceMin })}`,
    ],
  };
}
