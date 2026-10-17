---
id: T2
title: "Implement the contact-shape detector with table-driven unit tests"
layer: "domain"
deps: ["T1"]
blocks: ["T4", "T13"]
acs: ["AC-12", "AC-13"]
files_hint: ["src/lib/contact/detect.ts", "tests/detect.test.ts"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T2 — Implement the contact-shape detector with table-driven unit tests

## Place in the sequence

- **Blocked by:** T1 — Declare yaml and sharp dependencies and ban set:html in lint · **Blocks:** T4 — Build the content loader: parse YAML, validate, scan, throw ContentError, T13 — Add dist-wide contact absence and image metadata tests · **Wave:** 2, starts as soon as its dependencies are done.
- **Lane:** own lane.

## Why (user story)

> **As an** Owner
> **I want** the page to refuse to publish my raw email address or phone number inside career text
> **So that** a slip in my own wording cannot expose them to scraping bots
>
> — `spec.md §4, US-08, verbatim` · full text: [spec.md](../spec.md)

Provides the single email/phone shape logic that both the build-time check (AC-12) and the `dist/` absence scan (AC-13) call.

## Inlined context

> **Chosen:** Option 1. Own pattern rules in `src/lib/contact/detect.ts` — email shape; phone shape = a run of digits with spaces, dashes, dots, brackets and an optional leading `+`, containing at least 7 digits; two exemptions (year range, space-grouped amount). ... The same functions are reused by the `dist/` absence test.
>
> — `adr/0002-reject-contact-shaped-text-by-pattern.md §Considered options 1 + §Decision outcome, abridged` · full text: [adr/0002-reject-contact-shaped-text-by-pattern.md](../adr/0002-reject-contact-shaped-text-by-pattern.md)

> Default now: reject anything shaped like an email address, and anything shaped like a phone number with at least 7 digits in a row (spaces, dashes and brackets allowed), except year ranges such as "2019–2023" and amounts grouped with spaces such as "1 000 000", which must not be rejected. The absence check compares against these shapes, since the Owner's real values belong to roadmap step 3.
>
> — `spec.md §8, open question 4 (contact detection), verbatim` · full text: [spec.md](../spec.md)

> **Hard rule:** Raw email and phone must never appear in `dist/`. They are encoded at build time and assembled in the browser on click (ADR 0003). Anything touching them goes in `src/lib/contact/` with a test in `tests/` that asserts their absence from the built HTML.
>
> — `CLAUDE.md §Hard rule: contact details, verbatim` · full text: [CLAUDE.md](../../../../CLAUDE.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-12 — error, contact detail in career text

> **Given** any Career content text — name, headline, summary, photo alt text, achievements, a Position's text (including its employer description and summary), skills or education — contains something shaped like an email address or a phone number (any such value, not only the Owner's own)
> **When** the Owner tries to publish
> **Then** publishing stops and the Owner is told which entry contains the contact detail and that contact details are shared only through the contact section
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

### AC-13 — domain invariant, raw contact details never shown

> **Given** the page is published
> **When** any Visitor or Machine reader reads the page in any form — visible text, links, attributes, metadata or any other delivered file
> **Then** no raw email address and no raw phone number of the Owner appear anywhere in it
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Write `tests/detect.test.ts` first: table of reject cases (plain email, `+45 12 34 56 78`, `(555) 123-4567`, `12345678`, `+380-44-123-45-67`) and accept cases (`2019–2023`, `2019-2023`, `1 000 000`, `~48 to 16 days`, `20+ years`, `10 engineers`)
- [ ] Export `findEmails(text): string[]` and `findPhones(text): string[]` and `hasContactShape(text): 'email' | 'phone' | null` from `src/lib/contact/detect.ts` — pure functions, no I/O, no raw values stored in the module
- [ ] Phone shape: run of digits with spaces, dashes, dots, brackets and optional leading `+`, ≥ 7 digits; apply the year-range and space-grouped-amount exemptions before matching
- [ ] Run `npm test -- detect` until green; keep every exemption covered by a named test case

## Edge cases

| Case | Behaviour |
|---|---|
| ISO date `2021-03-15` | rejected as phone-shaped (accepted trade-off, SAD §11); the loader error names the entry |
| `1 000 000` and `2019–2023` | accepted (exemptions) |
| 9 digits as three space-separated groups of 3 | passes the amount exemption (accepted debt, SAD §11) |
| Empty string | no hit |

## Definition of Done

- [ ] table-driven unit tests for email, phone and both exemptions pass for AC-12
- [ ] `findEmails` / `findPhones` are exported for reuse by the `dist/` scan test (AC-13)
- [ ] every Hard Rule inlined above still holds: no real email or phone value appears in any source or fixture
- [ ] lint clean
