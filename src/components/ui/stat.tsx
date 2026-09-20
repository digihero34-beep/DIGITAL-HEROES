import React from 'react';
import styles from './stat.module.css';

export type StatTone = 'default' | 'mint' | 'gold' | 'blue';

export interface StatProps {
  label: string;
  value: React.ReactNode;
  helperText?: string;
  tone?: StatTone;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function Stat({
  label,
  value,
  helperText,
  tone = 'default',
  trend,
  icon,
  className,
}: StatProps) {
  const toneClass = {
    default: '',
    mint: styles.valueMint,
    gold: styles.valueGold,
    blue: styles.valueBlue,
  }[tone];

  return (
    <div className={`${styles.statCard} ${className || ''}`}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {icon && <span aria-hidden="true">{icon}</span>}
      </div>

      <div className={styles.valueRow}>
        <div className={`${styles.value} ${toneClass}`}>{value}</div>
      </div>

      {trend && (
        <div className={`${styles.trendRow} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}

      {helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}
