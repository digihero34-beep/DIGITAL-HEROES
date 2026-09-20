import { describe, it, expect } from 'vitest';
import {
  validateContributionPercentage,
  validateDonationAmount,
  filterCharities,
  CHARITY_MIN_CONTRIBUTION_PERCENTAGE,
  CHARITY_MAX_CONTRIBUTION_PERCENTAGE,
} from '@/modules/charities/charity-validation';
import { Charity } from '@/modules/charities/charity-types';

describe('Charity Domain & Contribution Invariants (PRD § 08)', () => {
  describe('Minimum 10% Contribution Lock Enforcement', () => {
    it('should define platform charter limits as 10% min and 100% max', () => {
      expect(CHARITY_MIN_CONTRIBUTION_PERCENTAGE).toBe(10);
      expect(CHARITY_MAX_CONTRIBUTION_PERCENTAGE).toBe(100);
    });

    it('should reject percentages below the 10% platform lock (e.g. 0%, 5%, 9%)', () => {
      expect(validateContributionPercentage(0).isValid).toBe(false);
      expect(validateContributionPercentage(5).isValid).toBe(false);
      expect(validateContributionPercentage(9).isValid).toBe(false);

      const res = validateContributionPercentage(9);
      expect(res.error).toContain('minimum 10% charitable contribution is required');
    });

    it('should reject negative percentages', () => {
      expect(validateContributionPercentage(-10).isValid).toBe(false);
    });

    it('should accept 10% (exact minimum threshold)', () => {
      const res = validateContributionPercentage(10);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should accept voluntary higher percentages (15%, 25%, 50%, 100%)', () => {
      expect(validateContributionPercentage(15).isValid).toBe(true);
      expect(validateContributionPercentage(25).isValid).toBe(true);
      expect(validateContributionPercentage(50).isValid).toBe(true);
      expect(validateContributionPercentage(100).isValid).toBe(true);
    });

    it('should reject percentages exceeding 100%', () => {
      const res = validateContributionPercentage(101);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot exceed 100%');
    });

    it('should reject non-integer percentage values (e.g. 12.5%)', () => {
      const res = validateContributionPercentage(12.5);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('whole integer');
    });

    it('should reject NaN or invalid inputs', () => {
      expect(validateContributionPercentage(NaN).isValid).toBe(false);
    });
  });

  describe('Direct Donation Validation', () => {
    it('should reject donations below minimum 100 cents (£1.00)', () => {
      expect(validateDonationAmount(0).isValid).toBe(false);
      expect(validateDonationAmount(50).isValid).toBe(false);
      expect(validateDonationAmount(-500).isValid).toBe(false);

      const res = validateDonationAmount(99);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Minimum direct donation is £1.00');
    });

    it('should accept valid donation amounts (100, 2500, 10000 cents)', () => {
      expect(validateDonationAmount(100).isValid).toBe(true);
      expect(validateDonationAmount(2500).isValid).toBe(true);
      expect(validateDonationAmount(10000).isValid).toBe(true);
    });

    it('should reject non-integer decimal cent values', () => {
      expect(validateDonationAmount(100.5).isValid).toBe(false);
    });
  });

  describe('Charity Directory Search & Filtering', () => {
    const mockCharities: Charity[] = [
      {
        id: 'c1',
        name: 'GreenGrass Youth Initiative',
        slug: 'greengrass-youth',
        tagline: 'Mentoring kids through golf access',
        description: 'Providing equipment, coaching, and life skills to youth.',
        logoUrl: '',
        category: 'Youth & Education',
        isFeatured: true,
        isActive: true,
        events: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'c2',
        name: 'Veterans On The Green',
        slug: 'veterans-on-the-green',
        tagline: 'Rehabilitation and PTSD support for service members',
        description: 'Using outdoor recreation and peer community to heal veterans.',
        logoUrl: '',
        category: 'Mental Health & Veterans',
        isFeatured: false,
        isActive: true,
        events: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'c3',
        name: 'Fore The Planet Trust',
        slug: 'fore-the-planet',
        tagline: 'Rewilding golf courses with native woodland',
        description: 'Planting native trees and conserving biodiversity.',
        logoUrl: '',
        category: 'Environment & Conservation',
        isFeatured: false,
        isActive: true,
        events: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    it('should return all charities when category is All and query is empty', () => {
      const res = filterCharities(mockCharities, '', 'All');
      expect(res).toHaveLength(3);
    });

    it('should filter accurately by category', () => {
      const youth = filterCharities(mockCharities, '', 'Youth & Education');
      expect(youth).toHaveLength(1);
      expect(youth[0].id).toBe('c1');

      const vets = filterCharities(mockCharities, '', 'Mental Health & Veterans');
      expect(vets).toHaveLength(1);
      expect(vets[0].id).toBe('c2');
    });

    it('should search across charity name, tagline, and description', () => {
      // Search by keyword in name
      const byName = filterCharities(mockCharities, 'GreenGrass');
      expect(byName).toHaveLength(1);
      expect(byName[0].id).toBe('c1');

      // Search by keyword in tagline ('PTSD')
      const byTagline = filterCharities(mockCharities, 'PTSD');
      expect(byTagline).toHaveLength(1);
      expect(byTagline[0].id).toBe('c2');

      // Search by keyword in description ('biodiversity')
      const byDesc = filterCharities(mockCharities, 'biodiversity');
      expect(byDesc).toHaveLength(1);
      expect(byDesc[0].id).toBe('c3');
    });

    it('should place featured charities at the top of results', () => {
      const res = filterCharities(mockCharities, '', 'All');
      expect(res[0].isFeatured).toBe(true);
      expect(res[0].id).toBe('c1');
    });
  });
});
