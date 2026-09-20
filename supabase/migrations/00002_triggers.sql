-- ============================================================
-- DIGITAL HEROES — AUTOMATED DATABASE TRIGGERS
-- Migration: 00002_triggers.sql
-- ============================================================

-- 1. ROLLING FIVE SCORES TRIGGER (PRD § 05)
-- Ensures that strictly and atomically, only the latest 5 scores
-- for any user are marked as active (is_active = true).
CREATE OR REPLACE FUNCTION public.maintain_rolling_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate all scores outside the 5 most recent
    UPDATE public.scores
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND is_active = TRUE
      AND id NOT IN (
          SELECT id
          FROM public.scores
          WHERE user_id = NEW.user_id
          ORDER BY played_date DESC, created_at DESC
          LIMIT 5
      );

    -- Ensure the 5 most recent scores are active
    UPDATE public.scores
    SET is_active = TRUE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND id IN (
          SELECT id
          FROM public.scores
          WHERE user_id = NEW.user_id
          ORDER BY played_date DESC, created_at DESC
          LIMIT 5
      );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_maintain_rolling_five_scores
AFTER INSERT OR UPDATE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.maintain_rolling_five_scores();

-- 2. NEW USER PROFILE PROVISIONING TRIGGER
-- Automatically provisions public.profiles when an identity is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'subscriber'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 3. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_scores_updated_at BEFORE UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_draws_updated_at BEFORE UPDATE ON public.draws FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_charities_updated_at BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_user_charity_updated_at BEFORE UPDATE ON public.user_charity_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_winners_updated_at BEFORE UPDATE ON public.winners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_verifications_updated_at BEFORE UPDATE ON public.winner_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_set_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
