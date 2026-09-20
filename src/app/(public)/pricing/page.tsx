'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './pricing.module.css';
import { createCheckoutSessionAction } from '@/modules/subscriptions/subscription-actions';

export default function PricingPage() {
  const router = useRouter();
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubscribe(planId: 'plan_monthly' | 'plan_yearly') {
    setLoadingPlan(planId);
    setErrorMessage(null);

    try {
      const result = await createCheckoutSessionAction(planId);

      if (!result.success) {
        if (result.code === 'UNAUTHORIZED') {
          router.push(`/login?redirect=/pricing`);
          return;
        }
        setErrorMessage(result.error);
        setLoadingPlan(null);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = result.data.url;
    } catch {
      setErrorMessage('Failed to connect with payment gateway. Please try again.');
      setLoadingPlan(null);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Official Membership
        </div>
        <h1 className={styles.title}>Play for Purpose.<br />Enter the Draw.</h1>
        <p className={styles.subtitle}>
          One simple membership unlocks official Stableford scorecard tracking, direct charitable funding,
          and transparent monthly draws with rollover jackpots.
        </p>

        <div className={styles.toggleWrapper} role="radiogroup" aria-label="Billing frequency">
          <button
            type="button"
            className={`${styles.toggleBtn} ${interval === 'month' ? styles.toggleBtnActive : ''}`}
            onClick={() => setInterval('month')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${interval === 'year' ? styles.toggleBtnActive : ''}`}
            onClick={() => setInterval('year')}
          >
            Annual Billing
            <span className={styles.savingsBadge}>Save 20%</span>
          </button>
        </div>
      </header>

      {errorMessage && (
        <div
          style={{
            maxWidth: '600px',
            width: '100%',
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--status-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger-text)',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className={styles.pricingGrid}>
        {/* Monthly Plan */}
        <div className={`${styles.planCard} ${interval === 'month' ? styles.planCardFeatured : ''}`}>
          {interval === 'month' && <div className={styles.featuredTag}>Flexible Choice</div>}
          <div className={styles.planHeader}>
            <h2 className={styles.planName}>Monthly Membership</h2>
            <p className={styles.planDesc}>Complete access billed month-to-month. Cancel anytime.</p>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.currency}>£</span>
            <span className={styles.amount}>20</span>
            <span className={styles.interval}>/ month</span>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Latest 5-Score Tracking:</strong> Enter Stableford scores (1–45) with automatic rolling FIFO updates.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Monthly Transparent Draws:</strong> Automatic entry into 5-number, 4-number, and 3-number match tiers.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Jackpot Rollover:</strong> 5-number jackpot pool rolls over to next month if unclaimed.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Guaranteed Charity Lock:</strong> Minimum 10% of fees directly fund your chosen charity partner.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Full Impact Dashboard:</strong> Track verified charity contributions and your draw history.</span>
            </li>
          </ul>

          <button
            type="button"
            className={`${styles.ctaBtn} ${interval === 'month' ? styles.ctaBtnPrimary : styles.ctaBtnSecondary}`}
            onClick={() => handleSubscribe('plan_monthly')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'plan_monthly' ? 'Starting Checkout...' : 'Select Monthly (£20/mo)'}
          </button>
        </div>

        {/* Annual Plan */}
        <div className={`${styles.planCard} ${interval === 'year' ? styles.planCardFeatured : ''}`}>
          {interval === 'year' && <div className={styles.featuredTag}>Best Value • Save 20% (£48 Off)</div>}
          <div className={styles.planHeader}>
            <h2 className={styles.planName}>Annual Membership</h2>
            <p className={styles.planDesc}>Maximum commitment to your chosen charity with a 20% discount.</p>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.currency}>£</span>
            <span className={styles.amount}>192</span>
            <span className={styles.interval}>/ year (£16/mo)</span>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>All Monthly Features Included:</strong> Full scorecard tracking, draws, and charity allocations.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>20% Annual Savings:</strong> Equivalent to £16/mo (save £48 every year).</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Uninterrupted Draw Eligibility:</strong> Continuous participation in all 12 monthly draws.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Higher Charity Impact:</strong> Sustained annual funding for your chosen cause.</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              <span><strong>Priority Winner Verification:</strong> Expedited review for prize claim verification.</span>
            </li>
          </ul>

          <button
            type="button"
            className={`${styles.ctaBtn} ${interval === 'year' ? styles.ctaBtnPrimary : styles.ctaBtnSecondary}`}
            onClick={() => handleSubscribe('plan_yearly')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'plan_yearly' ? 'Starting Checkout...' : 'Select Annual (£192/yr)'}
          </button>
        </div>
      </div>

      <div className={styles.trustBar}>
        <div className={styles.trustItem}>
          <span>🔒</span>
          <span>Stripe 256-bit Encrypted Checkout</span>
        </div>
        <div className={styles.trustItem}>
          <span>🎗️</span>
          <span>100% Audited Charity Governance</span>
        </div>
        <div className={styles.trustItem}>
          <span>⚖️</span>
          <span>Cryptographically Transparent Draws</span>
        </div>
        <div className={styles.trustItem}>
          <span>↺</span>
          <span>Cancel or Switch Anytime</span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already a subscriber? <Link href="/login" style={{ color: 'var(--accent-mint)', fontWeight: 600 }}>Sign in to your dashboard</Link>
      </div>
    </div>
  );
}
