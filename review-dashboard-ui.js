import {
  REVIEW_PRIORITY, REVIEW_STATUS, REVIEW_TYPE, alertAgeDays, alertAgeText, filterReviewAlerts, groupReviewAlerts,
  groupRoutineAlerts, mergeReviewAlertPages, reviewSections, reviewSummary,
} from './review-dashboard-utils.js';
import { studentHintMap } from './student-name-utils.js';

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

export function createReviewDashboardController({ root, onAction, onOpenStudent, onLoadMore = null, onBulkAction = null }) {
  let firstPage = []; let olderPages = []; let pinned = []; let students = []; let mode = 'loading'; let errorMessage = '';
  let summaryOverride = null; let hasMore = false; let loadingMore = false;
  const filters = { category: '', type: '', status: 'open', age: '', search: '' };
  // A short hint for students whose name could be taken for another's.
  const hintFor = (uid) => studentHintMap(students).get(uid) || '';
  const hintPrefix = (uid) => { const hint = hintFor(uid); return hint ? `${escapeHtml(hint)} · ` : ''; };

  root.innerHTML = `
    <div class="review-head"><div><span class="eyebrow">Hàng đợi mỗi ngày</span><h1>Cần David xem lại</h1><p>Những điểm ảnh hưởng an toàn, tiến trình và trải nghiệm khách được gom về một nơi.</p></div><span class="review-live">● Cập nhật trực tiếp</span></div>
    <div class="review-summary" aria-label="Tóm tắt cảnh báo"></div>
    <div class="review-filters">
      <label>Tìm học viên hoặc vấn đề<input data-filter="search" type="search" placeholder="Ví dụ: Hải Phong, đau vai…"></label>
      <label>Nhóm<select data-filter="category">${optionMarkup(CLIENT_CATEGORIES, CLIENT_CATEGORIES, 'Tất cả nhóm')}</select></label>
      <label>Loại<select data-filter="type">${optionMarkup(REVIEW_TYPE, REVIEW_TYPE, 'Tất cả vấn đề')}</select></label>
      <label>Trạng thái<select data-filter="status">${optionMarkup(REVIEW_STATUS, REVIEW_STATUS, 'Tất cả trạng thái')}</select></label>
      <label>Thời gian<select data-filter="age"><option value="">Tất cả</option><option value="recent">7 ngày gần đây</option><option value="old">Cũ hơn 14 ngày</option></select></label>
    </div>
    <div class="review-results" aria-live="polite"></div>`;
  root.querySelector('[data-filter="status"]').value = filters.status;
  root.querySelectorAll('[data-filter]').forEach((field) => field.addEventListener('input', () => {
    filters[field.dataset.filter] = field.value; render();
  }));

  function mergedItems() {
    const studentMap = new Map(students.map((item) => [item.id, item]));
    // Pinned first, so the live first page and any loaded pages win where they overlap.
    return mergeReviewAlertPages(pinned, olderPages, firstPage).map((item) => {
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

  function createAlertCard(item) {
    const card = document.createElement('article'); card.className = `review-item priority-${item.displayPriority || item.priority}${alertAgeDays(item) > 14 && item.priority !== 'urgent' ? ' is-old' : ''}`;
    const body = document.createElement('div'); body.className = 'review-item-body';
    body.innerHTML = `<div class="review-tags"><span>${escapeHtml(REVIEW_PRIORITY[item.displayPriority || item.priority])}</span><span>${escapeHtml(REVIEW_TYPE[item.type])}</span><span>${escapeHtml(REVIEW_STATUS[item.status])}</span></div><h3>${escapeHtml(item.title || REVIEW_TYPE[item.type])}</h3><p>${escapeHtml(item.summary || '')}</p>${item.latestNote ? `<blockquote>${escapeHtml(item.latestNote)}</blockquote>` : ''}<small>${escapeHtml(item.dayLabel || '')}${item.dayLabel ? ' · ' : ''}${escapeHtml(dateText(item.lastDetectedAt || item.createdAt))} · ${escapeHtml(alertAgeText(item))}</small>`;
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
    card.append(body, actions);
    return card;
  }

  // The day-to-day follow-up (a progression held, fewer sets, a skipped exercise) as one
  // row per student and signal, collapsed. What is open stays open across a re-render.
  let routineOpen = false;
  const openRoutineRows = new Set();

  function createRoutineRow(group) {
    const row = document.createElement('details'); row.className = 'review-routine-row';
    const size = group.exercises.length || group.items.length;
    const head = document.createElement('summary');
    head.innerHTML = `<span><strong>${escapeHtml(group.studentName)}</strong><small>${hintPrefix(group.studentUid)}${escapeHtml(REVIEW_TYPE[group.type])} · ${size} bài${group.oldCount ? ` · ${group.oldCount} cũ hơn 14 ngày` : ''}</small></span><b>${group.items.length}</b>`;
    row.appendChild(head);
    const materialize = () => {
      if (!row.open || row.querySelector('.review-routine-body')) return;
      const body = document.createElement('div'); body.className = 'review-routine-body';
      const lines = [...group.items].sort((a, b) => alertAgeDays(a) - alertAgeDays(b)).map((item) => `<li><span>${escapeHtml(item.exerciseName || item.title || '')}</span><small>${escapeHtml(item.dayLabel || '')}${item.dayLabel ? ' · ' : ''}${escapeHtml(alertAgeText(item))}${item.status !== 'open' ? ` · ${escapeHtml(REVIEW_STATUS[item.status])}` : ''}</small></li>`).join('');
      body.innerHTML = `<ul>${lines}</ul>`;
      const actions = document.createElement('div'); actions.className = 'review-routine-actions';
      if (group.openItems.length && onBulkAction) {
        const all = document.createElement('button'); all.type = 'button'; all.className = 'btn btn-primary'; all.textContent = `Đã xem tất cả (${group.openItems.length})`;
        all.addEventListener('click', async () => {
          if (!confirm(`Đánh dấu đã xem ${group.openItems.length} cảnh báo “${REVIEW_TYPE[group.type]}” của ${group.studentName}?\n\nBạn vẫn mở lại được từng cảnh báo sau đó.`)) return;
          all.disabled = true;
          try { await onBulkAction(group.openItems, 'viewed'); } finally { all.disabled = false; }
        });
        actions.append(all);
      }
      if (group.studentUid && group.studentUid !== 'unknown') {
        const open = document.createElement('button'); open.type = 'button'; open.className = 'btn btn-outline'; open.textContent = 'Mở hồ sơ học viên →';
        open.addEventListener('click', () => onOpenStudent(group.studentUid)); actions.append(open);
      }
      body.appendChild(actions); row.appendChild(body);
    };
    row.open = openRoutineRows.has(group.key);
    row.addEventListener('toggle', () => { if (row.open) openRoutineRows.add(group.key); else openRoutineRows.delete(group.key); materialize(); });
    materialize();
    return row;
  }

  function renderRoutine(results, items) {
    if (!items.length) return;
    const section = document.createElement('details'); section.className = 'review-routine';
    section.innerHTML = `<summary><div><strong>Theo dõi thường ngày</strong><small>Tín hiệu hệ thống thường gặp: giữ progression, giảm set, bỏ bài. Gom theo học viên, không đòi xử lý từng cái.</small></div><b>${items.length}</b></summary>`;
    const list = document.createElement('div'); list.className = 'review-routine-list';
    const materialize = () => { if (!section.open || list.childElementCount) return; groupRoutineAlerts(items).forEach((group) => list.appendChild(createRoutineRow(group))); };
    section.open = routineOpen;
    section.addEventListener('toggle', () => { routineOpen = section.open; materialize(); });
    section.appendChild(list); results.appendChild(section); materialize();
  }

  function appendLoadMore(results) {
    if (!hasMore || !onLoadMore) return;
    const wrap = document.createElement('div'); wrap.className = 'review-load-more';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'btn btn-outline';
    button.textContent = loadingMore ? 'Đang tải…' : 'Tải thêm 20 cảnh báo'; button.disabled = loadingMore;
    button.addEventListener('click', async () => {
      if (loadingMore) return;
      loadingMore = true; render();
      try { await onLoadMore(); }
      finally { loadingMore = false; render(); }
    });
    wrap.appendChild(button); results.appendChild(wrap);
  }

  function render() {
    const summary = summaryOverride || reviewSummary(mergedItems());
    root.querySelector('.review-summary').innerHTML = [
      ['Cần xem', summary.open, 'open'], ['Ưu tiên ngay', summary.urgent, 'urgent'],
      ['Lỗi kỹ thuật', summary.technical, 'technical'], ['Đang xử lý', summary.inProgress, 'progress'], ['Đã xử lý', summary.resolved, 'resolved'],
    ].map(([label, value, tone]) => `<div class="review-metric ${tone}"><strong>${value}</strong><span>${label}</span></div>`).join('');
    const results = root.querySelector('.review-results');
    if (mode === 'loading') { results.innerHTML = '<div class="review-state">Đang gom các điểm cần xem…</div>'; return; }
    if (mode === 'error') { results.innerHTML = `<div class="review-state error">${errorMessage || 'Chưa thể tải dashboard lúc này.'}<br><small>Kiểm tra mạng rồi tải lại trang. Không có dữ liệu nào bị thay đổi.</small></div>`; return; }
    const visible = filterReviewAlerts(mergedItems(), filters);
    if (!visible.length) {
      results.innerHTML = `<div class="review-state"><strong>Chưa thấy việc tồn đọng trong ${hasMore ? 'phần dữ liệu đã tải' : 'bộ lọc này'}.</strong><br><span>${hasMore ? 'Bạn có thể tải thêm để tìm trong các cảnh báo cũ hơn.' : 'Một khoảng trống tốt để tập trung vào coaching trực tiếp.'}</span></div>`;
      appendLoadMore(results); return;
    }
    results.innerHTML = '';
    const renderGroups = (items, title, copy) => {
      if (!items.length) return;
      const heading = document.createElement('div'); heading.className = 'review-section-heading';
      heading.innerHTML = `<div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(copy)}</small></div><b>${items.length}</b>`;
      results.appendChild(heading);
      groupReviewAlerts(items).forEach((group) => {
      const details = document.createElement('details'); details.className = 'review-student';
      details.open = group.items.some((item) => item.priority === 'urgent');
      const summaryNode = document.createElement('summary');
      summaryNode.innerHTML = `<span><strong>${escapeHtml(group.studentName)}</strong><small>${hintPrefix(group.studentUid)}${escapeHtml(CLIENT_CATEGORIES[group.items[0]?.clientCategory] || 'Nhóm khách hàng')}</small></span><b>${group.items.length}</b>`;
      details.appendChild(summaryNode);
      const materialize = () => {
        if (!details.open || details.querySelector('.review-list')) return;
        const list = document.createElement('div'); list.className = 'review-list';
        group.items.forEach((item) => list.appendChild(createAlertCard(item)));
        details.appendChild(list);
      };
      details.addEventListener('toggle', materialize);
      results.appendChild(details); materialize();
      });
    };
    const sections = reviewSections(visible);
    renderGroups(sections.urgent, 'Cần xử lý ngay', 'Đau, đề xuất deload và các tín hiệu an toàn. Luôn hiện đủ, kể cả khi đã cũ.');
    renderGroups(sections.coaching, 'Coaching cần xem', 'Feedback, hiệu suất giảm, hiệu chỉnh RIR và các việc cần mắt coach.');
    renderRoutine(results, sections.routine);
    renderGroups(sections.technical, 'Lỗi kỹ thuật', 'Chỉ chứa metadata tối thiểu; không lưu mức tạ, reps, ghi chú hay kế hoạch dinh dưỡng.');
    appendLoadMore(results);
  }
  render();
  return {
    setItems(next, pagination = {}) { firstPage = Array.isArray(next) ? next : []; olderPages = []; hasMore = pagination.hasMore === true; mode = 'ready'; render(); },
    setFirstPage(next, pagination = {}) {
      firstPage = Array.isArray(next) ? next : [];
      if (Object.prototype.hasOwnProperty.call(pagination, 'hasMore')) hasMore = pagination.hasMore === true;
      mode = 'ready'; render();
    },
    appendItems(next, pagination = {}) { olderPages = mergeReviewAlertPages(olderPages, Array.isArray(next) ? next : []); hasMore = pagination.hasMore === true; mode = 'ready'; render(); },
    patchItem(id, patch) {
      const apply = (items) => items.map((item) => item.id === id ? { ...item, ...patch } : item);
      firstPage = apply(firstPage); olderPages = apply(olderPages); pinned = apply(pinned); render();
    },
    setSummary(next) {
      summaryOverride = next && typeof next === 'object' ? next : null;
      // The urgent and technical alerts ride along with the summary, so none of them can
      // hide behind the pages of routine ones that have not been loaded.
      if (Array.isArray(next?.pinned)) pinned = next.pinned;
      render();
    },
    setStudents(next) { students = Array.isArray(next) ? next : []; render(); },
    setError(message) { mode = 'error'; errorMessage = message; render(); },
    setLoading() { mode = 'loading'; render(); },
  };
}
