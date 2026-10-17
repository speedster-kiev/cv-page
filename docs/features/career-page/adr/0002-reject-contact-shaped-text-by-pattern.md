---
status: Accepted
owner: "mkarazeev@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-17"
feature_size: "S"
ticket: "n/a"
---

# 0002 — Reject contact-shaped text by pattern

- **Status:** Accepted
- **Date:** 2026-10-17
- **Deciders:** mkarazeev@gmail.com (Owner), Claude (design)

## Context

AC-12 requires that any career text shaped like an email address or phone number (any such value, not only the Owner's own) stops the build, and AC-13 requires that no raw email or phone appears in any delivered file. The Owner's real values belong to roadmap step 3, so the check cannot depend on them. The Owner confirmed on 2026-10-17 that an attempt to publish such a value must fail the build.

## Decision drivers

- Spec §5 AC-12 and AC-13; spec §6.1 abuse case "contact details typed into career text".
- Ordinary numbers (years, team sizes, money) must not be wrongly rejected; year ranges like "2019–2023" and amounts like "1 000 000" must pass (spec §8).
- Hard rule in `CLAUDE.md`: this logic lives in `src/lib/contact/` with tests.
- The same shapes must drive the `dist/` absence test.

## Considered options

1. **Own pattern rules in `src/lib/contact/detect.ts`** — email shape; phone shape = a run of digits with spaces, dashes, dots, brackets and an optional leading `+`, containing at least 7 digits; two exemptions (year range, space-grouped amount).
2. **A phone-number library (for example `libphonenumber-js`)** — validates real numbers per country, but needs a default region, misses unformatted or invalid-looking numbers, and adds a large build-time dependency.

## Decision outcome

**Chosen:** Option 1. It catches any digit string a scraper could treat as a phone number, is a few lines of code with exhaustive unit tests, and needs no dependency. The same functions are reused by the `dist/` absence test.

## Consequences

**Positive**
- No dependency; behaviour is fully covered by table-driven tests.
- Same rules in the build check and the output scan, so they cannot drift.

**Negative**
- Heuristic: a 9-digit number written as groups of 3 separated by spaces matches the amount exemption and passes (accepted in SAD §11).
- Some legitimate text (such as an ISO date "2021-03-15") is rejected; the error names the entry and the Owner rewords.

**Neutral**
- Replacing the heuristic with a library later changes only `detect.ts`.

## Links

- Spec: [[../spec.md]] §5 AC-12, AC-13; §6.1; §8 open question 3
- SAD: [[../sad.md]] §4, §8
- Related ADR: [[0001-store-career-content-in-one-yaml-file]]; foundation ADR 0003 (`docs/adr/0003-protect-contact-details-by-client-side-assembly.md`)
