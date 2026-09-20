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
} from './draw-types';
import {
  validateDrawNumbers,
  generateRandomDrawNumbers,
  generateAlgorithmicDrawNumbers,
} from './draw-engine';
import { evaluateDrawForSubscribers } from './matching-engine';

/**
 * Loads all active subscribers and their currently active 5-score combinations.
 */
async function loadEligibleSubscribers(): Promise<SubscriberDrawEntry[]> {
  // Query active scores joined with user profiles
  const { data: scoreRows, error } = await supabaseAdmin
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

  if (error || !scoreRows) {
    return [];
  }

  const subscriberMap = new Map<string, SubscriberDrawEntry>();

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
    } else {
      winningNumbers = generateRandomDrawNumbers();
    }

    // 3. Evaluate matching winners
    const breakdown = evaluateDrawForSubscribers(subscribers, winningNumbers, params.drawMode);

    const now = new Date().toISOString();

    // 4. Record winners in public.winners table
    if (breakdown.winners.length > 0) {
      const winnerRows = breakdown.winners.map((w) => ({
        draw_id: params.drawId,
        user_id: w.userId,
        match_tier: w.matchTier!,
        matched_numbers: w.matchedNumbers,
        prize_amount_cents: 0, // Prize allocation calculated in Phase 8
        verification_status: 'pending_proof',
      }));

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
    const { error: drawUpdateError } = await supabaseAdmin
      .from('draws')
      .update({
        draw_mode: params.drawMode,
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

    return {
      success: true,
      data: {
        drawId: params.drawId,
        winningNumbers,
        winnersCount: breakdown.winners.length,
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

import { getCached, setCached } from '@/lib/memory-cache';

export async function getUpcomingDrawAction(): Promise<ActionResult<DrawRecord | null>> {
  try {
    const cachedDraw = getCached<DrawRecord | null>('upcoming_draw_active');
    if (cachedDraw !== null && cachedDraw !== undefined) {
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
      .in('status', ['draft', 'scheduled', 'simulated'])
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !row) {
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

    setCached('upcoming_draw_active', drawRecord, 30);

    return {
      success: true,
      data: drawRecord,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve upcoming draw.';
    return { success: false, error: message, code: 'QUERY_ERROR' };
  }
}
