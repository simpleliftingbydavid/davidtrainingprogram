// Run with:  node tests/measurement-sites.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEASURE_KEYS, MEASURE_SITES, cleanMeasurements, measureGroups } from '../measurement-sites.js';
import { measurementOverview, measurementTrend } from '../progress-utils.js';
import { measurementsMarkup } from '../progress-views.js';
import { MEASURE_GUIDE } from '../progress-guides.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('the sites cover every place the guide describes, grouped in the guide\'s order', () => {
  assert.deepEqual(measureGroups().map((entry) => entry.group), ['Ngực / Lưng', 'Tay', 'Bụng', 'Hông', 'Chân']);
  assert.deepEqual(measureGroups().find((entry) => entry.group === 'Bụng').sites.map((site) => site.label), ['Trên rốn 5cm', 'Ngang rốn', 'Dưới rốn 5cm']);
  assert.equal(MEASURE_SITES.length, 9);
  assert.equal(new Set(MEASURE_KEYS).size, 9, 'no key twice');
});

check('every group in the guide is a group of sites', () => {
  const headings = [...MEASURE_GUIDE.text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, measureGroups().map((entry) => entry.group));
});

check('the old waist number is the navel, so it stays the same field', () => {
  assert.equal(MEASURE_SITES.find((site) => site.key === 'waistCm').label, 'Ngang rốn');
});

check('blank sites are skipped and the typed ones are kept, rounded to a tenth', () => {
  assert.deepEqual(cleanMeasurements({ chestCm: '102,46', armLeftCm: '', armRightCm: null, waistCm: 84 }), { values: { chestCm: 102.5, waistCm: 84 }, error: '' });
});

check('nothing typed, or one number out of range, is refused with a clear message', () => {
  assert.equal(cleanMeasurements({}).error, 'Nhập ít nhất một số đo.');
  assert.equal(cleanMeasurements({ chestCm: '  ' }).error, 'Nhập ít nhất một số đo.');
  assert.equal(cleanMeasurements({ armLeftCm: 400 }).error, 'Nhập tay trái từ 10 đến 100 cm.');
  assert.equal(cleanMeasurements({ waistCm: 'abc' }).error, 'Nhập ngang rốn từ 30 đến 250 cm.');
  assert.deepEqual(cleanMeasurements({ chestCm: 100, hipsCm: 5 }).values, {}, 'one bad number saves nothing');
});

check('a site not in the list is ignored', () => {
  assert.deepEqual(cleanMeasurements({ chestCm: 100, evil: 1 }).values, { chestCm: 100 });
});

check('the limits in firestore.rules are the limits here', () => {
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  for (const site of MEASURE_SITES) {
    assert.ok(rules.includes(`validCm(data, '${site.key}', ${site.min}, ${site.max})`), `${site.key} ${site.min}-${site.max}`);
  }
  const listed = rules.match(/data\.keys\(\)\.hasAny\(\[([^\]]+)\]\)/)[1].split(',').map((key) => key.trim().replace(/'/g, ''));
  assert.deepEqual(listed, MEASURE_KEYS);
});

const at = (day) => new Date(`${day}T05:00:00Z`);
const logs = [
  { loggedAt: at('2026-10-05'), waistCm: 84, chestCm: 101 },
  { loggedAt: at('2026-09-20'), waistCm: 86, armLeftCm: 33 },
  { loggedAt: at('2026-09-01'), waistCm: 88 },
];

check('each site has its own trend, built only from the days it was measured', () => {
  assert.equal(measurementTrend(logs, 'waistCm').count, 3);
  assert.equal(measurementTrend(logs, 'waistCm').delta, -4);
  assert.equal(measurementTrend(logs, 'chestCm').count, 1);
  assert.equal(measurementTrend(logs, 'chestCm').delta, null);
  assert.equal(measurementTrend(logs, 'hipsCm').count, 0);
  assert.equal(measurementTrend(logs).latest.value, 84, 'the navel is the default site');
});

check('the overview lists only what has been measured, grouped, in the guide\'s order', () => {
  const overview = measurementOverview(logs);
  assert.deepEqual(overview.map((entry) => entry.group), ['Ngực / Lưng', 'Tay', 'Bụng']);
  assert.deepEqual(overview.find((entry) => entry.group === 'Bụng').rows.map((row) => row.site.key), ['waistCm']);
  assert.deepEqual(measurementOverview([]), []);
});

check('the measurements panel shows each site\'s latest and its change, and escapes what it prints', () => {
  const html = measurementsMarkup(measurementOverview(logs));
  assert.match(html, /<h4>Bụng<\/h4>/);
  assert.match(html, /Ngang rốn/);
  assert.match(html, /<strong>84 cm<\/strong>/);
  assert.match(html, /↓ 4 cm/);
  assert.match(html, /Tay trái/);
  assert.match(measurementsMarkup([]), /Chưa có số đo nào/);
  const hostile = measurementsMarkup([{ group: '<script>x</script>', rows: [{ site: { label: '<b>' }, trend: { count: 1, latest: { value: 1, day: '2026-10-05' }, delta: null, series: [] } }] }]);
  assert.doesNotMatch(hostile, /<script>|<b>/);
});

console.log(`measurement-sites: ${passed} passed`);
