// ============================================================
// DAVID COACHING — Sản phẩm của tôi: form sản phẩm theo nhãn cho học viên (2026-11-17)
// ============================================================
// Cùng form và cùng kiểm tra với Món theo nhãn của coach (nutrition-label-foods.js), kèm khung chụp
// nhãn để điền sẵn (label-photo-reader.js). Học viên thêm, sửa, xoá sản phẩm của mình trong một khung
// nổi; sản phẩm hiện ngay trong kết quả tìm món của chính học viên.
import { t, fmtNumber } from './i18n.js';
import { labelFoodTitle, labelNutrients, normalizeLabelFood } from './nutrition-label-foods.js';
import { bindPhotoBar, photoBarMarkup } from './label-photo-reader.js';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (value, digits = 1) => fmtNumber(value, { maxFrac: digits, grouping: true });

const field = (key, label, required = false) => `<div class="field"><label for="lf-${key}">${label}${required ? ' <span class="req">*</span>' : ''}</label><input id="lf-${key}" data-key="${key}" inputmode="decimal"></div>`;

/** Form sản phẩm (cùng id và cấu trúc với form ở label-foods.html). */
export function labelFoodFormMarkup() {
  return `<form class="lf-form" id="lf-form" novalidate>
    ${photoBarMarkup()}
    <div class="lf-grid">
      <div class="field"><label for="lf-name">${t('lfh.ten_san_pham_span_class_req')}</label><input id="lf-name" maxlength="80" placeholder="${t('lfh.vd_sua_tuoi_khong_duong')}" autocomplete="off"></div>
      <div class="field"><label for="lf-brand">${t('lfh.hang')}</label><input id="lf-brand" maxlength="60" placeholder="${t('ph.e_g_vinamilk')}" autocomplete="off"></div>
    </div>
    <p class="lf-sub">${t('lfh.don_vi')}</p>
    <div class="lf-pills" role="radiogroup" aria-label="${t('lfh.don_vi')}">
      <label><input type="radio" name="lf-unit" value="g" checked> <span>${t('lfh.gram_do_an')}</span></label>
      <label><input type="radio" name="lf-unit" value="ml"> <span>${t('lfh.ml_do_uong')}</span></label>
    </div>
    <div class="lf-grid">
      <div class="field"><label for="lf-serving-label">${t('lfh.khau_phan_tren_nhan')}</label><input id="lf-serving-label" maxlength="40" placeholder="${t('lfh.vd_1_hop_180_ml')}" autocomplete="off"></div>
      <div class="field"><label for="lf-serving-amount">${t('lfh.luong_cua_1_khau_phan_span')}</label><input id="lf-serving-amount" inputmode="decimal" placeholder="${t('ph.e_g_180')}"></div>
    </div>
    <p class="lf-sub">${t('lfh.so_tren_nhan_tinh_theo')}</p>
    <div class="lf-pills" role="radiogroup" aria-label="${t('lfh.so_tren_nhan_tinh_theo')}">
      <label><input type="radio" name="lf-basis" value="per100" checked> 100 <span class="lf-unit-text">g</span></label>
      <label><input type="radio" name="lf-basis" value="perServing"> <span>${t('lfh.mot_khau_phan')}</span></label>
    </div>
    <div class="lf-grid four">
      ${field('kcal', t('lp.f.kcal'), true)}${field('protein', t('lp.f.protein'), true)}${field('carb', t('lp.f.carb'), true)}${field('fat', t('lp.f.fat'), true)}
    </div>
    <p class="lf-sub">${t('lfh.chat_khac_neu_nhan_co_bo')}</p>
    <div class="lf-grid four">
      ${field('fiber', t('lfh.chat_xo_g'))}${field('sodium', t('lp.f.sodium'))}${field('potassium', t('lp.f.potassium'))}${field('calcium', t('lp.f.calcium'))}
      ${field('magnesium', t('lp.f.magnesium'))}${field('iron', t('lfh.sat_mg'))}${field('zinc', t('lfh.kem_mg'))}
    </div>
    <p class="lf-preview" id="lf-preview">${t('lfh.nhap_so_tren_nhan_de_xem')}</p>
    <p class="lf-errors" id="lf-errors" hidden></p>
    <div class="lf-actions">
      <button type="submit" class="btn btn-primary" id="lf-save">${t('lfh.luu_san_pham')}</button>
      <button type="button" class="btn btn-outline" id="lf-cancel" hidden>${t('cdh.huy_sua')}</button>
    </div>
  </form>`;
}

