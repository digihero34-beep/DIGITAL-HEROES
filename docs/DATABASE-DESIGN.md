# Digital Heroes — Database Architecture & Relational Schema Design

> **Document Type**: Exhaustive Relational Database Design Specification & DDL  
> **Target Database**: Supabase PostgreSQL 15+  
> **Rule Compliance**: Database Industrial Standard Master & Parts 1–3  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  

---

## 1. Database Design Philosophy

The database is not merely a passive record store; it is an active **integrity and correctness boundary**. All critical business invariants specified in the Digital Heroes PRD (score ranges, one score per date, rolling score limits, minimum charity percentages, tier distribution rules, and payout states) are enforced via:
- Strict Data Typing
- Foreign Key Constraints with deliberate cascade/restrict rules
- Check Constraints (`CHECK`)
- Unique Constraints (`UNIQUE`)
- Database Triggers for rolling invariants
- Explicit Status Enums

---

## 2. Entity-Relationship Diagram (Conceptual)

```
       auth.users (Supabase Identity)
             │ 1:1
             ▼
       public.profiles ◄──────────────────┐
        │        │                        │
   1:N  │        │ 1:1                    │
   ┌────┴───┐    ▼                        │
   ▼        ▼   public.subscriptions      │
scores  charity_prefs ──► charities       │
   │                              │       │
   │                              ▼       │
   │                        charity_donations
   │
   ▼
 draws ◄─── prize_pools
   │
   ├─► draw_simulations
   │
   ▼
 winners ◄── winner_verifications
   │
   ▼
 payouts
```

---

## 3. Enumerated Types (Enums)

```sql
-- User Roles
CREATE TYPE user_role AS ENUM ('public', 'subscriber', 'admin');

-- Subscription Billing Intervals
CREATE TYPE plan_interval AS ENUM ('month', 'year');

-- Subscription Lifecycle States (Stripe Aligned)
CREATE TYPE subscription_status AS ENUM (
    'incomplete',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'trialing'
);

-- Draw Configuration Mode
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');

-- Draw Lifecycle States
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published', 'cancelled');

-- Prize Match Tiers
CREATE TYPE match_tier AS ENUM ('MATCH_5', 'MATCH_4', 'MATCH_3');

-- Winner Verification Workflow States
CREATE TYPE verification_status AS ENUM (
    'pending_proof',
    'submitted',
    'under_review',
    'approved',
    'rejected'
);

-- Payout States (PRD § 09: Pending -> Paid)
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');
```

---

## 4. Detailed Table Specifications

### 4.1 Table: `profiles`
- **Purpose**: Application-level profile extending Supabase `auth.users`.
- **Ownership**: 1:1 with `auth.users`.
- **Columns**:
  - `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - `email`: `VARCHAR(255) NOT NULL UNIQUE`
  - `full_name`: `VARCHAR(150)`
  - `avatar_url`: `TEXT`
  - `role`: `user_role NOT NULL DEFAULT 'subscriber'`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_profiles_role` ON `profiles(role)`
  - `idx_profiles_email` ON `profiles(email)`

---

### 4.2 Table: `plans`
- **Purpose**: Subscription billing tiers (Monthly and Discounted Yearly).
- **Columns**:
  - `id`: `VARCHAR(50) PRIMARY KEY` (e.g. `'plan_monthly'`, `'plan_yearly'`)
  - `name`: `VARCHAR(100) NOT NULL` (e.g. `'Monthly Membership'`, `'Annual Membership'`)
  - `interval`: `plan_interval NOT NULL`
  - `amount_cents`: `INTEGER NOT NULL CHECK (amount_cents > 0)` (e.g. `2000` = £20.00)
  - `currency`: `VARCHAR(3) NOT NULL DEFAULT 'GBP'`
  - `stripe_price_id`: `VARCHAR(100) NOT NULL UNIQUE`
  - `is_active`: `BOOLEAN NOT NULL DEFAULT TRUE`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

