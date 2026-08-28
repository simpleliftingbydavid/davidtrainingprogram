import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.argv[2]) || 8105;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  let file = join(root, safePath || 'index.html');
  if (!file.startsWith(root) || !existsSync(file)) {
    response.writeHead(404).end('Not found');
    return;
  }
  if (statSync(file).isDirectory()) file = join(file, 'index.html');
  response.writeHead(200, { 'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`STATIC_SERVER_OK http://127.0.0.1:${port}`));
