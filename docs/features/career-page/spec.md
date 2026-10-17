---
status: Draft
owner: "mkarazeev@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-17"
feature_size: "S"
---

# Spec — career-page

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** project docs only — `docs/idea-brief.md` (§2, §3, §5, §6, §7, §8), `docs/roadmap.md` (step 2 "Career page"), `docs/architecture-map.md`, `docs/adr/0001`–`0004`.

## 1. Context

The Owner is pursuing Engineering Manager roles and wants one public page that presents their professional life and achievements, so that Visitors can get to know them (idea brief §2–§3). HR and recruiters are owner-reported Visitors; hiring managers and professional contacts are an assumption recorded in the brief. This spec covers the part of the page that presents Career content — roadmap step 2, "Career page". The contact section, search and AI-agent metadata, and going live are separate roadmap steps (3, 4 and 5) with their own specifications.

No trigger or deadline is established (idea brief §4). This step comes next because the contact section and the search metadata both depend on the page and its content existing first (roadmap dependency graph).

The committed approach: the home page presents the Owner's Career content as a sequence of Career sections that are produced entirely from the Content file, which is checked before anything is published, so that invalid content stops a release instead of producing a partial or broken page. All Career content is plain page text that a Machine reader can read without running scripts. This direction was accepted by the Owner in the idea brief (§7); the Owner set size S and route quick for this run. Ideation analyses were skipped because the brief already records the accepted direction and the one alternative considered (relying on the Owner's LinkedIn profile alone).

Traceability and limits: the Owner has not yet supplied the Content file (idea brief §8), so the list of Career sections and the content language below are assumptions recorded in §8 and awaiting the Owner's confirmation. The Owner's required constraint that the raw email address and phone number never appear in the published page (idea brief §5) is carried into this spec as a rule on Career content.

## 2. Goals

- A Visitor understands who the Owner is and what they have achieved from this single page, reading top to bottom without leaving it.
- The Owner changes what the page says by editing only the Content file.
- Only valid Career content is ever published, and when content is invalid the Owner is told exactly what to fix.
- Machine readers get every piece of Career content as plain page text.

## 3. Non-goals

- The contact section (booking link, professional-network link, click-to-reveal email and phone) — it is roadmap step 3, which owns the click-to-reveal mechanism and its encoding; this step only guarantees that Career content never contains raw email or phone (AC-12, AC-13).
- Search and AI-agent metadata (structured data, sitemap, robots rules, page metadata) — roadmap step 4, which derives it from the content once the content exists.
- Putting the page on the public internet and linking it from the Owner's CV and profile — roadmap step 5.
- A photo, several languages, theme switching or animation — none was requested by the Owner; a photo is recorded as an open question in §8.

## 4. User stories

### US-01: See who the Owner is

**As a** Visitor
**I want** the Owner's name, headline and short summary at the top of the page
**So that** I immediately know whose career I am reading about and what role they are after

### US-02: Follow the career history

**As a** Visitor
**I want** the Owner's Positions listed with employer, title, period and achievements
**So that** I can judge the Owner's experience and progression

### US-03: Scan key achievements

**As a** Visitor
**I want** a short list of the Owner's most notable achievements in one place
**So that** I get the highlights without reading every Position

### US-04: See skills and education

**As a** Visitor
**I want** the Owner's skills and education shown
**So that** I can check them against what my open role requires

### US-05: Update the page by editing content

**As an** Owner
**I want** to change what the page says by editing only the Content file
**So that** keeping my career story current needs no change to the page layout

### US-06: Be stopped from publishing broken content

**As an** Owner
**I want** invalid Career content to stop publishing and tell me what to fix
**So that** Visitors never see a partial or broken page

### US-07: Read all career content as text

**As a** Machine reader
**I want** every item of Career content present as readable page text
**So that** I can index or summarise the Owner's career without running scripts

### US-08: Keep contact details out of career text

**As an** Owner
**I want** the page to refuse to publish my raw email address or phone number inside career text
**So that** a slip in my own wording cannot expose them to scraping bots

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Content file holds the Owner's name, headline and summary
**When** a Visitor opens the page
**Then** the Visitor sees the name, headline and summary first, before any other Career section

### AC-02 (US-02) — happy path

**Given** the Content file lists three Positions with different periods
**When** a Visitor opens the page
**Then** the Visitor sees the Positions newest first, each with its employer, title, period and achievements

### AC-03 (US-02) — happy path, current Position

**Given** a Position in the Content file has a start but no end
**When** a Visitor opens the page
**Then** the Visitor sees that Position's period shown as ongoing, and it appears first among the Positions

### AC-04 (US-03) — happy path

**Given** the Content file lists notable achievements
**When** a Visitor opens the page
**Then** the Visitor sees them together in one achievements section, in the order the Owner gave

### AC-05 (US-04) — happy path

**Given** the Content file lists skills and education entries
**When** a Visitor opens the page
**Then** the Visitor sees a skills section and an education section with those entries

### AC-06 (US-04) — domain invariant, no empty sections

**Given** the Content file has no entries for one Career section, such as education
**When** a Visitor opens the page
**Then** that section is not shown at all, with no empty heading and no placeholder text

### AC-07 (US-05) — happy path

**Given** the Owner changes one Position's title in the Content file and nothing else
**When** the Owner publishes
**Then** Visitors see the new title and every other part of the page is unchanged

