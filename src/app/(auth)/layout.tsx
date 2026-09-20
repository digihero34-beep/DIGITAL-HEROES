import React from 'react';
import styles from './auth.module.css';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={styles.authContainer}>
      <div className={styles.authWrapper}>
        <div className={styles.brandHeader}>
          <Link href="/" className={styles.logoBadge}>
            <span className={styles.logoDot} />
            Digital Heroes
          </Link>
          <h1 className={styles.title}>Play for Purpose</h1>
          <p className={styles.subtitle}>
            Turn your Stableford rounds into charitable funding and participate in monthly transparent draws.
          </p>
        </div>

        <div className={styles.authCard}>
          {children}
        </div>

        <div className={styles.trustBanner}>
          <span>✓ Stripe Verified</span>
          <span>•</span>
          <span>✓ Minimum 10% Charity Lock</span>
          <span>•</span>
          <span>✓ UK Charity Aligned</span>
        </div>
      </div>
    </main>
  );
}
