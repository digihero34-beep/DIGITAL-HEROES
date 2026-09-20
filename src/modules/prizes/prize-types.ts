export interface PrizePoolCalculationInput {
  baseContributionCents: number;
  rolloverInCents: number;
  match5WinnersCount: number;
  match4WinnersCount: number;
  match3WinnersCount: number;
}

export interface PayoutPerTier {
  tier5PerWinnerCents: number;
  tier4PerWinnerCents: number;
  tier3PerWinnerCents: number;
  tier5RemaindersDistributed: number;
  tier4RemaindersDistributed: number;
  tier3RemaindersDistributed: number;
}

export interface PrizePoolCalculationResult {
  totalPoolCents: number;
  baseContributionCents: number;
  tier5PoolCents: number;
  tier4PoolCents: number;
  tier3PoolCents: number;
  rolloverInCents: number;
  rolloverOutCents: number;
  unclaimedTier4Cents: number;
  unclaimedTier3Cents: number;
  payoutPerTier: PayoutPerTier;
}

export interface WinnerPrizeAllocation {
  winnerId: string;
  userId: string;
  matchTier: 'match_5' | 'match_4' | 'match_3';
  prizeAmountCents: number;
}

export interface PrizePoolRecord {
  id: string;
  drawId: string;
  totalPoolCents: number;
  baseContributionCents: number;
  tier5PoolCents: number;
  tier4PoolCents: number;
  tier3PoolCents: number;
  rolloverInCents: number;
  rolloverOutCents: number;
  unclaimedTier4Cents: number;
  unclaimedTier3Cents: number;
  currency: string;
  createdAt: string;
}
