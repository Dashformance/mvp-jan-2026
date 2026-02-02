import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET(req: NextRequest) {
    try {
        const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
        const timeline = await AnalyticsService.getTimelineStats(days);
        return NextResponse.json(timeline);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch timeline stats' }, { status: 500 });
    }
}
