// What the client actually ate, on screen: the editor under a meal ("Ăn khác kế hoạch"), the
// day against the plan, and the coach's read of it. All the counting is in
// nutrition-intake-utils.js; this file only draws it.

import {
  LOGGABLE_FOODS, QUICK_PORTIONS, canWeighCooked, dayIntake, intakeVerdict, mealLogTotals, normalizeMealLog,
  planGrams, plannedEntries, plannedTotals, weighedGrams,
} from './nutrition-intake-utils.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const MACRO_LABELS = Object.freeze({ kcal: 'Calo', protein: 'Đạm', carbs: 'Carb', fat: 'Béo' });
const unit = (key) => (key === 'kcal' ? ' kcal' : ' g');
const amount = (key, value) => (key === 'kcal'
  ? Math.round(Number(value) || 0).toLocaleString('vi-VN')
  : (Math.round((Number(value) || 0) * 10) / 10).toLocaleString('vi-VN'));
const portionLabel = (factor) => ({ 0.5: '½', 1: '1', 1.5: '1½' })[factor] || String(factor);

/** "520 kcal · Đạm 35 g": the two numbers a client checks first. */
export function shortTotals(totals) {
  return `${amount('kcal', totals.kcal)} kcal · Đạm ${amount('protein', totals.protein)} g`;
}

function fullTotals(totals) {
  return ['kcal', 'protein', 'carbs', 'fat']
    .map((key) => (key === 'kcal' ? `${amount(key, totals[key])} kcal` : `${MACRO_LABELS[key]} ${amount(key, totals[key])} g`))
    .join(' · ');
}

/** The line under a logged meal. */
export function mealLogBadgeText(log) {
  return `Đã ghi lượng thực tế: ${shortTotals(mealLogTotals(log))} (kế hoạch ${shortTotals(log.plannedTotals)})`;
}

/**
 * The editor under one meal. Each food of the meal starts at the plan's grams, so the client
 * changes only what differed; meat and fish can be weighed raw or cooked; ½ / 1 / 1½ set an
 * amount from the plan for a client without a scale; other foods can be added.
 */
