import { ANGLES, angleLabel, filterPhotos, normalizeAngle } from './progress-utils.js';
import { daysBetween } from './home-utils.js';
import { loadPerSuffix } from './client-ui.js';
import { siteLabel, groupLabel } from './measurement-sites.js';
import { fmtDate, fmtNumber, t } from './i18n.js';

// The markup behind the Tiến trình page. Pure string builders: everything that
// comes from a student or a coach is escaped, and every number is formatted here.

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

export const shortDay = (iso) => fmtDate(iso);
export const fullDay = (iso) => fmtDate(iso, { year: true });
// Số theo ngôn ngữ đang dùng (VI: 77,8; EN: 77.8), như phần còn lại của trang (2026-11-26).
const num = (value) => fmtNumber(Math.round(value * 10) / 10, { maxFrac: 1 });

function arrow(delta) {
  if (delta > 0) return '↑';
  if (delta < 0) return '↓';
  return '→';
}

// ---------- weight ----------

/** The headline above the chart. A trend is claimed only when weightTrend() says
 *  there are enough weigh-ins in both weeks. */
export function weightHeadlineMarkup(trend) {
  if (!trend.latest) return `<p class="trend-line">${t('pv.noWeight')}</p>`;
  const latest = t('pv.latest', { kg: num(trend.latest.weight), date: shortDay(trend.latest.day) });
  if (!trend.enough) return `<p class="trend-line">${latest} ${t('progress.weigh4')}</p>`;
  const delta = trend.delta;
  return `<p class="trend-line">${t('pv.thisWeek', { avg: num(trend.thisWeek.avg), d: `${arrow(delta)} ${num(Math.abs(delta))}` })} ${latest}</p>`;
}

/** The first thing on the weight tab: how far the weekly average has moved since the
 *  first week on file. No verdict on good or bad: the goal decides that, not this page. */
export function weightSinceStartMarkup(since) {
  if (!since) return '';
  const change = since.delta === 0 ? '±0' : `${since.delta > 0 ? '+' : '−'}${num(Math.abs(since.delta))}`;
  return `<div class="since-start">
    <p class="since-label">${t('pv.sinceLabel', { date: shortDay(since.first.start), n: since.weeks })}</p>
    <p class="since-big">${change}<small> kg</small></p>
    <p class="since-sub">${t('pv.sinceSub', { d1: shortDay(since.first.start), a1: num(since.first.avg), d2: shortDay(since.latest.start), a2: num(since.latest.avg) })}</p>
  </div>`;
}

/** The marks on the weight chart, said in words under it. */
export function weightChartLegendMarkup() {
  const item = (mark, text) => `<span class="lg-item"><i class="${mark}"></i>${text}</span>`;
  return `<p class="chart-legend">${item('lg-line', t('pv.lgLine'))}${item('lg-dot', t('pv.lgDot'))}${item('lg-hollow', t('pv.lgHollow'))}</p>`;
}

/** Weekly averages as a line, each day's weigh-in as a faint dot. A week with too
 *  few weigh-ins is drawn hollow: shown, but not trusted. */
