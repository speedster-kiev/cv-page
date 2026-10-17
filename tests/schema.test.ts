import { describe, expect, it } from 'vitest';
import { validateCareer } from '../src/content/schema';

const position = (over: Record<string, unknown> = {}) => ({
  employer: 'Acme',
  title: 'Engineer',
  start: '2020',
  achievements: ['Shipped it'],
  ...over,
});

const valid = (over: Record<string, unknown> = {}) => ({
  name: 'Jane Doe',
  headline: 'Engineering Manager',
  positions: [position()],
  ...over,
});

const without = (obj: Record<string, unknown>, key: string) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));

const problems = (raw: unknown): string[] => validateCareer(raw).problems;

describe('validateCareer — accepted content', () => {
  it('accepts the minimal valid file', () => {
    const result = validateCareer({ name: 'Jane Doe', headline: 'EM' });
    expect(result.problems).toEqual([]);
    expect(result.data?.name).toBe('Jane Doe');
  });

  it('accepts every optional item together', () => {
    const result = validateCareer(
      valid({
        summary: 'Hi',
        photo: { file: 'photo.jpg', alt: 'Portrait' },
        positions: [
          position({ end: '2022', employer_about: 'About', summary: 'Sum' }),
        ],
        achievements: ['A'],
        skills: ['S'],
        education: [{ institution: 'Uni', degree: 'MSc', start: '2000', end: '2004' }],
      }),
    );
    expect(result.problems).toEqual([]);
  });

  it('accepts omitted optional items (AC-08b optional)', () => {
    const result = validateCareer(valid({ positions: [position()] }));
    expect(result.problems).toEqual([]);
    expect(result.data?.skills).toEqual([]);
    expect(result.data?.education).toEqual([]);
    expect(result.data?.achievements).toEqual([]);
  });

  it('accepts a period ending in the same year it starts (AC-09 boundary)', () => {
    expect(problems(valid({ positions: [position({ start: '2020', end: '2020' })] }))).toEqual([]);
  });
});

describe('validateCareer — required items (AC-08, AC-08b)', () => {
  it('reports a missing name with its path (AC-08)', () => {
    expect(problems(without(valid(), 'name'))).toEqual(['name — required']);
  });

  it('treats a blank name as missing', () => {
    expect(problems(valid({ name: '   ' }))).toEqual(['name — required']);
  });

  it('reports a missing headline', () => {
    expect(problems(without(valid(), 'headline'))).toEqual(['headline — required']);
  });

  it.each([
    ['employer', 'positions[0].employer — required (Position "Engineer")'],
    ['title', 'positions[0].title — required (Position "Acme")'],
    ['start', 'positions[0].start — required (Position "Acme, Engineer")'],
  ])('reports a Position without %s and names the Position', (field, expected) => {
    const p: Record<string, unknown> = position();
    delete p[field];
    expect(problems(valid({ positions: [p] }))).toEqual([expected]);
  });

  it('reports a Position without achievements and names it', () => {
    expect(problems(valid({ positions: [position({ achievements: [] })] }))).toEqual([
      'positions[0].achievements — at least one required (Position "Acme, Engineer")',
    ]);
    const p: Record<string, unknown> = position();
    delete p.achievements;
    expect(problems(valid({ positions: [p] }))).toEqual([
      'positions[0].achievements — at least one required (Position "Acme, Engineer")',
    ]);
  });

  it('uses the index of the offending Position', () => {
    const out = problems(valid({ positions: [position(), position({ employer: undefined })] }));
    expect(out).toEqual(['positions[1].employer — required (Position "Engineer")']);
  });

  it.each(['institution', 'degree'])('reports an education entry without %s', (field) => {
    const e: Record<string, unknown> = { institution: 'Uni', degree: 'MSc' };
    delete e[field];
    const out = problems(valid({ education: [e] }));
    expect(out).toHaveLength(1);
    expect(out[0]).toMatch(new RegExp(`^education\\[0\\]\\.${field} — required \\(Education `));
  });

  it('reports a photo without alt text', () => {
    expect(problems(valid({ photo: { file: 'photo.jpg' } }))).toEqual(['photo.alt — required']);
  });

  it('reports a photo without a file', () => {
    expect(problems(valid({ photo: { alt: 'x' } }))).toEqual(['photo.file — required']);
  });

  it('lists every problem at once', () => {
    const out = problems({ positions: [position({ title: undefined })] });
    expect(out).toHaveLength(3);
    expect(out).toContain('name — required');
    expect(out).toContain('headline — required');
  });
});

describe('validateCareer — shape rules', () => {
  it('rejects an unquoted numeric year and says to quote it', () => {
    const out = problems(valid({ positions: [position({ start: 2021 })] }));
    expect(out).toEqual([
      'positions[0].start — must be a year in quotes, like "2021" (Position "Acme, Engineer")',
    ]);
  });

  it('rejects a malformed year string', () => {
    const out = problems(valid({ positions: [position({ start: '21' })] }));
    expect(out).toEqual([
      'positions[0].start — must be a four-digit year, like "2021" (Position "Acme, Engineer")',
    ]);
  });

  it('names an unknown top-level key', () => {
    expect(problems(valid({ hobbies: ['x'] }))).toEqual(['hobbies — unknown key']);
  });

  it('names an unknown key inside a Position', () => {
    const out = problems(valid({ positions: [position({ salary: '1' })] }));
    expect(out).toEqual(['positions[0].salary — unknown key (Position "Acme, Engineer")']);
  });

  it('rejects non-text list items', () => {
    expect(problems(valid({ skills: [42] }))).toEqual(['skills[0] — must be text']);
  });
});

describe('validateCareer — period order (AC-09)', () => {
  it('rejects a Position that ends before it starts and names it', () => {
    const out = problems(valid({ positions: [position({ start: '2022', end: '2020' })] }));
    expect(out).toEqual([
      'positions[0].end — a period cannot end before it starts (Position "Acme, Engineer")',
    ]);
  });

  it('rejects an education entry that ends before it starts and names it', () => {
    const out = problems(
      valid({ education: [{ institution: 'Uni', degree: 'MSc', start: '2005', end: '2004' }] }),
    );
    expect(out).toEqual([
      'education[0].end — a period cannot end before it starts (Education "Uni, MSc")',
    ]);
  });

  it('allows an education entry with only a start or only an end', () => {
    const e = [
      { institution: 'Uni', degree: 'MSc', start: '2005' },
      { institution: 'Uni', degree: 'BSc', end: '2004' },
    ];
    expect(problems(valid({ education: e }))).toEqual([]);
  });
});
