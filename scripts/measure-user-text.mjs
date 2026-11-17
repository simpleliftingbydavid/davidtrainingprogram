#!/usr/bin/env node
// ============================================================
// Đo lượng chữ tự gõ (để ước chi phí dịch sang tiếng Anh). CHỈ ĐỌC: không ghi gì vào Firestore.
// ============================================================
// Chạy trên máy David, trong thư mục repo:
//   cd functions && npm install && cd ..        (một lần, nếu chưa có node_modules)
//   gcloud auth application-default login       (hoặc đặt GOOGLE_APPLICATION_CREDENTIALS = file service account)
//   node scripts/measure-user-text.mjs
// In ra: số ký tự hiện có, số ký tự tạo trong 30 ngày gần nhất, tách theo loại nội dung, và ước tính
// tiền mỗi tháng cho Google Cloud Translation và Claude Haiku 5.5. Không in nội dung của học viên.
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault(), projectId: 'david-training-program' });
const db = getFirestore();

/** Tên trường chứa chữ người dùng tự gõ (ở bất kỳ độ sâu nào trong tài liệu). */
export const TEXT_KEYS = new Set([
  'name', 'title', 'label', 'dayLabel', 'sessionLabel', 'note', 'notes', 'body', 'reason', 'message',
  'identity', 'cue', 'twoMinute', 'reward', 'why', 'cook', 'goalLabel', 'displayGoal', 'brand', 'servingLabel',
  'workSchedule', 'sleepSchedule', 'foodNotes', 'allergyNotes', 'coachNote', 'clientNote', 'proteinNote',
  'completionReasonNote', 'skipReasonNote', 'whatWorked', 'whatToChange', 'decision', 'nickname',
]);
/** Không dịch: tên người, email, mã, đường dẫn. */
const SKIP_KEYS = new Set(['displayName', 'email', 'exerciseNameSnapshot', 'downloadURL', 'storagePath', 'token']);
const DAY_MS = 86400000;
const since = Date.now() - 30 * DAY_MS;

const totals = new Map(); // nhóm → { all, recent, docs }
const unique = new Set();
let uniqueChars = 0;

function collect(value, key, out) {
  if (value == null) return;
  if (typeof value === 'string') {
    if (TEXT_KEYS.has(key) && value.trim() && /\p{L}/u.test(value)) out.push(value.trim());
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, key, out)); return; }
  if (typeof value === 'object' && !(value.toDate instanceof Function)) {
    for (const [k, v] of Object.entries(value)) if (!SKIP_KEYS.has(k)) collect(v, k, out);
  }
}

function add(group, strings, created) {
  const row = totals.get(group) || { all: 0, recent: 0, docs: 0 };
  const chars = strings.reduce((sum, s) => sum + [...s].length, 0);
  row.all += chars; row.docs += 1;
  if (created >= since) row.recent += chars;
  totals.set(group, row);
  for (const s of strings) if (!unique.has(s)) { unique.add(s); uniqueChars += [...s].length; }
}

async function walk(ref, group) {
  const snap = await ref.get();
  for (const doc of snap.docs) {
    const strings = [];
    collect(doc.data(), '', strings);
    if (strings.length) add(group, strings, doc.createTime?.toMillis?.() ?? 0);
    for (const sub of await doc.ref.listCollections()) await walk(sub, `${group}/${sub.id}`);
  }
}

for (const top of ['students', 'coaches']) {
  const snap = await db.collection(top).get();
  for (const doc of snap.docs) {
    const strings = [];
    collect(doc.data(), '', strings);
    if (strings.length) add(top, strings, doc.createTime?.toMillis?.() ?? 0);
    for (const sub of await doc.ref.listCollections()) await walk(sub, `${top}/${sub.id}`);
  }
}

const rows = [...totals.entries()].sort((a, b) => b[1].all - a[1].all);
const sumAll = rows.reduce((s, [, r]) => s + r.all, 0);
const sumRecent = rows.reduce((s, [, r]) => s + r.recent, 0);
console.log('Nhóm nội dung'.padEnd(48), 'ký tự hiện có'.padStart(14), '30 ngày qua'.padStart(12), 'tài liệu'.padStart(9));
for (const [group, r] of rows) console.log(group.padEnd(48), String(r.all).padStart(14), String(r.recent).padStart(12), String(r.docs).padStart(9));
console.log('-'.repeat(86));
console.log('TỔNG'.padEnd(48), String(sumAll).padStart(14), String(sumRecent).padStart(12));
console.log(`Sau khi bỏ trùng (mỗi câu chỉ dịch một lần): ${uniqueChars} ký tự`);

// Bảng giá tra ngày 2026-11-17 (ghi trong scripts/measure-user-text.mjs; kiểm tra lại trước khi quyết):
// Google Cloud Translation NMT: 500.000 ký tự/tháng miễn phí, sau đó 20 USD / 1 triệu ký tự.
// Claude Opus 5.5: 4 USD / 1 triệu token vào, 20 USD / 1 triệu token ra.
// Claude Haiku 5.5: 0,10 USD / 1 triệu token vào, 0,50 USD / 1 triệu token ra (lời nhắc dưới 100.000 token).
const google = (chars) => Math.max(0, chars - 500000) / 1e6 * 20;
// Ước token: ~1 token mỗi 2,5 ký tự tiếng Việt vào, ~1 token mỗi 4 ký tự tiếng Anh ra, cộng ~300 token
// lời dặn mỗi lần gọi gom 50 đoạn. Chỉ là ước lượng thô.
const claude = (chars, inPrice, outPrice) => {
  const input = chars / 2.5 + (chars / 2000) * 300;
  const output = chars / 4;
  return input / 1e6 * inPrice + output / 1e6 * outPrice;
};
const opus = (chars) => claude(chars, 4, 20);
const haiku = (chars) => claude(chars, 0.10, 0.50);
const usd = (n) => `${n.toFixed(2)} USD`;
console.log('\nƯớc tính chi phí:');
console.log(`  Dịch lần đầu toàn bộ (${uniqueChars} ký tự): Google ${usd(google(uniqueChars))} (nếu trong một tháng) · Claude Opus 5.5 ${usd(opus(uniqueChars))} · Claude Haiku 5.5 ${usd(haiku(uniqueChars))}`);
console.log(`  Mỗi tháng sau đó (~${sumRecent} ký tự mới): Google ${usd(google(sumRecent))} · Claude Opus 5.5 ${usd(opus(sumRecent))} · Claude Haiku 5.5 ${usd(haiku(sumRecent))}`);
