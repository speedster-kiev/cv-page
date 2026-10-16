---
status: Draft
owner: "mkarazeev@gmail.com"
updated_at: "2026-10-16"
depth: "easy"
---

# Idea brief — cv-page

## 1. Raw idea

I want to build a page that will be about me and my professional life, achievemnts etc, so that HR and others can find and get to know more about and contact me

## 2. Problem

Owner-reported: the owner is targeting an Engineering Manager role and wants a single public page presenting their professional life and achievements, so recruiters/HR and others can find them and get to know them. Desired observable outcome (owner-reported): a visitor books a call or contacts the owner by any channel. Owner-reported: this is a new page (no existing site); the owner will supply a content file. Not established: what is lacking in the owner's current CV/LinkedIn presence.

## 3. Users

Owner-reported: HR/recruiters ("HR and others") evaluating the owner for Engineering Manager roles. Assumption: "others" includes hiring managers and professional contacts. Owner-reported: visitors arrive via a link on the owner's CV and LinkedIn profile, and via search engines; AI agents should also be able to read the page.

## 4. Why now

No trigger or deadline established; the owner is pursuing Engineering Manager roles (owner-reported).

## 5. Out of scope

Owner-required constraints (owner-reported): page is searchable and AI-agent friendly; phone number and email are protected from scraping bots; content comes from an owner-supplied file. Accepted contact decision (owner-accepted, question 3): booking link and LinkedIn URL are public and machine-readable; email and phone are obfuscated (e.g. revealed on click) rather than in plain text. Exclusions beyond this: not established.

## 6. Risks

| claim/question | class | source/origin | finding/limit |
|---|---|---|---|
| Target role is Engineering Manager; success = visitor books a call or makes contact | owner-reported | interview answer 1 | Not independently verified |
| Requirement tension: page must be search/AI-agent readable yet phone/email hidden from scraping bots; legitimate crawlers/agents are generally indistinguishable from scrapers, and bots that execute scripts can still reveal obfuscated contacts | assumption | interviewer reasoning, not source-verified (no research run) | Resolved by owner decision (public booking/LinkedIn, obfuscated email/phone); residual risk: determined bots may still obtain them; agents get a contact route but not raw email/phone |

## 7. Recommendation

Direction (owner-accepted, question 4): build a new personal page, linked from the owner's CV and LinkedIn, presenting career and achievements from an owner-supplied content file, searchable and AI-agent readable, with a public booking link and LinkedIn URL and obfuscated email/phone. Intended observable result: visitors book a call or contact the owner. Major tradeoff: agent/search readability versus contact privacy, resolved by exposing a contact route rather than raw email/phone. Alternative considered: relying on LinkedIn alone (simpler; not pursued since an owned, searchable page is the point of the idea; reason is an interviewer inference, not owner-stated).

Outcome: ready-for-specify
Next action: run specify on this brief.

## 8. Open questions

- How "book a call" is fulfilled (existing booking tool or new) | scope | nonblocking | ask owner | owner
- Content file not yet seen (format, language, amount) | scope of page | nonblocking | owner provides file | owner
- Whether a contact form is wanted in addition to booking link and LinkedIn | scope | nonblocking | decide in specify | owner
