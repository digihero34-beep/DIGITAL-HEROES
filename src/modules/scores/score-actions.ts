'use server';

import { requireAuth, requireActiveSubscription } from '@/modules/auth/server-guards';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { ActionResult } from '@/modules/auth/auth-actions';
import {
  GolfScore,
  CreateScoreInput,
  UpdateScoreInput,
  UserScoresSummary,
} from './score-types';
import {
  validateStablefordScore,
  validatePlayedDate,
  calculateScorecardStats,
} from './score-engine';

export async function addScoreAction(
  input: CreateScoreInput
): Promise<ActionResult<GolfScore>> {
  try {
    const user = await requireAuth();
    await requireActiveSubscription(user.id);

    // 1. Validate score limits
    const scoreVal = validateStablefordScore(input.score);
    if (!scoreVal.isValid) {
      return { success: false, error: scoreVal.error || 'Invalid score', code: 'INVALID_SCORE' };
    }

    // 2. Validate played date
    const dateVal = validatePlayedDate(input.playedDate);
    if (!dateVal.isValid) {
      return { success: false, error: dateVal.error || 'Invalid date', code: 'INVALID_DATE' };
    }

    const supabase = await createServerSupabaseClient();

    // 3. Prevent duplicate scores on the same date (PRD § 05)
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('played_date', input.playedDate)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: 'A round has already been recorded for this date. You may edit the existing score.',
        code: 'DUPLICATE_DATE',
      };
    }

    // 4. Insert score (trigger maintain_rolling_five_scores will atomically keep latest 5 active)
    const { data: inserted, error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score: input.score,
        played_date: input.playedDate,
        is_active: true,
      })
      .select('*')
      .single();

    if (insertError || !inserted) {
      return {
        success: false,
        error: insertError?.message || 'Failed to record score.',
        code: 'INSERT_FAILED',
      };
    }

    const { invalidateCache } = await import('@/lib/memory-cache');
    invalidateCache(`user_scores:${user.id}`);
    invalidateCache('admin:');

    return {
      success: true,
      data: {
        id: inserted.id,
        userId: inserted.user_id,
        score: inserted.score,
        playedDate: inserted.played_date,
        isActive: inserted.is_active,
        createdAt: inserted.created_at,
        updatedAt: inserted.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record round.';
    return { success: false, error: message, code: 'SCORE_ERROR' };
  }
}

export async function updateScoreAction(
  input: UpdateScoreInput
): Promise<ActionResult<GolfScore>> {
  try {
    const user = await requireAuth();
    await requireActiveSubscription(user.id);

    // 1. Validate score limits
    const scoreVal = validateStablefordScore(input.score);
    if (!scoreVal.isValid) {
      return { success: false, error: scoreVal.error || 'Invalid score', code: 'INVALID_SCORE' };
    }

    // 2. Validate played date
    const dateVal = validatePlayedDate(input.playedDate);
    if (!dateVal.isValid) {
      return { success: false, error: dateVal.error || 'Invalid date', code: 'INVALID_DATE' };
    }

    const supabase = await createServerSupabaseClient();

    // 3. Ensure no conflicting date for another score
    const { data: duplicateDate } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('played_date', input.playedDate)
      .neq('id', input.id)
      .maybeSingle();

    if (duplicateDate) {
      return {
        success: false,
        error: 'Another recorded round already exists on this date.',
        code: 'DUPLICATE_DATE',
      };
    }

    // 4. Update the score record
    const { data: updated, error: updateError } = await supabase
      .from('scores')
      .update({
        score: input.score,
        played_date: input.playedDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return {
        success: false,
        error: updateError?.message || 'Failed to update score.',
        code: 'UPDATE_FAILED',
      };
    }

    const { invalidateCache } = await import('@/lib/memory-cache');
    invalidateCache(`user_scores:${user.id}`);
    invalidateCache('admin:');

    return {
      success: true,
      data: {
        id: updated.id,
        userId: updated.user_id,
        score: updated.score,
        playedDate: updated.played_date,
        isActive: updated.is_active,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update round.';
    return { success: false, error: message, code: 'UPDATE_ERROR' };
  }
}

export async function deleteScoreAction(
  scoreId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', user.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || 'Failed to delete score.',
        code: 'DELETE_FAILED',
      };
    }

    const { invalidateCache } = await import('@/lib/memory-cache');
    invalidateCache(`user_scores:${user.id}`);
    invalidateCache('admin:');

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete round.';
    return { success: false, error: message, code: 'DELETE_ERROR' };
  }
}

export async function getUserScoresAction(): Promise<ActionResult<UserScoresSummary>> {
  try {
    const user = await requireAuth();
    const cacheKey = `user_scores:${user.id}`;
    const { getCached, setCached } = await import('@/lib/memory-cache');
    const cached = getCached<UserScoresSummary>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const supabase = await createServerSupabaseClient();

    const { data: rows, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, code: 'QUERY_FAILED' };
    }

    const allScores: GolfScore[] = (rows || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      score: row.score,
      playedDate: row.played_date,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const activeScores = allScores.filter((s) => s.isActive);
    const historicalScores = allScores.filter((s) => !s.isActive);
    const stats = calculateScorecardStats(allScores);

    const summary: UserScoresSummary = {
      activeScores,
      historicalScores,
      totalSubmitted: allScores.length,
      stats,
    };

    setCached(cacheKey, summary, 30);
    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load scores.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}
