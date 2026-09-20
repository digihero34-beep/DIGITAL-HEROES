import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getWinnerClaimAction } from '@/modules/winners/verification-actions';
import { ClaimClient } from './claim-client';

interface ClaimPageProps {
  params: Promise<{ winnerId: string }>;
}

export const metadata = {
  title: 'Submit Winner Verification | Digital Heroes',
  description: 'Upload your golf scorecard or official proof to verify your winning claim.',
};

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { winnerId } = await params;

  const result = await getWinnerClaimAction(winnerId);

  if (!result.success) {
    if (result.code === 'UNAUTHORIZED') {
      redirect('/login?returnUrl=/winnings');
    }
    notFound();
  }

  if (!result.data) {
    notFound();
  }

  return <ClaimClient winner={result.data} />;
}
