// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CULTURE_RESEARCH, getCultureSources } from '@atlas/method-data';
import { CultureResearchPanel } from './CultureResearchPanel';
let root:Root; let host:HTMLDivElement;
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true); host=document.createElement('div');root=createRoot(host);document.body.append(host); });
afterEach(async () => { await act(async () => root.unmount());host.remove();vi.unstubAllGlobals(); });
it('renders all 24 offline introductions, evidence and source links', async () => {
  for (const [id, item] of Object.entries(CULTURE_RESEARCH)) {
    await act(async () => root.render(<CultureResearchPanel methodId={id}/>));
    expect(host.querySelector('.culture-research__intro')?.textContent).toContain(item.why);
    expect(host.textContent).toContain(item.people);
    expect(host.textContent).toContain(item.before);
    expect(host.textContent).toContain(item.after);
    expect([...host.querySelectorAll('a')].map(a=>a.getAttribute('href'))).toEqual(getCultureSources(id).map(s=>s.url));
  }
});
it('collapses historical details when changing method and ignores invalid ids', async () => {
  await act(async () => root.render(<CultureResearchPanel methodId="tarot"/>));
  host.querySelector('details')!.open=true;
  await act(async () => root.render(<CultureResearchPanel methodId="iching"/>));
  expect(host.querySelector('details')!.open).toBe(false);
  expect(host.textContent).not.toContain('Visconti');
  await act(async () => root.render(<CultureResearchPanel methodId="__proto__"/>));
  expect(host.textContent).toBe('');
});
