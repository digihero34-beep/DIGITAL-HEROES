'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './charities.module.css';
import { Charity } from '@/modules/charities/charity-types';
import { filterCharities } from '@/modules/charities/charity-validation';

interface CharityDirectoryClientProps {
  initialCharities: Charity[];
}

const CATEGORIES = [
  'All',
  'Youth & Education',
  'Mental Health & Veterans',
  'Environment & Conservation',
];

export function CharityDirectoryClient({ initialCharities }: CharityDirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharities = useMemo(() => {
    return filterCharities(initialCharities, searchQuery, selectedCategory);
  }, [initialCharities, searchQuery, selectedCategory]);

  const featuredCharity = useMemo(() => {
    return initialCharities.find((c) => c.isFeatured);
  }, [initialCharities]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Guaranteed Social Impact
        </div>
        <h1 className={styles.title}>Partner Charity Directory</h1>
        <p className={styles.subtitle}>
          Digital Heroes ensures that a minimum 10% of every subscription and direct donation directly funds
          verified non-profits changing lives through sport, youth development, and conservation.
        </p>
      </header>

      {/* Featured Spotlight Card */}
      {featuredCharity && selectedCategory === 'All' && searchQuery === '' && (
        <section className={styles.featuredCard}>
          <div style={{ position: 'relative', width: '100%', minHeight: '260px' }}>
            {featuredCharity.bannerUrl && (
              <Image
                src={featuredCharity.bannerUrl}
                alt={featuredCharity.name}
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                className={styles.featuredImage}
                priority
              />
            )}
          </div>
          <div className={styles.featuredContent}>
            <div className={styles.spotlightTag}>
              <span>★ Featured Partner Spotlight</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {featuredCharity.name}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {featuredCharity.tagline}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Link href={`/charities/${featuredCharity.slug}`} className={styles.btnPrimary}>
                View Profile &amp; Events →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Search & Category Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, cause, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Search partner charities"
          />
        </div>

        <div className={styles.categoryGroup} role="radiogroup" aria-label="Filter by cause category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.categoryBtn} ${
                selectedCategory === cat ? styles.categoryBtnActive : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charity Grid */}
      <div className={styles.charityGrid}>
        {filteredCharities.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: 'var(--space-12)',
              textAlign: 'center',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)' }}>No partner charities found.</p>
            <p style={{ fontSize: '0.875rem' }}>Try clearing your search query or selecting another category.</p>
          </div>
        ) : (
          filteredCharities.map((charity) => (
            <div key={charity.id} className={styles.charityCard}>
              <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                {charity.bannerUrl && (
                  <Image
                    src={charity.bannerUrl}
                    alt={charity.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.cardBanner}
                  />
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.cardCategory}>{charity.category}</span>
                <h3 className={styles.cardName}>{charity.name}</h3>
                <p className={styles.cardTagline}>{charity.tagline}</p>

                {charity.events.length > 0 && (
                  <div className={styles.eventRibbon}>
                    <span>📅</span>
                    <span>{charity.events.length} Upcoming Golf Benefit Event(s)</span>
                  </div>
                )}

                <div className={styles.cardActions}>
                  <Link href={`/charities/${charity.slug}`} className={styles.btnPrimary}>
                    View Mission &amp; Donate
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
