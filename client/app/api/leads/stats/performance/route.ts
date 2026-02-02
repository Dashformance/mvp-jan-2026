import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET() {
    try {
        const performance = await AnalyticsService.getPerformanceByOwner();
        return NextResponse.json(performance);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch performance stats' }, { status: 500 });
    }
}
