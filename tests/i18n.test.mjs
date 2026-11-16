// Song ngữ Việt / Anh (David chốt 2026-11-16). Đợt 1: hạ tầng, khung app, hộp thoại, Đăng nhập.
//   node tests/i18n.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import VI from '../i18n-vi.js';
import EN, { NOTES } from '../i18n-en.js';
import { I18N_PUBLIC, LANG_KEY, detectLang, fmtDate, fmtNumber, getLang, t } from '../i18n.js';
import { appShellItems } from '../app-shell.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');
const VIET = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const placeholders = (value) => [...new Set([...JSON.stringify(value).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

// Các file đã chuyển xong (thêm dần qua từng đợt).
const DONE_HTML = ['login.html', 'home.html', 'client.html', 'program.html', 'history.html'];
const DONE_JS = ['app-shell.js', 'app-dialog.js', 'client-ui.js', 'workout-view.js', 'apre-text.js', 'stage5-autoregulation.js',
  'session-entry-utils.js', 'workout-session-utils.js', 'workout-program-change-utils.js', 'training-tabs.js',
  'program-overview-utils.js', 'history-view.js'];

check('the two dictionaries have the same keys, the same {params} and the same plural shape', () => {
  assert.deepEqual(Object.keys(EN).sort(), Object.keys(VI).sort());
  for (const key of Object.keys(VI)) {
    assert.deepEqual(placeholders(EN[key]), placeholders(VI[key]), key);
    // Tiếng Việt không có số nhiều: bản Việt là một câu, bản Anh có thể là { one, other }.
    if (typeof VI[key] === 'object') assert.equal(typeof EN[key], 'object', key);
    if (typeof EN[key] === 'object') assert.ok(EN[key].one && EN[key].other, `${key}: cần one và other`);
    assert.ok(String(typeof EN[key] === 'object' ? EN[key].other : EN[key]).trim(), `${key}: trống`);
    assert.doesNotMatch(JSON.stringify(EN[key]), VIET, `${key}: còn chữ Việt trong bản tiếng Anh`);
  }
  for (const key of Object.keys(NOTES)) assert.ok(key in VI, `ghi chú cho key không có: ${key}`);
});

check('choosing the language: saved choice first; while rolling out, Vietnamese; then the browser', () => {
  assert.equal(LANG_KEY, 'dc_lang');
  assert.equal(detectLang({ saved: 'en', isPublic: false }), 'en');
  assert.equal(detectLang({ saved: 'vi', browser: ['en-US'], isPublic: true }), 'vi');
  assert.equal(detectLang({ saved: null, browser: ['en-US'], isPublic: false }), 'vi');
  assert.equal(detectLang({ saved: null, browser: ['vi-VN', 'en'], isPublic: true }), 'vi');
  assert.equal(detectLang({ saved: null, browser: ['vi'], isPublic: true }), 'vi');
  assert.equal(detectLang({ saved: null, browser: ['en-GB'], isPublic: true }), 'en');
  assert.equal(detectLang({ saved: null, browser: ['fr-FR'], isPublic: true }), 'en');
  assert.equal(detectLang({ saved: 'xx', browser: [], isPublic: true }), 'en');
  assert.equal(detectLang({ saved: 'xx', browser: [], isPublic: false }), 'vi');
  assert.equal(I18N_PUBLIC, false, 'chưa bật cho học viên khi chưa dịch xong mọi trang');
  assert.equal(getLang(), 'vi');
  // localStorage hỏng: không làm vỡ trang.
  assert.match(read('i18n.js'), /get\(\) \{ try \{ return globalThis\.localStorage\?\.getItem\(LANG_KEY\) \?\? null; \} catch \{ return null; \} \}/);
});

check('t(): params, English plurals, falls back to Vietnamese, then to the key', () => {
  assert.equal(t('shell.nav.home', {}, 'vi'), 'Trang chủ');
  assert.equal(t('shell.nav.home', {}, 'en'), 'Home');
  assert.equal(t('no.such.key', {}, 'en'), 'no.such.key');
  // Plural and params through a temporary entry.
  VI['test.sets'] = '{n} set'; EN['test.sets'] = { one: '{n} set', other: '{n} sets' };
  try {
    assert.equal(t('test.sets', { n: 1 }, 'en'), '1 set');
    assert.equal(t('test.sets', { n: 3 }, 'en'), '3 sets');
    assert.equal(t('test.sets', { n: 3 }, 'vi'), '3 set');
    delete EN['test.sets'];
    assert.equal(t('test.sets', { n: 2 }, 'en'), '2 set', 'thiếu bản tiếng Anh thì dùng tiếng Việt');
  } finally { delete VI['test.sets']; delete EN['test.sets']; }
});

check('numbers and dates by language', () => {
  assert.equal(fmtNumber(71.1, {}, 'vi'), '71,1');
  assert.equal(fmtNumber(71.1, {}, 'en'), '71.1');
  assert.equal(fmtNumber(2500, {}, 'en'), '2500');
  assert.equal(fmtNumber('x', {}, 'en'), '');
  assert.equal(fmtDate('2026-11-16', {}, 'vi'), '16/11');
  assert.equal(fmtDate('2026-11-16', { year: true }, 'vi'), '16/11/2026');
  assert.equal(fmtDate('2026-11-16', { weekday: true }, 'vi'), 'Thứ Hai 16/11');
  assert.equal(fmtDate('2026-11-16', {}, 'en'), 'Nov 16');
  assert.equal(fmtDate('2026-11-16', { year: true }, 'en'), 'Nov 16, 2026');
  assert.equal(fmtDate('2026-11-16', { weekday: true }, 'en'), 'Mon, Nov 16');
  assert.equal(fmtDate('', {}, 'en'), '');
});

check('Vietnamese pages stay exactly as they were: each marked element already holds the Vietnamese text', () => {
  for (const file of DONE_HTML) {
    const html = read(file);
    for (const m of html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)</g)) {
      assert.ok(m[1] in VI, `${file}: key không có: ${m[1]}`);
      assert.equal(decode(m[2]).trim(), VI[m[1]], `${file}: ${m[1]}`);
    }
    for (const m of html.matchAll(/data-i18n-(placeholder|aria-label|title)="([^"]+)"/g)) assert.ok(m[2] in VI, `${file}: ${m[2]}`);
  }
});

check('every key used in code exists', () => {
  for (const file of [...DONE_HTML, ...DONE_JS]) {
    const text = read(file);
    for (const m of text.matchAll(/\bt\('([\w.]+)'/g)) assert.ok(m[1] in VI, `${file}: ${m[1]}`);
    for (const m of text.matchAll(/data-i18n(?:-[a-z-]+)?="([\w.]+)"/g)) assert.ok(m[1] in VI, `${file}: ${m[1]}`);
    for (const m of text.matchAll(/key: '([\w.]+)'/g)) assert.ok(m[1] in VI, `${file}: ${m[1]}`);
  }
});

check('no Vietnamese written straight into the converted code (comments aside)', () => {
  const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  // Được phép: log cho lập trình viên (console.*), và bảng gốc tiếng Việt giữ cho dữ liệu đã lưu.
  // Và so khớp với thông báo lỗi do máy chủ trả về (message.includes(…)).
  const allowed = (line) => /console\.(warn|error|log)\(/.test(line) || /^export const LOAD_PER_LABELS = /.test(line.trim())
    || /message\.includes\('/.test(line);
  const loose = (code) => stripComments(code).split('\n').filter((line) => VIET.test(line) && !allowed(line));
  for (const file of DONE_JS) assert.deepEqual(loose(read(file)), [], file);
  for (const file of DONE_HTML) {
    const html = read(file);
    const scripts = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
    assert.deepEqual(loose(scripts), [], `${file} script`);
    // Chữ Việt trong phần HTML đều nằm trong phần tử có data-i18n.
    const body = html.split(/<body[^>]*>/)[1].split('<script')[0].replace(/<!--[\s\S]*?-->/g, '');
    const left = [...body.matchAll(/(<[^>]*>)([^<>]*)</g)]
      .filter((m) => VIET.test(m[2]) && !/data-i18n(-html)?(-init)?="/.test(m[1]))
      .map((m) => m[2].trim());
    assert.deepEqual(left, [], `${file} HTML`);
  }
});

check('the shell: labels from the dictionary; the VI/EN switch for the coach now, for clients when public', () => {
  assert.deepEqual(appShellItems('student').map((item) => t(item.key, {}, 'en')), ['Home', 'Training', 'Nutrition', 'Habits', 'Progress']);
  const shell = read('app-shell.js');
  assert.match(shell, /const showLang = role === 'coach' \|\| I18N_PUBLIC;/);
  assert.match(shell, /if \(showLang\) bindLangSwitch\(menu\);/);
  assert.match(read('app-dialog.js'), /t\(kind === 'notice' \? 'dialog\.gotIt' : 'dialog\.ok'\)/);
  assert.match(read('login.html'), /if \(I18N_PUBLIC\) \{ langBox\.innerHTML = langSwitchMarkup\(\);/);
});

check('the review file is up to date', () => {
  const review = read('i18n-review-en.md');
  for (const key of Object.keys(VI)) assert.ok(review.includes(`\`${key}\``), `chạy lại node scripts/i18n-review.mjs (${key})`);
});

console.log(`I18N_OK ${passed} passed`);
