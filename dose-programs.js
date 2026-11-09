// ============================================================
// DAVID COACHING — Dựng quy tắc theo cấp độ × kiểu người tập
// ============================================================
// Thuần: không DOM, không Firebase. Nhận cách xếp buổi (dạng bài nào vào ngày nào) và bảng
// liều tập của David (set/tuần, rep, RIR, nghỉ) rồi trả về quy tắc cho Bộ dựng giáo án
// (cùng định dạng với dose-rules.js). Không có số nào ở đây: mọi số nằm trong dose-rules.js.
//
// Cách chia set: set/tuần của một nhóm cơ chia đều cho số lần dạng bài đó xuất hiện trong
// tuần, làm tròn lên, ít nhất 1 set mỗi lần.

/** Dạng bài: nhãn, nhóm cơ trong thư viện, dạng chuyển động lọc bài gợi ý, và vai trò. */
export const KINDS = Object.freeze({
  squat: { label: 'Đùi trước · squat', muscle: 'Đùi trước', patterns: ['compound_knee', 'accessory_knee'], role: 'compound', group: 'quads' },
  hinge: { label: 'Đùi sau & mông · hinge', muscle: 'Đùi sau & Mông', patterns: ['compound_hip', 'accessory_hip'], role: 'compound', group: 'hams' },
  pushH: { label: 'Ngực · đẩy ngang', muscle: 'Ngực', patterns: ['compound_pec', 'accessory_pec'], role: 'compound', group: 'chest' },
  pushV: { label: 'Vai · đẩy dọc', muscle: 'Vai', patterns: ['compound_shoulder', 'accessory_shoulder'], role: 'compound', group: 'delts' },
  pullH: { label: 'Lưng · kéo ngang', muscle: 'Lưng', patterns: ['compound_back_horizontal', 'accessory_back_horizontal'], role: 'compound', group: 'upperBack' },
  pullV: { label: 'Lưng · kéo dọc', muscle: 'Lưng', patterns: ['accessory_back_vertical'], role: 'compound', group: 'lats' },
  legExt: { label: 'Đùi trước · leg extension', muscle: 'Đùi trước', patterns: ['isolation_knee'], role: 'isolation', group: 'quads' },
  splitSquat: { label: 'Đùi trước · chân đơn (split squat)', muscle: 'Đùi trước', patterns: ['isolation_knee'], role: 'isolation', group: 'quads' },
  legCurl: { label: 'Đùi sau · leg curl', muscle: 'Đùi sau & Mông', patterns: ['isolation_hip'], role: 'isolation', group: 'hams' },
  lateral: { label: 'Vai giữa · lateral raise', muscle: 'Vai', patterns: ['isolation_shoulder'], role: 'isolation', group: 'delts' },
  facePull: { label: 'Vai sau · face pull', muscle: 'Vai', patterns: ['isolation_shoulder'], role: 'isolation', group: 'upperBack' },
  fly: { label: 'Ngực · ép ngực', muscle: 'Ngực', patterns: ['isolation_pec'], role: 'isolation', group: 'chest' },
  triceps: { label: 'Tay sau', muscle: 'Tay sau', patterns: ['isolation_triceps'], role: 'isolation', group: 'triceps', small: true },
  biceps: { label: 'Tay trước', muscle: 'Tay trước', patterns: ['isolation_biceps'], role: 'isolation', group: 'biceps', small: true },
  calves: { label: 'Bắp chân', muscle: 'Bắp chân', patterns: ['isolation_calves'], role: 'isolation', group: 'calves', small: true, direct: true },
  abs: { label: 'Bụng', muscle: 'Bụng', patterns: ['isolation_core'], role: 'isolation', group: 'abs', small: true, direct: true },
  // Ba bài chính của người chuyên squat / bench / deadlift, biến thể và bài phụ.
  sq: { label: 'Squat tạ đòn', muscle: 'Đùi trước', patterns: ['compound_knee'], role: 'main', group: 'sq' },
  bp: { label: 'Bench press', muscle: 'Ngực', patterns: ['compound_pec'], role: 'main', group: 'bp' },
  dl: { label: 'Deadlift', muscle: 'Đùi sau & Mông', patterns: ['compound_hip'], role: 'main', group: 'dl' },
  sqVar: { label: 'Biến thể squat', muscle: 'Đùi trước', patterns: ['accessory_knee'], role: 'variation', group: 'sq' },
  bpVar: { label: 'Biến thể bench', muscle: 'Ngực', patterns: ['compound_pec', 'accessory_pec'], role: 'variation', group: 'bp' },
  dlVar: { label: 'Biến thể deadlift', muscle: 'Đùi sau & Mông', patterns: ['accessory_hip'], role: 'variation', group: 'dl' },
});

