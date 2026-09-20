# Digital Heroes — Domain Architecture Specification

> **Document Type**: Domain-Driven Design & Bounded Contexts Specification  
> **Rule Compliance**: Architecture Industrial Standard Part 1 § 4 ("Domain-First Organization")  
> **Architectural Pattern**: Clean Modular Monolith with Explicit Bounded Contexts  

---

## 1. Domain Architecture Overview

To eliminate monolithic spaghetti code and prevent business logic from leaking into UI components or raw database queries, the Digital Heroes platform is structured into **11 explicit business domains**.

Each domain owns its private data, encapsulates its invariants, exposes a strictly typed public interface, and enforces explicit security boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (UI)                         │
│   Public Pages  │  Subscriber Dashboard  │  Admin Control Surfaces    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       APPLICATION SERVICE LAYER                        │
│   Use Case Orchestration  │  Transaction Boundaries  │  Event Bus     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN MODULES                              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ │
│ │  Auth & User  │ │ Subscriptions │ │  Golf Scores  │ │ Draw Engine  │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────┘ │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ │
│ │  Prize Pools  │ │   Charities   │ │ Winner Verif  │ │   Payouts    │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────┘ │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                  │
│ │   Admin Ops   │ │ Notifications │ │ Audit & Stats │                  │
│ └───────────────┘ └───────────────┘ └───────────────┘                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE & PERSISTENCE                      │
│   Supabase Postgres  │  Stripe SDK  │  Supabase Storage  │  Resend/Log │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bounded Context Specifications

### 2.1 Domain: Identity & Access (Auth)
- **Purpose**: Authenticate user identity, establish security contexts, and issue tamper-proof session tokens.
- **Responsibilities**: User signup, email/password login, password resets, session verification, JWT validation, and RBAC role assignment (`public`, `subscriber`, `admin`).
- **Owned Data**: Supabase Auth identities (`auth.users`), auth metadata.
- **Public Operations**: `signUp()`, `signIn()`, `signOut()`, `resetPassword()`, `getSession()`, `requireAuth()`, `requireAdmin()`.
- **Internal Operations**: Token rotation, session cookie encryption, password hashing (managed by Supabase Auth).
- **Dependencies**: Supabase GoTrue engine.
- **Security Boundary**: Server-side only; verified on every Server Action and Route Handler.
- **Persistence Boundary**: `auth.users` schema in PostgreSQL.
- **Testing Boundary**: Mock auth sessions, expired token rejection, unauthorized role escalation prevention.
- **Major Business Rules**: Every request to subscriber or admin features must validate an active authenticated session.
- **Likely Failure Modes**: Expired tokens, network timeout to auth service, session cookie corruption.

---

### 2.2 Domain: Users & Profiles
- **Purpose**: Maintain subscriber profile information, contact details, display names, and onboarding status.
- **Responsibilities**: Sync profile upon signup, manage user settings, validate profile edits.
- **Owned Data**: `profiles` table (`id`, `user_id`, `email`, `full_name`, `avatar_url`, `role`, `created_at`, `updated_at`).
- **Public Operations**: `getProfile(userId)`, `updateProfile(userId, data)`, `getUserRole(userId)`.
- **Internal Operations**: Seed initial profile from `auth.users` via trigger.
- **Dependencies**: Identity & Access domain.
- **Security Boundary**: Users may only read and modify their own profile; Admins may read/update any profile.
- **Persistence Boundary**: `public.profiles`.
- **Testing Boundary**: User A cannot view or update User B's profile.
- **Major Business Rules**: `role` cannot be updated by normal users; defaults to `subscriber`.
- **Likely Failure Modes**: Duplicate email, missing profile row on auth signup trigger race condition.

---

