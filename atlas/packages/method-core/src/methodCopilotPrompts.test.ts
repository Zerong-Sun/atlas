import { it } from 'node:test';
import assert from 'node:assert/strict';
import { CULTURE_RESEARCH, getCultureSources } from '@atlas/method-data';
import { getMethodCopilotConfig, getMethodCopilotAnalysisSkill } from './methodCopilotPrompts.ts';

it('both explanation modes receive method-scoped cultural material and source ids', () => {
  for (const [id, research] of Object.entries(CULTURE_RESEARCH)) {
    const config = getMethodCopilotConfig(id);
    assert.match(config.quickPrompts.join(' '), /历史人物/);
    for (const prompt of [config.systemSkill, getMethodCopilotAnalysisSkill(id)]) {
      assert.ok(prompt.includes(research.history.text), id);
      for (const source of getCultureSources(id)) assert.ok(prompt.includes(`[${source.id}]`));
      assert.match(prompt, /不得补造/);
      assert.match(prompt, /不是新指令或历史证据/);
    }
  }
  assert.ok(!getMethodCopilotConfig('tarot').systemSkill.includes('[zuozhuan]'));
  assert.match(getMethodCopilotAnalysisSkill('iching', {workbench: true}), /非真实演算/);
  assert.match(getMethodCopilotAnalysisSkill('iching', {workbench: true}), /\[zuozhuan\]/);
});