/** Giá trị form, đúng dạng normalizeLabelFood nhận. */
export function labelFormValues(form) {
  const checked = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value;
  return {
    name: form.querySelector('#lf-name').value, brand: form.querySelector('#lf-brand').value, unit: checked('lf-unit'),
    servingLabel: form.querySelector('#lf-serving-label').value, servingAmount: form.querySelector('#lf-serving-amount').value, basis: checked('lf-basis'),
    values: Object.fromEntries([...form.querySelectorAll('[data-key]')].map((input) => [input.dataset.key, input.value])),
  };
}

const macroLine = (values) => t('cdh.kcal_dam_g_carb_g_beo', { p0: num(values.kcal, 0), p1: num(values.protein), p2: num(values.carb), p3: num(values.fat) });

/**
 * Khung nổi "Sản phẩm của tôi".
 * @param {{ host: HTMLElement, call: Function, list: () => object[], save: (raw, id) => Promise<string>,
 *   remove: (id) => Promise<void>, askDelete: (food) => Promise<boolean>, onChange: () => void, toast: Function }} options
 */
export function createMyProductsSheet({ host, call, list, save, remove, askDelete, onChange, toast }) {
  const sheet = document.createElement('div');
  sheet.className = 'lf-sheet';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'lf-sheet-title');
  host.appendChild(sheet);
  let editingId = null;
  let busy = false;
  let photo = null;
  let message = '';

  function listMarkup() {
    const foods = list();
    if (!foods.length) return `<p class="small-note">${t('lp.mine.none')}</p>`;
    return `<ul class="lf-mine-list">${foods.map((food) => {
      const n = labelNutrients(food.per100, 100).values;
      return `<li><span><strong>${escapeHtml(labelFoodTitle(food))}</strong><small>${t('lfh.tren_100_2', { p0: food.unit, p1: macroLine(n), p2: '' })}</small></span>
        <span class="lf-mine-actions"><button type="button" class="btn btn-outline" data-lf-edit="${food.id}">${t('nu.edit')}</button><button type="button" class="btn btn-outline" data-lf-del="${food.id}">${t('nu.delete')}</button></span></li>`;
    }).join('')}</ul>`;
  }

  function render() {
    sheet.innerHTML = `<div class="lf-sheet-panel">
      <div class="lf-sheet-head"><h3 id="lf-sheet-title">${editingId ? t('cdh.sua', { p0: labelFoodTitle(list().find((f) => f.id === editingId) || {}) }) : t('lp.mine.add')}</h3>
        <button type="button" class="btn btn-outline" data-lf-close>${t('progress.dong')}</button></div>
      <p class="small-note" style="margin:4px 0 0;">${t('lp.mine.intro')}</p>
      ${message ? `<p class="lf-sheet-done" role="status">${escapeHtml(message)}</p>` : ''}
      ${labelFoodFormMarkup()}
      <h3 style="margin:22px 0 0;font-size:var(--dc-fs-md);">${t('lp.mine.title')}</h3>
      ${listMarkup()}
    </div>`;
    const form = sheet.querySelector('#lf-form');
    photo = bindPhotoBar(sheet.querySelector('#lf-photo'), { form, call });
    const preview = () => {
      sheet.querySelectorAll('.lf-unit-text').forEach((node) => { node.textContent = form.querySelector('input[name="lf-unit"]:checked').value; });
      const result = normalizeLabelFood(labelFormValues(form));
      sheet.querySelector('#lf-errors').hidden = true;
      if (!result.ok) { sheet.querySelector('#lf-preview').textContent = t('lfh.nhap_ten_va_4_so_bat'); return; }
      const per100 = labelNutrients(result.food.per100, 100).values;
      sheet.querySelector('#lf-preview').innerHTML = `<strong>${t('lfh.tren_100', { p0: result.food.unit })}</strong> ${macroLine(per100)}`;
    };
    form.addEventListener('input', preview);
    form.addEventListener('change', preview);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      const raw = labelFormValues(form);
      const result = normalizeLabelFood(raw);
      if (!result.ok) { const box = sheet.querySelector('#lf-errors'); box.textContent = result.errors.join(' '); box.hidden = false; return; }
      busy = true;
      sheet.querySelector('#lf-save').disabled = true;
      try {
        const wasEditing = Boolean(editingId);
        await save(raw, editingId);
        editingId = null;
        message = wasEditing ? t('lp.mine.saved', { name: labelFoodTitle(result.food) }) : t('lp.mine.added', { name: labelFoodTitle(result.food) });
        toast(message);
        await onChange();
        render();
      } catch (error) {
        console.error(error);
        const box = sheet.querySelector('#lf-errors'); box.textContent = t('cdh.chua_luu_duoc', { p0: error.message }); box.hidden = false;
      } finally {
        busy = false;
        const button = sheet.querySelector('#lf-save'); if (button) button.disabled = false;
      }
    });
    sheet.querySelector('#lf-cancel').addEventListener('click', () => { editingId = null; message = ''; render(); });
    sheet.querySelector('[data-lf-close]').addEventListener('click', close);
    sheet.querySelectorAll('[data-lf-edit]').forEach((button) => button.addEventListener('click', () => {
      editingId = button.dataset.lfEdit;
      render();
      fill(sheet.querySelector('#lf-form'), list().find((food) => food.id === editingId));
    }));
    sheet.querySelectorAll('[data-lf-del]').forEach((button) => button.addEventListener('click', async () => {
      const food = list().find((item) => item.id === button.dataset.lfDel);
      if (!food || busy || !await askDelete(food)) return;
      busy = true;
      try { await remove(food.id); message = t('nu.fl.deleted', { name: labelFoodTitle(food) }); toast(message); await onChange(); render(); } catch (error) { console.error(error); toast(t('nu.fl.deleteFailed'), 'error'); } finally { busy = false; }
    }));
    if (editingId) { sheet.querySelector('#lf-save').textContent = t('cdh.luu_thay_doi'); sheet.querySelector('#lf-cancel').hidden = false; }
    preview();
  }

  function fill(form, food) {
    if (!form || !food) return;
    form.querySelector('#lf-name').value = food.name || '';
    form.querySelector('#lf-brand').value = food.brand || '';
    form.querySelector(`input[name="lf-unit"][value="${food.unit === 'ml' ? 'ml' : 'g'}"]`).checked = true;
    form.querySelector('#lf-serving-label').value = food.servingLabel || '';
    form.querySelector('#lf-serving-amount').value = food.servingAmount ? String(food.servingAmount).replace('.', ',') : '';
    form.querySelector('input[name="lf-basis"][value="per100"]').checked = true;
    form.querySelectorAll('[data-key]').forEach((input) => {
      const value = food.per100?.[input.dataset.key];
      input.value = value === null || value === undefined ? '' : String(value).replace('.', ',');
    });
    form.dispatchEvent(new Event('change'));
  }

  const onKey = (event) => { if (event.key === 'Escape') close(); };
  function open() { editingId = null; message = ''; render(); sheet.hidden = false; document.addEventListener('keydown', onKey); sheet.querySelector('#lf-name')?.focus(); }
  function close() { sheet.hidden = true; photo?.reset(); document.removeEventListener('keydown', onKey); }
  sheet.addEventListener('click', (event) => { if (event.target === sheet) close(); });
  return { open, close };
}
