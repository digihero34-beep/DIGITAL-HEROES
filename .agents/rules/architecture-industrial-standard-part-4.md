# DIGITAL HEROES — INDUSTRIAL ENGINEERING STANDARD
# PART 4 — IMPLEMENTATION WORKFLOW, QUALITY GATES & FINAL STANDARD

## IMPORTANT

This is PART 4 and the final part of the industrial engineering directive.
Read it together with Parts 1–3. All four parts form ONE unified engineering standard.

## 1. IMPLEMENTATION ORDER

Use this general sequence:
PRD → Requirements Analysis → Ambiguity Identification → Architecture → Database Design → Security Model → Domain Logic → Application Services → Infrastructure → Integrations → Server/API → UI → Integration → Testing → Security Review → Performance Review → Visual QA → Deployment.

The exact sequence may change only when justified.

## 2. PHASE 1 — PRODUCT ANALYSIS

Before coding:
- inspect the complete PRD
- inspect repository and dependencies
- inspect database configuration
- inspect authentication
- inspect routes/components/tests
- inspect deployment setup

Create/update:
docs/PRD-ANALYSIS.md
docs/ASSUMPTIONS.md

Identify important ambiguities. Never silently invent business rules.

## 3. PHASE 2 — ARCHITECTURE

Create docs/ARCHITECTURE.md covering:
- system boundaries
- domain modules
- application layer
- infrastructure
- database
- integrations
- security boundaries
- state transitions
- error strategy
- observability
- scalability

Architecture decisions must have reasons.

## 4. PHASE 3 — DATABASE

Create docs/DATABASE-DESIGN.md.
Define entities, fields, relationships, ownership, constraints, indexes, statuses, history, audit needs, and money representation.
Then implement schema migrations and verify integrity before building dependent features.

## 5. PHASE 4 — SECURITY FOUNDATION

Establish authentication, authorization, data ownership, input validation, secret handling, and storage access rules.
Verify:
PUBLIC cannot access subscriber-private data.
SUBSCRIBER cannot access another subscriber’s data.
SUBSCRIBER cannot access admin functions.
CLIENT cannot control server business state.

## 6. PHASE 5 — DOMAIN LOGIC

Implement and test business domains before complex UI.
Priority areas:
- score
- subscription
- draw
- prize
- charity
- winner
- payout

Critical logic should have independent tests.

## 7. PHASE 6 — INTEGRATIONS

Implement payment, storage, email, notifications, and other external services behind clear boundaries.
Handle failures explicitly.

## 8. PHASE 7 — APPLICATION/API

Every protected operation should include appropriate authentication, authorization, validation, business rules, persistence, and error handling.
Do not expose unrestricted data access.

## 9. PHASE 8 — UI

After underlying business behavior is reliable, implement the major UI flows.
UI consumes authoritative state; it does not become the source of truth.

## 10. UI + ARCHITECTURE ALIGNMENT

The interface must reflect actual system state.
Subscription state → backend state.
Winner status → backend workflow.
Payment status → trusted payment/backend state.
Draw result → persisted published result.
Prize amount → server calculation.

Never create visually successful states that do not exist in the backend.

## 11. FEATURE IMPLEMENTATION LOOP

For every major feature:
1. Read the PRD requirement.
2. Read applicable architecture rules.
3. Identify the owning domain.
4. Identify data ownership.
5. Define server/application boundary.
6. Define validation and authorization.
7. Define failure cases.
8. Implement domain logic.
9. Add tests.
10. Implement application/server layer.
11. Implement UI.
12. Implement all UI states.
13. Test integration.
14. Review security.
15. Review performance.
16. Inspect rendered UI.
17. Review final diff.

Do not jump directly from requirement to UI.

## 12. FAILURE-FIRST THINKING

For important operations ask:
What if it happens twice?
What if the user refreshes?
What if it times out?
What if an external provider fails?
What if two requests happen simultaneously?
What if data is missing?
What if the user is unauthorized?
What if a database operation partially fails?
What if the same webhook arrives twice?
What if the state has already changed?