/** Bài cô lập cho mỗi nhóm cơ lớn (tăng cơ) và cho nhóm cơ nhỏ. */
const MAJOR_ISOLATION = ['fly', 'lateral', 'legExt', 'legCurl'];
const SMALL_ISOLATION = ['biceps', 'triceps', 'calves', 'abs'];
const SBD_ACCESSORIES = ['pullV', 'pullH', 'triceps', 'legCurl'];

const ceilAtLeast1 = (value) => Math.max(1, Math.ceil(value));
const perAppearance = (weekly, count) => {
  const min = ceilAtLeast1(weekly.min / count);
  return { min, max: Math.max(min, ceilAtLeast1(weekly.max / count)) };
};
const DAY_LETTERS = 'ABCDEFG';

/** Thêm các dạng bài còn thiếu vào buổi ít bài nhất, mỗi dạng một lần. */
function ensureKinds(days, kinds) {
  const out = days.map((day) => [...day]);
  kinds.forEach((kind) => {
    if (out.some((day) => day.includes(kind))) return;
    const lightest = out.reduce((best, day, index) => (day.length < out[best].length ? index : best), 0);
    out[lightest].push(kind);
  });
  return out;
}

/** Bài đa khớp trước, bài cô lập sau trong mỗi buổi; giữ thứ tự gốc trong cùng vai trò. */
const ROLE_ORDER = { main: 0, compound: 1, variation: 2, isolation: 3 };
const ordered = (day) => day
  .map((kind, index) => ({ kind, index }))
  .sort((a, b) => ROLE_ORDER[KINDS[a.kind].role] - ROLE_ORDER[KINDS[b.kind].role] || a.index - b.index)
  .map(({ kind }) => kind);

// `stepFor(kind)` (tuỳ chọn): bước tăng tạ của dạng bài, do dose-rules.js truyền vào.
function finish(prefix, dayCount, layout, slotFor, note, stepFor) {
  const slots = [];
  const seen = new Map();
  const split = layout.map((day, dayIndex) => ({
    label: `Buổi ${DAY_LETTERS[dayIndex]}`,
    slots: day.map((kind, position) => {
      const occurrence = (seen.get(kind) || 0) + 1;
      seen.set(kind, occurrence);
      const id = `${prefix}${dayCount}-${dayIndex + 1}-${position + 1}`;
      slots.push({ id, ...slotFor(kind, occurrence), ...(stepFor ? { weightStepKg: stepFor(kind) } : {}) });
      return id;
    }),
  }));
  return { slots, split, note };
}

const countKinds = (layout) => {
  const counts = new Map();
  layout.flat().forEach((kind) => counts.set(kind, (counts.get(kind) || 0) + 1));
  return counts;
};

/**
 * Tăng cơ. `dose`: { weekly:{min,max}, exercises:'compound'|'compound+isolation'|'2compound+isolation'|'2compound+isolation+small',
 *   reps:{compound, compoundB?, isolation}, rir, rest:{compound, isolation} (giây, tuỳ chọn), note }
 * `layouts`: { [số buổi]: [[dạng bài,...], ...] } lấy từ giáo án mẫu.
 */
