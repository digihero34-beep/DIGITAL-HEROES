import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';
import { getCached, setCached } from '@/lib/memory-cache';

export async function GET() {
  try {
    const cached = getCached<unknown>('api_upcoming_draw');
    if (cached !== undefined) {
      return NextResponse.json(
        { success: true, data: cached },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .select(`
        id,
        draw_number,
        scheduled_for,
        status,
        prize_pools (
          total_pool_cents
        )
      `)
      .in('status', ['draft', 'simulated'])
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !draw) {
      setCached('api_upcoming_draw', null, 60);
      return NextResponse.json(
        { success: true, data: null },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    const prizePool = Array.isArray(draw.prize_pools) ? draw.prize_pools[0] : draw.prize_pools;

    const data = {
      id: draw.id,
      drawNumber: draw.draw_number,
      scheduledFor: draw.scheduled_for,
      status: draw.status,
      totalPoolCents: prizePool?.total_pool_cents ?? 10000000,
    };

    setCached('api_upcoming_draw', data, 60);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to query upcoming draw';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