### 2.3 Domain: Subscriptions & Billing
- **Purpose**: Manage recurring billing plans, payment gateway integration, subscription lifecycles, and access gates.
- **Responsibilities**: Plan definitions (monthly and discounted yearly), Stripe checkout session generation, Stripe webhook processing, subscription status synchronization, cancellation handling, and lapsed grace periods.
- **Owned Data**: `plans`, `subscriptions`, `stripe_webhook_events`.
- **Public Operations**: `listPlans()`, `createCheckoutSession(userId, planId)`, `createBillingPortalSession(userId)`, `getSubscriptionStatus(userId)`, `isSubscriberActive(userId)`.
- **Internal Operations**: `syncStripeSubscription(eventPayload)`, `handleInvoicePaymentFailed(eventPayload)`, `handleSubscriptionCanceled(eventPayload)`.
- **Dependencies**: Stripe API, Profiles domain.
- **Security Boundary**: Webhook signatures cryptographically verified; client cannot set subscription status.
- **Persistence Boundary**: `public.subscriptions`, `public.plans`, `public.stripe_webhook_events`.
- **Testing Boundary**: Unit tests for plan pricing math; integration tests for Stripe webhook idempotency and state transitions (`active`, `past_due`, `canceled`).
- **Major Business Rules**: Only active subscribers can enter scores, participate in draws, or claim prizes. Real-time status checked on protected actions.
- **Likely Failure Modes**: Webhook replay, out-of-order webhook delivery, failed recurring payment card charge.

---

### 2.4 Domain: Golf Scores
- **Purpose**: Capture, validate, retain, and serve player Stableford scores under the rolling five-score constraint.
- **Responsibilities**: Score input validation, duplicate date enforcement, rolling FIFO replacement (maximum 5 active scores), reverse-chronological ordering, and score edits/deletions.
- **Owned Data**: `scores` table (`id`, `user_id`, `score`, `played_date`, `is_active`, `created_at`, `updated_at`).
- **Public Operations**: `addScore(userId, score, date)`, `updateScore(userId, scoreId, score, date)`, `deleteScore(userId, scoreId)`, `getUserScores(userId)`.
- **Internal Operations**: `recalculateRollingScores(userId)`: Ensures exactly the latest 5 submitted scores have `is_active = true`.
- **Dependencies**: Users domain, Subscriptions domain (user must be active subscriber).
- **Security Boundary**: Subscriber can only add, edit, or delete their own scores; Admin can audit/edit.
- **Persistence Boundary**: `public.scores`.
- **Testing Boundary**: Range validation (1–45), duplicate date rejection, 6th score oldest-replacement algorithm, reverse-chronological sort.
- **Major Business Rules**: Score must be an integer between 1 and 45. Date must be valid. Only 1 score per user per date. Exactly latest 5 scores retained for active play.
- **Likely Failure Modes**: Concurrent score submission for identical date; out-of-order date entries.

---

### 2.5 Domain: Draw Engine
- **Purpose**: Execute monthly prize draws, generate winning numbers according to configured modes (Random vs Algorithmic), simulate outcomes, and publish immutable results.
- **Responsibilities**: Number generation (5 distinct numbers from 1–45), draw configuration, dry-run simulation, score frequency weighting calculation, matching algorithm, and permanent result publication.
- **Owned Data**: `draws`, `draw_simulations`.
- **Public Operations**: `getLatestDraw()`, `getDrawById(drawId)`, `listPastDraws()`, `runSimulation(drawId, mode, seed)`, `publishDraw(drawId, adminUserId)`.
- **Internal Operations**: `drawRandomNumbers()`, `calculateScoreWeights()`, `drawAlgorithmicNumbers()`, `matchScoresForDraw(drawId, drawnNumbers)`.
- **Dependencies**: Golf Scores domain, Subscriptions domain (eligible active participants).
- **Security Boundary**: Only Admins can configure, simulate, or publish draws. Published draws are strictly immutable.
- **Persistence Boundary**: `public.draws`, `public.draw_simulations`.
- **Testing Boundary**: Randomness distribution, algorithmic frequency weighting, matching logic (5, 4, 3 matches), idempotency of publication.
- **Major Business Rules**: 5 unique integers drawn from [1, 45]. Published draw cannot be re-run or mutated.
- **Likely Failure Modes**: Admin attempts to publish without simulation; database failure midway through winner generation transaction.

