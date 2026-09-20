export interface AdminPlatformStats {
  merkleRoot: string;
  merkleLockState: string;
  dualEntropyBeacon: {
    syncBlock: number;
    nistStatus: 'Healthy / Verified' | 'Syncing' | 'Degraded';
    latencyMs: number;
  };
  pendingVerificationsCount: number;
  ytdPhilanthropicYieldCents: number;
  activeSubscribersCount: number;
  totalSubscribersCount: number;
  nextDraw: {
    id: string;
    drawNumber: number;
    scheduledFor: string;
    status: string;
    totalPoolCents: number;
  } | null;
}

export interface AdminSubscriberRow {
  id: string;
  email: string;
  fullName?: string;
  role: 'public' | 'subscriber' | 'admin';
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'none';
  planName?: string;
  planInterval?: 'month' | 'year';
  charityName?: string;
  charityContributionPct?: number;
  activeScoresCount: number;
  lastScoreDate?: string;
  createdAt: string;
}

export interface AdminVerificationItem {
  id: string;
  winnerId: string;
  userId: string;
  patronName: string;
  patronEmail: string;
  drawNumber: number;
  matchTier: 'MATCH_5' | 'MATCH_4' | 'MATCH_3';
  matchedNumbers: number[];
  prizeAmountCents: number;
  proofFilename: string;
  proofStoragePath: string;
  proofFileSize: number;
  proofMimeType: string;
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  adminNotes?: string | null;
}

export interface AdminCharityItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  supporterCount: number;
  totalRaisedCents: number;
  eventsCount: number;
}
