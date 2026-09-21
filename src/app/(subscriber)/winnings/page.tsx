import React from 'react';
import { requireAuth } from '@/modules/auth/server-guards';
import { getUserWinningsAction } from '@/modules/winners/verification-actions';
import { WinningsClient } from './winnings-client';

export const metadata = {
  title: 'Your Winnings | Digital Heroes',
  description: 'Track your draw prizes, upload verification documents, and monitor payout status.',
};

export default async function WinningsPage() {
  const [user, result] = await Promise.all([
    requireAuth(),
    getUserWinningsAction(),
  ]);
  const winnings = result.success ? result.data : [];

  return <WinningsClient userId={user.id} initialWinnings={winnings} />;
}
