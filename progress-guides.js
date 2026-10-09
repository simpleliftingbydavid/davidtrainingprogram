// ============================================================
// DAVID COACHING — Hướng dẫn trên trang Tiến trình
// ============================================================
// Hai mục ghi chú David tự viết, hiện cho học viên trên trang Tiến trình:
//   * cách chụp ảnh 3 góc (Front / Side / Back) — tab "Cập nhật mới"
//   * cách cân trên cân điện tử — tab "Cân nặng"
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
  intro: ``,
  // Front — chụp chính diện
  front: ``,
  // Side — chụp bên hông
  side: ``,
  // Back — chụp từ phía sau
  back: ``,
});

export const WEIGHT_GUIDE = Object.freeze({
  // Cách cân trên cân điện tử: giờ cân, vị trí đặt cân, trang phục, cách đứng…
  text: ``,
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

/** The weighing guide, or '' when David has not written it yet. */
export function weightGuideMarkup(guide = WEIGHT_GUIDE) {
  const body = guideTextMarkup(guide.text);
  if (!body) return '';
  return `<details class="guide" id="weight-guide-details"><summary>Cách cân trên cân điện tử</summary><div class="guide-body">${body}</div></details>`;
}
