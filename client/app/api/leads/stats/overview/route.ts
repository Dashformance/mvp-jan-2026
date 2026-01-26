import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const url = new URL(req.url);
        const isGlobal = url.searchParams.get('global') === 'true';

        // If not global and user is logged in, filter by their context
        const ownerId = isGlobal ? undefined : user?.id;

        const stats = await LeadsService.getStatsOverview(ownerId);
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch overview stats' }, { status: 500 });
    }
}
