import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET() {
    try {
        const salesforce = await AnalyticsService.getSalesForce();
        return NextResponse.json(salesforce);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch salesforce stats' }, { status: 500 });
    }
}
