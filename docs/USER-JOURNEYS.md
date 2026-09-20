# Digital Heroes — Comprehensive User Journeys

> **Document Type**: End-to-End User Experience & Interaction Flows  
> **Rule Compliance**: Premium Product Design Master & Parts 1–4  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0, § 03, § 08, § 09, § 10, § 11  

---

## 1. Overview of Platform Journeys

Digital Heroes maps the human experience across four primary journeys, ensuring every step provides clear intent, immediate feedback, and transparent system states:

```
    [ Public Visitor ]  ──►  [ Subscriber ]  ──►  [ Winner ]
            │                      │                   │
      Discovery &            Scoring, Charity     Proof Upload &
      Subscription             & Draw Views          Payouts
            │                      │                   │
            └──────────────────────┼───────────────────┘
                                   │
                                   ▼
                          [ Administrator ]
                       Oversight, Simulation,
                       Publishing & Verification
```

---

## 2. Journey 1: Public Visitor (Discovery to Membership)

### 2.1 Narrative & Goal
A prospective member discovers Digital Heroes, understands that their golf scores can fund social impact while entering them into monthly prize draws, explores partner charities, and activates a recurring membership.

### 2.2 Journey Steps

| Step | Action | UI Surface | State / System Response | Next Step |
| :--- | :--- | :--- | :--- | :--- |
| **1. Discovery** | Lands on homepage from search or referral. | Hero Viewport (`/`) | Hero displays clear product narrative: "Turn your golf rounds into charitable impact and win up to £10,000 monthly." | Scrolls to How It Works or clicks "Explore Charities". |
| **2. Understanding** | Explores how golf scores link to draws and causes. | How It Works (`/how-it-works`) | Interactive diagram explains the triad: Play Golf (Stableford) → Choose Charity (10%+) → Enter Monthly Draw (5 Balls). | Clicks "View Directory". |
| **3. Charity Discovery** | Searches and filters the directory for a cause. | Directory (`/charities`) | Filter by cause category (e.g. Youth, Health). Clicks a card to view detailed profile with upcoming golf days. | Clicks "Choose This Charity & Join". |
| **4. Plan Selection** | Compares Monthly vs Discounted Yearly membership. | Pricing (`/pricing`) | Toggle shows Monthly (£20/mo) vs Annual (£192/yr, 20% discount). Clear breakdown of where money goes (Charity, Prize Pool). | Clicks "Subscribe Now". |
| **5. Registration** | Enters name, email, password, and confirms charity. | Register (`/register`) | Account provisioned. Redirects directly to Stripe Checkout. | Completes payment. |
| **6. Fulfillment** | Completes card payment on Stripe hosted checkout. | Stripe Hosted Page | Stripe emits webhook; server creates active subscription; redirects to `/dashboard?session_id=...`. | Subscriber Onboarding Dashboard. |

- **Entry Condition**: Anonymous public visitor.
- **Primary Goal**: Understand the product concept and complete paid registration.
- **Failure Cases**: Payment declined by bank, email already exists (inline error shown with password reset link).
- **Success State**: Active profile, verified email, `subscriptions.status = 'active'`, charity preference saved.
- **Authorization Boundary**: Transitions from `Public` to `Subscriber`.

---

## 3. Journey 2: Registered Subscriber (Engagement & Play)

### 3.1 Narrative & Goal
An active subscriber logs in to track their golf rounds, verify their active 5-score set, adjust their charitable contribution percentage, and review their participation in the upcoming monthly draw.

### 3.2 Journey Steps

| Step | Action | UI Surface | State / System Response | Next Step |
| :--- | :--- | :--- | :--- | :--- |
| **1. Authenticate** | Enters email & password. | Login (`/login`) | Authenticates session; middleware validates `subscriptions.status == 'active'`. | Lands on Dashboard (`/dashboard`). |
| **2. Dashboard Orientation** | Views active status, renewal date, and 5 scores. | Dashboard Header | Header displays green `ACTIVE` pill, next renewal date, and selected charity logo. | Clicks "Enter Score". |
| **3. Score Entry** | Enters Stableford score (e.g. 38) and selects date. | Score Widget (`/dashboard/scores`) | Form validates range (1–45) and checks date uniqueness. Clicks "Save Score". | Success banner. |
| **4. Rolling Score Sync** | System evaluates the 5-score rolling FIFO set. | Scorecards Grid | If user already had 5 scores, the oldest score is animated into the history archive; the new score is highlighted in the active set. | Views updated score average. |
| **5. Charity Management** | Adjusts voluntary contribution slider from 10% to 25%. | Charity Card (`/dashboard/charity`) | Slider shows estimated annual impact. Clicks "Update Allocation". Server confirms new percentage. | Returns to dashboard. |
| **6. Draw Participation** | Checks countdown to upcoming draw. | Draw Countdown Card | Card displays draw date, draw mode, active subscriber count, and estimated prize pool. | Awaits draw publication. |

- **Entry Condition**: Authenticated subscriber with active subscription.
- **Primary Goal**: Maintain golf scores and configure charity giving.
- **Failure Cases**:
  - Submitting duplicate score for existing date → Inline alert: "Score already exists for this date. Would you like to edit it?"
  - Submitting score outside 1–45 → Input validation highlights field in red.
  - Lapsed subscription → Dashboard redirects to `/pricing` with paywall warning.
