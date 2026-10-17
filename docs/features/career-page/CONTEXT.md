---
status: Living
updated_at: "2026-10-17"
---

# Domain Context — career-page

## Glossary

- Career content — the facts about the Owner's professional life that the page presents: profile (including the Owner's photo), positions, achievements, skills and education. NOT contact details; those belong to the contact section (a separate roadmap step).
- Career section — one titled block of the page that presents one kind of Career content. NOT the page itself; the page is the whole set of sections.
- Content file — the single Owner-maintained file that holds all Career content and is the only thing the Owner edits to change what the page says. NOT the page layout.
- Machine reader — a search crawler or AI agent that reads the page text without being a person, and that cannot be assumed to run scripts. NOT Visitor; a Visitor is a person.
- Owner — the person whose career the page presents and who supplies and maintains the Career content. NOT Visitor.
- Position — one employment entry of the Owner: employer, title, period and achievements. NOT a user role in a user story.
- Visitor — a person (HR, recruiter, hiring manager or professional contact) who opens the page to get to know the Owner's career. NOT Owner; NOT Machine reader.

## Invariants

- The page can never show the Owner's raw email address or phone number.
- Invalid Career content is never published, not even partially.
