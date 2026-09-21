import React from 'react';
import { requireAuth } from '@/modules/auth/server-guards';
import { getUserScoresAction } from '@/modules/scores/score-actions';
import { getUserSubscriptionAction } from '@/modules/subscriptions/subscription-actions';
import { ScorecardClient } from './scorecard-client';
import { UserScoresSummary } from '@/modules/scores/score-types';

export const metadata = {
  title: 'Scorecard | Digital Heroes',
  description: 'Record and manage your Stableford golf scores for monthly draw entry.',
};

export default async function ScoresPage() {
  const [user, result, subRes] = await Promise.all([
    requireAuth(),
    getUserScoresAction(),
    getUserSubscriptionAction(),
  ]);

  const fallbackData: UserScoresSummary = {
    activeScores: [],
    historicalScores: [],
    totalSubmitted: 0,
    stats: { averageScore: 0, highestScore: 0, lowestScore: 0 },
  };

  const initialData = result.success ? result.data : fallbackData;
  const isSubscribed = subRes.success && subRes.data?.status === 'active';

  return <ScorecardClient userId={user.id} initialData={initialData} isSubscribed={isSubscribed} />;
}