### 4.3 Table: `subscriptions`
- **Purpose**: Real-time user subscription status and billing gateway synchronization.
- **Ownership**: Owned by `profiles`. 1:1 active subscription per user.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE RESTRICT`
  - `plan_id`: `VARCHAR(50) NOT NULL REFERENCES plans(id) ON DELETE RESTRICT`
  - `status`: `subscription_status NOT NULL DEFAULT 'incomplete'`
  - `stripe_customer_id`: `VARCHAR(100) NOT NULL`
  - `stripe_subscription_id`: `VARCHAR(100) NOT NULL UNIQUE`
  - `current_period_start`: `TIMESTAMPTZ NOT NULL`
  - `current_period_end`: `TIMESTAMPTZ NOT NULL`
  - `cancel_at_period_end`: `BOOLEAN NOT NULL DEFAULT FALSE`
  - `canceled_at`: `TIMESTAMPTZ`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_subscriptions_user` ON `subscriptions(user_id)`
  - `idx_subscriptions_status` ON `subscriptions(status)`
  - `idx_subscriptions_stripe_sub` ON `subscriptions(stripe_subscription_id)`

---

### 4.4 Table: `scores`
- **Purpose**: Stores player golf scores in Stableford format (PRD § 05).
- **Ownership**: Owned by `profiles`.
- **Invariants**:
  1. Score value must be strictly between 1 and 45.
  2. Only one score permitted per user per date.
  3. Only the latest 5 scores are active (`is_active = true`).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
  - `score`: `INTEGER NOT NULL CHECK (score >= 1 AND score <= 45)`
  - `played_date`: `DATE NOT NULL`
  - `is_active`: `BOOLEAN NOT NULL DEFAULT TRUE`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Constraints**:
  - `UNIQUE (user_id, played_date)` — guarantees zero duplicate scores on the same date.
- **Indexes**:
  - `idx_scores_user_active_date` ON `scores(user_id, is_active, played_date DESC)`
  - `idx_scores_user_date` ON `scores(user_id, played_date)`

---

### 4.5 Table: `draws`
- **Purpose**: Monthly prize draw records, execution modes, drawn numbers, and publication status (PRD § 06).
- **Ownership**: Governed by Administrators.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `draw_number`: `INTEGER NOT NULL UNIQUE` (sequential draw index: 1, 2, 3...)
  - `scheduled_for`: `TIMESTAMPTZ NOT NULL`
  - `draw_mode`: `draw_mode NOT NULL DEFAULT 'random'`
  - `status`: `draw_status NOT NULL DEFAULT 'draft'`
  - `winning_numbers`: `INTEGER[5]` (array of 5 distinct integers in range 1..45; NULL until published)
  - `published_at`: `TIMESTAMPTZ`
  - `published_by`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Constraints**:
  - `CHECK (winning_numbers IS NULL OR array_length(winning_numbers, 1) = 5)`
- **Indexes**:
  - `idx_draws_status_scheduled` ON `draws(status, scheduled_for DESC)`
  - `idx_draws_number` ON `draws(draw_number)`

---

### 4.6 Table: `draw_simulations`
- **Purpose**: Ephemeral or audit preview of draw simulations prior to publishing (PRD § 06).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `draw_id`: `UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE`
  - `simulated_numbers`: `INTEGER[5] NOT NULL`
  - `draw_mode`: `draw_mode NOT NULL`
  - `eligible_subscribers_count`: `INTEGER NOT NULL`
  - `match_5_count`: `INTEGER NOT NULL DEFAULT 0`
  - `match_4_count`: `INTEGER NOT NULL DEFAULT 0`
  - `match_3_count`: `INTEGER NOT NULL DEFAULT 0`
  - `projected_pool_cents`: `INTEGER NOT NULL`
  - `simulated_by`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

### 4.7 Table: `prize_pools`
- **Purpose**: Financial accounting for monthly prize pool distribution and rollover (PRD § 07).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `draw_id`: `UUID NOT NULL UNIQUE REFERENCES draws(id) ON DELETE RESTRICT`
  - `total_pool_cents`: `INTEGER NOT NULL CHECK (total_pool_cents >= 0)`
  - `base_contribution_cents`: `INTEGER NOT NULL CHECK (base_contribution_cents >= 0)`
  - `tier_5_pool_cents`: `INTEGER NOT NULL CHECK (tier_5_pool_cents >= 0)` -- 40% of base + rollover_in
  - `tier_4_pool_cents`: `INTEGER NOT NULL CHECK (tier_4_pool_cents >= 0)` -- 35% of base
  - `tier_3_pool_cents`: `INTEGER NOT NULL CHECK (tier_3_pool_cents >= 0)` -- 25% of base
  - `rollover_in_cents`: `INTEGER NOT NULL DEFAULT 0 CHECK (rollover_in_cents >= 0)`
  - `rollover_out_cents`: `INTEGER NOT NULL DEFAULT 0 CHECK (rollover_out_cents >= 0)`
  - `unclaimed_tier_4_cents`: `INTEGER NOT NULL DEFAULT 0`
  - `unclaimed_tier_3_cents`: `INTEGER NOT NULL DEFAULT 0`
  - `currency`: `VARCHAR(3) NOT NULL DEFAULT 'GBP'`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Constraints**:
  - `CHECK (tier_4_pool_cents + tier_3_pool_cents + (tier_5_pool_cents - rollover_in_cents) <= total_pool_cents)`