export function weightChartSvg({ weeks, daily }) {
  const w = 600; const h = 210; const padX = 50; const padTop = 22; const padBottom = 34;
  if (weeks.length < 2) {
    return `<svg viewBox="0 0 ${w} 80" role="img" aria-label="${t('pv.notEnough')}"><text x="${w / 2}" y="44" text-anchor="middle" fill="var(--text-500)" font-size="13">${t('pv.need2Weeks')}</text></svg>`;
  }
  const first = weeks[0].start;
  const last = weeks[weeks.length - 1].start;
  const span = Math.max(1, daysBetween(first, last) + 6);
  const x = (iso, offset = 0) => padX + ((daysBetween(first, iso) + offset) / span) * (w - padX * 2);
  const values = [...weeks.map((week) => week.avg), ...daily.map((point) => point.weight)];
  const min = Math.floor(Math.min(...values) * 2) / 2;
  const max = Math.ceil(Math.max(...values) * 2) / 2;
  const range = max - min || 1;
  const y = (value) => h - padBottom - ((value - min) / range) * (h - padTop - padBottom);
  const dots = daily.map((point) => `<circle cx="${x(point.day).toFixed(1)}" cy="${y(point.weight).toFixed(1)}" r="2.5" fill="var(--text-500)" opacity=".35"/>`).join('');
  const points = weeks.map((week) => `${x(week.start, 3).toFixed(1)},${y(week.avg).toFixed(1)}`);
  const marks = weeks.map((week, index) => {
    const [cx, cy] = points[index].split(',');
    return week.enough
      ? `<circle cx="${cx}" cy="${cy}" r="5" fill="var(--accent)"/>`
      : `<circle cx="${cx}" cy="${cy}" r="4.5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${t('pv.chartAria')}">
    <line x1="${padX}" x2="${w - padX}" y1="${y(min).toFixed(1)}" y2="${y(min).toFixed(1)}" stroke="var(--border)"/>
    <line x1="${padX}" x2="${w - padX}" y1="${y(max).toFixed(1)}" y2="${y(max).toFixed(1)}" stroke="var(--border)" stroke-dasharray="3 4"/>
    ${dots}
    <polyline points="${points.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${marks}
    <text x="2" y="${(y(max) + 4).toFixed(1)}" font-size="17" fill="var(--text-500)">${num(max)}</text>
    <text x="2" y="${(y(min) + 4).toFixed(1)}" font-size="17" fill="var(--text-500)">${num(min)}</text>
    <text x="${padX}" y="${h - 9}" font-size="17" fill="var(--text-500)">${shortDay(first)}</text>
    <text x="${w - padX}" y="${h - 9}" font-size="17" text-anchor="end" fill="var(--text-500)">${shortDay(last)}</text>
  </svg>`;
}

// ---------- strength ----------

export function sparklineSvg(values, { width = 120, height = 34 } = {}) {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (width - 8) / (values.length - 1);
  const points = values.map((value, index) => `${(4 + index * step).toFixed(1)},${(height - 5 - ((value - min) / range) * (height - 10)).toFixed(1)}`);
  const [lx, ly] = points[points.length - 1].split(',');
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><polyline points="${points.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${lx}" cy="${ly}" r="3" fill="var(--accent)"/></svg>`;
}

export function strengthMarkup(rows) {
  if (!rows.length) return `<div class="dc-empty"><strong>${t('pv.noStrength')}</strong>${t('pv.noStrengthCopy')}<div class="dc-empty-actions"><a class="dc-btn dc-btn-secondary" href="client.html">${t('history.goTrain')}</a></div></div>`;
  return rows.map((row) => `
    <article class="strength-card">
      <div class="strength-head"><strong>${escapeHtml(row.name)}</strong>${row.isRecord ? `<span class="pr-badge">${t('workout.newRecord')}</span>` : ''}</div>
      <div class="strength-nums"><span>${num(row.first.weight)} → <strong>${num(row.latest.weight)} kg${loadPerSuffix(row.id)}</strong></span>${row.gain > 0 ? `<span class="gain">+${num(row.gain)} kg</span>` : ''}</div>
      <div class="strength-foot"><span class="small-note">${t('pv.strengthFoot', { n: row.sessions, best: num(row.best), per: loadPerSuffix(row.id) })}</span>${sparklineSvg(row.series.map((point) => point.weight))}</div>
    </article>`).join('');
}

// ---------- milestones ----------

export function milestonesMarkup({ earned, next, total = earned.length + next.length }) {
  if (!earned.length) {
    return `<p class="small-note" style="margin:0 0 10px;">${t('pv.noMilestones')}</p>${goalsMarkup(next)}`;
  }
  // The earned ones are many and long; the count and what is next matter most, so the
  // badges themselves sit one tap away.
  const badges = `<details class="ms-earned"><summary>${t('pv.seeEarned', { n: earned.length })}</summary><div class="badge-row">${earned.map((item) => `<span class="badge-chip">✓ ${escapeHtml(item.label)}</span>`).join('')}</div></details>`;
  return `<p class="ms-count">${t('pv.earnedOf', { n: earned.length, total })}</p>${goalsMarkup(next)}${badges}`;
}

function goalsMarkup(next) {
  return next.map((item) => {
    const percent = Math.min(100, Math.round((item.value / item.target) * 100));
    return `<div class="next-goal"><div class="next-goal-head"><span>${escapeHtml(item.label)}</span><span class="small-note">${t('pv.remaining', { n: item.remaining })}</span></div><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><i style="width:${percent}%"></i></div></div>`;
  }).join('');
}

// ---------- photos ----------

export function angleFilterMarkup(photos, active = 'all') {
  const chip = (id, label, count) => `<button type="button" class="angle-chip${id === active ? ' active' : ''}" data-angle-filter="${id}" aria-pressed="${id === active}">${escapeHtml(label)} <span>${count}</span></button>`;
  const none = filterPhotos(photos, 'none').length;
  return [
    chip('all', t('pv.all'), photos.length),
    ...ANGLES.map((angle) => chip(angle.id, angle.label, filterPhotos(photos, angle.id).length)),
    ...(none ? [chip('none', t('progress.chua_phan_loai'), none)] : []),
  ].join('');
}

export function angleBadgeMarkup(photo) {
  const angle = normalizeAngle(photo.angle);
  return `<span class="photo-angle${angle ? '' : ' none'}">${escapeHtml(angleLabel(angle))}</span>`;
}

export function beforeAfterMarkup(pairs) {
  if (!pairs.length) return '';
  const rows = pairs.map((pair) => `
    <div class="ba-row">
      <h4>${escapeHtml(angleLabel(pair.angle))}</h4>
      <div class="ba-pair">
        <figure><img src="${escapeHtml(pair.before.downloadURL)}" loading="lazy" alt="${escapeHtml(t('pv.firstAlt', { angle: angleLabel(pair.angle) }))}"><figcaption>${t('pv.firstDay')}<br>${fullDay(pair.beforeDay)}</figcaption></figure>
        <figure><img src="${escapeHtml(pair.after.downloadURL)}" loading="lazy" alt="${escapeHtml(t('pv.latestAlt', { angle: angleLabel(pair.angle) }))}"><figcaption>${t('pv.after', { n: pair.days })}<br>${fullDay(pair.afterDay)}</figcaption></figure>
      </div>
    </div>`).join('');
  return `<div class="ba-card"><strong>${t('pv.beforeAfter')}</strong><p class="small-note" style="margin:4px 0 0;">${t('pv.beforeAfterCopy')}</p>${rows}</div>`;
}

// ---------- body measurements ----------

export function measurementsMarkup(overview) {
  if (!overview.length) return `<p class="small-note">${t('pv.noMeasure')}</p>`;
  const groups = overview.map(({ group, rows }) => {
    const lines = rows.map(({ site, trend }) => {
      const change = trend.delta === null
        ? '<span></span>'
        : `<span class="gain">${arrow(trend.delta)} ${num(Math.abs(trend.delta))} cm<small>${t('pv.since', { date: shortDay(trend.first.day) })}</small></span>`;
      const spark = trend.count > 1 ? sparklineSvg(trend.series.map((point) => point.value), { width: 90, height: 26 }) : '<span></span>';
      return `<div class="measure-row"><div class="m-main"><span class="m-label">${escapeHtml(siteLabel(site))}</span><small>${shortDay(trend.latest.day)}</small></div><strong>${num(trend.latest.value)} cm</strong>${change}${spark}</div>`;
    }).join('');
    return `<div class="measure-group"><h4>${escapeHtml(groupLabel(group))}</h4>${lines}</div>`;
  }).join('');
  return `${groups}<p class="small-note" style="margin-top:10px;">${t('pv.arrowNote')}</p>`;
}
