import {
  MatchTier,
  WinningNumbers,
  SubscriberDrawEntry,
  MatchResult,
  SimulationBreakdown,
  DrawMode,
} from './draw-types';

/**
 * Evaluates an individual subscriber's active scores against the official winning numbers.
 * Implements Set Intersection Matching: duplicate scores match a drawn number at most once.
 */
export function evaluateSubscriberMatch(
  userScores: number[],
  winningNumbers: number[]
): { matchCount: number; matchedNumbers: number[]; matchTier: MatchTier | null } {
  const uniqueScores = Array.from(new Set(userScores));
  const winningSet = new Set(winningNumbers);

  const matchedNumbers = uniqueScores
    .filter((num) => winningSet.has(num))
    .sort((a, b) => a - b);

  const matchCount = matchedNumbers.length;

  let matchTier: MatchTier | null = null;
  if (matchCount >= 5) {
    matchTier = 'match_5';
  } else if (matchCount === 4) {
    matchTier = 'match_4';
  } else if (matchCount === 3) {
    matchTier = 'match_3';
  }

  return {
    matchCount,
    matchedNumbers,
    matchTier,
  };
}

/**
 * Runs matching evaluation across an entire cohort of eligible subscribers for a given draw.
 */
export function evaluateDrawForSubscribers(
  subscribers: SubscriberDrawEntry[],
  winningNumbers: WinningNumbers,
  drawMode: DrawMode
): SimulationBreakdown {
  let match5Count = 0;
  let match4Count = 0;
  let match3Count = 0;
  const winners: MatchResult[] = [];

  for (const subscriber of subscribers) {
    const { matchCount, matchedNumbers, matchTier } = evaluateSubscriberMatch(
      subscriber.activeScores,
      winningNumbers
    );

    if (matchTier) {
      if (matchTier === 'match_5') match5Count++;
      if (matchTier === 'match_4') match4Count++;
      if (matchTier === 'match_3') match3Count++;

      winners.push({
        userId: subscriber.userId,
        userEmail: subscriber.userEmail,
        fullName: subscriber.fullName,
        matchCount,
        matchedNumbers,
        matchTier,
      });
    }
  }

  return {
    simulatedNumbers: winningNumbers,
    drawMode,
    totalEligibleSubscribers: subscribers.length,
    match5Count,
    match4Count,
    match3Count,
    winners,
  };
}
