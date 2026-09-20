'use client';

import React from 'react';
import Link from 'next/link';
import styles from './domain.module.css';
import { GolfScore } from '@/modules/scores/score-types';

interface ScoreCardGridProps {
  activeScores: GolfScore[];
  totalRoundsCount: number;
}

export function ScoreCardGrid({ activeScores, totalRoundsCount }: ScoreCardGridProps) {
  // Ensure we always render exactly 5 slots
  const slots = Array.from({ length: 5 }, (_, idx) => activeScores[idx] || null);
  const isFullyEligible = activeScores.length === 5;

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }

  return (
    <div className={styles.gridCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleArea}>
          <h3 className={styles.cardTitle}>Active Draw Combination (Rolling 5)</h3>
          <p className={styles.cardSubtitle}>
            {isFullyEligible
              ? 'Your five latest Stableford rounds are locked in as your official draw entry.'
              : `You have logged ${activeScores.length} of 5 required rounds for complete draw eligibility.`}
          </p>
        </div>

        <Link href="/scores" className={styles.manageLink}>
          <span>Scorecard Manager ({totalRoundsCount} Lifetime Rounds)</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      <div className={styles.scoreSlotsRow}>
        {slots.map((score, index) => {
          if (score) {
            return (
              <div key={score.id} className={styles.scoreSlot}>
                <div className={styles.slotBall}>{score.score}</div>
                <span className={styles.slotPoints}>{score.score} Points</span>
                <span className={styles.slotDate}>{formatDate(score.playedDate)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-mint)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Ball #{index + 1}
                </span>
              </div>
            );
          }

          return (
            <div key={`empty-${index}`} className={styles.slotEmpty}>
              <span className={styles.slotEmptyIcon}>⛳</span>
              <span className={styles.slotEmptyText}>Ball #{index + 1} Needed</span>
              <Link
                href="/scores"
                style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', fontWeight: 700, textDecoration: 'underline' }}
              >
                + Log Round
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
