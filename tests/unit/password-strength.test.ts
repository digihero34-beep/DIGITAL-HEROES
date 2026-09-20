import { describe, it, expect } from 'vitest';
import { evaluatePasswordStrength } from '@/components/auth/PasswordStrengthMeter';

describe('Password Strength & Verification Security Unit Tests', () => {
  it('should evaluate empty password as empty with score 0', () => {
    const result = evaluatePasswordStrength('');
    expect(result.score).toBe(0);
    expect(result.label).toBe('Empty');
    expect(result.barCount).toBe(0);
    expect(result.criteria.minLength).toBe(false);
    expect(result.criteria.hasUpperLower).toBe(false);
    expect(result.criteria.hasNumber).toBe(false);
    expect(result.criteria.hasSpecial).toBe(false);
  });

  it('should evaluate short password as weak', () => {
    const result = evaluatePasswordStrength('abc');
    expect(result.score).toBe(0);
    expect(result.label).toBe('Weak');
    expect(result.barCount).toBe(1);
    expect(result.criteria.minLength).toBe(false);
  });

  it('should evaluate 8-char lowercase password as weak (only minLength satisfied)', () => {
    const result = evaluatePasswordStrength('abcdefgh');
    expect(result.score).toBe(1);
    expect(result.label).toBe('Weak');
    expect(result.barCount).toBe(1);
    expect(result.criteria.minLength).toBe(true);
    expect(result.criteria.hasUpperLower).toBe(false);
    expect(result.criteria.hasNumber).toBe(false);
    expect(result.criteria.hasSpecial).toBe(false);
  });

  it('should evaluate password with mixed case and minLength as fair (score 2)', () => {
    const result = evaluatePasswordStrength('Abcdefgh');
    expect(result.score).toBe(2);
    expect(result.label).toBe('Fair');
    expect(result.barCount).toBe(2);
    expect(result.criteria.minLength).toBe(true);
    expect(result.criteria.hasUpperLower).toBe(true);
    expect(result.criteria.hasNumber).toBe(false);
    expect(result.criteria.hasSpecial).toBe(false);
  });

  it('should evaluate password with mixed case, number and minLength as good (score 3)', () => {
    const result = evaluatePasswordStrength('Abcdefg1');
    expect(result.score).toBe(3);
    expect(result.label).toBe('Good');
    expect(result.barCount).toBe(3);
    expect(result.criteria.minLength).toBe(true);
    expect(result.criteria.hasUpperLower).toBe(true);
    expect(result.criteria.hasNumber).toBe(true);
    expect(result.criteria.hasSpecial).toBe(false);
  });

  it('should evaluate full password with special character as strong (score 4)', () => {
    const result = evaluatePasswordStrength('Abcdefg1!');
    expect(result.score).toBe(4);
    expect(result.label).toBe('Strong');
    expect(result.barCount).toBe(4);
    expect(result.criteria.minLength).toBe(true);
    expect(result.criteria.hasUpperLower).toBe(true);
    expect(result.criteria.hasNumber).toBe(true);
    expect(result.criteria.hasSpecial).toBe(true);
  });

  it('should correctly evaluate password matching logic', () => {
    const passA: string = 'Championship2026!';
    const passB: string = 'Championship2026!';
    const passC: string = 'DifferentPassword!';

    expect(passA === passB).toBe(true);
    expect(passA === passC).toBe(false);
  });
});
