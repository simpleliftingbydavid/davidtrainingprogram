// ============================================================
// DAVID TRAINING PROGRAM — what Vercel publishes
// ============================================================
// The site is plain files: every page loads 27–49 small ES modules. Served as they are,
// each one comes with "Cache-Control: max-age=0, must-revalidate", so every visit asks the
// server about every file again. Measured on 2026-10-16, a reload of coach.html with every
// file already in the browser spent 5.9 s on those questions before any data was read.
//
// This step copies the site into `dist/` with every module and stylesheet under `assets/`,
// each named after its own content (`assets/name.<hash>.js`), and points the pages there. A
// browser may then keep those files for good (vercel.json marks the folder immutable): the
// next visit asks only for the page itself.
//
// Per-file names (2026-11-25; before, one folder hash for everything): a deploy used to give
// every file a new address, so after each push every client downloaded all ~360 KB again,
// and there are often ~10 pushes a day. Now a file keeps its address until it, or something
// it imports, changes; the dictionaries and food tables stay in the browser.
//
// Modules still import each other as './name.js' and are copied byte for byte. Each page
// carries an import map (plain address → named copy) for every module it may load. The page
// itself is checked on every visit, so its map always names one consistent set — never an
// old module beside a new one, the kind of mismatch that left pages stuck on "Đang tải…" on
// 2026-09-28. (Rewriting import lines to named addresses instead would rename every module
// above a changed one; nearly all import i18n.js, so a text fix would rename them all.)
// A browser without import maps (iOS before 16.4) loads the plain copies in assets/, which
// vercel.json leaves to be checked on every visit: slower, never stale.
// Each page also gets <link rel="modulepreload"> for every module it will need, so the
// browser fetches them all at once rather than one layer of imports at a time.
//
// Pure Node, no dependencies: there is deliberately no package.json in this repository
// (with one, Vercel would stop treating it as a static site).
//
//   node scripts/build-static.mjs            → dist/
//   node scripts/build-static.mjs <out-dir>  → somewhere else (the tests use this)

import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** What the site serves. Anything else at the top level (notes, rules, test and function
 *  folders, local scripts) stays out of the published site. */
const PUBLISHED = new Set(['.html', '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.webmanifest']);
/** Must keep its own name and place: a service worker's address is its identity, and it is
 *  a classic script, not a module. */
const KEEP_IN_PLACE = new Set(['firebase-messaging-sw.js']);
/** Origins every page talks to; opening the connection early saves a handshake. */
const PRECONNECT = ['https://www.gstatic.com', 'https://firestore.googleapis.com'];

