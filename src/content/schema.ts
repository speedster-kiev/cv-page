import { z } from 'astro/zod';

// Shape of src/content/career.yaml (feature ADR 0001). Years are quoted "YYYY" strings;
// unknown keys fail the build. Problems are reported by `validateCareer` as
// `path — what is wrong (entry)` lines, never as bare Zod issues.

const text = z.string().trim().min(1);
const year = z.string().regex(/^\d{4}$/);
const textList = z.array(text).default([]);

// The Profile component globs these extensions in src/content/; keep its pattern in step.
const photoFile = text.regex(/^[^/\\]+\.(jpg|jpeg|png|webp)$/, {
  message: 'must be a file name in src/content/ ending in jpg, jpeg, png or webp',
});

const orderedPeriod = (
  period: { start?: string; end?: string },
  ctx: z.core.$RefinementCtx,
) => {
  if (period.start && period.end && period.end < period.start) {
    ctx.addIssue({
      code: 'custom',
      path: ['end'],
      message: 'a period cannot end before it starts',
    });
  }
};

const positionSchema = z
  .strictObject({
    employer: text,
    employer_about: text.optional(),
    title: text,
    start: year,
    end: year.optional(),
    summary: text.optional(),
    achievements: z.array(text).min(1),
  })
  .superRefine(orderedPeriod);

const educationSchema = z
  .strictObject({
    institution: text,
    degree: text,
    start: year.optional(),
    end: year.optional(),
  })
  .superRefine(orderedPeriod);

export const careerSchema = z.strictObject({
  name: text,
  headline: text,
  photo: z.strictObject({ file: photoFile, alt: text }).optional(),
  summary: text.optional(),
  positions: z.array(positionSchema).default([]),
  achievements: textList,
  skills: textList,
  education: z.array(educationSchema).default([]),
});

export type Career = z.infer<typeof careerSchema>;

export type Path = (string | number)[];

const getAt = (root: unknown, path: Path): unknown =>
  path.reduce<unknown>(
    (node, key) => (node == null ? undefined : (node as Record<string | number, unknown>)[key]),
    root,
  );

export const formatPath = (path: Path): string =>
  path.reduce<string>(
    (out, key) => (typeof key === 'number' ? `${out}[${key}]` : out ? `${out}.${key}` : key),
    '',
  );

const joinLabel = (...parts: unknown[]): string =>
  parts.filter((p): p is string => typeof p === 'string' && p.trim() !== '').join(', ');

// Names the Position or education entry an issue belongs to, so an index is never the only locator.
export const entryLabel = (raw: unknown, path: Path): string => {
  const [section, index] = path;
  if (typeof index !== 'number') return '';
  const entry = getAt(raw, [section, index]) as Record<string, unknown> | undefined;
  if (section === 'positions') {
    const label = joinLabel(entry?.employer, entry?.title);
    return ` (Position ${label ? `"${label}"` : `#${index + 1}`})`;
  }
  if (section === 'education') {
    const label = joinLabel(entry?.institution, entry?.degree);
    return ` (Education ${label ? `"${label}"` : `#${index + 1}`})`;
  }
  return '';
};

const isYearField = (path: Path): boolean => ['start', 'end'].includes(String(path[path.length - 1]));

function describe(raw: unknown, issue: z.core.$ZodIssue): string[] {
  const path = issue.path as Path;
  const where = formatPath(path);
  const label = entryLabel(raw, path);

  switch (issue.code) {
    case 'unrecognized_keys':
      return issue.keys.map((key) => `${formatPath([...path, key])} — unknown key${label}`);
    case 'invalid_type': {
      if (getAt(raw, path) === undefined) {
        const need = issue.expected === 'array' ? 'at least one required' : 'required';
        return [`${where} — ${need}${label}`];
      }
      if (isYearField(path)) return [`${where} — must be a year in quotes, like "2021"${label}`];
      return [`${where} — must be text${label}`];
    }
    case 'too_small':
      return [
        issue.origin === 'array'
          ? `${where} — at least one required${label}`
          : `${where} — required${label}`,
      ];
    case 'invalid_format':
      return [
        isYearField(path)
          ? `${where} — must be a four-digit year, like "2021"${label}`
          : `${where} — ${issue.message}${label}`,
      ];
    default:
      return [`${where} — ${issue.message}${label}`];
  }
}

export function validateCareer(raw: unknown): { data?: Career; problems: string[] } {
  const result = careerSchema.safeParse(raw);
  if (result.success) return { data: result.data, problems: [] };
  return { problems: result.error.issues.flatMap((issue) => describe(raw, issue)) };
}
