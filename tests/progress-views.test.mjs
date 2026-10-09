// Run with:  node tests/progress-views.test.mjs
import assert from 'node:assert/strict';
import {
  angleBadgeMarkup, angleFilterMarkup, beforeAfterMarkup, measurementMarkup, milestonesMarkup,
  sparklineSvg, strengthMarkup, weightChartSvg, weightHeadlineMarkup,
} from '../progress-views.js';
import { weightTrend } from '../home-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const TODAY = '2026-10-09';
const at = (iso) => new Date(`${iso}T05:00:00Z`);
const photo = (iso, angle, url = 'https://x/y.jpg') => ({ id: `${angle}-${iso}`, takenAt: at(iso), angle, downloadURL: url });

check('with too few weigh-ins the headline gives the latest weight and does not claim a trend', () => {
  const html = weightHeadlineMarkup(weightTrend([{ loggedAt: at('2026-10-09'), weight: 70.24 }], TODAY));
  assert.match(html, /70\.2 kg/);
  assert.match(html, /Cân đều từ 4 lần mỗi tuần/);
  assert.doesNotMatch(html, /↑|↓|so với tuần trước/);
});

check('with enough weigh-ins the headline shows the change with an arrow', () => {
  const thisWeek = ['2026-10-09', '2026-10-08', '2026-10-07', '2026-10-06'].map((day) => ({ loggedAt: at(day), weight: 70 }));
  const lastWeek = ['2026-10-02', '2026-10-01', '2026-09-30', '2026-09-29'].map((day) => ({ loggedAt: at(day), weight: 71 }));
  const html = weightHeadlineMarkup(weightTrend([...thisWeek, ...lastWeek], TODAY));
  assert.ok(html.includes('↓ 1 kg</strong> so với tuần trước'), html);
  const up = weightHeadlineMarkup(weightTrend([...thisWeek.map((log) => ({ ...log, weight: 72 })), ...lastWeek], TODAY));
  assert.ok(up.includes('↑ 1 kg</strong> so với tuần trước'), up);
});

check('no weigh-ins at all says so', () => {
  assert.match(weightHeadlineMarkup(weightTrend([], TODAY)), /Chưa có số cân/);
});

check('the chart needs two weeks, and says so when it has fewer', () => {
  assert.match(weightChartSvg({ weeks: [{ start: '2026-10-05', avg: 70, count: 4, enough: true }], daily: [] }), /ít nhất 2 tuần/);
});

check('the chart draws a line, solid dots for trusted weeks and hollow ones for thin weeks', () => {
  const svg = weightChartSvg({
    weeks: [{ start: '2026-09-28', avg: 71, count: 2, enough: false }, { start: '2026-10-05', avg: 70, count: 4, enough: true }],
    daily: [{ day: '2026-09-29', weight: 71.2 }, { day: '2026-10-06', weight: 69.9 }],
  });
  assert.match(svg, /<polyline/);
  assert.equal((svg.match(/r="5" fill="var\(--accent\)"/g) || []).length, 1, 'one trusted week');
  assert.equal((svg.match(/r="4\.5"/g) || []).length, 1, 'one hollow week');
  assert.equal((svg.match(/opacity="\.35"/g) || []).length, 2, 'both daily weigh-ins');
  assert.doesNotMatch(svg, /NaN|undefined/);
});

check('a sparkline needs two points and never produces NaN for a flat series', () => {
  assert.equal(sparklineSvg([60]), '');
  assert.doesNotMatch(sparklineSvg([60, 60, 60]), /NaN/);
  assert.match(sparklineSvg([60, 70, 65]), /<polyline/);
});

check('strength cards show first to latest, the gain and the record badge, escaped', () => {
  const html = strengthMarkup([{ id: 'x', name: '<b>Squat</b>', sessions: 4, first: { weight: 60 }, latest: { weight: 75 }, best: 75, gain: 15, isRecord: true, series: [{ weight: 60 }, { weight: 75 }] }]);
  assert.match(html, /60 → <strong>75 kg<\/strong>/);
  assert.match(html, /\+15 kg/);
  assert.match(html, /Kỷ lục mới/);
  assert.doesNotMatch(html, /<b>Squat/);
});

check('an empty strength list explains what is needed', () => {
  assert.match(strengthMarkup([]), /ít nhất 2 buổi tập có tạ/);
});

check('milestones show earned badges and what is next with its remaining count', () => {
  const html = milestonesMarkup({
    earned: [{ label: '10 buổi tập' }],
    next: [{ label: '25 buổi tập', value: 12, target: 25, remaining: 13 }],
  });
  assert.match(html, /✓ 10 buổi tập/);
  assert.match(html, /<strong>1<\/strong> \/ 2 mốc đã đạt/);
  assert.match(html, /<details class="ms-earned"><summary>Xem các mốc đã đạt \(1\)/);
  assert.match(html, /còn 13/);
  assert.match(html, /aria-valuenow="48"/);
});

check('with nothing earned the page says how to begin', () => {
  assert.match(milestonesMarkup({ earned: [], next: [] }), /Chưa có mốc nào/);
});

check('the angle filter counts each angle and offers unclassified only when there are some', () => {
  const photos = [photo('2026-09-01', 'front'), photo('2026-09-02', 'front'), photo('2026-09-03', 'back')];
  const html = angleFilterMarkup(photos, 'front');
  assert.match(html, /data-angle-filter="all"[^>]*>Tất cả <span>3<\/span>/);
  assert.match(html, /class="angle-chip active" data-angle-filter="front"/);
  assert.match(html, /Side <span>0<\/span>/);
  assert.doesNotMatch(html, /Chưa phân loại/);
  assert.match(angleFilterMarkup([...photos, photo('2026-09-04', '')], 'all'), /Chưa phân loại <span>1<\/span>/);
});

check('a photo badge names its angle, or says it is unclassified', () => {
  assert.match(angleBadgeMarkup({ angle: 'side' }), />Side</);
  assert.match(angleBadgeMarkup({ angle: 'weird' }), /photo-angle none">Chưa phân loại/);
});

check('before and after shows both pictures with the days between, and escapes the address', () => {
  const html = beforeAfterMarkup([{
    angle: 'front', days: 61, beforeDay: '2026-08-01', afterDay: '2026-10-01',
    before: { downloadURL: 'https://x/a.jpg"><script>' }, after: { downloadURL: 'https://x/b.jpg' },
  }]);
  assert.match(html, /Sau 61 ngày/);
  assert.match(html, /01\/08\/2026/);
  assert.doesNotMatch(html, /<script/);
  assert.equal(beforeAfterMarkup([]), '');
});

check('the waist panel shows the latest, the change from the first, and recent entries', () => {
  const html = measurementMarkup({
    count: 3, first: { value: 88 }, latest: { value: 84, day: '2026-10-05' }, delta: -4,
    series: [{ value: 88, day: '2026-09-01' }, { value: 86.5, day: '2026-09-20' }, { value: 84, day: '2026-10-05' }],
  });
  assert.match(html, /84 cm/);
  assert.match(html, /↓ 4 cm so với lần đầu/);
  assert.equal((html.match(/weight-list-row/g) || []).length, 3);
  assert.match(measurementMarkup({ count: 0 }), /Chưa có số đo nào/);
});

console.log(`progress-views: ${passed} passed`);
