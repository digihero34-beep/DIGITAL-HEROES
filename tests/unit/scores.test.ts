import { describe, it, expect } from 'vitest';
import {
  validateStablefordScore,
  validatePlayedDate,
  resolveRollingFiveScores,
  calculateScorecardStats,
} from '@/modules/scores/score-engine';
import { GolfScore } from '@/modules/scores/score-types';

describe('Stableford Golf Score Engine & Invariant Tests (PRD § 05)', () => {
  describe('Stableford Score Range Boundary Validation (1–45)', () => {
    it('should reject score of 0 (below minimum 1)', () => {
      const res = validateStablefordScore(0);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot be less than 1');
    });

    it('should reject negative scores', () => {
      const res = validateStablefordScore(-10);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot be less than 1');
    });

    it('should accept score of 1 (exact lower boundary)', () => {
      const res = validateStablefordScore(1);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should accept typical Stableford scores (e.g. 36, 40)', () => {
      expect(validateStablefordScore(36).isValid).toBe(true);
      expect(validateStablefordScore(40).isValid).toBe(true);
    });

    it('should accept score of 45 (exact upper boundary)', () => {
      const res = validateStablefordScore(45);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should reject score of 46 (above maximum 45)', () => {
      const res = validateStablefordScore(46);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot exceed 45');
    });

    it('should reject extreme scores like 100', () => {
      const res = validateStablefordScore(100);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot exceed 45');
    });

    it('should reject non-integer decimal scores (e.g. 34.5)', () => {
      const res = validateStablefordScore(34.5);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('whole integer');
    });

    it('should reject NaN and invalid numbers', () => {
      const res = validateStablefordScore(NaN);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('valid number');
    });
  });

  describe('Played Date Invariant Validation', () => {
    it('should accept a valid past date', () => {
      const res = validatePlayedDate('2026-01-15');
      expect(res.isValid).toBe(true);
    });

    it('should accept today date', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = validatePlayedDate(todayStr);
      expect(res.isValid).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureStr = futureDate.toISOString().split('T')[0];

      const res = validatePlayedDate(futureStr);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('future date');
    });

    it('should reject malformed date format', () => {
      expect(validatePlayedDate('15-01-2026').isValid).toBe(false);
      expect(validatePlayedDate('2026/01/15').isValid).toBe(false);
      expect(validatePlayedDate('invalid-date').isValid).toBe(false);
      expect(validatePlayedDate('').isValid).toBe(false);
    });

    it('should reject non-existent calendar dates (e.g. Feb 30)', () => {
      const res = validatePlayedDate('2026-02-30');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid calendar date');
    });
  });

  describe('Rolling 5-Score FIFO Set Resolution', () => {
    it('should keep all scores active when total rounds <= 5', () => {
      const threeScores = [
        { id: 'sc-1', playedDate: '2026-03-01' },
        { id: 'sc-2', playedDate: '2026-03-05' },
        { id: 'sc-3', playedDate: '2026-03-10' },
      ];

      const { activeIds, inactiveIds } = resolveRollingFiveScores(threeScores);
      expect(activeIds.size).toBe(3);
      expect(inactiveIds.size).toBe(0);
      expect(activeIds.has('sc-1')).toBe(true);
      expect(activeIds.has('sc-2')).toBe(true);
      expect(activeIds.has('sc-3')).toBe(true);
    });

    it('should keep exactly the latest 5 active and deactivate the 6th score', () => {
      const sixScores = [
        { id: 'sc-1', playedDate: '2026-03-01' }, // Oldest
        { id: 'sc-2', playedDate: '2026-03-02' },
        { id: 'sc-3', playedDate: '2026-03-03' },
        { id: 'sc-4', playedDate: '2026-03-04' },
        { id: 'sc-5', playedDate: '2026-03-05' },
        { id: 'sc-6', playedDate: '2026-03-06' }, // Newest
      ];

      const { activeIds, inactiveIds } = resolveRollingFiveScores(sixScores);
      expect(activeIds.size).toBe(5);
      expect(inactiveIds.size).toBe(1);

      // 5 newest are active
      expect(activeIds.has('sc-6')).toBe(true);
      expect(activeIds.has('sc-5')).toBe(true);
      expect(activeIds.has('sc-4')).toBe(true);
      expect(activeIds.has('sc-3')).toBe(true);
      expect(activeIds.has('sc-2')).toBe(true);

      // Oldest (sc-1) is rolled over into inactive archive
      expect(inactiveIds.has('sc-1')).toBe(true);
    });

    it('should reactivate previously archived score when an active score is deleted', () => {
      const sixScores = [
        { id: 'sc-1', playedDate: '2026-03-01' }, // 6th / archived
        { id: 'sc-2', playedDate: '2026-03-02' },
        { id: 'sc-3', playedDate: '2026-03-03' },
        { id: 'sc-4', playedDate: '2026-03-04' },
        { id: 'sc-5', playedDate: '2026-03-05' },
        { id: 'sc-6', playedDate: '2026-03-06' }, // Active
      ];

      // Initial state: sc-1 is inactive
      const initial = resolveRollingFiveScores(sixScores);
      expect(initial.inactiveIds.has('sc-1')).toBe(true);

      // User deletes round 'sc-6'
      const remainingScores = sixScores.filter((s) => s.id !== 'sc-6');
      const afterDelete = resolveRollingFiveScores(remainingScores);

      // Now exactly 5 remain, so sc-1 is promoted back to active!
      expect(afterDelete.activeIds.size).toBe(5);
      expect(afterDelete.activeIds.has('sc-1')).toBe(true);
      expect(afterDelete.inactiveIds.size).toBe(0);
    });
  });

  describe('Scorecard Performance Analytics', () => {
    it('should calculate accurate average, max, and min points', () => {
      const mockScores: GolfScore[] = [
        { id: '1', userId: 'u1', score: 32, playedDate: '2026-03-01', isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', userId: 'u1', score: 38, playedDate: '2026-03-02', isActive: true, createdAt: '', updatedAt: '' },
        { id: '3', userId: 'u1', score: 35, playedDate: '2026-03-03', isActive: true, createdAt: '', updatedAt: '' },
      ];

      const stats = calculateScorecardStats(mockScores);
      expect(stats.averageScore).toBe(35);
      expect(stats.highestScore).toBe(38);
      expect(stats.lowestScore).toBe(32);
    });

    it('should handle empty score array gracefully', () => {
      const stats = calculateScorecardStats([]);
      expect(stats.averageScore).toBe(0);
      expect(stats.highestScore).toBe(0);
      expect(stats.lowestScore).toBe(0);
    });
  });
});
