import { NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET() {
    try {
        const stats = await LeadsService.getStatsOverview();
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch overview stats' }, { status: 500 });
    }
}
