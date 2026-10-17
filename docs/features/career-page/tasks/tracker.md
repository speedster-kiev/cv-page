# Tracker — career-page

> Status of every task in the epic. `implement` updates **Status** and **Step** after every
> subagent it runs (and commits them with the task), so this table shows where the run is right now.
> Status: `todo` · `in_progress` · `blocked` · `review` · `done`.
> Step: `SELECT` · `RED` · `GREEN` · `REFACTOR` · `GATE` · `REVIEW` · `COMMIT` (`—` before the task starts).
> A `blocked` row carries its reason in Step, e.g. `GATE — lint red after 3 retries`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status | Step |
|---|---|---|---|---|---|---|---|
| T1 | Declare yaml and sharp dependencies and ban set:html in lint | infra | mkarazeev@gmail.com | S | — | done | COMMIT |
| T2 | Implement the contact-shape detector with table-driven unit tests | domain | mkarazeev@gmail.com | S | T1 | done | COMMIT |
| T3 | Define the Zod content schema with required items and period-order rule | domain | mkarazeev@gmail.com | M | T1 | done | COMMIT |
| T4 | Build the content loader: parse YAML, validate, scan, throw ContentError | infra | mkarazeev@gmail.com | M | T2, T3 | done | COMMIT |
| T5 | Sort Positions and format periods in the loader | app | mkarazeev@gmail.com | S | T4 | done | COMMIT |
| T6 | Add the Section component and base page styles | ui | mkarazeev@gmail.com | S | T1 | done | COMMIT |
| T7 | Build the Profile component with the optional processed photo | ui | mkarazeev@gmail.com | M | T3, T6 | done | COMMIT |
| T8 | Build the Positions component with optional parts | ui | mkarazeev@gmail.com | S | T3, T6 | done | COMMIT |
| T9 | Build the Achievements and Skills list components | ui | mkarazeev@gmail.com | S | T3, T6 | done | COMMIT |
| T10 | Build the Education component with optional period | ui | mkarazeev@gmail.com | S | T3, T6 | todo | — |
| T11 | Compose index.astro from the loader and components; remove the placeholder | wiring | mkarazeev@gmail.com | M | T5, T7, T8, T9, T10 | todo | — |
| T12 | Add build-output tests: text, order, escaping, weight, read-only | tests | mkarazeev@gmail.com | M | T11 | todo | — |
| T13 | Add dist-wide contact absence and image metadata tests | tests | mkarazeev@gmail.com | S | T11, T2 | todo | — |
| T14 | Add failing-build and content-only-change fixture tests | tests | mkarazeev@gmail.com | M | T11 | todo | — |

**Total:** 14 tasks, ~10 person-days.