---

### 2.6 Domain: Prize Pools
- **Purpose**: Calculate total prize money from active subscriber revenue, enforce tier distribution percentages, handle unclaimed jackpot rollover, and divide prizes equally among winners.
- **Responsibilities**: Revenue-to-pool calculation, tier allocations (40% Tier 5, 35% Tier 4, 25% Tier 3), rollover balance tracking, multi-winner equal splitting with exact integer penny remainder preservation.
- **Owned Data**: `prize_pools` table (`id`, `draw_id`, `total_pool_cents`, `tier_5_pool_cents`, `tier_4_pool_cents`, `tier_3_pool_cents`, `rollover_in_cents`, `rollover_out_cents`, `currency`).
- **Public Operations**: `getPrizePoolForDraw(drawId)`, `getCurrentJackpotEstimate()`, `calculatePrizeSplit(tierPoolCents, winnerCount)`.
- **Internal Operations**: `allocateDrawPrizePool(drawId, activeSubscriberCount, subscriptionFeeCents, rolloverInCents)`.
- **Dependencies**: Subscriptions domain (subscriber count), Draw Engine (matching tiers).
- **Security Boundary**: All monetary amounts computed in server-side integer cents; zero client-controlled amounts.
- **Persistence Boundary**: `public.prize_pools`.
- **Testing Boundary**: Tier percentages sum to 100%; rollover carries forward only for Tier 5; zero-winner handling; multi-winner rounding.
- **Major Business Rules**: No floating point math. Rollover strictly applies to 5-match tier.
- **Likely Failure Modes**: Inconsistent subscriber count during calculation; integer truncation discrepancies.

---

### 2.7 Domain: Charities & Impact
- **Purpose**: Manage charity listings, showcase profiles and events, handle user charity preferences, validate contribution percentages, and process independent donations.
- **Responsibilities**: Charity directory search and filter, featured charity spotlight, subscriber charity selection, 10% minimum contribution validation, voluntary contribution increase, and direct donation checkout.
- **Owned Data**: `charities`, `user_charity_preferences`, `charity_donations`.
- **Public Operations**: `listCharities(filter)`, `getCharity(slug)`, `getFeaturedCharity()`, `selectCharity(userId, charityId, percentage)`, `createDirectDonation(userId, charityId, amountCents)`.
- **Internal Operations**: Calculate aggregated lifetime donations per charity.
- **Dependencies**: Subscriptions domain, Payments domain.
- **Security Boundary**: Public read access to active charities; subscriber access to own preference; admin CRUD for charities.
- **Persistence Boundary**: `public.charities`, `public.user_charity_preferences`, `public.charity_donations`.
- **Testing Boundary**: Contribution percentage >= 10%; direct donation Stripe checkout flow; directory search filtering.
- **Major Business Rules**: Contribution percentage cannot be set below 10%. Direct donations do not grant gameplay draw entries.
- **Likely Failure Modes**: Deleting a charity that is actively selected by subscribers; invalid percentage input.

---

