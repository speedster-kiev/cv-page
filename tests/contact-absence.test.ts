import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { findEmails, findPhones } from '../src/lib/contact/detect';

const contentFile = process.env.CV_CONTENT_FILE ?? 'src/content/career.yaml';
const career = parse(readFileSync(contentFile, 'utf8')) as { photo?: unknown };

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk('dist');
const TEXT = new Set(['.html', '.css', '.txt', '.xml', '.json', '.js', '.mjs', '.svg', '.webmanifest']);
const IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const hasExif = (path: string, bytes: Buffer): boolean => {
  const ext = extname(path);
  if (ext === '.jpg' || ext === '.jpeg') return bytes.includes(Buffer.from('Exif\0\0', 'latin1'));
  if (ext === '.png') return bytes.includes(Buffer.from('eXIf', 'latin1'));
  return bytes.includes(Buffer.from('EXIF', 'latin1'));
};

describe('no raw contact details in dist/ (AC-13)', () => {
  it('scans at least one text file', () => {
    expect(files.some((f) => TEXT.has(extname(f)))).toBe(true);
  });

  it.each(files.filter((f) => TEXT.has(extname(f))))('%s has no email or phone shape', (path) => {
    const text = readFileSync(path, 'utf8');
    expect({ emails: findEmails(text), phones: findPhones(text) }).toEqual({ emails: [], phones: [] });
  });

  it('the Content file itself has no email or phone shape', () => {
    const text = readFileSync(contentFile, 'utf8');
    expect({ emails: findEmails(text), phones: findPhones(text) }).toEqual({ emails: [], phones: [] });
  });
});

describe('delivered images carry no source metadata (QG-3)', () => {
  const images = files.filter((f) => IMAGE.has(extname(f)));

  it('delivers an image when the Content file configures a photo', () => {
    if (career.photo) expect(images.length).toBeGreaterThan(0);
  });

  it.each(images)('%s has no EXIF segment', (path) => {
    expect(hasExif(path, readFileSync(path))).toBe(false);
  });
});
