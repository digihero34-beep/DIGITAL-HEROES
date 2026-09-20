# DIGITAL HEROES — DATABASE STANDARD
# PART 2 — INTEGRITY, SECURITY, TRANSACTIONS & ACCESS

## 1. DATABASE INTEGRITY

Important business rules must be protected at the database level where
appropriate.

Use:

- foreign keys
- unique constraints
- check constraints
- non-null constraints
- appropriate indexes

Application validation is necessary but not sufficient.

---

## 2. SCORE INTEGRITY

The score database design must prevent invalid records.

Enforce:

- valid score range
- required date
- valid user ownership
- one score per user/date

The rolling five-score behavior must be implemented deliberately.

Do not create uncontrolled historical deletion merely to satisfy the UI.

If historical retention beyond five records is needed for audit/business
reasons, document the distinction between retained history and the active
five-score set.

Do not invent such behavior without documenting the assumption.

---

## 3. USER DATA OWNERSHIP

Every subscriber-owned record must be traceable to its owner.

Examples:

- scores
- charity selection
- subscription
- winnings
- verification
- profile information

Queries must always respect ownership boundaries.

Do not create generic "getById" operations that can expose another user's
private data without authorization.

---

## 4. ADMIN ACCESS

Administrative data access must be protected.

Do not assume:

database visibility
=
authorized visibility.

Application authorization and database security policies must work together
where applicable.

---

## 5. DATABASE SECURITY

Protect:

- private user information
- subscription data
- payment-related records
- winner proof metadata
- payout information
- admin information

Use least-privilege access.

Never expose database credentials to the browser.

Never expose service-role credentials to client-side code.

---

## 6. ROW-LEVEL SECURITY

Where the selected database supports row-level security, evaluate it for
user-owned data.

Policies should reflect actual business ownership.

Do not enable a policy merely because it appears secure.

Test:

- user A cannot access user B data
- subscriber cannot access admin data
- unauthorized user cannot access protected records
- admin access behaves as intended

---

## 7. TRANSACTIONS

Use transactions where multiple database changes must succeed or fail
together.

Examples:

- draw publication
- prize allocation
- important payout state updates
- multi-record subscription changes

Do not leave half-completed business operations.

---

## 8. CONCURRENCY

Assume multiple requests can occur simultaneously.

Examples:

- duplicate score submissions
- two admins modifying the same record
- repeated draw publication
- simultaneous payout updates
- duplicate webhooks

Use:

- unique constraints
- transactions
- state checks
- locking where appropriate
- idempotency mechanisms

where justified.

---

## 9. IDEMPOTENCY

Database operations triggered by external events must be safe to repeat.

Important areas:

- payment webhooks
- subscription events
- payout operations
- draw publication
- important state transitions

Duplicate processing must not corrupt the database.

---

## 10. DRAW DATA

Separate the concepts where appropriate:

Draw configuration
Draw execution
Draw result
Winner matching
Prize allocation
Publication

Do not store the entire draw system as one uncontrolled record.

Published results should be traceable and protected from accidental mutation.

---

## 11. PRIZE POOL DATA

The database must support the PRD's prize tiers:

5-number match
4-number match
3-number match

and their allocation rules.

The database must allow:

- pool calculation
- multiple winners
- equal splitting
- rollover tracking
- draw association
- payout tracking

Financial calculations must remain authoritative server-side.

---

## 12. CHARITY DATA

Charity data should support:

- directory information
- description
- media references
- events
- active/inactive state
- featured status where required

User charity selection and contribution percentage must remain associated
with the subscriber.

Do not duplicate charity master data unnecessarily.

---

## 13. WINNER DATA

Winner information should support:

- draw
- user
- match tier
- prize amount
- verification state
- proof reference
- review state
- payout state

Keep winner state transitions controlled.

---

## 14. FILE REFERENCES

Do not store private proof files directly in ordinary text columns.

Store appropriate file metadata/reference information.

The storage system should handle actual file contents.

Database access and file access must obey the same authorization model.

---

## 15. CASCADE BEHAVIOR

Do not blindly apply cascading deletes.

For every relationship ask:

Should deletion:

- cascade?
- restrict?
- soft-delete?
- archive?
- preserve history?

Critical financial and audit records should generally not disappear
accidentally.

Document important choices.

---

## 16. SOFT DELETE

Use soft deletion only where it has a real business purpose.

Do not add `deleted_at` to every table automatically.

If soft delete is used:

- define query behavior
- define uniqueness behavior
- define restoration
- define administrative visibility

---

## 17. DATABASE ERRORS

Do not expose raw database errors to users.

Translate database failures into appropriate application-level errors.

Keep secure diagnostics in logs.
