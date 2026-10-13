// The shopping list on screen: the client's own (with "bought" ticks kept on their device)
// and the coach's read-only preview in the builder. All the adding-up is in
// nutrition-shopping.js; this file only draws it and remembers the ticks.

import { SHOPPING_NOTE, SHOPPING_RANGES, shoppingList, shoppingListText, shoppingRange } from './nutrition-shopping.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

/** The list's markup. Everything that comes from a plan is escaped: the coach types those lines. */
export function shoppingMarkup(list, { ticked = new Set(), tickable = false } = {}) {
  const line = (entry) => {
    const text = `<span class="shop-name">${escapeHtml(entry.label)}${entry.note ? `<small>${escapeHtml(entry.note)}</small>` : ''}</span><span class="shop-amount">${escapeHtml(entry.amount)}</span>`;
    if (!tickable) return `<li class="shop-item">${text}</li>`;
    const done = ticked.has(entry.key);
    return `<li><label class="shop-item${done ? ' done' : ''}"><input type="checkbox" data-shop-key="${escapeHtml(entry.key)}"${done ? ' checked' : ''}>${text}</label></li>`;
  };
  const groups = list.groups.map((group) => `<section class="shop-group"><h4>${escapeHtml(group.label)}</h4><ul class="shop-items">${group.items.map(line).join('')}</ul></section>`).join('');
  const bought = list.readyMade.filter((entry) => !entry.included);
  const readyMade = bought.length
    ? `<section class="shop-group shop-ready"><h4>Món mua sẵn trong những ngày này</h4><p class="shop-hint">Không tính vào danh sách ở trên. Nếu bạn tự nấu, hãy bật lựa chọn phía trên.</p><ul class="shop-items">${bought.map((entry) => `<li class="shop-item"><span class="shop-name">${escapeHtml(entry.dish)}<small>${escapeHtml(entry.when)}</small></span></li>`).join('')}</ul></section>`
    : '';
  const extras = list.extras.length
    ? `<section class="shop-group"><h4>Ghi thêm trong thực đơn</h4><p class="shop-hint">Những dòng David ghi thêm, không cộng được vào danh sách.</p><ul class="shop-items">${list.extras.map((entry) => `<li class="shop-item"><span class="shop-name">${escapeHtml(entry.text)}${entry.times > 1 ? `<small>${entry.times} lần</small>` : ''}</span></li>`).join('')}</ul></section>`
    : '';
  const empty = !list.groups.length && !bought.length ? '<p class="shop-hint">Chưa có nguyên liệu nào cần mua cho những ngày này.</p>' : '';
  return `${groups}${readyMade}${extras}${empty}<p class="shop-note">${escapeHtml(SHOPPING_NOTE)}</p>`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Older or locked-down browsers: copy through a throwaway text box.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    area.remove();
    return copied;
  }
}

/**
 * @param {object} options
 * @param {HTMLElement} options.root
 * @param {() => Array} options.getDays   the week to shop for, Monday first; read on every draw
 * @param {boolean} options.tickable      true for the client, who ticks what they have bought
 * @param {string} options.storageKey     where the ticks are kept on this device (per plan version)
 */
export function createShoppingPanel({ root, getDays, tickable = false, storageKey = '' }) {
  let rangeId = SHOPPING_RANGES[0].id;
  let includeReadyMade = false;
  let current = null;

  // Ticks are a convenience kept on the device. Storage can be missing or full (private
  // browsing), and the list must still work without it.
  const key = () => `${storageKey}:${rangeId}`;
  function loadTicks() {
    if (!tickable || !storageKey) return new Set();
    try { return new Set(JSON.parse(localStorage.getItem(key()) || '[]')); } catch { return new Set(); }
  }
  function saveTicks(ticked) {
    if (!tickable || !storageKey) return;
    try { localStorage.setItem(key(), JSON.stringify([...ticked])); } catch { /* the list still works */ }
  }

  function countLine(list, ticked) {
    const onList = new Set(list.groups.flatMap((group) => group.items.map((entry) => entry.key)));
    const done = [...ticked].filter((item) => onList.has(item)).length;
    return `${list.itemCount} nguyên liệu${tickable ? ` · đã mua ${done}` : ''}`;
  }

  function render() {
    const list = shoppingList(getDays() || [], { dayIndexes: shoppingRange(rangeId).days, includeReadyMade });
    const ticked = loadTicks();
    current = { list, ticked };
    const ranges = SHOPPING_RANGES.map((range) => `<button type="button" role="tab" class="shop-range${range.id === rangeId ? ' active' : ''}" data-shop-range="${range.id}" aria-selected="${range.id === rangeId}">${escapeHtml(range.label)}</button>`).join('');
    const toggle = list.readyMade.length
      ? `<label class="shop-toggle"><input type="checkbox" data-shop-ready${includeReadyMade ? ' checked' : ''}> Tôi tự nấu cả các món có thể mua sẵn</label>`
      : '';
    root.innerHTML = `<div class="shop-ranges" role="tablist" aria-label="Mua cho những ngày nào">${ranges}</div>
      ${toggle}
      <p class="shop-count" data-shop-count>${countLine(list, ticked)}</p>
      ${shoppingMarkup(list, { ticked, tickable })}
      <div class="shop-actions">
        <button type="button" class="btn btn-outline" data-shop-copy>Sao chép danh sách</button>
        ${tickable ? '<button type="button" class="btn btn-outline" data-shop-clear>Bỏ hết đánh dấu</button>' : ''}
        <span class="shop-status" data-shop-status role="status" aria-live="polite"></span>
      </div>`;
  }

  root.addEventListener('click', async (event) => {
    const range = event.target.closest('[data-shop-range]');
    if (range) { rangeId = range.dataset.shopRange; render(); return; }
    if (event.target.closest('[data-shop-clear]')) { saveTicks(new Set()); render(); return; }
    if (event.target.closest('[data-shop-copy]') && current) {
      const copied = await copyText(shoppingListText(current.list, { title: shoppingRange(rangeId).title }));
      const status = root.querySelector('[data-shop-status]');
      if (status) status.textContent = copied ? 'Đã sao chép.' : 'Chưa sao chép được trên trình duyệt này.';
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-shop-ready]')) { includeReadyMade = event.target.checked; render(); return; }
    const box = event.target.closest('[data-shop-key]');
    if (!box || !current) return;
    if (box.checked) current.ticked.add(box.dataset.shopKey); else current.ticked.delete(box.dataset.shopKey);
    saveTicks(current.ticked);
    box.closest('.shop-item')?.classList.toggle('done', box.checked);
    const count = root.querySelector('[data-shop-count]');
    if (count) count.textContent = countLine(current.list, current.ticked);
  });

  return { refresh: render };
}
