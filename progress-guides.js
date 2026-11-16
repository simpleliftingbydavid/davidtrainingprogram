// ============================================================
// DAVID COACHING — Hướng dẫn trên trang Tiến trình
// ============================================================
// Ba mục ghi chú David tự viết, hiện cho học viên trên trang Tiến trình:
//   * cách chụp ảnh 3 góc (Front / Side / Back) — tab "Cập nhật mới"
//   * cách cân trên cân điện tử — tab "Cân nặng & số đo"
//   * cách lấy số đo vòng — tab "Cân nặng & số đo"
//
// ĐỂ SỬA NỘI DUNG: chỉ sửa phần chữ trong hai khối ngay dưới đây, giữa hai dấu
// ngoặc kép ngược (`...`). Mục nào để trống thì KHÔNG hiện cho khách.
//
// Cách viết trong mỗi ô:
//   * Một dòng trống tách hai đoạn văn.
//   * Dòng bắt đầu bằng "- " thành gạch đầu dòng.
//   * Dòng bắt đầu bằng "## " thành tiêu đề nhỏ in đậm.
//   * Không dùng ký tự < hoặc > — chúng luôn hiện nguyên chữ, không thành định dạng.

import { getLang, t } from './i18n.js';

export const PHOTO_GUIDE = Object.freeze({
  // Lời dặn chung cho cả 3 góc: ánh sáng, trang phục, khoảng cách, giờ chụp…
  intro: `Ảnh chỉ so sánh được khi lần nào cũng chụp giống nhau. Giữ đúng những điều dưới đây mỗi lần chụp.

## Khi nào chụp
- 2 tuần/lần, buổi sáng sau khi đi vệ sinh, trước khi ăn uống (cùng lúc với khi cân).

## Mặc gì
- Nam: cởi trần, mặc quần short.
- Nữ: áo bra thể thao, quần short hoặc legging.
- Lần nào cũng mặc cùng một bộ.

## Chỗ chụp và ánh sáng
- Chụp cùng một chỗ, nền trơn càng tốt.
- Ánh sáng đều chiếu từ phía trước (cửa sổ hoặc đèn trần). Tránh đứng ngược sáng và tránh đèn rọi ngay trên đầu.

## Đặt điện thoại
- Kê điện thoại cố định ngang tầm bụng, cách bạn khoảng 2–3 m, thấy trọn người từ đầu đến bàn chân.
- Dùng hẹn giờ 10 giây. Không zoom, không bật chế độ chân dung, làm đẹp hay filter.

## Tư thế
- Đứng thả lỏng tự nhiên: không gồng, không hóp bụng, thở bình thường.

Chụp đủ 3 góc rồi tải lên cùng một lần, chọn đúng góc cho từng ảnh.`,
  // Front — chụp chính diện
  front: `- Đứng thẳng, mặt hướng vào điện thoại, hai chân rộng bằng hông.
- Hai tay buông tự nhiên, hơi tách khỏi thân.
- Mắt nhìn thẳng, cằm song song mặt đất.`,
  // Side — chụp bên hông
  side: `- Xoay người 90 độ. Chọn một bên (ví dụ bên phải) và lần nào cũng chụp bên đó.
- Hai chân khép tự nhiên, tay buông dọc thân hoặc hơi đưa ra trước để không che bụng.
- Mắt nhìn thẳng phía trước, không quay đầu về phía điện thoại.`,
  // Back — chụp từ phía sau
  back: `- Quay lưng về phía điện thoại, hai chân rộng bằng hông.
- Hai tay buông, hơi tách khỏi thân để thấy rõ eo.
- Đầu nhìn thẳng phía trước, vai thả lỏng.`,
});

export const WEIGHT_GUIDE = Object.freeze({
  // Cách cân trên cân điện tử: giờ cân, vị trí đặt cân, trang phục, cách đứng…
  text: `- Cân ít nhất 3 lần/tuần (hoặc nhiều hơn nếu bạn có thể).
- Cân cơ thể bạn ngay sau khi ngủ dậy và đã đi vệ sinh.
- Đặt bàn cân lên một mặt phẳng cứng (không phải thảm lót sàn), rồi cân cơ thể bạn khi không mặc quần áo (hoặc mặc quần áo mỏng, nhẹ).
- Ghi chép lại cân nặng vào app để lưu trữ.
- Tự nhắc nhở bản thân rằng cân nặng của bạn hôm nay không quan trọng, nó chỉ là dữ liệu bạn sử dụng để theo dõi trong thời gian dài.`,
});

export const MEASURE_GUIDE = Object.freeze({
  // Cách lấy số đo vòng: các điểm cần đo và cách đo từng điểm.
  text: `Các điểm cần đo: các chi (tay, chân), ngực (bao gồm cả lưng), hông và 3 điểm trên bụng.

## Ngực / Lưng
Hít một hơi thật sâu, gồng ngực và cơ xô (Lats). Đặt thước dây ngang với nhũ hoa (với phụ nữ có thể ngang với nách).

## Tay
Co khuỷu tay lại và gồng; đo ở điểm dày nhất.

## Bụng
Gồng lên như thể bạn chuẩn bị bị đấm. Đừng hóp hay phồng bụng lên. Đo ở 3 điểm:
- Rốn
- Trên rốn 5cm
- Dưới rốn 5cm

## Hông
Đứng thẳng, không gồng hay siết. Đo ở điểm lớn nhất, ngang mông.

## Chân
Đứng thẳng, gồng (duỗi đầu gối khi đạp xuống sàn). Đo ở điểm dày nhất.`,
});

