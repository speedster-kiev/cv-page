import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type Raw = {
  name: string;
  headline: string;
  photo?: { alt: string };
  summary?: string;
  positions?: {
    employer: string;
    employer_about?: string;
    title: string;
    start: string;
    end?: string;
    summary?: string;
    achievements: string[];
  }[];
  achievements?: string[];
  skills?: string[];
  education?: { institution: string; degree: string; start?: string; end?: string }[];
};

const contentFile = process.env.CV_CONTENT_FILE ?? 'src/content/career.yaml';
const career = parse(readFileSync(contentFile, 'utf8')) as Raw;
const html = readFileSync('dist/index.html', 'utf8');

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (s: string) =>
  s.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (m, dec, hex, name) =>
    dec ? String.fromCodePoint(+dec) : hex ? String.fromCodePoint(parseInt(hex, 16)) : (ENTITIES[name] ?? m),
  );
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const pageText = squash(decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ')));

const paragraphs = (s?: string) => (s ? s.split(/\n\s*\n/).map(squash) : []);
const period = (start?: string, end?: string) =>
  start && end ? `${start} – ${end}` : start ? `${start} – Present` : (end ?? '');

// Positions: ongoing first, then newest start, ties keep the Owner's order.
const positions = [...(career.positions ?? [])]
  .map((p, i) => ({ p, i }))
  .sort((a, b) => Number(!!a.p.end) - Number(!!b.p.end) || Number(b.p.start) - Number(a.p.start) || a.i - b.i)
  .map(({ p }) => p);

const expectedInOrder = (): string[] => [
  career.name,
  career.headline,
  ...paragraphs(career.summary),
  ...positions.flatMap((p) => [
    `${p.title} · ${p.employer}`,
    period(p.start, p.end),
    ...(p.employer_about ? [squash(p.employer_about)] : []),
    ...paragraphs(p.summary),
    ...p.achievements.map(squash),
  ]),
  ...(career.achievements ?? []).map(squash),
  ...(career.skills ?? []).map(squash),
  ...(career.education ?? []).flatMap((e) => [e.degree, e.institution]),
];

describe('built page content (AC-11)', () => {
  it('contains every Content-file text, in Visitor order', () => {
    let cursor = 0;
    for (const text of expectedInOrder()) {
      const at = pageText.indexOf(text, cursor);
      expect(at, `missing or out of order: ${text.slice(0, 60)}`).toBeGreaterThanOrEqual(0);
      cursor = at + text.length;
    }
  });

  it('carries the photo alt text on the img element', () => {
    if (!career.photo) return;
    const alt = /<img[^>]*\balt="([^"]*)"/.exec(html)?.[1];
    expect(alt && decode(alt)).toBe(career.photo.alt);
  });

  it('omits the heading of a section with no entries', () => {
    const headings: [string, unknown[] | undefined][] = [
      ['Positions', career.positions],
      ['Achievements', career.achievements],
      ['Skills', career.skills],
      ['Education', career.education],
    ];
    for (const [title, items] of headings) {
      expect(html.includes(`>${title}</h2>`), title).toBe(!!items?.length);
    }
  });
});

describe('built page structure', () => {
  it('opens with the Profile: h1 is the name, before any h2 (AC-01)', () => {
    const h1 = html.indexOf('<h1');
    expect(h1).toBeGreaterThanOrEqual(0);
    expect(html.slice(h1, html.indexOf('</h1>'))).toContain(career.name);
    const h2 = html.indexOf('<h2');
    if (h2 >= 0) expect(h1).toBeLessThan(h2);
  });

  it('lists Positions ongoing first, then newest start (AC-02, AC-03)', () => {
    const titles = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => squash(decode(m[1])));
    const wanted = positions.map((p) => `${p.title} · ${p.employer}`);
    expect(titles.slice(0, wanted.length)).toEqual(wanted);
  });

  it('shows Achievements, Skills and Education in the Owner order (AC-04, AC-05)', () => {
    const lis = (heading: string) => {
      const m = new RegExp(`>${heading}</h2>([\\s\\S]*?)(?:</section>|$)`).exec(html);
      return [...(m?.[1] ?? '').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((x) => squash(decode(x[1])));
    };
    expect(lis('Achievements')).toEqual((career.achievements ?? []).map(squash));
    expect(lis('Skills')).toEqual((career.skills ?? []).map(squash));
    const degrees = [...(/>Education<\/h2>([\s\S]*?)(?:<\/section>|$)/.exec(html)?.[1] ?? '').matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)];
    expect(degrees.map((m) => squash(decode(m[1])))).toEqual((career.education ?? []).map((e) => e.degree));
  });

  it('escapes markup characters instead of emitting them raw', () => {
    const texts = expectedInOrder().filter((t) => /[&<>]/.test(t));
    for (const t of texts) {
      expect(html).not.toContain(t);
      expect(html).toContain(t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }
  });
});

describe('built page budget and mode', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : [p];
    });

  it('keeps HTML and CSS within 100 KB uncompressed', () => {
    const bytes = files('dist')
      .filter((f) => /\.(html|css)$/.test(f))
      .reduce((n, f) => n + statSync(f).size, 0);
    expect(existsSync('dist/index.html')).toBe(true);
    expect(bytes).toBeLessThanOrEqual(100 * 1024);
  });

  it('is read-only: no form, input, button or script (AC-14)', () => {
    expect(html).not.toMatch(/<(form|input|textarea|select|button|script)\b/i);
  });
});
