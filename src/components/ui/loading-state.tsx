import React from 'react';
import styles from './feedback.module.css';

export interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={`${styles.skeletonContainer} ${className || ''}`} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={styles.skeletonLine}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className={styles.stateContainer} aria-busy="true">
      <div className={styles.iconSlot} style={{ animation: 'spin 1s linear infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
        </svg>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{message}</p>
    </div>
  );
}
