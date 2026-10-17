# Changelog — career-page

## career-page — the Owner's career story renders as a validated single page

**What:** The site now renders the Owner's Engineering Manager career story from one content file (`src/content/career.yaml`): profile (name, photo, headline, summary) first, then Positions newest first (ongoing ones show "Present"), notable achievements, skills and education. Empty sections are not rendered. Everything is static HTML readable without JavaScript.

**Why:** Recruiters and hiring managers need one readable page, and invalid or sensitive content must never reach Visitors ([spec](spec.md) §1/§2). Content is validated at build time with path-named errors; any failure stops the build and leaves no `dist/index.html`. Text shaped like an email or phone number is rejected ([ADR 0002](adr/0002-reject-contact-shaped-text-by-pattern.md)), supporting the project rule that raw contact details never appear in `dist/` ([project ADR 0003](../../adr/0003-protect-contact-details-by-client-side-assembly.md)). Content storage: [ADR 0001](adr/0001-store-career-content-in-one-yaml-file.md).

**How to use:** Edit `src/content/career.yaml`, then `npm run build`. A problem is reported as `career.yaml: <field path> — <reason>` and the build exits non-zero. The photo is a top-level `src/content/*.{jpg,jpeg,png,webp}` file named in `photo.file`, with required `photo.alt`.

**Operational notes:**
- Migration: <!-- none -->
- Feature flag / config: <!-- none -->
- Deploy: `.github/workflows/deploy.yml` deploys to GitHub Pages on merge to main, so merging publishes this page before roadmap step 5 (accepted, review F10).
- Rollback: revert the merge commit; Pages redeploys the previous build.
- Accepted residuals (review): 4-4 digit phone numbers can pass the contact-shape check (F5); the unknown-key and missing-photo errors echo the offending value in the build log only (F9, R4).

**Acceptance criteria delivered:** AC-01 … AC-14 (profile first; Positions ordered with ongoing first; achievements, skills, education in the Owner's order; no empty sections; single-title edit changes only that title; required items, period order and contact-shaped text stop the build with a named field; nothing published on failure; full text readable without scripts; no raw email or phone in `dist/`; only the Owner changes content).
