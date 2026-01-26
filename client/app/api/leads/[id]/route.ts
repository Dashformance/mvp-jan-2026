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
    let body;
    try {
        body = await req.json();
    } catch (e) {
        console.error(`[ROUTE] Failed to parse JSON body for lead ${id}`);
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log(`[PATCH /api/leads/${id}] Received body keys:`, Object.keys(body));

    // Validate payload with Zod schema
    const parseResult = LeadUpdateSchema.safeParse(body);
    if (!parseResult.success) {
        const errors = parseResult.error.flatten();
        console.log(`[ROUTE] Validation failed for lead ${id}:`, errors);
        return NextResponse.json({
            error: 'Validation failed',
            details: errors.fieldErrors
        }, { status: 400 });
    }

    try {
        const lead = await LeadsService.update(id, parseResult.data);
        return NextResponse.json(lead);
    } catch (error: any) {
        console.error(`[ROUTE] LeadsService.update failed for ${id}:`, error);
        // Explicitly return JSON so we don't hit default error pages
        return NextResponse.json({
            error: 'Database update failed',
            message: error.message,
            code: error.code
        }, { status: 500 });
    }
});

export const DELETE = withApiErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        console.log(`[API] Soft deleting lead ${id}`);
        await LeadsService.remove(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`[API] Soft delete failed:`, error);
        throw error;
    }
});
