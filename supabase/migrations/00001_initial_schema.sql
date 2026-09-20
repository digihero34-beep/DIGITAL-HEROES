-- ============================================================
-- DIGITAL HEROES — INITIAL DATABASE SCHEMA
-- Migration: 00001_initial_schema.sql
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMERATED TYPES
CREATE TYPE user_role AS ENUM ('public', 'subscriber', 'admin');
CREATE TYPE plan_interval AS ENUM ('month', 'year');
CREATE TYPE subscription_status AS ENUM (
    'incomplete',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'trialing'
);
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published', 'cancelled');
CREATE TYPE match_tier AS ENUM ('MATCH_5', 'MATCH_4', 'MATCH_3');
CREATE TYPE verification_status AS ENUM (
    'pending_proof',
    'submitted',
    'under_review',
    'approved',
    'rejected'
);
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');

-- 3. PROFILES TABLE (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'subscriber',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- 4. PLANS TABLE
CREATE TABLE public.plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    interval plan_interval NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    stripe_price_id VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE RESTRICT,
    plan_id VARCHAR(50) NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'incomplete',
    stripe_customer_id VARCHAR(100) NOT NULL,
    stripe_subscription_id VARCHAR(100) NOT NULL UNIQUE,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- 6. SCORES TABLE (PRD § 05: Stableford 1–45, 1 score per date)
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    played_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_played_date UNIQUE (user_id, played_date)
);

CREATE INDEX idx_scores_user_active_date ON public.scores(user_id, is_active, played_date DESC);
CREATE INDEX idx_scores_user_date ON public.scores(user_id, played_date);

-- 7. DRAWS TABLE (PRD § 06)
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_number INTEGER NOT NULL UNIQUE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    draw_mode draw_mode NOT NULL DEFAULT 'random',
    status draw_status NOT NULL DEFAULT 'draft',
    winning_numbers INTEGER[5],
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_winning_numbers_length CHECK (winning_numbers IS NULL OR array_length(winning_numbers, 1) = 5)
);

CREATE INDEX idx_draws_status_scheduled ON public.draws(status, scheduled_for DESC);
CREATE INDEX idx_draws_number ON public.draws(draw_number);

-- 8. DRAW SIMULATIONS TABLE
CREATE TABLE public.draw_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    simulated_numbers INTEGER[5] NOT NULL,
    draw_mode draw_mode NOT NULL,
    eligible_subscribers_count INTEGER NOT NULL,
    match_5_count INTEGER NOT NULL DEFAULT 0,
    match_4_count INTEGER NOT NULL DEFAULT 0,
    match_3_count INTEGER NOT NULL DEFAULT 0,
    projected_pool_cents INTEGER NOT NULL,
    simulated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRIZE POOLS TABLE (PRD § 07: 40% Tier 5 + Rollover, 35% Tier 4, 25% Tier 3)
CREATE TABLE public.prize_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL UNIQUE REFERENCES public.draws(id) ON DELETE RESTRICT,
    total_pool_cents INTEGER NOT NULL CHECK (total_pool_cents >= 0),
    base_contribution_cents INTEGER NOT NULL CHECK (base_contribution_cents >= 0),
    tier_5_pool_cents INTEGER NOT NULL CHECK (tier_5_pool_cents >= 0),
    tier_4_pool_cents INTEGER NOT NULL CHECK (tier_4_pool_cents >= 0),
    tier_3_pool_cents INTEGER NOT NULL CHECK (tier_3_pool_cents >= 0),
    rollover_in_cents INTEGER NOT NULL DEFAULT 0 CHECK (rollover_in_cents >= 0),
    rollover_out_cents INTEGER NOT NULL DEFAULT 0 CHECK (rollover_out_cents >= 0),
    unclaimed_tier_4_cents INTEGER NOT NULL DEFAULT 0 CHECK (unclaimed_tier_4_cents >= 0),
    unclaimed_tier_3_cents INTEGER NOT NULL DEFAULT 0 CHECK (unclaimed_tier_3_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pool_split_integrity CHECK (
        tier_4_pool_cents + tier_3_pool_cents + (tier_5_pool_cents - rollover_in_cents) <= total_pool_cents
    )
);

-- 10. CHARITIES TABLE (PRD § 08)
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    tagline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    banner_url TEXT,
    website_url TEXT,
    category VARCHAR(100) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charities_slug ON public.charities(slug);
CREATE INDEX idx_charities_featured_active ON public.charities(is_featured, is_active);
CREATE INDEX idx_charities_search ON public.charities USING gin(
    to_tsvector('english', name || ' ' || description || ' ' || category)
);

-- 11. USER CHARITY PREFERENCES (PRD § 08.1: Minimum 10% contribution)
CREATE TABLE public.user_charity_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE RESTRICT,
    contribution_percentage INTEGER NOT NULL DEFAULT 10 CHECK (
        contribution_percentage >= 10 AND contribution_percentage <= 100
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_charity_user ON public.user_charity_preferences(user_id);
CREATE INDEX idx_user_charity_charity ON public.user_charity_preferences(charity_id);

-- 12. CHARITY DIRECT DONATIONS (PRD § 08.1)
CREATE TABLE public.charity_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    stripe_payment_intent_id VARCHAR(100) NOT NULL UNIQUE,
    donor_name VARCHAR(150),
    donor_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. WINNERS TABLE (PRD § 06, § 09)
CREATE TABLE public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    match_tier match_tier NOT NULL,
    matched_numbers INTEGER[] NOT NULL,
    prize_amount_cents INTEGER NOT NULL CHECK (prize_amount_cents >= 0),
    verification_status verification_status NOT NULL DEFAULT 'pending_proof',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_winner_draw_user UNIQUE (draw_id, user_id)
);

CREATE INDEX idx_winners_user ON public.winners(user_id);
CREATE INDEX idx_winners_draw_tier ON public.winners(draw_id, match_tier);
CREATE INDEX idx_winners_verification ON public.winners(verification_status);

-- 14. WINNER VERIFICATIONS TABLE (PRD § 09: Proof Upload)
CREATE TABLE public.winner_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_id UUID NOT NULL UNIQUE REFERENCES public.winners(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    proof_storage_path TEXT NOT NULL,
    proof_filename VARCHAR(255) NOT NULL,
    proof_file_size INTEGER NOT NULL CHECK (proof_file_size <= 10485760), -- Max 10MB
    proof_mime_type VARCHAR(100) NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    status verification_status NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verifications_winner ON public.winner_verifications(winner_id);
CREATE INDEX idx_verifications_status ON public.winner_verifications(status);

-- 15. PAYOUTS TABLE (PRD § 09: Pending -> Paid)
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_id UUID NOT NULL UNIQUE REFERENCES public.winners(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status payout_status NOT NULL DEFAULT 'pending',
    transaction_reference VARCHAR(150),
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_user ON public.payouts(user_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- 16. STRIPE WEBHOOK EVENTS (Idempotency Ledger)
CREATE TABLE public.stripe_webhook_events (
    id VARCHAR(100) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processed',
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. AUDIT LOGS (Immutable Security Audit)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
