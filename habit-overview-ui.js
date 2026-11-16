import { t } from './i18n.js';
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
  return week.rate === null ? t('cj.chua_co') : `${week.done}/${week.possible}`;
}

function rowMarkup(row) {
  const flag = row.summary.needsAttention ? t('cj.span_class_habit_row_flag_can') : '';
  const habits = row.summary.habits.map((habit) => `
    <li class="${habit.needsAttention ? 'is-missed' : ''}">
      <span class="habit-row-name">${escapeHtml(habit.name)}</span>
      <span class="habit-row-stats">${t('cj.chuoi_ngay_7_ngay', { p0: habit.streak >= LOG_DAYS ? `${LOG_DAYS}+` : habit.streak, p1: percent(habit.week), p2: habit.needsAttention ? ` ${t('cj.bo_lo_ngay_lien', { p0: habit.missedInARow })}` : '' })}</span>
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
  else parts.push(t('cj.p_class_habit_overview_note_chua'));
  if (overview.withoutPlan.length) parts.push(`<p class="habit-overview-note">${t('cj.chua_thiet_lap', { p0: overview.withoutPlan.length, p1: nameList(overview.withoutPlan) })}</p>`);
  if (overview.failed.length) parts.push(`<p class="habit-overview-note is-error">${t('cj.chua_tai_duoc', { p0: overview.failed.length, p1: nameList(overview.failed) })}</p>`);
  return parts.join('');
}

export function createHabitOverviewController({ root, loadStudentHabits }) {
  let students = [];
  let state = 'idle';
  let overview = null;
  let request = 0;

  root.innerHTML = `
    <details class="habit-overview-details">
      <summary><span class="eyebrow">${t('habits.thoi_quen')}</span><strong>${t('cj.thoi_quen_cua_hoc_vien')}</strong><span class="habit-overview-count">${t('cj.mo_de_xem')}</span></summary>
      <div class="habit-overview-body"></div>
    </details>`;
  const details = root.querySelector('details');
  const count = root.querySelector('.habit-overview-count');
  const body = root.querySelector('.habit-overview-body');

  function render() {
    if (state === 'loading') {
      count.textContent = t('nu.loading');
      body.innerHTML = t('cj.p_class_habit_overview_note_dang');
    } else if (state === 'error') {
      count.textContent = t('cj.chua_tai_duoc_2');
      body.innerHTML = t('cj.p_class_habit_overview_note_is');
    } else if (state === 'ready') {
      count.textContent = overview.attention ? `${t('cj.can_hoi_tham', { p0: overview.attention })}` : `${t('cj.hoc_vien_dang_theo_doi', { p0: overview.rows.length })}`;
      count.classList.toggle('has-attention', overview.attention > 0);
      body.innerHTML = `${habitOverviewMarkup(overview)}<button type="button" class="btn btn-outline habit-overview-reload" data-reload>${t('cj.tai_lai')}</button>`;
    } else {
      count.textContent = t('cj.mo_de_xem');
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
