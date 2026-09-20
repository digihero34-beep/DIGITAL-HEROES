# Digital Heroes — Objective Acceptance Criteria

> **Document Type**: Formal Acceptance Criteria & Test Verification Scenarios  
> **Format**: Gherkin / Given-When-Then Objective Assertions  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  

---

## 1. Subscriptions & Access Control (§ 04)

### AC-SUB-01: Plan Selection & Price Calculation
- **Precondition**: User is viewing the `/pricing` page.
- **Action**: User inspects Monthly and Yearly plans.
- **Expected Result**: Monthly shows £20.00/month; Yearly shows £192.00/year (20% discounted equivalent of £16.00/month). Currency is GBP.
- **Failure Condition**: Any price discrepancy, missing discount explanation, or floating point calculation error.

### AC-SUB-02: Stripe Checkout Initiation
- **Precondition**: User is authenticated and selects "Subscribe to Monthly".
- **Action**: User clicks the checkout CTA.
- **Expected Result**: System invokes `createCheckoutSessionAction()`, creates Stripe session, and redirects user to Stripe's secure hosted payment URL.
- **Failure Condition**: Unauthenticated user redirected without auth prompt; server error creating session; invalid price ID passed to Stripe.

### AC-SUB-03: Restricted Access Paywall for Non-Subscribers
- **Precondition**: User is logged in but has an inactive or canceled subscription.
- **Action**: User navigates to `/dashboard/scores` or attempts to submit a score.
- **Expected Result**: User is redirected to `/pricing` with an alert banner: "Active membership required to access golf performance tracking and monthly draws."
- **Failure Condition**: User can view score entry form or submit score via API.

### AC-SUB-04: Webhook-Driven Subscription Activation
- **Precondition**: Stripe emits `checkout.session.completed` for a user.
- **Action**: Webhook endpoint `/api/webhooks/stripe` receives and validates HMAC signature.
- **Expected Result**: Webhook records event in `stripe_webhook_events`, inserts row in `subscriptions` with `status = 'active'`, sets `current_period_end`. User immediately gains access to dashboard.
- **Failure Condition**: Webhook processed without signature check; duplicate webhook creates duplicate subscription record; status remains inactive.

---

## 2. Golf Score Management (§ 05)

### AC-SCR-01: Stableford Score Range Validation
- **Precondition**: Active subscriber is on the score entry form.
- **Action**: User enters an invalid score (e.g. 0 or 46 or 35.5) and clicks Submit.
- **Expected Result**: Form highlights field in red with message "Score must be a whole number between 1 and 45". No network request sent; if sent directly via API, server action throws `ValidationError`.
- **Failure Condition**: Score < 1 or > 45 successfully inserted into database.

### AC-SCR-02: Duplicate Date Rejection
- **Precondition**: Subscriber already has an active score recorded for `2026-03-15`.
- **Action**: Subscriber attempts to submit another score for `2026-03-15`.
- **Expected Result**: Server action fails with conflict error: "A score has already been entered for this date. You may edit or delete the existing entry." Database `UNIQUE(user_id, played_date)` constraint protects data integrity.
- **Failure Condition**: Two scores exist in database for the same user on the same date.

### AC-SCR-03: Rolling Five-Score FIFO Replacement
- **Precondition**: Subscriber currently has 5 active scores in their profile.
- **Action**: Subscriber submits a 6th score for a more recent date.
- **Expected Result**:
  1. The new score is saved and marked `is_active = true`.
  2. The oldest of the previous 5 scores has `is_active` set to `false`.
  3. The active scorecard display renders strictly the 5 newest scores.
  4. The UI displays an alert confirming the replacement.
- **Failure Condition**: Active score count exceeds 5; oldest score remains active; newer score fails to display.

### AC-SCR-04: Reverse Chronological Display
- **Precondition**: Subscriber has multiple scores entered with dates `2026-03-01`, `2026-03-10`, and `2026-03-05`.
- **Action**: Subscriber views the scorecard widget.
- **Expected Result**: Scores render in exact order: `2026-03-10` first, `2026-03-05` second, `2026-03-01` third.
- **Failure Condition**: Scores sorted ascending by date or sorted by creation timestamp.

---

## 3. Draw Engine & Prize Pool (§ 06, § 07)

### AC-DRW-01: Draw Number Generation Integrity
- **Precondition**: Admin initiates a draw in either Random or Algorithmic mode.
- **Action**: System executes number generation.
- **Expected Result**:
  1. Exactly 5 numbers are selected.
  2. All 5 numbers are integers between 1 and 45.
  3. All 5 numbers are strictly unique (zero duplicates).
  4. Array is stored sorted in ascending order.
