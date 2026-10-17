---
status: draft
feature_size: "S"
tool: "code"
updated_at: "2026-10-17"
---

# Screens — career-page

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw Figma / `.pen` file.

## Source

- **Tool:** code (degradation: `docs/design-system.md` does not exist, so no canon `tool` was available; defaulted to `code`. Run `/sdd:design-system` before a second UI feature.)
- **File:** inline wireframes below

**Noted gaps (stated, not silent):**

- `docs/features/career-page/ux-flows.md` does not exist. The SCR inventory is derived from spec §4 (US-01 to US-07) and `sad.md` §4–§6: the product is a single static page with no navigation, so there is exactly one screen. If `/sdd:ux-flows` is run later, it must keep `SCR-01` as the page.
- `docs/design-system.md` does not exist, so there is no component inventory to reuse. `src/components/` is empty. The six components that `sad.md` §5 declares are therefore all listed in §New components, each with its justification.
- No `contracts/` directory (no API; `sad.md` §5 declares no backend). Error states come from spec §5 and `sad.md` §6 only.

## Screens

### SCR-01 — Career page (`/`)

The one and only screen: a single scrolling page, server-rendered, no client script. Top to bottom: Profile, Positions, Achievements, Skills, Education (Owner order inside each; Positions sorted per AC-02/03). Text is always printed escaped, so markup in content shows as literal text (spec §6.1). Long text (a Position achievement can be a full paragraph) wraps in full: no truncation, no "show more" (a collapsed text would break AC-11, and there is no script).

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | Valid content; photo present; every Career section has entries; at least one Position (AC-01 to AC-05, AC-11; `sad.md` §6 flows 2 and 3) | NEW: Profile, NEW: Section, NEW: Positions, NEW: Achievements, NEW: Skills, NEW: Education | wireframe «SCR-01 default» |
| no-photo | `photo` absent from the Content file (`sad.md` §6 flow 2, `else no photo`) | NEW: Profile, NEW: Section | wireframe «SCR-01 no-photo» |
| section-omitted | A Career section has no entries, such as no education (AC-06; `sad.md` §6 flow 2, `else section is empty`): no heading, no placeholder, no gap | NEW: Section (not rendered for that block) | wireframe «SCR-01 section-omitted» |
| position-ongoing | A Position has a start and no end (AC-03): period reads "2021 – Present", sorted before ended Positions | NEW: Positions | wireframe «SCR-01 position variants» |
| position-optional-parts | A Position has or lacks its optional employer description, summary and end year (AC-02, AC-08b): absent parts leave no empty element | NEW: Positions | wireframe «SCR-01 position variants» |
| education-period-optional | An education entry has or lacks a period (AC-05): absent period leaves no empty element | NEW: Education | wireframe «SCR-01 education variants» |
| loading | N/A: the page is static HTML from GitHub Pages and renders without client script (`sad.md` §4, AC-11); nothing is fetched after load | — | — |
| error | N/A: invalid content fails the build and nothing is published (AC-08 to AC-10, AC-12; `sad.md` §6 flow 1). A Visitor can never reach an error page state; the Owner sees the `ContentError` list in the CI/terminal output, which is not a screen | — | — |
| success / validation | N/A: no forms, no user input, no actions (spec §6.1, AC-14) | — | — |

**Layout rules** (apply to every state; sources: spec §6 «Small screens», «Accessibility», «Delivered page weight»):

