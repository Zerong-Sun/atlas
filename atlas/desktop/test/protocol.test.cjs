const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHandler, isAppUrl } = require('../src/protocol.cjs');

test('app origin cannot be confused with an external host', () => {
  assert.equal(isAppUrl('atlas://app/methods/iching'), true);
  for (const url of ['https://app/', 'atlas://app.evil/', 'atlas://user@app/', 'file:///etc/passwd']) assert.equal(isAppUrl(url), false);
});
test('routes load offline, assets retain MIME type, missing assets and path escapes fail', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'atlas-protocol-'));
  try {
    await writeFile(path.join(root, 'index.html'), '<main>Atlas</main>');
    await writeFile(path.join(root, 'app.js'), 'export const ok = true;');
    const handler = createHandler(root, () => new Response('proxy'));
    const route = await handler(new Request('atlas://app/methods/iching'));
    assert.equal(await route.text(), '<main>Atlas</main>');
    assert.match(route.headers.get('Content-Security-Policy'), /script-src 'self'/);
    assert.match((await handler(new Request('atlas://app/app.js'))).headers.get('Content-Type'), /javascript/);
    assert.equal((await handler(new Request('atlas://app/missing.js'))).status, 404);
    assert.equal((await handler(new Request('atlas://app/%2e%2e%2fsecret.txt'))).status, 403);
    assert.equal((await handler(new Request('atlas://app/%5csecret.txt'))).status, 400);
    assert.equal((await handler(new Request('atlas://elsewhere/'))).status, 404);
    assert.equal((await handler(new Request('atlas://app/', { method: 'POST' }))).status, 405);
    assert.equal((await handler(new Request('atlas://app/', { method: 'HEAD' }))).body, null);
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('LLM is routed to the shared proxy and rejects a foreign origin', async () => {
  let called = 0;
  const handler = createHandler('/unused', (req) => { called++; return new Response(req.method); });
  assert.equal(await (await handler(new Request('atlas://app/api/llm', { method: 'POST', headers: { origin: 'atlas://app' } }))).text(), 'POST');
  assert.equal((await handler(new Request('atlas://app/api/llm', { method: 'POST', headers: { origin: 'https://evil.example' } }))).status, 403);
  assert.equal(called, 1);
});
