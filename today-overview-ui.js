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
    tile(`${overview.trainedToday.length}<small>/${overview.total}</small>`, 'Đã tập hôm nay', 'ok', 'data-jump="trained"'),
    tile(overview.needAMessage, 'Nên nhắn tin hôm nay', overview.needAMessage ? 'late' : 'ok', 'data-jump="messages"'),
    tile(overview.urgentTotal, overview.urgentStudents ? `Cảnh báo khẩn · ${overview.urgentStudents} học viên` : 'Cảnh báo khẩn', overview.urgentTotal ? 'urgent' : 'ok', 'data-jump="review"'),
  ].join('');

  const listed = [
    ...overview.late.map((item) => ({ student: item.student, detail: `${item.daysSince} ngày chưa tập` })),
    ...overview.notStarted.map((item) => ({ student: item.student, detail: `chưa có buổi nào · vào ${item.sinceJoined} ngày` })),
  ];
  const shown = listed.slice(0, MAX_LISTED).map((item) => studentButton(item.student, item.detail, hints)).join('');
  const more = listed.length > MAX_LISTED ? `<p class="today-more">và ${listed.length - MAX_LISTED} học viên nữa trong danh sách bên dưới.</p>` : '';
  const messages = listed.length
    ? `<div class="today-block" id="today-messages"><h3>Nên nhắn tin hôm nay</h3><div class="today-students">${shown}</div>${more}</div>`
    : '<p class="today-clear">Không ai quá 7 ngày chưa tập. Một ngày nhẹ nhàng cho coaching trực tiếp.</p>';

  const trained = overview.trainedToday.length
    ? `<details class="today-trained" id="today-trained"><summary>Đã tập hôm nay (${overview.trainedToday.length})</summary><div class="today-students">${overview.trainedToday.map((student) => studentButton(student, 'đã ghi buổi tập', hints)).join('')}</div></details>`
    : '';
  const pending = overview.pending
    ? `<p class="today-more">${overview.pending} học viên đang được cập nhật trạng thái tập luyện.</p>` : '';

  return `<div class="today-head"><div><span class="eyebrow">${escapeHtml(dateLabel || 'Hôm nay')}</span><h2>Hôm nay</h2></div></div>
    <div class="today-tiles">${tiles}</div>${messages}${trained}${pending}`;
}

export function createTodayOverviewController({ root, onOpenStudent, onJumpToReview }) {
  let last = null;

  root.addEventListener('click', (event) => {
    const student = event.target.closest('[data-open-student]');
    if (student) { onOpenStudent(student.dataset.openStudent); return; }
    const jump = event.target.closest('[data-jump]');
    if (!jump) return;
    if (jump.dataset.jump === 'review') { onJumpToReview(); return; }
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
      const dateLabel = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
      root.innerHTML = todayOverviewMarkup(overview, { hints: studentHintMap(students), dateLabel });
      root.hidden = !students.length;
    },
    get current() { return last; },
  };
}
