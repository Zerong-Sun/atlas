import { beforeEach, expect, it, vi } from 'vitest';
import { askMethodCopilot, askMethodCopilotAnalysis } from './methodCopilot';
import { llmComplete } from './llm';
import { isLlmConfigured } from '@/lib/llmSettings';
vi.mock('./llm', () => ({ llmComplete: vi.fn() }));
vi.mock('@/lib/llmSettings', () => ({ isLlmConfigured: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); vi.mocked(isLlmConfigured).mockReturnValue(false); });
it('returns an honest offline library for a missing key or failed upstream', async () => {
  vi.mocked(llmComplete).mockResolvedValue({content:'', degraded:true});
  const missing = await askMethodCopilot('tarot', '谁使用过塔罗？');
  expect(missing.degraded).toBe(true);
  expect(missing.sections?.[0].content).toContain('尚未配置');
  expect(missing.sections?.[2].content).toContain('15世纪');
  vi.mocked(isLlmConfigured).mockReturnValue(true);
  const failed = await askMethodCopilotAnalysis('tarot', '解析本次报告', [], {methodId:'tarot',source:'method',title:'测试牌阵',body:'太阳'});
  expect(failed.sections?.[0].content).toContain('暂不可用');
  expect(failed.sections?.[0].title).toContain('非 AI 个性化解读');
});
it('sends scoped source material to the API in ordinary and report modes', async () => {
  vi.mocked(llmComplete).mockResolvedValue({content:JSON.stringify({answer:'资料说明 [zuozhuan]',diagram:'',relatedTerms:[]}),degraded:false});
  expect((await askMethodCopilot('iching','历史案例？')).degraded).toBe(false);
  expect(vi.mocked(llmComplete).mock.calls[0][0].messages[0].content).toContain('[zuozhuan]');
  await askMethodCopilotAnalysis(null,'解析本次报告',[],{methodId:'iching',source:'method',title:'测试',body:'本卦乾，无动爻'});
  const messages=vi.mocked(llmComplete).mock.calls[1][0].messages;
  expect(messages[0].content).toContain('[zuozhuan]');
  expect(messages[1].role).toBe('user');
  expect(messages[1].content).toContain('本卦乾，无动爻');
});
it('does not call the API for whitespace-only questions', async () => {
  expect((await askMethodCopilot('tarot','  ')).answer).toContain('请输入');
  expect(llmComplete).not.toHaveBeenCalled();
});

it.each(['{"answer":"unfinished', '{}', 'null'])('falls back for invalid or empty structured output: %s', async (content) => {
  vi.mocked(isLlmConfigured).mockReturnValue(true);
  vi.mocked(llmComplete).mockResolvedValue({content,degraded:false});
  const reply=await askMethodCopilot('tarot','文化背景');
  expect(reply.degraded).toBe(true);
  expect(reply.sections?.[0].title).toContain('离线文库');
});
