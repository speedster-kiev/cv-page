---
id: T14
title: "Add failing-build and content-only-change fixture tests"
layer: "tests"
deps: ["T11"]
blocks: []
acs: ["AC-06", "AC-07", "AC-08", "AC-08b", "AC-09", "AC-10", "AC-12"]
files_hint: ["tests/failing-build.test.ts", "tests/fixtures/"]
owner: "mkarazeev@gmail.com"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T14 — Add failing-build and content-only-change fixture tests

## Place in the sequence

- **Blocked by:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Blocks:** — · **Wave:** 6, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As an** Owner
> **I want** to change what the page says by editing only the Content file
> **So that** keeping my career story current needs no change to the page layout
>
> — `spec.md §4, US-05, verbatim` · full text: [spec.md](../spec.md)

> **As an** Owner
> **I want** invalid Career content to stop publishing and tell me what to fix
> **So that** Visitors never see a partial or broken page
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

Runs the real build against invalid and variant Content files into separate output directories to prove invalid content publishes nothing and a content-only edit changes only that content.

## Inlined context

> **QG-1** one test runs the build against an invalid fixture (via `CV_CONTENT_FILE`) into a separate output directory, so it never touches the `dist/` that the global setup builds for the other tests, and asserts non-zero exit and no `index.html` there; 100% of validation failures name the offending entry.
>
> — `sad.md §10, QG-1 How verify, abridged` · full text: [sad.md](../sad.md)

> Loader reads and parses the file → checks shape, required items, period order → Detect scans every text value → alt any problem found: `ContentError` listing every problem with its path; build fails, no output; else sorted, validated data.
>
> — `sad.md §6, flow 1 «publish career content», abridged` · full text: [sad.md](../sad.md)

> `npm run build` must exit non-zero and emit no `dist/index.html` when content is invalid; the failing-build test uses its own output directory.
>
> — `sad.md §7 + §11, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-06 — domain invariant, no empty sections

> **Given** the Content file has no entries for one Career section, such as education
> **When** a Visitor opens the page
> **Then** that section is not shown at all, with no empty heading and no placeholder text
>
> — `spec.md §5, AC-06, verbatim` · full text: [spec.md](../spec.md)

### AC-07 — happy path

> **Given** the Owner changes one Position's title in the Content file and nothing else
> **When** the Owner publishes
> **Then** Visitors see the new title and all other visible content of the page is unchanged
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-08 — error, required item missing

> **Given** the Content file has no name
> **When** the Owner tries to publish
> **Then** publishing stops and the Owner is told that the name is required and where in the Content file it belongs
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

### AC-08b — error, other required items missing

> **Given** the Content file has no headline, or a Position without an employer, a title, a start year or at least one achievement, or an education entry without an institution or a degree, or a photo without alt text; the summary, skills and education sections, and a Position's end year, employer description and summary, are optional
> **When** the Owner tries to publish
> **Then** publishing stops and the Owner is told which item is missing, naming the Position when the item belongs to one
>
> — `spec.md §5, AC-08b, verbatim` · full text: [spec.md](../spec.md)

### AC-09 — domain invariant, period order

> **Given** a Position or an education entry in the Content file ends in an earlier year than it starts (ending in the same year it starts is allowed)
> **When** the Owner tries to publish
> **Then** publishing stops and the Owner is told that a period cannot end before it starts, naming the Position or education entry
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

### AC-10 — cross-context, nothing published on failure

> **Given** the Owner's new Content file is invalid
> **When** the Owner tries to publish it
> **Then** publishing stops and nothing new is published, so Visitors never see a partial or broken page
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

### AC-12 — error, contact detail in career text

> **Given** any Career content text — name, headline, summary, photo alt text, achievements, a Position's text (including its employer description and summary), skills or education — contains something shaped like an email address or a phone number (any such value, not only the Owner's own)
> **When** the Owner tries to publish
> **Then** publishing stops and the Owner is told which entry contains the contact detail and that contact details are shared only through the contact section
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `tests/fixtures/`: `valid.yaml` (minimal valid), `no-name.yaml`, `no-headline.yaml`, `position-missing-employer.yaml`, `end-before-start.yaml`, `contact-in-summary.yaml` (fake `jane@example.com`), `no-education.yaml`, `script-in-content.yaml`, `title-changed.yaml` (valid with one Position title changed)
- [ ] Helper `buildWith(fixture)` runs `CV_CONTENT_FILE=<fixture> CV_OUT_DIR=<tmp dir> npx astro build` via `execFileSync`, returns `{ status, stderr, dir }`
- [ ] Invalid fixtures: status ≠ 0, `index.html` absent in the temp dir, stderr names the entry/path and the problem (AC-08, AC-08b, AC-09, AC-10, AC-12 incl. the contact-section hint)
- [ ] QG-2 escaping: `script-in-content.yaml` (a skill `<script>alert(1)</script>`) builds, and the page contains it as `&lt;script&gt;` text with no executable `<script>` element
- [ ] AC-06: `no-education.yaml` page text has no `Education` heading and no placeholder; AC-07: build `valid.yaml` and `title-changed.yaml`, diff the HTML after substituting the title — identical otherwise
- [ ] Clean temp dirs in `afterAll`; keep total runtime well under the 60 s build budget per build

## Edge cases

| Case | Behaviour |
|---|---|
| fixture fails | `dist/` produced by global setup is untouched |
| title-changed vs valid | only the title text differs |

## Definition of Done

- [ ] all invalid-fixture cases assert non-zero exit, no `index.html`, and a message naming entry and problem
- [ ] AC-06 and AC-07 assertions pass
- [ ] tests never write into the real `dist/`
- [ ] `npm test` green; `npm run lint` clean
