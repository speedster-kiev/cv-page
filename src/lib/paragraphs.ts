// Plain-text paragraphs: a blank line starts a new one. Printed as escaped text by the components.
export const paragraphs = (text?: string): string[] =>
  (text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
