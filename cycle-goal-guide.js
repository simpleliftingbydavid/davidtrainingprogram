// ============================================================
// DAVID COACHING — Hướng dẫn theo mục tiêu của chu kỳ (2026-11-03)
// ============================================================
// Thuần: không DOM, không Firebase. Mỗi chu kỳ có thể mang một mục tiêu (tăng cơ, sức mạnh,
// sức mạnh + tăng cơ). Thẻ ở tab Theo dõi của coach đọc mục tiêu và tuần của chu kỳ để nhắc
// cách theo dõi tiến bộ, khi nào kiểm tra 1RM, và nên làm gì khi khách chững lại.
// Chỉ là lời nhắc cho David: không tự đổi set, tạ hay giáo án.

import { t } from './i18n.js';
export const PHASE_GOALS = Object.freeze([
  Object.freeze({ id: 'muscle', label: t('coach.tang_co') }),
  Object.freeze({ id: 'strength', label: t('progress.suc_manh') }),
  Object.freeze({ id: 'powerbuilding', label: t('coach.suc_manh_tang_co') }),
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
    t('cj.suc_tap_cung_bai_ta_hoac'),
    t('cj.anh_tien_trinh_chup_cung_dieu'),
    t('cj.so_do_vong_tay_nguc_dui'),
  ],
  strength: [
    t('cj.moi_tuan_mot_lan_nang_1'),
    t('cj.set_chinh_them_rep_o_cung'),
  ],
};

const STALL = {
  muscle: {
    when: t('cj.2_3_thang_tap_deu_ma'),
    steps: [
      t('cj.kiem_tra_rir_that_phan_lon'),
      t('cj.kiem_tra_an_ngu_du_dam'),
      t('cj.doi_sang_bai_keo_gian_co'),
      t('cj.them_1_2_set_cho_moi'),
    ],
  },
  strength: {
    when: t('cj.8_12_tuan_ma_rep_nang'),
    steps: [
      t('cj.kiem_tra_an_ngu_truoc_du'),
      t('cj.them_1_2_set_moi_tuan'),
      t('cj.don_them_phan_tap_vao_set'),
      t('cj.them_bien_the_cua_bai_chinh'),
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
      oneRm = { status: 'early', text: `${t('cj.kiem_tra_1rm_vao_tuan_cua', { p0: ONE_RM_WEEKS.from, p1: ONE_RM_WEEKS.to, p2: week === null ? '' : ` ${t('cj.con_tuan', { p0: ONE_RM_WEEKS.from - week })}` })}` };
    } else if (week <= ONE_RM_WEEKS.to) {
      oneRm = { status: 'due', text: `${t('cj.da_toi_tuan_len_lich_kiem', { p0: week })}` };
    } else {
      oneRm = { status: 'late', text: `${t('cj.da_tuan_qua_tuan_nen_kiem', { p0: week, p1: ONE_RM_WEEKS.to })}` };
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
    return t('cj.p_class_small_note_chu_ky');
  }
  const oneRm = guide.oneRm
    ? `<div class="goal-onerm is-${guide.oneRm.status}"><strong>${t('cj.kiem_tra_1rm')}</strong><p>${escapeHtml(guide.oneRm.text)}</p></div>` : '';
  const track = `<p class="goal-sub">${t('cj.theo_doi_tien_bo_bang')}</p><ul class="goal-list">${guide.track.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const stall = guide.stall.map((item) => `<details class="goal-stall${item.active ? ' is-active' : ''}"${item.active ? ' open' : ''}>
      <summary>${t('cj.khi_hoc_vien_chung_lai', { p0: guide.stall.length > 1 ? ` · ${item.part === 'muscle' ? t('cj.tang_co') : t('cj.suc_manh')}` : '' })}<small>${escapeHtml(item.when)}</small></summary>
      <ol class="goal-list">${item.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    </details>`).join('');
  return `<p class="goal-head"><span class="goal-chip">${escapeHtml(guide.label)}</span>${week === null ? t('cj.chu_ky_chua_bat_dau') : `${t('cj.tuan_cua_chu_ky', { p0: week })}`}</p>${oneRm}${track}${stall}
    <p class="small-note" style="margin-top:10px;">${t('cj.chi_la_loi_nhac_khong_co')}</p>`;
}
