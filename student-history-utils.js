const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function timestampMs(value) {
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') return Date.parse(value) || 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function analyticsWindowStart(activePhase, { now = Date.now(), weeks = 12 } = {}) {
  const trendStart = Number(now) - Math.max(1, Number(weeks) || 12) * WEEK_MS;
  const phaseStart = timestampMs(activePhase?.lastActivatedAt || activePhase?.activatedAt || activePhase?.plannedStartDate);
  return new Date(phaseStart > 0 ? Math.min(trendStart, phaseStart) : trendStart);
}

export function mergeSessionPages(...pages) {
  const merged = new Map();
  pages.flat().forEach((item) => {
    if (!item?.id) return;
    merged.set(item.id, { ...(merged.get(item.id) || {}), ...item });
  });
  return [...merged.values()].sort((a, b) => timestampMs(b.loggedAt || b.performedAt) - timestampMs(a.loggedAt || a.performedAt));
}
