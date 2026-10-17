import { describe, expect, it } from 'vitest';
import Achievements from '../../src/components/Achievements.astro';
import Skills from '../../src/components/Skills.astro';
import { render } from '../render';

describe.each([
  ['Achievements', Achievements],
  ['Skills', Skills],
])('%s', (title, component) => {
  it('renders nothing for an empty list (AC-06)', async () => {
    expect((await render(component, { props: { items: [] } })).trim()).toBe('');
  });

  it('renders a titled list in the Owner order, without sorting or deduping (AC-04, AC-05)', async () => {
    const html = await render(component, { props: { items: ['Zeta', 'Alpha', 'Zeta'] } });
    expect(html).toMatch(new RegExp(`<h2[^>]*>${title}</h2>`));
    expect([...html.matchAll(/<li[^>]*>([^<]*)<\/li>/g)].map((m) => m[1])).toEqual(['Zeta', 'Alpha', 'Zeta']);
  });

  it('prints markup as literal text', async () => {
    const html = await render(component, { props: { items: ['<b>x</b>'] } });
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});
