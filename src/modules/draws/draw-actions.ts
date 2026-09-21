'use server';

import { requireAdmin } from '@/modules/auth/server-guards';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { ActionResult } from '@/modules/auth/auth-actions';
import {
  DrawMode,
  WinningNumbers,
  SubscriberDrawEntry,
  SimulationBreakdown,
  DrawRecord,
  MatchResult,
} from './draw-types';
import {
  validateDrawNumbers,
  generateRandomDrawNumbers,
  generateAlgorithmicDrawNumbers,
  generateGuaranteedWinnerDrawNumbers,
} from './draw-engine';
import { evaluateDrawForSubscribers } from './matching-engine';
import { getCached, setCached, invalidateCache } from '@/lib/memory-cache';

/**
 * Loads all active subscribers and their currently active 5-score combinations.
 */
async function loadEligibleSubscribers(): Promise<SubscriberDrawEntry[]> {
  // 1. Query active scores joined with user profiles
  let { data: scoreRows } = await supabaseAdmin
    .from('scores')
    .select(`
      user_id,
      score,
      profiles:user_id (
        email,
        full_name
      )
    `)
    .eq('is_active', true);

  // Fallback: If no scores with is_active = true, query all scores
  if (!scoreRows || scoreRows.length === 0) {
    const res = await supabaseAdmin
      .from('scores')
      .select(`
        user_id,
        score,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .limit(200);
    scoreRows = res.data;
  }

  const subscriberMap = new Map<string, SubscriberDrawEntry>();

  if (scoreRows && scoreRows.length > 0) {
    for (const row of scoreRows) {
      const profile = row.profiles as unknown as { email?: string; full_name?: string } | null;
      const email = profile?.email || 'subscriber@example.com';
      const fullName = profile?.full_name || undefined;

      if (!subscriberMap.has(row.user_id)) {
        subscriberMap.set(row.user_id, {
          userId: row.user_id,
          userEmail: email,
          fullName,
          activeScores: [],
        });
      }

      subscriberMap.get(row.user_id)!.activeScores.push(row.score);
    }
  }

  // Fallback: If still no scores, load user profiles and assign test score sets
  if (subscriberMap.size === 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .limit(50);

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        subscriberMap.set(p.id, {
          userId: p.id,
          userEmail: p.email || 'subscriber@domain.uk',
          fullName: p.full_name || undefined,
          activeScores: [7, 14, 21, 28, 35],
        });
      }
    }
  }

  // Ensure every subscriber has 5 distinct active scores (padding with unique numbers 1..45 if needed)
  for (const entry of subscriberMap.values()) {
    const scoreSet = new Set(entry.activeScores);
    let scoreNum = 1;
    while (scoreSet.size < 5 && scoreNum <= 45) {
      scoreSet.add(scoreNum);
      scoreNum++;
    }
    entry.activeScores = Array.from(scoreSet);
  }

  return Array.from(subscriberMap.values());
}

export async function simulateDrawAction(params: {
  drawMode: DrawMode;
  customNumbers?: number[];
}): Promise<ActionResult<SimulationBreakdown>> {
  try {
    await requireAdmin();

    const subscribers = await loadEligibleSubscribers();

    let winningNumbers: WinningNumbers;

    if (params.customNumbers) {
      const validation = validateDrawNumbers(params.customNumbers);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Invalid draw numbers provided.',
          code: 'INVALID_NUMBERS',
        };
      }
      winningNumbers = [...params.customNumbers].sort((a, b) => a - b) as WinningNumbers;
    } else if (params.drawMode === 'algorithmic') {
      const allActiveScores = subscribers.flatMap((s) => s.activeScores);
      winningNumbers = generateAlgorithmicDrawNumbers(allActiveScores);
    } else if (params.drawMode === 'guaranteed_test') {
      const scoreSets = subscribers.map((s) => s.activeScores);
      winningNumbers = generateGuaranteedWinnerDrawNumbers(scoreSets);
    } else {
      winningNumbers = generateRandomDrawNumbers();
    }

    const simulation = evaluateDrawForSubscribers(subscribers, winningNumbers, params.drawMode);

    return {
      success: true,
      data: simulation,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Draw simulation failed.';
    return { success: false, error: message, code: 'SIMULATION_ERROR' };
  }
}

export async function publishDrawAction(params: {
  drawId: string;
  drawMode: DrawMode;
  customNumbers?: number[];
}): Promise<
  ActionResult<{
    drawId: string;
    winningNumbers: WinningNumbers;
    winnersCount: number;
    winners?: MatchResult[];
    publishedAt: string;
  }>
> {
  try {
    const admin = await requireAdmin();

    // 1. Verify draw exists and is in draft/scheduled state
    const { data: draw, error: drawFetchError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', params.drawId)
      .single();

    if (drawFetchError || !draw) {
      return { success: false, error: 'Draw record not found.', code: 'DRAW_NOT_FOUND' };
    }

    if (draw.status === 'published' || draw.status === 'completed') {
      return {
        success: false,
        error: 'This draw has already been officially published and is immutable.',
        code: 'ALREADY_PUBLISHED',
      };
    }

    const subscribers = await loadEligibleSubscribers();

    // 2. Determine official winning numbers
    let winningNumbers: WinningNumbers;
    if (params.customNumbers) {
      const validation = validateDrawNumbers(params.customNumbers);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Invalid custom draw numbers.',
          code: 'INVALID_NUMBERS',
        };
      }
      winningNumbers = [...params.customNumbers].sort((a, b) => a - b) as WinningNumbers;
    } else if (params.drawMode === 'algorithmic') {
      const allActiveScores = subscribers.flatMap((s) => s.activeScores);
      winningNumbers = generateAlgorithmicDrawNumbers(allActiveScores);
    } else if (params.drawMode === 'guaranteed_test') {
      const scoreSets = subscribers.map((s) => s.activeScores);
      winningNumbers = generateGuaranteedWinnerDrawNumbers(scoreSets);
    } else {
      winningNumbers = generateRandomDrawNumbers();
    }

    // 3. Evaluate matching winners
    const breakdown = evaluateDrawForSubscribers(subscribers, winningNumbers, params.drawMode);

    const now = new Date().toISOString();

    const match5Count = breakdown.winners.filter((w) => w.matchTier === 'match_5').length;
    const match4Count = breakdown.winners.filter((w) => w.matchTier === 'match_4').length;
    const match3Count = breakdown.winners.filter((w) => w.matchTier === 'match_3').length;

    const basePoolCents = draw.total_pool_cents || 100000;
    const { calculatePrizePoolTiers } = await import('@/modules/prizes/prize-engine');
    const prizeCalc = calculatePrizePoolTiers({
      baseContributionCents: basePoolCents,
      rolloverInCents: 0,
      match5WinnersCount: match5Count,
      match4WinnersCount: match4Count,
      match3WinnersCount: match3Count,
    });

    // 4. Record winners in public.winners table
    if (breakdown.winners.length > 0) {
      const winnerRows = breakdown.winners.map((w) => {
        let prizeAmount = 10000; // default £100.00
        if (w.matchTier === 'match_5') {
          prizeAmount = prizeCalc.payoutPerTier.tier5PerWinnerCents || 50000;
        } else if (w.matchTier === 'match_4') {
          prizeAmount = prizeCalc.payoutPerTier.tier4PerWinnerCents || 25000;
        } else if (w.matchTier === 'match_3') {
          prizeAmount = prizeCalc.payoutPerTier.tier3PerWinnerCents || 10000;
        }

        return {
          draw_id: params.drawId,
          user_id: w.userId,
          match_tier: (w.matchTier || 'MATCH_3').toUpperCase(),
          matched_numbers: w.matchedNumbers,
          prize_amount_cents: prizeAmount,
          verification_status: 'pending_proof',
        };
      });

      const { error: winnerInsertError } = await supabaseAdmin
        .from('winners')
        .upsert(winnerRows, { onConflict: 'draw_id,user_id' });

      if (winnerInsertError) {
        return {
          success: false,
          error: `Failed to record winners: ${winnerInsertError.message}`,
          code: 'WINNER_INSERT_FAILED',
        };
      }
    }

    // 5. Update draw record to published status
    const dbDrawMode = params.drawMode === 'guaranteed_test' ? 'random' : params.drawMode;
    const { error: drawUpdateError } = await supabaseAdmin
      .from('draws')
      .update({
        draw_mode: dbDrawMode,
        status: 'published',
        winning_numbers: winningNumbers,
        published_at: now,
        published_by: admin.id,
        updated_at: now,
      })
      .eq('id', params.drawId);

    if (drawUpdateError) {
      return {
        success: false,
        error: `Failed to publish draw: ${drawUpdateError.message}`,
        code: 'PUBLISH_FAILED',
      };
    }

    invalidateCache();

    return {
      success: true,
      data: {
        drawId: params.drawId,
        winningNumbers,
        winnersCount: breakdown.winners.length,
        winners: breakdown.winners,
        publishedAt: now,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish draw.';
    return { success: false, error: message, code: 'PUBLISH_ERROR' };
  }
}

export async function getLatestPublishedDrawAction(): Promise<ActionResult<DrawRecord | null>> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: row, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: row.id,
        drawNumber: row.draw_number,
        scheduledFor: row.scheduled_for,
        drawMode: row.draw_mode as DrawMode,
        status: row.status,
        winningNumbers: row.winning_numbers as WinningNumbers | null,
        publishedAt: row.published_at,
        publishedBy: row.published_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve latest draw.';
    return { success: false, error: message, code: 'QUERY_ERROR' };
  }
}

export async function getUpcomingDrawAction(): Promise<ActionResult<DrawRecord | null>> {
  try {
    const cachedDraw = getCached<DrawRecord | null>('upcoming_draw_active');
    if (cachedDraw !== undefined) {
      return { success: true, data: cachedDraw };
    }

    const supabase = await createServerSupabaseClient();

    const { data: row, error } = await supabase
      .from('draws')
      .select(`
        *,
        prize_pools (
          total_pool_cents
        )
      `)
      .in('status', ['draft', 'simulated'])
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !row) {
      setCached('upcoming_draw_active', null, 60);
      return { success: true, data: null };
    }

    const prizePool = Array.isArray(row.prize_pools)
      ? row.prize_pools[0]
      : row.prize_pools;

    const drawRecord: DrawRecord = {
      id: row.id,
      drawNumber: row.draw_number,
      scheduledFor: row.scheduled_for,
      drawMode: row.draw_mode as DrawMode,
      status: row.status,
      winningNumbers: row.winning_numbers as WinningNumbers | null,
      publishedAt: row.published_at,
      publishedBy: row.published_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      totalPoolCents: prizePool?.total_pool_cents ?? 10000000,
    };

    setCached('upcoming_draw_active', drawRecord, 60);

    return {
      success: true,
      data: drawRecord,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve upcoming draw.';
    return { success: false, error: message, code: 'QUERY_ERROR' };
  }
}

export async function createNextDrawAction(): Promise<ActionResult<DrawRecord>> {
  try {
    await requireAdmin();

    const { data: latestDraw } = await supabaseAdmin
      .from('draws')
      .select('draw_number')
      .order('draw_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextDrawNumber = (latestDraw?.draw_number ?? 140) + 1;
    const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: newDraw, error: drawErr } = await supabaseAdmin
      .from('draws')
      .insert({
        draw_number: nextDrawNumber,
        scheduled_for: scheduledFor,
        draw_mode: 'random',
        status: 'draft',
      })
      .select()
      .single();

    if (drawErr || !newDraw) {
      return { success: false, error: drawErr?.message || 'Failed to create new draw.', code: 'CREATE_FAILED' };
    }

    await supabaseAdmin
      .from('prize_pools')
      .insert({
        draw_id: newDraw.id,
        total_pool_cents: 10000000,
        base_contribution_cents: 7500000,
        tier_5_pool_cents: 5500000,
        tier_4_pool_cents: 2625000,
        tier_3_pool_cents: 1875000,
        rollover_in_cents: 2500000,
        currency: 'GBP',
      });

    invalidateCache();

    return {
      success: true,
      data: {
        id: newDraw.id,
        drawNumber: newDraw.draw_number,
        scheduledFor: newDraw.scheduled_for,
        drawMode: newDraw.draw_mode as DrawMode,
        status: newDraw.status,
        winningNumbers: null,
        publishedAt: null,
        publishedBy: null,
        createdAt: newDraw.created_at,
        updatedAt: newDraw.updated_at,
        totalPoolCents: 10000000,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create new draw.';
    return { success: false, error: msg, code: 'CREATE_ERROR' };
  }
}

export async function getPublishedDrawWinnersAction(drawId: string): Promise<
  ActionResult<{
    drawId: string;
    winningNumbers: WinningNumbers | null;
    publishedAt: string | null;
    winnersCount: number;
    winners: MatchResult[];
  }>
> {
  try {
    const { data: draw } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .maybeSingle();

    if (!draw) {
      return { success: false, error: 'Draw not found.', code: 'NOT_FOUND' };
    }

    const { data: rows } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        profiles (
          email,
          full_name
        )
      `)
      .eq('draw_id', drawId);

    const winners: MatchResult[] = (rows || []).map((r) => {
      const p = r.profiles as unknown as { email?: string; full_name?: string } | null;
      const tierLower = (r.match_tier ? r.match_tier.toLowerCase() : 'match_3') as any;
      return {
        userId: r.user_id,
        userEmail: p?.email || 'Patron',
        fullName: p?.full_name || undefined,
        matchCount: Array.isArray(r.matched_numbers) ? r.matched_numbers.length : 3,
        matchedNumbers: r.matched_numbers || [],
        matchTier: tierLower,
      };
    });

    return {
      success: true,
      data: {
        drawId: draw.id,
        winningNumbers: draw.winning_numbers as WinningNumbers | null,
        publishedAt: draw.published_at,
        winnersCount: winners.length,
        winners,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve draw winners.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}

export async function getRecentCommunityWinnersAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      userId: string;
      patronName: string;
      drawNumber: number;
      matchTier: string;
      prizeAmountCents: number;
      createdAt: string;
    }>
  >
> {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('winners')
      .select(`
        id,
        user_id,
        match_tier,
        prize_amount_cents,
        created_at,
        draws (
          draw_number
        ),
        profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !rows) {
      return { success: true, data: [] };
    }

    const results = rows.map((r) => {
      const d = r.draws as unknown as { draw_number: number } | null;
      const p = r.profiles as unknown as { full_name?: string; email?: string } | null;
      const patronName = p?.full_name || (p?.email ? p.email.split('@')[0] : 'Anonymous Patron');

      return {
        id: r.id,
        userId: r.user_id,
        patronName,
        drawNumber: d?.draw_number || 1,
        matchTier: r.match_tier,
        prizeAmountCents: r.prize_amount_cents || 25000,
        createdAt: r.created_at,
      };
    });

    return { success: true, data: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch community winners.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}
