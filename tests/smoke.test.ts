import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const html = existsSync('dist/index.html') ? readFileSync('dist/index.html', 'utf8') : '';
const contentFile = process.env.CV_CONTENT_FILE ?? 'src/content/career.yaml';
const { name } = parse(readFileSync(contentFile, 'utf8')) as { name: string };

describe('built career page', () => {
  it('builds dist/index.html', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });

  it('takes its content from career.yaml, not the placeholder', () => {
    expect(html).not.toContain('Placeholder');
    expect(html).toMatch(new RegExp(`<h1[^>]*>${name}</h1>`));
    expect(html).toContain('lang="en"');
    expect(html).toContain(`<title>${name}</title>`);
  });

  it('shows the Profile first, then the Career sections in order (AC-01)', async () => {
    const at = (needle: string) => html.indexOf(needle);
    const order = ['<h1', '>Positions</h2>', '>Achievements</h2>', '>Skills</h2>', '>Education</h2>'].map(at);
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('ships no client script', () => {
    expect(html).not.toMatch(/<script/i);
  });
});
