import { describe, it, expect } from 'vitest';
import {
  calculatePrizePoolTiers,
  distributeTierFundsEqually,
  formatCurrencyGBP,
  TIER_5_PERCENTAGE,
  TIER_4_PERCENTAGE,
  TIER_3_PERCENTAGE,
} from '@/modules/prizes/prize-engine';

describe('Prize Pool Engine & Distribution Invariants (PRD § 07)', () => {
  describe('Percentage Allocation Specifications', () => {
    it('should configure PRD tier distribution percentages as 40%, 35%, and 25%', () => {
      expect(TIER_5_PERCENTAGE).toBe(40);
      expect(TIER_4_PERCENTAGE).toBe(35);
      expect(TIER_3_PERCENTAGE).toBe(25);
      expect(TIER_5_PERCENTAGE + TIER_4_PERCENTAGE + TIER_3_PERCENTAGE).toBe(100);
    });

    it('should split base prize pool accurately in integer cents', () => {
      // Base pool: £10,000.00 = 1,000,000 cents
      const result = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000,
        rolloverInCents: 0,
        match5WinnersCount: 1,
        match4WinnersCount: 2,
        match3WinnersCount: 5,
      });

      expect(result.baseContributionCents).toBe(1_000_000);
      expect(result.tier5PoolCents).toBe(400_000); // £4,000.00 (40%)
      expect(result.tier4PoolCents).toBe(350_000); // £3,500.00 (35%)
      expect(result.tier3PoolCents).toBe(250_000); // £2,500.00 (25%)
      expect(result.totalPoolCents).toBe(1_000_000);

      // Verify zero leak
      const sumTiers = result.tier5PoolCents + result.tier4PoolCents + result.tier3PoolCents;
      expect(sumTiers).toBe(result.totalPoolCents);
    });
  });

  describe('Tier 5 Rollover Mechanics', () => {
    it('should add incoming rollover funds directly into Tier 5 pool', () => {
      const result = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000, // 40% = 400,000
        rolloverInCents: 250_000, // Rollover in = £2,500.00
        match5WinnersCount: 1,
        match4WinnersCount: 0,
        match3WinnersCount: 0,
      });

      expect(result.rolloverInCents).toBe(250_000);
      expect(result.tier5PoolCents).toBe(650_000); // 400,000 base + 250,000 rollover
      expect(result.totalPoolCents).toBe(1_250_000);
      expect(result.rolloverOutCents).toBe(0); // Claimed by the 1 winner
    });

    it('should roll over entire Tier 5 jackpot into next month when zero Tier 5 winners', () => {
      const result = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000,
        rolloverInCents: 150_000,
        match5WinnersCount: 0, // No jackpot winner
        match4WinnersCount: 3,
        match3WinnersCount: 10,
      });

      // Total Tier 5 pool = 400,000 + 150,000 = 550,000 cents
      expect(result.tier5PoolCents).toBe(550_000);
      // Entire jackpot rolls out
      expect(result.rolloverOutCents).toBe(550_000);
      expect(result.payoutPerTier.tier5PerWinnerCents).toBe(0);
    });

    it('should accumulate rollovers across multiple consecutive zero-winner draws', () => {
      // Month 1: 400,000 base -> 0 winners -> 400,000 rollover out
      const m1 = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000,
        rolloverInCents: 0,
        match5WinnersCount: 0,
        match4WinnersCount: 1,
        match3WinnersCount: 1,
      });
      expect(m1.rolloverOutCents).toBe(400_000);

      // Month 2: receives m1.rolloverOutCents + 400,000 base -> 0 winners
      const m2 = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000,
        rolloverInCents: m1.rolloverOutCents,
        match5WinnersCount: 0,
        match4WinnersCount: 1,
        match3WinnersCount: 1,
      });
      expect(m2.tier5PoolCents).toBe(800_000);
      expect(m2.rolloverOutCents).toBe(800_000);

      // Month 3: 1 lucky winner wins the whole accumulated jackpot!
      const m3 = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000,
        rolloverInCents: m2.rolloverOutCents,
        match5WinnersCount: 1,
        match4WinnersCount: 1,
        match3WinnersCount: 1,
      });
      expect(m3.tier5PoolCents).toBe(1_200_000); // £12,000.00
      expect(m3.rolloverOutCents).toBe(0);
      expect(m3.payoutPerTier.tier5PerWinnerCents).toBe(1_200_000);
    });
  });

  describe('Unclaimed Tier 4 and Tier 3 Funds (No Rollover)', () => {
    it('should retain unclaimed Tier 4 and Tier 3 funds in reserve without rolling over', () => {
      const result = calculatePrizePoolTiers({
        baseContributionCents: 1_000_000,
        rolloverInCents: 0,
        match5WinnersCount: 1,
        match4WinnersCount: 0, // No Tier 4 winner
        match3WinnersCount: 0, // No Tier 3 winner
      });

      // Tier 4 (£3,500) and Tier 3 (£2,500) do not roll over to Tier 5
      expect(result.rolloverOutCents).toBe(0);
      expect(result.unclaimedTier4Cents).toBe(350_000);
      expect(result.unclaimedTier3Cents).toBe(250_000);
    });
  });

  describe('Multi-Winner Equal Division & Remainder Penny Preservation', () => {
    it('should split clean amounts equally among winners', () => {
      const winners = ['winner-a', 'winner-b', 'winner-c'];
      const allocations = distributeTierFundsEqually(300_000, winners); // £3,000 / 3

      expect(allocations).toHaveLength(3);
      allocations.forEach((a) => {
        expect(a.amountCents).toBe(100_000); // Exactly £1,000.00
      });

      const totalDistributed = allocations.reduce((sum, a) => sum + a.amountCents, 0);
      expect(totalDistributed).toBe(300_000);
    });

    it('should distribute remainder pennies deterministically without loss', () => {
      // £100.00 (10,000 cents) shared among 3 winners: 10000 / 3 = 3333 with remainder 1
      const winners = ['user-3', 'user-1', 'user-2'];
      const allocations = distributeTierFundsEqually(10_000, winners);

      expect(allocations).toHaveLength(3);

      // Allocations sorted deterministically by ID: user-1 gets the 1 remainder penny
      expect(allocations[0].id).toBe('user-1');
      expect(allocations[0].amountCents).toBe(3_334); // £33.34

      expect(allocations[1].id).toBe('user-2');
      expect(allocations[1].amountCents).toBe(3_333); // £33.33

      expect(allocations[2].id).toBe('user-3');
      expect(allocations[2].amountCents).toBe(3_333); // £33.33

      // Total distributed must equal 10,000 cents exactly
      const total = allocations.reduce((sum, a) => sum + a.amountCents, 0);
      expect(total).toBe(10_000);
    });

    it('should return empty array when zero winners exist', () => {
      expect(distributeTierFundsEqually(50_000, [])).toEqual([]);
      expect(distributeTierFundsEqually(0, ['w1'])).toEqual([]);
    });
  });

  describe('GBP Currency Formatter', () => {
    it('should format cents into standard £XX.XX format', () => {
      expect(formatCurrencyGBP(2000)).toBe('£20.00');
      expect(formatCurrencyGBP(19200)).toBe('£192.00');
      expect(formatCurrencyGBP(3333)).toBe('£33.33');
      expect(formatCurrencyGBP(0)).toBe('£0.00');
    });
  });
});
