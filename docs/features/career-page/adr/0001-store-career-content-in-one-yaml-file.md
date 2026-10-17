---
status: Accepted
owner: "mkarazeev@gmail.com"
reviewers: ["Tech Lead"]
updated_at: "2026-10-17"
feature_size: "S"
ticket: "n/a"
---

# 0001 — Store career content in one YAML file

- **Status:** Accepted
- **Date:** 2026-10-17
- **Deciders:** mkarazeev@gmail.com (Owner), Claude (design)

## Context

The Owner changes what the page says by editing only the Content file (US-05), and every validation failure must say where in the file the problem is (AC-08, spec §6 "Failure message quality"). The skeleton holds a placeholder `src/content/content.json`. The Owner has their CV as Markdown today and can export it to any format (2026-10-17).

## Decision drivers

- AC-08 / AC-08b / AC-09: errors must name the entry and where it belongs.
- Spec §3: Career content is plain text only, no markup or links.
- Owner edits by hand, rarely; comments and multi-line text help.
- Few dependencies to maintain (foundation ADR 0001).

## Considered options

1. **YAML file `src/content/career.yaml`** — parsed with the `yaml` package (YAML 1.2); comments, multi-line text, syntax errors with line and column.
2. **JSON file `src/content/content.json`** — already in the skeleton, no new dependency, but no comments, strict commas and quotes, and `JSON.parse` reports only a character offset.
3. **Markdown with frontmatter** — natural for prose, but content is plain text only, so a heading parser would be extra code with worse error messages.

4. **Astro content collection with the `file()` loader** — the framework-native way to load and schema-check a data file. It would parse YAML or JSON and validate with Zod, but its default errors do not give the line/column AC-08 asks for, the contact-shape scan and the sorting need our own code anyway, and it adds a content layer for a single small file. Rejected; Zod itself is still used for the schema.

## Decision outcome

**Chosen:** Option 1. It gives the Owner comments and readable multi-line text and gives the loader line/column for syntax errors, at the cost of one explicit dependency (`yaml`, already present through Astro). Months are stored as `YYYY-MM` strings and the schema rejects non-string values, which avoids YAML's implicit typing of dates and `yes`/`no`.

## Consequences

**Positive**
- Errors read `career.yaml: positions[1].employer — required`, with line and column for syntax errors.
- The Owner can comment out or annotate entries.

**Negative**
- Indentation matters; a stray space can break the structure (caught by the schema with a clear message).
- One more declared dependency to keep updated.

**Neutral**
- The Owner's Markdown CV is converted once to `career.yaml` (Owner task, before `implement`).
- Switching format later means rewriting the file and the parse step in `load.ts` only; the schema and components do not change.

## Links

- Spec: [[../spec.md]] §5 AC-08, AC-08b, AC-09; §8 open question 1
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-reject-contact-shaped-text-by-pattern]]
