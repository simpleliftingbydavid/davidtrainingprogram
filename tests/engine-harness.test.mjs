// Run the existing pure engine cases without requiring a signed-in browser.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = readFileSync(new URL('../engine-test-harness.html', import.meta.url), 'utf8');
const code = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const failures = [];
const summary = {};
const document = {
  getElementById: (id) => id === 'summary' ? summary : { appendChild(row) { if (row.className === 'fail') failures.push(row.innerHTML); } },
  createElement: () => ({}),
};
const context = vm.createContext({ document, console });
const module = new vm.SourceTextModule(code, { context });
await module.link(async (specifier) => {
  const exports = await import(new URL(`../${specifier}`, import.meta.url));
  return new vm.SyntheticModule(Object.keys(exports), function () {
    Object.entries(exports).forEach(([key, value]) => this.setExport(key, value));
  }, { context });
});
await module.evaluate();
assert.deepEqual(failures, []);
console.log(summary.textContent);
