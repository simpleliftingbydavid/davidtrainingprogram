// ============================================================
// DAVID COACHING — Bộ máy dựng khung giáo án
// ============================================================
// Thuần: không DOM, không Firebase. Nhận quy tắc của David (dose-rules.js) và lựa chọn
// của coach, trả về bộ khung giáo án: các buổi, mỗi buổi các slot, mỗi slot có set, rep,
// RIR, nghỉ, kiểu tiến triển gợi ý và danh sách bài tập gợi ý từ thư viện.
//
// Nguyên tắc: không bao giờ bịa số. Quy tắc trống thì trả về lý do rõ ràng; một ô thiếu
// thì ghi vào `missing` của slot và để null cho coach nhập tay.

import { t } from './i18n.js';
import { plannedVolumeByMuscle } from './volume-engine.js';
import { SCHEME } from './progression-engine.js';

const finite = (value) => (value === null || value === undefined || value === '' ? null : (Number.isFinite(Number(value)) ? Number(value) : null));

/** {min,max} → {min,max} đủ cả hai đầu (thiếu một đầu thì lấy đầu kia), hoặc null khi trống. */
export function normalizeRange(range) {
  const min = finite(range?.min);
  const max = finite(range?.max);
  if (min === null && max === null) return null;
  const low = min ?? max;
  const high = max ?? min;
  return { min: Math.min(low, high), max: Math.max(low, high) };
}

export function ruleKey(goal, level, style) {
  return `${goal}.${level}.${style}`;
}

const KIND_ORDER = { compound: 0, accessory: 1, isolation: 2 };
const kindOf = (exercise) => KIND_ORDER[String(exercise.movementPattern || '').split('_')[0]] ?? 3;

function patternMatches(pattern, patterns) {
  if (!patterns?.length) return true;
  return patterns.some((wanted) => (String(wanted).endsWith('*')
    ? String(pattern).startsWith(String(wanted).slice(0, -1))
    : pattern === wanted));
}

/** Bài tập trong thư viện hợp với một slot: đúng nhóm cơ và dạng chuyển động, bài chính trước.
 *  Slot có preferExercises thì các bài đó (nếu hợp slot) lên đầu, theo đúng thứ tự đã ghi. */
export function candidatesForSlot(slot, exercises = []) {
  const groups = slot?.muscleGroups || [];
  const prefer = Array.isArray(slot?.preferExercises) ? slot.preferExercises : [];
  const rank = (exercise) => { const at = prefer.indexOf(exercise.exerciseId); return at < 0 ? prefer.length : at; };
  return exercises
    .filter((exercise) => (!groups.length || groups.includes(exercise.muscleGroup))
      && patternMatches(exercise.movementPattern, slot?.patterns))
    .map((exercise, index) => ({ exercise, index }))
    .sort((a, b) => rank(a.exercise) - rank(b.exercise) || kindOf(a.exercise) - kindOf(b.exercise) || a.index - b.index)
    .map(({ exercise }) => exercise.exerciseId);
}

function planSlot(slot, exercises) {
  const sets = normalizeRange(slot.sets);
  const reps = normalizeRange(slot.reps);
  const rir = normalizeRange(slot.rir);
  const missing = [];
  if (!sets) missing.push(t('dp.so_set'));
  if (!reps) missing.push(t('dp.khoang_rep'));
  return {
    slotId: slot.id,
    label: slot.label || slot.id,
    muscleGroups: [...(slot.muscleGroups || [])],
    setsRange: sets,
    // Bắt đầu từ ít: mức thấp của khoảng set.
    sets: sets ? Math.round(sets.min) : null,
    reps,
    rir,
    restSeconds: finite(slot.restSeconds),
    weightStepKg: finite(slot.weightStepKg),
    scheme: finite(slot.scheme),
    note: String(slot.note || '').trim(),
    candidates: candidatesForSlot(slot, exercises),
    exerciseId: null,
    missing,
  };
}

