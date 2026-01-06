import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await LeadsService.createMany(body);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to import leads' }, { status: 500 });
    }
}
