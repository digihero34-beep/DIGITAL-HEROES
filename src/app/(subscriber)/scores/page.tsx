import React from 'react';
import { getUserScoresAction } from '@/modules/scores/score-actions';
import { ScorecardClient } from './scorecard-client';
import { UserScoresSummary } from '@/modules/scores/score-types';

export default async function ScoresPage() {
  const result = await getUserScoresAction();

  const fallbackData: UserScoresSummary = {
    activeScores: [],
    historicalScores: [],
    totalSubmitted: 0,
    stats: { averageScore: 0, highestScore: 0, lowestScore: 0 },
  };

  const initialData = result.success ? result.data : fallbackData;

  return <ScorecardClient initialData={initialData} />;
}
