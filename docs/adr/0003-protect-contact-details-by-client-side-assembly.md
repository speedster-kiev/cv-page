---
status: Accepted
owner: "mkarazeev@gmail.com"
reviewers: []
updated_at: "2026-10-16"
feature_size: "n/a (foundation)"
ticket: "n/a"
---

# 0003 — Protect email and phone by assembling them in the browser

- **Status:** Accepted
- **Date:** 2026-10-16
- **Deciders:** mkarazeev@gmail.com (owner), Claude (survey, foundation session)

## Context

The owner requires email and phone to be hidden from scraping bots while the page stays searchable and AI-agent friendly. The brief accepts public booking and LinkedIn links plus obfuscated email/phone (idea brief §5, §7).

## Decision drivers

- Raw email and phone must not appear in the built HTML or structured data (owner-required constraint).
- Legitimate visitors must still reach the contact details with one action.
- The protection must be checkable by an automated test.

## Considered options

1. **Encoded in the built page, assembled by a small script on click** — the HTML holds only encoded parts.
2. **Contact form only, no email or phone shown** — strongest against scrapers, but a form needs a backend or third party (see ADR 0002).
3. **Plain text** — rejected by the owner's requirement.

## Decision outcome

**Chosen:** Option 1. It satisfies the requirement against simple scrapers without a backend. The build-output test asserts that raw email and phone are absent from `dist/`.

## Consequences

**Positive**
- No server needed; keeps ADR 0002 intact.
- Automated check protects the requirement from regressions.

**Negative**
- Determined bots that execute JavaScript can still obtain the details (residual risk from the brief §6).
- Visitors without JavaScript, and AI agents that do not run scripts, see only the booking and LinkedIn links.

**Neutral**
- The exact encoding and reveal interaction are decided in `design`.

## Links

- Idea brief: [[../idea-brief.md]] §5, §6, §7
- Related ADR: [[0001-build-the-page-as-a-static-astro-site]], [[0002-no-backend-or-database]]
