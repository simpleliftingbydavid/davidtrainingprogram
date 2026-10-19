// ============================================================
// DAVID TRAINING PROGRAM — what Vercel publishes
// ============================================================
// The site is plain files: every page loads 27–49 small ES modules. Served as they are,
// each one comes with "Cache-Control: max-age=0, must-revalidate", so every visit asks the
// server about every file again. Measured on 2026-10-16, a reload of coach.html with every
// file already in the browser spent 5.9 s on those questions before any data was read.
//
// This step copies the site into `dist/` with every module and stylesheet in a folder
// named after their content (`assets/<hash>/`), and points the pages there. A browser may
// then keep those files for good (vercel.json marks the folder immutable): the next visit
// asks only for the page itself. Any change to any of them gives the folder a new name, so a
// visitor always gets one consistent set — never an old module beside a new one, the kind
// of mismatch that left pages stuck on "Đang tải…" on 2026-09-28.
//
// The modules themselves are copied byte for byte: they only import each other as
// './name.js', and they all move into the same folder, so those imports still resolve.
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

/** One hash over every asset's name and bytes: the folder name. */
export function assetsHash(root, assets) {
  const hash = createHash('sha256');
  for (const name of assets) {
    hash.update(name);
    hash.update('\0');
    hash.update(readFileSync(join(root, name)));
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 12);
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

/** The page pointed at the versioned folder, with its modules announced up front. Only
 *  local references to assets are rewritten; everything else is left exactly as it was.
 *  Every replacement is a function: page code is full of "$", which a replacement string
 *  would read as a pattern. */
export function rewritePage(root, html, assets, folder) {
  const graph = pageGraph(root, html, assets);
  const isAsset = (name) => assets.includes(name);
  const pointAtFolder = (code) => code.replace(ANY_IMPORT, (match, quote, spec) => {
    const name = spec.slice(2);
    return spec.startsWith('./') && isAsset(name) ? match.replace(spec, () => `./${folder}/${name}`) : match;
  });
  let out = html.replace(MODULE_SCRIPT, (block, code) => block.replace(code, () => pointAtFolder(code)));
  out = out.replace(STYLESHEET, (match, before, href, after) => (isAsset(href) ? `${before}${folder}/${href}${after}` : match));
  out = out.replace(CLASSIC_SCRIPT, (match, before, dot = '', src, after) => (isAsset(src) ? `${before}${dot}${folder}/${src}${after}` : match));
  const hints = [
    ...PRECONNECT.map((origin) => `<link rel="preconnect" href="${origin}" crossorigin>`),
    ...graph.local.map((name) => `<link rel="modulepreload" href="${folder}/${name}">`),
    ...graph.remote.map((url) => `<link rel="modulepreload" href="${url}">`),
  ];
  if (!/<\/head>/i.test(out)) return { html: out, graph };
  return { html: out.replace(/<\/head>/i, () => `${hints.join('\n')}\n</head>`), graph };
}

export function build(outDir = join(ROOT, 'dist'), root = ROOT) {
  if (resolve(outDir) === resolve(root)) throw new Error('Refusing to build into the source folder.');
  const files = siteFiles(root);
  const assets = assetFiles(files);
  const folder = `assets/${assetsHash(root, assets)}`;
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, folder), { recursive: true });

  for (const name of files) {
    if (name.endsWith('.html')) continue;
    // Also left at their old address, unchanged: a page opened before this deploy, or
    // anything else that names a file directly, keeps working.
    cpSync(join(root, name), join(outDir, name));
  }
  for (const name of assets) cpSync(join(root, name), join(outDir, folder, name));

  const pages = {};
  for (const name of files.filter((file) => file.endsWith('.html'))) {
    const { html, graph } = rewritePage(root, readFileSync(join(root, name), 'utf8'), assets, folder);
    writeFileSync(join(outDir, name), html);
    pages[name] = graph.local.length;
  }
  return { folder, assets: assets.length, pages };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'dist');
  const result = build(out);
  console.log(`Built ${Object.keys(result.pages).length} pages and ${result.assets} assets into ${out} (${result.folder}).`);
}
