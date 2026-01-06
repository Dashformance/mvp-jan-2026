import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function POST(req: NextRequest) {
    try {
        const { joaoCount, sourceOwner } = await req.json();
        const result = await LeadsService.divideLeads(joaoCount, sourceOwner);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to divide leads' }, { status: 500 });
    }
}
