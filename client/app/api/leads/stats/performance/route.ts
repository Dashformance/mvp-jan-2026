import { NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET() {
    try {
        const performance = await LeadsService.getPerformanceByOwner();
        return NextResponse.json(performance);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch performance stats' }, { status: 500 });
    }
}
