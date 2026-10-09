// Run with:  node tests/progress-guides.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PHOTO_GUIDE, WEIGHT_GUIDE, guideTextMarkup, photoGuideMarkup, weightGuideMarkup,
} from '../progress-guides.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('a guide David has not written shows nothing at all', () => {
  assert.equal(photoGuideMarkup({ intro: '', front: '  ', side: '', back: '\n' }), '');
  assert.equal(weightGuideMarkup({ text: '   ' }), '');
  assert.equal(guideTextMarkup(undefined), '');
});

check('paragraphs, bullets and small headings come out as such', () => {
  const html = guideTextMarkup('## Chuẩn bị\n\nĐứng thẳng.\nHai tay thả lỏng.\n\n- Cân buổi sáng\n- Sau khi đi vệ sinh\n\nXong.');
  assert.equal(html, '<h5>Chuẩn bị</h5><p>Đứng thẳng.<br>Hai tay thả lỏng.</p><ul><li>Cân buổi sáng</li><li>Sau khi đi vệ sinh</li></ul><p>Xong.</p>');
});

check('Windows line endings read the same as Unix ones', () => {
  assert.equal(guideTextMarkup('a\r\n\r\n- b\r\n- c'), guideTextMarkup('a\n\n- b\n- c'));
});

check('nothing typed can become markup', () => {
  const html = guideTextMarkup('<img src=x onerror=alert(1)>\n- <script>x</script>\n## <b>t</b>');
  assert.doesNotMatch(html, /<img|<script|<b>/);
  assert.match(html, /&lt;img/);
});

check('the photo guide lists only the angles that were written, in Front, Side, Back order', () => {
  const html = photoGuideMarkup({ intro: 'Ánh sáng đều.', front: 'Đứng thẳng.', side: '', back: 'Nhờ người chụp.' });
  assert.match(html, /Cách chụp ảnh 3 góc/);
  assert.match(html, /Ánh sáng đều\./);
  assert.ok(html.indexOf('Front') < html.indexOf('Back'));
  assert.doesNotMatch(html, /Side — chụp bên hông/);
});

check('only the general note written is still enough to show the guide', () => {
  assert.match(photoGuideMarkup({ intro: 'Chụp cùng giờ mỗi lần.', front: '', side: '', back: '' }), /Chụp cùng giờ/);
});

check('the weight guide renders its text under its own title', () => {
  const html = weightGuideMarkup({ text: 'Cân buổi sáng.' });
  assert.match(html, /Cách cân trên cân điện tử/);
  assert.match(html, /<p>Cân buổi sáng\.<\/p>/);
});

check('the shipped guides are filled in only on purpose: either empty or real text, never a placeholder', () => {
  for (const text of [PHOTO_GUIDE.intro, PHOTO_GUIDE.front, PHOTO_GUIDE.side, PHOTO_GUIDE.back, WEIGHT_GUIDE.text]) {
    assert.doesNotMatch(text, /lorem|TODO|đang cập nhật|sẽ có ở đây/i);
  }
});

check('the progress page mounts both guides for the student only', () => {
  const page = readFileSync(new URL('../progress-photos.html', import.meta.url), 'utf8');
  assert.match(page, /import \{ photoGuideMarkup, weightGuideMarkup \} from '\.\/progress-guides\.js'/);
  assert.match(page, /id="photo-guide"/);
  assert.match(page, /id="weight-guide"/);
  assert.match(page, /if \(canEdit\) \{\s*\$\('photo-guide'\)\.innerHTML = photoGuideMarkup\(\);\s*\$\('weight-guide'\)\.innerHTML = weightGuideMarkup\(\);/);
});

console.log(`progress-guides: ${passed} passed`);
