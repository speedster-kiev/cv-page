import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

type Build = { status: number; output: string; dir: string };

const dirs: string[] = [];

// Builds one fixture into its own output directory, so the dist/ built by the global setup is never touched.
function buildWith(fixture: string): Build {
  const dir = mkdtempSync(join(tmpdir(), 'cv-build-'));
  dirs.push(dir);
  try {
    execFileSync('npx', ['astro', 'build'], {
      env: { ...process.env, CV_CONTENT_FILE: `tests/fixtures/${fixture}.yaml`, CV_OUT_DIR: dir },
      stdio: 'pipe',
    });
    return { status: 0, output: '', dir };
  } catch (error) {
    const e = error as { status: number; stdout: Buffer; stderr: Buffer };
    return { status: e.status, output: `${e.stdout}${e.stderr}`, dir };
  }
}

const pageText = (dir: string) => readFileSync(join(dir, 'index.html'), 'utf8');

afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

const BUILD_TIMEOUT = 60_000;

describe('invalid content stops the build and names the entry', () => {
  const cases: [string, string, string, RegExp[]][] = [
    ['AC-08', 'no-name', 'no name', [/name — required/]],
    ['AC-08b', 'no-headline', 'no headline', [/headline — required/]],
    ['AC-08b', 'position-missing-employer', 'a Position without an employer', [/positions\[0\]\.employer — required/, /Position "Engineer"/]],
    ['AC-09', 'end-before-start', 'a period ending before it starts', [/cannot end before it starts/, /Position "Acme, Engineer"/]],
    ['AC-08b', 'missing-photo', 'a photo file that does not exist', [/ContentError/, /photo\.file — nope\.jpg not found/]],
    ['AC-08b', 'non-image-photo', 'a photo file that is not a supported image', [/ContentError/, /photo\.file — .*jpg, jpeg, png or webp/]],
    ['AC-12', 'contact-in-summary', 'an email in the summary', [/summary — contains a contact detail/, /contact section/]],
  ];

  it.each(cases)('%s: %s (%s)', (_ac, fixture, _what, messages) => {
    const distBefore = existsSync('dist/index.html') ? readFileSync('dist/index.html', 'utf8') : null;
    const { status, output, dir } = buildWith(fixture);

    expect(status).not.toBe(0); // AC-10
    expect(existsSync(join(dir, 'index.html'))).toBe(false); // AC-10
    for (const message of messages) expect(output).toMatch(message);
    expect(output).not.toContain('jane@example.com'); // a flagged value is never echoed
    expect(existsSync('dist/index.html') ? readFileSync('dist/index.html', 'utf8') : null).toBe(distBefore);
  }, BUILD_TIMEOUT);
});

describe('valid content builds', () => {
  it('escapes markup in Career content (QG-2)', () => {
    const { status, dir } = buildWith('script-in-content');
    expect(status).toBe(0);
    const html = pageText(dir);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toMatch(/<script/i);
  }, BUILD_TIMEOUT);

  it('omits an absent Education section without a placeholder (AC-06)', () => {
    const { status, dir } = buildWith('no-education');
    expect(status).toBe(0);
    const html = pageText(dir);
    expect(html).not.toMatch(/Education/i);
    expect(html).not.toMatch(/placeholder|coming soon|n\/a/i);
  }, BUILD_TIMEOUT);

  it('changing one Position title changes only that title (AC-07)', () => {
    const before = buildWith('valid');
    const after = buildWith('title-changed');
    expect(before.status).toBe(0);
    expect(after.status).toBe(0);
    const [a, b] = [pageText(before.dir), pageText(after.dir)];
    expect(a).not.toContain('Principal');
    expect(b).toContain('Principal');
    expect(b.replaceAll('Principal', 'Lead')).toBe(a);
  }, 2 * BUILD_TIMEOUT);
});