- **Failure Condition**: Any drawn number outside 1–45; duplicate numbers in drawn set; count != 5.

### AC-DRW-02: Draw Simulation vs Publication
- **Precondition**: Admin configures Draw #5.
- **Action**: Admin clicks "Run Simulation".
- **Expected Result**: System previews winning numbers and projected winner counts in an ephemeral drawer. Status of draw remains `draft` or `simulated`. No rows created in `public.winners`.
- **Failure Condition**: Simulation creates permanent winner records or updates public prize counters.

### AC-DRW-03: Score-to-Draw Matching Logic
- **Precondition**: Draw is published with winning numbers `[12, 18, 24, 32, 40]`.
- **Action**: System evaluates a subscriber with active scores `[12, 18, 24, 32, 44]`.
- **Expected Result**: System computes set intersection: 4 matched numbers (`[12, 18, 24, 32]`). User is classified as `MATCH_4` winner and receives their share of the 35% Tier 4 prize pool.
- **Failure Condition**: Incorrect match count calculated; user matched 4 numbers but placed in Tier 3 or Tier 5.

### AC-DRW-04: Prize Pool Tier Allocations & Rollover
- **Precondition**: Base prize pool for monthly draw is £10,000.00. Previous draw had zero 5-match winners and £4,000.00 rollover.
- **Action**: Draw is published with zero 5-match winners, two 4-match winners, and twenty 3-match winners.
- **Expected Result**:
  - Tier 5 (40% of base + rollover) = £4,000 + £4,000 = £8,000.00. Carried forward as rollover to next draw.
  - Tier 4 (35% of base) = £3,500.00. Split equally: £1,750.00 each to the two winners.
  - Tier 3 (25% of base) = £2,500.00. Split equally: £125.00 each to the twenty winners.
  - Tier 4/3 do not roll over (PRD: Rollover = No).
- **Failure Condition**: Rollover applied to Tier 4 or 3; rounding error loses pennies; Tier 5 rollover lost.

---

## 4. Charity Integration (§ 08)

### AC-CHR-01: Minimum 10% Contribution Enforcement
- **Precondition**: User is in the charity settings portal.
- **Action**: User attempts to set contribution slider below 10% (e.g. 5%) or submits payload directly.
- **Expected Result**: UI slider enforces minimum position of 10%. Server action rejects payload with error: "Minimum charity contribution is 10%".
- **Failure Condition**: Contribution percentage under 10% accepted by server.

### AC-CHR-02: Voluntary Contribution Increase
- **Precondition**: Subscriber adjusts slider to 30%.
- **Action**: Subscriber clicks "Save Charity Preferences".
- **Expected Result**: Preference updated in `user_charity_preferences`. Projected monthly donation updates to £6.00 (30% of £20).
- **Failure Condition**: Percentage fails to persist; calculation does not reflect updated percentage.

---

## 5. Winner Verification & Payouts (§ 09)

### AC-WIN-01: Verification Restriction to Winners Only
- **Precondition**: User did not match >= 3 numbers in the published draw.
- **Action**: User navigates to `/dashboard/claim/[id]`.
- **Expected Result**: Page renders 404 Not Found or Access Denied. Upload form is unavailable.
- **Failure Condition**: Non-winner able to view or submit verification proof.

### AC-WIN-02: Scorecard Proof Screenshot Upload
- **Precondition**: Winning subscriber navigates to claim portal.
- **Action**: User uploads valid PNG screenshot (< 10MB) showing round score.
- **Expected Result**: File stored in private bucket `winner-proofs`. Row inserted into `winner_verifications`. Winner verification status updates to `submitted`.
- **Failure Condition**: Upload fails on valid image; non-image file accepted; file stored publicly.

### AC-WIN-03: Admin Review & Payout Lifecycle
- **Precondition**: Winner verification is in `submitted` status.
- **Action 1**: Admin reviews screenshot in `/admin/winners` and clicks "Approve".
- **Expected Result 1**: Verification status moves to `approved`. A payout record is created in `payouts` with status `pending`.
- **Action 2**: Admin executes bank transfer, enters reference `TX-2026-01`, and clicks "Mark as Paid".
- **Expected Result 2**: Payout status moves to `paid`, `paid_at` timestamp recorded. User dashboard displays prize as "Paid" with reference code.
- **Failure Condition**: Client can mark itself paid; payout marked paid without approval.
