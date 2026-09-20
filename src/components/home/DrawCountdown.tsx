'use client';

import React, { useState, useEffect } from 'react';

interface DrawCountdownProps {
  scheduledFor?: string | null;
  className?: string;
  fallback?: string;
}

function calculateCountdown(scheduledFor?: string | null): string {
  if (!scheduledFor) return 'Scheduled Soon';
  const target = new Date(scheduledFor).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return 'Draw Imminent';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);

  const dStr = String(days).padStart(2, '0');
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(mins).padStart(2, '0');

  return `${dStr}D ${hStr}H ${mStr}M`;
}

export function DrawCountdown({
  scheduledFor,
  className,
}: DrawCountdownProps) {
  const [countdown, setCountdown] = useState<string>(() => calculateCountdown(scheduledFor));

  useEffect(() => {
    if (!scheduledFor) return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(scheduledFor));
    }, 60000);

    return () => clearInterval(interval);
  }, [scheduledFor]);

  return <strong className={className}>{countdown}</strong>;
}
