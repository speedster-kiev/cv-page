---
id: T3
title: "Define the Zod content schema with required items and period-order rule"
layer: "domain"
deps: ["T1"]
blocks: ["T4", "T7", "T8", "T9", "T10"]
acs: ["AC-08", "AC-08b", "AC-09"]
files_hint: ["src/content/schema.ts", "tests/schema.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "M"
context_budget: "M"
status: "done"
step: "COMMIT"
---

# T3 — Define the Zod content schema with required items and period-order rule

## Place in the sequence

- **Blocked by:** T1 — Declare yaml and sharp dependencies and ban set:html in lint · **Blocks:** T4 — Build the content loader: parse YAML, validate, scan, throw ContentError, T7 — Build the Profile component with the optional processed photo, T8 — Build the Positions component with optional parts, T9 — Build the Achievements and Skills list components, T10 — Build the Education component with optional period · **Wave:** 2, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As an** Owner
> **I want** invalid Career content to stop publishing and tell me what to fix
> **So that** Visitors never see a partial or broken page
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

Encodes every required/optional item and the period-order rule so each failure carries a path the Owner can act on.

## Inlined context

> **Chosen:** Option 1 [one YAML file `src/content/career.yaml`, parsed with `yaml`]. ... Years are stored as `YYYY` strings and the schema rejects non-string values, which avoids YAML's implicit typing of dates and `yes`/`no`.
>
> — `adr/0001-store-career-content-in-one-yaml-file.md §Decision outcome, abridged` · full text: [adr/0001-store-career-content-in-one-yaml-file.md](../adr/0001-store-career-content-in-one-yaml-file.md)

> `career.yaml` keys (plain text; years are `YYYY` strings): `name` · `headline` · `photo{file, alt}` (optional) · `summary` (optional) · `positions[]{employer, employer_about?, title, start, end?, summary?, achievements[≥1]}` · `achievements[]` · `skills[]` · `education[]{institution, degree, start?, end?}`. Unknown keys fail the build.
>
> — `career.yaml (shape) + spec.md §5 AC-08b / §8 open question 1, abridged` · full text: [spec.md](../spec.md)

> **Error handling:** content validated at build time; one `ContentError` lists every problem as, for example, `career.yaml: positions[1].employer — required`; YAML syntax errors add line and column
>
> — `sad.md §8, Error handling row, verbatim` · full text: [sad.md](../sad.md)

> | Failure message quality | 100% of validation failures name the offending entry and what is wrong | automated tests of the content checks |
>
> — `spec.md §6, NFR «Failure message quality», verbatim` · full text: [spec.md](../spec.md)

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

## Checklist

- [ ] Write `tests/schema.test.ts` first: one case per AC-08 / AC-08b / AC-09 branch, asserting the issue path (e.g. `positions[1].employer`) and message text
- [ ] `src/content/schema.ts`: Zod schema (import `z` from `astro/zod`) with `.strict()` objects; year fields `z.string().regex(/^\d{4}$/)`; `positions[].achievements` min 1; `photo.alt` required when `photo` present; education `institution` and `degree` required
- [ ] Add a refinement per Position and education entry: `end` < `start` is an issue at the entry path with message `a period cannot end before it starts` (equal years allowed)
- [ ] Export `careerSchema` and `type Career = z.infer<typeof careerSchema>` (consumed by the loader and every component)
- [ ] Make messages name the entry: for a Position issue include the employer or title in the message so an index alone is not the only locator

## Edge cases

| Case | Behaviour |
|---|---|
| `name` missing | issue `name — required` (AC-08) |
| Position without achievements | issue names the Position and `achievements — at least one required` (AC-08b) |
| `start: 2021` (number, not string) | rejected: years must be quoted `YYYY` strings (ADR 0001) |
| unknown top-level key | fails the build |
| `end` equals `start` | valid |

## Definition of Done

- [ ] schema unit tests cover each AC-08/AC-08b/AC-09 case and assert the message names the entry
- [ ] `Career` type exported and `npm run lint` (incl. `astro check`) clean
- [ ] the real `src/content/career.yaml` validates except the known Berlingske Media gap (spec §8, Owner task)