// A module specifier: a local './x.js' or a remote https URL.
const SPEC = String.raw`(['"])(\./[^'"]+|https://[^'"]+)\1`;
// Loaded with the page: "from './x.js'" and "import './x.js'".
const STATIC_IMPORT = new RegExp(String.raw`(?:\bfrom\s*|\bimport\s*)` + SPEC, 'g');
// Also "import('./x.js')", loaded only when the code asks for it.
const ANY_IMPORT = new RegExp(String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*)` + SPEC, 'g');
const MODULE_SCRIPT = /<script type="module">([\s\S]*?)<\/script>/g;
const STYLESHEET = /(<link\b[^>]*\brel="stylesheet"[^>]*\bhref=")([^"]+)(")/g;
// A plain <script src="./x.js"> of the site's own (coach.html's rir-calibration-engine.js). It
// holds the page until it arrives, so left at its old address it cost a round trip on every
// visit (seen 2026-10-19: 304 on each load of coach.html).
const CLASSIC_SCRIPT = /(<script\b[^>]*\bsrc=")(\.\/)?([^"]+)(")/g;

export function siteFiles(root = ROOT) {
  return readdirSync(root)
    .filter((name) => statSync(join(root, name)).isFile() && PUBLISHED.has(extname(name).toLowerCase()))
    .sort();
}

/** Local modules and stylesheets: what goes into the versioned folder. */
export function assetFiles(files) {
  return files.filter((name) => (name.endsWith('.js') || name.endsWith('.css')) && !KEEP_IN_PLACE.has(name));
}

/** Where the named assets are published. */
export const ASSET_DIR = 'assets';

/** Local assets a module names, at load time or on demand ('./x.js' only). */
export function localImportsOf(code) {
  return [...code.matchAll(ANY_IMPORT)].map((match) => match[2]).filter((spec) => spec.startsWith('./')).map((spec) => spec.slice(2));
}

/** Published name of every asset: "name.<hash>.ext", the hash over that file's own bytes. */
export function assetNames(root, assets) {
  return new Map(assets.map((name) => {
    const digest = createHash('sha256').update(readFileSync(join(root, name))).digest('hex').slice(0, 10);
    return [name, name.replace(/\.(js|css)$/, (ext) => `.${digest}${ext}`)];
  }));
}

/** Every local module a page may load, with it or on demand: what its import map covers. */
export function pageModules(root, html, assets) {
  const found = new Set();
  const queue = [...html.matchAll(MODULE_SCRIPT)].flatMap((match) => localImportsOf(match[1]));
  while (queue.length) {
    const name = queue.shift();
    if (found.has(name) || !name.endsWith('.js') || !assets.includes(name)) continue;
    found.add(name);
    queue.push(...localImportsOf(readFileSync(join(root, name), 'utf8')));
  }
  return [...found].sort();
}

/** The page's import map: the plain address a module asks for → its named copy. */
export function importMapTag(modules, names) {
  const imports = Object.fromEntries(modules.map((name) => [`./${ASSET_DIR}/${name}`, `./${ASSET_DIR}/${names.get(name)}`]));
  return `<script type="importmap">${JSON.stringify({ imports })}</script>`;
}

/** Every specifier a piece of module code imports at load time, local ('./x.js') or remote.
 *  A dynamic import is left out on purpose: it is loaded only when needed, so announcing it
 *  up front would fetch it on every visit. */
export function importsOf(code) {
  return [...code.matchAll(STATIC_IMPORT)].map((match) => match[2]);
}

/** All modules a page loads with it, local and remote, starting from its inline scripts. */
export function pageGraph(root, html, assets) {
  const local = new Set();
  const remote = new Set();
  const queue = [...html.matchAll(MODULE_SCRIPT)].flatMap((match) => importsOf(match[1]));
  while (queue.length) {
    const spec = queue.shift();
    if (spec.startsWith('https://')) { remote.add(spec); continue; }
    const name = spec.slice(2);
    if (local.has(name) || !assets.includes(name)) continue;
    local.add(name);
    queue.push(...importsOf(readFileSync(join(root, name), 'utf8')));
  }
  return { local: [...local].sort(), remote: [...remote].sort() };
}

/** The page pointed at the published assets, with its modules announced up front. Only
 *  local references to assets are rewritten; everything else is left exactly as it was.
 *  Every replacement is a function: page code is full of "$", which a replacement string
 *  would read as a pattern. */
export function rewritePage(root, html, assets, names) {
  const graph = pageGraph(root, html, assets);
  const published = (name) => `${ASSET_DIR}/${names.get(name)}`;
  // Page code asks for the plain address (./assets/x.js): the import map turns it into the
  // named copy; a browser without import maps gets the plain copy, checked on every visit.
  const pointAtAssets = (code) => code.replace(ANY_IMPORT, (match, quote, spec) => {
    const name = spec.slice(2);
    return spec.startsWith('./') && names.has(name) ? match.replace(spec, () => `./${ASSET_DIR}/${name}`) : match;
  });
  let out = html.replace(MODULE_SCRIPT, (block, code) => block.replace(code, () => pointAtAssets(code)));
  const modules = pageModules(root, html, assets);
  // The map must come before any module script or modulepreload: it goes in front of the
  // head's first <link> or <script>, after <meta charset> (which must stay in the first 1 KB).
  const headEnd = out.search(/<\/head>/i);
  const firstTag = out.slice(0, headEnd).search(/<(?:link|script)\b/i);
  if (modules.length && headEnd > 0) {
    const at = firstTag >= 0 ? firstTag : headEnd;
    out = `${out.slice(0, at)}${importMapTag(modules, names)}\n${out.slice(at)}`;
  }
  out = out.replace(STYLESHEET, (match, before, href, after) => (names.has(href) ? `${before}${published(href)}${after}` : match));
  out = out.replace(CLASSIC_SCRIPT, (match, before, dot = '', src, after) => (names.has(src) ? `${before}${dot}${published(src)}${after}` : match));
  const hints = [
    ...PRECONNECT.map((origin) => `<link rel="preconnect" href="${origin}" crossorigin>`),
    ...graph.local.map((name) => `<link rel="modulepreload" href="${published(name)}">`),
    ...graph.remote.map((url) => `<link rel="modulepreload" href="${url}">`),
  ];
  if (!/<\/head>/i.test(out)) return { html: out, graph };
  return { html: out.replace(/<\/head>/i, () => `${hints.join('\n')}\n</head>`), graph };
}

export function build(outDir = join(ROOT, 'dist'), root = ROOT) {
  if (resolve(outDir) === resolve(root)) throw new Error('Refusing to build into the source folder.');
  const files = siteFiles(root);
  const assets = assetFiles(files);
  const names = assetNames(root, assets);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, ASSET_DIR), { recursive: true });

  for (const name of files) {
    if (name.endsWith('.html')) continue;
    // Also left at their old address, unchanged: a page opened before this deploy, or
    // anything else that names a file directly, keeps working.
    cpSync(join(root, name), join(outDir, name));
  }
  for (const name of assets) {
    // Byte for byte: the named copy (kept for good) and, for modules, the plain one the
    // import map points away from (checked on every visit; for browsers without maps).
    cpSync(join(root, name), join(outDir, ASSET_DIR, names.get(name)));
    if (name.endsWith('.js')) cpSync(join(root, name), join(outDir, ASSET_DIR, name));
  }

  const pages = {};
  for (const name of files.filter((file) => file.endsWith('.html'))) {
    const { html, graph } = rewritePage(root, readFileSync(join(root, name), 'utf8'), assets, names);
    writeFileSync(join(outDir, name), html);
    pages[name] = graph.local.length;
  }
  return { folder: ASSET_DIR, names, assets: assets.length, pages };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'dist');
  const result = build(out);
  console.log(`Built ${Object.keys(result.pages).length} pages and ${result.assets} assets into ${out} (${result.folder}/name.<hash>.ext).`);
}
