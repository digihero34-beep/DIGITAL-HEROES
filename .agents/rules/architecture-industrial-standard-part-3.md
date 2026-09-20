# DIGITAL HEROES — INDUSTRIAL ENGINEERING STANDARD
# PART 3 — TESTING, TYPES, PERFORMANCE, SCALABILITY & CODE QUALITY

## IMPORTANT

This is PART 3 of the Digital Heroes industrial engineering standard.
Read it together with Parts 1, 2, and 4. All parts are one unified directive.

## 1. TESTABLE ARCHITECTURE

Critical behavior must be testable independently.
Prefer small functions, explicit dependencies, isolated side effects, pure domain calculations where practical, predictable outputs, and clear interfaces.
Avoid giant functions that combine validation, database calls, business calculations, payments, notifications, and response formatting.

## 2. TEST PYRAMID

UNIT TESTS → domain rules and calculations.
INTEGRATION TESTS → application behavior with database/infrastructure boundaries.
END-TO-END TESTS → complete user journeys.
SECURITY TESTS → authentication, authorization, and data isolation.
REGRESSION TESTS → prevent fixed bugs from returning.

## 3. CRITICAL BUSINESS TESTS

SCORES:
- valid score
- below minimum
- above maximum
- duplicate date
- edit
- delete
- rolling five-score behavior

DRAW:
- 3-number match
- 4-number match
- 5-number match
- multiple winners
- no winners
- rollover
- simulation
- publication

PRIZES:
- correct pool allocation
- equal split
- rollover handling
- rounding behavior

CHARITY:
- minimum contribution
- higher contribution
- invalid values
- selection
- unavailable charity

SUBSCRIPTION:
- active
- cancelled
- expired
- lapsed
- renewal
- webhook duplication

WINNER:
- eligible
- proof upload
- submitted
- review
- approval
- rejection
- payment pending
- paid
- unauthorized access

## 4. REGRESSION TESTING

After fixing a bug:
1. Reproduce it.
2. Add a regression test.
3. Fix the root cause.
4. Run the new test.
5. Run affected tests.
6. Run the broader suite where appropriate.

## 5. TYPE SAFETY

Use strict TypeScript. Avoid unnecessary `any`.
Prefer domain-specific types such as User, Subscription, GolfScore, Draw, PrizePool, Charity, Winner, and Payout.
External input is unknown until validated. Do not use unsafe casts to silence errors.

## 6. INPUT SAFETY

Treat forms, URL/query parameters, API payloads, webhooks, uploaded files, external API responses, and browser state as untrusted.
Validate before use.

## 7. CODE QUALITY

Code should have clear naming, focused functions, predictable behavior, minimal duplication, explicit boundaries, meaningful error handling, no dead code, and no silent failures.
Avoid unnecessary abstractions, wrappers, factories, or generic helper layers.

## 8. BUSINESS CONSTANTS

Do not scatter magic business numbers across the codebase.
Use meaningful constants such as:
MIN_STABLEFORD_SCORE
MAX_STABLEFORD_SCORE
MIN_CHARITY_PERCENTAGE
PRIZE_SHARE_FIVE_MATCH
PRIZE_SHARE_FOUR_MATCH
PRIZE_SHARE_THREE_MATCH

Use actual PRD values where applicable.

## 9. CONFIGURATION

Keep environment-dependent configuration separate from business logic.
Never hard-code API keys, passwords, database credentials, payment secrets, or private storage credentials.
Document required environment variables and never expose server-only secrets to browser code.

## 10. DEPENDENCY MANAGEMENT

Do not install packages simply because they are popular.
Before adding one, consider necessity, security, maintenance, bundle size, compatibility, and existing alternatives.
Prefer fewer well-understood dependencies.

## 11. PERFORMANCE

Avoid N+1 queries, unnecessary database calls, unused columns, huge API responses, repeated expensive calculations, uncontrolled polling, and unnecessary client rendering.
Use indexes, pagination, caching, batching, and efficient data boundaries where justified.
Measure before major optimization.

