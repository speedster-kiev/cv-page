---
slug: career-page
date: 2026-10-17
triage: regression
acs: [AC-01]
commit: 76dad24
recurrence_of: none
---

# Fix: profile photo 404s on the deployed GitHub Pages site

## Symptom

Opening https://speedster-kiev.github.io/cv-page/, expected the Owner's photo in the profile block, got a broken image.
Scope: every Visitor, since the page was first deployed. The live HTML requests `/_astro/photo.DRzM6skf_Z1udOfl.webp`,
which returns 404; the same file under `/cv-page/_astro/…` returns 200.

## Root cause

`astro.config.mjs` never set `site` / `base` (a comment said they would be set once the Pages URL was decided, ADR 0004).
GitHub Pages serves this project under `/cv-page/`, so the root-absolute `src` / `srcset` URLs that Astro emits for the
optimized photo point outside the site. The existing tests rendered the `<img>` and checked its attributes, but none checked
where its URL points, and the local build and preview serve from `/`, so the problem showed only after deploy.

## The pinning test

`tests/build-output.test.ts` › "built page under the GitHub Pages path (ADR 0004)" — build-output level.
RED run, before the config change:

```
Expected: /\ssrc="\/cv-page\/_astro\//
Received: "<img src=\"/_astro/photo.DRzM6skf_Z1udOfl.webp\" srcset=\"/_astro/photo…
```

A second test asserts every root-absolute `src`, `href` and `srcset` URL in the built page starts with `/cv-page/`.

## Spec patch

none — spec was right; AC-01 re-verified (the Visitor must see the photo; it was the deployed asset URL that was wrong).

## Follow-ups

- `public/robots.txt` is now served at `/cv-page/robots.txt`; crawlers only read `/robots.txt` at the host root, so it has no effect on a project site. Roadmap step 4 (search and agent metadata) should account for this; a custom domain or a `speedster-kiev.github.io` repo would resolve it.
- If the site moves to a custom domain, `site` / `base` in `astro.config.mjs` and `BASE` in the pinning test change together.
