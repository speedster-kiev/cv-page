---
id: T9
title: "Build the Achievements and Skills list components"
layer: "ui"
deps: ["T3", "T6"]
blocks: ["T11"]
acs: ["AC-04", "AC-05"]
files_hint: ["src/components/Achievements.astro", "src/components/Skills.astro"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "M"
status: "done"
step: "COMMIT"
---

# T9 — Build the Achievements and Skills list components

## Place in the sequence

- **Blocked by:** T3 — Define the Zod content schema with required items and period-order rule, T6 — Add the Section component and base page styles · **Blocks:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Wave:** 3, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As a** Visitor
> **I want** a list of the Owner's most notable achievements in one place (no fixed maximum; the Owner decides how many)
> **So that** I get the highlights without reading every Position
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

> **As a** Visitor
> **I want** the Owner's skills and education shown
> **So that** I can check them against what my open role requires
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Renders the top-level achievements and the flat skills list in the Owner's order, each inside a Section that vanishes when empty.

## Inlined context

| State | Trigger / condition | Components |
|---|---|---|
| default | Achievements and Skills have entries | NEW: Achievements, NEW: Skills |
| section-omitted | no entries: no heading, no placeholder | NEW: Section |

— `screens.md §SCR-01, states default + section-omitted, abridged` · full text: [screens.md](../screens.md)

> `## Achievements` → bullet list in Owner order. `## Skills` → flat bullet list in Owner order.
>
> — `screens.md §SCR-01, wireframe «default», abridged` · full text: [screens.md](../screens.md)

> **Escaping:** values printed only as escaped `{value}`; `set:html` banned by a new lint rule added by this feature
>
> — `sad.md §8, Escaping row, verbatim` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

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

## Checklist

- [ ] `src/components/Achievements.astro`: prop `items: string[]`; `<Section title="Achievements" count={items.length}><ul>…</ul></Section>`
- [ ] `src/components/Skills.astro`: same shape with `title="Skills"`
- [ ] Print each item as `{item}`; keep the Owner's order; do not dedupe or sort

## Edge cases

| Case | Behaviour |
|---|---|
| empty or absent list | component renders nothing (via Section) |
| item contains `<b>x</b>` | shown as literal text |

## Definition of Done

- [ ] both components render items in input order inside a Section
- [ ] an empty list renders no output
- [ ] every Hard Rule inlined above still holds
- [ ] lint + `astro check` clean
