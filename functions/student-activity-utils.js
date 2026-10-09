// What the coach's student list shows about each student's training, kept on the student's
// own document so the list never has to read every student's sessions to draw itself.
//
//   students/{id}.activity = {
//     lastSessionAt,            // Timestamp of the newest session
//     lastDayLabel,             // which day it was
//     recentSessionDays: [...], // one 'YYYY-MM-DD' (Vietnam time) per session, newest first
//     updatedAt,
//   }
//
// It is recomputed from the sessions rather than adjusted, so deleting or editing a session
// can never leave it wrong.

const { FieldValue, Timestamp } = require('firebase-admin/firestore');

const RECENT_SESSIONS = 40;
const RECENT_WINDOW_DAYS = 28;
const DAY_MS = 86400000;

const vnDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
});

function millisOf(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/** 'YYYY-MM-DD' of a moment in Vietnam time, whatever the server's own zone. */
function vietnamDay(ms) {
  return vnDate.format(new Date(ms));
}

/** From a student's sessions (any order): the summary, or null when there are none. */
function buildStudentActivity(sessions, now = Date.now()) {
  const dated = (sessions || [])
    .map((session) => ({ at: millisOf(session.performedAt), dayLabel: String(session.dayLabel || '') }))
    .filter((item) => item.at > 0)
    .sort((a, b) => b.at - a.at);
  if (!dated.length) return null;
  const since = now - RECENT_WINDOW_DAYS * DAY_MS;
  return {
    lastSessionMs: dated[0].at,
    lastDayLabel: dated[0].dayLabel,
    recentSessionDays: dated.filter((item) => item.at >= since).slice(0, RECENT_SESSIONS).map((item) => vietnamDay(item.at)),
  };
}

function isNotFound(error) {
  const code = String(error?.code ?? '').toLowerCase();
  return code === '5' || code === 'not-found';
}

/** Recompute and store one student's summary. A student document that no longer exists is
 *  skipped on purpose: deleting an account deletes its sessions one by one, and each of those
 *  must not bring the student document back. */
async function refreshStudentActivity({ db, studentUid, now = Date.now() }) {
  const snap = await db.collection(`students/${studentUid}/sessions`).orderBy('performedAt', 'desc').limit(RECENT_SESSIONS).get();
  const summary = buildStudentActivity(snap.docs.map((item) => item.data()), now);
  const activity = summary
    ? {
      lastSessionAt: Timestamp.fromMillis(summary.lastSessionMs),
      lastDayLabel: summary.lastDayLabel,
      recentSessionDays: summary.recentSessionDays,
      updatedAt: FieldValue.serverTimestamp(),
    }
    : { lastSessionAt: null, lastDayLabel: '', recentSessionDays: [], updatedAt: FieldValue.serverTimestamp() };
  try {
    await db.doc(`students/${studentUid}`).update({ activity });
    return { updated: true };
  } catch (error) {
    if (isNotFound(error)) return { updated: false };
    throw error;
  }
}

module.exports = {
  RECENT_SESSIONS, RECENT_WINDOW_DAYS, buildStudentActivity, refreshStudentActivity, vietnamDay,
};
