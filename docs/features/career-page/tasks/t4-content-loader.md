---
id: T4
title: "Build the content loader: parse YAML, validate, scan, throw ContentError"
layer: "infra"
deps: ["T2", "T3"]
blocks: ["T5"]
acs: ["AC-08", "AC-08b", "AC-09", "AC-10", "AC-12"]
files_hint: ["src/content/load.ts", "tests/load.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T4 — Build the content loader: parse YAML, validate, scan, throw ContentError

## Place in the sequence

- **Blocked by:** T2 — Implement the contact-shape detector with table-driven unit tests, T3 — Define the Zod content schema with required items and period-order rule · **Blocks:** T5 — Sort Positions and format periods in the loader · **Wave:** 3, starts as soon as its dependencies are done.
- **Lane:** shares `src/content/load.ts, tests/load.test.ts` with T5 — serialized, not parallel.

## Why (user story)

> **As an** Owner
> **I want** invalid Career content to stop publishing and tell me what to fix
> **So that** Visitors never see a partial or broken page
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

> **As an** Owner
> **I want** the page to refuse to publish my raw email address or phone number inside career text
> **So that** a slip in my own wording cannot expose them to scraping bots
>
> — `spec.md §4, US-08, verbatim` · full text: [spec.md](../spec.md)

Turns the Content file into validated data or a single `ContentError` that stops the build and lists every problem with its path.

## Inlined context

> `content/` — `photo.jpg`, `career.yaml` (the only file the Owner edits for text), `schema.ts` (Zod schema, types, required items, period-order rule), `load.ts` (read file, parse YAML, validate, scan, sort; throws ContentError). `lib/contact/detect.ts` — email / phone shape detection + exemptions (no raw values).
>
> — `sad.md §5, internal decomposition, abridged` · full text: [sad.md](../sad.md)

> Loader reads and parses the file → checks shape, required items, period order → Detect scans every text value → alt any problem found: `ContentError` listing every problem with its path; build fails, no output; else sorted, validated data.
>
> — `sad.md §6, flow 1 «publish career content», abridged` · full text: [sad.md](../sad.md)

> **Error handling:** content validated at build time; one `ContentError` lists every problem as, for example, `career.yaml: positions[1].employer — required`; YAML syntax errors add line and column
>
> — `sad.md §8, Error handling row, verbatim` · full text: [sad.md](../sad.md)

> **Chosen:** Option 1 [one YAML file `src/content/career.yaml`, parsed with `yaml`]. ... Years are stored as `YYYY` strings and the schema rejects non-string values, which avoids YAML's implicit typing of dates and `yes`/`no`.
>
> — `adr/0001-store-career-content-in-one-yaml-file.md §Decision outcome, abridged` · full text: [adr/0001-store-career-content-in-one-yaml-file.md](../adr/0001-store-career-content-in-one-yaml-file.md)

> **Contact data:** any email/phone shape in text fails the build; raw values never in `dist/`
>
> — `sad.md §8, Contact data row, verbatim` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

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

- [ ] Write `tests/load.test.ts` first, using inline YAML strings and fixtures under `tests/fixtures/` (only fake contact shapes such as `jane@example.com`, `+45 12 34 56 78`)
- [ ] `src/content/load.ts`: `loadCareer(path = process.env.CV_CONTENT_FILE ?? 'src/content/career.yaml')` reads the file, parses with `yaml` (keep line/col for syntax errors), validates with `careerSchema`
- [ ] Walk every string value (incl. `photo.alt`, employer_about, summary) and call `hasContactShape`; each hit becomes an issue at its path with message `contains a contact detail; contact details are shared only through the contact section`
- [ ] Collect all issues (schema + scan) and throw one `ContentError` whose message lists them as `career.yaml: <path> — <problem>`; YAML syntax errors add line and column
- [ ] Return `Career` (unsorted; sorting is T5). Keep the module free of Astro imports so Vitest can call it directly

## Edge cases

| Case | Behaviour |
|---|---|
| YAML syntax error | `ContentError` with line and column |
| several problems at once | one `ContentError` lists all of them |
| email-shaped text in `photo.alt` | issue at `photo.alt` (AC-12 covers alt text) |
| `CV_CONTENT_FILE` unset | reads `src/content/career.yaml` |
| file missing | `ContentError` naming the path, not a bare ENOENT |

## Definition of Done

- [ ] unit tests pass for AC-08, AC-08b, AC-09 and AC-12 through `loadCareer`, each asserting the message names the entry and the problem
- [ ] a contact-shaped value in any text field yields a path-naming issue and the contact-section hint
- [ ] `loadCareer` throws (does not return partial data) on any issue, which is the basis of AC-10
- [ ] every Hard Rule inlined above still holds
- [ ] lint clean
