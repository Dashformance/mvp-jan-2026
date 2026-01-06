import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function POST(req: NextRequest) {
    try {
        const { ids, data } = await req.json();
        const result = await LeadsService.updateMany(ids, data);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update leads in batch' }, { status: 500 });
    }
}
