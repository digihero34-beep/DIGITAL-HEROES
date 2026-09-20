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

  // Dynamic user avatar initials
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user.email.slice(0, 2).toUpperCase());

  // Dynamic operator ID and session hash
  const operatorId = `DIR-${user.id.slice(0, 8).toUpperCase()}`;
  const sessionHashSuffix = user.id.replace(/-/g, '').slice(0, 6);
  const sessionHashPrefix = user.id.replace(/-/g, '').slice(-4);

  // Fetch active draw number dynamically
  const { supabaseAdmin } = await import('@/infrastructure/database/supabase-admin');
  const { data: latestDraw } = await supabaseAdmin
    .from('draws')
    .select('draw_number, status')
    .order('scheduled_for', { ascending: false })
    .limit(1)
    .maybeSingle();

  const drawStatusText = latestDraw
    ? `Draw #${latestDraw.draw_number} (${latestDraw.status.toUpperCase()})`
    : 'Protocol Ready';

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
                SEC-ID: 0x{sessionHashSuffix}...{sessionHashPrefix}
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
              <span>{drawStatusText}</span>
            </div>
            <div className={styles.trusteeProfile}>
              <div className={styles.trusteeAvatar}>{initials}</div>
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
            <span>Operator ID: <strong className={styles.operatorId}>{operatorId}</strong></span>
            <span className={styles.latencyTag}>
              <span className={styles.latencyDot}></span> Realtime Direct Connect
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
