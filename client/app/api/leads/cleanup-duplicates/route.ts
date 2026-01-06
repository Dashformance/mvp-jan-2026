import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function POST(req: NextRequest) {
    try {
        const result = await LeadsService.cleanupDuplicates();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to cleanup duplicates' }, { status: 500 });
    }
}