## 12. FRONTEND PERFORMANCE

Do not make every component client-rendered without reason.
Consider server rendering, code splitting, lazy loading, image optimization, efficient data fetching, and justified memoization.

## 13. DATABASE PERFORMANCE

Design queries intentionally.
Consider indexes on frequently filtered fields and relationships, pagination, query size, and aggregation strategy.
Watch for full-table scans, N+1 behavior, and repeated large queries.

## 14. SCALABILITY

Design for growth without overengineering.
Consider growing subscribers, score records, draw history, charity records, proof uploads, and analytics data.
Use indexing, pagination, storage separation, background work where needed, stateless services, and caching where justified.
Do not introduce distributed systems unnecessarily.

## 15. FILE STORAGE

User-uploaded proof should be stored appropriately.
Separate metadata from file contents.
Store controlled references to files.
Do not unnecessarily store large binaries in ordinary relational rows.

## 16. AUDIT AND HISTORY

Some business data is historical.
Do not overwrite history when traceability is required.
Consider immutable or append-only records for published draw results, payout history, winner verification actions, and important administrative changes.

## 17. BACKWARD COMPATIBILITY

Before changing database schemas, API contracts, shared components, domain types, or state values, inspect consumers and make changes safely.

## 18. CHANGE DISCIPLINE

Before modifying shared infrastructure:
1. Find consumers.
2. Understand dependencies.
3. Define expected behavior.
4. Make the smallest safe change.
5. Run affected tests.
6. Run typecheck.
7. Run lint.
8. Run build.

Do not perform broad rewrites without architectural justification.

## 19. DOCUMENTATION

Maintain accurate:
docs/ARCHITECTURE.md
docs/DATABASE-DESIGN.md
docs/ASSUMPTIONS.md
docs/UI-UX-STRATEGY.md
docs/TEST-STRATEGY.md
docs/IMPLEMENTATION-ROADMAP.md

Documentation should explain why decisions were made and where logic belongs.

## 20. ARCHITECTURAL DECISION RECORDS

For significant decisions document:
Decision, Context, Options considered, Selected approach, Reason, Consequences.
Use this for choices such as modular monolith, database, payment architecture, draw engine, storage, and authorization.

## 21. CODE REVIEW STANDARD

Before a major feature is complete, inspect architecture, security, correctness, types, tests, performance, maintainability, error handling, and observability.
Ask whether another senior engineer could understand, test, debug, and safely modify the feature.

## 22. QUALITY SIGNALS

Good signals:
clear domain ownership, predictable modules, explicit state transitions, strong validation, database integrity, isolated integrations, tests around business rules, clear errors, typed interfaces, focused functions, documented decisions.

Bad signals:
huge files, huge components, duplicated logic, random utilities, excessive `any`, hidden business rules, client-trusted state, hard-coded secrets, duplicated calculations, untested money logic, unclear ownership.

## 23. DEFINITION OF DONE

[ ] Requirement implemented
[ ] Business rules correct
[ ] Domain logic isolated
[ ] Server validation implemented
[ ] Authorization implemented
[ ] Database integrity considered
[ ] Error handling implemented
[ ] Tests added
[ ] Regression protection added where appropriate
[ ] Typecheck passes
[ ] Lint passes
[ ] Build passes
[ ] Security reviewed
[ ] Performance considered
[ ] Documentation updated where needed

## 24. NO FALSE CLAIMS

Never claim “bug-free”, “fully tested”, “production-ready”, or “secure” unless required verification actually happened.
Report evidence: tests run, results, build result, limitations, unresolved risks.

## 25. CORE PRINCIPLE

Do not optimize for maximum code.
Optimize for maximum clarity and reliability.
Do not create abstractions to look senior; create them to reduce real complexity.
Continue with PART 4.
