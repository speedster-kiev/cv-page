---
id: T8
title: "Build the Positions component with optional parts"
layer: "ui"
deps: ["T3", "T6"]
blocks: ["T11"]
acs: ["AC-02", "AC-03"]
files_hint: ["src/components/Positions.astro"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T8 — Build the Positions component with optional parts

## Place in the sequence

- **Blocked by:** T3 — Define the Zod content schema with required items and period-order rule, T6 — Add the Section component and base page styles · **Blocks:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Wave:** 3, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As a** Visitor
> **I want** the Owner's Positions listed with employer, title, period and achievements
> **So that** I can judge the Owner's experience and progression
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Renders each already-sorted Position with its period, optional employer description and summary, and achievements, leaving no empty elements.

## Inlined context

| State | Trigger / condition | Components |
|---|---|---|
| position-ongoing | start and no end: period reads "2021 – Present", sorted before ended Positions | NEW: Positions |
| position-optional-parts | optional employer description, summary and end year absent: absent parts leave no empty element | NEW: Positions |

— `screens.md §SCR-01, states position-ongoing + position-optional-parts, abridged` · full text: [screens.md](../screens.md)

> `### Engineering Manager · Ayvens A/S` (h3) → period line → employer description (optional) → position summary (optional) → bullet list of achievements (full text, wraps; never truncated, no «show more»).
>
> — `screens.md §SCR-01, wireframe «position variants», abridged` · full text: [screens.md](../screens.md)

> **Escaping:** values printed only as escaped `{value}`; `set:html` banned by a new lint rule added by this feature
>
> — `sad.md §8, Escaping row, verbatim` · full text: [sad.md](../sad.md)

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

- [ ] `src/components/Positions.astro`: props `positions` (already sorted, each with `period`) — do not sort here
- [ ] Per Position: `<h3>{title} · {employer}</h3>`, period, `employer_about` and `summary` only when present (summary split into `<p>` per blank line), `<ul>` of achievements
- [ ] Wrap in `Section` with `title="Positions"` and `count={positions.length}`
- [ ] Plain CSS in the component's `<style>` or `global.css`, variables only

## Edge cases

| Case | Behaviour |
|---|---|
| no `employer_about` and no `summary` | no empty lines or elements |
| ongoing Position | period `2021 – Present` |
| achievement is a long paragraph | wraps in full, no truncation |

## Definition of Done

- [ ] a Position without optional parts renders no empty element
- [ ] period text and order are exactly what the loader supplies (verified end-to-end in T12 for AC-02/AC-03)
- [ ] every Hard Rule inlined above still holds
- [ ] lint + `astro check` clean
