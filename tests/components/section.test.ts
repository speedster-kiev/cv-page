import { describe, expect, it } from 'vitest';
import Section from '../../src/components/Section.astro';
import { render } from '../render';

describe('Section', () => {
  it('renders nothing when it has no entries (AC-06)', async () => {
    const html = await render(Section, { props: { title: 'Education', count: 0 }, slots: { default: '<p>x</p>' } });
    expect(html.trim()).toBe('');
  });

  it('renders a titled section with its content when it has entries', async () => {
    const html = await render(Section, { props: { title: 'Skills', count: 2 }, slots: { default: '<ul></ul>' } });
    expect(html).toContain('<section');
    expect(html).toMatch(/<h2[^>]*>Skills<\/h2>/);
    expect(html).toContain('<ul></ul>');
  });

  it('prints the title as escaped text', async () => {
    const html = await render(Section, { props: { title: '<script>x</script>', count: 1 } });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
