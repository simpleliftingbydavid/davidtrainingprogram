import { dayOf, daysBetween, weekStart } from './home-utils.js';
import { todayIso } from './nutrition-log-utils.js';

// The one-line status the coach's student list shows under each name, drawn from the
// summary the server keeps on the student's document (functions/student-activity-utils.js).
// Pure: no DOM, no Firebase.

/** A week with no session on a student's list for this many days is worth a message. */
export const LATE_AFTER_DAYS = 7;

/** null when the summary has not been computed yet (so the list shows nothing rather than
 *  a wrong "never trained"); otherwise { level, text, week, daysSince }. */
export function studentSignal(activity, now = new Date()) {
  if (!activity || typeof activity !== 'object') return null;
  const lastDay = dayOf(activity.lastSessionAt);
  if (!lastDay) return { level: 'none', text: 'Chưa có buổi tập', week: 0, daysSince: null };
  const today = todayIso(now);
  const daysSince = Math.max(0, daysBetween(lastDay, today));
  const start = weekStart(today);
  const week = (Array.isArray(activity.recentSessionDays) ? activity.recentSessionDays : [])
    .filter((day) => typeof day === 'string' && day >= start && day <= today).length;
  const text = daysSince === 0 ? 'Tập hôm nay' : daysSince === 1 ? 'Tập hôm qua' : `Tập ${daysSince} ngày trước`;
  return { level: daysSince >= LATE_AFTER_DAYS ? 'late' : 'ok', text, week, daysSince };
}
