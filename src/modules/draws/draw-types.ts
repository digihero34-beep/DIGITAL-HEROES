export type DrawMode = 'random' | 'algorithmic' | 'guaranteed_test';

export type DrawStatus =
  | 'draft'
  | 'scheduled'
  | 'simulating'
  | 'published'
  | 'completed'
  | 'cancelled';

export type MatchTier = 'match_5' | 'match_4' | 'match_3';

export type WinningNumbers = [number, number, number, number, number];

export interface SubscriberDrawEntry {
  userId: string;
  userEmail: string;
  fullName?: string;
  activeScores: number[];
}

export interface MatchResult {
  userId: string;
  userEmail: string;
  fullName?: string;
  matchCount: number;
  matchedNumbers: number[];
  matchTier: MatchTier | null;
}

export interface SimulationBreakdown {
  simulatedNumbers: WinningNumbers;
  drawMode: DrawMode;
  totalEligibleSubscribers: number;
  match5Count: number;
  match4Count: number;
  match3Count: number;
  winners: MatchResult[];
}

export interface DrawRecord {
  id: string;
  drawNumber: number;
  scheduledFor: string;
  drawMode: DrawMode;
  status: DrawStatus;
  winningNumbers?: WinningNumbers | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  totalPoolCents?: number;
}

