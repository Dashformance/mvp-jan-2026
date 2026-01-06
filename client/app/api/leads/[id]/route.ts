import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';
import { withApiErrorHandling } from '@/lib/api-handler';
import { LeadUpdateSchema } from '@/lib/schemas/lead.schema';

export const GET = withApiErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const lead = await LeadsService.findOne(id);
    if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json(lead);
});

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    // Validate payload with Zod schema
    const parseResult = LeadUpdateSchema.safeParse(body);
    if (!parseResult.success) {
        console.log(`[ROUTE] Validation failed for lead ${id}:`, parseResult.error.flatten());
        return NextResponse.json({
            error: 'Validation failed',
            details: parseResult.error.flatten().fieldErrors
        }, { status: 400 });
    }

    console.log(`[ROUTE] Updating lead ${id} with validated payload keys:`, Object.keys(parseResult.data));
    const lead = await LeadsService.update(id, parseResult.data);
    return NextResponse.json(lead);
});

export const DELETE = withApiErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await LeadsService.remove(id);
    return NextResponse.json({ success: true });
});
