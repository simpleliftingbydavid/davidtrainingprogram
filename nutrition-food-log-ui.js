// Nhật ký ăn uống học viên tự ghi, cho coach đọc (Mốc 3, 2026-11-03). Dùng ở nutrition.html (phía
// coach) và overview.html. Chỉ vẽ: phần tính ở nutrition-food-log.js. Kiểu chữ ở nutrition-intake.css.

import { FOOD_LOG_MEALS, entryAmountLabel, entryNutrients, nutrientProgress } from './nutrition-food-log.js';
import { NUTRIENT_KEYS, NUTRIENT_LABELS, NUTRIENT_UNITS, roundNutrients } from './nutrition-composition.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
const digitsOf = (key) => (key === 'iron' || key === 'zinc' ? 1 : key === 'kcal' || NUTRIENT_UNITS[key] === 'mg' ? 0 : 1);
const fmt = (key, value) => (value === null || value === undefined ? '—'
  : `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: digitsOf(key) })}${key === 'kcal' ? ' kcal' : ` ${NUTRIENT_UNITS[key]}`}`);

function amountText(entry) {
  return entryAmountLabel(entry);
}

/** Bảng 11 chất: đã ăn (hoặc trung bình), mục tiêu, trạng thái. */
export function nutrientTableMarkup(values, missing, targets, { caption = 'Đã ăn' } = {}) {
  const rows = nutrientProgress({ values, missing }, targets);
  return `<table class="flv-table">
    <thead><tr><th></th><th scope="col">${escapeHtml(caption)}</th><th scope="col">Mục tiêu</th><th scope="col"></th></tr></thead>
    <tbody>${rows.map((row) => {
      const state = !row.target ? '' : row.status === 'over' ? 'Vượt' : row.status === 'done' ? (row.limit ? 'Dưới mức' : 'Đạt') : `${Math.round(row.eaten / row.target * 100)}%`;
      return `<tr class="is-${row.status}">
        <th scope="row">${NUTRIENT_LABELS[row.key]}${row.limit ? ' <em>tối đa</em>' : ''}</th>
        <td>${fmt(row.key, row.eaten)}${row.unknown ? '<sup title="Có món chưa có số liệu">*</sup>' : ''}</td>
        <td>${row.target ? fmt(row.key, row.target) : '—'}</td>
        <td class="flv-state">${state}</td>
      </tr>`;
    }).join('')}</tbody>
  </table>
  ${missing.length ? '<p class="flv-note">* Có món chưa có số liệu cho chất này: tổng có thể thấp hơn thật.</p>' : ''}`;
}

/** Một ngày: các món theo bữa, rồi bảng 11 chất so với mục tiêu. */
export function foodLogDayMarkup(day, targets) {
  if (!day?.entries.length) return '<p class="flv-note">Học viên không ghi món nào hôm này.</p>';
  const meals = FOOD_LOG_MEALS.map((meal) => {
    const items = day.entries.filter((entry) => entry.meal === meal.id);
    if (!items.length) return `<div class="flv-meal is-empty"><strong>${meal.label}</strong><span>không ghi</span></div>`;
    const sub = day.totals.perMeal[meal.id].values;
    return `<div class="flv-meal">
      <strong>${meal.label}<span>${fmt('kcal', sub.kcal)}</span></strong>
      <ul>${items.map((entry) => {
        const n = roundNutrients(entryNutrients(entry));
        return `<li><span>${escapeHtml(entry.name)} <small>${escapeHtml(amountText(entry))}</small></span><em>${fmt('kcal', n.values.kcal)} · Đ ${fmt('protein', n.values.protein)}</em></li>`;
      }).join('')}</ul>
    </div>`;
  }).join('');
  return `<div class="flv-day">${meals}${day.totals.estimated ? '<p class="flv-note">Có món ăn ngoài: số liệu là ước tính.</p>' : ''}
    ${nutrientTableMarkup(day.totals.values, day.totals.missing, targets)}</div>`;
}

/** Trung bình mỗi ngày trên những ngày có ghi. */
export function foodLogAveragesMarkup(summary, targets) {
  if (!summary.loggedDays) return '<p class="flv-note">Chưa có ngày nào ghi món trong khoảng này.</p>';
  const values = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, summary.averages[key] ?? 0]));
  return `<p class="flv-note">Trung bình trên ${summary.loggedDays}/${summary.countedDays} ngày có ghi${summary.estimated ? ', có món ăn ngoài (ước tính)' : ''}.</p>
    ${nutrientTableMarkup(values, summary.missing, targets, { caption: 'TB/ngày' })}`;
}