### AC-08 (US-06) — error, required item missing

**Given** the Content file has no name
**When** the Owner tries to publish
**Then** publishing stops and the Owner is told that the name is required and where in the Content file it belongs

### AC-09 (US-06) — domain invariant, period order

**Given** a Position in the Content file ends before it starts
**When** the Owner tries to publish
**Then** publishing stops and the Owner is told that a Position cannot end before it starts, naming the Position

### AC-10 (US-06) — cross-context, nothing published on failure

**Given** the Owner's new Content file is invalid
**When** the Owner tries to publish it
**Then** publishing stops and nothing new is published, so Visitors never see a partial or broken page

### AC-11 (US-07) — happy path

**Given** the page is published
**When** a Machine reader reads it without running scripts
**Then** every item of Career content from the Content file is present as readable text, in the same order a Visitor sees it

### AC-12 (US-08) — error, contact detail in career text

**Given** the Owner's summary or a Position's text contains an email address or a phone number
**When** the Owner tries to publish
**Then** publishing stops and the Owner is told which entry contains the contact detail and that contact details are shared only through the contact section

### AC-13 (US-08) — domain invariant, raw contact details never shown

**Given** the page is published
**When** any Visitor or Machine reader reads the page text
**Then** no raw email address and no raw phone number of the Owner appear anywhere in it

### AC-14 (US-05) — authorization, only the Owner changes content

**Given** the page is live
**When** a Visitor or a Machine reader tries to change what the page says
**Then** they cannot, because only the Owner, by editing the Content file in the repository, can change it; readers only read

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Load speed, mobile | Largest Contentful Paint ≤ 2.5 s on a simulated mid-range phone over a 4G connection, empty cache | Lighthouse mobile run on the built page (gate inherited by roadmap step 5, go live) |
| Lighthouse performance score, mobile | ≥ 90 | same Lighthouse run |
| Accessibility | Lighthouse accessibility score ≥ 95 and text contrast ratio ≥ 4.5:1 | same Lighthouse run |
| Delivered page weight | ≤ 100 KB for text and styles combined (no images in this step) | build-output test that sums the built files |
| Works without scripts | 100% of Content-file text present in the delivered page text | build-output test that compares the Content file against the built page |
| Small screens | no horizontal scrolling at a 320 px viewport width | manual check (gate inherited by roadmap step 5, go live) |
| Failure message quality | 100% of validation failures name the offending entry and what is wrong | automated tests of the content checks |
| Content check plus build time | ≤ 60 s | duration of the build job in CI |
| Browser support | latest 2 versions of Chrome, Safari, Firefox and Edge | manual smoke check (gate inherited by roadmap step 5, go live) |

## 6.1 Security / privacy

- **Data classification:** public — the Career content is what the Owner chooses to publish. The Owner's raw email address and phone number are confidential and must never appear in the delivered page.
- **Personal data touched:** the Owner's own name and employment history, published by the Owner's choice. No Visitor data is collected — no accounts, forms, cookies or tracking in this step.
- **AuthZ/AuthN impact:** none — the page is public and read-only for everyone; the only way to change it is the Owner's own editing of the Content file in the repository.
- **Abuse cases:**
  - Contact details typed into career text by mistake: publishing stops and names the entry (AC-12).
  - Markup or script text inside Career content: shown to Visitors as plain text, never executed.
  - Scraping of the page: accepted, since the Career content is public by design; the raw email and phone are the only protected items (AC-13).
  - Someone else changing the content: out of scope here — controlled by who can change the repository.
- **Security review:** N/A — a public, read-only page with no accounts and no Visitor data; its one sensitive rule (no raw email or phone) is covered by AC-12 and AC-13 and verified by automated tests.

## 7. Metrics / KPIs

- **Content coverage** — share of Content-file entries visible on the page: baseline 0% (placeholder page), target 100% at first publish.
- **Invalid content reaching Visitors** — baseline 0, target 0 incidents, ever; measurement: publishing is gated on the content check passing (AC-10); the live-site gate is inherited by roadmap step 5.
- **Page quality scores** — Lighthouse performance and accessibility: baseline TBD, measured on the current placeholder page at the start of implementation; target ≥ 90 and ≥ 95 at first publish.
- **Layout edits needed for content changes** — baseline n/a, target 0 over the first 3 months after go-live; measurement: every content-only change touches only the Content file.

## 8. Open questions

- [ ] What are the Content file's format, language and amount, and which Career sections does the Owner want beyond the assumed set (profile, positions, achievements, skills, education)? Default now: English, one Content file, the five assumed sections. — owner: Owner, due: before `sdd:design`
- [ ] Does the Owner want a photo on the page? Default now: no photo. — owner: Owner, due: before `sdd:design`
- [ ] How are contact details detected in career text without wrongly rejecting ordinary numbers such as years, team sizes and money amounts? Default now: reject anything shaped like an email address, and anything shaped like a phone number with at least 7 digits in a row (spaces, dashes and brackets allowed). — owner: Tech Lead, due: before `sdd:design`
- [ ] How will the Owner measure the brief's outcome "a visitor books a call or contacts the owner", given there is no backend (ADR 0002)? Default now: not measured. — owner: Owner, due: before roadmap step 5 (go live)
