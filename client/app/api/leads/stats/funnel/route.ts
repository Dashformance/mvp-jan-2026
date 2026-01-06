import { NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET() {
    try {
        const funnel = await LeadsService.getConversionFunnel();
        return NextResponse.json(funnel);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch funnel stats' }, { status: 500 });
    }
}