- **Success State**: Database holds exactly 5 active scores sorted newest-first.

---

## 4. Journey 3: Winner (Claim to Fulfillment)

### 4.1 Narrative & Goal
A subscriber matches 3, 4, or 5 numbers in a published monthly draw, is notified of their win, submits official scorecard screenshot proof from their golf platform, and receives payment confirmation.

### 4.2 Journey Steps

| Step | Action | UI Surface | State / System Response | Next Step |
| :--- | :--- | :--- | :--- | :--- |
| **1. Win Detection** | Logs in after monthly draw publication. | Dashboard Notification | Golden banner: "Congratulations! You matched 4 numbers in Draw #12 and won £420.00!" | Clicks "Verify Your Scorecard". |
| **2. Verification Prompt** | Navigates to claim portal. | Claim Page (`/dashboard/claim/[winnerId]`) | Explains proof requirement: "Upload a screenshot from your golf handicap platform (e.g. Golfshot, GHIN, HowDidiDo) showing your round on 2026-03-14." | Selects file. |
| **3. Proof Submission** | Uploads scorecard PNG/JPEG or PDF (up to 10MB). | Proof Uploader Component | File validated for MIME type and size. Uploaded to private bucket. Winner status transitions to `Submitted`. | Views confirmation screen. |
| **4. In Review** | Waits while platform admin inspects submission. | Claim Status Tracker | Status badge displays `Under Review` with timestamp. | Receives email notification upon admin decision. |
| **5. Approval & Payout Pending** | Admin approves proof. | Claim Page | Status transitions to `Approved`. Payout status moves to `Pending`. | Awaits bank transfer. |
| **6. Prize Fulfillment** | Admin marks payout complete. | Winnings Dashboard (`/dashboard`) | Payout status transitions to `Paid`. Transaction reference displayed. Total lifetime winnings updated. | Journey complete. |

- **Entry Condition**: Subscriber with a winning record (`match_tier` IN `MATCH_5`, `MATCH_4`, `MATCH_3`).
- **Primary Goal**: Successfully submit proof and receive paid prize.
- **Failure Cases**:
  - Uploading corrupted or non-image file → Client rejects before upload.
  - Admin rejects submission (e.g. dates don't match) → Status moves to `Rejected` with admin feedback note; user given "Re-submit Proof" button.
- **Success State**: Verification `Approved`, Payout `Paid`, funds transferred.
- **Authorization Boundary**: Only the designated winner can upload proof. Only admin can approve.

---

## 5. Journey 4: Administrator (Operational Governance)

### 5.1 Narrative & Goal
A platform administrator oversees user accounts, configures and simulates monthly draws, publishes immutable results, reviews winner verification scorecards, and authorizes payouts.

### 5.2 Journey Steps

| Step | Action | UI Surface | State / System Response | Next Step |
| :--- | :--- | :--- | :--- | :--- |
| **1. Admin Login** | Signs in with elevated admin credentials. | Admin Gate (`/login`) | Server verifies `profiles.role === 'admin'`. Redirects to `/admin`. | Lands on Admin Console. |
| **2. Analytics Overview** | Reviews active subscriber count, total prize pools, and charity donations. | Admin Console (`/admin`) | High-density metric cards with real-time aggregates. | Clicks "Draw Management". |
| **3. Draw Configuration** | Selects draw mode: Random vs Algorithmic (Score Frequency Weighted). | Draw Console (`/admin/draws`) | Configures scheduled date and mode. System computes score frequency distribution. | Clicks "Run Simulation". |
| **4. Simulation Review** | Inspects simulated numbers, winner distributions, and prize splits. | Simulation Drawer | System renders projected winners: e.g. 0 at Tier 5, 2 at Tier 4 (£350 each), 18 at Tier 3 (£28 each). Rollover calculated. | Clicks "Publish Draw". |
| **5. Irreversible Publication** | Types "PUBLISH" into confirmation dialog. | Confirm Modal | Atomic SQL transaction runs: locks draw, sets numbers, generates `winners` rows, updates rollover balances, writes audit log. | Notification banners emitted. |
| **6. Winner Verification** | Inspects proof queue. | Verification Queue (`/admin/winners`) | Opens winner modal showing user's entered scores alongside uploaded screenshot. Clicks "Approve". | System creates pending payout. |
| **7. Payout Fulfillment** | Dispatches funds via bank/Stripe and enters reference code. | Payouts Console (`/admin/payouts`) | Enters transaction reference `TX-98412`. Clicks "Mark Paid". Status transitions to `Paid`. | Audit log recorded. |

- **Entry Condition**: Authenticated user with `role = 'admin'`.
- **Primary Goal**: Safely manage platform operations, run draws, and fulfill prizes.
- **Failure Cases**: Attempting to publish an already-published draw (blocked by database check constraint and server action guard).
- **Success State**: Published immutable draw, audited payouts, zero data discrepancies.
- **Authorization Boundary**: Protected by `requireAdmin()` on all routes and actions.
