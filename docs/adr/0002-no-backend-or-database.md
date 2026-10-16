---
status: Accepted
owner: "mkarazeev@gmail.com"
reviewers: []
updated_at: "2026-10-16"
feature_size: "n/a (foundation)"
ticket: "n/a"
---

# 0002 — Ship no backend and no database

- **Status:** Accepted
- **Date:** 2026-10-16
- **Deciders:** mkarazeev@gmail.com (owner), Claude (survey, foundation session)

## Context

The page presents fixed professional content and points visitors to a booking page, LinkedIn and obfuscated email/phone (idea brief §7). Nothing in the brief requires storing visitor data or running server logic.

## Decision drivers

- The brief's goal is to present content and route visitors to contact, not to collect data.
- Hosting is GitHub Pages, which serves static files only (ADR 0004).
- Less attack surface and no operational ownership for a personal page.

## Considered options

1. **Static files only, content in the repo** — the build reads the content file and emits HTML.
2. **Serverless function for a contact form** — adds form handling and spam protection to maintain.
3. **CMS or database-backed content** — editable without a rebuild, but adds a service to run.

## Decision outcome

**Chosen:** Option 1. A contact form is explicitly an open question in the brief (§8) and can be added later through a third-party form endpoint without a backend of our own.

## Consequences

**Positive**
- Nothing to operate, patch or secure on the server side.
- No migration tool or data model is needed.

**Negative**
- Every content change needs a rebuild and deploy.
- A first-party contact form is not possible without adding a service.

**Neutral**
- Adding a backend later is possible but would change the hosting decision (ADR 0004).

## Links

- Idea brief: [[../idea-brief.md]] §5, §8
- Related ADR: [[0001-build-the-page-as-a-static-astro-site]], [[0004-host-on-github-pages]]
