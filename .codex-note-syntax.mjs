import { readdir, readFile } from 'node:fs/promises';
import vm from 'node:vm';

const files = await readdir('.');
let jsCount = 0;
let htmlModules = 0;
for (const file of files.filter((name) => /\.(?:js|mjs)$/.test(name) && !name.startsWith('.codex-'))) {
  new vm.SourceTextModule(await readFile(file, 'utf8'), { identifier: file });
  jsCount += 1;
}
for (const file of files.filter((name) => name.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const pattern = /<script\b[^>]*\btype=["']module["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    new vm.SourceTextModule(match[1], { identifier: `${file}#module-${htmlModules + 1}` });
    htmlModules += 1;
  }
}
console.log(`SYNTAX_OK js=${jsCount} htmlModules=${htmlModules}`);
