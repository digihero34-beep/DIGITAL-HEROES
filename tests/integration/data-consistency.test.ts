import { describe, it, expect } from 'vitest';
import {
  calculatePrizePoolTiers,
  distributeTierFundsEqually,
  formatCurrencyGBP,
} from '@/modules/prizes/prize-engine';
import { resolveRollingFiveScores } from '@/modules/scores/score-engine';
import { GolfScore } from '@/modules/scores/score-types';
import { validateContributionPercentage } from '@/modules/charities/charity-validation';

describe('Cross-System Data Consistency & Monetary Precision Tests (Target #10)', () => {
  describe('1. Monetary Integer-Cent Precision & Exact Penny Division', () => {
    it('should divide £1,000.00 among 3 winners with exact penny conservation', () => {
      const poolCents = 100000; // £1,000.00
      const winnerIds = ['winner_a', 'winner_b', 'winner_c'];

      const distributions = distributeTierFundsEqually(poolCents, winnerIds);

      expect(distributions).toHaveLength(3);
      // 100,000 / 3 = 33,333 remainder 1. First sorted winner gets 33,334; others 33,333.
      expect(distributions[0].amountCents).toBe(33334);
      expect(distributions[1].amountCents).toBe(33333);
      expect(distributions[2].amountCents).toBe(33333);

      const totalDispersed = distributions.reduce((sum, d) => sum + d.amountCents, 0);
      expect(totalDispersed).toBe(poolCents);
      expect(Number.isInteger(totalDispersed)).toBe(true);
    });

    it('should divide £25,000.00 among 7 winners with zero penny leakage', () => {
      const poolCents = 2500000; // £25,000.00
      const winnerIds = Array.from({ length: 7 }, (_, i) => `winner_${i + 1}`);

      const distributions = distributeTierFundsEqually(poolCents, winnerIds);

      expect(distributions).toHaveLength(7);
      const totalDispersed = distributions.reduce((sum, d) => sum + d.amountCents, 0);
      expect(totalDispersed).toBe(poolCents);

      // Verify every allocation is a strict integer
      for (const d of distributions) {
        expect(Number.isInteger(d.amountCents)).toBe(true);
      }
    });

    it('should divide prime prize amounts among prime winner cohorts (13 winners, £14,289.41)', () => {
      const poolCents = 1428941; // £14,289.41
      const winnerIds = Array.from({ length: 13 }, (_, i) => `beneficiary_${i}`);

      const distributions = distributeTierFundsEqually(poolCents, winnerIds);

      expect(distributions).toHaveLength(13);
      const sum = distributions.reduce((acc, curr) => acc + curr.amountCents, 0);
      expect(sum).toBe(poolCents);
    });

    it('should format all GBP amounts cleanly without IEEE 754 floating point artifacts', () => {
      expect(formatCurrencyGBP(2500)).toBe('£25.00');
      expect(formatCurrencyGBP(24000)).toBe('£240.00');
      expect(formatCurrencyGBP(10000000)).toBe('£100000.00');
      expect(formatCurrencyGBP(33334)).toBe('£333.34');
    });
  });

  describe('2. Prize Pool Conservation & Rollover Invariants (PRD § 07)', () => {
    it('should verify Tier 5 (40%), Tier 4 (35%), Tier 3 (25%) split conservation', () => {
      const baseContribution = 7500000; // £75,000.00
      const rolloverIn = 2500000; // £25,000.00

      const result = calculatePrizePoolTiers({
        baseContributionCents: baseContribution,
        rolloverInCents: rolloverIn,
        match5WinnersCount: 1,
        match4WinnersCount: 2,
        match3WinnersCount: 10,
      });

      // Verification of percentage splits from base
      expect(result.tier5PoolCents).toBe(3000000 + 2500000); // 40% of 75k = 30k + 25k rollover = 55k
      expect(result.tier4PoolCents).toBe(2625000); // 35% of 75k = 26.25k
      expect(result.tier3PoolCents).toBe(1875000); // 25% of 75k = 18.75k

      // Strict conservation equation
      const baseReconstructed =
        (result.tier5PoolCents - result.rolloverInCents) +
        result.tier4PoolCents +
        result.tier3PoolCents;

      expect(baseReconstructed).toBe(baseContribution);
      expect(result.totalPoolCents).toBe(baseContribution + rolloverIn);
    });

    it('should roll over 100% of Tier 5 jackpot when zero winners match 5 numbers', () => {
      const result = calculatePrizePoolTiers({
        baseContributionCents: 5000000, // £50,000.00
        rolloverInCents: 1000000, // £10,000.00
        match5WinnersCount: 0,
        match4WinnersCount: 3,
        match3WinnersCount: 15,
      });

      // Tier 5 base = 20,000 + 10,000 = 30,000
      expect(result.rolloverOutCents).toBe(3000000);
      expect(result.payoutPerTier.tier5PerWinnerCents).toBe(0);
    });

    it('should retain unclaimed Tier 4 & Tier 3 in platform escrow without rollover (PRD § 07)', () => {
      const result = calculatePrizePoolTiers({
        baseContributionCents: 10000000, // £100,000.00
        rolloverInCents: 0,
        match5WinnersCount: 2,
        match4WinnersCount: 0, // Zero Tier 4 winners
        match3WinnersCount: 0, // Zero Tier 3 winners
      });

      expect(result.unclaimedTier4Cents).toBe(3500000); // 35% retained
      expect(result.unclaimedTier3Cents).toBe(2500000); // 25% retained
      expect(result.rolloverOutCents).toBe(0); // Only Tier 5 rolls over
    });
  });

  describe('3. Score FIFO Rolling Set Consistency (PRD § 05)', () => {
    it('should enforce exactly 5 active scores when 6 scores are logged', () => {
      const allScores: GolfScore[] = [
        { id: '1', userId: 'u1', score: 36, playedDate: '2026-03-01', isActive: true, createdAt: '2026-03-01', updatedAt: '2026-03-01' },
        { id: '2', userId: 'u1', score: 38, playedDate: '2026-03-02', isActive: true, createdAt: '2026-03-02', updatedAt: '2026-03-02' },
        { id: '3', userId: 'u1', score: 40, playedDate: '2026-03-03', isActive: true, createdAt: '2026-03-03', updatedAt: '2026-03-03' },
        { id: '4', userId: 'u1', score: 32, playedDate: '2026-03-04', isActive: true, createdAt: '2026-03-04', updatedAt: '2026-03-04' },
        { id: '5', userId: 'u1', score: 41, playedDate: '2026-03-05', isActive: true, createdAt: '2026-03-05', updatedAt: '2026-03-05' },
        { id: '6', userId: 'u1', score: 44, playedDate: '2026-03-06', isActive: true, createdAt: '2026-03-06', updatedAt: '2026-03-06' },
      ];

      const { activeIds, inactiveIds } = resolveRollingFiveScores(allScores);

      expect(activeIds.size).toBe(5);
      expect(inactiveIds.size).toBe(1);
      expect(inactiveIds.has('1')).toBe(true); // Oldest score on 2026-03-01 deactivated
      expect(activeIds.has('6')).toBe(true); // Newest score active
    });
  });

  describe('4. Charity Contribution Range Consistency (PRD § 08)', () => {
    it('should enforce minimum 10% and maximum 100% boundary', () => {
      expect(validateContributionPercentage(10).isValid).toBe(true);
      expect(validateContributionPercentage(25).isValid).toBe(true);
      expect(validateContributionPercentage(50).isValid).toBe(true);
      expect(validateContributionPercentage(100).isValid).toBe(true);

      expect(validateContributionPercentage(9).isValid).toBe(false);
      expect(validateContributionPercentage(0).isValid).toBe(false);
      expect(validateContributionPercentage(-5).isValid).toBe(false);
      expect(validateContributionPercentage(101).isValid).toBe(false);
    });
  });
});
