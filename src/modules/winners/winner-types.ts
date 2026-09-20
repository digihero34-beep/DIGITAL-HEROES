export type VerificationStatus =
  | 'pending_proof'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface WinnerVerificationRecord {
  id: string;
  winnerId: string;
  userId: string;
  proofStoragePath: string;
  proofFilename: string;
  proofFileSize: number;
  proofMimeType: string;
  submittedAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  adminNotes?: string | null;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRecord {
  id: string;
  winnerId: string;
  userId: string;
  amountCents: number;
  currency: string;
  status: PayoutStatus;
  transactionReference?: string | null;
  processedBy?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WinnerRecord {
  id: string;
  drawId: string;
  userId: string;
  matchTier: 'match_5' | 'match_4' | 'match_3';
  matchedNumbers: number[];
  prizeAmountCents: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  drawNumber?: number;
  scheduledFor?: string;
  verification?: WinnerVerificationRecord | null;
  payout?: PayoutRecord | null;
}

export interface ProofUploadInput {
  winnerId: string;
  proofStoragePath: string;
  proofFilename: string;
  proofFileSize: number;
  proofMimeType: string;
}
