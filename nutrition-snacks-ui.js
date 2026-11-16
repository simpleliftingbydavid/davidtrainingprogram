// ============================================================
// DAVID COACHING — Khối "Bữa phụ bù macro" trên màn hình
// ============================================================
// Chỉ vẽ; phần tính ở nutrition-snacks.js. Tách từ nutrition-intake-ui.js ngày 2026-11-03
// khi bỏ thực đơn mẫu: phần ghi bữa theo thực đơn đã xoá, khối bữa phụ vẫn dùng cho chế độ
// tự ghi món.

import { fmtNumber, t } from './i18n.js';
import { dishName, foodName } from './food-text.js';
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const MACRO_LABELS = Object.freeze({ kcal: 'kcal', protein: 'protein', carbs: 'carb', fat: 'fat' });
const amount = (key, value) => (key === 'kcal'
  ? fmtNumber(Math.round(Number(value) || 0), { grouping: true })
  : fmtNumber(Math.round((Number(value) || 0) * 10) / 10, { grouping: true }));

function fullTotals(totals) {
  return ['kcal', 'protein', 'carbs', 'fat']
    .map((key) => (key === 'kcal' ? `${amount(key, totals[key])} kcal` : `${t(`nutrient.${MACRO_LABELS[key]}`)} ${amount(key, totals[key])} g`))
    .join(' · ');
}

const SNACK_GAP_LABEL = Object.freeze({ kcal: 'snack.gap.kcal', protein: 'snack.gap.protein', carbs: 'snack.gap.carbs', fat: 'snack.gap.fat' });

function gapText(key, value) {
  return key === 'kcal' ? `${amount('kcal', value)} kcal` : `${amount(key, value)} g ${t(SNACK_GAP_LABEL[key])}`;
}

/** Khối dưới bảng trong ngày, khi đã ăn hết các bữa. Rỗng khi không có gì để nói. */
export function snackSuggestionsMarkup(result) {
  if (!result) return '';
  if (result.status === 'over') {
    return `<div class="intake-snacks intake-snacks-quiet"><p>${t('snack.enough')}</p></div>`;
  }
  if (result.status !== 'suggest' && result.status !== 'none') return '';
  const order = ['protein', 'carbs', 'fat', 'kcal'];
  const missing = order.filter((key) => result.short.includes(key)).map((key) => gapText(key, result.gaps[key]));
  // Thiếu nhưng dưới ngưỡng thì nói rõ là bỏ qua được, để khớp với bảng phía trên.
  const minor = order.filter((key) => key !== 'kcal' && (result.minor || []).includes(key));
  const head = `<strong class="intake-snacks-title">${t('snack.title')}</strong>
    <p class="intake-snacks-gap">${t('snack.need', { list: escapeHtml(missing.join(', ')) })}</p>
    ${minor.length ? `<p class="intake-snacks-minor">${t('snack.minor', { list: escapeHtml(minor.map((key) => t(SNACK_GAP_LABEL[key])).join(', ')) })}</p>` : ''}`;
  if (result.status === 'none') {
    return `<div class="intake-snacks">${head}<p>${t('snack.none')}</p></div>`;
  }
  const items = result.snacks.map((snack) => {
    const single = snack.parts.length === 1 && snack.parts[0].food === snack.name;
    const parts = single
      ? `${amount('protein', snack.parts[0].grams)} g`
      : snack.parts.map((part) => `${foodName(part.food)} ${amount('protein', part.grams)} g`).join(' · ');
    return `<li>
      <span class="intake-snack-name">${escapeHtml(snack.source === 'david' ? snack.name : snack.source === 'app' ? dishName(snack) : foodName(snack.name))}${snack.source === 'david' ? ` <em>${t('snack.byDavid')}</em>` : ''}</span>
      <span class="intake-snack-parts">${escapeHtml(parts)}</span>
      <span class="intake-snack-macros">${escapeHtml(fullTotals(snack.totals))}</span>
      ${snack.note ? `<span class="intake-snack-note">${escapeHtml(snack.note)}</span>` : ''}
    </li>`;
  }).join('');
  return `<div class="intake-snacks">${head}
    <p class="intake-snacks-pick">${result.snacks.length > 1 ? t('snack.pickOne') : t('snack.suggestion')}</p>
    <ul class="intake-snack-list">${items}</ul>
    <p class="intake-snacks-foot">${t('snack.foot')}</p>
  </div>`;
}
