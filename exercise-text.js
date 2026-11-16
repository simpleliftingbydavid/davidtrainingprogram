// Chữ của một bài tập theo ngôn ngữ đang dùng. Tên bài vốn là tiếng Anh nên giữ nguyên;
// các dòng hướng dẫn kỹ thuật có bản tiếng Anh ở exercise-technique-en.js.
import { getLang } from './i18n.js';
import { TECHNIQUE_EN } from './exercise-technique-en.js';

/** Các dòng kỹ thuật của bài (mảng, có thể rỗng). */
export function exerciseTechnique(exercise) {
  const lines = Array.isArray(exercise?.technique) ? exercise.technique : [];
  if (getLang() !== 'en') return lines;
  const en = TECHNIQUE_EN[exercise?.exerciseId];
  return Array.isArray(en) && en.length === lines.length ? en : lines;
}
