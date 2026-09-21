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
import AdminVitalsBento from '@/components/admin/AdminVitalsBento';
import AdminHeaderActions from '@/components/admin/AdminHeaderActions';
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

        <AdminHeaderActions />
      </section>

      {/* Vitals Bento Grid with Live Real-Time Subscriptions */}
      <AdminVitalsBento initialStats={stats} charitiesCount={charities.length} />

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
