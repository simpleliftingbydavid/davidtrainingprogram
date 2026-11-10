// ============================================================
// DAVID COACHING — Nhu cầu vi chất khuyến nghị theo giới và tuổi
// ============================================================
// Thuần: không DOM, không Firebase. Mục tiêu vitamin và khoáng chất là chuẩn theo giới và nhóm
// tuổi, không phải số riêng của từng kế hoạch: app tra bảng này mỗi lần hiển thị.
//
// NGUỒN (David chọn, 2026-11-04):
// - Viện Dinh dưỡng Quốc gia, công cụ "Tra cứu nhu cầu dinh dưỡng"
//   (viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong), tra ngày 04/11/2026: người không
//   có thai, mức lao động trung bình (vitamin và khoáng chất giống nhau ở cả 3 mức lao động).
//   Có: vitamin A, D, B1, B6, axit folic, C; canxi, magie, sắt, kẽm, kali, natri, chất xơ.
// - Vitamin E, K, B12: công cụ của Viện không có. Trang NIH chặn máy chủ của phiên làm việc, nên
//   David chọn (2026-11-09) lấy từ DRI Calculator của Thư viện Nông nghiệp Quốc gia Mỹ (USDA NAL),
//   cột "Recommended Intake Per Day" (cùng bảng DRI của Viện Hàn lâm Quốc gia Mỹ mà NIH đăng lại).
//   Tra cho nam/nữ 25, 40, 55, 70, 80 tuổi, không mang thai: cùng số ở mọi tuổi. Bản gốc ở
//   scripts/nal/dri-2026-11-09.json.
//
// Ghi chú của bảng Viện:
// - Sắt có 2 mức: hấp thu 10% (ăn 30–90 g thịt cá/ngày) và 15% (> 90 g thịt cá/ngày). Khách tập tạ
//   với đạm 1,9–2,2 g/kg thường ăn trên 90 g thịt cá, nên app dùng mức 15% (David duyệt 2026-11-10). Cả hai mức được giữ.
// - Kẽm: mức hấp thu vừa (30%).
// - Nữ 50–64 tuổi: sắt có 2 số trong cùng một ô (10%: 10,0 và 26,1; 15%: 6,7 và 17,4), công cụ
//   không ghi nhãn từng số. App dùng số cao hơn (17,4 mg), David duyệt 2026-11-10.
// - Nam từ 75 tuổi: công cụ để trống vitamin B6.
// - Natri là mức tối đa (< 2.000 mg); kali và chất xơ là mức tối thiểu.
// - Axit folic: Viện ghi "axit folic", số liệu thực phẩm (USDA) là folate µg DFE. Chưa xác nhận hai
//   số cùng cách tính; app vẫn so với 240 µg và ghi chú điều này (David chọn, duyệt lại 2026-11-10).

export const RNI_SOURCE = Object.freeze({
  title: 'Viện Dinh dưỡng Quốc gia — Tra cứu nhu cầu dinh dưỡng',
  url: 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong',
  accessed: '2026-11-04',
  condition: 'Không có thai, lao động trung bình',
});
export const DRI_SOURCE = Object.freeze({
  title: 'USDA National Agricultural Library — DRI Calculator for Healthcare Professionals',
  url: 'https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator',
  accessed: '2026-11-09',
  vitamins: Object.freeze(['vitaminE', 'vitaminK', 'vitaminB12']),
});
export const FOLATE_NOTE = 'Viện ghi “axit folic”; số liệu thực phẩm là folate (µg DFE). Chưa xác nhận hai số cùng cách tính.';
export const IRON_ABSORPTION = 15;
export const DEFAULT_AGE_GROUP = '18-29';

export const AGE_GROUPS = Object.freeze([
  Object.freeze({ id: '18-29', label: '18–29 tuổi', min: 18, max: 29 }),
  Object.freeze({ id: '30-49', label: '30–49 tuổi', min: 30, max: 49 }),
  Object.freeze({ id: '50-64', label: '50–64 tuổi', min: 50, max: 64 }),
  Object.freeze({ id: '65-74', label: '65–74 tuổi', min: 65, max: 74 }),
  Object.freeze({ id: '75+', label: 'Từ 75 tuổi', min: 75, max: 200 }),
]);

// Một dòng: vitamin A µg RAE, D µg, B1 mg, B6 mg, folate µg, C mg; canxi, magie mg; sắt mg ở mức
// hấp thu 10% và 15%; kẽm mg; kali tối thiểu mg; natri tối đa mg; chất xơ tối thiểu g.
const row = (vitaminA, vitaminD, vitaminB1, vitaminB6, folate, vitaminC, calcium, magnesium, iron10, iron15, zinc, potassium, sodium, fiber) => Object.freeze({
  vitaminA, vitaminD, vitaminB1, vitaminB6, folate, vitaminC, calcium, magnesium,
  iron: Object.freeze({ 10: iron10, 15: iron15 }), zinc, potassium, sodium, fiber,
});

