import React from 'react';
import { getCharitiesAction } from '@/modules/charities/charity-actions';
import { CharityDirectoryClient } from './charity-directory-client';

export default async function CharitiesPage() {
  const result = await getCharitiesAction();
  const charities = result.success ? result.data : [];

  return <CharityDirectoryClient initialCharities={charities} />;
}
