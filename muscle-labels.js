// Tên nhóm cơ hiển thị theo ngôn ngữ. Trong dữ liệu (bài tập, volume, Firestore) nhóm cơ được
// lưu bằng tên tiếng Việt, và vẫn giữ nguyên như vậy: bảng này chỉ đổi chữ hiện ra.
import { t } from './i18n.js';

const MUSCLE_KEY = Object.freeze({
  'Ngực': 'chest', // i18n-data
  'Lưng': 'back', // i18n-data
  'Vai': 'shoulders',
  'Tay trước': 'biceps', // i18n-data
  'Tay sau': 'triceps',
  'Đùi trước': 'quads', // i18n-data
  'Đùi sau & Mông': 'hamsGlutes', // i18n-data
  'Bắp chân': 'calves', // i18n-data
  'Bụng': 'abs', // i18n-data
});

/** "Ngực" → "Ngực" (vi) / "Chest" (en). Nhóm lạ: giữ nguyên chữ trong dữ liệu. */
export function muscleLabel(group) {
  const key = MUSCLE_KEY[String(group ?? '').trim()];
  return key ? t(`muscle.${key}`) : String(group ?? '');
}
