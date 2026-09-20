# DIGITAL HEROES — INDUSTRIAL ENGINEERING STANDARD
# PART 1 — ARCHITECTURE, DOMAIN DESIGN & CODE ORGANIZATION

## IMPORTANT

This is PART 1 of a multi-part industrial engineering directive.
Read it together with Parts 2–4. All parts form ONE unified engineering standard.
The Digital Heroes PRD is the primary source of truth for product and business requirements.
Do not silently invent or change business rules.

## 1. ENGINEERING MISSION

Build Digital Heroes as a production-quality software system.
Optimize for correctness, maintainability, security, testability, scalability, performance, observability, extensibility, clear ownership, and predictable behavior.
The codebase must be understandable to another experienced engineer without requiring the original developer.

## 2. ARCHITECTURE FIRST

Before major implementation:
1. Understand the relevant PRD requirement.
2. Identify the business domain.
3. Identify actors and permissions.
4. Identify data ownership.
5. Identify application boundaries.
6. Identify external dependencies.
7. Identify security boundaries.
8. Identify failure modes.
9. Identify testing boundaries.
10. Document important decisions.

Do not create architecture merely to appear sophisticated. Use architecture to make change safer, testing easier, ownership clearer, failures easier to isolate, and business logic easier to understand.

## 3. SEPARATION OF CONCERNS

Maintain clear conceptual layers:
Presentation → Application → Domain → Infrastructure → Database / External Services

The exact folder structure may follow the framework, but responsibility boundaries must remain clear.
Do not put core business logic directly inside React components, page components, UI handlers, route handlers, or raw database queries.

## 4. DOMAIN-FIRST ORGANIZATION

Organize important code around business domains:
- authentication
- users
- subscriptions
- scores
- draws
- prizes
- charities
- winners
- payouts
- notifications
- administration

Avoid giant generic folders containing unrelated business logic. Business rules should remain inside their owning domain.

## 5. MODULAR MONOLITH PREFERENCE

Unless there is a demonstrated reason for distributed services, prefer a well-structured modular monolith.
Do not introduce microservices merely because they sound enterprise-grade.
Use additional complexity only when the product actually requires it.

## 6. RECOMMENDED STRUCTURE

A conceptual structure may look like:

src/
  app/
  modules/
    auth/
    users/
    subscriptions/
    scores/
    draws/
    prizes/
    charities/
    winners/
    payouts/
    administration/
  components/
  infrastructure/
  database/
  lib/
  tests/

Adapt to the selected framework when better idiomatic structure exists.

## 7. DOMAIN LOGIC

Critical business logic must be isolated from presentation.
Examples:
validateScore()
calculateRollingScores()
generateDraw()
matchDrawNumbers()
calculatePrizePool()
calculateCharityContribution()
determineWinnerEligibility()
transitionWinnerStatus()

These operations should be independently testable. Minimize side effects and keep calculations separate from persistence where practical.

## 8. APPLICATION LAYER

Application services coordinate complete use cases, for example:
CreateScore, UpdateScore, DeleteScore, CreateSubscription, CancelSubscription,
RunDrawSimulation, PublishDraw, SelectCharity, ReviewWinnerProof, ApproveWinner,
RejectWinner, MarkPayoutPaid.

Application services coordinate domain logic and infrastructure and should not contain UI rendering logic.

## 9. INFRASTRUCTURE LAYER

Infrastructure includes database, payment provider, storage, email, notifications, external APIs, logging, and analytics.
Keep vendor-specific implementation at the infrastructure boundary.

## 10. DATA OWNERSHIP

Every business-critical value needs a clear source of truth:
Subscription status → trusted server/payment state
Admin privilege → server-side authorization
Winner status → server-side workflow state
Prize amount → server-side calculation
Charity contribution → server-side calculation
Score history → database-backed domain state

The browser must never become the authority for business-critical state.

## 11. API / SERVER RESPONSIBILITIES

Protected server operations should generally:
1. Authenticate where required.
2. Authorize the action.
3. Validate external input.
4. Execute the correct application use case.
5. Enforce business rules.
6. Persist changes safely.
7. Return predictable results.
8. Handle failures appropriately.
9. Log important operational events.

Do not expose unrestricted database access.

## 12. VALIDATION BOUNDARIES

Client validation → user experience.
Server validation → authoritative security and correctness.
Database constraints → data integrity.

Client validation is never sufficient as a security boundary.
All external data is untrusted until validated.

## 13. CODE RESPONSIBILITY

A component should not contain complex business calculations, database operations, authorization rules, payment logic, notification logic, and large formatting logic at once.
Split responsibilities into appropriate layers.

## 14. DEPENDENCY DIRECTION

Prefer dependencies flowing toward stable business concepts.
Presentation depends on application/domain behavior.
Infrastructure implements required interfaces rather than forcing business logic to understand vendor internals.
Avoid circular dependencies.

## 15. CODE ORGANIZATION TEST

Before creating a file ask:
Which domain owns this?
Which layer owns this?
Who should depend on it?
What is its responsibility?

If unclear, the architecture is not clear enough.

## 16. CORE PRINCIPLE

The goal is not more folders or more abstractions.
The goal is clear responsibilities and safer change.
Continue with PART 2.
