import { VerificationStatus, PayoutStatus } from './winner-types';

export const ALLOWED_PROOF_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const MAX_PROOF_FILE_SIZE = 10 * 1024 * 1024; // 10MB = 10485760 bytes

/**
 * Validates uploaded proof document file size and MIME type.
 */
export function validateProofUpload(
  fileSize: number,
  mimeType: string
): { isValid: boolean; error?: string } {
  if (typeof fileSize !== 'number' || isNaN(fileSize) || fileSize <= 0) {
    return { isValid: false, error: 'File size must be greater than zero.' };
  }

  if (fileSize > MAX_PROOF_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds the 10MB platform limit (${(fileSize / (1024 * 1024)).toFixed(1)}MB provided).`,
    };
  }

  if (!mimeType || !ALLOWED_PROOF_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file format. Only JPG, PNG, WEBP, and PDF documents are supported.',
    };
  }

  return { isValid: true };
}

/**
 * Determines whether a winner is eligible to upload scorecard verification proof.
 */
export function canSubmitProof(currentStatus: VerificationStatus): boolean {
  return currentStatus === 'pending_proof' || currentStatus === 'rejected';
}

/**
 * Determines whether an admin can take review action on a verification.
 */
export function canReviewVerification(currentStatus: VerificationStatus): boolean {
  return currentStatus === 'submitted' || currentStatus === 'under_review';
}

/**
 * Determines whether a payout can be marked as completed.
 */
export function canCompletePayout(currentStatus: PayoutStatus): boolean {
  return currentStatus === 'pending' || currentStatus === 'processing';
}
