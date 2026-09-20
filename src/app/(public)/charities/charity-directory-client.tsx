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
    return initialCharities.find((c) => c.isFeatured) || initialCharities[0];
  }, [initialCharities]);

  return (
    <div className={styles.container}>
      {/* ── Editorial Sovereign Header ── */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Guaranteed Social Impact
        </div>
        <h1 className={styles.title}>Partner Charity Directory</h1>
        <p className={styles.subtitle}>
          Digital Heroes ensures that a minimum 10% of every subscriber membership and direct donation directly funds
          verified non-profits changing lives through athletic access, veteran rehabilitation, and conservation.
        </p>
      </header>

      {/* ── Featured Spotlight Master Slab ── */}
      {featuredCharity && selectedCategory === 'All' && searchQuery === '' && (
        <section className={styles.featuredCard}>
          <div className={styles.featuredImageWrap}>
            {featuredCharity.bannerUrl && (
              <Image
                src={featuredCharity.bannerUrl}
                alt={featuredCharity.name}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className={styles.featuredImage}
                priority
              />
            )}
            <div className={styles.featuredImageOverlay} />
            <span className={styles.featuredImageTag}>ACCREDITED TRUST • GB-REGULATED</span>
          </div>

          <div className={styles.featuredContent}>
            <div className={styles.spotlightTag}>
              <span>★ FEATURED BENEFICIARY SPOTLIGHT</span>
            </div>

            <h2 className={styles.featuredTitle}>{featuredCharity.name}</h2>

            <p className={styles.featuredTagline}>{featuredCharity.tagline}</p>

            <div className={styles.featuredStatsGrid}>
              <div className={styles.featuredStatBox}>
                <span className={styles.featuredStatValue}>10% MIN</span>
                <span className={styles.featuredStatLabel}>Guaranteed Lock</span>
              </div>
              <div className={styles.featuredStatBox}>
                <span className={styles.featuredStatValue}>100%</span>
                <span className={styles.featuredStatLabel}>Direct Escrow</span>
              </div>
              <div className={styles.featuredStatBox}>
                <span className={styles.featuredStatValue}>{featuredCharity.category.split(' ')[0]}</span>
                <span className={styles.featuredStatLabel}>Core Domain</span>
              </div>
            </div>

            <div className={styles.featuredActions}>
              <Link href={`/charities/${featuredCharity.slug}`} className={styles.featuredCtaPrimary}>
                View Mission &amp; Events →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Search & Filter Navigation Bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search trusts by name, cause, or keyword..."
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

      {/* ── Perfectly Symmetrical 3-Column Sovereign Grid ── */}
      <div className={styles.charityGrid}>
        {filteredCharities.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>No partner charities match your filter criteria.</p>
            <p className={styles.emptyStateSubtitle}>Try clearing your search term or selecting another category.</p>
          </div>
        ) : (
          filteredCharities.map((charity) => (
            <article key={charity.id} className={styles.charityCard}>
              <div className={styles.cardImageFrame}>
                {charity.bannerUrl && (
                  <Image
                    src={charity.bannerUrl}
                    alt={charity.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.cardBanner}
                  />
                )}
                <div className={styles.cardImageOverlay} />
                <span className={styles.cardCategoryBadge}>{charity.category}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardContentTop}>
                  <h3 className={styles.cardName}>{charity.name}</h3>
                  <p className={styles.cardTagline}>{charity.tagline}</p>
                </div>

                <div className={styles.cardContentBottom}>
                  {charity.events && charity.events.length > 0 && (
                    <div className={styles.eventRibbon}>
                      <span className={styles.eventIcon}>📅</span>
                      <span>
                        {charity.events.length} Upcoming Benefit Tournament{charity.events.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <Link href={`/charities/${charity.slug}`} className={styles.btnPrimary}>
                      View Mission &amp; Events →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
