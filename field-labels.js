// ============================================================
// DAVID COACHING — Nối nhãn với ô nhập (rà giao diện coach theo ui-ux-pro-max "form-labels", 2026-11-25)
// ============================================================
// Nhiều form viết <div class="field"><label>Tuổi</label><input id="age"></div>: nhãn nằm cạnh ô nhưng
// không có for="age", nên trình đọc màn hình không biết ô đó tên gì, và bấm vào chữ nhãn không chọn ô.
// Hàm này nối lại (label.htmlFor), chỉ khi khung .field có đúng MỘT ô và nhãn chưa nối. Không đổi gì
// nhìn thấy. Form dựng sau (hộp thoại, form gán bài) được nối khi xuất hiện.

const CONTROL = 'input:not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea';
let counter = 0;

/** Nối nhãn trong root (mặc định cả trang). Trả về số nhãn vừa nối. */
export function linkFieldLabels(root = document) {
  let linked = 0;
  const fields = [...(root.matches?.('.field') ? [root] : []), ...root.querySelectorAll('.field')];
  fields.forEach((field) => {
    const label = [...field.children].find((child) => child.tagName === 'LABEL');
    if (!label || label.htmlFor || label.querySelector(CONTROL)) return;
    const controls = [...field.querySelectorAll(CONTROL)].filter((control) => control.closest('.field') === field);
    if (controls.length !== 1) return;
    const control = controls[0];
    if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return;
    if (!control.id) control.id = `field-auto-${++counter}`;
    label.htmlFor = control.id;
    linked += 1;
  });
  return linked;
}

let observing = false;
/** Nối một lần và theo dõi các form dựng sau. Gọi nhiều lần cũng chỉ theo dõi một lần. */
export function installFieldLabels(doc = document) {
  if (observing || !doc?.body || typeof MutationObserver === 'undefined') return;
  observing = true;
  linkFieldLabels(doc);
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; linkFieldLabels(doc); });
  }).observe(doc.body, { childList: true, subtree: true });
}
