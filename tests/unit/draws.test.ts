import { describe, it, expect } from 'vitest';
import {
  validateDrawNumbers,
  generateRandomDrawNumbers,
  generateAlgorithmicDrawNumbers,
} from '@/modules/draws/draw-engine';
import {
  evaluateSubscriberMatch,
  evaluateDrawForSubscribers,
} from '@/modules/draws/matching-engine';
import { SubscriberDrawEntry, WinningNumbers } from '@/modules/draws/draw-types';

describe('Draw Engine & Matching Invariant Tests (PRD § 06)', () => {
  describe('Draw Numbers Validation Rules', () => {
    it('should validate legal 5-number draw within 1..45 range', () => {
      const legal = [3, 15, 22, 34, 45];
      const res = validateDrawNumbers(legal);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should reject draws with fewer or more than 5 numbers', () => {
      expect(validateDrawNumbers([1, 2, 3, 4]).isValid).toBe(false);
      expect(validateDrawNumbers([1, 2, 3, 4, 5, 6]).isValid).toBe(false);
      expect(validateDrawNumbers([]).isValid).toBe(false);
    });

    it('should reject numbers below 1 or above 45', () => {
      expect(validateDrawNumbers([0, 10, 20, 30, 40]).isValid).toBe(false);
      expect(validateDrawNumbers([5, 10, 20, 30, 46]).isValid).toBe(false);
      expect(validateDrawNumbers([-5, 10, 20, 30, 40]).isValid).toBe(false);
    });

    it('should reject duplicate numbers in the draw set', () => {
      const duplicates = [10, 10, 20, 30, 40];
      const res = validateDrawNumbers(duplicates);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Duplicate found: 10');
    });

    it('should reject decimal or non-integer values', () => {
      expect(validateDrawNumbers([10, 20.5, 30, 40, 45]).isValid).toBe(false);
    });
  });

  describe('Random Draw Generation (CSPRNG)', () => {
    it('should generate exactly 5 unique integers between 1 and 45 sorted ascending', () => {
      const drawn = generateRandomDrawNumbers();
      expect(drawn).toHaveLength(5);

      // Verify all in range 1..45
      drawn.forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
        expect(Number.isInteger(n)).toBe(true);
      });

      // Verify uniqueness
      const unique = new Set(drawn);
      expect(unique.size).toBe(5);

      // Verify sorted ascending
      for (let i = 0; i < drawn.length - 1; i++) {
        expect(drawn[i]).toBeLessThan(drawn[i + 1]);
      }
    });

    it('should utilize custom mock generator deterministically', () => {
      const mockSequence = [42, 7, 19, 3, 31];
      let idx = 0;
      const mockRandom = () => mockSequence[idx++];

      const drawn = generateRandomDrawNumbers(mockRandom);
      expect(drawn).toEqual([3, 7, 19, 31, 42]);
    });
  });

  describe('Algorithmic Weighted Draw Generation (Laplace Smoothing)', () => {
    it('should generate 5 distinct sorted numbers from frequency map', () => {
      const mockFrequencies = [36, 36, 36, 40, 40, 18, 22];
      const drawn = generateAlgorithmicDrawNumbers(mockFrequencies);

      expect(drawn).toHaveLength(5);
      expect(new Set(drawn).size).toBe(5);

      for (let i = 0; i < drawn.length - 1; i++) {
        expect(drawn[i]).toBeLessThan(drawn[i + 1]);
      }
    });

    it('should sample heavily-weighted numbers with high probability', () => {
      // Create a distribution where number 36 has overwhelming frequency
      const frequencies = new Map<number, number>();
      frequencies.set(36, 10000);

      // Across 10 algorithmic draws, 36 should be drawn consistently
      let drawn36Count = 0;
      for (let i = 0; i < 10; i++) {
        const drawn = generateAlgorithmicDrawNumbers(frequencies);
        if (drawn.includes(36)) {
          drawn36Count++;
        }
      }

      expect(drawn36Count).toBeGreaterThanOrEqual(9);
    });

    it('should never draw duplicate numbers in algorithmic mode (sampling without replacement)', () => {
      for (let i = 0; i < 20; i++) {
        const drawn = generateAlgorithmicDrawNumbers([36, 36, 36, 36, 36]);
        expect(new Set(drawn).size).toBe(5);
      }
    });
  });

  describe('Subscriber Match Evaluation (Set Intersection)', () => {
    const winningNumbers: WinningNumbers = [10, 20, 30, 40, 45];

    it('should qualify 5-number match as Tier 5', () => {
      const userScores = [10, 20, 30, 40, 45];
      const result = evaluateSubscriberMatch(userScores, winningNumbers);

      expect(result.matchCount).toBe(5);
      expect(result.matchTier).toBe('match_5');
      expect(result.matchedNumbers).toEqual([10, 20, 30, 40, 45]);
    });

    it('should qualify 4-number match as Tier 4', () => {
      const userScores = [10, 20, 30, 40, 12];
      const result = evaluateSubscriberMatch(userScores, winningNumbers);

      expect(result.matchCount).toBe(4);
      expect(result.matchTier).toBe('match_4');
      expect(result.matchedNumbers).toEqual([10, 20, 30, 40]);
    });

    it('should qualify 3-number match as Tier 3', () => {
      const userScores = [10, 20, 30, 11, 12];
      const result = evaluateSubscriberMatch(userScores, winningNumbers);

      expect(result.matchCount).toBe(3);
      expect(result.matchTier).toBe('match_3');
      expect(result.matchedNumbers).toEqual([10, 20, 30]);
    });

    it('should assign no tier to 2-number or fewer matches', () => {
      const twoMatches = evaluateSubscriberMatch([10, 20, 1, 2, 3], winningNumbers);
      expect(twoMatches.matchCount).toBe(2);
      expect(twoMatches.matchTier).toBeNull();

      const zeroMatches = evaluateSubscriberMatch([1, 2, 3, 4, 5], winningNumbers);
      expect(zeroMatches.matchCount).toBe(0);
      expect(zeroMatches.matchTier).toBeNull();
    });

    it('should prevent duplicate user scores from inflating matches (ASM-02 Set Intersection)', () => {
      // User entered 30 on two different dates
      const duplicateScores = [30, 30, 1, 2, 3];
      const result = evaluateSubscriberMatch(duplicateScores, winningNumbers);

      // Ball 30 is matched at most once!
      expect(result.matchCount).toBe(1);
      expect(result.matchedNumbers).toEqual([30]);
      expect(result.matchTier).toBeNull();
    });
  });

  describe('Cohort Simulation Engine', () => {
    it('should accurately aggregate match counts across all eligible subscribers', () => {
      const winningNumbers: WinningNumbers = [5, 15, 25, 35, 45];

      const subscribers: SubscriberDrawEntry[] = [
        {
          userId: 'u1',
          userEmail: 'winner5@test.com',
          activeScores: [5, 15, 25, 35, 45], // 5 matches
        },
        {
          userId: 'u2',
          userEmail: 'winner4@test.com',
          activeScores: [5, 15, 25, 35, 1], // 4 matches
        },
        {
          userId: 'u3',
          userEmail: 'winner3@test.com',
          activeScores: [5, 15, 25, 2, 3], // 3 matches
        },
        {
          userId: 'u4',
          userEmail: 'loser@test.com',
          activeScores: [1, 2, 3, 4, 6], // 0 matches
        },
      ];

      const breakdown = evaluateDrawForSubscribers(subscribers, winningNumbers, 'random');

      expect(breakdown.totalEligibleSubscribers).toBe(4);
      expect(breakdown.match5Count).toBe(1);
      expect(breakdown.match4Count).toBe(1);
      expect(breakdown.match3Count).toBe(1);
      expect(breakdown.winners).toHaveLength(3);
    });
  });
});
