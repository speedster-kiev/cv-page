import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseDocument } from 'yaml';
import { hasContactShape } from '../lib/contact/detect';
import { entryLabel, formatPath, validateCareer, type Career, type Path } from './schema';

const DEFAULT_FILE = 'src/content/career.yaml';
const CONTACT_HINT = 'contains a contact detail; contact details are shared only through the contact section';

type Position = Career['positions'][number];
type Education = Career['education'][number];

// What the components receive: Positions ordered, periods ready to print.
export type PresentedCareer = Omit<Career, 'positions' | 'education'> & {
  positions: (Position & { period: string })[];
  education: (Education & { period?: string })[];
};

export const formatPeriod = (start: string, end?: string): string => `${start} – ${end ?? 'Present'}`;

// Ongoing first, then newest start first; Array.prototype.sort is stable, so ties keep the Owner's order.
export function sortPositions<T extends { start: string; end?: string }>(positions: readonly T[]): T[] {
  return [...positions].sort(
    (a, b) => Number(b.end === undefined) - Number(a.end === undefined) || b.start.localeCompare(a.start),
  );
}

// An education entry may give one year, both or none.
const educationPeriod = ({ start, end }: Education): string | undefined =>
  start && end ? formatPeriod(start, end) : (start ?? end);

function present(career: Career): PresentedCareer {
  return {
    ...career,
    positions: sortPositions(career.positions).map((p) => ({ ...p, period: formatPeriod(p.start, p.end) })),
    education: career.education.map((e) => ({ ...e, period: educationPeriod(e) })),
  };
}

// One error for the whole Content file: every problem, each naming its entry (spec §6).
export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid career content (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n${problems.map((p) => `  ${p}`).join('\n')}`);
    this.name = 'ContentError';
  }
}

// Never echoes the value: a flagged email or phone must not reach build logs.
function scanForContactShapes(node: unknown, path: Path, raw: unknown, found: string[]): void {
  if (typeof node === 'string') {
    if (hasContactShape(node)) found.push(`${formatPath(path)} — ${CONTACT_HINT}${entryLabel(raw, path)}`);
  } else if (Array.isArray(node)) {
    node.forEach((item, index) => scanForContactShapes(item, [...path, index], raw, found));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) scanForContactShapes(value, [...path, key], raw, found);
  }
}

export function parseCareer(source: string, label: string): PresentedCareer {
  const prefix = (problem: string) => `${label}: ${problem}`;

  const doc = parseDocument(source);
  if (doc.errors.length > 0) {
    throw new ContentError(
      doc.errors.map((e) => {
        const pos = e.linePos?.[0];
        return prefix(`${pos ? `line ${pos.line}, column ${pos.col} — ` : ''}${e.message.split('\n')[0]}`);
      }),
    );
  }

  const raw: unknown = doc.toJS();
  if (raw === null || raw === undefined) throw new ContentError([prefix('file is empty')]);
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ContentError([prefix('file must be a mapping of keys')]);
  }

  const { data, problems } = validateCareer(raw);
  const contact: string[] = [];
  scanForContactShapes(raw, [], raw, contact);

  const all = [...problems, ...contact];
  if (all.length > 0 || !data) throw new ContentError(all.map(prefix));
  return present(data);
}

export function loadCareer(path: string = process.env.CV_CONTENT_FILE ?? DEFAULT_FILE): PresentedCareer {
  const label = basename(path);
  if (!existsSync(path)) throw new ContentError([`${label}: file not found at ${path}`]);
  return parseCareer(readFileSync(path, 'utf8'), label);
}
