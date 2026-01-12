import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';
import { withApiErrorHandling } from '@/lib/api-handler';

export const GET = withApiErrorHandling(async (req: NextRequest) => {
    console.log("[DEBUG] GET /api/leads hit");
    try {
        const searchParams = req.nextUrl.searchParams;

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status')?.split(',') || undefined;
        const source = searchParams.get('source')?.split(',') || undefined;
        const owner = searchParams.get('owner') || undefined;

        // New Params for Round 2
        const city = searchParams.get('city') || undefined;
        const sortBy = searchParams.get('sortBy') || undefined;
        const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

        const scoreMinParam = searchParams.get('scoreMin');
        const scoreMaxParam = searchParams.get('scoreMax');
        const scoreMin = scoreMinParam ? parseInt(scoreMinParam) : undefined;
        const scoreMax = scoreMaxParam ? parseInt(scoreMaxParam) : undefined;

        console.log(`[DEBUG] page=${page}, limit=${limit}, filters={search:${search}, owner:${owner}, status:${status}, source:${source}, city:${city}, sortBy:${sortBy}, sortOrder:${sortOrder}, scoreMin:${scoreMin}, scoreMax:${scoreMax}}`);

        const leads = await LeadsService.findAll(page, limit, {
            search,
            status,
            owner,
            source,
            city,
            sortBy,
            sortOrder,
            scoreMin,
            scoreMax
        });
        console.log(`[DEBUG] LeadsService returned ${leads?.data?.length} leads`);

        return NextResponse.json(leads);
    } catch (error) {
        console.error("[DEBUG] Error inside GET /api/leads:", error);
        throw error;
    }
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const body = await req.json();
    console.log("[ROUTE] Creating lead with body keys:", Object.keys(body));
    const lead = await LeadsService.create(body);
    return NextResponse.json(lead);
});
