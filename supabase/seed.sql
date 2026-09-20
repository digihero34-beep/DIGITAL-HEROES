-- ============================================================
-- DIGITAL HEROES — SYSTEM SEED DATA
-- Seed: seed.sql
-- ============================================================

-- 1. SEED PLANS (PRD § 04: Monthly and Discounted Yearly)
INSERT INTO public.plans (id, name, interval, amount_cents, currency, stripe_price_id, is_active)
VALUES
    ('plan_monthly', 'Monthly Membership', 'month', 2500, 'GBP', 'price_1UHlQLE4wTAEJ3rNd52Cy2Bf', TRUE),
    ('plan_yearly', 'Annual Membership (20% Discount)', 'year', 24000, 'GBP', 'price_1UHlRyE4wTAEJ3rNaV4pE1AT', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    amount_cents = EXCLUDED.amount_cents,
    stripe_price_id = EXCLUDED.stripe_price_id;

-- 2. SEED CHARITIES (PRD § 08: Directory, Profiles, Featured Spotlight)
INSERT INTO public.charities (
    id, name, slug, tagline, description, logo_url, banner_url, website_url, category, is_featured, is_active, events
)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'Fairway Futures Foundation',
        'fairway-futures',
        'Empowering underprivileged youth through athletic mentoring and golf access',
        'Fairway Futures provides golf equipment, professional coaching, and educational mentorship to young people across the UK, building discipline and opening doors through the sport.',
        'https://images.unsplash.com/photo-1593111774642-a1789c6292b3?w=200&auto=format&fit=crop',
        '/images/fairway_futures.jpg',
        'https://fairwayfutures.org.uk',
        'Youth & Education',
        TRUE,
        TRUE,
        '[
            {"title": "Spring Junior Charity Classic", "date": "2026-04-18", "location": "Surrey Links Golf Club", "description": "18-hole scramble tournament pairing juniors with tour mentors."},
            {"title": "Community Coaching Academy", "date": "2026-05-02", "location": "East London Sports Park", "description": "Free introductory golf clinic for 100 neighborhood children."}
        ]'::jsonb
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'Adaptive Golf Alliance UK',
        'adaptive-golf-alliance',
        'Rehabilitation, community, and mental wellbeing for injured military veterans and adaptive athletes',
        'The Adaptive Golf Alliance uses specialized equipment and peer networks to bring therapeutic outdoor sport and camaraderie to military veterans and individuals with physical disabilities.',
        'https://images.unsplash.com/photo-1593111774285-0524cb51b43a?w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&auto=format&fit=crop',
        'https://adaptivegolfuk.org',
        'Mental Health & Veterans',
        FALSE,
        TRUE,
        '[
            {"title": "Memorial Invitational Cup", "date": "2026-05-25", "location": "Royal Berkshire Links", "description": "Annual veteran recovery benefit tournament and dinner."}
        ]'::jsonb
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'Coastal Links Ecology Trust',
        'coastal-links-ecology',
        'Restoring native woodlands, sand dunes, and biodiversity across Britain’s historic coastlines',
        'Working with seaside communities and recreational links venues to rewild peripheral acreage, preserve endangered coastal habitats, and protect Britain’s maritime landscape.',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&auto=format&fit=crop',
        '/images/st_andrews_heritage.jpg',
        'https://coastallinks.org.uk',
        'Environment & Conservation',
        FALSE,
        TRUE,
        '[
            {"title": "Earth Month Coastal Restoration Gala", "date": "2026-04-22", "location": "Fife Coastal Reserve", "description": "Volunteer planting event aiming to restore 2,000 native maritime flora saplings."}
        ]'::jsonb
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    is_featured = EXCLUDED.is_featured,
    events = EXCLUDED.events;

-- 3. SEED INITIAL UPCOMING DRAW (Draw #142) & PRIZE POOL
INSERT INTO public.draws (
    id, draw_number, scheduled_for, draw_mode, status
)
VALUES (
    'd0000000-0000-0000-0000-000000000142',
    142,
    NOW() + INTERVAL '10 days',
    'random',
    'draft'
)
ON CONFLICT (draw_number) DO NOTHING;

INSERT INTO public.prize_pools (
    draw_id, total_pool_cents, base_contribution_cents,
    tier_5_pool_cents, tier_4_pool_cents, tier_3_pool_cents,
    rollover_in_cents, currency
)
VALUES (
    'd0000000-0000-0000-0000-000000000142',
    10000000, -- £100,000.00
    7500000,  -- £75,000 base
    5500000,  -- £30,000 (40% of base) + £25,000 rollover = £55,000
    2625000,  -- 35% of £75,000 = £26,250
    1875000,  -- 25% of £75,000 = £18,750
    2500000,  -- £25,000 rollover in
    'GBP'
)
ON CONFLICT (draw_id) DO UPDATE SET
    total_pool_cents = EXCLUDED.total_pool_cents,
    tier_5_pool_cents = EXCLUDED.tier_5_pool_cents,
    tier_4_pool_cents = EXCLUDED.tier_4_pool_cents,
    tier_3_pool_cents = EXCLUDED.tier_3_pool_cents;