export function muscleRule(prefix, layouts, dose) {
  const withIsolation = dose.exercises !== 'compound';
  const result = { note: dose.note, slots: [], splits: {} };
  Object.entries(layouts).forEach(([days, base]) => {
    let layout = base.map((day) => day.filter((kind) => withIsolation || KINDS[kind].role === 'compound'));
    if (withIsolation) layout = ensureKinds(layout, MAJOR_ISOLATION);
    if (dose.exercises.endsWith('+small')) layout = ensureKinds(layout, SMALL_ISOLATION);
    layout = layout.map(ordered);
    const counts = countKinds(layout);
    // Set/tuần của nhóm cơ: phần lớn cho bài đa khớp, khoảng 1/4 cho bài cô lập (ít nhất 1 set).
    const groupKinds = new Map();
    counts.forEach((count, kind) => {
      const { group } = KINDS[kind];
      groupKinds.set(group, [...(groupKinds.get(group) || []), kind]);
    });
    const setsFor = (kind) => {
      const info = KINDS[kind];
      const kindsOfGroup = groupKinds.get(info.group);
      const hasCompound = kindsOfGroup.some((other) => KINDS[other].role === 'compound');
      const hasIsolation = kindsOfGroup.some((other) => KINDS[other].role === 'isolation');
      let weekly = dose.weekly;
      if (info.small && !info.direct) weekly = { min: Math.ceil(dose.weekly.min / 2), max: Math.ceil(dose.weekly.max / 2) };
      if (hasCompound && hasIsolation) {
        const isolation = { min: Math.max(1, Math.round(weekly.min / 4)), max: Math.max(1, Math.round(weekly.max / 4)) };
        weekly = info.role === 'isolation' ? isolation : { min: weekly.min - isolation.min, max: weekly.max - isolation.max };
      }
      const appearances = kindsOfGroup.filter((other) => KINDS[other].role === info.role).reduce((sum, other) => sum + counts.get(other), 0);
      return perAppearance(weekly, appearances);
    };
    const built = finish(prefix, Number(days), layout, (kind, occurrence) => {
      const info = KINDS[kind];
      const isolation = info.role === 'isolation';
      // Hai bài đa khớp cho một nhóm cơ: lần xuất hiện đầu nặng hơn (A), lần sau nhẹ hơn (B).
      const reps = isolation ? dose.reps.isolation
        : (dose.reps.compoundB && occurrence % 2 === 0 ? dose.reps.compoundB : dose.reps.compound);
      const rest = isolation ? dose.rest?.isolation : dose.rest?.compound;
      return {
        label: !isolation && dose.reps.compoundB ? `${info.label} · ${occurrence % 2 === 0 ? 'B' : 'A'}` : info.label,
        muscleGroups: [info.muscle], patterns: info.patterns,
        sets: setsFor(kind), reps: { ...reps }, rir: { ...dose.rir },
        ...(rest ? { restSeconds: rest } : {}),
      };
    }, dose.note, dose.stepFor);
    result.slots.push(...built.slots);
    result.splits[days] = built.split;
  });
  return result;
}

/**
 * Sức mạnh cho người tập giải trí hoặc mê tạ đòn: cách xếp buổi của giáo án mẫu, liều theo cấp độ.
 * `dose`: { weekly, primary:{reps, rir, rest, patterns:'machine'|'barbell'}, secondary?:{reps, rir, rest}, note }
 * Mê tạ đòn: lần đầu một dạng bài xuất hiện trong tuần là bài tạ đòn (primary), các lần sau là
 * máy hoặc tạ đơn (secondary). Tập giải trí: mọi lần là bài máy đa khớp.
 */
