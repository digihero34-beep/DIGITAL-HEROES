import {
  PrizePoolCalculationInput,
  PrizePoolCalculationResult,
} from './prize-types';

export const TIER_5_PERCENTAGE = 40;
export const TIER_4_PERCENTAGE = 35;
export const TIER_3_PERCENTAGE = 25;

/**
 * Computes deterministic, integer-cent prize tier allocations, rollover accounting,
 * and individual winner distribution figures based on PRD § 07 specifications.
 */
export function calculatePrizePoolTiers(
  input: PrizePoolCalculationInput
): PrizePoolCalculationResult {
  const base = Math.max(0, Math.floor(input.baseContributionCents));
  const rolloverIn = Math.max(0, Math.floor(input.rolloverInCents));

  // 1. Calculate base tier allocations in integer cents
  const tier5Base = Math.floor((base * TIER_5_PERCENTAGE) / 100);
  const tier4Base = Math.floor((base * TIER_4_PERCENTAGE) / 100);
  const tier3Base = Math.floor((base * TIER_3_PERCENTAGE) / 100);

  // 2. Add rollover into Tier 5 jackpot pool
  const tier5Total = tier5Base + rolloverIn;
  const totalPoolCents = base + rolloverIn;

  // 3. Evaluate rollover rules (PRD § 07)
  // Tier 5: rolls over to next month if zero winners
  const rolloverOutCents = input.match5WinnersCount === 0 ? tier5Total : 0;

  // Tier 4 & Tier 3: do not roll over; stored in platform reserve if zero winners (ASM-07)
  const unclaimedTier4Cents = input.match4WinnersCount === 0 ? tier4Base : 0;
  const unclaimedTier3Cents = input.match3WinnersCount === 0 ? tier3Base : 0;

  // 4. Calculate individual winner payouts with integer division
  const tier5PerWinner =
    input.match5WinnersCount > 0
      ? Math.floor(tier5Total / input.match5WinnersCount)
      : 0;
  const tier5Remainders =
    input.match5WinnersCount > 0 ? tier5Total % input.match5WinnersCount : 0;

  const tier4PerWinner =
    input.match4WinnersCount > 0
      ? Math.floor(tier4Base / input.match4WinnersCount)
      : 0;
  const tier4Remainders =
    input.match4WinnersCount > 0 ? tier4Base % input.match4WinnersCount : 0;

  const tier3PerWinner =
    input.match3WinnersCount > 0
      ? Math.floor(tier3Base / input.match3WinnersCount)
      : 0;
  const tier3Remainders =
    input.match3WinnersCount > 0 ? tier3Base % input.match3WinnersCount : 0;

  return {
    totalPoolCents,
    baseContributionCents: base,
    tier5PoolCents: tier5Total,
    tier4PoolCents: tier4Base,
    tier3PoolCents: tier3Base,
    rolloverInCents: rolloverIn,
    rolloverOutCents,
    unclaimedTier4Cents,
    unclaimedTier3Cents,
    payoutPerTier: {
      tier5PerWinnerCents: tier5PerWinner,
      tier4PerWinnerCents: tier4PerWinner,
      tier3PerWinnerCents: tier3PerWinner,
      tier5RemaindersDistributed: tier5Remainders,
      tier4RemaindersDistributed: tier4Remainders,
      tier3RemaindersDistributed: tier3Remainders,
    },
  };
}

/**
 * Distributes tier pool funds equally among multiple winners with deterministic
 * preservation of remainder pennies to ensure zero pool leakage.
 */
export function distributeTierFundsEqually(
  poolCents: number,
  winnerIds: string[]
): Array<{ id: string; amountCents: number }> {
  if (!winnerIds || winnerIds.length === 0 || poolCents <= 0) {
    return [];
  }

  // Sort IDs deterministically to ensure reproducible allocation
  const sortedIds = [...winnerIds].sort();
  const count = sortedIds.length;

  const baseShare = Math.floor(poolCents / count);
  const remainderPennies = poolCents % count;

  return sortedIds.map((id, index) => ({
    id,
    amountCents: index < remainderPennies ? baseShare + 1 : baseShare,
  }));
}

/**
 * Formats integer cents into standard GBP currency format (£XX.XX).
 */
export function formatCurrencyGBP(amountCents: number): string {
  const pounds = (amountCents / 100).toFixed(2);
  return `£${pounds}`;
}
