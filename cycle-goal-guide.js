// ============================================================
// DAVID COACHING — Hướng dẫn theo mục tiêu của chu kỳ (2026-11-03)
// ============================================================
// Thuần: không DOM, không Firebase. Mỗi chu kỳ có thể mang một mục tiêu (tăng cơ, sức mạnh,
// sức mạnh + tăng cơ). Thẻ ở tab Theo dõi của coach đọc mục tiêu và tuần của chu kỳ để nhắc
// cách theo dõi tiến bộ, khi nào kiểm tra 1RM, và nên làm gì khi khách chững lại.
// Chỉ là lời nhắc cho David: không tự đổi set, tạ hay giáo án.

export const PHASE_GOALS = Object.freeze([
  Object.freeze({ id: 'muscle', label: 'Tăng cơ' }),
  Object.freeze({ id: 'strength', label: 'Sức mạnh' }),
  Object.freeze({ id: 'powerbuilding', label: 'Sức mạnh + tăng cơ' }),
]);

/** Mục tiêu hợp lệ hoặc '' (chưa chọn). */
export function normalizePhaseGoal(value) {
  return PHASE_GOALS.some((goal) => goal.id === value) ? value : '';
}

export const goalLabel = (goal) => PHASE_GOALS.find((item) => item.id === goal)?.label || '';

/** Mỗi 8–12 tuần kiểm tra 1RM một lần, sau 3–4 ngày nghỉ hẳn. */
export const ONE_RM_WEEKS = Object.freeze({ from: 8, to: 12 });
/** Tăng cơ: 2–3 tháng không tiến mới điều chỉnh. Sức mạnh: 8–12 tuần. */
export const STALL_WEEKS = Object.freeze({ muscle: 8, strength: 8 });

const TRACK = {
  muscle: [
    'Sức tập: cùng bài, tạ hoặc rep tăng dần qua các tuần.',
    'Ảnh tiến trình chụp cùng điều kiện ánh sáng.',
    'Số đo vòng (tay, ngực, đùi), nhất là khi cân nặng không đổi.',
  ],
  strength: [
    'Mỗi tuần một lần nâng 1 rep nặng ở RIR 1–3: thấy nhẹ hơn hoặc lên được tạ là đang tiến.',
    'Set chính: thêm rep ở cùng mức tạ, hoặc thêm tạ.',
  ],
};

const STALL = {
  muscle: {
    when: '2–3 tháng tập đều mà sức tập, ảnh và số đo đều không đổi',
    steps: [
      'Kiểm tra RIR thật: phần lớn set phải dừng ở RIR 1–2. Cho khách thử một set tới thất bại để tự hiệu chỉnh.',
      'Kiểm tra ăn ngủ: đủ đạm, đủ calo, ngủ 7–9 tiếng.',
      'Đổi sang bài kéo giãn cơ nhiều hơn ở cuối biên độ.',
      'Thêm 1–2 set cho mỗi nhóm cơ, cứ 3–4 tuần thêm một lần (VD ngực 4 → 6 → 8 set/tuần). Có thể giữ vài tuần rồi giảm lại.',
    ],
  },
  strength: {
    when: '8–12 tuần mà rep nặng, set chính và 1RM đều không tăng',
    steps: [
      'Kiểm tra ăn ngủ trước: đủ đạm, đủ calo, ngủ 7–9 tiếng.',
      'Thêm 1–2 set mỗi tuần, 3–5 rep, ở các bài khách muốn mạnh lên.',
      'Dồn thêm phần tập vào set 1–3 rep để quen tạ gần tối đa.',
      'Thêm biến thể của bài chính (VD bench dừng lâu ở ngực, bench tay hẹp) bên cạnh bài chính, không thay thế.',
    ],
  },
};

/**
 * Lời nhắc cho một chu kỳ.
 * @param {{goal:string, week:number|null}} input  week: tuần thứ mấy của chu kỳ (null nếu chưa bắt đầu)
 * @returns {null | {goal, label, track:string[], oneRm:null|{status:'early'|'due'|'late', text:string}, stall:{when, steps, active:boolean}[]}}
 */
export function goalGuide({ goal, week = null } = {}) {
  const clean = normalizePhaseGoal(goal);
  if (!clean) return null;
  const parts = clean === 'powerbuilding' ? ['strength', 'muscle'] : [clean];
  const heavy = parts.includes('strength');
  let oneRm = null;
  if (heavy) {
    if (week === null || week < ONE_RM_WEEKS.from) {
      oneRm = { status: 'early', text: `Kiểm tra 1RM vào tuần ${ONE_RM_WEEKS.from}–${ONE_RM_WEEKS.to} của chu kỳ${week === null ? '' : ` (còn ${ONE_RM_WEEKS.from - week} tuần)`}.` };
    } else if (week <= ONE_RM_WEEKS.to) {
      oneRm = { status: 'due', text: `Đã tới tuần ${week}: lên lịch kiểm tra 1RM cho 2–3 bài chính. Cho khách nghỉ hẳn 3–4 ngày trước buổi kiểm tra.` };
    } else {
      oneRm = { status: 'late', text: `Đã tuần ${week}, quá ${ONE_RM_WEEKS.to} tuần: nên kiểm tra 1RM ngay khi tiện, sau 3–4 ngày nghỉ hẳn.` };
    }
  }
  return {
    goal: clean,
    label: goalLabel(clean),
    track: parts.flatMap((part) => TRACK[part]),
    oneRm,
    stall: parts.map((part) => ({ ...STALL[part], part, active: week !== null && week >= STALL_WEEKS[part] })),
  };
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

/** Phần thân của thẻ "Theo mục tiêu" ở tab Theo dõi. */
export function goalGuideMarkup(guide, { week = null } = {}) {
  if (!guide) {
    return '<p class="small-note">Chu kỳ này chưa có mục tiêu. Chọn mục tiêu ở thanh chu kỳ (tab Giáo án) để xem cách theo dõi, lịch kiểm tra 1RM và việc nên làm khi khách chững lại.</p>';
  }
  const oneRm = guide.oneRm
    ? `<div class="goal-onerm is-${guide.oneRm.status}"><strong>Kiểm tra 1RM</strong><p>${escapeHtml(guide.oneRm.text)}</p></div>` : '';
  const track = `<p class="goal-sub">Theo dõi tiến bộ bằng</p><ul class="goal-list">${guide.track.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const stall = guide.stall.map((item) => `<details class="goal-stall${item.active ? ' is-active' : ''}"${item.active ? ' open' : ''}>
      <summary>Khi khách chững lại${guide.stall.length > 1 ? ` · ${item.part === 'muscle' ? 'tăng cơ' : 'sức mạnh'}` : ''}<small>${escapeHtml(item.when)}</small></summary>
      <ol class="goal-list">${item.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    </details>`).join('');
  return `<p class="goal-head"><span class="goal-chip">${escapeHtml(guide.label)}</span>${week === null ? 'Chu kỳ chưa bắt đầu' : `Tuần ${week} của chu kỳ`}</p>${oneRm}${track}${stall}
    <p class="small-note" style="margin-top:10px;">Chỉ là lời nhắc. Không có gì tự đổi set, tạ hay giáo án.</p>`;
}
