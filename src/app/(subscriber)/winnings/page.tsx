import React from 'react';
import { getUserWinningsAction } from '@/modules/winners/verification-actions';
import { WinningsClient } from './winnings-client';

export default async function WinningsPage() {
  const result = await getUserWinningsAction();
  const winnings = result.success ? result.data : [];

  return <WinningsClient winnings={winnings} />;
}
