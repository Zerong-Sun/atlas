// Explicit opt-in only: this makes billable requests using local credentials.
// Run: node --env-file=apps/web/.env.local --import tsx scripts/check-live-culture.mjs --live
import assert from 'node:assert/strict';
import proxy from '../lib/llm-proxy-handler.ts';
import { getMethodCopilotConfig, getMethodCopilotAnalysisSkill } from '../packages/method-core/src/methodCopilotPrompts.ts';
import { getCultureSources } from '../packages/method-data/src/cultureResearch.ts';

if (!process.argv.includes('--live')) throw new Error('Pass --live to authorize live API requests.');
const apiKey = process.env.VITE_LLM_API_KEY;
if (!apiKey) throw new Error('VITE_LLM_API_KEY is required; no credentials are printed.');
const baseUrl = process.env.VITE_LLM_API_BASE_URL || 'https://api.deepseek.com/v1';
const model = process.env.VITE_LLM_MODEL || 'deepseek-v4-flash';
const cases = [
  { id:'ping', messages:[{role:'user',content:'Reply with exactly: pong'}] },
  { id:'tarot', question:'塔罗最早为什么使用？15世纪的宫廷家族是否已经按现代方式占卜？请引用文库资料。' },
  { id:'ziwei', question:'陈抟是现代紫微十四主星体系的创始人吗？这份文库能确认哪些史实？请给资料id。' },
  { id:'iching', analysis:true, question:'结合当前报告说明文化背景与一个自省练习，引用文库资料，区分结果与历史。' },
];
const results=[];
for (const item of cases) {
  const messages=item.messages || [
    {role:'system',content:item.analysis ? getMethodCopilotAnalysisSkill(item.id) : getMethodCopilotConfig(item.id).systemSkill},
    ...(item.analysis ? [{role:'user',content:'【合成测试报告，无个人资料】本卦乾，无动爻；问题：如何坚持学习？'}] : []),
    {role:'user',content:item.question},
  ];
  const start=Date.now();
  const response=await proxy.handleLlmProxy(new Request('http://localhost/api/llm', {
    method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`,'x-llm-base-url':baseUrl},
    body:JSON.stringify({model,messages,max_tokens:item.id==='ping'?32:item.analysis?2400:800,...(item.id==='ping'?{}:{response_format:{type:'json_object'}}),...(new URL(baseUrl).hostname==='api.deepseek.com'?{thinking:{type:'disabled'}}:{})}),
  }));
  assert.equal(response.status,200,`${item.id}: HTTP ${response.status}`);
  const data=await response.json();
  const content=data.choices?.[0]?.message?.content?.trim();
  assert.ok(content,`${item.id}: no final answer`);
  if(item.id==='ping') assert.match(content,/^pong[.!]?$/i);
  else {
    const answer=JSON.parse(content);
    assert.ok(typeof answer.answer==='string' || answer.sections?.length,`${item.id}: invalid answer structure`);
    const citations=[...content.matchAll(/\[([a-z][a-z0-9-]+)\]/g)].map(m=>m[1]);
    const allowed=getCultureSources(item.id).map(s=>s.id);
    assert.ok(citations.length>0,`${item.id}: no source citation`);
    assert.ok(citations.every(id=>allowed.includes(id)),`${item.id}: unknown source citation`);
  }
  results.push({case:item.id,status:response.status,latencyMs:Date.now()-start,returnedModel:data.model,content});
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),host:new URL(baseUrl).hostname,requestedModel:model,syntheticDataOnly:true,results},null,2));
