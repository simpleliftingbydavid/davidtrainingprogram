// Hộp thoại và thông báo riêng thay alert / confirm / prompt của trình duyệt
// (audit UX/UI, giai đoạn 3; David chốt 2a ngày 2026-11-14).
//   node tests/app-dialog.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dialogResult, splitDialogMessage } from '../app-dialog.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r/g, '');
const root = new URL('..', import.meta.url);
const sources = readdirSync(root).filter((file) => (file.endsWith('.html') || file.endsWith('.js')) && file !== 'engine-test-harness.html');
const module = read('app-dialog.js');
const css = read('components.css');

check('no browser alert, confirm or prompt is left in the code the pages run', () => {
  sources.forEach((file) => {
    const code = read(file).split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
    assert.doesNotMatch(code, /\bwindow\.(alert|confirm|prompt)\(/, file);
    assert.doesNotMatch(code, /(^|[^.\w])(confirm|prompt)\(/m, file);
    // nutrition-plateau-engine.js có hàm riêng tên alert(level, title, body), không phải hộp thoại.
    if (file !== 'nutrition-plateau-engine.js') assert.doesNotMatch(code, /(^|[^.\w])alert\(/m, file);
  });
});

check('each button and key gives the right answer', () => {
  assert.equal(dialogResult('confirm', 'confirm'), true);
  assert.equal(dialogResult('confirm', 'cancel'), false);
  assert.equal(dialogResult('confirm', ''), false, 'đóng không qua nút nào là huỷ');
  assert.equal(dialogResult('prompt', 'confirm', 'Huy A'), 'Huy A');
  assert.equal(dialogResult('prompt', 'confirm', ''), '', 'để trống rồi đồng ý vẫn trả chuỗi rỗng');
  assert.equal(dialogResult('prompt', 'cancel', 'Huy A'), null);
  assert.equal(dialogResult('notice', 'confirm'), undefined);
});

check('a message splits into a title and a body', () => {
  assert.deepEqual(splitDialogMessage('Xoá ảnh này? Không thể hoàn tác.'), { title: 'Xoá ảnh này?', body: 'Không thể hoàn tác.' });
  assert.deepEqual(splitDialogMessage('Xóa “A” khỏi danh sách?\n\nLịch sử vẫn giữ nguyên.'), { title: 'Xóa “A” khỏi danh sách?', body: 'Lịch sử vẫn giữ nguyên.' });
  assert.deepEqual(splitDialogMessage('Áp dụng thời gian nghỉ mới cho lượt nghỉ đang chạy?'), { title: 'Áp dụng thời gian nghỉ mới cho lượt nghỉ đang chạy?', body: '' });
  assert.deepEqual(splitDialogMessage(''), { title: '', body: '' });
});

check('the dialog: native <dialog>, Enter confirms a text prompt, a delete defaults to cancel, focus returns', () => {
  assert.match(module, /dialog\.showModal\(\);/);
  assert.ok(module.indexOf('value="confirm"') < module.indexOf('value="cancel"'), 'nút đồng ý đứng trước trong mã: Enter ở ô nhập là đồng ý');
  assert.match(module, /dialog\.querySelector\(danger \? '\.dc-dialog-cancel' : '\.dc-dialog-confirm'\)/);
  assert.match(module, /if \(event\.target === dialog\) dialog\.close\('cancel'\);/, 'bấm ra ngoài là huỷ');
  assert.match(module, /dialog\.addEventListener\('cancel', \(\) => \{ dialog\.returnValue = 'cancel'; \}\);/, 'Esc là huỷ');
  assert.match(module, /if \(opener && typeof opener\.focus === 'function' && document\.contains\(opener\)\) opener\.focus\(\);/);
  assert.match(module, /dialog\.remove\(\);/);
  assert.match(module, /escapeHtml\(parts\.title\)/, 'câu chữ được thoát ký tự');
});

check('the toast reuses the page box, never blocks, and stays longer for a long sentence', () => {
  assert.match(module, /document\.getElementById\('quiet-toast'\)/);
  assert.match(module, /box\.setAttribute\('aria-live', 'polite'\);/);
  assert.match(module, /Math\.min\(8000, 3500 \+ Math\.max\(0, box\.textContent\.length - 60\) \* 45\)/);
});

check('every awaited answer is awaited: no call site reads the promise as a boolean', () => {
  sources.forEach((file) => {
    const code = read(file);
    [...code.matchAll(/(.{0,40})\b(confirmDialog|promptDialog)\(/g)].forEach((match) => {
      if (file === 'app-dialog.js' || /import \{|export function |\/\/|\*/.test(match[1])) return;
      assert.match(match[1], /await $/, `${file}: ${match[0]}`);
    });
  });
});

check('the flows keep their wording and their order', () => {
  const client = read('client.html');
  assert.match(client, /if \(hasCompletedSet && !await confirmDialog\(\{ message: 'Bài này đã có set hoàn thành\. Bạn vẫn muốn bỏ khỏi buổi hôm nay\?'/);
  assert.match(client, /wantsResume = await confirmDialog\(\{/);
  assert.match(client, /await noticeDialog\(`\$\{sessionSaveErrorMessage\(err\)\} Mã hỗ trợ: \$\{issue\.data\.supportCode\}\.`\);/, 'lưu thất bại: phải bấm Đã hiểu');
  assert.match(client, /block\._setSkipped = function setSkipped\(skipped\) \{/, 'bỏ qua bài đã hỏi lý do từ trước, không hỏi hai lần');
  const coach = read('coach.html');
  assert.match(coach, /const answer = await promptDialog\(\{/);
  assert.match(coach, /if \(answer === null\) return;/);
  assert.match(coach, /confirmLabel: 'Xóa', cancelLabel: 'Giữ lại', danger: true/);
});

check('every page loads components.css right after the tokens; the dialog styles use tokens only', () => {
  const pages = sources.filter((file) => file.endsWith('.html') && read(file).includes('href="tokens.css"'));
  assert.ok(pages.length >= 20);
  pages.forEach((file) => assert.match(read(file), /href="tokens\.css">\n<link rel="stylesheet" href="components\.css">\n/, file));
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /#[0-9a-f]{3,6}\b/i);
  assert.match(css, /\.dc-dialog-btn \{ min-height: var\(--dc-tap\);/);
  assert.match(css, /\.dc-dialog-danger \.dc-dialog-confirm \{ border-color: var\(--dc-danger\); background: var\(--dc-danger\);/);
});

console.log(`APP_DIALOG_OK ${passed} passed`);
