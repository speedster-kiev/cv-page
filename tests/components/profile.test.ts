import { describe, expect, it } from 'vitest';
import Profile from '../../src/components/Profile.astro';
import { render } from '../render';

const base = { name: 'Jane Doe', headline: 'Engineering Manager' };
const photo = { file: 'photo.jpg', alt: 'Portrait of Jane' };

describe('Profile', () => {
  it('renders name, headline and summary paragraphs in that order (AC-01)', async () => {
    const html = await render(Profile, { props: { ...base, summary: 'First para.\n\nSecond para.' } });
    const order = ['<h1', 'Jane Doe', 'Engineering Manager', 'First para.', 'Second para.'].map((s) => html.indexOf(s));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(html.match(/<p[ >]/g)).toHaveLength(3);
  });

  it('renders the photo with its alt text and explicit size (AC-01)', async () => {
    const html = await render(Profile, { props: { ...base, photo } });
    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toContain('alt="Portrait of Jane"');
    expect(img).toMatch(/width="160"/);
    expect(img).toMatch(/height="160"/);
    expect(html.indexOf('<img')).toBeLessThan(html.indexOf('<h1'));
  });

  it('renders no image and no wrapper box without a photo', async () => {
    const html = await render(Profile, { props: base });
    expect(html).not.toContain('<img');
    expect(html).toContain('Jane Doe');
  });

  it('renders no empty paragraph without a summary', async () => {
    const html = await render(Profile, { props: base });
    expect(html.match(/<p[ >]/g)).toHaveLength(1);
    expect(html).not.toMatch(/<p[^>]*>\s*<\/p>/);
  });

  it('shows markup in the name as text', async () => {
    const html = await render(Profile, { props: { ...base, name: '<script>alert(1)</script>' } });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('fails loudly when the photo file does not exist', async () => {
    await expect(render(Profile, { props: { ...base, photo: { file: 'nope.jpg', alt: 'x' } } })).rejects.toThrow(/nope\.jpg/);
  });
});
