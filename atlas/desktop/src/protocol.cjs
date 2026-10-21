const { readFile } = require('node:fs/promises');
const path = require('node:path');

const ORIGIN = 'atlas://app';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.wasm': 'application/wasm', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
};
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-src 'none'; form-action 'none'";

function isAppUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'atlas:' && url.host === 'app' && !url.username && !url.password;
  } catch { return false; }
}

function createHandler(webRoot, llmHandler) {
  const root = path.resolve(webRoot);
  return async (request) => {
    if (!isAppUrl(request.url)) return new Response('Not found', { status: 404 });
    const url = new URL(request.url);
    if (url.pathname === '/api/llm') {
      const origin = request.headers.get('origin');
      if (origin && origin !== ORIGIN) return new Response('Forbidden', { status: 403 });
      return llmHandler(request);
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { return new Response('Bad path', { status: 400 }); }
    if (pathname.includes('\0') || pathname.includes('\\')) return new Response('Bad path', { status: 400 });
    const file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) return new Response('Forbidden', { status: 403 });
    const ext = path.extname(file);
    // BrowserRouter routes resolve to index.html; missing assets must stay 404.
    const target = ext ? file : path.join(root, 'index.html');
    try {
      const data = await readFile(target);
      return new Response(request.method === 'HEAD' ? null : data, {
        headers: {
          'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream',
          'Content-Security-Policy': CSP,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-cache',
        },
      });
    } catch { return new Response('Not found', { status: 404 }); }
  };
}

module.exports = { createHandler, isAppUrl, ORIGIN };
