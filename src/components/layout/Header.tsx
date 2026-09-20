'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

// Inline SVG icons — no external font dependency
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <rect x="5" y="11" width="14" height="11" rx="0" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Heritage brand mark — a crisp monogram in a square
function BrandMark() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        background: 'var(--primary)',
        border: '1px solid var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Simplified trophy / award silhouette */}
        <path
          d="M7 3h10v8a5 5 0 0 1-10 0V3Z"
          fill="none"
          stroke="#c59b27"
          strokeWidth="1.5"
        />
        <path d="M3 3h4v5a2 2 0 0 1-4 0V3Z" fill="none" stroke="#c59b27" strokeWidth="1.5" />
        <path d="M17 3h4v5a2 2 0 0 1-4 0V3Z" fill="none" stroke="#c59b27" strokeWidth="1.5" />
        <path d="M12 16v4" stroke="#c59b27" strokeWidth="1.5" />
        <path d="M8 20h8" stroke="#c59b27" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/charities', label: 'Charities' },
  { href: '/pricing', label: 'Plans' },
  { href: '/dashboard', label: 'My Portal' },
  { href: '/scores', label: 'Scorecard' },
  { href: '/design-system', label: 'Themes' },
];

const ADMIN_ITEM = { href: '/admin', label: 'Admin' };

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        background: 'var(--surface-container-lowest)',
        borderBottom: scrolled
          ? '1px solid var(--border-medium)'
          : '1px solid var(--border-subtle)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* ── Brand ── */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
          onClick={() => setMobileOpen(false)}
          aria-label="Digital Heroes — Home"
        >
          <BrandMark />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                lineHeight: 1.15,
              }}
            >
              Digital Heroes
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                lineHeight: 1,
              }}
            >
              Charity Trust Protocol
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.25rem',
            height: '100%',
          }}
          className="header-nav-desktop"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 0.75rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                fontWeight: isActive(item.href) ? 700 : 500,
                color: isActive(item.href) ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive(item.href) ? '2px solid var(--secondary-gold)' : '2px solid transparent',
                transition: 'color 120ms ease, border-color 120ms ease',
                textDecoration: 'none',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={ADMIN_ITEM.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              height: '100%',
              padding: '0 0.75rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8125rem',
              fontWeight: isActive(ADMIN_ITEM.href) ? 700 : 500,
              color: isActive(ADMIN_ITEM.href) ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: isActive(ADMIN_ITEM.href) ? '2px solid var(--secondary-gold)' : '2px solid transparent',
              transition: 'color 120ms ease, border-color 120ms ease',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            <IconLock />
            <span>Admin</span>
          </Link>
        </nav>

        {/* ── Trailing Actions ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          {/* Theme Switcher */}
          <ThemeSwitcher />
          {/* Draw countdown pill */}
          <div
            className="header-countdown"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid var(--border-subtle)',
              padding: '0.4rem 0.875rem',
              background: 'var(--surface-container-low)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--secondary-gold)',
                flexShrink: 0,
                animation: 'pulse 2s infinite',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  lineHeight: 1.2,
                }}
              >
                Next Draw
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  lineHeight: 1.2,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.04em',
                }}
              >
                14d 02h 39m
              </span>
            </div>
          </div>

          {/* CTA button */}
          <Link
            href="/pricing"
            className="header-cta"
            style={{
              display: 'none',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: '1px solid var(--primary)',
              padding: '0.55rem 1.25rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background 120ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            Enter Draw
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="header-mobile-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--surface-container-lowest)',
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {[...NAV_ITEMS, ADMIN_ITEM].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                fontWeight: isActive(item.href) ? 700 : 500,
                color: isActive(item.href) ? 'var(--primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              {item.href === '/admin' && (
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
                  <IconLock />
                </span>
              )}
              {item.label}
            </Link>
          ))}
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              marginTop: '1rem',
              padding: '0.875rem 1rem',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: '1px solid var(--primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Enter Draw
          </Link>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (min-width: 768px) {
          .header-nav-desktop { display: flex !important; }
          .header-cta { display: inline-block !important; }
          .header-countdown { display: flex !important; }
          .header-mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
