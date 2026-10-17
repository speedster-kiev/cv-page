// Contact-shape detection (feature ADR 0002). Pure functions; used by the content
// loader (AC-12) and by the dist/ absence scan (AC-13). Stores no raw values.

const MIN_PHONE_DIGITS = 7;

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

// A run of digits joined by spaces/tabs, dashes, dots and brackets, with an optional leading +.
const PHONE_RUN = /\+?[\d(][\d \t\u00a0().–-]*\d/g;

const YEAR_RANGE = /^\d{4}\s*[–-]\s*\d{4}$/;
const SPACE_GROUPED_AMOUNT = /^\d{1,3}(?:[ \u00a0]\d{3})+$/;

const digitCount = (run: string): number => run.replace(/\D/g, '').length;

const isExempt = (run: string): boolean => YEAR_RANGE.test(run) || SPACE_GROUPED_AMOUNT.test(run);

export function findEmails(text: string): string[] {
  return text.match(EMAIL) ?? [];
}

export function findPhones(text: string): string[] {
  return (text.match(PHONE_RUN) ?? []).filter(
    (run) => digitCount(run) >= MIN_PHONE_DIGITS && !isExempt(run),
  );
}

export function hasContactShape(text: string): 'email' | 'phone' | null {
  if (findEmails(text).length > 0) return 'email';
  if (findPhones(text).length > 0) return 'phone';
  return null;
}
