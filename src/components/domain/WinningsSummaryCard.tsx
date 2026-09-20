'use client';

import React from 'react';
import Link from 'next/link';
import styles from './domain.module.css';
import { formatCurrencyGBP } from '@/modules/prizes/prize-engine';
import { WinnerRecord } from '@/modules/winners/winner-types';

interface WinningsSummaryCardProps {
  totalPrizeCents: number;
  pendingCount: number;
  recentWinnings: WinnerRecord[];
}

export function WinningsSummaryCard({
  totalPrizeCents,
  pendingCount,
  recentWinnings,
}: WinningsSummaryCardProps) {
  const pendingClaim = recentWinnings.find((w) => w.verificationStatus === 'pending_proof');

  return (
    <div className={styles.winningsWidget}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleArea}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Total Lifetime Rewards
          </span>
          <h3 className={styles.cardTitle}>Earnings & Claims</h3>
        </div>

        <Link href="/winnings" className={styles.manageLink}>
          <span>All Claims ({recentWinnings.length})</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div>
        <div className={styles.highlightAmount}>{formatCurrencyGBP(totalPrizeCents)}</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Cumulative winnings across all verified monthly draws.
        </p>

        {pendingCount > 0 ? (
          <div className={styles.alertNotice} style={{ marginTop: '1rem' }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700 }}>Action Required:</span> {pendingCount} prize claim{pendingCount > 1 ? 's' : ''} awaiting scorecard proof verification.
              {pendingClaim && (
                <Link
                  href={`/winnings/claim/${pendingClaim.id}`}
                  style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'underline', marginTop: '0.25rem' }}
                >
                  Upload Scorecard for {formatCurrencyGBP(pendingClaim.prizeAmountCents)} Prize &rarr;
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--status-active-text)' }}>
            ✓ All prize claims up to date. No pending audits required.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Direct BACS Bank Transfer Payouts
        </span>
        <Link href="/winnings" style={{ fontSize: '0.85rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
          View Claim Ledger &rarr;
        </Link>
      </div>
    </div>
  );
}
