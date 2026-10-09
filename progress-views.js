import { ANGLES, angleLabel, filterPhotos, normalizeAngle } from './progress-utils.js';
import { daysBetween } from './home-utils.js';

// The markup behind the Tiến trình page. Pure string builders: everything that
// comes from a student or a coach is escaped, and every number is formatted here.

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

export const shortDay = (iso) => { const [, month, day] = iso.split('-'); return `${day}/${month}`; };
export const fullDay = (iso) => { const [year, month, day] = iso.split('-'); return `${day}/${month}/${year}`; };
const num = (value) => String(Math.round(value * 10) / 10);

function arrow(delta) {
  if (delta > 0) return '↑';
  if (delta < 0) return '↓';
  return '→';
}

// ---------- weight ----------

/** The headline above the chart. A trend is claimed only when weightTrend() says
 *  there are enough weigh-ins in both weeks. */
export function weightHeadlineMarkup(trend) {
  if (!trend.latest) return '<p class="trend-line">Chưa có số cân nào.</p>';
  const latest = `Cân gần nhất <strong>${num(trend.latest.weight)} kg</strong> (${shortDay(trend.latest.day)}).`;
  if (!trend.enough) return `<p class="trend-line">${latest} Cân đều từ 4 lần mỗi tuần để thấy xu hướng.</p>`;
  const delta = trend.delta;
  return `<p class="trend-line">Trung bình tuần này <strong>${num(trend.thisWeek.avg)} kg</strong> — <strong>${arrow(delta)} ${num(Math.abs(delta))} kg</strong> so với tuần trước. ${latest}</p>`;
}

/** Weekly averages as a line, each day's weigh-in as a faint dot. A week with too
 *  few weigh-ins is drawn hollow: shown, but not trusted. */
export function weightChartSvg({ weeks, daily }) {
  const w = 600; const h = 210; const padX = 50; const padTop = 22; const padBottom = 34;
  if (weeks.length < 2) {
    return `<svg viewBox="0 0 ${w} 80" role="img" aria-label="Chưa đủ dữ liệu"><text x="${w / 2}" y="44" text-anchor="middle" fill="var(--text-500)" font-size="13">Cần số cân của ít nhất 2 tuần để vẽ xu hướng</text></svg>`;
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
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Cân nặng trung bình theo tuần">
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
  if (!rows.length) return '<p class="small-note">Cần ít nhất 2 buổi tập có tạ cho cùng một bài để thấy tiến bộ sức mạnh.</p>';
  return rows.map((row) => `
    <article class="strength-card">
      <div class="strength-head"><strong>${escapeHtml(row.name)}</strong>${row.isRecord ? '<span class="pr-badge">Kỷ lục mới</span>' : ''}</div>
      <div class="strength-nums"><span>${num(row.first.weight)} → <strong>${num(row.latest.weight)} kg</strong></span>${row.gain > 0 ? `<span class="gain">+${num(row.gain)} kg</span>` : ''}</div>
      <div class="strength-foot"><span class="small-note">${row.sessions} buổi · tốt nhất ${num(row.best)} kg</span>${sparklineSvg(row.series.map((point) => point.weight))}</div>
    </article>`).join('');
}

// ---------- milestones ----------

export function milestonesMarkup({ earned, next, total = earned.length + next.length }) {
  if (!earned.length) {
    return `<p class="small-note" style="margin:0 0 10px;">Chưa có mốc nào — buổi tập hay lần chụp ảnh đầu tiên sẽ mở mốc đầu tiên của bạn.</p>${goalsMarkup(next)}`;
  }
  // The earned ones are many and long; the count and what is next matter most, so the
  // badges themselves sit one tap away.
  const badges = `<details class="ms-earned"><summary>Xem các mốc đã đạt (${earned.length})</summary><div class="badge-row">${earned.map((item) => `<span class="badge-chip">✓ ${escapeHtml(item.label)}</span>`).join('')}</div></details>`;
  return `<p class="ms-count"><strong>${earned.length}</strong> / ${total} mốc đã đạt</p>${goalsMarkup(next)}${badges}`;
}

function goalsMarkup(next) {
  return next.map((item) => {
    const percent = Math.min(100, Math.round((item.value / item.target) * 100));
    return `<div class="next-goal"><div class="next-goal-head"><span>${escapeHtml(item.label)}</span><span class="small-note">còn ${item.remaining}</span></div><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><i style="width:${percent}%"></i></div></div>`;
  }).join('');
}

// ---------- photos ----------

export function angleFilterMarkup(photos, active = 'all') {
  const chip = (id, label, count) => `<button type="button" class="angle-chip${id === active ? ' active' : ''}" data-angle-filter="${id}" aria-pressed="${id === active}">${escapeHtml(label)} <span>${count}</span></button>`;
  const none = filterPhotos(photos, 'none').length;
  return [
    chip('all', 'Tất cả', photos.length),
    ...ANGLES.map((angle) => chip(angle.id, angle.label, filterPhotos(photos, angle.id).length)),
    ...(none ? [chip('none', 'Chưa phân loại', none)] : []),
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
        <figure><img src="${escapeHtml(pair.before.downloadURL)}" loading="lazy" alt="${escapeHtml(angleLabel(pair.angle))} ngày đầu"><figcaption>Ngày đầu<br>${fullDay(pair.beforeDay)}</figcaption></figure>
        <figure><img src="${escapeHtml(pair.after.downloadURL)}" loading="lazy" alt="${escapeHtml(angleLabel(pair.angle))} mới nhất"><figcaption>Sau ${pair.days} ngày<br>${fullDay(pair.afterDay)}</figcaption></figure>
      </div>
    </div>`).join('');
  return `<div class="ba-card"><strong>Trước và sau</strong><p class="small-note" style="margin:4px 0 0;">Ảnh đầu tiên và ảnh mới nhất của từng góc.</p>${rows}</div>`;
}

// ---------- waist ----------

export function measurementMarkup(trend) {
  if (!trend.count) return '<p class="small-note">Chưa có số đo nào. Đo vòng eo cùng một chỗ, cùng một giờ mỗi lần.</p>';
  const change = trend.delta === null ? '' : ` <span class="gain">${arrow(trend.delta)} ${num(Math.abs(trend.delta))} cm so với lần đầu</span>`;
  const recent = [...trend.series].reverse().slice(0, 6)
    .map((point) => `<div class="weight-list-row"><span>${shortDay(point.day)}</span><strong>${num(point.value)} cm</strong></div>`).join('');
  return `<p class="trend-line">Vòng eo gần nhất <strong>${num(trend.latest.value)} cm</strong> (${shortDay(trend.latest.day)}).${change}</p>
    ${sparklineSvg(trend.series.map((point) => point.value), { width: 240, height: 44 })}
    <div class="weight-list">${recent}</div>`;
}
