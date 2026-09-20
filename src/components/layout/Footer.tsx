import React from 'react';
import Link from 'next/link';
import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topGrid}>
          {/* Brand & Purpose */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              <div className={styles.brandGem}>DH</div>
              <span className={styles.brandName}>Digital Heroes</span>
            </Link>
            <p className={styles.mission}>
              Transforming golf performance into direct charitable funding while rewarding players through transparent,
              provably fair monthly prize draws.
            </p>
            <div className={styles.charityPledgeBadge}>
              <span className={styles.badgeDot} />
              10% Minimum Guaranteed Charity Lock
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className={styles.colTitle}>Platform</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/how-it-works">How It Works</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/charities">Charity Directory</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/pricing">Membership Plans</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/scores">Stableford Scorecard</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/winnings">Winnings & Claims</Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Rules */}
          <div>
            <h4 className={styles.colTitle}>Fairness</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/how-it-works#math">Draw Mathematics</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/how-it-works#audit">Scorecard Audit Protocol</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/charities">Verified Causes</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/pricing">Integer-Cent Accounting</Link>
              </li>
            </ul>
          </div>

          {/* Social Good Commitment */}
          <div className={styles.trustCol}>
            <h4 className={styles.colTitle}>Integrity</h4>
            <p className={styles.trustText}>
              Digital Heroes is a skill-anchored golf participation platform. Draws are tied strictly to players&apos; official Stableford scores (1–45). All prize disbursements require scorecard proof audits.
            </p>
            <p className={styles.trustText}>
              Payments processed securely via Stripe. Charity disbursements remitted directly to registered charity partners under platform charter.
            </p>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottomRow}>
          <p className={styles.legalNotice}>
            &copy; {new Date().getFullYear()} Digital Heroes Ltd. All rights reserved. Registered under UK corporate and charitable donation regulations.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span>Stripe Secured</span>
            <span>•</span>
            <span>Scorecard Verified</span>
            <span>•</span>
            <span>CSPRNG Validated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
