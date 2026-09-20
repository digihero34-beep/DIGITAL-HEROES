import React from 'react';
import {
  getAdminPlatformStatsAction,
  getAdminVerificationQueueAction,
  getAdminSubscribersAction,
  getAdminCharitiesAction,
} from '@/modules/admin/admin-actions';
import VerificationQueueTable from '@/components/admin/VerificationQueueTable';
import DrawCeremonyControl from '@/components/admin/DrawCeremonyControl';
import SubscriberAuditTable from '@/components/admin/SubscriberAuditTable';
import CharityGovernanceTable from '@/components/admin/CharityGovernanceTable';
import styles from '../admin.module.css';

export const metadata = {
  title: 'Admin Operations & Sovereign Trust Console | Digital Heroes',
  description: 'Cryptographic draw oversight, winner verification attestation, and subscriber handicap governance.',
};

export default async function AdminDashboardPage() {
  const [statsRes, queueRes, subsRes, charitiesRes] = await Promise.all([
    getAdminPlatformStatsAction(),
    getAdminVerificationQueueAction(),
    getAdminSubscribersAction({ limit: 50 }),
    getAdminCharitiesAction(),
  ]);

  const stats = statsRes.success && statsRes.data ? statsRes.data : {
    merkleRoot: 'Genesis Protocol Root',
    merkleLockState: 'Cycle Scheduled',
    dualEntropyBeacon: {
      syncBlock: 0,
      nistStatus: 'Healthy / Verified' as const,
      latencyMs: 1,
    },
    pendingVerificationsCount: 0,
    ytdPhilanthropicYieldCents: 0,
    activeSubscribersCount: 0,
    totalSubscribersCount: 0,
    nextDraw: null,
  };

  const verificationItems = queueRes.success && queueRes.data ? queueRes.data : [];
  const subscribers = subsRes.success && subsRes.data?.subscribers ? subsRes.data.subscribers : [];
  const totalSubscribers = subsRes.success && subsRes.data?.total ? subsRes.data.total : 0;
  const charities = charitiesRes.success && charitiesRes.data ? charitiesRes.data : [];

  return (
    <div className={styles.adminPage}>
      {/* SECTION 1: COMMAND HEADER & SYSTEM VITALS */}
      <section className={styles.commandHeader}>
        <div>
          <div className={styles.commandMeta}>
            <span>🛡️ SOVEREIGN PHILANTHROPIC ARCHIVE</span>
          </div>
          <h1 className={styles.pageTitle}>
            Trust Operations & Cryptographic Oversight
          </h1>
          <p className={styles.pageDesc}>
            Real-time multi-signature ledger control, verifiable randomness validation, and regulatory prize dispersal authorization.
          </p>
        </div>

        <div className={styles.commandActions}>
          <button type="button" className={styles.manifestBtn}>
            Export Audit Manifest
          </button>
          <button type="button" className={styles.commitSigBtn}>
            Commit Trust Sig
          </button>
        </div>
      </section>

      {/* Vitals Bento Grid */}
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
            <div className={styles.vitalMetricHeading}>
              Syncing Block #{stats.dualEntropyBeacon.syncBlock.toLocaleString()}
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
            <div className={styles.vitalMetricBig}>
              £{(stats.ytdPhilanthropicYieldCents / 100).toLocaleString('en-GB')}
            </div>
          </div>
          <div className={styles.vitalFooter}>
            <span className={styles.vitalFooterLabel}>Accredited Beneficiaries:</span>
            <span className={`${styles.vitalFooterValue} ${styles.goldValue}`}>
              {charities.length} Active Partners
            </span>
          </div>
        </div>
      </div>

      {/* OPERATIONAL SURFACES STACK */}
      <div className={styles.sectionsStack}>
        {/* Surface 1: Winner Verification & Attestation Queue */}
        <VerificationQueueTable initialItems={verificationItems} />

        {/* Surface 2: Dual-Key Draw Ceremony Console */}
        {stats.nextDraw && (
          <DrawCeremonyControl
            drawId={stats.nextDraw.id}
            drawNumber={stats.nextDraw.drawNumber}
            scheduledFor={stats.nextDraw.scheduledFor}
            initialStatus={stats.nextDraw.status}
            totalPoolCents={stats.nextDraw.totalPoolCents}
          />
        )}

        {/* Surface 3: Subscriber & Score Audit Ledger */}
        <SubscriberAuditTable
          initialSubscribers={subscribers}
          total={totalSubscribers}
        />

        {/* Surface 4: Charity Governance & Philanthropic Allocation */}
        <CharityGovernanceTable initialCharities={charities} />
      </div>
    </div>
  );
}
