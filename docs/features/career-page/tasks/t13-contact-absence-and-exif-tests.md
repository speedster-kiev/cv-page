---
id: T13
title: "Add dist-wide contact absence and image metadata tests"
layer: "tests"
deps: ["T11", "T2"]
blocks: []
acs: ["AC-13"]
files_hint: ["tests/contact-absence.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T13 — Add dist-wide contact absence and image metadata tests

## Place in the sequence

- **Blocked by:** T11 — Compose index.astro from the loader and components; remove the placeholder, T2 — Implement the contact-shape detector with table-driven unit tests · **Blocks:** — · **Wave:** 6, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As an** Owner
> **I want** the page to refuse to publish my raw email address or phone number inside career text
> **So that** a slip in my own wording cannot expose them to scraping bots
>
> — `spec.md §4, US-08, verbatim` · full text: [spec.md](../spec.md)

Satisfies the CLAUDE.md hard rule: asserts no email or phone shape in any file under `dist/` and no EXIF segment in delivered images.

## Inlined context

> **Hard rule:** Raw email and phone must never appear in `dist/`. They are encoded at build time and assembled in the browser on click (ADR 0003). Anything touching them goes in `src/lib/contact/` with a test in `tests/` that asserts their absence from the built HTML.
>
> — `CLAUDE.md §Hard rule: contact details, verbatim` · full text: [CLAUDE.md](../../../../CLAUDE.md)

> **QG-3** no raw email address and no raw phone number appear anywhere in `dist/` (AC-13), and the photo carries no source metadata. **How verify:** build-output test scanning every file in `dist/` for the email and phone shapes, plus a check that delivered images contain no EXIF segment.
>
> — `sad.md §10, QG-3, abridged` · full text: [sad.md](../sad.md)

> **Chosen:** Option 1. Own pattern rules in `src/lib/contact/detect.ts` — email shape; phone shape = a run of digits with spaces, dashes, dots, brackets and an optional leading `+`, containing at least 7 digits; two exemptions (year range, space-grouped amount). ... The same functions are reused by the `dist/` absence test.
>
> — `adr/0002-reject-contact-shaped-text-by-pattern.md §Considered options 1 + §Decision outcome, abridged` · full text: [adr/0002-reject-contact-shaped-text-by-pattern.md](../adr/0002-reject-contact-shaped-text-by-pattern.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-13 — domain invariant, raw contact details never shown

> **Given** the page is published
> **When** any Visitor or Machine reader reads the page in any form — visible text, links, attributes, metadata or any other delivered file
> **Then** no raw email address and no raw phone number of the Owner appear anywhere in it
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `tests/contact-absence.test.ts`: walk `dist/` recursively; for every text file (html, css, txt, xml, json, js) assert `findEmails` and `findPhones` (from `src/lib/contact/detect.ts`) return nothing
- [ ] For each image file assert no EXIF marker (`Exif\0\0` in the JPEG APP1 segment; no `eXIf` PNG chunk; no `EXIF` chunk in WebP)
- [ ] Also run the same scan over `src/content/career.yaml` so a contact-shaped slip fails here even before the loader's own check
- [ ] Assert there is at least one image in `dist/` when `career.yaml` has a photo, so the EXIF check cannot pass vacuously

## Edge cases

| Case | Behaviour |
|---|---|
| no image delivered although the photo is configured | test fails (not vacuous) |
| robots.txt and other static files | scanned like HTML |

## Definition of Done

- [ ] scan covers every file under `dist/` and passes on the built page (AC-13)
- [ ] EXIF check passes on the delivered photo
- [ ] a hand-planted `jane@example.com` in a built file makes the scan fail (verified once locally, then removed)
- [ ] every Hard Rule inlined above still holds
- [ ] lint clean