export function createMealLogEditor({ meal, log = null, onSave, onRemove, onCancel }) {
  const hasAlternative = Boolean(meal.alternative?.items?.length);
  let option = log?.option === 'alternative' && hasAlternative ? 'alternative' : 'home';
  let rows = log ? log.items.map((item) => ({ ...item })) : plannedEntries(meal, option);
  const root = document.createElement('div');
  root.className = 'intake-editor';

  const draft = () => normalizeMealLog({
    mealId: meal.id, mealName: meal.name, option, items: rows, plannedTotals: plannedTotals(meal, option),
  });

  function rowMarkup(row, index) {
    const cookedOk = canWeighCooked(row.name);
    const plan = row.planned
      ? `Kế hoạch: ${Math.round(row.planned)} g${cookedOk ? ` sống (≈ ${Math.round(weighedGrams(row.planned, row.name, true))} g chín)` : ''}`
      : 'Thêm ngoài kế hoạch';
    const grams = Number(row.grams) || 0;
    return `<div class="intake-row${grams === 0 ? ' skipped' : ''}" data-row="${index}">
      <div class="intake-name">${escapeHtml(row.name)}<small>${escapeHtml(plan)}</small></div>
      <button type="button" class="intake-x" data-action="drop" aria-label="${row.planned ? `Không ăn ${escapeHtml(row.name)}` : `Bỏ ${escapeHtml(row.name)}`}">✕</button>
      <div class="intake-controls">
        <label class="intake-grams"><input type="number" inputmode="decimal" min="0" max="2000" step="1" value="${Math.round(grams)}" data-action="grams" aria-label="Số gram ${escapeHtml(row.name)}"><span>g</span></label>
        ${cookedOk ? `<span class="intake-seg" role="group" aria-label="Cân sống hay chín">
          <button type="button" data-action="raw" class="${row.cooked ? '' : 'on'}" aria-pressed="${!row.cooked}">sống</button><button type="button" data-action="cooked" class="${row.cooked ? 'on' : ''}" aria-pressed="${Boolean(row.cooked)}">chín</button>
        </span>` : ''}
        ${row.planned ? `<span class="intake-portions" role="group" aria-label="Theo lượng kế hoạch">${QUICK_PORTIONS.map((factor) => `<button type="button" class="intake-chip" data-action="portion" data-portion="${factor}" aria-label="${portionLabel(factor)} lượng kế hoạch">${portionLabel(factor)}</button>`).join('')}</span>` : ''}
      </div>
    </div>`;
  }

  function totalsMarkup() {
    const current = draft();
    return `<strong>Thực tế:</strong> ${fullTotals(mealLogTotals(current))}<br><span>Kế hoạch: ${fullTotals(current.plannedTotals)}</span>`;
  }

  function render() {
    const foodOptions = LOGGABLE_FOODS.map((group) => `<optgroup label="${escapeHtml(group.label)}">${group.names.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}</optgroup>`).join('');
    root.innerHTML = `
      <p class="intake-intro">Chỉ sửa món ăn khác kế hoạch. Thịt cá cân sau khi nấu thì chọn <strong>chín</strong>; không có cân thì bấm ½ · 1 · 1½ phần.</p>
      ${hasAlternative ? `<div class="intake-seg intake-option" role="group" aria-label="Bạn đã ăn cách nào">
        <button type="button" data-action="option" data-option="home" class="${option === 'home' ? 'on' : ''}" aria-pressed="${option === 'home'}">Cách 1 · Tự chuẩn bị</button><button type="button" data-action="option" data-option="alternative" class="${option === 'alternative' ? 'on' : ''}" aria-pressed="${option === 'alternative'}">Cách 2 · ${escapeHtml(meal.alternative.label || 'Đặt ngoài')}</button>
      </div>` : ''}
      <div class="intake-rows">${rows.map(rowMarkup).join('') || '<p class="intake-intro">Bữa này chưa có món nào ghi theo gram. Thêm món bạn đã ăn ở dưới.</p>'}</div>
      <div class="intake-add">
        <select data-add-food aria-label="Thêm món khác"><option value="">+ Thêm món khác…</option>${foodOptions}</select>
        <label class="intake-grams"><input type="number" inputmode="decimal" min="1" max="2000" step="1" placeholder="0" data-add-grams aria-label="Số gram món thêm"><span>g</span></label>
        <button type="button" class="btn btn-outline" data-action="add">Thêm</button>
      </div>
      <p class="intake-totals" data-totals>${totalsMarkup()}</p>
      <div class="intake-actions">
        <button type="button" class="btn btn-primary" data-action="save">Lưu bữa này</button>
        <button type="button" class="btn btn-outline" data-action="cancel">Huỷ</button>
        ${log ? '<button type="button" class="intake-remove" data-action="remove">Xoá ghi chép, coi như ăn đúng kế hoạch</button>' : ''}
      </div>`;
  }

  const refreshTotals = () => { root.querySelector('[data-totals]').innerHTML = totalsMarkup(); };

  root.addEventListener('input', (event) => {
    const input = event.target.closest('[data-action="grams"]');
    if (!input) return;
    const row = rows[Number(input.closest('[data-row]').dataset.row)];
    row.grams = Math.max(0, Math.min(2000, Number(input.value) || 0));
    input.closest('[data-row]').classList.toggle('skipped', row.grams === 0);
    refreshTotals();
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const holder = button.closest('[data-row]');
    const row = holder ? rows[Number(holder.dataset.row)] : null;
    if (action === 'raw' || action === 'cooked') {
      const cooked = action === 'cooked';
      if (Boolean(row.cooked) !== cooked) {
        // Only the way it is weighed changes, not how much was eaten.
        const raw = planGrams(row);
        row.cooked = cooked;
        row.grams = Math.round(weighedGrams(raw, row.name, cooked));
      }
    } else if (action === 'portion') {
      row.grams = Math.round(weighedGrams(row.planned * Number(button.dataset.portion), row.name, row.cooked));
    } else if (action === 'drop') {
      // A food of the plan stays on the list at 0 g, which is what "did not eat it" means;
      // a food the client added simply goes.
      if (row.planned) row.grams = 0; else rows = rows.filter((item) => item !== row);
    } else if (action === 'option') {
      if (button.dataset.option === option) return;
      option = button.dataset.option === 'alternative' ? 'alternative' : 'home';
      rows = plannedEntries(meal, option);
    } else if (action === 'add') {
      const name = root.querySelector('[data-add-food]').value;
      const grams = Number(root.querySelector('[data-add-grams]').value);
      if (!name) return;
      if (!Number.isFinite(grams) || grams <= 0 || grams > 2000) {
        root.querySelector('[data-add-grams]').focus();
        return;
      }
      rows = [...rows, { name, grams, planned: null, cooked: false }];
    } else if (action === 'save') {
      onSave?.(draft());
      return;
    } else if (action === 'cancel') {
      onCancel?.();
      return;
    } else if (action === 'remove') {
      onRemove?.();
      return;
    }
    render();
  });

  render();
  return root;
}

function verdictCell(item, complete) {
  if (!complete) {
    const left = Math.max(0, item.planned - item.actual);
    return `${amount(item.key, left)}${unit(item.key)}`;
  }
  if (item.status === 'ok') return 'Đạt';
  const word = item.status === 'under' ? 'Thiếu' : 'Dư';
  return `${word} ${amount(item.key, Math.abs(item.diff))}${unit(item.key)}`;
}

/**
 * The day against the plan. While meals are still open it shows what is left; once every
 * meal is logged or ticked it shows how far the day landed from the plan.
 */
