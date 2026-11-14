// Hộp thoại và thông báo dùng chung, thay alert / confirm / prompt của trình duyệt
// (audit UX/UI 2026-11-13, giai đoạn 3; David chốt cách hoạt động 2a ngày 2026-11-14).
//
//   await confirmDialog({ message, confirmLabel, cancelLabel, danger })  → true | false
//   await promptDialog({ message, label, value, confirmLabel })          → chuỗi đã nhập | null
//   await noticeDialog(message)                                          → khi người dùng bấm "Đã hiểu"
//   toast(message, 'error' | '')                                         → thông báo ngắn tự tắt, không chặn thao tác
//
// Esc và bấm ra ngoài hộp là huỷ. Tiêu điểm nằm trong hộp khi mở và trở về nút đã mở khi đóng
// (thẻ <dialog> của trình duyệt lo việc giữ tiêu điểm). Hành động xoá: nút đỏ, nút mặc định là huỷ.
// Style nằm trong components.css.

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Câu đầu là tiêu đề, phần còn lại là nội dung; xuống dòng trong câu chữ được giữ. */
export function splitDialogMessage(message) {
  const text = String(message ?? '').trim();
  const breakAt = text.indexOf('\n');
  if (breakAt > 0) return { title: text.slice(0, breakAt).trim(), body: text.slice(breakAt + 1).trim() };
  const sentence = text.match(/^(.{8,120}?[?.!])\s+(.+)$/s);
  return sentence ? { title: sentence[1], body: sentence[2] } : { title: text, body: '' };
}

/** Kết quả của hộp thoại theo cách nó đóng. Tách riêng để kiểm thử không cần trình duyệt. */
export function dialogResult(kind, returnValue, inputValue = '') {
  const confirmed = returnValue === 'confirm';
  if (kind === 'confirm') return confirmed;
  if (kind === 'prompt') return confirmed ? String(inputValue) : null;
  return undefined;
}

function openDialog({ kind, message, title, body, confirmLabel, cancelLabel, danger = false, label = '', value = '', placeholder = '' }) {
  const parts = title ? { title, body: body || '' } : splitDialogMessage(message);
  const dialog = document.createElement('dialog');
  dialog.className = `dc-dialog${danger ? ' dc-dialog-danger' : ''}`;
  dialog.setAttribute('aria-labelledby', 'dc-dialog-title');
  const inputId = 'dc-dialog-input';
  dialog.innerHTML = `
    <form method="dialog" class="dc-dialog-body">
      <h2 id="dc-dialog-title" class="dc-dialog-title">${escapeHtml(parts.title)}</h2>
      ${parts.body ? `<p class="dc-dialog-text">${escapeHtml(parts.body)}</p>` : ''}
      ${kind === 'prompt' ? `<div class="dc-dialog-field">${label ? `<label for="${inputId}">${escapeHtml(label)}</label>` : ''}<input id="${inputId}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off"></div>` : ''}
      <div class="dc-dialog-actions">
        <button type="submit" value="confirm" class="dc-dialog-btn dc-dialog-confirm">${escapeHtml(confirmLabel || (kind === 'notice' ? 'Đã hiểu' : 'Đồng ý'))}</button>
        ${kind === 'notice' ? '' : `<button type="submit" value="cancel" class="dc-dialog-btn dc-dialog-cancel" formnovalidate>${escapeHtml(cancelLabel || 'Huỷ')}</button>`}
      </div>
    </form>`;
  document.body.appendChild(dialog);
  const opener = document.activeElement;
  const input = dialog.querySelector(`#${inputId}`);
  // Nút đồng ý đứng trước trong mã để Enter ở ô nhập là đồng ý; CSS xếp nó bên phải.
  // Hành động xoá: tiêu điểm đặt ở nút huỷ, Enter không xoá nhầm.
  const first = input || dialog.querySelector(danger ? '.dc-dialog-cancel' : '.dc-dialog-confirm');

  return new Promise((resolve) => {
    dialog.addEventListener('click', (event) => {
      // Bấm vào nền mờ (ngoài khung nội dung) là huỷ.
      if (event.target === dialog) dialog.close('cancel');
    });
    dialog.addEventListener('cancel', () => { dialog.returnValue = 'cancel'; });
    dialog.addEventListener('close', () => {
      const result = dialogResult(kind, dialog.returnValue, input?.value);
      dialog.remove();
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
      resolve(result);
    }, { once: true });
    dialog.showModal();
    first?.focus();
    if (input) input.select();
  });
}

/** Hỏi xác nhận. Trả về true khi người dùng đồng ý. */
export function confirmDialog(options) {
  return openDialog({ kind: 'confirm', ...(typeof options === 'string' ? { message: options } : options) });
}

/** Hỏi nhập một dòng chữ. Trả về chuỗi (có thể rỗng) hoặc null khi huỷ. */
export function promptDialog(options) {
  return openDialog({ kind: 'prompt', ...(typeof options === 'string' ? { message: options } : options) });
}

/** Việc quan trọng cần đọc: đóng bằng nút "Đã hiểu". */
export function noticeDialog(options) {
  return openDialog({ kind: 'notice', ...(typeof options === 'string' ? { message: options } : options) });
}

let toastTimer = null;
/** Thông báo ngắn cuối màn hình, tự tắt. Dùng lại khung #quiet-toast của trang nếu có. */
export function toast(message, type = '') {
  let box = document.getElementById('quiet-toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'quiet-toast';
    box.className = 'quiet-toast';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
  }
  box.textContent = String(message ?? '');
  box.className = `quiet-toast ${type === 'error' ? 'error ' : ''}show`;
  clearTimeout(toastTimer);
  // Câu dài được đọc lâu hơn: 3,5 giây, cộng thêm theo độ dài, tối đa 8 giây.
  const visibleMs = Math.min(8000, 3500 + Math.max(0, box.textContent.length - 60) * 45);
  toastTimer = setTimeout(() => box.classList.remove('show'), visibleMs);
}
