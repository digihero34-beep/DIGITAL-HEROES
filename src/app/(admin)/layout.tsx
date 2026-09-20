import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/modules/auth/server-guards';
import styles from './admin-layout.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  if (user.role !== 'admin') {
    redirect('/dashboard?error=admin_privileges_required');
  }

  return (
    <div className={styles.adminWrapper}>
      {/* Top Sovereign Bar */}
      <header className={styles.adminHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.brandCluster}>
            <Link href="/admin" className={styles.brandTitle}>
              DIGITAL HEROES
            </Link>
            <div className={styles.clearanceBadge}>
              <span className={styles.clearanceTag}>
                LEVEL 4 CLEARANCE
              </span>
              <span className={styles.sessionHash}>
                SHA-256: 0x9f4a...d81e
              </span>
            </div>
          </div>

          <nav className={styles.headerNav}>
            <Link href="/" className={styles.navLink}>
              Public View
            </Link>
            <Link href="/dashboard" className={styles.navLink}>
              Subscriber Portal
            </Link>
            <Link href="/admin" className={`${styles.navLink} ${styles.navLinkActive}`}>
              Admin Operations
            </Link>
          </nav>

          <div className={styles.operatorCluster}>
            <div className={styles.liveDrawPill}>
              <span className={styles.pulseDot}></span>
              <span>Live Draw #142 Active</span>
            </div>
            <div className={styles.trusteeProfile}>
              <div className={styles.trusteeAvatar}>AD</div>
              <div className={styles.trusteeInfo}>
                <div className={styles.trusteeName}>{user.fullName || user.email}</div>
                <div className={styles.trusteeRole}>Sovereign Trustee</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Regulatory Sub-Banner */}
      <div className={styles.trustBanner}>
        <div className={styles.trustBannerContent}>
          <div className={styles.trustBannerLeft}>
            <span className={styles.trustEncryptedTag}>
              SESSION ENCRYPTED (ECDSA-SECP256K1)
            </span>
            <span className={styles.trustDivider}>|</span>
            <span className={styles.trustLicense}>
              UK Gambling Commission License: Trust Protocol #084-ARC-2024
            </span>
          </div>
          <div className={styles.trustBannerRight}>
            <span>Operator ID: <strong className={styles.operatorId}>TRUST-DIR-009</strong></span>
            <span className={styles.latencyTag}>
              <span className={styles.latencyDot}></span> 14ms Latency
            </span>
          </div>
        </div>
      </div>

      {/* Operational Content Area */}
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
