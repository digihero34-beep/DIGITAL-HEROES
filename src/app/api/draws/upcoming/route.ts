import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/infrastructure/database/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
      .in('status', ['draft', 'scheduled', 'simulating'])
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !draw) {
      return NextResponse.json({ success: true, data: null });
    }

    const prizePool = Array.isArray(draw.prize_pools) ? draw.prize_pools[0] : draw.prize_pools;

    return NextResponse.json({
      success: true,
      data: {
        id: draw.id,
        drawNumber: draw.draw_number,
        scheduledFor: draw.scheduled_for,
        status: draw.status,
        totalPoolCents: prizePool?.total_pool_cents ?? 10000000,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to query upcoming draw';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
