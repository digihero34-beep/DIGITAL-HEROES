import React from 'react';
import styles from './timeline.module.css';

export type TimelineItemStatus = 'completed' | 'current' | 'upcoming';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: TimelineItemStatus;
  timestamp?: string;
  metadata?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`${styles.timeline} ${className}`} role="list" aria-label="Process timeline">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';

        return (
          <div key={item.id} className={styles.timelineItem} role="listitem">
            <div className={styles.indicatorCol}>
              <div
                className={`${styles.dot} ${
                  isCompleted
                    ? styles.dotCompleted
                    : isCurrent
                    ? styles.dotCurrent
                    : styles.dotUpcoming
                }`}
                aria-label={`Step ${index + 1}: ${item.title} (${item.status})`}
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {!isLast && (
                <div
                  className={`${styles.line} ${
                    isCompleted ? styles.lineCompleted : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className={styles.content}>
              <div className={styles.itemHeader}>
                <span className={styles.title}>{item.title}</span>
                {item.timestamp && (
                  <span className={styles.timestamp}>{item.timestamp}</span>
                )}
              </div>
              {item.description && (
                <p className={styles.description}>{item.description}</p>
              )}
              {item.metadata && (
                <div className={styles.metadata}>{item.metadata}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
