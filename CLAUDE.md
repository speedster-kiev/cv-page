# cv-page

Single-page personal CV site. Static Astro + TypeScript on Node 22, plain CSS, hosted on GitHub Pages.
Source of truth for decisions: `docs/architecture-map.md` and `docs/adr/`.

## Commands

- Build: `npm run build` (output in `dist/`)
- Test: `npm test` (Vitest; builds first via a global setup)
- Lint: `npm run lint` (ESLint + `astro check`)

## Conventions

- Pages import components and `src/lib/` modules directly; no DI or registry.
- Content lives in `src/content/` and is validated at build time; invalid content fails the build.
- No backend, no database, no migrations (ADR 0002).
- Styling: plain CSS with CSS variables in `src/styles/`; no UI framework, Tailwind or CSS-in-JS.
- All content is server-rendered HTML; JavaScript only for the contact reveal.
- Tests: Vitest; unit tests for `src/lib/contact/`, build-output tests on `dist/`.

## Hard rule: contact details

Raw email and phone must never appear in `dist/`. They are encoded at build time and assembled in the
browser on click (ADR 0003). Anything touching them goes in `src/lib/contact/` with a test in `tests/`
that asserts their absence from the built HTML.

## Workflow

Features follow the SDD pipeline (`/sdd:specify <slug>` onward). Do not re-decide the stack here;
changes to the foundation go through `survey` and a new ADR.
