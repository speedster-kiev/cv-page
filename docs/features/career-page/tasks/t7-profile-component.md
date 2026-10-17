---
id: T7
title: "Build the Profile component with the optional processed photo"
layer: "ui"
deps: ["T3", "T6"]
blocks: ["T11"]
acs: ["AC-01"]
files_hint: ["src/components/Profile.astro", "src/styles/global.css"]
owner: "mkarazeev@gmail.com"
estimate: "M"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T7 — Build the Profile component with the optional processed photo

## Place in the sequence

- **Blocked by:** T3 — Define the Zod content schema with required items and period-order rule, T6 — Add the Section component and base page styles · **Blocks:** T11 — Compose index.astro from the loader and components; remove the placeholder · **Wave:** 3, starts as soon as its dependencies are done.
- **Lane:** shares `src/styles/global.css` with T6 — serialized, not parallel.

## Why (user story)

> **As a** Visitor
> **I want** the Owner's name, photo, headline and short summary at the top of the page
> **So that** I immediately know whose career I am reading about and what role they are after
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Renders the name, optional 160×160 photo with its alt text, headline and summary paragraphs — the only block that is never omitted.

## Inlined context

> **Photo processed at build time** — an optional `photo` entry (file under `src/content/`, currently `photo.jpg`, 600×600, 53 KB, required `alt`) is resized and re-encoded by Astro's image pipeline (`sharp`) into a small, explicit-size image. Re-encoding drops source metadata (EXIF), so the delivered file carries no location or contact data.
>
> — `sad.md §4, strategic choice 5, verbatim` · full text: [sad.md](../sad.md)

| State | Trigger / condition | Components |
|---|---|---|
| default | photo present | NEW: Profile |
| no-photo | `photo` absent: no empty image box, no placeholder avatar | NEW: Profile |

— `screens.md §SCR-01, states default + no-photo, abridged` · full text: [screens.md](../screens.md)

> **Photo:** displayed at 160 × 160 CSS px (source is 600×600; the build resizes it to a small explicit-size image), explicit `width`/`height`, `alt` from the Content file, `loading` left at default because it is above the fold. At 320 px the photo stacks above the name. The summary wraps in full; a blank line is a new paragraph.
>
> — `screens.md §SCR-01, Layout rules + wireframes, abridged` · full text: [screens.md](../screens.md)

> **Escaping:** values printed only as escaped `{value}`; `set:html` banned by a new lint rule added by this feature
>
> — `sad.md §8, Escaping row, verbatim` · full text: [sad.md](../sad.md)

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

## Checklist

- [ ] `src/components/Profile.astro`: props from `Career` (`name`, `headline`, `summary?`, `photo?`)
- [ ] Photo: import via `astro:assets` (`getImage`/`<Image>`) from `src/content/<photo.file>` at width/height 160 (consider 2× for density), explicit `width`/`height`, `alt={photo.alt}`; format re-encoded by sharp so EXIF is dropped
- [ ] Render `<h1>{name}</h1>`, headline `<p>`, summary split on blank lines into `<p>` elements; omit summary when absent
- [ ] No photo → no `<img>`, no wrapper box; add the stack-above-name layout under 640 px in `src/styles/global.css`

## Edge cases

| Case | Behaviour |
|---|---|
| `photo` absent | no image element, no placeholder |
| `summary` absent | no empty `<p>` |
| summary with blank lines | one `<p>` per paragraph, text unchanged |
| name contains `<script>` | shown as text |

## Definition of Done

- [ ] profile renders name, headline, summary and photo with `alt` from the Content file; the photo `<img>` has explicit `width` and `height`
- [ ] delivered photo carries no EXIF segment (asserted in T13)
- [ ] with `photo` removed, no `<img>` is rendered
- [ ] every Hard Rule inlined above still holds
- [ ] lint + `astro check` clean
