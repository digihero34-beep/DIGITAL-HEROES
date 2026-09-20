-- ============================================================
-- DIGITAL HEROES — ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 00003_rls.sql
-- ============================================================

-- 1. HELPER FUNCTION: Check if the calling authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL PUBLIC TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin() OR (
            auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        )
    );

-- 4. PLANS POLICIES (Publicly readable)
CREATE POLICY "plans_select_all" ON public.plans
    FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "plans_admin_manage" ON public.plans
    FOR ALL TO authenticated USING (public.is_admin());

-- 5. SUBSCRIPTIONS POLICIES (Isolated to owner or admin)
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "subscriptions_admin_manage" ON public.subscriptions
    FOR ALL TO authenticated USING (public.is_admin());

-- 6. SCORES POLICIES (Subscriber CRUD for own scores, Admin full access)
CREATE POLICY "scores_select_own" ON public.scores
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "scores_insert_own" ON public.scores
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "scores_update_own" ON public.scores
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "scores_delete_own" ON public.scores
    FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- 7. DRAWS & SIMULATIONS POLICIES
-- Published draws visible to everyone; drafts and simulations only to admin
CREATE POLICY "draws_select_published" ON public.draws
    FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_admin());

CREATE POLICY "draws_admin_manage" ON public.draws
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "draw_simulations_admin_only" ON public.draw_simulations
    FOR ALL TO authenticated USING (public.is_admin());

-- 8. PRIZE POOLS POLICIES
CREATE POLICY "prize_pools_select" ON public.prize_pools
    FOR SELECT TO anon, authenticated USING (
        public.is_admin() OR EXISTS (
            SELECT 1 FROM public.draws WHERE draws.id = prize_pools.draw_id AND draws.status = 'published'
        )
    );

CREATE POLICY "prize_pools_admin_manage" ON public.prize_pools
    FOR ALL TO authenticated USING (public.is_admin());

-- 9. CHARITIES POLICIES (Active charities readable by all)
CREATE POLICY "charities_select_active" ON public.charities
    FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "charities_admin_manage" ON public.charities
    FOR ALL TO authenticated USING (public.is_admin());

-- 10. USER CHARITY PREFERENCES POLICIES
CREATE POLICY "charity_pref_select_own" ON public.user_charity_preferences
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "charity_pref_insert_own" ON public.user_charity_preferences
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "charity_pref_update_own" ON public.user_charity_preferences
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 11. CHARITY DONATIONS POLICIES
CREATE POLICY "donations_select_own" ON public.charity_donations
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "donations_admin_manage" ON public.charity_donations
    FOR ALL TO authenticated USING (public.is_admin());

-- 12. WINNERS POLICIES
CREATE POLICY "winners_select_own" ON public.winners
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "winners_admin_manage" ON public.winners
    FOR ALL TO authenticated USING (public.is_admin());

-- 13. WINNER VERIFICATIONS POLICIES
CREATE POLICY "verifications_select_own" ON public.winner_verifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "verifications_insert_own" ON public.winner_verifications
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "verifications_admin_manage" ON public.winner_verifications
    FOR ALL TO authenticated USING (public.is_admin());

-- 14. PAYOUTS POLICIES
CREATE POLICY "payouts_select_own" ON public.payouts
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "payouts_admin_manage" ON public.payouts
    FOR ALL TO authenticated USING (public.is_admin());

-- 15. STRIPE EVENTS & AUDIT LOGS (Admin only)
CREATE POLICY "stripe_events_admin_only" ON public.stripe_webhook_events
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
    FOR ALL TO authenticated USING (public.is_admin());
