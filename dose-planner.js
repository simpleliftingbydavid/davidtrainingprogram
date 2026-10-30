// ============================================================
// DAVID COACHING — Bộ máy dựng khung giáo án
// ============================================================
// Thuần: không DOM, không Firebase. Nhận quy tắc của David (dose-rules.js) và lựa chọn
// của coach, trả về bộ khung giáo án: các buổi, mỗi buổi các slot, mỗi slot có set, rep,
// RIR, nghỉ, kiểu tiến triển gợi ý và danh sách bài tập gợi ý từ thư viện.
//
// Nguyên tắc: không bao giờ bịa số. Quy tắc trống thì trả về lý do rõ ràng; một ô thiếu
// thì ghi vào `missing` của slot và để null cho coach nhập tay.

import { plannedVolumeByMuscle } from './volume-engine.js';

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

/** Bài tập trong thư viện hợp với một slot: đúng nhóm cơ và dạng chuyển động, bài chính trước. */
export function candidatesForSlot(slot, exercises = []) {
  const groups = slot?.muscleGroups || [];
  return exercises
    .filter((exercise) => (!groups.length || groups.includes(exercise.muscleGroup))
      && patternMatches(exercise.movementPattern, slot?.patterns))
    .map((exercise, index) => ({ exercise, index }))
    .sort((a, b) => kindOf(a.exercise) - kindOf(b.exercise) || a.index - b.index)
    .map(({ exercise }) => exercise.exerciseId);
}

function planSlot(slot, exercises) {
  const sets = normalizeRange(slot.sets);
  const reps = normalizeRange(slot.reps);
  const rir = normalizeRange(slot.rir);
  const missing = [];
  if (!sets) missing.push('số set');
  if (!reps) missing.push('khoảng rep');
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
  if (!goal || !level || !style) return { ok: false, code: 'input', reason: 'Hãy chọn đủ mục tiêu, cấp độ và kiểu tập.' };
  const dayCount = Math.trunc(Number(days));
  if (!(dayCount >= 1 && dayCount <= 7)) return { ok: false, code: 'input', reason: 'Số buổi mỗi tuần phải từ 1 đến 7.' };

  const rule = rules[ruleKey(goal, level, style)];
  if (!rule || !Array.isArray(rule.slots) || !rule.slots.length) {
    return { ok: false, code: 'no-rule', reason: 'David chưa nhập quy tắc cho tổ hợp này. Điền vào dose-rules.js hoặc dựng giáo án tay.' };
  }
  const split = rule.splits?.[dayCount] ?? splits[dayCount];
  if (!Array.isArray(split) || !split.length) {
    return { ok: false, code: 'no-split', reason: `David chưa nhập cách chia buổi cho ${dayCount} buổi mỗi tuần.` };
  }

  const warnings = [];
  const byId = new Map(rule.slots.map((slot) => [slot.id, slot]));
  const planned = split.map((day, index) => ({
    label: String(day.label || `Buổi ${index + 1}`),
    slots: (day.slots || []).flatMap((id) => {
      const slot = byId.get(id);
      if (!slot) { warnings.push(`Cách chia buổi nhắc tới slot "${id}" nhưng quy tắc không có slot này.`); return []; }
      return [planSlot(slot, exercises)];
    }),
  }));
  planned.forEach((day) => { if (!day.slots.length) warnings.push(`${day.label} chưa có slot nào.`); });

  return { ok: true, days: planned, weeklyTargets: rule.weeklyTargets || {}, note: String(rule.note || '').trim(), warnings };
}

/** Kiểu tiến triển có số set/rep nằm trong schemeParams mà công cụ điền được. */
const FILLABLE = new Set([1, 2, 3, 4, 8]);

/**
 * Tham số tiến triển cho một slot với một bài đã chọn. Dùng đúng kiểu tiến triển và tham số
 * mặc định của chính bài trong thư viện, chỉ ghi đè set, rep, RIR và nghỉ theo quy tắc của David.
 * @returns {{scheme:number, schemeParams:object, notes:string[]}}
 */
export function prescriptionFor(slotPlan, exercise) {
  const scheme = Number(exercise?.defaultScheme);
  const params = JSON.parse(JSON.stringify(exercise?.defaultParams || {}));
  const notes = [];
  const wanted = slotPlan?.scheme;
  if (wanted && wanted !== scheme) {
    notes.push(`Quy tắc muốn kiểu tiến triển ${wanted}, bài này mặc định kiểu ${scheme}: giữ kiểu của bài, chỉnh lại khi tạo bản nháp nếu cần.`);
  }
  if (slotPlan?.restSeconds) params.restSeconds = slotPlan.restSeconds;
  if (!FILLABLE.has(scheme)) {
    notes.push('Kiểu tiến triển này có set và rep riêng của bài: giữ nguyên mặc định.');
    return { scheme, schemeParams: params, notes };
  }
  const sets = slotPlan?.setsRange;
  const reps = slotPlan?.reps;
  const startSets = slotPlan?.sets;
  const rirTarget = slotPlan?.rir ? slotPlan.rir.max : null;
  if (scheme === 8) {
    if (startSets !== null) {
      params.startingSets = startSets;
      params.endingSets = Math.max(startSets, sets ? Math.round(sets.max) : Number(params.endingSets) || startSets);
    }
    if (reps) {
      params.startingReps = Math.round(reps.min);
      params.endingReps = Math.max(params.startingReps, Math.round(reps.max));
    }
  } else if (scheme === 1) {
    if (startSets !== null) { params.lowerSets = startSets; params.upperSets = Math.max(startSets, sets ? Math.round(sets.max) : startSets); }
    if (reps) params.repsPerSet = Math.round(reps.min);
    if (rirTarget !== null) params.targetRIR = rirTarget;
  } else {
    if (startSets !== null) params.plannedSets = startSets;
    if (reps) params.repsPerSet = Math.round(reps.min);
    if (scheme === 2 && rirTarget !== null) params.targetRIR = rirTarget;
  }
  return { scheme, schemeParams: params, notes };
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
      const missing = [...(slot.sets === null ? ['số set'] : []), ...(!slot.reps ? ['khoảng rep'] : [])];
      if (missing.length) { problems.push(`${where}: thiếu ${missing.join(' và ')}.`); return; }
      if (!(slot.sets >= 1 && slot.sets <= 12)) { problems.push(`${where}: số set phải từ 1 đến 12.`); return; }
      if (!(slot.reps.min >= 1)) { problems.push(`${where}: số rep phải từ 1 trở lên.`); return; }
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
