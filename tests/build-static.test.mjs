// What Vercel publishes (scripts/build-static.mjs): every page points at one versioned
// folder of modules that browsers may keep for good, and nothing else about the site changes.
//   node tests/build-static.test.mjs
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetFiles, build, importsOf, pageGraph, siteFiles } from '../scripts/build-static.mjs';

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
const folder = result.folder;
const read = (name) => readFileSync(join(out, name), 'utf8');
const MODULE_SCRIPT = /<script type="module">([\s\S]*?)<\/script>/g;

try {
  check('every page and every asset is published, the assets in one versioned folder', () => {
    assert.match(folder, /^assets\/[0-9a-f]{12}$/);
    assert.deepEqual(Object.keys(result.pages).sort(), pages);
    for (const name of assets) {
      assert.ok(existsSync(join(out, folder, name)), `${name} in the folder`);
      assert.ok(readFileSync(join(out, folder, name)).equals(readFileSync(join(ROOT, name))), `${name} copied byte for byte`);
      assert.ok(existsSync(join(out, name)), `${name} still at its old address`);
    }
    assert.deepEqual(readdirSync(join(out, 'assets')), [folder.split('/')[1]], 'one folder only');
  });

  check('a page loads its modules only from the folder, so each module runs once', () => {
    for (const page of pages) {
      const html = read(page);
      for (const [, code] of html.matchAll(MODULE_SCRIPT)) {
        for (const spec of importsOf(code).filter((item) => item.startsWith('./'))) {
          assert.ok(spec.startsWith(`./${folder}/`), `${page}: ${spec} is not in the folder`);
          assert.ok(existsSync(join(out, spec.slice(2))), `${page}: ${spec} is missing`);
        }
      }
      for (const [, href] of html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)) {
        if (href.startsWith('https://')) continue;
        assert.ok(href.startsWith(`${folder}/`) && existsSync(join(out, href)), `${page}: stylesheet ${href}`);
      }
    }
  });

  check('a plain script of the site itself is taken from the folder too, so it is never asked for again', () => {
    let seen = 0;
    for (const page of pages) {
      for (const [, src] of read(page).matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
        if (src.startsWith('https://')) continue;
        seen += 1;
        assert.ok(src.replace(/^\.\//, '').startsWith(`${folder}/`), `${page}: ${src} is not in the folder`);
        assert.ok(existsSync(join(out, src)), `${page}: ${src} is missing`);
      }
    }
    assert.ok(seen >= 1, 'coach.html loads rir-calibration-engine.js this way');
    assert.match(read('coach.html'), new RegExp(`<script src="\\./${folder}/rir-calibration-engine\\.js"></script>`));
  });

  check('inside the folder every module finds the modules it imports', () => {
    for (const name of assets.filter((item) => item.endsWith('.js'))) {
      for (const spec of importsOf(read(join(folder, name))).filter((item) => item.startsWith('./'))) {
        assert.ok(existsSync(join(out, folder, spec.slice(2))), `${name} imports ${spec}`);
      }
    }
  });

  check('each page announces exactly the modules it loads, so they download at once', () => {
    for (const page of pages) {
      const html = read(page);
      const announced = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((match) => match[1]);
      const graph = pageGraph(ROOT, readFileSync(join(ROOT, page), 'utf8'), assets);
      assert.deepEqual(announced.filter((href) => !href.startsWith('https://')).sort(), graph.local.map((name) => `${folder}/${name}`).sort(), page);
      assert.deepEqual(announced.filter((href) => href.startsWith('https://')).sort(), graph.remote, page);
      for (const href of announced.filter((item) => !item.startsWith('https://'))) assert.ok(existsSync(join(out, href)), `${page}: ${href}`);
      if (graph.local.length) assert.match(html, /<link rel="preconnect" href="https:\/\/firestore\.googleapis\.com" crossorigin>/, page);
    }
  });

  check('apart from pointing at the folder, every page is exactly what was written', () => {
    for (const page of pages) {
      const restored = read(page)
        // Only the lines the build adds; the pages have font preconnects of their own.
        .replace(/<link rel="preconnect" href="https:\/\/(?:www\.gstatic\.com|firestore\.googleapis\.com)" crossorigin>\n/g, '')
        .replace(/<link rel="modulepreload" href="[^"]+">\n/g, '')
        .split(`./${folder}/`).join('./')
        .split(`"${folder}/`).join('"');
      assert.equal(restored, readFileSync(join(ROOT, page), 'utf8'), page);
    }
  });

  check('a module loaded only on demand is not fetched up front', () => {
    const coach = read('coach.html');
    assert.ok(readFileSync(join(ROOT, 'notification-push.js'), 'utf8').includes("import('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js')"));
    assert.ok(!coach.includes('firebase-messaging.js"'), 'messaging stays lazy');
  });

  check('the Storage and Functions SDKs download only on the pages that use them', () => {
    const remoteOf = (page) => pageGraph(ROOT, readFileSync(join(ROOT, page), 'utf8'), assets).remote.map((url) => url.split('/').pop());
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

  check('the folder is named after the content: the same files give the same name, any change a new one', () => {
    assert.equal(build(join(work, 'again'), ROOT).folder, folder);
    const copy = join(work, 'site');
    for (const name of files) cpSync(join(ROOT, name), join(copy, name));
    assert.equal(build(join(work, 'copy-out'), copy).folder, folder, 'a copy of the same files');
    writeFileSync(join(copy, 'app-version.js'), `${readFileSync(join(copy, 'app-version.js'), 'utf8')}\n// changed\n`);
    assert.notEqual(build(join(work, 'changed-out'), copy).folder, folder);
  });

  check('Vercel runs this build and lets browsers keep the folder for good', () => {
    const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
    assert.equal(config.buildCommand, 'node scripts/build-static.mjs');
    assert.equal(config.outputDirectory, 'dist');
    const rule = config.headers.find((item) => item.source === '/assets/(.*)');
    assert.deepEqual(rule.headers, [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]);
    assert.equal(config.headers.length, 1, 'pages themselves keep the default: always checked');
    assert.ok(!existsSync(join(ROOT, 'package.json')), 'still a static site with no package.json');
    assert.match(readFileSync(join(ROOT, '.gitignore'), 'utf8'), /^dist\/$/m);
  });

  check('it will not build over the source', () => {
    assert.throws(() => build(ROOT, ROOT), /source folder/);
  });
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(`BUILD_STATIC_OK ${passed} passed`);
