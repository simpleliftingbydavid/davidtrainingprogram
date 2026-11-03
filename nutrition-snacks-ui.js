// ============================================================
// DAVID COACHING — Khối "Bữa phụ bù macro" trên màn hình
// ============================================================
// Chỉ vẽ; phần tính ở nutrition-snacks.js. Tách từ nutrition-intake-ui.js ngày 2026-11-03
// khi bỏ thực đơn mẫu: phần ghi bữa theo thực đơn đã xoá, khối bữa phụ vẫn dùng cho chế độ
// tự ghi món.

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const MACRO_LABELS = Object.freeze({ kcal: 'Calo', protein: 'Đạm', carbs: 'Carb', fat: 'Béo' });
const amount = (key, value) => (key === 'kcal'
  ? Math.round(Number(value) || 0).toLocaleString('vi-VN')
  : (Math.round((Number(value) || 0) * 10) / 10).toLocaleString('vi-VN'));

function fullTotals(totals) {
  return ['kcal', 'protein', 'carbs', 'fat']
    .map((key) => (key === 'kcal' ? `${amount(key, totals[key])} kcal` : `${MACRO_LABELS[key]} ${amount(key, totals[key])} g`))
    .join(' · ');
}

const SNACK_GAP_LABEL = Object.freeze({ kcal: 'kcal', protein: 'đạm', carbs: 'tinh bột', fat: 'béo' });

function gapText(key, value) {
  return key === 'kcal' ? `${amount('kcal', value)} kcal` : `${amount(key, value)} g ${SNACK_GAP_LABEL[key]}`;
}

/** Khối dưới bảng trong ngày, khi đã ăn hết các bữa. Rỗng khi không có gì để nói. */
export function snackSuggestionsMarkup(result) {
  if (!result) return '';
  if (result.status === 'over') {
    return '<div class="intake-snacks intake-snacks-quiet"><p>Calo hôm nay đã đủ, không cần ăn thêm.</p></div>';
  }
  if (result.status !== 'suggest' && result.status !== 'none') return '';
  const order = ['protein', 'carbs', 'fat', 'kcal'];
  const missing = order.filter((key) => result.short.includes(key)).map((key) => gapText(key, result.gaps[key]));
  // Thiếu nhưng dưới ngưỡng thì nói rõ là bỏ qua được, để khớp với bảng phía trên.
  const minor = order.filter((key) => key !== 'kcal' && (result.minor || []).includes(key));
  const head = `<strong class="intake-snacks-title">Bữa phụ bù macro</strong>
    <p class="intake-snacks-gap">Cần bù: ${escapeHtml(missing.join(', '))}.</p>
    ${minor.length ? `<p class="intake-snacks-minor">Phần ${escapeHtml(minor.map((key) => SNACK_GAP_LABEL[key]).join(', '))} còn thiếu ít, bỏ qua được.</p>` : ''}`;
  if (result.status === 'none') {
    return `<div class="intake-snacks">${head}<p>Chưa có món ăn nhẹ nào vừa phần còn thiếu. Ngày mai ăn đủ theo mục tiêu là được.</p></div>`;
  }
  const items = result.snacks.map((snack) => {
    const single = snack.parts.length === 1 && snack.parts[0].food === snack.name;
    const parts = single
      ? `${amount('protein', snack.parts[0].grams)} g`
      : snack.parts.map((part) => `${part.food} ${amount('protein', part.grams)} g`).join(' · ');
    return `<li>
      <span class="intake-snack-name">${escapeHtml(snack.name)}${snack.source === 'david' ? ' <em>David gợi ý</em>' : ''}</span>
      <span class="intake-snack-parts">${escapeHtml(parts)}</span>
      <span class="intake-snack-macros">${escapeHtml(fullTotals(snack.totals))}</span>
      ${snack.note ? `<span class="intake-snack-note">${escapeHtml(snack.note)}</span>` : ''}
    </li>`;
  }).join('');
  return `<div class="intake-snacks">${head}
    <p class="intake-snacks-pick">${result.snacks.length > 1 ? 'Chọn một trong các món sau:' : 'Gợi ý:'}</p>
    <ul class="intake-snack-list">${items}</ul>
    <p class="intake-snacks-foot">Không cần bù chính xác, ăn gần đúng là đủ.</p>
  </div>`;
}
