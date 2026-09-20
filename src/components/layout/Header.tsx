'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './header.module.css';

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // In auth pages (login/register), we don't show navigation clutter
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return null;
  }

  const navItems = [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/charities', label: 'Charities' },
    { href: '/pricing', label: 'Membership' },
    { href: '/scores', label: 'Scorecard' },
    { href: '/winnings', label: 'Winnings' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={() => setMobileOpen(false)}>
          <div className={styles.brandGem}>DH</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>Digital Heroes</span>
            <span className={styles.brandTagline}>Play for Purpose</span>
          </div>
        </Link>

        <nav className={styles.nav} aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Link href="/login" className={styles.signInBtn}>
            Sign In
          </Link>
          <Link href="/pricing" className={styles.joinBtn}>
            <span>Join Now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenuOpen}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.mobileActions}>
            <Link
              href="/pricing"
              className={styles.mobileJoinBtn}
              onClick={() => setMobileOpen(false)}
            >
              Join the Movement
            </Link>
            <Link
              href="/login"
              className={styles.mobileSignInBtn}
              onClick={() => setMobileOpen(false)}
            >
              Subscriber Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
