// What Vercel publishes (scripts/build-static.mjs): every module and stylesheet is copied
// under assets/ with its own content hash in its name, each page carries an import map to
// those names, and nothing else about the site changes.
//   node tests/build-static.test.mjs
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetFiles, build, importsOf, pageGraph, pageModules, siteFiles } from '../scripts/build-static.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const work = mkdtempSync(join(tmpdir(), 'dc-build-'));
const out = join(work, 'dist');
const result = build(out, ROOT);
const files = siteFiles(ROOT);
const assets = assetFiles(files);
const pages = files.filter((name) => name.endsWith('.html'));
const { folder, names } = result;
const read = (name) => readFileSync(join(out, name), 'utf8');
const source = (name) => readFileSync(join(ROOT, name), 'utf8');
const MODULE_SCRIPT = /<script type="module">([\s\S]*?)<\/script>/g;
const importMapOf = (html) => {
  const match = html.match(/<script type="importmap">([^<]*)<\/script>/);
  return match ? JSON.parse(match[1]).imports : null;
};

try {
  check('every asset is published under its own content name, and modules also at the plain name', () => {
    assert.equal(folder, 'assets');
    assert.deepEqual(Object.keys(result.pages).sort(), pages);
    for (const name of assets) {
      const named = names.get(name);
      assert.match(named, /\.[0-9a-f]{10}\.(js|css)$/, name);
      assert.ok(readFileSync(join(out, folder, named)).equals(readFileSync(join(ROOT, name))), `${name} copied byte for byte`);
      if (name.endsWith('.js')) assert.ok(readFileSync(join(out, folder, name)).equals(readFileSync(join(ROOT, name))), `${name} plain copy`);
      assert.ok(existsSync(join(out, name)), `${name} still at its old address`);
    }
  });

  check('each page maps every module it may load to its named copy, before any script', () => {
    for (const page of pages) {
      const html = read(page);
      const modules = pageModules(ROOT, source(page), assets);
      const map = importMapOf(html);
      if (!modules.length) { assert.equal(map, null, page); continue; }
      assert.deepEqual(Object.keys(map).sort(), modules.map((name) => `./${folder}/${name}`).sort(), page);
      for (const [plain, named] of Object.entries(map)) {
        assert.equal(named, `./${folder}/${names.get(plain.slice(folder.length + 3))}`, `${page}: ${plain}`);
        assert.ok(existsSync(join(out, named)), `${page}: ${named}`);
      }
      const head = html.slice(0, html.search(/<\/head>/i));
      const at = head.indexOf('<script type="importmap">');
      assert.equal(head.slice(0, at).search(/<(?:link|script)\b/i), -1, `${page}: map comes first`);
      if (/<meta charset/i.test(html)) assert.ok(html.search(/<meta charset/i) < 1024, `${page}: charset in the first 1 KB`);
    }
  });

  check('a module loaded only on demand is in the map too', () => {
    const map = importMapOf(read('login.html'));
    const loadedWithPage = pageGraph(ROOT, source('login.html'), assets).local;
    const lazy = Object.keys(map).map((plain) => plain.slice(folder.length + 3)).filter((name) => !loadedWithPage.includes(name));
    assert.ok(lazy.length >= 1, 'some module is loaded only on demand');
  });

  check('page code imports the plain address; stylesheets and plain scripts use the named copy', () => {
    for (const page of pages) {
      const html = read(page);
      for (const [, code] of html.matchAll(MODULE_SCRIPT)) {
        for (const spec of importsOf(code).filter((item) => item.startsWith('./'))) {
          assert.ok(spec.startsWith(`./${folder}/`) && names.has(spec.slice(folder.length + 3)), `${page}: ${spec}`);
        }
      }
      for (const [, href] of html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)) {
        if (href.startsWith('https://')) continue;
        assert.match(href, /^assets\/.+\.[0-9a-f]{10}\.css$/, `${page}: ${href}`);
        assert.ok(existsSync(join(out, href)), `${page}: ${href}`);
      }
    }
    assert.match(read('coach.html'), /<script src="\.\/assets\/rir-calibration-engine\.[0-9a-f]{10}\.js"><\/script>/);
  });

  check('each page announces exactly the modules it loads, by their named copy', () => {
    for (const page of pages) {
      const html = read(page);
      const announced = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((match) => match[1]);
      const graph = pageGraph(ROOT, source(page), assets);
      assert.deepEqual(announced.filter((href) => !href.startsWith('https://')).sort(), graph.local.map((name) => `${folder}/${names.get(name)}`).sort(), page);
      assert.deepEqual(announced.filter((href) => href.startsWith('https://')).sort(), graph.remote, page);
      if (graph.local.length) assert.match(html, /<link rel="preconnect" href="https:\/\/firestore\.googleapis\.com" crossorigin>/, page);
    }
  });

  check('apart from the map and the asset addresses, every page is exactly what was written', () => {
    for (const page of pages) {
      const restored = read(page)
        .replace(/<script type="importmap">[^<]*<\/script>\n/, '')
        .replace(/<link rel="preconnect" href="https:\/\/(?:www\.gstatic\.com|firestore\.googleapis\.com)" crossorigin>\n/g, '')
        .replace(/<link rel="modulepreload" href="[^"]+">\n/g, '')
        .replace(/assets\/([^"'\s]+?)\.[0-9a-f]{10}\.(js|css)/g, '$1.$2')
        .split(`./${folder}/`).join('./');
      assert.equal(restored, source(page), page);
    }
  });

  check('a module loaded only on demand is not fetched up front', () => {
    const coach = read('coach.html');
    assert.ok(source('notification-push.js').includes("import('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js')"));
    assert.ok(!coach.includes('firebase-messaging.js"'), 'messaging stays lazy');
  });

  check('the Storage and Functions SDKs download only on the pages that use them', () => {
    const remoteOf = (page) => pageGraph(ROOT, source(page), assets).remote.map((url) => url.split('/').pop());
    for (const page of ['login.html', 'home.html', 'client.html', 'nutrition.html', 'habits.html', 'history.html', 'program.html']) {
      assert.ok(!remoteOf(page).includes('firebase-storage.js'), `${page} loads Storage`);
      assert.ok(!remoteOf(page).includes('firebase-functions.js'), `${page} loads Functions`);
    }
    assert.ok(remoteOf('progress-photos.html').includes('firebase-storage.js'));
    assert.ok(remoteOf('coach.html').includes('firebase-functions.js'));
  });

  check('the service worker keeps its address and stays a plain copy', () => {
    assert.ok(readFileSync(join(out, 'firebase-messaging-sw.js')).equals(readFileSync(join(ROOT, 'firebase-messaging-sw.js'))));
    assert.ok(!existsSync(join(out, folder, 'firebase-messaging-sw.js')));
  });

  check('notes, rules, tests, Cloud Functions and build scripts are not published', () => {
    for (const name of ['tests', 'functions', 'scripts', 'firestore.rules', 'firebase.json', 'serve.ps1', 'THEM-MON-AN.md', 'vercel.json']) {
      assert.ok(!existsSync(join(out, name)), name);
    }
  });

  check('a change renames only the file that changed; every other file keeps its address', () => {
    const copy = join(work, 'site');
    for (const name of files) cpSync(join(ROOT, name), join(copy, name));
    const same = build(join(work, 'copy-out'), copy).names;
    for (const name of assets) assert.equal(same.get(name), names.get(name), name);
    writeFileSync(join(copy, 'i18n.js'), `${readFileSync(join(copy, 'i18n.js'), 'utf8')}\n// changed\n`);
    const changed = build(join(work, 'changed-out'), copy).names;
    for (const name of assets) {
      if (name === 'i18n.js') assert.notEqual(changed.get(name), names.get(name));
      else assert.equal(changed.get(name), names.get(name), `${name} kept its name`);
    }
  });

  check('Vercel runs this build and lets browsers keep only the named copies for good', () => {
    const config = JSON.parse(source('vercel.json'));
    assert.equal(config.buildCommand, 'node scripts/build-static.mjs');
    assert.equal(config.outputDirectory, 'dist');
    assert.equal(config.headers.length, 1, 'pages and plain copies keep the default: always checked');
    const rule = config.headers[0];
    assert.deepEqual(rule.headers, [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]);
    const pattern = new RegExp(`^${rule.source}$`);
    assert.ok(pattern.test(`/assets/${names.get('i18n.js')}`), 'named copy is kept');
    assert.ok(pattern.test(`/assets/${names.get(assets.find((name) => name.endsWith('.css')))}`), 'named stylesheet is kept');
    assert.ok(!pattern.test('/assets/i18n.js'), 'plain copy is checked every visit');
    assert.ok(!existsSync(join(ROOT, 'package.json')), 'still a static site with no package.json');
    assert.match(source('.gitignore'), /^dist\/$/m);
  });

  check('it will not build over the source', () => {
    assert.throws(() => build(ROOT, ROOT), /source folder/);
  });
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(`BUILD_STATIC_OK ${passed} passed`);
