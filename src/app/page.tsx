import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './home.module.css';
import { DrawSimulator } from '@/components/home/DrawSimulator';
import { getCharitiesAction } from '@/modules/charities/charity-actions';

export const metadata = {
  title: 'Digital Heroes — Play for Purpose. Enter the Draw.',
  description:
    'Turn your golf rounds into radical social good while participating in monthly prize draws with rollover jackpots and provably fair results.',
};

export default async function HomePage() {
  const charityResult = await getCharitiesAction();
  const charities = charityResult.success ? charityResult.data : [];
  const featuredCharity = charities.find((c) => c.isFeatured) || charities[0];

  return (
    <div className={styles.pageWrapper}>
      {/* 1. HERO VIEWPORT */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot} />
          Guaranteed Minimum 10% Social Impact Lock
        </div>

        <h1 className={styles.heroTitle}>
          Play for Purpose. <br />
          <span className={styles.highlightText}>Enter the Monthly Draw.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Digital Heroes bridges your Stableford performance with vital charitable funding.
          Track your rounds, support verified youth and conservation causes, and share in transparent monthly prize pools.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/pricing" className={styles.primaryCta}>
            <span>Join Now — Choose a Plan</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <Link href="/how-it-works" className={styles.secondaryCta}>
            Explore How It Works
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>£125,000+</span>
            <span className={styles.metricLabel}>Total Prize Pools</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>£38,400+</span>
            <span className={styles.metricLabel}>Remitted to Causes</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>40 / 35 / 25%</span>
            <span className={styles.metricLabel}>Transparent Tiers</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>100%</span>
            <span className={styles.metricLabel}>Scorecard Audited</span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE SIMULATION ENGINE */}
      <section className={styles.contentContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Transparent Mechanics</span>
          <h2 className={styles.sectionTitle}>Interactive 5-Ball Draw Engine</h2>
          <p className={styles.sectionSubtitle}>
            Test our rolling Stableford matching algorithm in real-time. See how your rounds match monthly draws and allocate funds.
          </p>
        </div>

        <DrawSimulator />
      </section>

      {/* 3. FOUR-STEP NARRATIVE JOURNEY */}
      <section className={styles.contentContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>The Lifecycle</span>
          <h2 className={styles.sectionTitle}>From First Tee to Lasting Impact</h2>
          <p className={styles.sectionSubtitle}>
            A continuous loop connecting real-world athletic skill with transparent non-profit funding and rewards.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>01</span>
            <h3 className={styles.stepTitle}>Subscribe & Choose Cause</h3>
            <p className={styles.stepDesc}>
              Join on a flexible monthly or yearly membership. Digital Heroes immediately locks a minimum 10% pledge to your chosen non-profit partner, with freedom to scale to 100%.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>02</span>
            <h3 className={styles.stepTitle}>Log Stableford Rounds</h3>
            <p className={styles.stepDesc}>
              Play your regular golf rounds and enter official Stableford points between 1 and 45. Our rolling 5 FIFO engine automatically maintains your five most recent rounds as your official draw entry.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>03</span>
            <h3 className={styles.stepTitle}>Monthly Transparent Draws</h3>
            <p className={styles.stepDesc}>
              Every month, 5 winning numbers are generated via CSPRNG random selection or frequency-weighted algorithms. Match 3, 4, or 5 numbers to share the 25%, 35%, or 40% prize pool.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>04</span>
            <h3 className={styles.stepTitle}>Audit & Direct Payout</h3>
            <p className={styles.stepDesc}>
              Winners submit official scorecard proof or club certificates for verification. Once approved by administrators, prize winnings are transferred directly to your bank account.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CHARITY SPOTLIGHT */}
      {featuredCharity && (
        <section className={styles.contentContainer}>
          <div className={styles.spotlightCard}>
            <div className={styles.spotlightContent}>
              <div className={styles.heroBadge}>
                <span className={styles.badgeDot} />
                Featured Non-Profit Partner
              </div>
              <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>
                {featuredCharity.name}
              </h2>
              <p className={styles.heroSubtitle} style={{ textAlign: 'left', margin: 0 }}>
                {featuredCharity.description}
              </p>

              <div className={styles.spotlightStats}>
                <div className={styles.spotlightStatItem}>
                  <span className={styles.spotlightStatVal}>10%</span>
                  <span className={styles.spotlightStatLbl}>Guaranteed Minimum Lock</span>
                </div>
                <div className={styles.spotlightStatItem}>
                  <span className={styles.spotlightStatVal}>100%</span>
                  <span className={styles.spotlightStatLbl}>Direct Remittance</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link href={`/charities/${featuredCharity.slug}`} className={styles.primaryCta}>
                  View Partner Profile
                </Link>
                <Link href="/charities" className={styles.secondaryCta}>
                  Explore Full Directory
                </Link>
              </div>
            </div>

            {featuredCharity.bannerUrl && (
              <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <Image
                  src={featuredCharity.bannerUrl}
                  alt={featuredCharity.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. PROVABLE INTEGRITY & FAIRNESS ARCHITECTURE */}
      <section className={styles.contentContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Platform Charter</span>
          <h2 className={styles.sectionTitle}>Built for Trust, Not Speculation</h2>
          <p className={styles.sectionSubtitle}>
            Digital Heroes is an athletic participation platform engineered with strict financial controls and cryptographic rigor.
          </p>
        </div>

        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <h3 className={styles.trustCardTitle}>
              <span style={{ color: 'var(--accent-mint)' }}>✓</span> Performance Anchored
            </h3>
            <p className={styles.trustCardText}>
              Numbers are never purchased as lottery tickets. Your entry balls represent actual Stableford scores earned on golf courses, requiring athletic performance and real round dates.
            </p>
          </div>

          <div className={styles.trustCard}>
            <h3 className={styles.trustCardTitle}>
              <span style={{ color: 'var(--accent-gold)' }}>✓</span> Integer-Cent Precision
            </h3>
            <p className={styles.trustCardText}>
              All prize pools, tier allocations (40%, 35%, 25%), and charitable contributions are computed down to the penny. No floating-point inaccuracies, rounding slippage, or hidden margins.
            </p>
          </div>

          <div className={styles.trustCard}>
            <h3 className={styles.trustCardTitle}>
              <span style={{ color: 'var(--accent-blue)' }}>✓</span> Scorecard Proof Auditing
            </h3>
            <p className={styles.trustCardText}>
              To eliminate false claims, every potential winner must submit official scorecard images or club attestations before any bank payout is authorized.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM SUBSCRIPTION CALL TO ACTION */}
      <section className={styles.contentContainer}>
        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>Ready to Make Every Round Count?</h2>
          <p className={styles.ctaSubtitle}>
            Join the community of golfers turning personal milestones into immediate, verified charitable impact while competing for monthly prize pools.
          </p>
          <Link href="/pricing" className={styles.primaryCta} style={{ fontSize: '1.15rem', padding: '1rem 2.5rem' }}>
            <span>Choose Your Plan & Cause</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
