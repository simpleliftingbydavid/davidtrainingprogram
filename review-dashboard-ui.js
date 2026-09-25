import { REVIEW_PRIORITY, REVIEW_STATUS, REVIEW_TYPE, filterReviewAlerts, groupReviewAlerts, reviewSummary } from './review-dashboard-utils.js';

const CLIENT_CATEGORIES = Object.freeze({ gym: 'Phòng tập', freelance: 'Freelance', online: 'Online' });

function dateText(value) {
  const date = value?.toDate?.() || (value instanceof Date ? value : null);
  return date ? date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Vừa ghi nhận';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function optionMarkup(values, labels, allLabel) {
  return `<option value="">${allLabel}</option>${Object.keys(values).map((key) => `<option value="${key}">${labels[key]}</option>`).join('')}`;
}

async function copyText(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  try { await navigator.clipboard.writeText(text); return true; }
  catch (error) {
    const area = document.createElement('textarea'); area.value = text; area.setAttribute('readonly', '');
    area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
    const copied = document.execCommand('copy'); area.remove(); return copied;
  }
}

export function createReviewDashboardController({ root, onAction, onOpenStudent }) {
  let alerts = []; let students = []; let mode = 'loading'; let errorMessage = '';
  const filters = { category: '', type: '', status: 'open', search: '' };

  root.innerHTML = `
    <div class="review-head"><div><span class="eyebrow">Hàng đợi mỗi ngày</span><h1>Cần David xem lại</h1><p>Những điểm ảnh hưởng an toàn, tiến trình và trải nghiệm khách được gom về một nơi.</p></div><span class="review-live">● Cập nhật trực tiếp</span></div>
    <div class="review-summary" aria-label="Tóm tắt cảnh báo"></div>
    <div class="review-filters">
      <label>Tìm học viên hoặc vấn đề<input data-filter="search" type="search" placeholder="Ví dụ: Hải Phong, đau vai…"></label>
      <label>Nhóm<select data-filter="category">${optionMarkup(CLIENT_CATEGORIES, CLIENT_CATEGORIES, 'Tất cả nhóm')}</select></label>
      <label>Loại<select data-filter="type">${optionMarkup(REVIEW_TYPE, REVIEW_TYPE, 'Tất cả vấn đề')}</select></label>
      <label>Trạng thái<select data-filter="status">${optionMarkup(REVIEW_STATUS, REVIEW_STATUS, 'Tất cả trạng thái')}</select></label>
    </div>
    <div class="review-results" aria-live="polite"></div>`;
  root.querySelector('[data-filter="status"]').value = filters.status;
  root.querySelectorAll('[data-filter]').forEach((field) => field.addEventListener('input', () => {
    filters[field.dataset.filter] = field.value; render();
  }));

  function mergedItems() {
    const studentMap = new Map(students.map((item) => [item.id, item]));
    return alerts.map((item) => {
      const current = studentMap.get(item.studentUid);
      return current ? { ...item, studentName: current.displayName || item.studentName, clientCategory: current.clientCategory || item.clientCategory } : item;
    });
  }

  function makeButton(label, action, item, primary = false) {
    const button = document.createElement('button'); button.type = 'button';
    button.className = primary ? 'btn btn-primary' : 'btn btn-outline'; button.textContent = label;
    button.addEventListener('click', async () => {
      button.disabled = true;
      try { await onAction(item, action); } finally { button.disabled = false; }
    });
    return button;
  }

  function render() {
    const summary = reviewSummary(mergedItems());
    root.querySelector('.review-summary').innerHTML = [
      ['Cần xem', summary.open, 'open'], ['Ưu tiên ngay', summary.urgent, 'urgent'],
      ['Lỗi kỹ thuật', summary.technical, 'technical'], ['Đang xử lý', summary.inProgress, 'progress'], ['Đã xử lý', summary.resolved, 'resolved'],
    ].map(([label, value, tone]) => `<div class="review-metric ${tone}"><strong>${value}</strong><span>${label}</span></div>`).join('');
    const results = root.querySelector('.review-results');
    if (mode === 'loading') { results.innerHTML = '<div class="review-state">Đang gom các điểm cần xem…</div>'; return; }
    if (mode === 'error') { results.innerHTML = `<div class="review-state error">${errorMessage || 'Chưa thể tải dashboard lúc này.'}<br><small>Kiểm tra mạng rồi tải lại trang. Không có dữ liệu nào bị thay đổi.</small></div>`; return; }
    const visible = filterReviewAlerts(mergedItems(), filters);
    if (!visible.length) { results.innerHTML = '<div class="review-state"><strong>Không có việc tồn đọng trong bộ lọc này.</strong><br><span>Một khoảng trống tốt để tập trung vào coaching trực tiếp.</span></div>'; return; }
    results.innerHTML = '';
    const renderGroups = (items, title, copy) => {
      if (!items.length) return;
      const heading = document.createElement('div'); heading.className = 'review-section-heading';
      heading.innerHTML = `<div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(copy)}</small></div><b>${items.length}</b>`;
      results.appendChild(heading);
      groupReviewAlerts(items).forEach((group) => {
      const details = document.createElement('details'); details.className = 'review-student';
      details.open = group.items.some((item) => item.priority === 'urgent') || items.length <= 8;
      const summaryNode = document.createElement('summary');
      summaryNode.innerHTML = `<span><strong>${escapeHtml(group.studentName)}</strong><small>${escapeHtml(CLIENT_CATEGORIES[group.items[0]?.clientCategory] || 'Nhóm khách hàng')}</small></span><b>${group.items.length}</b>`;
      details.appendChild(summaryNode);
      const list = document.createElement('div'); list.className = 'review-list';
      group.items.forEach((item) => {
        const card = document.createElement('article'); card.className = `review-item priority-${item.priority}`;
        const body = document.createElement('div'); body.className = 'review-item-body';
        body.innerHTML = `<div class="review-tags"><span>${escapeHtml(REVIEW_PRIORITY[item.priority])}</span><span>${escapeHtml(REVIEW_TYPE[item.type])}</span><span>${escapeHtml(REVIEW_STATUS[item.status])}</span></div><h3>${escapeHtml(item.title || REVIEW_TYPE[item.type])}</h3><p>${escapeHtml(item.summary || '')}</p>${item.latestNote ? `<blockquote>${escapeHtml(item.latestNote)}</blockquote>` : ''}<small>${escapeHtml(item.dayLabel || '')}${item.dayLabel ? ' · ' : ''}${escapeHtml(dateText(item.lastDetectedAt || item.createdAt))}</small>`;
        const actions = document.createElement('div'); actions.className = 'review-actions';
        if (item.status === 'resolved') actions.append(makeButton('Mở lại', 'reopen', item));
        else {
          if (item.status === 'open') actions.append(makeButton('Đã xem', 'viewed', item));
          if (item.type !== 'technical-error') {
            actions.append(makeButton('Điều chỉnh giáo án', 'adjust-program', item));
            actions.append(makeButton('Trao đổi với khách', 'contact-client', item));
          }
          actions.append(makeButton('Đã xử lý', 'complete', item, true));
        }
        if (item.type === 'technical-error' && item.supportCode) {
          const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'review-copy-support'; copy.textContent = 'Sao chép mã hỗ trợ';
          copy.addEventListener('click', async () => { copy.textContent = await copyText(item.supportCode) ? 'Đã sao chép' : item.supportCode; });
          actions.append(copy);
        }
        if (item.studentUid) {
          const open = document.createElement('button'); open.type = 'button'; open.className = 'review-open-student'; open.textContent = 'Mở hồ sơ học viên →';
          open.addEventListener('click', () => onOpenStudent(item.studentUid)); actions.append(open);
        }
        card.append(body, actions); list.appendChild(card);
      });
      details.appendChild(list); results.appendChild(details);
      });
    };
    renderGroups(visible.filter((item) => item.type === 'technical-error'), 'Lỗi kỹ thuật', 'Chỉ chứa metadata tối thiểu; không lưu mức tạ, reps, ghi chú hay kế hoạch dinh dưỡng.');
    renderGroups(visible.filter((item) => item.type !== 'technical-error'), 'Coaching cần xem', 'Các tín hiệu về an toàn, tiến trình, phục hồi và trải nghiệm khách hàng.');
  }
  render();
  return {
    setItems(next) { alerts = Array.isArray(next) ? next : []; mode = 'ready'; render(); },
    setStudents(next) { students = Array.isArray(next) ? next : []; render(); },
    setError(message) { mode = 'error'; errorMessage = message; render(); },
    setLoading() { mode = 'loading'; render(); },
  };
}
