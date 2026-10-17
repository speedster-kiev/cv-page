---
id: T1
title: "Declare yaml and sharp dependencies and ban set:html in lint"
layer: "infra"
deps: []
blocks: ["T2", "T3", "T6"]
acs: []
files_hint: ["package.json", "package-lock.json", "eslint.config.js"]
owner: "mkarazeev@gmail.com"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T1 — Declare yaml and sharp dependencies and ban set:html in lint

## Place in the sequence

- **Blocked by:** — · **Blocks:** T2 — Implement the contact-shape detector with table-driven unit tests, T3 — Define the Zod content schema with required items and period-order rule, T6 — Add the Section component and base page styles · **Wave:** 1, first task: nothing else can build before the dependencies are declared.
- **Lane:** own lane.

## Why (user story)

> **As an** Owner
> **I want** invalid Career content to stop publishing and tell me what to fix
> **So that** Visitors never see a partial or broken page
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

Gives the loader and image pipeline their declared dependencies and makes the escaping rule (spec §6.1) a lint failure instead of a convention.

## Inlined context

> Zod 4 (re-exported by `astro/zod`) for the content schema; `yaml` (YAML 1.2, currently 2.9.1) as the Content-file parser, declared explicitly in `package.json`; `sharp` for the photo, declared explicitly in `package.json` (Astro lists it only as an optional dependency, and the no-EXIF guarantee in QG-3 depends on it).
>
> — `sad.md §2, Technical constraints, verbatim` · full text: [sad.md](../sad.md)

> `set:html` is banned by a new lint rule this feature adds to `eslint.config.js` (`astro/no-set-html-directive`; `tasks` must include it), so markup in content is shown as text, never executed (spec §6.1).
>
> — `sad.md §4, strategic choice 4, abridged` · full text: [sad.md](../sad.md)

> **Escaping:** values printed only as escaped `{value}`; `set:html` banned by a new lint rule added by this feature
>
> — `sad.md §8, Escaping row, verbatim` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/)) and follow it. Do not guess. There is no `data-model.md` and no `contracts/` for this feature (no datastore, no API — ADR 0002).

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

No spec §5 criterion is owned by this task: it is enabling work for the abuse case below, whose enforcement is tested in later tasks.

> Markup or script text inside Career content: Career content is plain text only (no formatting or links); markup is shown to Visitors as plain text, never executed.
>
> — `spec.md §6.1, abuse cases, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `npm install --save yaml sharp` (pin to current minor; `yaml` is 2.x, YAML 1.2) — `package.json`, `package-lock.json`
- [ ] Add `'astro/no-set-html-directive': 'error'` to a rules block in `eslint.config.js` (after `...astro.configs.recommended`)
- [ ] Add a throwaway `set:html` usage locally to confirm `npm run lint` fails, then remove it (do not commit it)
- [ ] Run `npm run lint` and `npm run build` on the untouched skeleton to confirm both stay green

## Edge cases

| Case | Behaviour |
|---|---|
| `set:html` appears in any `.astro` file | `npm run lint` exits non-zero naming the rule |
| `sharp` missing from `package.json` (only an optional Astro dependency) | not allowed: it must be declared explicitly, QG-3 depends on it |

## Definition of Done

- [ ] `package.json` lists `yaml` and `sharp` under `dependencies`; `npm ci` succeeds
- [ ] `npm run lint` fails on a file containing `set:html` and passes on the current tree
- [ ] `npm run build` still passes
