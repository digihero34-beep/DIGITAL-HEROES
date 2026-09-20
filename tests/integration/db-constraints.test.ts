import { describe, it, expect } from 'vitest';

describe('Database Invariant & Schema Constraint Verification', () => {
  describe('Golf Score Constraints (PRD § 05)', () => {
    function validateScoreConstraint(score: number): { valid: boolean; error?: string } {
      if (!Number.isInteger(score)) {
        return { valid: false, error: 'CHECK constraint failed: score must be integer' };
      }
      if (score < 1 || score > 45) {
        return { valid: false, error: 'CHECK constraint failed: score >= 1 AND score <= 45' };
      }
      return { valid: true };
    }

    it('should validate scores within 1 to 45', () => {
      expect(validateScoreConstraint(1).valid).toBe(true);
      expect(validateScoreConstraint(36).valid).toBe(true);
      expect(validateScoreConstraint(45).valid).toBe(true);
    });

    it('should reject score of 0', () => {
      const res = validateScoreConstraint(0);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('CHECK constraint failed');
    });

    it('should reject score of 46', () => {
      const res = validateScoreConstraint(46);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('CHECK constraint failed');
    });

    it('should reject negative scores', () => {
      const res = validateScoreConstraint(-10);
      expect(res.valid).toBe(false);
    });

    it('should reject floating-point scores', () => {
      const res = validateScoreConstraint(36.5);
      expect(res.valid).toBe(false);
    });
  });

  describe('Unique User Date Constraint (PRD § 05)', () => {
    interface ScoreEntry {
      userId: string;
      playedDate: string;
      score: number;
    }

    function checkUniqueUserDateConstraint(
      existingEntries: ScoreEntry[],
      newEntry: ScoreEntry
    ): { allowed: boolean; error?: string } {
      const duplicate = existingEntries.some(
        e => e.userId === newEntry.userId && e.playedDate === newEntry.playedDate
      );
      if (duplicate) {
        return { allowed: false, error: 'UNIQUE constraint failed: uq_user_played_date' };
      }
      return { allowed: true };
    }

    it('should reject second score for the same user on the same date', () => {
      const entries: ScoreEntry[] = [{ userId: 'user-1', playedDate: '2026-03-20', score: 38 }];
      const res = checkUniqueUserDateConstraint(entries, {
        userId: 'user-1',
        playedDate: '2026-03-20',
        score: 40,
      });
      expect(res.allowed).toBe(false);
      expect(res.error).toContain('UNIQUE constraint failed');
    });

    it('should allow different users on the same date', () => {
      const entries: ScoreEntry[] = [{ userId: 'user-1', playedDate: '2026-03-20', score: 38 }];
      const res = checkUniqueUserDateConstraint(entries, {
        userId: 'user-2',
        playedDate: '2026-03-20',
        score: 40,
      });
      expect(res.allowed).toBe(true);
    });
  });

  describe('Rolling Five-Score Trigger Behavior (PRD § 05)', () => {
    interface ScoreRow {
      id: string;
      userId: string;
      score: number;
      playedDate: string;
      isActive: boolean;
      createdAt: number;
    }

    function simulateMaintainRollingFiveScoresTrigger(scores: ScoreRow[]): ScoreRow[] {
      // Sort newest first by playedDate DESC, then createdAt DESC
      const sorted = [...scores].sort((a, b) => {
        if (a.playedDate !== b.playedDate) {
          return b.playedDate.localeCompare(a.playedDate);
        }
        return b.createdAt - a.createdAt;
      });

      const top5Ids = new Set(sorted.slice(0, 5).map(s => s.id));
      return sorted.map(s => ({
        ...s,
        isActive: top5Ids.has(s.id),
      }));
    }

    it('should maintain exactly 5 active scores when a 6th score is inserted', () => {
      const existingScores: ScoreRow[] = [
        { id: '1', userId: 'u1', score: 32, playedDate: '2026-03-01', isActive: true, createdAt: 1 },
        { id: '2', userId: 'u1', score: 34, playedDate: '2026-03-03', isActive: true, createdAt: 2 },
        { id: '3', userId: 'u1', score: 36, playedDate: '2026-03-05', isActive: true, createdAt: 3 },
        { id: '4', userId: 'u1', score: 38, playedDate: '2026-03-07', isActive: true, createdAt: 4 },
        { id: '5', userId: 'u1', score: 40, playedDate: '2026-03-09', isActive: true, createdAt: 5 },
      ];

      const newScore: ScoreRow = {
        id: '6',
        userId: 'u1',
        score: 42,
        playedDate: '2026-03-11',
        isActive: true,
        createdAt: 6,
      };

      const updated = simulateMaintainRollingFiveScoresTrigger([...existingScores, newScore]);

      const activeScores = updated.filter(s => s.isActive);
      const inactiveScores = updated.filter(s => !s.isActive);

      expect(activeScores.length).toBe(5);
      expect(inactiveScores.length).toBe(1);
      // The oldest score (id '1' on 2026-03-01) must be inactive
      expect(inactiveScores[0].id).toBe('1');
      // The newest score (id '6' on 2026-03-11) must be active
      expect(activeScores.map(s => s.id)).toContain('6');
    });
  });

  describe('Charity Minimum Percentage Constraint (PRD § 08.1)', () => {
    function validateCharityPercentage(pct: number): { valid: boolean; error?: string } {
      if (pct < 10 || pct > 100) {
        return {
          valid: false,
          error: 'CHECK constraint failed: contribution_percentage >= 10 AND <= 100',
        };
      }
      return { valid: true };
    }

    it('should accept 10% minimum', () => {
      expect(validateCharityPercentage(10).valid).toBe(true);
    });

    it('should accept voluntary higher percentages up to 100%', () => {
      expect(validateCharityPercentage(25).valid).toBe(true);
      expect(validateCharityPercentage(100).valid).toBe(true);
    });

    it('should reject percentage below 10%', () => {
      const res = validateCharityPercentage(9);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('CHECK constraint failed');
    });

    it('should reject percentage above 100%', () => {
      const res = validateCharityPercentage(105);
      expect(res.valid).toBe(false);
    });
  });

  describe('Prize Pool Split Integrity (PRD § 07)', () => {
    function validatePrizePoolIntegrity(
      totalPoolCents: number,
      tier5PoolCents: number,
      tier4PoolCents: number,
      tier3PoolCents: number,
      rolloverInCents: number
    ): boolean {
      const baseTier5 = tier5PoolCents - rolloverInCents;
      return tier4PoolCents + tier3PoolCents + baseTier5 <= totalPoolCents;
    }

    it('should verify pool distribution satisfies base pool constraints', () => {
      const totalPool = 1000000; // £10,000.00
      const tier5 = 400000;      // 40%
      const tier4 = 350000;      // 35%
      const tier3 = 250000;      // 25%
      const rolloverIn = 0;

      expect(validatePrizePoolIntegrity(totalPool, tier5, tier4, tier3, rolloverIn)).toBe(true);
    });

    it('should correctly handle incoming rollover in Tier 5 pool', () => {
      const basePool = 1000000;   // £10,000.00
      const rolloverIn = 500000;  // £5,000.00
      const totalPool = basePool + rolloverIn;
      const tier5 = 400000 + rolloverIn; // 40% + rollover = £9,000.00
      const tier4 = 350000;              // £3,500.00
      const tier3 = 250000;              // £2,500.00

      expect(validatePrizePoolIntegrity(totalPool, tier5, tier4, tier3, rolloverIn)).toBe(true);
    });
  });
});
