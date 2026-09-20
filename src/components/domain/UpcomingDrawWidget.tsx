'use client';

import React from 'react';
import Link from 'next/link';
import styles from './domain.module.css';
import { DrawRecord } from '@/modules/draws/draw-types';
import { GolfScore } from '@/modules/scores/score-types';

interface UpcomingDrawWidgetProps {
  upcomingDraw: DrawRecord | null;
  activeScores: GolfScore[];
}

export function UpcomingDrawWidget({ upcomingDraw, activeScores }: UpcomingDrawWidgetProps) {
  const isEligible = activeScores.length === 5;

  function formatDate(dateStr?: string): string {
    if (!dateStr) return 'End of Current Month';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className={styles.drawWidget}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleArea}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Monthly Draw #{upcomingDraw?.drawNumber ?? 1}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {upcomingDraw?.drawMode === 'algorithmic' ? 'Frequency Weighted' : 'CSPRNG Random'}
            </span>
          </div>
          <h3 className={styles.cardTitle}>Upcoming Draw Event</h3>
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
          {formatDate(upcomingDraw?.scheduledFor)}
        </span>
      </div>

      <div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Estimated Monthly Prize Pool: <strong style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>£50,000+</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-mint)', display: 'block' }}>
            Including Tier 5 Unclaimed Rollover Jackpots
          </span>
        </p>

        {isEligible ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--status-active-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem 1rem', borderRadius: 8 }}>
            <span style={{ color: 'var(--accent-mint)', fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Your 5 rolling rounds are active: <strong>{activeScores.map((s) => s.score).join(', ')}</strong>
            </span>
          </div>
        ) : (
          <div className={styles.alertNotice}>
            <span>⚠️</span>
            <span>
              Log {5 - activeScores.length} more round{5 - activeScores.length > 1 ? 's' : ''} on your scorecard before draw day to activate your 5-ball entry.
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <Link href="/how-it-works#math" className={styles.manageLink}>
          <span>Review Draw Mathematics</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
        <Link href="/scores" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
          Update Scores
        </Link>
      </div>
    </div>
  );
}
