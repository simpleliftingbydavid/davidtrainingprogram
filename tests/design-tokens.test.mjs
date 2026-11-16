// Bộ quy chuẩn giao diện (audit UX/UI 2026-11-13, đợt 2): một nguồn duy nhất, biến cũ trỏ về token,
// khu coach và trang đăng nhập theo cùng kiểu với phía học viên.
//   node tests/design-tokens.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');
const tokens = read('tokens.css');
const style = read('style.css');
const clientUi = read('client-ui.css');
const coachUi = read('coach-ui.css');
const COACH_PAGES = ['coach.html', 'dose-planner.html', 'program-library.html', 'templates.html', 'nutrition-builder.html',
  'coach-dishes.html', 'label-foods.html', 'meal-plan-intake.html', 'nutrition-update.html'];
const pages = readdirSync(new URL('..', import.meta.url)).filter((file) => file.endsWith('.html') && read(file).includes('href="style.css"'));

check('tokens.css names the brand colours, the type, three radii and the 7-step type scale', () => {
  [['--dc-navy', '#14213d'], ['--dc-orange', '#dd7a3b'], ['--dc-orange-text', '#a8501c'], ['--dc-bg', '#eef1f5'], ['--dc-border', '#d3d9e3']]
    .forEach(([name, value]) => assert.match(tokens, new RegExp(`${name}: ${value};`), name));
  assert.match(tokens, /--dc-font-display: "Barlow Condensed", "Be Vietnam Pro", sans-serif;/);
  assert.match(tokens, /--dc-font: "Be Vietnam Pro"/);
  assert.equal((tokens.match(/--dc-fs-[a-z0-9]+:/g) || []).length, 7);
  assert.deepEqual(tokens.match(/--dc-radius[a-z-]*:/g), ['--dc-radius-sm:', '--dc-radius:', '--dc-radius-pill:']);
  assert.doesNotMatch(tokens, /Playfair/);
});

check('every page loads tokens.css before style.css', () => {
  assert.ok(pages.length >= 20, `${pages.length} trang`);
  pages.forEach((file) => {
    assert.match(read(file), /<link rel="stylesheet" href="tokens\.css">\n<link rel="stylesheet" href="components\.css">\n<link rel="stylesheet" href="style\.css">/, file);
  });
});

