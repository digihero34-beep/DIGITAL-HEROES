---
trigger: always_on
---

# Testing and Verification Rules

Testing is mandatory.

Never claim that something works without verification.

## Before completion

Run:

1. Formatter
2. Linter
3. Type checker
4. Unit tests
5. Integration tests
6. Production build

Use the project's actual package scripts.

Do not invent commands.

## Business logic tests

Prioritize tests for:

### Scores

- valid score
- score below minimum
- score above maximum
- duplicate date
- editing
- deletion
- five-score limit
- oldest-score replacement
- chronological ordering

### Draw

- 3-match
- 4-match
- 5-match
- no winners
- multiple winners
- jackpot rollover
- pool calculation
- deterministic simulation
- published draw immutability

### Charity

- minimum contribution
- increased contribution
- invalid percentage
- charity selection
- unavailable charity

### Winner verification

- eligible winner
- invalid submission
- admin approval
- admin rejection
- pending payout
- completed payout
- unauthorized access

### Subscription

- active
- inactive
- cancelled
- expired
- renewal
- webhook duplication

## Regression testing

After fixing a bug:

1. Reproduce the bug.
2. Write a regression test.
3. Fix the implementation.
4. Run the regression test.
5. Run the complete relevant test suite.

Never fix a recurring bug without adding a test when practical.

## Final verification

Before saying complete, report:

- Tests executed
- Tests passed
- Tests failed
- Build result
- Known limitations