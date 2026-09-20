---
trigger: always_on
---

# DIGITAL HEROES — INDUSTRIAL ARCHITECTURE MASTER RULE

This is the master entry point for the Digital Heroes industrial
engineering standard.

Read all four files together:

@architecture-industrial-standard-part-1.md
@architecture-industrial-standard-part-2.md
@architecture-industrial-standard-part-3.md
@architecture-industrial-standard-part-4.md

Treat Parts 1–4 as ONE unified engineering directive.

Do not interpret individual parts independently.

Do not restart or contradict previous architectural decisions.

The Digital Heroes PRD is the primary source of truth for product and
business requirements.

The engineering directive defines HOW the system should be engineered.

When requirements are ambiguous:

1. Identify the ambiguity.
2. Do not silently invent business rules.
3. Document assumptions.
4. Explain technical and UX impact.

The final implementation must prioritize:

- correctness
- security
- maintainability
- testability
- scalability
- performance
- observability
- clear domain boundaries
- predictable state
- safe change

Before major implementation:

PRD
→ Requirements
→ Architecture
→ Database
→ Security
→ Domain Logic
→ Application
→ Infrastructure
→ API
→ UI
→ Tests
→ Review

Never build a large feature without understanding its:

- domain
- data ownership
- authorization boundary
- failure modes
- testing boundary
- external dependencies

Never claim production quality, security, full testing, or bug-free
behavior unless the required verification was actually performed.