- Mobile-first, one column at all widths; content column capped for readability (about 70 characters per line) and centred on wide screens. No horizontal scroll at 320 px viewport width.
- Text contrast ratio ≥ 4.5:1; one `<h1>` (the Owner's name), one `<h2>` per rendered Career section, one `<h3>` per Position / education entry.
- Photo: displayed at 160 × 160 CSS px (source is 600×600; the build resizes it to a small explicit-size image per `sad.md` §4), explicit `width`/`height`, `alt` from the Content file, `loading` left at default because it is above the fold. The 160 px size is a proposal made here (the spec gives no size); changing it is a one-line CSS and component change.
- Dates: always `start – end` as years, or `start – Present` when ongoing; an entry whose end year equals its start year shows both years as written («2018 – 2018»), because AC-09 allows it and the spec gives no collapsed form.

```text
SCR-01 default  (≥ 640 px wide)
+------------------------------------------------------------+
|  +--------+  # Maksym Karazieiev            (h1)            |
|  | photo  |  Engineering Manager            (headline)      |
|  | 160x160|                                                 |
|  +--------+  Summary paragraph(s), plain text, wraps        |
|              in full, blank line = new paragraph            |
|------------------------------------------------------------|
|  ## Positions                                  (h2)        |
|  ### Engineering Manager · Ayvens A/S (…)      (h3)        |
|  2024 – 2026                                                |
|  Employer description (optional)                            |
|  Position summary (optional)                                |
|   • achievement 1 (full text, wraps)                        |
|   • achievement 2                                           |
|  ### IT Process Lead · Ayvens A/S              (next one)   |
|  …                                                          |
|------------------------------------------------------------|
|  ## Achievements                                            |
|   • …                                                       |
|------------------------------------------------------------|
|  ## Skills                                                  |
|   • …  (flat list, Owner order)                             |
|------------------------------------------------------------|
|  ## Education                                               |
|   Degree — Institution          2004 – 2005 (if given)      |
+------------------------------------------------------------+

SCR-01 default  (narrow, 320 px: photo stacks above the name)
+------------------------+
|  +--------+            |
|  | photo  |            |
|  +--------+            |
|  # Name                |
|  Headline              |
|  Summary …             |
|------------------------|
|  ## Positions          |
|  ### Title · Employer  |
|  2024 – 2026           |
|   • achievement …      |
|  …                     |
+------------------------+

SCR-01 no-photo
+------------------------------------------------------------+
|  # Maksym Karazieiev                                        |
|  Engineering Manager                                        |
|  Summary …                                                  |
|------------------------------------------------------------|
|  (rest identical to default; no empty image box, no         |
|   placeholder avatar)                                       |
+------------------------------------------------------------+

SCR-01 section-omitted  (example: no Education in the Content file)
+------------------------------------------------------------+
|  Profile                                                    |
|  ## Positions … ## Achievements … ## Skills …              |
|  (page ends after Skills: no «Education» heading,          |
|   no «nothing here» text, no extra spacing block)           |
+------------------------------------------------------------+

SCR-01 position variants
+------------------------------------------------------------+
|  ### Engineering Manager · Ayvens A/S                       |
|  2021 – Present                  ← ongoing, listed first    |
|  Employer description            ← optional, omitted if none|
|  Summary                         ← optional, omitted if none|
|   • achievement (≥ 1 always present)                        |
|                                                             |
|  ### Lead Software Engineer · Vacasol                       |
|  2013 – 2016                     ← ended, below ongoing     |
|   • achievement                  (no description, no summary|
|                                    → no empty lines)        |
+------------------------------------------------------------+

SCR-01 education variants
+------------------------------------------------------------+
|  Master's Degree in Computer Science                        |
|  National Aviation University · 2004 – 2005   ← period given|
|                                                             |
|  Team Leadership (2025)                                     |
|  Center for Ledelse                           ← no period    |
+------------------------------------------------------------+
```

## New components

Every component below is `NEW:` for one reason: there is no `docs/design-system.md` and `src/components/` is empty, so no primitive exists to reuse. The six are exactly the components that `sad.md` §5 declares; nothing beyond that list is added. Plain HTML elements (`h1`–`h3`, `ul`, `li`, `p`, `img`) are used directly and are not components.

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| Section | no inventory exists; titled `<section>` wrapper (`<h2>` + children) shared by Positions, Achievements, Skills and Education so the omit-when-empty rule (AC-06) lives in one place | pending |
| Profile | no inventory exists; name `<h1>`, headline, summary paragraphs and the optional photo with its `alt`; the only block that is never omitted | pending |
| Positions | no inventory exists; renders sorted Position entries (employer, title, period, optional description and summary, achievements) | pending |
| Achievements | no inventory exists; the top-level achievements list in Owner order | pending |
| Skills | no inventory exists; flat list in Owner order | pending |
| Education | no inventory exists; entries with degree, institution and an optional period | pending |