export function intakeSummaryMarkup(day, { autoFilledKcal = null } = {}) {
  if (!day?.mealCount) return '';
  const verdict = intakeVerdict(day.planned, day.actual);
  const rows = verdict.map((item) => `<tr class="${day.complete ? `intake-${item.status}` : ''}">
    <th scope="row">${MACRO_LABELS[item.key]}</th>
    <td>${amount(item.key, item.planned)}</td>
    <td>${amount(item.key, item.actual)}</td>
    <td>${verdictCell(item, day.complete)}</td>
  </tr>`).join('');
  const notes = [
    `Tính từ ${day.accounted}/${day.mealCount} bữa${day.logged ? `, ${day.logged} bữa có ghi lượng thực tế` : ''}; bữa chỉ đánh dấu được tính đúng theo kế hoạch.`,
    day.complete ? '' : 'Bữa chưa đánh dấu hay ghi thì chưa được cộng.',
    day.eatenOut ? 'Món ăn ngoài chỉ tính calo và đạm.' : '',
    autoFilledKcal !== null ? `Đã điền sẵn ${amount('kcal', autoFilledKcal)} kcal vào ô “Calo đã ăn” bên dưới. Bấm “Lưu hôm nay” để lưu.` : '',
  ].filter(Boolean);
  return `<div class="intake-summary">
    <strong class="intake-summary-title">${day.complete ? 'Hôm nay so với kế hoạch' : 'Đến lúc này'}</strong>
    <table class="intake-table">
      <thead><tr><th></th><th scope="col">Kế hoạch</th><th scope="col">Đã ăn</th><th scope="col">${day.complete ? 'Lệch' : 'Còn lại'}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${notes.map((note) => `<p class="intake-note">${escapeHtml(note)}</p>`).join('')}
  </div>`;
}

/** One logged meal for the coach: its totals, then only the foods that differed. */
function loggedMealMarkup(log) {
  const changes = log.items.map((item) => {
    const weighed = `${amount('protein', item.grams)} g${item.cooked ? ` chín ≈ ${Math.round(planGrams(item))} g sống` : ''}`;
    if (!item.planned) return item.grams > 0 ? `thêm ${item.name} ${weighed}` : '';
    if (item.grams === 0) return `bỏ ${item.name}`;
    if (Math.abs(planGrams(item) - item.planned) <= item.planned * 0.02) return '';
    return `${item.name} ${weighed} (kế hoạch ${amount('protein', item.planned)} g)`;
  }).filter(Boolean);
  return `<div class="intake-history-meal"><strong>${escapeHtml(log.mealName || 'Bữa')}${log.option === 'alternative' ? ' · đặt ngoài' : ''}:</strong> ${escapeHtml(shortTotals(mealLogTotals(log)))} (kế hoạch ${escapeHtml(shortTotals(log.plannedTotals))})${changes.length ? `<br><span>${escapeHtml(changes.join('; '))}</span>` : ''}</div>`;
}

/**
 * A day of the client's report, for the coach. With the day's meals (the report belongs to the
 * plan on screen) the whole day is added up; otherwise only the logged meals are shown.
 */
export function historyIntakeMarkup(row, meals = null) {
  const logs = Array.isArray(row?.mealLogs) ? row.mealLogs.map(normalizeMealLog) : [];
  const day = meals?.length
    ? dayIntake({ meals, mealLogs: logs, completedMealIds: row.completedMealIds || [], foodLog: row.foodLog || [] })
    : null;
  const total = day && day.accounted
    ? `<div class="intake-history-day">Cả ngày: ${['kcal', 'protein', 'carbs', 'fat'].map((key) => `${MACRO_LABELS[key]} ${amount(key, day.actual[key])}/${amount(key, day.planned[key])}${unit(key)}`).join(' · ')} (${day.accounted}/${day.mealCount} bữa${day.complete ? '' : ', chưa đủ'})</div>`
    : '';
  return `${total}${logs.map(loggedMealMarkup).join('')}`;
}

/** The coach's summary of what keeps coming back: which meals and foods differ from the plan. */
export function patternsMarkup(patterns, { days = 14 } = {}) {
  const lines = [
    ...patterns.meals.map((item) => `${item.name}: ăn trung bình ${Math.round(item.ratio * 100)}% calo kế hoạch (${item.count} lần ghi)`),
    ...patterns.foods.slice(0, 6).map((item) => `${item.name}: trung bình ${Math.round(item.ratio * 100)}% lượng kế hoạch (${item.count} lần)`),
    ...patterns.extras.slice(0, 4).map((item) => `Hay ăn thêm: ${item.name} (${item.count} lần)`),
  ];
  if (!lines.length) return '';
  return `<div class="box box-note intake-patterns"><strong class="box-label">Lệch thường gặp · ${days} ngày gần nhất</strong>${lines.map((line) => `<div>${escapeHtml(line)}</div>`).join('')}</div>`;
}
