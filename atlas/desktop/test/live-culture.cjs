// Opt-in real UI -> desktop protocol -> shared proxy -> configured provider test.
// From atlas/: npm run test:live-culture
// Uses a disposable profile and synthetic questions. Never prints credentials.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

let profile;
(async () => {
  assert.ok(process.env.ATLAS_LIVE_TEST === '1', 'Set ATLAS_LIVE_TEST=1 to opt into billable API calls');
  assert.ok(process.env.VITE_LLM_API_KEY, 'Local API key required');
  profile = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-live-culture-'));
  require('../build/main.cjs');
  app.setPath('userData', profile);
  app.setPath('sessionData', profile);
  await app.whenReady();
  const win = BrowserWindow.getAllWindows()[0];
  const evaluate = code => win.webContents.executeJavaScript(code);
  const waitFor = async code => {
    for (let i = 0; i < 300; i++) {
      if (await evaluate(code)) return;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error('Timed out waiting for UI state');
  };
  await waitFor('!!document.querySelector("button")');
  const settings = {apiKey:process.env.VITE_LLM_API_KEY,baseUrl:process.env.VITE_LLM_API_BASE_URL || 'https://api.deepseek.com/v1',model:process.env.VITE_LLM_MODEL || 'deepseek-v4-flash'};
  await evaluate(`localStorage.setItem('atlas:onboarding_done','1');localStorage.setItem('atlas.llm.settings',${JSON.stringify(JSON.stringify(settings))});`);
  await win.loadURL('atlas://app/methods/tarot');
  await waitFor('!!document.querySelector(".method-copilot-topbar-btn")');
  await evaluate('document.querySelector(".method-copilot-topbar-btn").click()');
  await waitFor('!!document.querySelector(".method-copilot__prompts button")');
  await evaluate('document.querySelector(".method-copilot__prompts button").click()');
  await waitFor('!!document.querySelector(".method-copilot__bubble.is-assistant")');
  const answer = await evaluate(`({text:document.querySelector('.method-copilot__bubble.is-assistant').textContent,degraded:document.querySelector('.method-copilot__bubble.is-assistant').classList.contains('is-degraded')})`);
  assert.equal(answer.degraded, false);
  assert.match(answer.text, /\[tarot-(morgan|folger)\]/);
  assert.match(answer.text, /15世纪|十五世纪/);
  await fs.mkdir(path.join(__dirname, '../release'), {recursive:true});
  await fs.writeFile(path.join(__dirname, '../release/live-culture-results.json'), JSON.stringify({checkedAt:new Date().toISOString(),passed:true,route:'/methods/tarot',transport:'renderer → atlas://app/api/llm → shared proxy → provider',host:new URL(settings.baseUrl).hostname,answer:answer.text},null,2));
  await evaluate("localStorage.removeItem('atlas.llm.settings')");
  win.destroy();
  await fs.rm(profile, {recursive:true,force:true});
  console.log(JSON.stringify({passed:true,liveUiCulture:true}));
  app.exit(0);
})().catch(async error => {
  for (const win of BrowserWindow.getAllWindows()) win.destroy();
  if (profile) await fs.rm(profile, {recursive:true,force:true}).catch(() => {});
  console.error(error.message); app.exit(1);
});
