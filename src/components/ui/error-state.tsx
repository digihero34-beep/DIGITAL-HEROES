import React from 'react';
import styles from './feedback.module.css';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to Complete Request',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={`${styles.stateContainer} ${className || ''}`}>
      <div className={`${styles.iconSlot} ${styles.iconSlotError}`} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
