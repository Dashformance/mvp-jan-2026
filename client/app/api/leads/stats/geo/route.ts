import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET() {
    try {
        const geo = await AnalyticsService.getLeadsByState();
        return NextResponse.json(geo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch geo stats' }, { status: 500 });
    }
}
