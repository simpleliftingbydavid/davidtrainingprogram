import { t, locale } from './i18n.js';
import { todayOverview } from './today-overview-utils.js';
import { studentHintMap } from './student-name-utils.js';

// The "Hôm nay" block at the top of the coach dashboard: four figures and the list of
// students worth a message today. Draws only; the data comes from the page.

const MAX_LISTED = 10;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function studentButton(student, detail, hints) {
  const hint = hints.get(student.id);
  return `<button type="button" class="today-student" data-open-student="${escapeHtml(student.id)}"><strong>${escapeHtml(student.displayName)}</strong>${hint ? `<small class="student-hint">${escapeHtml(hint)}</small>` : ''}<span>${escapeHtml(detail)}</span></button>`;
}

/** The block's markup. Everything typed by a student or a coach is escaped. */
export function todayOverviewMarkup(overview, { hints = new Map(), dateLabel = '' } = {}) {
  const tile = (value, label, tone, attributes = '') => `<button type="button" class="today-tile ${tone}" ${attributes}><strong>${value}</strong><span>${label}</span></button>`;
  const tiles = [
    tile(`${overview.trainedToday.length}<small>/${overview.total}</small>`, t('cj.da_tap_hom_nay'), 'ok', 'data-jump="trained"'),
    tile(overview.needAMessage, t('cj.nen_nhan_tin_hom_nay'), overview.needAMessage ? 'late' : 'ok', 'data-jump="messages"'),
  ].join('');

  const listed = [
    ...overview.late.map((item) => ({ student: item.student, detail: `${t('cj.ngay_chua_tap', { p0: item.daysSince })}` })),
    ...overview.notStarted.map((item) => ({ student: item.student, detail: `${t('cj.chua_co_buoi_nao_vao_ngay', { p0: item.sinceJoined })}` })),
  ];
  const shown = listed.slice(0, MAX_LISTED).map((item) => studentButton(item.student, item.detail, hints)).join('');
  const more = listed.length > MAX_LISTED ? `<p class="today-more">${t('cj.va_hoc_vien_nua_trong_danh', { p0: listed.length - MAX_LISTED })}</p>` : '';
  const messages = listed.length
    ? `<div class="today-block" id="today-messages"><h3>${t('cj.nen_nhan_tin_hom_nay')}</h3><div class="today-students">${shown}</div>${more}</div>`
    : t('cj.p_class_today_clear_khong_ai');

  const trained = overview.trainedToday.length
    ? `<details class="today-trained" id="today-trained"><summary>${t('cj.da_tap_hom_nay_2', { p0: overview.trainedToday.length })}</summary><div class="today-students">${overview.trainedToday.map((student) => studentButton(student, t('cj.da_ghi_buoi_tap'), hints)).join('')}</div></details>`
    : '';
  const pending = overview.pending
    ? `<p class="today-more">${t('cj.hoc_vien_dang_duoc_cap_nhat', { p0: overview.pending })}</p>` : '';

  return `<div class="today-head"><div><span class="eyebrow">${escapeHtml(dateLabel || t('home.today'))}</span><h2>${t('home.today')}</h2></div></div>
    <div class="today-tiles">${tiles}</div>${messages}${trained}${pending}`;
}

export function createTodayOverviewController({ root, onOpenStudent }) {
  let last = null;

  root.addEventListener('click', (event) => {
    const student = event.target.closest('[data-open-student]');
    if (student) { onOpenStudent(student.dataset.openStudent); return; }
    const jump = event.target.closest('[data-jump]');
    if (!jump) return;
    const target = root.querySelector(jump.dataset.jump === 'trained' ? '#today-trained' : '#today-messages');
    if (target) {
      if (target.tagName === 'DETAILS') target.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  return {
    /** students: the coach's list; urgentCounts: Map of student id → open urgent alerts. */
    update({ students, urgentCounts }) {
      last = { students, urgentCounts };
      const now = new Date();
      const overview = todayOverview({ students, urgentCounts, now });
      const dateLabel = now.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
      root.innerHTML = todayOverviewMarkup(overview, { hints: studentHintMap(students), dateLabel });
      root.hidden = !students.length;
    },
    get current() { return last; },
  };
}
