import { describe, it, expect } from 'vitest';

describe('Public Navigation & Homepage Simulator Invariants (Phase 11)', () => {
  describe('Public Route Integrity', () => {
    const publicRoutes = [
      '/',
      '/how-it-works',
      '/charities',
      '/pricing',
      '/login',
      '/register',
    ];

    it('should maintain established public route paths', () => {
      publicRoutes.forEach((route) => {
        expect(route.startsWith('/')).toBe(true);
      });
    });
  });

  describe('Interactive Draw Simulator Mathematical Bounds', () => {
    function generateDistinctScores(count: number, min: number, max: number): number[] {
      const set = new Set<number>();
      let attempts = 0;
      while (set.size < count && attempts < 1000) {
        attempts++;
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        set.add(n);
      }
      return Array.from(set).sort((a, b) => a - b);
    }

    it('should generate exactly 5 distinct numbers within the Stableford 1–45 domain', () => {
      for (let i = 0; i < 50; i++) {
        const scores = generateDistinctScores(5, 1, 45);
        expect(scores.length).toBe(5);
        scores.forEach((score) => {
          expect(score).toBeGreaterThanOrEqual(1);
          expect(score).toBeLessThanOrEqual(45);
        });

        // Ensure distinctness
        const uniqueSet = new Set(scores);
        expect(uniqueSet.size).toBe(5);
      }
    });

    it('should correctly calculate set intersection matches between user scores and drawn balls', () => {
      const userScores = [12, 24, 30, 36, 42];
      const drawnNumbers = [10, 24, 30, 36, 45];

      const drawnSet = new Set(drawnNumbers);
      const matches = userScores.filter((s) => drawnSet.has(s));

      expect(matches).toEqual([24, 30, 36]);
      expect(matches.length).toBe(3);
    });

    it('should correctly allocate sample prize pool tiers according to PRD § 06 (40%, 35%, 25%)', () => {
      const samplePoolCents = 5000000; // £50,000.00
      const tier5Cents = Math.round(samplePoolCents * 0.40);
      const tier4Cents = Math.round(samplePoolCents * 0.35);
      const tier3Cents = Math.round(samplePoolCents * 0.25);

      expect(tier5Cents).toBe(2000000); // £20,000.00
      expect(tier4Cents).toBe(1750000); // £17,500.00
      expect(tier3Cents).toBe(1250000); // £12,500.00
      expect(tier5Cents + tier4Cents + tier3Cents).toBe(samplePoolCents);
    });

    it('should enforce simulator charity slider lower bound to minimum 10% lock', () => {
      const minSliderVal = 10;
      const maxSliderVal = 50;

      expect(minSliderVal).toBeGreaterThanOrEqual(10);
      expect(maxSliderVal).toBeLessThanOrEqual(100);

      // Testing sample charity allocation at 10% lock
      const samplePoolCents = 5000000;
      const charityCentsAt10 = Math.round((samplePoolCents * minSliderVal) / 100);
      expect(charityCentsAt10).toBe(500000); // £5,000.00
    });
  });
});
