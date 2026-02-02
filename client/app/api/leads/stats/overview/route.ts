import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
        const { data: { user } } = await supabase.auth.getUser();

        const url = new URL(req.url);
        const isGlobal = url.searchParams.get('global') === 'true';

        // If not global and user is logged in, filter by their context
        const ownerId = isGlobal ? undefined : user?.id;

        const stats = await AnalyticsService.getStatsOverview(ownerId);
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch overview stats' }, { status: 500 });
    }
}
