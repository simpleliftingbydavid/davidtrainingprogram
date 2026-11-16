// The workout history, read at a glance (David, 2026-11-02): each lift as a small table of its
// sets, plan beside what was done, and each closed session with its records, progress and
// volume on the title line. Pure string builders: no DOM, no Firebase.
import { SCHEME } from './progression-engine.js';
import { kg, loadPerLabel } from './client-ui.js';
import { fmtNumber, t } from './i18n.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

/** "60 × 8", or "8 rep" for a set with no load. */
function setText(weight, reps) {
  if (reps == null) return '—';
  return weight > 0 ? `${kg(weight)} × ${reps}` : t('workout.result.reps', { n: reps });
}

/** What each set was meant to be: the pyramid's own line per set, otherwise the same load and
 *  reps for every set. A fixed-total scheme has no per-set target, only the total. */
function plannedSets(log) {
  const planned = log.planned || null;
  if (!planned || log.scheme === SCHEME.FIXED_TOTAL_REPS) return [];
  if (Array.isArray(planned.setPrescriptions) && planned.setPrescriptions.length) {
    return planned.setPrescriptions.map((set) => ({ weight: number(set.weight), reps: number(set.reps) }));
  }
  const count = Math.max(0, Number(log.adjustedSetCount) || Number(planned.sets) || 0);
  return Array.from({ length: count }, () => ({ weight: number(planned.weight), reps: number(planned.reps) }));
}

/** One row per set: the plan, what was done, and whether the reps fell short of the plan. */
export function setRows(log = {}) {
  const plan = plannedSets(log);
  const done = Array.isArray(log.actualSets) ? log.actualSets : [];
  return Array.from({ length: Math.max(plan.length, done.length) }, (_, index) => {
    const target = plan[index] || null;
    const set = done[index] || null;
    const reps = set ? number(set.reps) : null;
    return {
      index: index + 1,
      plan: target,
      done: set ? { weight: number(set.weight), reps, rir: set.rir == null || set.rir === '' ? null : number(set.rir) } : null,
      short: Boolean(target && set && target.reps != null && reps != null && reps < target.reps),
    };
  });
}

/** The sets of one lift as a table. Skipped lifts keep their sentence instead. */
export function setTableMarkup(log = {}) {
  const rows = setRows(log);
  if (!rows.length) return '';
  const hasPlan = rows.some((row) => row.plan);
  const hasRir = rows.some((row) => row.done?.rir != null);
  const head = `<tr><th scope="col">${t('hview.set')}</th>${hasPlan ? `<th scope="col">${t('hview.plan')}</th>` : ''}<th scope="col">${t('hview.done')}</th>${hasRir ? '<th scope="col" class="rir-h">RIR</th>' : ''}</tr>`;
  const body = rows.map((row) => `<tr${row.short ? ' class="short"' : ''}>
    <td class="n">${row.index}</td>
    ${hasPlan ? `<td class="plan">${row.plan ? escapeHtml(setText(row.plan.weight, row.plan.reps)) : '—'}</td>` : ''}
    <td class="done">${row.done ? escapeHtml(setText(row.done.weight, row.done.reps)) : `<span class="miss">${t('hview.missed')}</span>`}${row.short ? `<small>${t('hview.short', { n: row.plan.reps - row.done.reps })}</small>` : ''}</td>
    ${hasRir ? `<td class="rir">${row.done?.rir ?? ''}</td>` : ''}
  </tr>`).join('');
  const total = log.scheme === SCHEME.FIXED_TOTAL_REPS && log.planned?.totalRepsTarget
    ? `<p class="set-total">${t('hview.total', { done: rows.reduce((sum, row) => sum + (row.done?.reps || 0), 0), target: log.planned.totalRepsTarget })}</p>`
    : '';
  // Bài tính tạ một bên: số trong bảng là của một bên (David, 2026-11-10).
  const per = loadPerLabel(log.substitutedExerciseId || log.exerciseId);
  const perNote = per && rows.some((row) => row.plan?.weight > 0 || row.done?.weight > 0) ? `<p class="set-per">${t('hview.per', { per })}</p>` : '';
  return `<table class="set-table">${head}${body}</table>${perNote}${total}`;
}

const isSkipped = (log) => log.outcome === 'skipped' || log.status === 'skipped';

/** What a closed session shows on its title line. Volume is load × reps of every set done. */
export function sessionTotals(session = {}) {
  const logs = (session.exerciseLogs || []).filter((log) => !isSkipped(log));
  const volume = logs.reduce((sum, log) => sum + (log.actualSets || []).reduce((acc, set) => {
    const weight = Number(set?.weight); const reps = Number(set?.reps);
    return acc + (weight > 0 && reps > 0 ? weight * reps : 0);
  }, 0), 0);
  return {
    records: logs.filter((log) => log.isPR).length,
    progressed: logs.filter((log) => log.outcome === 'up').length,
    volume: Math.round(volume),
  };
}

/** "4.320 kg" with a thousands dot, the Vietnamese way. */
export function volumeText(volume) {
  return `${fmtNumber(Math.round(volume), { grouping: true })} kg`;
}

export function sessionChipsMarkup(totals) {
  const chips = [];
  if (totals.records) chips.push(`<span class="sess-chip pr">🏆 ${t('hview.records', { n: totals.records })}</span>`);
  if (totals.progressed) chips.push(`<span class="sess-chip up">↑ ${t('hview.progressed', { n: totals.progressed })}</span>`);
  if (totals.volume) chips.push(`<span class="sess-chip vol">${t('hview.volume', { v: volumeText(totals.volume) })}</span>`);
  return chips.length ? `<span class="sess-chips">${chips.join('')}</span>` : '';
}
