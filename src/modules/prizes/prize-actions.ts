'use server';

import { requireAdmin } from '@/modules/auth/server-guards';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { ActionResult } from '@/modules/auth/auth-actions';
import {
  PrizePoolCalculationResult,
  PrizePoolRecord,
} from './prize-types';
import {
  calculatePrizePoolTiers,
  distributeTierFundsEqually,
} from './prize-engine';

export async function finalizeDrawPrizePoolAction(params: {
  drawId: string;
  baseContributionCents: number;
}): Promise<ActionResult<PrizePoolCalculationResult>> {
  try {
    await requireAdmin();

    if (params.baseContributionCents < 0) {
      return {
        success: false,
        error: 'Base contribution cannot be negative.',
        code: 'INVALID_AMOUNT',
      };
    }

    // 1. Verify draw exists
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .select('id, status')
      .eq('id', params.drawId)
      .single();

    if (drawError || !draw) {
      return { success: false, error: 'Draw record not found.', code: 'DRAW_NOT_FOUND' };
    }

    // 2. Fetch previous draw's rollover_out_cents (if any)
    const { data: previousPool } = await supabaseAdmin
      .from('prize_pools')
      .select('rollover_out_cents')
      .neq('draw_id', params.drawId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const rolloverInCents = previousPool?.rollover_out_cents || 0;

    // 3. Fetch winners recorded for this draw
    const { data: winners, error: winnersError } = await supabaseAdmin
      .from('winners')
      .select('id, match_tier')
      .eq('draw_id', params.drawId);

    if (winnersError) {
      return { success: false, error: 'Failed to query draw winners.', code: 'QUERY_ERROR' };
    }

    const tier5Winners = (winners || []).filter((w) => w.match_tier === 'match_5');
    const tier4Winners = (winners || []).filter((w) => w.match_tier === 'match_4');
    const tier3Winners = (winners || []).filter((w) => w.match_tier === 'match_3');

    // 4. Calculate tier splits and rollover accounting
    const calculation = calculatePrizePoolTiers({
      baseContributionCents: params.baseContributionCents,
      rolloverInCents,
      match5WinnersCount: tier5Winners.length,
      match4WinnersCount: tier4Winners.length,
      match3WinnersCount: tier3Winners.length,
    });

    // 5. Compute individual payouts with remainder penny preservation
    const tier5Payouts = distributeTierFundsEqually(
      calculation.tier5PoolCents,
      tier5Winners.map((w) => w.id)
    );
    const tier4Payouts = distributeTierFundsEqually(
      calculation.tier4PoolCents,
      tier4Winners.map((w) => w.id)
    );
    const tier3Payouts = distributeTierFundsEqually(
      calculation.tier3PoolCents,
      tier3Winners.map((w) => w.id)
    );

    const allPayouts = [...tier5Payouts, ...tier4Payouts, ...tier3Payouts];

    // 6. Update prize_amount_cents on public.winners
    for (const payout of allPayouts) {
      await supabaseAdmin
        .from('winners')
        .update({
          prize_amount_cents: payout.amountCents,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payout.id);
    }

    // 7. Persist prize pool accounting ledger
    const { error: poolInsertError } = await supabaseAdmin
      .from('prize_pools')
      .upsert(
        {
          draw_id: params.drawId,
          total_pool_cents: calculation.totalPoolCents,
          base_contribution_cents: calculation.baseContributionCents,
          tier_5_pool_cents: calculation.tier5PoolCents,
          tier_4_pool_cents: calculation.tier4PoolCents,
          tier_3_pool_cents: calculation.tier3PoolCents,
          rollover_in_cents: calculation.rolloverInCents,
          rollover_out_cents: calculation.rolloverOutCents,
          unclaimed_tier_4_cents: calculation.unclaimedTier4Cents,
          unclaimed_tier_3_cents: calculation.unclaimedTier3Cents,
          currency: 'GBP',
          created_at: new Date().toISOString(),
        },
        { onConflict: 'draw_id' }
      );

    if (poolInsertError) {
      return {
        success: false,
        error: `Failed to persist prize pool: ${poolInsertError.message}`,
        code: 'PERSIST_ERROR',
      };
    }

    return {
      success: true,
      data: calculation,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to finalize prize pool.';
    return { success: false, error: message, code: 'FINALIZE_ERROR' };
  }
}

export async function getDrawPrizePoolAction(
  drawId: string
): Promise<ActionResult<PrizePoolRecord | null>> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: row, error } = await supabase
      .from('prize_pools')
      .select('*')
      .eq('draw_id', drawId)
      .maybeSingle();

    if (error || !row) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: row.id,
        drawId: row.draw_id,
        totalPoolCents: row.total_pool_cents,
        baseContributionCents: row.base_contribution_cents,
        tier5PoolCents: row.tier_5_pool_cents,
        tier4PoolCents: row.tier_4_pool_cents,
        tier3PoolCents: row.tier_3_pool_cents,
        rolloverInCents: row.rollover_in_cents,
        rolloverOutCents: row.rollover_out_cents,
        unclaimedTier4Cents: row.unclaimed_tier_4_cents,
        unclaimedTier3Cents: row.unclaimed_tier_3_cents,
        currency: row.currency,
        createdAt: row.created_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load prize pool.';
    return { success: false, error: message, code: 'QUERY_ERROR' };
  }
}