---

### 4.8 Table: `charities`
- **Purpose**: Directory of supported partner charities (PRD § 08).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name`: `VARCHAR(200) NOT NULL`
  - `slug`: `VARCHAR(200) NOT NULL UNIQUE`
  - `tagline`: `VARCHAR(255) NOT NULL`
  - `description`: `TEXT NOT NULL`
  - `logo_url`: `TEXT NOT NULL`
  - `banner_url`: `TEXT`
  - `website_url`: `TEXT`
  - `category`: `VARCHAR(100) NOT NULL`
  - `is_featured`: `BOOLEAN NOT NULL DEFAULT FALSE`
  - `is_active`: `BOOLEAN NOT NULL DEFAULT TRUE`
  - `events`: `JSONB NOT NULL DEFAULT '[]'::jsonb` (upcoming golf days, galas)
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_charities_slug` ON `charities(slug)`
  - `idx_charities_featured_active` ON `charities(is_featured, is_active)`
  - `idx_charities_search` ON `charities USING gin(to_tsvector('english', name || ' ' || description || ' ' || category))`

---

### 4.9 Table: `user_charity_preferences`
- **Purpose**: Subscriber's selected charity and voluntary contribution percentage (PRD § 08.1).
- **Ownership**: 1:1 per subscriber.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE`
  - `charity_id`: `UUID NOT NULL REFERENCES charities(id) ON DELETE RESTRICT`
  - `contribution_percentage`: `INTEGER NOT NULL DEFAULT 10 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100)`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_user_charity_user` ON `user_charity_preferences(user_id)`
  - `idx_user_charity_charity` ON `user_charity_preferences(charity_id)`

---

### 4.10 Table: `charity_donations`
- **Purpose**: Records independent direct donations not tied to gameplay (PRD § 08.1).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID REFERENCES profiles(id) ON DELETE SET NULL` (allows guest donations)
  - `charity_id`: `UUID NOT NULL REFERENCES charities(id) ON DELETE RESTRICT`
  - `amount_cents`: `INTEGER NOT NULL CHECK (amount_cents > 0)`
  - `currency`: `VARCHAR(3) NOT NULL DEFAULT 'GBP'`
  - `stripe_payment_intent_id`: `VARCHAR(100) NOT NULL UNIQUE`
  - `donor_name`: `VARCHAR(150)`
  - `donor_email`: `VARCHAR(255)`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

### 4.11 Table: `winners`
- **Purpose**: Official records of draw winners generated upon publication (PRD § 06, § 09).
- **Ownership**: Associated with `draws` and `profiles`.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `draw_id`: `UUID NOT NULL REFERENCES draws(id) ON DELETE RESTRICT`
  - `user_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
  - `match_tier`: `match_tier NOT NULL`
  - `matched_numbers`: `INTEGER[] NOT NULL` (e.g. `{14, 28, 36, 42}`)
  - `prize_amount_cents`: `INTEGER NOT NULL CHECK (prize_amount_cents >= 0)`
  - `verification_status`: `verification_status NOT NULL DEFAULT 'pending_proof'`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Constraints**:
  - `UNIQUE (draw_id, user_id)` — a user can only win once per draw (highest tier applied).
- **Indexes**:
  - `idx_winners_user` ON `winners(user_id)`
  - `idx_winners_draw_tier` ON `winners(draw_id, match_tier)`
  - `idx_winners_verification` ON `winners(verification_status)`

---

