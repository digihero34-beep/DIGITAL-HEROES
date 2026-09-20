import React from 'react';
import styles from './badge.module.css';

export type BadgeVariant = 'active' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  showDot = true,
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  const variantClass = {
    active: styles.variantActive,
    warning: styles.variantWarning,
    danger: styles.variantDanger,
    info: styles.variantInfo,
    neutral: styles.variantNeutral,
  }[variant];

  return (
    <span
      className={`${styles.badge} ${variantClass} ${className || ''}`}
      {...props}
    >
      {showDot && !icon && <span className={styles.dot} aria-hidden="true" />}
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
