// Run with:  node --experimental-vm-modules tests/html-module-syntax.test.mjs
// Without that flag vm.SourceTextModule does not exist and the file throws
// before checking anything, which reads like a broken test rather than a
// missing flag.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Every page carrying an inline module script. Derived by hand but asserted
// below against what is actually on disk, so a new page cannot be added to the
// app and silently skipped here — which is exactly what happened to the two
// nutrition pages while they were being rewritten.
const files = [
  'client.html', 'coach.html', 'history.html', 'engine-test-harness.html',
  'login.html', 'nutrition.html', 'nutrition-builder.html',
  'program-library.html', 'progress-photos.html', 'templates.html',
];
for (const file of files) {
  const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  const scripts = [...html.matchAll(/<script\s+type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0, `${file} must contain a module script`);
  scripts.forEach((match, index) => {
    new vm.SourceTextModule(match[1], { identifier: `${file}#module-${index + 1}` });
  });
}

// Guard against this list drifting behind the app.
const { readdir } = await import('node:fs/promises');
const root = new URL('../', import.meta.url);
const onDisk = (await readdir(root)).filter((name) => name.endsWith('.html'));
const unchecked = [];
for (const name of onDisk) {
  const html = await readFile(new URL(name, root), 'utf8');
  if (/<script\s+type=["']module["']/i.test(html) && !files.includes(name)) unchecked.push(name);
}
assert.deepEqual(unchecked, [], `These pages have module scripts but are not checked: ${unchecked.join(', ')}`);

console.log(`HTML_MODULE_SYNTAX_OK ${files.length} / ${files.length} passed`);
