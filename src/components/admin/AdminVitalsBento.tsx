'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminPlatformStats } from '@/modules/admin/admin-types';
import { getAdminPlatformStatsAction } from '@/modules/admin/admin-actions';
import { useRealtimeTable } from '@/hooks/use-realtime-table';
import styles from '@/app/(admin)/admin/admin.module.css';

interface Props {
  initialStats: AdminPlatformStats;
  charitiesCount: number;
}

export default function AdminVitalsBento({ initialStats, charitiesCount }: Props) {
  const [stats, setStats] = useState<AdminPlatformStats>(initialStats);
  const [blockHeight, setBlockHeight] = useState(initialStats.dualEntropyBeacon.syncBlock);

  const refreshStats = useCallback(async () => {
    const res = await getAdminPlatformStatsAction();
    if (res.success && res.data) {
      setStats(res.data);
      setBlockHeight(res.data.dualEntropyBeacon.syncBlock);
    }
  }, []);

  // Real-time table updates
  useRealtimeTable({ table: 'winner_verifications', channelName: 'vitals-verifications', onData: refreshStats });
  useRealtimeTable({ table: 'scores', channelName: 'vitals-scores', onData: refreshStats });
  useRealtimeTable({ table: 'draws', channelName: 'vitals-draws', onData: refreshStats });
  useRealtimeTable({ table: 'payouts', channelName: 'vitals-payouts', onData: refreshStats });
  useRealtimeTable({ table: 'subscriptions', channelName: 'vitals-subscriptions', onData: refreshStats });

  // Listen for Commit Trust Sig custom event
  useEffect(() => {
    const handleSigCommitted = () => {
      refreshStats();
    };
    window.addEventListener('dh:sig_committed', handleSigCommitted);
    return () => window.removeEventListener('dh:sig_committed', handleSigCommitted);
  }, [refreshStats]);

  // Live real-time block ticker increment (3s)
  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.vitalsBentoGrid}>
      {/* Vital 1: Merkle Root */}
      <div className={styles.vitalCard}>
        <div className={styles.cardTopAccentGold}></div>
        <div>
          <div className={styles.vitalHeader}>
            <span>Active Merkle Tree Root</span>
            <span className={styles.vitalIcon}>⛓️</span>
          </div>
          <div className={styles.vitalMonoValue}>{stats.merkleRoot}</div>
        </div>
        <div className={styles.vitalFooter}>
          <span className={styles.vitalFooterLabel}>Lock State:</span>
          <span className={`${styles.vitalFooterValue} ${styles.goldValue}`}>
            {stats.merkleLockState}
          </span>
        </div>
      </div>

      {/* Vital 2: Dual Entropy Beacon */}
      <div className={styles.vitalCard}>
        <div className={styles.cardTopAccentGreen}></div>
        <div>
          <div className={styles.vitalHeader}>
            <span>Dual Entropy Beacon</span>
            <span className={styles.vitalIcon}>📡</span>
          </div>
          <div className={styles.vitalMetricHeading} suppressHydrationWarning>
            Syncing Block #{blockHeight.toLocaleString('en-GB')}
          </div>
        </div>
        <div className={styles.vitalFooter}>
          <span className={styles.vitalFooterLabel}>NIST Randomness:</span>
          <span className={styles.statusTag}>{stats.dualEntropyBeacon.nistStatus}</span>
        </div>
      </div>

      {/* Vital 3: Scorecard Verifications */}
      <div className={styles.vitalCard}>
        <div className={styles.cardTopAccentAmber}></div>
        <div>
          <div className={styles.vitalHeader}>
            <span>Scorecard Verifications</span>
            <span className={styles.vitalIcon}>⚖️</span>
          </div>
          <div className={styles.vitalMetricBig}>
            {String(stats.pendingVerificationsCount).padStart(2, '0')}
            <span className={styles.vitalMetricSub}>Pending</span>
          </div>
        </div>
        <div className={styles.vitalFooter}>
          <span className={styles.vitalFooterLabel}>Audit Status:</span>
          <span className={`${styles.vitalFooterValue} ${stats.pendingVerificationsCount > 0 ? styles.goldValue : ''}`}>
            {stats.pendingVerificationsCount > 0 ? 'Awaiting Trustee Sign-Off' : 'Queue Clear'}
          </span>
        </div>
      </div>

      {/* Vital 4: YTD Charity Yield */}
      <div className={styles.vitalCard}>
        <div className={styles.cardTopAccentBlue}></div>
        <div>
          <div className={styles.vitalHeader}>
            <span>YTD Philanthropic Yield</span>
            <span className={styles.vitalIcon}>🤝</span>
          </div>
          <div className={styles.vitalMetricBig} suppressHydrationWarning>
            £{(stats.ytdPhilanthropicYieldCents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={styles.vitalFooter}>
          <span className={styles.vitalFooterLabel}>Accredited Beneficiaries:</span>
          <span className={`${styles.vitalFooterValue} ${styles.goldValue}`}>
            {charitiesCount} Active Partners
          </span>
        </div>
      </div>
    </div>
  );
}
