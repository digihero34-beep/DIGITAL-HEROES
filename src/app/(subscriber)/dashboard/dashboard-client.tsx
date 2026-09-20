'use client';

import React from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { AuthUser } from '@/modules/auth/auth-types';
import { UserSubscription } from '@/modules/subscriptions/subscription-types';
import { UserScoresSummary } from '@/modules/scores/score-types';
import { Charity, UserCharityPreference } from '@/modules/charities/charity-types';
import { DrawRecord } from '@/modules/draws/draw-types';
import { WinnerRecord } from '@/modules/winners/winner-types';

import { ActiveSubscriptionBanner } from '@/components/domain/ActiveSubscriptionBanner';
import { ScoreCardGrid } from '@/components/domain/ScoreCardGrid';
import { CharityPreferenceCard } from '@/components/domain/CharityPreferenceCard';
import { UpcomingDrawWidget } from '@/components/domain/UpcomingDrawWidget';
import { WinningsSummaryCard } from '@/components/domain/WinningsSummaryCard';

interface DashboardClientProps {
  user: AuthUser;
  subscription: UserSubscription | null;
  scores: UserScoresSummary;
  selectedCharity: Charity | null;
  charityPreference: UserCharityPreference | null;
  upcomingDraw: DrawRecord | null;
  winnings: {
    winnings: WinnerRecord[];
    totalPrizeCents: number;
    pendingCount: number;
  };
}

export function DashboardClient({
  user,
  subscription,
  scores,
  selectedCharity,
  charityPreference,
  upcomingDraw,
  winnings,
}: DashboardClientProps) {
  const totalRoundsCount = scores.totalSubmitted || (scores.activeScores.length + scores.historicalScores.length);
  const subscriptionAmountCents = subscription?.planId === 'plan_yearly' ? 1600 : 2000;

  return (
    <div className={styles.container}>
      {/* 1. Header & Quick Actions */}
      <header className={styles.dashboardHeader}>
        <div className={styles.welcomeArea}>
          <div className={styles.badge}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-mint)' }} />
            Subscriber Command Center
          </div>
          <h1 className={styles.title}>
            Welcome, {user.fullName || user.email.split('@')[0]}
          </h1>
          <p className={styles.subtitle}>
            Monitor your rolling 5 Stableford balls, charity allocation, upcoming draw status, and prize claims.
          </p>
        </div>

        <div className={styles.quickActions}>
          <Link href="/scores" className={styles.primaryActionBtn}>
            <span>+ Log Round</span>
          </Link>
          <Link href="/winnings" className={styles.actionBtn}>
            <span>View Winnings ({winnings.winnings.length})</span>
          </Link>
          <Link href="/charities" className={styles.actionBtn}>
            <span>Directory</span>
          </Link>
        </div>
      </header>

      {/* 2. Membership Status & Billing Banner */}
      <ActiveSubscriptionBanner subscription={subscription} />

      {/* 3. Rolling 5 Scorecard Ball Grid */}
      <ScoreCardGrid
        activeScores={scores.activeScores}
        totalRoundsCount={totalRoundsCount}
      />

      {/* 4. Upcoming Draw & Winnings Summary Grid */}
      <div className={styles.widgetsRow}>
        <UpcomingDrawWidget
          upcomingDraw={upcomingDraw}
          activeScores={scores.activeScores}
        />

        <WinningsSummaryCard
          totalPrizeCents={winnings.totalPrizeCents}
          pendingCount={winnings.pendingCount}
          recentWinnings={winnings.winnings}
        />
      </div>

      {/* 5. Charity Partner & Voluntary Giving Slider */}
      <CharityPreferenceCard
        charity={selectedCharity}
        preference={charityPreference}
        subscriptionAmountCents={subscriptionAmountCents}
      />
    </div>
  );
}
