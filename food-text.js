// Chữ của thực phẩm và món ăn theo ngôn ngữ đang dùng. Dữ liệu (bảng thực phẩm, món đã ghi trong
// Firestore) giữ tên tiếng Việt; bản tiếng Anh nằm ở food-names-en.js và chỉ dùng để hiện ra.
import { getLang } from './i18n.js';
import { DISHES_EN, FOOD_NAMES_EN, PORTION_LABELS_EN } from './food-names-en.js';

const en = () => getLang() === 'en';

/** Tên thực phẩm hoặc món ăn ngoài. Tên lạ (món của tôi, món theo nhãn): giữ nguyên. */
export const foodName = (name) => (en() && FOOD_NAMES_EN[name]) || name;

/** Tên tiếng Anh (nếu có) để tìm kiếm, kể cả khi trang đang là tiếng Việt. */
export const foodNameEn = (name) => FOOD_NAMES_EN[name] || '';

/** Tên và cách nấu của một món gợi ý (món của David tự thêm thì giữ như David viết). */
export const dishName = (dish) => (en() && DISHES_EN[dish?.id]?.name) || dish?.name || '';
export const dishCook = (dish) => (en() && DISHES_EN[dish?.id]?.cook) || dish?.cook || '';

/** Nhãn khẩu phần quen thuộc ("1 chén cơm"). */
export const portionLabelText = (label) => (en() && PORTION_LABELS_EN[label]) || label;

/** Tên nguồn số liệu (đã là tiếng Anh). */
export const sourceText = (source) => String(source ?? '');

// Thực phẩm chức năng và thực phẩm bổ sung David chọn trong kế hoạch: lưu bằng chữ tiếng Việt
// trong nutrition-engine.js (i18n-data). Tên đã là tiếng Anh thì giữ nguyên.
const PLAN_ITEMS_EN = Object.freeze({
  'Củ dền': 'Beetroot', 'Gừng': 'Ginger', 'Giấm táo': 'Apple cider vinegar', 'Tảo': 'Seaweed / algae', // i18n-data
  'Kim chi': 'Kimchi', 'Sauerkraut hoặc dưa chua': 'Sauerkraut or pickles', // i18n-data
  'Caffeine (khi tập sáng)': 'Caffeine (for morning training)', 'Glycine hoặc collagen peptides': 'Glycine or collagen peptides', // i18n-data
});
export const planItemText = (name) => (en() && PLAN_ITEMS_EN[name]) || name;
