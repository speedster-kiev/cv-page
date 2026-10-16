---
status: Accepted
owner: "mkarazeev@gmail.com"
reviewers: []
updated_at: "2026-10-16"
feature_size: "n/a (foundation)"
ticket: "n/a"
---

# 0004 — Host the page on GitHub Pages

- **Status:** Accepted
- **Date:** 2026-10-16
- **Deciders:** mkarazeev@gmail.com (owner)

## Context

The page is static (ADR 0002) and needs a public host. The owner chose GitHub Pages during the foundation session.

## Decision drivers

- Owner decision (owner-reported).
- Free static hosting that deploys from the repository.

## Considered options

1. **GitHub Pages** — deploys the built `dist/` folder from a GitHub Actions workflow.
2. **Other static hosts** — equivalent for this page; not chosen by the owner.

## Decision outcome

**Chosen:** GitHub Pages, deployed from GitHub Actions. The repo currently has no git remote, so repository creation, the Pages source setting and the final URL or custom domain are still to be set up.

## Consequences

**Positive**
- Free hosting; deploy is part of the same CI workflow.

**Negative**
- Pages cannot set custom HTTP response headers, so security headers are limited to `<meta>` tags.
- A project-style URL (`user.github.io/repo`) needs a configured base path; a custom domain or a `user.github.io` repo avoids this.

**Neutral**
- Moving to another static host later only changes the deploy workflow.

## Links

- Idea brief: [[../idea-brief.md]] §5, §8
- Related ADR: [[0001-build-the-page-as-a-static-astro-site]], [[0002-no-backend-or-database]]