/**
 * Dựng khung.
 * @returns {{ok:false, code:string, reason:string}
 *          | {ok:true, days:Array, weeklyTargets:object, note:string, warnings:string[]}}
 */
export function planProgram({ rules = {}, splits = {}, goal, level, style, days, exercises = [] } = {}) {
  if (!goal || !level || !style) return { ok: false, code: 'input', reason: t('dp.hay_chon_du_muc_tieu_cap') };
  const dayCount = Math.trunc(Number(days));
  if (!(dayCount >= 1 && dayCount <= 7)) return { ok: false, code: 'input', reason: t('dp.so_buoi_moi_tuan_phai_tu') };

  const rule = rules[ruleKey(goal, level, style)];
  if (!rule || !Array.isArray(rule.slots) || !rule.slots.length) {
    return { ok: false, code: 'no-rule', reason: t('dp.david_chua_nhap_quy_tac_cho') };
  }
  const split = rule.splits?.[dayCount] ?? splits[dayCount];
  if (!Array.isArray(split) || !split.length) {
    const reason = String(rule.uncoveredReason || '').trim() || `${t('dp.david_chua_nhap_cach_chia_buoi', { p0: dayCount })}`;
    return { ok: false, code: 'no-split', reason };
  }

  const warnings = [];
  const byId = new Map(rule.slots.map((slot) => [slot.id, slot]));
  const planned = split.map((day, index) => ({
    label: String(day.label || `Buổi ${index + 1}` /* i18n-data */),
    slots: (day.slots || []).flatMap((id) => {
      const slot = byId.get(id);
      if (!slot) { warnings.push(`${t('dp.cach_chia_buoi_nhac_toi_slot')} "${id}" ${t('dp.nhung_quy_tac_khong_co_slot')}`); return []; }
      return [planSlot(slot, exercises)];
    }),
  }));
  planned.forEach((day) => { if (!day.slots.length) warnings.push(`${t('dp.chua_co_slot_nao', { p0: day.label })}`); });

  return { ok: true, days: planned, weeklyTargets: rule.weeklyTargets || {}, note: String(rule.note || '').trim(), warnings };
}

/** Kiểu tiến triển của mọi giáo án dựng từ đây: "Tăng rep rồi tăng tạ" (David, 2026-11-04). */
export const PLANNER_SCHEME = SCHEME.DOUBLE_PROGRESSION;

/**
 * Tham số tiến triển cho một slot với một bài đã chọn. Mọi bài dùng kiểu 9: giữ số set, rep
 * leo trong khoảng của slot, đủ rep mức trên thì tăng tạ một bước. Bước tăng lấy từ slot
 * (dose-rules.js); bài cô lập không nhỏ hơn nấc tạ nhỏ nhất của bài. Bài tự trọng không tăng tạ.
 * Thư viện bài tập và các giáo án đang chạy không bị đổi.
 * @returns {{scheme:number, schemeParams:object, notes:string[]}}
 */
export function prescriptionFor(slotPlan, exercise) {
  const defaults = exercise?.defaultParams || {};
  const notes = [];
  const increment = Number(defaults.roundingIncrement) || 0;
  const isBodyweight = exercise?.isBodyweight === true || defaults.progressionMode === 'reps_sets_only';
  let step = Number(slotPlan?.weightStepKg);
  if (!(step > 0)) {
    step = increment;
    if (!isBodyweight) notes.push(t('dp.quy_tac_chua_co_buoc_tang'));
  }
  if (increment > step) step = increment;
  const reps = slotPlan?.reps;
  const rir = slotPlan?.rir;
  const schemeParams = {
    plannedSets: slotPlan?.sets ?? null,
    repsMin: reps ? Math.round(reps.min) : null,
    repsMax: reps ? Math.max(Math.round(reps.min), Math.round(reps.max)) : null,
    rirMin: rir ? rir.min : 0,
    targetRIR: rir ? rir.max : 0,
    weightStepKg: isBodyweight ? 0 : step,
    roundingIncrement: increment,
    restSeconds: slotPlan?.restSeconds || Number(defaults.restSeconds) || 90,
    isBodyweight,
  };
  return { scheme: PLANNER_SCHEME, schemeParams, notes };
}

