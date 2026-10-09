import { LATE_AFTER_DAYS, studentSignal } from './student-signal-utils.js';
import { dayOf, daysBetween } from './home-utils.js';
import { todayIso } from './nutrition-log-utils.js';

// What the coach's "Hôm nay" block says, from data the dashboard already holds: each student's
// summary and the open urgent alerts. Only figures that are complete are used. Counts of
// routine alerts are left out on purpose, since only the pages loaded so far are known.
// Pure: no DOM, no Firebase.

const byName = (a, b) => String(a.displayName).localeCompare(String(b.displayName), 'vi');

export function todayOverview({ students = [], urgentCounts = new Map(), now = new Date() } = {}) {
  const today = todayIso(now);
  const trainedToday = [];
  const late = [];
  const notStarted = [];
  let unknown = 0;
  for (const student of students) {
    const signal = studentSignal(student.activity, now);
    if (!signal) { unknown++; continue; }
    if (signal.level === 'none') {
      // Someone who joined this week has not been slow, only new.
      const joined = dayOf(student.createdAt);
      if (joined && daysBetween(joined, today) >= LATE_AFTER_DAYS) notStarted.push({ student, sinceJoined: daysBetween(joined, today) });
      continue;
    }
    if (signal.daysSince === 0) trainedToday.push(student);
    if (signal.level === 'late') late.push({ student, daysSince: signal.daysSince });
  }
  trainedToday.sort(byName);
  late.sort((a, b) => b.daysSince - a.daysSince || byName(a.student, b.student));
  notStarted.sort((a, b) => b.sinceJoined - a.sinceJoined || byName(a.student, b.student));
  const counts = [...urgentCounts.values()].filter((count) => count > 0);
  return {
    total: students.length,
    trainedToday,
    late,
    notStarted,
    needAMessage: late.length + notStarted.length,
    urgentTotal: counts.reduce((sum, count) => sum + count, 0),
    urgentStudents: counts.length,
    // Students whose summary has not been written yet: the block says so instead of guessing.
    pending: unknown,
  };
}
