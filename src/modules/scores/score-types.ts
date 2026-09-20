export interface GolfScore {
  id: string;
  userId: string;
  score: number;
  playedDate: string; // Format: YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScoreInput {
  score: number;
  playedDate: string;
}

export interface UpdateScoreInput {
  id: string;
  score: number;
  playedDate: string;
}

export interface ScoreValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UserScoresSummary {
  activeScores: GolfScore[];
  historicalScores: GolfScore[];
  totalSubmitted: number;
  stats: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}
