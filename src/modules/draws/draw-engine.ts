import { randomInt } from 'crypto';
import { WinningNumbers } from './draw-types';

export const DRAW_MIN_NUMBER = 1;
export const DRAW_MAX_NUMBER = 45;
export const DRAW_NUMBER_COUNT = 5;

/**
 * Validates whether an array of numbers constitutes a legal draw result.
 */
export function validateDrawNumbers(numbers: number[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(numbers) || numbers.length !== DRAW_NUMBER_COUNT) {
    return {
      isValid: false,
      error: `A draw must contain exactly ${DRAW_NUMBER_COUNT} numbers.`,
    };
  }

  const seen = new Set<number>();

  for (const num of numbers) {
    if (typeof num !== 'number' || !Number.isInteger(num)) {
      return { isValid: false, error: 'All draw numbers must be whole integers.' };
    }

    if (num < DRAW_MIN_NUMBER || num > DRAW_MAX_NUMBER) {
      return {
        isValid: false,
        error: `Draw numbers must be between ${DRAW_MIN_NUMBER} and ${DRAW_MAX_NUMBER} inclusive.`,
      };
    }

    if (seen.has(num)) {
      return { isValid: false, error: `Draw numbers must be unique. Duplicate found: ${num}` };
    }

    seen.add(num);
  }

  return { isValid: true };
}

/**
 * Generates 5 cryptographically secure random numbers from 1..45 without replacement.
 */
export function generateRandomDrawNumbers(
  customRandomInt?: (min: number, max: number) => number
): WinningNumbers {
  const getRandom =
    customRandomInt || ((min: number, max: number) => randomInt(min, max + 1));

  const chosen = new Set<number>();

  while (chosen.size < DRAW_NUMBER_COUNT) {
    const candidate = getRandom(DRAW_MIN_NUMBER, DRAW_MAX_NUMBER);
    chosen.add(candidate);
  }

  const sorted = Array.from(chosen).sort((a, b) => a - b);
  return sorted as WinningNumbers;
}

/**
 * Generates 5 numbers from 1..45 weighted by subscriber score frequency with Laplace (+1) smoothing.
 * Sampling is performed strictly without replacement.
 */
export function generateAlgorithmicDrawNumbers(
  scoreFrequencies: Map<number, number> | Record<number, number> | number[],
  customPrng?: () => number
): WinningNumbers {
  const getPrng = customPrng || Math.random;

  // 1. Build frequency lookup
  const freqMap = new Map<number, number>();

  if (Array.isArray(scoreFrequencies)) {
    scoreFrequencies.forEach((score) => {
      if (score >= DRAW_MIN_NUMBER && score <= DRAW_MAX_NUMBER) {
        freqMap.set(score, (freqMap.get(score) || 0) + 1);
      }
    });
  } else if (scoreFrequencies instanceof Map) {
    scoreFrequencies.forEach((count, score) => {
      freqMap.set(score, count);
    });
  } else if (typeof scoreFrequencies === 'object') {
    Object.entries(scoreFrequencies).forEach(([scoreStr, count]) => {
      freqMap.set(Number(scoreStr), Number(count));
    });
  }

  // 2. Initialize candidates with Laplace (+1) smoothed weights
  // P(i) proportional to (freq(i) + 1)
  interface Candidate {
    number: number;
    weight: number;
  }

  const candidates: Candidate[] = [];
  for (let i = DRAW_MIN_NUMBER; i <= DRAW_MAX_NUMBER; i++) {
    const observedCount = freqMap.get(i) || 0;
    candidates.push({
      number: i,
      weight: observedCount + 1,
    });
  }

  // 3. Draw 5 numbers without replacement using weighted roulette selection
  const chosen: number[] = [];

  while (chosen.length < DRAW_NUMBER_COUNT && candidates.length > 0) {
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    const threshold = getPrng() * totalWeight;

    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < candidates.length; i++) {
      cumulative += candidates[i].weight;
      if (cumulative >= threshold) {
        selectedIndex = i;
        break;
      }
    }

    chosen.push(candidates[selectedIndex].number);
    // Remove the selected candidate so it cannot be chosen again (sampling without replacement)
    candidates.splice(selectedIndex, 1);
  }

  const sorted = chosen.sort((a, b) => a - b);
  return sorted as WinningNumbers;
}

/**
 * Generates 5 numbers guaranteed to match active subscriber scores for HR/evaluator testing.
 */
export function generateGuaranteedWinnerDrawNumbers(
  subscriberScoreSets: number[][]
): WinningNumbers {
  const chosen = new Set<number>();

  if (subscriberScoreSets.length > 0) {
    // Pick a target subscriber's set randomly
    const randomIdx = Math.floor(Math.random() * subscriberScoreSets.length);
    const targetSet = subscriberScoreSets[randomIdx];

    if (targetSet && targetSet.length > 0) {
      const uniqueScores = Array.from(
        new Set(targetSet.filter((s) => s >= DRAW_MIN_NUMBER && s <= DRAW_MAX_NUMBER))
      );
      // Guarantee at least 4 matching numbers from target subscriber to produce a Tier 4 or Tier 5 winner
      for (const score of uniqueScores) {
        chosen.add(score);
        if (chosen.size >= 4) break;
      }
    }
  }

  // Pick remaining numbers directly from all active subscriber score sets
  for (const set of subscriberScoreSets) {
    for (const score of set) {
      if (score >= DRAW_MIN_NUMBER && score <= DRAW_MAX_NUMBER) {
        chosen.add(score);
        if (chosen.size >= DRAW_NUMBER_COUNT) break;
      }
    }
    if (chosen.size >= DRAW_NUMBER_COUNT) break;
  }

  // Fill remainder if needed
  let candidate = DRAW_MIN_NUMBER;
  while (chosen.size < DRAW_NUMBER_COUNT && candidate <= DRAW_MAX_NUMBER) {
    if (!chosen.has(candidate)) {
      chosen.add(candidate);
    }
    candidate++;
  }

  const sorted = Array.from(chosen).sort((a, b) => a - b);
  return sorted as WinningNumbers;
}
