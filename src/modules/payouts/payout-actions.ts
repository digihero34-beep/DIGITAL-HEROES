'use server';

import { requireAdmin } from '@/modules/auth/server-guards';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { ActionResult } from '@/modules/auth/auth-actions';
import { PayoutRecord, PayoutStatus } from '@/modules/winners/winner-types';
import { canCompletePayout } from '@/modules/winners/verification-validation';

interface PayoutDbRow {
  id: string;
  winner_id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  status: PayoutStatus;
  transaction_reference?: string | null;
  processed_by?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

function mapPayoutRecord(row: PayoutDbRow): PayoutRecord {
  return {
    id: row.id,
    winnerId: row.winner_id,
    userId: row.user_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status,
    transactionReference: row.transaction_reference,
    processedBy: row.processed_by,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function completePayoutAction(params: {
  payoutId: string;
  transactionReference: string;
}): Promise<ActionResult<PayoutRecord>> {
  try {
    const admin = await requireAdmin();

    if (!params.transactionReference || params.transactionReference.trim() === '') {
      return {
        success: false,
        error: 'A valid transaction reference or bank transfer ID is required.',
        code: 'REFERENCE_REQUIRED',
      };
    }

    // 1. Fetch payout
    const { data: payout, error: fetchError } = await supabaseAdmin
      .from('payouts')
      .select('*')
      .eq('id', params.payoutId)
      .single();

    if (fetchError || !payout) {
      return { success: false, error: 'Payout record not found.', code: 'NOT_FOUND' };
    }

    if (!canCompletePayout(payout.status as PayoutStatus)) {
      return {
        success: false,
        error: `Cannot complete payout in '${payout.status}' status.`,
        code: 'INVALID_STATUS',
      };
    }

    const now = new Date().toISOString();

    // 2. Update to paid
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('payouts')
      .update({
        status: 'paid',
        transaction_reference: params.transactionReference.trim(),
        processed_by: admin.id,
        paid_at: now,
        updated_at: now,
      })
      .eq('id', payout.id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return { success: false, error: 'Failed to record payout completion.', code: 'UPDATE_FAILED' };
    }

    return {
      success: true,
      data: mapPayoutRecord(updated as unknown as PayoutDbRow),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payout execution failed.';
    return { success: false, error: message, code: 'PAYOUT_ERROR' };
  }
}

export async function getPayoutsAction(params?: {
  status?: PayoutStatus;
}): Promise<ActionResult<PayoutRecord[]>> {
  try {
    await requireAdmin();

    let query = supabaseAdmin
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const { data: rows, error } = await query;

    if (error || !rows) {
      return { success: false, error: error?.message || 'Failed to query payouts.', code: 'QUERY_ERROR' };
    }

    const payouts = (rows as unknown as PayoutDbRow[]).map(mapPayoutRecord);
    return { success: true, data: payouts };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve payouts.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}
