# DIGITAL HEROES — DATABASE STANDARD
# PART 3 — PERFORMANCE, MIGRATIONS, TESTING & QUALITY

## 1. INDEXING

Create indexes based on actual access patterns.

Consider indexes for:

- user ownership lookups
- dates
- subscription status
- draw status
- winner status
- payout status
- charity filtering
- frequently queried relationships

Do not create indexes on every column.

Every significant index should have a query reason.

---

## 2. QUERY PERFORMANCE

Avoid:

- N+1 queries
- repeated identical queries
- unnecessary full-table reads
- fetching unused columns
- loading huge datasets into memory

Use:

- pagination
- filtering
- selective queries
- appropriate joins
- aggregation where useful

Inspect generated queries when performance matters.

---

## 3. PAGINATION

Never assume database tables remain small.

Administrative lists should support pagination when growth is possible.

Consider pagination for:

- users
- scores/history
- draws
- winners
- charities
- payouts
- audit records

---

## 4. REPORTING

Reporting queries should not unnecessarily disrupt transactional operations.

If analytics become expensive:

consider:

- optimized queries
- materialized views
- reporting projections
- caching
- background aggregation

Do not introduce complexity until actual requirements justify it.

---

## 5. MIGRATIONS

Every schema change must use a migration.

A migration must be:

- reproducible
- ordered
- reviewable
- safe
- reversible where practical

Do not manually edit production schema and forget to record the change.

---

## 6. MIGRATION SAFETY

Before a migration:

1. inspect existing data
2. inspect consumers
3. identify breaking changes
4. determine migration order
5. consider rollback
6. test against realistic data

Do not delete or rename critical columns without understanding the impact.

---

## 7. SEED DATA

Seed data must be clearly separated from production data.

Never place fake credentials or accidental test secrets into production seeds.

Use seed data to support:

- local development
- automated tests
- staging/demo environments

---

## 8. DATABASE TESTING

Test:

- constraints
- unique rules
- ownership
- foreign keys
- state transitions
- transaction behavior
- duplicate requests
- invalid input

Important business rules must have database/integration coverage where
application logic alone cannot guarantee them.

---

## 9. SCORE TESTING

Verify:

1
→ valid

45
→ valid

0
→ invalid

46
→ invalid

same user + same date
→ rejected

different user + same date
→ allowed

New sixth score
→ correct rolling behavior

The exact retention interpretation must follow the documented assumption
when the PRD requires clarification.

---

## 10. MONEY TESTING

Test:

- exact calculations
- rounding
- splitting
- zero-value edge cases where applicable
- multiple winners
- rollover
- currency handling

Never rely only on UI testing for financial calculations.

---

## 11. DATABASE SECURITY TESTING

Test:

User A
→ cannot read User B private records

Subscriber
→ cannot perform admin operations

Unauthorized request
→ rejected

Admin
→ authorized operation succeeds

Private file reference
→ unauthorized access rejected

---

## 12. BACKUP & RECOVERY THINKING

For production deployment consider:

- backup strategy
- restore strategy
- recovery expectations
- migration recovery
- data-loss risk

Do not assume backups exist simply because the database is hosted by a
managed provider.

Document deployment-specific assumptions.

---

## 13. DATA RETENTION

Do not keep data forever by default.

For each important category consider:

- operational need
- audit need
- legal/business requirement
- storage cost
- deletion requirements

Do not invent legal retention requirements.

Document product assumptions separately.

---

## 14. DATABASE DOCUMENTATION

`docs/DATABASE-DESIGN.md` should describe:

- entities
- fields
- relationships
- constraints
- indexes
- ownership
- lifecycle
- important queries
- money representation
- security policies
- audit/history
- migration strategy

Keep the document synchronized with implementation.

---

## 15. SCHEMA REVIEW

Before major implementation ask:

Can another engineer understand the schema?

Are relationships obvious?

Are business constraints protected?

Are ownership boundaries clear?

Are important indexes present?

Are financial records protected?

Are historical records preserved where needed?

Are state transitions enforceable?

If not, improve the schema before building more features.

---

## 16. DATABASE DEFINITION OF DONE

A database feature is NOT complete merely because a row can be inserted.

Verify:

[ ] Schema documented
[ ] Ownership defined
[ ] Constraints defined
[ ] Foreign keys defined
[ ] Unique rules defined
[ ] Indexes considered
[ ] Security policies considered
[ ] State transitions defined
[ ] Transaction needs considered
[ ] Idempotency considered
[ ] Migration created
[ ] Integration tests added
[ ] Error behavior verified
[ ] Performance considered
[ ] Documentation updated

---

## 17. FINAL DATABASE PRINCIPLE

The database is not a passive storage layer.

It is part of the product's correctness boundary.

The database must help protect:

- identity
- ownership
- business invariants
- financial correctness
- state consistency
- historical integrity

Do not move every rule into the database,
but do not leave critical integrity entirely to the frontend or application
layer either.

The final database should be:

correct
+
secure
+
auditable
+
performant
+
maintainable
+
scalable.
