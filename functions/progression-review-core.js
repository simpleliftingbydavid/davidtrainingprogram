// ============================================================
// DAVID COACHING — Đánh giá progression theo từng bài
// ============================================================
// Thuần: không DOM, không Firebase. Một file cho cả trang coach (<script src>, globalThis.
// ProgressionReview) và Cloud Functions (require). functions/progression-review-core.js là bản
// sao y hệt, có test so sánh hai file.
//
// David chốt 2026-11-12:
// - Thước đo: 1RM ước tính (e1RM) theo công thức Epley (B. Epley, "Poundage Chart", Boyd Epley
//   Workout, 1985): tạ × (1 + rep / 30), cộng RIR vào rep khi set có RIR (rep còn làm được), để
//   so được mọi kiểu tăng tiến (tăng tạ, tăng rep, tăng set, Plus Set). Là ước tính để so xu
//   hướng, không phải 1RM thật.
// - "Chững": 3 lần tập liên tiếp gần nhất không vượt mức cao nhất trước đó.
// - "Giảm": trung bình 2 lần gần nhất thấp hơn mức cao nhất trước đó từ 5%.
// - Chỉ gợi ý cho David; không đổi giáo án, Training Max hay state.
(function attachProgressionReview(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ProgressionReview = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const STALL_EXPOSURES = 3;
  const DECLINE_PCT = 5;
  const MIN_EXPOSURES = 3;
  const STATUS = Object.freeze({ PROGRESS: 'progress', STALL: 'stall', DECLINE: 'decline', INSUFFICIENT: 'insufficient' });
  const STATUS_LABEL = Object.freeze({ progress: 'Tiến bộ', stall: 'Chững', decline: 'Giảm', insufficient: 'Chưa đủ dữ liệu' });
  const VN_OFFSET_MS = 7 * 3600 * 1000;

  function timestampMs(value) {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    const ms = value instanceof Date ? value.getTime() : Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
  }
  const vnDay = (ms) => new Date(ms + VN_OFFSET_MS).toISOString().slice(0, 10);
  const shortDay = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const round1 = (value) => Math.round(value * 10) / 10;
  const num = (value) => String(round1(value)).replace('.', ',');

  function rirOf(set) {
    if (set?.rir === '' || set?.rir === null || set?.rir === undefined) return 0;
    const value = Number(set.rir);
    return Number.isFinite(value) && value >= 0 && value <= 5 ? value : 0;
  }

  /** e1RM của một set, hoặc null khi set không có tạ hoặc không có rep. */
  function setE1rm(set) {
    const weight = Number(set?.weight);
    const reps = Number(set?.reps);
    if (!(weight > 0) || !(reps > 0)) return null;
    return weight * (1 + (reps + rirOf(set)) / 30);
  }

  const isSkipped = (log) => log?.outcome === 'skipped' || log?.status === 'skipped';
  const performedId = (log) => String(log?.substitutedExerciseId || log?.exerciseId || '').trim();

  /**
   * Mỗi bài một chuỗi lần tập, cũ trước. Bài thay thế tính theo bài đã tập. Lần tập có tạ đo bằng
   * e1RM cao nhất; bài chỉ thân người đo bằng tổng rep.
   * @returns {Map<string, {kind:'e1rm'|'reps', points:{sessionId, ms, day, value, disrupted}[]}>}
   */
  function exerciseSeries(sessions = []) {
    const byId = new Map();
    [...sessions]
      .map((session) => ({ session, ms: timestampMs(session?.performedAt || session?.loggedAt) }))
      .filter((item) => item.ms > 0)
      .sort((a, b) => a.ms - b.ms)
      .forEach(({ session, ms }) => {
        (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []).forEach((log) => {
          const id = performedId(log);
          if (!id || isSkipped(log)) return;
          const sets = Array.isArray(log.actualSets) ? log.actualSets : [];
          const e1rms = sets.map(setE1rm).filter((value) => value !== null);
          const reps = sets.reduce((sum, set) => sum + (Number(set?.reps) > 0 ? Number(set.reps) : 0), 0);
          const disrupted = Boolean(session.completionContext?.endedEarly)
            || (Number(log.adjustedSetCount) > 0 && Number(log.plannedSetCount) > 0 && Number(log.adjustedSetCount) < Number(log.plannedSetCount));
          const entry = byId.get(id) || { e1rm: [], reps: [] };
          const base = { sessionId: session.id || '', ms, day: vnDay(ms), disrupted };
          if (e1rms.length) entry.e1rm.push({ ...base, value: Math.max(...e1rms) });
          else if (reps > 0) entry.reps.push({ ...base, value: reps });
          byId.set(id, entry);
        });
      });
    const series = new Map();
    byId.forEach((entry, id) => {
      // Một lần có tạ là đủ để đo bằng e1RM; các lần không tạ khi đó bị bỏ qua.
      if (entry.e1rm.length) series.set(id, { kind: 'e1rm', points: entry.e1rm });
      else if (entry.reps.length) series.set(id, { kind: 'reps', points: entry.reps });
    });
    return series;
  }

  const maxPoint = (points) => points.reduce((best, point) => (!best || point.value > best.value ? point : best), null);

  /** Trạng thái của một chuỗi lần tập (cũ trước). */
  function statusOf(points, kind = 'e1rm') {
    const n = points.length;
    if (n < MIN_EXPOSURES) return { status: STATUS.INSUFFICIENT, reason: 'few' };
    const values = points.map((point) => point.value);
    if (kind === 'e1rm') {
      const bestBefore = maxPoint(points.slice(0, n - 2));
      const lastTwo = (values[n - 1] + values[n - 2]) / 2;
      if (lastTwo <= bestBefore.value * (1 - DECLINE_PCT / 100)) return { status: STATUS.DECLINE, best: bestBefore, lastTwo };
    }
    const windowStart = n - STALL_EXPOSURES;
    if (windowStart >= 1) {
      const bestBefore = maxPoint(points.slice(0, windowStart));
      if (values.slice(windowStart).every((value) => round1(value) <= round1(bestBefore.value))) return { status: STATUS.STALL, best: bestBefore };
      return { status: STATUS.PROGRESS };
    }
    // Đúng 3 lần: chưa có 3 lần sau một mức cao nhất để kết luận chững. Có mức mới thì là tiến bộ,
    // chưa có thì cần thêm một lần.
    return values.slice(1).some((value) => round1(value) > round1(values[0])) ? { status: STATUS.PROGRESS } : { status: STATUS.INSUFFICIENT, reason: 'flat' };
  }

  function evidenceText(review, points, kind) {
    const unit = kind === 'e1rm' ? ' kg' : ' rep';
    const last3 = points.slice(-STALL_EXPOSURES).map((point) => point.value);
    if (review.status === STATUS.INSUFFICIENT) {
      return review.reason === 'flat'
        ? `3 lần tập chưa vượt lần đầu (${num(points[0].value)}${unit}); cần thêm 1 lần để kết luận.`
        : `Mới có ${points.length} lần tập; cần từ ${MIN_EXPOSURES} lần.`;
    }
    if (review.status === STATUS.DECLINE) {
      const drop = (1 - review.lastTwo / review.best.value) * 100;
      return `TB 2 lần gần nhất ${num(review.lastTwo)}${unit}, thấp hơn mức cao nhất ${num(review.best.value)}${unit} (${shortDay(review.best.day)}) ${num(drop)}%.`;
    }
    if (review.status === STATUS.STALL) {
      const low = Math.min(...last3);
      const high = Math.max(...last3);
      const range = round1(low) === round1(high) ? `${num(low)}${unit}` : `${num(low)}–${num(high)}${unit}`;
      return `3 lần gần nhất ${range}, chưa vượt mức cao nhất ${num(review.best.value)}${unit} (${shortDay(review.best.day)}).`;
    }
    const best = maxPoint(points);
    return `Từ ${num(points[0].value)} lên ${num(points.at(-1).value)}${unit} · cao nhất ${num(best.value)}${unit} (${shortDay(best.day)}).`;
  }

  function suggestionText(status, kind, disruptedCount) {
    const context = disruptedCount ? ` Gần đây có ${disruptedCount} lần giảm set hoặc kết thúc sớm ở bài này.` : '';
    if (status === STATUS.STALL) {
      return (kind === 'reps'
        ? 'Xem phục hồi; cân nhắc tăng độ khó (biến thể khó hơn, thêm tạ) hoặc thêm 1 set.'
        : 'Xem phục hồi và RIR; cân nhắc thêm 1 set, đổi biến thể bài, hoặc đổi kiểu tăng tiến.') + context;
    }
    if (status === STATUS.DECLINE) return `Xem đau, ngủ, dinh dưỡng và check-in phục hồi; cân nhắc giảm tạ hoặc deload.${context}`;
    return '';
  }

  /** Đánh giá một bài từ chuỗi lần tập của nó. */
  function reviewSeries(exerciseId, series) {
    const points = series?.points || [];
    const kind = series?.kind || 'e1rm';
    const review = statusOf(points, kind);
    const recent = points.slice(-STALL_EXPOSURES);
    const disruptedCount = recent.filter((point) => point.disrupted).length;
    const first = points[0] || null;
    const latest = points.at(-1) || null;
    const best = maxPoint(points);
    return {
      exerciseId,
      kind,
      status: review.status,
      label: STATUS_LABEL[review.status],
      exposures: points.length,
      first: first ? round1(first.value) : null,
      latest: latest ? round1(latest.value) : null,
      best: best ? round1(best.value) : null,
      bestDay: best ? best.day : null,
      changePct: first && latest && first.value > 0 ? round1((latest.value / first.value - 1) * 100) : null,
      series: points.map((point) => round1(point.value)),
      lastSessionId: latest ? latest.sessionId : '',
      evidence: points.length ? evidenceText(review, points, kind) : 'Chưa có lần tập nào được ghi nhận.',
      suggestion: suggestionText(review.status, kind, disruptedCount),
      disruptedCount,
    };
  }

  /** Mọi bài (hoặc chỉ các bài trong `exerciseIds`), theo thứ tự `exerciseIds` nếu có. */
  function buildProgressionReview({ sessions = [], exerciseIds = null } = {}) {
    const all = exerciseSeries(sessions);
    const ids = Array.isArray(exerciseIds) ? [...new Set(exerciseIds.map((id) => String(id || '').trim()).filter(Boolean))] : [...all.keys()];
    return ids.map((id) => reviewSeries(id, all.get(id)));
  }

  function summaryCounts(rows = []) {
    return Object.fromEntries(Object.values(STATUS).map((status) => [status, rows.filter((row) => row.status === status).length]));
  }

  /**
   * Bài vừa chuyển sang Chững hoặc Giảm nhờ buổi `sessionId` (so với trước buổi đó). Dùng cho cảnh
   * báo: một đợt chững chỉ báo một lần; chững lại lần sau thì báo lại.
   */
  function newProgressionSignals({ sessionId, sessions = [] } = {}) {
    const current = sessions.find((item) => item?.id === sessionId);
    if (!current) return [];
    const ids = (current.exerciseLogs || []).filter((log) => !isSkipped(log)).map(performedId).filter(Boolean);
    if (!ids.length) return [];
    const after = buildProgressionReview({ sessions, exerciseIds: ids });
    const before = new Map(buildProgressionReview({ sessions: sessions.filter((item) => item?.id !== sessionId), exerciseIds: ids }).map((row) => [row.exerciseId, row]));
    return after.filter((row) => (row.status === STATUS.STALL || row.status === STATUS.DECLINE)
      && row.lastSessionId === sessionId
      && before.get(row.exerciseId)?.status !== row.status);
  }

  return Object.freeze({
    STALL_EXPOSURES, DECLINE_PCT, MIN_EXPOSURES, STATUS, STATUS_LABEL,
    timestampMs, setE1rm, exerciseSeries, statusOf, reviewSeries, buildProgressionReview, summaryCounts, newProgressionSignals,
  });
}));
