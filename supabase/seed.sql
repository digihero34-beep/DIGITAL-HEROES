-- ============================================================
-- DIGITAL HEROES — SYSTEM SEED DATA
-- Seed: seed.sql
-- ============================================================

-- 1. SEED PLANS (PRD § 04: Monthly and Discounted Yearly)
INSERT INTO public.plans (id, name, interval, amount_cents, currency, stripe_price_id, is_active)
VALUES
    ('plan_monthly', 'Monthly Membership', 'month', 2000, 'GBP', 'price_monthly_mock', TRUE),
    ('plan_yearly', 'Annual Membership (20% Discount)', 'year', 19200, 'GBP', 'price_yearly_mock', TRUE)
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
        'GreenGrass Youth Initiative',
        'greengrass-youth',
        'Empowering underprivileged youth through athletic mentoring and golf access',
        'GreenGrass provides equipment, coaching, and mentorship to children from under-resourced communities, building character, discipline, and opportunities through the sport of golf.',
        'https://images.unsplash.com/photo-1593111774642-a1789c6292b3?w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&auto=format&fit=crop',
        'https://greengrassyouth.org',
        'Youth & Education',
        TRUE,
        TRUE,
        '[
            {"title": "Spring Junior Charity Classic", "date": "2026-04-18", "location": "Surrey Links Golf Club", "description": "18-hole scramble tournament pairing juniors with mentors."},
            {"title": "Community Coaching Academy", "date": "2026-05-02", "location": "East London Sports Park", "description": "Free introductory golf clinic for 100 neighborhood children."}
        ]'::jsonb
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'Veterans On The Green',
        'veterans-on-the-green',
        'Rehabilitation, community, and mental wellbeing for military veterans',
        'Veterans On The Green uses outdoor recreation, camaraderie, and sport to help injured and transitioning service members combat PTSD, rebuild confidence, and connect with peer support networks.',
        'https://images.unsplash.com/photo-1593111774285-0524cb51b43a?w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&auto=format&fit=crop',
        'https://veteransgreen.org',
        'Mental Health & Veterans',
        FALSE,
        TRUE,
        '[
            {"title": "Memorial Invitational Cup", "date": "2026-05-25", "location": "Royal Berkshire Links", "description": "Annual veteran recovery benefit tournament and dinner."}
        ]'::jsonb
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'Fore The Planet Woodland Trust',
        'fore-the-planet',
        'Restoring native woodlands, wetlands, and biodiversity on recreational landscapes',
        'Fore The Planet works with recreational venues to rewild peripheral acreage, plant native species, protect wildlife corridors, and promote climate-conscious land stewardship.',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&auto=format&fit=crop',
        'https://foretheplanet.org',
        'Environment & Conservation',
        FALSE,
        TRUE,
        '[
            {"title": "Earth Month Native Tree Planting Gala", "date": "2026-04-22", "location": "Highland Valley Estate", "description": "Volunteer planting event aiming to restore 1,500 native oak saplings."}
        ]'::jsonb
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    is_featured = EXCLUDED.is_featured,
    events = EXCLUDED.events;
