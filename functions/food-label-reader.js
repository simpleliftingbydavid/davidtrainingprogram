// ============================================================
// DAVID COACHING — Đọc ảnh nhãn dinh dưỡng (2026-11-17)
// ============================================================
// Coach (Món theo nhãn) và học viên (Sản phẩm của tôi) chụp bảng dinh dưỡng và/hoặc mặt trước sản
// phẩm; Claude đọc ảnh và trả về số trên nhãn theo một khuôn JSON cố định. File này thuần (không gọi
// mạng): khuôn JSON, lời dặn, chuẩn hoá đơn vị, kiểm tra giới hạn, đếm lượt mỗi ngày. Lời gọi Claude
// nằm ở index.js (readFoodLabel).
//
// Ảnh chỉ dùng để đọc rồi bỏ: không lưu ở Storage, Firestore hay log. Kết quả chỉ ĐIỀN SẴN vào form;
// người dùng vẫn xem lại và tự bấm lưu.

const MODEL = 'claude-opus-5-5';
const MAX_READS_PER_DAY = 10;
const MAX_IMAGES = 2;
/** Ảnh base64 tối đa ~7 MB chuỗi (~5 MB ảnh). Trình duyệt đã nén xuống cạnh dài 1.568 px. */
const MAX_IMAGE_BASE64 = 7 * 1024 * 1024;
const IMAGE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

/** 11 chất của app và đơn vị app lưu (giống NUTRIENT_UNITS ở nutrition-composition.js). */
const LABEL_KEYS = Object.freeze(['kcal', 'protein', 'carb', 'fat', 'fiber', 'potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc']);
const APP_UNITS = Object.freeze({
  kcal: 'kcal', protein: 'g', carb: 'g', fat: 'g', fiber: 'g',
  potassium: 'mg', sodium: 'mg', calcium: 'mg', magnesium: 'mg', iron: 'mg', zinc: 'mg',
});
/** Giới hạn trên 100 g/ml (giống nutrition-label-foods.js): vượt thì bỏ số, báo người dùng xem lại. */
const LIMITS = Object.freeze({
  kcal: 900, protein: 100, carb: 100, fat: 100, fiber: 100,
  potassium: 10000, sodium: 40000, calcium: 10000, magnesium: 5000, iron: 500, zinc: 500,
});
const READ_UNITS = Object.freeze(['kcal', 'kJ', 'g', 'mg', 'µg']);

const amountSchema = {
  anyOf: [
    { type: 'null' },
    {
      type: 'object',
      properties: { amount: { type: 'number' }, unit: { type: 'string', enum: READ_UNITS } },
      required: ['amount', 'unit'],
      additionalProperties: false,
    },
  ],
};

/** Khuôn JSON Claude phải trả (structured outputs). */
const LABEL_SCHEMA = Object.freeze({
  type: 'object',
  properties: {
    nutritionTableFound: { type: 'boolean' },
    productNameFound: { type: 'boolean' },
    name: { anyOf: [{ type: 'null' }, { type: 'string' }] },
    brand: { anyOf: [{ type: 'null' }, { type: 'string' }] },
    unit: { anyOf: [{ type: 'null' }, { type: 'string', enum: ['g', 'ml'] }] },
    basis: { anyOf: [{ type: 'null' }, { type: 'string', enum: ['per100', 'perServing'] }] },
    servingLabel: { anyOf: [{ type: 'null' }, { type: 'string' }] },
    servingAmount: { anyOf: [{ type: 'null' }, { type: 'number' }] },
    values: {
      type: 'object',
      properties: { ...Object.fromEntries(LABEL_KEYS.map((key) => [key, amountSchema])), salt: amountSchema },
      required: [...LABEL_KEYS, 'salt'],
      additionalProperties: false,
    },
  },
  required: ['nutritionTableFound', 'productNameFound', 'name', 'brand', 'unit', 'basis', 'servingLabel', 'servingAmount', 'values'],
  additionalProperties: false,
});

const PROMPT = `You are reading photos of a packaged food's label for a nutrition app in Vietnam.
Labels may be in Vietnamese or English (e.g. "Thành phần dinh dưỡng", "Giá trị dinh dưỡng", "Nutrition Facts").
Return exactly what is printed. Never estimate or guess a number that is not on the label: use null.

- name: the product name as printed on the front (keep the original language and accents), without the brand. null if not visible.
- brand: the manufacturer or brand name. null if not visible.
- unit: "ml" for drinks/liquids measured in ml, otherwise "g".
- basis: "per100" if the column you read is per 100 g / 100 ml; "perServing" if it is per serving/portion ("khẩu phần", "mỗi hộp", "per serving"). If the label shows both, read the per 100 g/ml column.
- servingLabel: the serving description as printed (e.g. "1 hộp 180 ml"), null if none. servingAmount: the serving size in g or ml as a number, null if none.
- values: the amount and its printed unit for energy (kcal; use kJ only if kcal is not printed), protein, carbohydrate (carb, total carbohydrate), fat (total fat), fiber (dietary fiber), potassium, sodium, calcium, magnesium, iron, zinc. If sodium is not printed but salt is, put salt in "salt". If a nutrient is given only as % daily value with no amount, use null.
- nutritionTableFound: false if no nutrition table is readable. productNameFound: false if no product name is readable.
Use a dot as the decimal separator (1,5 g on the label is 1.5).`;

const round2 = (value) => Math.round(value * 100) / 100;

