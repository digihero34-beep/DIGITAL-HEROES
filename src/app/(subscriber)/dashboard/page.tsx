import React from 'react';
import { requireAuth } from '@/modules/auth/server-guards';
import { getUserSubscriptionAction } from '@/modules/subscriptions/subscription-actions';
import { getUserScoresAction } from '@/modules/scores/score-actions';
import {
  getUserCharityPreferenceAction,
  getCharitiesAction,
} from '@/modules/charities/charity-actions';
import { getUpcomingDrawAction } from '@/modules/draws/draw-actions';
import { getUserWinningsAction } from '@/modules/winners/verification-actions';
import { DashboardClient } from './dashboard-client';

export const metadata = {
  title: 'Subscriber Dashboard | Digital Heroes',
  description: 'Manage your active Stableford scores, charity pledge, monthly draw participation, and prize rewards.',
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const [
    subResult,
    scoresResult,
    charityPrefResult,
    charitiesResult,
    drawResult,
    winningsResult,
  ] = await Promise.all([
    getUserSubscriptionAction(),
    getUserScoresAction(),
    getUserCharityPreferenceAction(),
    getCharitiesAction(),
    getUpcomingDrawAction(),
    getUserWinningsAction(),
  ]);

  const subscription = subResult.success ? subResult.data : null;
  const scores = scoresResult.success && scoresResult.data
    ? scoresResult.data
    : {
        activeScores: [],
        historicalScores: [],
        totalSubmitted: 0,
        stats: { averageScore: 0, highestScore: 0, lowestScore: 0 },
      };

  const charityPreference = charityPrefResult.success ? charityPrefResult.data : null;
  const charities = charitiesResult.success ? charitiesResult.data : [];

  const selectedCharity = charityPreference
    ? charities.find((c) => c.id === charityPreference.charityId) || charities[0] || null
    : charities.find((c) => c.isFeatured) || charities[0] || null;

  const upcomingDraw = drawResult.success ? drawResult.data : null;
  const rawWinnings = winningsResult.success && winningsResult.data ? winningsResult.data : [];
  const totalPrizeCents = rawWinnings.reduce((sum, w) => sum + w.prizeAmountCents, 0);
  const pendingCount = rawWinnings.filter((w) => w.verificationStatus === 'pending_proof').length;

  const winnings = {
    winnings: rawWinnings,
    totalPrizeCents,
    pendingCount,
  };

  return (
    <DashboardClient
      user={user}
      subscription={subscription}
      scores={scores}
      selectedCharity={selectedCharity}
      charityPreference={charityPreference}
      upcomingDraw={upcomingDraw}
      winnings={winnings}
    />
  );
}
