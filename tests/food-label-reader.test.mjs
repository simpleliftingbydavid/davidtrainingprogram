// Đọc ảnh nhãn dinh dưỡng (2026-11-17): chuẩn hoá kết quả Claude, kiểm tra ảnh, giới hạn lượt/ngày,
// lời gọi API (qua SDK với fetch giả), không lưu ảnh, và phần web (thu nhỏ ảnh, báo lỗi, tóm tắt).
//   node tests/food-label-reader.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const reader = require('./food-label-reader.js');
const Anthropic = require('@anthropic-ai/sdk');
const { scaledSize, readErrorText, readingSummary, MAX_EDGE } = await import('../label-photo-reader.js');
const { normalizeLabelFood } = await import('../nutrition-label-foods.js');

let passed = 0;
async function check(name, fn) {
  try { await fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const amount = (value, unit) => ({ amount: value, unit });
const emptyValues = () => Object.fromEntries([...reader.LABEL_KEYS, 'salt'].map((key) => [key, null]));

await check('a per-100 ml milk label comes back as form values in the app units', () => {
  const out = reader.normalizeLabelReading({
    nutritionTableFound: true, productNameFound: true, name: '  Sữa tươi   không đường ', brand: 'Vinamilk', unit: 'ml', basis: 'per100',
    servingLabel: '1 hộp 180 ml', servingAmount: 180,
    values: { ...emptyValues(), kcal: amount(63, 'kcal'), protein: amount(3.2, 'g'), carb: amount(4.8, 'g'), fat: amount(3.4, 'g'),
      sodium: amount(45, 'mg'), calcium: amount(0.12, 'g') },
  });
  assert.deepEqual(out.fields, { name: 'Sữa tươi không đường', brand: 'Vinamilk', unit: 'ml', basis: 'per100', servingLabel: '1 hộp 180 ml', servingAmount: 180 });
  assert.equal(out.values.kcal, 63);
  assert.equal(out.values.calcium, 120, 'g → mg');
  assert.equal(out.values.fiber, null, 'not on the label: left empty, not 0');
  assert.deepEqual(out.converted, [{ key: 'calcium', from: 'g', to: 'mg' }]);
  // The form check the save uses accepts what was read.
  const result = normalizeLabelFood({ ...out.fields, values: out.values });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

await check('kJ becomes kcal, salt becomes sodium, mg of fiber becomes g', () => {
  const out = reader.normalizeLabelReading({
    nutritionTableFound: true, productNameFound: false, name: null, brand: null, unit: 'g', basis: 'per100', servingLabel: null, servingAmount: null,
    values: { ...emptyValues(), kcal: amount(1674, 'kJ'), protein: amount(20, 'g'), carb: amount(50, 'g'), fat: amount(10, 'g'), fiber: amount(3000, 'mg'), salt: amount(1.25, 'g') },
  });
  assert.equal(out.values.kcal, 400.1);
  assert.equal(out.values.sodium, 500);
  assert.equal(out.values.fiber, 3);
  assert.deepEqual(out.converted.map((item) => item.from).sort(), ['kJ', 'mg', 'salt']);
  assert.equal(out.found.name, false);
});

await check('a per-serving number that is too high per 100 g is dropped for the user to type', () => {
  const out = reader.normalizeLabelReading({
    nutritionTableFound: true, productNameFound: true, name: 'Whey', brand: 'X', unit: 'g', basis: 'perServing', servingLabel: '1 muỗng 30 g', servingAmount: 30,
    values: { ...emptyValues(), kcal: amount(120, 'kcal'), protein: amount(24, 'g'), carb: amount(3, 'g'), fat: amount(1.5, 'g'), sodium: amount(13000, 'mg') },
  });
  assert.equal(out.values.protein, 24, 'kept as printed for the form; the form scales per serving');
  assert.equal(out.values.sodium, null);
  assert.deepEqual(out.dropped, ['sodium']);
});

await check('bad readings never become numbers', () => {
  const out = reader.normalizeLabelReading({ values: { ...emptyValues(), kcal: amount(-5, 'kcal'), protein: amount(Number.NaN, 'g'), carb: { amount: 5, unit: 'oz' } } });
  assert.equal(out.values.kcal, null);
  assert.equal(out.values.protein, null);
  assert.equal(out.values.carb, null);
  assert.deepEqual(out.found, { table: false, name: false });
});

await check('only 1 or 2 small JPEG/PNG/WebP images are accepted', () => {
  const ok = { mediaType: 'image/jpeg', data: 'QUJD' };
  assert.equal(reader.validateImages([ok]).length, 1);
  assert.equal(reader.validateImages([ok, ok]).length, 2);
  for (const bad of [[], [ok, ok, ok], [{ mediaType: 'image/gif', data: 'QUJD' }], [{ mediaType: 'image/jpeg', data: 'not base64!' }],
    [{ mediaType: 'image/jpeg', data: 'A'.repeat(7 * 1024 * 1024 + 1) }], 'x']) {
    assert.throws(() => reader.validateImages(bad), (error) => error.code === 'invalid-argument');
  }
});

await check('10 reads a day per person, counted in Vietnam time', async () => {
  const store = new Map();
  const db = {
    collection: (name) => ({ doc: (id) => ({ path: `${name}/${id}` }) }),
    runTransaction: async (fn) => fn({
      get: async (ref) => ({ exists: store.has(ref.path), data: () => store.get(ref.path) }),
      set: (ref, value) => store.set(ref.path, { ...(store.get(ref.path) || {}), ...value }),
    }),
  };
  const morning = new Date('2026-11-17T01:00:00Z');
  for (let i = 1; i <= 10; i++) assert.equal((await reader.reserveRead(db, 'u1', morning)).used, i);
  await assert.rejects(reader.reserveRead(db, 'u1', morning), (error) => error.code === 'resource-exhausted');
  assert.equal((await reader.reserveRead(db, 'u2', morning)).used, 1, 'per person');
  assert.equal((await reader.reserveRead(db, 'u1', new Date('2026-11-17T17:30:00Z'))).used, 1, 'a new Vietnam day (00:30 on the 18th)');
  assert.equal(reader.MAX_READS_PER_DAY, 10);
  assert.ok([...store.keys()].every((key) => key.startsWith('labelReadUsage/')));
});

await check('the request to Claude: Opus 5.5, images then instructions, a fixed JSON schema', async () => {
  const request = reader.buildRequest([{ mediaType: 'image/jpeg', data: 'QUJD' }]);
  assert.equal(request.model, 'claude-opus-5-5');
  assert.equal(request.output_config.format.type, 'json_schema');
  assert.equal(request.messages[0].content[0].type, 'image');
  assert.equal(request.messages[0].content.at(-1).type, 'text');
  assert.ok(!('thinking' in request) && !('temperature' in request) && !('tool_choice' in request));
  // Through the real SDK with a fake network: the body sent is what we built.
  let sent = null;
  const fakeFetch = async (url, init) => {
    sent = { url: String(url), headers: init.headers, body: JSON.parse(init.body) };
    return new Response(JSON.stringify({
      id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', stop_reason: 'end_turn', stop_sequence: null,
      usage: { input_tokens: 2500, output_tokens: 200 },
      content: [{ type: 'text', text: JSON.stringify({ nutritionTableFound: true, productNameFound: false, name: null, brand: null, unit: 'g', basis: 'per100', servingLabel: null, servingAmount: null, values: { ...emptyValues(), kcal: amount(100, 'kcal') } }) }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const client = new Anthropic({ apiKey: 'test-key', fetch: fakeFetch, maxRetries: 0 });
  const response = await client.beta.messages.create(request);
  assert.ok(sent.url.endsWith('/v1/messages?beta=true') || sent.url.includes('/v1/messages'));
  assert.equal(sent.body.model, 'claude-opus-5-5');
  assert.equal(sent.body.messages[0].content[0].source.media_type, 'image/jpeg');
  assert.deepEqual(sent.body.output_config.format, request.output_config.format);
  const parsed = reader.parseResponse(response);
  assert.equal(reader.normalizeLabelReading(parsed).values.kcal, 100);
  assert.throws(() => reader.parseResponse({ stop_reason: 'refusal', content: [] }), (error) => error.code === 'failed-precondition');
});

await check('photos are never stored or logged by the Cloud Function', () => {
  const source = read('functions/index.js');
  const block = source.slice(source.indexOf('exports.readFoodLabel'));
  assert.ok(block.length > 100);
  assert.ok(!/images[^;]*\.(set|add|update|create)\(|storage|bucket|getStorage\(\)\./i.test(block), 'no write of images');
  for (const log of block.match(/console\.(log|error)\([^;]*\);/g) || []) assert.ok(!/images\b(?!\.length|:)|\.data\b|\braw\b|\bparsed\b/.test(log.replace('images: images.length', '')), log);
  assert.match(block, /secrets: \[ANTHROPIC_API_KEY\]/);
  assert.ok(!/sk-ant-/.test(source), 'no key in the code');
});

await check('web: photos shrink to a 1568 px long edge, errors read plainly, the summary counts the fields', () => {
  assert.equal(MAX_EDGE, 1568);
  assert.deepEqual(scaledSize(4032, 3024), { width: 1568, height: 1176 });
  assert.deepEqual(scaledSize(800, 600), { width: 800, height: 600 });
  assert.match(readErrorText({ code: 'functions/resource-exhausted', details: { limit: 10 } }), /10/);
  for (const code of ['invalid-argument', 'failed-precondition', 'unavailable', 'not-found', 'unauthenticated', 'weird']) {
    assert.ok(readErrorText({ code: `functions/${code}` }).length > 10, code);
  }
  assert.match(readingSummary({ found: { table: true, name: true }, converted: [{ key: 'kcal', from: 'kJ' }], dropped: [] }, 7), /7.*kJ/s);
  assert.ok(readingSummary({ found: { table: false, name: false } }, 0).length > 10);
});

console.log(`FOOD_LABEL_READER_OK ${passed} passed`);
