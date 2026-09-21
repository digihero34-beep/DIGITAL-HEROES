'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './winnings.module.css';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { WinnerRecord } from '@/modules/winners/winner-types';
import { formatCurrencyGBP } from '@/modules/prizes/prize-engine';
import { getUserWinningsAction } from '@/modules/winners/verification-actions';
import { useRealtimeTable } from '@/hooks/use-realtime-table';

interface WinningsClientProps {
  userId: string;
  initialWinnings: WinnerRecord[];
}

export function WinningsClient({ userId, initialWinnings }: WinningsClientProps) {
  const [winnings, setWinnings] = useState<WinnerRecord[]>(initialWinnings);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setSyncing(true);
    const result = await getUserWinningsAction();
    if (result.success && result.data) {
      setWinnings(result.data);
    }
    setSyncing(false);
  }, []);

  // Subscribe to changes on the winners table for this user
  useRealtimeTable({
    table: 'winners',
    filter: `user_id=eq.${userId}`,
    channelName: `winnings-winners-${userId}`,
    onData: refresh,
  });

  // Subscribe to payout updates for this user
  useRealtimeTable({
    table: 'payouts',
    filter: `user_id=eq.${userId}`,
    channelName: `winnings-payouts-${userId}`,
    onData: refresh,
  });

  // Subscribe to verification status changes for this user
  useRealtimeTable({
    table: 'winner_verifications',
    filter: `user_id=eq.${userId}`,
    channelName: `winnings-verifications-${userId}`,
    onData: refresh,
  });

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className={styles.badge}>
            <span className={`${styles.badgeDot} ${syncing ? styles.badgeDotSyncing : ''}`} />
            Prize Distribution Engine{syncing && ' — Syncing…'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-container-low)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              ← Command Center
            </Link>
            <LogoutButton variant="subscriber" redirectTo="/login" label="Sign Out" />
          </div>
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
                      {item.matchTier?.toLowerCase() === 'match_5' && '★ 5-Ball Jackpot'}
                      {item.matchTier?.toLowerCase() === 'match_4' && '4-Ball Tier'}
                      {item.matchTier?.toLowerCase() === 'match_3' && '3-Ball Tier'}
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

      {/* Community Winners Section */}
      <RecentCommunityWinnersRoster />
    </div>
  );
}

function RecentCommunityWinnersRoster() {
  const [communityWinners, setCommunityWinners] = useState<
    Array<{
      id: string;
      userId: string;
      patronName: string;
      drawNumber: number;
      matchTier: string;
      prizeAmountCents: number;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    import('@/modules/draws/draw-actions').then(({ getRecentCommunityWinnersAction }) => {
      getRecentCommunityWinnersAction().then((res) => {
        if (res.success && res.data) {
          setCommunityWinners(res.data);
        }
      });
    });
  }, []);

  if (communityWinners.length === 0) return null;

  return (
    <div className={styles.tableCard} style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        🏆 Community Winning Patrons Roster
      </h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Verified patrons who have matched Stableford sets in recent monthly draws across Digital Heroes.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {communityWinners.map((w) => (
          <div
            key={w.id}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-container-low)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                👤 {w.patronName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Draw #{w.drawNumber} • {w.matchTier.toUpperCase().replace('_', ' ')}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--accent-mint)', fontSize: '1rem' }}>
              {formatCurrencyGBP(w.prizeAmountCents)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
