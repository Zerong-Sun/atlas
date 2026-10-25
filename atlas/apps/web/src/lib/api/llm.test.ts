// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { llmComplete, testLlmConnection } from './llm';
beforeEach(() => {
  localStorage.setItem('atlas.llm.settings', JSON.stringify({apiKey:'test-only',baseUrl:'https://api.deepseek.com/v1',model:'deepseek-v4-flash'}));
});
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });
it('does not expose reasoning-only output as a successful answer or connection test', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({choices:[{message:{content:'',reasoning_content:'INTERNAL REASONING'},finish_reason:'length'}]}),{status:200})));
  expect(await llmComplete({messages:[{role:'user',content:'test'}]})).toEqual({content:'',degraded:true});
  expect((await testLlmConnection()).ok).toBe(false);
});
it('accepts final content and uses the same-origin proxy with thinking disabled', async () => {
  const fetcher=vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({choices:[{message:{content:'pong',reasoning_content:'not an answer'}}]}),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  expect((await testLlmConnection()).ok).toBe(true);
  expect(fetcher.mock.calls[0][0]).toBe('/api/llm');
  const options=fetcher.mock.calls[0][1] as RequestInit;
  expect(JSON.parse(options.body as string).thinking).toEqual({type:'disabled'});
});

it('rejects truncated final content instead of presenting partial JSON', async () => {
  vi.stubGlobal('fetch',vi.fn(async () => new Response(JSON.stringify({choices:[{message:{content:'{"answer":"unfinished'},finish_reason:'length'}]}),{status:200})));
  expect(await llmComplete({messages:[{role:'user',content:'test'}],responseFormat:'json'})).toEqual({content:'',degraded:true});
  expect((await testLlmConnection()).ok).toBe(false);
});
