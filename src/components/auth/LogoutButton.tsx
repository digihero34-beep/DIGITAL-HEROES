'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutAction } from '@/modules/auth/auth-actions';

interface LogoutButtonProps {
  redirectTo?: string;
  className?: string;
  label?: string;
  variant?: 'admin' | 'subscriber' | 'nav';
}

export function LogoutButton({
  redirectTo = '/login',
  className,
  label = 'Sign Out',
  variant = 'subscriber',
}: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await signOutAction();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setIsPending(false);
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: isPending ? 'not-allowed' : 'pointer',
    borderRadius: '0px',
    transition: 'all 120ms ease',
    opacity: isPending ? 0.7 : 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };

  let variantStyles: React.CSSProperties = {};

  if (variant === 'admin') {
    variantStyles = {
      padding: '0.5rem 1rem',
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.35)',
    };
  } else if (variant === 'nav') {
    variantStyles = {
      padding: '0.4rem 0.75rem',
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    };
  } else {
    // Subscriber default
    variantStyles = {
      padding: '0.55rem 1rem',
      backgroundColor: 'var(--surface-container-high)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    };
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={className}
      style={{ ...baseStyles, ...variantStyles }}
      aria-label={label}
      title={label}
    >
      <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>⏻</span>
      <span>{isPending ? 'Signing Out...' : label}</span>
    </button>
  );
}
