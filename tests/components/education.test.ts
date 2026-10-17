import { describe, expect, it } from 'vitest';
import Education from '../../src/components/Education.astro';
import { render } from '../render';

const entry = (over: Record<string, unknown> = {}) => ({
  institution: 'National Aviation University',
  degree: "Master's Degree in Computer Science",
  ...over,
});

describe('Education', () => {
  it('renders nothing without entries (AC-06)', async () => {
    expect((await render(Education, { props: { entries: [] } })).trim()).toBe('');
  });

  it('renders degree, institution and period when given (AC-05)', async () => {
    const html = await render(Education, { props: { entries: [entry({ period: '2004 – 2005' })] } });
    expect(html).toMatch(/<h2[^>]*>Education<\/h2>/);
    expect(html).toMatch(/<h3[^>]*>Master&#39;s Degree in Computer Science<\/h3>/);
    expect(html).toContain('National Aviation University');
    expect(html).toContain('2004 – 2005');
  });

  it('leaves no period element or separator when there is no period (AC-05)', async () => {
    const html = await render(Education, { props: { entries: [entry()] } });
    expect(html).toContain('National Aviation University');
    expect(html).not.toContain('·');
    expect(html).not.toContain('undefined');
  });

  it('keeps the Owner order', async () => {
    const html = await render(Education, {
      props: { entries: [entry({ degree: 'Second' }), entry({ degree: 'First' })] },
    });
    expect(html.indexOf('Second')).toBeLessThan(html.indexOf('First'));
  });

  it('prints markup as text', async () => {
    const html = await render(Education, { props: { entries: [entry({ degree: '<i>x</i>' })] } });
    expect(html).not.toContain('<i>');
    expect(html).toContain('&lt;i&gt;x&lt;/i&gt;');
  });
});
