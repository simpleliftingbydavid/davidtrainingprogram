// ============================================================
// DAVID COACHING — Món theo nhãn dinh dưỡng (David, 2026-11-04)
// ============================================================
// Thuần: không DOM, không Firebase. David nhập sản phẩm đóng gói theo đúng nhãn của nhà sản xuất
// (sữa, sữa chua, ức gà đóng gói, whey…). Học viên của David chọn được sản phẩm đó khi ghi món.
//
// Số trên nhãn có thể theo 100 g / 100 ml hoặc theo 1 khẩu phần: app quy về 100 g/ml để lưu.
// Calo, đạm, carb, béo là bắt buộc (nhãn ở Việt Nam luôn có); chất nào nhãn không ghi thì để
// trống: tổng chất đó được đánh dấu "thiếu", không coi là 0.
// Mỗi món học viên đã ghi giữ bản sao số liệu, nên David sửa nhãn sau đó không đổi ngày cũ.

import { NUTRIENT_KEYS } from './nutrition-composition.js';

export const LABEL_UNITS = Object.freeze(['g', 'ml']);
export const LABEL_REQUIRED = Object.freeze(['kcal', 'protein', 'carb', 'fat']);
export const MAX_LABEL_AMOUNT = 3000;
const MAX_NAME = 80;
const MAX_BRAND = 60;
const MAX_SERVING_LABEL = 40;
/** Giới hạn trên 100 g/ml, để bắt lỗi gõ nhầm (VD gõ 1000 thay vì 100). */
const LIMITS = Object.freeze({
  kcal: 900, protein: 100, carb: 100, fat: 100, fiber: 100,
  potassium: 10000, sodium: 40000, calcium: 10000, magnesium: 5000, iron: 500, zinc: 500,
});

const text = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
/** Số từ ô nhập: dấu phẩy hay dấu chấm đều được; trống là null. */
export function labelNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(String(value).trim().replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(number) ? number : NaN;
}
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Kiểm tra và quy đổi một sản phẩm David nhập.
 * raw: { name, brand, unit, servingLabel, servingAmount, basis: 'per100'|'perServing', values: {key: số trên nhãn} }
 * @returns {{ok:true, food:{name, brand, unit, servingLabel, servingAmount, per100}} | {ok:false, errors:string[]}}
 */
export function normalizeLabelFood(raw = {}) {
  const errors = [];
  const name = text(raw.name, MAX_NAME);
  const brand = text(raw.brand, MAX_BRAND);
  const unit = LABEL_UNITS.includes(raw.unit) ? raw.unit : null;
  const servingLabel = text(raw.servingLabel, MAX_SERVING_LABEL);
  const servingAmount = labelNumber(raw.servingAmount);
  const basis = raw.basis === 'perServing' ? 'perServing' : 'per100';
  if (!name) errors.push('Nhập tên sản phẩm.');
  if (!unit) errors.push('Chọn đơn vị: g hoặc ml.');
  if (servingAmount !== null && !(servingAmount > 0 && servingAmount <= MAX_LABEL_AMOUNT)) errors.push(`Khẩu phần phải lớn hơn 0 và không quá ${MAX_LABEL_AMOUNT}.`);
  if (basis === 'perServing' && !(servingAmount > 0)) errors.push('Số trên nhãn tính theo khẩu phần: cần nhập lượng của 1 khẩu phần.');
  const factor = basis === 'perServing' && servingAmount > 0 ? 100 / servingAmount : 1;
  const per100 = {};
  NUTRIENT_KEYS.forEach((key) => {
    const value = labelNumber(raw.values?.[key]);
    if (value === null) {
      per100[key] = null;
      if (LABEL_REQUIRED.includes(key)) errors.push(`Nhập ${REQUIRED_NAMES[key]} trên nhãn.`);
      return;
    }
    if (!Number.isFinite(value) || value < 0) { errors.push(`${REQUIRED_NAMES[key] || key}: số không hợp lệ.`); per100[key] = null; return; }
    const scaled = round2(value * factor);
    if (scaled > LIMITS[key]) errors.push(`${REQUIRED_NAMES[key] || key}: ${scaled} trên 100 ${unit || 'g'} là quá cao, kiểm tra lại số trên nhãn.`);
    per100[key] = scaled;
  });
  if (errors.length) return { ok: false, errors };
  return { ok: true, food: { name, brand, unit, servingLabel, servingAmount: servingAmount ?? null, per100 } };
}

const REQUIRED_NAMES = Object.freeze({
  kcal: 'calo', protein: 'đạm', carb: 'carb', fat: 'béo', fiber: 'chất xơ',
  potassium: 'kali', sodium: 'natri', calcium: 'canxi', magnesium: 'magie', iron: 'sắt', zinc: 'kẽm',
});

/** Số liệu trên 100 g/ml đã lưu, làm sạch (số hoặc null), để tính và để lưu kèm món đã ghi. */
export function cleanPer100(per100 = {}) {
  return Object.fromEntries(NUTRIENT_KEYS.map((key) => {
    const value = per100?.[key];
    return [key, value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < 0 ? null : Number(value)];
  }));
}

/** 11 chất của một lượng sản phẩm (g hoặc ml theo đơn vị của nhãn). */
export function labelNutrients(per100, amount) {
  const clean = cleanPer100(per100);
  const k = Math.max(0, Number(amount) || 0) / 100;
  const values = {};
  const missing = [];
  NUTRIENT_KEYS.forEach((key) => {
    if (clean[key] === null) { values[key] = 0; missing.push(key); } else values[key] = clean[key] * k;
  });
  return { values, missing };
}

/** Tên hiển thị: "Sữa tươi không đường · Vinamilk". */
export const labelFoodTitle = (food) => (food?.brand ? `${food.name} · ${food.brand}` : String(food?.name || ''));
