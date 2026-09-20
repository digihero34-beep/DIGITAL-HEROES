'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './domain.module.css';
import { Charity, UserCharityPreference } from '@/modules/charities/charity-types';
import { updateCharityPreferenceAction } from '@/modules/charities/charity-actions';
import { formatCurrencyGBP } from '@/modules/prizes/prize-engine';

interface CharityPreferenceCardProps {
  charity: Charity | null;
  preference: UserCharityPreference | null;
  subscriptionAmountCents?: number;
}

export function CharityPreferenceCard({
  charity,
  preference,
  subscriptionAmountCents = 2000,
}: CharityPreferenceCardProps) {
  const [percentage, setPercentage] = useState<number>(
    preference?.contributionPercentage ?? 10
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calculatedDonationCents = Math.round((subscriptionAmountCents * percentage) / 100);

  const [imgError, setImgError] = useState(false);

  async function handlePercentageChange(newVal: number) {
    setPercentage(newVal);
    setSaveSuccess(false);
    setErrorMessage(null);

    if (!charity) return;

    setIsSaving(true);
    try {
      const res = await updateCharityPreferenceAction({
        charityId: charity.id,
        contributionPercentage: newVal,
      });

      if (!res.success) {
        setErrorMessage(res.error);
        setIsSaving(false);
        return;
      }

      setSaveSuccess(true);
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMessage('Failed to update charitable contribution.');
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.charityCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleArea}>
          <h3 className={styles.cardTitle}>Your Social Impact Partner</h3>
          <p className={styles.cardSubtitle}>
            A guaranteed minimum 10% of your subscription funds this cause directly each month.
          </p>
        </div>

        <Link href="/charities" className={styles.manageLink}>
          <span>Change Cause / Directory</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {charity ? (
        <div className={styles.charityHeader}>
          {charity.logoUrl && !imgError ? (
            <div style={{ position: 'relative', width: 54, height: 54, borderRadius: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <Image
                src={charity.logoUrl}
                alt={charity.name}
                fill
                sizes="54px"
                style={{ objectFit: 'cover' }}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div
              className={styles.charityLogo}
              style={{
                width: 54,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--status-active-bg, rgba(0, 25, 16, 0.08))',
                border: '1px solid var(--border-subtle)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {charity.name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('')}
            </div>
          )}

          <div className={styles.charityDetails}>
            <span className={styles.charityName}>{charity.name}</span>
            <span className={styles.charityCategory}>{charity.category}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {charity.tagline}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No charity selected yet. Digital Heroes will default your 10% contribution to our featured partner.
          </p>
          <Link href="/charities" style={{ color: 'var(--accent-mint)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
            Browse and Select a Charity Partner &rarr;
          </Link>
        </div>
      )}

      {/* Voluntary Contribution Slider */}
      <div className={styles.sliderContainer}>
        <div className={styles.sliderHeader}>
          <span>Monthly Charitable Contribution Level:</span>
          <span className={styles.sliderBadge}>{percentage}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={percentage}
          onChange={(e) => handlePercentageChange(Number(e.target.value))}
          disabled={!charity || isSaving}
          className={styles.rangeInput}
          aria-label="Adjust voluntary charitable contribution percentage"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>10% (Platform Guarantee)</span>
          <span>50%</span>
          <span>100% (Full Philanthropy)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Projected Monthly Remittance: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrencyGBP(calculatedDonationCents)}</strong>
          </span>
          {isSaving && <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)' }}>Saving...</span>}
          {saveSuccess && <span style={{ fontSize: '0.75rem', color: '#34D399' }}>✓ Saved successfully</span>}
        </div>

        {errorMessage && (
          <p style={{ fontSize: '0.75rem', color: 'var(--status-danger-text)' }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
