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
  tagline?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  supporterCount: number;
  totalRaisedCents: number;
  eventsCount: number;
}

export interface AdminUserDetail {
  profile: {
    id: string;
    email: string;
    fullName?: string;
    role: 'public' | 'subscriber' | 'admin';
    createdAt: string;
  };
  subscription: {
    id?: string;
    planId?: string;
    planName?: string;
    status: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  } | null;
  scores: {
    activeScores: Array<{ id: string; score: number; playedDate: string; createdAt: string }>;
    historicalScores: Array<{ id: string; score: number; playedDate: string; createdAt: string }>;
    totalSubmitted: number;
    stats: {
      averageScore: number;
      highestScore: number;
      lowestScore: number;
    };
  };
  charityPreference: {
    charityId: string;
    charityName: string;
    category: string;
    contributionPercentage: number;
  } | null;
  winnings: Array<{
    id: string;
    drawNumber: number;
    matchTier: string;
    matchedNumbers: number[];
    prizeAmountCents: number;
    verificationStatus: string;
    payoutStatus?: string;
    createdAt: string;
  }>;
}

