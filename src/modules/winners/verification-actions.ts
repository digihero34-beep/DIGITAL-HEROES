'use server';

import { requireAuth, requireAdmin } from '@/modules/auth/server-guards';
import { createServerSupabaseClient } from '@/infrastructure/database/supabase-server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { ActionResult } from '@/modules/auth/auth-actions';
import {
  WinnerRecord,
  WinnerVerificationRecord,
  PayoutRecord,
  ProofUploadInput,
  VerificationStatus,
} from './winner-types';
import {
  validateProofUpload,
  canSubmitProof,
} from './verification-validation';

interface WinnerDbRow {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: 'match_5' | 'match_4' | 'match_3';
  matched_numbers: number[];
  prize_amount_cents: number;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  draws?: {
    draw_number: number;
    scheduled_for: string;
  } | null;
  winner_verifications?: {
    id: string;
    proof_storage_path: string;
    proof_filename: string;
    proof_file_size: number;
    proof_mime_type: string;
    submitted_at: string;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    admin_notes?: string | null;
    status: VerificationStatus;
    created_at: string;
    updated_at: string;
  } | null;
  payouts?: {
    id: string;
    amount_cents: number;
    currency: string;
    status: 'pending' | 'processing' | 'paid' | 'failed';
    transaction_reference?: string | null;
    processed_by?: string | null;
    paid_at?: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

function mapWinnerRecord(row: WinnerDbRow): WinnerRecord {
  const verification = row.winner_verifications
    ? {
        id: row.winner_verifications.id,
        winnerId: row.id,
        userId: row.user_id,
        proofStoragePath: row.winner_verifications.proof_storage_path,
        proofFilename: row.winner_verifications.proof_filename,
        proofFileSize: row.winner_verifications.proof_file_size,
        proofMimeType: row.winner_verifications.proof_mime_type,
        submittedAt: row.winner_verifications.submitted_at,
        reviewedBy: row.winner_verifications.reviewed_by,
        reviewedAt: row.winner_verifications.reviewed_at,
        adminNotes: row.winner_verifications.admin_notes,
        status: row.winner_verifications.status,
        createdAt: row.winner_verifications.created_at,
        updatedAt: row.winner_verifications.updated_at,
      }
    : null;

  const payout = row.payouts
    ? {
        id: row.payouts.id,
        winnerId: row.id,
        userId: row.user_id,
        amountCents: row.payouts.amount_cents,
        currency: row.payouts.currency,
        status: row.payouts.status,
        transactionReference: row.payouts.transaction_reference,
        processedBy: row.payouts.processed_by,
        paidAt: row.payouts.paid_at,
        createdAt: row.payouts.created_at,
        updatedAt: row.payouts.updated_at,
      }
    : null;

  return {
    id: row.id,
    drawId: row.draw_id,
    userId: row.user_id,
    matchTier: row.match_tier,
    matchedNumbers: row.matched_numbers,
    prizeAmountCents: row.prize_amount_cents,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    drawNumber: row.draws?.draw_number,
    scheduledFor: row.draws?.scheduled_for,
    verification,
    payout,
  };
}

export async function getUserWinningsAction(): Promise<ActionResult<WinnerRecord[]>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data: rows, error } = await supabase
      .from('winners')
      .select(`
        *,
        draws (
          draw_number,
          scheduled_for
        ),
        winner_verifications (*),
        payouts (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !rows) {
      return { success: false, error: error?.message || 'Failed to query winnings.', code: 'QUERY_ERROR' };
    }

    const winnings = (rows as unknown as WinnerDbRow[]).map(mapWinnerRecord);
    return { success: true, data: winnings };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve winnings.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}

export async function getWinnerClaimAction(
  winnerId: string
): Promise<ActionResult<WinnerRecord | null>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data: row, error } = await supabase
      .from('winners')
      .select(`
        *,
        draws (
          draw_number,
          scheduled_for
        ),
        winner_verifications (*),
        payouts (*)
      `)
      .eq('id', winnerId)
      .maybeSingle();

    if (error || !row) {
      return { success: true, data: null };
    }

    const winner = mapWinnerRecord(row as unknown as WinnerDbRow);

    // Enforce data boundary: only owner or admin can view
    if (winner.userId !== user.id && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access to claim record.', code: 'UNAUTHORIZED' };
    }

    return { success: true, data: winner };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve claim.';
    return { success: false, error: message, code: 'FETCH_ERROR' };
  }
}

export async function submitProofAction(
  input: ProofUploadInput
): Promise<ActionResult<WinnerVerificationRecord>> {
  try {
    const user = await requireAuth();

    // 1. Validate file constraints
    const validation = validateProofUpload(input.proofFileSize, input.proofMimeType);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid proof document.',
        code: 'INVALID_PROOF',
      };
    }

    // 2. Fetch winner record and verify ownership
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from('winners')
      .select('id, user_id, verification_status')
      .eq('id', input.winnerId)
      .single();

    if (winnerError || !winner) {
      return { success: false, error: 'Winning claim record not found.', code: 'NOT_FOUND' };
    }

    if (winner.user_id !== user.id) {
      return {
        success: false,
        error: 'You do not have authorization to submit proof for this prize.',
        code: 'FORBIDDEN',
      };
    }

    if (!canSubmitProof(winner.verification_status)) {
      return {
        success: false,
        error: `Cannot submit proof while verification is in '${winner.verification_status}' status.`,
        code: 'INVALID_STATUS',
      };
    }

    const now = new Date().toISOString();

    // 3. Upsert into public.winner_verifications
    const { data: upsertedVerification, error: verError } = await supabaseAdmin
      .from('winner_verifications')
      .upsert(
        {
          winner_id: winner.id,
          user_id: user.id,
          proof_storage_path: input.proofStoragePath,
          proof_filename: input.proofFilename,
          proof_file_size: input.proofFileSize,
          proof_mime_type: input.proofMimeType,
          submitted_at: now,
          status: 'submitted',
          updated_at: now,
        },
        { onConflict: 'winner_id' }
      )
      .select('*')
      .single();

    if (verError || !upsertedVerification) {
      return {
        success: false,
        error: `Failed to save proof record: ${verError?.message}`,
        code: 'UPSERT_FAILED',
      };
    }

    // 4. Transition status on public.winners
    await supabaseAdmin
      .from('winners')
      .update({
        verification_status: 'submitted',
        updated_at: now,
      })
      .eq('id', winner.id);

    return {
      success: true,
      data: {
        id: upsertedVerification.id,
        winnerId: upsertedVerification.winner_id,
        userId: upsertedVerification.user_id,
        proofStoragePath: upsertedVerification.proof_storage_path,
        proofFilename: upsertedVerification.proof_filename,
        proofFileSize: upsertedVerification.proof_file_size,
        proofMimeType: upsertedVerification.proof_mime_type,
        submittedAt: upsertedVerification.submitted_at,
        reviewedBy: upsertedVerification.reviewed_by,
        reviewedAt: upsertedVerification.reviewed_at,
        adminNotes: upsertedVerification.admin_notes,
        status: upsertedVerification.status,
        createdAt: upsertedVerification.created_at,
        updatedAt: upsertedVerification.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proof submission failed.';
    return { success: false, error: message, code: 'SUBMISSION_ERROR' };
  }
}

export async function approveVerificationAction(params: {
  verificationId: string;
  adminNotes?: string;
}): Promise<
  ActionResult<{
    verification: WinnerVerificationRecord;
    payout: PayoutRecord;
  }>
> {
  try {
    const admin = await requireAdmin();

    // 1. Fetch verification
    const { data: ver, error: verError } = await supabaseAdmin
      .from('winner_verifications')
      .select('*, winners(*)')
      .eq('id', params.verificationId)
      .single();

    if (verError || !ver) {
      return { success: false, error: 'Verification record not found.', code: 'NOT_FOUND' };
    }

    const winner = ver.winners as unknown as { id: string; user_id: string; prize_amount_cents: number };
    const now = new Date().toISOString();

    // 2. Update verification to approved
    const { data: updatedVer, error: updateVerError } = await supabaseAdmin
      .from('winner_verifications')
      .update({
        status: 'approved',
        reviewed_by: admin.id,
        reviewed_at: now,
        admin_notes: params.adminNotes || null,
        updated_at: now,
      })
      .eq('id', ver.id)
      .select('*')
      .single();

    if (updateVerError || !updatedVer) {
      return { success: false, error: 'Failed to approve verification.', code: 'UPDATE_FAILED' };
    }

    // 3. Update winners table
    await supabaseAdmin
      .from('winners')
      .update({
        verification_status: 'approved',
        updated_at: now,
      })
      .eq('id', winner.id);

    // 4. Provision pending payout
    const { data: payout, error: payoutError } = await supabaseAdmin
      .from('payouts')
      .upsert(
        {
          winner_id: winner.id,
          user_id: winner.user_id,
          amount_cents: winner.prize_amount_cents,
          currency: 'GBP',
          status: 'pending',
          updated_at: now,
        },
        { onConflict: 'winner_id' }
      )
      .select('*')
      .single();

    if (payoutError || !payout) {
      return {
        success: false,
        error: `Failed to initialize payout: ${payoutError?.message}`,
        code: 'PAYOUT_INIT_FAILED',
      };
    }

    return {
      success: true,
      data: {
        verification: {
          id: updatedVer.id,
          winnerId: updatedVer.winner_id,
          userId: updatedVer.user_id,
          proofStoragePath: updatedVer.proof_storage_path,
          proofFilename: updatedVer.proof_filename,
          proofFileSize: updatedVer.proof_file_size,
          proofMimeType: updatedVer.proof_mime_type,
          submittedAt: updatedVer.submitted_at,
          reviewedBy: updatedVer.reviewed_by,
          reviewedAt: updatedVer.reviewed_at,
          adminNotes: updatedVer.admin_notes,
          status: updatedVer.status,
          createdAt: updatedVer.created_at,
          updatedAt: updatedVer.updated_at,
        },
        payout: {
          id: payout.id,
          winnerId: payout.winner_id,
          userId: payout.user_id,
          amountCents: payout.amount_cents,
          currency: payout.currency,
          status: payout.status,
          transactionReference: payout.transaction_reference,
          processedBy: payout.processed_by,
          paidAt: payout.paid_at,
          createdAt: payout.created_at,
          updatedAt: payout.updated_at,
        },
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Approval failed.';
    return { success: false, error: message, code: 'APPROVAL_ERROR' };
  }
}

export async function rejectVerificationAction(params: {
  verificationId: string;
  adminNotes: string;
}): Promise<ActionResult<WinnerVerificationRecord>> {
  try {
    const admin = await requireAdmin();

    if (!params.adminNotes || params.adminNotes.trim() === '') {
      return {
        success: false,
        error: 'An explanation must be provided when rejecting verification.',
        code: 'NOTES_REQUIRED',
      };
    }

    const { data: ver, error: verError } = await supabaseAdmin
      .from('winner_verifications')
      .select('id, winner_id')
      .eq('id', params.verificationId)
      .single();

    if (verError || !ver) {
      return { success: false, error: 'Verification record not found.', code: 'NOT_FOUND' };
    }

    const now = new Date().toISOString();

    const { data: updatedVer, error: updateVerError } = await supabaseAdmin
      .from('winner_verifications')
      .update({
        status: 'rejected',
        reviewed_by: admin.id,
        reviewed_at: now,
        admin_notes: params.adminNotes.trim(),
        updated_at: now,
      })
      .eq('id', ver.id)
      .select('*')
      .single();

    if (updateVerError || !updatedVer) {
      return { success: false, error: 'Failed to reject verification.', code: 'UPDATE_FAILED' };
    }

    await supabaseAdmin
      .from('winners')
      .update({
        verification_status: 'rejected',
        updated_at: now,
      })
      .eq('id', ver.winner_id);

    return {
      success: true,
      data: {
        id: updatedVer.id,
        winnerId: updatedVer.winner_id,
        userId: updatedVer.user_id,
        proofStoragePath: updatedVer.proof_storage_path,
        proofFilename: updatedVer.proof_filename,
        proofFileSize: updatedVer.proof_file_size,
        proofMimeType: updatedVer.proof_mime_type,
        submittedAt: updatedVer.submitted_at,
        reviewedBy: updatedVer.reviewed_by,
        reviewedAt: updatedVer.reviewed_at,
        adminNotes: updatedVer.admin_notes,
        status: updatedVer.status,
        createdAt: updatedVer.created_at,
        updatedAt: updatedVer.updated_at,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rejection failed.';
    return { success: false, error: message, code: 'REJECT_ERROR' };
  }
}
