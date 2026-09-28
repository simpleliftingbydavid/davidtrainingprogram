// Run with:  node --experimental-vm-modules tests/module-imports.test.mjs
//
// Every name a page imports from a local module must actually be exported by
// that module. An ES import of a missing export fails at LINK time, before a
// single line runs, so the page dies silently on its loading screen with
// nothing in the interface to say why.
//
// This exists because it happened: an upload replaced training-data.js with an
// older copy that was missing eleven exports coach.html imports, and the coach
// dashboard sat on "Đang tải…" for every user. Nothing in the test suite
// noticed, because every suite imported the modules it knew about rather than
// checking that the pages could import what they ask for.
//
// Checked by reading the source rather than by importing: the pages and
// training-data.js pull Firebase from a CDN, which Node cannot resolve.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

/** Exported names of a local module, including `export { a, b }` re-export lists. */
function exportedNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/^export\s+(?:async\s+)?(?:function\s*\*?\s*(\w+)|class\s+(\w+)|(?:const|let|var)\s+(\w+))/gm)) {
    names.add(match[1] || match[2] || match[3]);
  }
  // export { handPortions };  /  export { a as b, c };
  for (const match of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const part of match[1].split(',')) {
      const piece = part.trim();
      if (!piece) continue;
      const as = /\sas\s+(\w+)$/.exec(piece);
      names.add(as ? as[1] : piece.replace(/^\w+\s+as\s+/, '').trim());
    }
  }
  if (/^export\s+default\b/m.test(source)) names.add('default');
  return names;
}

/** Named imports a source file pulls from each relative module it names. */
function importsBySpecifier(source) {
  const found = new Map();
  const pattern = /import\s*\{([^}]*)\}\s*from\s*['"](\.[^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const specifier = match[2];
    if (!found.has(specifier)) found.set(specifier, new Set());
    for (const part of match[1].split(',')) {
      const piece = part.trim();
      if (!piece) continue;
      // `import { a as b }` needs `a` to exist, not `b`.
      found.get(specifier).add(piece.split(/\s+as\s+/)[0].trim());
    }
  }
  return found;
}

const files = (await readdir(root)).filter((name) => name.endsWith('.js') || name.endsWith('.html'));
const moduleCache = new Map();

async function exportsOf(specifier) {
  if (!moduleCache.has(specifier)) {
    const source = await readFile(new URL(specifier, root), 'utf8');
    moduleCache.set(specifier, exportedNames(source));
  }
  return moduleCache.get(specifier);
}

const problems = [];
let checked = 0;
for (const file of files) {
  const source = await readFile(new URL(file, root), 'utf8');
  for (const [specifier, names] of importsBySpecifier(source)) {
    let available;
    try {
      available = await exportsOf(specifier);
    } catch {
      problems.push(`${file} imports from ${specifier}, which does not exist`);
      continue;
    }
    for (const name of names) {
      checked++;
      if (!available.has(name)) problems.push(`${file} imports { ${name} } from ${specifier}, which does not export it`);
    }
  }
}

assert.deepEqual(problems, [], `\n  ${problems.join('\n  ')}\n`);
assert.ok(checked > 200, `expected to check hundreds of imports, only saw ${checked}`);
console.log(`MODULE_IMPORTS_OK ${checked} imports across ${files.length} files`);
