import React from 'react';
import styles from './feedback.module.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = '⛳',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`${styles.stateContainer} ${className || ''}`}>
      <div className={styles.iconSlot} aria-hidden="true">
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.actions}>{action}</div>}
    </div>
  );
}
