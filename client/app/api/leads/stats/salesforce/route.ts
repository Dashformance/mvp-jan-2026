import { NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET() {
    try {
        const salesforce = await LeadsService.getSalesForce();
        return NextResponse.json(salesforce);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch salesforce stats' }, { status: 500 });
    }
}
