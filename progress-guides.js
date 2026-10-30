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

const ANGLES = Object.freeze([
  ['front', 'Front — chụp chính diện'],
  ['side', 'Side — chụp bên hông'],
  ['back', 'Back — chụp từ phía sau'],
]);

/** The photo guide, or '' when David has not written any of it yet. */
export function photoGuideMarkup(guide = PHOTO_GUIDE) {
  const intro = guideTextMarkup(guide.intro);
  const angles = ANGLES
    .filter(([key]) => hasText(guide[key]))
    .map(([key, label]) => `<div class="guide-angle"><h4>${label}</h4>${guideTextMarkup(guide[key])}</div>`)
    .join('');
  if (!intro && !angles) return '';
  return `<details class="guide" id="photo-guide-details"><summary>Cách chụp ảnh 3 góc (Front · Side · Back)</summary><div class="guide-body">${intro}${angles}</div></details>`;
}

/** The measuring guide, or '' when David has not written it yet. */
export function measureGuideMarkup(guide = MEASURE_GUIDE) {
  const body = guideTextMarkup(guide.text);
  if (!body) return '';
  return `<details class="guide" id="measure-guide-details"><summary>Cách lấy số đo vòng</summary><div class="guide-body">${body}</div></details>`;
}

/** The weighing guide, or '' when David has not written it yet. */
export function weightGuideMarkup(guide = WEIGHT_GUIDE) {
  const body = guideTextMarkup(guide.text);
  if (!body) return '';
  return `<details class="guide" id="weight-guide-details"><summary>Cách cân trên cân điện tử</summary><div class="guide-body">${body}</div></details>`;
}
