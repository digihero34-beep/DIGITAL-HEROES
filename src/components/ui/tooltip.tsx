'use client';

import React, { useState } from 'react';
import styles from './tooltip.module.css';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className={`${styles.container} ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <span className={styles.trigger} tabIndex={0} aria-describedby={isVisible ? 'tooltip-content' : undefined}>
        {children}
      </span>
      {isVisible && (
        <span id="tooltip-content" role="tooltip" className={styles.bubble}>
          {content}
        </span>
      )}
    </span>
  );
}
