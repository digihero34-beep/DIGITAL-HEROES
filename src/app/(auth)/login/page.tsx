'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';
import { signInAction } from '@/modules/auth/auth-actions';
import { PasswordInput } from '@/components/auth/PasswordInput';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await signInAction({ email, password });
      if (!result.success) {
        setErrorMessage(result.error);
        setLoading(false);
        return;
      }

      // If user is admin, take them to admin dashboard
      if (result.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTarget);
      }
      router.refresh();
    } catch {
      setErrorMessage('An unexpected network error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Sign in to access your scorecard, draw entries, and charity impact.
        </p>
      </div>

      {errorMessage && (
        <div className={styles.alertError} role="alert">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="login-email" className={styles.label}>
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="login-password" className={styles.label}>
              Password
            </label>
          </div>
          <PasswordInput
            id="login-password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          id="login-submit-btn"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        Don&apos;t have an active membership?{' '}
        <Link href="/register" className={styles.linkAccent}>
          Join Digital Heroes
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
