# Digital Heroes — Quality Assurance & Test Strategy

> **Document Type**: Comprehensive Testing Architecture, Test Matrix & Verification Protocols  
> **Tooling Stack**: Vitest (Unit & Integration), Playwright (End-to-End & Visual QA)  
> **Rule Compliance**: Testing & Verification Rules (`testing.md`), Architecture Standard Part 3 § 1–4  

---

## 1. Test Pyramid Architecture

The testing philosophy guarantees that critical business invariants are validated at the lowest, fastest layer possible, while complete multi-step journeys are verified via browser automation:

```
          / \
         /   \      E2E User Journeys (Playwright)
        / E2E \     - Public Signup & Stripe Checkout
       /───────\    - Score Entry & FIFO UI Updates
      /         \   - Admin Draw Simulation & Publication
     / Integrat. \  Integration Tests (Database + RLS + DAL)
    /─────────────\ - RLS isolation policies
   /     Unit      \ - Atomic transaction rollbacks
  /─────────────────\ Pure Domain Tests (Vitest)
                      - Score range, FIFO rolling math
                      - Draw generation, matching, prize split
```

---

## 2. Unit Testing Strategy (Domain Engines)

Unit tests run in milliseconds using **Vitest** with zero external dependencies, testing pure mathematical and logical functions:

### 2.1 Score Engine Tests (`tests/unit/scores.test.ts`)
- [ ] `should accept valid score values in range 1 to 45`
- [ ] `should reject score of 0 with RangeError`
- [ ] `should reject score of 46 with RangeError`
- [ ] `should reject negative score values (-5) with RangeError`
- [ ] `should reject fractional scores (36.5) with IntegerError`
- [ ] `should reject dates in the future beyond today's date`
- [ ] `should correctly add 1st, 2nd, 3rd, 4th, and 5th score to active set`
- [ ] `should replace oldest score when 6th score is added (FIFO rolling behavior)`
- [ ] `should correctly sort active scores in reverse chronological order (newest first)`
- [ ] `should reject insertion of score with duplicate date for same user`

### 2.2 Draw Engine Tests (`tests/unit/draws.test.ts`)
- [ ] `should generate exactly 5 numbers between 1 and 45 in random mode`
- [ ] `should ensure all 5 drawn numbers are distinct (no duplicates)`
- [ ] `should generate numbers sorted ascending`
- [ ] `should bias draw towards high-frequency scores in algorithmic mode`
- [ ] `should handle unpicked scores gracefully in algorithmic mode using Laplace smoothing`
- [ ] `should match user score set against draw: 5 matches -> MATCH_5`
- [ ] `should match user score set against draw: 4 matches -> MATCH_4`
- [ ] `should match user score set against draw: 3 matches -> MATCH_3`
- [ ] `should match user score set against draw: 2 matches -> NO_MATCH`
- [ ] `should handle duplicate score entries in user set without double-counting matches against distinct draw balls`

### 2.3 Prize Pool & Rollover Tests (`tests/unit/prizes.test.ts`)
- [ ] `should calculate 40% Tier 5, 35% Tier 4, and 25% Tier 3 from base pool`
- [ ] `should add incoming rollover strictly to Tier 5 jackpot`
- [ ] `should divide tier pool equally among multiple winners`
- [ ] `should allocate remainder pennies deterministically without creating or losing currency` (e.g. £100 split 3 ways = [£33.34, £33.33, £33.33])
- [ ] `should roll forward 100% of Tier 5 jackpot if 0 winners match 5 numbers`
- [ ] `should NOT roll forward Tier 4 or Tier 3 pool when 0 winners occur (PRD: Rollover = No)`

### 2.4 Charity Engine Tests (`tests/unit/charity.test.ts`)
- [ ] `should accept 10% minimum contribution percentage`
- [ ] `should accept voluntary contribution percentages up to 100%`
- [ ] `should reject contribution percentage below 10% (e.g. 9%) with InvalidPercentageError`
- [ ] `should calculate exact monthly charity deduction in integer cents`

---

## 3. Integration Testing Strategy (Database & DAL)

Integration tests execute against a localized Supabase test container using Vitest:

### 3.1 Database Invariants & Constraints (`tests/integration/db-constraints.test.ts`)
- [ ] `should enforce UNIQUE(user_id, played_date) constraint on scores table`
- [ ] `should enforce CHECK (score >= 1 AND score <= 45) on scores table`
- [ ] `should enforce CHECK (contribution_percentage >= 10) on user_charity_preferences`
- [ ] `should execute atomic rollback if winner generation fails during draw publish`

### 3.2 Row-Level Security Policies (`tests/security/rls-isolation.test.ts`)
- [ ] `User A cannot read User B's score records`
- [ ] `User A cannot read User B's winner records or payouts`
- [ ] `Anonymous visitor cannot read draft or simulated draws`
- [ ] `Non-admin user cannot access admin control endpoints (403 Forbidden)`
- [ ] `Non-admin user cannot update profiles.role column`

### 3.3 Stripe Webhook Processing (`tests/integration/stripe-webhook.test.ts`)
- [ ] `should successfully process valid checkout.session.completed and activate subscription`
- [ ] `should reject webhook with invalid HMAC signature with HTTP 400`
- [ ] `should achieve idempotency: replaying same event ID returns HTTP 200 without duplicate database inserts`
- [ ] `should transition subscription to past_due on invoice.payment_failed`

---

## 4. End-to-End Testing Strategy (Playwright)

Playwright tests simulate complete human user workflows across desktop and mobile viewports:

| Test Suite | Spec File | Verification Steps |
| :--- | :--- | :--- |
| **E2E-01: Public Discovery & Signup** | `tests/e2e/signup.spec.ts` | 1. Visits `/`<br>2. Browses charity directory<br>3. Selects Monthly plan on `/pricing`<br>4. Fills registration form<br>5. Verifies redirect to Stripe mock. |
| **E2E-02: Scorecard Management** | `tests/e2e/scores.spec.ts` | 1. Logs in as subscriber<br>2. Enters score 38 on today's date<br>3. Enters 4 more scores<br>4. Enters 6th score<br>5. Asserts oldest score slides to archive and 5 active cards remain. |
| **E2E-03: Admin Draw Publishing** | `tests/e2e/draw-publish.spec.ts` | 1. Logs in as admin<br>2. Navigates to `/admin/draws`<br>3. Selects Algorithmic mode and runs simulation<br>4. Confirms publication dialog<br>5. Asserts draw status changes to `published`. |
| **E2E-04: Winner Claim Flow** | `tests/e2e/winner-claim.spec.ts` | 1. Logs in as winning user<br>2. Clicks winner banner on dashboard<br>3. Uploads scorecard screenshot PNG<br>4. Asserts status changes to `Submitted`<br>5. Admin logs in, reviews proof, approves<br>6. Asserts payout moves to `Pending`. |
| **E2E-05: Responsive & Accessibility** | `tests/e2e/a11y-responsive.spec.ts` | 1. Executes Axe-core automated accessibility scan on all pages (zero critical WCAG 2.1 AA violations)<br>2. Tests navigation and forms on mobile (375px) and tablet (768px). |

---

## 5. Execution Protocol & Completion Standard

In strict accordance with the Testing Rules:
1. `npm run test` executes all unit and integration suites.
2. `npm run test:e2e` executes Playwright end-to-end suites.
3. `npm run lint` and `npm run typecheck` run before any build.
4. **No feature is declared complete without documented, actual test pass execution output.**
