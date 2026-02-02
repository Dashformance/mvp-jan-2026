import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET() {
    try {
        const funnel = await AnalyticsService.getConversionFunnel();
        return NextResponse.json(funnel);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch funnel stats' }, { status: 500 });
    }
}
