'use server';

import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { ActionResult } from '@/modules/auth/auth-actions';

export interface PublicUpcomingDraw {
  id: string;
  drawNumber: number;
  scheduledFor: string;
  status: string;
  totalPoolCents: number;
  tier5PoolCents: number;
  tier4PoolCents: number;
  tier3PoolCents: number;
}

export interface PublicPlatformStats {
  upcomingDraw: PublicUpcomingDraw | null;
  publishedDrawsCount: number;
  totalSubscribersCount: number;
  activeSubscribersCount: number;
  accreditedCharitiesCount: number;
  totalPhilanthropicYieldCents: number;
  featuredCharityYieldCents: number;
}

import { getCached, setCached } from '@/lib/memory-cache';

export async function getPublicPlatformStats(): Promise<ActionResult<PublicPlatformStats>> {
  try {
    const cacheKey = 'public_platform_stats';
    const cachedStats = getCached<PublicPlatformStats>(cacheKey);
    if (cachedStats) {
      return { success: true, data: cachedStats };
    }

    // Parallelize all independent database queries into a single concurrent roundtrip
    const [
      drawRes,
      publishedRes,
      activeSubsRes,
      totalProfilesRes,
      charitiesRes,
      featuredRes,
      donationsRes,
      activeSubsListRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('draws')
        .select(`
          id,
          draw_number,
          scheduled_for,
          status,
          prize_pools (
            total_pool_cents,
            tier_5_pool_cents,
            tier_4_pool_cents,
            tier_3_pool_cents
          )
        `)
        .order('scheduled_for', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('draws')
        .select('*', { count: 'exact', head: true })
        .in('status', ['published', 'completed']),
      supabaseAdmin
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('charities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabaseAdmin
        .from('charities')
        .select('id')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('charity_donations')
        .select('amount_cents, charity_id'),
      supabaseAdmin
        .from('subscriptions')
        .select('user_id, plan_id')
        .eq('status', 'active'),
    ]);

    const latestDraw = drawRes.data;
    const publishedDrawsCount = publishedRes.count;
    const activeSubsCount = activeSubsRes.count;
    const totalProfilesCount = totalProfilesRes.count;
    const accreditedCharitiesCount = charitiesRes.count;
    const featuredCharity = featuredRes.data;
    const donations = donationsRes.data;
    const activeSubs = activeSubsListRes.data;

    let upcomingDraw: PublicUpcomingDraw | null = null;
    if (latestDraw) {
      const prizePool = Array.isArray(latestDraw.prize_pools)
        ? latestDraw.prize_pools[0]
        : latestDraw.prize_pools;

      upcomingDraw = {
        id: latestDraw.id,
        drawNumber: latestDraw.draw_number,
        scheduledFor: latestDraw.scheduled_for,
        status: latestDraw.status,
        totalPoolCents: prizePool?.total_pool_cents ?? 10000000,
        tier5PoolCents: prizePool?.tier_5_pool_cents ?? 5500000,
        tier4PoolCents: prizePool?.tier_4_pool_cents ?? 2625000,
        tier3PoolCents: prizePool?.tier_3_pool_cents ?? 1875000,
      };
    }

    let totalDonationsCents = 0;
    let featuredDonationsCents = 0;
    if (donations) {
      for (const d of donations) {
        totalDonationsCents += d.amount_cents || 0;
        if (featuredCharity && d.charity_id === featuredCharity.id) {
          featuredDonationsCents += d.amount_cents || 0;
        }
      }
    }

    let totalSubscriptionPledgesCents = 0;
    let featuredSubscriptionPledgesCents = 0;

    if (activeSubs && activeSubs.length > 0) {
      const userIds = activeSubs.map((s) => s.user_id);
      const { data: prefs } = await supabaseAdmin
        .from('user_charity_preferences')
        .select('user_id, charity_id, contribution_percentage')
        .in('user_id', userIds);

      const prefMap = new Map<string, { charity_id: string; contribution_percentage: number }>();
      if (prefs) {
        for (const p of prefs) {
          prefMap.set(p.user_id, p);
        }
      }

      for (const sub of activeSubs) {
        // Plan cost: yearly is £240/yr (24000 cents), monthly is £25/mo (2500 cents)
        const planPriceCents = sub.plan_id === 'plan_yearly' ? 24000 : 2500;
        const userPref = prefMap.get(sub.user_id);
        const percentage = userPref?.contribution_percentage ?? 10;
        const charityAmountCents = Math.round((planPriceCents * percentage) / 100);

        totalSubscriptionPledgesCents += charityAmountCents;

        if (featuredCharity && userPref?.charity_id === featuredCharity.id) {
          featuredSubscriptionPledgesCents += charityAmountCents;
        } else if (!userPref) {
          // If no specific charity selected, default allocation goes to featured charity
          featuredSubscriptionPledgesCents += charityAmountCents;
        }
      }
    }

    const totalPhilanthropicYieldCents = totalDonationsCents + totalSubscriptionPledgesCents;
    const featuredCharityYieldCents = featuredDonationsCents + featuredSubscriptionPledgesCents;

    const resultData: PublicPlatformStats = {
      upcomingDraw,
      publishedDrawsCount: publishedDrawsCount ?? 0,
      totalSubscribersCount: totalProfilesCount ?? 0,
      activeSubscribersCount: activeSubsCount ?? 0,
      accreditedCharitiesCount: accreditedCharitiesCount ?? 0,
      totalPhilanthropicYieldCents,
      featuredCharityYieldCents,
    };

    setCached(cacheKey, resultData, 30); // 30-second TTL

    return {
      success: true,
      data: resultData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to query platform stats.';
    return { success: false, error: message, code: 'PLATFORM_STATS_ERROR' };
  }
}
