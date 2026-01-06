import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';
import { withApiErrorHandling } from '@/lib/api-handler';

export const GET = withApiErrorHandling(async (req: NextRequest) => {
    console.log("[DEBUG] GET /api/leads hit");
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    console.log(`[DEBUG] page=${page}, limit=${limit}`);
    const leads = await LeadsService.findAll(page, limit);
    console.log(`[DEBUG] leads.data.length=${leads.data.length}`);
    return NextResponse.json(leads);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const body = await req.json();
    console.log("[ROUTE] Creating lead with body keys:", Object.keys(body));
    const lead = await LeadsService.create(body);
    return NextResponse.json(lead);
});
