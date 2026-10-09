import { habitOverview } from './habit-utils.js';
import { studentHintMap } from './student-name-utils.js';

// The coach dashboard's habit overview. Collapsed and empty until the coach opens
// it, like the review dashboard's groups: it costs one plan read and a handful of
// log reads per student, which is not worth paying on every visit to the page.

const LOAD_CONCURRENCY = 4;
// Streaks are read from this many days of ticks, so a longer one shows as "30+".
const LOG_DAYS = 30;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function percent(week) {
  return week.rate === null ? 'chưa có' : `${week.done}/${week.possible}`;
}

function rowMarkup(row) {
  const flag = row.summary.needsAttention ? '<span class="habit-row-flag">Cần hỏi thăm</span>' : '';
  const habits = row.summary.habits.map((habit) => `
    <li class="${habit.needsAttention ? 'is-missed' : ''}">
      <span class="habit-row-name">${escapeHtml(habit.name)}</span>
      <span class="habit-row-stats">Chuỗi ${habit.streak >= LOG_DAYS ? `${LOG_DAYS}+` : habit.streak} ngày · 7 ngày ${percent(habit.week)}${habit.needsAttention ? ` · bỏ lỡ ${habit.missedInARow} ngày liền` : ''}</span>
    </li>`).join('');
  return `
  <article class="habit-row${row.summary.needsAttention ? ' needs-attention' : ''}">
    <div class="habit-row-head"><strong>${escapeHtml(row.name)}</strong>${row.hint ? `<small class="student-hint">${escapeHtml(row.hint)}</small>` : ''}${flag}
      <a class="btn btn-outline" href="habits.html?student=${encodeURIComponent(row.uid)}">Xem</a></div>
    <ul class="habit-row-list">${habits}</ul>
  </article>`;
}

function nameList(items) {
  return items.map((item) => escapeHtml(item.name)).join(', ');
}

/** The open section's body, from the result of habitOverview(). Exported so the
 *  escaping and the empty/failed cases can be checked without a DOM. */
export function habitOverviewMarkup(overview) {
  const parts = [];
  if (overview.rows.length) parts.push(overview.rows.map(rowMarkup).join(''));
  else parts.push('<p class="habit-overview-note">Chưa có học viên nào thiết lập thói quen.</p>');
  if (overview.withoutPlan.length) parts.push(`<p class="habit-overview-note">Chưa thiết lập (${overview.withoutPlan.length}): ${nameList(overview.withoutPlan)}.</p>`);
  if (overview.failed.length) parts.push(`<p class="habit-overview-note is-error">Chưa tải được (${overview.failed.length}): ${nameList(overview.failed)}.</p>`);
  return parts.join('');
}

export function createHabitOverviewController({ root, loadStudentHabits }) {
  let students = [];
  let state = 'idle';
  let overview = null;
  let request = 0;

  root.innerHTML = `
    <details class="habit-overview-details">
      <summary><span class="eyebrow">Thói quen</span><strong>Thói quen của học viên</strong><span class="habit-overview-count">Mở để xem</span></summary>
      <div class="habit-overview-body"></div>
    </details>`;
  const details = root.querySelector('details');
  const count = root.querySelector('.habit-overview-count');
  const body = root.querySelector('.habit-overview-body');

  function render() {
    if (state === 'loading') {
      count.textContent = 'Đang tải…';
      body.innerHTML = '<p class="habit-overview-note">Đang tải thói quen của học viên…</p>';
    } else if (state === 'error') {
      count.textContent = 'Chưa tải được';
      body.innerHTML = '<p class="habit-overview-note is-error">Chưa tải được thói quen lúc này.</p><button type="button" class="btn btn-outline" data-reload>Thử lại</button>';
    } else if (state === 'ready') {
      count.textContent = overview.attention ? `${overview.attention} cần hỏi thăm` : `${overview.rows.length} học viên đang theo dõi`;
      count.classList.toggle('has-attention', overview.attention > 0);
      body.innerHTML = `${habitOverviewMarkup(overview)}<button type="button" class="btn btn-outline habit-overview-reload" data-reload>Tải lại</button>`;
    } else {
      count.textContent = 'Mở để xem';
      count.classList.remove('has-attention');
      body.innerHTML = '';
    }
  }

  async function readStudent(student) {
    try {
      const { plan, logs } = await loadStudentHabits(student.id, { days: LOG_DAYS });
      return { student, plan, logs };
    } catch (error) {
      console.error('habit overview: could not read', student.id, error);
      return { student, failed: true };
    }
  }

  async function load() {
    const current = ++request;
    state = 'loading';
    render();
    try {
      const queue = [...students];
      const entries = [];
      const workers = Array.from({ length: Math.min(LOAD_CONCURRENCY, queue.length) }, async () => {
        while (queue.length) entries.push(await readStudent(queue.shift()));
      });
      await Promise.all(workers);
      if (current !== request) return;
      overview = habitOverview(entries);
      const hints = studentHintMap(students);
      overview.rows.forEach((row) => { row.hint = hints.get(row.uid) || ''; });
      state = 'ready';
    } catch (error) {
      if (current !== request) return;
      console.error('habit overview failed:', error);
      state = 'error';
    }
    render();
  }

  details.addEventListener('toggle', () => {
    if (details.open && (state === 'idle' || state === 'error')) void load();
  });
  body.addEventListener('click', (event) => {
    if (event.target.closest('[data-reload]')) void load();
  });
  render();

  return {
    /** The student list is reloaded after many unrelated coach actions. The habit
     *  data is only discarded when who the coach has actually changed. */
    setStudents(next) {
      const before = students.map((student) => student.id).sort().join('|');
      students = [...next];
      if (students.map((student) => student.id).sort().join('|') === before) return;
      request++;
      state = 'idle';
      overview = null;
      render();
      if (details.open) void load();
    },
  };
}
