// Run in Electron, against the production entry point and compiled resources.
const { app, BrowserWindow, session } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-desktop-smoke-'));
  require(process.env.ATLAS_SMOKE_APP || '../build/main.cjs');
  app.setPath('userData', profile);
  app.setPath('sessionData', profile);
  await app.whenReady();
  const win = BrowserWindow.getAllWindows()[0];
  const errors = [];
  win.webContents.on('console-message', (event) => {
    if (event.level === 'error' && !/ERR_INTERNET_DISCONNECTED|ERR_BLOCKED_BY_CLIENT/.test(event.message)) errors.push(event.message);
  });
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['https://*/*', 'http://*/*'] }, (_details, callback) => callback({ cancel: true }));
  const evaluate = (code) => win.webContents.executeJavaScript(code);
  async function waitFor(code) {
    for (let i = 0; i < 200; i++) {
      if (await evaluate(code)) return;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error('Timed out: ' + code);
  }
  await waitFor('document.body.innerText.includes("诸象") && !!document.querySelector("button")');
  assert.deepEqual(await evaluate('[typeof require, typeof process]'), ['undefined', 'undefined']);
  await evaluate('localStorage.setItem("atlas:onboarding_done", "1"); localStorage.setItem("atlas.desktop.persistence", "retained");');
  const source = await fs.readFile(path.join(__dirname, '../../packages/method-data/src/divinationMethods.ts'), 'utf8');
  const routes = [...new Set([...source.matchAll(/route:\s*"([^"]+)"/g)].map((match) => match[1]))];
  const results = [];
  for (const route of routes) {
    await win.loadURL('atlas://app' + route);
    await waitFor('!!document.querySelector(".culture-card")');
    const state = await evaluate(`({ title: document.querySelector('h1')?.textContent, overflow: document.documentElement.scrollWidth > innerWidth + 1, storage: localStorage.getItem('atlas.desktop.persistence') })`);
    assert.equal(state.storage, 'retained');
    assert.equal(state.overflow, false, route + ' overflows');
    await waitFor('!!document.querySelector("[data-culture-method]") && [...document.querySelectorAll(".culture-card img")].every(image => image.complete && image.naturalWidth > 0)');
    const library = await evaluate(`(() => {
      const panel = document.querySelector('[data-culture-method]');
      panel.querySelector('details').open = true;
      return {methodId: panel.dataset.cultureMethod, text: panel.textContent, sources: panel.querySelectorAll('a[href^="https://"]').length};
    })()`);
    assert.ok(library.sources > 0, route + ' missing sources');
    for (const label of ['人物与证据', '体验前想一想', '体验后再比较']) assert.ok(library.text.includes(label), route + ' missing ' + label);
    win.setContentSize(390, 844);
    await new Promise(resolve => setTimeout(resolve, 80));
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false, route + ' narrow culture overflow');
    win.setContentSize(1280, 900);
    results.push({ route, title: state.title, culture: library.methodId, sources: library.sources, narrowCulture: true });
  }
  await win.loadURL('atlas://app/methods/iching');
  await waitFor('!!document.querySelector(".culture-card")');
  for (let i = 0; i < 6; i++) {
    await evaluate('document.querySelectorAll(".coin-panel__manual button")[1].click()');
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  await waitFor('!!document.querySelector(".iching-result")');
  const qian = await evaluate('document.querySelector(".iching-result h2").textContent');
  assert.match(qian, /本卦 乾（1）/);
  assert.match(qian, /变卦 乾（1）/);
  await evaluate('document.querySelector(".culture-card__toggle").click()');
  await waitFor('!!document.querySelector(".culture-tabs")');
  await evaluate('document.querySelectorAll(".culture-tabs button")[2].click()');
  await waitFor('!!document.querySelector(".culture-card textarea")');
  await evaluate(`(() => { const input = document.querySelector('.culture-card textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, '自强不息：每天坚持一件小事。'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await new Promise((resolve) => setTimeout(resolve, 60));
  await evaluate('document.querySelectorAll(".culture-actions button")[1].click()');
  await win.loadURL('atlas://app/methods/iching');
  await waitFor('document.querySelector(".culture-card")?.textContent.includes("已学习")');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("atlas.culture.v1.iching")).note'), '自强不息：每天坚持一件小事。');
  await evaluate('document.querySelector(".method-copilot-topbar-btn").click()');
  await waitFor('!!document.querySelector(".method-copilot__prompts button")');
  await evaluate('document.querySelector(".method-copilot__prompts button").click()');
  await waitFor('document.querySelector(".method-copilot__thread")?.textContent.includes("非 AI 个性化解读")');
  assert.ok(await evaluate('document.querySelector(".method-copilot__sources")?.textContent.includes("zuozhuan")'));
  await evaluate('document.querySelector(".method-copilot__toggle").click()');
  const api = await evaluate(`fetch('/api/llm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(async r => ({ status: r.status, body: await r.json() }))`);
  assert.equal(api.status, 401);
  assert.equal(api.body.error, 'missing_api_key');
  await evaluate('document.querySelector(".culture-research details").open = true; document.querySelector(".culture-research").scrollIntoView({block:"start"});');
  win.setContentSize(390, 844);
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false);
  const output = path.join(__dirname, '../release');
  await fs.mkdir(output, { recursive: true });
  win.show();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await fs.writeFile(path.join(output, 'smoke-iching.png'), (await win.webContents.capturePage()).toPNG());
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, 'smoke-results.json'), JSON.stringify({ offline: true, routes: results, qian, cultureNotePersists: true, cultureLibraryAllRoutes: true, offlineCopilotFallback: true, proxyWithoutKey: api.status, isolatedRenderer: true, narrowWidth: 390, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, routes: results.length, offline: true, proxyStatus: api.status }));
  win.destroy();
  app.exit(0);
})().catch((error) => { console.error(error); app.exit(1); });
