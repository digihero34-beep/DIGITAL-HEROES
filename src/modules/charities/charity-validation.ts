import { Charity } from './charity-types';

export const CHARITY_MIN_CONTRIBUTION_PERCENTAGE = 10;
export const CHARITY_MAX_CONTRIBUTION_PERCENTAGE = 100;
export const CHARITY_MIN_DONATION_CENTS = 100; // Minimum £1.00

/**
 * Validates that a user-selected charity contribution percentage adheres to the PRD § 08 minimum 10% lock.
 */
export function validateContributionPercentage(percentage: number): {
  isValid: boolean;
  error?: string;
} {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return { isValid: false, error: 'Contribution percentage must be a valid number.' };
  }

  if (!Number.isInteger(percentage)) {
    return { isValid: false, error: 'Contribution percentage must be a whole integer.' };
  }

  if (percentage < CHARITY_MIN_CONTRIBUTION_PERCENTAGE) {
    return {
      isValid: false,
      error: `A minimum ${CHARITY_MIN_CONTRIBUTION_PERCENTAGE}% charitable contribution is required by Digital Heroes charter.`,
    };
  }

  if (percentage > CHARITY_MAX_CONTRIBUTION_PERCENTAGE) {
    return {
      isValid: false,
      error: `Contribution percentage cannot exceed ${CHARITY_MAX_CONTRIBUTION_PERCENTAGE}%.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates a direct one-off donation amount in integer cents.
 */
export function validateDonationAmount(amountCents: number): {
  isValid: boolean;
  error?: string;
} {
  if (typeof amountCents !== 'number' || isNaN(amountCents) || !Number.isInteger(amountCents)) {
    return { isValid: false, error: 'Donation amount must be a whole integer.' };
  }

  if (amountCents < CHARITY_MIN_DONATION_CENTS) {
    return {
      isValid: false,
      error: `Minimum direct donation is £${(CHARITY_MIN_DONATION_CENTS / 100).toFixed(2)}.`,
    };
  }

  return { isValid: true };
}

/**
 * Filters and searches a list of partner charities by category and keyword query.
 */
export function filterCharities(
  charities: Charity[],
  query?: string,
  category?: string
): Charity[] {
  let result = [...charities];

  // Category filter
  if (category && category.toLowerCase() !== 'all') {
    const targetCat = category.toLowerCase();
    result = result.filter((c) => c.category.toLowerCase() === targetCat);
  }

  // Text search
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  // Sort featured first, then alphabetically by name
  return result.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
