import React from 'react';
import { notFound } from 'next/navigation';
import {
  getCharityBySlugAction,
  getUserCharityPreferenceAction,
} from '@/modules/charities/charity-actions';
import { CharityProfileClient } from './charity-profile-client';

interface CharityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CharityPage({ params }: CharityPageProps) {
  const { slug } = await params;

  const result = await getCharityBySlugAction(slug);
  if (!result.success || !result.data) {
    notFound();
  }

  const charity = result.data;
  const prefResult = await getUserCharityPreferenceAction();
  const userPref = prefResult.success ? prefResult.data : null;

  const isCurrentUserPartner = userPref?.charityId === charity.id;
  const currentPercentage = isCurrentUserPartner ? userPref.contributionPercentage : 10;

  return (
    <CharityProfileClient
      charity={charity}
      isCurrentUserPartner={isCurrentUserPartner}
      currentPercentage={currentPercentage}
    />
  );
}
