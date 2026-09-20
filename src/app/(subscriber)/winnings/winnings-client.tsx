'use client';

import React from 'react';
import Link from 'next/link';
import styles from './winnings.module.css';
import { WinnerRecord } from '@/modules/winners/winner-types';
import { formatCurrencyGBP } from '@/modules/prizes/prize-engine';

interface WinningsClientProps {
  winnings: WinnerRecord[];
}

export function WinningsClient({ winnings }: WinningsClientProps) {
  const totalWonCents = winnings.reduce((sum, w) => sum + w.prizeAmountCents, 0);

  const paidOutCents = winnings.reduce((sum, w) => {
    return w.payout?.status === 'paid' ? sum + (w.payout.amountCents || 0) : sum;
  }, 0);

  const pendingCents = totalWonCents - paidOutCents;

  function renderStatusBadge(w: WinnerRecord) {
    if (w.payout?.status === 'paid') {
      return (
        <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
          ✓ Paid Out
        </span>
      );
    }

    switch (w.verificationStatus) {
      case 'approved':
        return (
          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
            ✓ Approved • Processing Payout
          </span>
        );
      case 'submitted':
      case 'under_review':
        return (
          <span className={`${styles.statusBadge} ${styles.statusSubmitted}`}>
            ⌛ Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
            ⚠️ Action Required
          </span>
        );
      case 'pending_proof':
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusPendingProof}`}>
            ● Proof Required
          </span>
        );
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Prize Distribution Engine
        </div>
        <h1 className={styles.title}>Your Draw Winnings</h1>
        <p className={styles.subtitle}>
          Track your monthly draw rewards, upload official scorecard verification, and monitor payment status.
        </p>
      </header>

      {/* Overview Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Winnings</span>
          <span className={`${styles.statValue} ${styles.statValueGold}`}>
            {formatCurrencyGBP(totalWonCents)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Paid to Account</span>
          <span className={`${styles.statValue} ${styles.statValueMint}`}>
            {formatCurrencyGBP(paidOutCents)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Verification / Payout</span>
          <span className={styles.statValue}>
            {formatCurrencyGBP(pendingCents)}
          </span>
        </div>
      </section>

      {/* Winnings Table */}
      <div className={styles.tableCard}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Winnings History &amp; Claims
        </h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Draw Event</th>
              <th className={styles.th}>Match Tier</th>
              <th className={styles.th}>Matched Balls</th>
              <th className={styles.th}>Prize Allocation</th>
              <th className={styles.th}>Verification &amp; Payout</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {winnings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No draw winnings yet. Keep submitting your Stableford rounds to enter each monthly draw!
                </td>
              </tr>
            ) : (
              winnings.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td}>
                    <strong>Draw #{item.drawNumber || 1}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.scheduledFor ? item.scheduledFor.split('T')[0] : 'Monthly Draw'}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                      {item.matchTier === 'match_5' && '★ 5-Ball Jackpot'}
                      {item.matchTier === 'match_4' && '4-Ball Tier'}
                      {item.matchTier === 'match_3' && '3-Ball Tier'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {item.matchedNumbers.map((num) => (
                        <span
                          key={num}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid var(--accent-mint)',
                            color: 'var(--accent-mint)',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                          }}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <strong style={{ fontSize: '1rem' }}>
                      {formatCurrencyGBP(item.prizeAmountCents)}
                    </strong>
                  </td>
                  <td className={styles.td}>
                    {renderStatusBadge(item)}
                  </td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    {item.verificationStatus === 'pending_proof' || item.verificationStatus === 'rejected' ? (
                      <Link href={`/winnings/claim/${item.id}`} className={styles.claimBtn}>
                        Upload Proof →
                      </Link>
                    ) : (
                      <Link
                        href={`/winnings/claim/${item.id}`}
                        style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}
                      >
                        View Claim
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
