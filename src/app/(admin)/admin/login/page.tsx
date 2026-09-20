'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminSignInAction } from '@/modules/auth/auth-actions';
import styles from './admin-login.module.css';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await adminSignInAction({ email, password });

    if (!result.success) {
      setIsSubmitting(false);
      setErrorMessage(result.error);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={styles.securityPill}>LEVEL 4 CLEARANCE</span>
          <span>SOVEREIGN OPERATIONAL TERMINAL</span>
        </div>
        <Link href="/" className={styles.backLink}>
          ← Return to Public Portal
        </Link>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.crestIcon}>🛡️</span>
          <h1 className={styles.title}>Trustee Authentication</h1>
          <p className={styles.subtitle}>
            Verifiable Draw Authority & Regulatory Prize Dispersal Oversight
          </p>
        </div>

        <div className={styles.restrictedNotice}>
          <span className={styles.noticeTitle}>Restricted Operations Gateway</span>
          Access to this terminal requires authenticated Level 4 Sovereign Trustee credentials. All access attempts are recorded to the immutable audit trail.
        </div>

        {errorMessage && (
          <div className={styles.errorMessage} role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="admin-email" className={styles.label}>
              Trustee Email Identifier
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="trustee@digitalheroes.co.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="admin-password" className={styles.label}>
              Clearance Security Key
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Authenticate & Enter Terminal'}
          </button>
        </form>

        <div className={styles.footerVitals}>
          <span>Status: <strong>Online</strong></span>
          <span>Security: <strong>ECDSA-SECP256K1</strong></span>
          <span>Protocol: <strong>UKGC #084-ARC</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#060a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Initializing terminal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