/** Các bài đã chọn của khung, dạng giống assignment để dùng lại tính volume của app. */
export function planAssignments(plan, lookup) {
  return plan.days.flatMap((day) => day.slots.flatMap((slot) => {
    const exercise = slot.exerciseId ? lookup(slot.exerciseId) : null;
    if (!exercise) return [];
    const { scheme, schemeParams } = prescriptionFor(slot, exercise);
    return [{
      exerciseId: exercise.exerciseId, dayLabel: day.label, scheme, schemeParams,
      state: { currentSets: slot.sets ?? undefined },
    }];
  }));
}

/** Volume kế hoạch theo nhóm cơ mỗi tuần (mỗi buổi tập một lần mỗi tuần). */
export function planVolume(plan, lookup) {
  return plannedVolumeByMuscle(planAssignments(plan, lookup), lookup, {});
}

/** So volume kế hoạch với khoảng set/tuần của David. Chỉ là đề xuất, không chặn gì. */
export function compareToTargets(volume = {}, targets = {}) {
  return Object.entries(targets).flatMap(([muscle, range]) => {
    const target = normalizeRange(range);
    if (!target) return [];
    const planned = Math.round((Number(volume[muscle]) || 0) * 10) / 10;
    const status = planned < target.min ? 'low' : planned > target.max ? 'high' : 'ok';
    return [{ muscle, planned, min: target.min, max: target.max, status }];
  });
}

/**
 * Khung đã chọn bài → các "buổi" theo định dạng của bộ dựng bản nháp (buildDraftAssignmentsFromSelections).
 * Không tạo mức tạ: bản nháp để tạ khởi điểm trống, coach nhập trước khi kích hoạt.
 * Slot chưa chọn bài thì bỏ qua và được liệt kê; slot đã chọn bài mà thiếu số set hoặc rep thì
 * chặn lại (problems), để không lưu giáo án bằng con số nào chưa ai quyết.
 * @returns {{options:Array, exerciseCount:number, skipped:string[], problems:string[]}}
 */
export function draftOptionsFromPlan(plan, lookup) {
  const options = [];
  const skipped = [];
  const problems = [];
  let exerciseCount = 0;
  plan.days.forEach((day) => {
    const exercises = [];
    day.slots.forEach((slot) => {
      const where = `${day.label} · ${slot.label}`;
      const exercise = slot.exerciseId ? lookup(slot.exerciseId) : null;
      if (!exercise) { skipped.push(where); return; }
      const missing = [...(slot.sets === null ? [t('dp.so_set')] : []), ...(!slot.reps ? [t('dp.khoang_rep')] : [])];
      if (missing.length) { problems.push(`${t('dp.thieu', { p0: where, p1: missing.join(` ${t('coach.va')} `) })}`); return; }
      if (!(slot.sets >= 1 && slot.sets <= 12)) { problems.push(`${t('dp.so_set_phai_tu_1_den', { p0: where })}`); return; }
      if (!(slot.reps.min >= 1)) { problems.push(`${t('dp.so_rep_phai_tu_1_tro', { p0: where })}`); return; }
      const { scheme, schemeParams } = prescriptionFor(slot, exercise);
      exercises.push({
        exerciseId: exercise.exerciseId,
        exerciseNameSnapshot: { vi: exercise.nameVi },
        orderInDay: exercises.length,
        scheme, schemeParams,
        // Lời của David trên slot là cho coach, không đi theo bài sang học viên.
        note: '',
      });
    });
    if (exercises.length) {
      options.push({ id: `planner:${day.label}`, sourceType: 'planner', sourceId: 'dose-planner', dayLabel: day.label, name: day.label, exercises });
      exerciseCount += exercises.length;
    }
  });
  return { options, exerciseCount, skipped, problems };
}
