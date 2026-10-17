---
id: T10
title: "Build the Education component with optional period"
layer: "ui"
deps: ["T3", "T6"]
blocks: ["T11"]
acs: ["AC-05"]
files_hint: ["src/components/Education.astro"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T10 — Build the Education component with optional period

## Place in the sequence

- **Blocked by:** T3 — Define the Zod content schema with required items and period-order rule, T6 — Add the Section component and base page styles · **Blocks:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Wave:** 3, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As a** Visitor
> **I want** the Owner's skills and education shown
> **So that** I can check them against what my open role requires
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Renders education entries with degree and institution and, only when given, a period.

## Inlined context

| State | Trigger / condition | Components |
|---|---|---|
| education-period-optional | An education entry has or lacks a period (AC-05): absent period leaves no empty element | NEW: Education |

— `screens.md §SCR-01, state education-period-optional, abridged` · full text: [screens.md](../screens.md)

> `Master's Degree in Computer Science` / `National Aviation University · 2004 – 2005` (period given) · `Team Leadership (2025)` / `Center for Ledelse` (no period). One `<h3>` per education entry.
>
> — `screens.md §SCR-01, wireframe «education variants» + Layout rules, abridged` · full text: [screens.md](../screens.md)

> **Escaping:** values printed only as escaped `{value}`; `set:html` banned by a new lint rule added by this feature
>
> — `sad.md §8, Escaping row, verbatim` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-05 — happy path

> **Given** the Content file lists skills and education entries
> **When** a Visitor opens the page
> **Then** the Visitor sees a skills section (a flat list in the order the Owner gave) and an education section (each entry with institution and degree, and a period when given, in the order the Owner gave)
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `src/components/Education.astro`: prop `entries` (each with `degree`, `institution`, optional `period` from the loader)
- [ ] `<Section title="Education" count={entries.length}>`; per entry `<h3>{degree}</h3>` and a line `{institution}` plus ` · {period}` only when `period` exists
- [ ] Keep the Owner's order

## Edge cases

| Case | Behaviour |
|---|---|
| entry without `start`/`end` | no period element, no stray separator |
| no entries | nothing rendered |

## Definition of Done

- [ ] entry with and without period both render without empty elements
- [ ] empty list renders nothing
- [ ] every Hard Rule inlined above still holds
- [ ] lint + `astro check` clean
