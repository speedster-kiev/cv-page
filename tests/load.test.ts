import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ContentError, loadCareer, parseCareer } from '../src/content/load';

// Fake contact shapes only; no real contact detail belongs in the repo.
const MINIMAL = `
name: Jane Doe
headline: Engineering Manager
positions:
  - employer: Acme
    title: Engineer
    start: "2020"
    achievements:
      - Shipped it
`;

const failure = (yamlText: string): ContentError => {
  try {
    parseCareer(yamlText, 'career.yaml');
  } catch (error) {
    expect(error).toBeInstanceOf(ContentError);
    return error as ContentError;
  }
  throw new Error('expected parseCareer to throw');
};

describe('parseCareer — valid content', () => {
  it('returns validated data', () => {
    const career = parseCareer(MINIMAL, 'career.yaml');
    expect(career.name).toBe('Jane Doe');
    expect(career.positions[0].employer).toBe('Acme');
  });

  it('does not reject ordinary numbers and ranges in text', () => {
    const yamlText = MINIMAL.replace('Shipped it', 'Served 1 000 000 users in 2019–2023 with 10 engineers');
    expect(parseCareer(yamlText, 'career.yaml').positions[0].achievements[0]).toContain('1 000 000');
  });
});

describe('parseCareer — schema problems (AC-08, AC-08b, AC-09)', () => {
  it('lists a missing name as "career.yaml: name — required"', () => {
    const error = failure(MINIMAL.replace('name: Jane Doe\n', ''));
    expect(error.problems).toEqual(['career.yaml: name — required']);
  });

  it('names the Position for a missing item', () => {
    const error = failure(MINIMAL.replace('employer: Acme\n    ', ''));
    expect(error.problems).toEqual([
      'career.yaml: positions[0].employer — required (Position "Engineer")',
    ]);
  });

  it('names the entry for a period that ends before it starts', () => {
    const error = failure(MINIMAL.replace('start: "2020"', 'start: "2020"\n    end: "2019"'));
    expect(error.problems).toEqual([
      'career.yaml: positions[0].end — a period cannot end before it starts (Position "Acme, Engineer")',
    ]);
  });

  it('puts every problem in one error and in its message', () => {
    const error = failure('positions: []\n');
    expect(error.problems).toHaveLength(2);
    for (const problem of error.problems) expect(error.message).toContain(problem);
  });
});

describe('parseCareer — contact shapes (AC-12)', () => {
  const hint = 'contact details are shared only through the contact section';

  it.each([
    ['name', MINIMAL.replace('Jane Doe', 'Jane jane@example.com'), 'name'],
    ['headline', MINIMAL.replace('Engineering Manager', 'Call +45 12 34 56 78'), 'headline'],
    ['summary', `${MINIMAL}summary: write jane@example.com\n`, 'summary'],
    [
      'photo alt',
      `${MINIMAL}photo:\n  file: photo.jpg\n  alt: jane@example.com\n`,
      'photo.alt',
    ],
    ['achievement', MINIMAL.replace('Shipped it', 'mail jane@example.com'), 'positions[0].achievements[0]'],
    [
      'position text',
      MINIMAL.replace('title: Engineer', 'title: Engineer\n    summary: (555) 123-4567'),
      'positions[0].summary',
    ],
    [
      'employer description',
      MINIMAL.replace('employer: Acme', 'employer: Acme\n    employer_about: jane@example.com'),
      'positions[0].employer_about',
    ],
    ['page achievement', `${MINIMAL}achievements:\n  - call 12345678\n`, 'achievements[0]'],
    ['skill', `${MINIMAL}skills:\n  - jane@example.com\n`, 'skills[0]'],
    [
      'education',
      `${MINIMAL}education:\n  - institution: Uni\n    degree: +380-44-123-45-67\n`,
      'education[0].degree',
    ],
  ])('rejects a contact shape in %s and names the entry', (_field, yamlText, path) => {
    const error = failure(yamlText);
    const line = error.problems.find((p) => p.startsWith(`career.yaml: ${path} — `));
    expect(line).toBeDefined();
    expect(line).toContain(hint);
  });

  it('names the Position for a contact shape inside one', () => {
    const error = failure(MINIMAL.replace('Shipped it', 'mail jane@example.com'));
    expect(error.problems[0]).toContain('(Position "Acme, Engineer")');
  });

  it('reports the contact shape together with schema problems', () => {
    const error = failure(MINIMAL.replace('name: Jane Doe\n', '').replace('Shipped it', 'jane@example.com'));
    expect(error.problems).toHaveLength(2);
  });

  it('does not echo the raw contact value in the message', () => {
    const error = failure(MINIMAL.replace('Shipped it', 'mail jane@example.com'));
    expect(error.message).not.toContain('jane@example.com');
  });
});

describe('parseCareer — unreadable content', () => {
  it('reports a YAML syntax error with line and column', () => {
    const error = failure('name: Jane\nheadline: [unclosed\n');
    expect(error.problems[0]).toMatch(/^career\.yaml: line \d+, column \d+ — /);
  });

  it('reports an empty file', () => {
    expect(failure('').problems).toEqual(['career.yaml: file is empty']);
  });

  it('reports a file that is not a mapping', () => {
    expect(failure('- a\n- b\n').problems).toEqual(['career.yaml: file must be a mapping of keys']);
  });
});

describe('loadCareer', () => {
  let dir: string;
  const saved = process.env.CV_CONTENT_FILE;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'cv-load-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (saved === undefined) delete process.env.CV_CONTENT_FILE;
    else process.env.CV_CONTENT_FILE = saved;
  });

  it('reads the given file', () => {
    const file = join(dir, 'custom.yaml');
    writeFileSync(file, MINIMAL);
    expect(loadCareer(file).name).toBe('Jane Doe');
  });

  it('prefixes problems with the file name', () => {
    const file = join(dir, 'custom.yaml');
    writeFileSync(file, 'headline: x\n');
    expect(() => loadCareer(file)).toThrow(/custom\.yaml: name — required/);
  });

  it('reads CV_CONTENT_FILE when no path is given', () => {
    const file = join(dir, 'env.yaml');
    writeFileSync(file, MINIMAL.replace('Jane Doe', 'Env Person'));
    process.env.CV_CONTENT_FILE = file;
    expect(loadCareer().name).toBe('Env Person');
  });

  it('names the path when the file is missing', () => {
    const file = join(dir, 'missing.yaml');
    expect(() => loadCareer(file)).toThrow(ContentError);
    expect(() => loadCareer(file)).toThrow(/missing\.yaml: file not found/);
  });
});
