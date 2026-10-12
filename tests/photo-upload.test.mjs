// Run with:  node tests/photo-upload.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MAX_EDGE, MAX_PHOTOS_AT_ONCE, anglesForBatch, fileProblem, fitWithin, formatBytes, jpegName,
} from '../photo-upload-utils.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

check('a big phone photo is scaled so its longer side is 1600 px, keeping its shape', () => {
  assert.deepEqual(fitWithin(4032, 3024), { width: 1600, height: 1200 });
  assert.deepEqual(fitWithin(3024, 4032), { width: 1200, height: 1600 });
});

check('a photo that is already small is never enlarged', () => {
  assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 });
  assert.deepEqual(fitWithin(MAX_EDGE, 900), { width: MAX_EDGE, height: 900 });
});

check('nonsense sizes give an empty size instead of NaN', () => {
  assert.deepEqual(fitWithin(0, 100), { width: 0, height: 0 });
  assert.deepEqual(fitWithin(undefined, undefined), { width: 0, height: 0 });
});

check('a stored photo is named for the JPEG it is, safe in a storage path', () => {
  assert.equal(jpegName('IMG 01.HEIC'), 'IMG-01.jpg');
  assert.equal(jpegName('ảnh đầu tiên.png'), 'nh-u-ti-n.jpg');
  assert.equal(jpegName('.jpeg'), 'photo.jpg');
  assert.equal(jpegName(''), 'photo.jpg');
  assert.equal(jpegName('a/b\\c.jpg'), 'a-b-c.jpg');
});

check('a batch gets Front, Side, Back in turn from the chosen angle', () => {
  assert.deepEqual(anglesForBatch(3, 'front'), ['front', 'side', 'back']);
  assert.deepEqual(anglesForBatch(4, 'side'), ['side', 'back', 'front', 'side']);
  assert.deepEqual(anglesForBatch(2, 'nonsense'), ['front', 'side']);
  assert.deepEqual(anglesForBatch(0), []);
});

check('sizes read the way a person says them', () => {
  assert.equal(formatBytes(512), '1 KB');
  assert.equal(formatBytes(350 * 1024), '350 KB');
  assert.equal(formatBytes(4.5 * 1024 * 1024), '4.5 MB');
});

check('only an image is accepted', () => {
  assert.equal(fileProblem({ name: 'a.jpg', type: 'image/jpeg' }), '');
  assert.equal(fileProblem({ name: 'a.heic', type: '' }), '', 'some phones give no type for HEIC');
  assert.match(fileProblem({ name: 'cv.pdf', type: 'application/pdf' }), /cv\.pdf/);
  assert.ok(fileProblem(null));
});

const page = readFileSync(new URL('../progress-photos.html', import.meta.url), 'utf8');

check('the page shrinks each photo, sends them one after another, and retries once', () => {
  assert.match(page, /<input type="file" id="photo-file" accept="image\/\*" multiple>/);
  assert.match(page, /await preparePhoto\(item\.file\)/);
  assert.match(page, /for \(let attempt = 1; attempt <= 2; attempt \+= 1\)/);
  assert.match(page, /for \(let i = 0; i < pending\.length; i \+= 1\)/);
});

check('one failed photo does not stop the others, and a failed upload is cleaned out of Storage', () => {
  assert.match(page, /item\.state = 'error'; item\.message = err\.message/);
  assert.match(page, /deleteStoragePaths\(\[storagePath\]/);
  assert.match(page, /queue = queue\.filter\(\(item\) => item\.state !== 'done'\)/);
});

check('the gallery is refreshed once for the whole batch, not once per photo', () => {
  assert.equal((page.match(/await refreshGallery\(\)/g) || []).length, 2, 'one after a delete, one after an upload batch');
  assert.match(page, /if \(saved\) await refreshGallery\(\)/);
  assert.ok(MAX_PHOTOS_AT_ONCE >= 3);
});

check('uploads carry a content type and a long cache lifetime', () => {
  assert.match(page, /contentType: prepared\.file\.type \|\| 'image\/jpeg', cacheControl: 'public,max-age=31536000'/);
});

console.log(`photo-upload: ${passed} passed`);
