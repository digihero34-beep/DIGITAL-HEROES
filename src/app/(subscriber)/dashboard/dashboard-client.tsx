'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { AuthUser } from '@/modules/auth/auth-types';
import { UserSubscription } from '@/modules/subscriptions/subscription-types';
import { UserScoresSummary } from '@/modules/scores/score-types';
import { Charity, UserCharityPreference } from '@/modules/charities/charity-types';
import { DrawRecord } from '@/modules/draws/draw-types';
import { WinnerRecord } from '@/modules/winners/winner-types';
import { getUserWinningsAction } from '@/modules/winners/verification-actions';
import { getUserScoresAction } from '@/modules/scores/score-actions';
import { useRealtimeTable } from '@/hooks/use-realtime-table';

import { ActiveSubscriptionBanner } from '@/components/domain/ActiveSubscriptionBanner';
import { ScoreCardGrid } from '@/components/domain/ScoreCardGrid';
import { CharityPreferenceCard } from '@/components/domain/CharityPreferenceCard';
import { UpcomingDrawWidget } from '@/components/domain/UpcomingDrawWidget';
import { WinningsSummaryCard } from '@/components/domain/WinningsSummaryCard';
import { LogoutButton } from '@/components/auth/LogoutButton';

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
  scores: initialScores,
  selectedCharity,
  charityPreference,
  upcomingDraw,
  winnings: initialWinnings,
}: DashboardClientProps) {
  const [winningsData, setWinningsData] = useState(initialWinnings);
  const [scores, setScores] = useState<UserScoresSummary>(initialScores);

  const refreshWinnings = useCallback(async () => {
    const res = await getUserWinningsAction();
    if (res.success && res.data) {
      const raw = res.data;
      setWinningsData({
        winnings: raw,
        totalPrizeCents: raw.reduce((s, w) => s + w.prizeAmountCents, 0),
        pendingCount: raw.filter((w) => w.verificationStatus === 'pending_proof').length,
      });
    }
  }, []);

  const refreshScores = useCallback(async () => {
    const res = await getUserScoresAction();
    if (res.success && res.data) setScores(res.data);
  }, []);

  // Live prize / payout status changes
  useRealtimeTable({
    table: 'winners',
    filter: `user_id=eq.${user.id}`,
    channelName: `dashboard-winners-${user.id}`,
    onData: refreshWinnings,
  });
  useRealtimeTable({
    table: 'payouts',
    filter: `user_id=eq.${user.id}`,
    channelName: `dashboard-payouts-${user.id}`,
    onData: refreshWinnings,
  });

  // Live score updates on dashboard score grid
  useRealtimeTable({
    table: 'scores',
    filter: `user_id=eq.${user.id}`,
    channelName: `dashboard-scores-${user.id}`,
    onData: refreshScores,
  });

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
            <span>View Winnings ({winningsData.winnings.length})</span>
          </Link>
          <Link href="/charities" className={styles.actionBtn}>
            <span>Directory</span>
          </Link>
          <LogoutButton
            variant="subscriber"
            redirectTo="/login"
            label="Sign Out"
          />
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
          totalPrizeCents={winningsData.totalPrizeCents}
          pendingCount={winningsData.pendingCount}
          recentWinnings={winningsData.winnings}
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
