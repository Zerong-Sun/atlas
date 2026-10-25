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
    await waitFor('!!document.querySelector(".method-teaching-story")');
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
  console.log('Smoke: 24 routes complete; checking tarot assets');
  await win.loadURL('atlas://app/methods/tarot');
  await waitFor('document.querySelectorAll(".tarot-library-grid article").length === 78');
  const tarotAssets = await evaluate(`(async () => {
    const images = [...document.querySelectorAll('.tarot-library-grid article img')];
    const checks = await Promise.all(images.map(async image => {
      const response = await fetch(image.src);
      const bytes = new Uint8Array(await response.arrayBuffer());
      return response.ok && bytes.length > 100 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    }));
    return { count: images.length, unique: new Set(images.map(image => image.src)).size, valid: checks.filter(Boolean).length };
  })()`);
  assert.deepEqual(tarotAssets, { count: 78, unique: 78, valid: 78 });
  console.log('Smoke: tarot assets complete; checking draw and replay');
  await evaluate('[...document.querySelectorAll(".deck-toggle button")].find(button => button.textContent.includes("78")).click()');
  await evaluate('document.querySelector(".draw-button").click()');
  await waitFor(`document.querySelectorAll('.tarot-card-library[aria-label="本次抽到的单牌解释"] article').length > 0`);
  assert.ok(await evaluate('document.querySelector(".tarot-reading").textContent.includes("本次牌阵的小故事")'));
  await evaluate('document.querySelector(".tarot-history-list button").click()');
  await waitFor(`!!document.querySelector('[aria-label="塔罗历史回放"] article')`);
  console.log('Smoke: tarot replay complete; checking compass');
  await win.loadURL('atlas://app/methods/fengshui');
  await waitFor('document.querySelector(".luopan img")?.naturalWidth > 0');
  await evaluate('[...document.querySelectorAll(".luopan__buttons button")].find(button => button.textContent.includes("西 270°")).click()');
  assert.ok(await evaluate('document.querySelector(".luopan").textContent.includes("坐 270° · 西 · 酉山")'));
  win.setContentSize(320, 720);
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false, 'narrow compass overflow');
  win.setContentSize(1280, 900);
  console.log('Smoke: compass complete; checking coins');
  await win.loadURL('atlas://app/methods/iching');
  await waitFor('!!document.querySelector(".culture-card")');
  await waitFor('document.querySelectorAll(".coin-panel__coins img").length === 3 && [...document.querySelectorAll(".coin-panel__coins img")].every(image => image.naturalWidth > 0)');
  win.setContentSize(320, 720);
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false, 'narrow coin overflow');
  win.setContentSize(1280, 900);
  for (let i = 0; i < 6; i++) {
    await evaluate('document.querySelectorAll(".coin-panel__manual button")[1].click()');
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  await waitFor('!!document.querySelector(".iching-result")');
  const qian = await evaluate('document.querySelector(".iching-result h2").textContent');
  assert.match(qian, /本卦 乾（1）/);
  assert.match(qian, /变卦 乾（1）/);
  assert.ok(await evaluate('document.querySelector(".iching-result").textContent.includes("本卦故事")'));
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
  await fs.writeFile(path.join(output, 'smoke-results.json'), JSON.stringify({ offline: true, routes: results, qian, tarotAssets, tarotDrawAndReplay: true, compassManualBearing: 270, narrowCompassAndCoins: true, cultureNotePersists: true, cultureLibraryAllRoutes: true, offlineCopilotFallback: true, proxyWithoutKey: api.status, isolatedRenderer: true, narrowWidth: 390, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, routes: results.length, offline: true, proxyStatus: api.status }));
  win.destroy();
  app.exit(0);
})().catch((error) => { console.error(error); app.exit(1); });
