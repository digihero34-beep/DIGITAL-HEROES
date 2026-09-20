import { describe, it, expect } from 'vitest';
import { GolfScore } from '@/modules/scores/score-types';
import { UserSubscription, SubscriptionStatus } from '@/modules/subscriptions/subscription-types';

describe('Subscriber Dashboard Domain Invariants (Phase 12)', () => {
  describe('Rolling 5 Slot Display & Eligibility', () => {
    function computeSlots(scores: GolfScore[]) {
      const active = scores.filter((s) => s.isActive);
      const slots = Array.from({ length: 5 }, (_, i) => active[i] || null);
      const isEligible = active.length >= 5;
      const neededRounds = Math.max(0, 5 - active.length);
      return { slots, isEligible, neededRounds };
    }

    it('should correctly allocate 5 empty slots when a subscriber has 0 logged rounds', () => {
      const result = computeSlots([]);
      expect(result.slots.length).toBe(5);
      expect(result.slots.every((s) => s === null)).toBe(true);
      expect(result.isEligible).toBe(false);
      expect(result.neededRounds).toBe(5);
    });

    it('should allocate 3 filled slots and 2 empty slots when subscriber has 3 logged rounds', () => {
      const scores: GolfScore[] = [
        { id: '1', userId: 'u1', score: 38, playedDate: '2026-09-01', isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', userId: 'u1', score: 40, playedDate: '2026-09-05', isActive: true, createdAt: '', updatedAt: '' },
        { id: '3', userId: 'u1', score: 42, playedDate: '2026-09-10', isActive: true, createdAt: '', updatedAt: '' },
      ];

      const result = computeSlots(scores);
      expect(result.slots.length).toBe(5);
      expect(result.slots[0]?.score).toBe(38);
      expect(result.slots[1]?.score).toBe(40);
      expect(result.slots[2]?.score).toBe(42);
      expect(result.slots[3]).toBeNull();
      expect(result.slots[4]).toBeNull();
      expect(result.isEligible).toBe(false);
      expect(result.neededRounds).toBe(2);
    });

    it('should confirm full eligibility when subscriber has 5 active rounds', () => {
      const scores: GolfScore[] = [
        { id: '1', userId: 'u1', score: 36, playedDate: '2026-09-01', isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', userId: 'u1', score: 38, playedDate: '2026-09-05', isActive: true, createdAt: '', updatedAt: '' },
        { id: '3', userId: 'u1', score: 40, playedDate: '2026-09-10', isActive: true, createdAt: '', updatedAt: '' },
        { id: '4', userId: 'u1', score: 42, playedDate: '2026-09-15', isActive: true, createdAt: '', updatedAt: '' },
        { id: '5', userId: 'u1', score: 44, playedDate: '2026-09-20', isActive: true, createdAt: '', updatedAt: '' },
      ];

      const result = computeSlots(scores);
      expect(result.slots.length).toBe(5);
      expect(result.slots.every((s) => s !== null)).toBe(true);
      expect(result.isEligible).toBe(true);
      expect(result.neededRounds).toBe(0);
    });
  });

  describe('Subscription Status & Billing Portal Access', () => {
    function assessSubscriptionState(sub: UserSubscription | null) {
      if (!sub) {
        return { canEnterDraw: false, canOpenPortal: false, statusText: 'inactive' };
      }
      const canEnterDraw = sub.status === 'active' || sub.status === 'trialing';
      const canOpenPortal = !!sub.stripeCustomerId;
      return { canEnterDraw, canOpenPortal, statusText: sub.status };
    }

    it('should identify active subscriptions with customer portal access', () => {
      const sub: UserSubscription = {
        id: 'sub_1',
        userId: 'u_1',
        planId: 'plan_monthly',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_stripe_1',
        currentPeriodStart: '2026-09-01T00:00:00Z',
        currentPeriodEnd: '2026-10-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      };

      const result = assessSubscriptionState(sub);
      expect(result.canEnterDraw).toBe(true);
      expect(result.canOpenPortal).toBe(true);
      expect(result.statusText).toBe('active');
    });

    it('should prohibit draw entry for past_due or canceled subscriptions', () => {
      const statuses: SubscriptionStatus[] = ['past_due', 'canceled', 'incomplete', 'unpaid'];
      statuses.forEach((st) => {
        const sub: UserSubscription = {
          id: 'sub_1',
          userId: 'u_1',
          planId: 'plan_monthly',
          status: st,
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_stripe_1',
          currentPeriodStart: '2026-09-01T00:00:00Z',
          currentPeriodEnd: '2026-10-01T00:00:00Z',
          cancelAtPeriodEnd: false,
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-01T00:00:00Z',
        };

        const result = assessSubscriptionState(sub);
        expect(result.canEnterDraw).toBe(false);
      });
    });
  });

  describe('Charity Voluntary Contribution Calculations', () => {
    function calculateMonthlyDonationCents(monthlyFeeCents: number, percentage: number): number {
      if (percentage < 10) throw new Error('Cannot breach 10% platform lock');
      return Math.round((monthlyFeeCents * percentage) / 100);
    }

    it('should compute exact integer cent donations at 10%, 25%, 50%, and 100% of standard £20 fee', () => {
      const feeCents = 2000; // £20.00
      expect(calculateMonthlyDonationCents(feeCents, 10)).toBe(200);  // £2.00
      expect(calculateMonthlyDonationCents(feeCents, 25)).toBe(500);  // £5.00
      expect(calculateMonthlyDonationCents(feeCents, 50)).toBe(1000); // £10.00
      expect(calculateMonthlyDonationCents(feeCents, 100)).toBe(2000); // £20.00
    });

    it('should enforce 10% minimum lock at calculation boundary', () => {
      const feeCents = 2000;
      expect(() => calculateMonthlyDonationCents(feeCents, 5)).toThrow(/Cannot breach 10% platform lock/);
      expect(() => calculateMonthlyDonationCents(feeCents, 0)).toThrow(/Cannot breach 10% platform lock/);
    });
  });
});
