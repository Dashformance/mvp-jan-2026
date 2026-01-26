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

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, data } = body;
        if (!ids || !Array.isArray(ids) || !data) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const result = await LeadsService.updateMany(ids, data);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update leads' }, { status: 500 });
    }
}
