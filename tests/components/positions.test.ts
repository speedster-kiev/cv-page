import { describe, expect, it } from 'vitest';
import Positions from '../../src/components/Positions.astro';
import { render } from '../render';

const position = (over: Record<string, unknown> = {}) => ({
  employer: 'Acme',
  title: 'Engineer',
  start: '2020',
  period: '2020 – Present',
  achievements: ['Shipped it'],
  ...over,
});

describe('Positions', () => {
  it('renders nothing without Positions (AC-06)', async () => {
    const html = await render(Positions, { props: { positions: [] } });
    expect(html.trim()).toBe('');
  });

  it('renders title, employer, period and achievements under a Positions heading (AC-02)', async () => {
    const html = await render(Positions, { props: { positions: [position()] } });
    expect(html).toMatch(/<h2[^>]*>Positions<\/h2>/);
    expect(html).toMatch(/<h3[^>]*>Engineer · Acme<\/h3>/);
    expect(html).toContain('2020 – Present');
    expect(html).toMatch(/<li[^>]*>Shipped it<\/li>/);
  });

  it('keeps the given Position order and does not sort', async () => {
    const html = await render(Positions, {
      props: { positions: [position({ employer: 'Old', start: '2010', period: '2010 – 2012' }), position({ employer: 'New' })] },
    });
    expect(html.indexOf('Old')).toBeLessThan(html.indexOf('New'));
  });

  it('shows the employer description and summary paragraphs when given (AC-02)', async () => {
    const html = await render(Positions, {
      props: { positions: [position({ employer_about: 'About Acme', summary: 'One.\n\nTwo.' })] },
    });
    for (const text of ['About Acme', 'One.', 'Two.']) expect(html).toContain(text);
    expect(html.indexOf('About Acme')).toBeLessThan(html.indexOf('One.'));
    expect(html.indexOf('Two.')).toBeLessThan(html.indexOf('Shipped it'));
  });

  it('leaves no empty element when optional parts are absent', async () => {
    const html = await render(Positions, { props: { positions: [position({ period: '2020 – 2021' })] } });
    expect(html).not.toMatch(/<p[^>]*>\s*<\/p>/);
    expect(html).not.toContain('undefined');
    expect(html.match(/<p[ >]/g) ?? []).toHaveLength(1); // the period line only
  });

  it('keeps long achievements in full', async () => {
    const long = 'word '.repeat(200).trim();
    const html = await render(Positions, { props: { positions: [position({ achievements: [long] })] } });
    expect(html).toContain(long);
  });

  it('prints markup as text', async () => {
    const html = await render(Positions, { props: { positions: [position({ achievements: ['<b>x</b>'] })] } });
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});