export function strengthRule(prefix, layouts, dose) {
  const result = { note: dose.note, slots: [], splits: {} };
  Object.entries(layouts).forEach(([days, layout]) => {
    const counts = countKinds(layout);
    const built = finish(prefix, Number(days), layout, (kind, occurrence) => {
      const info = KINDS[kind];
      // Dạng bài không có bài tạ đòn (kéo dọc: kéo xà, kéo xô) giữ nhãn thường, liều như bài chính.
      const barbell = dose.primary.patterns === 'barbell' && info.patterns.some((pattern) => pattern.startsWith('compound_'));
      const part = barbell && occurrence > 1 && dose.secondary ? dose.secondary : dose.primary;
      // Bài máy: dạng accessory_*; bài tạ đòn: dạng compound_* trước. Kéo dọc chỉ có một dạng.
      const machine = info.patterns.filter((pattern) => pattern.startsWith('accessory_'));
      const patterns = part === dose.primary && barbell ? info.patterns : (machine.length ? machine : info.patterns);
      return {
        label: barbell ? `${info.label} · ${part === dose.primary ? 'tạ đòn' : 'máy / tạ đơn'}` : info.label,
        muscleGroups: [info.muscle], patterns,
        sets: perAppearance(dose.weekly, counts.get(kind)),
        reps: { ...part.reps }, rir: { ...part.rir },
        ...(part.rest ? { restSeconds: part.rest } : {}),
      };
    }, dose.note, dose.stepFor);
    result.slots.push(...built.slots);
    result.splits[days] = built.split;
  });
  return result;
}

/**
 * Người chuyên squat / bench / deadlift. `layouts`: buổi nào tập bài chính nào.
 * `dose`: { main:{weekly, heavy, light?, heavyShare, rir, rest}, variation?:{weekly, reps, rir, rest},
 *   accessory:{weekly, reps, rir, rest}, note }
 * Bài chính trước; biến thể của một bài chính ở lần cuối bài đó xuất hiện trong tuần; mỗi buổi
 * thêm một bài phụ, xoay vòng lưng xô, lưng giữa, tay sau, đùi sau.
 */
export function sbdRule(prefix, layouts, dose) {
  const result = { note: dose.note, slots: [], splits: {} };
  Object.entries(layouts).forEach(([days, base]) => {
    let layout = base.map((day) => [...day]);
    if (dose.variation) {
      ['sq', 'bp', 'dl'].forEach((lift) => {
        const last = layout.map((day, index) => (day.includes(lift) ? index : -1)).filter((index) => index >= 0).pop();
        if (last !== undefined) layout[last].push(`${lift}Var`);
      });
    }
    layout = layout.map((day, index) => [...day, SBD_ACCESSORIES[index % SBD_ACCESSORIES.length]]);
    // Ít buổi hơn số bài phụ: bài phụ còn thiếu vào buổi ít bài nhất.
    layout = ensureKinds(layout, SBD_ACCESSORIES);
    layout = layout.map(ordered);
    const counts = countKinds(layout);
    const built = finish(prefix, Number(days), layout, (kind, occurrence) => {
      const info = KINDS[kind];
      const part = info.role === 'main' ? dose.main : info.role === 'variation' ? dose.variation : dose.accessory;
      // Bài chính: khoảng heavyShare số lần trong tuần ở rep nặng (heavy), còn lại ở rep nhẹ hơn (light).
      let reps = part.reps;
      if (info.role === 'main') {
        const heavyCount = Math.max(1, Math.round(counts.get(kind) * part.heavyShare));
        reps = occurrence <= heavyCount || !part.light ? part.heavy : part.light;
      }
      return {
        label: info.label, muscleGroups: [info.muscle], patterns: info.patterns,
        sets: perAppearance(part.weekly, counts.get(kind)),
        reps: { ...reps }, rir: { ...part.rir },
        ...(part.rest ? { restSeconds: part.rest } : {}),
      };
    }, dose.note, dose.stepFor);
    result.slots.push(...built.slots);
    result.splits[days] = built.split;
  });
  return result;
}
