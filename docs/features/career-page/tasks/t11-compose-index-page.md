---
id: T11
title: "Compose index.astro from the loader and components; remove the placeholder"
layer: "wiring"
deps: ["T5", "T7", "T8", "T9", "T10"]
blocks: ["T12", "T13", "T14"]
acs: ["AC-01", "AC-06", "AC-10"]
files_hint: ["src/pages/index.astro", "src/content/content.json", "astro.config.mjs", "tests/smoke.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T11 — Compose index.astro from the loader and components; remove the placeholder

## Place in the sequence

- **Blocked by:** T5 — Sort Positions and format periods in the loader, T7 — Build the Profile component with the optional processed photo, T8 — Build the Positions component with optional parts, T9 — Build the Achievements and Skills list components, T10 — Build the Education component with optional period · **Blocks:** T12 — Add build-output tests: text, order, escaping, weight, read-only, T13 — Add dist-wide contact absence and image metadata tests, T14 — Add failing-build and content-only-change fixture tests · **Wave:** 5, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As a** Visitor
> **I want** the Owner's name, photo, headline and short summary at the top of the page
> **So that** I immediately know whose career I am reading about and what role they are after
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

> **As an** Owner
> **I want** invalid Career content to stop publishing and tell me what to fix
> **So that** Visitors never see a partial or broken page
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

Replaces the placeholder page with the real composition and lets the build fail (no `index.html`) when the loader throws.

## Inlined context

> `components/` — Section, Profile, Positions, Achievements, Skills, Education. ... presentational components receive already-validated, already-sorted data. ... `pages/index.astro` calls the loader, renders sections.
>
> — `sad.md §5, internal decomposition, abridged` · full text: [sad.md](../sad.md)

> service reads profile, positions, achievements, skills, education → sorts positions → formats periods to years → alt photo present: resize and re-encode (no source metadata), place photo with alt text and explicit size; else render the profile without an image → loop each Career section: has entries → render heading and entries as escaped text; empty → omit, no heading, no placeholder. Postcondition: profile first, text order equals Content file order, no raw contact value in any output file.
>
> — `sad.md §6, flow 2 «render Career sections», abridged` · full text: [sad.md](../sad.md)

> Only the build contract is set here: `npm run build` must exit non-zero and emit no `dist/index.html` when content is invalid, so the step-5 deploy job can depend on it.
>
> — `sad.md §7, Deployment view, verbatim` · full text: [sad.md](../sad.md)

> **Accepted debt:** `CV_CONTENT_FILE` exists only so a test can point the build at an invalid fixture. ... the failing-build test uses its own output directory (QG-1).
>
> — `sad.md §11, accepted debt + risks, abridged` · full text: [sad.md](../sad.md)

> **UI architecture.** Server-rendered static HTML (SSG) with zero client JavaScript in this step.
>
> — `sad.md §4, UI architecture, abridged` · full text: [sad.md](../sad.md)

> **Hard rule:** Raw email and phone must never appear in `dist/`. They are encoded at build time and assembled in the browser on click (ADR 0003). Anything touching them goes in `src/lib/contact/` with a test in `tests/` that asserts their absence from the built HTML.
>
> — `CLAUDE.md §Hard rule: contact details, verbatim` · full text: [CLAUDE.md](../../../../CLAUDE.md)

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

### AC-06 — domain invariant, no empty sections

> **Given** the Content file has no entries for one Career section, such as education
> **When** a Visitor opens the page
> **Then** that section is not shown at all, with no empty heading and no placeholder text
>
> — `spec.md §5, AC-06, verbatim` · full text: [spec.md](../spec.md)

### AC-10 — cross-context, nothing published on failure

> **Given** the Owner's new Content file is invalid
> **When** the Owner tries to publish it
> **Then** publishing stops and nothing new is published, so Visitors never see a partial or broken page
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `src/pages/index.astro`: `const career = loadCareer()` in frontmatter (let `ContentError` propagate — never catch it), import `global.css`, keep `<html lang="en">`, `<title>{career.name}</title>`
- [ ] Render in order: `Profile`, `Positions`, `Achievements`, `Skills`, `Education` — each section omits itself when empty
- [ ] `astro.config.mjs`: honour `CV_OUT_DIR` (default `dist`) via `outDir` so failing-build and fixture tests never touch the real `dist/`
- [ ] Delete `src/content/content.json` (spec §8: only `career.yaml`); update `tests/smoke.test.ts` if it referenced the old shape
- [ ] Run `npm run build` against `career.yaml` — expect it to fail only on the known Berlingske Media gap until the Owner adds an achievement; confirm the error message is path-naming

## Edge cases

| Case | Behaviour |
|---|---|
| invalid Content file | `astro build` exits non-zero and writes no `dist/index.html` |
| `CV_OUT_DIR` set | build writes there and leaves `dist/` untouched |
| a Career section is empty | no heading in the HTML (AC-06) |

## Definition of Done

- [ ] `npm run build` on a valid file produces `dist/index.html` with Profile first, then the sections in order
- [ ] `npm run build` with an invalid file exits non-zero and writes no `index.html` into the output dir
- [ ] `src/content/content.json` is gone and nothing imports it
- [ ] every Hard Rule inlined above still holds
- [ ] `npm run lint` and `npm test` clean