check('the old variable names still exist and point at the tokens', () => {
  const root = style.slice(style.indexOf(':root {'), style.indexOf('}', style.indexOf(':root {')));
  ['--navy-900: var(--dc-navy)', '--accent: var(--dc-orange)', '--bg: var(--dc-bg)', '--surface: var(--dc-surface)', '--border: var(--dc-border)',
    '--text-500: var(--dc-text-500)', '--radius: var(--dc-radius)', '--font: var(--dc-font)', '--font-display: var(--dc-font-display)']
    .forEach((line) => assert.ok(root.includes(`${line};`), line));
  assert.doesNotMatch(root, /#[0-9a-f]{3,6}\b/i, 'style.css :root không còn mã màu viết cứng');
  ['--cu-navy: var(--dc-navy)', '--cu-orange: var(--dc-orange)', '--cu-orange-text: var(--dc-orange-text)', '--bg: var(--dc-bg)']
    .forEach((line) => assert.ok(clientUi.includes(`${line};`), line));
});

check('every token a stylesheet uses is defined', () => {
  const defined = new Set(tokens.match(/--dc-[a-z0-9-]+(?=:)/g));
  [style, clientUi, coachUi, read('login.html'), read('coach.html')].forEach((text) => {
    (text.match(/var\(--dc-[a-z0-9-]+/g) || []).forEach((use) => assert.ok(defined.has(use.slice(4)), use));
  });
});

check('the coach pages wear the shared coach layer and no longer load the serif', () => {
  COACH_PAGES.forEach((file) => {
    const page = read(file);
    assert.match(page, /<body class="coach-ui">/, file);
    assert.match(page, /<link rel="stylesheet" href="app-shell\.css">\n<link rel="stylesheet" href="coach-ui\.css">/, file);
    assert.match(page, /family=Barlow\+Condensed/, file);
    assert.doesNotMatch(page, /Playfair/, file);
  });
  assert.doesNotMatch(read('login.html'), /Playfair/);
  assert.match(read('login.html'), /family=Barlow\+Condensed/);
});

check('the coach layer only styles: no hard-coded colours, scoped to body.coach-ui, three button tiers', () => {
  const rules = coachUi.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(rules, /#[0-9a-f]{3,6}\b/i);
  rules.split('}').map((rule) => rule.split('{')[0].trim()).filter(Boolean)
    .forEach((selector) => selector.split(',').forEach((part) => assert.match(part.trim(), /^body\.coach-ui\b/, part)));
  ['.btn-primary', '.btn-outline', '.btn-text'].forEach((tier) => assert.ok(rules.includes(`body.coach-ui ${tier} {`), tier));
  assert.match(rules, /body\.coach-ui \.btn-primary \{ background: var\(--dc-orange\); color: var\(--dc-navy\); \}/, 'chữ navy trên nền cam');
  assert.doesNotMatch(rules, /display:\s*none|\bposition:|grid-template|\border:/, 'không đổi bố cục');
});

check('the client pages keep their own layer; the coach layer never loads there', () => {
  ['home.html', 'client.html', 'program.html', 'history.html', 'habits.html', 'nutrition.html', 'progress-photos.html']
    .forEach((file) => assert.doesNotMatch(read(file), /coach-ui\.css|class="coach-ui"/, file));
});

check('stage 3 cleanup: no page loads the serif; repeated inline styles are classes; shared rules live in one place', () => {
  pages.forEach((file) => {
    const page = read(file);
    assert.doesNotMatch(page, /Playfair/, file);
    assert.doesNotMatch(page, /style="padding:8px 16px;"/, file);
    assert.doesNotMatch(page, /<span class="brand" style="font-size:1rem;">/, file);
    assert.doesNotMatch(page, /<div style="display:flex; align-items:center; gap:10px;">/, file);
  });
  const components = read('components.css');
  assert.match(components, /\.btn\.btn-compact \{ padding: 8px 16px !important; \}/);
  assert.match(components, /\.brand\.brand-page \{ font-size: var\(--dc-fs-md\) !important; \}/);
  assert.match(components, /\.header-group \{ display: flex; align-items: center; gap: 10px; \}/);
  ['exercise-review.html', 'nutrition-review.html'].forEach((file) => {
    assert.doesNotMatch(read(file), /\.nr-table \{/, `${file}: bảng duyệt không còn lặp trong trang`);
    assert.match(read(file), /href="overview\.css"/, file);
  });
  assert.equal(read('overview.css').split('.nr-table { width: 100%;').length - 1, 1);
});

check('exact-match colours in stylesheets point at tokens', () => {
  const values = new Map([...tokens.matchAll(/(--dc-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[2].toLowerCase(), m[1]]));
  values.delete('#ffffff');
  ['style.css', 'client-ui.css', 'client-workout.css', 'app-shell.css', 'coach-ui.css', 'components.css', 'polish.css', 'overview.css', 'nutrition-intake.css', 'nutrition-coach-report.css']
    .forEach((file) => {
      const rules = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
      (rules.match(/#[0-9a-fA-F]{6}\b/g) || []).forEach((hex) => assert.ok(!values.has(hex.toLowerCase()), `${file}: ${hex} trùng token ${values.get(hex.toLowerCase())}`));
    });
});

check('habit calendar: days before tracking started are lighter but readable (at least 3:1)', () => {
  const lum = (hex) => { const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const light = tokens.match(/--dc-text-400: (#[0-9a-f]{6});/)[1];
  const text500 = tokens.match(/--dc-text-500: (#[0-9a-f]{6});/)[1];
  ['#ffffff', tokens.match(/--dc-orange-soft: (#[0-9a-f]{6});/)[1], tokens.match(/--dc-bg: (#[0-9a-f]{6});/)[1]]
    .forEach((bg) => assert.ok(ratio(light, bg) >= 3, `${light} trên ${bg}: ${ratio(light, bg).toFixed(2)}`));
  assert.ok(ratio(text500, '#ffffff') - ratio(light, '#ffffff') > 1.5, 'vẫn nhạt hơn ngày trong kỳ');
  assert.match(read('client-habits.css'), /body\.cu-habits \.habit-cell\.before \{ color: var\(--dc-text-400\); \}/);
  assert.match(read('habits.html'), /\.habit-cell\.before \{ background:transparent; border-style:dashed; color:var\(--dc-text-400\); \}/);
});

check('a table whose header sits on a transparent background keeps dark header text (Bộ dựng giáo án)', () => {
  const page = read('dose-planner.html');
  assert.match(page, /\.vol-table tr, \.vol-table th, \.vol-table td \{ background:transparent !important; \}/);
  assert.match(page, /body\.coach-ui \.vol-table thead th \{ color:var\(--dc-text-500\);/, 'chữ tiêu đề không còn màu sáng của nền navy');
  COACH_PAGES.filter((file) => file !== 'dose-planner.html').forEach((file) => {
    const css = (read(file).match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1];
    assert.doesNotMatch(css, /\bth\b[^{}]*\{[^}]*background:\s*transparent/, `${file}: tiêu đề bảng nền trong suốt cần chữ tối`);
  });
});

check('habits seen by the coach: small orange text uses the dark orange (at least 4.5:1)', () => {
  const page = read('habits.html');
  assert.match(page, /<span class="habit-legend-min">■ Bản 2 phút/);
  assert.doesNotMatch(page, /style="color:var\(--accent-dark\)"/);
  assert.match(page, /\.habit-legend-min \{ color:var\(--dc-orange-text\); \}/);
  assert.match(page, /body:not\(\.cu-habits\) \.eyebrow \{ color:var\(--dc-orange-text\); \}/);
  const lum = (hex) => { const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const orange = tokens.match(/--dc-orange-text: (#[0-9a-f]{6});/)[1];
  ['--dc-bg', '--dc-good-bg', '--dc-surface'].forEach((name) => {
    const bg = tokens.match(new RegExp(`${name}: (#[0-9a-f]{6});`))[1];
    const [x, y] = [lum(orange), lum(bg)].sort((m, n) => n - m);
    assert.ok((x + 0.05) / (y + 0.05) >= 4.5, `${orange} trên ${name}`);
  });
});

console.log(`DESIGN_TOKENS_OK ${passed} passed`);