### 2.8 Domain: Winners & Proof Verification
- **Purpose**: Identify winners upon draw publication, capture score verification proof screenshots, manage the administrative review workflow, and prevent fraudulent claims.
- **Responsibilities**: Winner row creation, proof upload handling (private storage), admin review interface (approve/reject with audit notes), and winner status transitions.
- **Owned Data**: `winners`, `winner_verifications`.
- **Public Operations**: `getWinnerByUser(userId, drawId)`, `getUserWinnings(userId)`, `uploadProofScreenshot(userId, winnerId, file)`.
- **Internal Operations**: `createWinnersForDraw(drawId, matchedSubscribers)`, `reviewWinnerProof(adminId, verificationId, status, notes)`.
- **Dependencies**: Draw Engine, Golf Scores domain, Storage Infrastructure.
- **Security Boundary**: Only designated winners can upload proof; only admins can approve/reject; proofs stored in private bucket accessed via signed URLs.
- **Persistence Boundary**: `public.winners`, `public.winner_verifications`.
- **Testing Boundary**: State machine transitions (`pending_proof` → `submitted` → `under_review` → `approved` / `rejected`); unauthorized upload rejection.
- **Major Business Rules**: Verification applies strictly to winners (3, 4, or 5 matches). Client cannot approve or advance its own verification state.
- **Likely Failure Modes**: Corrupted image upload; non-winner attempting proof injection; duplicate submissions.

---

### 2.9 Domain: Payouts
- **Purpose**: Track, authorize, and record the fulfillment of monetary prizes to verified winners.
- **Responsibilities**: Payout record lifecycle, transitioning approved winners from `Pending` to `Paid`, recording payout transaction references, and auditing admin fulfillment.
- **Owned Data**: `payouts` table (`id`, `winner_id`, `user_id`, `amount_cents`, `currency`, `status`, `processed_by`, `paid_at`, `transaction_ref`).
- **Public Operations**: `getUserPayouts(userId)`, `getPayoutByWinnerId(winnerId)`.
- **Internal Operations**: `createPendingPayout(winnerId)`, `markPayoutAsPaid(adminId, payoutId, transactionRef)`.
- **Dependencies**: Winners & Proof Verification domain, Identity domain.
- **Security Boundary**: Only Admins can execute payout status changes.
- **Persistence Boundary**: `public.payouts`.
- **Testing Boundary**: Transition guards (`pending` → `paid`); client forbidden from mutating payout state; idempotent updates.
- **Major Business Rules**: Payout can only be marked `Paid` after winner verification is `Approved`.
- **Likely Failure Modes**: Duplicate payment marking; invalid state jump from unverified to paid.

---

### 2.10 Domain: Administration & Governance
- **Purpose**: Provide comprehensive operational control across all 5 control surfaces defined in PRD § 11.
- **Responsibilities**: Platform-wide user management, score audits, draw configuration/simulation/publication, charity listing and media management, winner verification queues, and executive analytics.
- **Owned Data**: Administrative audit records, system configuration.
- **Public Operations**: `getAdminOverview()`, `adminListUsers()`, `adminUpdateUser()`, `adminListDraws()`, `adminGetAnalytics()`.
- **Internal Operations**: `logAdminAction(adminId, action, entity, details)`.
- **Dependencies**: All business domains.
- **Security Boundary**: Strict server-side RBAC: `role === 'admin'`. Frontend route guards backed by server-side gatekeepers.
- **Persistence Boundary**: `public.audit_logs`.
- **Testing Boundary**: Non-admin request to any `/admin/*` API returns 403 Forbidden.
- **Major Business Rules**: Every administrative mutation must generate an audit log entry.
- **Likely Failure Modes**: Privilege escalation attempt; stale admin session.

---

### 2.11 Domain: Notifications & Audit
- **Purpose**: Maintain immutable records of system events and communicate critical lifecycle updates to users.
- **Responsibilities**: Structured logging, winner notification emails, draw publication announcements, payment failure alerts, and immutable audit logs.
- **Owned Data**: `audit_logs`, notification logs.
- **Public Operations**: `getUserNotifications(userId)`.
- **Internal Operations**: `recordAuditEvent()`, `sendEmail()`.
- **Dependencies**: Infrastructure email adapter (Resend/Console).
- **Security Boundary**: Private audit records only visible to system and super-admins.
- **Persistence Boundary**: `public.audit_logs`.
- **Testing Boundary**: Event capture on draw publication, score edit, and payout.
- **Major Business Rules**: Audit logs are append-only.
- **Likely Failure Modes**: Email provider downtime (must not block primary database transactions).
