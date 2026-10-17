---
id: T6
title: "Add the Section component and base page styles"
layer: "ui"
deps: ["T1"]
blocks: ["T7", "T8", "T9", "T10"]
acs: ["AC-06"]
files_hint: ["src/components/Section.astro", "src/styles/global.css"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T6 — Add the Section component and base page styles

## Place in the sequence

- **Blocked by:** T1 — Declare yaml and sharp dependencies and ban set:html in lint · **Blocks:** T7 — Build the Profile component with the optional processed photo, T8 — Build the Positions component with optional parts, T9 — Build the Achievements and Skills list components, T10 — Build the Education component with optional period · **Wave:** 2, starts as soon as its dependencies are done.
- **Lane:** shares `src/styles/global.css` with T7 — serialized, not parallel.

## Why (user story)

> **As a** Visitor
> **I want** the Owner's skills and education shown
> **So that** I can check them against what my open role requires
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Provides the titled `<section>` wrapper that omits itself when empty, so every Career section shares one omit-when-empty rule.

## Inlined context

| State | Trigger / condition | Components |
|---|---|---|
| default | Valid content; every Career section has entries | NEW: Section |
| section-omitted | A Career section has no entries (AC-06): no heading, no placeholder, no gap | NEW: Section (not rendered for that block) |

— `screens.md §SCR-01, states default + section-omitted, abridged` · full text: [screens.md](../screens.md)

> **Layout rules:** mobile-first, one column at all widths; content column capped for readability (about 70 characters per line) and centred on wide screens. No horizontal scroll at 320 px viewport width. Text contrast ratio ≥ 4.5:1; one `<h1>` (the Owner's name), one `<h2>` per rendered Career section, one `<h3>` per Position / education entry. Dates: always `start – end` as years, or `start – Present` when ongoing; an entry whose end year equals its start year shows both years as written («2018 – 2018»).
>
> — `screens.md §SCR-01, Layout rules, abridged` · full text: [screens.md](../screens.md)

> **Styling:** plain CSS with CSS variables in `src/styles/`; no UI framework, Tailwind or CSS-in-JS.
>
> — `CLAUDE.md §Conventions, verbatim (abridged)` · full text: [CLAUDE.md](../../../../CLAUDE.md)

> **UI architecture.** Server-rendered static HTML (SSG) with zero client JavaScript in this step.
>
> — `sad.md §4, UI architecture, abridged` · full text: [sad.md](../sad.md)

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

## Checklist

- [ ] `src/components/Section.astro`: props `title: string`, `count: number`; renders nothing when `count === 0`, otherwise `<section><h2>{title}</h2><slot /></section>`
- [ ] `src/styles/global.css`: extend the existing `:root` variables (colours with contrast ≥ 4.5:1, spacing, max content width ≈ 70ch, font) and add mobile-first one-column layout, heading and list styles; no horizontal scroll at 320 px
- [ ] No client `<script>`; no `set:html`; text printed as `{value}` only

## Edge cases

| Case | Behaviour |
|---|---|
| `count` is 0 | component outputs nothing: no `<h2>`, no wrapper, no spacing |
| title contains markup | printed as escaped text |

## Definition of Done

- [ ] a Section with `count={0}` renders no HTML (verified in the T11 composition and in T14 fixture builds for AC-06)
- [ ] `global.css` defines only CSS variables and plain CSS (no framework)
- [ ] every Hard Rule inlined above still holds
- [ ] lint + `astro check` clean
