import { t, locale } from './i18n.js';
import { reviewAlertText } from './review-alert-text.js';
import {
  REVIEW_PRIORITY, REVIEW_STATUS, REVIEW_TYPE, alertAgeDays, alertAgeText, filterReviewAlerts, groupReviewAlerts,
  groupRoutineAlerts, mergeReviewAlertPages, reviewSections, reviewSummary,
} from './review-dashboard-utils.js';
import { studentHintMap } from './student-name-utils.js';
import { confirmDialog } from './app-dialog.js';

const CLIENT_CATEGORIES = Object.freeze({ gym: t('coach.phong_tap'), freelance: 'Freelance', online: 'Online' });

function dateText(value) {
  const date = value?.toDate?.() || (value instanceof Date ? value : null);
  return date ? date.toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' }) : t('coach.vua_ghi_nhan');
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
    <div class="review-head"><div><span class="eyebrow">${t('cj.hang_doi_moi_ngay')}</span><h1>${t('cj.can_david_xem_lai')}</h1><p>${t('cj.nhung_diem_anh_huong_an_toan')}</p></div><span class="review-live">${t('cj.cap_nhat_truc_tiep')}</span></div>
    <div class="review-summary" aria-label="${t('cj.tom_tat_canh_bao')}"></div>
    <div class="review-filters">
      <label>${t('cj.tim_hoc_vien_hoac_van_de')}<input data-filter="search" type="search" placeholder="${t('cj.vi_du_hai_phong_dau_vai')}"></label>
      <label>${t('cj.nhom')}<select data-filter="category">${optionMarkup(CLIENT_CATEGORIES, CLIENT_CATEGORIES, t('cj.tat_ca_nhom'))}</select></label>
      <label>${t('cj.loai')}<select data-filter="type">${optionMarkup(REVIEW_TYPE, REVIEW_TYPE, t('cj.tat_ca_van_de'))}</select></label>
      <label>${t('cj.trang_thai')}<select data-filter="status">${optionMarkup(REVIEW_STATUS, REVIEW_STATUS, t('cj.tat_ca_trang_thai'))}</select></label>
      <label>${t('workout.result.time')}<select data-filter="age"><option value="">${t('pv.all')}</option><option value="recent">${t('cj.7_ngay_gan_day')}</option><option value="old">${t('cj.cu_hon_14_ngay')}</option></select></label>
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
    body.innerHTML = `<div class="review-tags"><span>${escapeHtml(REVIEW_PRIORITY[item.displayPriority || item.priority])}</span><span>${escapeHtml(REVIEW_TYPE[item.type])}</span><span>${escapeHtml(REVIEW_STATUS[item.status])}</span></div><h3>${escapeHtml(reviewAlertText(item.title) || REVIEW_TYPE[item.type])}</h3><p>${escapeHtml(reviewAlertText(item.summary || ''))}</p>${item.latestNote ? `<blockquote>${escapeHtml(reviewAlertText(item.latestNote))}</blockquote>` : ''}<small>${escapeHtml(item.dayLabel || '')}${item.dayLabel ? ' · ' : ''}${escapeHtml(dateText(item.lastDetectedAt || item.createdAt))} · ${escapeHtml(alertAgeText(item))}</small>`;
    const actions = document.createElement('div'); actions.className = 'review-actions';
    if (item.status === 'resolved') actions.append(makeButton(t('cj.mo_lai'), 'reopen', item));
    else {
      if (item.status === 'open') actions.append(makeButton(t('coach.da_xem'), 'viewed', item));
      if (item.type !== 'technical-error') {
        actions.append(makeButton(t('coach.dieu_chinh_giao_an'), 'adjust-program', item));
        actions.append(makeButton(t('coach.trao_doi_voi_hoc_vien'), 'contact-client', item));
      }
      actions.append(makeButton(t('coach.da_xu_ly'), 'complete', item, true));
    }
    if (item.type === 'technical-error' && item.supportCode) {
      const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'review-copy-support'; copy.textContent = t('cj.sao_chep_ma_ho_tro');
      copy.addEventListener('click', async () => { copy.textContent = await copyText(item.supportCode) ? t('cj.da_sao_chep') : item.supportCode; });
      actions.append(copy);
    }
    if (item.studentUid) {
      const open = document.createElement('button'); open.type = 'button'; open.className = 'review-open-student'; open.textContent = t('cj.mo_ho_so_hoc_vien');
      open.addEventListener('click', () => onOpenStudent(item.studentUid, item)); actions.append(open);
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
    head.innerHTML = `<span><strong>${escapeHtml(group.studentName)}</strong><small>${t('cj.bai', { p0: hintPrefix(group.studentUid), p1: escapeHtml(REVIEW_TYPE[group.type]), p2: size, p3: group.oldCount ? ` ${t('cj.cu_hon_14_ngay_2', { p0: group.oldCount })}` : '' })}</small></span><b>${group.items.length}</b>`;
    row.appendChild(head);
    const materialize = () => {
      if (!row.open || row.querySelector('.review-routine-body')) return;
      const body = document.createElement('div'); body.className = 'review-routine-body';
      const lines = [...group.items].sort((a, b) => alertAgeDays(a) - alertAgeDays(b)).map((item) => `<li><span>${escapeHtml(item.exerciseName || reviewAlertText(item.title) || '')}</span><small>${escapeHtml(item.dayLabel || '')}${item.dayLabel ? ' · ' : ''}${escapeHtml(alertAgeText(item))}${item.status !== 'open' ? ` · ${escapeHtml(REVIEW_STATUS[item.status])}` : ''}</small></li>`).join('');
      body.innerHTML = `<ul>${lines}</ul>`;
      const actions = document.createElement('div'); actions.className = 'review-routine-actions';
      if (group.openItems.length && onBulkAction) {
        const all = document.createElement('button'); all.type = 'button'; all.className = 'btn btn-primary'; all.textContent = `${t('cj.da_xem_tat_ca', { p0: group.openItems.length })}`;
        all.addEventListener('click', async () => {
          if (!await confirmDialog({ message: t('cx.danh_dau_da_xem', { n: group.openItems.length, type: REVIEW_TYPE[group.type], name: group.studentName }), confirmLabel: t('cj.da_xem_tat_ca_2'), cancelLabel: t('coach.thoi') })) return;
          all.disabled = true;
          try { await onBulkAction(group.openItems, 'viewed'); } finally { all.disabled = false; }
        });
        actions.append(all);
      }
      if (group.studentUid && group.studentUid !== 'unknown') {
        const open = document.createElement('button'); open.type = 'button'; open.className = 'btn btn-outline'; open.textContent = t('cj.mo_ho_so_hoc_vien');
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
    section.innerHTML = `<summary><div><strong>${t('cj.theo_doi_thuong_ngay')}</strong><small>${t('cj.tin_hieu_he_thong_thuong_gap')}</small></div><b>${items.length}</b></summary>`;
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
    button.textContent = loadingMore ? t('nu.loading') : t('cj.tai_them_20_canh_bao'); button.disabled = loadingMore;
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
      [t('cj.can_xem'), summary.open, 'open'], [t('cj.uu_tien_ngay'), summary.urgent, 'urgent'],
      [t('cj.loi_ky_thuat'), summary.technical, 'technical'], [t('cj.dang_xu_ly'), summary.inProgress, 'progress'], [t('coach.da_xu_ly'), summary.resolved, 'resolved'],
    ].map(([label, value, tone]) => `<div class="review-metric ${tone}"><strong>${value}</strong><span>${label}</span></div>`).join('');
    const results = root.querySelector('.review-results');
    if (mode === 'loading') { results.innerHTML = t('cj.div_class_review_state_dang_gom'); return; }
    if (mode === 'error') { results.innerHTML = `<div class="review-state error">${errorMessage || t('cj.chua_the_tai_dashboard_luc_nay')}<br><small>${t('cj.kiem_tra_mang_roi_tai_lai')}</small></div>`; return; }
    const visible = filterReviewAlerts(mergedItems(), filters);
    if (!visible.length) {
      results.innerHTML = `<div class="review-state"><strong>${t('cj.chua_thay_viec_ton_dong_trong', { p0: hasMore ? t('cj.phan_du_lieu_da_tai') : t('cj.bo_loc_nay') })}</strong><br><span>${hasMore ? t('cj.ban_co_the_tai_them_de') : t('cj.mot_khoang_trong_tot_de_tap')}</span></div>`;
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
      summaryNode.innerHTML = `<span><strong>${escapeHtml(group.studentName)}</strong><small>${hintPrefix(group.studentUid)}${escapeHtml(CLIENT_CATEGORIES[group.items[0]?.clientCategory] || t('coach.nhom_hoc_vien'))}</small></span><b>${group.items.length}</b>`;
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
    renderGroups(sections.urgent, t('cj.can_xu_ly_ngay'), t('cj.dau_de_xuat_deload_va_cac'));
    renderGroups(sections.coaching, t('cj.coaching_can_xem'), t('cj.phan_hoi_hieu_suat_giam_hieu'));
    renderRoutine(results, sections.routine);
    renderGroups(sections.technical, t('cj.loi_ky_thuat'), t('cj.chi_chua_metadata_toi_thieu_khong'));
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
    /** Open urgent alerts per student (technical errors excluded), for the student list. */
    urgentCountsByStudent() {
      const counts = new Map();
      mergedItems().forEach((item) => {
        if (item.priority !== 'urgent' || item.status === 'resolved' || item.type === 'technical-error' || !item.studentUid) return;
        counts.set(item.studentUid, (counts.get(item.studentUid) || 0) + 1);
      });
      return counts;
    },
    setError(message) { mode = 'error'; errorMessage = message; render(); },
    setLoading() { mode = 'loading'; render(); },
  };
}
