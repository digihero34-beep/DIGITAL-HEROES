# DIGITAL HEROES — DATABASE STANDARD
# PART 1 — DATA MODEL & SCHEMA DESIGN

## 1. DATABASE FIRST

Do not create tables randomly while implementing UI.

Before implementing major database functionality:

1. Read the relevant PRD requirement.
2. Identify the domain owner.
3. Identify entities.
4. Identify relationships.
5. Identify lifecycle/state.
6. Identify ownership.
7. Identify constraints.
8. Identify indexes.
9. Identify audit/history needs.
10. Document ambiguities.

Create:

docs/DATABASE-DESIGN.md

before major schema implementation.

---

## 2. DOMAIN-OWNED DATA

Organize data around business domains.

Expected areas include:

- users
- profiles
- subscriptions
- plans
- scores
- draws
- draw results
- prize pools
- winners
- winner verification
- payouts
- charities
- charity contributions
- administration
- audit history

Do not create unrelated generic tables without a domain reason.

---

## 3. ENTITY OWNERSHIP

Every table must have a clear purpose.

Before creating a table ask:

- What business concept does this represent?
- Which domain owns it?
- Who can create it?
- Who can modify it?
- Who can read it?
- What is its lifecycle?
- Is history required?

Avoid tables that exist only because a UI component needs one.

---

## 4. NORMALIZATION

Use normalized relational design unless denormalization has a demonstrated
performance or reporting reason.

Avoid:

- duplicated user data
- duplicated business rules
- repeated values that should be referenced
- storing multiple unrelated concepts in one column

Denormalize only deliberately and document why.

---

## 5. PRIMARY KEYS

Use stable primary keys.

Do not use business display values as primary keys.

Business identifiers and database identifiers should be conceptually separate.

---

## 6. FOREIGN KEYS

Use referential integrity for relationships.

Important relationships should use foreign keys where appropriate.

Do not depend solely on application code to maintain relationships.

---

## 7. UNIQUE CONSTRAINTS

Use database uniqueness for business rules that require uniqueness.

Example from the PRD:

Only one score is permitted per user for a given date.

This should not rely only on:

"check first, then insert."

Use an appropriate unique constraint.

---

## 8. SCORE DATA MODEL

Score records should contain enough information to support:

- user ownership
- score value
- score date
- timestamps
- modification history where needed

The PRD requires:

- Stableford score range 1–45
- date
- one score per date
- latest five retained
- newest first display

Database design must support these rules safely.

---

## 9. MONEY

Do not store monetary values as floating-point numbers.

Choose an appropriate:

- integer smallest currency unit
or
- exact decimal representation

Document the decision.

Use explicit currency where required.

---

## 10. ENUMS / STATUS VALUES

Business state values must be consistent.

Avoid random strings throughout the codebase.

Examples:

subscription_status
winner_status
draw_status
payout_status

Use the database/framework's appropriate enum or constrained-value mechanism.

Do not allow arbitrary invalid states.

---

## 11. NULLABILITY

Do not make every column nullable.

For each field decide:

Required
or
Optional

Null should have meaningful semantics.

Do not use null merely because the application has not decided what a field
means.

---

## 12. TIMESTAMPS

Important entities should generally track appropriate timestamps.

Examples:

created_at
updated_at

Lifecycle-specific records may also need:

published_at
approved_at
paid_at
cancelled_at

Use consistent timezone handling.

Do not mix incompatible timestamp conventions.

---

## 13. AUDIT VS CURRENT STATE

Separate current operational state from historical/audit information when
necessary.

Example:

Winner current state:
approved

History:
who approved
when approved
previous state
reason

Do not destroy critical historical information merely to simplify the schema.

---

## 14. SCHEMA CLARITY

Table and column names should clearly represent business meaning.

Avoid:

data1
value2
status3
misc
temp

Names should be understandable to another engineer.
