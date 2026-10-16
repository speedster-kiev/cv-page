---
status: Accepted
owner: "mkarazeev@gmail.com"
reviewers: []
updated_at: "2026-10-16"
feature_size: "n/a (foundation)"
ticket: "n/a"
---

# 0001 — Build the page as a static Astro site in TypeScript

- **Status:** Accepted
- **Date:** 2026-10-16
- **Deciders:** mkarazeev@gmail.com (owner), Claude (survey, foundation session)

## Context

The idea brief calls for a personal page that search engines and AI agents can read and that is built from an owner-supplied content file. The repo is empty, so the stack must be chosen before any feature is specified.

## Decision drivers

- Content must be readable as plain HTML by search crawlers and AI agents (brief §5, owner-reported).
- The page is a single read-only page with a small amount of content (brief §2).
- Email and phone need a small amount of client-side script (see ADR 0003), so the stack must allow selective JavaScript.
- The owner does not want runtime infrastructure to maintain (assumption, see ADR 0002).

## Considered options

1. **Astro + TypeScript** — a static site generator that ships HTML with zero JavaScript by default and allows small scripts where needed.
2. **Hand-written HTML/CSS/JS, no framework** — no build step, but no typed content layer and more manual repetition.
3. **Next.js (React)** — can export static HTML, but brings a React runtime and a heavier toolchain than a single page needs.

## Decision outcome

**Chosen:** Option 1, Astro + TypeScript on Node.js 22 LTS with npm. It emits crawler-friendly static HTML, lets the build validate the content file's shape, and keeps JavaScript to the one place that needs it.

## Consequences

**Positive**
- Output is plain HTML that search engines and agents read without running scripts.
- Typed, build-validated content file.

**Negative**
- A build toolchain (Node.js, npm packages) must be maintained and kept updated.
- Moving to another framework later is a rewrite of the templates.

**Neutral**
- The content file format is not fixed by this ADR; the owner's supplied file is adapted to the schema in `specify`/`design`.

## Links

- Idea brief: [[../idea-brief.md]] §5, §7
- Related ADR: [[0002-no-backend-or-database]], [[0003-protect-contact-details-by-client-side-assembly]], [[0004-host-on-github-pages]]