Handle meaningful cases explicitly.

## 13. QUALITY GATE — BEFORE MERGE

Architecture:
[ ] Correct domain ownership
[ ] Clean dependency direction
[ ] No unnecessary coupling

Security:
[ ] Authentication verified
[ ] Authorization verified
[ ] Input validated
[ ] Secrets protected
[ ] Data isolation verified

Data:
[ ] Constraints defined
[ ] Transactions considered
[ ] Idempotency considered
[ ] Monetary handling correct

Code:
[ ] Strict typing
[ ] No unnecessary `any`
[ ] Focused functions
[ ] No duplicated business logic
[ ] No dead code

Tests:
[ ] Unit tests
[ ] Integration tests where needed
[ ] E2E tests where needed
[ ] Regression tests where appropriate

Operations:
[ ] Error handling
[ ] Logging
[ ] Observability considered

Performance:
[ ] Query efficiency
[ ] Payload size
[ ] Rendering strategy
[ ] No obvious N+1 behavior

## 14. VERIFICATION COMMANDS

Use the project’s actual scripts for formatting, lint, type checking, tests, and production build.
Inspect package.json first. Do not invent commands.
Never claim a command passed unless it actually ran successfully.
If a command fails: investigate → fix root cause → rerun → verify.

## 15. ARCHITECTURE REVIEW

Before submission ask:
Can a new engineer understand the system?
Can score logic be located quickly?
Can draw logic be located quickly?
Can subscription logic be located quickly?
Can authorization boundaries be identified?
Can payment boundaries be identified?
Can critical business logic be tested independently?
Can the system evolve without a rewrite?

If not, improve the architecture.

## 16. SECURITY REVIEW

Before final submission test:
- unauthorized access
- cross-user access
- admin privilege escalation
- manipulated client state
- duplicate webhook
- duplicate payment handling
- duplicate draw publication
- unauthorized payout
- private-file exposure
- invalid input

Security review must be evidence-based.

## 17. FINAL DESIGN + ENGINEERING REVIEW

Review from both perspectives.

ENGINEERING:
architecture, correctness, security, tests, scalability, maintainability, observability.

PRODUCT:
UX, hierarchy, responsive design, accessibility, interaction quality, trust, originality, emotional engagement.

Do not sacrifice engineering quality for visual polish. Do not sacrifice UX quality for engineering convenience when a reasonable solution exists.

## 18. NO PRETEND ARCHITECTURE

Do not create:
- empty abstraction layers
- fake repositories
- unnecessary factories
- pointless interfaces
- unused services
- excessive folders

Architecture must correspond to real behavior.
A small, well-structured module is better than a large fake enterprise layer.

## 19. NO BIG-BANG CODING

Never implement the complete system in one uncontrolled pass.
Work incrementally:
Foundation → Domain → Tests → Application → Integration → UI → Review → Refinement.
After each phase verify behavior, run tests, inspect changes, and update documentation where needed.

## 20. CHANGE MANAGEMENT

Before changing architecture ask:
Why is this needed?
What depends on the current design?
What could break?
What tests protect it?
Can the same result be achieved with a smaller change?

Prefer the smallest safe architectural change.

## 21. FINAL SYSTEM STANDARD

The final system should demonstrate:
Clear architecture + Strong domain boundaries + Secure server-side behavior + Reliable database integrity + Testable business logic + Safe external integrations + Predictable state management + Responsive UI + Strong accessibility + Professional observability + Maintainable code.

## 22. INDUSTRIAL QUALITY

Industrial quality does not mean maximum abstraction, maximum folders, microservices everywhere, excessive patterns, or maximum code volume.
It means correct decisions, clear boundaries, safe changes, reliable behavior, testable logic, secure state, useful observability, understandable code, documented assumptions, and predictable operations.

## 23. FINAL PRINCIPLE

Build the system so another experienced engineer can:
READ IT → UNDERSTAND IT → TEST IT → DEBUG IT → EXTEND IT → SAFELY CHANGE IT.

The product should not merely work.
It should be engineered.
