import React from 'react';
import Link from 'next/link';
import styles from './how-it-works.module.css';

export const metadata = {
  title: 'How It Works — Digital Heroes Platform Architecture',
  description:
    'Detailed technical and operational guide to Stableford scoring, rolling 5 FIFO active sets, monthly draw mathematics, and charitable remittance.',
};

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      {/* Editorial Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Complete Architectural Guide
        </div>
        <h1 className={styles.title}>How Digital Heroes Works</h1>
        <p className={styles.subtitle}>
          A transparent, performance-anchored system engineered to convert amateur golf milestones into direct non-profit funding and verified monthly rewards.
        </p>
      </header>

      {/* 1. Stableford Scoring Engine */}
      <section className={styles.section} id="scoring">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionStep}>Step 01</span>
          <h2 className={styles.sectionTitle}>Stableford Scoring (1–45 Points)</h2>
          <p className={styles.sectionText}>
            Digital Heroes utilizes the internationally recognized Stableford scoring system. Unlike gross stroke play, Stableford awards points relative to par on each hole adjusted for handicap.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🏌️</div>
            <h3 className={styles.cardTitle}>Universal Domain (1–45)</h3>
            <p className={styles.cardDesc}>
              Scores are validated between 1 and 45 points inclusive. Any submitted score outside this range is immediately rejected by database and application checks.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>📅</div>
            <h3 className={styles.cardTitle}>One Round Per Calendar Date</h3>
            <p className={styles.cardDesc}>
              To preserve statistical integrity, subscribers can submit at most one official round per calendar date. Future dates are prohibited.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🛡️</div>
            <h3 className={styles.cardTitle}>Scorecard Auditing</h3>
            <p className={styles.cardDesc}>
              Keep your paper scorecards or digital app summaries. Winners must upload scorecard proof for audit before funds can be released.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Rolling 5 FIFO Mechanism */}
      <section className={styles.section} id="rolling-5">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionStep}>Step 02</span>
          <h2 className={styles.sectionTitle}>The Rolling 5 Active FIFO Set</h2>
          <p className={styles.sectionText}>
            Your official monthly draw entry consists of exactly your five most recent played rounds.
          </p>
        </div>

        <div className={styles.formulaBox}>
          ACTIVE_DRAW_SET = SELECT points FROM scores WHERE user_id = $1 ORDER BY round_date DESC, created_at DESC LIMIT 5
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🔄</div>
            <h3 className={styles.cardTitle}>Automatic FIFO Replacement</h3>
            <p className={styles.cardDesc}>
              When you submit a 6th round, it automatically becomes active. The 5th oldest round is preserved in your permanent history for analytics.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>✏️</div>
            <h3 className={styles.cardTitle}>Edit & Delete Recalculation</h3>
            <p className={styles.cardDesc}>
              If you correct or delete an earlier round, our database triggers instantly recalculate the top 5 chronological rounds to maintain a full active set.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🎯</div>
            <h3 className={styles.cardTitle}>Participation Eligibility</h3>
            <p className={styles.cardDesc}>
              Active subscribers with at least 5 logged rounds are fully eligible for all draw prize tiers (5-match, 4-match, 3-match).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Monthly Draw Mechanics */}
      <section className={styles.section} id="math">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionStep}>Step 03</span>
          <h2 className={styles.sectionTitle}>Monthly Draws: CSPRNG & Algorithmic Modes</h2>
          <p className={styles.sectionText}>
            At the close of each monthly cycle, five winning numbers are drawn. Administrators configure whether the draw executes via pure cryptographic randomness or community score weighting.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🎲</div>
            <h3 className={styles.cardTitle}>Cryptographic Random (CSPRNG)</h3>
            <p className={styles.cardDesc}>
              Generated using operating-system entropy (`crypto.getRandomValues`). Every number between 1 and 45 has an exact 1/45 equal probability of selection.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>📊</div>
            <h3 className={styles.cardTitle}>Algorithmic Frequency Weighting</h3>
            <p className={styles.cardDesc}>
              Calculated based on actual score distribution of active subscriber rounds, smoothed with Laplace (+1) Bayesian smoothing so every number retains positive probability.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🔒</div>
            <h3 className={styles.cardTitle}>Immutable Publication Ledger</h3>
            <p className={styles.cardDesc}>
              Once an administrator publishes a draw, results and prize distributions are locked permanently in PostgreSQL with an audit timestamp.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Prize Pool Economics & Rollover */}
      <section className={styles.section} id="economics">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionStep}>Step 04</span>
          <h2 className={styles.sectionTitle}>Prize Pool Tiers & Jackpot Rollover</h2>
          <p className={styles.sectionText}>
            Every penny in the monthly prize pool is accounted for using integer-cent arithmetic. There is zero rounding slippage or operator skimming.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🥇</div>
            <h3 className={styles.cardTitle}>Tier 1: 5-Match (40% + Rollover)</h3>
            <p className={styles.cardDesc}>
              Match all 5 numbers to claim the Tier 1 Jackpot. If no subscriber matches all 5 numbers, the entire 40% allocation rolls over to next month&apos;s draw!
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🥈</div>
            <h3 className={styles.cardTitle}>Tier 2: 4-Match (35%)</h3>
            <p className={styles.cardDesc}>
              Match 4 of 5 numbers to share 35% of the prize pool. Divided equally among all winning subscribers in that tier.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🥉</div>
            <h3 className={styles.cardTitle}>Tier 3: 3-Match (25%)</h3>
            <p className={styles.cardDesc}>
              Match 3 of 5 numbers to share 25% of the prize pool. High frequency tier ensuring regular rewards for active participants.
            </p>
          </div>
        </div>
      </section>

      {/* 5. The Charitable Guarantee */}
      <section className={styles.section} id="charity">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionStep}>Step 05</span>
          <h2 className={styles.sectionTitle}>The 10% Minimum Charitable Charter</h2>
          <p className={styles.sectionText}>
            Charity is our foundational purpose. Every subscription fee and standalone donation directly funds registered non-profit organizations.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🤝</div>
            <h3 className={styles.cardTitle}>Guaranteed 10% Platform Lock</h3>
            <p className={styles.cardDesc}>
              Subscribers cannot lower charity contributions below 10%. This allocation is enforced at the database check constraint level.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>📈</div>
            <h3 className={styles.cardTitle}>Voluntary Scaling (Up to 100%)</h3>
            <p className={styles.cardDesc}>
              Subscribers can voluntarily increase their giving to 15%, 25%, 50%, or 100% of their subscription fees at any time from their profile.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>💳</div>
            <h3 className={styles.cardTitle}>Direct Non-Profit Remittance</h3>
            <p className={styles.cardDesc}>
              Charity funds are routed directly to non-profit accounts using Stripe Connected accounts and transparent corporate disbursement schedules.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Scorecard Verification & Payout */}
      <section className={styles.section} id="audit">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionStep}>Step 06</span>
          <h2 className={styles.sectionTitle}>Scorecard Verification & Bank Transfer</h2>
          <p className={styles.sectionText}>
            To protect honest golfers and ensure fair play, Digital Heroes requires all prize winners to complete a simple verification step.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>📸</div>
            <h3 className={styles.cardTitle}>Proof Upload (JPG, PNG, PDF)</h3>
            <p className={styles.cardDesc}>
              Upload a clear photo of your paper scorecard or club app screenshot (up to 10MB).
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🔍</div>
            <h3 className={styles.cardTitle}>Independent Admin Review</h3>
            <p className={styles.cardDesc}>
              Administrators verify the round date, player identity, and score markers against your logged rounds.
            </p>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.cardIcon}>🏦</div>
            <h3 className={styles.cardTitle}>Direct Bank Transfer</h3>
            <p className={styles.cardDesc}>
              Once approved, payments are issued directly via BACS bank transfer with an audited transaction reference.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className={styles.ctaArea}>
        <h2 className={styles.title}>Begin Your Journey with Purpose</h2>
        <p className={styles.subtitle}>
          Join thousands of golfers playing for more than a score. Join Digital Heroes today.
        </p>
        <Link href="/pricing" className={styles.primaryBtn}>
          <span>View Membership Options</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
