'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './domain.module.css';
import { UserSubscription } from '@/modules/subscriptions/subscription-types';
import { createCustomerPortalAction } from '@/modules/subscriptions/subscription-actions';

interface ActiveSubscriptionBannerProps {
  subscription: UserSubscription | null;
}

export function ActiveSubscriptionBanner({ subscription }: ActiveSubscriptionBannerProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';

  async function handleOpenPortal() {
    setLoadingPortal(true);
    setErrorMessage(null);
    try {
      const res = await createCustomerPortalAction();
      if (!res.success) {
        setErrorMessage(res.error);
        setLoadingPortal(false);
        return;
      }
      window.location.href = res.data.url;
    } catch {
      setErrorMessage('Failed to connect to billing portal.');
      setLoadingPortal(false);
    }
  }

  function formatRenewalDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  const planName = subscription?.planId === 'plan_yearly' ? 'Annual Plan (£192/yr)' : 'Monthly Plan (£20/mo)';

  return (
    <div className={styles.bannerCard}>
      <div className={styles.bannerInfo}>
        <div className={styles.statusRow}>
          {isActive && (
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-mint)' }} />
              Active Membership
            </span>
          )}
          {isPastDue && (
            <span className={`${styles.statusBadge} ${styles.statusWarning}`}>
              Payment Required (Past Due)
            </span>
          )}
          {!isActive && !isPastDue && (
            <span className={`${styles.statusBadge} ${styles.statusDanger}`}>
              Inactive Membership
            </span>
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{planName}</span>
        </div>

        <h2 className={styles.bannerTitle}>
          {isActive ? 'Your Membership is Active & Eligible' : 'Renew Your Membership for Draw Eligibility'}
        </h2>

        <p className={styles.bannerSubtitle}>
          {isActive
            ? `Next automated billing renewal on ${formatRenewalDate(subscription?.currentPeriodEnd)}. Guaranteed 10% charity lock active.`
            : 'An active membership is required to participate in monthly draws and unlock prize payouts.'}
        </p>

        {errorMessage && (
          <p style={{ fontSize: '0.8rem', color: 'var(--status-danger-text)' }}>{errorMessage}</p>
        )}
      </div>

      <div>
        {subscription?.stripeCustomerId ? (
          <button
            type="button"
            className={styles.portalBtn}
            onClick={handleOpenPortal}
            disabled={loadingPortal}
          >
            {loadingPortal ? 'Opening Portal...' : 'Manage Subscription & Billing'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        ) : (
          <Link href="/pricing" className={styles.subscribeBtn}>
            Choose a Membership Plan
          </Link>
        )}
      </div>
    </div>
  );
}