/** Đổi một số đọc được sang đơn vị app lưu. Trả { value, from } (from: đơn vị gốc nếu đã đổi). */
function toAppUnit(key, reading) {
  if (!reading || typeof reading !== 'object') return { value: null };
  const amount = Number(reading.amount);
  const unit = String(reading.unit || '');
  if (!Number.isFinite(amount) || amount < 0) return { value: null };
  const target = APP_UNITS[key];
  if (unit === target) return { value: round2(amount) };
  if (key === 'kcal') return unit === 'kJ' ? { value: round2(amount / 4.184), from: 'kJ' } : { value: null };
  const toMg = { g: 1000, mg: 1, 'µg': 0.001 };
  if (!(unit in toMg)) return { value: null };
  const mg = amount * toMg[unit];
  return target === 'g' ? { value: round2(mg / 1000), from: unit } : { value: round2(mg), from: unit };
}

/**
 * Làm sạch kết quả Claude trả về thành dữ liệu điền form Món theo nhãn.
 * @returns {{ found: {table:boolean, name:boolean}, fields: {name, brand, unit, basis, servingLabel, servingAmount},
 *   values: Object<string, number|null>, converted: Array<{key, from, to}>, dropped: string[] }}
 */
function normalizeLabelReading(raw = {}) {
  const clean = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '') || null;
  const unit = raw.unit === 'ml' ? 'ml' : raw.unit === 'g' ? 'g' : null;
  const basis = raw.basis === 'perServing' ? 'perServing' : raw.basis === 'per100' ? 'per100' : null;
  const servingAmount = Number(raw.servingAmount);
  const fields = {
    name: clean(raw.name, 80),
    brand: clean(raw.brand, 60),
    unit,
    basis,
    servingLabel: clean(raw.servingLabel, 40),
    servingAmount: Number.isFinite(servingAmount) && servingAmount > 0 && servingAmount <= 3000 ? round2(servingAmount) : null,
  };
  const values = {};
  const converted = [];
  const dropped = [];
  const factor = basis === 'perServing' && fields.servingAmount ? 100 / fields.servingAmount : 1;
  LABEL_KEYS.forEach((key) => {
    let { value, from } = toAppUnit(key, raw.values?.[key]);
    if (key === 'sodium' && value === null) {
      // Chỉ có muối: natri (mg) = muối (g) × 1000 / 2,5.
      const salt = toAppUnit('fiber', raw.values?.salt).value; // muối quy về g
      if (salt !== null) { value = round2((salt * 1000) / 2.5); from = 'salt'; }
    }
    if (value !== null && basis && round2(value * factor) > LIMITS[key]) { dropped.push(key); value = null; from = undefined; }
    values[key] = value;
    if (value !== null && from) converted.push({ key, from, to: APP_UNITS[key] });
  });
  return {
    found: { table: raw.nutritionTableFound === true, name: raw.productNameFound === true },
    fields,
    values,
    converted,
    dropped,
  };
}

/** Kiểm tra ảnh gửi lên. Trả danh sách ảnh hợp lệ hoặc ném lỗi có mã. */
function validateImages(images) {
  if (!Array.isArray(images) || images.length === 0 || images.length > MAX_IMAGES) {
    throw Object.assign(new Error('Cần 1 hoặc 2 ảnh.'), { code: 'invalid-argument' });
  }
  return images.map((image) => {
    const mediaType = String(image?.mediaType || '');
    const data = String(image?.data || '');
    if (!IMAGE_TYPES.includes(mediaType) || !data || data.length > MAX_IMAGE_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(data)) {
      throw Object.assign(new Error('Ảnh không hợp lệ hoặc quá lớn.'), { code: 'invalid-argument' });
    }
    return { mediaType, data };
  });
}

/** Ngày theo giờ Việt Nam ("2026-11-17"), để đếm lượt trong ngày. */
function vietnamDayKey(now = new Date()) {
  return new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Giữ một lượt đọc trong ngày (transaction). Ném lỗi 'resource-exhausted' khi đã hết lượt.
 * db: Firestore Admin. Ghi vào labelReadUsage/{uid}_{ngày}: app không đọc hay ghi được (rules mặc định chặn).
 */
async function reserveRead(db, uid, now = new Date(), limit = MAX_READS_PER_DAY) {
  const day = vietnamDayKey(now);
  const ref = db.collection('labelReadUsage').doc(`${uid}_${day}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? Number(snap.data().count) || 0 : 0;
    if (count >= limit) throw Object.assign(new Error('Hết lượt đọc nhãn hôm nay.'), { code: 'resource-exhausted' });
    tx.set(ref, { uid, day, count: count + 1, updatedAt: now }, { merge: true });
    return { used: count + 1, limit };
  });
}

/** Nội dung gửi Claude: các ảnh rồi lời dặn. */
function buildRequest(images) {
  return {
    model: MODEL,
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: LABEL_SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        ...images.map((image) => ({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } })),
        { type: 'text', text: PROMPT },
      ],
    }],
  };
}

/** Lấy JSON từ câu trả lời của Claude. */
function parseResponse(response) {
  if (response?.stop_reason === 'refusal') throw Object.assign(new Error('refusal'), { code: 'failed-precondition' });
  const textBlock = (response?.content || []).find((block) => block.type === 'text');
  if (!textBlock) throw Object.assign(new Error('no text'), { code: 'internal' });
  return JSON.parse(textBlock.text);
}

module.exports = {
  MODEL, MAX_READS_PER_DAY, MAX_IMAGES, LABEL_KEYS, APP_UNITS, LABEL_SCHEMA, PROMPT,
  toAppUnit, normalizeLabelReading, validateImages, vietnamDayKey, reserveRead, buildRequest, parseResponse,
};
