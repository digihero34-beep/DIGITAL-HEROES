import React from 'react';
import Link from 'next/link';
import styles from '../layout/footer.module.css';

const PLATFORM_LINKS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/charities', label: 'Charity Directory' },
  { href: '/pricing', label: 'Subscription Plans' },
  { href: '/scores', label: 'Handicap Protocol' },
];

const GOVERNANCE_LINKS = [
  { href: '/how-it-works#audit', label: 'Audit Manifest' },
  { href: '/how-it-works#charter', label: 'Charter & Governance' },
  { href: '/pricing', label: 'Terms of Trust' },
  { href: '/charities', label: 'Allocation Ledger' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* ── Top grid ── */}
        <div className={styles.topGrid}>
          {/* Brand column */}
          <div className={styles.brandCol}>
            <div className={styles.brand}>
              {/* Gold brand mark */}
              <div className={styles.brandGem} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 3h10v8a5 5 0 0 1-10 0V3Z" stroke="var(--primary)" strokeWidth="1.5" />
                  <path d="M3 3h4v5a2 2 0 0 1-4 0V3Z" stroke="var(--primary)" strokeWidth="1.5" />
                  <path d="M17 3h4v5a2 2 0 0 1-4 0V3Z" stroke="var(--primary)" strokeWidth="1.5" />
                  <line x1="12" y1="16" x2="12" y2="20" stroke="var(--primary)" strokeWidth="1.5" />
                  <line x1="8" y1="20" x2="16" y2="20" stroke="var(--primary)" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <div className={styles.brandName}>Digital Heroes</div>
                <div className={styles.brandTagline}>Charity Trust Protocol</div>
              </div>
            </div>

            <p className={styles.mission}>
              A philanthropic golf trust connecting Stableford performance with verified charitable giving and transparent monthly prize draws.
            </p>

            <div className={styles.charityPledgeBadge}>
              <span className={styles.badgeDot} />
              <span>Minimum 10% Social Impact Lock</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <div className={styles.colTitle}>Platform</div>
            <ul className={styles.linkList}>
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href} className={styles.linkItem}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance links */}
          <div>
            <div className={styles.colTitle}>Governance</div>
            <ul className={styles.linkList}>
              {GOVERNANCE_LINKS.map((link) => (
                <li key={link.href} className={styles.linkItem}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Bottom bar ── */}
        <div className={styles.bottomRow}>
          <p className={styles.legalNotice}>
            &copy; {year} Digital Heroes Trust &amp; Philanthropic Archive. Regulated &amp; Cryptographically Verified.
          </p>

          {/* Prize tier capsules */}
          <div className={styles.tierCapsules}>
            {[
              { label: '5-match', value: '40%' },
              { label: '4-match', value: '35%' },
              { label: '3-match', value: '25%' },
            ].map((tier) => (
              <div key={tier.label} className={styles.tierCapsule}>
                <span className={styles.tierValue}>{tier.value}</span>
                <span className={styles.tierLabel}>{tier.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