// ---------- English (David duyệt) ----------
// Bản tiếng Anh của ba hướng dẫn trên, cùng cách viết. Sửa bản tiếng Việt thì nhớ sửa cả bản này.

export const PHOTO_GUIDE_EN = Object.freeze({
  intro: `Photos only compare well when every photo is taken the same way. Keep to the points below each time.

## When to take them
- Every 2 weeks, in the morning after using the toilet and before eating or drinking (at the same time as your weigh-in).

## What to wear
- Men: shirtless, in shorts.
- Women: sports bra, shorts or leggings.
- Wear the same outfit every time.

## Place and light
- Same spot every time, a plain background if possible.
- Even light from the front (a window or ceiling light). Avoid standing with the light behind you or directly overhead.

## Placing the phone
- Prop the phone steady at belly height, about 2–3 m away, with your whole body in frame from head to feet.
- Use a 10-second timer. No zoom, portrait mode, beauty mode or filters.

## Posture
- Stand naturally relaxed: don't flex, don't suck in your stomach, breathe normally.

Take all 3 angles, upload them together, and choose the right angle for each photo.`,

  front: `- Stand straight, facing the phone, feet hip-width apart.
- Arms hanging naturally, slightly away from your body.
- Look straight ahead, chin level with the floor.`,

  side: `- Turn 90 degrees. Pick one side (for example your right) and always use that side.
- Feet together naturally, arms down along your body or slightly forward so they don't cover your stomach.
- Look straight ahead; don't turn your head toward the phone.`,

  back: `- Turn your back to the phone, feet hip-width apart.
- Arms down, slightly away from your body so your waist is visible.
- Head facing forward, shoulders relaxed.`,
});

export const WEIGHT_GUIDE_EN = Object.freeze({
  text: `- Weigh yourself at least 3 times a week (more if you can).
- Weigh yourself right after waking up and using the toilet.
- Put the scale on a hard, flat surface (not a rug), and weigh yourself without clothes (or in thin, light clothes).
- Log your weight in the app so it is kept.
- Remind yourself that today's weight doesn't matter on its own; it is just data you use to follow the long-term trend.`,
});

export const MEASURE_GUIDE_EN = Object.freeze({
  text: `Points to measure: the limbs (arms, legs), chest (including the back), hips and 3 points on the waist.

## Chest / back
Take a deep breath and flex your chest and lats. Run the tape level with the nipples (for women, level with the armpits works too).

## Arms
Bend the elbow and flex; measure at the thickest point.

## Waist
Brace as if you were about to be punched. Don't suck in or push out your stomach. Measure at 3 points:
- At the navel
- 5 cm above the navel
- 5 cm below the navel

## Hips
Stand straight, without flexing or squeezing. Measure at the widest point, across the glutes.

## Legs
Stand straight and flex (straighten the knee by pressing into the floor). Measure at the thickest point.`,
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const hasText = (value) => String(value ?? '').trim().length > 0;

/** Plain text → paragraphs, bullet lists and small headings. Everything is
 *  escaped first, so nothing typed here can become markup. */
export function guideTextMarkup(text) {
  if (!hasText(text)) return '';
  const out = [];
  let bullets = [];
  const flush = () => {
    if (bullets.length) out.push(`<ul>${bullets.map((item) => `<li>${item}</li>`).join('')}</ul>`);
    bullets = [];
  };
  let paragraph = [];
  const endParagraph = () => {
    if (paragraph.length) out.push(`<p>${paragraph.join('<br>')}</p>`);
    paragraph = [];
  };
  for (const raw of String(text).replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { endParagraph(); flush(); continue; }
    if (line.startsWith('## ')) { endParagraph(); flush(); out.push(`<h5>${escapeHtml(line.slice(3).trim())}</h5>`); continue; }
    if (line.startsWith('- ')) { endParagraph(); bullets.push(escapeHtml(line.slice(2).trim())); continue; }
    flush();
    paragraph.push(escapeHtml(line));
  }
  endParagraph();
  flush();
  return out.join('');
}

const ANGLE_KEYS = Object.freeze(['front', 'side', 'back']);

/** The photo guide, or '' when David has not written any of it yet. */
export function photoGuideMarkup(guide = getLang() === 'en' ? PHOTO_GUIDE_EN : PHOTO_GUIDE) {
  const intro = guideTextMarkup(guide.intro);
  const angles = ANGLE_KEYS
    .filter((key) => hasText(guide[key]))
    .map((key) => `<div class="guide-angle"><h4>${t(`guide.angle.${key}`)}</h4>${guideTextMarkup(guide[key])}</div>`)
    .join('');
  if (!intro && !angles) return '';
  return `<details class="guide" id="photo-guide-details"><summary>${t('guide.photoTitle')}</summary><div class="guide-body">${intro}${angles}</div></details>`;
}

/** The measuring guide, or '' when David has not written it yet. */
export function measureGuideMarkup(guide = getLang() === 'en' ? MEASURE_GUIDE_EN : MEASURE_GUIDE) {
  const body = guideTextMarkup(guide.text);
  if (!body) return '';
  return `<details class="guide" id="measure-guide-details"><summary>${t('guide.measureTitle')}</summary><div class="guide-body">${body}</div></details>`;
}

/** The weighing guide, or '' when David has not written it yet. */
export function weightGuideMarkup(guide = getLang() === 'en' ? WEIGHT_GUIDE_EN : WEIGHT_GUIDE) {
  const body = guideTextMarkup(guide.text);
  if (!body) return '';
  return `<details class="guide" id="weight-guide-details"><summary>${t('guide.weightTitle')}</summary><div class="guide-body">${body}</div></details>`;
}
