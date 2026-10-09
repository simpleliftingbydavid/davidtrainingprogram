// Telling apart students whose names are easy to mix up. Pure: no DOM, no Firebase.
//
// "Khánh Linh" and "Nguyễn Khánh Linh" are two people on one coach's list, and the
// review queue puts both at the top. Acting on the wrong one is a real cost. A student the
// coach has given a nickname shows it beside the name everywhere; a name that could be taken
// for another's, and has no nickname yet, shows the part of the email before the @ until the
// coach sets one. Names that are clearly different show nothing extra.
export const NICKNAME_MAX = 24;

export function cleanNickname(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, NICKNAME_MAX);
}

function tokens(name) {
  return String(name ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** Two names are confusable when every word of one is in the other: "Khánh Linh" is
 *  inside "Nguyễn Khánh Linh", and "Linh" is inside both. Sharing only a surname or a
 *  given name ("Phương Linh", "Ngọc Linh") is not enough. */
export function confusableNames(a, b) {
  const first = tokens(a);
  const second = tokens(b);
  if (!first.length || !second.length) return false;
  const inside = (small, large) => small.every((word) => large.includes(word));
  return inside(first, second) || inside(second, first);
}

function emailHint(student) {
  const local = String(student?.email ?? '').split('@')[0].trim();
  return local.length > 24 ? `${local.slice(0, 23)}…` : local;
}

/** Map of student id → hint: the nickname when there is one, else for students who share a
 *  confusable name with someone, the email prefix (the end of the id when two of those
 *  coincide). Students with a clear name and no nickname are left out. */
export function studentHintMap(students = []) {
  const confusable = new Set();
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      if (confusableNames(students[i].displayName, students[j].displayName)) {
        confusable.add(students[i].id);
        confusable.add(students[j].id);
      }
    }
  }
  const hints = new Map();
  const used = new Map();
  for (const student of students) {
    const nickname = cleanNickname(student.nickname);
    if (nickname) { hints.set(student.id, nickname); used.set(nickname, student.id); continue; }
    if (!confusable.has(student.id)) continue;
    let hint = emailHint(student);
    if (!hint || used.has(hint)) hint = `…${String(student.id).slice(-4)}`;
    used.set(hint, student.id);
    hints.set(student.id, hint);
  }
  return hints;
}
