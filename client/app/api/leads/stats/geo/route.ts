import { NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET() {
    try {
        const geo = await LeadsService.getLeadsByState();
        return NextResponse.json(geo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch geo stats' }, { status: 500 });
    }
}