export const RNI_TABLE = Object.freeze({
  '18-29': Object.freeze({
    male: row(850, 15, 1.4, 1.3, 240, 100, 800, 340, 11.9, 7.9, 10, 3000, 2000, 21),
    female: row(650, 15, 1.1, 1.3, 240, 100, 800, 270, 26.1, 17.4, 8, 2600, 2000, 18),
  }),
  '30-49': Object.freeze({
    male: row(900, 15, 1.4, 1.3, 240, 100, 800, 370, 11.9, 7.9, 10, 3000, 2000, 21),
    female: row(650, 15, 1.1, 1.3, 240, 100, 800, 290, 26.1, 17.4, 8, 2600, 2000, 18),
  }),
  '50-64': Object.freeze({
    male: row(850, 15, 1.3, 1.7, 240, 100, 800, 370, 11.9, 7.9, 10, 3000, 2000, 20),
    female: row(700, 15, 1.1, 1.5, 240, 100, 750, 290, 26.1, 17.4, 8, 2600, 2000, 17),
  }),
  '65-74': Object.freeze({
    male: row(850, 15, 1.3, 1.7, 240, 100, 800, 350, 11.0, 7.3, 9, 3000, 2000, 20),
    female: row(700, 15, 1.0, 1.5, 240, 100, 800, 280, 9.4, 6.3, 7, 2600, 2000, 17),
  }),
  '75+': Object.freeze({
    male: row(800, 20, 1.2, null, 240, 100, 1000, 320, 11.0, 7.3, 9, 3000, 2000, 20),
    female: row(650, 20, 1.0, 1.5, 240, 100, 1000, 260, 9.4, 6.3, 7, 2600, 2000, 17),
  }),
});

/** Vitamin E (mg alpha-tocopherol), K (µg), B12 (µg) theo DRI của Mỹ (DRI_SOURCE), mọi tuổi người lớn. */
export const DRI_VITAMINS = Object.freeze({
  male: Object.freeze({ vitaminE: 15, vitaminK: 120, vitaminB12: 2.4 }),
  female: Object.freeze({ vitaminE: 15, vitaminK: 90, vitaminB12: 2.4 }),
});

export function ageGroupFor(age) {
  const value = Number(age);
  if (!Number.isFinite(value) || value <= 0) return null;
  return AGE_GROUPS.find((group) => value >= group.min && value <= group.max) || (value < 18 ? null : AGE_GROUPS.at(-1));
}

/**
 * Mục tiêu vi chất trong ngày cho một khách. Thiếu tuổi thì nhóm 18–29, thiếu giới tính thì
 * dùng số của nam; cả hai được ghi vào notes để màn hình nói rõ.
 * @returns {{values:Object<string,number|null>, limits:string[], group, sex, notes:string[], source}}
 */
export function micronutrientTargets({ sex = '', age = null } = {}) {
  const notes = [];
  let group = ageGroupFor(age);
  if (!group) {
    group = AGE_GROUPS.find((item) => item.id === DEFAULT_AGE_GROUP);
    notes.push(Number(age) > 0 && Number(age) < 18
      ? 'Khách dưới 18 tuổi: bảng này dành cho người lớn, đang dùng nhóm 18–29.'
      : 'Chưa có tuổi: đang dùng nhóm 18–29.');
  }
  const sexKey = sex === 'female' ? 'female' : 'male';
  if (sex !== 'female' && sex !== 'male') notes.push('Chưa chọn giới tính: đang dùng số của nam.');
  const r = RNI_TABLE[group.id][sexKey];
  const nih = DRI_VITAMINS[sexKey];
  return {
    values: {
      fiber: r.fiber, potassium: r.potassium, sodium: r.sodium, calcium: r.calcium, magnesium: r.magnesium,
      iron: r.iron[IRON_ABSORPTION], zinc: r.zinc,
      vitaminA: r.vitaminA, vitaminC: r.vitaminC, vitaminD: r.vitaminD, vitaminE: nih.vitaminE, vitaminK: nih.vitaminK,
      vitaminB1: r.vitaminB1, vitaminB6: r.vitaminB6, folate: r.folate, vitaminB12: nih.vitaminB12,
    },
    limits: ['sodium'],
    group: group.id,
    sex: sexKey,
    notes,
    source: RNI_SOURCE,
  };
}
