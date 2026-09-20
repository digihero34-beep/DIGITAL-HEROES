'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../charities.module.css';
import { Charity } from '@/modules/charities/charity-types';
import {
  updateCharityPreferenceAction,
  createDirectDonationAction,
} from '@/modules/charities/charity-actions';

interface CharityProfileClientProps {
  charity: Charity;
  isCurrentUserPartner: boolean;
  currentPercentage: number;
}

const DONATION_PRESETS = [10, 25, 50, 100]; // in GBP pounds

export function CharityProfileClient({
  charity,
  isCurrentUserPartner,
  currentPercentage,
}: CharityProfileClientProps) {
  const router = useRouter();

  const [selectedPercentage, setSelectedPercentage] = useState(currentPercentage || 10);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerMessage, setPartnerMessage] = useState<string | null>(null);

  // Direct Donation State
  const [donationPounds, setDonationPounds] = useState<number | ''>(25);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationMessage, setDonationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSetPartner() {
    setPartnerLoading(true);
    setErrorMessage(null);
    setPartnerMessage(null);

    try {
      const result = await updateCharityPreferenceAction({
        charityId: charity.id,
        contributionPercentage: selectedPercentage,
      });

      if (!result.success) {
        if (result.code === 'UNAUTHORIZED') {
          router.push(`/login?redirect=/charities/${charity.slug}`);
          return;
        }
        setErrorMessage(result.error);
        return;
      }

      setPartnerMessage(
        `Successfully partnered with ${charity.name}! ${selectedPercentage}% of your subscription will fund their work.`
      );
    } catch {
      setErrorMessage('Failed to update charity partnership.');
    } finally {
      setPartnerLoading(false);
    }
  }

  async function handleDirectDonation(e: React.FormEvent) {
    e.preventDefault();
    setDonationLoading(true);
    setErrorMessage(null);
    setDonationMessage(null);

    if (donationPounds === '' || Number(donationPounds) < 1) {
      setErrorMessage('Minimum direct donation is £1.00.');
      setDonationLoading(false);
      return;
    }

    try {
      const result = await createDirectDonationAction({
        charityId: charity.id,
        amountCents: Math.round(Number(donationPounds) * 100),
        donorName: donorName || undefined,
        donorEmail: donorEmail || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setDonationMessage(
        `Thank you! Direct donation of £${Number(donationPounds).toFixed(2)} initiated (Ref: ${result.data.donationId.slice(0, 8)}).`
      );
      setDonorName('');
      setDonorEmail('');
    } catch {
      setErrorMessage('Failed to process donation payment gateway.');
    } finally {
      setDonationLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/charities" style={{ color: 'var(--accent-mint)', fontSize: '0.875rem', fontWeight: 600 }}>
          ← Back to Partner Charity Directory
        </Link>
      </div>

      {/* Hero Banner Section */}
      <section
        className={styles.profileHero}
        style={{
          backgroundImage: charity.bannerUrl ? `url(${charity.bannerUrl})` : 'none',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.cardCategory}>{charity.category}</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF' }}>{charity.name}</h1>
          <p style={{ fontSize: '1.125rem', color: '#E2E8F0', lineHeight: 1.5 }}>{charity.tagline}</p>
        </div>
      </section>

      {errorMessage && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--status-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger-text)',
            fontSize: '0.875rem',
          }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {partnerMessage && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--status-active-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-active-text)',
            fontSize: '0.875rem',
          }}
          role="status"
        >
          {partnerMessage}
        </div>
      )}

      <div className={styles.profileGrid}>
        {/* Left Column: Mission Narrative and Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div className={styles.detailCard}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Mission &amp; Impact
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {charity.description}
            </p>
            {charity.websiteUrl && (
              <div style={{ marginTop: 'var(--space-2)' }}>
                <a
                  href={charity.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-gold)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Visit Official Charity Website ↗
                </a>
              </div>
            )}
          </div>

          <div className={styles.detailCard}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Upcoming Charity Golf Days &amp; Galas
            </h2>
            {charity.events.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No community events scheduled at this moment. Check back soon!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {charity.events.map((event, idx) => (
                  <div key={idx} className={styles.eventCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {event.title}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
                        📅 {event.date}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--accent-gold)' }}>
                      📍 {event.location}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions (Partnership Lock and Direct Donation) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Subscription Partnership Card */}
          <div className={styles.detailCard}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Choose as Partner Charity
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Lock in your monthly contribution. A minimum 10% is guaranteed by charter, but you can increase your support.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Contribution Percentage ({selectedPercentage}%)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                {[10, 15, 25, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    style={{
                      padding: 'var(--space-2)',
                      background: selectedPercentage === pct ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedPercentage === pct ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: selectedPercentage === pct ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                    onClick={() => setSelectedPercentage(pct)}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleSetPartner}
              disabled={partnerLoading}
              style={{ marginTop: 'var(--space-4)' }}
            >
              {partnerLoading
                ? 'Updating...'
                : isCurrentUserPartner
                ? 'Update Partnership Level'
                : 'Partner With This Charity'}
            </button>
          </div>

          {/* Direct Independent Donation Card */}
          <div className={styles.detailCard}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Make a Direct One-Off Donation
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Make an independent donation directly to {charity.name} without an ongoing membership.
            </p>

            {donationMessage && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--status-active-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--status-active-text)',
                  fontSize: '0.8125rem',
                }}
                role="status"
              >
                {donationMessage}
              </div>
            )}

            <form onSubmit={handleDirectDonation} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                {DONATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    style={{
                      padding: 'var(--space-2)',
                      background: donationPounds === preset ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                      border: `1px solid ${donationPounds === preset ? 'var(--accent-mint)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: donationPounds === preset ? 'var(--accent-mint)' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                    onClick={() => setDonationPounds(preset)}
                  >
                    £{preset}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Custom Amount (£)
                </label>
                <input
                  type="number"
                  min={1}
                  value={donationPounds}
                  onChange={(e) => setDonationPounds(e.target.value === '' ? '' : Number(e.target.value))}
                  className={styles.searchInput}
                  placeholder="e.g. 50"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Donor Name (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className={styles.searchInput}
                  placeholder="Anonymous or Your Name"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={donationLoading}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', marginTop: 'var(--space-2)' }}
              >
                {donationLoading ? 'Connecting Gateway...' : `Donate £${Number(donationPounds || 0).toFixed(2)} Directly`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
