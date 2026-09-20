'use client';

import React from 'react';
import styles from '@/app/(auth)/auth.module.css';

export interface PasswordCriteria {
  minLength: boolean;
  hasUpperLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string) {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;

  if (password.length === 0) {
    return {
      score: 0,
      criteria,
      label: 'Empty',
      color: 'var(--text-muted)',
      barCount: 0,
    };
  }

  if (score <= 1) {
    return {
      score,
      criteria,
      label: 'Weak',
      color: '#dc2626',
      barCount: 1,
    };
  }

  if (score === 2) {
    return {
      score: 2,
      criteria,
      label: 'Fair',
      color: '#f59e0b',
      barCount: 2,
    };
  }

  if (score === 3) {
    return {
      score: 3,
      criteria,
      label: 'Good',
      color: '#3b82f6',
      barCount: 3,
    };
  }

  return {
    score: 4,
    criteria,
    label: 'Strong',
    color: '#10b981',
    barCount: 4,
  };
}

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) {
    return null;
  }

  const { criteria, label, color, barCount } = evaluatePasswordStrength(password);

  return (
    <div className={styles.strengthContainer} aria-live="polite">
      {/* Strength Header */}
      <div className={styles.strengthHeader}>
        <span className={styles.strengthLabel}>Password Strength:</span>
        <span className={styles.strengthValue} style={{ color }}>
          {label}
        </span>
      </div>

      {/* 4 Segment Progress Bar */}
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((barIndex) => {
          const isActive = barIndex <= barCount;
          return (
            <div
              key={barIndex}
              className={styles.strengthBar}
              style={{
                backgroundColor: isActive ? color : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Requirements Checklist */}
      <div className={styles.criteriaGrid}>
        <div className={`${styles.criteriaItem} ${criteria.minLength ? styles.criteriaItemMet : ''}`}>
          <span className={styles.criteriaIcon}>{criteria.minLength ? '✓' : '○'}</span>
          <span>8+ characters</span>
        </div>

        <div className={`${styles.criteriaItem} ${criteria.hasUpperLower ? styles.criteriaItemMet : ''}`}>
          <span className={styles.criteriaIcon}>{criteria.hasUpperLower ? '✓' : '○'}</span>
          <span>Uppercase & lowercase</span>
        </div>

        <div className={`${styles.criteriaItem} ${criteria.hasNumber ? styles.criteriaItemMet : ''}`}>
          <span className={styles.criteriaIcon}>{criteria.hasNumber ? '✓' : '○'}</span>
          <span>At least 1 number</span>
        </div>

        <div className={`${styles.criteriaItem} ${criteria.hasSpecial ? styles.criteriaItemMet : ''}`}>
          <span className={styles.criteriaIcon}>{criteria.hasSpecial ? '✓' : '○'}</span>
          <span>Special symbol (!@#$)</span>
        </div>
      </div>
    </div>
  );
}
