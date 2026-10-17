---
id: T12
title: "Add build-output tests: text, order, escaping, weight, read-only"
layer: "tests"
deps: ["T11"]
blocks: []
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05", "AC-11", "AC-14"]
files_hint: ["tests/build-output.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T12 — Add build-output tests: text, order, escaping, weight, read-only

## Place in the sequence

- **Blocked by:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Blocks:** — · **Wave:** 6, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As a** Machine reader
> **I want** every item of Career content present as readable page text
> **So that** I can index or summarise the Owner's career without running scripts
>
> — `spec.md §4, US-07, verbatim` · full text: [spec.md](../spec.md)

> **As a** Visitor
> **I want** the Owner's Positions listed with employer, title, period and achievements
> **So that** I can judge the Owner's experience and progression
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Proves on the built `dist/index.html` that every Content-file text is present, in Visitor order, escaped, within weight, and with nothing to change from the reader's side.

## Inlined context

> **QG-1** build fails, no output, 100% of failures name the offending entry; one test builds an invalid fixture (via `CV_CONTENT_FILE`) into a separate output directory, so it never touches the `dist/` that the global setup builds, and asserts non-zero exit and no `index.html` there. **QG-2** 100% of Content-file text present in the delivered page text, comparing values after display formatting (dates only), in Visitor order; photo alt read from the image's `alt` attribute; the test also checks `<script>` text in content is escaped. **QG-3** no raw email or phone anywhere in `dist/`; delivered images contain no EXIF segment.
>
> — `sad.md §10, QG-1..QG-3 How verify, abridged` · full text: [sad.md](../sad.md)

> | Delivered page weight | ≤ 100 KB uncompressed for HTML and CSS combined (the photo, fonts and scripts are not counted; the contact reveal script is step 3's budget) | build-output test that sums the built HTML and CSS files |
> | Works without scripts | 100% of Content-file text (including photo alt text) present in the delivered page text, comparing values after display formatting (dates only) | build-output test that compares the Content file against the built page |
> | Failure message quality | 100% of validation failures name the offending entry and what is wrong | automated tests of the content checks |
>
> — `spec.md §6, NFR rows weight / no-script / failure message, verbatim` · full text: [spec.md](../spec.md)

> Markup or script text inside Career content: Career content is plain text only (no formatting or links); markup is shown to Visitors as plain text, never executed.
>
> — `spec.md §6.1, abuse cases, verbatim` · full text: [spec.md](../spec.md)

> Positions order: ongoing first, then newest start first, ties keep the Owner's order. ... dates to the year (`YYYY` strings) displayed as "2021 – Present"
>
> — `sad.md §4, Assumptions taken, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-01 — happy path

> **Given** the Content file holds the Owner's name, photo (with its alt text), headline and summary
> **When** a Visitor opens the page
> **Then** the Visitor sees the name, photo, headline and summary first, before any other Career section
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

### AC-02 — happy path

> **Given** the Content file lists three Positions with different periods
> **When** a Visitor opens the page
> **Then** the Visitor sees the Positions newest first by start year, each with its employer, title, period and achievements, and also its employer description and summary when given; Positions with the same start year keep the order the Owner gave
>
> — `spec.md §5, AC-02, verbatim` · full text: [spec.md](../spec.md)

### AC-03 — happy path, current Position

> **Given** a Position in the Content file has a start but no end
> **When** a Visitor opens the page
> **Then** the Visitor sees that Position's period shown as ongoing (for example "2021 – Present"), and it appears first among the Positions; if several Positions are ongoing they are ordered newest start first, and those with the same start year keep the order the Owner gave
>
> — `spec.md §5, AC-03, verbatim` · full text: [spec.md](../spec.md)

### AC-04 — happy path

> **Given** the Content file lists notable achievements
> **When** a Visitor opens the page
> **Then** the Visitor sees them together in one achievements section, in the order the Owner gave
>
> — `spec.md §5, AC-04, verbatim` · full text: [spec.md](../spec.md)

### AC-05 — happy path

> **Given** the Content file lists skills and education entries
> **When** a Visitor opens the page
> **Then** the Visitor sees a skills section (a flat list in the order the Owner gave) and an education section (each entry with institution and degree, and a period when given, in the order the Owner gave)
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

### AC-11 — happy path

> **Given** the page is published
> **When** a Machine reader reads it without running scripts
> **Then** every item of Career content from the Content file is present as readable text, in the same order a Visitor sees it; dates may be shown in the display format a Visitor sees (such as "2021 – Present"), all other text is present as written
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

### AC-14 — authorization, only the Owner changes content

> **Given** the page is live
> **When** a Visitor or a Machine reader tries to change what the page says
> **Then** they cannot, because only the Owner, by editing the Content file in the repository, can change it; readers only read
>
> — `spec.md §5, AC-14, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `tests/build-output.test.ts`: read `dist/index.html`, strip tags with a small helper, and parse `src/content/career.yaml` with `yaml`
- [ ] AC-11/QG-2: every text value (incl. `photo.alt` read from `img[alt]`) appears in the page text in the expected order; dates compared after formatting (`2021 – Present`)
- [ ] AC-01: the first heading/section is the profile (`<h1>` is the name, before any `<h2>`); AC-02/AC-03: Position titles appear in sorted order, ongoing first; AC-04/AC-05: achievements, skills, education in Owner order
- [ ] Escaping on the real page: text containing `&` or `<` in `career.yaml` appears in the HTML as entities, never as raw markup (the `<script>`-in-content fixture lives in T14)
- [ ] Weight: sum of built `.html` + `.css` bytes ≤ 100 KB; AC-14: `dist/index.html` has no `<form>`, no `<script>` and no input elements (read-only page)

## Edge cases

| Case | Behaviour |
|---|---|
| section with no entries | its heading is absent from the page text |
| date strings | compared in display format only; all other text exact |

## Definition of Done

- [ ] tests for AC-01, AC-02, AC-03, AC-04, AC-05, AC-11 and AC-14 pass against the built `dist/`
- [ ] weight test fails if HTML+CSS exceed 100 KB
- [ ] `npm test` green (global setup builds first)
- [ ] lint clean
