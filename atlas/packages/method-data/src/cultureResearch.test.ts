import { it } from 'node:test';
import assert from 'node:assert/strict';
import { DIVINATION_METHODS } from './divinationMethods.ts';
import { CULTURE_RESEARCH, getCultureResearch, getCultureSources, getCultureContext, getCultureLibraryReply } from './cultureResearch.ts';

it('covers exactly every ready method with supported sources and complete learning material', () => {
  const ready = DIVINATION_METHODS.filter(m => m.status === 'ready').map(m => m.id).sort();
  assert.deepEqual(Object.keys(CULTURE_RESEARCH).sort(), ready);
  for (const id of ready) {
    const item = getCultureResearch(id)!;
    for (const field of ['period', 'why', 'people', 'lens', 'before', 'after', 'boundary'] as const) assert.ok(item[field].length > 8, `${id}.${field}`);
    assert.ok(item.history.text.length > 35);
    const sources = getCultureSources(id);
    assert.ok(sources.length > 0);
    assert.equal(sources.length, item.sourceIds.length);
    for (const source of sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.ok(source.scope.length > 8);
      assert.ok(getCultureContext(id).includes(`[${source.id}]`));
    }
    assert.ok(getCultureContext(id).length < 6000);
  }
});
it('keeps historical uncertainty and modern practice explicit', () => {
  assert.equal(getCultureResearch('ziwei')?.history.evidence, 'uncertain');
  assert.equal(getCultureResearch('meihua')?.history.evidence, 'attributed');
  for (const id of ['oracle', 'numerology', 'astrodice']) assert.equal(getCultureResearch(id)?.history.evidence, 'modern');
  assert.match(getCultureResearch('bazi-relationship')!.people, /没有可核实/);
});
it('offline replies distinguish missing credentials and failures, never impersonating personal analysis', () => {
  for (const id of Object.keys(CULTURE_RESEARCH)) {
    const missing = getCultureLibraryReply(id, 'missing-key')!;
    const unavailable = getCultureLibraryReply(id, 'unavailable')!;
    assert.equal(missing.degraded, true);
    assert.match(missing.sections[0].content, /尚未配置/);
    assert.match(unavailable.sections[0].content, /暂不可用/);
    assert.match(missing.sections[0].title, /非 AI 个性化解读/);
  }
});
it('unknown or prototype method ids do not resolve to a library entry', () => {
  for (const id of [null, '', 'unknown', '__proto__', 'constructor']) {
    assert.equal(getCultureResearch(id), undefined);
    assert.equal(getCultureContext(id), '');
    assert.deepEqual(getCultureSources(id), []);
    assert.equal(getCultureLibraryReply(id, 'unavailable'), undefined);
  }
});
