---
id: T5
title: "Sort Positions and format periods in the loader"
layer: "app"
deps: ["T4"]
blocks: ["T11"]
acs: ["AC-02", "AC-03"]
files_hint: ["src/content/load.ts", "tests/load.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T5 — Sort Positions and format periods in the loader

## Place in the sequence

- **Blocked by:** T4 — Build the content loader: parse YAML, validate, scan, throw ContentError · **Blocks:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Wave:** 4, starts as soon as its dependencies are done.
- **Lane:** shares `src/content/load.ts, tests/load.test.ts` with T4 — serialized, not parallel.

## Why (user story)

> **As a** Visitor
> **I want** the Owner's Positions listed with employer, title, period and achievements
> **So that** I can judge the Owner's experience and progression
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Hands the components Positions already ordered (ongoing first, newest start first, stable ties) with display-ready period strings.

## Inlined context

> Positions order: ongoing first, then newest start first, ties keep the Owner's order. ... dates to the year (`YYYY` strings) displayed as "2021 – Present"
>
> — `sad.md §4, Assumptions taken, abridged` · full text: [sad.md](../sad.md)

> **Layout rules:** mobile-first, one column at all widths; content column capped for readability (about 70 characters per line) and centred on wide screens. No horizontal scroll at 320 px viewport width. Text contrast ratio ≥ 4.5:1; one `<h1>` (the Owner's name), one `<h2>` per rendered Career section, one `<h3>` per Position / education entry. Dates: always `start – end` as years, or `start – Present` when ongoing; an entry whose end year equals its start year shows both years as written («2018 – 2018»).
>
> — `screens.md §SCR-01, Layout rules, abridged` · full text: [screens.md](../screens.md)

> service sorts positions, ongoing first, then newest start first, ties keep Owner order; formats periods to years, such as 2021 – Present
>
> — `sad.md §6, flow 2, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

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

## Checklist

- [ ] Extend `tests/load.test.ts` first: three Positions with different starts; two ongoing; equal start years keep the Owner's order; equal start/end year renders `2018 – 2018`
- [ ] In `src/content/load.ts` add `sortPositions` (stable: ongoing first, then `start` descending) and `formatPeriod(start, end?)` returning `start – end` or `start – Present`
- [ ] Return Positions with a computed `period` string alongside the original fields; apply `formatPeriod` to education entries that have a `start`/`end` too
- [ ] Do not mutate the input array; do not reorder achievements, skills or education (Owner order)

## Edge cases

| Case | Behaviour |
|---|---|
| two Positions with the same start year | keep the Owner's order |
| Position with `start` and no `end` | `2021 – Present`, sorted before ended Positions |
| education entry without period | no `period` value (component omits the element) |
| end year equals start year | `2018 – 2018` |

## Definition of Done

- [ ] unit tests for AC-02 and AC-03 ordering and period text pass
- [ ] input data is not mutated
- [ ] lint clean
