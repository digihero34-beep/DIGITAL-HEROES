'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';
import { signUpAction } from '@/modules/auth/auth-actions';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

const DEFAULT_CHARITIES = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'GreenGrass Youth Initiative',
    category: 'Youth & Education',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Veterans On The Green',
    category: 'Veterans & Mental Health',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Fore The Planet Woodland Trust',
    category: 'Conservation & Ecology',
  },
];

const CONTRIBUTION_PRESETS = [10, 15, 25, 50];

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [charityId, setCharityId] = useState(DEFAULT_CHARITIES[0].id);
  const [contributionPercentage, setContributionPercentage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (contributionPercentage < 10) {
      setErrorMessage('A minimum 10% charitable contribution is required by Digital Heroes charter.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUpAction({
        fullName,
        email,
        password,
        charityId,
        contributionPercentage,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        setLoading(false);
        return;
      }

      // Route new user to dashboard where subscription activation is promptable
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrorMessage('An unexpected network error occurred. Please try again.');
      setLoading(false);
    }
  }

  const selectedCharity = DEFAULT_CHARITIES.find((c) => c.id === charityId);
  const isMatch = confirmPassword.length > 0 ? password === confirmPassword : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
          Create Your Account
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Track your Stableford rounds, support vetted charities, and enter monthly draws.
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
          <label htmlFor="reg-name" className={styles.label}>
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reg-email" className={styles.label}>
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        </div>

        {/* Primary Password Field with Eye Toggle & Strength Indicator */}
        <div className={styles.formGroup}>
          <label htmlFor="reg-password" className={styles.label}>
            Password
          </label>
          <PasswordInput
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={loading}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password Field with Eye Toggle & Match Indicator */}
        <div className={styles.formGroup}>
          <label htmlFor="reg-confirm-password" className={styles.label}>
            Confirm Password
          </label>
          <PasswordInput
            id="reg-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Re-enter password"
            disabled={loading}
            isValid={isMatch}
          />
          {confirmPassword.length > 0 ? (
            isMatch ? (
              <div className={`${styles.matchIndicator} ${styles.matchIndicatorSuccess}`} role="status">
                <span>✓</span>
                <span>Passwords match</span>
              </div>
            ) : (
              <div className={`${styles.matchIndicator} ${styles.matchIndicatorError}`} role="alert">
                <span>✕</span>
                <span>Passwords do not match</span>
              </div>
            )
          ) : (
            <span className={styles.helperText}>Please re-enter your password to confirm match.</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reg-charity" className={styles.label}>
            Choose Your Partner Charity
          </label>
          <select
            id="reg-charity"
            value={charityId}
            onChange={(e) => setCharityId(e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            {DEFAULT_CHARITIES.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name} ({charity.category})
              </option>
            ))}
          </select>
          {selectedCharity && (
            <div className={styles.charityBadge}>
              <span>🎗️</span>
              <span>100% of your chosen contribution directly funds {selectedCharity.name}</span>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Charity Contribution Percentage ({contributionPercentage}%)
          </label>
          <div className={styles.percentageButtons}>
            {CONTRIBUTION_PRESETS.map((pct) => (
              <button
                key={pct}
                type="button"
                className={`${styles.percentageBtn} ${contributionPercentage === pct ? styles.percentageBtnActive : ''}`}
                onClick={() => setContributionPercentage(pct)}
                disabled={loading}
              >
                {pct}%
              </button>
            ))}
          </div>
          <span className={styles.helperText}>
            Minimum 10% required by platform charter. You can increase or change this at any time in your dashboard.
          </span>
        </div>

        <button
          type="submit"
          id="reg-submit-btn"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Join as Digital Hero'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        Already have an account?{' '}
        <Link href="/login" className={styles.linkAccent}>
          Sign in here
        </Link>
      </div>
    </div>
  );
}
