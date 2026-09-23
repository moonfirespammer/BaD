// Minimal static file server for docs/prototype (kickoff prompt: "serve docs/prototype/ over http").
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const [dir = 'docs/prototype', port = '4174'] = process.argv.slice(2);
const root = normalize(join(process.cwd(), dir));
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

createServer(async (req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)));
  if (!path.startsWith(root)) return res.writeHead(403).end();
  try {
    const file = (await stat(path)).isDirectory() ? join(path, 'index.html') : path;
    res
      .writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
      .end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(port), '127.0.0.1', () => console.log(`serving ${dir} on http://127.0.0.1:${port}`));
