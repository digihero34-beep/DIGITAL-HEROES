'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // In auth pages (login/register), we don't show navigation clutter
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Public View' },
    { href: '/dashboard', label: 'Subscriber Portal' },
    { href: '/scores', label: 'Scorecard' },
    { href: '/charities', label: 'Charities' },
    { href: '/winnings', label: 'Verification' },
    { href: '/admin', label: 'Admin Operations' },
  ];

  return (
    <header className="w-full bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-20">
        {/* Brand Anchor */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-headline-md font-headline-md tracking-wider font-semibold text-primary"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-9 h-9 border border-primary flex items-center justify-center bg-primary-container text-secondary-fixed">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
            </div>
            <span>DIGITAL HEROES</span>
          </Link>
          <span className="hidden lg:inline-block border-l border-outline-variant pl-3 font-label-sm text-label-sm text-outline uppercase tracking-widest">
            Charity Trust Protocol
          </span>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-all pb-1 font-label-lg text-label-lg flex items-center gap-1.5 ${
                  isActive
                    ? 'border-b-2 border-secondary text-secondary font-bold tracking-wide'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span>{item.label}</span>
                {item.href === '/admin' && (
                  <span className="material-symbols-outlined text-xs text-error">lock</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Live Countdown Indicator */}
          <div className="hidden sm:flex items-center gap-2 border border-secondary bg-surface-container-lowest px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] uppercase text-on-surface-variant leading-none">
                Live Draw Protocol
              </span>
              <span className="font-mono text-label-lg font-bold text-primary leading-tight">
                02h 14m 39s
              </span>
            </div>
          </div>

          <Link
            href="/pricing"
            className="hidden sm:inline-block bg-primary hover:bg-primary-container text-on-primary px-5 py-2.5 font-label-lg text-label-lg tracking-wide border border-primary transition-colors uppercase font-bold"
          >
            Enter Draw
          </Link>

          <div className="w-9 h-9 border border-outline-variant bg-surface-container flex items-center justify-center font-serif text-primary font-bold ml-1" title="Patron profile badge">
            DH
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 text-primary border border-outline-variant"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sub-Bar */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col border-t border-outline-variant bg-surface-container-lowest px-4 py-4 space-y-3 text-label-sm font-label-sm uppercase">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1.5 ${
                  isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/pricing"
            className="w-full text-center bg-primary text-on-primary py-2.5 uppercase font-bold mt-2"
            onClick={() => setMobileOpen(false)}
          >
            Enter Draw
          </Link>
        </div>
      )}
    </header>
  );
}
