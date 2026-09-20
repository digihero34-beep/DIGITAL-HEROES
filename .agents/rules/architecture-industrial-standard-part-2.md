# DIGITAL HEROES — INDUSTRIAL ENGINEERING STANDARD
# PART 2 — SECURITY, DATABASE, STATE, PAYMENTS & INTEGRATIONS

## IMPORTANT

This is PART 2 of the Digital Heroes industrial engineering standard.
Read it together with Parts 1, 3, and 4. Never interpret this file independently.

## 1. SECURITY ARCHITECTURE

Security is a system property. Use multiple protection layers:
Authentication + Authorization + Input Validation + Database Integrity + Safe Infrastructure.
Never trust client-controlled business state such as roles, subscription state, winner state, payout state, prize amounts, charity amounts, or ownership claims.

## 2. AUTHENTICATION

Authentication answers “Who is this user?”
Protected resources must establish authenticated identity where required. Do not rely on UI-only authentication assumptions.

## 3. AUTHORIZATION

Authorization answers “Is this user allowed to perform this action?”
Define permissions explicitly.
PUBLIC → public content.
SUBSCRIBER → own profile, scores, charity, subscription information, participation, winnings, winner verification.
ADMIN → authorized operational functions.

A hidden button or frontend route guard is not sufficient authorization.

## 4. DATA ISOLATION

Subscribers must never access another subscriber’s private profile, scores, subscription, charity preferences, winnings, verification files, or payout information.
Enforce ownership server-side and at the database/security layer where appropriate.

## 5. DATABASE ARCHITECTURE

Treat database design as an architectural decision.
Define entities, relationships, ownership, foreign keys, unique constraints, indexes, status fields, and audit requirements.
Important business constraints should be enforced at database level where appropriate.

## 6. DATABASE MIGRATIONS

All schema changes must be versioned through reproducible migrations.
Before schema changes inspect consumers, identify affected data, assess migration safety, update tests, and verify affected flows.

## 7. MONEY REPRESENTATION

Never use ordinary floating-point arithmetic for financial calculations.
Use an appropriate integer or decimal representation.
Define currency, amount representation, rounding, and allocation/splitting behavior.
Monetary calculations must be server-side and tested.

## 8. STATE MACHINES

Processes with multiple business states should have explicit transitions.
Subscription: active, cancelled, expired, lapsed.
Winner: eligible, proof_required, submitted, under_review, approved, rejected, payment_pending, paid.
Draw: draft, simulated, scheduled, published, completed.

Do not scatter transitions across unrelated components. Invalid transitions must be rejected.

## 9. IDEMPOTENCY

Operations involving payments, webhooks, payouts, draw publication, subscriptions, and critical state transitions must consider duplicate requests.
Repeated requests must not pay twice, publish twice, create duplicates, apply money twice, or corrupt state.

## 10. CONCURRENCY

Assume simultaneous requests can happen.
Consider two updates to one record, duplicate webhooks, two admins performing the same action, simultaneous publication, or payout updates.
Use transactions, unique constraints, state checks, concurrency controls, and idempotency mechanisms where justified.

## 11. TRANSACTIONS

Operations that must succeed or fail together should use appropriate transaction boundaries, including critical prize allocation, payout updates, important subscription transitions, draw publication, and multi-record financial updates.

## 12. AUDITABILITY

Important operational actions should be traceable where necessary, including draw publication, winner verification, payout state, subscription changes, charity changes, and administrative changes.

## 13. DRAW ENGINE

Keep the draw engine isolated from UI.
Separate:
Draw Configuration → Number Generation → Matching → Prize Calculation → Rollover → Result Persistence → Publication.

The frontend must never determine winners or prize amounts.
The PRD specifies random and algorithmic draw modes.
Deterministic seeds may be used for testing/simulation when appropriate, but must not silently replace the production draw requirement.

## 14. PAYMENT ARCHITECTURE

Payment state must come from trusted server-side information.
Webhook processing must verify authenticity, validate payloads and event types, be idempotent, handle duplicates, and safely update internal state.
Never treat a browser success message as authoritative payment confirmation.

## 15. EXTERNAL INTEGRATIONS

Treat payment, storage, email, notifications, and other external services as unreliable.
Handle timeout, network errors, invalid responses, provider outages, duplicate events, retries, and partial failures.
External failures must not silently corrupt internal state.

## 16. FILE UPLOAD SECURITY

Winner proof uploads require authorization, file-type and size validation, safe naming, controlled storage, and controlled access.
Private proof files must not accidentally become public.

## 17. ERROR ARCHITECTURE

Use consistent error categories where useful:
ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, PaymentError, ExternalServiceError, InternalError.

User-facing errors should be understandable. Logs should contain useful diagnostics without secrets.
Never expose stack traces, database internals, API keys, tokens, or secrets.

## 18. OBSERVABILITY

Use appropriate structured logging, request/error correlation, important state-transition logs, webhook logs, and operational metrics.
Never log passwords, access tokens, payment secrets, or API keys.

## 19. INTEGRATION BOUNDARIES

Keep provider-specific code isolated.
Example:
Application → Payment interface → Payment adapter.
Application → Storage interface → Storage adapter.

Do not spread provider-specific logic throughout the domain.

## 20. FAILURE BOUNDARIES

For every external operation ask:
What if it times out?
What if it fails?
What if the provider succeeds but our database update fails?
What if the user retries?
What if the provider responds twice?

Document important failure behavior.

## 21. SECURITY REVIEW QUESTIONS

Before completing a feature ask:
Can another user access this resource?
Can the client manipulate this state?
Can an admin-only action be triggered without admin permission?
Can a webhook be replayed?
Can a payment happen twice?
Can a winner be marked paid from the client?
Can a private file become public?
Can malformed input reach business logic?

If yes, fix the architecture before continuing.

Continue with PART 3.
