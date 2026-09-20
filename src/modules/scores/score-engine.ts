import { ScoreValidationResult, GolfScore } from './score-types';

export const STABLEFORD_MIN_SCORE = 1;
export const STABLEFORD_MAX_SCORE = 45;
export const ROLLING_ACTIVE_SCORE_LIMIT = 5;

/**
 * Validates that a submitted score conforms to official Stableford limits (1..45).
 */
export function validateStablefordScore(score: number): ScoreValidationResult {
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, error: 'Score must be a valid number.' };
  }

  if (!Number.isInteger(score)) {
    return { isValid: false, error: 'Stableford score must be a whole integer.' };
  }

  if (score < STABLEFORD_MIN_SCORE) {
    return {
      isValid: false,
      error: `Stableford score cannot be less than ${STABLEFORD_MIN_SCORE}.`,
    };
  }

  if (score > STABLEFORD_MAX_SCORE) {
    return {
      isValid: false,
      error: `Stableford score cannot exceed ${STABLEFORD_MAX_SCORE}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that a played date is correctly formatted (YYYY-MM-DD) and not in the future.
 */
export function validatePlayedDate(playedDate: string): ScoreValidationResult {
  if (!playedDate || typeof playedDate !== 'string') {
    return { isValid: false, error: 'Played date is required.' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(playedDate)) {
    return { isValid: false, error: 'Date must be formatted as YYYY-MM-DD.' };
  }

  const [year, month, day] = playedDate.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return { isValid: false, error: 'Invalid calendar date.' };
  }

  // Prohibit future dates (using user's current day boundary)
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (parsedDate > today) {
    return { isValid: false, error: 'Cannot enter scores for a future date.' };
  }

  return { isValid: true };
}

/**
 * Resolves which scores should be marked active vs inactive under the 5-score rolling FIFO rule.
 * Sorts primarily by playedDate DESC, secondarily by createdAt DESC.
 */
export function resolveRollingFiveScores<T extends { id: string; playedDate: string; createdAt?: string }>(
  scores: T[]
): { activeIds: Set<string>; inactiveIds: Set<string> } {
  const sorted = [...scores].sort((a, b) => {
    if (a.playedDate !== b.playedDate) {
      return b.playedDate.localeCompare(a.playedDate);
    }
    const aCreated = a.createdAt || '';
    const bCreated = b.createdAt || '';
    return bCreated.localeCompare(aCreated);
  });

  const activeIds = new Set<string>();
  const inactiveIds = new Set<string>();

  sorted.forEach((item, index) => {
    if (index < ROLLING_ACTIVE_SCORE_LIMIT) {
      activeIds.add(item.id);
    } else {
      inactiveIds.add(item.id);
    }
  });

  return { activeIds, inactiveIds };
}

/**
 * Computes performance analytics across a collection of recorded scores.
 */
export function calculateScorecardStats(scores: GolfScore[]): {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
} {
  if (scores.length === 0) {
    return { averageScore: 0, highestScore: 0, lowestScore: 0 };
  }

  const values = scores.map((s) => s.score);
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const average = Math.round((sum / values.length) * 10) / 10;
  const highestScore = Math.max(...values);
  const lowestScore = Math.min(...values);

  return { averageScore: average, highestScore, lowestScore };
}
