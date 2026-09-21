'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@/infrastructure/database/supabase-browser';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeTableOptions {
  /** Postgres table to subscribe to */
  table: string;
  /** Optional: filter rows, e.g. 'user_id=eq.abc123' */
  filter?: string;
  /** Which events to listen for */
  events?: RealtimeEvent[];
  /** Called on any matching change — perform your own data refresh here */
  onData: () => void;
  /** Unique channel name — should be stable across renders */
  channelName: string;
  /** Set false to pause the subscription (e.g. when unmounted) */
  enabled?: boolean;
}

/**
 * Subscribes to Supabase Realtime postgres_changes for a given table.
 * Calls `onData` whenever an INSERT, UPDATE, or DELETE is received.
 * The caller is responsible for fetching fresh data inside `onData`.
 */
export function useRealtimeTable({
  table,
  filter,
  events = ['*'],
  onData,
  channelName,
  enabled = true,
}: UseRealtimeTableOptions): void {
  const channelRef = useRef<RealtimeChannel | null>(null);
  // Keep onData stable so the effect doesn't re-subscribe on every render
  const onDataRef = useRef(onData);
  useEffect(() => { onDataRef.current = onData; }, [onData]);

  useEffect(() => {
    if (!enabled) return;

    const client = createClientComponentClient();

    const channel = client.channel(channelName);

    for (const event of events) {
      channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          onDataRef.current();
        }
      );
    }

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        // Silently degrade — data remains available via manual action refreshes
        console.debug(`[realtime] channel offline/unsubscribed on ${channelName}, using server action refresh.`);
      }
    });

    channelRef.current = channel;

    return () => {
      client.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelName, table, filter, enabled, events.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}