### 4.12 Table: `winner_verifications`
- **Purpose**: Proof screenshots submitted by winners for admin review (PRD § 09).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `winner_id`: `UUID NOT NULL UNIQUE REFERENCES winners(id) ON DELETE RESTRICT`
  - `user_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
  - `proof_storage_path`: `TEXT NOT NULL` (path in private Supabase bucket)
  - `proof_filename`: `VARCHAR(255) NOT NULL`
  - `proof_file_size`: `INTEGER NOT NULL CHECK (proof_file_size <= 10485760)` -- 10MB limit
  - `proof_mime_type`: `VARCHAR(100) NOT NULL`
  - `submitted_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `reviewed_by`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
  - `reviewed_at`: `TIMESTAMPTZ`
  - `admin_notes`: `TEXT`
  - `status`: `verification_status NOT NULL DEFAULT 'submitted'`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_verifications_winner` ON `winner_verifications(winner_id)`
  - `idx_verifications_status` ON `winner_verifications(status)`

---

### 4.13 Table: `payouts`
- **Purpose**: Tracking payout status (Pending -> Paid) and transaction fulfillment (PRD § 09).
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `winner_id`: `UUID NOT NULL UNIQUE REFERENCES winners(id) ON DELETE RESTRICT`
  - `user_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
  - `amount_cents`: `INTEGER NOT NULL CHECK (amount_cents > 0)`
  - `currency`: `VARCHAR(3) NOT NULL DEFAULT 'GBP'`
  - `status`: `payout_status NOT NULL DEFAULT 'pending'`
  - `transaction_reference`: `VARCHAR(150)` (bank/Stripe payout reference)
  - `processed_by`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
  - `paid_at`: `TIMESTAMPTZ`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_payouts_user` ON `payouts(user_id)`
  - `idx_payouts_status` ON `payouts(status)`

---

### 4.14 Table: `stripe_webhook_events`
- **Purpose**: Idempotency ledger for incoming Stripe webhooks to prevent duplicate event processing.
- **Columns**:
  - `id`: `VARCHAR(100) PRIMARY KEY` (Stripe Event ID, e.g. `'evt_1N...'`)
  - `event_type`: `VARCHAR(100) NOT NULL`
  - `payload`: `JSONB NOT NULL`
  - `status`: `VARCHAR(20) NOT NULL DEFAULT 'processed'`
  - `processed_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

### 4.15 Table: `audit_logs`
- **Purpose**: Immutable security audit trail for sensitive administrative and financial actions.
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `actor_id`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
  - `action`: `VARCHAR(100) NOT NULL` (e.g. `'PUBLISH_DRAW'`, `'APPROVE_WINNER'`, `'MARK_PAYOUT_PAID'`)
  - `entity_type`: `VARCHAR(50) NOT NULL`
  - `entity_id`: `VARCHAR(100) NOT NULL`
  - `metadata`: `JSONB NOT NULL DEFAULT '{}'::jsonb`
  - `ip_address`: `VARCHAR(45)`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**:
  - `idx_audit_actor` ON `audit_logs(actor_id)`
  - `idx_audit_action` ON `audit_logs(action)`
  - `idx_audit_entity` ON `audit_logs(entity_type, entity_id)`

---

## 5. Automated Rolling 5-Score Database Trigger

To enforce PRD § 05 ("Only the latest 5 scores are retained at any time. A new score replaces the oldest stored score automatically"), the following PostgreSQL function and trigger maintain the 5-score active invariant atomically:

```sql
CREATE OR REPLACE FUNCTION maintain_rolling_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate any scores beyond the 5 most recent (by played_date DESC, created_at DESC)
    UPDATE scores
    SET is_active = FALSE
    WHERE user_id = NEW.user_id
      AND is_active = TRUE
      AND id NOT IN (
          SELECT id
          FROM scores
          WHERE user_id = NEW.user_id
          ORDER BY played_date DESC, created_at DESC
          LIMIT 5
      );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintain_rolling_five_scores
AFTER INSERT OR UPDATE ON scores
FOR EACH ROW
EXECUTE FUNCTION maintain_rolling_five_scores();
```

---

## 6. Business Invariants Matrix (Layer Allocation)

| Business Invariant | Enforced at DB | Enforced at Server | Enforced at UI |
| :--- | :---: | :---: | :---: |
| Score range strictly 1–45 | `CHECK` constraint | Zod validation | Form constraints |
| Only 1 score per user per date | `UNIQUE` constraint | Pre-insert date check | Datepicker disable |
| Exactly latest 5 scores active | DB Trigger + query | FIFO rolling logic | 5-card display |
| Charity contribution min 10% | `CHECK` constraint | Zod validation | Range slider min=10 |
| Published draw numbers immutable | Status check trigger | Service validation | UI view-only |
| Client cannot mark payout paid | Table RLS / DAL | Admin-only role check | Hidden from client |
| Zero money lost or created | Integer cent sums | Remainder penny split | Currency format |
