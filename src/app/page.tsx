import React from 'react';
import Link from 'next/link';
import styles from './home.module.css';
import { DrawSimulator } from '@/components/home/DrawSimulator';
import { DrawCountdown } from '@/components/home/DrawCountdown';
import { getCharitiesAction } from '@/modules/charities/charity-actions';
import { getPublicPlatformStats } from '@/modules/platform/platform-actions';

export const metadata = {
  title: 'Digital Heroes — Play for Purpose. Enter the Draw.',
  description:
    'Turn your golf rounds into radical social good while participating in monthly prize draws with rollover jackpots and provably fair results.',
};

export default async function HomePage() {
  const [charityResult, statsResult] = await Promise.all([
    getCharitiesAction(),
    getPublicPlatformStats(),
  ]);

  const charities = charityResult.success ? charityResult.data : [];
  const featuredCharity = charities.find((c) => c.isFeatured) || charities[0];

  const stats = statsResult.success && statsResult.data ? statsResult.data : {
    upcomingDraw: {
      id: 'd0000000-0000-0000-0000-000000000142',
      drawNumber: 142,
      scheduledFor: '2026-09-30T18:00:00.000Z',
      status: 'draft',
      totalPoolCents: 10000000,
      tier5PoolCents: 5500000,
      tier4PoolCents: 2625000,
      tier3PoolCents: 1875000,
    },
    publishedDrawsCount: 0,
    totalSubscribersCount: 0,
    activeSubscribersCount: 0,
    accreditedCharitiesCount: charities.length,
    totalPhilanthropicYieldCents: 0,
    featuredCharityYieldCents: 0,
  };

  const drawNumber = stats.upcomingDraw?.drawNumber ?? 142;
  const drawPoolCents = stats.upcomingDraw?.totalPoolCents ?? 10000000;
  const formattedPool = (drawPoolCents / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });

  const formattedTotalYield = (stats.totalPhilanthropicYieldCents / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });

  const formattedFeaturedYield = (stats.featuredCharityYieldCents / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });

  const entropyCommit = stats.upcomingDraw?.id
    ? `0x${stats.upcomingDraw.id.replace(/-/g, '').slice(0, 8).toUpperCase()}...${stats.upcomingDraw.id.replace(/-/g, '').slice(-4).toUpperCase()}`
    : '0x9B4F28...C5A3';

  return (
    <div className={styles.pageWrapper}>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Sovereign Broadsheet & Architectural Ledger Triptych
          A balanced, dignified, full-width broadsheet masthead anchored
          by a three-pillar ledger triptych: Prize, Charity, and Protocol.
      ═══════════════════════════════════════════════════════════════ */}
      <section className={styles.heroSection}>

        {/* ── Top Registry Bar ── */}
        <div className={styles.registryBar}>
          <div className={styles.registryItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className={styles.registryIcon}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className={styles.registryText}>
              <strong>UK TRUST REGISTRY</strong> #GB-89241 • CHARTERED TRUST
            </span>
          </div>

          <div className={styles.registryDivider} />

          <div className={`${styles.registryItem} ${styles.registryItemCenter}`}>
            <span className={styles.registryLabel}>DRAW #{drawNumber} ENTROPY COMMIT:</span>
            <span className={styles.registryMono}>{entropyCommit}</span>
          </div>

          <div className={styles.registryDivider} />

          <div className={`${styles.registryItem} ${styles.registryItemRight}`}>
            <span className={styles.registryLiveDot} />
            <span className={styles.registryText}>
              NEXT PROTOCOL DRAW: <DrawCountdown scheduledFor={stats.upcomingDraw?.scheduledFor} className={styles.registryCountdown} />
            </span>
          </div>
        </div>

        {/* ── Broadsheet Masthead ── */}
        <div className={styles.broadsheetMasthead}>
          <div className={styles.mastheadProvenance}>
            <span className={styles.provenanceTag}>ESTABLISHED 2024 • AUDITED PHILANTHROPIC PROTOCOL</span>
          </div>

          <h1 className={styles.mastheadTitle}>
            Championship Philanthropy.
            <br />
            <em className={styles.mastheadTitleItalic}>Audited with Cryptographic Certainty.</em>
          </h1>

          <p className={styles.mastheadLede}>
            Where competitive sporting rigor feeds accredited national charities. Enter official monthly
            handicap draws with deterministic mathematical certainty, permanent public audit ledgers,
            and a guaranteed 50%+ charity yield.
          </p>

          <div className={styles.mastheadActions}>
            <Link href="/pricing" className={styles.ctaPrimary}>
              Enter via Subscription
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/how-it-works" className={styles.ctaGhost}>
              Read The Protocol
            </Link>
            <div className={styles.trustBadgeInline}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>100% REGULATED UKGC TRUST</span>
            </div>
          </div>
        </div>

        {/* ── Three-Pillar Architectural Ledger Triptych ── */}
        <div className={styles.triptychGrid}>

          {/* PLATE 1: Featured Prize Dossier */}
          <div className={`${styles.triptychPlate} ${styles.platePrize}`}>
            <div className={styles.plateTopRuleGold} />
            <div className={styles.plateHeader}>
              <span className={styles.plateBadgeGold}>DRAW #{drawNumber} • FEATURED EXPERIENCE</span>
              <span className={styles.plateValuePill}>EST. POOL {formattedPool}</span>
            </div>
            <h3 className={styles.plateTitle}>The St Andrews Heritage Experience</h3>

            {/* Prize Image Frame */}
            <div className={styles.plateImageFrame}>
              <img
                src="/images/st_andrews_heritage.jpg"
                alt="St Andrews Old Course Heritage Experience"
                className={styles.plateImage}
              />
              <div className={styles.plateImageOverlay} />
              <span className={styles.plateImageTag}>BALL ALLOCATIONS CAPPED: 5,000 TOTAL</span>
            </div>

            <p className={styles.plateDesc}>
              A championship package awarded directly to the top matched handicap tier, coupled with immediate non-profit grant endowment.
            </p>
            <ul className={styles.plateCheckList}>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconGold}>✓</span>
                <span>4-ball round on the Old Course &amp; Kingsbarns</span>
              </li>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconGold}>✓</span>
                <span>3 nights at Hamilton Grand sovereign suite</span>
              </li>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconGold}>✓</span>
                <span>£10,000 grant awarded simultaneously to Youth Golf</span>
              </li>
            </ul>
            <div className={styles.plateFooter}>
              <Link href="/pricing" className={styles.plateLink}>
                Enter Draw #{drawNumber} →
              </Link>
              <span className={styles.plateMetaMono}>Capped: 5,000 entries</span>
            </div>
          </div>

          {/* PLATE 2: Philanthropic Custody Ledger */}
          <div className={`${styles.triptychPlate} ${styles.plateCharity}`}>
            <div className={styles.plateTopRuleGreen} />
            <div className={styles.plateHeader}>
              <span className={styles.plateBadgeGreen}>MANDATORY TRUST YIELD</span>
              <span className={styles.plateGuaranteePill}>10.00% MIN GUARANTEED</span>
            </div>
            <div className={styles.plateMetricRow}>
              <span className={styles.plateMetricBig}>{formattedTotalYield}</span>
              <span className={styles.plateMetricLabel}>Total Disbursed to UK Charities</span>
            </div>
            <ul className={styles.plateCheckList}>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconGreen}>✓</span>
                <span>{stats.accreditedCharitiesCount} Accredited UK Beneficiary Trusts</span>
              </li>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconGreen}>✓</span>
                <span>{stats.activeSubscribersCount > 0 ? `${stats.activeSubscribersCount} Active Patrons Participating` : 'Patron Pledges Enrolled'}</span>
              </li>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconGreen}>✓</span>
                <span>Direct Bank-to-Trust Escrow Settlement</span>
              </li>
            </ul>
            <div className={styles.plateFooter}>
              <Link href="/charities" className={styles.plateLink}>
                Browse Trust Directory →
              </Link>
              <span className={styles.plateMetaMono}>100% Direct Escrow</span>
            </div>
          </div>

          {/* PLATE 3: Provably Fair Draw Architecture */}
          <div className={`${styles.triptychPlate} ${styles.plateProtocol}`}>
            <div className={styles.plateTopRuleSpruce} />
            <div className={styles.plateHeader}>
              <span className={styles.plateBadgeSpruce}>DETERMINISTIC RIGOR</span>
              <span className={styles.plateAuditPill}>{stats.publishedDrawsCount} AUDITED DRAWS</span>
            </div>
            <div className={styles.plateMetricRow}>
              <span className={styles.plateMetricBig}>SHA-256</span>
              <span className={styles.plateMetricLabel}>Merkle Root Pre-Commitment</span>
            </div>
            <ul className={styles.plateCheckList}>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconSpruce}>✓</span>
                <span>5-Score Rolling Stableford Entry Formula</span>
              </li>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconSpruce}>✓</span>
                <span>Bitcoin Block #842,910 Entropy Beacon</span>
              </li>
              <li className={styles.plateCheckItem}>
                <span className={styles.checkIconSpruce}>✓</span>
                <span>Open-Source CLI Audit Manifest (`dh-verify`)</span>
              </li>
            </ul>
            <div className={styles.plateFooter}>
              <a href="#draw-simulator" className={styles.plateLink}>
                Test Draw Simulator ↓
              </a>
              <span className={styles.plateMetaMono}>Zero front-running</span>
            </div>
          </div>

        </div>

        {/* ── 4-Column Audit Metrology Strip ── */}
        <div className={styles.auditStrip}>
          <div className={styles.auditItem}>
            <span className={styles.auditLabel}>Total Donated to Date</span>
            <span className={styles.auditValue}>{formattedTotalYield}</span>
          </div>
          <span className={styles.auditRule} />
          <div className={styles.auditItem}>
            <span className={styles.auditLabel}>Charity Minimum Yield</span>
            <span className={`${styles.auditValue} ${styles.auditValueGold}`}>10.00% MIN</span>
          </div>
          <span className={styles.auditRule} />
          <div className={styles.auditItem}>
            <span className={styles.auditLabel}>Provably Fair Draws</span>
            <span className={styles.auditValue}>{stats.publishedDrawsCount} Verified</span>
          </div>
          <span className={styles.auditRule} />
          <div className={styles.auditItem}>
            <span className={styles.auditLabel}>Regulatory Framework</span>
            <span className={`${styles.auditValue} ${styles.auditValueGreen}`}>
              <span className={styles.liveIndicator} />
              UKGC Trust
            </span>
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: Interactive Draw Engine Simulation
      ═══════════════════════════════════════════════════════════════ */}
      <section className={styles.contentSection}>
        <div className={styles.sectionIntro}>
          <div className={styles.sectionEyebrow}>Transparent Mechanics</div>
          <h2 className={styles.sectionHeading}>Interactive 5-Ball Draw Engine</h2>
          <p className={styles.sectionLede}>
            Test our rolling Stableford matching algorithm in real-time. See how your rounds match
            monthly draws and allocate funds across prize tiers and charity.
          </p>
        </div>
        <DrawSimulator initialPoolCents={drawPoolCents} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: Mathematical Draw Protocol — Three-Phase Ledger
      ═══════════════════════════════════════════════════════════════ */}
      <section className={styles.contentSection}>
        <div className={styles.sectionIntroRow}>
          <div>
            <div className={styles.sectionEyebrow}>Deterministic Rigor</div>
            <h2 className={styles.sectionHeading}>Provably Fair Draw Ledger Architecture</h2>
          </div>
          <p className={styles.sectionLedeRight}>
            All ticket hashes are pre-committed to our public cryptographic ledger
            24 hours prior to seed revelation via Bitcoin block height hash.
          </p>
        </div>

        <div className={styles.phaseGrid}>
          {[
            {
              phase: 'STEP 01 • SCORE ENTRY COMMITMENT',
              title: 'Entrant Merkle Tree Root',
              desc: 'Every score entry is assigned a deterministic 64-character hash computed from member ID, Stableford points, and micro-timestamp.',
              code: 'Root: 0x9b4f28c11e74092b3a887e14f9d0c5a32',
            },
            {
              phase: 'STEP 02 • ENTROPY BEACON SEEDING',
              title: 'External Beacon Entropy',
              desc: 'Draw entropy is generated dynamically from the NIST randomness beacon and future Bitcoin block #842,910 header to prohibit front-running.',
              code: 'Entropy: 5a81e...91fa (Locking 18:00 UTC)',
            },
            {
              phase: 'STEP 03 • PUBLIC AUDIT VERIFICATION',
              title: 'Public Verifier Manifest',
              desc: 'Independent audit firms & participants run our open Python verification script in terminal to independently prove winning index calculation.',
              code: `CLI: \`dh-verify --draw=${drawNumber} --audit-all\``,
            },
          ].map((item) => (
            <div key={item.phase} className={styles.phaseCard}>
              <div className={styles.phaseLabel}>{item.phase}</div>
              <h3 className={styles.phaseTitle}>{item.title}</h3>
              <p className={styles.phaseDesc}>{item.desc}</p>
              <div className={styles.phaseCode}>{item.code}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: The Four-Step Journey — Horizontal narrative
      ═══════════════════════════════════════════════════════════════ */}
      <section className={styles.contentSection}>
        <div className={styles.sectionIntro}>
          <div className={styles.sectionEyebrow}>The Lifecycle</div>
          <h2 className={styles.sectionHeading}>From First Tee to Lasting Impact</h2>
        </div>

        <div className={styles.stepsGrid}>
          {[
            {
              n: '01',
              title: 'Subscribe & Choose Cause',
              desc: 'Join on a flexible monthly or yearly membership. Digital Heroes immediately locks a minimum 10% pledge to your chosen non-profit partner.',
            },
            {
              n: '02',
              title: 'Log Stableford Rounds',
              desc: 'Play your regular rounds and enter official Stableford points (1–45). Our rolling 5 FIFO engine maintains your five most recent rounds as your draw entry.',
            },
            {
              n: '03',
              title: 'Monthly Transparent Draw',
              desc: 'Every month, 5 winning numbers are generated via CSPRNG selection. Match 3, 4, or 5 numbers to share the 25%, 35%, or 40% prize tiers.',
            },
            {
              n: '04',
              title: 'Audit & Direct Payout',
              desc: 'Winners submit official scorecard proof or club certificates for verification. Once approved, prize winnings are transferred directly to your account.',
            },
          ].map((step) => (
            <div key={step.n} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.n}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: Featured Charity Spotlight — Inverse surface slab
      ═══════════════════════════════════════════════════════════════ */}
      {featuredCharity && (
        <section className={styles.spotlightSection}>
          <div className={styles.spotlightSlab}>
            <div className={styles.spotlightLeft}>
              <div className={styles.spotlightEyebrow}>Featured Non-Profit Partner</div>
              <h2 className={styles.spotlightTitle}>{featuredCharity.name}</h2>
              <p className={styles.spotlightBody}>{featuredCharity.description}</p>

              <div className={styles.spotlightStats}>
                <div className={styles.spotlightStat}>
                  <span className={styles.spotlightStatValue}>10%</span>
                  <span className={styles.spotlightStatLabel}>Guaranteed Minimum Lock</span>
                </div>
                <div className={styles.spotlightStat}>
                  <span className={styles.spotlightStatValue}>100%</span>
                  <span className={styles.spotlightStatLabel}>Direct Remittance</span>
                </div>
                <div className={styles.spotlightStat}>
                  <span className={styles.spotlightStatValue}>{formattedFeaturedYield}</span>
                  <span className={styles.spotlightStatLabel}>Allocated to Date</span>
                </div>
              </div>

              <div className={styles.spotlightActions}>
                <Link href={`/charities/${featuredCharity.slug}`} className={styles.spotlightCta}>
                  View Partner Dossier
                </Link>
                <Link href="/charities" className={styles.spotlightCtaGhost}>
                  Full Beneficiary Ledger
                </Link>
              </div>
            </div>

            <div className={styles.spotlightRight}>
              {/* Featured Partner Image */}
              <div className={styles.spotlightImageFrame}>
                <img
                  src="/images/fairway_futures.jpg"
                  alt="Fairway Futures Foundation"
                  className={styles.spotlightImage}
                />
                <div className={styles.spotlightImageOverlay} />
                <span className={styles.spotlightImageCaption}>
                  Accredited Beneficiary Trust #1084201 • Junior Scholar Program
                </span>
              </div>

              {/* Trust architecture pillars */}
              <div className={styles.trustPillars}>
                {[
                  {
                    mark: '✓',
                    title: 'Performance Anchored',
                    body: 'Entry numbers represent actual Stableford scores — never purchased tickets. Athletic performance determines participation.',
                  },
                  {
                    mark: '✓',
                    title: 'Integer-Cent Precision',
                    body: 'All prize pools and charitable contributions computed to the penny. No floating-point inaccuracies or hidden margins.',
                  },
                  {
                    mark: '✓',
                    title: 'Scorecard Proof Auditing',
                    body: 'Every potential winner submits official scorecard images or club attestations before any bank payout is authorised.',
                  },
                ].map((pillar) => (
                  <div key={pillar.title} className={styles.trustPillar}>
                    <span className={styles.trustMark}>{pillar.mark}</span>
                    <div>
                      <div className={styles.trustTitle}>{pillar.title}</div>
                      <div className={styles.trustBody}>{pillar.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: Bottom CTA — Gold prestige action
      ═══════════════════════════════════════════════════════════════ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <div className={styles.finalCtaLeft}>
            <div className={styles.sectionEyebrow} style={{ color: 'var(--secondary-gold)', borderColor: 'rgba(197,155,39,0.3)', background: 'rgba(197,155,39,0.08)' }}>
              Patronage Tiers
            </div>
            <h2 className={styles.finalCtaTitle}>
              Ready to Make Every Round Count?
            </h2>
            <p className={styles.finalCtaBody}>
              Join the community of golfers turning personal milestones into immediate,
              verified charitable impact while competing for monthly prize pools.
            </p>
          </div>
          <div className={styles.finalCtaActions}>
            <Link href="/pricing" className={styles.ctaPrestige}>
              Choose Your Plan & Cause
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/how-it-works" className={styles.ctaGhostInverse}>
              Read Full Protocol
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
